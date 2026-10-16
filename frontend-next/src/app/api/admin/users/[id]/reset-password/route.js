import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = Number(id);
    const { data } = await parseRequestData(request);
    const { password } = data;

    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
        { status: 422 }
      );
    }

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    await query('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [
      hashPassword(password),
      new Date(),
      userId,
    ]);

    return NextResponse.json({
      message: `Đã đặt lại mật khẩu cho tài khoản ${user.name} thành công!`,
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ message: 'Lỗi đặt lại mật khẩu' }, { status: 500 });
  }
}
