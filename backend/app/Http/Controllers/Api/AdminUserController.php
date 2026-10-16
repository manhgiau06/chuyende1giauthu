<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này!'], 403));
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isLibrarian())) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này!'], 403);
        }

        $query = User::query();

        if ($request->filled('role') && in_array($request->role, ['admin', 'librarian', 'reader'])) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,librarian,reader',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => "Tạo thành công tài khoản ({$newUser->role}) cho {$newUser->name}!",
            'user' => $newUser,
        ], 201);
    }

    public function updateRole(Request $request, $id)
    {
        $this->checkAdmin($request);

        $request->validate([
            'role' => 'required|in:admin,librarian,reader',
        ]);

        $target = User::findOrFail($id);

        if ($target->id === $request->user()->id) {
            return response()->json([
                'message' => 'Bạn không thể tự thay đổi vai trò của chính mình!',
            ], 422);
        }

        $oldRole = $target->role;
        $target->update(['role' => $request->role]);

        return response()->json([
            'message' => "Đã chuyển vai trò của '{$target->name}' từ [{$oldRole}] sang [{$request->role}]!",
            'user' => $target,
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $this->checkAdmin($request);

        $target = User::findOrFail($id);

        if ($target->id === $request->user()->id) {
            return response()->json([
                'message' => 'Bạn không thể tự khóa tài khoản của chính mình!',
            ], 422);
        }

        $target->is_active = !$target->is_active;
        $target->save();

        // If locked, invalidate all active tokens
        if (!$target->is_active) {
            $target->tokens()->delete();
        }

        $statusText = $target->is_active ? 'mở khóa' : 'khóa';

        return response()->json([
            'message' => "Đã {$statusText} tài khoản '{$target->email}' thành công!",
            'user' => $target,
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $this->checkAdmin($request);

        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $target = User::findOrFail($id);
        $target->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke existing sessions for safety if not self
        if ($target->id !== $request->user()->id) {
            $target->tokens()->delete();
        }

        return response()->json([
            'message' => "Đã đặt lại mật khẩu mới cho tài khoản '{$target->email}'!",
            'user' => $target,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $this->checkAdmin($request);

        $target = User::findOrFail($id);

        if ($target->id === $request->user()->id) {
            return response()->json([
                'message' => 'Bạn không thể tự xóa tài khoản của chính mình!',
            ], 422);
        }

        // Check if reader has active borrowed tickets
        if ($target->borrowTickets()->whereIn('status', ['borrowed', 'overdue'])->exists()) {
            return response()->json([
                'message' => 'Không thể xóa độc giả này vì đang có sách mượn chưa hoàn trả!',
            ], 422);
        }

        $target->tokens()->delete();
        $target->delete();

        return response()->json([
            'message' => "Đã xóa tài khoản '{$target->name}' khỏi hệ thống!",
        ]);
    }
}
