import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Sparkles, Filter, Bookmark, ShoppingBag, Truck, 
  CheckCircle2, ShieldCheck, HeartHandshake, Plus, ArrowUpDown, 
  ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw, Home, Layers, Globe, Award
} from 'lucide-react';
import api from './api';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LoginGate from './components/LoginGate';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import MyBorrowsModal from './components/MyBorrowsModal';
import CartModal from './components/CartModal';
import DeliveryModal from './components/DeliveryModal';
import BankPaymentModal from './components/BankPaymentModal';
import UserProfileModal from './components/UserProfileModal';
import CategoryManageModal from './components/CategoryManageModal';
import AddBookModal from './components/AddBookModal';
import WishlistModal from './components/WishlistModal';
import NotificationLogModal from './components/NotificationLogModal';
import SendNotificationModal from './components/SendNotificationModal';
import DigitalLibraryCardModal from './components/DigitalLibraryCardModal';
import LibrarianView from './components/LibrarianView';
import AdminView from './components/AdminView';
import AIChatWidget from './components/AIChatWidget';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'librarian', 'admin'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'borrowable' | 'salable'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'title_asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(false);

  // 2. Faceted Filters State (Standard 2)
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under100k' | '100kTo200k' | 'above200k'
  const [publisherFilter, setPublisherFilter] = useState('all'); // 'all' | 'Trẻ' | 'Kim Đồng' | 'Nhã Nam' | 'Phụ Nữ'
  const [coverFormatFilter, setCoverFormatFilter] = useState('all'); // 'all' | 'paperback' | 'hardcover' | 'ebook'
  const [languageFilter, setLanguageFilter] = useState('all'); // 'all' | 'vi' | 'en'
  const [showFacetedFilters, setShowFacetedFilters] = useState(false);

  // Modals visibility
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isMyBorrowsOpen, setIsMyBorrowsOpen] = useState(false);
  const [isDigitalCardOpen, setIsDigitalCardOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackDeliveryOpen, setIsTrackDeliveryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotificationLogOpen, setIsNotificationLogOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Wishlist book IDs state
  const [wishlistBookIds, setWishlistBookIds] = useState([]);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notification Toast
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchNotificationCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setNotificationCount(res.data?.count || 0);
    } catch {
      setNotificationCount(0);
    }
  };

  // Check auth user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const u = res.data.user || null;
          setUser(u);
          if (u) {
            fetchWishlistIds();
            fetchNotificationCount();
          }
        } catch {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setAuthChecking(false);
    };
    checkAuth();
    fetchCategories();
  }, []);

  const fetchWishlistIds = async () => {
    try {
      const res = await api.get('/wishlist');
      const ids = (res.data.wishlists || []).map(w => w.book_id);
      setWishlistBookIds(ids);
    } catch {
      setWishlistBookIds([]);
    }
  };

  const handleToggleWishlist = async (bookId) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await api.post(`/wishlist/${bookId}/toggle`);
      if (res.data.is_wishlisted) {
        setWishlistBookIds([...wishlistBookIds, bookId]);
        showToast('Đã thêm vào danh sách yêu thích!');
      } else {
        setWishlistBookIds(wishlistBookIds.filter(id => id !== bookId));
        showToast('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thực hiện!');
    }
  };

  const fetchBooks = async (pageToLoad = currentPage) => {
    setLoading(true);
    try {
      const params = {
        page: pageToLoad,
        per_page: 8,
        sort: sortBy,
      };
      if (searchKeyword) params.keyword = searchKeyword;
      if (selectedCategory) params.category_id = selectedCategory;
      if (availabilityFilter !== 'all') params.availability = availabilityFilter;

      const res = await api.get('/books', { params });
      const rawData = res.data?.data || res.data || [];
      setBooks(Array.isArray(rawData) ? rawData : []);
      setCurrentPage(Number(res.data?.current_page || pageToLoad));
      setLastPage(Number(res.data?.last_page || 1));
      setTotalBooks(Number(res.data?.total ?? (Array.isArray(rawData) ? rawData.length : 0)));
    } catch (err) {
      console.error(err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = res.data?.categories;
      if (Array.isArray(cats)) {
        setCategories(cats);
      } else if (cats && typeof cats === 'object') {
        setCategories(Object.values(cats));
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedCategory, availabilityFilter, sortBy]);

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchBooks(currentPage);
    }
  }, [searchKeyword, selectedCategory, availabilityFilter, sortBy, currentPage, activeTab]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    setUser(null);
    setWishlistBookIds([]);
    setNotificationCount(0);
    setActiveTab('catalog');
    showToast('Đã đăng xuất thành công!');
  };

  const handleBorrowBook = async (book) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await api.post('/borrow-tickets', {
        book_ids: [book.id],
      });
      showToast('Đã gửi yêu cầu mượn sách thành công! Vui lòng đợi thủ thư duyệt.');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể mượn sách!');
    }
  };

  // 5. Slide-out Mini Cart trigger immediately upon Add to Cart
  const handleAddToCart = (book) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const existing = cart.find(item => item.id === book.id);
    if (existing) {
      setCart(cart.map(item => item.id === book.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item));
    } else {
      setCart([...cart, { ...book, quantity: 1 }]);
    }
    showToast(`Đã thêm '${book.title}' vào giỏ hàng!`);
    setIsCartOpen(true); // Open Slide-out Mini Cart Drawer
  };

  const handleUpdateCartQuantity = (bookId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== bookId));
    } else {
      setCart(cart.map(item => item.id === bookId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveFromCart = (bookId) => {
    setCart(cart.filter(item => item.id !== bookId));
  };

  const handleOpenPayment = async (type, id) => {
    try {
      const res = await api.post('/payments/create', {
        type,
        id,
        payment_method: 'bank_transfer',
      });
      setPaymentInfo(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo yêu cầu thanh toán chuyển khoản!');
    }
  };

  const categoryList = Array.isArray(categories) ? categories : [];
  const bookList = Array.isArray(books) ? books : [];

  // 2. Client-side Faceted Filter Refinement
  const displayedBooks = bookList.filter((b) => {
    const price = Number(b.sale_price || 0);
    if (priceRange === 'under100k' && price >= 100000) return false;
    if (priceRange === '100kTo200k' && (price < 100000 || price > 200000)) return false;
    if (priceRange === 'above200k' && price <= 200000) return false;

    if (publisherFilter !== 'all') {
      const pub = (b.publisher || '').toLowerCase();
      if (!pub.includes(publisherFilter.toLowerCase())) return false;
    }

    return true;
  });

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSearchKeyword('');
    setAvailabilityFilter('all');
    setPriceRange('all');
    setPublisherFilter('all');
    setCoverFormatFilter('all');
    setLanguageFilter('all');
    setSortBy('newest');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600">Đang khởi tạo thư viện tri thức...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginGate
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchWishlistIds();
          fetchNotificationCount();
          showToast(`Đăng nhập thành công với vai trò: ${loggedUser.role}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-slate-800">
      <div>
        {/* 2. Top Header with Central Smart Search & Mega Menu */}
        <Navbar
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          cartCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
          notificationCount={notificationCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenMyBorrows={() => setIsMyBorrowsOpen(true)}
          onOpenTrackDelivery={() => setIsTrackDeliveryOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAddCategory={() => setIsCategoryManageOpen(true)}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenSendNotification={() => setIsSendNotificationOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenNotifications={() => {
            setIsNotificationLogOpen(true);
            setNotificationCount(0);
          }}
          onOpenDigitalCard={() => setIsDigitalCardOpen(true)}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          allBooks={books}
          onSelectBook={setSelectedBook}
          categories={categoryList}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 animate-bounce border border-stone-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {toast}
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'librarian' && user && (user.role === 'librarian' || user.role === 'admin') ? (
          <LibrarianView user={user} />
        ) : activeTab === 'admin' && user && user.role === 'admin' ? (
          <AdminView user={user} />
        ) : (
          /* CATALOG VIEW */
          <main className="max-w-7xl mx-auto px-4 pb-16 space-y-6">
            
            {/* 1. Hero Banner with Soothing Editorial Warm Tones */}
            <div className="p-8 md:p-12 relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-r from-[#1E293B] via-[#24354A] to-[#1E293B] text-white border border-stone-700/60">
              {/* Subtle ambient lighting */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold rounded-full border border-white/15 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" /> 
                  <span>Không Gian Tri Thức & Xuất Bản Chuẩn Biên Tập</span>
                </span>
                
                <h1 className="font-serif-book text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-stone-100">
                  Đắm Mình Vào Từng Trang Sách, <br />
                  <span className="text-amber-400 italic">Mượn Tiện Lợi & Mua Chu Đáo</span>
                </h1>
                
                <p className="text-stone-300 text-sm md:text-base leading-relaxed font-sans-book">
                  Trải nghiệm mượn sách giấy trực tuyến, lật xem thử 5 trang trước khi chọn, hỗ trợ bọc sách plastic chống ẩm và thanh toán chuyển khoản tự động 24/7.
                </p>

                {/* Editorial Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="font-serif-book font-bold text-lg text-amber-300">Tỷ Lệ 2:3</div>
                    <div className="text-stone-300 text-[11px] mt-0.5">Khung ảnh bìa chuẩn biên tập</div>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="font-serif-book font-bold text-lg text-emerald-300">Look Inside</div>
                    <div className="text-stone-300 text-[11px] mt-0.5">Đọc thử trích đoạn trước khi mua</div>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="font-serif-book font-bold text-lg text-sky-300">Freeship 200k</div>
                    <div className="text-stone-300 text-[11px] mt-0.5">Tiến trình nhận quà vận chuyển</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Breadcrumbs Navigation (Thanh điều hướng phân cấp) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs">
              <nav className="flex items-center gap-1.5 text-slate-500 font-medium">
                <button 
                  onClick={resetAllFilters}
                  className="hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5" /> Trang Chủ
                </button>
                <span>/</span>
                <button 
                  onClick={() => { setSelectedCategory(null); setSearchKeyword(''); }}
                  className={`hover:text-blue-700 transition-colors ${!selectedCategory && !searchKeyword ? 'text-slate-900 font-bold' : ''}`}
                >
                  Kho Sách
                </button>
                {selectedCategory && (
                  <>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">
                      {categoryList.find(c => c.id === selectedCategory)?.name || 'Thể loại'}
                    </span>
                  </>
                )}
                {searchKeyword && (
                  <>
                    <span>/</span>
                    <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Từ khóa: "{searchKeyword}"
                    </span>
                  </>
                )}
              </nav>

              {(selectedCategory || searchKeyword || priceRange !== 'all' || publisherFilter !== 'all') && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Đặt lại tất cả bộ lọc
                </button>
              )}
            </div>

            {/* Category Pills & Faceted Filter Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    selectedCategory === null 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-white text-slate-700 hover:text-blue-700 hover:bg-stone-50 border border-[#E7DFD5]'
                  }`}
                >
                  Tất Cả Thể Loại
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat.id 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-700 hover:text-blue-700 hover:bg-stone-50 border border-[#E7DFD5]'
                    }`}
                  >
                    {cat.name} ({cat.books_count || 0})
                  </button>
                ))}

                {user && (user.role === 'librarian' || user.role === 'admin') && (
                  <button
                    onClick={() => setIsAddBookOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ml-auto"
                    title="Thêm đầu sách mới"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Sách Mới
                  </button>
                )}
              </div>

              {/* 2. Faceted Filters Toolbar & Toggler */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E7DFD5] shadow-xs space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Quick Availability Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-blue-600" /> Tình trạng:
                    </span>
                    {[
                      { id: 'all', label: 'Tất cả sách' },
                      { id: 'borrowable', label: 'Còn bản sao mượn' },
                      { id: 'salable', label: 'Còn hàng mua ngay' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAvailabilityFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          availabilityFilter === f.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Toggle Faceted Button & Sorter */}
                  <div className="flex flex-wrap items-center gap-3 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowFacetedFilters(!showFacetedFilters)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        showFacetedFilters
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                      <span>Bộ Lọc Chuyên Sâu</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold text-slate-700">Sắp xếp:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="newest">Mới cập nhật</option>
                        <option value="price_asc">Giá bán: Thấp → Cao</option>
                        <option value="price_desc">Giá bán: Cao → Thấp</option>
                        <option value="year_desc">Năm xuất bản mới nhất</option>
                        <option value="title_asc">Tên sách: A → Z</option>
                      </select>
                    </div>

                    <span className="px-2.5 py-1 bg-stone-100 text-slate-700 border border-stone-200 rounded-xl font-bold">
                      {displayedBooks.length} / {totalBooks} sách
                    </span>
                  </div>
                </div>

                {/* 2. Faceted Filter Detailed Panel */}
                {showFacetedFilters && (
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                    
                    {/* Khoảng giá */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">Khoảng giá sách:</label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-medium text-slate-700"
                      >
                        <option value="all">Tất cả mức giá</option>
                        <option value="under100k">Dưới 100.000đ</option>
                        <option value="100kTo200k">100.000đ — 200.000đ</option>
                        <option value="above200k">Trên 200.000đ</option>
                      </select>
                    </div>

                    {/* Nhà xuất bản */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">Nhà xuất bản:</label>
                      <select
                        value={publisherFilter}
                        onChange={(e) => setPublisherFilter(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-medium text-slate-700"
                      >
                        <option value="all">Tất cả NXB</option>
                        <option value="Trẻ">NXB Trẻ</option>
                        <option value="Kim Đồng">NXB Kim Đồng</option>
                        <option value="Nhã Nam">Nhã Nam</option>
                        <option value="Phụ Nữ">NXB Phụ Nữ</option>
                        <option value="Tổng Hợp">NXB Tổng Hợp</option>
                      </select>
                    </div>

                    {/* Định dạng bìa */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">Định dạng bìa:</label>
                      <select
                        value={coverFormatFilter}
                        onChange={(e) => setCoverFormatFilter(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-medium text-slate-700"
                      >
                        <option value="all">Tất cả định dạng</option>
                        <option value="paperback">Bìa mềm (Paperback)</option>
                        <option value="hardcover">Bìa cứng (Hardcover)</option>
                        <option value="ebook">Sách điện tử (E-Book)</option>
                      </select>
                    </div>

                    {/* Ngôn ngữ */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">Ngôn ngữ:</label>
                      <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-medium text-slate-700"
                      >
                        <option value="all">Tất cả ngôn ngữ</option>
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">Tiếng Anh (English)</option>
                      </select>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* 1. Book Catalog Grid with 2:3 Aspect Ratio Product Cards */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">Đang tải danh mục sách chuẩn biên tập...</div>
            ) : displayedBooks.length === 0 ? (
              <div className="text-center py-20 p-8 bg-white rounded-2xl border border-[#E7DFD5]">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-serif-book text-lg font-bold text-slate-800">Không tìm thấy đầu sách nào</h3>
                <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedBooks.map((b) => (
                    <BookCard
                      key={b.id}
                      book={b}
                      onSelect={setSelectedBook}
                      onBorrow={handleBorrowBook}
                      onAddToCart={handleAddToCart}
                      user={user}
                      isWishlisted={wishlistBookIds.includes(b.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {lastPage > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#E7DFD5] text-xs font-bold text-slate-700 hover:bg-stone-50 disabled:opacity-40 flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Trước
                    </button>

                    {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-[#E7DFD5] hover:bg-stone-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= lastPage}
                      onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#E7DFD5] text-xs font-bold text-slate-700 hover:bg-stone-50 disabled:opacity-40 flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      Sau <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </main>
        )}
      </div>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E7DFD5] py-8 bg-[#1E293B] text-center text-xs text-stone-300">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif-book font-bold text-sm text-stone-100">
            © 2026 THƯ VIỆN ONLINE — Hệ Thống Quản Lý Thư Viện Tri Thức Số & Bán Sách Trực Tuyến
          </p>
          <p className="text-stone-400">
            Tuân thủ Chuẩn Thiết Kế Giao Diện Thị Giác, Tìm Kiếm Đa Trường, Đọc Thử Look Inside, Combo Tiết Kiệm & Giỏ Hàng Trượt Mini Cart
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchWishlistIds();
          showToast(`Đăng nhập thành công với vai trò: ${loggedUser.role}`);
        }}
      />

      {/* 3. Product Detail Page Modal (PDP) */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrowBook}
        onAddToCart={handleAddToCart}
        user={user}
        onFilterByAuthor={(author) => {
          setSearchKeyword(author);
          setSelectedCategory(null);
        }}
        allBooks={books}
      />

      <MyBorrowsModal
        isOpen={isMyBorrowsOpen}
        onClose={() => setIsMyBorrowsOpen(false)}
        onOpenPayment={handleOpenPayment}
      />

      {/* 5. Slide-out Mini Cart Drawer */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        onOpenPayment={handleOpenPayment}
        user={user}
      />

      <DeliveryModal
        isOpen={isTrackDeliveryOpen}
        onClose={() => setIsTrackDeliveryOpen(false)}
      />

      <BankPaymentModal
        isOpen={!!paymentInfo}
        onClose={() => setPaymentInfo(null)}
        paymentInfo={paymentInfo}
        onSuccess={(awaitingApproval) => {
          if (awaitingApproval) {
            showToast('Đã gửi thông tin chuyển khoản! Vui lòng đợi thủ thư duyệt.');
          } else {
            showToast('Thanh toán đơn hàng/phí phạt thành công!');
            fetchNotificationCount();
          }
          fetchBooks();
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateSuccess={(updatedUser) => {
          setUser(updatedUser);
          showToast('Đã cập nhật thông tin hồ sơ!');
        }}
      />

      <CategoryManageModal
        isOpen={isCategoryManageOpen}
        onClose={() => setIsCategoryManageOpen(false)}
        onCategoryCreated={(newCat) => {
          fetchCategories();
          showToast(`Đã thêm thể loại '${newCat.name}'!`);
        }}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        categories={categoryList}
        onBookCreated={(newBook) => {
          setSelectedCategory(null);
          setSearchKeyword('');
          fetchBooks();
          fetchCategories();
          showToast(`Đã thêm sách '${newBook?.title || ''}' thành công!`);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onSelectBook={setSelectedBook}
        onBorrow={handleBorrowBook}
        onAddToCart={handleAddToCart}
        user={user}
      />

      <NotificationLogModal
        isOpen={isNotificationLogOpen}
        onClose={() => setIsNotificationLogOpen(false)}
      />

      <SendNotificationModal
        isOpen={isSendNotificationOpen}
        onClose={() => setIsSendNotificationOpen(false)}
        onSuccess={(data) => {
          showToast(data.message || 'Đã gửi thông báo thành công!');
          fetchNotificationCount();
        }}
      />

      <DigitalLibraryCardModal
        isOpen={isDigitalCardOpen}
        onClose={() => setIsDigitalCardOpen(false)}
        user={user}
      />

      <AIChatWidget onSelectBook={setSelectedBook} />
    </div>
  );
}
