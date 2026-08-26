'use client';

import React, { useState } from 'react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import { UserCheck, Award, Star } from 'lucide-react';

export default function CustomerInsightsPage() {
  const [activeScreen, setActiveScreen] = useState<string>('cust-insights');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const topLtvCustomers = [
    { name: 'مطعم وريزورت شمس الجنوب', category: 'VIP Wholesale', ltv: 'LBP 1,450M', ordersCount: 42, avgTicket: 'LBP 34.5M', lastOrder: '2026-08-24' },
    { name: 'سوبرماركت التعاونية الكبرى', category: 'Retail Chain', ltv: 'LBP 1,120M', ordersCount: 38, avgTicket: 'LBP 29.4M', lastOrder: '2026-08-25' },
    { name: 'شركة البركة للتوزيع والحلويات', category: 'Distributor', ltv: 'LBP 980M', ordersCount: 29, avgTicket: 'LBP 33.7M', lastOrder: '2026-08-22' },
    { name: 'معصرة الخيام الحديثة', category: 'Industrial', ltv: 'LBP 850M', ordersCount: 24, avgTicket: 'LBP 35.4M', lastOrder: '2026-08-19' },
    { name: 'فندق وزيتون صور السياحي', category: 'Hospitality (HORECA)', ltv: 'LBP 720M', ordersCount: 31, avgTicket: 'LBP 23.2M', lastOrder: '2026-08-23' }
  ];

  const customerRetentionMetrics = [
    { label: 'Active LTV Customers', value: '1,248', change: '+12.4%', color: 'text-emerald-600' },
    { label: 'Avg Lifetime Value (LTV)', value: 'LBP 42.8M', change: '+8.1%', color: 'text-blue-600' },
    { label: 'Repeat Order Rate', value: '78.5%', change: '+5.2%', color: 'text-purple-600' },
    { label: 'Customer Churn Rate', value: '2.1%', change: '-0.8%', color: 'text-amber-600' }
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
            dir="rtl"
            className={`w-full max-w-screen-2xl mx-auto py-6 transition-all duration-300 space-y-6 ${
              isSidebarOpen ? 'px-6 lg:px-8 xl:px-10' : 'px-12 lg:px-16 xl:px-24'
            }`}
          >
            {/* HEADER */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white">
                    منتوجات زيت وزيتون الجنوب (Southern Olive Oil and Products SARL.)
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    تحليلات القيمة الممتدة للعملاء (Customer Insights & LTV Master Engine)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert('تصدير تقرير تحليلات العملاء PDF...')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-purple-400 shadow transition-all"
                >
                  <Award className="w-4 h-4" /> تصدير تقرير LTV
                </button>
              </div>
            </div>

            {/* KPI METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customerRetentionMetrics.map((m, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-bold block">{m.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-black ${m.color}`}>{m.value}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* TOP LTV CUSTOMERS TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
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
                      <tr key={idx} className="hover:bg-slate-50">
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
