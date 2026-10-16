<?php

namespace App\Console\Commands;

use App\Models\BorrowTicket;
use App\Models\SystemConfig;
use App\Jobs\SendBorrowNotificationEmailJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckDueBorrowsCommand extends Command
{
    protected $signature = 'borrows:check-due';
    protected $description = 'Quét các phiếu mượn sách gần tới hạn (2 ngày) và quá hạn để gửi email thông báo tự động lúc 07:00 sáng';

    public function handle()
    {
        $this->info("Bắt đầu quét phiếu mượn sách...");

        $lateFeePerDay = (float) SystemConfig::getVal('late_fee_per_day', 5000);
        $today = now()->startOfDay();

        // 1. Nhắc trước hạn 2 ngày
        $dueSoonTickets = BorrowTicket::with(['reader', 'items.bookCopy.book'])
            ->whereIn('status', ['borrowed', 'approved'])
            ->whereDate('due_date', '=', $today->copy()->addDays(2)->toDateString())
            ->get();

        foreach ($dueSoonTickets as $ticket) {
            SendBorrowNotificationEmailJob::dispatch($ticket, 'due_soon');
            $this->info("Đã push job email nhắc hạn 2 ngày cho Độc giả ID: {$ticket->reader_id}");
        }

        // 2. Kiểm tra phiếu mượn quá hạn
        $overdueTickets = BorrowTicket::with(['reader', 'items.bookCopy.book'])
            ->whereIn('status', ['borrowed', 'approved', 'overdue'])
            ->whereDate('due_date', '<', $today->toDateString())
            ->get();

        foreach ($overdueTickets as $ticket) {
            $daysOverdue = $today->diffInDays(Carbon::parse($ticket->due_date));
            $lateFee = $daysOverdue * $lateFeePerDay * max(1, $ticket->items->count());

            $ticket->update([
                'status' => 'overdue',
                'total_late_fee' => $lateFee,
            ]);

            SendBorrowNotificationEmailJob::dispatch($ticket, 'overdue');
            $this->info("Đã cập nhật trạng thái Quá hạn & push job email cho Độc giả ID: {$ticket->reader_id}");
        }

        $this->info("Hoàn tất tiến trình quét phiếu mượn.");
        return 0;
    }
}
