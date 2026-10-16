import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { target, reader_id, subject, content, type } = data;

    if (!subject || !content) {
      return NextResponse.json(
        { message: 'Vui lòng nhập tiêu đề và nội dung thông báo.' },
        { status: 422 }
      );
    }

    let readers = [];
    if (target === 'single') {
      readers = await query('SELECT id FROM users WHERE id = ?', [Number(reader_id)]);
    } else if (target === 'active_borrowers') {
      readers = await query(
        `SELECT DISTINCT u.id FROM users u
         JOIN borrow_tickets bt ON bt.reader_id = u.id
         WHERE u.role = 'reader' AND bt.status IN ('borrowed', 'overdue')`
      );
    } else if (target === 'overdue_borrowers') {
      readers = await query(
        `SELECT DISTINCT u.id FROM users u
         JOIN borrow_tickets bt ON bt.reader_id = u.id
         WHERE u.role = 'reader' AND (bt.status = 'overdue' OR (bt.status = 'borrowed' AND bt.due_date < NOW()))`
      );
    } else {
      readers = await query(`SELECT id FROM users WHERE role = 'reader' AND is_active = 1`);
    }

    const now = new Date();
    let count = 0;
    for (const r of readers) {
      await query(
        `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [r.id, type || 'general', subject, content, now, now]
      );
      count++;
    }

    return NextResponse.json({
      message: `Đã gửi thông báo thành công tới ${count} độc giả!`,
      sent_count: count,
    });
  } catch (err) {
    console.error('Send notification error:', err);
    return NextResponse.json({ message: 'Lỗi gửi thông báo' }, { status: 500 });
  }
}
