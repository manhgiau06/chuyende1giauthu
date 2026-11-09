import { NextResponse } from 'next/server';
import { query, queryOne, withTransaction, HttpError } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { parseRequestData, hydrateBooks } from '@/lib/helpers';

export async function GET(request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const isStaff = user.role === 'admin' || user.role === 'librarian';

    const rows = isStaff
      ? await query(`
          SELECT r.*,
                 u.name AS reader_name,
                 u.email AS reader_email,
                 u.phone AS reader_phone,
                 l.name AS librarian_name
          FROM book_find_requests r
          JOIN users u ON r.reader_id = u.id
          LEFT JOIN users l ON r.librarian_id = l.id
          ORDER BY
            CASE WHEN r.status = 'pending' THEN 0
                 WHEN r.status = 'searching' THEN 1
                 WHEN r.status = 'found' THEN 2
                 ELSE 3 END ASC,
            r.id DESC
        `)
      : await query(
          `SELECT r.*,
                  l.name AS librarian_name
           FROM book_find_requests r
           LEFT JOIN users l ON r.librarian_id = l.id
           WHERE r.reader_id = ?
           ORDER BY r.id DESC`,
          [user.id]
        );

    const matchedBookIds = [...new Set(rows.map((r) => r.matched_book_id).filter(Boolean))];
    let booksMap = {};
    if (matchedBookIds.length > 0) {
      const placeholders = matchedBookIds.map(() => '?').join(',');
      const rawBooks = await query(
        `SELECT * FROM books WHERE id IN (${placeholders})`,
        matchedBookIds
      );
      const hydrated = await hydrateBooks(rawBooks);
      booksMap = Object.fromEntries(hydrated.map((b) => [b.id, b]));
    }

    const requests = rows.map((r) => ({
      ...r,
      matched_book: r.matched_book_id ? booksMap[r.matched_book_id] || null : null,
    }));

    const pendingCount = requests.filter(
      (r) => r.status === 'pending' || r.status === 'searching'
    ).length;

    return NextResponse.json({
      requests,
      pending_count: pendingCount,
    });
  } catch (err) {
    console.error('Book find requests GET error:', err);
    return NextResponse.json(
      { message: 'Lỗi tải danh sách yêu cầu tìm sách' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { data } = await parseRequestData(request);
    const {
      book_title,
      author_or_publisher = '',
      purpose = 'both',
      description = '',
      contact_phone = '',
    } = data;

    if (!book_title || !String(book_title).trim()) {
      return NextResponse.json(
        { message: 'Vui lòng nhập tên sách hoặc chủ đề bạn muốn nhờ Thủ thư tìm!' },
        { status: 422 }
      );
    }

    const validPurpose = ['borrow', 'buy', 'both'].includes(purpose) ? purpose : 'both';
    const now = new Date();

    const result = await query(
      `INSERT INTO book_find_requests
       (reader_id, book_title, author_or_publisher, purpose, description, contact_phone, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        user.id,
        String(book_title).trim(),
        author_or_publisher ? String(author_or_publisher).trim() : null,
        validPurpose,
        description ? String(description).trim() : null,
        contact_phone ? String(contact_phone).trim() : user.phone || null,
        now,
        now,
      ]
    );

    const created = await queryOne(
      'SELECT * FROM book_find_requests WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return NextResponse.json(
      {
        message:
          'Đã gửi yêu cầu nhờ Thủ thư tìm sách thành công! Khi có sách, Thủ thư sẽ gửi thông báo ngay cho bạn.',
        request: created,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Book find requests POST error:', err);
    return NextResponse.json(
      { message: 'Lỗi khi gửi yêu cầu nhờ tìm sách' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const { data } = await parseRequestData(request);
    const {
      id,
      status = 'found', // 'searching' | 'found' | 'unavailable'
      matched_book_id = null,
      librarian_note = '',
    } = data;

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID yêu cầu tìm sách!' }, { status: 422 });
    }

    const validStatus = ['pending', 'searching', 'found', 'unavailable'].includes(status)
      ? status
      : 'found';

    const now = new Date();

    await withTransaction(async (tx) => {
      const reqRow = await tx.queryOne(
        'SELECT * FROM book_find_requests WHERE id = ? LIMIT 1 FOR UPDATE',
        [Number(id)]
      );
      if (!reqRow) {
        throw new HttpError('Không tìm thấy yêu cầu tìm sách này!', 404);
      }

      const reader = await tx.queryOne('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [
        reqRow.reader_id,
      ]);

      let matchedBook = null;
      if (matched_book_id) {
        matchedBook = await tx.queryOne('SELECT * FROM books WHERE id = ? LIMIT 1', [
          Number(matched_book_id),
        ]);
      }

      const defaultNote =
        validStatus === 'found'
          ? `Tin vui! Thủ thư đã tìm thấy cuốn sách "${matchedBook?.title || reqRow.book_title}" cho bạn. Sách hiện đã có sẵn tại Thư viện, mời bạn đặt mượn/mua trực tuyến hoặc ghé quầy nhận sách nhé!`
          : validStatus === 'searching'
          ? `Thủ thư ${user.name} đã tiếp nhận yêu cầu và đang tìm kiếm nguồn sách "${reqRow.book_title}" giúp bạn.`
          : `Thư viện đã tìm kiếm nhiều nguồn nhưng hiện tại cuốn "${reqRow.book_title}" đang tạm hết hoặc chưa phát hành lại. Khi nào có đợt nhập mới, Thủ thư sẽ báo ngay cho bạn nhé!`;

      const finalNote = librarian_note && String(librarian_note).trim()
        ? String(librarian_note).trim()
        : defaultNote;

      await tx.query(
        `UPDATE book_find_requests
         SET status = ?,
             matched_book_id = ?,
             librarian_id = ?,
             librarian_note = ?,
             notified_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [
          validStatus,
          matchedBook ? matchedBook.id : reqRow.matched_book_id || null,
          user.id,
          finalNote,
          now,
          now,
          reqRow.id,
        ]
      );

      // Tự động gửi thông báo vào Hộp thư Thông báo (email_logs) cho khách hàng
      const emailSubject =
        validStatus === 'found'
          ? `🎉 [Thủ Thư Báo Có Sách] Đã tìm thấy sách "${matchedBook?.title || reqRow.book_title}" bạn yêu cầu!`
          : validStatus === 'searching'
          ? `🔎 [Thư Viện] Thủ thư đang tìm sách "${reqRow.book_title}" giúp bạn`
          : `📢 [Thư Viện] Phản hồi kết quả tìm sách "${reqRow.book_title}"`;

      let emailBody = `Chào ${reader?.name || 'Độc giả'},\n\n`;
      emailBody += `Phản hồi từ Thủ thư (${user.name}) về yêu cầu tìm sách "${reqRow.book_title}":\n`;
      emailBody += `👉 "${finalNote}"\n`;

      if (matchedBook) {
        emailBody += `\n📚 Thông tin sách đã có tại kho Thư viện:\n`;
        emailBody += `- Tên sách: ${matchedBook.title}\n`;
        emailBody += `- Tác giả: ${matchedBook.author || 'Đang cập nhật'}\n`;
        emailBody += `- Giá mua mới: ${new Intl.NumberFormat('vi-VN').format(matchedBook.sale_price || 0)} VNĐ\n`;
        emailBody += `\nBạn có thể mở mục "Nhờ Tìm Sách" hoặc tra cứu trực tiếp trên Trang chủ để đặt mượn / mua ngay hôm nay!`;
      }

      await tx.query(
        `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          reqRow.reader_id,
          validStatus === 'found' ? 'book_found' : 'announcement',
          emailSubject,
          emailBody,
          now,
          now,
        ]
      );
    });

    const msgMap = {
      found: '🎉 Đã gửi thông báo CÓ SÁCH đến hộp thư của khách hàng thành công!',
      searching: '🔎 Đã cập nhật trạng thái ĐANG TÌM SÁCH và báo cho khách hàng!',
      unavailable: 'Đã phản hồi tình trạng nguồn sách cho khách hàng.',
    };

    return NextResponse.json({
      message: msgMap[validStatus] || 'Đã cập nhật yêu cầu tìm sách và thông báo cho khách!',
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Book find requests PUT error:', err);
    return NextResponse.json(
      { message: 'Lỗi cập nhật và gửi thông báo tìm sách' },
      { status: 500 }
    );
  }
}
