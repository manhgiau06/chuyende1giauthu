import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { hydrateBooks } from '@/lib/helpers';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const rows = await query(
      'SELECT * FROM wishlists WHERE reader_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ wishlists: [] });
    }

    const bookIds = rows.map((w) => w.book_id);
    const placeholders = bookIds.map(() => '?').join(',');
    const rawBooks = await query(
      `SELECT * FROM books WHERE id IN (${placeholders})`,
      bookIds
    );
    const hydrated = await hydrateBooks(rawBooks);
    const bookMap = Object.fromEntries(hydrated.map((b) => [b.id, b]));

    const wishlists = rows
      .map((w) => ({
        ...w,
        book: bookMap[w.book_id] || null,
      }))
      .filter((w) => w.book !== null);

    return NextResponse.json({ wishlists });
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh sách yêu thích' }, { status: 500 });
  }
}
