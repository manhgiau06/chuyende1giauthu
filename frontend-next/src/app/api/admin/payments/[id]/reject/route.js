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

    await query(
      `UPDATE payments SET status = 'failed', updated_at = ? WHERE id = ?`,
      [new Date(), paymentId]
    );
    const updated = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      paymentId,
    ]);

    return NextResponse.json({
      message: 'Đã từ chối giao dịch thanh toán này.',
      payment: updated,
    });
  } catch (err) {
    console.error('Reject payment error:', err);
    return NextResponse.json({ message: 'Lỗi từ chối thanh toán' }, { status: 500 });
  }
}
