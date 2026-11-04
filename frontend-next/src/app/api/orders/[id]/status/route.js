import { NextResponse } from 'next/server';
import { queryOne, withTransaction, HttpError } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { hydrateOrders, parseRequestData } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const orderId = Number(id);
    const { data } = await parseRequestData(request);
    const { status, location, description, note } = data;

    await withTransaction(async (tx) => {
      const order = await tx.queryOne(
        'SELECT * FROM orders WHERE id = ? LIMIT 1 FOR UPDATE',
        [orderId]
      );
      if (!order) {
        throw new HttpError('Không tìm thấy đơn hàng', 404);
      }

      const now = new Date();
      const delivery = await tx.queryOne(
        'SELECT * FROM deliveries WHERE order_id = ? LIMIT 1 FOR UPDATE',
        [orderId]
      );
      const items = await tx.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

      if (status === 'shipping') {
        await tx.query(`UPDATE orders SET order_status = 'shipping', updated_at = ? WHERE id = ?`, [
          now,
          orderId,
        ]);
        if (delivery) {
          await tx.query(
            `UPDATE deliveries SET status = 'shipping', shipped_at = ?, updated_at = ? WHERE id = ?`,
            [now, now, delivery.id]
          );
          await tx.query(
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
        if (!['shipping', 'completed', 'cancelled'].includes(order.order_status)) {
          for (const item of items) {
            await tx.query(
              `UPDATE book_inventories
               SET reserved_quantity = GREATEST(0, reserved_quantity - ?),
                   stock_quantity = GREATEST(0, stock_quantity - ?),
                   updated_at = ?
               WHERE book_id = ?`,
              [item.quantity, item.quantity, now, item.book_id]
            );
          }
        }
      } else if (status === 'completed') {
        await tx.query(
          `UPDATE orders SET order_status = 'completed', payment_status = 'paid', updated_at = ? WHERE id = ?`,
          [now, orderId]
        );
        if (delivery) {
          await tx.query(
            `UPDATE deliveries SET status = 'delivered', delivered_at = ?, updated_at = ? WHERE id = ?`,
            [now, now, delivery.id]
          );
          await tx.query(
            `INSERT INTO delivery_histories (delivery_id, status, note, location, created_at, updated_at)
             VALUES (?, 'Giao hàng thành công', 'Khách hàng đã nhận sách', ?, ?, ?)`,
            [delivery.id, order.shipping_address, now, now]
          );
        }
      } else if (status === 'cancelled') {
        await tx.query(
          `UPDATE orders SET order_status = 'cancelled', updated_at = ? WHERE id = ?`,
          [now, orderId]
        );
        if (['pending', 'processing'].includes(order.order_status)) {
          for (const item of items) {
            await tx.query(
              `UPDATE book_inventories SET reserved_quantity = GREATEST(0, reserved_quantity - ?), updated_at = ? WHERE book_id = ?`,
              [item.quantity, now, item.book_id]
            );
          }
        }
      } else {
        await tx.query(`UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?`, [
          status,
          now,
          orderId,
        ]);
      }
    });

    const updatedRaw = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
    const [hydrated] = await hydrateOrders([updatedRaw]);

    return NextResponse.json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: hydrated,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Order status update error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật trạng thái đơn hàng' }, { status: 500 });
  }
}
