import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
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
      `UPDATE payments SET status = 'success', approved_by = ?, paid_at = ?, approved_at = ?, updated_at = ? WHERE id = ?`,
      [user ? user.id : null, now, now, now, paymentId]
    );

    if (payment.payable_type && payment.payable_type.includes('Order')) {
      await query(
        `UPDATE orders SET payment_status = 'paid', order_status = 'processing', updated_at = ? WHERE id = ?`,
        [now, payment.payable_id]
      );
    } else if (payment.payable_type && payment.payable_type.includes('BorrowTicket')) {
      await query(
        `UPDATE borrow_tickets SET total_late_fee = 0, updated_at = ? WHERE id = ?`,
        [now, payment.payable_id]
      );
    }

    const updated = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      paymentId,
    ]);

    return NextResponse.json({
      message: 'Đã xác nhận tiền vào tài khoản và duyệt giao dịch thành công!',
      payment: updated,
    });
  } catch (err) {
    console.error('Approve payment error:', err);
    return NextResponse.json({ message: 'Lỗi duyệt thanh toán' }, { status: 500 });
  }
}
