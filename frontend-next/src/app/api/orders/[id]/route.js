import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hydrateOrders } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const raw = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [Number(id)]);
    if (!raw) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }
    const [order] = await hydrateOrders([raw]);
    return NextResponse.json({ order });
  } catch (err) {
    console.error('Order GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải đơn hàng' }, { status: 500 });
  }
}
