'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import {
  RefreshCw,
  Search,
  PieChart as PieChartIcon,
  BarChart2,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  Layers,
  Building2,
  Calendar,
  Truck,
  MapPin,
  Map,
  Navigation,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  Scale,
  Globe,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

export default function VTrackDashboardPage() {
  const [activeScreen, setActiveScreen] = useState<string>('vtrack');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // Navigation Tabs inside V-Track
  const [activeTab, setActiveTab] = useState<'overview' | 'geographics' | 'today'>('overview');

  // Filters matching Video V8 & Enterprise specifications
  const [selectedBranch, setSelectedBranch] = useState<string>('Zeit w zaytoun ljanoub');
  const [selectedSubBranch, setSelectedSubBranch] = useState<string>('Zeit w zaytoun ljanoub');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('LBP');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [branchSearchOpen, setBranchSearchOpen] = useState<boolean>(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const branches = [
    'Zeit w zaytoun ljanoub',
    'Main Factory Southern Olive SARL (Choueifat)',
    'Beirut Hamra Distribution Hub',
    'Saida Southern Retail Center'
  ];

  const filteredBranches = branches.filter(b => 
    b.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

  // Live Today Delivery Orders feeding Geographics
  const todayLiveOrders = [
    {
      id: 'ORD-TODAY-104',
      customer: 'Al-Baraka Supermarket S.A.R.L',
      destination: 'Saida Coastal Highway',
      governorate: 'South Lebanon',
      amountLbp: 15200000,
      amountUsd: 170.0,
      driver: 'Ziad K.',
      van: 'SuperSonic Van #02',
      status: 'OUT_FOR_DELIVERY',
      eta: '12 mins',
      speed: '58 km/h',
      lat: 33.5631,
      lng: 35.3689
    },
    {
      id: 'ORD-TODAY-102',
      customer: 'Hamra Gourmet Olive Boutique',
      destination: 'Beirut Hamra Main Street',
      governorate: 'Greater Beirut',
      amountLbp: 16557500,
      amountUsd: 185.0,
      driver: 'Tarek M.',
      van: 'SuperSonic Van #01',
      status: 'DELIVERED',
      eta: 'Delivered (11:20 AM)',
      speed: '0 km/h',
      lat: 33.8938,
      lng: 35.4839
    },
    {
      id: 'ORD-TODAY-103',
      customer: 'Al-Mahaba Wholesale Food Stores',
      destination: 'Choueifat Industrial Zone',
      governorate: 'Mount Lebanon',
      amountLbp: 8502500,
      amountUsd: 95.0,
      driver: 'Ali B.',
      van: 'SuperSonic Van #04',
      status: 'IN_TRANSIT',
      eta: '8 mins',
      speed: '42 km/h',
      lat: 33.8044,
      lng: 35.5211
    },
    {
      id: 'ORD-TODAY-105',
      customer: 'Jounieh Fine Foods S.A.L',
      destination: 'Jounieh Sea Road',
      governorate: 'Mount Lebanon',
      amountLbp: 22375000,
      amountUsd: 250.0,
      driver: 'Hassan D.',
      van: 'SuperSonic Hub Van #05',
      status: 'DISPATCHED',
      eta: '35 mins',
      speed: '65 km/h',
      lat: 33.9808,
      lng: 35.6178
    },
    {
      id: 'ORD-TODAY-106',
      customer: 'Tripoli Al-Mina Olive Center',
      destination: 'Tripoli Boulevard',
      governorate: 'North Lebanon',
      amountLbp: 31325000,
      amountUsd: 350.0,
      driver: 'SuperSonic Fleet Freight',
      van: 'Heavy Cargo Truck #08',
      status: 'DISPATCHED',
      eta: '50 mins',
      speed: '70 km/h',
      lat: 34.4367,
      lng: 35.8497
    }
  ];

  const filteredOrders = selectedRegion === 'all'
    ? todayLiveOrders
    : todayLiveOrders.filter(o => o.governorate.toLowerCase().includes(selectedRegion.toLowerCase()));

  const formatCurrency = (amount: number) => {
    if (selectedCurrency === 'USD') {
      return `$${(amount / 89500).toFixed(2)}`;
    }
    return `${amount.toLocaleString()} LBP`;
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100 text-slate-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. GLOBAL HEADER */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER CONTAINER WITH SIDEBAR & CONTENT */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-slate-100 mt-8">
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isOpen={isSidebarOpen}
          onToggleOpen={(open) => setIsSidebarOpen(open)}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-y-auto">
          <div className="w-full py-4 px-4 sm:px-6 lg:px-8 space-y-4">
            
            {/* TOP TITLE & BREADCRUMB */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">VTrack</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">- {selectedBranch}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ACCOUNT UNLOCKED & ACTIVE
                </span>
              </div>

              {/* Link back to Vanguard POS / Dashboard */}
              <div className="flex items-center gap-2">
                <Link
                  href="/backoffice/dashboard"
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1"
                >
                  &larr; Vanguard Backoffice Dashboard
                </Link>
              </div>
            </div>

            {/* UNLOCKED LICENSE BANNER (Replaces the locked warning) */}
            <div className="bg-gradient-to-r from-[#0b2447] via-[#0b3056] to-slate-900 border border-emerald-500/30 rounded-xl p-4 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                  <Truck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm text-white">
                      V-Track Cloud & Mobile Platform
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                      LICENSE ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    المنصة السحابية وتطبيق الموبايل من Vanguard Software لمتابعة المبيعات، الشفتات، والعمليات التشغيلية لحظياً من أي مكان.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-white/10 rounded-lg text-slate-200 border border-white/15">
                  <strong>License ID:</strong> VT-2026-ENT-9948
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 font-bold">
                  Enterprise Unlimited
                </span>
              </div>
            </div>

            {/* V-TRACK SUB-NAVIGATION TABS (Connecting Today with Geographics) */}
            <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-[#0b2447] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Branch Sales & Graphs</span>
                </button>

                <button
                  onClick={() => setActiveTab('geographics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'geographics'
                      ? 'bg-[#0b2447] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Map className="w-3.5 h-3.5 text-blue-400" />
                  <span>Geographics & Fleet Map (خريطة التتبع)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>

                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'today'
                      ? 'bg-[#0b2447] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Today POS Live Stream (عمليات اليوم)</span>
                </button>
              </div>

              {/* Currency & Refresh Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
                >
                  <option value="LBP">LBP (Lebanese Pound)</option>
                  <option value="USD">USD ($)</option>
                </select>

                <button
                  onClick={() => {}}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-600 shadow-2xs transition-colors"
                  title="Refresh VTrack Data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TAB 1: BRANCH SALES & COMPARATIVE GRAPHS */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* SECTION 1: COMPARATIVE SALES (MTD/LYMTD) matching Video V8 with Real Data */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-[#0b2447] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
                    <div>
                      <span className="block">Comparative Sales (MTD/LYMTD)</span>
                      <span className="text-[10px] text-slate-300 font-normal">All accessible brands and branches - Southern Olive Products SARL</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-extrabold">+24.2% Growth MTD</span>
                  </div>

                  {/* Comparative KPI numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b border-slate-200 bg-slate-50 text-xs">
                    <div className="p-4 text-center">
                      <span className="text-slate-500 text-[11px] font-bold block">Current Month to Date (MTD)</span>
                      <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">{formatCurrency(428500000)}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">142 Invoices Registered</span>
                    </div>
                    <div className="p-4 text-center">
                      <span className="text-slate-500 text-[11px] font-bold block">Last Year MTD (LYMTD)</span>
                      <span className="text-lg font-black font-mono text-slate-700 mt-0.5 block">{formatCurrency(345000000)}</span>
                      <span className="text-[10px] text-slate-500">Historical Comparison Baseline</span>
                    </div>
                    <div className="p-4 text-center">
                      <span className="text-slate-500 text-[11px] font-bold block">Today Live Net Collections</span>
                      <span className="text-lg font-black font-mono text-blue-700 mt-0.5 block">{formatCurrency(132460000)}</span>
                      <span className="text-[10px] text-blue-600 font-bold">Live Stream from POS Touch</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TWO COLUMNS (BRANCH SALES LIST & SALES GRAPH) matching Video V8 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* LEFT CARD: BRANCH SALES LIST */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <div className="px-3 py-2 text-xs font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
                      <span>Branch Sales List (Active Branches)</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ONLINE & SYNCED
                      </span>
                    </div>

                    <div className="bg-[#0b2447] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                      <span>Zeit w zaytoun ljanoub (Choueifat & South)</span>
                      <span className="font-mono">{formatCurrency(132460000)}</span>
                    </div>

                    <div className="p-3 space-y-3 flex-1 bg-white">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1 border-b border-slate-100">
                        <span>Lebanon Regional Operations</span>
                        <span className="font-mono font-bold">{formatCurrency(132460000)}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700 p-2 bg-slate-50 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-900 block">Choueifat Main Pressing Plant</span>
                            <span className="text-[10px] text-slate-500">POS Touch Terminal #1 & #2</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(85200000)}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700 p-2 bg-slate-50 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-900 block">Saida Southern Distribution Center</span>
                            <span className="text-[10px] text-slate-500">Wholesale Depot & Fleet Terminal</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(32100000)}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700 p-2 bg-slate-50 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-900 block">Beirut Hamra Distribution Hub</span>
                            <span className="text-[10px] text-slate-500">Retail & Van Direct Delivery</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">{formatCurrency(15160000)}</span>
                        </div>
                      </div>

                      {/* Active Status Badge */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-[11px] text-emerald-900 font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>V-Track Real-time connection active. Shift data is synchronized every 5 seconds.</span>
                        </div>
                        <button
                          onClick={() => setActiveTab('geographics')}
                          className="text-xs font-bold text-blue-700 hover:underline shrink-0"
                        >
                          View on Map &rarr;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CARD: SALES GRAPH WITH DONUT MTD */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Sales Distribution Graph</span>
                        <span className="text-xs text-blue-700 font-mono font-bold">{formatCurrency(132460000)} Today Total</span>
                      </div>

                      {/* Toggle Pie / Bar Chart */}
                      <div className="flex items-center border border-slate-300 rounded overflow-hidden shadow-2xs">
                        <button
                          onClick={() => setChartType('pie')}
                          className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                            chartType === 'pie' ? 'bg-[#0b2447] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Pie chart
                        </button>
                        <button
                          onClick={() => setChartType('bar')}
                          className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                            chartType === 'bar' ? 'bg-[#0b2447] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Bar chart
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1 bg-white space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <span>Regional Revenue Share</span>
                          <span className="font-bold font-mono">{formatCurrency(132460000)}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">Choueifat, Saida & Beirut Combined</span>
                      </div>

                      {chartType === 'pie' ? (
                        /* Authentic Donut Chart Visual with Center MTD */
                        <div className="flex items-center justify-center py-4">
                          <div className="relative w-44 h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              {/* Mount Lebanon 64.3% */}
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke="#1e3a8a"
                                strokeWidth="16"
                                strokeDasharray="153.5 238.7"
                                strokeDashoffset="0"
                              />
                              {/* South Lebanon 24.2% */}
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth="16"
                                strokeDasharray="57.8 238.7"
                                strokeDashoffset="-153.5"
                              />
                              {/* Beirut 11.5% */}
                              <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke="#f59e0b"
                                strokeWidth="16"
                                strokeDasharray="27.4 238.7"
                                strokeDashoffset="-211.3"
                              />
                            </svg>
                            {/* Center Badge */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-sm font-black text-slate-800 tracking-wider">MTD</span>
                              <span className="text-[10px] text-slate-500 font-mono font-bold">100%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Bar Chart Mode */
                        <div className="space-y-3 py-3">
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span>Mount Lebanon (Choueifat)</span>
                              <span className="font-mono">64.3%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-900 rounded-full" style={{ width: '64.3%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span>South Lebanon (Saida)</span>
                              <span className="font-mono">24.2%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '24.2%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span>Greater Beirut (Hamra)</span>
                              <span className="font-mono">11.5%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '11.5%' }}></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Legend matching Video V8 */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-900"></div>
                            <span className="text-slate-700 font-medium">Mount Lebanon (Choueifat)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-600">{formatCurrency(85200000)}</span>
                            <span className="font-bold text-slate-800">64.3%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <span className="text-slate-700 font-medium">South Lebanon (Saida)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-600">{formatCurrency(32100000)}</span>
                            <span className="font-bold text-slate-800">24.2%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-slate-700 font-medium">Greater Beirut (Hamra)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-600">{formatCurrency(15160000)}</span>
                            <span className="font-bold text-slate-800">11.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: GEOGRAPHICS - INTERACTIVE FLEET & REGIONAL SPATIAL MAPPING */}
            {activeTab === 'geographics' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Concept Banner explaining the direct link */}
                <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <h3 className="font-extrabold text-sm text-slate-900">
                        الـ Geographics: تحويل البيانات التشغيلية اللحظية إلى عرض جغرافي تفاعلي
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                        V-DRIVER FLEET SYNC
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium max-w-4xl leading-relaxed">
                      تعتمد ميزة الـ <strong>Geographics</strong> بشكل أساسي على الداتا المتولدة في وحدة الـ <strong>Today</strong> بنظام الـ POS الأساسي. أي طلبية دليفري أو عملية بيع تُسجل اليوم يتم سحبها وعرضها فوراً على الخريطة لتتبع حركة السائقين عبر نظام V-Driver ومراقبة التوزع المكاني للمبيعات ميدانياً.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="all">All Regions (All Lebanon)</option>
                      <option value="mount lebanon">Mount Lebanon (Choueifat)</option>
                      <option value="beirut">Greater Beirut</option>
                      <option value="south">South Lebanon (Saida / Tyre)</option>
                      <option value="north">North (Tripoli)</option>
                    </select>
                  </div>
                </div>

                {/* Spatial Map & Driver Telemetry Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* LEFT: INTERACTIVE MAP CANVAS (Dark Theme with Live GPS Nodes) */}
                  <div className="lg:col-span-8 bg-slate-950 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between min-h-[480px] relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200">
                          V-Track Live GPS Lebanon Spatial Map (V-Driver Dispatch)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                          3 Vans Active
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-blue-400 font-bold font-mono">14 Today Deliveries</span>
                      </div>
                    </div>

                    {/* Visual GPS Plot Area */}
                    <div className="relative flex-1 my-6 flex items-center justify-center">
                      <div className="w-full max-w-xl h-72 bg-slate-900/80 rounded-2xl border border-slate-800 relative p-4 flex flex-col justify-between shadow-inner">
                        
                        {/* PIN 1: TRIPOLI / NORTH */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 flex items-center justify-center text-[9px] font-black">N</span>
                            <div>
                              <span className="font-bold text-xs text-slate-200">Tripoli & Koura Region</span>
                              <span className="text-[10px] text-slate-400 block">Heavy Cargo Truck #08 - Freight Delivery</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                            En Route (ETA: 50m)
                          </span>
                        </div>

                        {/* PIN 2: BEIRUT HAMRA (Active Driver) */}
                        <div className="p-3 bg-blue-900/30 border border-blue-500/40 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">Beirut Hamra Commercial Hub</span>
                                <span className="text-[9.5px] font-mono text-emerald-300 font-bold">33.8938° N, 35.4839° E</span>
                              </div>
                              <span className="text-[10px] text-slate-300">
                                🚐 Van #01 (Driver: Tarek M.) &bull; Order #ORD-102 &bull; Hamra Gourmet Center
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                            Delivered
                          </span>
                        </div>

                        {/* PIN 3: CHOUEIFAT (CENTRAL FACILITY) */}
                        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-black text-slate-950">
                              ★
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">Choueifat Pressing Facility & Main Depot</span>
                                <span className="text-[9.5px] font-mono text-amber-300">HQ Central Hub</span>
                              </div>
                              <span className="text-[10px] text-slate-300">
                                🚐 Van #04 (Driver: Ali B.) &bull; In Transit to Wholesale Account &bull; Speed: 42 km/h
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                            Active Fleet
                          </span>
                        </div>

                        {/* PIN 4: SAIDA & SOUTH */}
                        <div className="p-3 bg-slate-950/80 border border-blue-500/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold">S</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">South Lebanon (Saida Highway)</span>
                                <span className="text-[9.5px] font-mono text-blue-300">33.5631° N, 35.3689° E</span>
                              </div>
                              <span className="text-[10px] text-slate-300">
                                🚐 Van #02 (Driver: Ziad K.) &bull; Order #ORD-104 &bull; Al-Baraka Supermarket
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-400/20 text-blue-300 border border-blue-400/40">
                            ETA: 12m (58 km/h)
                          </span>
                        </div>

                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        Live WebSockets telemetry streaming from driver mobile GPS transmitters.
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">Latency: 14ms</span>
                    </div>
                  </div>

                  {/* RIGHT: REAL-TIME TODAY ORDERS DISPATCH QUEUE */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Today Orders Streamed to Map
                          </h4>
                          <span className="text-[10px] text-slate-500">Live POS dispatch queue ({filteredOrders.length})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                          SYNCED
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {filteredOrders.map(order => (
                          <div key={order.id} className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-lg space-y-1.5 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-blue-700">{order.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black ${
                                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="text-xs">
                              <p className="font-bold text-slate-900 truncate">{order.customer}</p>
                              <p className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{order.destination} ({order.governorate})</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10.5px]">
                              <span className="font-medium text-slate-600 flex items-center gap-1">
                                <Truck className="w-3 h-3 text-blue-600" />
                                {order.van}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {formatCurrency(order.amountLbp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Total Live Today Delivery Value:</span>
                        <span className="font-mono text-blue-700">
                          {formatCurrency(todayLiveOrders.reduce((sum, o) => sum + o.amountLbp, 0))}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        All invoices are tied to POS Cashier Drawer and driver delivery receipts.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: TODAY POS LIVE OPERATIONS (Live Data Source for Geographics) */}
            {activeTab === 'today' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Information Header on Today being the source */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <h3 className="font-extrabold text-sm text-slate-900">
                        وحدة الـ Today في Vanguard POS: مصدر البيانات الحي والمباشر
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        REAL-TIME SOURCE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium max-w-4xl leading-relaxed">
                      لوحة تحكم لحظية تعطي ملخصاً شاملاً لكل ما يجري <strong>اليوم</strong> (إجمالي المبيعات المباشرة، الطلبات المفتوحة، حركة الصناديق، وحالة الشفتات). هذه البيانات هي التي تُغذي الـ Geographics فورياً.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('geographics')}
                    className="px-3 py-1.5 bg-[#0b2447] text-white text-xs font-bold rounded-lg shadow hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Map className="w-3.5 h-3.5 text-blue-400" />
                    <span>انتقل إلى خريطة الـ Geographics</span>
                  </button>
                </div>

                {/* 4 Live Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Sales Today</span>
                    <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-0.5">
                      {formatCurrency(132460000)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600" /> +18.4% vs yesterday
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Open / Active Orders</span>
                    <div className="text-base sm:text-lg font-black font-mono text-blue-600 mt-0.5">
                      14 <span className="text-xs font-semibold text-slate-500">Orders</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block mt-1">
                      11 Counter POS / 3 Delivery
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Shift</span>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                      Shift #2 <span className="text-xs font-normal text-slate-500">(Morning/Noon)</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block mt-1">
                      Cashier: Nour Al-Hajj (Choueifat)
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Cash Drawer Balance</span>
                    <div className="text-base sm:text-lg font-black font-mono text-amber-700 mt-0.5">
                      {formatCurrency(35800000)}
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block mt-1">
                      + $420.00 USD Drawer Hold
                    </span>
                  </div>
                </div>

                {/* Operations Detail Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Payment Methods */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-blue-600" />
                        حركة الصناديق ووسائل الدفع اليوم (Cash Drawer Reconciliation)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        BALANCED
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900 block">نقد بالليرة اللبنانية (Cash LBP)</span>
                          <span className="text-[10px] text-slate-500">رصيد درج الكاشير الفعلي</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-slate-900 block">{formatCurrency(85000000)}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">64.17% من الإجمالي</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900 block">نقد بالدولار الأمريكي (Cash USD)</span>
                          <span className="text-[10px] text-slate-500">خزينة الدولار بسعر 89,500 ليرة</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-emerald-700 block">$350.00 ({formatCurrency(31325000)})</span>
                          <span className="text-[10px] text-slate-500 font-semibold">23.65% من الإجمالي</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900 block">مدفوعات إلكترونية و Whish Money</span>
                          <span className="text-[10px] text-slate-500">تسويات مباشرة ومحافظ إلكترونية</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-blue-700 block">{formatCurrency(16135000)}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">12.18% من الإجمالي</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">إجمالي مقبوضات اليوم:</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(132460000)}</span>
                    </div>
                  </div>

                  {/* Shift status & live sync details */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        حالة الشفت المباشر وجاهزية الإرسال إلى V-Track
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        SHIFT OPEN
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">الشفت النشط:</span>
                        <span className="font-bold text-slate-900">Shift #2 - Morning / Afternoon</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">الكاشير المسؤول:</span>
                        <span className="font-bold text-slate-900">نور الحاج (Nour Al-Hajj)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">وقت بدء الشفت:</span>
                        <span className="font-mono font-bold text-slate-900">08:30 AM (اليوم)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">الطلبات المفتوحة بالانتظار:</span>
                        <span className="font-bold text-blue-700">14 طلبية جارية</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        تحديث فوري مع نظام الخرائط V-Track Geographics
                      </p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                        أي طلبية دليفري جديدة تُنشأ على الـ POS تظهر فوراً على شاشة السائق بتطبيق V-Driver وتنعكس لحظياً على خريطة Geographics لمراقبة مكان السائق ومسار التسليم.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* FOOTER matching Video V8 */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 flex flex-wrap justify-center gap-3">
              <span>© 2026 Vanguard Software All rights reserved.</span>
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
        </div>
      </div>
    </div>
  );
}
