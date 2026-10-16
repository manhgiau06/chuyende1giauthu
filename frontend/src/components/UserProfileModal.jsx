import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Upload, CheckCircle, Camera } from 'lucide-react';
import api, { getImageUrl } from '../api';

export default function UserProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatarPreview(user.avatar_url || '');
      setAvatarFile(null);
      setError('');
      setMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('address', address);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.post('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Cập nhật hồ sơ cá nhân thành công!');
      onUpdateSuccess(res.data.user);
      setTimeout(() => {
        setMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ!');
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

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Hồ Sơ Cá Nhân</h2>
          <p className="text-xs text-slate-400">Cập nhật thông tin cá nhân & ảnh đại diện</p>
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
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 shadow-xl bg-blue-50 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={getImageUrl(avatarPreview)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreview('')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-800 font-black text-2xl bg-blue-100">
                  {name?.charAt(0)?.toUpperCase() || <User className="w-10 h-10 text-blue-500" />}
                </div>
              )}
              <label
                className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-sm text-white py-1 flex justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                title="Chọn ảnh đại diện mới"
              >
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            {avatarFile ? (
              <span className="text-[11px] text-emerald-600 font-semibold">Đã chọn file: {avatarFile.name}</span>
            ) : (
              <span className="text-[11px] text-slate-400">Bấm máy ảnh để tải ảnh (Tối đa 2MB JPG, PNG)</span>
            )}
          </div>

          <div>
            <label className="label">Họ và tên</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-control pl-10 text-xs py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="label">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-control pl-10 text-xs py-2.5"
                placeholder="0901234567"
              />
            </div>
          </div>

          <div>
            <label className="label">Địa chỉ nhận sách mặc định</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-control pl-10 text-xs py-2.5"
                placeholder="Địa chỉ giao hàng"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
