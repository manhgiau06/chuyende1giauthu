import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword, createAuthToken, formatUser } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { name, email, password, phone, address } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' },
        { status: 422 }
      );
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing) {
      return NextResponse.json(
        { message: 'Email này đã được đăng ký.', errors: { email: ['Email đã tồn tại.'] } },
        { status: 422 }
      );
    }

    const now = new Date();
    const hashed = hashPassword(password);
    const result = await query(
      `INSERT INTO users (name, email, password, role, phone, address, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 'reader', ?, ?, 1, ?, ?)`,
      [name, email, hashed, phone || null, address || null, now, now]
    );

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [result.insertId]);
    const token = await createAuthToken(user.id);

    return NextResponse.json(
      {
        message: 'Đăng ký tài khoản thành công',
        access_token: token,
        token_type: 'Bearer',
        user: formatUser(user),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ message: 'Lỗi máy chủ khi đăng ký.' }, { status: 500 });
  }
}
