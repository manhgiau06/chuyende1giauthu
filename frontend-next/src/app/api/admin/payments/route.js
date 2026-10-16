import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const conditions = [];
    const params = [];
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query(
      `SELECT * FROM payments ${whereClause} ORDER BY created_at DESC LIMIT 50`,
      params
    );

    const readerIds = [...new Set(rows.map((p) => p.reader_id).filter(Boolean))];
    let userMap = {};
    if (readerIds.length > 0) {
      const ph = readerIds.map(() => '?').join(',');
      const users = await query(`SELECT * FROM users WHERE id IN (${ph})`, readerIds);
      userMap = Object.fromEntries(users.map((u) => [u.id, formatUser(u)]));
    }

    const data = [];
    for (const p of rows) {
      let payable = null;
      if (p.payable_type && p.payable_type.includes('Order')) {
        payable = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [
          p.payable_id,
        ]);
      } else if (p.payable_type && p.payable_type.includes('BorrowTicket')) {
        payable = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
          p.payable_id,
        ]);
      }
      data.push({
        ...p,
        amount: Number(p.amount || 0),
        reader: userMap[p.reader_id] || null,
        payable,
      });
    }

    const pendingRow = await queryOne(
      `SELECT COUNT(*) AS cnt FROM payments WHERE status = 'pending'`
    );

    return NextResponse.json({
      payments: { data },
      pending_count: Number(pendingRow?.cnt || 0),
    });
  } catch (err) {
    console.error('Admin payments GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh sách thanh toán' }, { status: 500 });
  }
}
