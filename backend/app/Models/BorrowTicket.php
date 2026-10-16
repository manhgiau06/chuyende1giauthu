<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'reader_id',
        'librarian_id',
        'status',
        'borrow_date',
        'due_date',
        'returned_date',
        'renewed_count',
        'total_late_fee',
        'notes',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'due_date' => 'date',
        'returned_date' => 'date',
        'total_late_fee' => 'decimal:2',
    ];

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }

    public function librarian()
    {
        return $this->belongsTo(User::class, 'librarian_id');
    }

    public function items()
    {
        return $this->hasMany(BorrowItem::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
