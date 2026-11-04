'use client';
import React, { useState, useEffect } from 'react';
import { X, Bookmark, ShoppingCart, Star, ShieldCheck, MessageSquare, Send, Clock, CheckCircle, AlertCircle, BookOpen, ChevronLeft, ChevronRight, Sun, Moon, Type } from 'lucide-react';
import api from '../api';

function buildPreviewPages(book) {
  const title = book.title || 'Tác phẩm';
  const author = book.author || 'Tác giả';
  const category = book.category?.name || 'Tri thức tổng hợp';
  const publisher = book.publisher || 'Nhà xuất bản';
  const year = book.publish_year || '2024';
  const desc = book.description || 'Cuốn sách mang lại góc nhìn sâu sắc và thiết thực cho độc giả.';

  return [
    {
      chapter: 'Phần 1 — Lời giới thiệu & Bối cảnh tác phẩm',
      content: [
        `Tác phẩm "${title}" của tác giả ${author} là một trong những ấn phẩm tiêu biểu thuộc chuyên mục ${category}, được xuất bản bởi ${publisher} (${year}).`,
        desc,
        `Ngay từ những trang đầu tiên, ${author} đã đặt ra một câu hỏi cốt lõi dành cho người đọc: Làm thế nào để chúng ta chuyển hóa kiến thức trên trang giấy thành năng lực tư duy và hành động thực tiễn trong kỷ nguyên số?`,
        `Ấn bản điện tử trích đoạn này thuộc Hệ thống Thư Viện Tri Thức Số, giúp độc giả xem trước văn phong, cấu trúc chương mục và những luận điểm nền tảng trước khi quyết định đăng ký mượn bản in hoặc đặt mua sách về tủ sách cá nhân.`,
      ],
    },
    {
      chapter: 'Phần 2 — Trích đoạn Chương Mở Đầu',
      content: [
        `"Mọi hành trình vĩ đại đều khởi nguồn từ việc thay đổi cách chúng ta quan sát những điều quen thuộc hàng ngày." — Trích từ chương đầu của "${title}".`,
        `Trong chương mở đầu, tác giả ${author} phân tích tỉ mỉ những sai lầm phổ biến khi tiếp cận lĩnh vực ${category}. Thay vì đưa ra các lý thuyết khô khan, cuốn sách dẫn dắt độc giả đi qua từng tình huống thực tế, minh họa rõ nét nguyên nhân và hệ quả của từng quyết định.`,
        `Ba nguyên tắc trọng tâm được nhấn mạnh trong phần này bao gồm:\n• Nguyên tắc 1: Nắm vững bản chất cốt lõi trước khi đi vào công cụ hay chi tiết kỹ thuật.\n• Nguyên tắc 2: Rèn luyện thói quen phản biện, liên tục đặt câu hỏi "Tại sao?" và "Làm thế nào để tối ưu hơn?".\n• Nguyên tắc 3: Kiên trì áp dụng từng bước nhỏ mỗi ngày để tạo ra sự thay đổi bền vững.`,
      ],
    },
    {
      chapter: 'Phần 3 — Mục lục tóm tắt & Lời kết trích đoạn',
      content: [
        `Cấu trúc tổng thể của cuốn sách "${title}" được chia thành các phần mạch lạc, đi từ nền tảng tư duy đến các phương pháp thực hành nâng cao dành cho cả người mới bắt đầu lẫn độc giả chuyên sâu.`,
        `Đánh giá từ Hội đồng Thư viện: Đây là đầu sách có giá trị tham khảo cao (Mã ISBN: ${book.isbn || 'Đang cập nhật'}), hiện đang có ${book.available_copies_count ?? 0} bản sao mượn trực tiếp tại quầy và ${book.available_stock_count ?? 0} cuốn mới trong kho phát hành.`,
        `👉 Bạn đã đọc hết phần trích đoạn miễn phí (3/3 trang). Hãy nhấn nút "Mượn Sách" hoặc "Mua Sách" bên dưới để đọc trọn vẹn toàn bộ tác phẩm!`,
      ],
    },
  ];
}

export default function BookDetailModal({ book, onClose, onBorrow, onAddToCart, user }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState('');
  const [reserveError, setReserveError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [readerTheme, setReaderTheme] = useState('sepia');
  const [fontSize, setFontSize] = useState('base');

  useEffect(() => {
    if (book) {
      fetchReviews();
      setIsPreviewOpen(false);
      setPreviewPage(0);
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
        comment: newComment,
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

  const borrowCount = book.available_copies_count ?? 0;
  const stockCount = book.available_stock_count ?? 0;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover & Rating badge */}
          <div>
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-72 object-cover rounded-xl border border-white/10 shadow-lg mb-3"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-slate-400 mb-1">Đánh giá trung bình:</div>
              <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-lg">
                <Star className="w-5 h-5 fill-amber-400" /> {avgRating} / 5.0
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">({reviews.length} lượt nhận xét)</div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="badge badge-borrow mb-2">{book.category?.name || 'Thể loại'}</span>
              <h2 className="text-2xl font-bold text-white mb-1">{book.title}</h2>
              <p className="text-sm text-slate-300 font-medium">Tác giả: <span className="text-indigo-300">{book.author}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div><span className="text-slate-400">Nhà xuất bản:</span> <span className="text-white font-semibold">{book.publisher || 'N/A'}</span></div>
              <div><span className="text-slate-400">Năm xuất bản:</span> <span className="text-white font-semibold">{book.publish_year || 'N/A'}</span></div>
              <div><span className="text-slate-400">Mã ISBN:</span> <span className="text-white font-semibold">{book.isbn || 'N/A'}</span></div>
              <div><span className="text-slate-400">Giá bán sách mới:</span> <span className="text-pink-400 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sale_price)}</span></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-1">Mô tả nội dung:</h4>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
                {book.description || 'Chưa có mô tả chi tiết cho đầu sách này.'}
              </p>
            </div>

            {/* Policy Reminder */}
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Quy định mượn sách:</strong> Tối đa 3 cuốn/lần mượn, thời hạn 14 ngày. Độc giả được tự gia hạn online 01 lần (+7 ngày) trước khi trễ hạn.
              </div>
            </div>

            {/* Reservation feedback */}
            {reserveMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>{reserveMsg}</div>
              </div>
            )}

            {reserveError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div>{reserveError}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(!isPreviewOpen);
                  setPreviewPage(0);
                }}
                className="py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-300" />
                {isPreviewOpen ? 'Đóng Đọc Thử' : 'Đọc Thử E-Book (3 Trang)'}
              </button>

              {borrowCount > 0 ? (
                <button
                  onClick={() => { onBorrow(book); onClose(); }}
                  className="btn-accent flex-1 justify-center py-2.5"
                >
                  <Bookmark className="w-4 h-4" /> Mượn Sách ({borrowCount} bản còn)
                </button>
              ) : (
                <button
                  onClick={handleReserveBook}
                  disabled={reserving}
                  className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transition-all"
                  title="Tất cả bản sách đang được mượn, đăng ký xếp hàng tự động"
                >
                  <Clock className="w-4 h-4" /> {reserving ? 'Đang xếp hàng...' : 'Đặt Trước Sách (Xếp hàng)'}
                </button>
              )}

              <button
                onClick={() => { onAddToCart(book); onClose(); }}
                disabled={stockCount <= 0}
                className="btn-primary flex-1 justify-center py-2.5"
              >
                <ShoppingCart className="w-4 h-4" /> Mua Sách ({stockCount} kho)
              </button>
            </div>
          </div>
        </div>

        {/* E-Book Interactive Preview Reader */}
        {isPreviewOpen && (() => {
          const pages = buildPreviewPages(book);
          const current = pages[previewPage] || pages[0];
          const themeClasses =
            readerTheme === 'light'
              ? 'bg-white text-slate-800 border-slate-300'
              : readerTheme === 'dark'
              ? 'bg-slate-950 text-slate-200 border-slate-700'
              : 'bg-[#fdf6e3] text-[#433422] border-[#e6d8b5]';
          const textSizeClass =
            fontSize === 'sm' ? 'text-xs leading-relaxed' : fontSize === 'lg' ? 'text-base leading-loose' : 'text-sm leading-relaxed';

          return (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-2xl transition-colors ${themeClasses}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-current/15">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Trình Đọc Thử Sách Số — {book.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReaderTheme('light')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${readerTheme === 'light' ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                    >
                      <Sun className="w-3.5 h-3.5 inline mr-0.5" /> Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${readerTheme === 'sepia' ? 'ring-2 ring-amber-600' : 'opacity-70'}`}
                    >
                      📜 Giấy
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('dark')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${readerTheme === 'dark' ? 'ring-2 ring-indigo-400' : 'opacity-70'}`}
                    >
                      <Moon className="w-3.5 h-3.5 inline mr-0.5" /> Tối
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold border ml-1"
                    >
                      <Type className="w-3.5 h-3.5 inline mr-0.5" /> Cỡ chữ
                    </button>
                  </div>
                </div>

                <div className="space-y-3 min-h-[210px]">
                  <h4 className="font-black text-base sm:text-lg border-l-4 border-indigo-500 pl-3">
                    {current.chapter}
                  </h4>
                  {current.content.map((para, idx) => (
                    <p key={idx} className={`${textSizeClass} whitespace-pre-line`}>
                      {para}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-current/15 text-xs font-bold">
                  <button
                    type="button"
                    disabled={previewPage === 0}
                    onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-current/20 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trang trước
                  </button>
                  <span>
                    Trang đọc thử {previewPage + 1} / {pages.length}
                  </span>
                  <button
                    type="button"
                    disabled={previewPage === pages.length - 1}
                    onClick={() => setPreviewPage((p) => Math.min(pages.length - 1, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-current/20 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    Trang sau <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Reviews Section */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Đánh Giá & Nhận Xét Từ Độc Giả ({reviews.length})
          </h3>

          {/* Post Review Form */}
          {user ? (
            <form onSubmit={handlePostReview} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">Chọn mức đánh giá:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Viết cảm nhận của bạn về cuốn sách này..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-control text-xs py-2 flex-1"
                />
                <button type="submit" disabled={loadingReview} className="btn-primary text-xs py-2 px-4">
                  <Send className="w-3.5 h-3.5" /> Gửi
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-xs text-slate-400 text-center">
              Vui lòng đăng nhập để viết nhận xét cho đầu sách này.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên nhận xét!</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-900/40 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{rev.reader?.name || 'Độc giả'}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">{rev.comment}</p>
                  <div className="text-[10px] text-slate-500">{new Date(rev.created_at).toLocaleString('vi-VN')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
