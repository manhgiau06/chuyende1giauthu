'use client';
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, ShoppingBag, BookmarkCheck, User, LogOut, Shield, Truck, FolderPlus, Bell, Heart, QrCode, BookPlus, Send, ChevronDown, PlusCircle } from 'lucide-react';
import { getImageUrl } from '../api';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  cartCount, 
  notificationCount = 0,
  activeTab, 
  setActiveTab, 
  onOpenCart, 
  onOpenMyBorrows, 
  onOpenTrackDelivery, 
  onOpenProfile,
  onOpenAddCategory,
  onOpenAddBook,
  onOpenSendNotification,
  onOpenWishlist,
  onOpenNotifications,
  onOpenDigitalCard
}) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="glass-nav py-3 px-4 md:px-6 mb-8 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1536px] w-full mx-auto flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Brand & New Modern Logo */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-shrink-0 group" 
          onClick={() => setActiveTab('catalog')}
          title="Về trang chủ Kho sách"
        >
          {/* Modern Geometry SVG Logo */}
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-900/10 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="white" fillOpacity="0.2" />
                <path d="M6 2v20" />
                <path d="M10 7h6" strokeWidth="2" />
                <path d="M10 11h6" strokeWidth="2" />
                <path d="M10 15h4" strokeWidth="2" />
                <circle cx="17.5" cy="4" r="1.8" fill="#38bdf8" stroke="none" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 leading-none">
                THƯ VIỆN
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md shadow-xs leading-none">
                ONLINE 4.0
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-normal mt-1 leading-none hidden sm:block">
              Mượn & Mua Sách Trực Tuyến
            </span>
          </div>
        </div>

        {/* Navigation Tabs Container */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 flex-shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center ${
              activeTab === 'catalog' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
            }`}
          >
            Kho Sách
          </button>

          {user && (user.role === 'librarian' || user.role === 'admin') && (
            <button
              onClick={() => setActiveTab('librarian')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'librarian' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Quản Lý Thủ Thư
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'admin' 
                  ? 'bg-pink-600 text-white shadow-sm' 
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Báo Cáo Quản Trị
            </button>
          )}

          {/* Quick Actions Dropdown for Librarian & Admin */}
          {user && (user.role === 'librarian' || user.role === 'admin') && (
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isQuickActionsOpen 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80'
                }`}
                title="Các công cụ thao tác nhanh"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Công Cụ</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown Menu */}
              {isQuickActionsOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Thao Tác Quản Trị
                  </div>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenAddBook();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <BookPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Thêm Đầu Sách Mới</div>
                      <div className="text-[10px] font-normal text-slate-400">Tạo sách & bản sao mới</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenAddCategory();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <FolderPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Thêm Thể Loại</div>
                      <div className="text-[10px] font-normal text-slate-400">Danh mục phân loại sách</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      onOpenSendNotification();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <div>Gửi Thông Báo</div>
                      <div className="text-[10px] font-normal text-slate-400">Email & tin nhắn độc giả</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenTrackDelivery}
            className="h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap text-slate-600 hover:text-blue-700 hover:bg-white/80 transition-all flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-amber-600" /> Tra Cứu Vận Đơn
          </button>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-blue-600 cursor-pointer"
                title="Hộp thư thông báo"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist */}
            {user && user.role === 'reader' && (
              <button
                onClick={onOpenWishlist}
                className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-rose-600"
                title="Sách yêu thích"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-pink-50 border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-pink-600"
              title="Giỏ hàng mua sách"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Reader Action Pills (Only for Readers) */}
          {user && user.role === 'reader' && (
            <div className="hidden xl:flex items-center gap-1.5">
              {/* Digital Card */}
              <button
                onClick={onOpenDigitalCard}
                className="h-9 px-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold text-indigo-700 whitespace-nowrap shadow-xs"
                title="Thẻ thư viện số 4.0 (Mã QR & Barcode)"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thẻ Thư Viện</span>
              </button>

              {/* My Borrows */}
              <button
                onClick={onOpenMyBorrows}
                className="h-9 px-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold text-sky-800 whitespace-nowrap shadow-xs"
                title="Tủ sách đang mượn & Đặt trước"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Tủ Sách Cá Nhân</span>
              </button>
            </div>
          )}

          {/* User Auth Info & Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity py-0.5 px-1 rounded-xl"
                title="Xem & sửa hồ sơ cá nhân"
              >
                {/* Circular Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-500/40 bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs relative flex-shrink-0 shadow-xs">
                  {user.avatar_url ? (
                    <img
                      src={getImageUrl(user.avatar_url)}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`avatar-fallback ${user.avatar_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-blue-800 font-bold text-xs`}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>

                {/* User Name & Compact Role Badge */}
                <div className="text-left hidden sm:flex flex-col leading-tight max-w-[135px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap truncate max-w-[85px] sm:max-w-[100px]">
                      {user.name}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      user.role === 'admin' 
                        ? 'bg-rose-100 text-rose-700' 
                        : user.role === 'librarian' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'librarian' ? 'Thủ thư' : 'Độc giả'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[135px] hidden xl:block">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-9 h-9 flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all shrink-0 cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary h-9 px-4 text-xs font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Đăng Nhập
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
