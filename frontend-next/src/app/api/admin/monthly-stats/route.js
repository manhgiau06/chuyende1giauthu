import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
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

    return NextResponse.json({ monthly_stats: months });
  } catch (err) {
    console.error('Monthly stats error:', err);
    return NextResponse.json({ message: 'Lỗi tải thống kê tháng' }, { status: 500 });
  }
}
