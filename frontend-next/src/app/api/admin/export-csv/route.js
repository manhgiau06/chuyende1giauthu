import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hydrateBooks, hydrateBorrowTickets, hydrateOrders } from '@/lib/helpers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders';

    const rows = [];

    if (type === 'borrows') {
      rows.push([
        'Ma Phieu',
        'Doc Gia',
        'Email',
        'Danh Sach Sach',
        'Ngay Muon',
        'Han Tra',
        'Ngay Tra',
        'Trang Thai',
        'Phi Phat (VND)',
      ]);
      const rawTickets = await query('SELECT * FROM borrow_tickets ORDER BY id DESC');
      const tickets = await hydrateBorrowTickets(rawTickets);
      for (const t of tickets) {
        const books = (t.items || []).map((i) => i.book_copy?.book?.title || '').join(' | ');
        rows.push([
          t.ticket_code,
          t.reader?.name || 'N/A',
          t.reader?.email || 'N/A',
          books,
          t.borrow_date,
          t.due_date,
          t.return_date || 'Chua tra',
          t.status,
          t.total_late_fee,
        ]);
      }
    } else if (type === 'books') {
      rows.push([
        'ID',
        'Tieu De',
        'Tac Gia',
        'Danh Muc',
        'ISBN',
        'NXB',
        'Nam XB',
        'Gia Ban (VND)',
        'Ban Sao Muon Kha Dung',
        'Ton Kho Ban',
      ]);
      const rawBooks = await query('SELECT * FROM books ORDER BY id DESC');
      const books = await hydrateBooks(rawBooks);
      for (const b of books) {
        rows.push([
          b.id,
          b.title,
          b.author,
          b.category?.name || '',
          b.isbn,
          b.publisher,
          b.publish_year,
          b.sale_price,
          b.available_copies_count,
          b.available_stock_count,
        ]);
      }
    } else {
      rows.push([
        'Ma Don',
        'Khach Hang',
        'SDT',
        'Dia Chi',
        'Tong Tien (VND)',
        'Phi Ship (VND)',
        'Thanh Toan (VND)',
        'Phuong Thuc',
        'TT Thanh Toan',
        'Trang Thai Don',
        'Ngay Tao',
      ]);
      const rawOrders = await query('SELECT * FROM orders ORDER BY id DESC');
      const orders = await hydrateOrders(rawOrders);
      for (const o of orders) {
        rows.push([
          o.order_code,
          o.customer_name,
          o.customer_phone,
          o.shipping_address,
          o.total_amount,
          o.shipping_fee,
          o.final_amount,
          o.payment_method,
          o.payment_status,
          o.order_status,
          o.created_at,
        ]);
      }
    }

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvBody = '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
    const filename = `baocao_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export CSV error:', err);
    return NextResponse.json({ message: 'Lỗi xuất báo cáo CSV' }, { status: 500 });
  }
}
