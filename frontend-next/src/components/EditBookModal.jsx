'use client';
import React, { useState, useEffect } from 'react';
import { 
  X, Pencil, Upload, Link, AlertCircle, CheckCircle, Loader2, 
  Layers, PackagePlus, Barcode, DollarSign, BookOpen, ShieldCheck 
} from 'lucide-react';
import api from '../api';

export default function EditBookModal({ isOpen, onClose, book, categories = [], onBookUpdated }) {
  const [imageMode, setImageMode] = useState('keep'); // 'keep', 'file', 'url'
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category_id: '',
    isbn: '',
    publisher: '',
    publish_year: '',
    sale_price: 0,
    description: '',
    is_borrowable: true,
    is_salable: true,
    additional_copies: 0,
    add_sale_stock: 0,
  });

  // Populate data when book changes or modal opens
  useEffect(() => {
    if (isOpen && book) {
      setError('');
      setMsg('');
      setImageMode('keep');
      setCoverFile(null);
      setCoverPreview(book.cover_image || '');

      setFormData({
        title: book.title || '',
        author: book.author || '',
        category_id: book.category_id || (categories[0]?.id ?? ''),
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publish_year: book.publish_year ? book.publish_year.toString() : '',
        sale_price: book.sale_price ? Number(book.sale_price) : 0,
        description: book.description || '',
        is_borrowable: book.is_borrowable !== undefined ? Boolean(book.is_borrowable) : true,
        is_salable: book.is_salable !== undefined ? Boolean(book.is_salable) : true,
        additional_copies: 0,
        add_sale_stock: 0,
      });
    }
  }, [isOpen, book, categories]);

  if (!isOpen || !book) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const objectUrl = URL.createObjectURL(file);
      setCoverPreview(objectUrl);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, cover_url: url }));
    setCoverPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên đầu sách!');
      return;
    }

    if (!formData.category_id) {
      setError('Vui lòng chọn thể loại cho sách!');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('category_id', formData.category_id);
      if (formData.isbn) data.append('isbn', formData.isbn.trim());
      if (formData.publisher) data.append('publisher', formData.publisher.trim());
      if (formData.publish_year) data.append('publish_year', formData.publish_year);
      data.append('sale_price', formData.sale_price);
      if (formData.description) data.append('description', formData.description.trim());
      data.append('is_borrowable', formData.is_borrowable ? '1' : '0');
      data.append('is_salable', formData.is_salable ? '1' : '0');

      if (Number(formData.additional_copies) > 0) {
        data.append('additional_copies', Number(formData.additional_copies));
      }
      if (Number(formData.add_sale_stock) > 0) {
        data.append('add_sale_stock', Number(formData.add_sale_stock));
      }

      if (imageMode === 'file' && coverFile) {
        data.append('cover_image', coverFile);
      } else if (imageMode === 'url' && formData.cover_url?.trim()) {
        data.append('cover_url', formData.cover_url.trim());
      }

      const res = await api.post(`/books/${book.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg(res.data.message || 'Cập nhật đầu sách thành công!');

      if (onBookUpdated) {
        onBookUpdated(res.data.book);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      const apiMsg = err.response?.data?.message;
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        setError(errors[firstErrorKey][0]);
      } else {
        setError(apiMsg || 'Đã xảy ra lỗi khi cập nhật đầu sách!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-xs">
              <Pencil className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Chỉnh Sửa Đầu Sách</h3>
                <span className="px-2 py-0.5 bg-white/20 text-sky-100 rounded-md text-[10px] font-bold">
                  ID: #{book.id}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Cập nhật thông tin, ảnh bìa và bổ sung số lượng bản mượn & tồn kho bán
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {msg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left Column: Cover Image & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Ảnh Bìa Sách</label>
              
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center group">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
                    <span className="text-xs">Chưa có ảnh bìa</span>
                  </div>
                )}
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageMode('keep')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    imageMode === 'keep' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Giữ ảnh cũ
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    imageMode === 'file' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tải file
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    imageMode === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dán link
                </button>
              </div>

              {imageMode === 'file' && (
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-colors text-center">
                    <Upload className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-blue-700">Chọn file ảnh từ máy</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP tối đa 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {imageMode === 'url' && (
                <div className="mt-2">
                  <div className="relative">
                    <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://example.com/anh.jpg"
                      value={formData.cover_url || ''}
                      onChange={handleUrlChange}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Book Details (2 cols span) */}
            <div className="md:col-span-2 space-y-4">
              {/* Title & Author */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Đầu Sách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                    placeholder="VD: Lập Trình Laravel & React Nâng Cao"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tác Giả <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thể Loại <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ISBN, Publisher, Year, Price */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mã ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="VD: 978-..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nhà Xuất Bản</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="VD: NXB Trẻ"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Năm XB</label>
                  <input
                    type="number"
                    value={formData.publish_year}
                    onChange={(e) => setFormData({ ...formData, publish_year: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="VD: 2024"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Giá Bán (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-pink-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả & Giới Thiệu Tóm Tắt</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Nhập nội dung tóm tắt, mục lục nổi bật của cuốn sách..."
                />
              </div>

              {/* Inventory Increments & Toggles Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-sky-50/70 rounded-2xl border border-blue-200/80 space-y-3">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PackagePlus className="w-4 h-4 text-blue-600" />
                  <span>Nghiệp Vụ Nhập Thêm Số Lượng Kho</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Nhập Thêm Bản Mượn:</span>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        Hiện có: {book.available_copies_count ?? 0} bản
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.additional_copies}
                        onChange={(e) => setFormData({ ...formData, additional_copies: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                        placeholder="Số cuốn in mã vạch mới..."
                      />
                      <span className="text-xs text-slate-500 whitespace-nowrap">cuốn</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hệ thống tự động cấp mã vạch tiếp theo: BC-{book.id}-...
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Bổ Sung Tồn Kho Bán:</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Hiện có: {book.available_stock_count ?? 0} cuốn
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.add_sale_stock}
                        onChange={(e) => setFormData({ ...formData, add_sale_stock: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="Số cuốn cộng dồn kho..."
                      />
                      <span className="text-xs text-slate-500 whitespace-nowrap">cuốn</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tồn kho mới = {Number(book.available_stock_count ?? 0) + Number(formData.add_sale_stock || 0)} cuốn
                    </p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-1 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_borrowable}
                      onChange={(e) => setFormData({ ...formData, is_borrowable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                    />
                    <span>Cho phép mượn sách giấy</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_salable}
                      onChange={(e) => setFormData({ ...formData, is_salable: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Cho phép mở bán sách mới</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu cập nhật...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Lưu Thay Đổi Đầu Sách</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
