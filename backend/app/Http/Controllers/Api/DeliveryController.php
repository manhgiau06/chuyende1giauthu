<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function track($trackingNumber)
    {
        $delivery = Delivery::with(['order.items.book', 'histories' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->where('tracking_number', $trackingNumber)->first();

        if (!$delivery) {
            return response()->json(['message' => 'Không tìm thấy mã vận đơn này!'], 404);
        }

        return response()->json(['delivery' => $delivery]);
    }
}
