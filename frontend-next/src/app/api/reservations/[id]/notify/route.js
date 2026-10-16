import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatUser } from '@/lib/auth';
import { hydrateBookById } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const resId = Number(id);

    const reservation = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [resId]
    );
    if (!reservation) {
      return NextResponse.json({ message: 'Không tìm thấy yêu cầu đặt trước' }, { status: 404 });
    }

    const now = new Date();
    const expDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await query(
      `UPDATE book_reservations SET status = 'notified', notified_at = ?, expires_at = ?, updated_at = ? WHERE id = ?`,
      [now, expDate, now, resId]
    );

    const book = await hydrateBookById(reservation.book_id);
    const reader = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [
      reservation.reader_id,
    ]);

    await query(
      `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
       VALUES (?, 'reservation', ?, ?, ?, ?)`,
      [
        reservation.reader_id,
        `🎉 [Thư Viện] Sách bạn đặt trước "${book?.title || ''}" đã có sẵn!`,
        `Xin chào ${reader?.name || 'Độc giả'},\n\nCuốn sách "${book?.title || ''}" mà bạn đăng ký đặt trước hiện đã có bản sao sẵn sàng tại thư viện.\nVui lòng đăng nhập và tạo phiếu mượn trước ngày ${expDate.toLocaleDateString('vi-VN')} (Ưu tiên giữ chỗ 48 giờ).\n\nTrân trọng,\nBan Quản Lý Thư Viện.`,
        now,
        now,
      ]
    );

    const updated = await queryOne(
      'SELECT * FROM book_reservations WHERE id = ? LIMIT 1',
      [resId]
    );

    return NextResponse.json({
      message: `Đã gửi thông báo có sách cho độc giả ${reader?.name || ''}!`,
      reservation: {
        ...updated,
        book,
        reader: formatUser(reader),
      },
    });
  } catch (err) {
    console.error('Notify reservation error:', err);
    return NextResponse.json({ message: 'Lỗi gửi thông báo đặt trước' }, { status: 500 });
  }
}
