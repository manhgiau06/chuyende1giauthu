import React, { useState } from 'react';
import { X, QrCode, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function MoMoPaymentModal({ isOpen, onClose, paymentInfo, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen || !paymentInfo) return null;

  const handleSimulateWebhook = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/payments/webhook', {
        transaction_code: paymentInfo.transaction_code,
        status: 'success',
      });
      setMsg('Thanh toán thành công qua Webhook!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Lỗi khi gửi webhook giả lập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-md p-6 relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="inline-flex p-3 bg-pink-500/20 text-pink-400 rounded-2xl mb-3">
          <QrCode className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-1">Cổng Thanh Toán MoMo</h2>
        <p className="text-xs text-slate-400 mb-4">Quét mã QR bằng App MoMo hoặc nhấn nút giả lập phía dưới</p>

        {msg && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold rounded-xl animate-pulse">
            {msg}
          </div>
        )}

        <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mb-4">
          <img src={paymentInfo.qr_code_url} alt="MoMo QR Code" className="w-48 h-48 mx-auto" />
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1 mb-4 text-left">
          <div className="flex justify-between"><span>Mã giao dịch:</span> <span className="font-bold text-white">{paymentInfo.transaction_code}</span></div>
          <div className="flex justify-between"><span>Số tiền:</span> <span className="font-bold text-pink-400 text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentInfo.payment?.amount || 0)}</span></div>
        </div>

        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 mb-4 flex items-center gap-2 text-left">
          <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>Hệ thống tự động lắng nghe <strong>Webhook từ MoMo/Bank</strong> để cập nhật trạng thái đơn hàng tức thì.</span>
        </div>

        <button
          onClick={handleSimulateWebhook}
          disabled={loading}
          className="btn-accent w-full justify-center py-3 text-sm shadow-lg shadow-emerald-500/30"
        >
          <Zap className="w-4 h-4" /> {loading ? 'Đang gửi Webhook...' : 'Giả Lập Webhook Thanh Toán Thành Công'}
        </button>
      </div>
    </div>
  );
}
