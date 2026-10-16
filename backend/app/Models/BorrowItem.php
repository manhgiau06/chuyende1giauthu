<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrow_ticket_id',
        'book_copy_id',
        'due_date',
        'returned_at',
        'late_fee',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
        'returned_at' => 'datetime',
        'late_fee' => 'decimal:2',
    ];

    public function borrowTicket()
    {
        return $this->belongsTo(BorrowTicket::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
