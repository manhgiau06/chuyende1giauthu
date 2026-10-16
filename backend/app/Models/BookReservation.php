<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'reader_id',
        'status',
        'priority_number',
        'reserved_at',
        'notified_at',
        'expires_at',
        'notes',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'notified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }
}
