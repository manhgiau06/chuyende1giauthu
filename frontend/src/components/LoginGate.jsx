import React, { useState, useMemo } from 'react';
import { 
  Lock, Mail, User, Phone, MapPin, ArrowRight, Sparkles, 
  BookOpen, Shield, CheckCircle2, UserCheck, KeyRound 
} from 'lucide-react';
import api from '../api';

export default function LoginGate({ onLoginSuccess }) {
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

  // Generate random magical glowing particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.2 + (i % 3) * 2.5) % 96 + 2}%`,
      size: `${Math.floor((i % 4) * 2 + 3)}px`,
      duration: `${7 + (i % 5) * 1.8}s`,
      delay: `-${((i * 1.7) % 9).toFixed(1)}s`,
      bg: i % 3 === 0 
        ? 'bg-amber-300 shadow-[0_0_12px_#fcd34d]' 
        : i % 3 === 1 
          ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9]' 
          : 'bg-emerald-300 shadow-[0_0_12px_#6ee7b7]',
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.access_token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (email) => {
    setFormData({ ...formData, email, password: 'password' });
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* ANIMATED BACKGROUND IMAGE & PARTICLES */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Fantasy Landscape Image with Pan & Zoom Movement */}
        <img
          src="/login-bg.jpg"
          alt="Thư Viện Fantasy Background"
          className="w-full h-full object-cover animate-pan-zoom scale-105 filter contrast-105"
        />

        {/* Ambient Dark & Gradient Overlays for depth and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/35 to-sky-950/30 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/60" />

        {/* Floating Magical Glowing Dust Particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className={`magic-particle-screen ${p.bg}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* FLOATING GLASSMORPHISM LOGIN CARD */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-2xl p-7 sm:p-9 rounded-[32px] border border-white/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] animate-float-gentle transition-all duration-300">
        
        {/* Top Floating Glow Pill */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1.5 border border-white/40">
          <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Hệ Thống Thư Viện Số</span>
        </div>

        {/* Brand Modern SVG Logo & Header */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex relative items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-500/30 animate-neon-glow mb-1">
            <div className="w-full h-full bg-slate-900/10 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
              <svg className="w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="white" fillOpacity="0.25" />
                <path d="M6 2v20" />
                <path d="M10 7h6" strokeWidth="2" />
                <path d="M10 11h6" strokeWidth="2" />
                <path d="M10 15h4" strokeWidth="2" />
                <circle cx="17.5" cy="4" r="1.8" fill="#38bdf8" stroke="none" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600">
                THƯ VIỆN
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md shadow-xs">
                ONLINE 4.0
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {isLogin ? 'Đăng nhập để mượn, mua sách & quản lý trực tuyến' : 'Đăng ký tài khoản độc giả để sử dụng thư viện'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl text-center shadow-xs animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Họ và tên độc giả</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/75 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all rounded-2xl outline-none font-medium text-slate-800 shadow-xs"
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
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/75 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all rounded-2xl outline-none font-medium text-slate-800 shadow-xs"
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
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/75 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all rounded-2xl outline-none font-medium text-slate-800 shadow-xs"
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/75 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all rounded-2xl outline-none font-medium text-slate-800 shadow-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Địa chỉ nhận sách</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Số nhà, đường, quận/huyện..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/75 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all rounded-2xl outline-none font-medium text-slate-800 shadow-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button with Shimmer Sweep Effect */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative overflow-hidden group py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-70 cursor-pointer"
          >
            {/* Moving Light Shimmer Sweep */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer-sweep pointer-events-none" />

            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                'Đang xác thực...'
              ) : isLogin ? (
                <>Đăng Nhập Ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <>Tạo Tài Khoản Mới <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </span>
          </button>
        </form>

        {/* 1-Click Demo Accounts Selector */}
        {isLogin && (
          <div className="pt-4 border-t border-slate-200/90 text-center space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <KeyRound className="w-3 h-3 text-blue-500" />
              <span>Đăng Nhập Nhanh (1-Click Demo)</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Reader Pill */}
              <button
                type="button"
                onClick={() => handleQuickSelect('docgia1@gmail.com')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  formData.email === 'docgia1@gmail.com'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.03]'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-[11px]">Độc Giả</span>
              </button>

              {/* Librarian Pill */}
              <button
                type="button"
                onClick={() => handleQuickSelect('thuthu@thuvien.vn')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  formData.email === 'thuthu@thuvien.vn'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25 scale-[1.03]'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-[11px]">Thủ Thư</span>
              </button>

              {/* Admin Pill */}
              <button
                type="button"
                onClick={() => handleQuickSelect('admin@thuvien.vn')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  formData.email === 'admin@thuvien.vn'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.03]'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px]">Quản Trị</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Login / Register */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer hover:underline"
          >
            {isLogin ? (
              <>Chưa có tài khoản? <span>Đăng ký Độc giả mới</span></>
            ) : (
              <>Đã có tài khoản? <span>Đăng nhập ngay</span></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
