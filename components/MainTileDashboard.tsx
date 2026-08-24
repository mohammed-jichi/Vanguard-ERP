'use client';

/**
 * SOUTHERN OLIVE OIL PRODUCTS S.A.R.L. (منتوجات زيت وزيتون الجنوب ش.م.م)
 * Main ERP Dashboard Component: <MainTileDashboard />
 * 
 * High-End Omega POS Style Tile Grid / Tile View Dashboard
 */

import React, { useState, useEffect } from 'react';
import ReceiveAndProductionMaster from './ReceiveAndProductionMaster';
import ProductMasterModal from './ProductMasterModal';
import SuperSonicFleetManager from './SuperSonicFleetManager';
import {
  Building2,
  Droplets,
  ShieldCheck,
  UserCheck,
  LogOut,
  Package,
  Truck,
  BarChart3,
  CheckCircle2,
  Warehouse,
  LayoutGrid,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  Receipt,
  DollarSign,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Settings,
  Bell,
  Search,
  Mic,
  Sliders,
  Layers,
  Award,
  ClipboardList,
  RefreshCw,
  Plus
} from 'lucide-react';

interface TileItem {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  action?: () => void;
}

export default function MainTileDashboard() {
  const [activeScreen, setActiveScreen] = useState<string>('grid-dash');
  const [usdRate, setUsdRate] = useState<number>(89500);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const tenantName: string | undefined = undefined;

  useEffect(() => {
    document.title = 'Vanguard ERP - لوحة التحكم الرئيسية';
  }, []);

  const overviewTiles: TileItem[] = [
    {
      id: 'oil-pressing',
      titleAr: 'معصرة الزيت، الاستلام والإنتاج',
      titleEn: 'Oil Press, Receive & Production',
      icon: <Droplets className="w-8 h-8 text-emerald-600" />,
      badge: 'نشط الآن',
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('oil-pressing')
    },
    {
      id: 'analytics-dash',
      titleAr: 'لوحة تحليلات المبيعات والعمليات',
      titleEn: 'Executive Sales & Operations',
      icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
      badge: '+18.4%',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('analytics-dash')
    },
    {
      id: 'reports-summary',
      titleAr: 'التقارير المجمعة والتنفيذية',
      titleEn: 'Executive Summary Reports',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('reports-summary')
    },
    {
      id: 'tasks-events',
      titleAr: 'جدول المهام والمواعيد',
      titleEn: 'Tasks & Calendar Events',
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      badge: '3 اليوم',
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('tasks-events')
    },
    {
      id: 'aged-debtors',
      titleAr: 'أعمار الديون والذمم المدينة',
      titleEn: 'Customer Aged & Debtors',
      icon: <Users className="w-8 h-8 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('aged-debtors')
    }
  ];

  const billingTiles: TileItem[] = [
    {
      id: 'customers-dir',
      titleAr: 'دليل وحسابات العملاء',
      titleEn: 'Customers Directory',
      icon: <Users className="w-8 h-8 text-sky-600" />,
      color: 'text-sky-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('customers-dir')
    },
    {
      id: 'quotations',
      titleAr: 'عروض الأسعار والمناقصات',
      titleEn: 'Quotations & Bids',
      icon: <ClipboardList className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('quotations')
    },
    {
      id: 'sales-pos',
      titleAr: 'نقطة البيع ومراقبة المبيعات',
      titleEn: 'POS & Sales Control',
      icon: <ShoppingCart className="w-8 h-8 text-emerald-600" />,
      badge: 'POS ON',
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-pos')
    },
    {
      id: 'delivery-goods',
      titleAr: 'سندات وتسليم البضائع',
      titleEn: 'Delivery of Goods',
      icon: <Truck className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('delivery-goods')
    }
  ];

  const inventoryTiles: TileItem[] = [
    {
      id: 'product-master',
      titleAr: 'بطاقة تعريف المادة والمنتجات',
      titleEn: 'Products & Services Master Modal',
      icon: <Layers className="w-8 h-8 text-amber-600" />,
      badge: 'المركزي',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setIsProductModalOpen(true)
    },
    {
      id: 'inventory-stock',
      titleAr: 'جرد أصناف المواد والخزانات',
      titleEn: 'Inventory Stock & Tanks',
      icon: <Package className="w-8 h-8 text-amber-600" />,
      badge: '1,500 صنف',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('inventory-stock')
    },
    {
      id: 'stock-transfers',
      titleAr: 'تحويلات المخازن والفروع',
      titleEn: 'Stock Transfers & Inter-branch',
      icon: <RefreshCw className="w-8 h-8 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('stock-transfers')
    },
    {
      id: 'vendors-purchases',
      titleAr: 'الموردين وأوامر الشراء',
      titleEn: 'Vendors & Purchase Orders',
      icon: <Warehouse className="w-8 h-8 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('vendors-purchases')
    },
    {
      id: 'inventory-brands',
      titleAr: 'العلامات التجارية والبراندات',
      titleEn: 'Inventory Brands & Lines',
      icon: <Layers className="w-8 h-8 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('inventory-brands')
    }
  ];

  const accountingTiles: TileItem[] = [
    {
      id: 'journal-vouchers',
      titleAr: 'سندات القيد اليومية (JVs)',
      titleEn: 'Journal Vouchers',
      icon: <Receipt className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('journal-vouchers')
    },
    {
      id: 'accounts-receivables',
      titleAr: 'متابعة الذمم والتحصيل',
      titleEn: 'Accounts Receivables',
      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('accounts-receivables')
    },
    {
      id: 'bank-rec',
      titleAr: 'المطابقة والترصيد المصرفي',
      titleEn: 'Bank Reconciliation',
      icon: <ShieldCheck className="w-8 h-8 text-sky-600" />,
      color: 'text-sky-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('bank-rec')
    },
    {
      id: 'vat-closing',
      titleAr: 'إغلاق فترة ضريبة T.V.A',
      titleEn: 'VAT Period Closing',
      icon: <CheckCircle2 className="w-8 h-8 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('vat-closing')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans space-y-6">

      {/* 1. TOP SYSTEM HEADER (Vanguard ERP Top Banner) */}
      <header className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

        {/* BRAND IDENTITY */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-slate-900 border-2 border-amber-500 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1">
            <img src="/assets/images/vanguard_logo.png" alt="Vanguard Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              Vanguard ERP System
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Tenant Workspace
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-bold mt-0.5">
              Enterprise Resource Planning System
            </p>
          </div>
        </div>

        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center gap-2">

          {/* USD RATE BADGE */}
          <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>سعر الصرف: <strong className="text-amber-600">{usdRate.toLocaleString()} LBP</strong></span>
          </div>

          {/* ACTIVE SYSTEM STATUS BADGE */}
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>النظام التشغيلي الفعّال</span>
          </div>

          {/* BACK TO MAIN DASHBOARD TILE GRID BUTTON */}
          {activeScreen !== 'grid-dash' && (
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> العودة إلى لوحة المربعات الرئيسية
            </button>
          )}
        </div>
      </header>

      {/* 2. SUBHEADER ACTION & QUICK SEARCH BAR */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث سريع في الشاشات والمعاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 pr-10 text-xs text-gray-800 font-bold focus:border-amber-500 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* QUICK BUTTON TABS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveScreen('grid-dash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeScreen === 'grid-dash'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <LayoutGrid className="w-4 h-4 inline me-1" /> لوحة المربعات الرئيسية (Grid Dashboard)
          </button>

          <button
            onClick={() => setActiveScreen('oil-pressing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeScreen === 'oil-pressing'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-emerald-700 hover:bg-gray-200'
              }`}
          >
            <Droplets className="w-4 h-4 inline me-1" /> المعصرة والإنتاج (Oil Pressing)
          </button>
        </div>

      </div>

      {/* 3. DYNAMIC SCREEN ROUTER */}
      {activeScreen === 'oil-pressing' ? (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <h2 className="text-sm font-black text-amber-600 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-600" /> مركز الاستلام والإنتاج والمعاصر -- {tenantName || "Vanguard ERP System"}
            </h2>
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200"
            >
              ← العودة للشبكة الرئيسية
            </button>
          </div>
          <ReceiveAndProductionMaster />
        </div>
      ) : (activeScreen === 'delivery-goods' || activeScreen === 'supersonic-fleet') ? (
        <SuperSonicFleetManager onBack={() => setActiveScreen('grid-dash')} />
      ) : activeScreen !== 'grid-dash' ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">وحدة العمليات التشغيلية المعتمدة</h2>
            <p className="text-xs text-emerald-600 font-bold mt-1">{tenantName || "Vanguard ERP System"} | ERP Sub-System Module</p>
          </div>
          <p className="text-sm text-gray-600 max-w-lg mx-auto font-medium">
            هذه الشاشة مفعّلة وجاهزة للعمل ضمن نظام ERP. يمكنك التبديل مباشرة إلى شاشة المعصرة والإنتاج أو العودة إلى لوحة المربعات الرئيسية.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveScreen('oil-pressing')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl shadow-sm text-xs flex items-center gap-2"
            >
              <Droplets className="w-4 h-4" /> فتح معصرة الزيت والإنتاج
            </button>
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl border border-gray-200 text-xs"
            >
              العودة إلى لوحة المربعات الرئيسية
            </button>
          </div>
        </div>
      ) : (
        /* MAIN OMEGA POS TILE GRID DASHBOARD */
        <div className="space-y-8">

          {/* SECTION 1: OVERVIEW BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-amber-600 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-600" /> 1. Overview & Oil Production (نظرة عامة والإنتاج)
              </h2>
              <span className="text-xs text-gray-500 font-bold">5 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {overviewTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className="bg-white border border-gray-200 shadow-sm hover:border-amber-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-800 group-hover:text-amber-600 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: BILLING & SALES BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" /> 2. Billing & Sales Control (المبيعات والفوترة)
              </h2>
              <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {billingTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className="bg-white border border-gray-200 shadow-sm hover:border-emerald-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-800 group-hover:text-emerald-600 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: INVENTORY & SUPPLY CHAIN BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-sky-600 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" /> 3. Inventory & Supply Chain (المخازن والتوريد)
              </h2>
              <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inventoryTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className="bg-white border border-gray-200 shadow-sm hover:border-sky-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-800 group-hover:text-sky-600 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: FINANCE & ACCOUNTING BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-purple-600 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" /> 4. Finance & Accounting (المالية والحسابات)
              </h2>
              <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {accountingTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className="bg-white border border-gray-200 shadow-sm hover:border-purple-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                >
                  <div className="relative">
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-800 group-hover:text-purple-600 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PRODUCT MASTER SUB-SYSTEM MODAL */}
      <ProductMasterModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 font-bold border-t border-gray-200 pt-4">
        منصة ERP لشركة {tenantName || "Vanguard ERP System"} © 2026 -- جميع البيانات محفوظة ومحمية
      </footer>

    </div>
  );
}