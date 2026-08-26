'use client';

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  GitCompare,
  Package,
  UserCheck,
  Users,
  Calendar,
  Globe,
  Maximize2,
  Minimize2,
  MoreVertical,
  X,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface SalesDashboardProps {
  onSelectScreen?: (screen: string) => void;
}

export default function SalesDashboard({ onSelectScreen }: SalesDashboardProps) {
  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('منتجات زيت وزيتون الجنوب');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('LBP');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedDate, setSelectedDate] = useState<string>('All Days');

  // Active Sub-Tab State
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Widget Expand Modal State
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // Live Chart Data - Monthly Revenue
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 420 },
    { month: 'Feb', revenue: 380 },
    { month: 'Mar', revenue: 510 },
    { month: 'Apr', revenue: 490 },
    { month: 'May', revenue: 580 },
    { month: 'Jun', revenue: 620 },
    { month: 'Jul', revenue: 690 },
    { month: 'Aug', revenue: 750 },
    { month: 'Sep', revenue: 610 },
    { month: 'Oct', revenue: 540 },
    { month: 'Nov', revenue: 480 },
    { month: 'Dec', revenue: 710 }
  ];

  // Live Chart Data - Sales By Category
  const categorySalesData = [
    { name: 'Extra Virgin Olive Oil', value: 45, amount: 'LBP 91,035,000', color: '#10b981' },
    { name: 'Bottled Oil & Jars', value: 30, amount: 'LBP 60,690,000', color: '#3b82f6' },
    { name: 'Pressing Services', value: 15, amount: 'LBP 30,345,000', color: '#f59e0b' },
    { name: 'Soaps & Byproducts', value: 10, amount: 'LBP 20,230,000', color: '#8b5cf6' }
  ];

  // Sub-Navigation Tabs Config
  const tabs = [
    { id: 'summary', label: 'Summary', icon: LayoutDashboard },
    { id: 'comparative', label: 'Comparative', icon: GitCompare },
    { id: 'product-insights', label: 'Product Insights', icon: Package },
    { id: 'customer-insights', label: 'Customer Insights', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'geographics', label: 'Geographics', icon: Globe }
  ];

  const handleExportPDF = () => {
    alert(`Exporting Sales Control Dashboard PDF report for ${selectedBranch}...`);
  };

  const handleRecalculate = () => {
    alert('Sales balances and MTD/YTD metrics recalculated successfully!');
  };

  // Reusable Widget Card Component
  const WidgetCard = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{title}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpandedWidget(id)}
              title="Expand Chart Fullscreen"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert(`Options for ${title}`)}
              title="Widget Options"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-full flex-1">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-6 font-sans dir-ltr text-left">
      
      {/* 1. TOP FILTER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* DROPDOWNS GROUP */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
          
          {/* BRANCH DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="منتجات زيت وزيتون الجنوب">منتجات زيت وزيتون الجنوب (Southern Olive Oil S.A.R.L)</option>
              <option value="Beirut Central Branch">Beirut Central Branch</option>
              <option value="Saida Production Press">Saida Production Press</option>
            </select>
          </div>

          {/* CURRENCY DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="LBP">LBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* YEAR DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* MONTH DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="August">August</option>
              <option value="July">July</option>
              <option value="June">June</option>
              <option value="May">May</option>
            </select>
          </div>

          {/* DATE DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All Days">All Days</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="MTD">MTD</option>
            </select>
          </div>

        </div>

        {/* RIGHT ACTIONS GROUP */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* EXPORT PDF BUTTON */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          {/* THREE ICON BUTTONS */}
          <button
            onClick={() => alert('Last EOD Report: 25-Aug-2026 at 23:45 PM')}
            title="Clock / Last EOD"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={handleRecalculate}
            title="Refresh / Recalculate"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectScreen ? onSelectScreen('sc-reports') : alert('Opening Detailed Sales Reports...')}
            title="BarChart / Reports"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* 2. KPI CARDS GRID OF 4 (ALL TEXT-WHITE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: GREEN (bg-emerald-700) */}
        <div className="bg-emerald-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-200">Today's Net Sales</span>
            <h2 className="text-2xl font-black text-white mt-1">LBP 42,500,000</h2>
          </div>
          <div className="border-t border-emerald-600/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-emerald-100">
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Receipts</p>
              <p className="font-extrabold text-white">42.5M</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Discounts</p>
              <p className="font-extrabold text-white">0.00</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Refunds</p>
              <p className="font-extrabold text-white">0.00</p>
            </div>
          </div>
        </div>

        {/* CARD 2: BLUE (bg-blue-800) */}
        <div className="bg-blue-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-200">Net Sales Summary</span>
            <div className="mt-1">
              <span className="text-[10px] text-blue-300 uppercase font-bold">Net Sales Total</span>
              <h2 className="text-2xl font-black text-white">LBP 202,300,000</h2>
            </div>
          </div>
          <div className="border-t border-blue-700/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-blue-100">
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Gross</p>
              <p className="font-extrabold text-white">185M</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Discount</p>
              <p className="font-extrabold text-white">2.5M</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Tax</p>
              <p className="font-extrabold text-white">19.8M</p>
            </div>
          </div>
        </div>

        {/* CARD 3: GOLD (bg-amber-600) */}
        <div className="bg-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-200">MTD / YTD Performance</span>
            <h2 className="text-2xl font-black text-white mt-1">LBP 620,000,000</h2>
          </div>
          <div className="border-t border-amber-500/60 pt-3 grid grid-cols-2 gap-2 text-[11px] text-amber-100">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">YTD Sales</p>
              <p className="font-extrabold text-white">4.85B</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Cust. Aged</p>
              <p className="font-extrabold text-white">14.2M</p>
            </div>
          </div>
        </div>

        {/* CARD 4: BROWN (bg-[#8c4a32]) */}
        <div className="bg-[#8c4a32] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-200">Cashier Operations</span>
            <h2 className="text-2xl font-black text-white mt-1">142 Invoices</h2>
          </div>
          <div className="border-t border-amber-800/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-amber-100">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Paid In/Out</p>
              <p className="font-extrabold text-white">5M / 1.2M</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Avg Invoice</p>
              <p className="font-extrabold text-white">1.45M</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Voids/Ref</p>
              <p className="font-extrabold text-white">0 / 0</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
        {tabs.map((t) => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. & 5. CHARTS GRID SYSTEM (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: MONTHLY REVENUE (BAR CHART) */}
        <WidgetCard id="monthly-revenue" title="Monthly Revenue (Jan - Dec 2026)">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`LBP ${val}M`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>

        {/* CHART 2: SALES BY CATEGORY (PIE CHART & DATA TABLE) */}
        <WidgetCard id="sales-category" title="Sales By Category Distribution">
          <div className="flex flex-col space-y-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Share']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* CATEGORY BREAKDOWN DATA TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left font-sans">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                  {categorySalesData.map((c) => (
                    <tr key={c.name} className="hover:bg-slate-50">
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{c.amount}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{c.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </WidgetCard>

      </div>

      {/* FULLSCREEN EXPANDED WIDGET MODAL OVERLAY */}
      {expandedWidget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 p-6 flex flex-col justify-between animate-in fade-in duration-150">
          
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>
                {expandedWidget === 'monthly-revenue' ? 'Monthly Revenue (Jan - Dec 2026) - Expanded Analysis' : 'Sales By Category Distribution - Detailed Breakdown'}
              </span>
            </h3>
            <button
              onClick={() => setExpandedWidget(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Reduce View</span>
            </button>
          </div>

          {/* MODAL BODY (ENLARGED LIVE CHART) */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl my-4 p-6 overflow-hidden flex flex-col justify-center">
            {expandedWidget === 'monthly-revenue' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val} Million`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-center">
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px', color: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-900 text-white font-black text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4">Category Name</th>
                        <th className="py-3 px-4 text-right">Revenue Amount</th>
                        <th className="py-3 px-4 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                      {categorySalesData.map((c) => (
                        <tr key={c.name} className="hover:bg-slate-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                            <span>{c.name}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">{c.amount}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{c.value}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
