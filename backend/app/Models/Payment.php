<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payable_type',
        'payable_id',
        'reader_id',
        'approved_by',
        'payment_method',
        'transaction_code',
        'amount',
        'status',
        'raw_payload',
        'paid_at',
        'transfer_confirmed_at',
        'approved_at',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'raw_payload' => 'array',
        'paid_at' => 'datetime',
        'transfer_confirmed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function payable()
    {
        return $this->morphTo();
    }

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
