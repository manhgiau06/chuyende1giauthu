import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const emails = await query(
      'SELECT * FROM email_logs WHERE reader_id = ? ORDER BY created_at DESC LIMIT 30',
      [user.id]
    );

    return NextResponse.json({
      emails,
    });
  } catch (err) {
    console.error('My emails GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải hộp thư' }, { status: 500 });
  }
}
