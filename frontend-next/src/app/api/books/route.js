import { NextResponse } from 'next/server';
import { query, queryOne, withTransaction } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { hydrateBooks, hydrateBookById, parseRequestData, saveUploadedFile } from '@/lib/helpers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('category_id') || '';
    const availability = searchParams.get('availability') || '';
    const sort = searchParams.get('sort') || 'newest';
    const perPage = Math.max(1, Number(searchParams.get('per_page') || 15));
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const offset = (page - 1) * perPage;

    const conditions = [];
    const params = [];

    if (keyword.trim()) {
      conditions.push(`(title LIKE ? OR author LIKE ? OR isbn LIKE ? OR publisher LIKE ?)`);
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, kw, kw);
    }

    if (categoryId) {
      conditions.push(`category_id = ?`);
      params.push(Number(categoryId));
    }

    if (availability === 'borrowable') {
      conditions.push(
        `EXISTS (SELECT 1 FROM book_copies bc WHERE bc.book_id = books.id AND bc.status = 'available')`
      );
    } else if (availability === 'salable') {
      conditions.push(
        `is_salable = 1 AND EXISTS (SELECT 1 FROM book_inventories bi WHERE bi.book_id = books.id AND (bi.stock_quantity - bi.reserved_quantity) > 0)`
      );
    }

    let orderBy = 'id DESC';
    if (sort === 'price_asc') orderBy = 'sale_price ASC, id DESC';
    else if (sort === 'price_desc') orderBy = 'sale_price DESC, id DESC';
    else if (sort === 'year_desc') orderBy = 'COALESCE(publish_year, 0) DESC, id DESC';
    else if (sort === 'title_asc') orderBy = 'title ASC, id DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM books ${whereClause}`,
      params
    );
    const total = Number(countRow?.total || 0);

    const rawBooks = await query(
      `SELECT * FROM books ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const data = await hydrateBooks(rawBooks);
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return NextResponse.json({
      current_page: page,
      data,
      last_page: lastPage,
      per_page: perPage,
      total,
    });
  } catch (err) {
    console.error('Books GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh sách sách' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const { data, formData } = await parseRequestData(request);
    const {
      title,
      author,
      category_id,
      isbn,
      publisher,
      publish_year,
      description,
      cover_url,
      sale_price,
      borrow_copies_count,
      sale_stock_count,
    } = data;

    if (!title || !author || !category_id || !isbn) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ Tên sách, Tác giả, Danh mục và ISBN.' },
        { status: 422 }
      );
    }

    const existingIsbn = await queryOne('SELECT id FROM books WHERE isbn = ? LIMIT 1', [isbn]);
    if (existingIsbn) {
      return NextResponse.json(
        { message: 'Mã ISBN này đã tồn tại trong hệ thống!' },
        { status: 422 }
      );
    }

    let coverPath = cover_url || null;
    if (formData && formData.get('cover_image')) {
      const saved = await saveUploadedFile(formData.get('cover_image'), 'covers');
      if (saved) coverPath = saved;
    }

    const borrowCopies = Math.max(0, Number(borrow_copies_count || 0));
    const saleStock = Math.max(0, Number(sale_stock_count || 0));
    const isBorrowable = borrowCopies > 0 ? 1 : 0;
    const isSalable = saleStock > 0 ? 1 : 0;
    const now = new Date();

    const bookId = await withTransaction(async (tx) => {
      const result = await tx.query(
        `INSERT INTO books (title, author, category_id, isbn, publisher, publish_year, description, cover_image, is_borrowable, is_salable, sale_price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          author,
          Number(category_id),
          isbn,
          publisher || null,
          publish_year ? Number(publish_year) : null,
          description || null,
          coverPath,
          isBorrowable,
          isSalable,
          sale_price ? Number(sale_price) : 0,
          now,
          now,
        ]
      );

      const newBookId = result.insertId;

      if (borrowCopies > 0) {
        const copyValuesSql = [];
        const copyParams = [];
        for (let i = 1; i <= borrowCopies; i++) {
          const barcode = `BC-${newBookId}-${String(i).padStart(3, '0')}`;
          copyValuesSql.push(`(?, ?, 'new', 'available', ?, ?)`);
          copyParams.push(newBookId, barcode, now, now);
        }
        await tx.query(
          `INSERT INTO book_copies (book_id, barcode, \`condition\`, status, created_at, updated_at)
           VALUES ${copyValuesSql.join(', ')}`,
          copyParams
        );
      }

      await tx.query(
        `INSERT INTO book_inventories (book_id, stock_quantity, reserved_quantity, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?)`,
        [newBookId, saleStock, now, now]
      );

      return newBookId;
    });

    const book = await hydrateBookById(bookId);

    return NextResponse.json(
      {
        message: 'Thêm sách và nhập kho thành công',
        book,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Books POST error:', err);
    return NextResponse.json({ message: 'Lỗi khi thêm sách mới' }, { status: 500 });
  }
}
