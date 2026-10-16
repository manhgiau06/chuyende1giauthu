import React, { useState } from 'react';
import { X, Plus, FolderPlus, CheckCircle } from 'lucide-react';
import api from '../api';

export default function CategoryManageModal({ isOpen, onClose, onCategoryCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await api.post('/categories', {
        name,
        description,
      });

      setMsg('Thêm thể loại sách thành công!');
      setName('');
      setDescription('');
      onCategoryCreated(res.data.category);
      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm thể loại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Thêm Thể Loại Sách Mới</h2>
            <p className="text-xs text-slate-400">Hệ thống sẽ tự động cập nhật đệm Redis</p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-400" /> {msg}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tên thể loại</label>
            <input
              type="text"
              required
              placeholder="VD: Khoa Học Viễn Tưởng, Tâm Lý Học..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-control text-xs py-2.5"
            />
          </div>

          <div>
            <label className="label">Mô tả ngắn</label>
            <textarea
              rows="3"
              placeholder="Mô tả nhóm sách thuộc thể loại này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-control text-xs"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full justify-center py-2.5">
            <Plus className="w-4 h-4" /> {loading ? 'Đang thêm...' : 'Lưu Thể Loại Sách'}
          </button>
        </form>
      </div>
    </div>
  );
}
