import React, { useRef, useState } from 'react';
import { X, Printer, Copy, Check, ShieldCheck, Sparkles, BookOpen, CreditCard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '../api';

export default function DigitalLibraryCardModal({ isOpen, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !user) return null;

  const memberCode = `LIB-${String(user.id).padStart(6, '0')}`;
  const qrData = JSON.stringify({
    type: 'LIBRARY_READER_CARD',
    reader_id: user.id,
    name: user.name,
    email: user.email,
    code: memberCode,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(memberCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-lg p-6 relative border-blue-200/80 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> THẺ ĐỘC GIẢ ĐIỆN TỬ
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thẻ Thư Viện Số 4.0</h2>
          <p className="text-xs text-slate-500">Sử dụng mã QR hoặc Barcode để làm thủ tục mượn/trả nhanh tại quầy</p>
        </div>

        {/* PHYSICAL-LIKE SMART CARD DESIGN */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-sky-600 p-6 text-white shadow-xl border border-white/20 print:border-black"
        >
          {/* Decorative background watermark */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-32 h-32 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Card Top: Header & Chip */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wider uppercase text-blue-100">HỆ THỐNG THƯ VIỆN ONLINE</div>
                <div className="text-[10px] text-blue-200/80 tracking-widest font-mono">DIGITAL LIBRARY CARD</div>
              </div>
            </div>

            {/* Smart Card Chip Icon */}
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400/80 shadow flex items-center justify-center">
              <div className="w-8 h-5 border border-amber-600/40 rounded grid grid-cols-3 gap-0.5 p-0.5">
                <div className="border-r border-amber-600/30"></div>
                <div className="border-r border-amber-600/30"></div>
                <div></div>
              </div>
            </div>
          </div>

          {/* Card Middle: Info & QR */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 bg-white/20 shadow-md shrink-0 flex items-center justify-center text-white font-black text-base relative">
                {user.avatar_url ? (
                  <img
                    src={getImageUrl(user.avatar_url)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold text-blue-200">Chủ thẻ / Cardholder</div>
                <div className="text-base font-black tracking-wide truncate text-white uppercase drop-shadow-sm">
                  {user.name}
                </div>
                <div className="text-xs font-mono text-blue-100/90 truncate">{user.email}</div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-semibold text-white border border-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" /> Thành viên chính thức
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-2 bg-white rounded-xl shadow-lg border border-white/30 shrink-0">
              <QRCodeSVG
                value={qrData}
                size={92}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
          </div>

          {/* Card Bottom: Member Code & Simulated Barcode */}
          <div className="pt-3 border-t border-white/20 flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-blue-200 font-mono">MÃ THẺ ĐỘC GIẢ (ID)</div>
              <div className="text-base font-black font-mono tracking-wider text-yellow-300">
                {memberCode}
              </div>
            </div>

            {/* Simulated 1D Barcode Pattern */}
            <div className="flex flex-col items-end">
              <div className="h-6 flex items-end gap-[2px] bg-white/90 p-1 rounded">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3].map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 w-[2px]"
                    style={{ height: `${h * 4 + 4}px` }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-blue-200 mt-0.5 tracking-widest">{memberCode}</span>
            </div>
          </div>
        </div>

        {/* Instructions & Details */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Trạng thái thẻ:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Hạn mức mượn:</span>
            <span className="text-blue-700 font-bold">Tối đa 3 cuốn / 14 ngày</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Gia hạn trực tuyến:</span>
            <span className="text-slate-700 font-bold">01 lần (+7 ngày)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleCopyCode}
            className="flex-1 btn-secondary py-2.5 justify-center text-xs flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã sao chép mã!' : 'Sao Chép Mã Thẻ'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 btn-primary py-2.5 justify-center text-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> In / Tải Thẻ (Print)
          </button>
        </div>
      </div>
    </div>
  );
}
