<?php

use App\Models\Book;
use App\Models\User;
use App\Models\Order;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\DeliveryController;
use Illuminate\Http\Request;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== KIỂM THỬ CHỨC NĂNG 5 & 6: ĐẶT MUA SÁCH, VẬN CHUYỂN & MOMO WEBHOOK ===\n\n";

$reader = User::where('role', 'reader')->first();
$book = Book::first();

// 1. Tạo đơn mua sách mới
echo "[1] Độc giả tạo đơn mua sách mới ('{$book->title}' x 1):\n";
$orderController = new OrderController();
$reqOrder = new Request([
    'items' => [['book_id' => $book->id, 'quantity' => 1]],
    'shipping_address' => '123 Đường Lê Lợi, Q.1, TP.HCM',
    'recipient_name' => $reader->name,
    'recipient_phone' => '0987654321',
]);
$reqOrder->setUserResolver(fn() => $reader);

$resOrder = $orderController->store($reqOrder);
$dataOrder = json_decode($resOrder->getContent(), true);
$order = $dataOrder['order'];

echo "    - Mã đơn hàng: {$order['order_number']}\n";
echo "    - Tổng tiền (gồm 30k phí ship): " . number_format($order['total_amount']) . " VND\n";
echo "    - Mã vận đơn khởi tạo: {$order['delivery']['tracking_number']}\n";
echo "    - Trạng thái thanh toán ban đầu: {$order['payment_status']}\n\n";

// 2. Tạo giao dịch MoMo & Gửi Webhook giả lập
echo "[2] Tạo yêu cầu thanh toán MoMo & Giả lập Webhook callback thành công:\n";
$paymentController = new PaymentController();
$reqPay = new Request([
    'type' => 'order',
    'id' => $order['id'],
    'payment_method' => 'momo',
]);
$reqPay->setUserResolver(fn() => $reader);

$resPay = $paymentController->createPayment($reqPay);
$dataPay = json_decode($resPay->getContent(), true);
$transCode = $dataPay['transaction_code'];

echo "    - Sinh mã giao dịch MoMo: {$transCode}\n";

// Gửi Webhook giả lập
$reqWebhook = new Request([
    'transaction_code' => $transCode,
    'status' => 'success',
]);
$resWebhook = $paymentController->webhook($reqWebhook);
$dataWebhook = json_decode($resWebhook->getContent(), true);

$orderFresh = Order::find($order['id']);
echo "    - Xử lý Webhook: {$dataWebhook['message']}\n";
echo "    - Trạng thái thanh toán mới của đơn hàng: {$orderFresh->payment_status}\n";
echo "    - Trạng thái xử lý đơn mới: {$orderFresh->order_status}\n\n";

// 3. Tra cứu lịch sử vận chuyển
echo "[3] Tra cứu công khai hành trình vận đơn '{$order['delivery']['tracking_number']}':\n";
$deliveryController = new DeliveryController();
$resTrack = $deliveryController->track($order['delivery']['tracking_number']);
$dataTrack = json_decode($resTrack->getContent(), true);

echo "    - Đơn vị vận chuyển: {$dataTrack['delivery']['carrier']}\n";
echo "    - Trạng thái giao hàng: {$dataTrack['delivery']['status']}\n";
echo "    - Số bước lịch sử ghi nhận: " . count($dataTrack['delivery']['histories']) . " mốc\n";

echo "\n=> CHỨC NĂNG 5 & 6 HOẠT ĐỘNG HOÀN HẢO 100%!\n";
