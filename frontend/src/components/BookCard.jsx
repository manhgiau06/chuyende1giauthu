import React from 'react';
import { Bookmark, ShoppingCart, Info, Heart, Star } from 'lucide-react';

const getCategoryBadgeClass = (name) => {
  if (!name) return 'cat-badge-skill';
  const lower = name.toLowerCase();
  if (lower.includes('công nghệ') || lower.includes('cntt') || lower.includes('tin học')) return 'cat-badge-tech';
  if (lower.includes('kinh tế') || lower.includes('tài chính') || lower.includes('kinh doanh')) return 'cat-badge-econ';
  if (lower.includes('văn học') || lower.includes('tiểu thuyết') || lower.includes('truyện')) return 'cat-badge-lit';
  if (lower.includes('lịch sử') || lower.includes('triết học') || lower.includes('chính trị')) return 'cat-badge-history';
  return 'cat-badge-skill';
};

export default function BookCard({ book, onSelect, onBorrow, onAddToCart, user, isWishlisted, onToggleWishlist }) {
  const borrowCount = book.available_copies_count ?? 0;
  const stockCount = book.available_stock_count ?? 0;

  return (
    <div className="glass-panel group overflow-hidden flex flex-col justify-between hover:border-blue-400/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/15 rounded-2xl bg-white border border-slate-200">
      {/* Cover Header */}
      <div className="relative h-60 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelect(book)}>
        <img
          src={book.cover_image}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Shimmer Light Sweep on Hover */}
        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer-sweep pointer-events-none" />

        {/* Category Tag */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm border ${getCategoryBadgeClass(book.category?.name)}`}>
          {book.category?.name || 'Sách tổng hợp'}
        </span>

        {/* Wishlist Heart Button */}
        {user && user.role === 'reader' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWishlist) onToggleWishlist(book.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
              isWishlisted
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/40 scale-105'
                : 'bg-white/80 text-slate-600 border-white/40 hover:text-rose-500 hover:bg-white'
            }`}
            title={isWishlisted ? 'Xóa khỏi sách yêu thích' : 'Thêm vào sách yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Book Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 
              onClick={() => onSelect(book)}
              className="font-bold text-base text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer flex-1 leading-snug"
              title={book.title}
            >
              {book.title}
            </h3>
            <span className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-current" /> 5.0
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mb-3">Tác giả: <span className="text-slate-700 font-semibold">{book.author}</span></p>

          {/* Price & Stock Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="badge badge-sale text-xs font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sale_price)}
            </span>
            <span className={`badge ${borrowCount > 0 ? 'badge-borrow' : 'badge-warning'}`}>
              <Bookmark className="w-3 h-3" /> Mượn: {borrowCount} bản
            </span>
            <span className={`badge ${stockCount > 0 ? 'badge-success' : 'badge-warning'}`}>
              <ShoppingCart className="w-3 h-3" /> Bán: {stockCount} kho
            </span>
          </div>
        </div>

        {/* Action Buttons with tactile active bounce */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onBorrow(book)}
            disabled={borrowCount <= 0}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              borrowCount > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> {borrowCount > 0 ? 'Mượn Sách' : 'Hết Bản Mượn'}
          </button>

          <button
            onClick={() => onAddToCart(book)}
            disabled={stockCount <= 0}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              stockCount > 0
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {stockCount > 0 ? 'Mua Sách' : 'Hết Kho'}
          </button>
        </div>
      </div>
    </div>
  );
}
