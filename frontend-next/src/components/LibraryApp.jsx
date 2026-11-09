'use client';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Search, BookOpen, Sparkles, Filter, Bookmark, ShoppingBag, Truck, CheckCircle2, ShieldCheck, HeartHandshake, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import LoginGate from './LoginGate';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import MyBorrowsModal from './MyBorrowsModal';
import CartModal from './CartModal';
import DeliveryModal from './DeliveryModal';
import BankPaymentModal from './BankPaymentModal';
import UserProfileModal from './UserProfileModal';
import CategoryManageModal from './CategoryManageModal';
import AddBookModal from './AddBookModal';
import WishlistModal from './WishlistModal';
import NotificationLogModal from './NotificationLogModal';
import SendNotificationModal from './SendNotificationModal';
import DigitalLibraryCardModal from './DigitalLibraryCardModal';
import BookFindRequestModal from './BookFindRequestModal';
import AIChatWidget from './AIChatWidget';

const LibrarianView = lazy(() => import('./LibrarianView'));
const AdminView = lazy(() => import('./AdminView'));

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'librarian', 'admin'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'borrowable' | 'salable'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'title_asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(false);

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
  const [isFindBookOpen, setIsFindBookOpen] = useState(false);
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
      if (debouncedKeyword) params.keyword = debouncedKeyword;
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
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedCategory, availabilityFilter, sortBy]);

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchBooks(currentPage);
    }
  }, [debouncedKeyword, selectedCategory, availabilityFilter, sortBy, currentPage, activeTab]);

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

  const handleAddToCart = (book) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const existing = cart.find(item => item.id === book.id);
    if (existing) {
      setCart(cart.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...book, quantity: 1 }]);
    }
    showToast(`Đã thêm '${book.title}' vào giỏ hàng!`);
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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Đang xác thực quyền truy cập...</p>
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
    <div className="min-h-screen flex flex-col justify-between">
      <div>
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
          onOpenFindBook={() => setIsFindBookOpen(true)}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" /> {toast}
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'librarian' && user && (user.role === 'librarian' || user.role === 'admin') ? (
          <Suspense fallback={<div className="text-center py-20 text-slate-400">Đang tải phân hệ Thủ thư...</div>}>
            <LibrarianView user={user} />
          </Suspense>
        ) : activeTab === 'admin' && user && user.role === 'admin' ? (
          <Suspense fallback={<div className="text-center py-20 text-slate-400">Đang tải phân hệ Quản trị...</div>}>
            <AdminView user={user} />
          </Suspense>
        ) : (
          /* CATALOG VIEW */
          <main className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
            {/* Hero Banner */}
            <div className="hero-banner p-8 md:p-12 relative overflow-hidden rounded-3xl shadow-2xl">
              
              {/* Floating Magic Dust Particles inside Banner */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(16)].map((_, i) => (
                  <span
                    key={i}
                    className={`magic-particle ${
                      i % 3 === 0 ? 'bg-amber-300 shadow-[0_0_10px_#fcd34d]' : i % 3 === 1 ? 'bg-sky-300 shadow-[0_0_10px_#7dd3fc]' : 'bg-cyan-300 shadow-[0_0_10px_#67e8f9]'
                    }`}
                    style={{
                      left: `${(i * 6.5 + 4) % 95}%`,
                      width: `${(i % 3) * 2 + 3}px`,
                      height: `${(i % 3) * 2 + 3}px`,
                      animationDuration: `${5 + (i % 4) * 1.5}s`,
                      animationDelay: `-${((i * 1.3) % 6).toFixed(1)}s`,
                    }}
                  />
                ))}
                {/* Background Shimmer Sweep */}
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep pointer-events-none" />
              </div>

              {/* Decorative Ambient Radial Glow */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute 1/2 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 shadow-sm relative overflow-hidden group">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} /> 
                  <span>Hệ Thống Quản Lý Thư Viện Thông Minh 4.0</span>
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  Tra Cứu, Mượn & Mua Sách <br />
                  <span className="text-sky-300 font-extrabold drop-shadow-sm">
                    Giao Tận Nơi Nhanh Chóng
                  </span>
                </h1>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed font-normal">
                  Hệ thống hỗ trợ độc giả tự mượn sách giấy, gia hạn trực tuyến 01 lần, thanh toán phí phạt trễ hạn tự động qua MoMo hoặc mua sách mới với dịch vụ vận chuyển nhanh.
                </p>

                {/* Hero Stats with staggered rhythmic wave float */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="hero-stat-card animate-float-phase-1">
                    <div className="font-black text-white text-xl tracking-tight">100% Khả dụng</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Tồn kho cập nhật tức thì</div>
                  </div>
                  <div className="hero-stat-card animate-float-phase-2">
                    <div className="font-black text-amber-300 text-xl tracking-tight">14 Ngày mượn</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Tối đa 3 cuốn sách giấy</div>
                  </div>
                  <div className="hero-stat-card animate-float-phase-3">
                    <div className="font-black text-emerald-300 text-xl tracking-tight">MoMo & VNPay</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Thanh toán tự động 24/7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search Bar with clear button and fixed icon spacing */}
                <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên sách, tác giả, ISBN..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="input-control pl-11 pr-9 py-2.5 text-sm shadow-sm w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  {searchKeyword && (
                    <button 
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-100 transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Pills with smooth horizontal scroll */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === null 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 shadow-sm'
                    }`}
                  >
                    Tất Cả Thể Loại
                  </button>
                  {categoryList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                        selectedCategory === cat.id 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {cat.name} ({cat.books_count || 0})
                    </button>
                  ))}

                  {user && (user.role === 'librarian' || user.role === 'admin') && (
                    <button
                      onClick={() => setIsAddBookOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ml-auto"
                      title="Thêm đầu sách mới"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Sách Mới
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filter & Sort Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" /> Tình trạng:
                  </span>
                  {[
                    { id: 'all', label: 'Tất cả sách' },
                    { id: 'borrowable', label: '📗 Còn bản sao mượn' },
                    { id: 'salable', label: '🛒 Còn hàng mua ngay' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAvailabilityFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        availabilityFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-600">Sắp xếp:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="newest">Mới cập nhật</option>
                      <option value="price_asc">Giá bán: Thấp → Cao</option>
                      <option value="price_desc">Giá bán: Cao → Thấp</option>
                      <option value="year_desc">Năm xuất bản mới nhất</option>
                      <option value="title_asc">Tên sách: A → Z</option>
                    </select>
                  </div>

                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-extrabold">
                    Hiển thị {bookList.length} / {totalBooks} đầu sách
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsFindBookOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Không tìm thấy sách bạn cần? Nhờ Thủ thư tìm giúp và báo khi có sách!"
                  >
                    <Search className="w-3.5 h-3.5" /> Nhờ Thủ Thư Tìm Sách
                  </button>
                </div>
              </div>
            </div>

            {/* Book Catalog Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">Đang tải dữ liệu đầu sách từ hệ thống...</div>
            ) : bookList.length === 0 ? (
              <div className="text-center py-20 glass-panel space-y-4">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Không tìm thấy đầu sách nào</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Bạn chưa tìm thấy sách mình cần trong kho hiện tại? Hãy gửi yêu cầu để Thủ thư tìm giúp và báo ngay cho bạn khi có sách!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFindBookOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Nhờ Thủ Thư Tìm Cuốn "{searchKeyword || 'Sách Này'}" Giúp Tôi</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bookList.map((b) => (
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

                {/* Pagination Bar */}
                {lastPage > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Trước
                    </button>

                    {Array.from({ length: lastPage }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-blue-500/25'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= lastPage}
                      onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 flex items-center gap-1 shadow-sm cursor-pointer"
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

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">© 2026 THƯ VIỆN ONLINE — Hệ thống Quản lý Mượn Trả & Bán Sách Trực Tuyến</p>
          <p>Xây dựng trên nền tảng Laravel 13 API Backend & React Vite Frontend | Tích hợp Redis 7 & Chuyển Khoản Ngân Hàng VietQR (Thủ Thư Duyệt)</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchWishlistIds();
          showToast(`Đăng nhập thành công với vai trò: ${loggedUser.role}`);
        }}
      />

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrowBook}
        onAddToCart={handleAddToCart}
        user={user}
      />

      <MyBorrowsModal
        isOpen={isMyBorrowsOpen}
        onClose={() => setIsMyBorrowsOpen(false)}
        onOpenPayment={handleOpenPayment}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
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

      <BookFindRequestModal
        isOpen={isFindBookOpen}
        onClose={() => setIsFindBookOpen(false)}
        user={user}
        initialKeyword={searchKeyword}
        onSelectBook={setSelectedBook}
        onSuccess={(message) => showToast(message)}
      />

      <AIChatWidget onSelectBook={setSelectedBook} />
    </div>
  );
}

