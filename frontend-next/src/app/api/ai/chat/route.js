import { NextResponse } from 'next/server';
import { query, getSystemConfig } from '@/lib/db';
import { hydrateBooks, parseRequestData } from '@/lib/helpers';

function normalizeVi(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export async function POST(request) {
  try {
    const { data } = await parseRequestData(request);
    const message = String(data.message || '').trim();

    if (!message) {
      return NextResponse.json(
        { message: 'Vui lòng nhập câu hỏi cho Trợ lý AI.' },
        { status: 422 }
      );
    }

    const rawBooks = await query('SELECT * FROM books ORDER BY id ASC');
    const books = await hydrateBooks(rawBooks);
    const normMsg = normalizeVi(message);

    const lateFee = Number((await getSystemConfig('late_fee_per_day', 5000)) || 5000);
    const maxBorrow = Number((await getSystemConfig('max_borrow_books', 5)) || 5);
    const renewDays = Number((await getSystemConfig('renew_days', 7)) || 7);
    const shipFee = Number((await getSystemConfig('shipping_fee', 30000)) || 30000);

    // 1. Hỏi về quy định mượn trả / phí phạt / gia hạn / vận chuyển
    if (
      normMsg.includes('quy dinh') ||
      normMsg.includes('phi phat') ||
      normMsg.includes('tre han') ||
      normMsg.includes('qua han') ||
      normMsg.includes('gia han') ||
      normMsg.includes('bao nhieu cuon') ||
      normMsg.includes('phi ship')
    ) {
      return NextResponse.json({
        reply:
          `📌 **Quy định Hiện hành của Thư Viện Tri Thức Số:**\n` +
          `• **Hạn mức mượn**: Tối đa **${maxBorrow} cuốn** cùng lúc, thời hạn mượn mặc định **14 ngày**.\n` +
          `• **Gia hạn trực tuyến**: Được phép gia hạn thêm **+${renewDays} ngày** trước khi phiếu quá hạn.\n` +
          `• **Phí phạt quá hạn**: **${lateFee.toLocaleString('vi-VN')}đ / ngày / cuốn** (có thể thanh toán tự động qua VietQR).\n` +
          `• **Mua sách & Giao hàng**: Phí vận chuyển **${shipFee.toLocaleString('vi-VN')}đ** (Miễn phí vận chuyển cho đơn hàng từ **300.000đ** trở lên).`,
        suggested_books: books.filter((b) => b.available_copies_count > 0).slice(0, 3),
      });
    }

    // 2. Tìm kiếm / Tóm tắt theo tên sách hoặc tác giả khớp trực tiếp
    const directMatches = books.filter((b) => {
      const t = normalizeVi(b.title);
      const a = normalizeVi(b.author);
      return (
        (t.length > 3 && normMsg.includes(t)) ||
        t.split(':')[0].length > 3 && normMsg.includes(t.split(':')[0].trim()) ||
        (a.length > 3 && normMsg.includes(a))
      );
    });

    if (directMatches.length > 0) {
      const b = directMatches[0];
      return NextResponse.json({
        reply:
          `📖 **Thông tin & Tóm tắt sách "${b.title}":**\n` +
          `• **Tác giả**: ${b.author} (${b.publisher || 'NXB'}, ${b.publish_year || 'N/A'})\n` +
          `• **Thể loại**: ${b.category?.name || 'Tổng hợp'}\n` +
          `• **Nội dung chính**: ${b.description || 'Ấn phẩm giá trị cao tại thư viện.'}\n` +
          `• **Tình trạng hiện tại**: Còn **${b.available_copies_count} bản sao** để mượn và **${b.available_stock_count} cuốn** trong kho bán (Giá: **${Number(b.sale_price || 0).toLocaleString('vi-VN')}đ**).`,
        suggested_books: directMatches.slice(0, 3),
      });
    }

    // 3. Lọc theo giá tiền (VD: dưới 100k, rẻ nhất)
    if (normMsg.includes('re') || normMsg.includes('100k') || normMsg.includes('100.000') || normMsg.includes('gia')) {
      const affordable = [...books]
        .filter((b) => b.is_salable && b.available_stock_count > 0)
        .sort((a, b) => a.sale_price - b.sale_price)
        .slice(0, 4);

      return NextResponse.json({
        reply:
          `💡 Dưới đây là các đầu sách có **mức giá tốt nhất** đang sẵn hàng tại Thư Viện để bạn tham khảo:`,
        suggested_books: affordable,
      });
    }

    // 4. Lọc theo chủ đề / thể loại
    const topicKeywords = [
      { keys: ['lap trinh', 'cntt', 'code', 'phan mem', 'cong nghe', 'it'], catKeyword: 'cong nghe' },
      { keys: ['van hoc', 'truyen', 'tieu thuyet', 'thieu nhi', 'nghe thuat'], catKeyword: 'van hoc' },
      { keys: ['kinh te', 'kinh doanh', 'khoi nghiep', 'tai chinh', 'giau', 'quan tri'], catKeyword: 'kinh te' },
      { keys: ['tam ly', 'ky nang', 'song', 'giao tiep', 'ban than'], catKeyword: 'tam ly' },
      { keys: ['lich su', 'luoc su', 'van minh', 'nhan loai'], catKeyword: 'lich su' },
    ];

    for (const topic of topicKeywords) {
      if (topic.keys.some((k) => normMsg.includes(k))) {
        const matched = books.filter((b) =>
          normalizeVi(b.category?.name || '').includes(topic.catKeyword)
        );
        if (matched.length > 0) {
          return NextResponse.json({
            reply: `📚 Mình tìm thấy **${matched.length} đầu sách** thuộc chủ đề **${matched[0].category?.name}** rất phù hợp với nhu cầu của bạn:`,
            suggested_books: matched.slice(0, 4),
          });
        }
      }
    }

    // 5. Tìm theo từ khóa bất kỳ trong câu hỏi
    const words = normMsg.split(/\s+/).filter((w) => w.length >= 3);
    const scored = books
      .map((b) => {
        const hay = normalizeVi(`${b.title} ${b.author} ${b.category?.name || ''} ${b.description || ''}`);
        let score = 0;
        for (const w of words) {
          if (hay.includes(w)) score += 1;
        }
        return { book: b, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const topBooks = scored.slice(0, 4).map((x) => x.book);
      return NextResponse.json({
        reply: `🔍 Dựa trên yêu cầu của bạn, Trợ lý AI gợi ý **${topBooks.length} đầu sách** phù hợp nhất hiện có trong thư viện:`,
        suggested_books: topBooks,
      });
    }

    // 6. Mặc định: gợi ý các sách nổi bật còn bản mượn
    const availableBooks = books.filter((b) => b.available_copies_count > 0).slice(0, 4);
    return NextResponse.json({
      reply:
        `👋 Chào bạn! Mình là **Trợ lý AI Thư Viện Tri Thức Số**.\n` +
        `Hiện thư viện đang có **${books.length} đầu sách** sẵn sàng phục vụ. Bạn có thể hỏi mình về:\n` +
        `• Gợi ý sách theo chủ đề (*Lập trình, Kinh tế, Văn học, Kỹ năng sống, Lịch sử*)\n` +
        `• Tóm tắt nội dung một cuốn sách (*VD: Tóm tắt Clean Code, Đắc Nhân Tâm*)\n` +
        `• Quy định mượn trả, gia hạn và phí phạt\n\n` +
        `Dưới đây là một số đầu sách nổi bật đang còn sẵn bản sao trên kệ:`,
      suggested_books: availableBooks,
    });
  } catch (err) {
    console.error('AI Chat error:', err);
    return NextResponse.json(
      { message: 'Trợ lý AI đang bận, vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
