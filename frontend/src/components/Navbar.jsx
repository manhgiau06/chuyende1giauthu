import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, ShoppingBag, BookmarkCheck, User, LogOut, Shield, Truck, 
  FolderPlus, Bell, Heart, QrCode, BookPlus, Send, ChevronDown, 
  PlusCircle, Search, Sparkles, Filter, ChevronRight, X
} from 'lucide-react';
import { getImageUrl } from '../api';

function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  return str.trim();
}

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
  onOpenDigitalCard,
  searchKeyword = '',
  setSearchKeyword,
  allBooks = [],
  onSelectBook,
  categories = [],
  onSelectCategory
}) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchSuggestOpen, setIsSearchSuggestOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState(searchKeyword);

  const quickActionsRef = useRef(null);
  const megaMenuRef = useRef(null);
  const searchBarRef = useRef(null);

  useEffect(() => {
    setLocalSearchInput(searchKeyword);
  }, [searchKeyword]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setIsQuickActionsOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Fuzzy Multi-Field Search Suggestions
  const searchSuggestions = React.useMemo(() => {
    const raw = (localSearchInput || '').trim();
    if (!raw || raw.length < 1 || !Array.isArray(allBooks)) return [];

    const normQuery = removeVietnameseTones(raw);

    return allBooks.filter((b) => {
      const titleNorm = removeVietnameseTones(b.title || '');
      const authorNorm = removeVietnameseTones(b.author || '');
      const isbnNorm = (b.isbn || '').toLowerCase();
      const pubNorm = removeVietnameseTones(b.publisher || '');
      const catNorm = removeVietnameseTones(b.category?.name || '');

      return (
        titleNorm.includes(normQuery) ||
        authorNorm.includes(normQuery) ||
        isbnNorm.includes(normQuery) ||
        pubNorm.includes(normQuery) ||
        catNorm.includes(normQuery)
      );
    }).slice(0, 6); // Max 6 quick suggestions
  }, [localSearchInput, allBooks]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (setSearchKeyword) setSearchKeyword(localSearchInput);
    setIsSearchSuggestOpen(false);
    if (setActiveTab) setActiveTab('catalog');
  };

  return (
    <nav className="glass-nav py-3 px-4 md:px-6 mb-6 border-b border-[#E7DFD5] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1536px] w-full mx-auto flex items-center justify-between gap-3 lg:gap-5">
        
        {/* Brand & Editorial Logo */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 group" 
          onClick={() => {
            if (setActiveTab) setActiveTab('catalog');
            if (setSearchKeyword) setSearchKeyword('');
          }}
          title="Về trang chủ Kho sách"
        >
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-blue-600 to-teal-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-700" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif-book font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-slate-900 leading-none">
                TRI THỨC SỐ
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-600 text-white rounded-md shadow-xs leading-none">
                BOOKSTORE
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 leading-none hidden sm:block">
              Mượn & Mua Sách Chuẩn Biên Tập
            </span>
          </div>
        </div>

        {/* 2. Mega Menu Trigger (Danh Mục Sách Đa Tầng) */}
        <div className="relative hidden lg:block" ref={megaMenuRef}>
          <button
            type="button"
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className={`h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
              isMegaMenuOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 hover:text-blue-700 hover:bg-stone-50 border-[#E7DFD5]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Danh Mục Đa Tầng</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Menu Dropdown */}
          {isMegaMenuOpen && (
            <div className="absolute left-0 mt-2 w-[540px] bg-white rounded-2xl shadow-2xl border border-[#E7DFD5] p-5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-5 text-xs">
                
                {/* Column 1: Sách Tiếng Việt & Văn Học */}
                <div className="space-y-3">
                  <div className="font-serif-book font-bold text-slate-900 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Sách Tiếng Việt & Văn Học
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    {['Tiểu Thuyết & Truyện Ngắn', 'Văn Học Cổ Điển & Hiện Đại', 'Thơ Ca & Kịch Bản', 'Triết Học & Lịch Sử Việt Nam'].map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (setSearchKeyword) setSearchKeyword(sub);
                          setIsMegaMenuOpen(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center justify-between group"
                      >
                        <span>{sub}</span>
                        <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Kinh Doanh & Kỹ Năng & Công Nghệ */}
                <div className="space-y-3">
                  <div className="font-serif-book font-bold text-slate-900 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Kinh Doanh & Công Nghệ
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    {['Kinh Doanh & Khởi Nghiệp', 'Kỹ Năng Sống & Tư Duy', 'Công Nghệ Thông Tin & AI', 'Sách Ngoại Văn (English Books)'].map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (setSearchKeyword) setSearchKeyword(sub);
                          setIsMegaMenuOpen(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer flex items-center justify-between group"
                      >
                        <span>{sub}</span>
                        <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Mega Menu Footer with categories from DB */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hệ thống:</span>
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.id);
                      setIsMegaMenuOpen(false);
                    }}
                    className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-blue-50 text-[11px] font-semibold text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Central Smart Search Bar with Auto-suggest */}
        <div className="flex-1 max-w-xl relative" ref={searchBarRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên sách, tác giả, ISBN, NXB (gợi ý tự động)..."
              value={localSearchInput}
              onFocus={() => setIsSearchSuggestOpen(true)}
              onChange={(e) => {
                setLocalSearchInput(e.target.value);
                setIsSearchSuggestOpen(true);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#E7DFD5] shadow-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {localSearchInput && (
              <button 
                type="button"
                onClick={() => {
                  setLocalSearchInput('');
                  if (setSearchKeyword) setSearchKeyword('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 rounded-full hover:bg-stone-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Auto-suggest / Autocomplete Dropdown Popup */}
          {isSearchSuggestOpen && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E7DFD5] p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-stone-100 mb-1">
                <span>Gợi ý sách phù hợp ({searchSuggestions.length})</span>
                <span className="text-[9px] text-blue-600 font-semibold cursor-pointer" onClick={handleSearchSubmit}>
                  Xem tất cả kết quả ↵
                </span>
              </div>

              <div className="space-y-1">
                {searchSuggestions.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      if (onSelectBook) onSelectBook(book);
                      setIsSearchSuggestOpen(false);
                    }}
                    className="p-2 rounded-xl hover:bg-stone-50 flex items-center gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-14 bg-stone-100 rounded-md overflow-hidden shrink-0 border border-stone-200">
                      <img 
                        src={book.cover_image} 
                        alt={book.title} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-book font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Tác giả: {book.author} • {book.category?.name || 'Tổng hợp'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-xs text-rose-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sale_price)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {book.available_copies_count > 0 ? 'Mượn sẵn sàng' : 'Có hàng mua'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Navigation & User Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Track Order */}
          <button
            onClick={onOpenTrackDelivery}
            className="hidden md:flex h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap text-slate-700 hover:text-blue-700 hover:bg-white border border-[#E7DFD5] transition-all items-center gap-1.5 shadow-2xs"
          >
            <Truck className="w-3.5 h-3.5 text-amber-600" /> 
            <span className="hidden xl:inline">Tra Cứu Vận Đơn</span>
          </button>

          {/* Notification Button */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="relative w-9 h-9 flex items-center justify-center bg-white hover:bg-stone-50 border border-[#E7DFD5] rounded-xl transition-all text-slate-600 hover:text-blue-600 cursor-pointer shadow-2xs"
              title="Hộp thư thông báo"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Wishlist Button */}
          {user && user.role === 'reader' && (
            <button
              onClick={onOpenWishlist}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-rose-50 border border-[#E7DFD5] rounded-xl transition-all text-slate-600 hover:text-rose-600 shadow-2xs"
              title="Sách yêu thích"
            >
              <Heart className="w-4 h-4" />
            </button>
          )}

          {/* 5. Mini Cart Drawer Trigger Button */}
          <button
            onClick={onOpenCart}
            className="relative w-9 h-9 flex items-center justify-center bg-white hover:bg-emerald-50 border border-[#E7DFD5] rounded-xl transition-all text-slate-700 hover:text-emerald-700 shadow-2xs cursor-pointer"
            title="Mở Giỏ Hàng"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#0D9488] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2 cursor-pointer hover:opacity-85 py-0.5 px-1 rounded-xl"
                title="Hồ sơ cá nhân"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/40 bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0">
                  {user.avatar_url ? (
                    <img src={getImageUrl(user.avatar_url)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary h-9 px-3.5 text-xs font-bold">
              <User className="w-3.5 h-3.5 inline mr-1" /> Đăng Nhập
            </button>
          )}

        </div>

      </div>
    </nav>
  );
}
