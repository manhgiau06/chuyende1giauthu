import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const paymentId = Number(id);

    const payment = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      paymentId,
    ]);
    if (!payment) {
      return NextResponse.json({ message: 'Không tìm thấy giao dịch' }, { status: 404 });
    }
    if (payment.status === 'success') {
      return NextResponse.json({ message: 'Giao dịch đã được duyệt trước đó.', payment });
    }

    const now = new Date();
    await query(
      `UPDATE payments SET transfer_confirmed_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, paymentId]
    );

    const updated = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      paymentId,
    ]);

    return NextResponse.json({
      message:
        'Đã ghi nhận xác nhận chuyển khoản! Thủ thư sẽ kiểm tra sao kê và duyệt giao dịch của bạn.',
      payment: updated,
    });
  } catch (err) {
    console.error('Confirm transfer error:', err);
    return NextResponse.json({ message: 'Lỗi xác nhận chuyển khoản' }, { status: 500 });
  }
}
