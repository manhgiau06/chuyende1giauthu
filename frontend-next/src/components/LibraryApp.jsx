'use client';
import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Sparkles, Filter, Bookmark, ShoppingBag, Truck, CheckCircle2, ShieldCheck, HeartHandshake, Plus } from 'lucide-react';
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
import LibrarianView from './LibrarianView';
import AdminView from './AdminView';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'librarian', 'admin'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
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
        showToast('ÄÃ£ thÃªm vÃ o danh sÃ¡ch yÃªu thÃ­ch!');
      } else {
        setWishlistBookIds(wishlistBookIds.filter(id => id !== bookId));
        showToast('ÄÃ£ xÃ³a khá»i danh sÃ¡ch yÃªu thÃ­ch');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'KhÃ´ng thá»ƒ thá»±c hiá»‡n!');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchKeyword) params.keyword = searchKeyword;
      if (selectedCategory) params.category_id = selectedCategory;

      const res = await api.get('/books', { params });
      const rawData = res.data?.data || res.data || [];
      setBooks(Array.isArray(rawData) ? rawData : []);
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
    if (activeTab === 'catalog') {
      fetchBooks();
    }
  }, [searchKeyword, selectedCategory, activeTab]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    setUser(null);
    setWishlistBookIds([]);
    setNotificationCount(0);
    setActiveTab('catalog');
    showToast('ÄÃ£ Ä‘Äƒng xuáº¥t thÃ nh cÃ´ng!');
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
      showToast('ÄÃ£ gá»­i yÃªu cáº§u mÆ°á»£n sÃ¡ch thÃ nh cÃ´ng! Vui lÃ²ng Ä‘á»£i thá»§ thÆ° duyá»‡t.');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'KhÃ´ng thá»ƒ mÆ°á»£n sÃ¡ch!');
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
    showToast(`ÄÃ£ thÃªm '${book.title}' vÃ o giá» hÃ ng!`);
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
      alert(err.response?.data?.message || 'KhÃ´ng thá»ƒ táº¡o yÃªu cáº§u thanh toÃ¡n chuyá»ƒn khoáº£n!');
    }
  };

  const categoryList = Array.isArray(categories) ? categories : [];
  const bookList = Array.isArray(books) ? books : [];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Äang xÃ¡c thá»±c quyá»n truy cáº­p...</p>
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
          showToast(`ÄÄƒng nháº­p thÃ nh cÃ´ng vá»›i vai trÃ²: ${loggedUser.role}`);
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
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" /> {toast}
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'librarian' && user && (user.role === 'librarian' || user.role === 'admin') ? (
          <LibrarianView user={user} />
        ) : activeTab === 'admin' && user && user.role === 'admin' ? (
          <AdminView user={user} />
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
                  <span>Há»‡ Thá»‘ng Quáº£n LÃ½ ThÆ° Viá»‡n ThÃ´ng Minh 4.0</span>
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  Tra Cá»©u, MÆ°á»£n & Mua SÃ¡ch <br />
                  <span className="text-sky-300 font-extrabold drop-shadow-sm">
                    Giao Táº­n NÆ¡i Nhanh ChÃ³ng
                  </span>
                </h1>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed font-normal">
                  Há»‡ thá»‘ng há»— trá»£ Ä‘á»™c giáº£ tá»± mÆ°á»£n sÃ¡ch giáº¥y, gia háº¡n trá»±c tuyáº¿n 01 láº§n, thanh toÃ¡n phÃ­ pháº¡t trá»… háº¡n tá»± Ä‘á»™ng qua MoMo hoáº·c mua sÃ¡ch má»›i vá»›i dá»‹ch vá»¥ váº­n chuyá»ƒn nhanh.
                </p>

                {/* Hero Stats with staggered rhythmic wave float */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="hero-stat-card animate-float-phase-1">
                    <div className="font-black text-white text-xl tracking-tight">100% Kháº£ dá»¥ng</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Tá»“n kho cáº­p nháº­t tá»©c thÃ¬</div>
                  </div>
                  <div className="hero-stat-card animate-float-phase-2">
                    <div className="font-black text-amber-300 text-xl tracking-tight">14 NgÃ y mÆ°á»£n</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Tá»‘i Ä‘a 3 cuá»‘n sÃ¡ch giáº¥y</div>
                  </div>
                  <div className="hero-stat-card animate-float-phase-3">
                    <div className="font-black text-emerald-300 text-xl tracking-tight">MoMo & VNPay</div>
                    <div className="text-blue-100/90 text-[11px] font-medium mt-0.5">Thanh toÃ¡n tá»± Ä‘á»™ng 24/7</div>
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
                    placeholder="TÃ¬m theo tÃªn sÃ¡ch, tÃ¡c giáº£, ISBN..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="input-control pl-11 pr-9 py-2.5 text-sm shadow-sm w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  {searchKeyword && (
                    <button 
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-100 transition-colors"
                      title="XÃ³a tÃ¬m kiáº¿m"
                    >
                      âœ•
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
                    Táº¥t Cáº£ Thá»ƒ Loáº¡i
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
                      title="ThÃªm Ä‘áº§u sÃ¡ch má»›i"
                    >
                      <Plus className="w-3.5 h-3.5" /> ThÃªm SÃ¡ch Má»›i
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Book Catalog Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">Äang táº£i dá»¯ liá»‡u Ä‘áº§u sÃ¡ch tá»« há»‡ thá»‘ng...</div>
            ) : bookList.length === 0 ? (
              <div className="text-center py-20 glass-panel">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">KhÃ´ng tÃ¬m tháº¥y Ä‘áº§u sÃ¡ch nÃ o</h3>
                <p className="text-xs text-slate-400">Thá»­ tá»« khÃ³a hoáº·c chá»n thá»ƒ loáº¡i khÃ¡c</p>
              </div>
            ) : (
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
            )}
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">Â© 2026 THÆ¯ VIá»†N ONLINE â€” Há»‡ thá»‘ng Quáº£n lÃ½ MÆ°á»£n Tráº£ & BÃ¡n SÃ¡ch Trá»±c Tuyáº¿n</p>
          <p>XÃ¢y dá»±ng trÃªn ná»n táº£ng Laravel 13 API Backend & React Vite Frontend | TÃ­ch há»£p Redis 7 & Chuyá»ƒn Khoáº£n NgÃ¢n HÃ ng VietQR (Thá»§ ThÆ° Duyá»‡t)</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchWishlistIds();
          showToast(`ÄÄƒng nháº­p thÃ nh cÃ´ng vá»›i vai trÃ²: ${loggedUser.role}`);
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
            showToast('ÄÃ£ gá»­i thÃ´ng tin chuyá»ƒn khoáº£n! Vui lÃ²ng Ä‘á»£i thá»§ thÆ° duyá»‡t.');
          } else {
            showToast('Thanh toÃ¡n Ä‘Æ¡n hÃ ng/phÃ­ pháº¡t thÃ nh cÃ´ng!');
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
          showToast('ÄÃ£ cáº­p nháº­t thÃ´ng tin há»“ sÆ¡!');
        }}
      />

      <CategoryManageModal
        isOpen={isCategoryManageOpen}
        onClose={() => setIsCategoryManageOpen(false)}
        onCategoryCreated={(newCat) => {
          fetchCategories();
          showToast(`ÄÃ£ thÃªm thá»ƒ loáº¡i '${newCat.name}'!`);
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
          showToast(`ÄÃ£ thÃªm sÃ¡ch '${newBook?.title || ''}' thÃ nh cÃ´ng!`);
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
          showToast(data.message || 'ÄÃ£ gá»­i thÃ´ng bÃ¡o thÃ nh cÃ´ng!');
          fetchNotificationCount();
        }}
      />

      <DigitalLibraryCardModal
        isOpen={isDigitalCardOpen}
        onClose={() => setIsDigitalCardOpen(false)}
        user={user}
      />
    </div>
  );
}


