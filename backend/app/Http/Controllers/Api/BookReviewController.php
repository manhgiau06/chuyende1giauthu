<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookReview;
use Illuminate\Http\Request;

class BookReviewController extends Controller
{
    public function index($bookId)
    {
        $reviews = BookReview::with('reader')
            ->where('book_id', $bookId)
            ->orderBy('created_at', 'desc')
            ->get();

        $avgRating = $reviews->avg('rating') ?: 5.0;

        return response()->json([
            'reviews' => $reviews,
            'avg_rating' => round($avgRating, 1),
            'total_reviews' => $reviews->count(),
        ]);
    }

    public function store(Request $request, $bookId)
    {
        $user = $request->user();
        if (!$user->isReader() && !$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Độc giả mới được viết đánh giá!'], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $book = Book::findOrFail($bookId);

        $review = BookReview::updateOrCreate(
            ['book_id' => $book->id, 'reader_id' => $user->id],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        return response()->json([
            'message' => 'Cảm ơn bạn đã gửi đánh giá cho đầu sách này!',
            'review' => $review->load('reader'),
        ], 201);
    }
}
