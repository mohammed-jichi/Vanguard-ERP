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
  Search
} from 'lucide-react';

import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import TenantSettingsModal from './TenantSettingsModal';

interface SidebarProps {
  activeScreen?: string;
  onSelectScreen?: (screenKey: string) => void;
}

export default function Sidebar({ activeScreen = 'grid-dash', onSelectScreen }: SidebarProps) {
  const { currentTenant } = useTenant();
  const { language, dir, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>('');

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
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0 min-h-screen z-30 font-sans select-none ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      dir={dir}
    >
      {/* 1. SIDEBAR TOP CONTROL HEADER (HAMBURGER & HOME) */}
      <div className="p-3 border-b border-gray-200 flex flex-col gap-2 bg-white">
        <div className="flex items-center justify-between w-full">
          {/* HAMBURGER TOGGLE ICON (☰) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('sales'); }}
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
              <button onClick={() => handleNav('sc-dashboard')} className="w-full text-left p-1.5 hover:text-amber-600 rounded font-medium">Dashboard</button>
              <button onClick={() => handleNav('sales-pos')} className="w-full text-left p-1.5 hover:text-amber-600 rounded font-bold text-amber-700">POS Touch Terminal</button>
              <button onClick={() => handleNav('sc-reports')} className="w-full text-left p-1.5 hover:text-amber-600 rounded">Reports</button>
              <button onClick={() => handleNav('sc-online-orders')} className="w-full text-left p-1.5 hover:text-amber-600 rounded">Online Orders</button>
              <button onClick={() => handleNav('sc-eod')} className="w-full text-left p-1.5 hover:text-amber-600 rounded">End of Day</button>
              <a href="/pos" target="_blank" className="w-full text-left p-1.5 text-amber-600 hover:underline flex items-center gap-1 font-medium">
                <ExternalLink className="w-3 h-3" /> POS Touch App (External)
              </a>

              {/* SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('sales_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-amber-950 bg-amber-50 hover:bg-amber-100 rounded font-bold text-xs"
                >
                  <span>{language === 'ar' ? '⚙️ إعدادات نقطة البيع' : 'Setup'}</span>
                  {expandedGroups['sales_setup'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {expandedGroups['sales_setup'] && (
                  <div className="ml-2 pl-2 border-l border-amber-300 space-y-0.5 mt-0.5 text-xs text-gray-700">
                    <button onClick={() => handleNav('setup-screens')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Screens</button>
                    <button onClick={() => handleNav('setup-payment-types')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Payment Types</button>
                    <button onClick={() => handleNav('setup-coupons')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Coupons and Gift Certificates</button>
                    <button onClick={() => handleNav('setup-discounts')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Discounts</button>
                    <button onClick={() => handleNav('setup-price-modes')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Price Modes</button>
                    <button onClick={() => handleNav('setup-workstations')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Workstations and Printers</button>
                  </div>
                )}
              </div>

              {/* MORE SETUP ACCORDION */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('sales_moresetup')}
                  className="w-full flex items-center justify-between p-1.5 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded font-bold text-xs"
                >
                  <span>{language === 'ar' ? '🛠️ إعدادات متقدمة' : 'More Setup'}</span>
                  {expandedGroups['sales_moresetup'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {expandedGroups['sales_moresetup'] && (
                  <div className="ml-2 pl-2 border-l border-gray-300 space-y-0.5 mt-0.5 text-xs text-gray-700">
                    <button onClick={() => handleNav('more-void')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Void Reasons</button>
                    <button onClick={() => handleNav('more-vat')} className="w-full text-left p-1 hover:text-amber-600 font-medium">VAT Exemptions Reason</button>
                    <button onClick={() => handleNav('more-message')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Message on Invoice</button>
                    <button onClick={() => handleNav('more-zone')} className="w-full text-left p-1 hover:text-amber-600 font-medium">Zone Setup</button>
                    <button onClick={() => handleNav('more-currency')} className="w-full text-left p-1 hover:text-amber-600 font-bold text-amber-700">Currency Setup</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODULE 2: SUPERSONIC FLEET (🔒 PRO) */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('supersonic'); }}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('social'); }}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('op'); }}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('cust'); }}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('acc'); }}
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
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('hr'); }}
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
