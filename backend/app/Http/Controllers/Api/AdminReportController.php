<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTicket;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function monthlyStats(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Quản trị viên mới có quyền xem báo cáo thống kê!'], 403);
        }

        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // Doanh thu bán sách
        $salesRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->sum('total_amount');

        // Tổng số lượt mượn sách
        $totalBorrows = BorrowTicket::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->count();

        // Tổng số độc giả nợ phí phạt
        $unpaidLateFeeReaders = BorrowTicket::with('reader')
            ->where('total_late_fee', '>', 0)
            ->get()
            ->groupBy('reader_id')
            ->map(function ($tickets) {
                $reader = $tickets->first()->reader;
                return [
                    'reader_id' => $reader->id ?? null,
                    'reader_name' => $reader->name ?? 'N/A',
                    'reader_email' => $reader->email ?? 'N/A',
                    'total_debt' => $tickets->sum('total_late_fee'),
                    'tickets_count' => $tickets->count(),
                ];
            })->values();

        // Thống kê theo 6 tháng gần nhất
        $recentMonths = [];
        for ($i = 5; $i >= 0; $i--) {
            $dt = now()->subMonths($i);
            $m = $dt->month;
            $y = $dt->year;
            $rev = Order::where('payment_status', 'paid')->whereMonth('created_at', $m)->whereYear('created_at', $y)->sum('total_amount');
            $bor = BorrowTicket::whereMonth('created_at', $m)->whereYear('created_at', $y)->count();
            $recentMonths[] = [
                'label' => "T{$m}/{$y}",
                'revenue' => (float) $rev,
                'borrows' => $bor,
            ];
        }

        return response()->json([
            'selected_period' => ['month' => (int) $month, 'year' => (int) $year],
            'sales_revenue' => (float) $salesRevenue,
            'total_borrows' => $totalBorrows,
            'unpaid_late_fee_readers' => $unpaidLateFeeReaders,
            'recent_months_chart' => $recentMonths,
        ]);
    }

    public function triggerSchedule(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Quản trị viên mới có quyền kích hoạt tác vụ nền!'], 403);
        }

        Artisan::call('borrows:check-due');
        $output = Artisan::output();

        return response()->json([
            'message' => 'Đã kích hoạt thành công Tác vụ nền 07:00 AM (Quét phiếu mượn & Push Queue Email)!',
            'output' => trim($output),
        ]);
    }

    public function exportCsv(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Quản trị viên mới có quyền xuất báo cáo CSV!'], 403);
        }

        $orders = Order::with('reader')->orderBy('created_at', 'desc')->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=bao_cao_doanh_thu_" . date('Ymd_His') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Ma Don Hang', 'Doc Gia', 'Email', 'Tong Tien (VND)', 'Thanh Toan', 'Trang Thai', 'Ngay Tao']);

            foreach ($orders as $o) {
                fputcsv($file, [
                    $o->order_number,
                    $o->recipient_name,
                    $o->reader->email ?? 'N/A',
                    $o->total_amount,
                    $o->payment_status === 'paid' ? 'Da thanh toan' : 'Chua thanh toan',
                    $o->order_status,
                    $o->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
