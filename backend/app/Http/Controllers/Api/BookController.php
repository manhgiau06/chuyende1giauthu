<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookInventory;
use App\Models\BorrowItem;
use App\Models\OrderItem;
use App\Services\BookStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['category', 'inventory']);

        if ($request->filled('keyword')) {
            $kw = $request->keyword;
            $query->where(function ($q) use ($kw) {
                $q->where('title', 'like', "%{$kw}%")
                  ->orWhere('author', 'like', "%{$kw}%")
                  ->orWhere('isbn', 'like', "%{$kw}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Always sort newest first so newly added books appear at the very top!
        $query->orderBy('id', 'desc');

        $perPage = (int) $request->input('per_page', 24);
        $books = $query->paginate($perPage);

        // Attach Redis cache counters to each book
        $books->getCollection()->transform(function ($book) {
            $book->available_copies_count = BookStockService::getBorrowCopies($book);
            $book->available_stock_count = BookStockService::getSaleStock($book);
            return $book;
        });

        return response()->json($books);
    }

    public function show($id)
    {
        $book = Book::with(['category', 'copies', 'inventory'])->findOrFail($id);
        $book->available_copies_count = BookStockService::getBorrowCopies($book);
        $book->available_stock_count = BookStockService::getSaleStock($book);

        return response()->json(['book' => $book]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này!'], 403);
        }

        $rules = [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:100',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|string|max:1000',
            'sale_price' => 'required|numeric|min:0',
            'borrow_copies_count' => 'required|integer|min:0',
            'sale_stock_count' => 'required|integer|min:0',
        ];

        if ($request->hasFile('cover_image')) {
            $rules['cover_image'] = 'file|mimes:jpeg,png,jpg,webp,gif,avif|max:10240';
        }

        $request->validate($rules);

        $coverUrl = null;
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $coverUrl = Storage::url($path);
        } elseif ($request->filled('cover_url')) {
            $coverUrl = $request->cover_url;
        } elseif ($request->filled('cover_image') && is_string($request->cover_image) && str_starts_with($request->cover_image, 'http')) {
            $coverUrl = $request->cover_image;
        }

        $book = Book::create([
            'category_id' => $request->category_id,
            'title' => $request->title,
            'author' => $request->author,
            'isbn' => $request->isbn,
            'publisher' => $request->publisher,
            'publish_year' => $request->publish_year,
            'description' => $request->description,
            'cover_image' => $coverUrl ?? 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
            'sale_price' => $request->sale_price,
            'is_borrowable' => true,
            'is_salable' => true,
        ]);

        // Generate Borrow Copies
        $borrowCopiesCount = (int) $request->borrow_copies_count;
        for ($i = 1; $i <= $borrowCopiesCount; $i++) {
            BookCopy::create([
                'book_id' => $book->id,
                'barcode' => 'BC-' . $book->id . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'condition' => 'good',
                'status' => 'available',
            ]);
        }

        // Inventory
        BookInventory::create([
            'book_id' => $book->id,
            'stock_quantity' => (int) $request->sale_stock_count,
            'reserved_quantity' => 0,
        ]);

        BookStockService::refreshBookStock($book);
        Cache::forget('categories:all');

        return response()->json([
            'message' => 'Thêm đầu sách thành công!',
            'book' => $book->load(['category', 'copies', 'inventory']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền sửa đầu sách!'], 403);
        }

        $book = Book::findOrFail($id);

        $rules = [
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'isbn' => 'nullable|string|max:100',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer',
            'description' => 'nullable|string',
            'sale_price' => 'sometimes|numeric|min:0',
            'cover_url' => 'nullable|string|max:1000',
        ];

        if ($request->hasFile('cover_image')) {
            $rules['cover_image'] = 'file|mimes:jpeg,png,jpg,webp,gif,avif|max:10240';
        }

        $request->validate($rules);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $book->cover_image = Storage::url($path);
        } elseif ($request->filled('cover_url')) {
            $book->cover_image = $request->cover_url;
        }

        $updateData = $request->only([
            'category_id', 'title', 'author', 'isbn', 'publisher', 'publish_year', 'description', 'sale_price'
        ]);

        if ($request->has('is_borrowable')) {
            $updateData['is_borrowable'] = filter_var($request->is_borrowable, FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_salable')) {
            $updateData['is_salable'] = filter_var($request->is_salable, FILTER_VALIDATE_BOOLEAN);
        }

        $book->update($updateData);

        if ($request->has('additional_copies') && (int) $request->additional_copies > 0) {
            $existingCount = $book->copies()->count();
            for ($i = 1; $i <= (int) $request->additional_copies; $i++) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'barcode' => 'BC-' . $book->id . '-' . str_pad($existingCount + $i, 3, '0', STR_PAD_LEFT),
                    'condition' => 'good',
                    'status' => 'available',
                ]);
            }
        }

        if ($request->has('add_sale_stock') && (int) $request->add_sale_stock > 0) {
            $inventory = BookInventory::firstOrCreate(['book_id' => $book->id]);
            $inventory->increment('stock_quantity', (int) $request->add_sale_stock);
        }

        BookStockService::refreshBookStock($book);
        Cache::forget('categories:all');

        $freshBook = $book->fresh(['category', 'copies', 'inventory']);
        $freshBook->available_copies_count = BookStockService::getBorrowCopies($freshBook);
        $freshBook->available_stock_count = BookStockService::getSaleStock($freshBook);

        return response()->json([
            'message' => 'Cập nhật thông tin đầu sách thành công!',
            'book' => $freshBook,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền xóa đầu sách!'], 403);
        }

        $book = Book::findOrFail($id);

        // Constraint check: "thủ thư không xoá được đầu sách đã có giao dịch"
        $copyIds = $book->copies()->pluck('id');
        $hasBorrowHistory = BorrowItem::whereIn('book_copy_id', $copyIds)->exists();
        $hasOrderHistory = OrderItem::where('book_id', $book->id)->exists();

        if ($hasBorrowHistory || $hasOrderHistory) {
            return response()->json([
                'message' => 'Không thể xoá đầu sách này vì đã có giao dịch mượn/bán trong lịch sử!',
            ], 422);
        }

        BookStockService::clearBookStock($book);
        $book->delete();
        Cache::forget('categories:all');

        return response()->json([
            'message' => 'Đã xoá đầu sách thành công!',
        ]);
    }
}
