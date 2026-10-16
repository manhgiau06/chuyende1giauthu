'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, TrendingUp, BookOpen, AlertTriangle, Download, UserPlus, Settings, 
  CheckCircle, Zap, Users, Lock, Unlock, KeyRound, Trash2, Search, X, 
  Sparkles, CheckCircle2, UserCheck, ShieldAlert, ShieldCheck
} from 'lucide-react';
import api, { getImageUrl } from '../api';

export default function AdminView({ user }) {
  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users' or 'reports'
  const [stats, setStats] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [triggerLog, setTriggerLog] = useState('');

  // User management states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'reader', 'librarian', 'admin'
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: 'password',
    role: 'reader',
    phone: '',
    address: '',
  });

  // Reset password modal
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resS, resC, resU] = await Promise.all([
        api.get('/admin/monthly-stats'),
        api.get('/admin/system-configs'),
        api.get('/admin/users'),
      ]);
      setStats(resS.data);
      setConfigs(resC.data.configs || []);
      setUsers(resU.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTriggerSchedule = async () => {
    setTriggerLog('');
    setMsg('');
    setError('');
    try {
      const res = await api.post('/admin/trigger-schedule');
      setMsg(res.data.message);
      setTriggerLog(res.data.output || 'Tiến trình hoàn tất.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kích hoạt tác vụ nền!');
    }
  };

  const handleUpdateConfigs = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api.post('/admin/system-configs', { configs });
      setMsg('Cập nhật cấu hình hạn mượn & phí phạt thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật cấu hình!');
    }
  };

  const handleExportCsv = () => {
    window.open('http://127.0.0.1:8000/api/admin/export-csv?token=' + localStorage.getItem('token'), '_blank');
  };

  // RBAC User Actions
  const handleRoleChange = async (targetId, newRole) => {
    setError('');
    setMsg('');
    try {
      const res = await api.put(`/admin/users/${targetId}/role`, { role: newRole });
      setMsg(res.data.message);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thay đổi vai trò!');
    }
  };

  const handleToggleStatus = async (targetId) => {
    setError('');
    setMsg('');
    try {
      const res = await api.put(`/admin/users/${targetId}/status`);
      setMsg(res.data.message);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản!');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    setError('');
    setMsg('');
    try {
      const res = await api.post(`/admin/users/${selectedUserForReset.id}/reset-password`, {
        password: newPassword,
      });
      setMsg(res.data.message);
      setSelectedUserForReset(null);
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu!');
    }
  };

  const handleDeleteUser = async (targetId, targetName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản '${targetName}' khỏi hệ thống không?`)) return;
    setError('');
    setMsg('');
    try {
      const res = await api.delete(`/admin/users/${targetId}`);
      setMsg(res.data.message);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tài khoản!');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await api.post('/admin/users', createUserForm);
      setMsg(res.data.message);
      setIsCreateUserOpen(false);
      setCreateUserForm({
        name: '',
        email: '',
        password: 'password',
        role: 'reader',
        phone: '',
        address: '',
      });
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản!');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearch.toLowerCase();
    const matchSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const readerCount = users.filter((u) => u.role === 'reader').length;
  const librarianCount = users.filter((u) => u.role === 'librarian').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Shield className="w-8 h-8 text-blue-600" /> Bảng Điều Khiển Quản Trị Hệ Thống
          </h2>
          <p className="text-sm text-slate-500">
            Phân quyền tài khoản (RBAC), báo cáo doanh thu, tham số hệ thống & xuất dữ liệu
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" /> Quản Lý & Phân Quyền ({users.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Thống Kê & Cấu Hình
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {msg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ & PHÂN QUYỀN TÀI KHOẢN (RBAC) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 border-l-4 border-slate-600">
              <div className="text-xs font-bold text-slate-500 uppercase">Tổng Tài Khoản</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{users.length}</div>
            </div>
            <div className="glass-panel p-4 border-l-4 border-blue-500">
              <div className="text-xs font-bold text-blue-600 uppercase">Độc Giả (Readers)</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{readerCount}</div>
            </div>
            <div className="glass-panel p-4 border-l-4 border-teal-500">
              <div className="text-xs font-bold text-teal-600 uppercase">Thủ Thư (Librarians)</div>
              <div className="text-2xl font-black text-teal-900 mt-1">{librarianCount}</div>
            </div>
            <div className="glass-panel p-4 border-l-4 border-purple-500">
              <div className="text-xs font-bold text-purple-600 uppercase">Quản Trị (Admins)</div>
              <div className="text-2xl font-black text-purple-900 mt-1">{adminCount}</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm theo Tên, Email, Số điện thoại..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input-control pl-9 py-2 text-xs w-full"
              />
            </div>

            {/* Role Filter Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userRoleFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất Cả ({users.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('reader')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userRoleFilter === 'reader'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Độc Giả ({readerCount})
              </button>
              <button
                onClick={() => setUserRoleFilter('librarian')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userRoleFilter === 'librarian'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                Thủ Thư ({librarianCount})
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userRoleFilter === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Admin ({adminCount})
              </button>
            </div>

            {/* Add User Button */}
            <button
              onClick={() => setIsCreateUserOpen(true)}
              className="btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Thêm Tài Khoản Mới
            </button>
          </div>

          {/* Users Table */}
          <div className="glass-panel overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/80">
                    <th className="p-4">Tài khoản & Người dùng</th>
                    <th className="p-4">Liên hệ (SĐT / Địa chỉ)</th>
                    <th className="p-4">Phân quyền Vai trò (Role)</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Đang tải danh sách tài khoản...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Không tìm thấy tài khoản phù hợp với điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === user?.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* User Avatar & Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0 relative">
                                {u.avatar_url ? (
                                  <img
                                    src={getImageUrl(u.avatar_url)}
                                    alt={u.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : null}
                                <span>{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                      (Bạn)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{u.phone || 'Chưa cập nhật SĐT'}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{u.address || 'Chưa có địa chỉ'}</div>
                          </td>

                          {/* Role with Instant Selector */}
                          <td className="p-4">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer ${
                                isSelf ? 'opacity-70 cursor-not-allowed' : ''
                              } ${
                                u.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-400'
                                  : u.role === 'librarian'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200 focus:ring-teal-400'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400'
                              }`}
                              title={isSelf ? 'Bạn không thể tự thay đổi vai trò của chính mình' : 'Bấm để đổi vai trò'}
                            >
                              <option value="reader">Độc giả (Reader)</option>
                              <option value="librarian">Thủ thư (Librarian)</option>
                              <option value="admin">Quản trị viên (Admin)</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <Lock className="w-3 h-3 text-red-500" /> Đã khóa
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right space-x-1.5">
                            {/* Toggle Lock/Unlock */}
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-xl border transition-all ${
                                isSelf
                                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                  : u.is_active
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              }`}
                              title={
                                isSelf
                                  ? 'Không thể tự khóa bản thân'
                                  : u.is_active
                                  ? 'Khóa tài khoản này'
                                  : 'Mở khóa tài khoản này'
                              }
                            >
                              {u.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => setSelectedUserForReset(u)}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all"
                              title="Đặt lại mật khẩu cho tài khoản này"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-xl border transition-all ${
                                isSelf
                                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                              }`}
                              title={isSelf ? 'Không thể tự xóa bản thân' : 'Xóa tài khoản'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BÁO CÁO DOANH THU & CẤU HÌNH THAM SỐ */}
      {/* ========================================================================= */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Báo Cáo Hoạt Động & Tham Số Hệ Thống</h3>
            <div className="flex gap-2">
              <button onClick={handleTriggerSchedule} className="btn-accent py-2 px-3 text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Kích Hoạt Worker 07:00 AM
              </button>
              <button onClick={handleExportCsv} className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Xuất File CSV
              </button>
            </div>
          </div>

          {triggerLog && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
              <div className="font-bold text-emerald-400 text-xs">Nhật ký thực thi lệnh `borrows:check-due`:</div>
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap">{triggerLog}</pre>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 border-l-4 border-pink-500 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">Doanh Thu Bán Sách Tháng Này</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.sales_revenue || 0)}
                </div>
              </div>
              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-6 border-l-4 border-teal-500 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">Tổng Số Lượt Mượn Sách</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {stats?.borrow_tickets_count || 0} lượt
                </div>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel p-6 border-l-4 border-amber-500 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">Độc Giả Nợ Phí Phạt Quá Hạn</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {stats?.unpaid_late_fee_readers?.length || 0} người
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Unpaid Late Fee Readers */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Danh Sách Độc Giả Còn Nợ Phí Phạt
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="pb-3">Họ Tên & Email Độc Giả</th>
                    <th className="pb-3">Số Phiếu Mượn Nợ</th>
                    <th className="pb-3 text-right">Tổng Tiền Phạt Chưa Nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.unpaid_late_fee_readers?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        Không có độc giả nào nợ phí phạt.
                      </td>
                    </tr>
                  ) : (
                    stats?.unpaid_late_fee_readers?.map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-semibold text-slate-900">
                          {r.reader_name} <br />
                          <span className="text-[10px] text-slate-500">{r.reader_email}</span>
                        </td>
                        <td className="py-3">{r.tickets_count} phiếu</td>
                        <td className="py-3 text-right font-bold text-red-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.total_debt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Parameters Config */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> Cấu Hình Tham Số Hệ Thống (Hạn Mượn & Phí Phạt)
            </h3>
            <form onSubmit={handleUpdateConfigs} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {configs.map((c, idx) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="label text-[11px] font-bold text-blue-800">{c.description || c.key}</label>
                  <input
                    type="text"
                    value={c.value}
                    onChange={(e) => {
                      const newCfgs = [...configs];
                      newCfgs[idx].value = e.target.value;
                      setConfigs(newCfgs);
                    }}
                    className="input-control text-xs py-2 font-mono font-bold text-slate-900 bg-white"
                  />
                </div>
              ))}
              <div className="md:col-span-2 lg:col-span-4 pt-2">
                <button type="submit" className="btn-primary py-2.5 px-6">
                  Lưu Thay Đổi Cấu Hình Hệ Thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TẠO TÀI KHOẢN MỚI CHO ADMIN */}
      {/* ========================================================================= */}
      {isCreateUserOpen && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-md p-6 relative shadow-2xl border-blue-200">
            <button
              onClick={() => setIsCreateUserOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold mb-2">
                <UserPlus className="w-3.5 h-3.5 text-blue-600" /> PHÂN QUYỀN HỆ THỐNG
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Thêm Tài Khoản Mới</h3>
              <p className="text-xs text-slate-500">Khởi tạo tài khoản với vai trò tùy chọn</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="label">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  className="input-control text-xs py-2.5"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="label">Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="input-control text-xs py-2.5"
                  placeholder="user@thuvien.vn"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="input-control text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="label">Vai trò (Role)</label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    className="input-control text-xs py-2.5 font-bold text-blue-700"
                  >
                    <option value="reader">Độc giả (Reader)</option>
                    <option value="librarian">Thủ thư (Librarian)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    type="text"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    className="input-control text-xs py-2.5"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="label">Địa chỉ</label>
                  <input
                    type="text"
                    value={createUserForm.address}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, address: e.target.value })}
                    className="input-control text-xs py-2.5"
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-3 text-xs">
                Khởi Tạo Tài Khoản
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET MẬT KHẨU TÀI KHOẢN */}
      {/* ========================================================================= */}
      {selectedUserForReset && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-sm p-6 relative shadow-2xl border-blue-200">
            <button
              onClick={() => {
                setSelectedUserForReset(null);
                setNewPassword('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-200">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Đặt Lại Mật Khẩu</h3>
              <p className="text-xs text-slate-500">
                Cho tài khoản: <span className="font-bold text-blue-700">{selectedUserForReset.email}</span>
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="label">Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-control text-xs py-2.5"
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForReset(null);
                    setNewPassword('');
                  }}
                  className="btn-secondary flex-1 py-2 text-xs justify-center"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex-1 py-2 text-xs justify-center">
                  Lưu Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
