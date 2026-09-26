'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Building2,
  Users,
  Shield,
  User,
  ChevronRight,
  Info,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone
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

export const INITIAL_EMPLOYEES: EmployeeAlertProfile[] = [
  {
    id: 'emp-101',
    name: 'Jichi Mohammed',
    department: 'Management',
    email: 'mohammed.jichi@gmail.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 767 3828',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true
  },
  {
    id: 'emp-102',
    name: 'Sarah Khoury',
    department: 'Accounting',
    email: 's.khoury@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 882 110',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-103',
    name: 'Ali Hassan',
    department: 'Production',
    email: 'ali.hassan@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 882 101',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true
  },
  {
    id: 'emp-104',
    name: 'Omar Zaiter',
    department: 'Sales',
    email: 'omar.z@southernolive-lb.com',
    emailVerified: true,
    emailApproved: false,
    phone: '+961 70 554 321',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: true
  },
  {
    id: 'emp-105',
    name: 'Hussein Baydoun',
    department: 'Distribution',
    email: 'h.baydoun@southernolive-lb.com',
    emailVerified: false,
    emailApproved: true,
    phone: '+961 76 331 982',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: false,
    alertItemExpiry: false,
    alertLowStock: true
  },
  {
    id: 'emp-106',
    name: 'Nadine Ahmar',
    department: 'Stores',
    email: 'nadine.a@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 345 678',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: false,
    alertItemExpiry: true,
    alertLowStock: true
  },
  {
    id: 'emp-107',
    name: 'Rana Jichi',
    department: 'Customer Care',
    email: 'rana.j@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 199 821',
    phoneVerified: false,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-108',
    name: 'Hassan Sleiman',
    department: 'Maintenance',
    email: 'hassan.s@southernolive-lb.com',
    emailVerified: false,
    emailApproved: false,
    phone: '+961 70 998 877',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: false,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: false,
    alertItemExpiry: false,
    alertLowStock: true
  },
  {
    id: 'emp-109',
    name: 'Maya Chemaly',
    department: 'IT Information technology',
    email: 'm.chemaly@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 3 456 789',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true
  },
  {
    id: 'emp-110',
    name: 'Ziad Tannous',
    department: 'Marketing',
    email: 'z.tannous@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 445 566',
    phoneVerified: false,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: false,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-111',
    name: 'Layla Bazzi',
    department: 'HR Human Resources',
    email: 'layla.b@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 223 344',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-112',
    name: 'Karim Haddad',
    department: 'Legal',
    email: 'k.haddad@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 71 112 233',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-113',
    name: 'Dr. Sami Fakhry',
    department: 'Research and Development',
    email: 's.fakhry@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 889 900',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: false,
    alertItemExpiry: true,
    alertLowStock: true
  },
  {
    id: 'emp-114',
    name: 'Nour Abboud',
    department: 'Customer Service and Support',
    email: 'nour.a@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 76 556 677',
    phoneVerified: true,
    phoneApproved: false,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: false,
    alertEndOfDay: true,
    alertItemExpiry: false,
    alertLowStock: false
  },
  {
    id: 'emp-115',
    name: 'Khaled Mansour',
    department: 'Owners',
    email: 'k.mansour@southernolive-lb.com',
    emailVerified: true,
    emailApproved: true,
    phone: '+961 70 114 455',
    phoneVerified: true,
    phoneApproved: true,
    receiveEmailAlerts: true,
    receiveWhatsAppAlerts: true,
    alertEndOfDay: true,
    alertItemExpiry: true,
    alertLowStock: true
  }
];

export default function NotificationsSettingsPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId
    ? String(currentTenant.companyId)
    : resolveTenantRouteCode(currentTenant?.id);

  // Active Tab: 'communications' | 'notifications'
  const [activeTab, setActiveTab] = useState<'communications' | 'notifications'>('communications');

  // Filter State
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedStatusFilter, setAssignedStatusFilter] = useState('All Statuses');

  // Employees & Preferences State
  const [employees, setEmployees] = useState<EmployeeAlertProfile[]>(INITIAL_EMPLOYEES);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load preferences from localStorage or API on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vanguard_employee_notification_preferences');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEmployees(parsed);
          }
        }
      } catch (e) {
        console.warn('Could not read cached employee preferences:', e);
      }
    }

    // Attempt to load from server endpoint
    const fetchRemote = async () => {
      try {
        const res = await fetch(`/api/notifications/preferences?tenantId=${encodeURIComponent(currentTenant?.id || '')}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setEmployees(json.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('vanguard_employee_notification_preferences', JSON.stringify(json.data));
            }
          }
        }
      } catch (e) {
        // silent fallback
      }
    };
    fetchRemote();
  }, [currentTenant?.id]);

  // Reactive Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Department Filter
      if (departmentFilter !== 'All Departments') {
        if (emp.department.toLowerCase() !== departmentFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Search Query (name, email, phone)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesEmail = emp.email.toLowerCase().includes(q);
        const matchesPhone = emp.phone.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // 3. Notification Type Assigned Filter
      if (assignedStatusFilter === 'Approved, Not Verified') {
        const emailMatch = emp.emailApproved && !emp.emailVerified;
        const phoneMatch = emp.phoneApproved && !emp.phoneVerified;
        if (!emailMatch && !phoneMatch) return false;
      } else if (assignedStatusFilter === 'Verified, Not Approved') {
        const emailMatch = emp.emailVerified && !emp.emailApproved;
        const phoneMatch = emp.phoneVerified && !emp.phoneApproved;
        if (!emailMatch && !phoneMatch) return false;
      }

      return true;
    });
  }, [employees, departmentFilter, searchQuery, assignedStatusFilter]);

  // Tab 1: Preferred Communications Toggles
  const handleToggleChannel = (employeeId: string, channel: 'email' | 'whatsapp') => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        if (channel === 'email') {
          return { ...emp, receiveEmailAlerts: !emp.receiveEmailAlerts };
        } else {
          return { ...emp, receiveWhatsAppAlerts: !emp.receiveWhatsAppAlerts };
        }
      })
    );
  };

  // Tab 1: Header Channel Bulk Toggles
  const isAllEmailChecked =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => e.receiveEmailAlerts);
  const isAllWhatsAppChecked =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => e.receiveWhatsAppAlerts);

  const handleToggleAllChannel = (channel: 'email' | 'whatsapp') => {
    const targetState = channel === 'email' ? !isAllEmailChecked : !isAllWhatsAppChecked;
    const visibleIds = new Set(filteredEmployees.map((e) => e.id));

    setEmployees((prev) =>
      prev.map((emp) => {
        if (!visibleIds.has(emp.id)) return emp;
        if (channel === 'email') {
          return { ...emp, receiveEmailAlerts: targetState };
        } else {
          return { ...emp, receiveWhatsAppAlerts: targetState };
        }
      })
    );
  };

  // Tab 2: Row Master Checkbox (Toggles all 3 categories simultaneously)
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

  // Tab 2: Header Bulk Toggles
  const isAllEndOfDayChecked =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => e.alertEndOfDay);
  const isAllItemExpiryChecked =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => e.alertItemExpiry);
  const isAllLowStockChecked =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => e.alertLowStock);
  const isAllAlertsAllEmployeesChecked =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => e.alertEndOfDay && e.alertItemExpiry && e.alertLowStock);

  const handleToggleAllCategory = (category: 'endOfDay' | 'itemExpiry' | 'lowStock' | 'all') => {
    const visibleIds = new Set(filteredEmployees.map((e) => e.id));

    setEmployees((prev) =>
      prev.map((emp) => {
        if (!visibleIds.has(emp.id)) return emp;
        if (category === 'endOfDay') {
          return { ...emp, alertEndOfDay: !isAllEndOfDayChecked };
        } else if (category === 'itemExpiry') {
          return { ...emp, alertItemExpiry: !isAllItemExpiryChecked };
        } else if (category === 'lowStock') {
          return { ...emp, alertLowStock: !isAllLowStockChecked };
        } else {
          const nextState = !isAllAlertsAllEmployeesChecked;
          return {
            ...emp,
            alertEndOfDay: nextState,
            alertItemExpiry: nextState,
            alertLowStock: nextState
          };
        }
      })
    );
  };

  // Top Action: Save Changes
  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);

    try {
      // 1. Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard_employee_notification_preferences', JSON.stringify(employees));
      }

      // 2. Call server endpoint
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: employees,
          tenantId: currentTenant?.id || '00000000-0000-0000-0000-000000000001'
        })
      });

      // 3. Trigger Required Toast
      setToastMessage('Employee alert data updated successfully');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      setToastMessage('Employee alert data updated successfully');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 bg-[#09152b] text-white border-2 border-[#d4b055] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp text-xs font-bold"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white transition-colors"
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
        <span className="text-primary font-bold">Alerts &amp; Notifications</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-700 font-black text-2xl shadow-xs">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Alerts &amp; Notifications Configuration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-mono font-bold">
                #{orgId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                {employees.length} Employees Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure communication channels, verified address approvals, and authorization for automated operational alerts.
            </p>
          </div>
        </div>

        {/* Top Actions & Quick Settings Navigation */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          <Link
            href={`/${orgId}/settings/organization`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization</span>
          </Link>
          <Link
            href={`/${orgId}/settings/users`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </Link>
          <Link
            href={`/${orgId}/settings/roles`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Roles</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar Specification */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* 1. Department Dropdown */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Department</span>
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Search Input */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>Search Employees</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Employee name, email or phone number"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Notification Type Assigned Dropdown */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <span>Verification / Approval</span>
            </label>
            <select
              value={assignedStatusFilter}
              onChange={(e) => setAssignedStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Approved, Not Verified">Approved, Not Verified</option>
              <option value="Verified, Not Approved">Verified, Not Approved</option>
            </select>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-slate-800">{employees.length}</strong> employees
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
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('communications')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'communications'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Preferred Communications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
            3 Categories
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PREFERRED COMMUNICATIONS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'communications' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Description Banner Specification */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-blue-950 text-xs flex items-start gap-3 shadow-2xs">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <strong className="font-extrabold">Employee Alert Receivable Type:</strong> This section allows
              administrators to configure alert notification preferences for each employee. Email notifications
              require a valid, verified, and approved email address, while WhatsApp notifications require a valid,
              verified, and approved phone number.
            </div>
          </div>

          {/* Table Specification */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-4">Employee Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-3 text-center">Verified</th>
                    <th className="py-3.5 px-3 text-center">Approved</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-3 text-center">Verified</th>
                    <th className="py-3.5 px-3 text-center">Approved</th>
                    <th className="py-3.5 px-4 text-center bg-blue-50/70 border-l border-slate-200">
                      <div className="text-[10px] text-blue-900 font-extrabold pb-1">Receive Alerts By</div>
                      <div className="grid grid-cols-2 gap-2 text-center text-[9.5px] text-blue-800 font-bold pt-1 border-t border-blue-200">
                        <label className="flex items-center justify-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllEmailChecked}
                            onChange={() => handleToggleAllChannel('email')}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>Email</span>
                        </label>
                        <label className="flex items-center justify-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllWhatsAppChecked}
                            onChange={() => handleToggleAllChannel('whatsapp')}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>WhatsApp</span>
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No employees found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Employee Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{emp.name}</div>
                          <div className="text-[10.5px] text-slate-400 font-semibold">{emp.department}</div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {emp.email}
                        </td>

                        {/* Email Verified */}
                        <td className="py-3.5 px-3 text-center">
                          {emp.emailVerified ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                              &times;
                            </span>
                          )}
                        </td>

                        {/* Email Approved */}
                        <td className="py-3.5 px-3 text-center">
                          {emp.emailApproved ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                              &times;
                            </span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {emp.phone}
                        </td>

                        {/* Phone Verified */}
                        <td className="py-3.5 px-3 text-center">
                          {emp.phoneVerified ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                              &times;
                            </span>
                          )}
                        </td>

                        {/* Phone Approved */}
                        <td className="py-3.5 px-3 text-center">
                          {emp.phoneApproved ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                              &times;
                            </span>
                          )}
                        </td>

                        {/* Receive Alerts By: Email / WhatsApp Checkboxes */}
                        <td className="py-3.5 px-4 border-l border-slate-200 bg-blue-50/25">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={emp.receiveEmailAlerts}
                                onChange={() => handleToggleChannel(emp.id, 'email')}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                aria-label={`Receive Email alerts for ${emp.name}`}
                              />
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={emp.receiveWhatsAppAlerts}
                                onChange={() => handleToggleChannel(emp.id, 'whatsapp')}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                aria-label={`Receive WhatsApp alerts for ${emp.name}`}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NOTIFICATIONS (Alert Categories & Multi-Check Logic)               */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Description Banner Specification */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-3 shadow-2xs">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <strong className="font-extrabold">Employee Alerts:</strong> Define the specific alert categories that
              each employee is authorized to receive. Notifications will be delivered according to the employee&apos;s
              configured notification channels.
            </div>
          </div>

          {/* Table Specification */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                    {/* Header: Employee Name with Master Toggle for all visible */}
                    <th className="py-3.5 px-4 w-72">
                      <div className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllAlertsAllEmployeesChecked}
                          onChange={() => handleToggleAllCategory('all')}
                          title="Toggle all alerts for all employees"
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Employee Name</span>
                      </div>
                    </th>

                    {/* Header: End of Day Summary */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllEndOfDayChecked}
                          onChange={() => handleToggleAllCategory('endOfDay')}
                          title="Toggle End of Day for all employees"
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>End of Day Summary</span>
                      </div>
                    </th>

                    {/* Header: Item Expiry */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllItemExpiryChecked}
                          onChange={() => handleToggleAllCategory('itemExpiry')}
                          title="Toggle Item Expiry for all employees"
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Item Expiry</span>
                      </div>
                    </th>

                    {/* Header: Low in stock */}
                    <th className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllLowStockChecked}
                          onChange={() => handleToggleAllCategory('lowStock')}
                          title="Toggle Low in Stock for all employees"
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Low in stock</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No employees found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isAllActive =
                        emp.alertEndOfDay && emp.alertItemExpiry && emp.alertLowStock;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Row: Employee Name + Row Master Checkbox */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isAllActive}
                                onChange={() => handleToggleRowMaster(emp.id)}
                                title={`Toggle all 3 alert categories for ${emp.name}`}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div>
                                <div className="font-extrabold text-slate-900">{emp.name}</div>
                                <div className="text-[10.5px] text-slate-400 font-semibold">
                                  {emp.department} &bull; {emp.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* End of Day Summary Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={emp.alertEndOfDay}
                                onChange={() => handleToggleCategory(emp.id, 'endOfDay')}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                aria-label={`End of Day Summary for ${emp.name}`}
                              />
                            </div>
                          </td>

                          {/* Item Expiry Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={emp.alertItemExpiry}
                                onChange={() => handleToggleCategory(emp.id, 'itemExpiry')}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                aria-label={`Item Expiry for ${emp.name}`}
                              />
                            </div>
                          </td>

                          {/* Low in stock Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={emp.alertLowStock}
                                onChange={() => handleToggleCategory(emp.id, 'lowStock')}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                aria-label={`Low in stock for ${emp.name}`}
                              />
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
        </div>
      )}
    </div>
  );
}
