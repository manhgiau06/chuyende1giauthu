import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle, ShieldCheck, Copy, Check, Building2, User, CreditCard, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../api';

export default function BankPaymentModal({ isOpen, onClose, paymentInfo, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Reset state mỗi khi mở modal với giao dịch mới hoặc giao dịch khác
  useEffect(() => {
    if (isOpen && paymentInfo) {
      const isAlreadyConfirmed = Boolean(paymentInfo.payment?.transfer_confirmed_at);
      setConfirmed(isAlreadyConfirmed);
      setMsg(isAlreadyConfirmed ? 'Giao dịch này đã được bạn gửi xác nhận trước đó.' : '');
      setError('');
      setLoading(false);
      setCopiedField(null);
    } else if (!isOpen) {
      setConfirmed(false);
      setMsg('');
      setError('');
      setLoading(false);
    }
  }, [paymentInfo?.payment?.id, isOpen]);

  if (!isOpen || !paymentInfo) return null;

  const bankInfo = paymentInfo.bank_info || {
    bank_name: 'MB Bank (Ngân Hàng Quân Đội)',
    account_number: '090123456789',
    account_holder: 'THU VIEN DAI HOC ONLINE',
    amount: paymentInfo.payment?.amount || 0,
    transfer_content: paymentInfo.transaction_code,
    qr_code_url: paymentInfo.qr_code_url,
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/payments/${paymentInfo.payment?.id}/confirm-transfer`);
      setConfirmed(true);
      setMsg(res.data.message || 'Đã gửi xác nhận chuyển khoản đến Thủ thư!');
      if (onSuccess) {
        onSuccess(true); // true = awaiting approval
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi xác nhận, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-sky-500 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Thanh Toán Chuyển Khoản Ngân Hàng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Quét mã VietQR bằng App Ngân Hàng bất kỳ hoặc chuyển khoản theo thông tin bên dưới:
          </p>
        </div>

        {msg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Bank & VietQR Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-6 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          {/* Bigger VietQR Code (Occupies 5 cols on desktop) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-md border border-slate-200/80">
            <img 
              src={bankInfo.qr_code_url} 
              alt="VietQR Chuyển khoản" 
              className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-xl"
              onError={(e) => {
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`BANK|${bankInfo.account_number}|${bankInfo.amount}|${bankInfo.transfer_content}`)}`;
              }}
            />
            <span className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-blue-600" /> Mã VietQR Tự Động
            </span>
          </div>

          {/* Bank Transfer Details (Occupies 7 cols on desktop) */}
          <div className="md:col-span-7 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Ngân hàng thụ hưởng:</span>
              <span className="font-bold text-slate-800 text-sm">{bankInfo.bank_name}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Số tài khoản:</span>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 mt-0.5">
                <span className="font-mono font-black text-blue-700 text-sm tracking-wider">{bankInfo.account_number}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankInfo.account_number, 'stk')}
                  className="text-slate-500 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Chủ tài khoản:</span>
              <span className="font-bold text-slate-800">{bankInfo.account_holder}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Số tiền thanh toán:</span>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 mt-0.5">
                <span className="font-bold text-rose-600 text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bankInfo.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(bankInfo.amount), 'amount')}
                  className="text-slate-500 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sao chép số tiền"
                >
                  {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Nội dung chuyển khoản (bắt buộc):</span>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 mt-0.5 bg-blue-50/30">
                <span className="font-mono font-black text-indigo-700 text-xs">{bankInfo.transfer_content}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankInfo.transfer_content, 'content')}
                  className="text-slate-500 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Sao chép nội dung chuyển khoản"
                >
                  {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 mb-5 flex items-start gap-2">
          <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>Quy trình phê duyệt:</strong> Sau khi bạn chuyển khoản thành công, vui lòng nhấn nút <strong>"Xác Nhận Đã Chuyển Khoản"</strong> bên dưới. <strong>Thủ thư</strong> sẽ kiểm tra biến động số dư và duyệt đơn hàng/phiếu phạt của bạn.
          </div>
        </div>

        {/* Action Button */}
        {confirmed ? (
          <div className="text-center space-y-2.5">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold border border-blue-200 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Giao dịch đang chờ Thủ thư đối soát & phê duyệt. Bạn có thể đóng cửa sổ này.</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmed(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all w-1/2 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Bấm nếu bạn muốn gửi lại xác nhận chuyển khoản"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gửi Lại Xác Nhận
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all w-1/2 cursor-pointer shadow-sm"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConfirmTransfer}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              'Đang gửi xác nhận...'
            ) : (
              <>
                Tôi Đã Chuyển Khoản Xong — Gửi Thủ Thư Duyệt <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

      </div>
    </div>
  );
}
