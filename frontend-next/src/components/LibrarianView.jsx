'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, BookOpen, CheckCircle, RotateCcw, Truck, Upload, AlertCircle, Trash2, 
  Printer, Search, QrCode, Camera, Clock, Bell, CreditCard, CheckCircle2, 
  XCircle, Building2, Send, Filter, Sparkles, Layers, ArrowUpRight, Eye, Pencil, Barcode, Package
} from 'lucide-react';
import api from '../api';
import PrintReceiptModal from './PrintReceiptModal';
import CameraScannerModal from './CameraScannerModal';
import BankConfigModal from './BankConfigModal';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import BookCopiesModal from './BookCopiesModal';
import SendNotificationModal from './SendNotificationModal';

export default function LibrarianView({ user }) {
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'borrows', 'orders', 'reservations', 'payments'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isBankConfigOpen, setIsBankConfigOpen] = useState(false);
  const [currentBankConfig, setCurrentBankConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Quick Search & QR state for Borrows
  const [searchBorrow, setSearchBorrow] = useState('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [selectedPrintData, setSelectedPrintData] = useState(null);
  const [printType, setPrintType] = useState('ticket');

  // Search and Filters for Books table
  const [searchBook, setSearchBook] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all'); // 'all', 'borrow_available', 'borrow_empty', 'sale_available', 'sale_empty'

  // Modal states for creating, editing, and viewing book copies
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState(null);
  const [isCopiesModalOpen, setIsCopiesModalOpen] = useState(false);
  const [selectedBookIdForCopies, setSelectedBookIdForCopies] = useState(null);

  // Notification states
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);
  const [targetReaderForNotification, setTargetReaderForNotification] = useState(null);

  const fetchBankConfig = async () => {
    try {
      const res = await api.get('/bank-config');
      setCurrentBankConfig(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data.payments?.data || []);
      setPendingPaymentsCount(res.data.pending_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resB, resC, resT, resO, resR] = await Promise.all([
        api.get('/books?per_page=100'),
        api.get('/categories'),
        api.get('/borrow-tickets'),
        api.get('/orders'),
        api.get('/reservations'),
      ]);
      setBooks(resB.data.data || []);
      setCategories(resC.data.categories || []);
      setTickets(resT.data.data || []);
      setOrders(resO.data.data || []);
      setReservations(resR.data.reservations || []);
      fetchPayments();
      fetchBankConfig();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm('Bạn đã đối soát tài khoản ngân hàng và muốn DUYỆT giao dịch thanh toán này?')) return;
    setError('');
    setMsg('');
    try {
      const res = await api.post(`/admin/payments/${paymentId}/approve`);
      setMsg(res.data.message);
      fetchData();
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt thanh toán!');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = window.prompt('Nhập lý do từ chối thanh toán (ví dụ: Chưa nhận được tiền, sai số tiền...):');
    if (reason === null) return;
    setError('');
    setMsg('');
    try {
      const res = await api.post(`/admin/payments/${paymentId}/reject`, { reason });
      setMsg(res.data.message);
      fetchData();
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối thanh toán!');
    }
  };

  const handleNotifyReservation = async (resId) => {
    try {
      const res = await api.post(`/reservations/${resId}/notify`);
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi thông báo!');
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ lượt đặt trước này?')) return;
    try {
      const res = await api.delete(`/reservations/${resId}`);
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể huỷ đặt trước!');
    }
  };

  const handleRemindTicket = async (ticketId) => {
    try {
      const res = await api.post(`/borrow-tickets/${ticketId}/remind`);
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi thông báo nhắc nhở!');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đầu sách này không?')) return;
    setError('');
    setMsg('');
    try {
      const res = await api.delete(`/books/${bookId}`);
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xoá đầu sách!');
    }
  };

  const handleApproveTicket = async (ticketId) => {
    try {
      await api.post(`/borrow-tickets/${ticketId}/approve`);
      setMsg(`Đã duyệt phiếu mượn #${ticketId}!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt phiếu!');
    }
  };

  const handleReturnBooks = async (ticketId) => {
    try {
      const res = await api.post(`/borrow-tickets/${ticketId}/return`);
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi trả sách!');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newOrderStatus, newDeliveryStatus) => {
    try {
      await api.post(`/orders/${orderId}/status`, {
        order_status: newOrderStatus,
        delivery_status: newDeliveryStatus,
        note: `Thủ thư cập nhật trạng thái: ${newDeliveryStatus}`,
        location: 'Kho Bưu cục Thư Viện',
      });
      setMsg(`Đã cập nhật trạng thái đơn hàng #${orderId}!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật đơn hàng!');
    }
  };

  // Filter books by search keyword, category, and stock status
  const filteredBooks = books.filter(b => {
    // 1. Keyword search
    if (searchBook) {
      const q = searchBook.toLowerCase();
      const matchKeyword = (
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.name?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q) ||
        b.publisher?.toLowerCase().includes(q)
      );
      if (!matchKeyword) return false;
    }

    // 2. Category filter
    if (selectedCategoryFilter !== 'all') {
      if (b.category_id?.toString() !== selectedCategoryFilter.toString()) {
        return false;
      }
    }

    // 3. Stock status filter
    if (selectedStockFilter === 'borrow_available') {
      if ((b.available_copies_count ?? 0) <= 0) return false;
    } else if (selectedStockFilter === 'borrow_empty') {
      if ((b.available_copies_count ?? 0) > 0) return false;
    } else if (selectedStockFilter === 'sale_available') {
      if ((b.available_stock_count ?? 0) <= 0) return false;
    } else if (selectedStockFilter === 'sale_empty') {
      if ((b.available_stock_count ?? 0) > 0) return false;
    }

    return true;
  });

  // Filter tickets by search keyword
  const filteredTickets = tickets.filter(t => {
    if (!searchBorrow) return true;
    const q = searchBorrow.toLowerCase();
    return (
      t.id.toString().includes(q) ||
      t.reader?.name?.toLowerCase().includes(q) ||
      t.reader?.email?.toLowerCase().includes(q) ||
      t.items?.some(i => i.book_copy?.barcode?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1536px] w-full mx-auto px-4 md:px-6 pb-16 space-y-6">
      
      {/* ========================================================================= */}
      {/* FANTASY HERO HEADER BANNER WITH PARTICLES & PAN-ZOOM */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/60 shadow-2xl p-6 sm:p-8 bg-slate-900 text-white">
        
        {/* Moving Fantasy Image with Camera Pan-Zoom */}
        <img
          src="/login-bg.jpg"
          alt="Fantasy Library Header"
          className="absolute inset-0 w-full h-full object-cover animate-pan-zoom scale-105 filter contrast-105 pointer-events-none select-none"
        />

        {/* Ambient Dark & Gradient Overlays for contrast and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-sky-950/50 backdrop-blur-[1px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

        {/* Floating Magic Dust Particles inside Banner */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className={`magic-particle ${
                i % 3 === 0 
                  ? 'bg-amber-300 shadow-[0_0_12px_#fcd34d]' 
                  : i % 3 === 1 
                    ? 'bg-cyan-300 shadow-[0_0_12px_#67e8f9]' 
                    : 'bg-emerald-300 shadow-[0_0_12px_#6ee7b7]'
              }`}
              style={{
                left: `${(i * 5.2 + 2) % 96}%`,
                width: `${(i % 3) * 2 + 3}px`,
                height: `${(i % 3) * 2 + 3}px`,
                animationDuration: `${5 + (i % 4) * 1.5}s`,
                animationDelay: `-${((i * 1.1) % 6).toFixed(1)}s`,
              }}
            />
          ))}
          {/* Subtle Shimmer Sweep */}
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep pointer-events-none" />
        </div>

        {/* Banner Content Layout */}
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold text-sky-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Không Gian Nghiệp Vụ Thủ Thư 4.0</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-500/30 animate-neon-glow shrink-0">
                <div className="w-full h-full bg-slate-900/20 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Bảng Quản Lý Thủ Thư
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-blue-100/90 font-normal leading-relaxed">
              Hệ thống điều phối kho sách hỗn hợp, duyệt phiếu mượn & trả, theo dõi tiến độ giao hàng và đối soát thanh toán chuyển khoản VietQR tự động.
            </p>
          </div>

          {/* Glassmorphism Tab Switcher inside Banner */}
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xl p-1.5 rounded-2xl border border-white/25 shadow-xl flex-wrap w-full xl:w-auto">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho Sách</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'books' ? 'bg-white/25 text-white' : 'bg-white/20 text-white/90'}`}>
                {books.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('borrows')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'borrows'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Duyệt & Trả Sách</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'borrows' ? 'bg-white/25 text-white' : 'bg-white/20 text-white/90'}`}>
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Đơn Hàng ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reservations'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Hàng Đợi ({reservations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
              <span>Duyệt Tiền</span>
              {pendingPaymentsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse">
                  {pendingPaymentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setTargetReaderForNotification(null);
                setIsSendNotificationOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-purple-500/30 hover:bg-purple-600 text-purple-100 hover:text-white border border-purple-400/40 cursor-pointer ml-auto"
              title="Gửi thông báo tới độc giả"
            >
              <Send className="w-3.5 h-3.5 text-purple-300" />
              <span>Gửi Tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING GLASSMORPHISM STAT METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div 
          className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-lg shadow-blue-900/5 border-l-4 border-l-blue-600 animate-float-phase-1 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Đầu Sách</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{books.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Sách giấy mượn & bán</div>
        </div>

        {/* Metric 2 */}
        <div 
          className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-lg shadow-amber-900/5 border-l-4 border-l-amber-500 animate-float-phase-2 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phiếu Mượn Hoạt Động</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {tickets.filter(t => t.status === 'borrowed' || t.status === 'overdue').length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
            {tickets.filter(t => t.status === 'pending').length} phiếu chờ duyệt
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-lg shadow-purple-900/5 border-l-4 border-l-purple-500 animate-float-phase-3 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đơn Hàng Mua Sách</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{orders.length}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
            {orders.filter(o => o.order_status === 'processing').length} đơn đang xử lý
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 shadow-lg shadow-emerald-900/5 border-l-4 border-l-emerald-500 animate-float-phase-4 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chờ Duyệt Chuyển Khoản</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>{pendingPaymentsCount}</span>
            {pendingPaymentsCount > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Cần duyệt
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">VietQR qua ngân hàng</div>
        </div>
      </div>

      {/* Global Alerts */}
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: KHO SÁCH HỖN HỢP */}
      {/* ========================================================================= */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Header & Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Kho Sách Hỗn Hợp (Mượn & Bán)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý danh mục đầu sách, cấp phát mã vạch bản sao và điều phối tồn kho bán
                </p>
              </div>

              {/* Action: Add Book */}
              <button 
                onClick={() => setIsAddBookOpen(true)} 
                className="relative overflow-hidden group px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
              >
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Đầu Sách Mới</span>
                </span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, tác giả, ISBN..."
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 font-medium cursor-pointer shadow-xs"
                >
                  <option value="all">Tất cả thể loại ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock status filter */}
              <div className="relative">
                <select
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 font-medium cursor-pointer shadow-xs"
                >
                  <option value="all">Tất cả trạng thái kho</option>
                  <option value="borrow_available">Còn bản mượn sẵn sàng</option>
                  <option value="borrow_empty">Hết bản mượn (0 bản)</option>
                  <option value="sale_available">Còn hàng mở bán</option>
                  <option value="sale_empty">Hết hàng mở bán (0 cuốn)</option>
                </select>
              </div>

              {/* Reset filter / Quick Summary pill */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">
                  Hiển thị: <strong className="text-blue-600">{filteredBooks.length}</strong> / {books.length} sách
                </span>
                {(searchBook || selectedCategoryFilter !== 'all' || selectedStockFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchBook('');
                      setSelectedCategoryFilter('all');
                      setSelectedStockFilter('all');
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                  >
                    Đặt lại
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add Book Modal */}
          <AddBookModal
            isOpen={isAddBookOpen}
            onClose={() => setIsAddBookOpen(false)}
            categories={categories}
            onBookCreated={(newBook) => {
              setMsg(`Thêm đầu sách "${newBook?.title || ''}" thành công!`);
              fetchData();
            }}
          />

          {/* Edit Book Modal */}
          <EditBookModal
            isOpen={isEditBookOpen}
            onClose={() => {
              setIsEditBookOpen(false);
              setSelectedBookForEdit(null);
            }}
            book={selectedBookForEdit}
            categories={categories}
            onBookUpdated={(updatedBook) => {
              setMsg(`Cập nhật đầu sách "${updatedBook?.title || ''}" thành công!`);
              setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
              fetchData();
            }}
          />

          {/* Book Copies & Barcodes Modal */}
          <BookCopiesModal
            isOpen={isCopiesModalOpen}
            onClose={() => {
              setIsCopiesModalOpen(false);
              setSelectedBookIdForCopies(null);
            }}
            bookId={selectedBookIdForCopies}
          />

          {/* Books List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Đầu Sách</th>
                    <th className="p-4">Thể Loại</th>
                    <th className="p-4">Giá Mở Bán</th>
                    <th className="p-4">Bản Mượn Sẵn Sàng</th>
                    <th className="p-4">Tồn Kho Mở Bán</th>
                    <th className="p-4 text-center">Thao Tác CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
                        <div className="font-semibold text-slate-600">Không tìm thấy đầu sách nào phù hợp.</div>
                        <div className="text-[11px] text-slate-400 mt-1">Hãy thử tìm với từ khoá khác hoặc đặt lại bộ lọc.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={b.cover_image} 
                              alt={b.title} 
                              className="w-11 h-15 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0 cursor-pointer hover:opacity-85 transition-opacity" 
                              onClick={() => {
                                setSelectedBookIdForCopies(b.id);
                                setIsCopiesModalOpen(true);
                              }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div className="space-y-0.5 max-w-sm sm:max-w-md">
                              <div 
                                onClick={() => {
                                  setSelectedBookIdForCopies(b.id);
                                  setIsCopiesModalOpen(true);
                                }}
                                className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer truncate"
                                title={b.title}
                              >
                                {b.title}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {b.author || 'Chưa rõ tác giả'}
                              </div>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                {b.isbn && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                    ISBN: {b.isbn}
                                  </span>
                                )}
                                {!b.is_borrowable && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded border border-rose-200">
                                    Ngưng mượn
                                  </span>
                                )}
                                {!b.is_salable && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200">
                                    Ngưng bán
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-lg border border-sky-100 whitespace-nowrap">
                            {b.category?.name || 'Chung'}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-pink-600 text-sm whitespace-nowrap">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.sale_price)}
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 border ${
                              (b.available_copies_count ?? 0) > 0 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {b.available_copies_count ?? 0} bản sẵn sàng
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Tổng: {b.copies?.length ?? b.available_copies_count ?? 0} bản sao
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 border ${
                              (b.available_stock_count ?? 0) > 0 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {b.available_stock_count ?? 0} cuốn trong kho
                            </span>
                            {b.inventory?.reserved_quantity > 0 && (
                              <div className="text-[10px] text-amber-600 font-medium">
                                ({b.inventory.reserved_quantity} đang giữ đơn)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* CRUD Action Buttons */}
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                            {/* Read / Details & Barcodes */}
                            <button
                              onClick={() => {
                                setSelectedBookIdForCopies(b.id);
                                setIsCopiesModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
                              title="Xem chi tiết & mã vạch barcode"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Update / Edit */}
                            <button
                              onClick={() => {
                                setSelectedBookForEdit(b);
                                setIsEditBookOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
                              title="Chỉnh sửa thông tin & bổ sung kho"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteBook(b.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all cursor-pointer shadow-none hover:shadow-xs"
                              title="Xoá đầu sách (chỉ xóa được sách chưa có giao dịch)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DUYỆT PHIẾU MƯỢN & TRẢ SÁCH */}
      {/* ========================================================================= */}
      {activeTab === 'borrows' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Duyệt Phiếu Mượn & Ghi Nhận Trả Sách</h3>
              <p className="text-xs text-slate-500">Quét mã vạch barcode, in phiếu mượn và gửi thông báo nhắc nhở trả sách</p>
            </div>

            {/* Quick Barcode / Email Search + Camera Scanner */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tra cứu Mã phiếu, Email, Mã vạch..."
                  value={searchBorrow}
                  onChange={(e) => setSearchBorrow(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              <button
                onClick={() => setIsCameraScannerOpen(true)}
                className="relative overflow-hidden group py-2 px-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-500/25 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Quét Barcode hoặc mã QR qua Camera"
              >
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Quét Camera</span>
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Mã Phiếu</th>
                    <th className="p-4">Độc Giả</th>
                    <th className="p-4">Hạn Trả</th>
                    <th className="p-4">Phí Phạt Trễ</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác Thủ Thư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        Không tìm thấy phiếu mượn nào.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">#{t.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 text-sm">{t.reader?.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{t.reader?.email}</div>
                        </td>
                        <td className="p-4 font-bold text-amber-600">
                          {t.due_date}
                        </td>
                        <td className="p-4">
                          {t.total_late_fee > 0 ? (
                            <span className="font-bold text-rose-600">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.total_late_fee)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">0 ₫</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            t.status === 'borrowed' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : t.status === 'overdue' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                                : t.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {t.status === 'pending' ? 'Chờ duyệt' : t.status === 'borrowed' ? 'Đang mượn' : t.status === 'overdue' ? 'Quá hạn' : 'Đã trả'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => { setSelectedPrintData(t); setPrintType('ticket'); }}
                            className="py-1.5 px-3 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="In phiếu mượn sách"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span>In Phiếu</span>
                          </button>

                          {t.status === 'pending' && (
                            <button 
                              onClick={() => handleApproveTicket(t.id)} 
                              className="py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Duyệt Mượn
                            </button>
                          )}

                          {(t.status === 'borrowed' || t.status === 'overdue') && (
                            <>
                              <button
                                onClick={() => handleRemindTicket(t.id)}
                                className="py-1.5 px-3 text-xs inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 cursor-pointer transition-colors"
                                title="Gửi thông báo nhắc nhở trả sách cho độc giả này"
                              >
                                <Bell className="w-3.5 h-3.5 text-amber-600" />
                                <span>Nhắc Nhở</span>
                              </button>
                              <button 
                                onClick={() => handleReturnBooks(t.id)} 
                                className="py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Trả Sách</span>
                              </button>
                            </>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ĐƠN HÀNG BÁN & VẬN CHUYỂN */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Quản Lý Đơn Bán & Lộ Trình Giao Hàng</h3>
            <p className="text-xs text-slate-500">Cập nhật trạng thái đóng gói, bàn giao vận chuyển và in hóa đơn bán lẻ</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Mã Đơn</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Tổng Tiền</th>
                    <th className="p-4">Thanh Toán</th>
                    <th className="p-4">Vận Chuyển</th>
                    <th className="p-4 text-right">In & Cập Nhật Lộ Trình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        Chưa có đơn hàng nào được tạo.
                      </td>
                    </tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-bold text-slate-900 font-mono">{o.order_number}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{o.recipient_name}</div>
                          <div className="text-[11px] text-slate-400">{o.recipient_phone}</div>
                        </td>
                        <td className="p-4 font-bold text-pink-600 text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.total_amount)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            o.payment_status === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {o.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {o.delivery?.status || 'Chờ lấy'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">{o.delivery?.tracking_number}</div>
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => { setSelectedPrintData(o); setPrintType('order'); }}
                            className="py-1 px-2.5 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="In hóa đơn bán hàng"
                          >
                            <Printer className="w-3 h-3 text-indigo-600" /> In Hóa Đơn
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(o.id, 'processing', 'picking')} 
                            className="py-1 px-2.5 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          >
                            Lấy Hàng
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(o.id, 'shipping', 'shipping')} 
                            className="py-1 px-2.5 text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                          >
                            Đang Giao
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(o.id, 'completed', 'delivered')} 
                            className="py-1 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Đã Giao
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HÀNG ĐỢI ĐẶT TRƯỚC SÁCH */}
      {/* ========================================================================= */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Hàng Đợi Đặt Trước Sách (Smart Queue)
            </h3>
            <p className="text-xs text-slate-500">
              Tự động xếp hàng độc giả khi sách hết bản mượn. Khi sách được trả về, hệ thống giữ sách 48h và gửi email thông báo.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Mã Đặt</th>
                    <th className="p-4">Đầu Sách</th>
                    <th className="p-4">Độc Giả</th>
                    <th className="p-4">Vị Trí Chờ</th>
                    <th className="p-4">Hạn Giữ Sách 48h</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác Thủ Thư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        Hiện tại chưa có độc giả nào trong hàng đợi đặt trước.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">#{r.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            {r.book?.cover_image && (
                              <img
                                src={r.book.cover_image}
                                alt={r.book.title}
                                className="w-8 h-11 object-cover rounded shadow-xs border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 max-w-xs truncate">{r.book?.title}</div>
                              <div className="text-[11px] text-blue-600 font-medium">{r.book?.category?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{r.reader?.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.reader?.email}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-extrabold text-xs border border-amber-200">
                            #{r.priority_number}
                          </span>
                        </td>
                        <td className="p-4">
                          {r.expires_at ? (
                            <div className="font-bold text-amber-600">
                              {new Date(r.expires_at).toLocaleString('vi-VN')}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Đang chờ sách về kho</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            r.status === 'notified'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : r.status === 'pending'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : r.status === 'fulfilled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {r.status === 'notified'
                              ? '🔔 Đã báo - Giữ 48h'
                              : r.status === 'pending'
                              ? '⏳ Chờ sách trả'
                              : r.status === 'fulfilled'
                              ? '✅ Đã nhận sách'
                              : 'Đã huỷ'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {r.status === 'pending' && (
                            <button
                              onClick={() => handleNotifyReservation(r.id)}
                              className="py-1 px-2.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Thông báo giữ sách 48h cho độc giả này"
                            >
                              <Bell className="w-3 h-3" /> Báo Giữ Sách
                            </button>
                          )}
                          {['pending', 'notified'].includes(r.status) && (
                            <button
                              onClick={() => handleCancelReservation(r.id)}
                              className="py-1 px-2 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              title="Huỷ lượt đặt trước"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DUYỆT THANH TOÁN CHUYỂN KHOẢN */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          
          {/* Current Bank Account Configuration Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tài Khoản Ngân Hàng Nhận Tiền Đang Sử Dụng:
                </span>
                <div className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-slate-900 font-extrabold">{currentBankConfig?.bank_name || 'MB Bank'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-blue-700 font-black tracking-wider text-base bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {currentBankConfig?.account_number || '090123456789'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-700 font-bold">{currentBankConfig?.account_holder || 'THU VIEN DAI HOC ONLINE'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBankConfigOpen(true)}
              className="relative overflow-hidden group py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 whitespace-nowrap self-stretch md:self-auto justify-center cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Cài Đặt STK Ngân Hàng</span>
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Danh Sách Giao Dịch Chuyển Khoản Chờ Duyệt
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Đối soát số dư tài khoản ngân hàng và duyệt giao dịch VietQR</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs flex-wrap">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả ({payments.length})
              </button>
              <button
                onClick={() => setPaymentFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  paymentFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chờ Duyệt ({payments.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setPaymentFilter('success')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  paymentFilter === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã Duyệt ({payments.filter(p => p.status === 'success').length})
              </button>
              <button
                onClick={() => setPaymentFilter('failed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  paymentFilter === 'failed' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Từ Chối ({payments.filter(p => p.status === 'failed').length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Mã GD</th>
                    <th className="p-4">Loại Thanh Toán</th>
                    <th className="p-4">Độc Giả</th>
                    <th className="p-4">Số Tiền</th>
                    <th className="p-4">Nội Dung CK & Thời Gian</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Ghi Chú & Người Duyệt</th>
                    <th className="p-4 text-right">Thao Tác Thủ Thư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {payments
                    .filter(p => paymentFilter === 'all' || p.status === paymentFilter)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {p.transaction_code}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            p.payable_type?.includes('Order') 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {p.payable_type?.includes('Order') ? 'Đơn mua sách' : 'Phí phạt trễ hạn'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium">Mục: #{p.payable_id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{p.reader?.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{p.reader?.email}</div>
                        </td>
                        <td className="p-4 font-bold text-pink-600 text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amount)}
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-indigo-700 font-bold">{p.transaction_code}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Tạo: {new Date(p.created_at).toLocaleString('vi-VN')}
                          </div>
                          {p.transfer_confirmed_at && (
                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Độc giả đã CK: {new Date(p.transfer_confirmed_at).toLocaleTimeString('vi-VN')}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            p.status === 'success' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : p.status === 'pending' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {p.status === 'success' ? '✅ Đã Duyệt' : p.status === 'pending' ? '⏳ Chờ Duyệt' : '❌ Đã Từ Chối'}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="text-[11px] text-slate-600 truncate">{p.note || '—'}</div>
                          {p.approver && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Duyệt bởi: {p.approver.name}</div>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {p.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprovePayment(p.id)}
                                className="py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Xác nhận đã nhận tiền và duyệt"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectPayment(p.id)}
                                className="py-1 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Từ chối nếu chưa nhận được tiền"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Từ Chối
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {payments.filter(p => paymentFilter === 'all' || p.status === paymentFilter).length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        Không có giao dịch thanh toán nào trong mục này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Camera Live Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(code) => setSearchBorrow(code)}
      />

      {/* Print Receipt Modal for Librarian */}
      <PrintReceiptModal
        isOpen={!!selectedPrintData}
        onClose={() => setSelectedPrintData(null)}
        data={selectedPrintData}
        type={printType}
      />

      {/* Bank Account Configuration Modal for Librarian */}
      <BankConfigModal
        isOpen={isBankConfigOpen}
        onClose={() => setIsBankConfigOpen(false)}
        onSaveSuccess={(cfg) => {
          setCurrentBankConfig(cfg);
          setMsg('Cập nhật tài khoản ngân hàng thành công! Độc giả sẽ chuyển tiền vào STK mới này.');
        }}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendNotificationOpen}
        onClose={() => {
          setIsSendNotificationOpen(false);
          setTargetReaderForNotification(null);
        }}
        defaultReader={targetReaderForNotification}
        onSuccess={(data) => {
          setMsg(data.message);
        }}
      />
    </div>
  );
}
