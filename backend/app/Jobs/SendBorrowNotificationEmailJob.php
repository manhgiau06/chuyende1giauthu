<?php

namespace App\Jobs;

use App\Models\BorrowTicket;
use App\Models\EmailLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBorrowNotificationEmailJob implements ShouldQueue
{
    use Queueable;

    public $ticket;
    public $type; // 'due_soon' or 'overdue'

    public function __construct(BorrowTicket $ticket, string $type)
    {
        $this->ticket = $ticket;
        $this->type = $type;
    }

    public function handle(): void
    {
        $reader = $this->ticket->reader;
        if (!$reader || !$reader->email) {
            return;
        }

        $subject = $this->type === 'due_soon' 
            ? "[Thư Viện Online] Nhắc nhở: Sách mượn sắp đến hạn trả trong 2 ngày" 
            : "[Thư Viện Online] CẢNH BÁO: Phiếu mượn sách đã QUÁ HẠN";

        $content = "Xin chào {$reader->name},\n\n";
        if ($this->type === 'due_soon') {
            $content .= "Phiếu mượn sách của bạn sẽ đến hạn vào ngày {$this->ticket->due_date}.\n";
            $content .= "Vui lòng tự gia hạn online hoặc mang sách tới thư viện để hoàn trả đúng hạn.\n";
        } else {
            $content .= "Phiếu mượn sách của bạn đã quá hạn trả! Phí phạt trễ hạn tính đến nay là: " . number_format($this->ticket->total_late_fee) . " VND.\n";
            $content .= "Bạn có thể thanh toán phí phạt online qua MoMo/Ngân hàng trực tuyến hoặc tại quầy thư thư.\n";
        }

        Log::info("Gửi Email [{$this->type}] tới {$reader->email} với tiêu đề: {$subject}");

        EmailLog::create([
            'reader_id' => $reader->id,
            'type' => $this->type,
            'subject' => $subject,
            'content' => $content,
        ]);

        try {
            Mail::raw($content, function ($message) use ($reader, $subject) {
                $message->to($reader->email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error("Lỗi gửi mail: " . $e->getMessage());
        }
    }
}
