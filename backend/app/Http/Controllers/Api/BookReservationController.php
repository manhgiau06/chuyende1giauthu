<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookReservation;
use App\Models\EmailLog;
use Illuminate\Http\Request;

class BookReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'reader') {
            $reservations = BookReservation::with('book.category')
                ->where('reader_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $reservations = BookReservation::with(['book.category', 'reader'])
                ->orderBy('status', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'reader') {
            return response()->json(['message' => 'Chỉ độc giả mới có thể đặt trước sách!'], 403);
        }

        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $book = Book::with('copies')->findOrFail($request->book_id);
        $availableCopies = $book->copies()->where('status', 'available')->count();

        if ($availableCopies > 0) {
            return response()->json([
                'message' => 'Sách này hiện vẫn còn ' . $availableCopies . ' bản khả dụng tại thư viện. Bạn có thể bấm mượn trực tiếp!',
            ], 422);
        }

        $existing = BookReservation::where('book_id', $book->id)
            ->where('reader_id', $user->id)
            ->whereIn('status', ['pending', 'notified'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Bạn đã đăng ký đặt trước cuốn sách này rồi (Vị trí trong hàng đợi: #' . $existing->priority_number . ')!',
            ], 422);
        }

        $maxPriority = BookReservation::where('book_id', $book->id)
            ->whereIn('status', ['pending', 'notified'])
            ->max('priority_number') ?? 0;

        $priorityNumber = $maxPriority + 1;

        $reservation = BookReservation::create([
            'book_id' => $book->id,
            'reader_id' => $user->id,
            'status' => 'pending',
            'priority_number' => $priorityNumber,
            'reserved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Đặt trước thành công! Bạn đang ở vị trí #' . $priorityNumber . ' trong danh sách chờ. Thư viện sẽ thông báo ngay khi có sách trả về.',
            'reservation' => $reservation->load('book'),
        ], 201);
    }

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $reservation = BookReservation::findOrFail($id);

        if ($user->role === 'reader' && $reservation->reader_id !== $user->id) {
            return response()->json(['message' => 'Bạn không có quyền huỷ lượt đặt trước này!'], 403);
        }

        if (in_array($reservation->status, ['fulfilled', 'cancelled'])) {
            return response()->json(['message' => 'Lượt đặt trước này không thể huỷ!'], 422);
        }

        $reservation->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Đã huỷ lượt đặt trước thành công!',
            'reservation' => $reservation,
        ]);
    }

    public function notifyManually(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'librarian' && $user->role !== 'admin') {
            return response()->json(['message' => 'Chỉ thủ thư hoặc admin mới có quyền thực hiện thao tác này!'], 403);
        }

        $reservation = BookReservation::with(['book', 'reader'])->findOrFail($id);

        $reservation->update([
            'status' => 'notified',
            'notified_at' => now(),
            'expires_at' => now()->addHours(48),
        ]);

        EmailLog::create([
            'reader_id' => $reservation->reader_id,
            'type' => 'reservation_available',
            'subject' => '[THƯ VIỆN] Sách bạn đặt trước đã có sẵn tại quầy!',
            'content' => "Kính gửi độc giả " . ($reservation->reader->name ?? 'bạn đọc') . ",\n\nCuốn sách \"" . ($reservation->book->title ?? '') . "\" bạn đặt trước hiện đã có sẵn tại thư viện. Thư viện sẽ giữ sách cho bạn đến hết ngày " . now()->addHours(48)->format('d/m/Y H:i') . ".\nVui lòng đến quầy hoàn tất thủ tục mượn sách trước thời hạn trên.",
        ]);

        return response()->json([
            'message' => 'Đã gửi thông báo giữ sách trong 48h cho độc giả!',
            'reservation' => $reservation,
        ]);
    }
}
