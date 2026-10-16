import { NextResponse } from 'next/server';
import { query, queryOne, getSystemConfig } from '@/lib/db';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const ticketId = Number(id);

    const ticket = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    if (!ticket) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }
    if (ticket.status !== 'borrowed') {
      return NextResponse.json(
        { message: 'Chỉ có thể gia hạn phiếu đang trong thời gian mượn.' },
        { status: 422 }
      );
    }

    const maxRenewals = Number((await getSystemConfig('max_renewals', 1)) || 1);
    const renewDays = Number((await getSystemConfig('renew_days', 7)) || 7);

    if (Number(ticket.renewed_count || 0) >= maxRenewals) {
      return NextResponse.json(
        { message: `Phiếu mượn này đã hết lượt gia hạn (Tối đa ${maxRenewals} lần).` },
        { status: 422 }
      );
    }

    const now = new Date();
    const currentDue = new Date(ticket.due_date);
    if (now > currentDue) {
      return NextResponse.json(
        { message: 'Phiếu mượn đã quá hạn, không thể gia hạn thêm!' },
        { status: 422 }
      );
    }

    const newDue = new Date(currentDue.getTime() + renewDays * 24 * 60 * 60 * 1000);
    await query(
      `UPDATE borrow_tickets SET due_date = ?, renewed_count = renewed_count + 1, updated_at = ? WHERE id = ?`,
      [newDue, now, ticketId]
    );

    const updatedRaw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    const [hydrated] = await hydrateBorrowTickets([updatedRaw]);

    return NextResponse.json({
      message: `Gia hạn thêm ${renewDays} ngày thành công! Hạn trả mới: ${newDue.toLocaleDateString('vi-VN')}`,
      ticket: hydrated,
    });
  } catch (err) {
    console.error('Renew borrow ticket error:', err);
    return NextResponse.json({ message: 'Lỗi gia hạn phiếu mượn' }, { status: 500 });
  }
}
