import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, formatUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;
    const userId = Number(id);

    if (authUser && authUser.id === userId) {
      return NextResponse.json(
        { message: 'Không thể tự khóa tài khoản của chính mình!' },
        { status: 422 }
      );
    }

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const newActive = user.is_active ? 0 : 1;
    await query('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?', [
      newActive,
      new Date(),
      userId,
    ]);

    if (!newActive) {
      await query(
        `DELETE FROM personal_access_tokens WHERE tokenable_type = 'App\\\\Models\\\\User' AND tokenable_id = ?`,
        [userId]
      );
    }

    const updated = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const statusText = newActive ? 'Mở khóa' : 'Khóa';

    return NextResponse.json({
      message: `Đã ${statusText} tài khoản ${updated.name} thành công!`,
      user: formatUser(updated),
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật trạng thái tài khoản' }, { status: 500 });
  }
}
