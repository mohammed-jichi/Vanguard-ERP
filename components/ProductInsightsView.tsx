'use client';

import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Info,
  Package,
  Layers,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ProductInsightsView() {
  // Sticky Sidebar State
  const [isHierarchyOpen, setIsHierarchyOpen] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDivision, setSelectedDivision] = useState<string>('All Divisions');
  const [selectedGroup, setSelectedGroup] = useState<string>('All Groups');
  const [productSearch, setProductSearch] = useState<string>('');

  // Top Filter States
  const [branch, setBranch] = useState<string>('All Branches');
  const [currency, setCurrency] = useState<string>('LBP');
  const [year, setYear] = useState<string>('2026');
  const [dateRange, setDateRange] = useState<string>('August');

  // Threshold States
  const [lowCostThreshold, setLowCostThreshold] = useState<number>(10);
  const [highCostThreshold, setHighCostThreshold] = useState<number>(20);

  // Sales Trend Data (Aug 1 - Aug 25)
  const salesTrendData = [
    { day: 'Aug 1', sales: 18 },
    { day: 'Aug 3', sales: 24 },
    { day: 'Aug 5', sales: 32 },
    { day: 'Aug 7', sales: 28 },
    { day: 'Aug 9', sales: 45 },
    { day: 'Aug 11', sales: 38 },
    { day: 'Aug 13', sales: 52 },
    { day: 'Aug 15', sales: 48 },
    { day: 'Aug 17', sales: 60 },
    { day: 'Aug 19', sales: 55 },
    { day: 'Aug 21', sales: 68 },
    { day: 'Aug 23', sales: 72 },
    { day: 'Aug 25', sales: 85 }
  ];

  // Category Performance Data
  const categoryPerformance = [
    { category: 'Extra Virgin Olive Oil', units: '6,250 L', revenue: 'LBP 320,000,000' },
    { category: 'Bottled Oil & Jars', units: '3,800 Bottles', revenue: 'LBP 145,000,000' },
    { category: 'Pressing Services', units: '2,400 Tons', revenue: 'LBP 125,000,000' },
    { category: 'Soaps & Byproducts', units: '1,800 Pcs', revenue: 'LBP 30,000,000' }
  ];

  // Division Breakdown Data
  const divisionBreakdown = [
    { division: 'Retail Olive Oil (زيت مفرق)', share: 52, amount: 'LBP 322.4M' },
    { division: 'Wholesale Drums (براميل جملة)', share: 25, amount: 'LBP 155.0M' },
    { division: 'Extraction & Pressing (عصر الزيتون)', share: 15, amount: 'LBP 93.0M' },
    { division: 'Organic Soaps & Derivatives (صابون بلدي)', share: 8, amount: 'LBP 49.6M' }
  ];

  // Top Products Data
  const topProducts = [
    { rank: 1, name: 'Extra Virgin Olive Oil 16L Tin', units: '2,450 Tins', revenue: 'LBP 220.5M', share: 35.5 },
    { rank: 2, name: 'Glass Bottle Olive Oil 750ml', units: '4,100 Bottles', revenue: 'LBP 123.0M', share: 19.8 },
    { rank: 3, name: 'Olive Pressing Service per Ton', units: '1,200 Tons', revenue: 'LBP 96.0M', share: 15.4 },
    { rank: 4, name: 'Organic Laurel Olive Soap Pack', units: '3,500 Packs', revenue: 'LBP 45.5M', share: 7.3 },
    { rank: 5, name: 'Virgin Olive Oil 4L Bottle', units: '1,800 Bottles', revenue: 'LBP 36.0M', share: 5.8 }
  ];

  // Weekday Pattern Data
  const weekdayPattern = [
    { day: 'Monday', percent: 65, amount: 'LBP 82M' },
    { day: 'Tuesday', percent: 60, amount: 'LBP 78M' },
    { day: 'Wednesday', percent: 70, amount: 'LBP 88M' },
    { day: 'Thursday', percent: 75, amount: 'LBP 95M' },
    { day: 'Friday', percent: 85, amount: 'LBP 105M' },
    { day: 'Saturday', percent: 95, amount: 'LBP 112M' },
    { day: 'Sunday', percent: 48, amount: 'LBP 60M' }
  ];

  // Not Sold Items
  const notSoldItems = [
    { category: 'Byproducts', code: 'SKU-902', item: 'Olive Cake Charcoal Bricks (5kg)' },
    { category: 'Bottles', code: 'SKU-405', item: 'Dark Glass Marasca Bottle 250ml' },
    { category: 'Specialty', code: 'SKU-781', item: 'Infused Truffle Olive Oil 100ml' },
    { category: 'Services', code: 'SKU-109', item: 'Filtered Pomace Testing Service' }
  ];

  // Low Cost Items (Cost <= 10%)
  const lowCostItems = [
    { code: 'ITM-001', name: 'Raw Olive Leaves Bulk', costPercent: '4.2%', sellingPrice: 'LBP 15,000' },
    { code: 'ITM-008', name: 'Standard Soap Wrapper', costPercent: '6.5%', sellingPrice: 'LBP 8,000' },
    { code: 'ITM-014', name: 'Empty Glass Jar 500ml', costPercent: '8.9%', sellingPrice: 'LBP 25,000' }
  ];

  // High Cost Items (Cost >= 20%)
  const highCostItems = [
    { code: 'ITM-302', name: 'Stainless Steel Tap 16L', costPercent: '24.5%', sellingPrice: 'LBP 145,000' },
    { code: 'ITM-315', name: 'Imported Ceramic Oil Dispenser', costPercent: '31.2%', sellingPrice: 'LBP 320,000' },
    { code: 'ITM-401', name: 'Organic Cold Press Enzyme Additive', costPercent: '28.0%', sellingPrice: 'LBP 210,000' }
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 md:p-6 space-y-6 font-sans dir-ltr text-left">
      
      {/* 1. PAGE HEADER & FILTERS */}
      <div className="space-y-4">
        
        {/* TOP ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Products Insights</span>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
              منتوجات زيت وزيتون الجنوب (Southern Olive Oil and Products SARL.)
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Product analysis with item drill-down, menu mix performance, and cost structure insights.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-2xs shrink-0 self-start md:self-auto">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Current Selection</span>
            <span className="text-xs font-mono font-black text-slate-900">Aug 1 - Aug 31, 2026</span>
          </div>
        </div>

        {/* FILTER ROW CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-extrabold focus:outline-none focus:border-blue-500"
              >
                <option value="All Branches" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>All Branches</option>
                <option value="Southern Olive SARL" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Southern Olive SARL</option>
                <option value="Beirut Branch" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Beirut Branch</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-extrabold focus:outline-none focus:border-blue-500"
              >
                <option value="LBP" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>LBP</option>
                <option value="USD" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>USD</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-extrabold focus:outline-none focus:border-blue-500"
              >
                <option value="2026" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2026</option>
                <option value="2025" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2025</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-extrabold focus:outline-none focus:border-blue-500"
              >
                <option value="August" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>August</option>
                <option value="July" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>July</option>
                <option value="June" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>June</option>
              </select>
            </div>

          </div>

          <button
            onClick={() => window.print()}
            style={{ color: '#ffffff', backgroundColor: '#1d4ed8' }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 !text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors shrink-0 print:hidden cursor-pointer border border-blue-600"
            title="Export Product Insights as PDF"
          >
            <FileText className="w-4 h-4 !text-white text-white shrink-0" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }} className="!text-white font-bold">Export PDF</span>
          </button>

        </div>

      </div>

      {/* 2. MAIN LAYOUT (TWO COLUMNS: STICKY SIDEBAR + ANALYTICS CONTENT) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* 3. STICKY ITEM HIERARCHY SIDEBAR (CRITICAL) */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-4 space-y-4 self-start">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
            
            {/* SIDEBAR TOGGLE HEADER */}
            <div
              onClick={() => setIsHierarchyOpen(!isHierarchyOpen)}
              className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
            >
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Item Hierarchy</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Drill down by category, division & product</p>
              </div>
              {isHierarchyOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* EXPANDABLE HIERARCHY CONTROLS */}
            {isHierarchyOpen && (
              <div className="space-y-3.5 pt-1 text-xs">
                
                {/* CATEGORY SELECT */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Categories" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>All Categories</option>
                    <option value="Extra Virgin Olive Oil" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Extra Virgin Olive Oil</option>
                    <option value="Bottled Oil & Jars" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Bottled Oil & Jars</option>
                    <option value="Pressing Services" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Pressing Services</option>
                    <option value="Soaps & Byproducts" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Soaps & Byproducts</option>
                  </select>
                </div>

                {/* DIVISION SELECT */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">DIVISION</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Divisions" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>All Divisions</option>
                    <option value="Retail Products" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Retail Products</option>
                    <option value="Wholesale Drums" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Wholesale Drums</option>
                    <option value="Factory Services" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Factory Services</option>
                  </select>
                </div>

                {/* GROUP SELECT */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">GROUP</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Groups" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>All Groups</option>
                    <option value="Glass Bottles" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Glass Bottles</option>
                    <option value="Tin Cans 16L" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Tin Cans 16L</option>
                    <option value="Bulk Services" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Bulk Services</option>
                  </select>
                </div>

                {/* PRODUCT SEARCH INPUT */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">PRODUCT</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Type at least 3 characters..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Filtered Items:</span>
                  <span className="text-blue-600 font-extrabold">48 Active</span>
                </div>

              </div>
            )}

          </div>
        </aside>

        {/* 4. ANALYTICS CONTENT (RIGHT COLUMN) */}
        <main className="flex-1 space-y-6 w-full min-w-0">
          
          {/* ANALYSIS SCOPE HEADER */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl px-4 py-2 text-xs font-bold text-blue-900 flex items-center justify-between">
            <span>Scope: {selectedCategory} | {selectedDivision} | {selectedGroup}</span>
            <span className="text-blue-700 font-mono">(48 Active Items In Scope)</span>
          </div>

          {/* 6 KPI CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Revenue</span>
              <p className="text-sm font-black text-slate-900">LBP 620.0M</p>
              <span className="text-[10px] font-bold text-emerald-600 block">+0.0% vs Aug 2025</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Units Sold</span>
              <p className="text-sm font-black text-slate-900">14,250 Units</p>
              <span className="text-[10px] font-bold text-emerald-600 block">+4.2% vs Aug 2025</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Avg Selling Price</span>
              <p className="text-sm font-black text-slate-900">LBP 43,500</p>
              <span className="text-[10px] font-bold text-emerald-600 block">+1.1% vs Aug 2025</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Revenue Mix</span>
              <p className="text-sm font-black text-slate-900">100% Share</p>
              <span className="text-[10px] font-bold text-slate-500 block">Total Portfolio</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Active Branches</span>
              <p className="text-sm font-black text-slate-900">3 Branches</p>
              <span className="text-[10px] font-bold text-emerald-600 block">All Operational</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400">Products In Scope</span>
              <p className="text-sm font-black text-slate-900">48 Products</p>
              <span className="text-[10px] font-bold text-blue-600 block">Catalog Match</span>
            </div>

          </div>

          {/* SALES TREND (RECHARTS LINE CHART) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Sales Trend (Aug 1 - Aug 25, 2026)</span>
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val} Million`, 'Daily Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3.5} dot={{ r: 4, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRID OF DETAILS (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CATEGORY PERFORMANCE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Category Performance</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                <table className="w-full text-left font-sans text-base">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Units Sold</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {categoryPerformance.map((row) => (
                      <tr key={row.category} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-normal">{row.category}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-normal">{row.units}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-blue-700">{row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DIVISION BREAKDOWN (PROGRESS BARS) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Division Breakdown</h3>
              <div className="space-y-3 text-xs">
                {divisionBreakdown.map((div) => (
                  <div key={div.division} className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{div.division}</span>
                      <span className="font-mono text-blue-700">{div.amount} ({div.share}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${div.share}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP PRODUCTS ACCORDION LIST */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Top 5 Performing Products</h3>
              <div className="space-y-2 text-xs">
                {topProducts.map((p) => (
                  <div key={p.rank} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[10px]">
                        {p.rank}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{p.units}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-blue-700">{p.revenue}</p>
                      <span className="text-[10px] font-bold text-emerald-600">{p.share}% Mix</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEEKDAY PATTERN (PROGRESS BARS) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Weekday Sales Distribution Pattern</h3>
              <div className="space-y-2.5 text-xs">
                {weekdayPattern.map((w) => (
                  <div key={w.day} className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{w.day}</span>
                      <span className="font-mono text-slate-600">{w.amount}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${w.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* QUICK INSIGHTS (4 STACKED WHITE CARDS WITH BLUE 'i' ICON) */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Key Product Takeaways</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  <strong>Top Revenue Driver:</strong> Extra Virgin Olive Oil 16L Tins represent 35.5% of total gross monthly sales.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  <strong>Peak Sales Days:</strong> Saturdays and Fridays generate over 35% of total weekly volume.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  <strong>High Growth Category:</strong> Organic Laurel Soaps experienced a +31.8% volume increase vs 2025.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  <strong>Inventory Alert:</strong> 4 specialty products recorded 0 sales in August and require re-promotion.
                </p>
              </div>

            </div>
          </div>

          {/* PRODUCT ANALYSIS (BOTTOM SECTION: NOT SOLD, LOW COST, HIGH COST) */}
          <div className="space-y-6 pt-2">
            
            {/* NOT SOLD ITEMS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Zero Sales Products (Not Sold In Current Period)</span>
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                <table className="w-full text-left font-sans text-base">
                  <thead className="bg-rose-50 text-rose-900 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Item Code</th>
                      <th className="py-3.5 px-4 font-semibold">Product Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {notSoldItems.map((item) => (
                      <tr key={item.code} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 text-slate-500 font-normal">{item.category}</td>
                        <td className="py-3.5 px-4 font-mono font-normal">{item.code}</td>
                        <td className="py-3.5 px-4 font-normal text-slate-900">{item.item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LOW COST & HIGH COST GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LOW COST ITEMS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm text-emerald-800">Low Cost Items Analysis</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-500">COST &lt;=</span>
                    <input
                      type="number"
                      value={lowCostThreshold}
                      onChange={(e) => setLowCostThreshold(Number(e.target.value))}
                      className="w-12 p-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                    />
                    <span className="text-xs font-bold">%</span>
                    <button
                      onClick={() => alert(`Applied low cost filter threshold <= ${lowCostThreshold}%`)}
                      className="px-2.5 py-1 bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                  <table className="w-full text-left font-sans text-base">
                    <thead className="bg-emerald-50 text-emerald-950 font-semibold uppercase text-base tracking-wide">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Item Code</th>
                        <th className="py-3.5 px-4 font-semibold">Item Name</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Cost %</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Selling Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                      {lowCostItems.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-mono font-normal">{item.code}</td>
                          <td className="py-3.5 px-4 font-normal">{item.name}</td>
                          <td className="py-3.5 px-4 text-right font-medium text-emerald-700">{item.costPercent}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-normal text-slate-700">{item.sellingPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HIGH COST ITEMS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm text-rose-800">High Cost Items Analysis</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-500">COST &gt;=</span>
                    <input
                      type="number"
                      value={highCostThreshold}
                      onChange={(e) => setHighCostThreshold(Number(e.target.value))}
                      className="w-12 p-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                    />
                    <span className="text-xs font-bold">%</span>
                    <button
                      onClick={() => alert(`Applied high cost filter threshold >= ${highCostThreshold}%`)}
                      className="px-2.5 py-1 bg-rose-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                  <table className="w-full text-left font-sans text-base">
                    <thead className="bg-rose-50 text-rose-950 font-semibold uppercase text-base tracking-wide">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Item Code</th>
                        <th className="py-3.5 px-4 font-semibold">Item Name</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Cost %</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Selling Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                      {highCostItems.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-mono font-normal">{item.code}</td>
                          <td className="py-3.5 px-4 font-normal">{item.name}</td>
                          <td className="py-3.5 px-4 text-right font-medium text-rose-700">{item.costPercent}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-normal text-slate-700">{item.sellingPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
