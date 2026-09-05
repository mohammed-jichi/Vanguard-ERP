'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
  Package,
  Layers,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// High-Contrast Sales Trend Line Chart Tooltip Component
const SalesTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white border border-slate-300 p-3 rounded-xl shadow-xl space-y-1.5 text-xs font-sans z-50 min-w-[160px]">
        <p className="font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">{label}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-600">Daily Sales:</span>
          <span className="font-mono text-blue-600 font-black text-sm">{val} Units</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ProductInsightsView() {
  // 1. TOP FILTER STATES
  const [branch, setBranch] = useState<string>('All Branches');
  const [currency, setCurrency] = useState<string>('LBP');
  const [year, setYear] = useState<string>('2026');
  const [dateRange, setDateRange] = useState<string>('September');

  // 2. ITEM HIERARCHY SIDEBAR STATES
  const [isHierarchyOpen, setIsHierarchyOpen] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDivision, setSelectedDivision] = useState<string>('All Divisions');
  const [selectedGroup, setSelectedGroup] = useState<string>('All Groups');
  const [productSearch, setProductSearch] = useState<string>('');

  // 3. COST THRESHOLD INPUT STATES & APPLIED FILTERS
  const [lowCostInput, setLowCostInput] = useState<number>(10);
  const [highCostInput, setHighCostInput] = useState<number>(20);
  const [appliedLowCostThreshold, setAppliedLowCostThreshold] = useState<number>(10);
  const [appliedHighCostThreshold, setAppliedHighCostThreshold] = useState<number>(20);

  // 4. ACCORDION STATES FOR TOP PRODUCTS BY CATEGORY
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({
    'مفرق': true,
    'عروض': true,
    'جملة': false
  });

  // -------------------------------------------------------------
  // DYNAMIC DATASETS & REACTIVE CALCULATIONS
  // -------------------------------------------------------------

  // Currency multiplier factor (1 USD = 89,500 LBP for realistic Lebanese ERP math)
  const isUsd = currency === 'USD';
  const formatCurrency = (amountLbp: number) => {
    if (isUsd) {
      const usdVal = amountLbp / 89500;
      return `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `LL ${amountLbp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyCompact = (amountLbp: number) => {
    if (isUsd) {
      return `$${(amountLbp / 89500).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `LL ${amountLbp.toLocaleString()}`;
  };

  // Base raw items database for dynamic filtering
  const allMasterProducts = useMemo(() => [
    { code: '00003', name: 'تنكة زيت زيتون فرجين بلدي 17.5 ليتر', category: 'مفرق', division: 'عروض', group: 'زيت زيتون فرجين مفرق', costPercent: 12.5, priceLbp: 90000000, soldUnits: 42 },
    { code: '00004', name: 'تنكة زيت زيتون بكر ممتاز 16 ليتر', category: 'مفرق', division: 'عروض', group: 'زيت زيتون فرجين مفرق', costPercent: 14.0, priceLbp: 85000000, soldUnits: 18 },
    { code: '00012', name: 'مرطبان زيتون بلدي اكسترا 1 كغ', category: 'مفرق', division: 'مرطبان', group: 'مرطبان 509', costPercent: 8.5, priceLbp: 2235000, soldUnits: 17 },
    { code: '00025', name: 'مربى تين بلدي مع جوز 900 غرام', category: 'جملة', division: 'مربيات جملة', group: 'مربيات', costPercent: 16.5, priceLbp: 17370000, soldUnits: 0 },
    { code: '00040', name: 'صابون غار بلدي أصلي بزيت الزيتون', category: 'عروض', division: 'عروض', group: 'صابون', costPercent: 6.2, priceLbp: 12000000, soldUnits: 0 },
    { code: '00055', name: 'زعتر بلدي جنوبي فاخر 1 كغ', category: 'مفرق', division: 'مونة بلدية مفرق', group: 'مونة', costPercent: 9.8, priceLbp: 2665000, soldUnits: 0 },
    { code: '00099', name: 'مربى توت بلدي 500 غرام', category: 'مفرق', division: 'مربيات مفرق', group: 'مربيات', costPercent: 11.0, priceLbp: 225000, soldUnits: 0 },
    { code: '00105', name: 'Raw Olive Oil Extra Virgin Bulk', category: 'Raw Materials', division: 'Plastic', group: 'Raw Materials', costPercent: 4.2, priceLbp: 15000000, soldUnits: 0 }
  ], []);

  // Filtered dataset reactive to category, division, group, search, and branch
  const filteredProducts = useMemo(() => {
    return allMasterProducts.filter(item => {
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
      if (selectedDivision !== 'All Divisions' && item.division !== selectedDivision) return false;
      if (selectedGroup !== 'All Groups' && item.group !== selectedGroup) return false;
      if (productSearch.trim() !== '') {
        const query = productSearch.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allMasterProducts, selectedCategory, selectedDivision, selectedGroup, productSearch]);

  // Authentic Scope Calculations matching Video V4
  const totalScopeRevenueLbp = 134551800;
  const totalScopeUnits = 77;
  const avgSellingPriceLbp = 1747425.94;

  // Dynamic Sales Trend Chart Data
  const salesTrendData = useMemo(() => {
    const baseMult = branch === 'Beirut Branch' ? 0.4 : (branch === 'Southern Olive SARL' ? 0.72 : 1.0);
    return [
      { day: 'Sep 1', sales: Math.round(18 * baseMult) },
      { day: 'Sep 3', sales: Math.round(24 * baseMult) },
      { day: 'Sep 5', sales: Math.round(32 * baseMult) },
      { day: 'Sep 7', sales: Math.round(28 * baseMult) },
      { day: 'Sep 9', sales: Math.round(45 * baseMult) },
      { day: 'Sep 11', sales: Math.round(38 * baseMult) },
      { day: 'Sep 13', sales: Math.round(52 * baseMult) },
      { day: 'Sep 15', sales: Math.round(48 * baseMult) },
      { day: 'Sep 17', sales: Math.round(60 * baseMult) },
      { day: 'Sep 19', sales: Math.round(55 * baseMult) },
      { day: 'Sep 21', sales: Math.round(68 * baseMult) },
      { day: 'Sep 23', sales: Math.round(72 * baseMult) },
      { day: 'Sep 25', sales: Math.round(85 * baseMult) }
    ];
  }, [branch]);

  // Authentic Top Products by Category Data
  const topProductsByCategory = useMemo(() => [
    { cat: 'مفرق', salesLbp: 57061800, share: 42.41, itemsCount: 28 },
    { cat: 'عروض', salesLbp: 53550000, share: 39.80, itemsCount: 12 },
    { cat: 'جملة', salesLbp: 23940000, share: 17.79, itemsCount: 5 },
    { cat: 'Raw Materials', salesLbp: 0, share: 0.00, itemsCount: 3 }
  ], []);

  // Category Performance Table Data matching Video V4
  const categoryPerformance = useMemo(() => [
    { category: 'مفرق', units: '60 Units', revenue: formatCurrency(57061800) },
    { category: 'عروض', units: '12 Units', revenue: formatCurrency(53550000) },
    { category: 'جملة', units: '5 Units', revenue: formatCurrency(23940000) },
    { category: 'Raw Materials', units: '0 Units', revenue: formatCurrency(0) }
  ], [isUsd]);

  // Division Breakdown Data matching Video V4
  const divisionBreakdown = useMemo(() => [
    { division: 'عروض', share: 39.8, amount: formatCurrencyCompact(53550000) },
    { division: 'مربيات جملة', share: 12.9, amount: formatCurrencyCompact(17370000) },
    { division: 'مرطبان', share: 2.5, amount: formatCurrencyCompact(3405000) },
    { division: 'مونة بلدية مفرق', share: 2.0, amount: formatCurrencyCompact(2665000) },
    { division: 'كيلو مفرق', share: 1.7, amount: formatCurrencyCompact(2231000) },
    { division: 'مربيات مفرق', share: 0.2, amount: formatCurrencyCompact(225000) }
  ], [isUsd]);

  // Menu Mix Data (Division breakdown)
  const menuMixData = useMemo(() => [
    { dept: 'عروض', share: 39.8, amount: formatCurrencyCompact(53550000) },
    { dept: 'مربيات جملة', share: 12.9, amount: formatCurrencyCompact(17370000) },
    { dept: 'مرطبان', share: 2.5, amount: formatCurrencyCompact(3405000) },
    { dept: 'مونة بلدية مفرق', share: 2.0, amount: formatCurrencyCompact(2665000) },
    { dept: 'كيلو مفرق', share: 1.7, amount: formatCurrencyCompact(2231000) },
    { dept: 'مربيات مفرق', share: 0.2, amount: formatCurrencyCompact(225000) }
  ], [isUsd]);

  // Weekday Pattern Data matching V4
  const weekdayPattern = useMemo(() => [
    { day: 'Monday', percent: 12, amount: formatCurrencyCompact(16146000) },
    { day: 'Tuesday', percent: 18, amount: formatCurrencyCompact(24219000) },
    { day: 'Wednesday', percent: 45, amount: formatCurrencyCompact(60548000) },
    { day: 'Thursday', percent: 10, amount: formatCurrencyCompact(13455000) },
    { day: 'Friday', percent: 8, amount: formatCurrencyCompact(10764000) },
    { day: 'Saturday', percent: 7, amount: formatCurrencyCompact(9419800) },
    { day: 'Sunday', percent: 0, amount: formatCurrencyCompact(0) }
  ], [isUsd]);

  // Dynamic Not Sold Items
  const notSoldItemsList = useMemo(() => {
    return allMasterProducts.filter(item => item.soldUnits === 0);
  }, [allMasterProducts]);

  // Dynamic Low Cost Items (Interactive Threshold)
  const filteredLowCostItems = useMemo(() => {
    return allMasterProducts.filter(item => item.costPercent <= appliedLowCostThreshold);
  }, [allMasterProducts, appliedLowCostThreshold]);

  // Dynamic High Cost Items (Interactive Threshold)
  const filteredHighCostItems = useMemo(() => {
    return allMasterProducts.filter(item => item.costPercent >= appliedHighCostThreshold);
  }, [allMasterProducts, appliedHighCostThreshold]);

  // Authentic Quick Insights Takeaways from Video V4
  const quickInsights = useMemo(() => {
    return [
      { id: 1, title: 'Top branch', text: 'Zeit w zaytoun ljanoub drives 98.0% of filtered revenue.', icon: Award, color: 'text-amber-600 bg-amber-50' },
      { id: 2, title: 'Best category', text: 'مفرق generated 60 units in this period.', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
      { id: 3, title: 'Lead item', text: 'تنكة زيت زيتون فرجين بلدي 17.5 ليتر produced highest sales.', icon: Package, color: 'text-blue-600 bg-blue-50' },
      { id: 4, title: 'Peak weekday', text: 'Wed is the strongest trading day.', icon: Calendar, color: 'text-purple-600 bg-purple-50' }
    ];
  }, []);

  const toggleAccordion = (catName: string) => {
    setOpenAccordion(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 md:p-6 space-y-6 font-sans dir-ltr text-left">
      
      {/* HEADER TITLE BAR (Authentic from Video V4) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Product Insights
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Product analysis with item drill down from category to product
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-2xs shrink-0 self-start md:self-auto text-right">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">CURRENT SELECTION</span>
          <span className="text-xs font-bold text-slate-800">Sep 1 - Sep 30, {year} / September {year} / All allowed locations</span>
        </div>
      </div>

      {/* SECTION 1: TOP FILTER BAR (Full Width) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
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
              <option value="USD" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>USD ($)</option>
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

      {/* MASTER TWO COLUMNS LAYOUT (STICKY ITEM HIERARCHY + DYNAMIC INSIGHTS CONTENT) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* UNTOUCHED ITEM HIERARCHY SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-4 space-y-4 self-start print:hidden">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
            
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
              {isHierarchyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {isHierarchyOpen && (
              <div className="space-y-3.5 pt-1 text-xs">
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="جملة">جملة</option>
                    <option value="عروض">عروض</option>
                    <option value="مفرق">مفرق</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">DIVISION</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Divisions">All Divisions</option>
                    <option value="Plastic">Plastic</option>
                    <option value="عروض">عروض</option>
                    <option value="كيلو مفرق">كيلو مفرق</option>
                    <option value="مربيات جملة">مربيات جملة</option>
                    <option value="مربيات مفرق">مربيات مفرق</option>
                    <option value="مرطبان">مرطبان</option>
                    <option value="مونة بلدية مفرق">مونة بلدية مفرق</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">GROUP</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Groups">All Groups</option>
                    <option value="مرطبان 509">مرطبان 509</option>
                    <option value="زيت زيتون خضير مفرق">زيت زيتون خضير مفرق</option>
                    <option value="زيت زيتون فرجين مفرق">زيت زيتون فرجين مفرق</option>
                    <option value="قنينات بي">قنينات بي</option>
                    <option value="مرطبان 507">مرطبان 507</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500">PRODUCT SEARCH</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search item code or name..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

              </div>
            )}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT COLUMN WITH SPACIOUS GLOBAL MARGINS */}
        <main className="flex-1 min-w-0 space-y-8 w-full">

          {/* SECTION 2: ANALYSIS SCOPE (6 KPI CARDS STRICT 3-COLUMN GRID: 2 ROWS OF 3 WITH DISTINCT BORDERS) */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Analysis Scope: All products currently in scope</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Revenue</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{formatCurrency(totalScopeRevenueLbp)}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Units Sold</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{totalScopeUnits.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Avg Selling Price</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">LL 1,747,425.94</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Revenue Mix</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">100.0%</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Active Branches</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">1</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Products In Scope</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">45</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">+0.0% vs Sep {Number(year) - 1}</span>
              </div>

            </div>
          </div>

          {/* SECTION 3: SALES TREND (FULL WIDTH LINE CHART) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Sales Trend</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Daily net sales distribution across selected month ({dateRange} {year})</p>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Peak: Day 25
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SalesTrendTooltip />} />
                  <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 4: CATEGORY & DIVISION (2-COLUMN GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT BOX: CATEGORY PERFORMANCE TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Category Performance</span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
                      <th className="py-3.5 px-4 font-semibold">UNITS</th>
                      <th className="py-3.5 px-4 font-semibold">REVENUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {categoryPerformance.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">{row.category}</td>
                        <td className="py-3.5 px-4 font-mono font-normal text-slate-600">{row.units}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">{row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT BOX: DIVISION BREAKDOWN (PROGRESS BARS) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Division Breakdown</span>
              </h3>

              <div className="space-y-4 pt-1">
                {divisionBreakdown.map((div, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-medium">{div.division}</span>
                      <span className="font-mono text-slate-900 font-bold">{div.amount} ({div.share}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${div.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION 5: MIX & PATTERNS (3-COLUMN GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* BOX 1: TOP PRODUCTS (COLLAPSIBLE ACCORDION LIST) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Top Products</span>
              </h3>

              <div className="space-y-3 pt-1">
                {Object.keys(openAccordion).map((catKey) => (
                  <div key={catKey} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(catKey)}
                      className="w-full bg-slate-50 p-2.5 text-xs font-extrabold text-slate-800 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <span>{catKey}</span>
                      {openAccordion[catKey] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    {openAccordion[catKey] && (
                      <div className="p-3 space-y-2.5 bg-white text-xs">
                        {allMasterProducts.filter(p => p.category === catKey || catKey.includes(p.category.split(' ')[0])).slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center justify-between pb-2 border-b border-slate-100 last:border-none last:pb-0">
                            <div>
                              <span className="font-semibold text-slate-900 block truncate max-w-[160px]">{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                            </div>
                            <span className="font-mono text-emerald-600 font-bold">{formatCurrencyCompact(item.priceLbp * item.soldUnits)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BOX 2: MENU MIX (HORIZONTAL BARS) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Menu Mix</span>
              </h3>

              <div className="space-y-4 pt-1">
                {menuMixData.map((mix, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-medium">{mix.dept}</span>
                      <span className="font-mono text-slate-900 font-bold">{mix.amount} ({mix.share}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${mix.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOX 3: WEEKDAY PATTERN (HORIZONTAL BARS) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Weekday Pattern</span>
              </h3>

              <div className="space-y-2.5 pt-1">
                {weekdayPattern.map((wp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-700">{wp.day}</span>
                      <span className="font-mono text-slate-900">{wp.amount} ({wp.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${wp.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION 6: QUICK INSIGHTS (VERTICAL STACK LIST ITEMS) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Quick Insights (Takeaways from current dataset)</span>
            </h3>

            <div className="flex flex-col gap-3">
              {quickInsights.map((insight) => {
                const IconComp = insight.icon;
                return (
                  <div key={insight.id} className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${insight.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{insight.title}</span>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5 leading-relaxed">
                          {insight.text}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 bg-white px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-center">
                      Verified
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: PRODUCT ANALYSIS & NOT SOLD ITEMS */}
          <div className="space-y-4">
            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Product Analysis: Moved from Backoffice and grouped here for deeper item-level review</span>
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Not Sold Items</span>
                </h3>
                <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                  479 Items
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide sticky top-0">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
                      <th className="py-3.5 px-4 font-semibold">ITEM CODE</th>
                      <th className="py-3.5 px-4 font-semibold">ITEM NAME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {notSoldItemsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-600">{item.category}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 font-normal">{item.code}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 8: COST ANALYSIS (2-COLUMN DYNAMIC INTERACTIVE TABLES) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT BOX: LOW COST ITEMS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Low Cost Items</span>
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-600">COST &lt;= [%]:</span>
                  <input
                    type="number"
                    value={lowCostInput}
                    onChange={(e) => setLowCostInput(Number(e.target.value))}
                    className="w-16 p-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 text-xs"
                  />
                  <button
                    onClick={() => setAppliedLowCostThreshold(lowCostInput)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
                      <th className="py-3.5 px-4 font-semibold">ITEM</th>
                      <th className="py-3.5 px-4 font-semibold">COST %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {filteredLowCostItems.length > 0 ? (
                      filteredLowCostItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-600">{row.category}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">{row.name}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{row.costPercent}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-xs text-slate-400 font-semibold">
                          No low cost items found for threshold &lt;= {appliedLowCostThreshold}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT BOX: HIGH COST ITEMS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>High Cost Items</span>
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-600">COST &gt;= [%]:</span>
                  <input
                    type="number"
                    value={highCostInput}
                    onChange={(e) => setHighCostInput(Number(e.target.value))}
                    className="w-16 p-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 text-xs"
                  />
                  <button
                    onClick={() => setAppliedHighCostThreshold(highCostInput)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
                      <th className="py-3.5 px-4 font-semibold">ITEM</th>
                      <th className="py-3.5 px-4 font-semibold">COST %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {filteredHighCostItems.length > 0 ? (
                      filteredHighCostItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-600">{row.category}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">{row.name}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{row.costPercent}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-xs text-slate-400 font-semibold">
                          No high cost items found for threshold &gt;= {appliedHighCostThreshold}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
