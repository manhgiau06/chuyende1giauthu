'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Sparkles, Wrench, CheckCircle2, AlertTriangle, Search,
  Barcode, Layers, RefreshCw, Clock, Check, Filter, BookOpen
} from 'lucide-react';
import api from '../api';

const ACTION_TYPES = [
  { id: 'recover_cover', label: '🛡️ Bao bìa Plastic mới (Chống nước & rách)' },
  { id: 'rebind', label: '📕 Đóng lại gáy / Dán keo nhiệt' },
  { id: 'clean', label: '✨ Vệ sinh & Khử khuẩn sách tia UV' },
  { id: 'replace_barcode', label: '🏷️ Thay nhãn Barcode + Màng bảo vệ' },
  { id: 'repair_pages', label: '📄 Dán trang rách & Ép phẳng bìa' },
];

const COVER_TYPES = [
  { id: 'plastic_glossy', label: 'Bìa kiếng bóng PVC dày (0.15mm)' },
  { id: 'plastic_matte', label: 'Bìa nhám chống lóa & chống vân tay' },
  { id: 'hard_laminate', label: 'Màng ép nhiệt Cán bóng cao cấp' },
  { id: 'kraft_wrap', label: 'Bìa giấy Kraft + Bọc kiếng bảo vệ' },
];

const getActionLabel = (id) => ACTION_TYPES.find((a) => a.id === id)?.label || '🛡️ Bao bìa Plastic mới';
const getCoverLabel = (id) => COVER_TYPES.find((c) => c.id === id)?.label || 'Bìa kiếng bóng PVC dày';

export default function BookMaintenancePanel({ onDataChanged }) {
  const [copies, setCopies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    total_copies: 0,
    in_maintenance_count: 0,
    needs_recover_count: 0,
    newly_covered_count: 0,
    completed_logs_count: 0,
    total_cost: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Filter & Selection states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'needs_recover' | 'maintenance' | 'new_cover'
  const [selectedIds, setSelectedIds] = useState([]);

  // Maintenance Form Options
  const [actionType, setActionType] = useState('recover_cover');
  const [coverType, setCoverType] = useState('plastic_glossy');
  const [costPerCopy, setCostPerCopy] = useState(5000);
  const [notes, setNotes] = useState('');

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/book-copies/maintenance');
      setCopies(res.data.copies || []);
      setLogs(res.data.logs || []);
      if (res.data.summary) setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu bảo quản & bao bìa sách!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const handleAction = async (action, targetIds, extra = {}) => {
    if (!targetIds || targetIds.length === 0) return;
    setSubmitting(true);
    setError('');
    setMsg('');
    try {
      const res = await api.post('/book-copies/maintenance', {
        action,
        book_copy_ids: targetIds,
        action_type: extra.action_type || actionType,
        cover_type: extra.cover_type || coverType,
        condition_after: extra.condition_after || 'new',
        condition: extra.condition || 'fair',
        cost: extra.cost ?? costPerCopy,
        notes: extra.notes ?? notes,
      });
      setMsg(res.data.message);
      setSelectedIds([]);
      await fetchMaintenanceData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện bảo quản sách!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCopies = copies.filter((c) => {
    if (statusFilter === 'needs_recover' && (!c.needs_recover || c.status === 'maintenance')) return false;
    if (statusFilter === 'maintenance' && c.status !== 'maintenance') return false;
    if (statusFilter === 'new_cover' && c.condition !== 'new') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.barcode?.toLowerCase().includes(q) ||
        c.book_title?.toLowerCase().includes(q) ||
        c.book_author?.toLowerCase().includes(q) ||
        c.book_isbn?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const selectableIds = filteredCopies.filter((c) => c.status !== 'borrowed').map((c) => c.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !selectableIds.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...selectableIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg('')} className="text-emerald-600 hover:text-emerald-800 text-xs font-black cursor-pointer">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800 text-xs font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-amber-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Cần Bao Bìa Lại</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{summary.needs_recover_count} cuốn</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bìa cũ / đã qua lượt mượn</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-indigo-600 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Đang Bao Bìa / Bảo Quản</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">{summary.in_maintenance_count} cuốn</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tạm khóa mượn để gia cố</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-emerald-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Đã Bao Bìa Mới Tinh</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{summary.newly_covered_count} cuốn</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bọc màng bảo vệ đạt chuẩn</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-l-4 border-l-pink-500 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Lượt Đã Bảo Quản</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.completed_logs_count} lượt</div>
            <div className="text-[11px] font-semibold text-pink-600 mt-0.5">
              Chi phí vật tư: {new Intl.NumberFormat('vi-VN').format(summary.total_cost || 0)}đ
            </div>
          </div>
          <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Panel: Cấu hình Bao bìa & Bảo quản Sách */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Trung Tâm Bảo Quản & Bao Bìa Sách Thư Viện
              </h3>
              <p className="text-xs text-slate-500">
                Bọc bìa kiếng chống rách, đóng lại gáy keo nhiệt, thay nhãn Barcode và theo dõi tình trạng từng bản sao vật lý
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchMaintenanceData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>

        {/* Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              1. Hạng mục bảo quản
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              2. Chất liệu bìa bọc
            </label>
            <select
              value={coverType}
              onChange={(e) => setCoverType(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {COVER_TYPES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              3. Kinh phí vật tư / cuốn (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={costPerCopy}
              onChange={(e) => setCostPerCopy(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
              4. Ghi chú nghiệp vụ
            </label>
            <input
              type="text"
              placeholder="VD: Bọc mới bìa kiếng sau khi trả sách..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Batch Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl">
          <div className="text-xs font-bold text-indigo-950 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-black">
              Đã chọn: {selectedIds.length} cuốn
            </span>
            <span className="text-slate-600">
              Tích chọn các mã vạch bên dưới để bao bìa hàng loạt hoặc bấm trực tiếp trên từng dòng
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={submitting || selectedIds.length === 0}
              onClick={() => handleAction('instant_recover', selectedIds)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Bao Bìa Nhanh ({selectedIds.length})
            </button>

            <button
              type="button"
              disabled={submitting || selectedIds.length === 0}
              onClick={() => handleAction('send_to_maintenance', selectedIds)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" /> Đưa Đi Bảo Quản ({selectedIds.length})
            </button>

            <button
              type="button"
              disabled={submitting || selectedIds.length === 0}
              onClick={() => handleAction('complete_maintenance', selectedIds)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Hoàn Tất & Lên Kệ ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Copies Table with Filter & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-slate-50/50">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `Tất cả bản sao (${copies.length})` },
              { id: 'needs_recover', label: `⚠️ Cần bao bìa lại (${summary.needs_recover_count})` },
              { id: 'maintenance', label: `🔧 Đang bảo quản (${summary.in_maintenance_count})` },
              { id: 'new_cover', label: `✨ Đã bao bìa mới (${summary.newly_covered_count})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo mã vạch BC-..., tên sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Mã Vạch (Barcode)</th>
                <th className="p-3.5">Đầu Sách</th>
                <th className="p-3.5">Lượt Mượn</th>
                <th className="p-3.5">Tình Trạng Bìa Sách</th>
                <th className="p-3.5">Trạng Thái Kệ</th>
                <th className="p-3.5">Bảo Quản Gần Nhất</th>
                <th className="p-3.5 text-right">Thao Tác Bao Bìa / Bảo Quản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCopies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    Không có bản sao sách nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCopies.map((copy) => {
                  const isBorrowed = copy.status === 'borrowed';
                  const isMaintenance = copy.status === 'maintenance';
                  const isSelected = selectedIds.includes(copy.id);

                  return (
                    <tr
                      key={copy.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/60'
                          : isMaintenance
                          ? 'bg-indigo-50/40'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          disabled={isBorrowed}
                          checked={isSelected}
                          onChange={() => toggleSelectOne(copy.id)}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer disabled:opacity-40"
                        />
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          {copy.barcode}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={copy.book_cover}
                            alt={copy.book_title}
                            loading="lazy"
                            className="w-9 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{copy.book_title}</div>
                            <div className="text-[11px] text-slate-500">
                              {copy.book_author} · <span className="text-blue-600 font-semibold">{copy.category_name || 'Sách'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          {copy.borrow_count} lần
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {copy.condition === 'new' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            ✨ Đã bao bìa mới
                          </span>
                        ) : copy.condition === 'fair' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                            ⚠️ Bìa cũ / Cần bao lại
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            📗 Bìa tốt (Nguyên bản)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {isMaintenance ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1 animate-pulse">
                            🔧 Đang bao bìa / Bảo quản
                          </span>
                        ) : isBorrowed ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Độc giả đang mượn
                          </span>
                        ) : copy.status === 'lost' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Bị thất lạc
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ● Sẵn sàng trên kệ
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {copy.last_maintained_at ? (
                          <div className="text-[11px]">
                            <div className="font-bold text-slate-700">{getCoverLabel(copy.last_cover_type)}</div>
                            <div className="text-slate-400">
                              {new Date(copy.last_maintained_at).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Chưa ghi nhận</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isBorrowed ? (
                          <span className="text-[11px] text-slate-400 italic">Chờ độc giả trả sách</span>
                        ) : isMaintenance ? (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleAction('complete_maintenance', [copy.id])}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn Tất & Lên Kệ
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleAction('instant_recover', [copy.id])}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Bao bìa kiếng mới ngay lập tức và nâng cấp tình trạng sách lên Mới"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Bao Bìa Ngay
                            </button>

                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleAction('send_to_maintenance', [copy.id])}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Tạm rút khỏi kệ để đưa đi đóng gáy / bao bìa"
                            >
                              <Wrench className="w-3.5 h-3.5" /> Bảo Quản
                            </button>

                            {copy.condition !== 'fair' && (
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleAction('mark_condition', [copy.id], { condition: 'fair' })}
                                className="px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold cursor-pointer"
                                title="Đánh dấu bìa cũ/rách cần bao lại"
                              >
                                ⚠️ Bìa cũ
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-black text-slate-900">
              Nhật Ký Lịch Sử Bao Bìa & Bảo Quản Sách Gần Đây ({logs.length})
            </h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Mã Vạch</th>
                <th className="p-3.5">Đầu Sách</th>
                <th className="p-3.5">Hạng Mục & Loại Bìa</th>
                <th className="p-3.5">Tình Trạng</th>
                <th className="p-3.5">Kinh Phí</th>
                <th className="p-3.5">Người Thực Hiện</th>
                <th className="p-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Chưa có nhật ký bảo quản / bao bìa nào. Hãy chọn sách ở bảng trên và bấm "Bao Bìa Ngay"!
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 whitespace-nowrap text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.barcode}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{log.book_title}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-indigo-700">{getActionLabel(log.action_type)}</div>
                      <div className="text-[11px] text-slate-500">{getCoverLabel(log.cover_type)}</div>
                      {log.notes && <div className="text-[11px] text-slate-400 italic mt-0.5">"{log.notes}"</div>}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-[11px] font-semibold">
                      <span className="text-slate-500">{log.condition_before}</span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <span className="text-emerald-700 font-bold">{log.condition_after}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-pink-600">
                      {new Intl.NumberFormat('vi-VN').format(log.cost || 0)}đ
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600 font-semibold">
                      {log.librarian_name || 'Thủ thư'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {log.status === 'completed' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✅ Đã hoàn tất
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          🔧 Đang xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
