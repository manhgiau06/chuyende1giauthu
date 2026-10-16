<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = Cache::remember('categories:all', 86400, function () {
                return Category::withCount('books')->get()->toArray();
            });

            if (!is_array($categories)) {
                Cache::forget('categories:all');
                $categories = Category::withCount('books')->get()->toArray();
            }

            return response()->json(['categories' => array_values((array) $categories)]);
        } catch (\Throwable $e) {
            Cache::forget('categories:all');
            $categories = Category::withCount('books')->get()->toArray();
            return response()->json(['categories' => array_values($categories)]);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện!'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ]);

        Cache::forget('categories:all');

        return response()->json([
            'message' => 'Thêm danh mục thể loại thành công!',
            'category' => $category,
        ], 201);
    }
}
