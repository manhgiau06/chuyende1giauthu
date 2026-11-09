import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const { errorResponse } = await requireRole(request, ['admin']);
    if (errorResponse) return errorResponse;

    const now = new Date();
    const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      borrowsByMonth,
      ordersByMonth,
      lateFeesByMonth,
      totalRevenueRow,
      totalBorrowsRow,
      unpaidReaders,
    ] = await Promise.all([
      query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS cnt
         FROM borrow_tickets
         WHERE created_at >= ?
         GROUP BY ym`,
        [startWindow]
      ),
      query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
                COUNT(*) AS cnt,
                COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS revenue
         FROM orders
         WHERE created_at >= ?
         GROUP BY ym`,
        [startWindow]
      ),
      query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
                COALESCE(SUM(total_late_fee), 0) AS late_fee
         FROM borrow_tickets
         WHERE created_at >= ?
         GROUP BY ym`,
        [startWindow]
      ),
      queryOne(
        `SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != 'cancelled'`
      ),
      queryOne(`SELECT COUNT(*) AS cnt FROM borrow_tickets`),
      query(
        `SELECT u.name AS reader_name, u.email AS reader_email,
                COUNT(bt.id) AS tickets_count,
                COALESCE(SUM(bt.total_late_fee), 0) AS total_debt
         FROM borrow_tickets bt
         JOIN users u ON bt.reader_id = u.id
         WHERE bt.total_late_fee > 0
         GROUP BY u.id, u.name, u.email
         ORDER BY total_debt DESC`
      ),
    ]);

    const borrowsMap = Object.fromEntries(borrowsByMonth.map((r) => [r.ym, Number(r.cnt || 0)]));
    const ordersMap = Object.fromEntries(
      ordersByMonth.map((r) => [
        r.ym,
        { cnt: Number(r.cnt || 0), revenue: Number(r.revenue || 0) },
      ])
    );
    const feesMap = Object.fromEntries(
      lateFeesByMonth.map((r) => [r.ym, Number(r.late_fee || 0)])
    );

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const ym = `${year}-${month}`;
      const label = `T${month}/${year}`;
      const ord = ordersMap[ym] || { cnt: 0, revenue: 0 };

      months.push({
        label,
        borrows: borrowsMap[ym] || 0,
        orders: ord.cnt,
        revenue: ord.revenue + (feesMap[ym] || 0),
      });
    }

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
