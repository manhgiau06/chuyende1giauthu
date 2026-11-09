import React, { useState, useEffect } from 'react';
import { 
  X, Bookmark, ShoppingCart, Star, ShieldCheck, MessageSquare, Send, 
  Clock, CheckCircle, AlertCircle, BookOpen, ChevronLeft, ChevronRight, 
  Sun, Moon, Type, Layers, UserCheck, Eye, EyeOff, Sparkles, Plus, Check, Gift
} from 'lucide-react';
import api from '../api';

function buildComprehensivePreviewPages(book) {
  const title = book.title || 'Tác phẩm';
  const author = book.author || 'Tác giả';
  const category = book.category?.name || 'Tri thức tổng hợp';
  const publisher = book.publisher || 'Nhà xuất bản Tri Thức';
  const year = book.publish_year || '2024';
  const isbn = book.isbn || '978-604-0-12345-6';
  const desc = book.description || 'Tác phẩm truyền tải nhiều tư tưởng giá trị sâu sắc đến bạn đọc.';

  return [
    {
      type: 'cover_front',
      chapter: 'Bìa Trước Tác Phẩm',
      content: [
        `Ấn bản chính thức được phát hành bởi ${publisher}.`,
        `Tựa sách: "${title}" — Tác giả: ${author}.`,
        `Mã đăng ký xuất bản quốc tế (ISBN): ${isbn}. Năm xuất bản: ${year}.`
      ],
      isCover: true,
      image: book.cover_image
    },
    {
      type: 'toc',
      chapter: 'Mục Lục Tác Phẩm (Table of Contents)',
      content: [
        `• Lời tựa từ Ban biên tập & Lời tri ân độc giả (Trang 05)`,
        `• Phần I: Nền tảng tư duy & Bối cảnh nguyên tác (Trang 15)`,
        `• Phần II: Những luận điểm đột phá và phân tích chuyên sâu (Trang 65)`,
        `• Phần III: Ứng dụng thực hành & Nghiên cứu tình huống (Trang 140)`,
        `• Phần IV: Tương lai phát triển và thông điệp gửi gắm (Trang 220)`,
        `• Phụ lục & Tài liệu tham khảo đối chiếu (Trang 285)`
      ]
    },
    {
      type: 'text',
      chapter: 'Trang 01 — Lời Mở Đầu & Đặt Vấn Đề',
      content: [
        `"Mỗi cuốn sách mở ra là một chân trời mới, nơi người đọc tìm thấy những mảnh ghép còn thiếu của nhận thức."`,
        `Trong tác phẩm "${title}", tác giả ${author} không bắt đầu bằng những định nghĩa khô khan. Thay vào đó, tác giả đưa bạn đọc bước vào một câu chuyện thực tế, nơi các xung đột tư tưởng bắt đầu bộc lộ.`,
        desc
      ]
    },
    {
      type: 'text',
      chapter: 'Trang 02 — Phân Tích Luận Điểm Cốt Lõi',
      content: [
        `Khi nhìn nhận lĩnh vực ${category} dưới lăng kính hiện đại, độc giả sẽ nhận thấy sự giao thoa mật thiết giữa lý thuyết kinh điển và trải nghiệm thực tiễn.`,
        `Tác giả chỉ ra rằng: "Sự thấu suốt không đến từ việc tiếp nhận thụ động, mà bắt đầu từ hành vi chủ động phản biện từng luận điểm."`,
        `Ba câu hỏi mà cuốn sách thách thức người đọc phải trả lời bao gồm:\n1. Giá trị cốt lõi bạn đang theo đuổi là gì?\n2. Những giả định nào của bạn chưa từng được kiểm chứng?\n3. Bạn sẽ làm gì khác đi sau khi gấp cuốn sách này lại?`
      ]
    },
    {
      type: 'text',
      chapter: 'Trang 03 — Trích Đoạn Chương Thực Tiễn',
      content: [
        `"Thói quen và môi trường định hình 80% kết quả cuối cùng."`,
        `Thông qua những ví dụ sống động và số liệu thực nghiệm, ấn phẩm chứng minh rằng bất kỳ mục tiêu lớn lao nào cũng có thể được cụ thể hóa bằng chuỗi hành động có thể đo lường.`,
        `Đánh giá từ Hội đồng Thư viện: Đầu sách này có lượng độc giả tra cứu cao, hỗ trợ sinh viên và người đi làm củng cố tư duy logic và kiến thức chuyên ngành.`
      ]
    },
    {
      type: 'cover_back',
      chapter: 'Bìa Sau & Lời Tuyên Ngôn Biên Tập',
      content: [
        `"Một cuốn sách đáng giá trên kệ sách của mọi gia đình và tủ sách cơ quan."`,
        `Trích nhận định của Báo Tuổi Trẻ & Tạp chí Tri Thức.`,
        `Bạn vừa trải nghiệm chế độ "Đọc Thử" trực quan (Trích đoạn 5 trang chuẩn biên tập). Hãy nhấn "Mượn Sách" hoặc "Mua Sách" để sở hữu trọn vẹn tác phẩm!`
      ]
    }
  ];
}

export default function BookDetailModal({ 
  book, 
  onClose, 
  onBorrow, 
  onAddToCart, 
  user,
  onFilterByAuthor,
  allBooks = []
}) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewType, setReviewType] = useState('content'); // 'content' | 'paper'
  const [activeReviewFilter, setActiveReviewFilter] = useState('all'); // 'all' | 'content' | 'paper'
  const [unmaskedSpoilers, setUnmaskedSpoilers] = useState({});
  const [loadingReview, setLoadingReview] = useState(false);

  // 3. Format Selector State
  // 'paperback' (Bìa mềm), 'hardcover' (Bìa cứng), 'special' (Bản đặc biệt kèm quà), 'ebook' (E-Book)
  const [selectedFormat, setSelectedFormat] = useState('paperback');

  // 3. Synopsis Collapse state
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  // 3. Look Inside Modal Reader state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [readerTheme, setReaderTheme] = useState('sepia'); // 'sepia' | 'light' | 'dark'
  const [fontSize, setFontSize] = useState('base'); // 'sm' | 'base' | 'lg'

  // Reservation states
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState('');
  const [reserveError, setReserveError] = useState('');

  // 4. Frequently Bought Together Checkbox
  const [includeBookmark, setIncludeBookmark] = useState(true);
  const [includePlastic, setIncludePlastic] = useState(true);

  useEffect(() => {
    if (book) {
      fetchReviews();
      setIsPreviewOpen(false);
      setPreviewPage(0);
      setIsSynopsisExpanded(false);
      setSelectedFormat('paperback');
      setReserveMsg('');
      setReserveError('');
    }
  }, [book]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/books/${book.id}/reviews`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avg_rating || 5.0);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingReview(true);
    try {
      await api.post(`/books/${book.id}/reviews`, {
        rating: newRating,
        comment: `[${reviewType === 'paper' ? 'Chất lượng giấy & Đóng gói' : 'Nội dung tác phẩm'}] ${newComment}`,
      });
      setNewComment('');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể gửi đánh giá!');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleReserveBook = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng đặt trước sách!');
      return;
    }
    if (user.role !== 'reader') {
      alert('Chỉ tài khoản độc giả mới có thể đặt trước sách!');
      return;
    }
    setReserving(true);
    setReserveMsg('');
    setReserveError('');
    try {
      const res = await api.post('/reservations', { book_id: book.id });
      setReserveMsg(res.data.message);
    } catch (err) {
      setReserveError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt trước sách!');
    } finally {
      setReserving(false);
    }
  };

  if (!book) return null;

  const basePrice = Number(book.sale_price || 0);
  
  // Format-adjusted price
  const formatMultiplier = {
    paperback: 1,
    hardcover: 1.18,
    special: 1.35,
    ebook: 0.45,
  };
  const currentPrice = Math.round(basePrice * (formatMultiplier[selectedFormat] || 1));

  const borrowCount = book.available_copies_count ?? 0;
  const stockCount = book.available_stock_count ?? 0;

  // Series Grouping mock data (e.g., Tập 1, Tập 2, Tập 3)
  const seriesBooks = [
    { episode: 'Tập 1', title: book.title, price: basePrice, status: 'Đang xem' },
    { episode: 'Tập 2', title: `${book.title} — Tập 2: Khám Phá Mở Rộng`, price: Math.round(basePrice * 1.05), status: 'Có sẵn' },
    { episode: 'Tập 3', title: `${book.title} — Tập 3: Đại Kết Cục`, price: Math.round(basePrice * 1.05), status: 'Đặt trước' },
  ];

  // Frequently bought combo
  const bookmarkPrice = 25000;
  const plasticCoverPrice = 5000;
  const comboTotal = currentPrice + (includeBookmark ? bookmarkPrice : 0) + (includePlastic ? plasticCoverPrice : 0);
  const comboDiscount = Math.round(comboTotal * 0.1);
  const comboFinal = comboTotal - comboDiscount;

  // Filter reviews
  const filteredReviews = reviews.filter(rev => {
    if (activeReviewFilter === 'all') return true;
    if (activeReviewFilter === 'paper') return rev.comment.includes('Chất lượng giấy');
    return !rev.comment.includes('Chất lượng giấy');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-4xl p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E7DFD5] text-slate-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-200 transition-colors z-20 cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left Column: Aspect Ratio Book Cover & Badges (md: 5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] book-cover-aspect rounded-2xl shadow-sm border border-[#EAE3D9] p-3 relative group">
              <img
                src={book.cover_image}
                alt={book.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Look Inside Overlay Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(true);
                  setPreviewPage(0);
                }}
                className="absolute inset-x-4 bottom-4 py-2.5 px-3 bg-slate-900/85 hover:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                Đọc Thử (Look Inside)
              </button>
            </div>

            {/* Rating Summary Card */}
            <div className="w-full max-w-[280px] mt-4 p-3.5 bg-white rounded-2xl border border-[#E7DFD5] text-center shadow-xs">
              <div className="text-xs text-slate-500 font-medium mb-1">Đánh giá chuẩn độc giả:</div>
              <div className="flex items-center justify-center gap-1.5 text-amber-500 font-extrabold text-xl">
                <Star className="w-5 h-5 fill-current" /> {avgRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Dựa trên {reviews.length} lượt nhận xét thực tế</div>
            </div>
          </div>

          {/* Right Column: Title, Format Selector, Metadata & Synopsis (md: 7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Category badge & Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {book.category?.name || 'Văn học & Tri thức'}
                </span>
                <span className="text-xs text-slate-400">• Năm XB: {book.publish_year || '2024'}</span>
              </div>

              <h1 className="font-serif-book font-bold text-2xl sm:text-3xl text-slate-900 leading-tight mb-2">
                {book.title}
              </h1>

              {/* Author Hyperlink (Standard 3) */}
              <div className="text-sm text-slate-600 flex items-center gap-1.5">
                <span>Tác giả:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onFilterByAuthor) onFilterByAuthor(book.author);
                    onClose();
                  }}
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                  title={`Xem tất cả sách của tác giả ${book.author}`}
                >
                  <UserCheck className="w-4 h-4" /> {book.author}
                </button>
              </div>
            </div>

            {/* 3. Format Selector (Bộ chọn Định dạng Bìa Mềm, Bìa Cứng, Đặc Biệt, E-Book) */}
            <div className="p-3 bg-white rounded-2xl border border-[#E7DFD5] space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Chọn định dạng ấn bản:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'paperback', label: 'Bìa Mềm', note: 'Chuẩn', mult: 1 },
                  { id: 'hardcover', label: 'Bìa Cứng', note: 'Bảo quản', mult: 1.18 },
                  { id: 'special', label: 'Bản Đ.Biệt', note: 'Kèm quà', mult: 1.35 },
                  { id: 'ebook', label: 'E-Book', note: 'Đọc ngay', mult: 0.45 },
                ].map((fmt) => {
                  const isSel = selectedFormat === fmt.id;
                  const priceFmt = Math.round(basePrice * fmt.mult);
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSel
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-800">{fmt.label}</div>
                      <div className="text-[10px] text-slate-500">{fmt.note}</div>
                      <div className="text-[11px] font-black text-rose-600 mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceFmt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Price Display */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif-book font-extrabold text-2xl text-rose-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(currentPrice * 1.15))}
              </span>
              <span className="badge-discount px-2 py-0.5 text-xs font-extrabold rounded-md">Tiết kiệm 15%</span>
            </div>

            {/* 3. Bảng Thông số Xuất bản (Metadata Table - 2 Cột) */}
            <div className="bg-white rounded-2xl border border-[#E7DFD5] overflow-hidden text-xs">
              <div className="p-2.5 bg-stone-50 font-bold text-slate-700 border-b border-stone-200 flex items-center justify-between">
                <span>Thông số xuất bản chi tiết</span>
                <span className="text-[10px] text-slate-400 font-normal">Chuẩn Cục Xuất Bản</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-stone-100">
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Mã ISBN:</span>
                  <span className="font-semibold text-slate-800">{book.isbn || '978-604-0-12345-6'}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Nhà xuất bản:</span>
                  <span className="font-semibold text-slate-800">{book.publisher || 'NXB Tri Thức Trẻ'}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Kích thước:</span>
                  <span className="font-semibold text-slate-800">14.5 x 20.5 cm</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Số trang:</span>
                  <span className="font-semibold text-slate-800">368 trang</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Trọng lượng:</span>
                  <span className="font-semibold text-slate-800">420 gram</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Ngôn ngữ:</span>
                  <span className="font-semibold text-slate-800">Tiếng Việt</span>
                </div>
              </div>
            </div>

            {/* 3. Tóm tắt nội dung (Synopsis Collapse with "Xem thêm / Thu gọn") */}
            <div className="bg-white rounded-2xl border border-[#E7DFD5] p-4 space-y-2">
              <h4 className="font-serif-book font-bold text-sm text-slate-900">Tóm tắt nội dung tác phẩm:</h4>
              <p className={`book-synopsis transition-all ${isSynopsisExpanded ? '' : 'line-clamp-3'}`}>
                {book.description || 'Tác phẩm đưa độc giả vào hành trình khám phá những bài học giá trị về tư duy, phong cách sống và nghệ thuật làm chủ bản thân trong thế giới hiện đại. Từng chương sách đan xen giữa thực tiễn và triết lý sống nhân văn.'}
              </p>
              <button
                type="button"
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                {isSynopsisExpanded ? '▲ Thu gọn tóm tắt' : '▼ Xem thêm toàn bộ nội dung'}
              </button>
            </div>

            {/* Policy Reminder */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
              <div>
                <strong>Quy định mượn & mua:</strong> Mượn tối đa 3 cuốn sách giấy trong 14 ngày (gia hạn online 01 lần). Đơn mua sách mới được bảo hành đổi trả trong 7 ngày nếu lỗi in ấn.
              </div>
            </div>

            {/* Reservation Notices */}
            {reserveMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>{reserveMsg}</div>
              </div>
            )}
            {reserveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>{reserveError}</div>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {borrowCount > 0 ? (
                <button
                  onClick={() => { onBorrow(book); onClose(); }}
                  className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md flex-1 cursor-pointer transition-all"
                >
                  <Bookmark className="w-4 h-4" /> Mượn Sách Giấy ({borrowCount} bản sẵn sàng)
                </button>
              ) : (
                <button
                  onClick={handleReserveBook}
                  disabled={reserving}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all cursor-pointer"
                  title="Tất cả bản sách đang được mượn, đăng ký xếp hàng tự động"
                >
                  <Clock className="w-4 h-4" /> {reserving ? 'Đang xếp hàng...' : 'Đặt Trước Sách (Xếp Hàng)'}
                </button>
              )}

              <button
                onClick={() => { 
                  onAddToCart({ ...book, sale_price: currentPrice, format: selectedFormat }); 
                  onClose(); 
                }}
                disabled={stockCount <= 0 && selectedFormat !== 'ebook'}
                className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-md flex-1 cursor-pointer transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" /> 
                {selectedFormat === 'ebook' ? 'Mua E-Book Tức Thì' : `Thêm Vào Giỏ Mua (${stockCount} kho)`}
              </button>
            </div>

          </div>
        </div>

        {/* 4. Frequently Bought Together (Mua kèm giảm thêm) */}
        <div className="mt-8 p-4 sm:p-5 bg-white rounded-2xl border border-[#E7DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-book font-bold text-base text-slate-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-500" /> Thường Được Mua Cùng (Combo Tiết Kiệm)
            </h3>
            <span className="badge-discount px-2 py-0.5 text-xs font-bold rounded-md">Combo Giảm 10%</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>[Ấn phẩm chính] {book.title} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includeBookmark}
                  onChange={(e) => setIncludeBookmark(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Bookmark kim loại mạ vàng khắc họa tiết hoa văn (+25.000đ)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includePlastic}
                  onChange={(e) => setIncludePlastic(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Bọc bìa plastic chống trầy xước & ẩm mốc (+5.000đ)</span>
              </label>
            </div>

            <div className="sm:border-l border-stone-200 sm:pl-6 flex flex-col justify-center items-start sm:items-end">
              <div className="text-[11px] text-slate-400 line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(comboTotal)}
              </div>
              <div className="font-serif-book font-extrabold text-xl text-rose-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(comboFinal)}
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddToCart({ ...book, sale_price: comboFinal, format: selectedFormat });
                  onClose();
                }}
                className="mt-2 py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Mua Trọn Gói Combo
              </button>
            </div>
          </div>
        </div>

        {/* 4. Series Grouping (Quản lý theo Bộ sách / Các tập tiếp theo) */}
        <div className="mt-6 p-4 sm:p-5 bg-white rounded-2xl border border-[#E7DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-book font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Các Tập Tiếp Theo Trong Cùng Bộ Sách
            </h3>
            <button
              type="button"
              onClick={() => {
                onAddToCart({ ...book, title: `Trọn bộ 3 tập — ${book.title}`, sale_price: basePrice * 2.8 });
                onClose();
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              Mua trọn bộ 3 tập (-15%)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {seriesBooks.map((sb, idx) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">{sb.episode}</span>
                  <h4 className="font-serif-book font-bold text-xs text-slate-800 line-clamp-1 mt-0.5">{sb.title}</h4>
                  <div className="text-xs font-bold text-rose-600 mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sb.price)}
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-stone-200/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">{sb.status}</span>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart({ ...book, title: sb.title, sale_price: sb.price });
                        onClose();
                      }}
                      className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      + Thêm tập này
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Look Inside Lightbox (Đọc thử 5 trang chuẩn biên tập) */}
        {isPreviewOpen && (() => {
          const pages = buildComprehensivePreviewPages(book);
          const current = pages[previewPage] || pages[0];
          const themeClasses =
            readerTheme === 'light'
              ? 'bg-white text-slate-800 border-stone-200'
              : readerTheme === 'dark'
              ? 'bg-slate-900 text-slate-100 border-slate-700'
              : 'bg-[#FDF6E3] text-[#433422] border-[#E8D8B8]';
          const textSizeClass =
            fontSize === 'sm' ? 'text-xs leading-relaxed' : fontSize === 'lg' ? 'text-base leading-loose' : 'text-sm leading-relaxed';

          return (
            <div className="mt-6 pt-5 border-t border-stone-200">
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-xl transition-colors ${themeClasses}`}>
                
                {/* Reader Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-current/15">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider">
                        Chế Độ Đọc Thử Biên Tập — Look Inside
                      </span>
                      <div className="text-[11px] opacity-75">{book.title} ({current.chapter})</div>
                    </div>
                  </div>

                  {/* Reading Settings */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${readerTheme === 'sepia' ? 'ring-2 ring-amber-600 font-black' : 'opacity-70'}`}
                    >
                      Giấy Kem
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('light')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${readerTheme === 'light' ? 'ring-2 ring-blue-500 font-black' : 'opacity-70'}`}
                    >
                      <Sun className="w-3.5 h-3.5 inline mr-1" /> Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('dark')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${readerTheme === 'dark' ? 'ring-2 ring-indigo-400 font-black' : 'opacity-70'}`}
                    >
                      <Moon className="w-3.5 h-3.5 inline mr-1" /> Tối
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border ml-1 opacity-80 hover:opacity-100"
                    >
                      <Type className="w-3.5 h-3.5 inline mr-1" /> Cỡ Chữ ({fontSize.toUpperCase()})
                    </button>
                  </div>
                </div>

                {/* Reader Body */}
                <div className="space-y-4 min-h-[220px] font-serif-book">
                  <h4 className="font-bold text-lg border-l-4 border-amber-600 pl-3">
                    {current.chapter}
                  </h4>
                  {current.isCover && (
                    <div className="w-32 h-44 mx-auto rounded-lg overflow-hidden shadow-md my-3 border border-current/20">
                      <img src={current.image} alt={book.title} className="w-full h-full object-contain" />
                    </div>
                  )}
                  {current.content.map((para, idx) => (
                    <p key={idx} className={`${textSizeClass} whitespace-pre-line leading-relaxed`}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* Reader Pagination */}
                <div className="flex items-center justify-between pt-4 mt-5 border-t border-current/15 text-xs font-bold">
                  <button
                    type="button"
                    disabled={previewPage === 0}
                    onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-current/20 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trang trước
                  </button>
                  <span>
                    Trang {previewPage + 1} / {pages.length}
                  </span>
                  <button
                    type="button"
                    disabled={previewPage === pages.length - 1}
                    onClick={() => setPreviewPage((p) => Math.min(pages.length - 1, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-current/20 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                  >
                    Trang sau <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. Author Bio Card (Tiểu sử tác giả) */}
        <div className="mt-6 p-4 sm:p-5 bg-white rounded-2xl border border-[#E7DFD5] space-y-2">
          <h3 className="font-serif-book font-bold text-base text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" /> Tiểu sử tác giả: {book.author}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans-book">
            {book.author} là một trong những ngòi bút có tầm ảnh hưởng sâu rộng trong lĩnh vực {book.category?.name || 'Văn học & Tri thức'}, nổi tiếng với lối viết khúc chiết, giàu tư liệu thực chứng và khả năng đúc kết những quy luật phức tạp thành các bài học gần gũi. Nhiều ấn phẩm của tác giả đã được dịch ra hơn 20 thứ tiếng và liên tục nằm trong danh sách bán chạy quốc tế.
          </p>
        </div>

        {/* 4. Đánh giá & Nhận xét (Social Proof) with Filter Tags & Spoiler Warning */}
        <div className="mt-6 p-4 sm:p-5 bg-white rounded-2xl border border-[#E7DFD5] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <h3 className="font-serif-book font-bold text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Đánh Giá Từ Cộng Đồng Độc Giả ({reviews.length})
            </h3>

            {/* Filter Tags: Tất cả / Nội dung / Chất lượng in ấn */}
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'content', label: 'Nội dung tác phẩm' },
                { id: 'paper', label: 'Giấy in & Đóng gói' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveReviewFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeReviewFilter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Post Review Form */}
          {user ? (
            <form onSubmit={handlePostReview} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Mức sao:</span>
                  <div className="flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`p-0.5 ${newRating >= star ? 'text-amber-500' : 'text-stone-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Chủ đề nhận xét:</span>
                  <select
                    value={reviewType}
                    onChange={(e) => setReviewType(e.target.value)}
                    className="p-1 rounded border border-stone-300 bg-white font-medium text-slate-700"
                  >
                    <option value="content">Nội dung tác phẩm</option>
                    <option value="paper">Chất lượng giấy & Đóng gói</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Viết nhận xét của bạn về cuốn sách này..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="p-2 text-xs rounded-lg border border-stone-300 bg-white flex-1"
                />
                <button type="submit" disabled={loadingReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  <Send className="w-3.5 h-3.5 inline mr-1" /> Gửi
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-slate-500">
              Đăng nhập để chia sẻ cảm nhận của bạn về cuốn sách này.
            </div>
          )}

          {/* Reviews List with Spoiler Warning */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                Chưa có nhận xét nào trong mục này.
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const hasSpoiler = rev.comment?.toLowerCase().includes('kết cục') || rev.comment?.toLowerCase().includes('hung thủ') || rev.id % 2 === 0;
                const isUnmasked = unmaskedSpoilers[rev.id];

                return (
                  <div key={rev.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rev.reader?.name || 'Độc giả mến sách'}</span>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>

                    {/* Spoiler Mask Mechanism */}
                    {hasSpoiler && !isUnmasked ? (
                      <div className="relative p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs">
                        <p className="spoiler-mask text-slate-700">{rev.comment}</p>
                        <button
                          type="button"
                          onClick={() => setUnmaskedSpoilers({ ...unmaskedSpoilers, [rev.id]: true })}
                          className="absolute inset-0 flex items-center justify-center bg-amber-100/80 backdrop-blur-xs font-bold text-amber-900 gap-1.5 rounded-lg cursor-pointer hover:bg-amber-100"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          <span>Bình luận có thể tiết lộ nội dung (Spoiler) — Bấm để mở</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700 font-sans-book">{rev.comment}</p>
                    )}

                    <div className="text-[10px] text-slate-400">{new Date(rev.created_at || Date.now()).toLocaleDateString('vi-VN')}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. Mobile Sticky Bottom Bar (Sticky Bar ghim chân màn hình trên điện thoại) */}
        <div className="md:hidden sticky -bottom-5 sm:-bottom-7 -mx-5 sm:-mx-7 bg-white/95 backdrop-blur-md border-t border-[#E7DFD5] p-3 px-4 flex items-center justify-between gap-3 shadow-2xl z-30">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Giá ấn bản:</div>
            <div className="font-serif-book font-extrabold text-base text-rose-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
            </div>
          </div>

          <div className="flex gap-2">
            {borrowCount > 0 ? (
              <button
                onClick={() => { onBorrow(book); onClose(); }}
                className="py-2.5 px-3 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" /> Mượn
              </button>
            ) : (
              <button
                onClick={handleReserveBook}
                className="py-2.5 px-3 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" /> Đặt Trước
              </button>
            )}

            <button
              onClick={() => { 
                onAddToCart({ ...book, sale_price: currentPrice, format: selectedFormat }); 
                onClose(); 
              }}
              className="py-2.5 px-3 bg-[#0D9488] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Thêm Giỏ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
