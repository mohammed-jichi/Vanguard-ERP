'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Lock,
  CreditCard,
  Building,
  KeyRound,
  Delete,
  CornerDownLeft,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Keyboard,
  Hash,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface UsersManagementConsoleProps {
  initialTenantId?: string;
}

type ActiveInputKey = 'user_code' | 'name' | 'pin' | 'card_number' | 'contact' | 'email';

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

  // Virtual Keyboard & Numpad Integration State
  const [keyboardMode, setKeyboardMode] = useState<'NUMPAD' | 'QWERTY'>('NUMPAD');
  const [activeField, setActiveField] = useState<ActiveInputKey>('user_code');
  const [isCaps, setIsCaps] = useState<boolean>(true);

  // Input refs for direct focus binding
  const inputRefs: Record<ActiveInputKey, React.RefObject<HTMLInputElement | null>> = {
    user_code: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    pin: useRef<HTMLInputElement>(null),
    card_number: useRef<HTMLInputElement>(null),
    contact: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

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
    // Generate next user code
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
    setActiveField('user_code');
    setKeyboardMode('NUMPAD');
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
    setActiveField('name');
    setKeyboardMode('QWERTY');
    setIsModalOpen(true);
  };

  // Handle active field selection with smart keyboard auto-switch
  const handleSelectField = (fieldKey: ActiveInputKey) => {
    setActiveField(fieldKey);
    if (fieldKey === 'user_code' || fieldKey === 'pin' || fieldKey === 'card_number' || fieldKey === 'contact') {
      setKeyboardMode('NUMPAD');
    } else {
      setKeyboardMode('QWERTY');
    }
    // Set focus on input element
    setTimeout(() => {
      inputRefs[fieldKey]?.current?.focus();
    }, 50);
  };

  // Virtual Keyboard typing engine
  const handleVirtualKeyPress = (char: string) => {
    switch (activeField) {
      case 'user_code':
        setFormUserCode((prev) => prev + char);
        break;
      case 'name':
        setFormName((prev) => prev + (isCaps ? char.toUpperCase() : char.toLowerCase()));
        break;
      case 'pin':
        setFormPin((prev) => prev + char);
        break;
      case 'card_number':
        setFormCardNumber((prev) => prev + char.toUpperCase());
        break;
      case 'contact':
        setFormContact((prev) => prev + char);
        break;
      case 'email':
        setFormEmail((prev) => prev + char.toLowerCase());
        break;
    }
  };

  // Virtual Keyboard Backspace
  const handleVirtualBackspace = () => {
    switch (activeField) {
      case 'user_code':
        setFormUserCode((prev) => prev.slice(0, -1));
        break;
      case 'name':
        setFormName((prev) => prev.slice(0, -1));
        break;
      case 'pin':
        setFormPin((prev) => prev.slice(0, -1));
        break;
      case 'card_number':
        setFormCardNumber((prev) => prev.slice(0, -1));
        break;
      case 'contact':
        setFormContact((prev) => prev.slice(0, -1));
        break;
      case 'email':
        setFormEmail((prev) => prev.slice(0, -1));
        break;
    }
  };

  // Virtual Keyboard Clear
  const handleVirtualClear = () => {
    switch (activeField) {
      case 'user_code': setFormUserCode(''); break;
      case 'name': setFormName(''); break;
      case 'pin': setFormPin(''); break;
      case 'card_number': setFormCardNumber(''); break;
      case 'contact': setFormContact(''); break;
      case 'email': setFormEmail(''); break;
    }
  };

  // Advance to next field in sequence
  const handleAdvanceNextField = () => {
    const sequence: ActiveInputKey[] = ['user_code', 'name', 'pin', 'card_number', 'contact', 'email'];
    const idx = sequence.indexOf(activeField);
    const nextKey = sequence[(idx + 1) % sequence.length];
    handleSelectField(nextKey);
  };

  // Save / Upsert User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a valid user display name');
      handleSelectField('name');
      return;
    }
    if (!formUserCode.trim()) {
      showToast('Please provide a unique user code');
      handleSelectField('user_code');
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

      {/* Header & Breadcrumb (Omega Style) */}
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

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href={`/backoffice/settings/roles?orgId=${orgId}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs border border-slate-200"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Roles & Permissions</span>
          </Link>

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

      {/* Search & Filter Bar (Omega Style) */}
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
      {/* ADD / EDIT USER MODAL WITH INTEGRATED TOUCH KEYBOARD & NUMPAD          */}
      {/* ====================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {editingUserId ? `Edit User: ${formName} (Code: ${formUserCode})` : 'Add New Operator'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure POS terminal credentials, RFID card, and role permissions.
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

            {/* Modal Body: Split Layout (Form Left / Touch Keyboard Right) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40">
              {/* Left Column: Form Fields */}
              <form onSubmit={handleSaveUser} className="lg:col-span-6 space-y-3.5">
                {/* User Code & Card Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>User Code</span>
                      {activeField === 'user_code' && (
                        <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                      )}
                    </label>
                    <div
                      onClick={() => handleSelectField('user_code')}
                      className={`relative flex items-center bg-white rounded-xl border transition-all ${
                        activeField === 'user_code'
                          ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        ref={inputRefs.user_code}
                        type="text"
                        value={formUserCode}
                        onChange={(e) => setFormUserCode(e.target.value)}
                        onFocus={() => handleSelectField('user_code')}
                        placeholder="101"
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold font-mono text-slate-900 bg-transparent outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>Card / Badge #</span>
                      {activeField === 'card_number' && (
                        <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                      )}
                    </label>
                    <div
                      onClick={() => handleSelectField('card_number')}
                      className={`relative flex items-center bg-white rounded-xl border transition-all ${
                        activeField === 'card_number'
                          ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        ref={inputRefs.card_number}
                        type="text"
                        value={formCardNumber}
                        onChange={(e) => setFormCardNumber(e.target.value)}
                        onFocus={() => handleSelectField('card_number')}
                        placeholder="CRD-1001"
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold font-mono text-slate-900 bg-transparent outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Username / Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Username / Display Name</span>
                    {activeField === 'name' && (
                      <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                    )}
                  </label>
                  <div
                    onClick={() => handleSelectField('name')}
                    className={`relative flex items-center bg-white rounded-xl border transition-all ${
                      activeField === 'name'
                        ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      ref={inputRefs.name}
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      onFocus={() => handleSelectField('name')}
                      placeholder="e.g. Jichi Mohammed"
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-transparent outline-hidden"
                    />
                  </div>
                </div>

                {/* PIN / Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Quick PIN / POS Password</span>
                    {activeField === 'pin' && (
                      <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                    )}
                  </label>
                  <div
                    onClick={() => handleSelectField('pin')}
                    className={`relative flex items-center bg-white rounded-xl border transition-all ${
                      activeField === 'pin'
                        ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      ref={inputRefs.pin}
                      type={showPin ? 'text' : 'password'}
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value)}
                      onFocus={() => handleSelectField('pin')}
                      placeholder="4-digit quick PIN"
                      className="w-full pl-9 pr-10 py-2 text-xs font-bold font-mono tracking-wider text-slate-900 bg-transparent outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Dropdown (Directly Bound to Roles & Permissions) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Assigned Role (Permissions & Action Matrix)
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formRoleId}
                      onChange={(e) => setFormRoleId(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.is_read_only ? '(Read Only)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch / Station & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Branch / Plant</label>
                    <input
                      type="text"
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Contact Phone & Email */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>Phone / Contact</span>
                      {activeField === 'contact' && (
                        <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                      )}
                    </label>
                    <input
                      ref={inputRefs.contact}
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      onFocus={() => handleSelectField('contact')}
                      placeholder="+961..."
                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>Email (Optional)</span>
                      {activeField === 'email' && (
                        <span className="text-[9.5px] font-bold text-primary animate-pulse">● Active</span>
                      )}
                    </label>
                    <input
                      ref={inputRefs.email}
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      onFocus={() => handleSelectField('email')}
                      placeholder="user@vanguard..."
                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column: Virtual Touch Keyboard & Numpad */}
              <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs p-4 overflow-hidden">
                {/* Touch Keyboard Header & Layout Switcher */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-slate-800 tracking-tight">
                      Touch Keyboard
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                      Target: {activeField.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setKeyboardMode('NUMPAD')}
                      className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        keyboardMode === 'NUMPAD'
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      123 Numpad
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeyboardMode('QWERTY')}
                      className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        keyboardMode === 'QWERTY'
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ABC QWERTY
                    </button>
                  </div>
                </div>

                {/* 1. DEDICATED NUMERIC KEYPAD */}
                {keyboardMode === 'NUMPAD' && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto w-full">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleVirtualKeyPress(digit)}
                          className="h-14 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-2xl text-xl font-black font-mono text-slate-800 transition-all active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                        >
                          {digit}
                        </button>
                      ))}

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={handleVirtualClear}
                        className="h-14 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-2xl text-sm font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
                      >
                        Clear
                      </button>

                      {/* 0 */}
                      <button
                        type="button"
                        onClick={() => handleVirtualKeyPress('0')}
                        className="h-14 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-2xl text-xl font-black font-mono text-slate-800 transition-all active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                      >
                        0
                      </button>

                      {/* 00 */}
                      <button
                        type="button"
                        onClick={() => handleVirtualKeyPress('00')}
                        className="h-14 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-2xl text-base font-black font-mono text-slate-800 transition-all active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                      >
                        00
                      </button>

                      {/* Backspace */}
                      <button
                        type="button"
                        onClick={handleVirtualBackspace}
                        className="h-12 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <Delete className="w-4 h-4" />
                        <span>⌫</span>
                      </button>

                      {/* Dot . */}
                      <button
                        type="button"
                        onClick={() => handleVirtualKeyPress('.')}
                        className="h-12 bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-lg font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none"
                      >
                        .
                      </button>

                      {/* Next Field */}
                      <button
                        type="button"
                        onClick={handleAdvanceNextField}
                        className="h-12 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. FULL QWERTY ALPHA KEYBOARD */}
                {keyboardMode === 'QWERTY' && (
                  <div className="flex-1 flex flex-col justify-center space-y-1.5 select-none">
                    {/* Numbers Row */}
                    <div className="flex gap-1 justify-center">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleVirtualKeyPress(num)}
                          className="flex-1 h-10 bg-slate-50 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all active:scale-95 cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleVirtualBackspace}
                        className="px-3 h-10 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      >
                        ⌫
                      </button>
                    </div>

                    {/* QWERTY Row 1 */}
                    <div className="flex gap-1 justify-center">
                      {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleVirtualKeyPress(k)}
                          className="flex-1 h-10 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-xl text-xs font-bold text-slate-800 transition-all active:scale-95 cursor-pointer"
                        >
                          {isCaps ? k : k.toLowerCase()}
                        </button>
                      ))}
                    </div>

                    {/* QWERTY Row 2 */}
                    <div className="flex gap-1 justify-center px-2">
                      {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleVirtualKeyPress(k)}
                          className="flex-1 h-10 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-xl text-xs font-bold text-slate-800 transition-all active:scale-95 cursor-pointer"
                        >
                          {isCaps ? k : k.toLowerCase()}
                        </button>
                      ))}
                    </div>

                    {/* QWERTY Row 3 */}
                    <div className="flex gap-1 justify-center">
                      <button
                        type="button"
                        onClick={() => setIsCaps(!isCaps)}
                        className={`px-3 h-10 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer border ${
                          isCaps
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        ⇧ Caps
                      </button>
                      {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleVirtualKeyPress(k)}
                          className="flex-1 h-10 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary rounded-xl text-xs font-bold text-slate-800 transition-all active:scale-95 cursor-pointer"
                        >
                          {isCaps ? k : k.toLowerCase()}
                        </button>
                      ))}
                      {['-', '_', '@', '.'].map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleVirtualKeyPress(sym)}
                          className="w-8 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-700 transition-all active:scale-95 cursor-pointer"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex gap-1 justify-center pt-1">
                      <button
                        type="button"
                        onClick={handleVirtualClear}
                        className="px-4 h-10 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVirtualKeyPress(' ')}
                        className="flex-1 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        Space
                      </button>
                      <button
                        type="button"
                        onClick={handleAdvanceNextField}
                        className="px-4 h-10 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Touch on any field to direct keypad keystrokes. Physical keyboard also supported.
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
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
        </div>
      )}
    </div>
  );
}
