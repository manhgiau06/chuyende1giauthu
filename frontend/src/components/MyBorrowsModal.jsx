import React, { useState, useEffect } from 'react';
import { X, BookmarkCheck, Calendar, Clock, RefreshCw, CreditCard, AlertTriangle, Mail, Bell, Printer, Trash2, BookOpen } from 'lucide-react';
import api from '../api';
import PrintReceiptModal from './PrintReceiptModal';

export default function MyBorrowsModal({ isOpen, onClose, onOpenPayment }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'reservations', or 'emails'
  const [tickets, setTickets] = useState([]);
  const [emails, setEmails] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Print receipt state
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState(null);

  const fetchMyBorrows = async () => {
    setLoading(true);
    try {
      const [resT, resE, resR] = await Promise.all([
        api.get('/borrow-tickets'),
        api.get('/notifications/my-emails'),
        api.get('/reservations'),
      ]);
      setTickets(resT.data.data || []);
      setEmails(resE.data.emails || []);
      setReservations(resR.data.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMyBorrows();
  }, [isOpen]);

  const handleRenew = async (ticketId) => {
    try {
      const res = await api.post(`/borrow-tickets/${ticketId}/renew`);
      setMsg(res.data.message);
      fetchMyBorrows();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Không thể gia hạn sách!');
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ lượt đặt trước này không?')) return;
    try {
      const res = await api.delete(`/reservations/${resId}`);
      setMsg(res.data.message);
      fetchMyBorrows();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Không thể huỷ lượt đặt trước!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-3xl p-6 relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tủ Sách & Hộp Thư Thông Báo</h2>
              <p className="text-xs text-slate-400">Danh sách phiếu mượn, sách đặt trước & hộp thư email nhắc hạn</p>
            </div>
          </div>

          <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tickets' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Phiếu Mượn ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'reservations' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Đặt Trước ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'emails' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Hộp Thư ({emails.length})
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-xl">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-400">Đang tải dữ liệu...</div>
        ) : activeTab === 'tickets' ? (
          /* TICKETS TAB */
          tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5">
              Bạn chưa mượn cuốn sách nào. Hãy chọn sách từ danh mục để đăng ký mượn!
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Phiếu mượn #{t.id}</span>
                      <span className={`badge ${
                        t.status === 'borrowed' ? 'badge-borrow' : t.status === 'overdue' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {t.status === 'borrowed' ? 'Đang mượn' : t.status === 'overdue' ? 'Quá hạn' : t.status === 'pending' ? 'Chờ duyệt' : 'Đã trả'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày mượn: {t.borrow_date || 'N/A'} | Hạn trả: <span className="font-bold text-amber-400">{t.due_date}</span>
                      </div>
                      <div>Số lần gia hạn: <span className="text-teal-300 font-semibold">{t.renewed_count} / 1 lần</span></div>
                    </div>

                    {/* Borrowed items list */}
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-slate-400 mb-1">Các cuốn sách mượn:</div>
                      <div className="space-y-1">
                        {t.items?.map((item) => (
                          <div key={item.id} className="text-xs text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5 flex items-center justify-between">
                            <span>• {item.book_copy?.book?.title || 'Sách'}</span>
                            <span className="text-slate-400 text-[10px]">Mã barcode: {item.book_copy?.barcode}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {t.total_late_fee > 0 && (
                      <div className="p-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          Phí phạt quá hạn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.total_late_fee)}
                        </div>
                        <button
                          onClick={() => onOpenPayment('borrow_ticket', t.id)}
                          className="btn-accent text-xs py-1 px-2.5 flex items-center gap-1 shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Thanh Toán Ngân Hàng
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                    <button
                      onClick={() => setSelectedTicketForPrint(t)}
                      className="btn-secondary text-xs w-full justify-center"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-400" /> In Phiếu Mượn
                    </button>

                    {t.status === 'borrowed' && (
                      <button
                        onClick={() => handleRenew(t.id)}
                        disabled={t.renewed_count >= 1}
                        className={`btn-secondary text-xs w-full justify-center ${
                          t.renewed_count >= 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-teal-400" /> Gia Hạn (+7 Ngày)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'reservations' ? (
          /* RESERVATIONS TAB */
          reservations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5">
              Bạn hiện không có cuốn sách nào trong danh sách đặt trước. Khi một cuốn sách hết bản mượn, bạn có thể bấm "Đặt Trước Sách" tại chi tiết sách để vào hàng đợi tự động.
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-slate-900/60 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">Mã đặt #{r.id}</span>
                      <span
                        className={`badge ${
                          r.status === 'notified'
                            ? 'badge-warning'
                            : r.status === 'pending'
                            ? 'badge-borrow'
                            : r.status === 'fulfilled'
                            ? 'badge-success'
                            : 'badge-secondary'
                        }`}
                      >
                        {r.status === 'notified'
                          ? '🔔 SÁCH ĐÃ VỀ - ĐANG GIỮ 48H'
                          : r.status === 'pending'
                          ? '⏳ ĐANG XẾP HÀNG CHỜ'
                          : r.status === 'fulfilled'
                          ? '✅ ĐÃ NHẬN SÁCH'
                          : 'ĐÃ HUỶ'}
                      </span>
                      {r.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
                          Vị trí hàng đợi: #{r.priority_number}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      {r.book?.cover_image && (
                        <img
                          src={r.book.cover_image}
                          alt={r.book.title}
                          className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-teal-300">{r.book?.title}</h4>
                        <p className="text-xs text-slate-400">Tác giả: {r.book?.author}</p>
                        <p className="text-xs text-slate-400">Thể loại: {r.book?.category?.name || 'N/A'}</p>
                      </div>
                    </div>

                    {r.status === 'notified' && (
                      <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                        <strong>Lưu ý:</strong> Sách đã có sẵn tại thư viện và được giữ cho bạn đến{' '}
                        <span className="font-bold text-white">
                          {r.expires_at ? new Date(r.expires_at).toLocaleString('vi-VN') : 'trong 48 giờ'}
                        </span>
                        . Vui lòng đến quầy hoàn tất thủ tục mượn sách!
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end items-end gap-2 shrink-0">
                    <div className="text-[11px] text-slate-400">
                      Ngày đặt: {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    {['pending', 'notified'].includes(r.status) && (
                      <button
                        onClick={() => handleCancelReservation(r.id)}
                        className="btn-secondary py-1.5 px-3 text-xs text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/10 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Huỷ Đặt Trước
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* EMAILS TAB */
          emails.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5">
              Chưa có email thông báo nào được gửi. Worker 07:00 AM sẽ tự động quét và gửi mail nhắc trước hạn 2 ngày & quá hạn.
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((e) => (
                <div key={e.id} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-400" /> {e.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(e.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-950/60 p-3 rounded-lg border border-white/5">
                    {e.content}
                  </pre>
                </div>
              ))}
            </div>
          )
        )}

        {/* Printable Receipt Modal */}
        <PrintReceiptModal
          isOpen={!!selectedTicketForPrint}
          onClose={() => setSelectedTicketForPrint(null)}
          data={selectedTicketForPrint}
          type="ticket"
        />
      </div>
    </div>
  );
}
