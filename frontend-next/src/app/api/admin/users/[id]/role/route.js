import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireRole, formatUser } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function PUT(request, { params }) {
  try {
    const { user: authUser, errorResponse } = await requireRole(request, ['admin']);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const userId = Number(id);
    const { data } = await parseRequestData(request);
    const { role } = data;

    if (!['reader', 'librarian', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Vai trò không hợp lệ!' },
        { status: 422 }
      );
    }

    if (authUser && authUser.id === userId && role !== 'admin') {
      return NextResponse.json(
        { message: 'Không thể tự hạ quyền Quản trị viên của chính mình!' },
        { status: 422 }
      );
    }

    await query('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [
      role,
      new Date(),
      userId,
    ]);
    const updated = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);

    return NextResponse.json({
      message: `Đã cập nhật vai trò của ${updated?.name || ''} thành ${role.toUpperCase()}`,
      user: formatUser(updated),
    });
  } catch (err) {
    console.error('Update user role error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật vai trò' }, { status: 500 });
  }
}
