import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    const row = await queryOne(
      'SELECT COUNT(*) AS cnt FROM email_logs WHERE reader_id = ?',
      [user.id]
    );
    return NextResponse.json({ count: Number(row?.cnt || 0) });
  } catch (err) {
    console.error('Unread count GET error:', err);
    return NextResponse.json({ count: 0 });
  }
}
