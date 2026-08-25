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
            title="إدارة المبيعات ونقطة البيع"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['sales'] ? 'bg-amber-50 text-amber-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
              {isOpen && <span className="truncate">1. إدارة المبيعات (Sales Control)</span>}
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
                  <span>Setup</span>
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
                  <span>More Setup</span>
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
            title="أسطول الشحن والسيارات"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['supersonic'] ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>2. أسطول الشحن (SuperSonic)</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.2 rounded font-bold">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="mr-3 pr-2 border-r border-emerald-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('fleet-map')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">خريطة تتبع الشاحنات Live GPS</button>
              <button onClick={() => handleNav('fleet-km')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">سجل المسافات والعدّاد (KM Logs)</button>
              <button onClick={() => handleNav('fleet-fuel')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">استهلاك الوقود (Fuel Consumption)</button>
              <button onClick={() => handleNav('fleet-maint')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">صيانة المركبات (Maintenance)</button>
              <button onClick={() => handleNav('fleet-playback')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">سجل الرحلات (Route Playback)</button>
              <button onClick={() => handleNav('supersonic-fleet')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded font-medium text-emerald-700">دليل السائقين (Drivers)</button>
              <a href="/supersonic/driver" target="_blank" className="w-full text-right p-1.5 text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                <ExternalLink className="w-3 h-3" /> تطبيق السائق PWA
              </a>
            </div>
          )}
        </div>

        {/* MODULE 3: SOCIAL CRM (🔒 ENT) */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('social'); }}
            title="التواصل الاجتماعي والدعم"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>3. التواصل الاجتماعي (Social CRM)</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-1 py-0.2 rounded font-bold">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="mr-3 pr-2 border-r border-blue-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('social-inbox')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">صندوق الرسائل الموحد (Unified Inbox)</button>
              <button onClick={() => handleNav('social-orders')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">طلبات المنصات (Platform Orders)</button>
              <button onClick={() => handleNav('social-calendar')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">رزنامة المحتوى (Publishing Calendar)</button>
              <button onClick={() => handleNav('social-campaigns')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">الحملات الإعلانية (Ad Campaigns)</button>
              <button onClick={() => handleNav('social-agents')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">فريق الدعم الداخلي (Support Agents)</button>
              <button onClick={() => handleNav('social-distributors')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">دليل الموزعين (Distributors)</button>
            </div>
          )}
        </div>

        {/* MODULE 4: OPERATIONS CENTER & OLIVE PRESSING */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('op'); }}
            title="مركز العمليات والمعاصر"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['op'] ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Factory className="w-4 h-4 text-emerald-700 shrink-0" />
              {isOpen && <span className="truncate">4. مركز العمليات والمعاصر (Operations)</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="mr-3 pr-2 border-r border-emerald-300 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('op-dash')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-medium">لوحة العمليات الرئيسية (Dashboard)</button>
              <button onClick={() => handleNav('oil-pressing')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-bold text-emerald-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> 🫒 معصرة واستلام وإنتاج الزيت
              </button>
              <button onClick={() => handleNav('op-reports')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded">تقارير العمليات والمعصرة (Reports)</button>

              {/* OP ACTIONS */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_actions')}
                  className="w-full flex items-center justify-between p-1 text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 rounded font-medium text-[11px]"
                >
                  <span>⚡ الحركات والعمليات (Actions)</span>
                  {expandedGroups['op_actions'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_actions'] && (
                  <div className="mr-2 pr-1.5 border-r border-emerald-400 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('op-sales')} className="w-full text-right p-1 hover:text-emerald-700">مبيعات الجملة (Sales)</button>
                    <button onClick={() => handleNav('op-quotes')} className="w-full text-right p-1 hover:text-emerald-700">عروض الأسعار (Quotations)</button>
                    <button onClick={() => handleNav('delivery-goods')} className="w-full text-right p-1 hover:text-emerald-700 font-medium text-emerald-800">تسليم البضائع (Delivery of Goods)</button>
                    <button onClick={() => handleNav('op-purchases')} className="w-full text-right p-1 hover:text-emerald-700">المشتريات (Purchases)</button>
                    <button onClick={() => handleNav('op-po')} className="w-full text-right p-1 hover:text-emerald-700">أوامر الشراء (Purchase Orders)</button>
                    <button onClick={() => handleNav('op-reorder')} className="w-full text-right p-1 hover:text-emerald-700">إعادة الطلب (Reorder Guide)</button>
                    <button onClick={() => handleNav('op-transfer')} className="w-full text-right p-1 hover:text-emerald-700">تحويلات المخزون (Transfer)</button>
                    <button onClick={() => handleNav('op-lostgoods')} className="w-full text-right p-1 hover:text-emerald-700">البضائع المفقودة (Lost Goods)</button>
                    <button onClick={() => handleNav('op-bom')} className="w-full text-right p-1 hover:text-emerald-700 font-medium text-purple-700">تجميع المنتجات (BOM Assembly)</button>
                    <button onClick={() => handleNav('op-adjustments')} className="w-full text-right p-1 hover:text-emerald-700">تسويات المخزون (Adjustments)</button>

                    {/* PRODUCT REQUESTS ACCORDION */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_prodreq')}
                        className="w-full flex items-center justify-between p-1 bg-amber-100/70 text-amber-900 rounded font-medium text-[10px]"
                      >
                        <span>📦 طلبات المنتجات</span>
                        {expandedGroups['op_prodreq'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                      </button>
                      {expandedGroups['op_prodreq'] && (
                        <div className="mr-1.5 pr-1 border-r border-amber-400 space-y-0.5 mt-0.5 text-[10px]">
                          <button onClick={() => handleNav('op-prodreq-create')} className="w-full text-right p-0.5 hover:text-amber-800">إنشاء طلب منتج</button>
                          <button onClick={() => handleNav('op-prodreq-manage')} className="w-full text-right p-0.5 hover:text-amber-800">إدارة الطلبات</button>
                          <button onClick={() => handleNav('op-prodreq-prep')} className="w-full text-right p-0.5 hover:text-amber-800">التجهيز والإعداد</button>
                          <button onClick={() => handleNav('op-prodreq-receive')} className="w-full text-right p-0.5 hover:text-amber-800">استلام البضائع</button>
                          <button onClick={() => handleNav('op-prodreq-reject')} className="w-full text-right p-0.5 hover:text-amber-800">أسباب الرفض</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* OP EVENTS */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_events')}
                  className="w-full flex items-center justify-between p-1 text-sky-950 bg-sky-100/70 hover:bg-sky-100 rounded font-medium text-[11px]"
                >
                  <span>🎉 الفعاليات والمناسبات</span>
                  {expandedGroups['op_events'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_events'] && (
                  <div className="mr-2 pr-1.5 border-r border-sky-400 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('op-events-main')} className="w-full text-right p-1 hover:text-sky-700">سجل الفعاليات (Events)</button>
                    <button onClick={() => handleNav('op-events-venues')} className="w-full text-right p-1 hover:text-sky-700">أماكن الفعاليات (Venues)</button>
                    <button onClick={() => handleNav('op-events-resources')} className="w-full text-right p-1 hover:text-sky-700">موارد التجهيز (Resources)</button>
                    <button onClick={() => handleNav('op-events-types')} className="w-full text-right p-1 hover:text-sky-700">أنواع الفعاليات (Types)</button>
                  </div>
                )}
              </div>

              {/* OP SETUP */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_setup')}
                  className="w-full flex items-center justify-between p-1 text-slate-900 bg-slate-200/80 hover:bg-slate-200 rounded font-medium text-[11px]"
                >
                  <span>🛠️ التهيئة والإعداد السريع</span>
                  {expandedGroups['op_setup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_setup'] && (
                  <div className="mr-2 pr-1.5 border-r border-slate-400 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('op-setup-quick')} className="w-full text-right p-1 hover:text-slate-950 font-medium">الإعداد السريع (Quick Setup)</button>
                    <button onClick={() => handleNav('products-services')} className="w-full text-right p-1 hover:text-slate-950">المنتجات والخدمات (Products)</button>
                    <button onClick={() => handleNav('op-setup-groups')} className="w-full text-right p-1 hover:text-slate-950">المجموعات (Groups)</button>
                    <button onClick={() => handleNav('op-setup-divisions')} className="w-full text-right p-1 hover:text-slate-950">الأقسام (Divisions)</button>
                    <button onClick={() => handleNav('op-setup-categories')} className="w-full text-right p-1 hover:text-slate-950">الفئات (Categories)</button>
                    <button onClick={() => handleNav('inventory')} className="w-full text-right p-1 hover:text-slate-950 font-bold text-emerald-800">وحدات القياس والخزانات (Units)</button>
                    <button onClick={() => handleNav('op-setup-locations')} className="w-full text-right p-1 hover:text-slate-950">المواقع والمستودعات (Locations)</button>
                    <button onClick={() => handleNav('op-setup-suppliers')} className="w-full text-right p-1 hover:text-slate-950">دليل الموردين (Suppliers)</button>
                    <button onClick={() => handleNav('op-setup-depts')} className="w-full text-right p-1 hover:text-slate-950">الإدارات (Departments)</button>
                    <button onClick={() => handleNav('op-setup-lostreasons')} className="w-full text-right p-1 hover:text-slate-950">أسباب التلف (Lost Reasons)</button>
                    <button onClick={() => handleNav('op-setup-sizegroups')} className="w-full text-right p-1 hover:text-slate-950">مجموعات المقاسات (Size Groups)</button>
                    <button onClick={() => handleNav('op-setup-sizes')} className="w-full text-right p-1 hover:text-slate-950">المقاسات (Sizes)</button>
                    <button onClick={() => handleNav('op-setup-colors')} className="w-full text-right p-1 hover:text-slate-950">الألوان (Colors)</button>
                    <button onClick={() => handleNav('op-setup-brands')} className="w-full text-right p-1 hover:text-slate-950">العلامات التجارية (Brands)</button>
                    <button onClick={() => handleNav('op-setup-deliveryproviders')} className="w-full text-right p-1 hover:text-slate-950">شركات التوصيل (Delivery Providers)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODULE 5: CUSTOMER MANAGEMENT (CRM) */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('cust'); }}
            title="إدارة العملاء والذمم"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-purple-50 text-purple-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              {isOpen && <span className="truncate">5. إدارة العملاء والذمم (CRM)</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="mr-3 pr-2 border-r border-purple-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('cust-dir')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">دليل حسابات العملاء (Directory)</button>
              <button onClick={() => handleNav('cust-receipts')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">إيصالات المقبوضات (Receipts)</button>
              <button onClick={() => handleNav('cust-aged')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">أعمار ديون العملاء (Aged Debtors)</button>
              <button onClick={() => handleNav('cust-insights')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">تحليلات LTV (Insights)</button>
              <button onClick={() => handleNav('cust-tasks')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">المهام والمواعيد (Tasks)</button>
              <button onClick={() => handleNav('cust-leads')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">الفرص والاتصالات (Leads)</button>
              <button onClick={() => handleNav('cust-performance')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">أداء فريق المبيعات (Performance)</button>

              {/* CRM SETTINGS */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('cust_settings')}
                  className="w-full flex items-center justify-between p-1 text-purple-950 bg-purple-100/70 hover:bg-purple-100 rounded font-medium text-[11px]"
                >
                  <span>⚙️ إعدادات العملاء</span>
                  {expandedGroups['cust_settings'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_settings'] && (
                  <div className="mr-2 pr-1.5 border-r border-purple-300 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('cust-settings-groups')} className="w-full text-right p-1 hover:text-purple-700">مجموعات العملاء (Groups)</button>
                    <button onClick={() => handleNav('cust-settings-categories')} className="w-full text-right p-1 hover:text-purple-700">تصنيفات العملاء (Categories)</button>
                    <button onClick={() => handleNav('cust-settings-tags')} className="w-full text-right p-1 hover:text-purple-700">علامات العملاء (Tags)</button>
                    <button onClick={() => handleNav('cust-settings-lead')} className="w-full text-right p-1 hover:text-purple-700">إعداد الفرص (Lead Setting)</button>
                  </div>
                )}
              </div>

              {/* CRM FEEDBACK */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('cust_feedback')}
                  className="w-full flex items-center justify-between p-1 text-rose-950 bg-rose-100/70 hover:bg-rose-100 rounded font-medium text-[11px]"
                >
                  <span>💬 الشكاوى والاستطلاعات</span>
                  {expandedGroups['cust_feedback'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_feedback'] && (
                  <div className="mr-2 pr-1.5 border-r border-rose-300 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('cust-feedback-dash')} className="w-full text-right p-1 hover:text-rose-700">لوحة الشكاوى (Dashboard)</button>
                    <button onClick={() => handleNav('cust-feedback-manage')} className="w-full text-right p-1 hover:text-rose-700">إدارة الشكاوى (Manage)</button>
                    <button onClick={() => handleNav('cust-feedback-add')} className="w-full text-right p-1 hover:text-rose-700">تسجيل شكوى (Add Complaint)</button>
                    <button onClick={() => handleNav('cust-feedback-surveys')} className="w-full text-right p-1 hover:text-rose-700">استطلاعات الرأي (Surveys)</button>
                    <button onClick={() => handleNav('cust-feedback-emails')} className="w-full text-right p-1 hover:text-rose-700">إرسال الاستطلاعات (Emails)</button>
                  </div>
                )}
              </div>

              {/* CRM LOYALTY */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('cust_loyalty')}
                  className="w-full flex items-center justify-between p-1 text-amber-950 bg-amber-100/80 hover:bg-amber-200 rounded font-medium text-[11px]"
                >
                  <span>🎁 برامج الولاء والنقاط</span>
                  {expandedGroups['cust_loyalty'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_loyalty'] && (
                  <div className="mr-2 pr-1.5 border-r border-amber-400 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('cust-loyalty-dash')} className="w-full text-right p-1 hover:text-amber-800 font-medium">لوحة الولاء (Dashboard)</button>
                    <button onClick={() => handleNav('cust-loyalty-reports')} className="w-full text-right p-1 hover:text-amber-800">تقارير النقاط (Reports)</button>
                    <button onClick={() => handleNav('cust-loyalty-members')} className="w-full text-right p-1 hover:text-amber-800">سجل الأعضاء (Members)</button>
                    <button onClick={() => handleNav('cust-loyalty-levels')} className="w-full text-right p-1 hover:text-amber-800">مستويات الولاء (Levels)</button>
                    <button onClick={() => handleNav('cust-loyalty-programs')} className="w-full text-right p-1 hover:text-amber-800">برامج الولاء (Programs)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODULE 6: ACCOUNTING & FINANCE */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('acc'); }}
            title="المحاسبة والمالية"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-indigo-50 text-indigo-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              {isOpen && <span className="truncate">6. المحاسبة والمالية (Accounting)</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="mr-3 pr-2 border-r border-indigo-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('acc-dash')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded font-medium">لوحة المحاسبة (Dashboard)</button>
              <button onClick={() => handleNav('acc-reports')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">القوائم والتقارير (P&L, Balance Sheet)</button>

              {/* ACC ACTIONS */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('acc_actions')}
                  className="w-full flex items-center justify-between p-1 text-indigo-950 bg-indigo-100/70 hover:bg-indigo-100 rounded font-medium text-[11px]"
                >
                  <span>📜 السندات والحركات</span>
                  {expandedGroups['acc_actions'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['acc_actions'] && (
                  <div className="mr-2 pr-1.5 border-r border-indigo-300 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('acc-jv')} className="w-full text-right p-1 hover:text-indigo-700 font-medium text-indigo-800">سندات اليومية (JV Journal Voucher)</button>
                    <button onClick={() => handleNav('acc-purchases')} className="w-full text-right p-1 hover:text-indigo-700">فواتير المشتريات (Purchases)</button>
                    <button onClick={() => handleNav('acc-payments')} className="w-full text-right p-1 hover:text-indigo-700">سندات الصرف (Payments)</button>
                    <button onClick={() => handleNav('acc-receipts')} className="w-full text-right p-1 hover:text-indigo-700">سندات القبض (Receipts)</button>
                    <button onClick={() => handleNav('acc-ar')} className="w-full text-right p-1 hover:text-indigo-700">ذمم العملاء المدينة (AR)</button>
                    <button onClick={() => handleNav('acc-ap')} className="w-full text-right p-1 hover:text-indigo-700">ذمم الموردين الدائنة (AP)</button>
                    <button onClick={() => handleNav('acc-rec')} className="w-full text-right p-1 hover:text-indigo-700">مطابقة الحسابات البنكية (Bank Rec)</button>
                    <button onClick={() => handleNav('acc-vat')} className="w-full text-right p-1 hover:text-indigo-700 font-medium">إغلاق ضريبة T.V.A (VAT Closing)</button>
                  </div>
                )}
              </div>

              {/* ACC SETUP */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('acc_setup')}
                  className="w-full flex items-center justify-between p-1 text-slate-900 bg-slate-200/80 hover:bg-slate-200 rounded font-medium text-[11px]"
                >
                  <span>🌳 شجرة الحسابات والتهيئة</span>
                  {expandedGroups['acc_setup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['acc_setup'] && (
                  <div className="mr-2 pr-1.5 border-r border-slate-400 space-y-0.5 mt-0.5 text-[11px] text-gray-700">
                    <button onClick={() => handleNav('acc-coa')} className="w-full text-right p-1 hover:text-slate-950 font-medium text-slate-900">شجرة الحسابات العامة (COA)</button>
                    <button onClick={() => handleNav('acc-aux-classes')} className="w-full text-right p-1 hover:text-slate-950">تصنيفات الحسابات (Account Classes)</button>
                    <button onClick={() => handleNav('acc-aux-rates')} className="w-full text-right p-1 hover:text-slate-950">أسعار الصرف (Currency Rates)</button>
                    <button onClick={() => handleNav('acc-deptsetup-depts')} className="w-full text-right p-1 hover:text-slate-950">مراكز التكلفة (Cost Centers)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODULE 7: HUMAN RESOURCES & PAYROLL */}
        <div>
          <button
            onClick={() => { if (!isOpen) setIsOpen(true); toggleGroup('hr'); }}
            title="الموارد البشرية والرواتب"
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-rose-50 text-rose-900 font-medium' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
              {isOpen && <span className="truncate">7. الموارد البشرية والرواتب (HR)</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="mr-3 pr-2 border-r border-rose-200 space-y-0.5 mt-1 text-xs">
              <button onClick={() => handleNav('hr-overview')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">جدول دوام الموظفين (Schedule)</button>
              <button onClick={() => handleNav('hr-dir')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">سجل الموظفين (Directory)</button>
              <button onClick={() => handleNav('hr-payroll-dash')} className="w-full text-right p-1.5 hover:text-rose-600 rounded font-medium text-rose-700">مسير الرواتب والأجور (Payroll)</button>
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
            {isOpen && <span>إعدادات الشعار والترخيص</span>}
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
          <p className="text-amber-600 font-bold">{currentTenant.brandNameAr || 'منتوجات زيت وزيتون الجنوب SARL'}</p>
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
