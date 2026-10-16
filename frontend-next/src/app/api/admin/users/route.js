import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatUser, hashPassword } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || '';
    const keyword = searchParams.get('keyword') || '';

    const conditions = [];
    const params = [];

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }
    if (keyword.trim()) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, kw);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM borrow_tickets bt WHERE bt.reader_id = u.id) AS borrow_tickets_count,
              (SELECT COUNT(*) FROM orders o WHERE o.reader_id = u.id) AS orders_count
       FROM users u
       ${whereClause}
       ORDER BY u.id DESC`,
      params
    );

    const users = rows.map((u) => ({
      ...formatUser(u),
      borrow_tickets_count: Number(u.borrow_tickets_count || 0),
      orders_count: Number(u.orders_count || 0),
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh sách tài khoản' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { name, email, password, role, phone, address } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' },
        { status: 422 }
      );
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing) {
      return NextResponse.json(
        { message: 'Email này đã tồn tại trong hệ thống!' },
        { status: 422 }
      );
    }

    const now = new Date();
    const res = await query(
      `INSERT INTO users (name, email, password, role, phone, address, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        name,
        email,
        hashPassword(password),
        role || 'reader',
        phone || null,
        address || null,
        now,
        now,
      ]
    );

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [res.insertId]);

    return NextResponse.json(
      {
        message: 'Tạo tài khoản mới thành công!',
        user: formatUser(user),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Admin users POST error:', err);
    return NextResponse.json({ message: 'Lỗi tạo tài khoản' }, { status: 500 });
  }
}
