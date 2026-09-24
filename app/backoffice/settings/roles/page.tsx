'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Shield,
  ShieldCheck,
  Building2,
  Users,
  User,
  ChevronRight,
  Check,
  X,
  Lock,
  Save,
  CheckCircle2,
  Sliders,
  Info
} from 'lucide-react';

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  assignedCount: number;
  badgeColor: string;
  permissions: Record<string, boolean>;
}

export default function RolesSettingsPage() {
  const { currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  const [selectedRole, setSelectedRole] = useState<string>('r_ops');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const modules = [
    { key: 'sales_pos', name: 'Sales & POS Terminal', nameAr: 'المبيعات ونقطة البيع' },
    { key: 'pressing_mill', name: 'Olive Pressing Mill & Tanks', nameAr: 'معاصر الزيتون والخزانات' },
    { key: 'accounting_jv', name: 'Accounting, Ledger & Taxes', nameAr: 'المحاسبة والقيود اليومية' },
    { key: 'fleet_tracking', name: 'SuperSonic Fleet Management', nameAr: 'إدارة أسطول الشحن والتوزيع' },
    { key: 'hr_payroll', name: 'HR & Personnel Records', nameAr: 'الموارد البشرية والرواتب' },
    { key: 'system_settings', name: 'Enterprise Master Settings', nameAr: 'إعدادات النظام العامة' },
  ];

  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: 'r_super',
      name: 'Super Administrator',
      description: 'Unrestricted master access across all company branches, database sync, and licensing.',
      assignedCount: 1,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      permissions: {
        sales_pos: true,
        pressing_mill: true,
        accounting_jv: true,
        fleet_tracking: true,
        hr_payroll: true,
        system_settings: true,
      }
    },
    {
      id: 'r_ops',
      name: 'Operations & Mill Manager',
      description: 'Authorized for weighbridge intake, pressing lines, yields, and raw material settlements.',
      assignedCount: 2,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      permissions: {
        sales_pos: true,
        pressing_mill: true,
        accounting_jv: false,
        fleet_tracking: true,
        hr_payroll: false,
        system_settings: false,
      }
    },
    {
      id: 'r_acc',
      name: 'Chief Accountant',
      description: 'Authorized for Journal Vouchers, general ledger, VAT statement, and month-end closure.',
      assignedCount: 2,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      permissions: {
        sales_pos: true,
        pressing_mill: false,
        accounting_jv: true,
        fleet_tracking: false,
        hr_payroll: true,
        system_settings: false,
      }
    },
    {
      id: 'r_cashier',
      name: 'POS Terminal Cashier',
      description: 'Cashier checkout, invoice printing, customer receipts, and daily shift Z-Reports.',
      assignedCount: 4,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      permissions: {
        sales_pos: true,
        pressing_mill: false,
        accounting_jv: false,
        fleet_tracking: false,
        hr_payroll: false,
        system_settings: false,
      }
    },
    {
      id: 'r_driver',
      name: 'SuperSonic Fleet Lead',
      description: 'Mobile V-Driver proof of delivery, GPS route playback, and fuel odometer logs.',
      assignedCount: 3,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      permissions: {
        sales_pos: false,
        pressing_mill: false,
        accounting_jv: false,
        fleet_tracking: true,
        hr_payroll: false,
        system_settings: false,
      }
    }
  ]);

  const activeRole = roles.find(r => r.id === selectedRole) || roles[0];

  const handleTogglePermission = (moduleKey: string) => {
    if (activeRole.id === 'r_super') {
      return; // Super admin permissions cannot be restricted
    }
    setRoles(roles.map(r => {
      if (r.id === activeRole.id) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleKey]: !r.permissions[moduleKey]
          }
        };
      }
      return r;
    }));
  };

  const handleSaveMatrix = () => {
    setToastMessage(`Permissions matrix for "${activeRole.name}" committed to Vanguard Security Engine.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
        <span className="text-primary font-bold">{t('roles_permissions', 'Roles & Permissions')}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-xl shadow-xs">
            🔑
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('user_roles_security_matrix', 'Roles & Permissions Security Matrix')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-bold">
                {roles.length} Roles Defined
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('roles_settings_desc', 'Role-Based Access Control (RBAC) governance across pressing mill, POS terminals, accounting, and fleet.')}
            </p>
          </div>
        </div>

        {/* Quick Tabs Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${orgId}/settings/organization`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('organization', 'Organization')}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/users`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('users', 'Users')}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/account`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('account', 'Account')}</span>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl border bg-emerald-50 text-emerald-900 border-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Roles List (Left) + Permissions Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            {t('defined_system_roles', 'Defined System Roles')}
          </h2>

          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  selectedRole === r.id
                    ? 'bg-white border-primary shadow-sm ring-1 ring-primary'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{r.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${r.badgeColor}`}>
                    {r.assignedCount} {r.assignedCount === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {r.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Configuration for Selected Role */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{activeRole.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeRole.badgeColor}`}>
                    Active Role
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeRole.description}</p>
              </div>

              {activeRole.id !== 'r_super' && (
                <button
                  type="button"
                  onClick={handleSaveMatrix}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save_changes', 'Save Changes')}</span>
                </button>
              )}
            </div>

            {/* Matrix Table */}
            <div className="divide-y divide-slate-100">
              {modules.map((m) => {
                const isEnabled = activeRole.permissions[m.key];
                return (
                  <div key={m.key} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-xs text-slate-800">
                        {t(m.key, m.name)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">Module Key: {m.key}</div>
                    </div>

                    <button
                      type="button"
                      disabled={activeRole.id === 'r_super'}
                      onClick={() => handleTogglePermission(m.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                        isEnabled
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Granted</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                          <span>Restricted</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {activeRole.id === 'r_super' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Super Administrator permissions are immutable by design to safeguard system continuity.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
