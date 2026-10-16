import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
