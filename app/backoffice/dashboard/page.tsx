'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Ticket, 
  Clock, 
  RefreshCw, 
  BarChart3, 
  Scale, 
  Boxes, 
  UserCircle2, 
  Truck, 
  Users, 
  Globe, 
  Maximize2, 
  Minimize2,
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  ChevronsUp,
  Info,
  CheckCircle2,
  X,
  ArrowUp
} from 'lucide-react';

export default function AuthenticOmegaSalesDashboard() {
  // Filters
  const [selectedBranch, setSelectedBranch] = useState('00001');
  const [selectedCurrency, setSelectedCurrency] = useState<'LBP' | 'USD'>('LBP');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('9'); // September
  const [selectedDay, setSelectedDay] = useState('ALL');
  
  // Chart Mode: Pie or Line
  const [chartMode, setChartMode] = useState<'pie' | 'line'>('pie');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'summary' | 'comparative' | 'customers' | 'today' | 'geographics'>('summary');

  // Enlarge state
  const [enlargedWidget, setEnlargedWidget] = useState<string | null>(null);

  // Loading & Modal
  const [recalculating, setRecalculating] = useState(false);
  const [eodModalOpen, setEodModalOpen] = useState(false);

  // Scroll to top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const usdRate = 89500;

  // Format Helper matching exact screenshot
  const formatVal = (lbpAmount: number, forceFormat?: 'full' | 'short') => {
    if (selectedCurrency === 'USD') {
      const usdVal = lbpAmount / usdRate;
      if (forceFormat === 'short') {
        if (Math.abs(usdVal) >= 1000000) return `$${(usdVal / 1000000).toFixed(1)}M`;
        if (Math.abs(usdVal) >= 1000) return `$${(usdVal / 1000).toFixed(1)}K`;
        return `$${usdVal.toFixed(2)}`;
      }
      return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // LBP format
    if (forceFormat === 'short') {
      if (Math.abs(lbpAmount) >= 1000000000) {
        return `${(lbpAmount / 1000000000).toFixed(1)} B LL`;
      }
      if (Math.abs(lbpAmount) >= 1000000) {
        return `${(lbpAmount / 1000000).toFixed(1)} M LL`;
      }
      if (lbpAmount === 0) return '0.00 LL';
      return `${lbpAmount.toLocaleString()} LL`;
    }

    if (lbpAmount === 0) return '0.00 LL';
    return `${lbpAmount.toLocaleString()} LL`;
  };

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
    }, 600);
  };

  const toggleEnlarge = (widgetName: string) => {
    setEnlargedWidget(enlargedWidget === widgetName ? null : widgetName);
  };

  // Month list with Quarters as requested
  const monthsList = [
    { id: '0', label: 'All Months' },
    { id: '1', label: 'January' },
    { id: '2', label: 'February' },
    { id: '3', label: 'March' },
    { id: '4', label: 'April' },
    { id: '5', label: 'May' },
    { id: '6', label: 'June' },
    { id: '7', label: 'July' },
    { id: '8', label: 'August' },
    { id: '9', label: 'September' },
    { id: '10', label: 'October' },
    { id: '11', label: 'November' },
    { id: '12', label: 'December' },
    { id: 'Q1', label: 'First Quarter' },
    { id: 'Q2', label: 'Second Quarter' },
    { id: 'Q3', label: 'Third Quarter' },
    { id: 'Q4', label: 'Fourth Quarter' },
  ];

  // Days list (September)
  const daysList = [
    { id: 'ALL', label: 'All Days' },
    { id: '1', label: 'Tuesday 1' },
    { id: '2', label: 'Wednesday 2' },
    { id: '3', label: 'Thursday 3' },
    { id: '4', label: 'Friday 4' },
    { id: '5', label: 'Saturday 5' },
    { id: '6', label: 'Sunday 6' },
    { id: '7', label: 'Monday 7' },
    { id: '8', label: 'Tuesday 8' },
    { id: '9', label: 'Wednesday 9' },
    { id: '10', label: 'Thursday 10' },
    { id: '11', label: 'Friday 11' },
    { id: '12', label: 'Saturday 12' },
    { id: '13', label: 'Sunday 13' },
    { id: '14', label: 'Monday 14' },
    { id: '15', label: 'Tuesday 15' },
  ];

  // Monthly Revenue Data (Green bar chart values from screenshot)
  const monthlyBarData = [
    { month: 'January', val: 3104932430, label: '3.1B', pct: '+100.0%' },
    { month: 'February', val: 2101095942, label: '2.1B', pct: '+100.0%' },
    { month: 'March', val: 332743800, label: '333M', pct: '+100.0%' },
    { month: 'April', val: 647849550, label: '648M', pct: '+100.0%' },
    { month: 'May', val: 192590050, label: '193M', pct: '+100.0%' },
    { month: 'June', val: 662845750, label: '663M', pct: '+100.0%' },
    { month: 'July', val: 1784311315, label: '1.8B', pct: '+100.0%' },
    { month: 'August', val: 1863715000, label: '1.9B', pct: '+100.0%' },
    { month: 'September', val: 131851800, label: '132M', pct: '+100.0%' },
    { month: 'October', val: 0, label: '0', pct: '0.0%' },
    { month: 'November', val: 0, label: '0', pct: '0.0%' },
    { month: 'December', val: 0, label: '0', pct: '0.0%' },
  ];

  // Helper for generating SVG Pie Chart
  const renderPieSvg = (slices: { name: string; amount: number; color: string; pct: number }[]) => {
    let cumulative = 0;
    const total = slices.reduce((acc, s) => acc + s.amount, 0) || 1;
    
    if (slices.length === 1 || slices.filter(s => s.amount > 0).length === 1) {
      const active = slices.find(s => s.amount > 0) || slices[0];
      return (
        <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto my-2">
          <circle cx="50" cy="50" r="45" fill={active.color} />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto my-2">
        {slices.map((slice, i) => {
          if (slice.amount === 0) return null;
          const sliceFraction = slice.amount / total;
          const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
          cumulative += sliceFraction;
          const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

          const x1 = 50 + 45 * Math.cos(startAngle);
          const y1 = 50 + 45 * Math.sin(startAngle);
          const x2 = 50 + 45 * Math.cos(endAngle);
          const y2 = 50 + 45 * Math.sin(endAngle);

          const largeArcFlag = sliceFraction > 0.5 ? 1 : 0;
          const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path 
              key={i} 
              d={pathData} 
              fill={slice.color} 
              stroke="#ffffff" 
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
    );
  };

  // Pie chart datasets matching user screenshots
  const categorySlices = [
    { name: 'Raw Materials', amount: 0, color: '#2e7d32', pct: 0.00 },
    { name: 'جملة', amount: 23940000, color: '#1976d2', pct: 17.79 },
    { name: 'عروض', amount: 53550000, color: '#f59e0b', pct: 39.80 },
    { name: 'مفرق', amount: 57061800, color: '#d32f2f', pct: 42.41 },
  ];

  const divisionSlices = [
    { name: 'Plastic', amount: 0, color: '#2e7d32', pct: 0 },
    { name: 'زيوت مفرق', amount: 48500000, color: '#1976d2', pct: 36.05 },
    { name: 'عروض', amount: 53550000, color: '#f59e0b', pct: 39.80 },
    { name: 'عسل مفرق', amount: 4800000, color: '#d32f2f', pct: 3.57 },
    { name: 'كيلو مفرق', amount: 3761800, color: '#7c3aed', pct: 2.80 },
    { name: 'معصره مفرق', amount: 0, color: '#0f766e', pct: 0 },
    { name: 'مربيات جملة', amount: 0, color: '#b45309', pct: 0 },
    { name: 'مربيات مفرق', amount: 0, color: '#991b1b', pct: 0 },
    { name: 'معصره جملة', amount: 23940000, color: '#334155', pct: 17.79 },
    { name: 'دوفه بلديه مفرق', amount: 0, color: '#84cc16', pct: 0 },
  ];

  const groupSlices = [
    { name: 'مرطبان 500', amount: 2235000, color: '#2e7d32', pct: 1.66 },
    { name: 'Plastic Gallon', amount: 0, color: '#1976d2', pct: 0.00 },
    { name: 'حبوب فلت', amount: 430000, color: '#f59e0b', pct: 0.32 },
    { name: 'رف', amount: 2235000, color: '#d32f2f', pct: 1.66 },
    { name: 'زيت زيتون عصير مفرق', amount: 9360000, color: '#7c3aed', pct: 6.96 },
    { name: 'زيت زيتون فرجين مفرق', amount: 39140000, color: '#0f766e', pct: 29.09 },
    { name: 'عروض', amount: 53550000, color: '#ea580c', pct: 39.80 },
    { name: 'عسل مفرق', amount: 4800000, color: '#991b1b', pct: 3.57 },
    { name: 'قنينات بي', amount: 0, color: '#ec4899', pct: 0.00 },
    { name: 'كيلو مفرق', amount: 3761800, color: '#475569', pct: 2.80 },
    { name: 'مربيات جملة', amount: 0, color: '#84cc16', pct: 0.00 },
    { name: 'مربيات مفرق', amount: 0, color: '#581c87', pct: 0.00 },
    { name: 'مرطبان 507', amount: 0, color: '#1e3a8a', pct: 0.00 },
    { name: 'مرطبان 510', amount: 0, color: '#dc2626', pct: 0.00 },
    { name: 'مكفوله باق جملة', amount: 19040000, color: '#4c1d95', pct: 14.15 },
  ];

  const departmentSlices = [
    { name: 'MAIN DEPARTMENT', amount: 107911800, color: '#2e7d32', pct: 81.84 },
    { name: 'Showroom', amount: 23940000, color: '#1976d2', pct: 18.16 },
  ];

  const discountSlices = [
    { name: 'DISCOUNT', amount: 2700000, color: '#2e7d32', pct: 100.00 },
  ];

  const userSlices = [
    { name: 'Hiba Aloulou', amount: 108031800, color: '#2e7d32', pct: 81.93 },
    { name: 'Mahdi', amount: 23820000, color: '#1976d2', pct: 18.07 },
  ];

  const paymentSlices = [
    { name: 'CASH', amount: 107911800, color: '#2e7d32', pct: 81.84 },
    { name: 'CASH USD', amount: 23940000, color: '#1976d2', pct: 18.16 },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans pb-16">
      <style jsx global>{`
        /* Authentic Omega Light Styles */
        .omega-panel-header {
          background-color: #e9f1f8;
          color: #1e293b;
          font-weight: 700;
          font-size: 14.5px;
          padding: 8px 14px;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1px solid #d8e5f2;
          border-bottom: none;
        }
        .omega-panel-actions {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #475569;
        }
        .omega-panel-body {
          background: #ffffff;
          border: 1px solid #d8e5f2;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          padding: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .omega-dense-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11.5px;
        }
        .omega-dense-table th, .omega-dense-table td {
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .omega-dense-table tr.header-row {
          background-color: #dce7f3;
          color: #0f172a;
          font-weight: 700;
        }
        .omega-dense-table tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .omega-dense-table tbody tr:hover {
          background-color: #f1f5f9;
        }

        /* Nav Tabs */
        .omega-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          text-decoration: none;
        }
        .omega-pill-btn:hover {
          background-color: #e2e8f0;
        }
        .omega-pill-btn.active {
          background-color: #111827;
          border-color: #111827;
          color: #ffffff !important;
        }
        .omega-circle-btn {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          color: #334155;
          cursor: pointer;
        }
        .omega-circle-btn.active {
          background-color: #111827;
          border-color: #111827;
          color: #ffffff;
        }
      `}</style>

      <div className="max-w-[1720px] mx-auto p-3 sm:p-4">
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-slate-900 mb-2">Sales Dashboard</h1>

        {/* Topbar Filter Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-3.5 flex flex-wrap items-center gap-2.5 shadow-sm">
          {/* Branch Select */}
          <div className="flex-1 min-w-[220px]">
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="00001">Zeit w zaytoun ljanoub</option>
              <option value="ALL">All Branches (001 - 006)</option>
              <option value="001">001 - Choueifat Main Facility</option>
              <option value="002">002 - Beirut Wholesale Hub</option>
              <option value="003">003 - Saida Southern Center</option>
              <option value="004">004 - Zahle Bekaa Branch</option>
              <option value="005">005 - Tripoli North Depot</option>
              <option value="006">006 - Nabatieh Center</option>
            </select>
          </div>

          {/* Currency */}
          <div className="w-24">
            <select 
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as 'LBP' | 'USD')}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="LBP">LBP</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {/* Year */}
          <div className="w-24">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Month */}
          <div className="w-36">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              {monthsList.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div className="w-32">
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              {daysList.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Export PDF */}
          <button 
            type="button"
            onClick={() => window.print()}
            className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition"
          >
            Export PDF
          </button>

          {/* EOD Button */}
          <button 
            type="button"
            onClick={() => setEodModalOpen(true)}
            className="border border-slate-300 hover:bg-slate-100 p-1.5 rounded text-slate-700 transition"
            title="Branches Last EOD Date"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Recalculate */}
          <button 
            type="button"
            onClick={handleRecalculate}
            className="border border-slate-300 hover:bg-slate-100 p-1.5 rounded text-slate-700 transition"
            title="Recalculate Data by Selected Branch and Month"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Reports link */}
          <Link 
            href="/backoffice/reportview"
            className="border border-slate-300 hover:bg-slate-100 p-1.5 rounded text-slate-700 transition"
            title="Reports"
          >
            <BarChart3 className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 SIGNATURE OMEGA METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3.5">
          
          {/* Card 1: Green (#2e6912) */}
          <div className="rounded-lg overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#2e6912' }}>
            <div className="w-12 bg-black/25 flex items-center justify-center text-white/90">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs">
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Net Sales</span>
                <span className="font-extrabold text-[13px]">{formatVal(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Receipts</span>
                <span className="font-semibold">{formatVal(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Discounts</span>
                <span className="font-semibold">{formatVal(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Refunds</span>
                <span className="font-semibold">{formatVal(0)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Navy (#0b3056) */}
          <div className="rounded-lg overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#0b3056' }}>
            <div className="w-12 bg-black/25 flex items-center justify-center text-white/90">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs">
              <div className="flex justify-between items-center">
                <span className="opacity-90">Gross Sales</span>
                <span className="font-semibold">{formatVal(134551800, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Discount</span>
                <span className="font-semibold">{formatVal(2700000, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Tax</span>
                <span className="font-semibold">{formatVal(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Net Sales</span>
                <span className="font-extrabold text-[13px]">{formatVal(131851800, 'short')}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Brown/Gold (#85681c) */}
          <div className="rounded-lg overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#85681c' }}>
            <div className="w-12 bg-black/25 flex items-center justify-center text-white/90">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">MTD:</span>
                  <span className="font-semibold">{formatVal(131851800, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">LYM:</span>
                  <span className="font-semibold">{formatVal(0)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">YTD:</span>
                  <span className="font-semibold">{formatVal(11900000000, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">LYTM:</span>
                  <span className="font-semibold">{formatVal(0)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Customer Aged</span>
                <span className="font-semibold">{formatVal(-104500000, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">MTD Receipts</span>
                <span className="font-extrabold text-[13px]">{formatVal(0)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Brick Red (#7d2811) */}
          <div className="rounded-lg overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#7d2811' }}>
            <div className="w-12 bg-black/25 flex items-center justify-center text-white/90">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Paid In:</span>
                  <span className="font-semibold">{formatVal(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Paid out:</span>
                  <span className="font-semibold">{formatVal(-40200000, 'short')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Voids:</span>
                  <span className="font-semibold">{formatVal(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Refunds:</span>
                  <span className="font-semibold">{formatVal(120000)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Avg. Invoice:</span>
                  <span className="font-semibold">{formatVal(3100000, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Avg. by Cust:</span>
                  <span className="font-semibold">{formatVal(3100000, 'short')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Cust. Count:</span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Inv. Count:</span>
                  <span className="font-semibold">42</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* REAL OMEGA NAVIGATION TABS STRIP */}
        <div className="flex items-center gap-1.5 mb-3.5 overflow-x-auto pb-1">
          <button 
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`omega-pill-btn ${activeTab === 'summary' ? 'active' : ''}`}
          >
            <Scale className="w-3.5 h-3.5" /> Summary
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('comparative')}
            className={`omega-pill-btn ${activeTab === 'comparative' ? 'active' : ''}`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Comparative
          </button>

          <Link 
            href="/product-insights"
            target="_blank"
            className="omega-pill-btn"
          >
            <Boxes className="w-3.5 h-3.5" /> Product Insights
          </Link>

          <Link 
            href="/backoffice/customers"
            target="_blank"
            className="omega-pill-btn"
          >
            <UserCircle2 className="w-3.5 h-3.5" /> Customer Insights
          </Link>

          {/* VTrack as requested by user instead of OTrack */}
          <Link 
            href="/backoffice/operations"
            target="_blank"
            className="omega-pill-btn"
          >
            <Truck className="w-3.5 h-3.5" /> VTrack
          </Link>

          <button 
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`omega-pill-btn ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users className="w-3.5 h-3.5" /> Customers
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('today')}
            className={`omega-pill-btn ${activeTab === 'today' ? 'active' : ''}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Today
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('geographics')}
            className={`omega-pill-btn ${activeTab === 'geographics' ? 'active' : ''}`}
          >
            <Globe className="w-3.5 h-3.5" /> Geographics
          </button>

          <div className="flex-1"></div>

          {/* Chart mode buttons */}
          <button 
            type="button"
            onClick={() => setChartMode('line')}
            className={`omega-circle-btn ${chartMode === 'line' ? 'active' : ''}`}
            title="Line Mode"
          >
            <LineChartIcon className="w-3.5 h-3.5" />
          </button>

          <button 
            type="button"
            onClick={() => setChartMode('pie')}
            className={`omega-circle-btn ${chartMode === 'pie' ? 'active' : ''}`}
            title="Pie Mode"
          >
            <PieChartIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TAB: SUMMARY */}
        {activeTab === 'summary' && (
          <div>
            {/* Performance Highlights Banner */}
            <div className="mb-3.5">
              <div className="omega-panel-header">
                Performance Highlights
              </div>
              <div className="omega-panel-body">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  
                  {/* Card 1: Revenue YoY */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #1976d2' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Revenue YoY</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>+100.0%</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      2026 Jan-Aug 10.7 B LL | 2025 Jan-Aug 0.00 LL
                    </div>
                  </div>

                  {/* Card 2: Best Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #2e7d32' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Best Month</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>January</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      3.1 B LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 3: Softest Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #f59e0b' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Softest Month</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>May</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      192.6 M LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 4: Top YoY Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #0f766e' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Top YoY Month</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>January</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      3.1 B LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 5: Best Category */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #7c3aed' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Best Category</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1">
                      مفرق
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      57.1 M LL
                    </div>
                  </div>

                  {/* Card 6: Peak Hour */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px]" style={{ borderTop: '3px solid #64748b' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Peak Hour</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 my-1">
                      10:00
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      7.3 M LL avg
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Monthly Revenue Banner & Green Bar Chart */}
            <div className={`mb-3.5 ${enlargedWidget === 'revenue' ? 'fixed inset-4 z-50 overflow-auto bg-white p-4 rounded-xl shadow-2xl' : ''}`}>
              <div className="omega-panel-header">
                Monthly Revenue
                <div className="omega-panel-actions">
                  <button 
                    type="button" 
                    onClick={() => toggleEnlarge('revenue')}
                    className="hover:text-blue-600"
                    title={enlargedWidget === 'revenue' ? 'Reduce' : 'Enlarge'}
                  >
                    {enlargedWidget === 'revenue' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                {/* Legend */}
                <div className="flex items-center justify-center gap-2 mb-3 text-xs text-slate-700">
                  <span className="w-3 h-3 bg-[#2e6912] rounded-sm inline-block"></span>
                  <span>Zeit w zaytoun ljanoub</span>
                </div>

                {/* Vertical Bars Container */}
                <div className="h-56 flex items-end justify-between gap-2 px-6 pt-6 pb-2 border-b border-slate-200">
                  {monthlyBarData.map((d, i) => {
                    const maxVal = 3200000000;
                    const heightPct = d.val > 0 ? (d.val / maxVal) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        {d.val > 0 && (
                          <span className="text-[10px] font-bold text-slate-700 mb-1">
                            {d.label}
                          </span>
                        )}
                        <div 
                          className="w-full max-w-[42px] bg-[#2e6912] hover:bg-emerald-700 rounded-t transition-all"
                          style={{ height: `${Math.max(heightPct, 3)}%` }}
                        ></div>
                        <span className="text-[10px] text-slate-600 mt-2 truncate max-w-full text-center">
                          {d.month}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Revenue Table */}
                <div className="overflow-x-auto mt-3">
                  <table className="omega-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left font-bold sticky-col">Branch</th>
                        <th>January</th>
                        <th>February</th>
                        <th>March</th>
                        <th>April</th>
                        <th>May</th>
                        <th>June</th>
                        <th>July</th>
                        <th>August</th>
                        <th>September</th>
                        <th>October</th>
                        <th>November</th>
                        <th>December</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="text-left font-semibold sticky-col bg-white">Zeit w zaytoun ljanoub</th>
                        {monthlyBarData.map((m, idx) => (
                          <td key={idx} className="text-right">
                            {m.val > 0 ? (
                              <div>
                                <div className="font-bold flex items-center justify-end gap-0.5 text-slate-800">
                                  {m.val.toLocaleString()}
                                  <span className="text-emerald-600 text-[9px]">▲</span>
                                </div>
                                <div className="text-[9.5px] text-slate-400">
                                  LY 0 ({m.pct})
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-500">0</div>
                                <div className="text-[9.5px] text-slate-400">LY 0 (0.0%)</div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="font-bold bg-slate-50">
                        <th className="text-left font-bold sticky-col bg-slate-50">Total</th>
                        {monthlyBarData.map((m, idx) => (
                          <td key={idx} className="text-right">
                            {m.val > 0 ? (
                              <div>
                                <div className="font-bold flex items-center justify-end gap-0.5 text-slate-800">
                                  {m.val.toLocaleString()}
                                  <span className="text-emerald-600 text-[9px]">▲</span>
                                </div>
                                <div className="text-[9.5px] text-slate-400">
                                  LY 0 ({m.pct})
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-500">0</div>
                                <div className="text-[9.5px] text-slate-400">LY 0 (0.0%)</div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Sales By Category & Sales By Division */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
              
              {/* Sales By Category */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'cat' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="omega-panel-header">
                  Sales By Category
                  <div className="omega-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('cat')}>
                      {enlargedWidget === 'cat' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(categorySlices)}
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-3 my-2 text-[11px] text-slate-700">
                    {categorySlices.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  {/* Table */}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Categories ↕</th>
                        <th className="text-right">134,551,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySlices.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales By Division */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'div' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="omega-panel-header">
                  Sales By Division
                  <div className="omega-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('div')}>
                      {enlargedWidget === 'div' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(divisionSlices)}
                  <div className="flex flex-wrap justify-center gap-2 my-2 text-[10.5px] text-slate-700">
                    {divisionSlices.filter(s => s.amount > 0).map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Divisions ↕</th>
                        <th className="text-right">134,551,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionSlices.slice(0, 5).map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 2-Column Grid: Sales By Group & Sales By Department */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
              
              {/* Sales By Group */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'grp' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="omega-panel-header">
                  Sales By Group
                  <div className="omega-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('grp')}>
                      {enlargedWidget === 'grp' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(groupSlices)}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Groups ↕</th>
                        <th className="text-right">134,551,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupSlices.slice(0, 6).map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales By Department */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'dept' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="omega-panel-header">
                  Sales By Department
                  <div className="omega-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('dept')}>
                      {enlargedWidget === 'dept' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(departmentSlices)}
                  <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700">
                    {departmentSlices.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Departments ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentSlices.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 2-Column Grid: Discount Summary & Discount By Category Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
              
              {/* Discount Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="omega-panel-header">
                  Discount Summary
                  <div className="omega-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(discountSlices)}
                  <div className="flex justify-center gap-2 my-2 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 bg-[#2e7d32] rounded-sm inline-block"></span>
                    <span>DISCOUNT</span>
                  </div>
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Discounts ↕</th>
                        <th className="text-right">2,700,000</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-medium">DISCOUNT</td>
                        <td className="text-right font-bold">2,700,000</td>
                        <td className="text-right text-slate-500">100.00%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discount By Category Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="omega-panel-header">
                  Discount By Category Summary
                  <div className="omega-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  <table className="omega-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Discount</th>
                        <th className="text-right">Raw Materials</th>
                        <th className="text-right">مفرق</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-bold">DISCOUNT</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold">2,700,000.00</td>
                        <td className="text-right font-black text-slate-900">2,700,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* User Summary & Payment Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
              
              {/* User Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="omega-panel-header">
                  User Summary
                  <div className="omega-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(userSlices)}
                  <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700 font-semibold">
                    {userSlices.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Users ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSlices.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="omega-panel-header">
                  Payment Summary
                  <div className="omega-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="omega-panel-body">
                  {renderPieSvg(paymentSlices)}
                  <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700 font-semibold">
                    {paymentSlices.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Payments ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSlices.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{s.amount.toLocaleString()}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Sales By Employee By Category (Full Width) */}
            <div className="mb-6 bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Sales By Employee By Category
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                <table className="omega-dense-table">
                  <thead>
                    <tr className="header-row">
                      <th className="text-left">User Name</th>
                      <th className="text-right">Raw Materials</th>
                      <th className="text-right">جملة</th>
                      <th className="text-right">عروض</th>
                      <th className="text-right">مفرق</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left font-bold">Hiba Aloulou</td>
                      <td className="text-right">0</td>
                      <td className="text-right">0</td>
                      <td className="text-right">53,550,000</td>
                      <td className="text-right">54,481,800</td>
                      <td className="text-right font-extrabold text-slate-900">108,031,800</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Mahdi</td>
                      <td className="text-right">0</td>
                      <td className="text-right">23,940,000</td>
                      <td className="text-right">0</td>
                      <td className="text-right">-120,000</td>
                      <td className="text-right font-extrabold text-slate-900">23,820,000</td>
                    </tr>
                    <tr className="header-row">
                      <th className="text-left font-black">Total</th>
                      <td className="text-right font-black">0</td>
                      <td className="text-right font-black">23,940,000</td>
                      <td className="text-right font-black">53,550,000</td>
                      <td className="text-right font-black">54,361,800</td>
                      <td className="text-right font-black text-slate-950">131,851,800</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: COMPARATIVE */}
        {activeTab === 'comparative' && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="omega-panel-header mb-3">
              Daily Summary (September 2026)
            </div>
            <div className="overflow-x-auto">
              <table className="omega-dense-table">
                <thead>
                  <tr className="header-row">
                    <th className="text-left">Branch</th>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <th key={d} className="text-center">{d}</th>
                    ))}
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left font-semibold">Zeit w zaytoun ljanoub</td>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <td key={d} className="text-right text-[10px]">
                        {d <= 5 ? (22000000 + d * 1800000).toLocaleString() : '-'}
                      </td>
                    ))}
                    <td className="text-right font-bold text-emerald-700">131,851,800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="omega-panel-header mb-3">
              Customers Ledger Summary
            </div>
            <table className="omega-dense-table">
              <thead>
                <tr className="header-row">
                  <th className="text-left">Customer</th>
                  <th className="text-left">Zone</th>
                  <th className="text-right">Transactions</th>
                  <th className="text-right">Total Billed</th>
                  <th className="text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left font-semibold">Spinneys Lebanon</td>
                  <td className="text-left">Beirut & Mount Lebanon</td>
                  <td className="text-right">18</td>
                  <td className="text-right font-bold">48,200,000 LL</td>
                  <td className="text-right text-emerald-600">0.00 LL</td>
                </tr>
                <tr>
                  <td className="text-left font-semibold">Carrefour Wholesale</td>
                  <td className="text-left">City Centre Hub</td>
                  <td className="text-right">12</td>
                  <td className="text-right font-bold">38,500,000 LL</td>
                  <td className="text-right text-emerald-600">0.00 LL</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: TODAY */}
        {activeTab === 'today' && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="omega-panel-header mb-3">
              Today&apos;s Live Register Statistics
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 border rounded">
                <div className="text-xs text-slate-500">Today&apos;s Billed Checks</div>
                <div className="text-xl font-bold text-slate-800 mt-1">42 Invoices</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded">
                <div className="text-xs text-slate-500">Today&apos;s Total Volume</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">131.9 M LL</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded">
                <div className="text-xs text-slate-500">Open Registers</div>
                <div className="text-xl font-bold text-blue-700 mt-1">6 / 6 Active</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GEOGRAPHICS */}
        {activeTab === 'geographics' && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="omega-panel-header mb-3">
              Geographics Regional Performance
            </div>
            <table className="omega-dense-table">
              <thead>
                <tr className="header-row">
                  <th className="text-left">Governorate</th>
                  <th className="text-left">Primary Depot</th>
                  <th className="text-right">Sales Amount</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left font-bold">Mount Lebanon</td>
                  <td className="text-left">Choueifat Main Facility</td>
                  <td className="text-right font-bold">85,200,000 LL</td>
                  <td className="text-right">64.6%</td>
                </tr>
                <tr>
                  <td className="text-left font-bold">South Lebanon</td>
                  <td className="text-left">Saida Southern Center</td>
                  <td className="text-right font-bold">46,651,800 LL</td>
                  <td className="text-right">35.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer exactly as requested */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 flex flex-wrap justify-center gap-3">
          <span>© 2026 Vanguard Software. All rights reserved.</span>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms and Conditions</a>
          <span>|</span>
          <a href="#" className="hover:underline">Support</a>
          <span>|</span>
          <a href="#" className="hover:underline">Feedback</a>
        </div>

      </div>

      {/* FLOATING SCROLL TO TOP BUTTON matching screenshot */}
      <button 
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-40 w-11 h-11 bg-white hover:bg-slate-50 text-[#0284c7] border border-slate-200 rounded-lg shadow-md flex items-center justify-center transition"
        title="Scroll to Top"
      >
        <ChevronsUp className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* BRANCHES LAST EOD MODAL */}
      {eodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-xl w-full p-5 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base">Branches Last EOD Date & Status</h3>
              </div>
              <button onClick={() => setEodModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="omega-dense-table">
                <thead>
                  <tr className="header-row">
                    <th>Branch</th>
                    <th>Last EOD Date/Time</th>
                    <th>Status</th>
                    <th>Cashier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">00001 - Zeit w zaytoun ljanoub</td>
                    <td>2026-09-04 23:45</td>
                    <td><span className="text-emerald-700 font-bold">Closed</span></td>
                    <td>Hiba Aloulou</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setEodModalOpen(false)}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
