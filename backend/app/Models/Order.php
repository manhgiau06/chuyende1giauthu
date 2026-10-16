<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'reader_id',
        'order_number',
        'total_amount',
        'shipping_fee',
        'payment_status',
        'order_status',
        'shipping_address',
        'recipient_name',
        'recipient_phone',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
    ];

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
