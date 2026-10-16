import { NextResponse } from 'next/server';
import { getSystemConfig } from '@/lib/db';

export async function GET() {
  try {
    const bankName = (await getSystemConfig('bank_name', 'MBBank')) || 'MBBank';
    const bankId = (await getSystemConfig('bank_id', '970422')) || '970422';
    const accountNumber =
      (await getSystemConfig('bank_account_number', '0123456789')) || '0123456789';
    const accountHolder =
      (await getSystemConfig('bank_account_holder', 'THU VIEN SO CHUYEN DE 1')) ||
      'THU VIEN SO CHUYEN DE 1';

    return NextResponse.json({
      bank_name: bankName,
      bank_id: bankId,
      account_number: accountNumber,
      account_holder: accountHolder,
    });
  } catch (err) {
    console.error('BankConfig GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải cấu hình ngân hàng' }, { status: 500 });
  }
}
