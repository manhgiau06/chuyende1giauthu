'use client';
import React, { useState } from 'react';
import { X, Truck, Search, CheckCircle, Clock, MapPin, Package } from 'lucide-react';
import api from '../api';

export default function DeliveryModal({ isOpen, onClose }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError('');
    setDelivery(null);

    try {
      const res = await api.get(`/deliveries/track/${trackingNumber.trim()}`);
      setDelivery(res.data.delivery);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy mã vận đơn!');
    } finally {
      setLoading(false);
    }
  };

  const getStepActive = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'picking': return 2;
      case 'shipping': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Theo Dõi Vận Chuyển</h2>
            <p className="text-xs text-slate-400">Tra cứu mã vận đơn (Ví dụ: VNPOST-12345678)</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Nhập mã vận đơn (VD: VNPOST-...)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="input-control pl-10 text-xs py-2.5"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2.5 px-5">
            {loading ? 'Đang tìm...' : 'Tra Cứu'}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        {delivery && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/10 flex flex-wrap justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400">Mã vận đơn:</div>
                <div className="font-bold text-white text-base">{delivery.tracking_number}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Đơn vị vận chuyển:</div>
                <div className="font-semibold text-teal-300 text-sm">{delivery.carrier}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Trạng thái hiện tại:</div>
                <div className="font-bold text-amber-400 text-sm uppercase">{delivery.status}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10" />
                {['Chờ lấy', 'Đang lấy hàng', 'Đang giao', 'Đã giao'].map((stepName, idx) => {
                  const stepNum = idx + 1;
                  const active = getStepActive(delivery.status) >= stepNum;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        active ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {active ? <CheckCircle className="w-4 h-4" /> : stepNum}
                      </div>
                      <span className={`text-[11px] font-semibold ${active ? 'text-teal-300' : 'text-slate-500'}`}>
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History timeline */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Lịch sử vận chuyển chi tiết
              </h4>

              <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                {delivery.histories?.map((h) => (
                  <div key={h.id} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                    <div className="text-xs text-slate-400">{h.created_at ? new Date(h.created_at).toLocaleString('vi-VN') : ''}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{h.note}</div>
                    {h.location && (
                      <div className="text-xs text-teal-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> Địa điểm: {h.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
