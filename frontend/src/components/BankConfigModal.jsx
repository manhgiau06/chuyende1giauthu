import React, { useState, useEffect } from 'react';
import { X, Building2, CheckCircle, Save, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';

const VIETNAM_BANKS = [
  { id: 'MB', name: 'MB Bank (Ngân Hàng Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { id: 'ICB', name: 'VietinBank (Công Thương Việt Nam)' },
  { id: 'ACB', name: 'ACB (Ngân Hàng Á Châu)' },
  { id: 'TPB', name: 'TPBank (Ngân Hàng Tiên Phong)' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { id: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { id: 'HDB', name: 'HDBank (Phát Triển TP.HCM)' },
];

export default function BankConfigModal({ isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    bank_name: 'MB Bank (Ngân Hàng Quân Đội)',
    bank_id: 'MB',
    account_number: '090123456789',
    account_holder: 'THU VIEN DAI HOC ONLINE',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    setFetchLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api.get('/bank-config');
      if (res.data) {
        setFormData({
          bank_name: res.data.bank_name || 'MB Bank (Ngân Hàng Quân Đội)',
          bank_id: res.data.bank_id || 'MB',
          account_number: res.data.account_number || '090123456789',
          account_holder: res.data.account_holder || 'THU VIEN DAI HOC ONLINE',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleBankChange = (e) => {
    const selectedId = e.target.value;
    const bank = VIETNAM_BANKS.find(b => b.id === selectedId);
    if (bank) {
      setFormData({
        ...formData,
        bank_id: bank.id,
        bank_name: bank.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await api.post('/librarian/bank-config', formData);
      setMsg(res.data.message || 'Cập nhật tài khoản ngân hàng thành công!');
      if (onSaveSuccess) {
        onSaveSuccess(res.data.bank_config);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const previewQrUrl = `https://img.vietqr.io/image/${formData.bank_id}-${formData.account_number}-compact2.png?amount=100000&addInfo=TEST&accountName=${encodeURIComponent(formData.account_holder)}`;

  return (
    <div className="modal-overlay p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto my-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-md shadow-emerald-500/20 mb-1">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Cấu Hình Tài Khoản Ngân Hàng Nhận Tiền
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Dành cho Thủ Thư & Quản Trị Viên: Thiết lập STK nhận thanh toán đơn sách và tiền phạt
          </p>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {fetchLoading ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Đang tải cấu hình ngân hàng...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Ngân hàng thụ hưởng
              </label>
              <select
                value={formData.bank_id}
                onChange={handleBankChange}
                className="input-control text-xs py-2.5 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 w-full"
              >
                {VIETNAM_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Số tài khoản ngân hàng (STK)
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 090123456789"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="input-control font-mono font-bold text-sm py-2.5 pl-3 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 w-full text-blue-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                * Nhập đúng số tài khoản để mã QR tự động điền chính xác khi độc giả quét.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Tên chủ tài khoản (In hoa không dấu)
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: THU VIEN DAI HOC ONLINE"
                value={formData.account_holder}
                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value.toUpperCase() })}
                className="input-control font-bold text-xs py-2.5 pl-3 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 w-full uppercase"
              />
            </div>

            {/* Live QR Preview */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                <img
                  src={previewQrUrl}
                  alt="Xem trước QR"
                  className="w-20 h-20 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PREVIEW`;
                  }}
                />
              </div>
              <div className="text-xs space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-0.5">
                  Xem Trước Mã VietQR Mới
                </span>
                <p className="font-bold text-slate-800">{formData.bank_name}</p>
                <p className="font-mono text-slate-600 font-semibold">STK: {formData.account_number}</p>
                <p className="text-slate-500 text-[11px]">Chủ TK: {formData.account_holder}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Ngân Hàng Mới'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
