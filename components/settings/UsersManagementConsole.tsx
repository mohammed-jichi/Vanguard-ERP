'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { EnterpriseUserRecord, BranchAccessSetting } from '@/app/api/users/route';
import {
  HREmployeeRecord,
  HRPersonnelService,
} from '@/lib/hrPersonnelService';
import NewEmployeeModal from '@/components/modules/hr/NewEmployeeModal';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Save,
  HelpCircle,
  Lock,
  X,
  CheckCircle2,
  UserPlus,
  Briefcase,
} from 'lucide-react';

interface UsersManagementConsoleProps {
  initialTenantId?: string;
}

const SALESMEN_LIST = [
  'Mahdi',
  'HUSSEIN',
  'Ricky',
  'Nour Yazbeck',
  'Hussien Mahdi',
  'Hiba Aloulou',
];

const DEFAULT_BRANCH_ACCESS: BranchAccessSetting[] = [
  {
    company_name: 'منتوجات زيت وزيتون الجنوب ش.م.م. (Southern Olive and Oil Products S.A.R.L.)',
    facility_id: '1300-01',
    branch_id: '1300-01',
    branch_name: '1300-01 - Choueifat Main Facility',
    access_scope: 'GLOBAL_TENANT',
    enabled: true,
    salesman: 'Mahdi',
    workstation_id: '2000',
  },
];

export default function UsersManagementConsole({ initialTenantId }: UsersManagementConsoleProps) {
  const { currentTenant } = useTenant();

  const orgId =
    initialTenantId ||
    (currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id));

  // Users Directory State
  const [users, setUsers] = useState<EnterpriseUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [showNotActive, setShowNotActive] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // HR Personnel Integration State
  const [hrPersonnelList, setHrPersonnelList] = useState<HREmployeeRecord[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState<boolean>(false);

  // Modal Form State
  const [formFirstName, setFormFirstName] = useState<string>('');
  const [formLastName, setFormLastName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<'Manager' | 'Limited Access'>('Manager');
  const [formAccessScope, setFormAccessScope] = useState<'GLOBAL_TENANT' | 'RESTRICTED_FACILITY'>('GLOBAL_TENANT');
  const [formAssignedFacilityId, setFormAssignedFacilityId] = useState<string>('1300-01');
  const [formIsTraining, setFormIsTraining] = useState<boolean>(false);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formCreatedBy, setFormCreatedBy] = useState<string>('Jamal Jichi');
  const [formCreatedDate, setFormCreatedDate] = useState<string>('2024-05-15');
  const [formExpiryDate, setFormExpiryDate] = useState<string>('2026-12-10');
  const [formBranchAccess, setFormBranchAccess] = useState<BranchAccessSetting[]>(DEFAULT_BRANCH_ACCESS);
  const [newPassword, setNewPassword] = useState<string>('');

  // Confirmation Modal State for Reset Security Question
  const [isSecurityQuestionConfirmOpen, setIsSecurityQuestionConfirmOpen] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);

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

  // Load HR personnel on mount & listen to updates
  useEffect(() => {
    fetchUsers();
    setHrPersonnelList(HRPersonnelService.getEmployees());

    const handleHREvent = (e: any) => {
      if (e.detail) {
        setHrPersonnelList(e.detail);
      }
    };
    window.addEventListener('vanguard_hr_employees_updated', handleHREvent);
    return () => window.removeEventListener('vanguard_hr_employees_updated', handleHREvent);
  }, [orgId]);

  // Open Modal for Add New User
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setSelectedPersonnelId('');
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Manager');
    setFormAccessScope('GLOBAL_TENANT');
    setFormAssignedFacilityId('1300-01');
    setFormIsTraining(false);
    setFormActive(true);
    setFormCreatedBy('Jamal Jichi');
    setFormCreatedDate(new Date().toISOString().split('T')[0]);
    setFormExpiryDate('2026-12-10');
    setFormBranchAccess(JSON.parse(JSON.stringify(DEFAULT_BRANCH_ACCESS)));
    setNewPassword('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit User
  const handleOpenEditUser = (user: EnterpriseUserRecord) => {
    setEditingUserId(user.id);
    setSelectedPersonnelId('');

    let first = user.first_name || '';
    let last = user.last_name || '';
    if (!first && user.name) {
      const parts = user.name.split(' ');
      first = parts[0] || '';
      last = parts.slice(1).join(' ') || '';
    }

    setFormFirstName(first);
    setFormLastName(last);
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormRole(user.role === 'Limited Access' ? 'Limited Access' : 'Manager');
    setFormIsTraining(Boolean(user.is_training));
    setFormActive(user.status === 'ACTIVE');
    setFormCreatedBy(user.created_by || 'Jamal Jichi');
    setFormCreatedDate(user.created_at ? user.created_at.split('T')[0] : '2024-05-15');
    setFormExpiryDate(user.expiry_date || '2026-12-10');

    if (user.branches_access && user.branches_access.length > 0) {
      setFormBranchAccess(JSON.parse(JSON.stringify(user.branches_access)));
    } else {
      setFormBranchAccess(JSON.parse(JSON.stringify(DEFAULT_BRANCH_ACCESS)));
    }

    setNewPassword('');
    setIsModalOpen(true);
  };

  // Handle Personnel Selected from Dropdown
  const handlePersonnelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedPersonnelId(selectedId);
    if (!selectedId) return;

    const emp = hrPersonnelList.find((p) => p.id === selectedId);
    if (emp) {
      setFormFirstName(emp.firstName);
      setFormLastName(emp.lastName);
      setFormEmail(emp.email);
    }
  };

  // Handle Employee Created from NewEmployeeModal
  const handleEmployeeCreated = (newEmp: HREmployeeRecord) => {
    setHrPersonnelList(HRPersonnelService.getEmployees());
    setSelectedPersonnelId(newEmp.id);
    setFormFirstName(newEmp.firstName);
    setFormLastName(newEmp.lastName);
    setFormEmail(newEmp.email || '');
    setIsNewEmployeeModalOpen(false);
    setIsModalOpen(true);
    showToast(`Employee ${newEmp.fullName} created and auto-filled.`);
  };

  const handleOpenNewEmployeeFromAddUser = () => {
    setIsModalOpen(false);
    setIsNewEmployeeModalOpen(true);
  };

  // Check All / Uncheck All Branches
  const handleCheckAllBranches = () => {
    setFormBranchAccess((prev) => prev.map((b) => ({ ...b, enabled: true })));
  };

  const handleUncheckAllBranches = () => {
    setFormBranchAccess((prev) => prev.map((b) => ({ ...b, enabled: false })));
  };

  // Save User
  const handleSaveUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formFirstName.trim() || !formLastName.trim()) {
      showToast('First Name and Last Name are required.');
      return;
    }
    if (!formEmail.trim()) {
      showToast('Email address is required.');
      return;
    }
    if (!editingUserId && !formPassword.trim()) {
      showToast('Password is required for new user.');
      return;
    }

    const fullName = `${formFirstName.trim()} ${formLastName.trim()}`;
    const nextUserCode = editingUserId
      ? users.find((u) => u.id === editingUserId)?.user_code || '101'
      : (users.length > 0 ? Math.max(...users.map((u) => parseInt(u.user_code, 10) || 100)) + 1 : 101).toString();

    const effectivePassword = newPassword.trim() || formPassword.trim() || undefined;

    const payload: EnterpriseUserRecord = {
      id: editingUserId || `u-${Date.now()}`,
      tenant_id: orgId,
      user_code: nextUserCode,
      name: fullName,
      first_name: formFirstName.trim(),
      last_name: formLastName.trim(),
      email: formEmail.trim(),
      password: effectivePassword,
      pin: effectivePassword || users.find((u) => u.id === editingUserId)?.pin || '1001',
      card_number: users.find((u) => u.id === editingUserId)?.card_number || `CRD-${nextUserCode}`,
      role: formRole,
      role_id: formRole === 'Manager' ? 'r_manager' : 'r_limited',
      access_scope: formAccessScope,
      assigned_facility_id: formAssignedFacilityId,
      assigned_facility_name: '1300-01 - Choueifat Main Facility',
      role_badge:
        formRole === 'Manager'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : 'bg-blue-100 text-blue-800 border-blue-200',
      branch: formBranchAccess.find((b) => b.enabled)?.branch_name || 'Southern Olive and Oil Products - Main',
      status: formActive ? 'ACTIVE' : 'INACTIVE',
      is_training: formIsTraining,
      expiry_date: formExpiryDate,
      created_by: formCreatedBy,
      created_at: formCreatedDate,
      branches_access: formBranchAccess,
      updated_at: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      // Optimistic update
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
      setNewPassword('');
      showToast(editingUserId ? `User ${payload.name} updated successfully!` : `User ${payload.name} created successfully!`);
    } catch (err) {
      console.error('[UsersConsole] Save user failed:', err);
      showToast('Error saving user');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: EnterpriseUserRecord) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) {
      return;
    }

    try {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      await fetch(`/api/users?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      showToast(`User ${user.name} deleted.`);
    } catch (err) {
      console.error('[UsersConsole] Delete user failed:', err);
      showToast('Error deleting user');
      fetchUsers();
    }
  };

  // Reset Security Question
  const handleConfirmSecurityQuestionReset = () => {
    setIsSecurityQuestionConfirmOpen(false);
    showToast('Security question reset successfully.');
  };

  // Reset Password Action
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      showToast('Please enter a new password first.');
      return;
    }

    if (!editingUserId) {
      showToast('No user selected.');
      return;
    }

    const cleanPass = newPassword.trim();
    const targetUser = users.find((u) => u.id === editingUserId);
    const targetEmail = formEmail.trim() || targetUser?.email || '';

    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUserId,
          email: targetEmail,
          newPassword: cleanPass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, password: cleanPass, pin: cleanPass }
            : u
        )
      );

      showToast('Password reset successfully.');
      setNewPassword('');
    } catch (err: any) {
      console.error('[UsersConsole] Reset password failed:', err);
      showToast(err.message || 'Error resetting password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email ? u.email.toLowerCase().includes(q) : false;
        const matchesRole = u.role.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) {
          return false;
        }
      }

      // 2. Role Filter
      if (roleFilter !== 'All Roles') {
        if (u.role.toLowerCase() !== roleFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Show Not Active Filter
      if (!showNotActive) {
        if (u.status !== 'ACTIVE') {
          return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, showNotActive]);

  // Pagination Slice
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. MASTER USERS DIRECTORY VIEW (Matching Screenshot 5)               */}
      {/* ==================================================================== */}

      {/* Breadcrumb & Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Users</h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
          <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Customer Users</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
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
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
          >
            <option value="All Roles">All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Limited Access">Limited Access</option>
          </select>

          {/* Show Not Active Checkbox */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showNotActive}
              onChange={(e) => {
                setShowNotActive(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span>Show Not Active</span>
          </label>
        </div>

        {/* Primary Action Button: + New */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider text-left">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Training</th>
                <th className="py-3.5 px-4 text-center">Active</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-medium">
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-medium">
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                      {user.name}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {user.email || '—'}
                    </td>

                    {/* Role & Facility Access Scope */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      <div className="flex flex-col gap-1 items-start">
                        <span>{user.role}</span>
                        {user.access_scope === 'RESTRICTED_FACILITY' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Restricted: {user.assigned_facility_id || '1300-01'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Global 1300
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Training (Red ✖ if unchecked, Green ✔ if checked) */}
                    <td className="py-3.5 px-4 text-center">
                      {user.is_training ? (
                        <span className="inline-flex items-center justify-center text-emerald-600 font-black text-sm" title="Training (Read Only)">
                          ✔
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-red-600 font-black text-sm" title="Standard Access">
                          ✖
                        </span>
                      )}
                    </td>

                    {/* Active (Green ✔ if active, Red ✖ if inactive) */}
                    <td className="py-3.5 px-4 text-center">
                      {user.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center justify-center text-emerald-600 font-black text-sm" title="Active">
                          ✔
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-red-600 font-black text-sm" title="Inactive">
                          ✖
                        </span>
                      )}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 font-mono">
                      {user.expiry_date || '2026-12-10'}
                    </td>

                    {/* Actions: Pencil and Trash */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(user)}
                          title="Edit User"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination Controls («, 1, ») */}
        <div className="flex items-center justify-center gap-1.5 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setCurrentPage(pg)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPage === pg
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            »
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. ADD USER / EDIT USER MODAL                                        */}
      {/* ==================================================================== */}
      {isModalOpen && !isNewEmployeeModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {editingUserId ? 'Edit User' : 'Add User'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Personnel Selection Header (When creating a user) */}
              {!editingUserId && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Personnel*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPersonnelId}
                      onChange={handlePersonnelSelect}
                      className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer shadow-2xs"
                    >
                      <option value="">Select Personnel</option>
                      {hrPersonnelList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.designation} - {emp.department})
                        </option>
                      ))}
                    </select>

                    {/* Plus Button to open New Employee Dialog */}
                    <button
                      type="button"
                      onClick={handleOpenNewEmployeeFromAddUser}
                      title="Add New Employee (Module 6: HR Personnel)"
                      className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Employee</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select an existing HR employee or click "+" to register a new employee with biometric clock binding.
                  </p>
                </div>
              )}

              {/* Credentials & Role Fields: First Name* & Last Name* */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">First Name*</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Last Name*</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Email* Full-Width Text Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email*</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jamaljichihusseinmahdi@gmail.com"
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                />
              </div>

              {/* Password* (For New User) */}
              {!editingUserId && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Password*</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter user password"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                  />
                </div>
              )}

              {/* Role* Dropdown (Strictly: Manager and Limited Access) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Role*</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'Manager' | 'Limited Access')}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                >
                  <option value="Manager">Manager</option>
                  <option value="Limited Access">Limited Access</option>
                </select>
              </div>

              {/* Middle Section: Status & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Left: Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsTraining}
                      onChange={(e) => setFormIsTraining(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span>is Training / Read Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span>Active</span>
                  </label>
                </div>

                {/* Right: Metadata Labels (Shown when editing or creating) */}
                <div className="text-xs font-semibold text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created by:</span>
                    <span className="font-bold text-slate-800">{formCreatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created Date:</span>
                    <span className="font-bold text-slate-800 font-mono">{formCreatedDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Expiry Date:</span>
                    <input
                      type="date"
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="px-2 py-0.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-md outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Branches Access Section (Configured for Actual Enterprise Entity & Facility) */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Branches Access
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCheckAllBranches}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>✔</span>
                      <span>Check All</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUncheckAllBranches}
                      className="px-2.5 py-1 bg-red-800 hover:bg-red-900 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>✖</span>
                      <span>Uncheck All</span>
                    </button>
                  </div>
                </div>

                {/* Branch Card / Group */}
                <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-3.5 space-y-3">
                  <div className="text-xs sm:text-sm font-black text-slate-900 tracking-tight font-arabic flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>منتوجات زيت وزيتون الجنوب ش.م.م. (Southern Olive and Oil Products S.A.R.L.)</span>
                  </div>

                  {formBranchAccess.map((br, idx) => (
                    <div
                      key={br.branch_id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
                    >
                      {/* Checkbox + Facility Code + Facility Name */}
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={br.enabled}
                          onChange={(e) => {
                            const updated = [...formBranchAccess];
                            updated[idx].enabled = e.target.checked;
                            setFormBranchAccess(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span>{br.branch_id} {br.branch_name}</span>
                      </label>

                      {/* Salesman & w# */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-600">Salesman:</span>
                          <select
                            value={br.salesman}
                            onChange={(e) => {
                              const updated = [...formBranchAccess];
                              updated[idx].salesman = e.target.value;
                              setFormBranchAccess(updated);
                            }}
                            className="px-2 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-primary cursor-pointer"
                          >
                            {SALESMEN_LIST.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-600">w#:</span>
                          <input
                            type="text"
                            value={br.workstation_id}
                            onChange={(e) => {
                              const updated = [...formBranchAccess];
                              updated[idx].workstation_id = e.target.value;
                              setFormBranchAccess(updated);
                            }}
                            placeholder="2000"
                            className="w-16 px-2 py-1 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-center outline-hidden focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Save Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveUser()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>

              {/* Reset Password & Security Question Section (When editing an existing user) */}
              {editingUserId && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Reset Password
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsSecurityQuestionConfirmOpen(true)}
                      className="px-3.5 py-1.5 bg-[#78350f] hover:bg-[#92400e] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Reset Security Question</span>
                    </button>

                    <button
                      type="button"
                      disabled={isResettingPassword}
                      onClick={handleResetPassword}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isResettingPassword ? 'Resetting...' : 'Reset Password'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Security Question */}
      {isSecurityQuestionConfirmOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsSecurityQuestionConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl max-w-sm w-full z-10 space-y-4 animate-zoomIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Security Question</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Are you sure you want to reset this user security question?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSecurityQuestionConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSecurityQuestionReset}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#78350f] hover:bg-[#92400e] transition-colors cursor-pointer shadow-xs"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Reusable New Employee Modal (HR Personnel Engine) */}
      <NewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => {
          setIsNewEmployeeModalOpen(false);
          setIsModalOpen(true);
        }}
        onEmployeeCreated={handleEmployeeCreated}
        hideScheduleTab={true}
      />
    </div>
  );
}
