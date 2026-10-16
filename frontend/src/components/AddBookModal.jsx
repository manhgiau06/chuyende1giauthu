import React, { useState, useEffect } from 'react';
import { X, BookPlus, Upload, Link, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';

export default function AddBookModal({ isOpen, onClose, categories = [], onBookCreated }) {
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'file'
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
    publish_year: new Date().getFullYear().toString(),
    sale_price: 120000,
    borrow_copies_count: 3,
    sale_stock_count: 10,
    cover_url: '',
    description: '',
  });

  // Ensure category_id is defaulted when categories change or modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMsg('');
      if (categories.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: categories[0].id }));
      }
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

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

    // Ensure category_id is set
    const selectedCategoryId = formData.category_id || (categories[0]?.id ?? '');
    if (!selectedCategoryId) {
      setError('Vui lòng chọn thể loại cho sách hoặc tạo thể loại mới trước!');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('category_id', selectedCategoryId);
      if (formData.isbn) data.append('isbn', formData.isbn.trim());
      if (formData.publisher) data.append('publisher', formData.publisher.trim());
      if (formData.publish_year) data.append('publish_year', formData.publish_year);
      data.append('sale_price', formData.sale_price);
      data.append('borrow_copies_count', formData.borrow_copies_count);
      data.append('sale_stock_count', formData.sale_stock_count);
      if (formData.description) data.append('description', formData.description.trim());

      if (imageMode === 'file' && coverFile) {
        data.append('cover_image', coverFile);
      } else if (imageMode === 'url' && formData.cover_url.trim()) {
        data.append('cover_url', formData.cover_url.trim());
      }

      const res = await api.post('/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg(res.data.message || 'Thêm đầu sách mới thành công!');
      
      if (onBookCreated) {
        onBookCreated(res.data.book);
      }

      setTimeout(() => {
        // Reset form
        setFormData({
          title: '',
          author: '',
          category_id: categories[0]?.id || '',
          isbn: '',
          publisher: '',
          publish_year: new Date().getFullYear().toString(),
          sale_price: 120000,
          borrow_copies_count: 3,
          sale_stock_count: 10,
          cover_url: '',
          description: '',
        });
        setCoverFile(null);
        setCoverPreview('');
        setMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const firstErrorKey = Object.keys(validationErrors)[0];
        setError(validationErrors[firstErrorKey][0]);
      } else {
        setError(backendMsg || 'Có lỗi xảy ra khi thêm đầu sách, vui lòng kiểm tra lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto my-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <BookPlus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Thêm Đầu Sách Mới
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Khởi tạo kho sách, tự động tạo mã vạch cho mượn và cập nhật tồn kho bán
            </p>
          </div>
        </div>

        {/* Messages */}
        {msg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Tên sách <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên đầu sách..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-control text-xs py-2.5"
              />
            </div>
            <div>
              <label className="label">
                Tác giả <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Tên tác giả..."
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="input-control text-xs py-2.5"
              />
            </div>
          </div>

          {/* Category & ISBN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Thể loại danh mục <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category_id || (categories[0]?.id ?? '')}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="input-control text-xs py-2.5 bg-white font-medium"
              >
                {categories.length === 0 && (
                  <option value="">Chưa có thể loại nào (hãy tạo thể loại trước)</option>
                )}
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Mã ISBN (Tùy chọn)</label>
              <input
                type="text"
                placeholder="Ví dụ: 978-604-1-12345-6"
                value={formData.isbn}
                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                className="input-control text-xs py-2.5 font-mono"
              />
            </div>
          </div>

          {/* Publisher & Publish Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nhà xuất bản</label>
              <input
                type="text"
                placeholder="NXB Trẻ, Kim Đồng, v.v..."
                value={formData.publisher}
                onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                className="input-control text-xs py-2.5"
              />
            </div>
            <div>
              <label className="label">Năm xuất bản</label>
              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="2024"
                value={formData.publish_year}
                onChange={e => setFormData({ ...formData, publish_year: e.target.value })}
                className="input-control text-xs py-2.5"
              />
            </div>
          </div>

          {/* Pricing & Stock quantities */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Cấu Hình Mượn & Bán Sách
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-[11px]">
                  Giá bán mới (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.sale_price}
                  onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                  className="input-control text-xs py-2 font-bold text-rose-600"
                />
              </div>
              <div>
                <label className="label text-[11px]">
                  Số bản sao cho mượn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.borrow_copies_count}
                  onChange={e => setFormData({ ...formData, borrow_copies_count: e.target.value })}
                  className="input-control text-xs py-2 font-bold text-blue-600"
                  title="Hệ thống sẽ tự động sinh mã vạch BC-xxx cho mỗi cuốn"
                />
              </div>
              <div>
                <label className="label text-[11px]">
                  Tồn kho bán mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.sale_stock_count}
                  onChange={e => setFormData({ ...formData, sale_stock_count: e.target.value })}
                  className="input-control text-xs py-2 font-bold text-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Cover Image Input with Tabs & Live Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ảnh Bìa Sách
              </span>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    imageMode === 'url' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <Link className="w-3 h-3" /> Link Online
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    imageMode === 'file' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Tải File
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Preview Thumbnail */}
              <div className="w-24 h-32 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center relative">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Xem trước ảnh bìa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                    <span className="text-[10px] block">Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Mode input controls */}
              <div className="flex-1 w-full">
                {imageMode === 'url' ? (
                  <div>
                    <label className="label text-[11px]">Đường link ảnh bìa (URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.cover_url}
                      onChange={handleUrlChange}
                      className="input-control text-xs py-2"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Dán link ảnh từ Unsplash, Google, Tiki, Fahasa... Nếu để trống hệ thống sẽ dùng ảnh mặc định.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="label text-[11px]">Chọn file ảnh từ thiết bị (Tối đa 10MB)</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="input-control text-xs py-1.5 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hỗ trợ định dạng JPG, PNG, WEBP, GIF.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Mô tả tóm tắt nội dung sách</label>
            <textarea
              rows="3"
              placeholder="Giới thiệu sơ lược về tác phẩm, nội dung nổi bật..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-control text-xs py-2"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all w-1/3 cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all w-2/3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang Tạo Đầu Sách...
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" /> Lưu & Khởi Tạo Đầu Sách
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
