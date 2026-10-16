'use client';
import React from 'react';
import { X, Printer, CheckCircle, BookOpen, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function PrintReceiptModal({ isOpen, onClose, data, type }) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isOrder = type === 'order';

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white print:hidden">
          <X className="w-6 h-6" />
        </button>

        {/* Printable Area */}
        <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-2xl space-y-6 text-xs" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <div className="inline-flex p-2 bg-indigo-600 text-white rounded-xl mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-indigo-950 uppercase">
              {isOrder ? 'HÓA ĐƠN MUA SÁCH TRỰC TUYẾN' : 'PHIẾU MƯỢN SÁCH THƯ VIỆN'}
            </h2>
            <p className="text-[11px] text-slate-500">Thư Viện Online - Hệ Thống Quản Lý Thư Viện Hỗn Hợp</p>
            <p className="text-[10px] text-slate-400">Mã chứng từ: {isOrder ? data.order_number : `TICKET-#${data.id}`}</p>
          </div>

          {/* Customer / Reader Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <div className="font-bold text-slate-500 uppercase text-[10px]">Thông tin độc giả / Người nhận:</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{isOrder ? data.recipient_name : (data.reader?.name || 'Độc giả')}</div>
              <div>Email: {data.reader?.email || 'N/A'}</div>
              <div>SĐT: {isOrder ? data.recipient_phone : (data.reader?.phone || 'N/A')}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-500 uppercase text-[10px]">Thời gian chứng từ:</div>
              <div className="font-semibold text-slate-800 mt-0.5">{new Date(data.created_at).toLocaleString('vi-VN')}</div>
              {isOrder ? (
                <div>Trạng thái: <span className="font-bold text-emerald-600 uppercase">{data.payment_status}</span></div>
              ) : (
                <div>Hạn trả: <span className="font-bold text-amber-600">{data.due_date}</span></div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2">Sản phẩm / Sách</th>
                  {isOrder ? (
                    <>
                      <th className="py-2 text-center">SL</th>
                      <th className="py-2 text-right">Đơn giá</th>
                      <th className="py-2 text-right">Thành tiền</th>
                    </>
                  ) : (
                    <th className="py-2 text-right">Mã vạch Barcode</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isOrder ? (
                  data.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-slate-900">{item.book?.title || 'Sách'}</td>
                      <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
                      <td className="py-2.5 text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unit_price)}</td>
                      <td className="py-2.5 text-right font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  data.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-slate-900">{item.book_copy?.book?.title || 'Sách'}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-indigo-700">{item.book_copy?.barcode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          {isOrder && (
            <div className="border-t-2 border-slate-300 pt-3 space-y-1 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính sách:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.total_amount - data.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-indigo-950 pt-2 border-t">
                <span>TỔNG CỘNG THANH TOÁN:</span>
                <span className="text-pink-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.total_amount)}</span>
              </div>
            </div>
          )}

          {/* Footer Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[11px] text-slate-500 border-t">
            <div>
              <p className="font-bold text-slate-800">ĐỘC GIẢ / NGƯỜI NHẬN</p>
              <p className="text-[10px] text-slate-400 mt-8">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">XÁC NHẬN THỦ THƯ</p>
              <p className="text-[10px] text-slate-400 mt-8">(Đã xác nhận trên hệ thống)</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 print:hidden">
          <button onClick={handlePrint} className="btn-primary flex-1 justify-center py-2.5">
            <Printer className="w-4 h-4" /> In Chứng Từ / Phiếu Nhận
          </button>
          <button onClick={onClose} className="btn-secondary py-2.5 px-5">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
