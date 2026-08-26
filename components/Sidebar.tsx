'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  ShoppingCart,
  Truck,
  Share2,
  Factory,
  Users,
  FileSpreadsheet,
  UserCheck,
  Globe,
  Sliders,
  Settings,
  MapPin,
  Fuel,
  Wrench,
  Route,
  IdCard,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Crown,
  Droplets,
  Building,
  Tag,
  Lock,
  CalendarDays,
  Headphones,
  UserPlus,
  Scale,
  Package,
  CalendarCheck,
  TrendingUp,
  FileText,
  FileCheck,
  CreditCard,
  PieChart,
  UserCog,
  Search,
  ArrowRightLeft,
  BookOpen
} from 'lucide-react';

import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import TenantSettingsModal from './TenantSettingsModal';

interface SalesMenuItem {
  id: string;
  title: string;
  type: 'link' | 'accordion';
  external?: boolean;
  children?: Array<{ id: string; title: string }>;
}

const salesControlMenu: SalesMenuItem[] = [
  { id: 'sc-dashboard', title: 'Dashboard', type: 'link' },
  { id: 'sc-pos-terminal', title: 'POS Touch Terminal', type: 'link', external: true },
  { id: 'sc-reports', title: 'Reports', type: 'link' },
  { id: 'sc-online-orders', title: 'Online Orders', type: 'link' },
  { id: 'sc-eod', title: 'End of Day', type: 'link' },
  { 
    id: 'sc-setup', 
    title: 'Setup', 
    type: 'accordion', 
    children: [
      { id: 'setup-screens', title: 'Screens' },
      { id: 'setup-payment-types', title: 'Payment Types' },
      { id: 'setup-coupons', title: 'Coupon and Gift Certificates' },
      { id: 'setup-discounts', title: 'Discounts' },
      { id: 'setup-price-modes', title: 'Price Modes' },
      { id: 'setup-workstations', title: 'Workstations and Printers' }
    ] 
  },
  { 
    id: 'sc-more-setup', 
    title: 'More Setup', 
    type: 'accordion', 
    children: [
      { id: 'more-void', title: 'Void Reasons' },
      { id: 'more-vat', title: 'VAT Exemption Reason' },
      { id: 'more-message', title: 'Message on Invoice' },
      { id: 'more-zone', title: 'Zone Setup' },
      { id: 'more-currency', title: 'Currency Setup' }
    ] 
  }
];

interface SidebarProps {
  activeScreen?: string;
  onSelectScreen?: (screenKey: string) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export default function Sidebar({
  activeScreen = 'grid-dash',
  onSelectScreen,
  isOpen: externalIsOpen,
  onToggleOpen
}: SidebarProps) {
  const { currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>('');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    const nextState = !isOpen;
    setInternalIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
  };

  const ensureOpen = () => {
    if (!isOpen) {
      setInternalIsOpen(true);
      if (onToggleOpen) onToggleOpen(true);
    }
  };

  // Accordion toggle states for all main & sub-accordions
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sales: true,
    sales_setup: false,
    sales_moresetup: false,
    supersonic: false,
    social: false,
    op: true,
    op_actions: false,
    op_prodreq: false,
    op_events: false,
    op_setup: false,
    cust: false,
    cust_settings: false,
    cust_feedback: false,
    cust_feedback_setup: false,
    cust_loyalty: false,
    acc: false,
    acc_actions: false,
    acc_setup: false,
    acc_aux: false,
    acc_deptsetup: false,
    hr: false,
    hr_orgsetup: false,
    hr_attendance: false,
    hr_payroll: false,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleNav = (screenKey: string) => {
    if (onSelectScreen) {
      onSelectScreen(screenKey);
    }
  };

  return (
    <aside
      className={`bg-white border-r border-t border-gray-200 rounded-t-xl shadow-2xs transition-all duration-300 flex flex-col shrink-0 min-h-[calc(100vh-96px)] z-30 font-sans select-none ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      dir={dir}
    >
      {/* 1. SIDEBAR TOP CONTROL HEADER (HAMBURGER & HOME) */}
      <div className="p-3 border-b border-gray-200 flex flex-col gap-2 bg-white">
        <div className="flex items-center justify-between w-full">
          {/* HAMBURGER TOGGLE ICON (☰) */}
          <button
            onClick={handleToggle}
            title={isOpen ? "إغلاق القائمة (Collapse Sidebar)" : "فتح القائمة (Expand Sidebar)"}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* HOME ICON (🏠) */}
          <button
            onClick={() => handleNav('grid-dash')}
            title="الرئيسية (Home Dashboard)"
            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH INPUT FIELD (RENDERED IN EXPANDED STATE BELOW HOME ICON) */}
        {isOpen && (
          <div className="relative w-full mt-1">
            <input
              type="text"
              placeholder="search..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              className="w-full text-xs font-normal bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 pr-8 text-gray-700 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
          </div>
        )}
      </div>

      {/* 2. SIDEBAR MODULE LIST & ACCORDIONS */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[13px] font-normal text-gray-700">
        
        {/* MODULE 1: SALES CONTROL */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('sales'); }}
            title={language === 'ar' ? 'إدارة المبيعات ونقطة البيع' : 'Sales Control & POS'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['sales'] ? 'bg-amber-50 text-amber-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  {language === 'ar' ? '1. إدارة المبيعات (Sales Control)' : '1. Sales Control & POS'}
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="ml-3 pl-2 border-l border-amber-200 space-y-0.5 mt-1 text-xs">
              {salesControlMenu.map((item) => {
                if (item.type === 'link') {
                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href="/sales/pos"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between p-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded font-bold transition-colors"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
                      </a>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full text-left p-1.5 hover:text-amber-600 rounded transition-colors ${
                        activeScreen === item.id ? 'text-amber-600 font-bold bg-amber-50/60' : 'font-medium text-gray-700'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                }

                if (item.type === 'accordion') {
                  const isExpanded = expandedGroups[item.id];
                  return (
                    <div key={item.id} className="pt-1">
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="w-full flex items-center justify-between p-1.5 text-amber-950 bg-amber-50/80 hover:bg-amber-100/80 rounded font-bold text-xs transition-colors"
                      >
                        <span>{item.title}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-700" /> : <ChevronRight className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                      {isExpanded && item.children && (
                        <div className="ml-2 pl-2 border-l border-amber-300 space-y-0.5 mt-0.5 text-xs text-gray-700">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleNav(child.id)}
                              className={`w-full text-left p-1 hover:text-amber-600 rounded transition-colors ${
                                activeScreen === child.id ? 'text-amber-600 font-bold bg-amber-50/60' : 'font-medium'
                              }`}
                            >
                              {child.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* MODULE 2: SUPERSONIC FLEET (🔒 PRO) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('supersonic'); }}
            title={language === 'ar' ? 'أسطول الشحن والسيارات' : 'SuperSonic Fleet Management'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['supersonic'] ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{language === 'ar' ? '2. أسطول الشحن (SuperSonic)' : '2. SuperSonic Fleet Management'}</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.2 rounded font-bold">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="ml-3 pl-2 border-l border-emerald-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('fleet-map')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded">Live GPS Fleet Map</button>
              <button onClick={() => handleNav('fleet-km')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded">KM & Odometer Logs</button>
              <button onClick={() => handleNav('fleet-fuel')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded">Fuel Consumption</button>
              <button onClick={() => handleNav('fleet-maint')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded">Vehicle Maintenance</button>
              <button onClick={() => handleNav('fleet-playback')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded">Trip History & Route Playback</button>
              <button onClick={() => handleNav('supersonic-fleet')} className="w-full text-left p-1.5 hover:text-emerald-600 rounded font-medium text-emerald-700">Drivers Directory</button>
              <a href="/supersonic/driver" target="_blank" className="w-full text-left p-1.5 text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                <ExternalLink className="w-3 h-3" /> Driver App PWA
              </a>
            </div>
          )}
        </div>

        {/* MODULE 3: SOCIAL CRM (🔒 ENT) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('social'); }}
            title={language === 'ar' ? 'التواصل الاجتماعي والدعم' : 'Social Media CRM'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>{language === 'ar' ? '3. التواصل الاجتماعي (Social CRM)' : '3. Social CRM & Support'}</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.2 rounded font-bold">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="ml-3 pl-2 border-l border-blue-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('social-inbox')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Unified Social Inbox</button>
              <button onClick={() => handleNav('social-orders')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Platform Orders</button>
              <button onClick={() => handleNav('social-calendar')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Publishing Calendar</button>
              <button onClick={() => handleNav('social-campaigns')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Ad Campaigns & CPL</button>
              <button onClick={() => handleNav('social-agents')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Support Agents</button>
              <button onClick={() => handleNav('social-distributors')} className="w-full text-left p-1.5 hover:text-blue-600 rounded">Distributors Directory</button>
            </div>
          )}
        </div>

        {/* MODULE 4: OPERATIONS CENTER & OLIVE PRESSING */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('op'); }}
            title={language === 'ar' ? 'مركز العمليات والمعاصر' : 'Operations & Pressing Center'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['op'] ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Factory className="w-4 h-4 text-emerald-700 shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  {language === 'ar' ? '4. مركز العمليات والمعاصر (Operations)' : '4. Operations & Pressing Center'}
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="ml-3 pl-2 border-l border-emerald-300 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('op-dash')} className="w-full text-left p-1.5 hover:text-emerald-700 rounded font-medium">Operations Center Dashboard</button>
              <button onClick={() => handleNav('oil-pressing')} className="w-full text-left p-1.5 hover:text-emerald-700 rounded font-bold text-emerald-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> 🫒 Olive Pressing & Production
              </button>
              <button onClick={() => handleNav('op-reports')} className="w-full text-left p-1.5 hover:text-emerald-700 rounded">Operations & Pressing Reports</button>
            </div>
          )}
        </div>

        {/* MODULE 5: CUSTOMER MANAGEMENT (CRM) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('cust'); }}
            title={language === 'ar' ? 'إدارة العملاء والذمم' : 'Customer Management & AR'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-purple-50 text-purple-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  {language === 'ar' ? '5. إدارة العملاء والذمم (CRM)' : '5. Customer Management & AR'}
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ml-3 pl-2 border-l border-purple-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('cust-dir')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Customer Accounts Directory</button>
              <button onClick={() => handleNav('cust-receipts')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Receipt Vouchers</button>
              <button onClick={() => handleNav('cust-aged')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Aged Debtors Analysis</button>
              <button onClick={() => handleNav('cust-insights')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Customer LTV Insights</button>
              <button onClick={() => handleNav('cust-tasks')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Tasks & Appointments</button>
              <button onClick={() => handleNav('cust-leads')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Leads & Opportunities</button>
              <button onClick={() => handleNav('cust-performance')} className="w-full text-left p-1.5 hover:text-purple-600 rounded">Sales Rep Performance</button>
            </div>
          )}
        </div>

        {/* MODULE 6: ACCOUNTING & FINANCE */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('acc'); }}
            title={language === 'ar' ? 'المحاسبة والمالية' : 'Accounting & Finance'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-indigo-50 text-indigo-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  {language === 'ar' ? '6. المحاسبة والمالية (Accounting)' : '6. Accounting & Finance'}
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="ml-3 pl-2 border-l border-indigo-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('acc-dash')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded font-medium">Accounting Dashboard</button>
              <button onClick={() => handleNav('acc-reports')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded">Financial Statements (P&L, Balance Sheet)</button>
              <button onClick={() => handleNav('acc-coa')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded font-semibold text-slate-900">Chart of Accounts (COA)</button>
              <button onClick={() => handleNav('acc-jv')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded">Journal Vouchers (JV)</button>
              <button onClick={() => handleNav('acc-ap')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded">Accounts Payable (AP)</button>
              <button onClick={() => handleNav('acc-rec')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded">Bank Reconciliation</button>
              <button onClick={() => handleNav('acc-vat')} className="w-full text-left p-1.5 hover:text-indigo-600 rounded font-medium">VAT Tax Closing</button>
            </div>
          )}
        </div>

        {/* MODULE 7: HUMAN RESOURCES & PAYROLL */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('hr'); }}
            title={language === 'ar' ? 'الموارد البشرية والرواتب' : 'HR & Payroll Management'}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-rose-50 text-rose-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  {language === 'ar' ? '7. الموارد البشرية والرواتب (HR)' : '7. HR & Payroll Management'}
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ml-3 pl-2 border-l border-rose-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('hr-overview')} className="w-full text-left p-1.5 hover:text-rose-600 rounded">Employee Schedule</button>
              <button onClick={() => handleNav('hr-dir')} className="w-full text-left p-1.5 hover:text-rose-600 rounded">Employee Directory</button>
              <button onClick={() => handleNav('hr-payroll-dash')} className="w-full text-left p-1.5 hover:text-rose-600 rounded font-medium text-rose-700">Payroll Management</button>
            </div>
          )}
        </div>

        {/* PROFILE & ADMIN FOOTER BUTTONS */}
        <div className="pt-2 border-t border-gray-200 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors font-medium text-[12px] shadow-2xs`}
          >
            <Settings className="w-4 h-4 text-amber-600 shrink-0" />
            {isOpen && <span>{language === 'ar' ? 'إعدادات الشعار والترخيص' : 'Identity & License Settings'}</span>}
          </button>

          <a
            href="/admin"
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-medium text-[12px] shadow-2xs`}
          >
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            {isOpen && <span>Master Admin Panel</span>}
          </a>
        </div>

      </div>

      {/* FOOTER METRICS (WHEN EXPANDED) */}
      {isOpen && (
        <div className="p-2.5 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 font-medium text-center space-y-0.5">
          <p className="text-gray-700 font-bold">Vanguard ERP System</p>
          <p className="text-amber-600 font-bold">
            {language === 'ar' ? (currentTenant.brandNameAr || 'منتوجات زيت وزيتون الجنوب SARL') : (currentTenant.brandNameEn || 'Southern Olive Oil & Products SARL')}
          </p>
        </div>
      )}

      {/* TENANT PROFILE & LEGAL BRANDING MODAL */}
      <TenantSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
  );
}
