<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'author',
        'isbn',
        'publisher',
        'publish_year',
        'description',
        'cover_image',
        'sale_price',
        'is_borrowable',
        'is_salable',
    ];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'is_borrowable' => 'boolean',
        'is_salable' => 'boolean',
    ];

    public function getCoverImageAttribute($value)
    {
        if (!$value) return null;
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        return url($value);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function copies()
    {
        return $this->hasMany(BookCopy::class);
    }

    public function inventory()
    {
        return $this->hasOne(BookInventory::class);
    }

    public function availableCopiesCount(): int
    {
        return $this->copies()->where('status', 'available')->count();
    }

    public function availableSaleStock(): int
    {
        return $this->inventory ? max(0, $this->inventory->stock_quantity - $this->inventory->reserved_quantity) : 0;
    }
}
