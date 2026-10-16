import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, formatUser } from '@/lib/auth';
import { parseRequestData, saveUploadedFile } from '@/lib/helpers';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { data, formData } = await parseRequestData(request);
    const name = data.name ?? user.name;
    const phone = data.phone ?? user.phone;
    const address = data.address ?? user.address;

    let avatarUrl = user.avatar_url;
    if (formData && formData.get('avatar')) {
      const savedPath = await saveUploadedFile(formData.get('avatar'), 'avatars');
      if (savedPath) {
        avatarUrl = savedPath;
      }
    }

    await query(
      `UPDATE users SET name = ?, phone = ?, address = ?, avatar_url = ?, updated_at = ? WHERE id = ?`,
      [name, phone || null, address || null, avatarUrl || null, new Date(), user.id]
    );

    const updated = await queryOne('SELECT * FROM users WHERE id = ? LIMIT 1', [user.id]);

    return NextResponse.json({
      message: 'Cập nhật hồ sơ thành công!',
      user: formatUser(updated),
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật hồ sơ.' }, { status: 500 });
  }
}
