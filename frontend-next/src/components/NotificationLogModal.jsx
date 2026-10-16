'use client';
import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Clock, AlertTriangle, CheckCircle, Info, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

export default function NotificationLogModal({ isOpen, onClose }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/my-emails');
      setEmails(res.data.emails || []);
    } catch (err) {
      console.error(err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'overdue':
        return {
          icon: AlertTriangle,
          label: 'Quá Hạn & Phạt',
          color: 'bg-rose-100 text-rose-700 border-rose-200',
          iconColor: 'text-rose-600 bg-rose-50',
        };
      case 'reminder':
      case 'due_soon':
        return {
          icon: Clock,
          label: 'Nhắc Trả Sách',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600 bg-amber-50',
        };
      case 'announcement':
        return {
          icon: Bell,
          label: 'Thông Báo Chung',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          iconColor: 'text-purple-600 bg-purple-50',
        };
      case 'event':
        return {
          icon: Sparkles,
          label: 'Sự Kiện & Sách Mới',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600 bg-emerald-50',
        };
      default:
        return {
          icon: Info,
          label: 'Tin Nhắn Hệ Thống',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600 bg-blue-50',
        };
    }
  };

  return (
    <div className="modal-overlay p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto my-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Hộp Thư Thông Báo Của Bạn
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                  {emails.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Theo dõi các thông báo nhắc trả sách, cảnh báo quá hạn và thông báo từ Thư viện
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Đang tải hộp thư thông báo...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-slate-50 rounded-2xl border border-slate-200/70 p-6">
            <Mail className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700 text-sm">Hộp thư của bạn đang trống</div>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Khi có thông báo nhắc hạn trả sách, thông tin phạt hoặc tin tức từ Thủ thư, bạn sẽ nhận được tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((mail) => {
              const mailType = mail.type || mail.mail_type || 'system';
              const badge = getTypeBadge(mailType);
              const IconComp = badge.icon;
              const isExpanded = selectedEmail?.id === mail.id;

              return (
                <div
                  key={mail.id}
                  onClick={() => setSelectedEmail(isExpanded ? null : mail)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${badge.iconColor}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(mail.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">
                          {mail.subject}
                        </h4>
                        {!isExpanded && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                            {mail.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded full details */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                      <div className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                        Chi tiết nội dung:
                      </div>
                      <div className="whitespace-pre-wrap font-normal leading-relaxed text-slate-800">
                        {mail.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
