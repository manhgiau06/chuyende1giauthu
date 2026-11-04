import { NextResponse } from 'next/server';
import { queryOne, withTransaction, HttpError } from '@/lib/db';
import { parseRequestData } from '@/lib/helpers';

function extractTransactionCode(payload) {
  if (payload.transaction_code) return String(payload.transaction_code).trim().toUpperCase();
  const textSources = [
    payload.content,
    payload.description,
    payload.transfer_content,
    payload.addInfo,
    Array.isArray(payload.data) && payload.data[0]?.description,
  ].filter(Boolean);

  for (const text of textSources) {
    const match = String(text).toUpperCase().match(/PAY-[A-Z0-9]{6,12}/);
    if (match) return match[0];
  }
  return null;
}

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const txnCode = extractTransactionCode(data);

    if (!txnCode) {
      return NextResponse.json(
        { message: 'Không tìm thấy mã giao dịch (PAY-XXXX) trong nội dung Webhook.' },
        { status: 422 }
      );
    }

    const result = await withTransaction(async (tx) => {
      const payment = await tx.queryOne(
        'SELECT * FROM payments WHERE transaction_code = ? LIMIT 1 FOR UPDATE',
        [txnCode]
      );

      if (!payment) {
        throw new HttpError(`Không tìm thấy giao dịch với mã ${txnCode}`, 404);
      }

      if (payment.status === 'success') {
        return { alreadyPaid: true, payment };
      }

      const incomingAmount = Number(
        data.amount ?? data.transferAmount ?? (Array.isArray(data.data) && data.data[0]?.amount) ?? payment.amount
      );

      if (incomingAmount < Number(payment.amount || 0)) {
        throw new HttpError(
          `Số tiền chuyển khoản (${incomingAmount.toLocaleString('vi-VN')}đ) nhỏ hơn số tiền cần thanh toán (${Number(payment.amount).toLocaleString('vi-VN')}đ).`,
          422
        );
      }

      const now = new Date();
      const rawJson = JSON.stringify({
        ...data,
        webhook_verified_at: now.toISOString(),
      });

      await tx.query(
        `UPDATE payments
         SET status = 'success',
             raw_payload = ?,
             paid_at = ?,
             transfer_confirmed_at = COALESCE(transfer_confirmed_at, ?),
             approved_at = ?,
             note = 'Tự động đối soát thành công qua Webhook VietQR/Casso',
             updated_at = ?
         WHERE id = ?`,
        [rawJson, now, now, now, now, payment.id]
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

      await tx.query(
        `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
         VALUES (?, 'general', ?, ?, ?, ?)`,
        [
          payment.reader_id,
          `✅ [Xác Nhận Thanh Toán] Giao dịch ${txnCode} đã hoàn tất`,
          `Hệ thống Cổng thanh toán Tự động VietQR đã nhận được khoản thanh toán ${Number(payment.amount).toLocaleString('vi-VN')} VNĐ cho mã giao dịch ${txnCode}.\nĐơn hàng / Phí phạt của bạn đã được gạch nợ tự động.\nCảm ơn bạn đã sử dụng dịch vụ Thư Viện Tri Thức Số!`,
          now,
          now,
        ]
      );

      const updated = await tx.queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
        payment.id,
      ]);
      return { alreadyPaid: false, payment: updated };
    });

    return NextResponse.json({
      message: result.alreadyPaid
        ? 'Giao dịch này đã được thanh toán trước đó.'
        : '🎉 Đối soát tự động VietQR Webhook thành công! Giao dịch đã được duyệt tức thì.',
      payment: result.payment,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Payment webhook error:', err);
    return NextResponse.json({ message: 'Lỗi xử lý Webhook thanh toán' }, { status: 500 });
  }
}
