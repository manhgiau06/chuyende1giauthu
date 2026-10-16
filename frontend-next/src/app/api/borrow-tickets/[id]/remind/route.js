import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const ticketId = Number(id);

    const raw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    if (!raw) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }

    const [ticket] = await hydrateBorrowTickets([raw]);
    const bookNames = (ticket.items || [])
      .map((i) => i.book_copy?.book?.title || 'Sách')
      .join(', ');
    const dueStr = new Date(ticket.due_date).toLocaleDateString('vi-VN');
    const now = new Date();

    await query(
      `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
       VALUES (?, 'reminder', ?, ?, ?, ?)`,
      [
        ticket.reader_id,
        `🔔 [Thư Viện] Nhắc nhở hạn trả sách - Phiếu ${ticket.ticket_code}`,
        `Xin chào ${ticket.reader?.name || 'Độc giả'},\n\nThủ thư xin gửi lời nhắc về phiếu mượn mã ${ticket.ticket_code} (Sách: ${bookNames}).\nHạn trả sách của bạn là ngày ${dueStr}.\nVui lòng hoàn trả sách đúng hạn để tránh phát sinh phí phạt trễ hạn (5.000đ/ngày/cuốn).\n\nTrân trọng,\nBan Quản Lý Thư Viện.`,
        now,
        now,
      ]
    );

    return NextResponse.json({
      message: `Đã gửi thông báo nhắc hạn trả sách tới ${ticket.reader?.name || 'độc giả'} (${ticket.reader?.email || ''})!`,
    });
  } catch (err) {
    console.error('Remind borrow ticket error:', err);
    return NextResponse.json({ message: 'Lỗi gửi nhắc nhở' }, { status: 500 });
  }
}
