import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { parseRequestData } from '@/lib/helpers';

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { bank_name, bank_id, account_number, account_holder } = data;

    if (!bank_name || !bank_id || !account_number || !account_holder) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.' },
        { status: 422 }
      );
    }

    const entries = [
      ['bank_name', bank_name, 'Tên ngân hàng thụ hưởng'],
      ['bank_id', bank_id, 'Mã BIN ngân hàng (VietQR)'],
      ['bank_account_number', account_number, 'Số tài khoản nhận tiền'],
      ['bank_account_holder', account_holder.toUpperCase(), 'Tên chủ tài khoản nhận tiền'],
    ];

    const now = new Date();
    for (const [key, val, desc] of entries) {
      const existing = await queryOne(
        'SELECT id FROM system_configs WHERE `key` = ? LIMIT 1',
        [key]
      );
      if (existing) {
        await query(
          'UPDATE system_configs SET `value` = ?, updated_at = ? WHERE id = ?',
          [String(val), now, existing.id]
        );
      } else {
        await query(
          'INSERT INTO system_configs (`key`, `value`, `description`, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [key, String(val), desc, now, now]
        );
      }
    }

    return NextResponse.json({
      message: 'Cập nhật tài khoản ngân hàng nhận thanh toán thành công!',
      bank_config: {
        bank_name,
        bank_id,
        account_number,
        account_holder: account_holder.toUpperCase(),
      },
    });
  } catch (err) {
    console.error('Librarian bank-config POST error:', err);
    return NextResponse.json({ message: 'Lỗi lưu cấu hình ngân hàng' }, { status: 500 });
  }
}
