'use client';
import React, { useState, useEffect } from 'react';
import { X, Send, Bell, Users, User, Clock, AlertTriangle, Sparkles, CheckCircle, AlertCircle, Loader2, FileText, Check } from 'lucide-react';
import api from '../api';

const TEMPLATES = [
  {
    id: 'reminder',
    name: 'Nhắc trả sách đúng hạn',
    type: 'reminder',
    icon: Clock,
    subject: '[Thư Viện Online] Nhắc nhở: Sách mượn sắp đến hạn hoàn trả',
    content: `Xin chào {name},

Thư viện Online xin gửi lời nhắc nhở thân thiện về phiếu mượn sách của bạn sắp đến hạn trả. 

Vui lòng kiểm tra lại thời gian trên hệ thống để hoàn trả đúng hạn hoặc sử dụng tính năng Gia Hạn Trực Tuyến 01 lần tại mục "Sách Đang Mượn" để tránh phát sinh phí trễ hạn nhé.

Chúc bạn có những phút giây đọc sách bổ ích!
Ban Quản Trị Thư Viện Online 4.0`,
  },
  {
    id: 'overdue',
    name: 'Cảnh báo quá hạn mượn',
    type: 'overdue',
    icon: AlertTriangle,
    subject: '[Thư Viện Online] CẢNH BÁO: Sách mượn đã QUÁ HẠN hoàn trả',
    content: `Xin chào {name},

Hệ thống ghi nhận bạn hiện có phiếu mượn sách đã quá thời hạn quy định. Phí phạt trễ hạn đang được tính theo biểu phí của Thư viện.

Vui lòng sắp xếp thời gian mang sách đến hoàn trả tại quầy Thư viện sớm nhất. Bạn cũng có thể thanh toán phí phạt trực tuyến qua Chuyển khoản ngân hàng VietQR trên hệ thống.

Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ ngay với Thủ thư.
Ban Quản Trị Thư Viện Online 4.0`,
  },
  {
    id: 'new_books',
    name: 'Giới thiệu sách mới về',
    type: 'announcement',
    icon: Sparkles,
    subject: '[Thư Viện Online] Rất nhiều đầu sách mới cực HOT đã cập bến!',
    content: `Xin chào {name},

Thư viện Online vừa bổ sung thêm hàng loạt đầu sách mới chọn lọc thuộc các thể loại: Công nghệ thông tin & AI, Kinh tế - Khởi nghiệp, Văn học kinh điển và Tâm lý - Kỹ năng sống.

Kho sách đã sẵn sàng phục vụ bạn mượn đọc hoặc đặt mua giao tận nơi. Hãy truy cập ngay Kho Sách để tìm kiếm tác phẩm yêu thích nhé!

Trân trọng,
Ban Quản Trị Thư Viện Online 4.0`,
  },
  {
    id: 'schedule',
    name: 'Thông báo lịch hoạt động',
    type: 'announcement',
    icon: FileText,
    subject: '[Thư Viện Online] Thông báo lịch phục vụ độc giả',
    content: `Xin chào {name},

Thư viện Online xin trân trọng thông báo về lịch làm việc và phục vụ độc giả trong thời gian tới. 

Hệ thống tra cứu, đặt trước sách, gia hạn và thanh toán trực tuyến vẫn hoạt động thông suốt 24/7 để phục vụ bạn mọi lúc mọi nơi.

Kính chúc bạn và gia đình thật nhiều sức khỏe và niềm vui!
Ban Quản Trị Thư Viện Online 4.0`,
  },
];

export default function SendNotificationModal({ isOpen, onClose, defaultReader = null, onSuccess }) {
  const [targetType, setTargetType] = useState('all'); // 'all', 'single', 'borrowing', 'overdue'
  const [selectedReaderId, setSelectedReaderId] = useState('');
  const [readersList, setReadersList] = useState([]);
  const [searchReader, setSearchReader] = useState('');
  const [type, setType] = useState('reminder');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingReaders, setFetchingReaders] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Fetch readers list for dropdown
  useEffect(() => {
    if (isOpen) {
      setError('');
      setMsg('');
      if (defaultReader) {
        setTargetType('single');
        setSelectedReaderId(defaultReader.id);
      }
      fetchReaders();
    }
  }, [isOpen, defaultReader]);

  const fetchReaders = async () => {
    setFetchingReaders(true);
    try {
      const res = await api.get('/admin/users', { params: { role: 'reader' } });
      setReadersList(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingReaders(false);
    }
  };

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl) => {
    setType(tmpl.type);
    setSubject(tmpl.subject);
    setContent(tmpl.content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (targetType === 'single' && !selectedReaderId) {
      setError('Vui lòng chọn một độc giả cụ thể để gửi thông báo!');
      return;
    }

    if (!subject.trim()) {
      setError('Vui lòng nhập tiêu đề thông báo!');
      return;
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung thông báo!');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/admin/notifications/send', {
        target_type: targetType,
        reader_id: targetType === 'single' ? selectedReaderId : null,
        type,
        subject: subject.trim(),
        content: content.trim(),
      });

      setMsg(res.data.message || 'Đã gửi thông báo thành công!');

      if (onSuccess) {
        onSuccess(res.data);
      }

      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo!');
    } finally {
      setLoading(false);
    }
  };

  const filteredReaders = readersList.filter(r => {
    if (!searchReader) return true;
    const q = searchReader.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phone?.includes(q);
  });

  return (
    <div className="modal-overlay p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto my-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Send className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Soạn & Gửi Thông Báo Cho Độc Giả
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Gửi thông báo nhắc nhở trả sách, cảnh báo quá hạn hoặc tin tức hệ thống tới độc giả
            </p>
          </div>
        </div>

        {/* Alerts */}
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target audience selection */}
          <div className="space-y-2">
            <label className="label">1. Chọn đối tượng nhận thông báo:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'all', label: 'Tất Cả Độc Giả', icon: Users, desc: 'Tất cả tài khoản độc giả' },
                { id: 'single', label: '1 Độc Giả Cụ Thể', icon: User, desc: 'Chọn theo tên/email' },
                { id: 'borrowing', label: 'Đang Mượn Sách', icon: Clock, desc: 'Có phiếu đang mượn' },
                { id: 'overdue', label: 'Đang Quá Hạn', icon: AlertTriangle, desc: 'Có sách chưa trả quá hạn' },
              ].map((target) => {
                const IconComponent = target.icon;
                const isSelected = targetType === target.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setTargetType(target.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div>
                      <div className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {target.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{target.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single Reader selector if targetType === 'single' */}
          {targetType === 'single' && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="label text-blue-900 text-xs mb-0">
                  Chọn Độc Giả Nhận Tin:
                </label>
                <input
                  type="text"
                  placeholder="Lọc theo tên, email..."
                  value={searchReader}
                  onChange={(e) => setSearchReader(e.target.value)}
                  className="input-control text-xs py-1 px-2.5 max-w-xs bg-white"
                />
              </div>

              <select
                required
                value={selectedReaderId}
                onChange={(e) => setSelectedReaderId(e.target.value)}
                className="input-control text-xs py-2 bg-white"
              >
                <option value="">-- Chọn độc giả trong danh sách ({filteredReaders.length}) --</option>
                {filteredReaders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.email}) {r.phone ? `- SĐT: ${r.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Templates bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label mb-0 flex items-center gap-1.5 text-xs text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                2. Áp dụng nhanh mẫu văn bản có sẵn (Tùy chọn):
              </label>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded-xl text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Nhấn để tự động điền tiêu đề & nội dung mẫu"
                >
                  <tmpl.icon className="w-3.5 h-3.5 text-slate-500" />
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type of notification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label text-xs">Loại thông báo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-control text-xs py-2 bg-white font-medium"
              >
                <option value="reminder">Nhắc nhở trả sách</option>
                <option value="overdue">Cảnh báo quá hạn & phạt</option>
                <option value="announcement">Thông báo hệ thống</option>
                <option value="event">Sự kiện & Giới thiệu sách</option>
                <option value="custom">Tùy chỉnh khác</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label text-xs">
                Tiêu đề thông báo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: [Thư Viện] Nhắc nhở trả sách..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-control text-xs py-2 font-medium"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0 text-xs">
                Nội dung thông báo <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Mẹo: Dùng <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;name&#125;</code> để chèn tên độc giả tự động
              </span>
            </div>
            <textarea
              rows="6"
              required
              placeholder="Nhập nội dung thông báo chi tiết gửi tới độc giả..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-control text-xs py-2.5 font-normal leading-relaxed"
            />
          </div>

          {/* Action buttons */}
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang Gửi Thông Báo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Phát Thông Báo Ngay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
