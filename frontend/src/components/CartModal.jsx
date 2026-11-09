import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, MapPin, User, Phone, CreditCard, ArrowRight, Gift, ShieldCheck, Check, Sparkles, Plus, Minus, Truck } from 'lucide-react';
import api from '../api';

const FREESHIP_THRESHOLD = 200000; // 200.000 VND for Free Shipping

export default function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity,
  onRemoveFromCart, 
  onClearCart, 
  onOpenPayment, 
  user 
}) {
  const [shippingAddress, setShippingAddress] = useState(user?.address || '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh');
  const [recipientName, setRecipientName] = useState(user?.name || 'Trần Thị Độc Giả');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '0987654321');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 5. Tùy chọn dịch vụ đi kèm ngành sách
  const [wrapPlastic, setWrapPlastic] = useState(false); // +5.000đ / cuốn
  const [giftBox, setGiftBox] = useState(false); // +15.000đ / đơn kèm thiệp viết tay
  const [giftNote, setGiftNote] = useState('Chúc bạn có những giờ phút đọc sách thật an nhiên và nhiều cảm hứng!');

  if (!isOpen) return null;

  const totalBookCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.sale_price || 0) * (item.quantity || 1)), 0);

  // Add-on service calculations
  const plasticFee = wrapPlastic ? totalBookCount * 5000 : 0;
  const giftFee = giftBox ? 15000 : 0;

  // Free shipping calculation
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD;
  const shippingFee = cart.length === 0 ? 0 : (isFreeShip ? 0 : 30000);
  const remainingForFreeShip = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeShipPercent = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));

  const total = subtotal + plasticFee + giftFee + shippingFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map(item => ({
        book_id: item.id,
        quantity: item.quantity || 1,
      }));

      const noteDetails = [
        wrapPlastic ? `[Dịch vụ: Bọc plastic ${totalBookCount} cuốn]` : '',
        giftBox ? `[Dịch vụ: Gói quà nghệ thuật & thiệp - Lời chúc: "${giftNote}"]` : ''
      ].filter(Boolean).join(' | ');

      const res = await api.post('/orders', {
        items: itemsPayload,
        shipping_address: shippingAddress + (noteDetails ? ` — ${noteDetails}` : ''),
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
      });

      const orderId = res.data.order.id;
      onClearCart();
      onClose();
      onOpenPayment('order', orderId);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi khi đặt hàng, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col mini-cart-drawer border-l border-[#E7DFD5]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E7DFD5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-book font-bold text-lg text-slate-900">Giỏ Hàng Mua Sách</h2>
                <p className="text-xs text-slate-500">{totalBookCount} cuốn sách được chọn</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 5. Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/60">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                {isFreeShip ? (
                  <span className="text-emerald-700 font-extrabold">Đã đạt điều kiện FREESHIP toàn quốc!</span>
                ) : (
                  <span>
                    Mua thêm <strong className="text-rose-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingForFreeShip)}</strong> để được Freeship
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{freeShipPercent}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 freeship-progress-fill rounded-full"
                style={{ width: `${freeShipPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif-book font-bold text-slate-700">Giỏ hàng của bạn đang trống</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Hãy dạo quanh kho sách và chọn cho mình những cuốn sách hay để nuôi dưỡng tâm hồn nhé.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Khám phá kho sách ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* List items */}
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-white rounded-xl border border-[#E7DFD5] shadow-xs flex items-center gap-3 relative group"
                  >
                    <div className="w-14 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200 p-0.5">
                      <img 
                        src={item.cover_image} 
                        alt={item.title} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-book font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mb-2">{item.author}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.sale_price)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                if (onUpdateQuantity) onUpdateQuantity(item.id, item.quantity - 1);
                              } else {
                                onRemoveFromCart(item.id);
                              }
                            }}
                            className="p-1 hover:bg-stone-200 text-slate-600 transition-colors"
                            title="Giảm số lượng"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateQuantity) onUpdateQuantity(item.id, (item.quantity || 1) + 1);
                            }}
                            className="p-1 hover:bg-stone-200 text-slate-600 transition-colors"
                            title="Tăng số lượng"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors self-start"
                      title="Xóa sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* 5. Tùy chọn dịch vụ đi kèm ngành sách */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E7DFD5] space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Dịch vụ chăm sóc sách đặc biệt
                  </div>

                  {/* Bọc sách plastic */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={wrapPlastic}
                      onChange={(e) => setWrapPlastic(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-stone-300"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        Bọc sách plastic màng bóng cao cấp
                        <span className="text-amber-700 font-bold ml-1">(+5.000đ/cuốn)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Chống bụi, chống ẩm nước và bảo vệ mép bìa sách khi vận chuyển ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBookCount * 5000)})
                      </div>
                    </div>
                  </label>

                  {/* Gói quà nghệ thuật */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs pt-2 border-t border-stone-100">
                    <input
                      type="checkbox"
                      checked={giftBox}
                      onChange={(e) => setGiftBox(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-stone-300"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        Gói quà tặng kèm thiệp viết tay
                        <span className="text-amber-700 font-bold ml-1">(+15.000đ/đơn)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hộp kraft thắt nơ ruy băng tinh tế và thiệp gửi gắm thông điệp
                      </div>
                    </div>
                  </label>

                  {giftBox && (
                    <div className="mt-2 pl-6">
                      <input
                        type="text"
                        value={giftNote}
                        onChange={(e) => setGiftNote(e.target.value)}
                        placeholder="Nội dung lời chúc trên thiệp..."
                        className="w-full text-xs p-2 rounded-lg border border-amber-200 bg-amber-50/50 text-slate-800 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Delivery Information */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E7DFD5] space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Thông tin giao nhận
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên người nhận"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="p-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="p-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Địa chỉ giao hàng"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2 text-xs border border-stone-200 rounded-lg bg-stone-50"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#E7DFD5] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Tiền sách ({totalBookCount} cuốn):</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                </div>
                {wrapPlastic && (
                  <div className="flex justify-between text-slate-500">
                    <span>Bọc plastic ({totalBookCount} cuốn):</span>
                    <span>+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plasticFee)}</span>
                  </div>
                )}
                {giftBox && (
                  <div className="flex justify-between text-slate-500">
                    <span>Gói quà & thiệp chúc mừng:</span>
                    <span>+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(giftFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-stone-100">
                  <span>Tổng thanh toán:</span>
                  <span className="text-rose-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Đang tạo đơn hàng...' : 'Tiến Hành Đặt Hàng & Thanh Toán'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
