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

  useEffect(() => {
    document.title = 'منتوجات زيت وزيتون الجنوب - لوحة التحكم الرئيسية ERP';
  }, []);

  const overviewTiles: TileItem[] = [
    {
      id: 'oil-pressing',
      titleAr: 'معصرة الزيت، الاستلام والإنتاج',
      titleEn: 'Oil Press, Receive & Production',
      icon: <Droplets className="w-8 h-8 text-emerald-400" />,
      badge: 'نشط الآن',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      action: () => setActiveScreen('oil-pressing')
    },
    {
      id: 'analytics-dash',
      titleAr: 'لوحة تحليلات المبيعات والعمليات',
      titleEn: 'Executive Sales & Operations',
      icon: <TrendingUp className="w-8 h-8 text-amber-400" />,
      badge: '+18.4%',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      action: () => setActiveScreen('analytics-dash')
    },
    {
      id: 'reports-summary',
      titleAr: 'التقارير المجمعة والتنفيذية',
      titleEn: 'Executive Summary Reports',
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500/40',
      action: () => setActiveScreen('reports-summary')
    },
    {
      id: 'tasks-events',
      titleAr: 'جدول المهام والمواعيد',
      titleEn: 'Tasks & Calendar Events',
      icon: <Calendar className="w-8 h-8 text-purple-400" />,
      badge: '3 اليوم',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/40',
      action: () => setActiveScreen('tasks-events')
    },
    {
      id: 'aged-debtors',
      titleAr: 'أعمار الديون والذمم المدينة',
      titleEn: 'Customer Aged & Debtors',
      icon: <Users className="w-8 h-8 text-red-400" />,
      color: 'text-red-400',
      bgColor: 'bg-red-950/40',
      borderColor: 'border-red-500/40',
      action: () => setActiveScreen('aged-debtors')
    }
  ];

  const billingTiles: TileItem[] = [
    {
      id: 'customers-dir',
      titleAr: 'دليل وحسابات العملاء',
      titleEn: 'Customers Directory',
      icon: <Users className="w-8 h-8 text-sky-400" />,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-500/40',
      action: () => setActiveScreen('customers-dir')
    },
    {
      id: 'quotations',
      titleAr: 'عروض الأسعار والمناقصات',
      titleEn: 'Quotations & Bids',
      icon: <ClipboardList className="w-8 h-8 text-amber-300" />,
      color: 'text-amber-300',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-500/30',
      action: () => setActiveScreen('quotations')
    },
    {
      id: 'sales-pos',
      titleAr: 'نقطة البيع ومراقبة المبيعات',
      titleEn: 'POS & Sales Control',
      icon: <ShoppingCart className="w-8 h-8 text-emerald-300" />,
      badge: 'POS ON',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-500/30',
      action: () => setActiveScreen('sales-pos')
    },
    {
      id: 'delivery-goods',
      titleAr: 'سندات وتسليم البضائع',
      titleEn: 'Delivery of Goods',
      icon: <Truck className="w-8 h-8 text-[#f59e0b]" />,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#1c2b1a]',
      borderColor: 'border-amber-500/40',
      action: () => setActiveScreen('delivery-goods')
    }
  ];

  const inventoryTiles: TileItem[] = [
    {
      id: 'product-master',
      titleAr: 'بطاقة تعريف المادة والمنتجات',
      titleEn: 'Products & Services Master Modal',
      icon: <Layers className="w-8 h-8 text-amber-300" />,
      badge: 'المركزي',
      color: 'text-amber-300',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      action: () => setIsProductModalOpen(true)
    },
    {
      id: 'inventory-stock',
      titleAr: 'جرد أصناف المواد والخزانات',
      titleEn: 'Inventory Stock & Tanks',
      icon: <Package className="w-8 h-8 text-amber-400" />,
      badge: '1,500 صنف',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      action: () => setActiveScreen('inventory-stock')
    },
    {
      id: 'stock-transfers',
      titleAr: 'تحويلات المخازن والفروع',
      titleEn: 'Stock Transfers & Inter-branch',
      icon: <RefreshCw className="w-8 h-8 text-emerald-400" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      action: () => setActiveScreen('stock-transfers')
    },
    {
      id: 'vendors-purchases',
      titleAr: 'الموردين وأوامر الشراء',
      titleEn: 'Vendors & Purchase Orders',
      icon: <Warehouse className="w-8 h-8 text-blue-400" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500/40',
      action: () => setActiveScreen('vendors-purchases')
    },
    {
      id: 'inventory-brands',
      titleAr: 'العلامات التجارية والبراندات',
      titleEn: 'Inventory Brands & Lines',
      icon: <Layers className="w-8 h-8 text-purple-400" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/40',
      action: () => setActiveScreen('inventory-brands')
    }
  ];

  const accountingTiles: TileItem[] = [
    {
      id: 'journal-vouchers',
      titleAr: 'سندات القيد اليومية (JVs)',
      titleEn: 'Journal Vouchers',
      icon: <Receipt className="w-8 h-8 text-amber-400" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/40',
      action: () => setActiveScreen('journal-vouchers')
    },
    {
      id: 'accounts-receivables',
      titleAr: 'متابعة الذمم والتحصيل',
      titleEn: 'Accounts Receivables',
      icon: <DollarSign className="w-8 h-8 text-emerald-400" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      action: () => setActiveScreen('accounts-receivables')
    },
    {
      id: 'bank-rec',
      titleAr: 'المطابقة والترصيد المصرفي',
      titleEn: 'Bank Reconciliation',
      icon: <ShieldCheck className="w-8 h-8 text-sky-400" />,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-500/40',
      action: () => setActiveScreen('bank-rec')
    },
    {
      id: 'vat-closing',
      titleAr: 'إغلاق فترة ضريبة T.V.A',
      titleEn: 'VAT Period Closing',
      icon: <CheckCircle2 className="w-8 h-8 text-purple-400" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/40',
      action: () => setActiveScreen('vat-closing')
    }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0a1209] text-white p-4 md:p-8 font-sans space-y-6">
      
      {/* 1. TOP SYSTEM HEADER (Omega POS / Southern Olive ERP Top Banner) */}
      <header className="bg-[#142013] border-2 border-[#2b3e2a] rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* BRAND IDENTITY */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-300">
            <Droplets className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              منتوجات زيت وزيتون الجنوب ش.م.م
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Tenant 001
              </span>
            </h1>
            <p className="text-xs text-amber-300 font-bold mt-0.5">
              Southern Olive & Oil Products S.A.R.L. -- Enterprise ERP System
            </p>
          </div>
        </div>

        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* USD RATE BADGE */}
          <div className="bg-[#1c2b1a] border border-[#3b5438] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>سعر الصرف: <strong className="text-amber-300">{usdRate.toLocaleString()} LBP</strong></span>
          </div>

          {/* ACTIVE WORKSPACE BADGE */}
          <div className="bg-emerald-950 border border-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>الفرع الرئيسي: صيدا / بيروت</span>
          </div>

          {/* BACK TO MAIN DASHBOARD TILE GRID BUTTON */}
          {activeScreen !== 'grid-dash' && (
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> العودة إلى لوحة المربعات الرئيسية
            </button>
          )}
        </div>
      </header>

      {/* 2. SUBHEADER ACTION & QUICK SEARCH BAR */}
      <div className="bg-[#1c2b1a] border border-[#2b3e2a] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        
        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث سريع في الشاشات والمعاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1209] border border-[#3b5438] rounded-xl py-2 px-4 pr-10 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* QUICK BUTTON TABS */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setActiveScreen('grid-dash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
  activeScreen === 'grid-dash'
  ? 'bg-amber-400 text-slate-950 shadow-md'
  : 'bg-[#243522] text-amber-300 hover:bg-[#2b3e2a]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 inline me-1" /> لوحة المربعات الرئيسية (Grid Dashboard)
          </button>

          <button 
            onClick={() => setActiveScreen('oil-pressing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
  activeScreen === 'oil-pressing'
  ? 'bg-emerald-600 text-white shadow-md'
  : 'bg-[#243522] text-emerald-300 hover:bg-[#2b3e2a]'
            }`}
          >
            <Droplets className="w-4 h-4 inline me-1" /> المعصرة والإنتاج (Oil Pressing)
          </button>
        </div>

      </div>

      {/* 3. DYNAMIC SCREEN ROUTER */}
      {activeScreen === 'oil-pressing' ? (
        <div className="space-y-4">
          <div className="bg-[#162514] border border-[#3b5438] rounded-xl p-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-amber-300 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-400" /> مركز الاستلام والإنتاج والمعاصر -- منتوجات زيت وزيتون الجنوب
            </h2>
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-[#243522] hover:bg-[#2b3e2a] text-slate-200 px-3 py-1 rounded-lg text-xs font-bold border border-[#3b5438]"
            >
              ← العودة للشبكة الرئيسية
            </button>
          </div>
          <ReceiveAndProductionMaster />
        </div>
      ) : (activeScreen === 'delivery-goods' || activeScreen === 'supersonic-fleet') ? (
        <SuperSonicFleetManager onBack={() => setActiveScreen('grid-dash')} />
      ) : activeScreen !== 'grid-dash' ? (
        <div className="bg-[#142013] border-2 border-[#2b3e2a] rounded-2xl p-6 md:p-10 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">وحدة العمليات التشغيلية المعتمدة</h2>
            <p className="text-xs text-emerald-400 font-bold mt-1">منتوجات زيت وزيتون الجنوب ش.م.م | ERP Sub-System Module</p>
          </div>
          <p className="text-sm text-slate-300 max-w-lg mx-auto font-medium">
            هذه الشاشة مفعّلة وجاهزة للعمل ضمن نظام ERP الخاص بمؤسسة الجنوب. يمكنك التبديل مباشرة إلى شاشة المعصرة والإنتاج أو العودة إلى لوحة المربعات الرئيسية.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveScreen('oil-pressing')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-2"
            >
              <Droplets className="w-4 h-4" /> فتح معصرة الزيت والإنتاج
            </button>
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-[#243522] hover:bg-[#2b3e2a] text-amber-300 font-bold px-5 py-2.5 rounded-xl border border-[#3b5438] text-xs"
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
            <div className="border-b border-[#2b3e2a] pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-400" /> 1. Overview & Oil Production (نظرة عامة والإنتاج)
              </h2>
              <span className="text-xs text-slate-400 font-bold">5 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {overviewTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className={`${tile.bgColor} border-2 ${tile.borderColor} hover:border-amber-400 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group space-y-3 min-h-[160px]`}
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: BILLING & SALES BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-[#2b3e2a] pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" /> 2. Billing & Sales Control (المبيعات والفوترة)
              </h2>
              <span className="text-xs text-slate-400 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {billingTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className={`${tile.bgColor} border-2 ${tile.borderColor} hover:border-emerald-400 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group space-y-3 min-h-[160px]`}
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: INVENTORY & SUPPLY CHAIN BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-[#2b3e2a] pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-sky-400 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-400" /> 3. Inventory & Supply Chain (المخازن والتوريد)
              </h2>
              <span className="text-xs text-slate-400 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inventoryTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className={`${tile.bgColor} border-2 ${tile.borderColor} hover:border-sky-400 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group space-y-3 min-h-[160px]`}
                >
                  <div className="relative">
                    {tile.icon}
                    {tile.badge && (
                      <span className="absolute -top-2 -right-3 bg-sky-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-sky-300 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {tile.titleEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: FINANCE & ACCOUNTING BLOCK */}
          <div className="space-y-3">
            <div className="border-b border-[#2b3e2a] pb-2 flex items-center justify-between">
              <h2 className="text-lg font-black text-purple-400 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" /> 4. Finance & Accounting (المالية والحسابات)
              </h2>
              <span className="text-xs text-slate-400 font-bold">4 وحدات تشغيلية</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {accountingTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={tile.action}
                  className={`${tile.bgColor} border-2 ${tile.borderColor} hover:border-purple-400 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group space-y-3 min-h-[160px]`}
                >
                  <div className="relative">
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-purple-300 transition-colors leading-tight">
                      {tile.titleAr}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
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
      <footer className="text-center text-xs text-slate-500 font-bold border-t border-[#2b3e2a] pt-4">
        منصة ERP لشركة منتوجات زيت وزيتون الجنوب ش.م.م © 2026 -- جميع البيانات محفوظة ومحمية
      </footer>

    </div>
  );
}