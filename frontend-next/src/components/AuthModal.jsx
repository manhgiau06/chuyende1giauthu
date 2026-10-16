'use client';
import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Sparkles, UserCheck, BookOpen, Shield, ArrowRight } from 'lucide-react';
import api from '../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: 'docgia1@gmail.com',
    password: 'password',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.access_token);
      onLoginSuccess(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email) => {
    setFormData({ ...formData, email, password: 'password' });
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[28px] border border-white/80 shadow-2xl overflow-hidden relative p-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Fantasy Header Banner */}
        <div className="relative h-28 overflow-hidden bg-slate-900 flex items-center justify-center">
          <img
            src="/login-bg.jpg"
            alt="Fantasy Header"
            className="w-full h-full object-cover animate-pan-zoom scale-110 filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent backdrop-blur-[0.5px]" />
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo badge overlapping header */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-500/30 animate-neon-glow flex items-center justify-center">
              <div className="w-full h-full bg-slate-900/20 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                <svg className="w-7 h-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="white" fillOpacity="0.25" />
                  <path d="M6 2v20" />
                  <path d="M10 7h6" strokeWidth="2" />
                  <path d="M10 11h6" strokeWidth="2" />
                  <path d="M10 15h4" strokeWidth="2" />
                  <circle cx="17.5" cy="4" r="1.8" fill="#38bdf8" stroke="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="pt-9 p-6 sm:p-7 space-y-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {isLogin ? 'ĐĂNG NHẬP THƯ VIỆN' : 'ĐĂNG KÝ ĐỘC GIẢ'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isLogin ? 'Chào mừng bạn quay trở lại với thư viện số 4.0' : 'Tạo tài khoản để mượn & mua sách giao tận nơi'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center shadow-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 rounded-xl outline-none font-medium transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Email đăng nhập</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 rounded-xl outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 rounded-xl outline-none font-medium transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 rounded-xl outline-none font-medium transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Địa chỉ nhận sách</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Địa chỉ giao hàng tận nơi"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 rounded-xl outline-none font-medium transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button with Shimmer Sweep */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full relative overflow-hidden group py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-95 transition-all mt-3 cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer-sweep pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {loading ? 'Đang xử lý...' : isLogin ? (
                  <>Đăng Nhập <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <>Tạo Tài Khoản <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          {isLogin && (
            <div className="pt-3 border-t border-slate-100 text-center space-y-1.5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Đăng nhập nhanh (1-Click Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('docgia1@gmail.com')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    formData.email === 'docgia1@gmail.com'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Độc giả
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('thuthu@thuvien.vn')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    formData.email === 'thuthu@thuvien.vn'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Thủ thư
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@thuvien.vn')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    formData.email === 'admin@thuvien.vn'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Quản trị
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-0.5">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký Độc giả ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
