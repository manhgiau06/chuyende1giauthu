import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
    const { id } = await params;
    const ticketId = Number(id);

    const ticket = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    if (!ticket) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }
    if (ticket.status !== 'pending') {
      return NextResponse.json(
        { message: 'Chỉ có thể duyệt phiếu đang ở trạng thái chờ (pending).' },
        { status: 422 }
      );
    }

    const now = new Date();
    await query(
      `UPDATE borrow_tickets SET status = 'borrowed', librarian_id = ?, borrow_date = ?, updated_at = ? WHERE id = ?`,
      [user ? user.id : null, now, now, ticketId]
    );

    const updatedRaw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    const [hydrated] = await hydrateBorrowTickets([updatedRaw]);

    return NextResponse.json({
      message: 'Đã duyệt xuất sách cho mượn thành công!',
      ticket: hydrated,
    });
  } catch (err) {
    console.error('Approve borrow ticket error:', err);
    return NextResponse.json({ message: 'Lỗi duyệt phiếu mượn' }, { status: 500 });
  }
}
