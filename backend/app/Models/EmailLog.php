<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'reader_id',
        'type',
        'subject',
        'content',
    ];

    public function reader()
    {
        return $this->belongsTo(User::class, 'reader_id');
    }
}
