import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hydrateBookById, parseRequestData, saveUploadedFile } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const book = await hydrateBookById(Number(id));
    if (!book) {
      return NextResponse.json({ message: 'Không tìm thấy sách' }, { status: 404 });
    }
    return NextResponse.json({ book });
  } catch (err) {
    console.error('Book GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải chi tiết sách' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const bookId = Number(id);
    const existing = await queryOne('SELECT * FROM books WHERE id = ? LIMIT 1', [bookId]);
    if (!existing) {
      return NextResponse.json({ message: 'Không tìm thấy sách' }, { status: 404 });
    }

    const { data, formData } = await parseRequestData(request);

    if (data.isbn && data.isbn !== existing.isbn) {
      const dup = await queryOne(
        'SELECT id FROM books WHERE isbn = ? AND id != ? LIMIT 1',
        [data.isbn, bookId]
      );
      if (dup) {
        return NextResponse.json(
          { message: 'Mã ISBN đã thuộc về sách khác!' },
          { status: 422 }
        );
      }
    }

    let coverPath = existing.cover_image;
    if (formData && formData.get('cover_image')) {
      const saved = await saveUploadedFile(formData.get('cover_image'), 'covers');
      if (saved) coverPath = saved;
    } else if (data.cover_url) {
      coverPath = data.cover_url;
    }

    const parseBool = (val, fallback) => {
      if (val === undefined || val === null) return fallback;
      if (val === true || val === 1 || val === '1' || val === 'true') return 1;
      return 0;
    };

    const now = new Date();
    await query(
      `UPDATE books
       SET title = ?, author = ?, category_id = ?, isbn = ?, publisher = ?, publish_year = ?,
           description = ?, cover_image = ?, is_borrowable = ?, is_salable = ?, sale_price = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.title ?? existing.title,
        data.author ?? existing.author,
        data.category_id ? Number(data.category_id) : existing.category_id,
        data.isbn ?? existing.isbn,
        data.publisher !== undefined ? data.publisher : existing.publisher,
        data.publish_year ? Number(data.publish_year) : existing.publish_year,
        data.description !== undefined ? data.description : existing.description,
        coverPath,
        parseBool(data.is_borrowable, existing.is_borrowable),
        parseBool(data.is_salable, existing.is_salable),
        data.sale_price !== undefined ? Number(data.sale_price) : existing.sale_price,
        now,
        bookId,
      ]
    );

    const addCopies = Math.max(0, Number(data.additional_copies || 0));
    if (addCopies > 0) {
      const countRow = await queryOne(
        'SELECT COUNT(*) AS cnt FROM book_copies WHERE book_id = ?',
        [bookId]
      );
      const currentCount = Number(countRow?.cnt || 0);
      for (let i = 1; i <= addCopies; i++) {
        const barcode = `BC-${bookId}-${String(currentCount + i).padStart(3, '0')}`;
        await query(
          `INSERT INTO book_copies (book_id, barcode, \`condition\`, status, created_at, updated_at)
           VALUES (?, ?, 'new', 'available', ?, ?)`,
          [bookId, barcode, now, now]
        );
      }
      await query('UPDATE books SET is_borrowable = 1 WHERE id = ?', [bookId]);
    }

    const addStock = Math.max(0, Number(data.add_sale_stock || 0));
    if (addStock > 0) {
      const inv = await queryOne(
        'SELECT * FROM book_inventories WHERE book_id = ? LIMIT 1',
        [bookId]
      );
      if (inv) {
        await query(
          'UPDATE book_inventories SET stock_quantity = stock_quantity + ?, updated_at = ? WHERE id = ?',
          [addStock, now, inv.id]
        );
      } else {
        await query(
          `INSERT INTO book_inventories (book_id, stock_quantity, reserved_quantity, created_at, updated_at)
           VALUES (?, ?, 0, ?, ?)`,
          [bookId, addStock, now, now]
        );
      }
      await query('UPDATE books SET is_salable = 1 WHERE id = ?', [bookId]);
    }

    const book = await hydrateBookById(bookId);

    return NextResponse.json({
      message: 'Cập nhật thông tin sách thành công',
      book,
    });
  } catch (err) {
    console.error('Book UPDATE error:', err);
    return NextResponse.json({ message: 'Lỗi cập nhật sách' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const bookId = Number(id);

    const hasBorrows = await queryOne(
      `SELECT bi.id FROM borrow_items bi
       JOIN book_copies bc ON bi.book_copy_id = bc.id
       WHERE bc.book_id = ? LIMIT 1`,
      [bookId]
    );
    const hasOrders = await queryOne(
      'SELECT id FROM order_items WHERE book_id = ? LIMIT 1',
      [bookId]
    );

    if (hasBorrows || hasOrders) {
      return NextResponse.json(
        {
          message:
            'Không thể xoá đầu sách này vì đã có giao dịch mượn/bán trong lịch sử!',
        },
        { status: 422 }
      );
    }

    await query('DELETE FROM book_copies WHERE book_id = ?', [bookId]);
    await query('DELETE FROM book_inventories WHERE book_id = ?', [bookId]);
    await query('DELETE FROM books WHERE id = ?', [bookId]);

    return NextResponse.json({ message: 'Đã xoá sách khỏi hệ thống thành công!' });
  } catch (err) {
    console.error('Book DELETE error:', err);
    return NextResponse.json({ message: 'Lỗi xoá sách' }, { status: 500 });
  }
}
