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
  Lock
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sales: true,
    supersonic: false,
    social: false,
    op: true,
    cust: false,
    acc: false,
    hr: false,
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
        isOpen ? 'w-64' : 'w-16'
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
              {isOpen && <span className="font-bold">إدارة المبيعات (Sales Control)</span>}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="mr-4 pr-2 border-r-2 border-amber-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('sales-dash')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">لوحة تحكم المبيعات</button>
              <button onClick={() => handleNav('sales-pos')} className="w-full text-right p-1.5 hover:text-amber-600 rounded font-bold text-amber-700">نقطة البيع الكاشير (POS Terminal)</button>
              <button onClick={() => handleNav('sales-reports')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">تقارير المبيعات الصندوقية</button>
              <button onClick={() => handleNav('sales-online')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">الطلبيات الإلكترونية</button>
              <button onClick={() => handleNav('sales-eod')} className="w-full text-right p-1.5 hover:text-amber-600 rounded">إغلاق الصندوق (Z-Report)</button>
              <a href="/pos" target="_blank" className="w-full text-right p-1.5 text-amber-600 hover:underline flex items-center gap-1 font-bold">
                <ExternalLink className="w-3 h-3" /> تطبيق POS Touch المباشر
              </a>
            </div>
          )}
        </div>

        {/* 2. SUPERSONIC FLEET & DISPATCH (🔒 PREMIUM PRO TIER) */}
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
                  <span>أسطول الشحن (SuperSonic Fleet)</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-black border border-amber-300 shrink-0">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="mr-4 pr-2 border-r-2 border-emerald-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('supersonic-fleet')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded font-bold text-emerald-700 flex items-center justify-between">
                <span>إدارة الشحن والتوزيع</span>
                <span className="text-[9px] text-amber-600 font-bold">🔒 3PL</span>
              </button>
              <button onClick={() => handleNav('fleet-map')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">خريطة تتبع الشاحنات GPS</button>
              <button onClick={() => handleNav('fleet-km')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">سجل المسافات والعدّاد</button>
              <button onClick={() => handleNav('fleet-fuel')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">استهلاك الوقود والتعبئة</button>
              <button onClick={() => handleNav('fleet-maint')} className="w-full text-right p-1.5 hover:text-emerald-600 rounded">صيانة وخدمة المركبات</button>
              <a href="/supersonic/driver" target="_blank" className="w-full text-right p-1.5 text-emerald-600 hover:underline flex items-center gap-1 font-bold">
                <ExternalLink className="w-3 h-3" /> تطبيق السائق (Driver PWA)
              </a>
            </div>
          )}
        </div>

        {/* 3. SOCIAL MEDIA MANAGEMENT (🔒 ENTERPRISE TIER) */}
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
                  <span>التواصل الاجتماعي (Social CRM)</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.2 rounded font-black border border-blue-300 shrink-0">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="mr-4 pr-2 border-r-2 border-blue-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('social-inbox')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">صندوق الرسائل الموحد</button>
              <button onClick={() => handleNav('social-orders')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">طلبات منصات التواصل</button>
              <button onClick={() => handleNav('social-api')} className="w-full text-right p-1.5 hover:text-blue-600 rounded flex items-center justify-between">
                <span>ربط المنصات الأربعة (API)</span>
                <span className="text-[9px] text-blue-600 font-bold">🔒 API</span>
              </button>
              <button onClick={() => handleNav('social-campaigns')} className="w-full text-right p-1.5 hover:text-blue-600 rounded">الحملات الإعلانية وتكلفة الليد</button>
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
              {isOpen && <span className="font-bold">مركز العمليات والمعاصر (Operations)</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="mr-4 pr-2 border-r-2 border-emerald-300 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('oil-pressing')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-black text-emerald-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> معصرة واستلام وإنتاج الزيت
              </button>
              <button onClick={() => handleNav('control')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-bold">مركز التحكم والتشغيل (Control)</button>
              <button onClick={() => handleNav('inventory')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded font-bold">المخزون والخزانات (Inventory)</button>
              <button onClick={() => handleNav('products-services')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded">دليل المنتجات والخدمات</button>
              <button onClick={() => handleNav('op-quotes')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded">عروض الأسعار (Quotations)</button>
              <button onClick={() => handleNav('delivery-goods')} className="w-full text-right p-1.5 hover:text-emerald-700 rounded">تسليم البضائع وإرساليات الشحن</button>
            </div>
          )}
        </div>

        {/* 5. CUSTOMER MANAGEMENT */}
        <div>
          <button
            onClick={() => toggleGroup('cust')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['cust'] ? 'bg-purple-50 text-purple-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              {isOpen && <span className="font-bold">إدارة العملاء والذمم (CRM)</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="mr-4 pr-2 border-r-2 border-purple-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('cust-dir')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">دليل حسابات العملاء</button>
              <button onClick={() => handleNav('cust-receipts')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">إيصالات مقبوضات العملاء</button>
              <button onClick={() => handleNav('cust-aged')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">أعمار ديون العملاء (Aged Debtors)</button>
              <button onClick={() => handleNav('cust-tasks')} className="w-full text-right p-1.5 hover:text-purple-600 rounded">المهام والمواعيد</button>
            </div>
          )}
        </div>

        {/* 6. ACCOUNTING */}
        <div>
          <button
            onClick={() => toggleGroup('acc')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['acc'] ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              {isOpen && <span className="font-bold">المحاسبة والمالية (Accounting)</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="mr-4 pr-2 border-r-2 border-indigo-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('acc-dash')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">لوحة النظام المحاسبي</button>
              <button onClick={() => handleNav('acc-jv')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">سندات اليومية (JV Journal Vouchers)</button>
              <button onClick={() => handleNav('acc-coa')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">شجرة الحسابات العامة (COA)</button>
              <button onClick={() => handleNav('acc-rec')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">مطابقة حسابات البنوك</button>
              <button onClick={() => handleNav('acc-vat')} className="w-full text-right p-1.5 hover:text-indigo-600 rounded">إغلاق فترة ضريبة T.V.A</button>
            </div>
          )}
        </div>

        {/* 7. HUMAN RESOURCES */}
        <div>
          <button
            onClick={() => toggleGroup('hr')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              expandedGroups['hr'] ? 'bg-rose-50 text-rose-800' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
              {isOpen && <span className="font-bold">الموارد البشرية والرواتب (HR)</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="mr-4 pr-2 border-r-2 border-rose-200 space-y-1 mt-1 text-[11px]">
              <button onClick={() => handleNav('hr-overview')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">جدول دوام وحضور الموظفين</button>
              <button onClick={() => handleNav('hr-dir')} className="w-full text-right p-1.5 hover:text-rose-600 rounded">سجل الموظفين والكادر</button>
              <button onClick={() => handleNav('hr-payroll-dash')} className="w-full text-right p-1.5 hover:text-rose-600 rounded font-bold">مسير الرواتب والأجور (Payroll)</button>
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
