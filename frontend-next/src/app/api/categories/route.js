import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { parseRequestData } from '@/lib/helpers';

export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS books_count
       FROM categories c
       ORDER BY c.id ASC`
    );
    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        books_count: Number(c.books_count || 0),
      })),
    });
  } catch (err) {
    console.error('Categories GET error:', err);
    return NextResponse.json({ message: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const { name, description } = data;
    if (!name) {
      return NextResponse.json({ message: 'Tên danh mục là bắt buộc.' }, { status: 422 });
    }

    const slug =
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 6);

    const now = new Date();
    const result = await query(
      `INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description || null, now, now]
    );
    const category = await queryOne('SELECT * FROM categories WHERE id = ? LIMIT 1', [
      result.insertId,
    ]);

    return NextResponse.json(
      {
        message: 'Tạo danh mục thành công',
        category,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Categories POST error:', err);
    return NextResponse.json({ message: 'Lỗi tạo danh mục' }, { status: 500 });
  }
}
