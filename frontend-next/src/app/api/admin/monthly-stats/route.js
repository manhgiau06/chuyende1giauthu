import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const { errorResponse } = await requireRole(request, ['admin']);
    if (errorResponse) return errorResponse;

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `T${String(month).padStart(2, '0')}/${year}`;

      const borrowsRow = await queryOne(
        'SELECT COUNT(*) AS cnt FROM borrow_tickets WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?',
        [year, month]
      );
      const ordersRow = await queryOne(
        'SELECT COUNT(*) AS cnt FROM orders WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?',
        [year, month]
      );
      const revOrderRow = await queryOne(
        `SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND order_status != 'cancelled'`,
        [year, month]
      );
      const revFeeRow = await queryOne(
        `SELECT COALESCE(SUM(total_late_fee), 0) AS total FROM borrow_tickets
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
        [year, month]
      );

      months.push({
        label,
        borrows: Number(borrowsRow?.cnt || 0),
        orders: Number(ordersRow?.cnt || 0),
        revenue: Number(revOrderRow?.total || 0) + Number(revFeeRow?.total || 0),
      });
    }

    const totalRevenueRow = await queryOne(
      `SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != 'cancelled'`
    );
    const totalBorrowsRow = await queryOne(`SELECT COUNT(*) AS cnt FROM borrow_tickets`);
    const unpaidReaders = await query(
      `SELECT u.name AS reader_name, u.email AS reader_email,
              COUNT(bt.id) AS tickets_count,
              COALESCE(SUM(bt.total_late_fee), 0) AS total_debt
       FROM borrow_tickets bt
       JOIN users u ON bt.reader_id = u.id
       WHERE bt.total_late_fee > 0
       GROUP BY u.id, u.name, u.email
       ORDER BY total_debt DESC`
    );

    return NextResponse.json({
      monthly_stats: months,
      sales_revenue: Number(totalRevenueRow?.total || 0),
      borrow_tickets_count: Number(totalBorrowsRow?.cnt || 0),
      unpaid_late_fee_readers: unpaidReaders.map((r) => ({
        ...r,
        tickets_count: Number(r.tickets_count || 0),
        total_debt: Number(r.total_debt || 0),
      })),
    });
  } catch (err) {
    console.error('Monthly stats error:', err);
    return NextResponse.json({ message: 'Lỗi tải thống kê tháng' }, { status: 500 });
  }
}
