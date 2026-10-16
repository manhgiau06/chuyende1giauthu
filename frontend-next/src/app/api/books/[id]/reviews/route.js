import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const bookId = Number(id);

    const reviews = await query(
      `SELECT r.*, u.name AS reader_name, u.avatar_url AS reader_avatar
       FROM book_reviews r
       LEFT JOIN users u ON r.reader_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );

    const formatted = reviews.map((r) => ({
      ...r,
      rating: Number(r.rating || 5),
      reader: {
        id: r.reader_id,
        name: r.reader_name || 'Độc giả',
        avatar_url: r.reader_avatar || null,
      },
    }));

    const totalReviews = formatted.length;
    const avgRating =
      totalReviews > 0
        ? Math.round(
            (formatted.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
          ) / 10
        : 0;

    return NextResponse.json({
      reviews: formatted,
      avg_rating: avgRating,
      total_reviews: totalReviews,
    });
  } catch (err) {
    console.error('Reviews GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải đánh giá' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { id } = await params;
    const bookId = Number(id);
    const { data } = await parseRequestData(request);
    const rating = Math.min(5, Math.max(1, Number(data.rating || 5)));
    const comment = data.comment || null;
    const now = new Date();

    const existing = await queryOne(
      'SELECT id FROM book_reviews WHERE book_id = ? AND reader_id = ? LIMIT 1',
      [bookId, user.id]
    );

    let reviewId;
    if (existing) {
      await query(
        'UPDATE book_reviews SET rating = ?, comment = ?, updated_at = ? WHERE id = ?',
        [rating, comment, now, existing.id]
      );
      reviewId = existing.id;
    } else {
      const res = await query(
        `INSERT INTO book_reviews (book_id, reader_id, rating, comment, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookId, user.id, rating, comment, now, now]
      );
      reviewId = res.insertId;
    }

    const review = await queryOne('SELECT * FROM book_reviews WHERE id = ? LIMIT 1', [
      reviewId,
    ]);

    return NextResponse.json({
      message: 'Cảm ơn bạn đã đánh giá sách!',
      review: {
        ...review,
        reader: { id: user.id, name: user.name, avatar_url: user.avatar_url },
      },
    });
  } catch (err) {
    console.error('Reviews POST error:', err);
    return NextResponse.json({ message: 'Lỗi gửi đánh giá' }, { status: 500 });
  }
}
