'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Shield,
  Building2,
  User,
  ChevronRight,
  Mail,
  Key,
  Edit2,
  Trash2,
  Lock
} from 'lucide-react';

interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleBadge: string;
  branch: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

export default function UsersSettingsPage() {
  const { currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Initial Enterprise Users List
  const [users, setUsers] = useState<EnterpriseUser[]>([
    {
      id: 'u1',
      name: 'Jichi Mohammed',
      email: 'mohammed@vanguard-erp.com',
      role: 'General Operations Manager',
      roleBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      branch: 'Choueifat Central Plant',
      status: 'ACTIVE',
      lastLogin: 'Today, 11:42 AM'
    },
    {
      id: 'u2',
      name: 'Ali Hassan',
      email: 'ali.hassan@southernolive-lb.com',
      role: 'Pressing Mill Shift Lead',
      roleBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      branch: 'Choueifat Production Mill',
      status: 'ACTIVE',
      lastLogin: 'Today, 08:15 AM'
    },
    {
      id: 'u3',
      name: 'Sarah Khoury',
      email: 's.khoury@southernolive-lb.com',
      role: 'Chief Financial Accountant',
      roleBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      branch: 'Beirut Corporate Hub',
      status: 'ACTIVE',
      lastLogin: 'Yesterday, 04:30 PM'
    },
    {
      id: 'u4',
      name: 'Omar Zaiter',
      email: 'omar.z@southernolive-lb.com',
      role: 'POS Terminal Cashier',
      roleBadge: 'bg-blue-100 text-blue-800 border-blue-200',
      branch: 'Choueifat Cashier Desk',
      status: 'ACTIVE',
      lastLogin: 'Today, 09:00 AM'
    },
    {
      id: 'u5',
      name: 'Hussein Baydoun',
      email: 'h.baydoun@southernolive-lb.com',
      role: 'SuperSonic Fleet Driver Lead',
      roleBadge: 'bg-purple-100 text-purple-800 border-purple-200',
      branch: 'Distribution Fleet',
      status: 'ACTIVE',
      lastLogin: 'Today, 07:45 AM'
    }
  ]);

  // Form State for New User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('POS Terminal Cashier');
  const [newUserBranch, setNewUserBranch] = useState('Choueifat Central Plant');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: EnterpriseUser = {
      id: 'u-' + Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      roleBadge: 'bg-blue-100 text-blue-800 border-blue-200',
      branch: newUserBranch,
      status: 'ACTIVE',
      lastLogin: 'Never (Invited)'
    };

    setUsers([newUser, ...users]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setToastMessage(`User ${newUser.name} created successfully! Temporary credentials dispatched.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('workspace', 'Workspace')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{t('settings', 'Settings')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('users', 'Users')}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 font-black text-xl shadow-xs">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('enterprise_users_directory', 'Enterprise Users & Access Directory')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-mono font-bold">
                {users.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('users_settings_desc', 'Manage team directory, invite operators, assign branch workstations, and monitor sessions.')}
            </p>
          </div>
        </div>

        {/* Quick Tabs Links + Add User Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${orgId}/settings/organization`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('organization', 'Organization')}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/roles`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('roles', 'Roles')}</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('add_new_user', 'Add New User')}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl border bg-emerald-50 text-emerald-900 border-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_users_placeholder', 'Search by name, email, or role...')}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-hidden"
          >
            <option value="ALL">All Roles</option>
            <option value="Operations">Operations / Mill Leads</option>
            <option value="Accountant">Finance & Accounting</option>
            <option value="Cashier">POS Cashiers</option>
            <option value="Driver">Fleet Drivers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{t('user', 'User')}</th>
                <th className="px-4 py-3.5">{t('role', 'Role')}</th>
                <th className="px-4 py-3.5">{t('branch_facility', 'Branch / Facility')}</th>
                <th className="px-4 py-3.5">{t('status', 'Status')}</th>
                <th className="px-4 py-3.5">{t('last_login', 'Last Login')}</th>
                <th className="px-5 py-3.5 text-right rtl:text-left">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-black flex items-center justify-center text-xs shadow-2xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{user.name}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${user.roleBadge}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-semibold text-[11px]">
                    {user.branch}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-mono text-[10.5px]">
                    {user.lastLogin}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => alert(`Reset password link dispatched to ${user.email}`)}
                        title="Reset Password"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Editing permissions for ${user.name}`)}
                        title="Edit Permissions"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddUserModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 animate-zoomIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {t('invite_new_operator', 'Invite New Operator')}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Walid Mansour"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. walid@southernolive-lb.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-primary text-slate-900 font-bold"
                >
                  <option value="General Operations Manager">General Operations Manager</option>
                  <option value="Pressing Mill Shift Lead">Pressing Mill Shift Lead</option>
                  <option value="Chief Financial Accountant">Chief Financial Accountant</option>
                  <option value="POS Terminal Cashier">POS Terminal Cashier</option>
                  <option value="SuperSonic Fleet Driver Lead">SuperSonic Fleet Driver Lead</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch / Facility</label>
                <select
                  value={newUserBranch}
                  onChange={(e) => setNewUserBranch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-primary text-slate-900"
                >
                  <option value="Choueifat Central Plant">Choueifat Central Plant</option>
                  <option value="Beirut Corporate Hub">Beirut Corporate Hub</option>
                  <option value="Distribution Fleet">Distribution Fleet</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
