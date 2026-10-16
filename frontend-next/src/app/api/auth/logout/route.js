import { NextResponse } from 'next/server';
import { getAuthUser, revokeCurrentToken } from '@/lib/auth';

export async function POST(request) {
  const user = await getAuthUser(request);
  if (user) {
    await revokeCurrentToken(user);
  }
  return NextResponse.json({ message: 'Đăng xuất thành công' });
}
