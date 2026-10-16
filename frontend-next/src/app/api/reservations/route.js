import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, formatUser } from '@/lib/auth';
import { hydrateBooks, hydrateBookById, parseRequestData } from '@/lib/helpers';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    let rows;
    if (user.role === 'reader') {
      rows = await query(
        `SELECT * FROM book_reservations WHERE reader_id = ? ORDER BY id DESC`,
        [user.id]
      );
    } else {
      rows = await query(`SELECT * FROM book_reservations ORDER BY id DESC`);
    }

    if (rows.length === 0) {
      return NextResponse.json({ reservations: [] });
    }

    const bookIds = [...new Set(rows.map((r) => r.book_id).filter(Boolean))];
    const readerIds = [...new Set(rows.map((r) => r.reader_id).filter(Boolean))];

    let bookMap = {};
    if (bookIds.length > 0) {
      const ph = bookIds.map(() => '?').join(',');
      const rawBooks = await query(`SELECT * FROM books WHERE id IN (${ph})`, bookIds);
      const hydrated = await hydrateBooks(rawBooks);
      bookMap = Object.fromEntries(hydrated.map((b) => [b.id, b]));
    }

    let userMap = {};
    if (readerIds.length > 0) {
      const ph = readerIds.map(() => '?').join(',');
      const users = await query(`SELECT * FROM users WHERE id IN (${ph})`, readerIds);
      userMap = Object.fromEntries(users.map((u) => [u.id, formatUser(u)]));
    }

    const reservations = rows.map((r) => ({
      ...r,
      book: bookMap[r.book_id] || null,
      reader: userMap[r.reader_id] || null,
    }));

    return NextResponse.json({ reservations });
  } catch (err) {
    console.error('Reservations GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh sách đặt trước' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { data } = await parseRequestData(request);
    const bookId = Number(data.book_id);
    const book = await hydrateBookById(bookId);

    if (!book) {
      return NextResponse.json({ message: 'Không tìm thấy sách' }, { status: 404 });
    }

    if (book.available_copies_count > 0) {
      return NextResponse.json(
        {
          message:
            'Sách này hiện đang có sẵn trên kệ, bạn có thể bấm Mượn ngay mà không cần Đặt trước!',
        },
        { status: 422 }
      );
    }

    const existing = await queryOne(
      `SELECT id FROM book_reservations WHERE reader_id = ? AND book_id = ? AND status IN ('pending', 'notified') LIMIT 1`,
      [user.id, bookId]
    );
    if (existing) {
      return NextResponse.json(
        { message: 'Bạn đã nằm trong danh sách chờ của cuốn sách này rồi!' },
        { status: 422 }
      );
    }

    const countRow = await queryOne(
      `SELECT COUNT(*) AS cnt FROM book_reservations WHERE book_id = ? AND status = 'pending'`,
      [bookId]
    );
    const priorityNumber = Number(countRow?.cnt || 0) + 1;

    const now = new Date();
    const res = await query(
      `INSERT INTO book_reservations (book_id, reader_id, status, priority_number, reserved_at, notes, created_at, updated_at)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [bookId, user.id, priorityNumber, now, data.notes || null, now, now]
    );

    const reservation = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [res.insertId]
    );

    return NextResponse.json(
      {
        message:
          'Đăng ký đặt trước thành công! Hệ thống sẽ tự động gửi thông báo ngay khi có người trả sách.',
        reservation: {
          ...reservation,
          book,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Reservations POST error:', err);
    return NextResponse.json({ message: 'Lỗi đăng ký đặt trước' }, { status: 500 });
  }
}
