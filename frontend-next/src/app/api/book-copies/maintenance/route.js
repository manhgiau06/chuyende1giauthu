import { NextResponse } from 'next/server';
import { query, queryOne, withTransaction, HttpError } from '@/lib/db';
import { requireRole, formatBookCover } from '@/lib/auth';
import { parseRequestData } from '@/lib/helpers';

export async function GET(request) {
  try {
    const { errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const [copies, logs] = await Promise.all([
      query(`
        SELECT bc.*,
               b.title AS book_title,
               b.author AS book_author,
               b.isbn AS book_isbn,
               b.cover_image AS book_cover,
               c.name AS category_name,
               (SELECT COUNT(*) FROM borrow_items bi WHERE bi.book_copy_id = bc.id) AS borrow_count,
               (SELECT bml.cover_type FROM book_maintenance_logs bml WHERE bml.book_copy_id = bc.id ORDER BY bml.id DESC LIMIT 1) AS last_cover_type,
               (SELECT bml.action_type FROM book_maintenance_logs bml WHERE bml.book_copy_id = bc.id ORDER BY bml.id DESC LIMIT 1) AS last_action_type,
               (SELECT bml.completed_at FROM book_maintenance_logs bml WHERE bml.book_copy_id = bc.id AND bml.status = 'completed' ORDER BY bml.id DESC LIMIT 1) AS last_maintained_at
        FROM book_copies bc
        JOIN books b ON bc.book_id = b.id
        LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY
          CASE WHEN bc.status = 'maintenance' THEN 0
               WHEN bc.condition = 'fair' THEN 1
               ELSE 2 END ASC,
          bc.updated_at DESC,
          bc.id DESC
      `),
      query(`
        SELECT bml.*,
               bc.barcode,
               b.title AS book_title,
               b.cover_image AS book_cover,
               u.name AS librarian_name
        FROM book_maintenance_logs bml
        JOIN book_copies bc ON bml.book_copy_id = bc.id
        JOIN books b ON bml.book_id = b.id
        LEFT JOIN users u ON bml.librarian_id = u.id
        ORDER BY bml.id DESC
        LIMIT 60
      `),
    ]);

    const formattedCopies = copies.map((c) => {
      const borrowCount = Number(c.borrow_count || 0);
      const needsRecover =
        c.status !== 'borrowed' &&
        (c.condition === 'fair' || (c.condition !== 'new' && borrowCount >= 1));

      return {
        ...c,
        book_cover: formatBookCover(c.book_cover),
        borrow_count: borrowCount,
        needs_recover: Boolean(needsRecover),
      };
    });

    const formattedLogs = logs.map((l) => ({
      ...l,
      cost: Number(l.cost || 0),
      book_cover: formatBookCover(l.book_cover),
    }));

    const summary = {
      total_copies: formattedCopies.length,
      in_maintenance_count: formattedCopies.filter((c) => c.status === 'maintenance').length,
      needs_recover_count: formattedCopies.filter((c) => c.needs_recover && c.status !== 'maintenance').length,
      newly_covered_count: formattedCopies.filter((c) => c.condition === 'new').length,
      completed_logs_count: formattedLogs.filter((l) => l.status === 'completed').length,
      total_cost: formattedLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0),
    };

    return NextResponse.json({
      copies: formattedCopies,
      logs: formattedLogs,
      summary,
    });
  } catch (err) {
    console.error('Maintenance GET error:', err);
    return NextResponse.json(
      { message: 'Lỗi tải dữ liệu bảo quản & bao bìa sách' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireRole(request, ['admin', 'librarian']);
    if (errorResponse) return errorResponse;

    const { data } = await parseRequestData(request);
    const {
      action = 'instant_recover', // 'instant_recover' | 'send_to_maintenance' | 'complete_maintenance' | 'mark_condition'
      book_copy_id,
      book_copy_ids,
      action_type = 'recover_cover',
      cover_type = 'plastic_glossy',
      condition_after = 'new',
      condition = 'fair',
      cost = 5000,
      notes = '',
    } = data;

    const targetIds = Array.isArray(book_copy_ids)
      ? book_copy_ids.map(Number).filter(Boolean)
      : book_copy_id
      ? [Number(book_copy_id)]
      : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { message: 'Vui lòng chọn ít nhất 01 bản sao sách (Barcode) để thực hiện!' },
        { status: 422 }
      );
    }

    const now = new Date();
    const unitCost = Math.max(0, Number(cost ?? 5000));

    const processedCount = await withTransaction(async (tx) => {
      const placeholders = targetIds.map(() => '?').join(',');
      const copies = await tx.query(
        `SELECT * FROM book_copies WHERE id IN (${placeholders}) FOR UPDATE`,
        targetIds
      );

      if (copies.length === 0) {
        throw new HttpError('Không tìm thấy bản sao sách được chọn!', 404);
      }

      const borrowedCopy = copies.find((c) => c.status === 'borrowed');
      if (borrowedCopy && action !== 'mark_condition') {
        throw new HttpError(
          `Bản sao ${borrowedCopy.barcode} đang được độc giả mượn nên chưa thể bao bìa/bảo quản!`,
          422
        );
      }

      let count = 0;

      for (const copy of copies) {
        if (action === 'send_to_maintenance') {
          await tx.query(
            `UPDATE book_copies SET status = 'maintenance', updated_at = ? WHERE id = ?`,
            [now, copy.id]
          );
          await tx.query(
            `INSERT INTO book_maintenance_logs
             (book_copy_id, book_id, librarian_id, action_type, cover_type, condition_before, condition_after, cost, notes, status, started_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?, ?)`,
            [
              copy.id,
              copy.book_id,
              user.id,
              action_type,
              cover_type,
              copy.condition || 'good',
              condition_after || 'new',
              unitCost,
              notes || 'Đưa sách vào khu vực bao bìa & bảo quản',
              now,
              now,
              now,
            ]
          );
          count++;
        } else if (action === 'complete_maintenance') {
          const finalCondition = ['new', 'good', 'fair'].includes(condition_after)
            ? condition_after
            : 'new';
          await tx.query(
            `UPDATE book_copies SET status = 'available', \`condition\` = ?, updated_at = ? WHERE id = ?`,
            [finalCondition, now, copy.id]
          );

          const openLog = await tx.queryOne(
            `SELECT id FROM book_maintenance_logs WHERE book_copy_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1`,
            [copy.id]
          );
          if (openLog) {
            await tx.query(
              `UPDATE book_maintenance_logs
               SET status = 'completed', condition_after = ?, completed_at = ?, updated_at = ?
               WHERE id = ?`,
              [finalCondition, now, now, openLog.id]
            );
          } else {
            await tx.query(
              `INSERT INTO book_maintenance_logs
               (book_copy_id, book_id, librarian_id, action_type, cover_type, condition_before, condition_after, cost, notes, status, started_at, completed_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)`,
              [
                copy.id,
                copy.book_id,
                user.id,
                action_type,
                cover_type,
                copy.condition || 'good',
                finalCondition,
                unitCost,
                notes || 'Hoàn tất bao bìa & đưa sách lên kệ mượn',
                now,
                now,
                now,
                now,
              ]
            );
          }
          count++;
        } else if (action === 'instant_recover') {
          const finalCondition = ['new', 'good', 'fair'].includes(condition_after)
            ? condition_after
            : 'new';
          await tx.query(
            `UPDATE book_copies SET status = 'available', \`condition\` = ?, updated_at = ? WHERE id = ?`,
            [finalCondition, now, copy.id]
          );
          await tx.query(
            `UPDATE book_maintenance_logs SET status = 'completed', completed_at = ?, updated_at = ?
             WHERE book_copy_id = ? AND status = 'in_progress'`,
            [now, now, copy.id]
          );
          await tx.query(
            `INSERT INTO book_maintenance_logs
             (book_copy_id, book_id, librarian_id, action_type, cover_type, condition_before, condition_after, cost, notes, status, started_at, completed_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)`,
            [
              copy.id,
              copy.book_id,
              user.id,
              action_type || 'recover_cover',
              cover_type || 'plastic_glossy',
              copy.condition || 'good',
              finalCondition,
              unitCost,
              notes || 'Bao bìa mới trực tiếp & kiểm tra chất lượng sách hoàn tất',
              now,
              now,
              now,
              now,
            ]
          );
          count++;
        } else if (action === 'mark_condition') {
          const targetCond = ['new', 'good', 'fair'].includes(condition) ? condition : 'fair';
          await tx.query(
            `UPDATE book_copies SET \`condition\` = ?, updated_at = ? WHERE id = ?`,
            [targetCond, now, copy.id]
          );
          count++;
        }
      }

      return count;
    });

    const actionMessages = {
      send_to_maintenance: `Đã chuyển ${processedCount} bản sao sách vào khu vực Bao bìa & Bảo quản!`,
      complete_maintenance: `Đã hoàn tất bao bìa ${processedCount} bản sao sách và đưa trở lại kệ sẵn sàng mượn!`,
      instant_recover: `Đã bao bìa mới & nâng cấp chất lượng cho ${processedCount} bản sao sách thành công!`,
      mark_condition: `Đã cập nhật tình trạng vật lý cho ${processedCount} bản sao sách!`,
    };

    return NextResponse.json({
      message: actionMessages[action] || 'Cập nhật bảo quản sách thành công!',
      processed_count: processedCount,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error('Maintenance POST error:', err);
    return NextResponse.json(
      { message: 'Lỗi xử lý nghiệp vụ bảo quản & bao bìa sách' },
      { status: 500 }
    );
  }
}
