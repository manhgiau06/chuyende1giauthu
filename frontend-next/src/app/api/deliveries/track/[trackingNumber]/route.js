import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hydrateOrders } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { trackingNumber } = await params;
    const delivery = await queryOne(
      'SELECT * FROM deliveries WHERE tracking_number = ? LIMIT 1',
      [trackingNumber]
    );

    if (!delivery) {
      return NextResponse.json(
        { message: 'Không tìm thấy mã vận đơn này.' },
        { status: 404 }
      );
    }

    const histories = await query(
      'SELECT * FROM delivery_histories WHERE delivery_id = ? ORDER BY created_at DESC',
      [delivery.id]
    );
    const rawOrder = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [
      delivery.order_id,
    ]);
    const [order] = rawOrder ? await hydrateOrders([rawOrder]) : [null];

    return NextResponse.json({
      delivery: {
        ...delivery,
        histories,
        order,
      },
    });
  } catch (err) {
    console.error('Track delivery error:', err);
    return NextResponse.json({ message: 'Lỗi tra cứu vận đơn' }, { status: 500 });
  }
}
