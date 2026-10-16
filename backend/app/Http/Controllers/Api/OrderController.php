<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\DeliveryHistory;
use App\Services\BookStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['reader', 'items.book', 'delivery']);

        if ($user->isReader()) {
            $query->where('reader_id', $user->id);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with(['reader', 'items.book', 'delivery.histories', 'payments'])->findOrFail($id);

        if ($user->isReader() && $order->reader_id !== $user->id) {
            return response()->json(['message' => 'Bạn không có quyền xem đơn hàng này!'], 403);
        }

        return response()->json(['order' => $order]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isReader() && !$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Độc giả mới được tạo đơn đặt mua sách!'], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:255',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $shippingFee = 30000; // Flat shipping fee 30k VND

            $order = Order::create([
                'reader_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'total_amount' => 0,
                'shipping_fee' => $shippingFee,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'recipient_name' => $request->recipient_name,
                'recipient_phone' => $request->recipient_phone,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $itemData) {
                $book = Book::with('inventory')->findOrFail($itemData['book_id']);
                $qty = $itemData['quantity'];

                $availableStock = BookStockService::getSaleStock($book);
                if ($availableStock < $qty) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Sách '{$book->title}' chỉ còn {$availableStock} sản phẩm trong kho bán!",
                    ], 422);
                }

                $subtotal = $book->sale_price * $qty;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $book->id,
                    'quantity' => $qty,
                    'unit_price' => $book->sale_price,
                    'subtotal' => $subtotal,
                ]);

                // Reserve inventory
                if ($book->inventory) {
                    $book->inventory->increment('reserved_quantity', $qty);
                }

                BookStockService::refreshBookStock($book);
            }

            $order->update(['total_amount' => $totalAmount + $shippingFee]);

            // Create Delivery Record
            $delivery = Delivery::create([
                'order_id' => $order->id,
                'tracking_number' => 'VNP-' . rand(10000000, 99999999),
                'carrier' => 'VNPost Express',
                'status' => 'pending',
            ]);

            DeliveryHistory::create([
                'delivery_id' => $delivery->id,
                'status' => 'pending',
                'note' => 'Đơn hàng vừa được tạo (Chờ tiếp nhận từ thư viện)',
                'location' => 'Thư viện trung tâm',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Đặt hàng thành công! Vui lòng chọn phương thức thanh toán.',
                'order' => $order->load(['items.book', 'delivery']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Đã có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện!'], 403);
        }

        $order = Order::with('delivery')->findOrFail($id);

        $request->validate([
            'order_status' => 'sometimes|in:pending,processing,shipping,completed,cancelled',
            'delivery_status' => 'sometimes|in:pending,picking,shipping,delivered,failed',
            'note' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        if ($request->has('order_status')) {
            $order->order_status = $request->order_status;
        }

        if ($request->has('delivery_status') && $order->delivery) {
            $order->delivery->status = $request->delivery_status;
            if ($request->delivery_status === 'shipping' && !$order->delivery->shipped_at) {
                $order->delivery->shipped_at = now();
            }
            if ($request->delivery_status === 'delivered') {
                $order->delivery->delivered_at = now();
                $order->order_status = 'completed';
            }
            $order->delivery->save();

            DeliveryHistory::create([
                'delivery_id' => $order->delivery->id,
                'status' => $request->delivery_status,
                'note' => $request->note ?? 'Cập nhật trạng thái giao hàng',
                'location' => $request->location ?? 'Trung tâm trung chuyển',
            ]);
        }

        $order->save();

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng & vận chuyển thành công!',
            'order' => $order->fresh(['items.book', 'delivery.histories']),
        ]);
    }
}
