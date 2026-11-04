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
    const payable_type = data.payable_type || data.type;
    const payable_id = data.payable_id || data.id;
    const payment_method = data.payment_method;

    let amount = 0;
    let modelClass = '';

    if (payable_type === 'order') {
      const order = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [
        Number(payable_id),
      ]);
      if (!order) {
        return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }
      if (user.role === 'reader' && Number(order.reader_id) !== Number(user.id)) {
        return NextResponse.json(
          { message: 'Bạn không có quyền tạo thanh toán cho đơn hàng của người khác!' },
          { status: 403 }
        );
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
      if (user.role === 'reader' && Number(ticket.reader_id) !== Number(user.id)) {
        return NextResponse.json(
          { message: 'Bạn không có quyền tạo thanh toán cho phiếu mượn của người khác!' },
          { status: 403 }
        );
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
    const normalizedMethod = payment_method === 'momo' ? 'momo' : 'bank_transfer';
    const res = await query(
      `INSERT INTO payments (payable_type, payable_id, reader_id, payment_method, transaction_code, amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        modelClass,
        Number(payable_id),
        user.id,
        normalizedMethod,
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
      qr_code_url: qrUrl,
      bank_info: {
        bank_name: bankName,
        bank_id: bankId,
        account_number: accountNumber,
        account_holder: accountHolder,
        amount: Number(payment.amount || 0),
        transfer_content: txnCode,
        qr_code_url: qrUrl,
      },
      transaction_code: txnCode,
    });
  } catch (err) {
    console.error('Create payment error:', err);
    return NextResponse.json({ message: 'Lỗi tạo mã thanh toán' }, { status: 500 });
  }
}
