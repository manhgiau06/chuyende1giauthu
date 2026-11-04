import { NextResponse } from 'next/server';
import { queryOne, withTransaction, HttpError } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { user, errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const paymentId = Number(id);

    const alreadySuccess = await withTransaction(async (tx) => {
      const payment = await tx.queryOne(
        'SELECT * FROM payments WHERE id = ? LIMIT 1 FOR UPDATE',
        [paymentId]
      );
      if (!payment) {
        throw new HttpError('Không tìm thấy giao dịch', 404);
      }
      if (payment.status === 'success') {
        return payment;
      }

      const now = new Date();
      await tx.query(
        `UPDATE payments SET status = 'success', approved_by = ?, paid_at = ?, approved_at = ?, updated_at = ? WHERE id = ?`,
        [user ? user.id : null, now, now, now, paymentId]
      );

      if (payment.payable_type && payment.payable_type.includes('Order')) {
        await tx.query(
          `UPDATE orders SET payment_status = 'paid', order_status = 'processing', updated_at = ? WHERE id = ?`,
          [now, payment.payable_id]
        );
      } else if (payment.payable_type && payment.payable_type.includes('BorrowTicket')) {
        await tx.query(
          `UPDATE borrow_tickets SET total_late_fee = 0, updated_at = ? WHERE id = ?`,
          [now, payment.payable_id]
        );
      }
      return null;
    });

    if (alreadySuccess) {
      return NextResponse.json({
        message: 'Giao dịch đã được duyệt trước đó.',
        payment: alreadySuccess,
      });
    }

    const updated = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      paymentId,
    ]);

    return NextResponse.json({
      message: 'Đã xác nhận tiền vào tài khoản và duyệt giao dịch thành công!',
      payment: updated,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Approve payment error:', err);
    return NextResponse.json({ message: 'Lỗi duyệt thanh toán' }, { status: 500 });
  }
}
