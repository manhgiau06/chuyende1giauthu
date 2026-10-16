import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, createAuthToken, formatUser } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 422 }
      );
    }

    const user = await queryOne('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        {
          message: 'Thông tin đăng nhập không chính xác.',
          errors: { email: ['Thông tin đăng nhập không chính xác.'] },
        },
        { status: 422 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { message: 'Tài khoản của bạn đã bị khóa.' },
        { status: 403 }
      );
    }

    const token = await createAuthToken(user.id);

    return NextResponse.json({
      message: 'Đăng nhập thành công',
      access_token: token,
      token_type: 'Bearer',
      user: formatUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Lỗi máy chủ khi đăng nhập.' }, { status: 500 });
  }
}
