import { NextResponse } from 'next/server';
import { query, queryOne, getSystemConfig } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { hydrateBorrowTickets, parseRequestData } from '@/lib/helpers';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const perPage = Math.max(1, Number(searchParams.get('per_page') || 15));
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const offset = (page - 1) * perPage;

    const conditions = [];
    const params = [];

    if (user.role === 'reader') {
      conditions.push('reader_id = ?');
      params.push(user.id);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM borrow_tickets ${whereClause}`,
      params
    );
    const total = Number(countRow?.total || 0);

    const rawTickets = await query(
      `SELECT * FROM borrow_tickets ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const data = await hydrateBorrowTickets(rawTickets);

    return NextResponse.json({
      current_page: page,
      data,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      total,
    });
  } catch (err) {
    console.error('BorrowTickets GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải phiếu mượn' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { data } = await parseRequestData(request);
    const readerId = data.reader_id || user.id;
    const bookCopyIds = Array.isArray(data.book_copy_ids) ? data.book_copy_ids : [];
    const dueDays = Math.min(30, Math.max(1, Number(data.due_days || 14)));

    if (bookCopyIds.length === 0) {
      return NextResponse.json(
        { message: 'Vui lòng chọn ít nhất 1 cuốn sách để mượn.' },
        { status: 422 }
      );
    }

    const maxBorrowLimit = Number((await getSystemConfig('max_borrow_books', 5)) || 5);
    const currentBorrowsRow = await queryOne(
      `SELECT COUNT(*) AS cnt FROM borrow_items bi
       JOIN borrow_tickets bt ON bi.borrow_ticket_id = bt.id
       WHERE bt.reader_id = ? AND bt.status IN ('pending', 'borrowed', 'overdue') AND bi.status = 'borrowed'`,
      [readerId]
    );
    const currentBorrowedCount = Number(currentBorrowsRow?.cnt || 0);

    if (currentBorrowedCount + bookCopyIds.length > maxBorrowLimit) {
      return NextResponse.json(
        {
          message: `Vượt quá giới hạn mượn! Mỗi độc giả chỉ được mượn tối đa ${maxBorrowLimit} cuốn cùng lúc. Hiện tại đang giữ ${currentBorrowedCount} cuốn.`,
        },
        { status: 422 }
      );
    }

    const placeholders = bookCopyIds.map(() => '?').join(',');
    const copies = await query(
      `SELECT * FROM book_copies WHERE id IN (${placeholders})`,
      bookCopyIds
    );
    const copyMap = Object.fromEntries(copies.map((c) => [c.id, c]));

    for (const copyId of bookCopyIds) {
      const copy = copyMap[Number(copyId)];
      if (!copy || copy.status !== 'available') {
        return NextResponse.json(
          {
            message: `Bản sao sách (ID: ${copyId}) hiện không có sẵn để mượn.`,
          },
          { status: 422 }
        );
      }
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    const ticketRes = await query(
      `INSERT INTO borrow_tickets (reader_id, librarian_id, status, borrow_date, due_date, renewed_count, total_late_fee, notes, created_at, updated_at)
       VALUES (?, NULL, 'pending', ?, ?, 0, 0, ?, ?, ?)`,
      [readerId, now, dueDate, data.note || data.notes || null, now, now]
    );

    const ticketId = ticketRes.insertId;

    for (const copyId of bookCopyIds) {
      const copy = copyMap[Number(copyId)];
      await query(
        `UPDATE book_copies SET status = 'borrowed', updated_at = ? WHERE id = ?`,
        [now, copy.id]
      );
      await query(
        `INSERT INTO borrow_items (borrow_ticket_id, book_copy_id, due_date, late_fee, status, created_at, updated_at)
         VALUES (?, ?, ?, 0, 'borrowed', ?, ?)`,
        [ticketId, copy.id, dueDate, now, now]
      );
      await query(
        `UPDATE book_reservations SET status = 'fulfilled', updated_at = ?
         WHERE reader_id = ? AND book_id = ? AND status IN ('pending', 'notified')`,
        [now, readerId, copy.book_id]
      );
    }

    const rawTicket = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    const [hydrated] = await hydrateBorrowTickets([rawTicket]);

    return NextResponse.json(
      {
        message: 'Tạo phiếu mượn thành công',
        ticket: hydrated,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('BorrowTickets POST error:', err);
    return NextResponse.json({ message: 'Lỗi tạo phiếu mượn' }, { status: 500 });
  }
}
