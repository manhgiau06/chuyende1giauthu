import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { parseRequestData } from '@/lib/helpers';

export async function GET() {
  try {
    const configs = await query('SELECT * FROM system_configs ORDER BY id ASC');
    return NextResponse.json({ configs });
  } catch (err) {
    console.error('System configs GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải cấu hình hệ thống' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const configs = Array.isArray(data.configs) ? data.configs : [];
    const now = new Date();

    for (const item of configs) {
      if (!item.key) continue;
      const existing = await queryOne(
        'SELECT id FROM system_configs WHERE `key` = ? LIMIT 1',
        [item.key]
      );
      if (existing) {
        await query(
          'UPDATE system_configs SET `value` = ?, updated_at = ? WHERE id = ?',
          [String(item.value ?? ''), now, existing.id]
        );
      } else {
        await query(
          'INSERT INTO system_configs (`key`, `value`, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [item.key, String(item.value ?? ''), now, now]
        );
      }
    }

    const updated = await query('SELECT * FROM system_configs ORDER BY id ASC');

    return NextResponse.json({
      message: 'Cập nhật tham số hệ thống thành công!',
      configs: updated,
    });
  } catch (err) {
    console.error('System configs POST error:', err);
    return NextResponse.json({ message: 'Lỗi lưu cấu hình hệ thống' }, { status: 500 });
  }
}
