import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { id } = await params;
    const bookId = Number(id);

    const existing = await queryOne(
      'SELECT id FROM wishlists WHERE reader_id = ? AND book_id = ? LIMIT 1',
      [user.id, bookId]
    );

    if (existing) {
      await query('DELETE FROM wishlists WHERE id = ?', [existing.id]);
      return NextResponse.json({
        message: 'Đã xóa khỏi danh sách yêu thích',
        is_wishlisted: false,
      });
    }

    const now = new Date();
    await query(
      `INSERT INTO wishlists (reader_id, book_id, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [user.id, bookId, now, now]
    );

    return NextResponse.json({
      message: 'Đã thêm vào danh sách yêu thích!',
      is_wishlisted: true,
    });
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật yêu thích' }, { status: 500 });
  }
}
