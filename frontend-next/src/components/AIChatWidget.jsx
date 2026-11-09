'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import api from '../api';

const QUICK_PROMPTS = [
  'Gợi ý sách Công nghệ & Lập trình',
  'Sách Tâm lý & Kỹ năng sống hay',
  'Sách giá rẻ dưới 100k',
  'Quy định mượn sách & phí phạt',
  'Tóm tắt sách Đắc Nhân Tâm',
];

export default function AIChatWidget({ onSelectBook }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! 👋 Mình là **Trợ lý AI Thư Viện Tri Thức Số**. Bạn cần tìm sách theo chủ đề nào, muốn tóm tắt sách hay tra cứu quy định mượn trả?',
      books: [],
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendQuestion = async (questionText) => {
    const q = String(questionText || input).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: q });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.reply || 'Mình đã tìm thấy thông tin phù hợp cho bạn:',
          books: res.data.suggested_books || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Hiện tại không thể kết nối tới máy chủ dữ liệu sách. Bạn vui lòng thử lại sau nhé!',
          books: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[350px] sm:w-[390px] bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[560px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1">
                  Trợ Lý AI Thư Viện <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <p className="text-[11px] text-blue-100">Gợi ý & Tóm tắt sách thông minh 24/7</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 max-h-[360px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[88%] whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-br-sm shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.text.replace(/\*\*/g, '')}
                </div>

                {/* Suggested Books Cards */}
                {m.books && m.books.length > 0 && (
                  <div className="mt-2 w-full space-y-1.5">
                    {m.books.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          if (onSelectBook) onSelectBook(b);
                        }}
                        className="flex items-center gap-2.5 p-2 bg-white hover:bg-blue-50/70 rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-all"
                      >
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-10 h-13 object-cover rounded-lg flex-shrink-0 border border-slate-100"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">{b.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{b.author}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold">
                            <span className="text-teal-600">
                              Mượn: {b.available_copies_count ?? 0} bản
                            </span>
                            <span className="text-pink-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(b.sale_price || 0)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex-shrink-0 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Xem
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-xs text-slate-400 italic px-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-500" /> Trợ lý AI đang phân tích kho sách...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendQuestion(qp)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI gợi ý sách, tóm tắt, quy định..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-600/40 border border-white/20 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">Trợ Lý AI Thư Viện</span>
        </button>
      )}
    </div>
  );
}
