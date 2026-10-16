<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTicket;
use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    /**
     * Get notifications for current logged in user.
     */
    public function myEmails(Request $request)
    {
        $user = $request->user();
        $emails = EmailLog::where('reader_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['emails' => $emails]);
    }

    /**
     * Get unread / total count of notifications for current user badge.
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $count = EmailLog::where('reader_id', $user->id)->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Librarian / Admin: View all sent notifications with recipient details.
     */
    public function allNotifications(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền xem danh sách thông báo hệ thống!'], 403);
        }

        $notifications = EmailLog::with('reader:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Librarian / Admin: Send notifications to individuals or groups of readers.
     */
    public function send(Request $request)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền gửi thông báo!'], 403);
        }

        $request->validate([
            'target_type' => 'required|in:all,single,borrowing,overdue',
            'reader_id' => 'required_if:target_type,single|nullable|exists:users,id',
            'type' => 'required|string|max:50',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $readers = collect();

        if ($request->target_type === 'single') {
            $readers = User::where('id', $request->reader_id)->get();
        } elseif ($request->target_type === 'all') {
            $readers = User::where('role', 'reader')->where('is_active', true)->get();
        } elseif ($request->target_type === 'borrowing') {
            $readerIds = BorrowTicket::whereIn('status', ['borrowed', 'approved', 'overdue'])
                ->pluck('reader_id')
                ->unique();
            $readers = User::whereIn('id', $readerIds)->where('is_active', true)->get();
        } elseif ($request->target_type === 'overdue') {
            $readerIds = BorrowTicket::where('status', 'overdue')
                ->orWhere(function ($q) {
                    $q->whereIn('status', ['borrowed', 'approved'])
                      ->whereDate('due_date', '<', now()->toDateString());
                })
                ->pluck('reader_id')
                ->unique();
            $readers = User::whereIn('id', $readerIds)->where('is_active', true)->get();
        }

        if ($readers->isEmpty()) {
            return response()->json([
                'message' => 'Không tìm thấy độc giả nào phù hợp với đối tượng đã chọn!',
                'sent_count' => 0,
            ], 422);
        }

        $subject = $request->subject;
        $content = $request->content;
        $type = $request->type;
        $sentCount = 0;

        foreach ($readers as $reader) {
            // Personalized greeting replacement if tag exists
            $personalizedContent = str_replace(
                ['{name}', '{email}'],
                [$reader->name, $reader->email],
                $content
            );

            EmailLog::create([
                'reader_id' => $reader->id,
                'type' => $type,
                'subject' => $subject,
                'content' => $personalizedContent,
            ]);

            // Attempt email sending
            try {
                if ($reader->email) {
                    Mail::raw($personalizedContent, function ($message) use ($reader, $subject) {
                        $message->to($reader->email)->subject($subject);
                    });
                }
            } catch (\Throwable $e) {
                Log::warning("Notification email failed for {$reader->email}: " . $e->getMessage());
            }

            $sentCount++;
        }

        return response()->json([
            'message' => "Đã gửi thành công thông báo tới {$sentCount} độc giả!",
            'sent_count' => $sentCount,
        ]);
    }

    /**
     * Librarian: Quick 1-click reminder for a specific borrow ticket.
     */
    public function remindBorrowTicket(Request $request, $ticketId)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này!'], 403);
        }

        $ticket = BorrowTicket::with(['reader', 'items.bookCopy.book'])->findOrFail($ticketId);
        $reader = $ticket->reader;

        if (!$reader) {
            return response()->json(['message' => 'Không tìm thấy thông tin độc giả của phiếu mượn này!'], 422);
        }

        $isOverdue = $ticket->status === 'overdue' || (now()->toDateString() > $ticket->due_date);
        $subject = $isOverdue
            ? "[Thư Viện Online] CẢNH BÁO: Phiếu mượn sách #{$ticket->id} đã QUÁ HẠN"
            : "[Thư Viện Online] Nhắc nhở trả sách: Phiếu mượn #{$ticket->id}";

        $bookListStr = $ticket->items->map(function ($item, $idx) {
            $title = $item->bookCopy->book->title ?? 'Sách';
            $barcode = $item->bookCopy->barcode ?? '';
            return ($idx + 1) . ". {$title} (Mã vạch: {$barcode})";
        })->implode("\n");

        $content = "Xin chào {$reader->name},\n\n";
        if ($isOverdue) {
            $content .= "Phiếu mượn #{$ticket->id} của bạn đã quá hạn trả (Hạn trả: {$ticket->due_date}).\n";
            if ($ticket->total_late_fee > 0) {
                $content .= "Phí phạt phát sinh hiện tại: " . number_format($ticket->total_late_fee) . " VNĐ.\n";
            }
            $content .= "\nDanh sách sách cần hoàn trả:\n{$bookListStr}\n\n";
            $content .= "Vui lòng hoàn trả sách sớm nhất tại Thư viện hoặc liên hệ Thủ thư để được hỗ trợ.\n";
        } else {
            $content .= "Thư viện xin gửi lời nhắc về phiếu mượn #{$ticket->id} của bạn sắp đến hạn trả vào ngày: {$ticket->due_date}.\n\n";
            $content .= "Danh sách sách đang mượn:\n{$bookListStr}\n\n";
            $content .= "Bạn có thể gia hạn trực tuyến thêm 01 lần tại mục 'Sách Đang Mượn' hoặc mang sách trả tại quầy Thư viện đúng hạn.\n";
        }

        $content .= "\nTrân trọng,\nBan Quản Trị Thư Viện Online 4.0";

        EmailLog::create([
            'reader_id' => $reader->id,
            'type' => $isOverdue ? 'overdue' : 'reminder',
            'subject' => $subject,
            'content' => $content,
        ]);

        try {
            if ($reader->email) {
                Mail::raw($content, function ($message) use ($reader, $subject) {
                    $message->to($reader->email)->subject($subject);
                });
            }
        } catch (\Throwable $e) {
            Log::warning("Borrow reminder email failed for {$reader->email}: " . $e->getMessage());
        }

        return response()->json([
            'message' => "Đã gửi thông báo nhắc nhở thành công đến độc giả {$reader->name} ({$reader->email})!",
        ]);
    }
}
