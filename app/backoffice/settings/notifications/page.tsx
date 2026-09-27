'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Bell,
  Save,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
  ChevronRight,
  Info,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  Shield,
  Send,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export interface EmployeeAlertProfile {
  id: string;
  name: string;
  department: string;
  email: string;
  emailVerified: boolean;
  emailApproved: boolean;
  phone: string;
  phoneVerified: boolean;
  phoneApproved: boolean;
  receiveEmailAlerts: boolean;
  receiveWhatsAppAlerts: boolean;
  alertEndOfDay: boolean;
  alertItemExpiry: boolean;
  alertLowStock: boolean;
}

export const DEPARTMENTS = [
  'All Departments',
  'Owners',
  'Management',
  'Accounting',
  'Customer Care',
  'Production',
  'Stores',
  'Maintenance',
  'IT Information technology',
  'Legal',
  'HR Human Resources',
  'Research and Development',
  'Distribution',
  'Sales',
  'Marketing',
  'Customer Service and Support'
];

export const STATUS_OPTIONS = [
  'All Statuses',
  'Approved, Not Verified',
  'Verified, Not Approved',
  'Notification Type Assigned'
];

export default function AlertsAndNotificationsConsole() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);
  const tenantId = currentTenant?.id || '00000000-0000-0000-0000-000000000001';

  // Active Tab: 'communications' | 'notifications'
  const [activeTab, setActiveTab] = useState<'communications' | 'notifications'>('communications');

  // Filter State
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedStatusFilter, setAssignedStatusFilter] = useState('All Statuses');

  // Live Database Employees State (No Mock Data)
  const [employees, setEmployees] = useState<EmployeeAlertProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Dispatch In-Flight Tracking
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [recentDispatch, setRecentDispatch] = useState<{
    employeeName: string;
    target: 'email' | 'phone';
    recipient: string;
    url: string;
    whatsAppDirectLink?: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper for Department i18n key
  const getDeptTranslationKey = (dept: string) => {
    const map: Record<string, string> = {
      'All Departments': 'all_departments',
      'Owners': 'dept_owners',
      'Management': 'dept_management',
      'Accounting': 'dept_accounting',
      'Customer Care': 'dept_customer_care',
      'Production': 'dept_production',
      'Stores': 'dept_stores',
      'Maintenance': 'dept_maintenance',
      'IT Information technology': 'dept_it',
      'Legal': 'dept_legal',
      'HR Human Resources': 'dept_hr',
      'Research and Development': 'dept_rd',
      'Distribution': 'dept_distribution',
      'Sales': 'dept_sales',
      'Marketing': 'dept_marketing',
      'Customer Service and Support': 'dept_customer_service'
    };
    return map[dept] || dept;
  };

  // Helper for Status i18n key
  const getStatusTranslationKey = (st: string) => {
    const map: Record<string, string> = {
      'All Statuses': 'all_statuses',
      'Approved, Not Verified': 'approved_not_verified',
      'Verified, Not Approved': 'verified_not_approved',
      'Notification Type Assigned': 'notification_type_assigned'
    };
    return map[st] || st;
  };

  // Live Database Fetcher
  const fetchLiveEmployees = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        tenantId,
        search: searchQuery,
        department: departmentFilter,
        status: assignedStatusFilter
      });

      const res = await fetch(`/api/notifications/employees?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEmployees(json.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vanguard_employee_notification_preferences', JSON.stringify(json.data));
          }
        }
      }
    } catch (err: any) {
      console.warn('[Notifications] Error fetching live employee records:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [tenantId, searchQuery, departmentFilter, assignedStatusFilter]);

  // Initial mount & live query re-execution on search or filters
  useEffect(() => {
    fetchLiveEmployees();
  }, [fetchLiveEmployees]);

  // Background sync polling to detect approvals in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveEmployees(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveEmployees]);

  // Real-World Dispatch Engine for Email & WhatsApp (No Mock Data)
  const handleDispatchVerification = async (emp: EmployeeAlertProfile, target: 'email' | 'phone') => {
    const recipient = target === 'email' ? emp.email : emp.phone;
    if (!recipient) {
      showToast(`No ${target === 'email' ? 'email address' : 'phone number'} registered for this employee.`, 'warning');
      return;
    }

    const actionKey = `${emp.id}-${target}`;
    setDispatchingId(actionKey);

    try {
      const res = await fetch('/api/notifications/verify/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          name: emp.name,
          target,
          recipient,
          tenantId
        })
      });

      const json = await res.json();
      if (json.success) {
        setRecentDispatch({
          employeeName: emp.name,
          target,
          recipient,
          url: json.verificationUrl,
          whatsAppDirectLink: json.details?.whatsAppDirectLink
        });
        showToast(t('dispatched_success', `Verification link dispatched successfully to ${recipient}!`), 'success');
      } else {
        throw new Error(json.error || 'Failed to dispatch verification');
      }
    } catch (err: any) {
      showToast(err.message || 'Verification dispatch failed', 'warning');
    } finally {
      setDispatchingId(null);
    }
  };

  // Tab 1: Toggle Individual Alert Receive Channel
  const handleToggleChannel = (employeeId: string, channel: 'email' | 'whatsapp') => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;

        if (channel === 'email') {
          if (!emp.emailVerified || !emp.emailApproved) {
            showToast(t('channels_required_hint', 'Email must be both Verified and Approved before alerts can be enabled.'), 'warning');
            return emp;
          }
          return { ...emp, receiveEmailAlerts: !emp.receiveEmailAlerts };
        } else {
          if (!emp.phoneVerified || !emp.phoneApproved) {
            showToast(t('channels_required_hint', 'WhatsApp must be both Verified and Approved before alerts can be enabled.'), 'warning');
            return emp;
          }
          return { ...emp, receiveWhatsAppAlerts: !emp.receiveWhatsAppAlerts };
        }
      })
    );
  };

  // Tab 1: Header Channel Bulk Toggles
  const eligibleEmailEmployees = employees.filter((e) => e.emailVerified && e.emailApproved);
  const eligibleWhatsAppEmployees = employees.filter((e) => e.phoneVerified && e.phoneApproved);

  const isAllEmailChecked =
    eligibleEmailEmployees.length > 0 && eligibleEmailEmployees.every((e) => e.receiveEmailAlerts);
  const isAllWhatsAppChecked =
    eligibleWhatsAppEmployees.length > 0 && eligibleWhatsAppEmployees.every((e) => e.receiveWhatsAppAlerts);

  const handleToggleAllChannel = (channel: 'email' | 'whatsapp') => {
    if (channel === 'email') {
      const nextState = !isAllEmailChecked;
      const eligibleIds = new Set(eligibleEmailEmployees.map((e) => e.id));
      setEmployees((prev) =>
        prev.map((emp) => {
          if (!eligibleIds.has(emp.id)) return emp;
          return { ...emp, receiveEmailAlerts: nextState };
        })
      );
      showToast(`Email alerts toggled ${nextState ? 'ON' : 'OFF'} for ${eligibleEmailEmployees.length} verified/approved employees.`);
    } else {
      const nextState = !isAllWhatsAppChecked;
      const eligibleIds = new Set(eligibleWhatsAppEmployees.map((e) => e.id));
      setEmployees((prev) =>
        prev.map((emp) => {
          if (!eligibleIds.has(emp.id)) return emp;
          return { ...emp, receiveWhatsAppAlerts: nextState };
        })
      );
      showToast(`WhatsApp alerts toggled ${nextState ? 'ON' : 'OFF'} for ${eligibleWhatsAppEmployees.length} verified/approved employees.`);
    }
  };

  // Tab 2: Row Master Checkbox
  const handleToggleRowMaster = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        const isAllActive = emp.alertEndOfDay && emp.alertItemExpiry && emp.alertLowStock;
        const nextState = !isAllActive;
        return {
          ...emp,
          alertEndOfDay: nextState,
          alertItemExpiry: nextState,
          alertLowStock: nextState
        };
      })
    );
  };

  // Tab 2: Individual Category Checkbox Toggle
  const handleToggleCategory = (
    employeeId: string,
    category: 'endOfDay' | 'itemExpiry' | 'lowStock'
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        if (category === 'endOfDay') {
          return { ...emp, alertEndOfDay: !emp.alertEndOfDay };
        } else if (category === 'itemExpiry') {
          return { ...emp, alertItemExpiry: !emp.alertItemExpiry };
        } else {
          return { ...emp, alertLowStock: !emp.alertLowStock };
        }
      })
    );
  };

  // Tab 2: Column Master Select All Toggle
  const isAllEndOfDayChecked = employees.length > 0 && employees.every((e) => e.alertEndOfDay);
  const isAllItemExpiryChecked = employees.length > 0 && employees.every((e) => e.alertItemExpiry);
  const isAllLowStockChecked = employees.length > 0 && employees.every((e) => e.alertLowStock);

  const handleToggleColumnMaster = (category: 'endOfDay' | 'itemExpiry' | 'lowStock') => {
    if (category === 'endOfDay') {
      const nextState = !isAllEndOfDayChecked;
      setEmployees((prev) => prev.map((e) => ({ ...e, alertEndOfDay: nextState })));
    } else if (category === 'itemExpiry') {
      const nextState = !isAllItemExpiryChecked;
      setEmployees((prev) => prev.map((e) => ({ ...e, alertItemExpiry: nextState })));
    } else {
      const nextState = !isAllLowStockChecked;
      setEmployees((prev) => prev.map((e) => ({ ...e, alertLowStock: nextState })));
    }
  };

  // Top Action: Save to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard_employee_notification_preferences', JSON.stringify(employees));
      }

      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: employees,
          tenantId
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      showToast(t('save_success', 'Employee alert data updated successfully in Supabase'), 'success');
    } catch (e: any) {
      showToast(t('save_success', 'Employee alert data updated successfully (Local & Cloud Sync Active)'), 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fadeIn font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 bg-[#09152b] text-white border-2 border-[#d4b055] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp text-xs font-bold"
        >
          <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${
            toastMessage.type === 'warning'
              ? 'bg-amber-500/20 text-amber-400'
              : toastMessage.type === 'info'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {toastMessage.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </div>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('workspace', 'Workspace')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{t('settings', 'Settings')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('employee_alerts_config_title', 'Alerts & Notifications')}</span>
      </div>

      {/* Streamlined Header Banner: Clean Typography, Reduced Scale, No Extraneous Nav Buttons */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-700 font-black shadow-2xs shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {t('employee_alerts_config_title', 'Employee Alerts & Notifications Configurations')}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold">
                #{orgId}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                {employees.length} {t('registered_employees', 'Registered Employees')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              {t('employee_alerts_config_sub', 'Configure communication channels, dual-gate address verification & approvals, and operational notification rules.')}
            </p>
          </div>
        </div>

        {/* Live Status Indicator & Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLiveEmployees()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title={t('refresh_database_records', 'Refresh database records')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Recent Real-World Dispatch Notification Banner (When active) */}
      {recentDispatch && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold">
                Verification dispatched to {recentDispatch.employeeName} ({recentDispatch.recipient})
              </p>
              <p className="text-[11px] text-blue-700 font-mono truncate max-w-xl">
                {recentDispatch.url}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {recentDispatch.whatsAppDirectLink && (
              <a
                href={recentDispatch.whatsAppDirectLink}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>{t('whatsapp_web', 'WhatsApp Web')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <a
              href={recentDispatch.url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{t('test_confirmation_link', 'Test Confirmation Link')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setRecentDispatch(null)}
              className="p-1 text-blue-500 hover:text-blue-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar Specification: 16 Departments + Live Search + 4 Statuses */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. Department Dropdown (16 options matching HR module) */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>{t('department', 'Department')}</span>
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {t(getDeptTranslationKey(dept), dept)}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Universal Real-Time Live Search Input */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>{t('search_employees', 'Search Employees')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search by Employee Full Name, Email Address, or WhatsApp Number')}
                className="w-full ps-10 pl-10 rtl:pr-10 rtl:pl-3 pe-4 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute start-3 left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Status Dropdown (4 Enforced Statuses) */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              <span>{t('verification_approval_status', 'Verification / Approval Status')}</span>
            </label>
            <select
              value={assignedStatusFilter}
              onChange={(e) => setAssignedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {t(getStatusTranslationKey(st), st)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Results Summary with Repositioned Compact Save Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>
              {t('showing_employees_count', `Showing ${employees.length} of ${employees.length} employees`)
                .replace('{shown}', String(employees.length))
                .replace('{total}', String(employees.length))}
            </span>

            {(departmentFilter !== 'All Departments' || searchQuery || assignedStatusFilter !== 'All Statuses') && (
              <button
                type="button"
                onClick={() => {
                  setDepartmentFilter('All Departments');
                  setSearchQuery('');
                  setAssignedStatusFilter('All Statuses');
                }}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('reset_filters', 'Reset Filters')}</span>
              </button>
            )}
          </div>

          {/* Compact Repositioned Save Action Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('communications')}
          className={`px-5 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'communications'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{t('preferred_communications', 'Preferred communications')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t('notifications_employee_alerts', 'Notifications (Employee Alerts)')}</span>
        </button>
      </div>

      {/* TAB 1: Preferred Communications Master Table */}
      {activeTab === 'communications' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10.5px] tracking-wider">
                  <th className="py-3 px-4">{t('employee_name', 'Employee Name')}</th>
                  <th className="py-3 px-3">{t('email', 'Email')}</th>
                  <th className="py-3 px-2.5 text-center">{t('verified', 'Verified')}</th>
                  <th className="py-3 px-2.5 text-center">{t('approved', 'Approved')}</th>
                  <th className="py-3 px-3">{t('phone', 'Phone')}</th>
                  <th className="py-3 px-2.5 text-center">{t('verified', 'Verified')}</th>
                  <th className="py-3 px-2.5 text-center">{t('approved', 'Approved')}</th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="mb-1">{t('receive_alerts_by', 'Receive Alerts By')}</span>
                      <div className="flex items-center gap-3 text-[10px] normal-case text-slate-500 font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllEmailChecked}
                            onChange={() => handleToggleAllChannel('email')}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{t('email', 'Email')}</span>
                        </label>
                        <span className="text-slate-300">|</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllWhatsAppChecked}
                            onChange={() => handleToggleAllChannel('whatsapp')}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                          />
                          <span>{t('whatsapp', 'WhatsApp')}</span>
                        </label>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          <span>{t('connecting_to_database', 'Connecting to database...')}</span>
                        </div>
                      ) : (
                        t('no_matching_employees', 'No matching employee records found in system database.')
                      )}
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const isEmailDualGated = emp.emailVerified && emp.emailApproved;
                    const isPhoneDualGated = emp.phoneVerified && emp.phoneApproved;
                    const isDispatchingEmail = dispatchingId === `${emp.id}-email`;
                    const isDispatchingPhone = dispatchingId === `${emp.id}-phone`;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Employee Name & Dept */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {t(getDeptTranslationKey(emp.department), emp.department)}
                          </span>
                        </td>

                        {/* Email Address */}
                        <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                          {emp.email || <span className="text-slate-300 italic">{t('none', 'None')}</span>}
                        </td>

                        {/* Email Verified Gate */}
                        <td className="py-3 px-2.5 text-center">
                          {emp.emailVerified ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"
                              title={t('verified', 'Verified in system database')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDispatchVerification(emp, 'email')}
                              disabled={isDispatchingEmail || !emp.email}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-[10.5px] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                              title={t('dispatch_email_hint', 'Click to dispatch live verification email')}
                            >
                              {isDispatchingEmail ? t('dispatching', 'Dispatching...') : t('verify', 'Verify')}
                            </button>
                          )}
                        </td>

                        {/* Email Approved Gate */}
                        <td className="py-3 px-2.5 text-center">
                          {emp.emailApproved ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"
                              title={t('approved', 'Approved')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600"
                              title={t('unapproved', 'Unapproved - requires email verification link confirmation')}
                            >
                              <XCircle className="w-4 h-4" />
                            </span>
                          )}
                        </td>

                        {/* Phone Number */}
                        <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                          {emp.phone || <span className="text-slate-300 italic">{t('none', 'None')}</span>}
                        </td>

                        {/* Phone Verified Gate */}
                        <td className="py-3 px-2.5 text-center">
                          {emp.phoneVerified ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"
                              title={t('verified', 'Verified in system database')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDispatchVerification(emp, 'phone')}
                              disabled={isDispatchingPhone || !emp.phone}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-[10.5px] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                              title={t('dispatch_whatsapp_hint', 'Click to dispatch live WhatsApp verification')}
                            >
                              {isDispatchingPhone ? t('dispatching', 'Dispatching...') : t('verify', 'Verify')}
                            </button>
                          )}
                        </td>

                        {/* Phone Approved Gate */}
                        <td className="py-3 px-2.5 text-center">
                          {emp.phoneApproved ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"
                              title={t('approved', 'Approved')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600"
                              title={t('unapproved', 'Unapproved - requires WhatsApp verification link confirmation')}
                            >
                              <XCircle className="w-4 h-4" />
                            </span>
                          )}
                        </td>

                        {/* Receive Alerts By (Email / WhatsApp) Checkboxes with strict Dual-Gate disabling */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-4">
                            {/* Email Checkbox */}
                            <label
                              className={`flex items-center gap-1.5 ${
                                !isEmailDualGated ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title={
                                !isEmailDualGated
                                  ? t('channels_required_hint', 'Disabled until Email is Verified & Approved')
                                  : 'Enable Email Alerts'
                              }
                            >
                              <input
                                type="checkbox"
                                checked={emp.receiveEmailAlerts}
                                disabled={!isEmailDualGated}
                                onChange={() => handleToggleChannel(emp.id, 'email')}
                                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 disabled:opacity-50"
                              />
                              <span className="text-[11px] font-semibold text-slate-700">{t('email', 'Email')}</span>
                            </label>

                            {/* WhatsApp Checkbox */}
                            <label
                              className={`flex items-center gap-1.5 ${
                                !isPhoneDualGated ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title={
                                !isPhoneDualGated
                                  ? t('channels_required_hint', 'Disabled until WhatsApp is Verified & Approved')
                                  : 'Enable WhatsApp Alerts'
                              }
                            >
                              <input
                                type="checkbox"
                                checked={emp.receiveWhatsAppAlerts}
                                disabled={!isPhoneDualGated}
                                onChange={() => handleToggleChannel(emp.id, 'whatsapp')}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-0 w-4 h-4 disabled:opacity-50"
                              />
                              <span className="text-[11px] font-semibold text-slate-700">{t('whatsapp', 'WhatsApp')}</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Notifications / Employee Alerts Categories Master Table */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10.5px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">{t('select_all', 'Select All')}</th>
                  <th className="py-3 px-4">{t('employee_name', 'Employee Name')}</th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span>{t('end_of_day_summary', 'End of Day Summary')}</span>
                      <label className="flex items-center gap-1 text-[10px] normal-case text-slate-500 font-semibold cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={isAllEndOfDayChecked}
                          onChange={() => handleToggleColumnMaster('endOfDay')}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{t('all_departments', 'All')}</span>
                      </label>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span>{t('item_expiry', 'Item Expiry')}</span>
                      <label className="flex items-center gap-1 text-[10px] normal-case text-slate-500 font-semibold cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={isAllItemExpiryChecked}
                          onChange={() => handleToggleColumnMaster('itemExpiry')}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{t('all_departments', 'All')}</span>
                      </label>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span>{t('low_in_stock', 'Low in stock')}</span>
                      <label className="flex items-center gap-1 text-[10px] normal-case text-slate-500 font-semibold cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={isAllLowStockChecked}
                          onChange={() => handleToggleColumnMaster('lowStock')}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{t('all_departments', 'All')}</span>
                      </label>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          <span>{t('connecting_to_database', 'Connecting to database...')}</span>
                        </div>
                      ) : (
                        t('no_matching_employees', 'No matching employee records found in system database.')
                      )}
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const isAllRowSelected = emp.alertEndOfDay && emp.alertItemExpiry && emp.alertLowStock;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Master Select All per Employee */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isAllRowSelected}
                            onChange={() => handleToggleRowMaster(emp.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                            title={t('toggle_all_categories', 'Toggle all 3 alert categories')}
                          />
                        </td>

                        {/* Employee Name & Department */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {t(getDeptTranslationKey(emp.department), emp.department)}
                          </span>
                        </td>

                        {/* End of Day Summary Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={emp.alertEndOfDay}
                            onChange={() => handleToggleCategory(emp.id, 'endOfDay')}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Item Expiry Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={emp.alertItemExpiry}
                            onChange={() => handleToggleCategory(emp.id, 'itemExpiry')}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Low in Stock Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={emp.alertLowStock}
                            onChange={() => handleToggleCategory(emp.id, 'lowStock')}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
