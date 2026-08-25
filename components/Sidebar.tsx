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
  UserCog
} from 'lucide-react';

import { useTenant } from '@/lib/TenantContext';
import TenantSettingsModal from './TenantSettingsModal';

interface SidebarProps {
  activeScreen?: string;
  onSelectScreen?: (screenKey: string) => void;
}

export default function Sidebar({ activeScreen = 'grid-dash', onSelectScreen }: SidebarProps) {
  const { currentTenant } = useTenant();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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
      className={`bg-white border-e border-gray-200 transition-all duration-300 flex flex-col shrink-0 min-h-screen z-30 ${
        isOpen ? 'w-72' : 'w-16'
      }`}
    >
      {/* SIDEBAR HEADER / TOGGLE BAR */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
        {isOpen ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                <img
                  src={currentTenant.logoUrl || '/assets/images/vanguard_logo.png'}
                  alt={currentTenant.brandNameAr || 'Company Logo'}
                  className="w-full h-full object-cover rounded"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/assets/images/vanguard_logo.png';
                  }}
                />
              </div>
              <span className="font-black text-xs text-gray-900 tracking-tight truncate">
                {currentTenant.brandNameAr || currentTenant.name || 'Vanguard ERP'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleNav('grid-dash')}
                title="الرئيسية (Home Dashboard)"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-amber-600 transition-colors"
              >
                <Home className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="إغلاق القائمة"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={() => setIsOpen(true)}
              title="فتح القائمة"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 transition-colors shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNav('grid-dash')}
              title="الرئيسية (Home Dashboard)"
              className="p-2 hover:bg-amber-50 rounded-xl text-amber-600 transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* SIDEBAR NAVIGATION ITEMS ACCORDION */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs dir-rtl font-semibold text-gray-700">
        
        {/* 1. SALES CONTROL */}
        <div>
          <button
            onClick={() => toggleGroup('sales')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['sales'] ? 'bg-amber-50 text-amber-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
              {isOpen && <span className="font-bold">1. إدارة المبيعات (Sales Control)</span>}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="mr-3 pr-2 border-r-2 border-amber-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('sales-dash')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">لوحة تحكم المبيعات (Dashboard)</button>
              <button onClick={() => handleNav('sales-pos')} className="w-full text-right p-1.5 hover:text-amber-600 rounded font-bold text-amber-700">نقطة البيع الكاشير (POS Terminal)</button>
              <button onClick={() => handleNav('sales-reports')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">تقارير المبيعات (Reports)</button>
              <button onClick={() => handleNav('sales-online')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">الطلبيات الإلكترونية (Online Orders)</button>
              <button onClick={() => handleNav('sales-eod')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">إغلاق الصندوق (End of Day Z-Report)</button>
              <a href="/pos" target="_blank" className="w-full text-right p-1.5 text-amber-600 hover:underline flex items-center gap-1 font-bold">
                <ExternalLink className="w-3 h-3" /> تطبيق POS Touch المباشر (External)
              </a>

              {/* SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('sales_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-amber-900 bg-amber-100/60 hover:bg-amber-100 rounded-lg font-bold"
                >
                  <span>⚙️ إعدادات نقطة البيع (Setup)</span>
                  {expandedGroups['sales_setup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['sales_setup'] && (
                  <div className="mr-3 pr-2 border-r border-amber-300 space-y-1 mt-1 text-[10px] text-gray-600">
                    <button onClick={() => handleNav('sales-setup-screen')} className="w-full text-right p-1 hover:text-amber-700 rounded">تنسيق الشاشات (Screen Config)</button>
                    <button onClick={() => handleNav('sales-setup-payment')} className="w-full text-right p-1 hover:text-amber-700 rounded">أنواع الدفع (Payment Types)</button>
                    <button onClick={() => handleNav('sales-setup-coupons')} className="w-full text-right p-1 hover:text-amber-700 rounded">الكوبونات والقسائم (Coupons)</button>
                    <button onClick={() => handleNav('sales-setup-discounts')} className="w-full text-right p-1 hover:text-amber-700 rounded">الخصومات (Discounts)</button>
                    <button onClick={() => handleNav('sales-setup-pricemodes')} className="w-full text-right p-1 hover:text-amber-700 rounded">أنماط الأسعار (Price Modes)</button>
                    <button onClick={() => handleNav('sales-setup-workstations')} className="w-full text-right p-1 hover:text-amber-700 rounded">محطات العمل والطابعات (Workstations)</button>
                  </div>
                )}
              </div>

              {/* MORE SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('sales_moresetup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  <span>🛠️ إعدادات متقدمة (More Setup)</span>
                  {expandedGroups['sales_moresetup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['sales_moresetup'] && (
                  <div className="mr-3 pr-2 border-r border-slate-300 space-y-1 mt-1 text-[10px] text-gray-600">
                    <button onClick={() => handleNav('sales-moresetup-voidreasons')} className="w-full text-right p-1 hover:text-amber-700 rounded">أسباب الإلغاء (Void Reasons)</button>
                    <button onClick={() => handleNav('sales-moresetup-vatexempt')} className="w-full text-right p-1 hover:text-amber-700 rounded">أسباب الإعفاء الضريبي (VAT Exemption)</button>
                    <button onClick={() => handleNav('sales-moresetup-invoicemsg')} className="w-full text-right p-1 hover:text-amber-700 rounded">رسالة الفاتورة (Message on Invoice)</button>
                    <button onClick={() => handleNav('sales-moresetup-zonesetup')} className="w-full text-right p-1 hover:text-amber-700 rounded">توزيع المناطق (Zone Setup)</button>
                    <button onClick={() => handleNav('sales-moresetup-currencysetup')} className="w-full text-right p-1 hover:text-amber-700 rounded">تهيئة العملات (Currency Setup)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. SUPERSONIC FLEET & LOGISTICS (🔒 PRO TIER LOCK) */}
        <div>
          <button
            onClick={() => toggleGroup('supersonic')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['supersonic'] ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {isOpen && (
                <span className="font-bold flex items-center gap-1.5 truncate" title="ميزة مدفوعة - ترقية باقة المحترفين">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>2. أسطول الشحن (SuperSonic Fleet)</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-black border border-amber-300 shrink-0">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="mr-3 pr-2 border-r-2 border-emerald-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('fleet-map')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded flex items-center justify-between">
                <span>خريطة تتبع الشاحنات Live GPS</span>
                <span className="text-[9px] text-emerald-600 font-bold">📡 Live</span>
              </button>
              <button onClick={() => handleNav('fleet-km')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">سجل المسافات والعداد (KM Logs & Mileage)</button>
              <button onClick={() => handleNav('fleet-fuel')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">استهلاك الوقود والتعبئة (Fuel Consumption)</button>
              <button onClick={() => handleNav('fleet-maint')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">صيانة وخدمة المركبات (Maintenance)</button>
              <button onClick={() => handleNav('fleet-playback')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">سجل الرحلات وإعادة التشغيل (Route Playback)</button>
              <button onClick={() => handleNav('supersonic-fleet')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded font-bold text-emerald-700">دليل السائقين والخدمات (Drivers Directory)</button>
              <a href="/supersonic/driver" target="_blank" className="w-full text-right p-1.5 text-emerald-600 hover:underline flex items-center gap-1 font-bold">
                <ExternalLink className="w-3 h-3" /> تطبيق السائق (Driver PWA)
              </a>
            </div>
          )}
        </div>

        {/* 3. SOCIAL MEDIA MANAGEMENT (🔒 ENTERPRISE TIER LOCK) */}
        <div>
          <button
            onClick={() => toggleGroup('social')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['social'] ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
              {isOpen && (
                <span className="font-bold flex items-center gap-1.5 truncate" title="ميزة مدفوعة - باقة المؤسسات">
                  <Lock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>3. التواصل الاجتماعي (Social CRM)</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-black border border-blue-300 shrink-0">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="mr-3 pr-2 border-r-2 border-blue-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('social-inbox')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">صندوق الرسائل الموحد (Unified Inbox)</button>
              <button onClick={() => handleNav('social-orders')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">طلبات منصات التواصل (Platform Orders)</button>
              <button onClick={() => handleNav('social-calendar')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">رزنامة المحتوى والنشر (Publishing Calendar)</button>
              <button onClick={() => handleNav('social-campaigns')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">الحملات الإعلانية وتكلفة الليد (Ad Campaigns)</button>
              <button onClick={() => handleNav('social-agents')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">فريق الدعم الداخلي (Internal Support Agents)</button>
              <button onClick={() => handleNav('social-distributors')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">دليل الموزعين الخارجيين (Distributors Directory)</button>
            </div>
          )}
        </div>

        {/* 4. OPERATIONS CENTER & OLIVE PRESSING */}
        <div>
          <button
            onClick={() => toggleGroup('op')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['op'] ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Factory className="w-4 h-4 text-emerald-700 shrink-0" />
              {isOpen && <span className="font-bold">4. مركز العمليات والمعاصر (Operations)</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="mr-3 pr-2 border-r-2 border-emerald-300 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('op-dash')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-bold">لوحة العمليات الرئيسية (Dashboard)</button>
              <button onClick={() => handleNav('oil-pressing')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-black text-emerald-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> 🫒 معصرة واستلام وإنتاج الزيت (Oil Press & Acidity %)
              </button>
              <button onClick={() => handleNav('op-reports')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded">تقارير العمليات والمعصرة (Reports)</button>

              {/* ACTIONS ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('op_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 rounded-lg font-bold"
                >
                  <span>⚡ الحركات والعمليات (Actions)</span>
                  {expandedGroups['op_actions'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_actions'] && (
                  <div className="mr-3 pr-2 border-r border-emerald-400 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('op-sales')} className="w-full text-right p-1 hover:text-emerald-700 rounded">مبيعات الجملة (Sales)</button>
                    <button onClick={() => handleNav('op-quotes')} className="w-full text-right p-1 hover:text-emerald-700 rounded">عروض الأسعار (Quotations)</button>
                    <button onClick={() => handleNav('delivery-goods')} className="w-full text-right p-1 hover:text-emerald-700 rounded font-bold text-emerald-800">تسليم البضائع (Delivery of Goods)</button>
                    <button onClick={() => handleNav('op-purchases')} className="w-full text-right p-1 hover:text-emerald-700 rounded">المشتريات (Purchases)</button>
                    <button onClick={() => handleNav('op-po')} className="w-full text-right p-1 hover:text-emerald-700 rounded">أوامر الشراء (Purchase Orders)</button>
                    <button onClick={() => handleNav('op-reorder')} className="w-full text-right p-1 hover:text-emerald-700 rounded">دليل إعادة الطلب (Reorder Guide)</button>
                    <button onClick={() => handleNav('op-transfer')} className="w-full text-right p-1 hover:text-emerald-700 rounded">تحويلات المخزون (Transfer)</button>
                    <button onClick={() => handleNav('op-lostgoods')} className="w-full text-right p-1 hover:text-emerald-700 rounded">البضائع المفقودة والتالفة (Lost Goods)</button>
                    <button onClick={() => handleNav('op-bom')} className="w-full text-right p-1 hover:text-emerald-700 rounded font-bold text-purple-700">تجميع المنتجات (Item Assembly BOM)</button>
                    <button onClick={() => handleNav('op-adjustments')} className="w-full text-right p-1 hover:text-emerald-700 rounded">تسويات المخزون (Adjustments)</button>

                    {/* NESTED PRODUCT REQUESTS ACCORDION */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('op_prodreq')}
                        className="w-full flex items-center justify-between p-1 bg-amber-100/70 text-amber-900 rounded font-bold"
                      >
                        <span>📦 طلبات المنتجات (Product Requests)</span>
                        {expandedGroups['op_prodreq'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                      </button>
                      {expandedGroups['op_prodreq'] && (
                        <div className="mr-2 pr-1 border-r border-amber-400 space-y-0.5 mt-0.5 text-[9.5px]">
                          <button onClick={() => handleNav('op-prodreq-create')} className="w-full text-right p-1 hover:text-amber-800">إنشاء طلب منتج (Product Request)</button>
                          <button onClick={() => handleNav('op-prodreq-manage')} className="w-full text-right p-1 hover:text-amber-800">إدارة الطلبات (Manage Requests)</button>
                          <button onClick={() => handleNav('op-prodreq-prep')} className="w-full text-right p-1 hover:text-amber-800">التجهيز والإعداد (Preparation)</button>
                          <button onClick={() => handleNav('op-prodreq-receive')} className="w-full text-right p-1 hover:text-amber-800">استلام البضائع (Receiving Goods)</button>
                          <button onClick={() => handleNav('op-prodreq-reject')} className="w-full text-right p-1 hover:text-amber-800">أسباب الرفض (Reject Reasons)</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* EVENTS ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('op_events')}
                  className="w-full flex items-center justify-between p-1.5 text-sky-950 bg-sky-100/70 hover:bg-sky-100 rounded-lg font-bold"
                >
                  <span>🎉 الفعاليات والمناسبات (Events)</span>
                  {expandedGroups['op_events'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_events'] && (
                  <div className="mr-3 pr-2 border-r border-sky-400 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('op-events-main')} className="w-full text-right p-1 hover:text-sky-700 rounded">سجل الفعاليات (Events)</button>
                    <button onClick={() => handleNav('op-events-venues')} className="w-full text-right p-1 hover:text-sky-700 rounded">أماكن الفعاليات (Event Venues)</button>
                    <button onClick={() => handleNav('op-events-resources')} className="w-full text-right p-1 hover:text-sky-700 rounded">موارد التجهيز (Event Resources)</button>
                    <button onClick={() => handleNav('op-events-types')} className="w-full text-right p-1 hover:text-sky-700 rounded">أنواع الفعاليات (Event Types)</button>
                  </div>
                )}
              </div>

              {/* SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('op_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-[#1c2b1a] bg-[#e2e8f0] hover:bg-[#cbd5e1] rounded-lg font-bold"
                >
                  <span>🛠️ التهيئة والتهيئة السريعة (Setup)</span>
                  {expandedGroups['op_setup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['op_setup'] && (
                  <div className="mr-3 pr-2 border-r border-slate-400 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('op-setup-quick')} className="w-full text-right p-1 hover:text-slate-900 font-bold rounded">الإعداد السريع (Quick Setup)</button>
                    <button onClick={() => handleNav('products-services')} className="w-full text-right p-1 hover:text-slate-900 rounded">المنتجات والخدمات (Products & Services)</button>
                    <button onClick={() => handleNav('op-setup-groups')} className="w-full text-right p-1 hover:text-slate-900 rounded">المجموعات (Groups)</button>
                    <button onClick={() => handleNav('op-setup-divisions')} className="w-full text-right p-1 hover:text-slate-900 rounded">الأقسام (Divisions)</button>
                    <button onClick={() => handleNav('op-setup-categories')} className="w-full text-right p-1 hover:text-slate-900 rounded">الفئات (Categories)</button>
                    <button onClick={() => handleNav('inventory')} className="w-full text-right p-1 hover:text-slate-900 font-bold rounded text-emerald-800">وحدات القياس الخزانات (Units)</button>
                    <button onClick={() => handleNav('op-setup-locations')} className="w-full text-right p-1 hover:text-slate-900 rounded">المواقع والمستودعات (Locations)</button>
                    <button onClick={() => handleNav('op-setup-suppliers')} className="w-full text-right p-1 hover:text-slate-900 rounded">الموردين (Suppliers)</button>
                    <button onClick={() => handleNav('op-setup-depts')} className="w-full text-right p-1 hover:text-slate-900 rounded">الإدارات (Departments)</button>
                    <button onClick={() => handleNav('op-setup-lostreasons')} className="w-full text-right p-1 hover:text-slate-900 rounded">أسباب التلف (Lost Goods Reasons)</button>
                    <button onClick={() => handleNav('op-setup-sizegroups')} className="w-full text-right p-1 hover:text-slate-900 rounded">مجموعات المقاسات (Size Groups)</button>
                    <button onClick={() => handleNav('op-setup-sizes')} className="w-full text-right p-1 hover:text-slate-900 rounded">المقاسات (Sizes)</button>
                    <button onClick={() => handleNav('op-setup-colors')} className="w-full text-right p-1 hover:text-slate-900 rounded">الألوان (Colors)</button>
                    <button onClick={() => handleNav('op-setup-brands')} className="w-full text-right p-1 hover:text-slate-900 rounded">العلامات التجارية (Brands)</button>
                    <button onClick={() => handleNav('op-setup-deliveryproviders')} className="w-full text-right p-1 hover:text-slate-900 rounded">شركات التوصيل (Delivery Providers)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. CUSTOMER MANAGEMENT (CRM & FEEDBACK) */}
        <div>
          <button
            onClick={() => toggleGroup('cust')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['cust'] ? 'bg-purple-50 text-purple-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              {isOpen && <span className="font-bold">5. إدارة العملاء والذمم (CRM)</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="mr-3 pr-2 border-r-2 border-purple-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('cust-dir')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">دليل حسابات العملاء (Customers Directory)</button>
              <button onClick={() => handleNav('cust-receipts')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">إيصالات المقبوضات (Customer Receipts)</button>
              <button onClick={() => handleNav('cust-aged')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">أعمار ديون العملاء (Aged Debtors)</button>
              <button onClick={() => handleNav('cust-insights')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">تحليلات القيمة (Customer Insights & LTV)</button>
              <button onClick={() => handleNav('cust-tasks')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">المهام والمواعيد (Tasks & Appointments)</button>
              <button onClick={() => handleNav('cust-leads')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">الفرص والاتصالات (Leads & Contacts)</button>
              <button onClick={() => handleNav('cust-performance')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">أداء فريق المبيعات (Sales Performance)</button>

              {/* CRM SETTING ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('cust_settings')}
                  className="w-full flex items-center justify-between p-1.5 text-purple-950 bg-purple-100/70 hover:bg-purple-100 rounded-lg font-bold"
                >
                  <span>⚙️ إعدادات العملاء (Settings)</span>
                  {expandedGroups['cust_settings'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_settings'] && (
                  <div className="mr-3 pr-2 border-r border-purple-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('cust-settings-groups')} className="w-full text-right p-1 hover:text-purple-700">مجموعات العملاء (Customer Groups)</button>
                    <button onClick={() => handleNav('cust-settings-categories')} className="w-full text-right p-1 hover:text-purple-700">تصنيفات العملاء (Categories)</button>
                    <button onClick={() => handleNav('cust-settings-tags')} className="w-full text-right p-1 hover:text-purple-700">الوسوم والبطاقات (Tags)</button>
                    <button onClick={() => handleNav('cust-settings-lead')} className="w-full text-right p-1 hover:text-purple-700">إعداد الفرص (Lead Setting)</button>
                  </div>
                )}
              </div>

              {/* FEEDBACK ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('cust_feedback')}
                  className="w-full flex items-center justify-between p-1.5 text-rose-950 bg-rose-100/70 hover:bg-rose-100 rounded-lg font-bold"
                >
                  <span>💬 الشكاوى والاستطلاعات (Feedback)</span>
                  {expandedGroups['cust_feedback'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_feedback'] && (
                  <div className="mr-3 pr-2 border-r border-rose-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('cust-feedback-dash')} className="w-full text-right p-1 hover:text-rose-700">لوحة الشكاوى (Dashboard)</button>
                    <button onClick={() => handleNav('cust-feedback-manage')} className="w-full text-right p-1 hover:text-rose-700">إدارة الشكاوى (Manage Complaints)</button>
                    <button onClick={() => handleNav('cust-feedback-add')} className="w-full text-right p-1 hover:text-rose-700">تسجيل شكوى (Add Complaint)</button>
                    <button onClick={() => handleNav('cust-feedback-surveys')} className="w-full text-right p-1 hover:text-rose-700">استطلاعات الرأي (Manage Surveys)</button>
                    <button onClick={() => handleNav('cust-feedback-emails')} className="w-full text-right p-1 hover:text-rose-700">إرسال الاستطلاعات (Send Emails)</button>

                    {/* NESTED FEEDBACK SETUP */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('cust_feedback_setup')}
                        className="w-full flex items-center justify-between p-1 bg-rose-200/60 text-rose-950 rounded font-bold"
                      >
                        <span>🛠️ تهيئة الشكاوى (Feedback Setup)</span>
                        {expandedGroups['cust_feedback_setup'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                      </button>
                      {expandedGroups['cust_feedback_setup'] && (
                        <div className="mr-2 pr-1 border-r border-rose-400 space-y-0.5 mt-0.5 text-[9.5px]">
                          <button onClick={() => handleNav('cust-feedback-resources')} className="w-full text-right p-1 hover:text-rose-900">مصادر الشكاوى (Complaint Resources)</button>
                          <button onClick={() => handleNav('cust-feedback-cat')} className="w-full text-right p-1 hover:text-rose-900">التصنيفات (Categories)</button>
                          <button onClick={() => handleNav('cust-feedback-actions')} className="w-full text-right p-1 hover:text-rose-900">أنواع الإجراءات (Action Types)</button>
                          <button onClick={() => handleNav('cust-feedback-care')} className="w-full text-right p-1 hover:text-rose-900">العناية بالعملاء (Complaint Care)</button>
                          <button onClick={() => handleNav('cust-feedback-surveysetup')} className="w-full text-right p-1 hover:text-rose-900">إعداد الاستطلاعات (Survey Setup)</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LOYALTY MANAGEMENT ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('cust_loyalty')}
                  className="w-full flex items-center justify-between p-1.5 text-amber-950 bg-amber-100/80 hover:bg-amber-200 rounded-lg font-bold"
                >
                  <span>🎁 برامج الولاء والخصومات (Loyalty)</span>
                  {expandedGroups['cust_loyalty'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['cust_loyalty'] && (
                  <div className="mr-3 pr-2 border-r border-amber-400 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('cust-loyalty-dash')} className="w-full text-right p-1 hover:text-amber-800 font-bold">لوحة الولاء (Dashboard)</button>
                    <button onClick={() => handleNav('cust-loyalty-reports')} className="w-full text-right p-1 hover:text-amber-800">تقارير النقاط (Reports)</button>
                    <button onClick={() => handleNav('cust-loyalty-members')} className="w-full text-right p-1 hover:text-amber-800">سجل الأعضاء (Members)</button>
                    <button onClick={() => handleNav('cust-loyalty-levels')} className="w-full text-right p-1 hover:text-amber-800">مستويات الولاء (Loyalty Levels)</button>
                    <button onClick={() => handleNav('cust-loyalty-programs')} className="w-full text-right p-1 hover:text-amber-800">برامج وتحديات النقاط (Programs)</button>
                    <button onClick={() => handleNav('cust-loyalty-msg')} className="w-full text-right p-1 hover:text-amber-800">إرسال الرسائل الترويجية (Send Messages)</button>
                    <button onClick={() => handleNav('cust-loyalty-company')} className="w-full text-right p-1 hover:text-amber-800">بيانات البرنامج (Company Info)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 6. ACCOUNTING & FINANCE */}
        <div>
          <button
            onClick={() => toggleGroup('acc')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['acc'] ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              {isOpen && <span className="font-bold">6. المحاسبة والمالية (Accounting)</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="mr-3 pr-2 border-r-2 border-indigo-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('acc-dash')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded font-bold">لوحة النظام المحاسبي (Dashboard)</button>
              <button onClick={() => handleNav('acc-reports')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">القوائم والتقارير المالي (GL, Trial Balance, P&L, Balance Sheet)</button>

              {/* ACCOUNTING ACTIONS ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('acc_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-indigo-950 bg-indigo-100/70 hover:bg-indigo-100 rounded-lg font-bold"
                >
                  <span>📜 السندات والحركات (Actions)</span>
                  {expandedGroups['acc_actions'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['acc_actions'] && (
                  <div className="mr-3 pr-2 border-r border-indigo-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('acc-jv')} className="w-full text-right p-1 hover:text-indigo-700 font-bold text-indigo-800">سندات اليومية (Journal Voucher JV)</button>
                    <button onClick={() => handleNav('acc-purchases')} className="w-full text-right p-1 hover:text-indigo-700">فواتير المشتريات (Purchases)</button>
                    <button onClick={() => handleNav('acc-payments')} className="w-full text-right p-1 hover:text-indigo-700">سندات الصرف والمدفوعات (Payments)</button>
                    <button onClick={() => handleNav('acc-receipts')} className="w-full text-right p-1 hover:text-indigo-700">سندات القبض (Receipts)</button>
                    <button onClick={() => handleNav('acc-ar')} className="w-full text-right p-1 hover:text-indigo-700">ذمم العملاء المدينة (Accounts Receivables)</button>
                    <button onClick={() => handleNav('acc-ap')} className="w-full text-right p-1 hover:text-indigo-700">ذمم الموردين الدائنة (Accounts Payables)</button>
                    <button onClick={() => handleNav('acc-rec')} className="w-full text-right p-1 hover:text-indigo-700">مطابقة الحسابات البنكية (Bank Reconciliation)</button>
                    <button onClick={() => handleNav('acc-vat')} className="w-full text-right p-1 hover:text-indigo-700 font-bold">إغلاق فترة ضريبة T.V.A (VAT Period Closing)</button>
                  </div>
                )}
              </div>

              {/* ACCOUNTING SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('acc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-900 bg-slate-200/80 hover:bg-slate-200 rounded-lg font-bold"
                >
                  <span>🌳 شجرة الحسابات والتهيئة (Setup)</span>
                  {expandedGroups['acc_setup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['acc_setup'] && (
                  <div className="mr-3 pr-2 border-r border-slate-400 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('acc-coa')} className="w-full text-right p-1 hover:text-slate-950 font-bold text-slate-900">شجرة الحسابات العامة (Chart of Accounts COA)</button>

                    {/* NESTED ACCOUNT AUXILIARIES */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('acc_aux')}
                        className="w-full flex items-center justify-between p-1 bg-slate-100 text-slate-900 rounded font-bold"
                      >
                        <span>📁 ملحقات الحسابات (Account Auxiliaries)</span>
                        {expandedGroups['acc_aux'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                      </button>
                      {expandedGroups['acc_aux'] && (
                        <div className="mr-2 pr-1 border-r border-slate-300 space-y-0.5 mt-0.5 text-[9.5px]">
                          <button onClick={() => handleNav('acc-aux-classes')} className="w-full text-right p-1 hover:text-slate-950">تصنيفات الحسابات (Account Classes)</button>
                          <button onClick={() => handleNav('acc-aux-headers')} className="w-full text-right p-1 hover:text-slate-950">المستويات القيادية 1-3 (Headers 1-3)</button>
                          <button onClick={() => handleNav('acc-aux-groups')} className="w-full text-right p-1 hover:text-slate-950">مجموعات الحسابات (Account Groups)</button>
                          <button onClick={() => handleNav('acc-aux-jvdesc')} className="w-full text-right p-1 hover:text-slate-950">شروحات القيد النمطية (JV Description)</button>
                          <button onClick={() => handleNav('acc-aux-jvtypes')} className="w-full text-right p-1 hover:text-slate-950">أنواع سندات اليومية (JV Types)</button>
                          <button onClick={() => handleNav('acc-aux-currency')} className="w-full text-right p-1 hover:text-slate-950">العملات (Currency)</button>
                          <button onClick={() => handleNav('acc-aux-rates')} className="w-full text-right p-1 hover:text-slate-950">أسعار الصرف اليومية (Currency Rates)</button>
                        </div>
                      )}
                    </div>

                    {/* NESTED DEPARTMENT SETUP */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('acc_deptsetup')}
                        className="w-full flex items-center justify-between p-1 bg-indigo-100/60 text-indigo-950 rounded font-bold"
                      >
                        <span>🏢 مراكز التكلفة والتقرير (Department Setup)</span>
                        {expandedGroups['acc_deptsetup'] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                      </button>
                      {expandedGroups['acc_deptsetup'] && (
                        <div className="mr-2 pr-1 border-r border-indigo-300 space-y-0.5 mt-0.5 text-[9.5px]">
                          <button onClick={() => handleNav('acc-deptsetup-groups')} className="w-full text-right p-1 hover:text-indigo-900">مجموعات المراكز (Department Groups)</button>
                          <button onClick={() => handleNav('acc-deptsetup-depts')} className="w-full text-right p-1 hover:text-indigo-900">مراكز التكلفة (Department)</button>
                          <button onClick={() => handleNav('acc-deptsetup-cashflow')} className="w-full text-right p-1 hover:text-indigo-900">إعداد التدفقات النقدية (Cash Flow Setup)</button>
                          <button onClick={() => handleNav('acc-deptsetup-subdepts')} className="w-full text-right p-1 hover:text-indigo-900">الأقسام الفرعية (Sub Department)</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 7. HUMAN RESOURCES & PAYROLL */}
        <div>
          <button
            onClick={() => toggleGroup('hr')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['hr'] ? 'bg-rose-50 text-rose-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
              {isOpen && <span className="font-bold">7. الموارد البشرية والرواتب (HR)</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="mr-3 pr-2 border-r-2 border-rose-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('hr-overview')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">جدول دوام الموظفين (Schedule Overview)</button>
              <button onClick={() => handleNav('hr-dir')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">سجل الموظفين والكادر (Personnel Directory)</button>
              <button onClick={() => handleNav('hr-schedules')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">مناوبات وجداول العمل (Schedules)</button>

              {/* ORGANIZATION SETUP ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('hr_orgsetup')}
                  className="w-full flex items-center justify-between p-1.5 text-rose-950 bg-rose-100/70 hover:bg-rose-100 rounded-lg font-bold"
                >
                  <span>🏢 الهيكل التنظيمي (Organization Setup)</span>
                  {expandedGroups['hr_orgsetup'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['hr_orgsetup'] && (
                  <div className="mr-3 pr-2 border-r border-rose-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('hr-orgsetup-depts')} className="w-full text-right p-1 hover:text-rose-700">الإدارات والأقسام (Internal Departments)</button>
                    <button onClick={() => handleNav('hr-orgsetup-designations')} className="w-full text-right p-1 hover:text-rose-700">المسميات الوظيفية (Designations)</button>
                    <button onClick={() => handleNav('hr-orgsetup-permissions')} className="w-full text-right p-1 hover:text-rose-700 font-bold">صلاحيات الموظفين والكاشير (POS Permissions)</button>
                  </div>
                )}
              </div>

              {/* TIME & ATTENDANCE ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('hr_attendance')}
                  className="w-full flex items-center justify-between p-1.5 text-sky-950 bg-sky-100/70 hover:bg-sky-100 rounded-lg font-bold"
                >
                  <span>⏱️ الحضور والإجازات (Time & Attendance)</span>
                  {expandedGroups['hr_attendance'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['hr_attendance'] && (
                  <div className="mr-3 pr-2 border-r border-sky-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('hr-timeoff')} className="w-full text-right p-1 hover:text-sky-700">طلبات الإجازات (Time Off Requests)</button>
                    <button onClick={() => handleNav('hr-scheduletemplates')} className="w-full text-right p-1 hover:text-sky-700">قوالب المناوبات (Schedule Templates)</button>
                    <button onClick={() => handleNav('hr-timeoffreasons')} className="w-full text-right p-1 hover:text-sky-700">تصنيفات الإجازات (Time Off Reasons)</button>
                    <button onClick={() => handleNav('hr-attendancesummary')} className="w-full text-right p-1 hover:text-sky-700">ملخص الحضور (Attendance Summary)</button>
                    <button onClick={() => handleNav('hr-attendancelog')} className="w-full text-right p-1 hover:text-sky-700 font-bold">سجل البصمة والدوام (Attendance Log)</button>
                  </div>
                )}
              </div>

              {/* PAYROLL ACCORDION */}
              <div className="pt-1">
                <button
                  onClick={() => toggleGroup('hr_payroll')}
                  className="w-full flex items-center justify-between p-1.5 text-amber-950 bg-amber-100/70 hover:bg-amber-100 rounded-lg font-bold"
                >
                  <span>💵 مسير الرواتب (Payroll)</span>
                  {expandedGroups['hr_payroll'] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedGroups['hr_payroll'] && (
                  <div className="mr-3 pr-2 border-r border-amber-300 space-y-1 mt-1 text-[10px] text-gray-700">
                    <button onClick={() => handleNav('hr-payroll-dash')} className="w-full text-right p-1 hover:text-amber-800 font-bold">لوحة مسير الرواتب (Payroll Dashboard)</button>
                    <button onClick={() => handleNav('hr-payroll-payslips')} className="w-full text-right p-1 hover:text-amber-800">قسائم ومسير الرواتب (Net Pay & Payslips)</button>
                    <button onClick={() => handleNav('hr-payroll-paymentsettings')} className="w-full text-right p-1 hover:text-amber-800">إعدادات التحويل (Payment Settings)</button>
                    <button onClick={() => handleNav('hr-payroll-earningsdeductions')} className="w-full text-right p-1 hover:text-amber-800">التعويضات والحسميات (Earnings & Deductions)</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 8. TENANT PROFILE & BRANDING SETTINGS */}
        <div className="pt-2 border-t border-gray-200 space-y-1.5">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 transition-colors font-bold text-xs shadow-sm"
          >
            <Settings className="w-4 h-4 text-amber-600 shrink-0" />
            {isOpen && <span>إعدادات الشعار والترخيص (Profile)</span>}
          </button>

          <a
            href="/admin"
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-bold text-xs shadow-sm"
          >
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            {isOpen && <span>لوحة السوبر أدمن (Master Admin)</span>}
          </a>
        </div>

      </div>

      {/* FOOTER METRICS */}
      {isOpen && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 font-bold text-center space-y-0.5">
          <p className="text-gray-700">{currentTenant.brandNameEn || 'Vanguard ERP System'}</p>
          <p className="text-amber-600">{currentTenant.brandNameAr || 'منتوجات زيت وزيتون الجنوب SARL'}</p>
          {currentTenant.companyRegistrationNumber && (
            <p className="text-[9px] text-gray-400 font-mono">س.ت: {currentTenant.companyRegistrationNumber}</p>
          )}
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
