import React, { useState, useEffect } from 'react';
import { 
  X, Barcode, Copy, Check, BookOpen, Layers, Package, ShieldCheck, 
  Clock, AlertCircle, Sparkles, Printer, Info 
} from 'lucide-react';
import api from '../api';

export default function BookCopiesModal({ isOpen, onClose, bookId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedBarcode, setCopiedBarcode] = useState('');

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookDetail();
    } else {
      setBook(null);
      setError('');
    }
  }, [isOpen, bookId]);

  const fetchBookDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/books/${bookId}`);
      setBook(res.data.book);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin chi tiết đầu sách!');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBarcode = (barcode) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => {
      setCopiedBarcode('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xs">
              <Barcode className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Chi Tiết Sách & Danh Sách Mã Vạch Barcode</h3>
                {book && (
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-md text-[10px] font-bold border border-blue-400/30">
                    ID: #{book.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Xem toàn bộ các bản sao giấy vật lý, mã barcode in nhãn và tồn kho thực tế
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Đang tải dữ liệu mã vạch đầu sách...</span>
            </div>
          ) : book ? (
            <>
              {/* Top Overview Card */}
              <div className="flex flex-col sm:flex-row gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-24 sm:w-28 h-36 object-cover rounded-xl shadow-md border border-white shrink-0 mx-auto sm:mx-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg border border-blue-200">
                      {book.category?.name || 'Chung'}
                    </span>
                    {book.isbn && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-mono font-medium rounded-lg">
                        ISBN: {book.isbn}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sale_price)}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 leading-snug">
                    {book.title}
                  </h4>
                  
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><span className="font-semibold text-slate-700">Tác giả:</span> {book.author || 'Chưa rõ'}</div>
                    <div className="flex flex-wrap gap-4 text-slate-500">
                      <span><strong className="text-slate-600">NXB:</strong> {book.publisher || 'N/A'}</span>
                      <span><strong className="text-slate-600">Năm XB:</strong> {book.publish_year || 'N/A'}</span>
                      <span><strong className="text-slate-600">Mượn:</strong> {book.is_borrowable ? 'Bật' : 'Tắt'}</span>
                      <span><strong className="text-slate-600">Bán:</strong> {book.is_salable ? 'Bật' : 'Tắt'}</span>
                    </div>
                  </div>

                  {book.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1 border-t border-slate-200/60">
                      {book.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stat Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-blue-700 uppercase">Tổng Bản Sao Giấy</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {book.copies?.length || 0}
                  </div>
                  <div className="text-[10px] text-blue-600 mt-0.5">Bản in mã vạch mượn</div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase">Sẵn Sàng Mượn</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {book.copies?.filter(c => c.status === 'available').length || 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Khả dụng trên giá sách</div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-amber-700 uppercase">Đang Được Mượn</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {book.copies?.filter(c => c.status === 'borrowed').length || 0}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">Độc giả đang cầm</div>
                </div>

                <div className="bg-purple-50/80 border border-purple-200/80 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-purple-700 uppercase">Tồn Kho Mở Bán</div>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {book.inventory?.stock_quantity ?? 0}
                  </div>
                  <div className="text-[10px] text-purple-600 mt-0.5">
                    {book.inventory?.reserved_quantity ?? 0} cuốn đang giữ đơn
                  </div>
                </div>
              </div>

              {/* Barcode Copies Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Barcode className="w-4 h-4 text-blue-600" />
                      <span>Danh Sách Mã Vạch Bản Sao Giấy ({book.copies?.length || 0} cuốn)</span>
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Bấm vào mã vạch để copy nhanh
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3 w-12 text-center">STT</th>
                        <th className="p-3">Mã Vạch (Barcode)</th>
                        <th className="p-3">Trạng Thái Mượn</th>
                        <th className="p-3">Tình Trạng Sách</th>
                        <th className="p-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {!book.copies || book.copies.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-400">
                            Đầu sách này chưa được sinh bản sao mượn nào. Vui lòng vào nút "Chỉnh sửa" để nhập thêm bản mượn.
                          </td>
                        </tr>
                      ) : (
                        book.copies.map((copy, idx) => (
                          <tr key={copy.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 text-center text-slate-400 font-medium">
                              #{idx + 1}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                  {copy.barcode}
                                </span>
                              </div>
                            </td>

                            <td className="p-3">
                              {copy.status === 'available' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ● Sẵn sàng mượn
                                </span>
                              ) : copy.status === 'borrowed' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  ● Đang được mượn
                                </span>
                              ) : copy.status === 'lost' ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  ● Bị mất
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  ● {copy.status}
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              <span className="capitalize text-slate-600 font-medium">
                                {copy.condition === 'good' ? 'Mới / Tốt' : copy.condition === 'fair' ? 'Bình thường' : copy.condition || 'Tốt'}
                              </span>
                            </td>

                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleCopyBarcode(copy.barcode)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  copiedBarcode === copy.barcode
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                                title="Copy mã vạch barcode"
                              >
                                {copiedBarcode === copy.barcode ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Barcode</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {/* Footer Close Button */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
