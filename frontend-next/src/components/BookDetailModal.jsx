'use client';
import React, { useState, useEffect } from 'react';
import { X, Bookmark, ShoppingCart, Star, ShieldCheck, MessageSquare, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function BookDetailModal({ book, onClose, onBorrow, onAddToCart, user }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(5.0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState('');
  const [reserveError, setReserveError] = useState('');

  useEffect(() => {
    if (book) {
      fetchReviews();
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
            <div className="flex gap-3 pt-2">
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
