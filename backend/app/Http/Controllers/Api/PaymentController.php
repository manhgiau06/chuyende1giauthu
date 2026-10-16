<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTicket;
use App\Models\Order;
use App\Models\Payment;
use App\Models\SystemConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Lấy cấu hình tài khoản ngân hàng hiện tại (Thủ thư & Độc giả)
     */
    public function getBankConfig()
    {
        return response()->json([
            'bank_name' => SystemConfig::getVal('bank_name', 'MB Bank (Ngân Hàng Quân Đội)'),
            'bank_id' => SystemConfig::getVal('bank_id', 'MB'),
            'account_number' => SystemConfig::getVal('bank_account_no', '090123456789'),
            'account_holder' => SystemConfig::getVal('bank_account_holder', 'THU VIEN DAI HOC ONLINE'),
        ]);
    }

    /**
     * Thủ thư / Admin chỉnh sửa thông tin số tài khoản ngân hàng
     */
    public function updateBankConfig(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa tài khoản ngân hàng!'], 403);
        }

        $request->validate([
            'bank_name' => 'required|string|max:100',
            'bank_id' => 'required|string|max:20',
            'account_number' => 'required|string|max:50',
            'account_holder' => 'required|string|max:100',
        ]);

        SystemConfig::updateOrCreate(['key' => 'bank_name'], ['value' => $request->bank_name, 'description' => 'Tên ngân hàng thụ hưởng']);
        SystemConfig::updateOrCreate(['key' => 'bank_id'], ['value' => strtoupper(trim($request->bank_id)), 'description' => 'Mã ngân hàng VietQR']);
        SystemConfig::updateOrCreate(['key' => 'bank_account_no'], ['value' => trim($request->account_number), 'description' => 'Số tài khoản ngân hàng']);
        SystemConfig::updateOrCreate(['key' => 'bank_account_holder'], ['value' => strtoupper(trim($request->account_holder)), 'description' => 'Tên chủ tài khoản']);

        return response()->json([
            'message' => 'Cập nhật tài khoản ngân hàng thành công! Mọi giao dịch mới sẽ sử dụng STK này.',
            'bank_config' => [
                'bank_name' => $request->bank_name,
                'bank_id' => strtoupper(trim($request->bank_id)),
                'account_number' => trim($request->account_number),
                'account_holder' => strtoupper(trim($request->account_holder)),
            ]
        ]);
    }

    /**
     * Tạo yêu cầu thanh toán chuyển khoản ngân hàng (hoặc MoMo)
     */
    public function createPayment(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'type' => 'required|in:order,borrow_ticket',
            'id' => 'required|integer',
            'payment_method' => 'nullable|in:bank_transfer,momo',
        ]);

        $method = $request->payment_method ?: 'bank_transfer';

        if ($request->type === 'order') {
            $payable = Order::findOrFail($request->id);
            if ($payable->reader_id !== $user->id && !$user->isAdmin() && !$user->isLibrarian()) {
                return response()->json(['message' => 'Bạn không có quyền thực hiện!'], 403);
            }
            $amount = $payable->total_amount;
        } else {
            $payable = BorrowTicket::findOrFail($request->id);
            if ($payable->reader_id !== $user->id && !$user->isAdmin() && !$user->isLibrarian()) {
                return response()->json(['message' => 'Bạn không có quyền thực hiện!'], 403);
            }
            $amount = $payable->total_late_fee;
        }

        if ($amount <= 0) {
            return response()->json(['message' => 'Số tiền cần thanh toán phải lớn hơn 0!'], 422);
        }

        $transCode = 'PAY-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'payable_type' => get_class($payable),
            'payable_id' => $payable->id,
            'reader_id' => $user->id,
            'payment_method' => $method,
            'transaction_code' => $transCode,
            'amount' => $amount,
            'status' => 'pending',
        ]);

        // Lấy cấu hình ngân hàng động do Thủ thư thiết lập
        $bankName = SystemConfig::getVal('bank_name', 'MB Bank (Ngân Hàng Quân Đội)');
        $bankId = SystemConfig::getVal('bank_id', 'MB');
        $accountNo = SystemConfig::getVal('bank_account_no', '090123456789');
        $accountHolder = SystemConfig::getVal('bank_account_holder', 'THU VIEN DAI HOC ONLINE');

        // VietQR link chuẩn ngân hàng Việt Nam
        $vietQrUrl = "https://img.vietqr.io/image/{$bankId}-{$accountNo}-compact2.png?amount=" . intval($amount) . "&addInfo=" . urlencode($transCode) . "&accountName=" . urlencode($accountHolder);

        return response()->json([
            'message' => 'Tạo yêu cầu thanh toán chuyển khoản ngân hàng thành công!',
            'payment' => $payment->fresh()->load('reader'),
            'bank_info' => [
                'bank_name' => $bankName,
                'bank_id' => $bankId,
                'account_number' => $accountNo,
                'account_holder' => $accountHolder,
                'amount' => $amount,
                'transfer_content' => $transCode,
                'qr_code_url' => $vietQrUrl,
            ],
            'transaction_code' => $transCode,
        ]);
    }

    /**
     * Độc giả bấm "Tôi đã chuyển khoản xong" để gửi thông báo đến thủ thư
     */
    public function confirmTransfer(Request $request, $id)
    {
        $user = $request->user();
        $payment = Payment::findOrFail($id);

        if ($payment->reader_id !== $user->id && !$user->isAdmin() && !$user->isLibrarian()) {
            return response()->json(['message' => 'Bạn không có quyền thao tác giao dịch này!'], 403);
        }

        if ($payment->status === 'success') {
            return response()->json(['message' => 'Giao dịch đã được thủ thư phê duyệt trước đó!']);
        }

        $payment->update([
            'transfer_confirmed_at' => now(),
            'note' => $request->note ?: 'Độc giả đã chuyển khoản, chờ thủ thư duyệt đối soát.',
        ]);

        return response()->json([
            'message' => 'Đã gửi xác nhận chuyển khoản thành công! Thủ thư sẽ kiểm tra và duyệt giao dịch của bạn sớm nhất.',
            'payment' => $payment->fresh(),
        ]);
    }

    /**
     * Danh sách giao dịch thanh toán cho Thủ Thư / Admin
     * Chỉ hiển thị các giao dịch mà độc giả ĐÃ bấm "Xác nhận đã chuyển khoản"
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền truy cập chức năng này!'], 403);
        }

        $query = Payment::with(['reader', 'approver', 'payable'])->latest();

        // Chỉ hiển thị các giao dịch mà độc giả ĐÃ bấm "Xác nhận chuyển khoản",
        // hoặc các giao dịch đã duyệt thành công / từ chối trước đó.
        $query->where(function ($q) {
            $q->whereNotNull('transfer_confirmed_at')
              ->orWhereIn('status', ['success', 'failed']);
        });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('transaction_code', 'like', "%{$s}%")
                  ->orWhereHas('reader', function ($rq) use ($s) {
                      $rq->where('name', 'like', "%{$s}%")
                         ->orWhere('email', 'like', "%{$s}%");
                  });
            });
        }

        $payments = $query->paginate(20);
        // Chỉ đếm những giao dịch pending MÀ ĐỘC GIẢ ĐÃ XÁC NHẬN CHUYỂN TIỀN
        $pendingCount = Payment::where('status', 'pending')
            ->whereNotNull('transfer_confirmed_at')
            ->count();

        return response()->json([
            'payments' => $payments,
            'pending_count' => $pendingCount,
        ]);
    }

    /**
     * Thủ thư phê duyệt giao dịch thanh toán thành công
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền phê duyệt thanh toán!'], 403);
        }

        $payment = Payment::findOrFail($id);

        if ($payment->status === 'success') {
            return response()->json(['message' => 'Giao dịch này đã được phê duyệt trước đó!'], 422);
        }

        DB::beginTransaction();
        try {
            $payment->update([
                'status' => 'success',
                'approved_by' => $user->id,
                'approved_at' => now(),
                'paid_at' => now(),
                'note' => ($payment->note ? $payment->note . ' | ' : '') . 'Đã duyệt bởi thủ thư: ' . $user->name,
            ]);

            if ($payment->payable_type === Order::class) {
                $order = Order::find($payment->payable_id);
                if ($order) {
                    $order->update([
                        'payment_status' => 'paid',
                        'order_status' => 'processing',
                    ]);
                }
            } elseif ($payment->payable_type === BorrowTicket::class) {
                $ticket = BorrowTicket::find($payment->payable_id);
                if ($ticket) {
                    $ticket->update([
                        'total_late_fee' => 0,
                        'notes' => ($ticket->notes ? $ticket->notes . ' | ' : '') . 'Đã thanh toán phí phạt ngân hàng (Duyệt bởi ' . $user->name . ')',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Phê duyệt thanh toán thành công! Đơn hàng/Phiếu phạt đã được cập nhật.',
                'payment' => $payment->fresh()->load(['reader', 'approver']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi phê duyệt: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Thủ thư từ chối giao dịch thanh toán
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền thao tác chức năng này!'], 403);
        }

        $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $payment = Payment::findOrFail($id);

        $payment->update([
            'status' => 'failed',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'note' => 'Từ chối duyệt bởi ' . $user->name . ($request->reason ? ': ' . $request->reason : ''),
        ]);

        return response()->json([
            'message' => 'Đã từ chối giao dịch thanh toán này!',
            'payment' => $payment->fresh()->load(['reader', 'approver']),
        ]);
    }

    /**
     * Webhook giả lập (giữ lại cho tương thích)
     */
    public function webhook(Request $request)
    {
        $request->validate([
            'transaction_code' => 'required|string',
            'status' => 'required|in:success,failed',
        ]);

        $payment = Payment::where('transaction_code', $request->transaction_code)->first();

        if (!$payment) {
            return response()->json(['message' => 'Giao dịch không tồn tại!'], 404);
        }

        if ($payment->status === 'success') {
            return response()->json(['message' => 'Giao dịch đã được xử lý trước đó!']);
        }

        DB::beginTransaction();
        try {
            if ($request->status === 'success') {
                $payment->update([
                    'status' => 'success',
                    'raw_payload' => json_encode($request->all()),
                    'paid_at' => now(),
                ]);

                if ($payment->payable_type === Order::class) {
                    $order = Order::find($payment->payable_id);
                    if ($order) {
                        $order->update([
                            'payment_status' => 'paid',
                            'order_status' => 'processing',
                        ]);
                    }
                } elseif ($payment->payable_type === BorrowTicket::class) {
                    $ticket = BorrowTicket::find($payment->payable_id);
                    if ($ticket) {
                        $ticket->update([
                            'total_late_fee' => 0,
                            'notes' => ($ticket->notes ? $ticket->notes . " | " : "") . "Đã thanh toán phí phạt online qua " . $payment->payment_method,
                        ]);
                    }
                }
            } else {
                $payment->update([
                    'status' => 'failed',
                    'raw_payload' => json_encode($request->all()),
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Xử lý Webhook thanh toán thành công!',
                'payment' => $payment->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi xử lý Webhook: ' . $e->getMessage()], 500);
        }
    }
}
