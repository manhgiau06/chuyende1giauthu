import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const resId = Number(id);

    const reservation = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [resId]
    );
    if (!reservation) {
      return NextResponse.json({ message: 'Không tìm thấy yêu cầu đặt trước' }, { status: 404 });
    }
    if (user.role === 'reader' && Number(reservation.reader_id) !== Number(user.id)) {
      return NextResponse.json(
        { message: 'Bạn không có quyền hủy đặt trước của người khác!' },
        { status: 403 }
      );
    }

    await query(
      `UPDATE book_reservations SET status = 'cancelled', updated_at = ? WHERE id = ?`,
      [new Date(), resId]
    );

    const updated = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [resId]
    );

    return NextResponse.json({
      message: 'Đã hủy đặt trước sách.',
      reservation: updated,
    });
  } catch (err) {
    console.error('Cancel reservation error:', err);
    return NextResponse.json({ message: 'Lỗi hủy đặt trước' }, { status: 500 });
  }
}
