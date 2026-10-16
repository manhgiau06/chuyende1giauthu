<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BorrowTicket;
use App\Models\BorrowItem;
use App\Models\SystemConfig;
use App\Models\BookReservation;
use App\Models\EmailLog;
use App\Services\BookStockService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowTicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BorrowTicket::with(['reader', 'librarian', 'items.bookCopy.book']);

        if ($user->isReader()) {
            $query->where('reader_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($tickets);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $ticket = BorrowTicket::with(['reader', 'librarian', 'items.bookCopy.book', 'payments'])->findOrFail($id);

        if ($user->isReader() && $ticket->reader_id !== $user->id) {
            return response()->json(['message' => 'Bạn không có quyền xem phiếu mượn này!'], 403);
        }

        return response()->json(['ticket' => $ticket]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isReader() && !$user->isAdmin()) {
            return response()->json(['message' => 'Chỉ có Độc giả mới được tạo yêu cầu mượn sách!'], 403);
        }

        $request->validate([
            'book_ids' => 'required|array|min:1|max:3',
            'book_ids.*' => 'exists:books,id',
        ]);

        $maxLimit = (int) SystemConfig::getVal('max_borrow_limit', 3);
        $maxDays = (int) SystemConfig::getVal('max_borrow_days', 14);

        // Check active borrowed books count for this reader
        $activeBorrowedCount = BorrowItem::whereHas('borrowTicket', function ($q) use ($user) {
            $q->where('reader_id', $user->id)->whereIn('status', ['pending', 'approved', 'borrowed', 'overdue']);
        })->where('status', 'borrowed')->count();

        $requestedCount = count($request->book_ids);

        if (($activeBorrowedCount + $requestedCount) > $maxLimit) {
            return response()->json([
                'message' => "Bạn đang mượn {$activeBorrowedCount} cuốn. Đã vượt quá giới hạn tối đa {$maxLimit} cuốn sách!",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $ticket = BorrowTicket::create([
                'reader_id' => $user->id,
                'status' => 'pending',
                'borrow_date' => now()->toDateString(),
                'due_date' => now()->addDays($maxDays)->toDateString(),
                'renewed_count' => 0,
                'total_late_fee' => 0,
            ]);

            foreach ($request->book_ids as $bookId) {
                $book = Book::findOrFail($bookId);
                $availableCopy = BookCopy::where('book_id', $book->id)
                    ->where('status', 'available')
                    ->first();

                if (!$availableCopy) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Sách '{$book->title}' hiện tại đã hết bản sao có sẵn để mượn!",
                    ], 422);
                }

                $availableCopy->update(['status' => 'borrowed']);

                BorrowItem::create([
                    'borrow_ticket_id' => $ticket->id,
                    'book_copy_id' => $availableCopy->id,
                    'due_date' => $ticket->due_date,
                    'status' => 'borrowed',
                ]);

                // Fulfill any reservation by this reader for this book
                BookReservation::where('book_id', $book->id)
                    ->where('reader_id', $user->id)
                    ->whereIn('status', ['pending', 'notified'])
                    ->update(['status' => 'fulfilled']);

                BookStockService::refreshBookStock($book);
            }

            DB::commit();

            return response()->json([
                'message' => 'Tạo phiếu mượn thành công! Vui lòng chờ thủ thư duyệt.',
                'ticket' => $ticket->load('items.bookCopy.book'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Đã có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function renew(Request $request, $id)
    {
        $user = $request->user();
        $ticket = BorrowTicket::findOrFail($id);

        if ($user->isReader() && $ticket->reader_id !== $user->id) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện!'], 403);
        }

        $maxRenew = (int) SystemConfig::getVal('max_renew_count', 1);
        $renewDays = (int) SystemConfig::getVal('renew_days', 7);

        if ($ticket->status === 'overdue' || Carbon::parse($ticket->due_date)->isPast()) {
            return response()->json(['message' => 'Phiếu mượn đã quá hạn, không thể gia hạn online! Vui lòng thanh toán phí phạt.'], 422);
        }

        if ($ticket->renewed_count >= $maxRenew) {
            return response()->json(['message' => "Bạn đã vượt quá số lần tự gia hạn tối đa ({$maxRenew} lần)!"], 422);
        }

        $newDueDate = Carbon::parse($ticket->due_date)->addDays($renewDays)->toDateString();

        $ticket->update([
            'due_date' => $newDueDate,
            'renewed_count' => $ticket->renewed_count + 1,
        ]);

        BorrowItem::where('borrow_ticket_id', $ticket->id)->update(['due_date' => $newDueDate]);

        return response()->json([
            'message' => "Gia hạn thành công thêm {$renewDays} ngày! Hạn trả mới: {$newDueDate}",
            'ticket' => $ticket->fresh('items.bookCopy.book'),
        ]);
    }

    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền duyệt phiếu mượn!'], 403);
        }

        $ticket = BorrowTicket::findOrFail($id);
        $ticket->update([
            'status' => 'borrowed',
            'librarian_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Đã duyệt phiếu mượn thành công!',
            'ticket' => $ticket,
        ]);
    }

    public function returnBooks(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->isLibrarian() && !$user->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền ghi nhận trả sách!'], 403);
        }

        $ticket = BorrowTicket::with('items.bookCopy.book')->findOrFail($id);

        $lateFeePerDay = (float) SystemConfig::getVal('late_fee_per_day', 5000);
        $dueDate = Carbon::parse($ticket->due_date);
        $now = now();
        $totalLateFee = 0;

        if ($now->greaterThan($dueDate)) {
            $daysOverdue = $now->diffInDays($dueDate);
            $totalLateFee = $daysOverdue * $lateFeePerDay * $ticket->items->count();
        }

        DB::beginTransaction();
        try {
            foreach ($ticket->items as $item) {
                $item->update([
                    'status' => 'returned',
                    'returned_at' => $now,
                    'late_fee' => $totalLateFee / max(1, $ticket->items->count()),
                ]);

                $copy = $item->bookCopy;
                if ($copy) {
                    $copy->update(['status' => 'available']);
                    BookStockService::refreshBookStock($copy->book);

                    // Check and notify next reader in reservation queue
                    $nextReservation = BookReservation::with(['book', 'reader'])
                        ->where('book_id', $copy->book_id)
                        ->where('status', 'pending')
                        ->orderBy('priority_number', 'asc')
                        ->first();

                    if ($nextReservation) {
                        $nextReservation->update([
                            'status' => 'notified',
                            'notified_at' => $now,
                            'expires_at' => $now->copy()->addHours(48),
                        ]);

                        EmailLog::create([
                            'reader_id' => $nextReservation->reader_id,
                            'type' => 'reservation_available',
                            'subject' => '[THƯ VIỆN] Sách bạn đặt trước đã có sẵn tại quầy!',
                            'content' => "Kính gửi độc giả " . ($nextReservation->reader->name ?? 'bạn đọc') . ",\n\nCuốn sách \"" . ($copy->book->title ?? '') . "\" bạn đặt trước hiện đã được hoàn trả và có sẵn tại thư viện. Thư viện sẽ giữ sách cho bạn đến hết ngày " . $now->copy()->addHours(48)->format('d/m/Y H:i') . ".\nVui lòng đến quầy làm thủ tục mượn sách trước thời hạn trên.",
                        ]);
                    }
                }
            }

            $ticket->update([
                'status' => 'returned',
                'returned_date' => $now->toDateString(),
                'total_late_fee' => $totalLateFee,
                'librarian_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Ghi nhận trả sách thành công!',
                'total_late_fee' => $totalLateFee,
                'ticket' => $ticket->fresh('items.bookCopy.book'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
