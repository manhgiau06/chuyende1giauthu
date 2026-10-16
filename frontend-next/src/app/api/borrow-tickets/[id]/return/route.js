import { NextResponse } from 'next/server';
import { query, queryOne, getSystemConfig } from '@/lib/db';
import { hydrateBorrowTickets } from '@/lib/helpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const ticketId = Number(id);

    const ticket = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    if (!ticket) {
      return NextResponse.json({ message: 'Không tìm thấy phiếu mượn' }, { status: 404 });
    }
    if (ticket.status === 'returned') {
      return NextResponse.json(
        { message: 'Phiếu mượn này đã được hoàn trả trước đó.' },
        { status: 422 }
      );
    }

    const now = new Date();
    const dueDate = new Date(ticket.due_date);
    let lateDays = 0;
    if (now > dueDate) {
      lateDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const lateFeePerDay = Number((await getSystemConfig('late_fee_per_day', 5000)) || 5000);
    const items = await query('SELECT * FROM borrow_items WHERE borrow_ticket_id = ?', [
      ticketId,
    ]);

    let totalLateFee = 0;

    for (const item of items) {
      if (item.status === 'borrowed') {
        const fee = lateDays * lateFeePerDay;
        totalLateFee += fee;

        await query(
          `UPDATE borrow_items SET status = 'returned', returned_at = ?, late_fee = ?, updated_at = ? WHERE id = ?`,
          [now, fee, now, item.id]
        );

        await query(
          `UPDATE book_copies SET status = 'available', updated_at = ? WHERE id = ?`,
          [now, item.book_copy_id]
        );

        const copy = await queryOne('SELECT * FROM book_copies WHERE id = ? LIMIT 1', [
          item.book_copy_id,
        ]);
        if (copy) {
          const nextReservation = await queryOne(
            `SELECT * FROM book_reservations WHERE book_id = ? AND status = 'pending' ORDER BY created_at ASC LIMIT 1`,
            [copy.book_id]
          );
          if (nextReservation) {
            const expDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
            await query(
              `UPDATE book_reservations SET status = 'notified', notified_at = ?, expires_at = ?, updated_at = ? WHERE id = ?`,
              [now, expDate, now, nextReservation.id]
            );
            const book = await queryOne('SELECT title FROM books WHERE id = ? LIMIT 1', [
              copy.book_id,
            ]);
            const reader = await queryOne('SELECT name FROM users WHERE id = ? LIMIT 1', [
              nextReservation.reader_id,
            ]);
            await query(
              `INSERT INTO email_logs (reader_id, type, subject, content, created_at, updated_at)
               VALUES (?, 'reservation', ?, ?, ?, ?)`,
              [
                nextReservation.reader_id,
                `🎉 [Thư Viện] Sách bạn đặt trước "${book?.title || ''}" đã có sẵn!`,
                `Chào ${reader?.name || 'Độc giả'},\n\nCuốn sách "${book?.title || ''}" bạn đăng ký trong danh sách chờ vừa được hoàn trả về kệ.\nHệ thống đang ưu tiên giữ sách cho bạn đến ngày ${expDate.toLocaleDateString('vi-VN')}.\nHãy vào website đặt mượn ngay nhé!`,
                now,
                now,
              ]
            );
          }
        }
      }
    }

    await query(
      `UPDATE borrow_tickets SET returned_date = ?, status = 'returned', total_late_fee = ?, updated_at = ? WHERE id = ?`,
      [now, totalLateFee, now, ticketId]
    );

    const updatedRaw = await queryOne('SELECT * FROM borrow_tickets WHERE id = ? LIMIT 1', [
      ticketId,
    ]);
    const [hydrated] = await hydrateBorrowTickets([updatedRaw]);

    return NextResponse.json({
      message: 'Trả sách thành công',
      ticket: hydrated,
    });
  } catch (err) {
    console.error('Return borrow ticket error:', err);
    return NextResponse.json({ message: 'Lỗi trả sách' }, { status: 500 });
  }
}
