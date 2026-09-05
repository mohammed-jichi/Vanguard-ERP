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

  // Interactive Legend filters for Comparative tab (Strikethrough & exclude from comparison)
  const [hiddenCategorySeries, setHiddenCategorySeries] = useState<string[]>([]);
  const [hiddenRevenueMonths, setHiddenRevenueMonths] = useState<string[]>([]);
  const [hiddenEmployees, setHiddenEmployees] = useState<string[]>([]);
  
  // Interactive Hover Tooltips across all charts
  const [hoveredCategoryMonth, setHoveredCategoryMonth] = useState<string | null>(null);
  const [hoveredEmployeeMonth, setHoveredEmployeeMonth] = useState<string | null>(null);
  const [hoveredSummaryMonth, setHoveredSummaryMonth] = useState<string | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<{ chartId: string; label: string; amount: number; x: number; y: number } | null>(null);
  const [hoveredHourlyPoint, setHoveredHourlyPoint] = useState<{ hour: string; val: string; x: number; y: number } | null>(null);
  const [hoveredHighlightCard, setHoveredHighlightCard] = useState<string | null>(null);

  const toggleCategorySeries = (seriesName: string) => {
    setHiddenCategorySeries(prev => 
      prev.includes(seriesName) ? prev.filter(s => s !== seriesName) : [...prev, seriesName]
    );
  };

  const toggleRevenueMonth = (monthName: string) => {
    setHiddenRevenueMonths(prev => 
      prev.includes(monthName) ? prev.filter(m => m !== monthName) : [...prev, monthName]
    );
  };

  const toggleEmployee = (empName: string) => {
    setHiddenEmployees(prev => 
      prev.includes(empName) ? prev.filter(e => e !== empName) : [...prev, empName]
    );
  };

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

  // Helper for generating SVG Line Chart (matching exact Line Mode screenshots with interactive hover tooltips)
  const renderLineSvg = (
    points: { label: string; amount: number }[],
    yMax: number,
    yTicks: string[],
    yMin: number = 0,
    chartId: string = 'line-chart'
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

    const activePt = hoveredLinePoint && hoveredLinePoint.chartId === chartId ? hoveredLinePoint : null;

    return (
      <div className="w-full overflow-x-auto py-1 relative">
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

          {/* Data Points with interactive hover hitbox */}
          {coords.map((pt, i) => {
            const isHovered = activePt && activePt.label === pt.label;
            return (
              <g key={i} className="cursor-pointer">
                {/* Hitbox for easy hover */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="14" 
                  fill="transparent"
                  onMouseEnter={() => setHoveredLinePoint({ chartId, label: pt.label, amount: pt.amount, x: pt.x, y: pt.y })}
                  onMouseLeave={() => setHoveredLinePoint(null)}
                  onClick={() => setHoveredLinePoint({ chartId, label: pt.label, amount: pt.amount, x: pt.x, y: pt.y })}
                />
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isHovered ? "6" : "3.8"} 
                  fill={isHovered ? "#15803d" : "#2e7d32"} 
                  stroke="#ffffff" 
                  strokeWidth={isHovered ? "2.5" : "1.8"} 
                  className="transition-all duration-150 pointer-events-none"
                />
                {/* X Axis Label */}
                <text 
                  x={pt.x} 
                  y={height - paddingBottom + 16} 
                  fill={isHovered ? "#0f172a" : "#334155"} 
                  fontSize="9" 
                  fontWeight={isHovered ? "bold" : "normal"}
                  textAnchor="middle"
                  className="truncate"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}

          {/* Floating Highcharts Tooltip on Dot Hover */}
          {activePt && (
            <g className="pointer-events-none transition-all duration-150">
              <rect
                x={Math.min(Math.max(activePt.x - 70, 10), width - 155)}
                y={Math.max(activePt.y - 48, 6)}
                width="145"
                height="38"
                rx="3"
                fill="#000000"
                opacity="0.9"
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x={Math.min(Math.max(activePt.x - 62, 18), width - 147)}
                y={Math.max(activePt.y - 34, 20)}
                fill="#cbd5e1"
                fontSize="9"
                fontWeight="bold"
                textAnchor="start"
              >
                {activePt.label}
              </text>
              <rect
                x={Math.min(Math.max(activePt.x - 62, 18), width - 147)}
                y={Math.max(activePt.y - 24, 30)}
                width="7"
                height="7"
                fill="#2e7d32"
              />
              <text
                x={Math.min(Math.max(activePt.x - 51, 29), width - 136)}
                y={Math.max(activePt.y - 18, 36)}
                fill="#f8fafc"
                fontSize="9"
                fontWeight="normal"
                textAnchor="start"
              >
                Sales: <tspan fontWeight="bold">{formatVal(activePt.amount)}</tspan>
              </text>
            </g>
          )}
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
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #1976d2' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Revenue YoY</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('yoy')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'yoy' && (
                      <div className="absolute top-7 left-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-64 border border-slate-700 leading-tight">
                        Completed-month YoY: Net Sales from 2026 Jan-Aug vs 2025 Jan-Aug. Current month is excluded until it is complete.
                      </div>
                    )}
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>+100.0%</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      2026 Jan-Aug 10.7 B LL | 2025 Jan-Aug 0.00 LL
                    </div>
                  </div>

                  {/* Card 2: Best Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #2e7d32' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Best Month</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('best')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'best' && (
                      <div className="absolute top-7 left-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-56 border border-slate-700 leading-tight">
                        Month with highest total net sales in the selected year.
                      </div>
                    )}
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>January</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      3.1 B LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 3: Softest Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #f59e0b' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Softest Month</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('softest')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'softest' && (
                      <div className="absolute top-7 left-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-56 border border-slate-700 leading-tight">
                        Lowest net sales month recorded among active months.
                      </div>
                    )}
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>May</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      192.6 M LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 4: Top YoY Month */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #0f766e' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Top YoY Month</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('topyoy')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'topyoy' && (
                      <div className="absolute top-7 left-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-56 border border-slate-700 leading-tight">
                        Highest Year-over-Year growth compared to the previous year.
                      </div>
                    )}
                    <div className="text-sm font-bold text-slate-900 my-1 flex items-center gap-1">
                      <span>January</span>
                      <span className="text-emerald-600 text-xs">▲</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      3.1 B LL | +100.0% YoY
                    </div>
                  </div>

                  {/* Card 5: Best Category */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #7c3aed' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Best Category</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('category')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'category' && (
                      <div className="absolute top-7 right-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-48 border border-slate-700 leading-tight">
                        Category with the highest revenue contribution.
                      </div>
                    )}
                    <div className="text-sm font-bold text-slate-900 my-1">
                      مفرق
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      57.1 M LL
                    </div>
                  </div>

                  {/* Card 6: Peak Hour */}
                  <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-between min-h-[76px] relative group" style={{ borderTop: '3px solid #64748b' }}>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Peak Hour</span>
                      <div 
                        className="cursor-pointer p-0.5"
                        onMouseEnter={() => setHoveredHighlightCard('peakhour')}
                        onMouseLeave={() => setHoveredHighlightCard(null)}
                      >
                        <Info className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                    {hoveredHighlightCard === 'peakhour' && (
                      <div className="absolute top-7 right-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-48 border border-slate-700 leading-tight">
                        Hour of highest average transaction volume.
                      </div>
                    )}
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

                {/* Vertical Bars Container with Authentic Highcharts Gridlines */}
                <div className="relative h-60 px-6 pt-4 pb-2 border-b border-slate-200">
                  {/* Background Horizontal Gridlines matching Video V2 */}
                  <div className="absolute inset-x-6 top-4 bottom-7 flex flex-col justify-between pointer-events-none">
                    {['4B', '3B', '2B', '1B', '0'].map((tick, tIdx) => (
                      <div key={tIdx} className="w-full flex items-center">
                        <span className="text-[9.5px] text-slate-400 font-medium w-6 text-right pr-2 select-none -mt-2">
                          {tick}
                        </span>
                        <div className="flex-1 border-b border-slate-100 h-0"></div>
                      </div>
                    ))}
                  </div>

                  {/* Bars Container */}
                  <div className="relative z-10 h-full flex items-end justify-between gap-2 pl-6">
                    {monthlyBarData.map((d, i) => {
                      const maxVal = 3500000000;
                      const heightPct = d.val > 0 ? (d.val / maxVal) * 85 : 0;
                      const isHovered = hoveredSummaryMonth === d.month;

                      return (
                        <div 
                          key={i} 
                          className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                          onMouseEnter={() => setHoveredSummaryMonth(d.month)}
                          onMouseLeave={() => setHoveredSummaryMonth(null)}
                        >
                          {/* Authentic Highcharts Floating Tooltip matching Video V2 Frame 30 */}
                          {isHovered && (
                            <div className="absolute bottom-full mb-3 z-30 bg-black/90 text-white rounded px-3 py-2 shadow-2xl text-[11px] pointer-events-none whitespace-nowrap animate-in fade-in duration-150 border border-slate-700 min-w-[210px]">
                              <div className="font-bold text-slate-200 text-xs mb-1 border-b border-slate-700/80 pb-0.5">
                                {d.month}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200">
                                <span className="w-2.5 h-2.5 bg-[#2e6912] rounded-sm inline-block flex-shrink-0" />
                                <span>Zeit w zaytoun ljanoub:</span>
                                <span className="font-bold text-white ml-auto">
                                  {d.val > 0 ? `${d.val.toLocaleString()}.00` : '0.00'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300 mt-0.5 pl-4">
                                Change: <span className="text-emerald-400 font-semibold">{d.val > 0 ? `+${d.val.toLocaleString()}.00 (${d.pct})` : '0 (0.0%)'}</span>
                              </div>
                            </div>
                          )}

                          {d.val > 0 && (
                            <span className="text-[10px] font-bold text-slate-700 mb-1">
                              {d.label}
                            </span>
                          )}
                          <div 
                            className={`w-full max-w-[44px] rounded-t transition-all duration-150 ${
                              isHovered ? 'bg-[#25570e] ring-2 ring-emerald-400 shadow-md' : 'bg-[#2e6912] hover:bg-[#25570e]'
                            }`}
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                          ></div>
                          <span className={`text-[10px] mt-2 truncate max-w-full text-center transition-colors ${
                            isHovered ? 'text-slate-950 font-bold' : 'text-slate-600'
                          }`}>
                            {d.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0'],
                      0,
                      'sum-cat'
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
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderLineSvg(
                      divisionData,
                      60000000,
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0'],
                      0,
                      'sum-div'
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
                      ['60M', '50M', '40M', '30M', '20M', '10M', '0'],
                      0,
                      'sum-grp'
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
                      20000000,
                      'sum-dept'
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
                      2000000,
                      'sum-disc'
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
                      20000000,
                      'sum-user'
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
                      20000000,
                      'sum-pay'
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
                  20000000,
                  'daily-summary'
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
                <div className="flex flex-col lg:flex-row items-start gap-4">
                  {/* Left Chart Area */}
                  <div className="flex-1 w-full relative overflow-x-auto">
                    <svg viewBox="0 0 820 220" className="w-full min-w-[700px] h-52 select-none">
                      {/* Y-axis gridlines & labels matching screenshot: 2B, 1.5B, 1B, 500M, 0 */}
                      {[
                        { label: '2B', y: 20 },
                        { label: '1.5B', y: 60 },
                        { label: '1B', y: 100 },
                        { label: '500M', y: 140 },
                        { label: '0', y: 180 },
                      ].map((tick, i) => (
                        <g key={i}>
                          <line x1="45" y1={tick.y} x2="800" y2={tick.y} stroke="#e2e8f0" strokeWidth="1" />
                          <text x="38" y={tick.y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontWeight="500">
                            {tick.label}
                          </text>
                        </g>
                      ))}

                      {/* Bars for Jan-Dec */}
                      {[
                        { 
                          m: 'January', 
                          segments: [
                            { series: '2026 جملة', c: '#1976d2', h: 60, val: '2,144,645,080' },
                            { series: '2026 عروض', c: '#f59e0b', h: 32, val: '535,500,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 28, val: '424,787,350' },
                          ] 
                        },
                        { 
                          m: 'February', 
                          segments: [
                            { series: '2026 جملة', c: '#1976d2', h: 30, val: '895,931,000' },
                            { series: '2026 عروض', c: '#f59e0b', h: 52, val: '880,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 24, val: '325,164,942' },
                          ] 
                        },
                        { 
                          m: 'March', 
                          segments: [
                            { series: '2026 Raw Materials', c: '#2e7d32', h: 0, val: '0' },
                            { series: '2026 عروض', c: '#f59e0b', h: 4, val: '120,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 14, val: '212,743,800' },
                          ] 
                        },
                        { 
                          m: 'April', 
                          segments: [
                            { series: '2026 جملة', c: '#1976d2', h: 4, val: '50,000,000' },
                            { series: '2026 عروض', c: '#f59e0b', h: 14, val: '250,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 22, val: '347,849,550' },
                          ] 
                        },
                        { 
                          m: 'May', 
                          segments: [
                            { series: '2026 مفرق', c: '#d32f2f', h: 10, val: '192,590,050' },
                          ] 
                        },
                        { 
                          m: 'June', 
                          segments: [
                            { series: '2026 عروض', c: '#f59e0b', h: 24, val: '420,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 14, val: '242,845,750' },
                          ] 
                        },
                        { 
                          m: 'July', 
                          segments: [
                            { series: '2026 جملة', c: '#1976d2', h: 12, val: '250,000,000' },
                            { series: '2026 عروض', c: '#f59e0b', h: 54, val: '930,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 38, val: '604,311,315' },
                          ] 
                        },
                        { 
                          m: 'August', 
                          segments: [
                            { series: '2026 عروض', c: '#f59e0b', h: 56, val: '980,000,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 52, val: '883,715,000' },
                          ] 
                        },
                        { 
                          m: 'September', 
                          segments: [
                            { series: '2026 عروض', c: '#f59e0b', h: 4, val: '53,550,000' },
                            { series: '2026 مفرق', c: '#d32f2f', h: 5, val: '78,301,800' },
                          ] 
                        },
                        { m: 'October', segments: [] },
                        { m: 'November', segments: [] },
                        { 
                          m: 'December', 
                          segments: [
                            { series: '2025 مفرق', c: '#ef9a9a', h: 8, val: '103,890,400' },
                            { series: '2025 جملة', c: '#90caf9', h: 4, val: '50,023,000' },
                          ] 
                        },
                      ].map((col, idx) => {
                        const barWidth = 28;
                        const x = 60 + idx * 62;
                        let currentY = 180;
                        const activeSegments = col.segments.filter(seg => !hiddenCategorySeries.includes(seg.series));

                        return (
                          <g 
                            key={idx}
                            onMouseEnter={() => setHoveredCategoryMonth(col.m)}
                            onMouseLeave={() => setHoveredCategoryMonth(null)}
                            className="cursor-pointer"
                          >
                            {/* Hover backdrop */}
                            <rect
                              x={x - 8}
                              y="20"
                              width={barWidth + 16}
                              height="160"
                              fill="transparent"
                              className="hover:fill-blue-50/40"
                            />
                            {activeSegments.map((seg, sIdx) => {
                              currentY -= seg.h;
                              return (
                                <rect
                                  key={sIdx}
                                  x={x}
                                  y={currentY}
                                  width={barWidth}
                                  height={seg.h}
                                  fill={seg.c}
                                  className="transition-all duration-150"
                                />
                              );
                            })}
                            <text x={x + barWidth / 2} y="196" fill="#475569" fontSize="9" textAnchor="middle">
                              {col.m}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Floating Tooltip matching exact screenshot */}
                    {hoveredCategoryMonth && (
                      <div className="absolute top-6 right-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg text-[11px] min-w-[170px] pointer-events-none animate-in fade-in duration-150">
                        <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100">
                          {hoveredCategoryMonth}
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: '2025 Raw Materials', c: '#81c784', val: '0' },
                            { label: 'جملة', c: '#1976d2', val: hoveredCategoryMonth === 'January' ? '2.1 B' : hoveredCategoryMonth === 'February' ? '895.9 M' : hoveredCategoryMonth === 'December' ? '50.0 M' : '0' },
                            { label: '2026 عروض', c: '#f59e0b', val: hoveredCategoryMonth === 'January' ? '535.5 M' : hoveredCategoryMonth === 'February' ? '880.0 M' : hoveredCategoryMonth === 'August' ? '980.0 M' : '0' },
                            { label: '2025 عروض', c: '#ffe082', val: '0' },
                            { label: '2026 مفرق', c: '#d32f2f', val: hoveredCategoryMonth === 'January' ? '424.8 M' : hoveredCategoryMonth === 'August' ? '883.7 M' : '0' },
                            { label: '2025 مفرق', c: '#ef9a9a', val: hoveredCategoryMonth === 'December' ? '103.9 M' : '0' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: item.c }} />
                                <span>{item.label}:</span>
                              </span>
                              <span className="font-semibold text-slate-900">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side Vertical Legend with Interactive Strikethrough Click */}
                  <div className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-2 pt-2 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
                    {[
                      { name: '2026 Raw Materials', c: '#2e7d32' },
                      { name: '2025 Raw Materials', c: '#81c784' },
                      { name: '2026 جملة', c: '#1976d2' },
                      { name: '2025 جملة', c: '#90caf9' },
                      { name: '2026 عروض', c: '#f59e0b' },
                      { name: '2025 عروض', c: '#ffe082' },
                      { name: '2026 مفرق', c: '#d32f2f' },
                      { name: '2025 مفرق', c: '#ef9a9a' },
                    ].map((item, i) => {
                      const isHidden = hiddenCategorySeries.includes(item.name);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleCategorySeries(item.name)}
                          className={`flex items-center gap-2 text-[11.5px] cursor-pointer select-none text-left transition-all ${
                            isHidden 
                              ? 'line-through text-slate-400 opacity-60 decoration-slate-900 decoration-[1.5px]' 
                              : 'text-slate-800 font-medium hover:text-blue-600'
                          }`}
                          title={`Click to ${isHidden ? 'include' : 'exclude'} ${item.name}`}
                        >
                          <span 
                            className={`w-3 h-3 rounded-sm inline-block flex-shrink-0 transition-opacity ${isHidden ? 'opacity-40' : ''}`}
                            style={{ backgroundColor: item.c }} 
                          />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
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
                          { h: '00:00', val: '5,985,000 LL', amount: 5985000, x: 60, y: 55 },
                          { h: '09:00', val: '101,250 LL', amount: 101250, x: 108, y: 172 },
                          { h: '10:00', val: '7,312,500 LL', amount: 7312500, x: 156, y: 28 },
                          { h: '11:00', val: '2,025,000 LL', amount: 2025000, x: 204, y: 135 },
                          { h: '12:00', val: '443,950 LL', amount: 443950, x: 252, y: 166 },
                          { h: '13:00', val: '1,767,500 LL', amount: 1767500, x: 300, y: 140 },
                          { h: '14:00', val: '4,136,250 LL', amount: 4136250, x: 348, y: 92 },
                          { h: '15:00', val: '238,000 LL', amount: 238000, x: 396, y: 170 },
                          { h: '16:00', val: '1,338,750 LL', amount: 1338750, x: 444, y: 148 },
                          { h: '17:00', val: '5,332,250 LL', amount: 5332250, x: 492, y: 68 },
                          { h: '18:00', val: '4,282,500 LL', amount: 4282500, x: 540, y: 89 },
                        ].map((row, i) => {
                          const isHovered = hoveredHourlyPoint?.hour === row.h;
                          return (
                            <tr 
                              key={i} 
                              className={`cursor-pointer transition-colors ${isHovered ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                              onMouseEnter={() => setHoveredHourlyPoint({ hour: row.h, val: row.val, x: row.x, y: row.y })}
                              onMouseLeave={() => setHoveredHourlyPoint(null)}
                            >
                              <td className={`text-left font-semibold ${isHovered ? 'text-emerald-700' : 'text-slate-700'}`}>{row.h}</td>
                              <td className={`text-right font-medium ${isHovered ? 'text-emerald-800 font-bold' : 'text-slate-900'}`}>{row.val}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Smooth Curved Line Chart */}
                  <div className="lg:col-span-8 overflow-x-auto relative">
                    <svg viewBox="0 0 600 205" className="w-full min-w-[480px] h-48 select-none">
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

                      {/* Smooth curved path connecting all hourly coordinates */}
                      <path
                        d="M 60 55 C 85 110, 95 170, 108 172 C 125 170, 140 32, 156 28 C 175 25, 190 130, 204 135 C 220 140, 238 165, 252 166 C 270 168, 285 142, 300 140 C 318 138, 335 95, 348 92 C 365 90, 382 168, 396 170 C 412 172, 430 150, 444 148 C 460 146, 478 70, 492 68 C 508 66, 526 88, 540 89"
                        fill="none"
                        stroke="#2e7d32"
                        strokeWidth="2.2"
                      />

                      {/* Data Dots & X Labels with Hover Hitbox */}
                      {[
                        { h: '00:00', val: '5,985,000 LL', x: 60, y: 55, showLabel: true },
                        { h: '09:00', val: '101,250 LL', x: 108, y: 172, showLabel: false },
                        { h: '10:00', val: '7,312,500 LL', x: 156, y: 28, showLabel: true },
                        { h: '11:00', val: '2,025,000 LL', x: 204, y: 135, showLabel: false },
                        { h: '12:00', val: '443,950 LL', x: 252, y: 166, showLabel: true },
                        { h: '13:00', val: '1,767,500 LL', x: 300, y: 140, showLabel: false },
                        { h: '14:00', val: '4,136,250 LL', x: 348, y: 92, showLabel: true },
                        { h: '15:00', val: '238,000 LL', x: 396, y: 170, showLabel: false },
                        { h: '16:00', val: '1,338,750 LL', x: 444, y: 148, showLabel: true },
                        { h: '17:00', val: '5,332,250 LL', x: 492, y: 68, showLabel: false },
                        { h: '18:00', val: '4,282,500 LL', x: 540, y: 89, showLabel: true },
                      ].map((pt, i) => {
                        const isHovered = hoveredHourlyPoint?.hour === pt.h;
                        return (
                          <g 
                            key={i} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredHourlyPoint({ hour: pt.h, val: pt.val, x: pt.x, y: pt.y })}
                            onMouseLeave={() => setHoveredHourlyPoint(null)}
                            onClick={() => setHoveredHourlyPoint({ hour: pt.h, val: pt.val, x: pt.x, y: pt.y })}
                          >
                            {/* Hitbox */}
                            <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                            <circle 
                              cx={pt.x} 
                              cy={pt.y} 
                              r={isHovered ? "5.5" : "3.5"} 
                              fill={isHovered ? "#15803d" : "#2e7d32"} 
                              stroke="#ffffff" 
                              strokeWidth={isHovered ? "2.2" : "1.5"} 
                              className="transition-all duration-150"
                            />
                            {pt.showLabel && (
                              <text 
                                x={pt.x} 
                                y="194" 
                                fill={isHovered ? "#0f172a" : "#475569"} 
                                fontSize="9" 
                                fontWeight={isHovered ? "bold" : "normal"}
                                textAnchor="middle"
                              >
                                {pt.h}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Floating Tooltip inside SVG matching exact Video V1 Frame 20 */}
                      {hoveredHourlyPoint && (
                        <g className="pointer-events-none transition-all duration-150">
                          <rect
                            x={Math.min(Math.max(hoveredHourlyPoint.x - 70, 10), 450)}
                            y={Math.max(hoveredHourlyPoint.y - 48, 5)}
                            width="145"
                            height="38"
                            rx="3"
                            fill="#000000"
                            opacity="0.9"
                            stroke="#475569"
                            strokeWidth="1"
                          />
                          <text
                            x={Math.min(Math.max(hoveredHourlyPoint.x - 62, 18), 458)}
                            y={Math.max(hoveredHourlyPoint.y - 34, 18)}
                            fill="#cbd5e1"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="start"
                          >
                            {hoveredHourlyPoint.hour}
                          </text>
                          {/* Green square for series */}
                          <rect
                            x={Math.min(Math.max(hoveredHourlyPoint.x - 62, 18), 458)}
                            y={Math.max(hoveredHourlyPoint.y - 24, 28)}
                            width="7"
                            height="7"
                            fill="#2e7d32"
                          />
                          <text
                            x={Math.min(Math.max(hoveredHourlyPoint.x - 51, 29), 469)}
                            y={Math.max(hoveredHourlyPoint.y - 18, 34)}
                            fill="#f8fafc"
                            fontSize="9"
                            fontWeight="normal"
                            textAnchor="start"
                          >
                            Average Sales: <tspan fontWeight="bold">{hoveredHourlyPoint.val}</tspan>
                          </text>
                        </g>
                      )}
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
                  20000000,
                  'weekdays-sales'
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
                      {(() => {
                        const segments = [
                          { m: 'September', c: '#831843', h: 24 },
                          { m: 'August', c: '#c2410c', h: 34 },
                          { m: 'July', c: '#0284c7', h: 32 },
                          { m: 'June', c: '#0d9488', h: 12 },
                          { m: 'May', c: '#7c3aed', h: 4 },
                          { m: 'April', c: '#dc2626', h: 12 },
                          { m: 'March', c: '#f59e0b', h: 6 },
                          { m: 'February', c: '#1976d2', h: 38 },
                          { m: 'January', c: '#2e7d32', h: 6 },
                        ].filter(s => !hiddenRevenueMonths.includes(s.m));

                        let currentY = 200;
                        return segments.reverse().map((seg, sIdx) => {
                          currentY -= seg.h;
                          return (
                            <rect
                              key={sIdx}
                              x="120"
                              y={currentY}
                              width="290"
                              height={seg.h}
                              fill={seg.c}
                              className="transition-all duration-150"
                            />
                          );
                        });
                      })()}
                      
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

                {/* 12-Month Legend with Clickable Strikethrough Filter */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 px-4 py-2 border-t border-slate-100 text-[10.5px] text-slate-700 font-medium text-center">
                  {[
                    { m: 'January', c: '#2e7d32' },
                    { m: 'February', c: '#1976d2' },
                    { m: 'March', c: '#f59e0b' },
                    { m: 'April', c: '#dc2626' },
                    { m: 'May', c: '#7c3aed' },
                    { m: 'June', c: '#0d9488' },
                    { m: 'July', c: '#0284c7' },
                    { m: 'August', c: '#c2410c' },
                    { m: 'September', c: '#831843' },
                    { m: 'October', c: '#334155' },
                    { m: 'November', c: '#84cc16' },
                    { m: 'December', c: '#1e3a8a' },
                  ].map((item, idx) => {
                    const isHidden = hiddenRevenueMonths.includes(item.m);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleRevenueMonth(item.m)}
                        className={`flex items-center gap-1 justify-center cursor-pointer select-none transition-all ${
                          isHidden 
                            ? 'line-through text-slate-400 opacity-60 decoration-slate-900 decoration-[1.5px]' 
                            : 'hover:text-blue-600'
                        }`}
                        title={`Click to ${isHidden ? 'include' : 'exclude'} ${item.m}`}
                      >
                        <span 
                          className={`w-2.5 h-2.5 inline-block ${isHidden ? 'opacity-40' : ''}`} 
                          style={{ backgroundColor: item.c }}
                        />
                        <span>{item.m}</span>
                      </button>
                    );
                  })}
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
                      { 
                        m: 'January', 
                        segments: [
                          { emp: 'Cashier N2', c: '#2e7d32', h: 3 },
                          { emp: 'Cashier NK', c: '#1976d2', h: 20 },
                          { emp: 'Cashier R', c: '#f59e0b', h: 15 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 86 }
                        ] 
                      },
                      { 
                        m: 'February', 
                        segments: [
                          { emp: 'Cashier N2', c: '#2e7d32', h: 7 },
                          { emp: 'Cashier NK', c: '#1976d2', h: 18 },
                          { emp: 'Cashier R', c: '#f59e0b', h: 23 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 36 }
                        ] 
                      },
                      { 
                        m: 'March', 
                        segments: [
                          { emp: 'Cashier N2', c: '#2e7d32', h: 9 },
                          { emp: 'Cashier R', c: '#f59e0b', h: 2.5 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 2 }
                        ] 
                      },
                      { 
                        m: 'April', 
                        segments: [
                          { emp: 'Cashier N2', c: '#2e7d32', h: 13 },
                          { emp: 'Cashier NK', c: '#1976d2', h: 6 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 7.5 }
                        ] 
                      },
                      { 
                        m: 'May', 
                        segments: [
                          { emp: 'Nour Yazbeck', c: '#0d9488', h: 0.5 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 7.5 }
                        ] 
                      },
                      { 
                        m: 'June', 
                        segments: [
                          { emp: 'Hiba Aloulou', c: '#d32f2f', h: 15 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 10.5 },
                          { emp: 'Nour Yazbeck', c: '#0d9488', h: 1 }
                        ] 
                      },
                      { 
                        m: 'July', 
                        segments: [
                          { emp: 'Hiba Aloulou', c: '#d32f2f', h: 60 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 12 }
                        ] 
                      },
                      { 
                        m: 'August', 
                        segments: [
                          { emp: 'Hiba Aloulou', c: '#d32f2f', h: 64 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 11 }
                        ] 
                      },
                      { 
                        m: 'September', 
                        segments: [
                          { emp: 'Hiba Aloulou', c: '#d32f2f', h: 4.5 },
                          { emp: 'Mahdi', c: '#7c3aed', h: 1 }
                        ] 
                      },
                      { m: 'October', segments: [] },
                      { m: 'November', segments: [] },
                      { m: 'December', segments: [] },
                    ].map((col, idx) => {
                      const barWidth = 34;
                      const x = 65 + idx * 70;
                      let currentY = 180;
                      const activeSegments = col.segments.filter(seg => !hiddenEmployees.includes(seg.emp));

                      return (
                        <g 
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredEmployeeMonth(col.m)}
                          onMouseLeave={() => setHoveredEmployeeMonth(null)}
                        >
                          {/* Hover hit area */}
                          <rect
                            x={x - 6}
                            y="20"
                            width={barWidth + 12}
                            height="160"
                            fill="transparent"
                            className="hover:fill-blue-50/40"
                          />
                          {activeSegments.map((seg, sIdx) => {
                            currentY -= seg.h;
                            return (
                              <rect
                                key={sIdx}
                                x={x}
                                y={currentY}
                                width={barWidth}
                                height={seg.h}
                                fill={seg.c}
                                className="transition-all duration-150"
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

                  {/* Floating Tooltip matching exact screenshot */}
                  {hoveredEmployeeMonth && (
                    <div className="absolute top-6 right-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg text-[11px] min-w-[190px] pointer-events-none animate-in fade-in duration-150">
                      <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>{hoveredEmployeeMonth} 2026</span>
                        <span className="text-[10px] text-slate-500 font-normal">Breakdown</span>
                      </div>
                      <div className="space-y-1">
                        {[
                          { emp: 'Cashier N2', c: '#2e7d32', val: hoveredEmployeeMonth === 'January' ? '120.5 M' : hoveredEmployeeMonth === 'March' ? '360.0 M' : hoveredEmployeeMonth === 'April' ? '520.0 M' : '0' },
                          { emp: 'Cashier NK', c: '#1976d2', val: hoveredEmployeeMonth === 'January' ? '800.0 M' : hoveredEmployeeMonth === 'February' ? '720.0 M' : hoveredEmployeeMonth === 'April' ? '240.0 M' : '0' },
                          { emp: 'Cashier R', c: '#f59e0b', val: hoveredEmployeeMonth === 'January' ? '600.0 M' : hoveredEmployeeMonth === 'February' ? '920.0 M' : hoveredEmployeeMonth === 'March' ? '100.0 M' : '0' },
                          { emp: 'Hiba Aloulou', c: '#d32f2f', val: hoveredEmployeeMonth === 'July' ? '2.40 B' : hoveredEmployeeMonth === 'August' ? '2.56 B' : hoveredEmployeeMonth === 'June' ? '600.0 M' : hoveredEmployeeMonth === 'September' ? '108.0 M' : '0' },
                          { emp: 'Mahdi', c: '#7c3aed', val: hoveredEmployeeMonth === 'January' ? '3.44 B' : hoveredEmployeeMonth === 'July' ? '480.0 M' : hoveredEmployeeMonth === 'August' ? '440.0 M' : hoveredEmployeeMonth === 'September' ? '23.8 M' : '0' },
                          { emp: 'Nour Yazbeck', c: '#0d9488', val: hoveredEmployeeMonth === 'May' ? '20.0 M' : hoveredEmployeeMonth === 'June' ? '40.0 M' : '0' },
                        ].filter(item => !hiddenEmployees.includes(item.emp)).map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: item.c }} />
                              <span className="truncate max-w-[100px]">{item.emp}:</span>
                            </span>
                            <span className="font-semibold text-slate-900">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend with Clickable Strikethrough Filter */}
                <div className="flex flex-wrap justify-start gap-x-6 gap-y-1.5 px-4 py-2 text-[11px] text-slate-700 font-medium border-t border-slate-100">
                  {[
                    { name: 'Cashier N2', color: '#2e7d32' },
                    { name: 'Cashier NK', color: '#1976d2' },
                    { name: 'Cashier R', color: '#f59e0b' },
                    { name: 'Hiba Aloulou', color: '#d32f2f' },
                    { name: 'Mahdi', color: '#7c3aed' },
                    { name: 'Nour Yazbeck', color: '#0d9488' },
                  ].map((item, idx) => {
                    const isHidden = hiddenEmployees.includes(item.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleEmployee(item.name)}
                        className={`flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                          isHidden 
                            ? 'line-through text-slate-400 opacity-60 decoration-slate-900 decoration-[1.5px]' 
                            : 'text-slate-800 hover:text-blue-600'
                        }`}
                        title={`Click to ${isHidden ? 'include' : 'exclude'} ${item.name}`}
                      >
                        <span 
                          className={`w-2.5 h-2.5 inline-block ${isHidden ? 'opacity-40' : ''}`} 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
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
