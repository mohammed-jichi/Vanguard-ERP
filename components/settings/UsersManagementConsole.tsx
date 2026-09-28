'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { usePermission } from '@/lib/PermissionContext';
import { EnterpriseUserRecord } from '@/app/api/users/route';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Shield,
  Pencil,
  Trash2,
  CreditCard,
  Building,
  KeyRound,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Hash,
  Phone,
  Mail,
} from 'lucide-react';

interface UsersManagementConsoleProps {
  initialTenantId?: string;
}

export default function UsersManagementConsole({ initialTenantId }: UsersManagementConsoleProps) {
  const { currentTenant } = useTenant();
  const { language, t } = useLanguage();
  const { roles } = usePermission();

  const orgId = initialTenantId || (currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id));

  // Users Directory State
  const [users, setUsers] = useState<EnterpriseUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal Form Values
  const [formUserCode, setFormUserCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formPin, setFormPin] = useState<string>('');
  const [formCardNumber, setFormCardNumber] = useState<string>('');
  const [formRoleId, setFormRoleId] = useState<string>('');
  const [formBranch, setFormBranch] = useState<string>('Choueifat Central Plant');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formContact, setFormContact] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load users from API on mount
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users?tenantId=${encodeURIComponent(orgId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('[UsersConsole] Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  // Set default role id when roles load
  useEffect(() => {
    if (!formRoleId && roles && roles.length > 0) {
      setFormRoleId(roles[0].id);
    }
  }, [roles, formRoleId]);

  // Handle opening modal for Add New User
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    const nextCode = (users.length > 0 ? Math.max(...users.map((u) => parseInt(u.user_code, 10) || 100)) + 1 : 101).toString();
    setFormUserCode(nextCode);
    setFormName('');
    setFormPin('');
    setFormCardNumber(`CRD-${nextCode}`);
    setFormRoleId(roles[0]?.id || 'r_cashier');
    setFormBranch(currentTenant?.name || 'Choueifat Central Plant');
    setFormStatus('ACTIVE');
    setFormContact('');
    setFormEmail('');
    setShowPin(false);
    setIsModalOpen(true);
  };

  // Handle opening modal for Edit User
  const handleOpenEditUser = (user: EnterpriseUserRecord) => {
    setEditingUserId(user.id);
    setFormUserCode(user.user_code || '');
    setFormName(user.name || '');
    setFormPin(user.pin || '');
    setFormCardNumber(user.card_number || '');
    setFormRoleId(user.role_id || (roles[0]?.id || 'r_cashier'));
    setFormBranch(user.branch || (currentTenant?.name || 'Choueifat Central Plant'));
    setFormStatus(user.status || 'ACTIVE');
    setFormContact(user.contact || '');
    setFormEmail(user.email || '');
    setShowPin(false);
    setIsModalOpen(true);
  };

  // Save / Upsert User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a valid user display name');
      return;
    }
    if (!formUserCode.trim()) {
      showToast('Please provide a unique user code');
      return;
    }

    const matchedRole = roles.find((r) => r.id === formRoleId);
    const payload: EnterpriseUserRecord = {
      id: editingUserId || `u-${Date.now()}`,
      tenant_id: orgId,
      user_code: formUserCode.trim(),
      name: formName.trim(),
      email: formEmail.trim() || undefined,
      pin: formPin.trim(),
      card_number: formCardNumber.trim(),
      role: matchedRole ? matchedRole.name : 'Enterprise Operator',
      role_id: formRoleId,
      role_badge: matchedRole?.badgeColor || 'bg-slate-100 text-slate-800 border-slate-200',
      branch: formBranch,
      status: formStatus,
      contact: formContact.trim() || undefined,
      last_login: editingUserId ? 'Updated now' : 'Never (New)',
    };

    setIsSaving(true);
    try {
      // Optimistic state update
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === payload.id);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = payload;
          return clone;
        }
        return [payload, ...prev];
      });

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: payload }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
      setIsModalOpen(false);
      showToast(editingUserId ? `User ${payload.name} updated successfully!` : `User ${payload.name} created successfully!`);
    } catch (err) {
      console.error('[UsersConsole] Failed to save user:', err);
      showToast('Error saving user to server');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: EnterpriseUserRecord) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (Code: ${user.user_code})?`)) {
      return;
    }

    try {
      // Optimistic update
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      showToast(`User ${user.name} removed.`);
    } catch (err) {
      console.error('[UsersConsole] Failed to delete user:', err);
      showToast('Error deleting user');
      fetchUsers();
    }
  };

  // Toggle Status
  const handleToggleStatus = async (user: EnterpriseUserRecord) => {
    const updatedStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedUser = { ...user, status: updatedStatus as 'ACTIVE' | 'INACTIVE' };

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: updatedUser }),
      });
      showToast(`User ${user.name} is now ${updatedStatus}.`);
    } catch (err) {
      console.error('[UsersConsole] Status toggle failed:', err);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.user_code.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.contact && u.contact.toLowerCase().includes(q)) ||
        (u.card_number && u.card_number.toLowerCase().includes(q)) ||
        (u.branch && u.branch.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'ALL' || u.role_id === roleFilter || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination Slice
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Users</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {users.length} Operators
            </span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">User Management</span>
          </div>
        </div>

        {/* Action Controls: + Add User only (Roles & Permissions button removed) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users by name, code, role, contact..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-primary"
            />
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden focus:bg-white focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden focus:bg-white focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Clear Filters Indicator */}
        {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs text-primary font-bold hover:underline shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-24 text-center">User Code</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Contact / Branch</th>
                <th className="px-5 py-3.5 text-center w-28">Status</th>
                <th className="px-5 py-3.5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading enterprise users directory...</span>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleObj = roles.find((r) => r.id === user.role_id);
                  const displayRoleName = roleObj ? roleObj.name : user.role;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Code */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          #{user.user_code}
                        </span>
                      </td>

                      {/* Full Name & Identifiers */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">{user.name}</div>
                            <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                              {user.card_number && (
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-slate-400" />
                                  <span>{user.card_number}</span>
                                </span>
                              )}
                              {user.email && <span>• {user.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            user.role_badge || 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{displayRoleName}</span>
                        </span>
                      </td>

                      {/* Contact / Branch */}
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{user.branch || 'Choueifat Central Plant'}</span>
                        </div>
                        {user.contact && (
                          <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.contact}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          title="Click to toggle status"
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(user)}
                            title="Edit User & Credentials"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing {totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalFiltered)} of {totalFiltered} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              « Prev
            </button>
            <span className="px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              Next »
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* STREAMLINED ADD / EDIT USER MODAL (Clean, Centered Form Layout)         */}
      {/* ====================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {editingUserId ? `Edit User: ${formName}` : 'Add New Operator'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure operator credentials, badge number, and role assignment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Centered Streamlined Form */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* User Code & Card / Badge Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">User Code / ID</label>
                  <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={formUserCode}
                      onChange={(e) => setFormUserCode(e.target.value)}
                      placeholder="101"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-bold font-mono text-slate-900 bg-transparent outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Card / Badge Number</label>
                  <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={formCardNumber}
                      onChange={(e) => setFormCardNumber(e.target.value)}
                      placeholder="CRD-1001"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-bold font-mono text-slate-900 bg-transparent outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Username / Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Username / Display Name</label>
                <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Jichi Mohammed"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 bg-transparent outline-hidden"
                  />
                </div>
              </div>

              {/* Quick PIN / POS Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Quick PIN / POS Password</label>
                <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="4-digit quick PIN"
                    className="w-full pl-9 pr-10 py-2.5 text-xs font-bold font-mono tracking-wider text-slate-900 bg-transparent outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Dropdown (Directly Bound to Roles & Permissions) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Assigned Role (Permissions & Action Matrix)
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.is_read_only ? '(Read Only)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch / Plant & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Branch / Plant</label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Contact Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Phone / Contact</label>
                  <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="+961..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-transparent outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Email Address (Optional)</label>
                  <div className="relative flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="user@vanguard..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-transparent outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveUser}
                className="flex items-center gap-1.5 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isSaving ? 'Saving...' : editingUserId ? 'Save Changes' : 'Create User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
