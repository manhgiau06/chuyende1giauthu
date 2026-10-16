import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hydrateOrders, parseRequestData } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    const { data } = await parseRequestData(request);
    const { status, location, description, note } = data;

    const order = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const now = new Date();
    const delivery = await queryOne('SELECT * FROM deliveries WHERE order_id = ? LIMIT 1', [
      orderId,
    ]);
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    if (status === 'shipping') {
      await query(`UPDATE orders SET order_status = 'shipping', updated_at = ? WHERE id = ?`, [
        now,
        orderId,
      ]);
      if (delivery) {
        await query(
          `UPDATE deliveries SET status = 'in_transit', shipped_at = ?, updated_at = ? WHERE id = ?`,
          [now, now, delivery.id]
        );
        await query(
          `INSERT INTO delivery_histories (delivery_id, status, note, location, created_at, updated_at)
           VALUES (?, 'Đang vận chuyển', ?, ?, ?, ?)`,
          [
            delivery.id,
            description || note || 'Đơn vị vận chuyển đã lấy hàng',
            location || 'Trạm trung chuyển',
            now,
            now,
          ]
        );
      }
      for (const item of items) {
        await query(
          `UPDATE book_inventories
           SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
               stock_quantity = GREATEST(0, stock_quantity - ?),
               updated_at = ?
           WHERE book_id = ?`,
          [item.quantity, item.quantity, now, item.book_id]
        );
      }
    } else if (status === 'completed') {
      await query(
        `UPDATE orders SET order_status = 'completed', payment_status = 'paid', updated_at = ? WHERE id = ?`,
        [now, orderId]
      );
      if (delivery) {
        await query(
          `UPDATE deliveries SET status = 'delivered', delivered_at = ?, updated_at = ? WHERE id = ?`,
          [now, now, delivery.id]
        );
        await query(
          `INSERT INTO delivery_histories (delivery_id, status, note, location, created_at, updated_at)
           VALUES (?, 'Giao hàng thành công', 'Khách hàng đã nhận sách', ?, ?, ?)`,
          [delivery.id, order.shipping_address, now, now]
        );
      }
    } else if (status === 'cancelled') {
      await query(`UPDATE orders SET order_status = 'cancelled', updated_at = ? WHERE id = ?`, [
        now,
        orderId,
      ]);
      for (const item of items) {
        await query(
          `UPDATE book_inventories SET reserved_quantity = GREATEST(0, reserved_quantity - ?), updated_at = ? WHERE book_id = ?`,
          [item.quantity, now, item.book_id]
        );
      }
    } else {
      await query(`UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?`, [
        status,
        now,
        orderId,
      ]);
    }

    const updatedRaw = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
    const [hydrated] = await hydrateOrders([updatedRaw]);

    return NextResponse.json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: hydrated,
    });
  } catch (err) {
    console.error('Order status update error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật trạng thái đơn hàng' }, { status: 500 });
  }
}
