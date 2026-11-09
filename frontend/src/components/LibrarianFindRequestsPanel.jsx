import React, { useState, useEffect } from 'react';
import {
  Search, Bell, CheckCircle2, Clock, Sparkles, BookOpen, Send,
  User, Phone, Mail, AlertCircle, RefreshCw, XCircle
} from 'lucide-react';
import api from '../api';

export default function LibrarianFindRequestsPanel({ books = [], onPendingCountChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'searching' | 'found' | 'unavailable'
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Modal/Inline state for "Báo Đã Có Sách Cho Khách"
  const [activeNotifyRequest, setActiveNotifyRequest] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [librarianNote, setLibrarianNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/book-find-requests');
      const list = res.data.requests || [];
      setRequests(list);
      if (onPendingCountChange) {
        onPendingCountChange(res.data.pending_count || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách yêu cầu tìm sách của độc giả!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenFoundModal = (req) => {
    setActiveNotifyRequest(req);
    // Tự động gợi ý cuốn sách khớp tên nếu có trong kho
    const q = (req.book_title || '').toLowerCase();
    const autoMatch = books.find(
      (b) => b.title?.toLowerCase().includes(q) || q.includes(b.title?.toLowerCase() || '___')
    );
    setSelectedBookId(req.matched_book_id || autoMatch?.id || '');
    setLibrarianNote(
      req.librarian_note ||
        `Tin vui! Thủ thư đã tìm thấy cuốn sách "${req.book_title}" cho bạn. Sách hiện đã có sẵn tại Thư viện, mời bạn vào đặt mượn/mua trực tuyến hoặc ghé quầy nhận sách nhé!`
    );
  };

  const handleUpdateStatus = async (reqId, newStatus, customBookId = null, customNote = '') => {
    setSubmittingId(reqId);
    setError('');
    setMsg('');
    try {
      const res = await api.put('/book-find-requests', {
        id: reqId,
        status: newStatus,
        matched_book_id: customBookId || null,
        librarian_note: customNote,
      });
      setMsg(res.data.message);
      setActiveNotifyRequest(null);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật và gửi thông báo cho khách!');
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.book_title?.toLowerCase().includes(q) ||
        r.author_or_publisher?.toLowerCase().includes(q) ||
        r.reader_name?.toLowerCase().includes(q) ||
        r.reader_email?.toLowerCase().includes(q) ||
        r.contact_phone?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const searchingCount = requests.filter((r) => r.status === 'searching').length;
  const foundCount = requests.filter((r) => r.status === 'found').length;

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-emerald-700 font-black cursor-pointer">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-amber-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Chờ Tiếp Nhận Tìm</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount} yêu cầu</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Khách vừa gửi nhờ tìm</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-blue-600 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Thủ Thư Đang Tìm</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{searchingCount} yêu cầu</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đang kiểm kho / đặt nhập</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-emerald-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Đã Tìm Thấy & Báo Khách</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{foundCount} yêu cầu</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đã gửi thông báo vào hộp thư</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-indigo-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Yêu Cầu Tìm Sách</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{requests.length} lượt</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ độc giả 24/7</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `Tất cả (${requests.length})` },
              { id: 'pending', label: `⏳ Chờ tìm (${pendingCount})` },
              { id: 'searching', label: `🔎 Đang tìm (${searchingCount})` },
              { id: 'found', label: `🎉 Đã báo có sách (${foundCount})` },
              { id: 'unavailable', label: '❌ Chưa có nguồn' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên sách, tên khách, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={fetchRequests}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="p-4">Mã YC</th>
                <th className="p-4">Khách Hàng Yêu Cầu</th>
                <th className="p-4">Sách Khách Cần Tìm</th>
                <th className="p-4">Nhu Cầu</th>
                <th className="p-4">Trạng Thái & Sách Đã Gắn</th>
                <th className="p-4 text-right">Thao Tác Của Thủ Thư</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    Chưa có yêu cầu nhờ tìm sách nào trong mục này.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-500">#{req.id}</td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{req.reader_name}</div>
                      <div className="text-[11px] text-slate-500">{req.reader_email}</div>
                      {(req.contact_phone || req.reader_phone) && (
                        <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                          📞 {req.contact_phone || req.reader_phone}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Gửi lúc: {new Date(req.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>

                    <td className="p-4 max-w-sm">
                      <div className="font-black text-slate-900 text-sm">📚 {req.book_title}</div>
                      {req.author_or_publisher && (
                        <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                          Tác giả / NXB: {req.author_or_publisher}
                        </div>
                      )}
                      {req.description && (
                        <div className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                          "{req.description}"
                        </div>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]">
                        {req.purpose === 'borrow'
                          ? '📗 Muốn Mượn'
                          : req.purpose === 'buy'
                          ? '🛒 Muốn Mua'
                          : '🌟 Mượn / Mua'}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs space-y-1.5">
                      <div>
                        {req.status === 'found' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            🎉 Đã báo có sách cho khách
                          </span>
                        ) : req.status === 'searching' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                            🔎 Đang tìm sách...
                          </span>
                        ) : req.status === 'unavailable' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            ❌ Chưa có nguồn
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            ⏳ Chờ Thủ thư tìm
                          </span>
                        )}
                      </div>

                      {req.matched_book && (
                        <div className="text-[11px] bg-emerald-50 text-emerald-900 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                          🔗 Đã gắn sách kho: <strong>{req.matched_book.title}</strong>
                        </div>
                      )}

                      {req.librarian_note && (
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          💬 {req.librarian_note}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                      {req.status === 'pending' && (
                        <button
                          type="button"
                          disabled={submittingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'searching')}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Nhận yêu cầu và báo cho khách biết Thủ thư đang tìm"
                        >
                          <Search className="w-3.5 h-3.5" /> Nhận Tìm Sách
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={submittingId === req.id}
                        onClick={() => handleOpenFoundModal(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Báo cho khách hàng biết đã tìm thấy sách và gửi thông báo vào Hộp thư của khách"
                      >
                        <Bell className="w-3.5 h-3.5" /> Báo Đã Có Sách
                      </button>

                      {req.status !== 'unavailable' && req.status !== 'found' && (
                        <button
                          type="button"
                          disabled={submittingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'unavailable')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Báo tạm thời chưa tìm được nguồn sách"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Chưa có
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Báo Đã Có Sách Cho Khách */}
      {activeNotifyRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-300" />
                <h4 className="font-black text-base">
                  Báo Đã Tìm Thấy Sách Cho Khách Hàng
                </h4>
              </div>
              <button
                onClick={() => setActiveNotifyRequest(null)}
                className="text-white/80 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500">
                  Khách hàng: <strong className="text-slate-900">{activeNotifyRequest.reader_name}</strong> ({activeNotifyRequest.reader_email})
                </div>
                <div className="text-slate-500">
                  Sách khách cần tìm: <strong className="text-indigo-700 text-sm">{activeNotifyRequest.book_title}</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  1. Gắn đầu sách tương ứng trong Kho sách (Để khách bấm vào Mượn/Mua ngay)
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Không gắn cố định (Khách đến quầy nhận trực tiếp) --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} - {b.title} ({b.author}) — Mượn: {b.available_copies_count || 0} | Bán: {b.available_stock_count || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  2. Lời nhắn của Thủ thư gửi tới Hộp thư của khách
                </label>
                <textarea
                  rows={4}
                  value={librarianNote}
                  onChange={(e) => setLibrarianNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNotifyRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={submittingId === activeNotifyRequest.id}
                  onClick={() =>
                    handleUpdateStatus(
                      activeNotifyRequest.id,
                      'found',
                      selectedBookId ? Number(selectedBookId) : null,
                      librarianNote
                    )
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Thông Báo Có Sách Cho Khách</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
