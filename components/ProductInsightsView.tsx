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

export default function ProductInsightsView() {
  // 1. TOP FILTER STATES
  const [branch, setBranch] = useState<string>('All Branches');
  const [currency, setCurrency] = useState<string>('LBP');
  const [year, setYear] = useState<string>('2026');
  const [dateRange, setDateRange] = useState<string>('August');

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
    'Raw Materials & Olive Oil': true,
    'Bottles & Jars': true,
    'Services & Pressing': false
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
    return `LBP ${(amountLbp / 1000000).toFixed(1)}M`;
  };

  const formatCurrencyCompact = (amountLbp: number) => {
    if (isUsd) {
      return `$${(amountLbp / 89500).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `LBP ${(amountLbp / 1000000).toFixed(1)}M`;
  };

  // Base raw items database for dynamic filtering
  const allMasterProducts = useMemo(() => [
    { code: 'ITM-001', name: 'Raw Olive Leaves Bulk', category: 'Raw Materials & Olive Oil', division: 'Bulk', group: 'Raw Materials', costPercent: 4.2, priceLbp: 15000, soldUnits: 0 },
    { code: 'ITM-008', name: 'Standard Soap Wrapper', category: 'Soaps & Derivatives', division: 'Retail', group: 'Packaging', costPercent: 6.5, priceLbp: 8000, soldUnits: 1200 },
    { code: 'ITM-014', name: 'Empty Glass Jar 500ml', category: 'Bottles & Jars', division: 'Retail', group: 'Glassware', costPercent: 8.9, priceLbp: 25000, soldUnits: 850 },
    { code: 'ITM-102', name: 'Extra Virgin Olive Oil 16L Tin', category: 'Raw Materials & Olive Oil', division: 'Wholesale Drums', group: 'Tin Cans 16L', costPercent: 12.5, priceLbp: 90000000, soldUnits: 2450 },
    { code: 'ITM-105', name: 'Glass Bottle Olive Oil 750ml', category: 'Bottles & Jars', division: 'Retail Products', group: 'Glass Bottles', costPercent: 15.8, priceLbp: 30000000, soldUnits: 4100 },
    { code: 'ITM-109', name: 'Filtered Pomace Testing Service', category: 'Services & Pressing', division: 'Factory Services', group: 'Services', costPercent: 18.0, priceLbp: 5000000, soldUnits: 0 },
    { code: 'ITM-201', name: 'Olive Pressing Service per Ton', category: 'Services & Pressing', division: 'Factory Services', group: 'Bulk Services', costPercent: 14.2, priceLbp: 80000000, soldUnits: 1200 },
    { code: 'ITM-204', name: 'Organic Laurel Olive Soap Pack', category: 'Soaps & Derivatives', division: 'Retail Products', group: 'Soaps', costPercent: 9.8, priceLbp: 13000000, soldUnits: 3500 },
    { code: 'ITM-210', name: 'Virgin Olive Oil 4L Bottle', category: 'Raw Materials & Olive Oil', division: 'Retail Products', group: 'Plastic Bottles', costPercent: 16.0, priceLbp: 20000000, soldUnits: 1800 },
    { code: 'ITM-302', name: 'Stainless Steel Tap 16L', category: 'Hardware', division: 'Wholesale', group: 'Accessories', costPercent: 24.5, priceLbp: 145000, soldUnits: 340 },
    { code: 'ITM-315', name: 'Imported Ceramic Oil Dispenser', category: 'Hardware', division: 'Wholesale', group: 'Accessories', costPercent: 31.2, priceLbp: 320000, soldUnits: 180 },
    { code: 'ITM-401', name: 'Organic Cold Press Enzyme Additive', category: 'Chemicals & Testing', division: 'Factory Services', group: 'Chemicals', costPercent: 28.0, priceLbp: 210000, soldUnits: 95 },
    { code: 'SKU-902', name: 'Olive Cake Charcoal Bricks (5kg)', category: 'Byproducts', division: 'Wholesale', group: 'Byproducts', costPercent: 11.0, priceLbp: 45000, soldUnits: 0 },
    { code: 'SKU-405', name: 'Dark Glass Marasca Bottle 250ml', category: 'Bottles & Jars', division: 'Retail', group: 'Glassware', costPercent: 7.4, priceLbp: 18000, soldUnits: 0 }
  ], []);

  // Filtered dataset reactive to category, division, group, search, and branch
  const filteredProducts = useMemo(() => {
    return allMasterProducts.filter(item => {
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
      if (selectedDivision !== 'All Divisions' && item.division !== selectedDivision) return false;
      if (selectedGroup !== 'All Groups' && item.group !== selectedGroup) return false;
      if (productSearch.trim() && !item.name.toLowerCase().includes(productSearch.toLowerCase()) && !item.code.toLowerCase().includes(productSearch.toLowerCase())) return false;
      return true;
    });
  }, [allMasterProducts, selectedCategory, selectedDivision, selectedGroup, productSearch]);

  // Dynamic KPI Scope Metrics
  const totalScopeRevenueLbp = useMemo(() => {
    return filteredProducts.reduce((acc, item) => acc + (item.priceLbp * item.soldUnits), 0) || 620000000;
  }, [filteredProducts]);

  const totalScopeUnits = useMemo(() => {
    return filteredProducts.reduce((acc, item) => acc + item.soldUnits, 0) || 14250;
  }, [filteredProducts]);

  const avgSellingPriceLbp = useMemo(() => {
    return totalScopeUnits > 0 ? totalScopeRevenueLbp / totalScopeUnits : 43500;
  }, [totalScopeRevenueLbp, totalScopeUnits]);

  // Dynamic Sales Trend Chart Data
  const salesTrendData = useMemo(() => {
    const baseMult = branch === 'Beirut Branch' ? 0.4 : (branch === 'Southern Olive SARL' ? 0.72 : 1.0);
    return [
      { day: 'Aug 1', sales: Math.round(18 * baseMult) },
      { day: 'Aug 3', sales: Math.round(24 * baseMult) },
      { day: 'Aug 5', sales: Math.round(32 * baseMult) },
      { day: 'Aug 7', sales: Math.round(28 * baseMult) },
      { day: 'Aug 9', sales: Math.round(45 * baseMult) },
      { day: 'Aug 11', sales: Math.round(38 * baseMult) },
      { day: 'Aug 13', sales: Math.round(52 * baseMult) },
      { day: 'Aug 15', sales: Math.round(48 * baseMult) },
      { day: 'Aug 17', sales: Math.round(60 * baseMult) },
      { day: 'Aug 19', sales: Math.round(55 * baseMult) },
      { day: 'Aug 21', sales: Math.round(68 * baseMult) },
      { day: 'Aug 23', sales: Math.round(72 * baseMult) },
      { day: 'Aug 25', sales: Math.round(85 * baseMult) }
    ];
  }, [branch]);

  // Category Performance Table Data
  const categoryPerformance = useMemo(() => [
    { category: 'Extra Virgin Olive Oil', units: '6,250 L', revenue: formatCurrency(320000000) },
    { category: 'Bottled Oil & Jars', units: '3,800 Bottles', revenue: formatCurrency(145000000) },
    { category: 'Pressing Services', units: '2,400 Tons', revenue: formatCurrency(125000000) },
    { category: 'Soaps & Byproducts', units: '1,800 Pcs', revenue: formatCurrency(30000000) }
  ], [isUsd]);

  // Division Breakdown Data
  const divisionBreakdown = useMemo(() => [
    { division: 'Retail Olive Oil (زيت مفرق)', share: 52, amount: formatCurrencyCompact(322400000) },
    { division: 'Wholesale Drums (براميل جملة)', share: 25, amount: formatCurrencyCompact(155000000) },
    { division: 'Extraction & Pressing (عصر الزيتون)', share: 15, amount: formatCurrencyCompact(93000000) },
    { division: 'Organic Soaps & Derivatives (صابون بلدي)', share: 8, amount: formatCurrencyCompact(49600000) }
  ], [isUsd]);

  // Menu Mix Data
  const menuMixData = useMemo(() => [
    { dept: 'MAIN DEPARTMENT', share: 62, amount: formatCurrencyCompact(384400000) },
    { dept: 'Showroom & Retail', share: 24, amount: formatCurrencyCompact(148800000) },
    { dept: 'Direct Factory Sales', share: 14, amount: formatCurrencyCompact(86800000) }
  ], [isUsd]);

  // Weekday Pattern Data
  const weekdayPattern = useMemo(() => [
    { day: 'Monday', percent: 65, amount: formatCurrencyCompact(82000000) },
    { day: 'Tuesday', percent: 60, amount: formatCurrencyCompact(78000000) },
    { day: 'Wednesday', percent: 70, amount: formatCurrencyCompact(88000000) },
    { day: 'Thursday', percent: 75, amount: formatCurrencyCompact(95000000) },
    { day: 'Friday', percent: 85, amount: formatCurrencyCompact(105000000) },
    { day: 'Saturday', percent: 95, amount: formatCurrencyCompact(112000000) },
    { day: 'Sunday', percent: 48, amount: formatCurrencyCompact(60000000) }
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

  // Dynamic Quick Insights Takeaways
  const quickInsights = useMemo(() => {
    return [
      { id: 1, title: 'Top Performing Branch', text: `${branch === 'All Branches' ? 'Southern Olive SARL' : branch} generates the leading product volume in ${dateRange}.`, icon: Award, color: 'text-amber-600 bg-amber-50' },
      { id: 2, title: 'Best Category Performance', text: `Extra Virgin Olive Oil dominates revenue with ${formatCurrencyCompact(320000000)} across ${dateRange}.`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
      { id: 3, title: 'Lead Product Item', text: `Extra Virgin Olive Oil 16L Tin is the #1 item with 2,450 units sold (${formatCurrencyCompact(220500000)}).`, icon: Package, color: 'text-blue-600 bg-blue-50' },
      { id: 4, title: 'Peak Sales Distribution', text: `Saturday represents peak activity with 95% volume (${formatCurrencyCompact(112000000)}).`, icon: Calendar, color: 'text-purple-600 bg-purple-50' }
    ];
  }, [branch, dateRange, isUsd]);

  const toggleAccordion = (catName: string) => {
    setOpenAccordion(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 md:p-6 space-y-6 font-sans dir-ltr text-left">
      
      {/* HEADER TITLE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Products Insights</span>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
            منتوجات زيت وزيتون الجنوب (Southern Olive Oil and Products SARL.)
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Product performance analysis, menu mix breakdown, weekday distribution, and cost structure engine.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-2xs shrink-0 self-start md:self-auto">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Current Scope</span>
          <span className="text-xs font-mono font-black text-slate-900">{dateRange} 1 - {dateRange} 31, {year}</span>
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
                    <option value="Raw Materials & Olive Oil">Raw Materials & Olive Oil</option>
                    <option value="Bottles & Jars">Bottles & Jars</option>
                    <option value="Services & Pressing">Services & Pressing</option>
                    <option value="Soaps & Derivatives">Soaps & Derivatives</option>
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
                    <option value="Retail Products">Retail Products</option>
                    <option value="Wholesale Drums">Wholesale Drums</option>
                    <option value="Factory Services">Factory Services</option>
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
                    <option value="Glass Bottles">Glass Bottles</option>
                    <option value="Tin Cans 16L">Tin Cans 16L</option>
                    <option value="Bulk Services">Bulk Services</option>
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
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">+14.2% MTD</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Units Sold</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{totalScopeUnits.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">+8.5% Vol</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Avg Selling Price</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{formatCurrencyCompact(avgSellingPriceLbp)}</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">Weighted</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Revenue Mix</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">100.0%</span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full inline-block">Active Scope</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Active Branches</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{branch === 'All Branches' ? '2 Hubs' : '1 Hub'}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block">Synced</span>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">Products In Scope</span>
                <span className="text-xl md:text-2xl font-black text-slate-900 font-mono block truncate">{filteredProducts.length} Items</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">Filtered</span>
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
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
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
                  {notSoldItemsList.length} Items
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
