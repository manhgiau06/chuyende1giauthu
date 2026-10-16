import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const raw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      Number(id),
    ]);
    if (!raw) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }
    const [ticket] = await hydrateBorrowTickets([raw]);
    return NextResponse.json({ ticket });
  } catch (err) {
    console.error('BorrowTicket GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải chi tiết phiếu mượn' }, { status: 500 });
  }
}
