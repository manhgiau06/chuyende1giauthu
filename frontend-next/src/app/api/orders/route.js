import { NextResponse } from 'next/server';
import { query, queryOne, getSystemConfig, withTransaction, HttpError } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { hydrateOrders, parseRequestData } from '@/lib/helpers';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const perPage = Math.max(1, Number(searchParams.get('per_page') || 15));
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const offset = (page - 1) * perPage;

    const conditions = [];
    const params = [];

    if (user.role === 'reader') {
      conditions.push('reader_id = ?');
      params.push(user.id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM orders ${whereClause}`,
      params
    );
    const total = Number(countRow?.total || 0);

    const rawOrders = await query(
      `SELECT * FROM orders ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const data = await hydrateOrders(rawOrders);

    return NextResponse.json({
      current_page: page,
      data,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      total,
    });
  } catch (err) {
    console.error('Orders GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải đơn hàng' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
    }

    const { data } = await parseRequestData(request);
    const recipientName = data.recipient_name || data.customer_name || user.name;
    const recipientPhone = data.recipient_phone || data.customer_phone || user.phone || '';
    const shippingAddress = data.shipping_address || user.address || '';
    const items = Array.isArray(data.items) ? data.items : [];
    const notes = data.notes || data.note || null;

    if (!recipientName || !recipientPhone || !shippingAddress || items.length === 0) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ thông tin giao hàng và sản phẩm.' },
        { status: 422 }
      );
    }

    const bookIds = [...new Set(items.map((i) => Number(i.book_id)).filter(Boolean))];
    if (bookIds.length === 0) {
      return NextResponse.json(
        { message: 'Danh sách sản phẩm không hợp lệ.' },
        { status: 422 }
      );
    }

    const defaultShipFee = Number((await getSystemConfig('shipping_fee', 30000)) || 30000);

    const orderId = await withTransaction(async (tx) => {
      const placeholders = bookIds.map(() => '?').join(',');
      const rawBooks = await tx.query(
        `SELECT * FROM books WHERE id IN (${placeholders})`,
        bookIds
      );
      const inventories = await tx.query(
        `SELECT * FROM book_inventories WHERE book_id IN (${placeholders}) FOR UPDATE`,
        bookIds
      );

      const bookMap = Object.fromEntries(rawBooks.map((b) => [b.id, b]));
      const invMap = Object.fromEntries(inventories.map((inv) => [inv.book_id, inv]));

      let subtotalAmount = 0;
      for (const item of items) {
        const bookId = Number(item.book_id);
        const book = bookMap[bookId];
        const inv = invMap[bookId];
        const qty = Math.max(1, Number(item.quantity || 1));
        const availableStock = inv
          ? Math.max(0, Number(inv.stock_quantity || 0) - Number(inv.reserved_quantity || 0))
          : 0;

        if (!book || !book.is_salable || availableStock < qty) {
          throw new HttpError(
            `Sách "${book?.title || bookId}" không đủ số lượng tồn kho (còn ${availableStock} cuốn).`,
            422
          );
        }
        subtotalAmount += Number(book.sale_price || 0) * qty;
      }

      const shippingFee = subtotalAmount >= 300000 ? 0 : defaultShipFee;
      const totalAmount = subtotalAmount + shippingFee;
      const now = new Date();
      const orderNumber = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const orderRes = await tx.query(
        `INSERT INTO orders (reader_id, order_number, total_amount, shipping_fee, payment_status, order_status, shipping_address, recipient_name, recipient_phone, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          orderNumber,
          totalAmount,
          shippingFee,
          shippingAddress,
          recipientName,
          recipientPhone,
          notes,
          now,
          now,
        ]
      );

      const newOrderId = orderRes.insertId;

      for (const item of items) {
        const book = bookMap[Number(item.book_id)];
        const qty = Math.max(1, Number(item.quantity || 1));
        const unitPrice = Number(book.sale_price || 0);
        await tx.query(
          `INSERT INTO order_items (order_id, book_id, quantity, unit_price, subtotal, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newOrderId, book.id, qty, unitPrice, unitPrice * qty, now, now]
        );
        await tx.query(
          `UPDATE book_inventories SET reserved_quantity = reserved_quantity + ?, updated_at = ? WHERE book_id = ?`,
          [qty, now, book.id]
        );
      }

      const trackingNumber = `VNP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const delRes = await tx.query(
        `INSERT INTO deliveries (order_id, tracking_number, carrier, status, created_at, updated_at)
         VALUES (?, ?, 'VNPost Express', 'pending', ?, ?)`,
        [newOrderId, trackingNumber, now, now]
      );

      await tx.query(
        `INSERT INTO delivery_histories (delivery_id, status, note, location, created_at, updated_at)
         VALUES (?, 'Đơn hàng đã được tạo', 'Hệ thống đang chuẩn bị sách để đóng gói', 'Kho trung tâm', ?, ?)`,
        [delRes.insertId, now, now]
      );

      return newOrderId;
    });

    const rawOrder = await queryOne('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
    const [hydrated] = await hydrateOrders([rawOrder]);

    return NextResponse.json(
      {
        message: 'Đặt mua sách thành công',
        order: hydrated,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Orders POST error:', err);
    return NextResponse.json({ message: 'Lỗi tạo đơn hàng' }, { status: 500 });
  }
}
