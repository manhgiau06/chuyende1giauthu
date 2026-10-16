'use client';
import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, BookOpen, Trash2, Star } from 'lucide-react';
import api from '../api';

export default function WishlistModal({ 
  isOpen, 
  onClose, 
  onSelectBook, 
  onBorrow, 
  onAddToCart,
  user 
}) {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setWishlists(res.data.wishlists || []);
    } catch (err) {
      console.error(err);
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  const handleRemove = async (bookId) => {
    try {
      await api.post(`/wishlist/${bookId}/toggle`);
      setWishlists(wishlists.filter(w => w.book_id !== bookId));
    } catch (err) {
      alert('Không thể xóa khỏi danh sách yêu thích!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-xl">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sách Yêu Thích Của Tôi</h2>
              <p className="text-xs text-slate-400">Danh sách các đầu sách bạn đã lưu để xem và mượn lại sau</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải danh sách yêu thích...</div>
        ) : wishlists.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Heart className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">Bạn chưa có cuốn sách nào trong danh sách yêu thích.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlists.map((item) => {
              const book = item.book;
              if (!book) return null;
              return (
                <div key={item.id} className="bg-slate-800/60 border border-white/10 rounded-xl p-4 flex gap-4 hover:border-pink-500/40 transition-all">
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-md cursor-pointer"
                    onClick={() => { onClose(); onSelectBook(book); }}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        {book.category?.name || 'Thể loại'}
                      </span>
                      <h4 
                        className="font-bold text-white text-sm line-clamp-1 cursor-pointer hover:text-pink-300"
                        onClick={() => { onClose(); onSelectBook(book); }}
                      >
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400">{book.author}</p>
                      <div className="text-xs font-bold text-pink-400 mt-1">
                        {Number(book.sale_price).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      {book.is_borrowable && (
                        <button
                          onClick={() => { onClose(); onBorrow(book); }}
                          className="px-2.5 py-1.5 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Mượn
                        </button>
                      )}
                      {book.is_salable && (
                        <button
                          onClick={() => onAddToCart(book)}
                          className="px-2.5 py-1.5 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Mua
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(book.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg ml-auto"
                        title="Xóa khỏi yêu thích"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
