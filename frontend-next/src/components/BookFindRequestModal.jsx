'use client';
import React, { useState, useEffect } from 'react';
import {
  X, Search, Send, BookOpen, Clock, CheckCircle2, Sparkles,
  AlertCircle, Phone, User, RefreshCw, ArrowUpRight, Bell
} from 'lucide-react';
import api from '../api';

export default function BookFindRequestModal({
  isOpen,
  onClose,
  user,
  initialKeyword = '',
  onSelectBook,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [bookTitle, setBookTitle] = useState('');
  const [authorOrPublisher, setAuthorOrPublisher] = useState('');
  const [purpose, setPurpose] = useState('both'); // 'borrow' | 'buy' | 'both'
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBookTitle(initialKeyword || '');
      setContactPhone(user?.phone || '');
      setMsg('');
      setError('');
      fetchMyRequests();
    }
  }, [isOpen, initialKeyword, user]);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/book-find-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setError('Vui lòng nhập tên sách hoặc chủ đề bạn muốn nhờ Thủ thư tìm!');
      return;
    }
    setSubmitting(true);
    setError('');
    setMsg('');
    try {
      const res = await api.post('/book-find-requests', {
        book_title: bookTitle,
        author_or_publisher: authorOrPublisher,
        purpose,
        contact_phone: contactPhone,
        description,
      });
      setMsg(res.data.message);
      setBookTitle('');
      setAuthorOrPublisher('');
      setDescription('');
      await fetchMyRequests();
      setActiveTab('history');
      if (onSuccess) onSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu tìm sách!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const foundCount = requests.filter((r) => r.status === 'found').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Nhờ Thủ Thư Tìm Sách Giúp Bạn</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-full">
                  Hỗ trợ 24/7
                </span>
              </h3>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Bạn chưa tìm thấy sách trên kệ? Gửi yêu cầu để Thủ thư tìm nguồn sách và báo ngay cho bạn khi có!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Tìm Sách
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Yêu Cầu Của Tôi ({requests.length})</span>
              {foundCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-black">
                  {foundCount} đã có sách
                </span>
              )}
            </button>
          </div>

          {activeTab === 'history' && (
            <button
              type="button"
              onClick={fetchMyRequests}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {msg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên cuốn sách hoặc chủ đề bạn cần tìm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thiết Kế Hệ Thống Lớn, Sách học Thuật toán Python, Harry Potter tập 3..."
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tác giả / Nhà xuất bản (Nếu nhớ)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Robert C. Martin, NXB Trẻ..."
                    value={authorOrPublisher}
                    onChange={(e) => setAuthorOrPublisher(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số điện thoại nhận tin báo
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 0987654321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nhu cầu của bạn khi có sách
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: 'both', label: '🌟 Mượn hoặc Mua đều được' },
                    { id: 'borrow', label: '📗 Chỉ muốn Mượn đọc' },
                    { id: 'buy', label: '🛒 Muốn Đặt mua sách mới' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPurpose(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        purpose === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mô tả thêm cho Thủ thư (Màu bìa, năm xuất bản, nội dung tóm tắt...)
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Mình nhớ bìa màu xanh dương, sách chuyên về kiến trúc Microservices hoặc bản dịch tiếng Việt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Ngay khi Thủ thư tìm được sách trong kho hoặc nhập bổ sung về thư viện, hệ thống sẽ <strong>báo tự động vào Hộp thư Thông báo (biểu tượng Chuông 🔔)</strong> kèm đường dẫn để bạn mượn/mua ngay!
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Đang gửi yêu cầu...' : 'Gửi Nhờ Thủ Thư Tìm Sách'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  Đang tải danh sách yêu cầu tìm sách của bạn...
                </div>
              ) : requests.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-3">
                  <Search className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">Bạn chưa gửi yêu cầu tìm sách nào</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Nếu có cuốn sách nào bạn tìm chưa thấy trong thư viện, hãy chuyển sang tab "Gửi Yêu Cầu Tìm Sách" để Thủ thư hỗ trợ tìm giúp nhé!
                  </p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      req.status === 'found'
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                        : req.status === 'searching'
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900">
                            📚 {req.book_title}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {req.purpose === 'borrow'
                              ? 'Muốn mượn'
                              : req.purpose === 'buy'
                              ? 'Muốn mua'
                              : 'Mượn hoặc Mua'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {req.author_or_publisher && (
                            <span className="mr-3">Tác giả/NXB: <strong>{req.author_or_publisher}</strong></span>
                          )}
                          <span>Ngày gửi: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>

                      <div>
                        {req.status === 'found' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs inline-flex items-center gap-1">
                            🎉 Đã Tìm Thấy & Có Sách!
                          </span>
                        ) : req.status === 'searching' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                            🔎 Thủ thư đang tìm giúp...
                          </span>
                        ) : req.status === 'unavailable' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            ❌ Tạm hết nguồn sách
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ⏳ Chờ Thủ thư tiếp nhận
                          </span>
                        )}
                      </div>
                    </div>

                    {req.description && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                        <span className="font-bold text-slate-700">Ghi chú của bạn:</span> {req.description}
                      </div>
                    )}

                    {/* Librarian Feedback Box */}
                    {req.librarian_note && (
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 space-y-2 shadow-2xs">
                        <div className="text-[11px] font-black text-indigo-700 uppercase flex items-center justify-between">
                          <span>💬 Phản hồi từ Thủ thư ({req.librarian_name || 'Thư viện'}):</span>
                          {req.notified_at && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(req.notified_at).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {req.librarian_note}
                        </p>

                        {/* Matched Book Card */}
                        {req.matched_book && (
                          <div className="mt-2 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-3">
                              <img
                                src={req.matched_book.cover_image}
                                alt={req.matched_book.title}
                                className="w-10 h-14 object-cover rounded-lg border border-white shadow-xs shrink-0"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';
                                }}
                              />
                              <div>
                                <div className="text-xs font-black text-slate-900">
                                  {req.matched_book.title}
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  Tác giả: {req.matched_book.author} · Giá:{' '}
                                  <strong className="text-pink-600">
                                    {new Intl.NumberFormat('vi-VN').format(req.matched_book.sale_price || 0)}đ
                                  </strong>
                                </div>
                                <div className="text-[10px] text-emerald-700 font-bold">
                                  Sẵn sàng mượn: {req.matched_book.available_copies_count || 0} bản · Kho bán: {req.matched_book.available_stock_count || 0} cuốn
                                </div>
                              </div>
                            </div>

                            {onSelectBook && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onSelectBook(req.matched_book);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" /> Xem & Mượn / Mua Ngay
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
