import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { hydrateOrders } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const raw = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [Number(id)]);
    if (!raw) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }
    if (user.role === 'reader' && Number(raw.reader_id) !== Number(user.id)) {
      return NextResponse.json(
        { message: 'Bạn không có quyền xem đơn hàng của người khác!' },
        { status: 403 }
      );
    }
    const [order] = await hydrateOrders([raw]);
    return NextResponse.json({ order });
  } catch (err) {
    console.error('Order GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải đơn hàng' }, { status: 500 });
  }
}
