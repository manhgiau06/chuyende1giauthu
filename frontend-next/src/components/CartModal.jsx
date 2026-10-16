'use client';
import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, MapPin, User, Phone, CreditCard, ArrowRight } from 'lucide-react';
import api from '../api';

export default function CartModal({ isOpen, onClose, cart, onRemoveFromCart, onClearCart, onOpenPayment, user }) {
  const [shippingAddress, setShippingAddress] = useState(user?.address || '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh');
  const [recipientName, setRecipientName] = useState(user?.name || 'Trần Thị Độc Giả');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '0987654321');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  const shippingFee = cart.length > 0 ? 30000 : 0;
  const total = subtotal + shippingFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map(item => ({
        book_id: item.id,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', {
        items: itemsPayload,
        shipping_address: shippingAddress,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
      });

      const orderId = res.data.order.id;
      onClearCart();
      onClose();
      // Trigger payment popup for this order
      onOpenPayment('order', orderId);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi khi đặt hàng, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Giỏ Hàng Mua Sách Mới</h2>
            <p className="text-xs text-slate-400">Đơn mua sách sẽ được đóng gói & giao tận nơi</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-white/5">
            Giỏ hàng của bạn đang trống.
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Cart items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.cover_image} alt={item.title} className="w-12 h-14 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-400">Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.sale_price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-indigo-300">SL: x{item.quantity}</span>
                    <span className="font-bold text-sm text-white">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.sale_price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Info Form */}
            <div className="p-4 bg-slate-900/40 rounded-xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Thông Tin Giao Hàng Tận Nơi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Người nhận</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="input-control text-xs py-2"
                  />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="input-control text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="label">Địa chỉ nhận hàng chi tiết</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input-control text-xs py-2"
                />
              </div>

              <div>
                <label className="label">Cổng thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-control text-xs py-2"
                >
                  <option value="bank_transfer">Chuyển Khoản Ngân Hàng (Thủ Thư Duyệt)</option>
                  <option value="momo">Ví MoMo (Chuyển Khoản)</option>
                </select>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/20 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Tạm tính sách:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Phí vận chuyển (Đồng giá toàn quốc):</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Tổng số tiền thanh toán:</span>
                <span className="text-pink-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Đang khởi tạo đơn hàng...' : 'Tiến Hành Thanh Toán Chuyển Khoản'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
