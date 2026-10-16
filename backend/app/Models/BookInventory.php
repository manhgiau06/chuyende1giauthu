<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'stock_quantity',
        'reserved_quantity',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
