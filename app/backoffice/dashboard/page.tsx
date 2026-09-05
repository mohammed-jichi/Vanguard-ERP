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
  X
} from 'lucide-react';

export default function AuthenticOmegaSalesDashboard() {
  // Filters
  const [selectedBranch, setSelectedBranch] = useState('00001');
  const [selectedCurrency, setSelectedCurrency] = useState<'LBP' | 'USD'>('LBP');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('9'); // September
  const [selectedDay, setSelectedDay] = useState('ALL');
  
  // Chart Mode: Pie or Line (toggled from the top right pill bar)
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
        <svg viewBox="0 0 100 100" className="w-36 h-36 mx-auto my-2">
          <circle cx="50" cy="50" r="45" fill={active.color} />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto my-2">
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

  // Helper for generating SVG Line Chart (matching exact Line Mode screenshots)
  const renderLineSvg = (
    points: { label: string; amount: number }[],
    yMax: number,
    yTicks: string[],
    yMin: number = 0
  ) => {
    const width = 560;
    const height = 180;
    const paddingLeft = 65;
    const paddingRight = 35;
    const paddingTop = 20;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    const valRange = yMax - yMin || 1;

    const coords = points.map((p, i) => {
      const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * graphWidth;
      const normalized = (p.amount - yMin) / valRange;
      const y = paddingTop + graphHeight * (1 - Math.min(Math.max(normalized, 0), 1));
      return { x, y, ...p };
    });

    let pathD = '';
    if (coords.length === 1) {
      pathD = `M ${coords[0].x - 20} ${coords[0].y} L ${coords[0].x + 20} ${coords[0].y}`;
    } else {
      pathD = coords.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        return `${acc} L ${pt.x} ${pt.y}`;
      }, '');
    }

    return (
      <div className="w-full overflow-x-auto py-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[580px] mx-auto h-44 select-none">
          {/* Horizontal Grid lines and Y labels */}
          {yTicks.map((tick, idx) => {
            const yPos = paddingTop + (idx / Math.max(yTicks.length - 1, 1)) * graphHeight;
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={yPos} 
                  x2={width - paddingRight} 
                  y2={yPos} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={yPos + 3.5} 
                  fill="#64748b" 
                  fontSize="9.5" 
                  textAnchor="end"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical axis line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop} 
            x2={paddingLeft} 
            y2={height - paddingBottom} 
            stroke="#cbd5e1" 
            strokeWidth="1.2" 
          />

          {/* Green Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#2e7d32" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data Points */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r="3.8" 
                fill="#2e7d32" 
                stroke="#ffffff" 
                strokeWidth="1.8" 
              />
              {/* X Axis Label */}
              <text 
                x={pt.x} 
                y={height - paddingBottom + 16} 
                fill="#334155" 
                fontSize="9" 
                textAnchor="middle"
                className="truncate"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Datasets for Pie & Line modes
  const categoryData = [
    { label: 'Raw Materials', name: 'Raw Materials', amount: 0, color: '#2e7d32', pct: 0.00 },
    { label: 'جملة', name: 'جملة', amount: 23940000, color: '#1976d2', pct: 17.79 },
    { label: 'عروض', name: 'عروض', amount: 53550000, color: '#f59e0b', pct: 39.80 },
    { label: 'مفرق', name: 'مفرق', amount: 57061800, color: '#d32f2f', pct: 42.41 },
  ];

  const divisionData = [
    { label: 'Plastic', name: 'Plastic', amount: 0, color: '#2e7d32', pct: 0 },
    { label: 'عروض', name: 'عروض', amount: 53550000, color: '#f59e0b', pct: 39.80 },
    { label: 'كيلو مفرق', name: 'كيلو مفرق', amount: 2231000, color: '#7c3aed', pct: 1.66 },
    { label: 'مربيات جملة', name: 'مربيات جملة', amount: 17370000, color: '#b45309', pct: 12.91 },
    { label: 'مربيات مفرق', name: 'مربيات مفرق', amount: 225000, color: '#991b1b', pct: 0.17 },
    { label: 'مرطبان', name: 'مرطبان', amount: 3405000, color: '#1976d2', pct: 2.53 },
    { label: 'مونة بلدية مفرق', name: 'مونة بلدية مفرق', amount: 2665000, color: '#84cc16', pct: 1.98 },
  ];

  const groupData = [
    { label: 'مرطبان 509', name: 'مرطبان 509', amount: 2235000, color: '#2e7d32', pct: 1.66 },
    { label: 'زيت زيتون خضير مفرق', name: 'زيت زيتون خضير مفرق', amount: 9360000, color: '#7c3aed', pct: 6.96 },
    { label: 'زيت زيتون فرجين', name: 'زيت زيتون فرجين مفرق', amount: 39140000, color: '#0f766e', pct: 29.09 },
    { label: 'قنينات بي', name: 'قنينات بي', amount: 0, color: '#ec4899', pct: 0.00 },
    { label: 'مرطبان 507', name: 'مرطبان 507', amount: 0, color: '#1e3a8a', pct: 0.00 },
  ];

  const departmentData = [
    { label: 'MAIN DEPARTMENT', name: 'MAIN DEPARTMENT', amount: 107911800, color: '#2e7d32', pct: 81.84 },
    { label: 'Showroom', name: 'Showroom', amount: 23940000, color: '#1976d2', pct: 18.16 },
  ];

  const discountData = [
    { label: 'DISCOUNT', name: 'DISCOUNT', amount: 2700000, color: '#2e7d32', pct: 100.00 },
  ];

  const userData = [
    { label: 'Hiba Aloulou', name: 'Hiba Aloulou', amount: 108031800, color: '#2e7d32', pct: 81.93 },
    { label: 'Mahdi', name: 'Mahdi', amount: 23820000, color: '#1976d2', pct: 18.07 },
  ];

  const paymentData = [
    { label: 'CASH', name: 'CASH', amount: 107911800, color: '#2e7d32', pct: 81.84 },
    { label: 'CASH USD', name: 'CASH USD', amount: 23940000, color: '#1976d2', pct: 18.16 },
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
          transition: all 0.15s;
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

          {/* Month with Quarters */}
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

          {/* Chart mode toggle buttons: Line and Pie */}
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(categoryData)}
                      <div className="flex flex-wrap justify-center gap-3 my-2 text-[11px] text-slate-700">
                        {categoryData.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      categoryData,
                      60000000,
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0']
                    )
                  )}
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
                      {categoryData.map((s, i) => (
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(divisionData)}
                      <div className="flex flex-wrap justify-center gap-2 my-2 text-[10.5px] text-slate-700">
                        {divisionData.filter(s => s.amount > 0).map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      divisionData,
                      60000000,
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0']
                    )
                  )}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Divisions ↕</th>
                        <th className="text-right">134,551,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionData.map((s, i) => (
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
                  {chartMode === 'pie' ? (
                    renderPieSvg(groupData)
                  ) : (
                    renderLineSvg(
                      groupData,
                      60000000,
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0']
                    )
                  )}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Groups ↕</th>
                        <th className="text-right">134,551,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupData.map((s, i) => (
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(departmentData)}
                      <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700">
                        {departmentData.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      departmentData,
                      110000000,
                      ['110M', '100M', '90M', '80M', '70M', '60M', '50M', '40M', '30M', '20M'],
                      20000000
                    )
                  )}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Departments ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((s, i) => (
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(discountData)}
                      <div className="flex justify-center gap-2 my-2 text-xs font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 bg-[#2e7d32] rounded-sm inline-block"></span>
                        <span>DISCOUNT</span>
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      discountData,
                      3000000,
                      ['2.7M', '2.7M', '2.7M', '2.7M', '2.7M', '2.7M'],
                      2000000
                    )
                  )}
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(userData)}
                      <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700 font-semibold">
                        {userData.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      userData,
                      110000000,
                      ['110M', '100M', '90M', '80M', '70M', '60M', '50M', '40M', '30M', '20M'],
                      20000000
                    )
                  )}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Users ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.map((s, i) => (
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
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(paymentData)}
                      <div className="flex justify-center gap-4 my-2 text-[11px] text-slate-700 font-semibold">
                        {paymentData.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      paymentData,
                      110000000,
                      ['110M', '100M', '90M', '80M', '70M', '60M', '50M', '40M'],
                      20000000
                    )
                  )}
                  <table className="omega-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Payments ↕</th>
                        <th className="text-right">131,851,800</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.map((s, i) => (
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
          <div className="space-y-3.5">
            
            {/* 1. Daily Summary */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Daily Summary
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                {renderLineSvg(
                  [
                    { label: 'Tuesday, September 1', amount: 28000000 },
                    { label: 'Wednesday, September 2', amount: 57000000 },
                    { label: 'Thursday, September 3', amount: 22500000 },
                    { label: 'Friday, September 4', amount: 24300000 },
                  ],
                  60000000,
                  ['60M', '50M', '40M', '30M', '20M'],
                  20000000
                )}
              </div>
            </div>

            {/* 2. Monthly Sales By Category */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Monthly Sales By Category
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                {/* Multi-series Bar Chart (Jan - Dec) */}
                <div className="w-full overflow-x-auto py-2">
                  <svg viewBox="0 0 920 220" className="w-full min-w-[760px] h-52 select-none">
                    {/* Y-axis gridlines & labels */}
                    {['4B', '3B', '2B', '1B', '0'].map((tick, i) => {
                      const y = 20 + i * 40;
                      return (
                        <g key={i}>
                          <line x1="45" y1={y} x2="900" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                          <text x="38" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontWeight="500">
                            {tick}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars for Jan-Dec */}
                    {[
                      { m: 'January', segments: [{ c: '#1976d2', h: 84 }, { c: '#f59e0b', h: 22 }, { c: '#d32f2f', h: 18 }] },
                      { m: 'February', segments: [{ c: '#1976d2', h: 33 }, { c: '#f59e0b', h: 35 }, { c: '#d32f2f', h: 16 }] },
                      { m: 'March', segments: [{ c: '#2e7d32', h: 2 }, { c: '#f59e0b', h: 4.5 }, { c: '#d32f2f', h: 7 }] },
                      { m: 'April', segments: [{ c: '#1976d2', h: 2 }, { c: '#f59e0b', h: 10 }, { c: '#d32f2f', h: 14 }] },
                      { m: 'May', segments: [{ c: '#d32f2f', h: 8 }] },
                      { m: 'June', segments: [{ c: '#f59e0b', h: 16 }, { c: '#d32f2f', h: 10.5 }] },
                      { m: 'July', segments: [{ c: '#1976d2', h: 10 }, { c: '#f59e0b', h: 37 }, { c: '#d32f2f', h: 24 }] },
                      { m: 'August', segments: [{ c: '#f59e0b', h: 39 }, { c: '#d32f2f', h: 35 }] },
                      { m: 'September', segments: [{ c: '#1976d2', h: 1 }, { c: '#f59e0b', h: 2 }, { c: '#d32f2f', h: 2.5 }] },
                      { m: 'October', segments: [] },
                      { m: 'November', segments: [] },
                      { m: 'December', segments: [{ c: '#ef9a9a', h: 6 }] },
                    ].map((col, idx) => {
                      const barWidth = 28;
                      const x = 70 + idx * 70;
                      let currentY = 180;
                      return (
                        <g key={idx}>
                          {col.segments.map((seg, sIdx) => {
                            currentY -= seg.h;
                            return (
                              <rect
                                key={sIdx}
                                x={x}
                                y={currentY}
                                width={barWidth}
                                height={seg.h}
                                fill={seg.c}
                              />
                            );
                          })}
                          <text x={x + barWidth / 2} y="196" fill="#475569" fontSize="9.5" textAnchor="middle">
                            {col.m}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-end gap-x-4 gap-y-1.5 px-4 py-2 text-[11px] text-slate-700 font-medium border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#2e7d32] inline-block"></span> 2026 Raw Materials</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#81c784] inline-block"></span> 2025 Raw Materials</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#1976d2] inline-block"></span> 2026 جملة</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#90caf9] inline-block"></span> 2025 جملة</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#f59e0b] inline-block"></span> 2026 عروض</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#ffe082] inline-block"></span> 2025 عروض</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#d32f2f] inline-block"></span> 2026 مفرق</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#ef9a9a] inline-block"></span> 2025 مفرق</span>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto mt-2">
                  <table className="omega-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Category</th>
                        <th className="text-right">2026</th>
                        <th className="text-right">2025</th>
                        <th className="text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-semibold">Raw Materials</td>
                        <td className="text-right">0</td>
                        <td className="text-right">0</td>
                        <td className="text-right font-semibold">0</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold">جملة</td>
                        <td className="text-right">3,436,121,625</td>
                        <td className="text-right">50,023,000</td>
                        <td className="text-right font-semibold">3,386,098,625</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold">عروض</td>
                        <td className="text-right">3,947,922,600</td>
                        <td className="text-right">0</td>
                        <td className="text-right font-semibold">3,947,922,600</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold">مفرق</td>
                        <td className="text-right">3,522,529,075</td>
                        <td className="text-right">103,890,400</td>
                        <td className="text-right font-semibold">3,418,638,675</td>
                      </tr>
                      <tr className="header-row font-black">
                        <th className="text-left">Total</th>
                        <td className="text-right font-black">10,906,573,300</td>
                        <td className="text-right font-black">153,913,400</td>
                        <td className="text-right font-black text-slate-950">10,752,659,900</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. Average Sales by Hour */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Average Sales by Hour
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Left Hourly Table */}
                  <div className="lg:col-span-4 overflow-y-auto max-h-[220px]">
                    <table className="omega-dense-table">
                      <thead>
                        <tr className="header-row">
                          <th className="text-left">Average of All Hours ↕</th>
                          <th className="text-right">32,962,950 LL ↕</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { h: '00:00', val: '5,985,000 LL' },
                          { h: '09:00', val: '101,250 LL' },
                          { h: '10:00', val: '7,312,500 LL' },
                          { h: '11:00', val: '2,025,000 LL' },
                          { h: '12:00', val: '443,950 LL' },
                          { h: '13:00', val: '1,767,500 LL' },
                          { h: '14:00', val: '4,136,250 LL' },
                          { h: '15:00', val: '238,000 LL' },
                          { h: '16:00', val: '1,338,750 LL' },
                          { h: '17:00', val: '5,332,250 LL' },
                          { h: '18:00', val: '4,282,500 LL' },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="text-left font-semibold text-slate-700">{row.h}</td>
                            <td className="text-right font-medium text-slate-900">{row.val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Smooth Curved Line Chart */}
                  <div className="lg:col-span-8 overflow-x-auto">
                    <svg viewBox="0 0 600 200" className="w-full min-w-[480px] h-48 select-none">
                      {/* Grid Lines */}
                      {['8M', '7M', '6M', '5M', '4M', '3M', '2M', '1M', '0'].map((tick, i) => {
                        const y = 15 + i * 20;
                        return (
                          <g key={i}>
                            <line x1="45" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                            <text x="38" y={y + 3.5} fill="#64748b" fontSize="9" textAnchor="end" fontWeight="500">
                              {tick}
                            </text>
                          </g>
                        );
                      })}
                      {/* Vertical line */}
                      <line x1="45" y1="15" x2="45" y2="175" stroke="#cbd5e1" strokeWidth="1.2" />

                      {/* Smooth curved path */}
                      <path
                        d="M 60 55 C 90 90, 110 170, 140 172 C 170 172, 180 30, 210 28 C 240 28, 260 160, 290 166 C 320 170, 350 100, 380 97 C 410 95, 430 168, 460 167 C 490 165, 520 65, 550 68"
                        fill="none"
                        stroke="#2e7d32"
                        strokeWidth="2.2"
                      />

                      {/* Data Dots & X Labels */}
                      {[
                        { x: 60, y: 55, label: '00:00' },
                        { x: 140, y: 172, label: '' },
                        { x: 210, y: 28, label: '10:00' },
                        { x: 290, y: 166, label: '12:00' },
                        { x: 380, y: 97, label: '14:00' },
                        { x: 460, y: 167, label: '16:00' },
                        { x: 550, y: 68, label: '18:00' },
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="3.5" fill="#2e7d32" stroke="#ffffff" strokeWidth="1.5" />
                          {pt.label && (
                            <text x={pt.x} y="190" fill="#475569" fontSize="9" textAnchor="middle">
                              {pt.label}
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>

                </div>
              </div>
            </div>

            {/* 4. Sales by WeekDays */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Sales by WeekDays
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                {renderLineSvg(
                  [
                    { label: 'Tuesday', amount: 28000000 },
                    { label: 'Wednesday', amount: 57000000 },
                    { label: 'Thursday', amount: 22500000 },
                    { label: 'Friday', amount: 24300000 },
                  ],
                  60000000,
                  ['60M', '50M', '40M', '30M', '20M'],
                  20000000
                )}
              </div>
            </div>

            {/* 5. Yearly Revenue */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Yearly Revenue
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                <div className="w-full overflow-x-auto py-2">
                  <svg viewBox="0 0 800 240" className="w-full min-w-[600px] h-56 select-none">
                    {/* Y-axis gridlines & labels */}
                    {['12B', '10B', '8B', '6B', '4B', '2B', '0'].map((tick, i) => {
                      const y = 20 + i * 30;
                      return (
                        <g key={i}>
                          <line x1="45" y1={y} x2="780" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                          <text x="38" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontWeight="500">
                            {tick}
                          </text>
                        </g>
                      );
                    })}

                    {/* 2026 Multi-month Stacked Bar */}
                    <g>
                      {/* Stacked segments for 2026 total 10.9B */}
                      <rect x="120" y="32" width="290" height="24" fill="#831843" /> {/* September */}
                      <rect x="120" y="56" width="290" height="34" fill="#c2410c" /> {/* August */}
                      <rect x="120" y="90" width="290" height="32" fill="#0284c7" /> {/* July */}
                      <rect x="120" y="122" width="290" height="12" fill="#0d9488" /> {/* June */}
                      <rect x="120" y="134" width="290" height="4" fill="#7c3aed" /> {/* May */}
                      <rect x="120" y="138" width="290" height="12" fill="#dc2626" /> {/* April */}
                      <rect x="120" y="150" width="290" height="6" fill="#f59e0b" /> {/* March */}
                      <rect x="120" y="156" width="290" height="38" fill="#1976d2" /> {/* February */}
                      <rect x="120" y="194" width="290" height="6" fill="#2e7d32" /> {/* January */}
                      
                      <text x="265" y="215" fill="#334155" fontSize="11" fontWeight="bold" textAnchor="middle">
                        2026
                      </text>
                    </g>

                    {/* 2025 Thin Baseline Bar */}
                    <g>
                      <rect x="520" y="196" width="290" height="4" fill="#1e40af" />
                      <text x="665" y="215" fill="#334155" fontSize="11" fontWeight="bold" textAnchor="middle">
                        2025
                      </text>
                    </g>
                  </svg>
                </div>

                {/* 12-Month Legend */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 px-4 py-2 border-t border-slate-100 text-[10.5px] text-slate-700 font-medium text-center">
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#2e7d32] inline-block"></span> January</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#1976d2] inline-block"></span> February</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#f59e0b] inline-block"></span> March</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#dc2626] inline-block"></span> April</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#7c3aed] inline-block"></span> May</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#0d9488] inline-block"></span> June</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#0284c7] inline-block"></span> July</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#c2410c] inline-block"></span> August</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#831843] inline-block"></span> September</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#334155] inline-block"></span> October</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#84cc16] inline-block"></span> November</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 bg-[#1e3a8a] inline-block"></span> December</span>
                </div>
              </div>
            </div>

            {/* 6. Void Summary */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Void Summary
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body overflow-x-auto">
                <table className="omega-dense-table">
                  <thead>
                    <tr className="header-row">
                      <th className="text-left sticky-col">Branch</th>
                      <th className="text-right">January</th>
                      <th className="text-right">February</th>
                      <th className="text-right">March</th>
                      <th className="text-right">April</th>
                      <th className="text-right">May</th>
                      <th className="text-right">June</th>
                      <th className="text-right">July</th>
                      <th className="text-right">August</th>
                      <th className="text-right">September</th>
                      <th className="text-right">October</th>
                      <th className="text-right">November</th>
                      <th className="text-right">December</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="text-left font-semibold sticky-col bg-white">Zeit w zaytoun ljanoub</th>
                      <td className="text-right">142,231,750</td>
                      <td className="text-right">93,855,800</td>
                      <td className="text-right">2,619,850</td>
                      <td className="text-right">97,075,000</td>
                      <td className="text-right">11,393,300</td>
                      <td className="text-right">457,021,000</td>
                      <td className="text-right">19,500,000</td>
                      <td className="text-right">14,187,500</td>
                      <td className="text-right">0</td>
                      <td className="text-right">0</td>
                      <td className="text-right">0</td>
                      <td className="text-right">0</td>
                      <td className="text-right font-bold text-slate-900">837,884,200</td>
                    </tr>
                    <tr className="header-row font-bold">
                      <th className="text-left font-bold sticky-col">Total</th>
                      <td className="text-right font-bold">142,231,750</td>
                      <td className="text-right font-bold">93,855,800</td>
                      <td className="text-right font-bold">2,619,850</td>
                      <td className="text-right font-bold">97,075,000</td>
                      <td className="text-right font-bold">11,393,300</td>
                      <td className="text-right font-bold">457,021,000</td>
                      <td className="text-right font-bold">19,500,000</td>
                      <td className="text-right font-bold">14,187,500</td>
                      <td className="text-right font-bold">0</td>
                      <td className="text-right font-bold">0</td>
                      <td className="text-right font-bold">0</td>
                      <td className="text-right font-bold">0</td>
                      <td className="text-right font-black text-slate-950">837,884,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Comparative Monthly Sales By Employee */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="omega-panel-header">
                Comparative Monthly Sales By Employee
                <div className="omega-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="omega-panel-body">
                {/* Stacked Bars by Employee */}
                <div className="w-full overflow-x-auto py-2">
                  <svg viewBox="0 0 920 220" className="w-full min-w-[760px] h-52 select-none">
                    {/* Y-axis gridlines & labels */}
                    {['4B', '3B', '2B', '1B', '0'].map((tick, i) => {
                      const y = 20 + i * 40;
                      return (
                        <g key={i}>
                          <line x1="45" y1={y} x2="900" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                          <text x="38" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontWeight="500">
                            {tick}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars for Jan-Dec */}
                    {[
                      { m: 'January', segments: [{ c: '#2e7d32', h: 3 }, { c: '#1976d2', h: 20 }, { c: '#f59e0b', h: 15 }, { c: '#7c3aed', h: 86 }] },
                      { m: 'February', segments: [{ c: '#2e7d32', h: 7 }, { c: '#1976d2', h: 18 }, { c: '#f59e0b', h: 23 }, { c: '#7c3aed', h: 36 }] },
                      { m: 'March', segments: [{ c: '#2e7d32', h: 9 }, { c: '#f59e0b', h: 2.5 }, { c: '#7c3aed', h: 2 }] },
                      { m: 'April', segments: [{ c: '#2e7d32', h: 13 }, { c: '#1976d2', h: 6 }, { c: '#7c3aed', h: 7.5 }] },
                      { m: 'May', segments: [{ c: '#0d9488', h: 0.5 }, { c: '#7c3aed', h: 7.5 }] },
                      { m: 'June', segments: [{ c: '#d32f2f', h: 15 }, { c: '#7c3aed', h: 10.5 }, { c: '#0d9488', h: 1 }] },
                      { m: 'July', segments: [{ c: '#d32f2f', h: 60 }, { c: '#7c3aed', h: 12 }] },
                      { m: 'August', segments: [{ c: '#d32f2f', h: 64 }, { c: '#7c3aed', h: 11 }] },
                      { m: 'September', segments: [{ c: '#d32f2f', h: 4.5 }, { c: '#7c3aed', h: 1 }] },
                      { m: 'October', segments: [] },
                      { m: 'November', segments: [] },
                      { m: 'December', segments: [] },
                    ].map((col, idx) => {
                      const barWidth = 34;
                      const x = 65 + idx * 70;
                      let currentY = 180;
                      return (
                        <g key={idx}>
                          {col.segments.map((seg, sIdx) => {
                            currentY -= seg.h;
                            return (
                              <rect
                                key={sIdx}
                                x={x}
                                y={currentY}
                                width={barWidth}
                                height={seg.h}
                                fill={seg.c}
                              />
                            );
                          })}
                          <text x={x + barWidth / 2} y="196" fill="#475569" fontSize="9.5" textAnchor="middle">
                            {col.m}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-start gap-x-6 gap-y-1.5 px-4 py-2 text-[11px] text-slate-700 font-medium border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#2e7d32] inline-block"></span> Cashier N2</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#1976d2] inline-block"></span> Cashier NK</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#f59e0b] inline-block"></span> Cashier R</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#d32f2f] inline-block"></span> Hiba Aloulou</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#7c3aed] inline-block"></span> Mahdi</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0d9488] inline-block"></span> Nour Yazbeck</span>
                </div>

                {/* Employee Table */}
                <div className="overflow-x-auto mt-2">
                  <table className="omega-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left sticky-col">Employee</th>
                        <th className="text-right">January</th>
                        <th className="text-right">February</th>
                        <th className="text-right">March</th>
                        <th className="text-right">April</th>
                        <th className="text-right">May</th>
                        <th className="text-right">June</th>
                        <th className="text-right">July</th>
                        <th className="text-right">August</th>
                        <th className="text-right">September</th>
                        <th className="text-right">October</th>
                        <th className="text-right">November</th>
                        <th className="text-right">December</th>
                        <th className="text-right">Total</th>
                        <th className="text-right">Monthly Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Cashier N2</td>
                        <td className="text-right">74,960,900.00</td>
                        <td className="text-right">177,901,600.00</td>
                        <td className="text-right">226,406,100.00</td>
                        <td className="text-right">322,850,450.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">802,119,050.00</td>
                        <td className="text-right font-semibold text-slate-600">66,843,254.17</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Cashier NK</td>
                        <td className="text-right">498,835,400.00</td>
                        <td className="text-right">439,413,800.00</td>
                        <td className="text-right">458,850.00</td>
                        <td className="text-right">142,402,450.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">1,081,110,500.00</td>
                        <td className="text-right font-semibold text-slate-600">90,092,541.67</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Cashier R</td>
                        <td className="text-right">386,491,050.00</td>
                        <td className="text-right">587,849,542.00</td>
                        <td className="text-right">59,943,850.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">1,034,284,442.00</td>
                        <td className="text-right font-semibold text-slate-600">86,190,370.17</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Hiba Aloulou</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">381,671,600.00</td>
                        <td className="text-right">1,493,219,324.78</td>
                        <td className="text-right">1,594,785,000.00</td>
                        <td className="text-right">108,031,800.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">3,577,707,724.78</td>
                        <td className="text-right font-semibold text-slate-600">298,142,310.40</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Mahdi</td>
                        <td className="text-right">2,144,645,080.00</td>
                        <td className="text-right">895,931,000.00</td>
                        <td className="text-right">45,935,000.00</td>
                        <td className="text-right">182,596,650.00</td>
                        <td className="text-right">187,758,050.00</td>
                        <td className="text-right">257,090,350.00</td>
                        <td className="text-right">291,091,990.00</td>
                        <td className="text-right">268,930,000.00</td>
                        <td className="text-right">23,820,000.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">4,297,798,120.00</td>
                        <td className="text-right font-semibold text-slate-600">358,149,843.33</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold sticky-col bg-white">Nour Yazbeck</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">4,832,000.00</td>
                        <td className="text-right">24,083,800.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right">0.00</td>
                        <td className="text-right font-bold text-slate-800">28,915,800.00</td>
                        <td className="text-right font-semibold text-slate-600">2,409,650.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
