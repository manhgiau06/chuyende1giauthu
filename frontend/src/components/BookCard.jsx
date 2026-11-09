import React from 'react';
import { Bookmark, ShoppingCart, Heart, Star } from 'lucide-react';

export default function BookCard({ 
  book, 
  onSelect, 
  onBorrow, 
  onAddToCart, 
  user, 
  isWishlisted, 
  onToggleWishlist 
}) {
  const borrowCount = book.available_copies_count ?? 0;
  const stockCount = book.available_stock_count ?? 0;

  // Single neat badge selection
  const isBestSeller = book.id % 3 === 1;
  const isPreOrder = stockCount <= 0 && borrowCount <= 0;
  const discountPercent = 15;
  const originalPrice = Math.round(Number(book.sale_price || 0) * (1 + discountPercent / 100));

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Book Cover Showcase Stage */}
      <div 
        className="relative h-56 bg-gradient-to-b from-stone-50/80 to-[#f5f2eb]/70 flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b border-stone-100"
        onClick={() => onSelect(book)}
        title={`Xem chi tiết sách ${book.title}`}
      >
        {/* Physical 3D Book Cover with realistic drop-shadow */}
        <img
          src={book.cover_image}
          alt={book.title}
          className="max-h-full max-w-[85%] object-contain rounded-md shadow-md shadow-black/10 group-hover:scale-105 group-hover:shadow-lg transition-transform duration-300 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Minimal Single Badge on Top-Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10 pointer-events-none">
          {isBestSeller ? (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-50 text-rose-600 border border-rose-200/80">
              Bán chạy
            </span>
          ) : isPreOrder ? (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
              Đặt trước
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Button on Top-Right */}
        {user && user.role === 'reader' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWishlist) onToggleWishlist(book.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full border transition-all z-10 flex items-center justify-center ${
              isWishlisted
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white/95 text-stone-400 border-stone-200/80 hover:text-rose-500 hover:bg-white shadow-2xs'
            }`}
            title={isWishlisted ? 'Xóa khỏi sách yêu thích' : 'Thêm vào sách yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Book Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1.5">
            <span className="truncate max-w-[170px] uppercase tracking-wider font-semibold text-stone-500">
              {book.category?.name || 'Sách tổng hợp'}
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" /> 5.0
            </span>
          </div>

          {/* Book Title */}
          <h3 
            onClick={() => onSelect(book)}
            className="font-serif-book font-bold text-[15px] text-stone-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors cursor-pointer mb-1"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-500 truncate mb-2.5">
            Tác giả: <span className="text-stone-700 font-medium">{book.author}</span>
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-bold text-base text-rose-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.sale_price)}
            </span>
            <span className="text-xs text-stone-400 line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
            </span>
          </div>

          {/* Availability Status as Clean Micro-Indicators */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-3.5">
            <span className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${borrowCount > 0 ? 'bg-blue-500' : 'bg-stone-300'}`} />
              Mượn: <strong className={borrowCount > 0 ? 'text-stone-700 font-semibold' : 'text-stone-400'}>{borrowCount}</strong>
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${stockCount > 0 ? 'bg-emerald-500' : 'bg-stone-300'}`} />
              Kho: <strong className={stockCount > 0 ? 'text-stone-700 font-semibold' : 'text-stone-400'}>{stockCount}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100">
          <button
            onClick={() => onBorrow(book)}
            disabled={borrowCount <= 0}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              borrowCount > 0
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100/90 active:scale-98'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {borrowCount > 0 ? 'Mượn sách' : 'Hết bản'}
          </button>

          <button
            onClick={() => onAddToCart(book)}
            disabled={stockCount <= 0}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              stockCount > 0
                ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white active:scale-98'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {stockCount > 0 ? 'Thêm giỏ' : 'Hết kho'}
          </button>
        </div>

      </div>
    </div>
  );
}
