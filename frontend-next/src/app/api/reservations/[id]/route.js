import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const resId = Number(id);

    const reservation = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [resId]
    );
    if (!reservation) {
      return NextResponse.json({ message: 'Không tìm thấy yêu cầu đặt trước' }, { status: 404 });
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
