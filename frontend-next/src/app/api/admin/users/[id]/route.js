import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;
    const userId = Number(id);

    if (authUser && authUser.id === userId) {
      return NextResponse.json(
        { message: 'Không thể tự xoá tài khoản của chính mình!' },
        { status: 422 }
      );
    }

    const user = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!user) {
      return NextResponse.json({ message: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const activeBorrows = await queryOne(
      `SELECT id FROM borrow_tickets WHERE reader_id = ? AND status IN ('borrowed', 'overdue') LIMIT 1`,
      [userId]
    );
    if (activeBorrows) {
      return NextResponse.json(
        {
          message:
            'Độc giả này đang có sách mượn chưa trả. Vui lòng thu hồi sách trước khi xoá!',
        },
        { status: 422 }
      );
    }

    await query(
      `DELETE FROM personal_access_tokens WHERE tokenable_type = 'App\\\\Models\\\\User' AND tokenable_id = ?`,
      [userId]
    );
    await query('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({
      message: `Đã xoá tài khoản ${user.name} khỏi hệ thống.`,
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json({ message: 'Lỗi xoá tài khoản' }, { status: 500 });
  }
}
