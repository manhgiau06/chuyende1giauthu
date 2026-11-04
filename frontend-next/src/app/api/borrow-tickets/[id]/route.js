import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const raw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      Number(id),
    ]);
    if (!raw) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }
    if (user.role === 'reader' && Number(raw.reader_id) !== Number(user.id)) {
      return NextResponse.json(
        { message: 'Bạn không có quyền xem phiếu mượn của người khác!' },
        { status: 403 }
      );
    }
    const [ticket] = await hydrateBorrowTickets([raw]);
    return NextResponse.json({ ticket });
  } catch (err) {
    console.error('BorrowTicket GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải chi tiết phiếu mượn' }, { status: 500 });
  }
}
