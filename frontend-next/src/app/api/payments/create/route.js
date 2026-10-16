import { NextResponse } from 'next/server';
import { query, queryOne, getSystemConfig } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { data } = await parseRequestData(request);
    const { payable_type, payable_id, payment_method } = data;

    let amount = 0;
    let modelClass = '';

    if (payable_type === 'order') {
      const order = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [
        Number(payable_id),
      ]);
      if (!order) {
        return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }
      amount = Number(order.total_amount || 0);
      modelClass = 'App\\Models\\Order';
    } else if (payable_type === 'borrow_ticket') {
      const ticket = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
        Number(payable_id),
      ]);
      if (!ticket) {
        return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
      }
      amount = Number(ticket.total_late_fee || 0);
      modelClass = 'App\\Models\\BorrowTicket';
    } else {
      return NextResponse.json({ message: 'Loại giao dịch không hợp lệ' }, { status: 422 });
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Số tiền cần thanh toán bằng 0.' },
        { status: 400 }
      );
    }

    const bankName = (await getSystemConfig('bank_name', 'MBBank')) || 'MBBank';
    const bankId = (await getSystemConfig('bank_id', '970422')) || '970422';
    const accountNumber =
      (await getSystemConfig('bank_account_number', '0123456789')) || '0123456789';
    const accountHolder =
      (await getSystemConfig('bank_account_holder', 'THU VIEN SO CHUYEN DE 1')) ||
      'THU VIEN SO CHUYEN DE 1';

    const txnCode = `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(txnCode)}&accountName=${encodeURIComponent(accountHolder)}`;

    const now = new Date();
    const res = await query(
      `INSERT INTO payments (payable_type, payable_id, reader_id, payment_method, transaction_code, amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        modelClass,
        Number(payable_id),
        user.id,
        payment_method || 'vnpay',
        txnCode,
        amount,
        now,
        now,
      ]
    );

    const payment = await queryOne('SELECT * FROM payments WHERE id = ? LIMIT 1', [
      res.insertId,
    ]);

    return NextResponse.json({
      message: 'Tạo mã thanh toán QR thành công',
      payment: { ...payment, amount: Number(payment.amount || 0), qr_code_url: qrUrl },
      bank_info: {
        bank_name: bankName,
        bank_id: bankId,
        account_number: accountNumber,
        account_holder: accountHolder,
      },
      transaction_code: txnCode,
    });
  } catch (err) {
    console.error('Create payment error:', err);
    return NextResponse.json({ message: 'Lỗi tạo mã thanh toán' }, { status: 500 });
  }
}
