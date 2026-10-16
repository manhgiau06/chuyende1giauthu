import { NextResponse } from 'next/server';
import { query, getSystemConfig } from '@/lib/db';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function POST() {
  try {
    const now = new Date();
    const lateFeePerDay = Number((await getSystemConfig('late_fee_per_day', 5000)) || 5000);

    const overdueRaw = await query(
      `SELECT * FROM borrow_tickets WHERE status IN ('borrowed', 'overdue') AND due_date < ?`,
      [now]
    );
    const overdueTickets = await hydrateBorrowTickets(overdueRaw);

    let overdueCount = 0;
    for (const ticket of overdueTickets) {
      const dueDate = new Date(ticket.due_date);
      const lateDays = Math.max(
        1,
        Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const activeItemsCount = Math.max(
        1,
        (ticket.items || []).filter((i) => i.status === 'borrowed').length
      );
      const estimatedFee = lateDays * lateFeePerDay * activeItemsCount;

      await query(
        `UPDATE borrow_tickets SET status = 'overdue', total_late_fee = ?, updated_at = ? WHERE id = ?`,
        [estimatedFee, now, ticket.id]
      );

      const bookNames = (ticket.items || [])
        .map((i) => i.book_copy?.book?.title || 'Sách')
        .join(', ');
      const feeStr = estimatedFee.toLocaleString('vi-VN');

      await query(
        `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
         VALUES (?, 'overdue_alert', ?, ?, ?, ?)`,
        [
          ticket.reader_id,
          `⚠️ [CẢNH BÁO QUÁ HẠN] Phiếu mượn ${ticket.ticket_code} đã trễ ${lateDays} ngày`,
          `Xin chào ${ticket.reader?.name || 'Độc giả'},\n\nHệ thống ghi nhận phiếu mượn ${ticket.ticket_code} (Sách: ${bookNames}) đã quá hạn trả ${lateDays} ngày.\nPhí phạt tạm tính hiện tại: ${feeStr} VNĐ.\nVui lòng mang sách tới thư viện hoàn trả sớm nhất!\n\nTrân trọng,\nHệ thống Quản lý Thư viện Tự động.`,
          now,
          now,
        ]
      );
      overdueCount++;
    }

    return NextResponse.json({
      message: 'Đã chạy tác vụ tự động kiểm tra quá hạn và gửi thông báo thành công!',
      output: `Đã quét và xử lý ${overdueCount} phiếu mượn quá hạn.`,
    });
  } catch (err) {
    console.error('Trigger schedule error:', err);
    return NextResponse.json({ message: 'Lỗi chạy tác vụ tự động' }, { status: 500 });
  }
}
