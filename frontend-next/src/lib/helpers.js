import fs from 'fs/promises';
import path from 'path';
import { query, queryOne } from './db';
import { formatBookCover, formatUser } from './auth';

export async function parseRequestData(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return { data, formData, isMultipart: true };
  }
  try {
    const data = await request.json();
    return { data: data || {}, formData: null, isMultipart: false };
  } catch {
    return { data: {}, formData: null, isMultipart: false };
  }
}

export async function saveUploadedFile(file, folder = 'covers') {
  if (!file || typeof file === 'string' || !file.arrayBuffer) return null;
  const bytes = await file.arrayBuffer();
  if (!bytes || bytes.byteLength === 0) return null;

  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name || '.jpg') || '.jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const targetDir = path.join(process.cwd(), 'public', 'storage', folder);
  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, filename);
  await fs.writeFile(targetPath, buffer);
  return `/storage/${folder}/${filename}`;
}

export async function hydrateBooks(books) {
  if (!books || books.length === 0) return [];
  const bookIds = books.map((b) => b.id);
  const placeholders = bookIds.map(() => '?').join(',');

  const [categories, inventories, copies] = await Promise.all([
    query(`SELECT * FROM categories`),
    query(`SELECT * FROM book_inventories WHERE book_id IN (${placeholders})`, bookIds),
    query(`SELECT * FROM book_copies WHERE book_id IN (${placeholders})`, bookIds),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const invMap = Object.fromEntries(inventories.map((i) => [i.book_id, i]));
  const copiesMap = {};
  for (const c of copies) {
    if (!copiesMap[c.book_id]) copiesMap[c.book_id] = [];
    copiesMap[c.book_id].push(c);
  }

  return books.map((b) => {
    const bookCopies = copiesMap[b.id] || [];
    const inv = invMap[b.id] || null;
    const availableCopiesCount = bookCopies.filter((c) => c.status === 'available').length;
    const availableStockCount = inv
      ? Math.max(0, Number(inv.stock_quantity || 0) - Number(inv.reserved_quantity || 0))
      : 0;

    return {
      ...b,
      is_borrowable: Boolean(b.is_borrowable),
      is_salable: Boolean(b.is_salable),
      sale_price: Number(b.sale_price || 0),
      cover_image: formatBookCover(b.cover_image),
      category: catMap[b.category_id] || null,
      inventory: inv,
      copies: bookCopies,
      available_copies_count: availableCopiesCount,
      available_stock_count: availableStockCount,
    };
  });
}

export async function hydrateBookById(id) {
  const book = await queryOne('SELECT * FROM books WHERE id = ? LIMIT 1', [id]);
  if (!book) return null;
  const [hydrated] = await hydrateBooks([book]);
  return hydrated;
}

export async function hydrateBorrowTickets(tickets) {
  if (!tickets || tickets.length === 0) return [];
  const ticketIds = tickets.map((t) => t.id);
  const placeholders = ticketIds.map(() => '?').join(',');

  const items = await query(
    `SELECT * FROM borrow_items WHERE borrow_ticket_id IN (${placeholders})`,
    ticketIds
  );

  const copyIds = [...new Set(items.map((i) => i.book_copy_id).filter(Boolean))];
  let copiesMap = {};
  let booksMap = {};

  if (copyIds.length > 0) {
    const copyPlaceholders = copyIds.map(() => '?').join(',');
    const copies = await query(
      `SELECT * FROM book_copies WHERE id IN (${copyPlaceholders})`,
      copyIds
    );
    copiesMap = Object.fromEntries(copies.map((c) => [c.id, c]));

    const bookIds = [...new Set(copies.map((c) => c.book_id).filter(Boolean))];
    if (bookIds.length > 0) {
      const bookPlaceholders = bookIds.map(() => '?').join(',');
      const rawBooks = await query(
        `SELECT * FROM books WHERE id IN (${bookPlaceholders})`,
        bookIds
      );
      const hydratedBooks = await hydrateBooks(rawBooks);
      booksMap = Object.fromEntries(hydratedBooks.map((b) => [b.id, b]));
    }
  }

  const userIds = [
    ...new Set(
      tickets.flatMap((t) => [t.reader_id, t.librarian_id]).filter(Boolean)
    ),
  ];
  let usersMap = {};
  if (userIds.length > 0) {
    const userPlaceholders = userIds.map(() => '?').join(',');
    const users = await query(
      `SELECT * FROM users WHERE id IN (${userPlaceholders})`,
      userIds
    );
    usersMap = Object.fromEntries(users.map((u) => [u.id, formatUser(u)]));
  }

  const itemsByTicket = {};
  for (const item of items) {
    if (!itemsByTicket[item.borrow_ticket_id]) {
      itemsByTicket[item.borrow_ticket_id] = [];
    }
    const copy = copiesMap[item.book_copy_id] || null;
    const copyWithBook = copy
      ? { ...copy, book: booksMap[copy.book_id] || null }
      : null;

    itemsByTicket[item.borrow_ticket_id].push({
      ...item,
      late_fee: Number(item.late_fee || 0),
      book_copy: copyWithBook,
      bookCopy: copyWithBook,
    });
  }

  return tickets.map((t) => ({
    ...t,
    ticket_code: t.ticket_code || `BT-${String(t.id).padStart(4, '0')}`,
    return_date: t.returned_date || t.return_date || null,
    total_late_fee: Number(t.total_late_fee || 0),
    renewed_count: Number(t.renewed_count || 0),
    reader: usersMap[t.reader_id] || null,
    librarian: t.librarian_id ? usersMap[t.librarian_id] || null : null,
    items: itemsByTicket[t.id] || [],
  }));
}

export async function hydrateOrders(orders) {
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => '?').join(',');

  const [items, deliveries] = await Promise.all([
    query(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds),
    query(`SELECT * FROM deliveries WHERE order_id IN (${placeholders})`, orderIds),
  ]);

  const bookIds = [...new Set(items.map((i) => i.book_id).filter(Boolean))];
  let booksMap = {};
  if (bookIds.length > 0) {
    const bookPlaceholders = bookIds.map(() => '?').join(',');
    const rawBooks = await query(
      `SELECT * FROM books WHERE id IN (${bookPlaceholders})`,
      bookIds
    );
    const hydratedBooks = await hydrateBooks(rawBooks);
    booksMap = Object.fromEntries(hydratedBooks.map((b) => [b.id, b]));
  }

  const deliveryIds = deliveries.map((d) => d.id);
  let historiesByDelivery = {};
  if (deliveryIds.length > 0) {
    const delPlaceholders = deliveryIds.map(() => '?').join(',');
    const histories = await query(
      `SELECT * FROM delivery_histories WHERE delivery_id IN (${delPlaceholders}) ORDER BY created_at DESC`,
      deliveryIds
    );
    for (const h of histories) {
      if (!historiesByDelivery[h.delivery_id]) historiesByDelivery[h.delivery_id] = [];
      historiesByDelivery[h.delivery_id].push({
        ...h,
        status_title: h.status_title || h.status,
        description: h.description || h.note,
      });
    }
  }

  const readerIds = [...new Set(orders.map((o) => o.reader_id).filter(Boolean))];
  let usersMap = {};
  if (readerIds.length > 0) {
    const userPlaceholders = readerIds.map(() => '?').join(',');
    const users = await query(
      `SELECT * FROM users WHERE id IN (${userPlaceholders})`,
      readerIds
    );
    usersMap = Object.fromEntries(users.map((u) => [u.id, formatUser(u)]));
  }

  const itemsByOrder = {};
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push({
      ...item,
      unit_price: Number(item.unit_price || 0),
      subtotal: Number(item.subtotal || 0),
      total_price: Number(item.subtotal || item.total_price || 0),
      book: booksMap[item.book_id] || null,
    });
  }

  const deliveryByOrder = {};
  for (const d of deliveries) {
    deliveryByOrder[d.order_id] = {
      ...d,
      shipping_provider: d.carrier || d.shipping_provider || 'ViettelPost',
      histories: historiesByDelivery[d.id] || [],
    };
  }

  return orders.map((o) => ({
    ...o,
    order_code: o.order_number || o.order_code,
    customer_name: o.recipient_name || o.customer_name,
    customer_phone: o.recipient_phone || o.customer_phone,
    total_amount: Number(o.total_amount || 0),
    shipping_fee: Number(o.shipping_fee || 0),
    final_amount: Number(o.total_amount || 0),
    reader: o.reader_id ? usersMap[o.reader_id] || null : null,
    items: itemsByOrder[o.id] || [],
    delivery: deliveryByOrder[o.id] || null,
  }));
}
