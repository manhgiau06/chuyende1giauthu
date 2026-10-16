import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(
      `SELECT e.*, u.name AS reader_name, u.email AS reader_email
       FROM email_logs e
       LEFT JOIN users u ON e.reader_id = u.id
       ORDER BY e.created_at DESC
       LIMIT 30`
    );

    const data = rows.map((r) => ({
      ...r,
      reader: {
        id: r.reader_id,
        name: r.reader_name || 'Độc giả',
        email: r.reader_email || '',
      },
    }));

    return NextResponse.json({
      notifications: { data },
    });
  } catch (err) {
    console.error('Admin notifications GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải lịch sử thông báo' }, { status: 500 });
  }
}
