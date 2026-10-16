<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wishlists = Wishlist::with('book.category')
            ->where('reader_id', $user->id)
            ->get();

        return response()->json(['wishlists' => $wishlists]);
    }

    public function toggle(Request $request, $bookId)
    {
        $user = $request->user();
        $existing = Wishlist::where('reader_id', $user->id)->where('book_id', $bookId)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Đã bỏ sách khỏi danh sách yêu thích', 'is_wishlisted' => false]);
        } else {
            Wishlist::create(['reader_id' => $user->id, 'book_id' => $bookId]);
            return response()->json(['message' => 'Đã thêm sách vào danh sách yêu thích!', 'is_wishlisted' => true]);
        }
    }
}
