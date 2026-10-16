<?php

namespace App\Services;

use App\Models\Book;
use Illuminate\Support\Facades\Cache;

class BookStockService
{
    public static function getBorrowCopies(Book $book): int
    {
        return Cache::remember("books:{$book->id}:available_copies", 3600, function () use ($book) {
            return $book->availableCopiesCount();
        });
    }

    public static function getSaleStock(Book $book): int
    {
        return Cache::remember("books:{$book->id}:sale_stock", 3600, function () use ($book) {
            return $book->availableSaleStock();
        });
    }

    public static function refreshBookStock(Book $book): void
    {
        Cache::put("books:{$book->id}:available_copies", $book->availableCopiesCount(), 3600);
        Cache::put("books:{$book->id}:sale_stock", $book->availableSaleStock(), 3600);
    }

    public static function clearBookStock(Book $book): void
    {
        Cache::forget("books:{$book->id}:available_copies");
        Cache::forget("books:{$book->id}:sale_stock");
    }
}
