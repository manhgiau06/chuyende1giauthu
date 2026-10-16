<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'reader_id',
        'book_id',
    ];

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
