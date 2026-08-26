'use client';

import React, { useState } from 'react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import {
  UserCheck,
  Award,
  Star,
  RefreshCw,
  Sparkles,
  FileText,
  Info,
  Users,
  TrendingUp,
  DollarSign,
  UserX,
  Target,
  BarChart2,
  PieChart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function CustomerInsightsPage() {
  const [activeScreen, setActiveScreen] = useState<string>('cust-insights');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');

  const topLtvCustomers = [
    { name: 'مطعم وريزورت شمس الجنوب', category: 'VIP Wholesale', ltv: 'LBP 1,450M', ordersCount: 42, avgTicket: 'LBP 34.5M', lastOrder: '2026-08-24' },
    { name: 'سوبرماركت التعاونية الكبرى', category: 'Retail Chain', ltv: 'LBP 1,120M', ordersCount: 38, avgTicket: 'LBP 29.4M', lastOrder: '2026-08-25' },
    { name: 'شركة البركة للتوزيع والحلويات', category: 'Distributor', ltv: 'LBP 980M', ordersCount: 29, avgTicket: 'LBP 33.7M', lastOrder: '2026-08-22' },
    { name: 'معصرة الخيام الحديثة', category: 'Industrial', ltv: 'LBP 850M', ordersCount: 24, avgTicket: 'LBP 35.4M', lastOrder: '2026-08-19' },
    { name: 'فندق وزيتون صور السياحي', category: 'Hospitality (HORECA)', ltv: 'LBP 720M', ordersCount: 31, avgTicket: 'LBP 23.2M', lastOrder: '2026-08-23' }
  ];

  const recommendations = [
    {
      title: 'Understand Your Customer Segments',
      desc: 'Analyze purchasing behaviors across wholesale, retail, and hospitality to tailor pricing strategy.',
      icon: Target,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      title: 'Focus on Your Top Customers',
      desc: 'Identify VIP accounts generating 80% of revenue and assign dedicated account managers.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      title: 'Track Buying Habits',
      desc: 'Monitor order frequency and product preferences to optimize stock availability.',
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Improve Customer Retention',
      desc: 'Implement automated follow-ups for accounts with no orders in the last 60 days.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      title: 'Personalize Your Offers',
      desc: 'Create tailored promotions and volume discounts for high-margin product categories.',
      icon: Sparkles,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      title: 'Measure Customer Value',
      desc: 'Continuously evaluate Customer Lifetime Value (CLV) against acquisition and service costs.',
      icon: DollarSign,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      title: 'Reduce Customer Churn',
      desc: 'Set up early warning triggers for accounts showing declining order volumes MTD.',
      icon: Zap,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      title: 'Optimize Sales Channels',
      desc: 'Compare direct, showroom, and distributor channels to maximize gross margins.',
      icon: BarChart2,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. GLOBAL HEADER */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER CONTAINER WITH SIDEBAR & CONTENT WITH 3CM GAP (PHASE 64) */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-slate-50 mt-8">
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isOpen={isSidebarOpen}
          onToggleOpen={(open) => setIsSidebarOpen(open)}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
          <div
            className={`w-full max-w-screen-2xl mx-auto py-6 transition-all duration-300 space-y-8 ${
              isSidebarOpen ? 'px-6 lg:px-8 xl:px-10' : 'px-12 lg:px-16 xl:px-24'
            }`}
          >
            {/* 1. BREADCRUMBS & TOP HEADER CARD */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="hover:text-slate-600 cursor-pointer">Home</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-blue-600 font-extrabold">Customer Insights</span>
              </div>

              {/* Title & Actions Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    <span>Customer Insights</span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Your customers are your most valuable asset, know them well.
                  </p>
                </div>

                {/* Top-Right Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Brands">All Brands</option>
                    <option value="Southern Olive SARL">Southern Olive SARL</option>
                    <option value="Beirut Branch">Beirut Branch</option>
                  </select>

                  <button
                    onClick={() => alert('Refreshing KPIs...')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Refresh KPIs</span>
                  </button>

                  <button
                    onClick={() => alert('Refreshing Panels...')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Refresh Panels</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('recommendations-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recommendations</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer border border-blue-600"
                  >
                    <FileText className="w-4 h-4 text-white" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. TOP 4 KPI CARDS (4-COL GRID WITH DISTINCT BORDER BOXES) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* CARD 1: ACTIVE / INACTIVE */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Customers</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-mono block">31</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Active Accounts
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-500 font-mono block">2</span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Inactive Accounts
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: NEW CUSTOMERS & AVG ANNUAL SPEND */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Acquisition & Spend</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">New T / W / M / Y:</span>
                    <span className="font-mono font-black text-slate-900">0 / 0 / 0 / 31</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-semibold">Avg Spend / Cust:</span>
                    <span className="font-mono font-black text-emerald-600">LBP 42.8M</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: LIFETIME VALUE (CLV) WITH TOOLTIP & AT-RISK */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Lifetime Value (CLV)</span>
                    <div className="group relative inline-block">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl bg-slate-900 p-3 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        Lifetime Net Sales / Distinct Customers with Sales, using ST_Sales_Amount - Discount, excluding rows with null or 0 Customers and type R.
                      </div>
                    </div>
                  </div>
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-purple-700 font-mono block">LBP 985.4M</span>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Avg Account CLV
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-600 font-mono block">2</span>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      At-Risk Accounts
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 4: GROWTH RATE & YEARLY CHURN RATE WITH TOOLTIP */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Growth & Churn</span>
                    <div className="group relative inline-block">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl bg-slate-900 p-3 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        Customers who bought in the previous year but did not buy in the current year, / Customers who bought in the previous year * 100.
                      </div>
                    </div>
                  </div>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-xl font-black text-slate-900 font-mono block">-100%</span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Growth Rate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-600 font-mono block">0%</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      Yearly Churn
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. RECOMMENDATIONS SECTION (8 DISTINCT BOXES IN 4x2 GRID) */}
            <div id="recommendations-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-blue-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Recommendations</span>
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                  8 Strategic Actions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((rec, idx) => {
                  const IconComp = rec.icon;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl bg-white p-4 space-y-2 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${rec.color} shrink-0`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <h3 className="text-xs font-black text-slate-900 leading-snug">{rec.title}</h3>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {rec.desc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-blue-600">
                        <span>Execute Strategy</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. TOP LTV CUSTOMERS TABLE (PRESERVED) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" dir="rtl">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>كبار العملاء والأعلى قيمة ممتدة (Top 5 LTV VIP Customers)</span>
              </h2>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">اسم العميل / المؤسسة</th>
                      <th className="py-3.5 px-4 font-semibold">فئة العميل</th>
                      <th className="py-3.5 px-4 font-semibold">القيمة الممتدة (LTV)</th>
                      <th className="py-3.5 px-4 font-semibold">عدد الطلبيات</th>
                      <th className="py-3.5 px-4 font-semibold">متوسط الفاتورة</th>
                      <th className="py-3.5 px-4 font-semibold">تاريخ آخر طلب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {topLtvCustomers.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">{row.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">{row.ltv}</td>
                        <td className="py-3.5 px-4 font-mono font-normal">{row.ordersCount} طلب</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-normal">{row.avgTicket}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 font-normal">{row.lastOrder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
