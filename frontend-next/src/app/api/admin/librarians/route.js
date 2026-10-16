import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatUser, hashPassword } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { name, email, password, phone, address } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin thủ thư.' },
        { status: 422 }
      );
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing) {
      return NextResponse.json({ message: 'Email này đã tồn tại!' }, { status: 422 });
    }

    const now = new Date();
    const res = await query(
      `INSERT INTO users (name, email, password, role, phone, address, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 'librarian', ?, ?, 1, ?, ?)`,
      [name, email, hashPassword(password), phone || null, address || null, now, now]
    );

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [res.insertId]);

    return NextResponse.json(
      {
        message: 'Tạo tài khoản Thủ thư thành công!',
        user: formatUser(user),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create librarian error:', err);
    return NextResponse.json({ message: 'Lỗi tạo tài khoản thủ thư' }, { status: 500 });
  }
}
