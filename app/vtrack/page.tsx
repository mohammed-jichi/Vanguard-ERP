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
  Calendar
} from 'lucide-react';

export default function VTrackDashboardPage() {
  const [activeScreen, setActiveScreen] = useState<string>('vtrack');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // Filters matching Video V8
  const [selectedBranch, setSelectedBranch] = useState<string>('Zeit w zaytoun ljanoub');
  const [selectedSubBranch, setSelectedSubBranch] = useState<string>('Zeit w zaytoun ljanoub');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('LBP');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [branchSearchOpen, setBranchSearchOpen] = useState<boolean>(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>('');

  const branches = [
    'Zeit w zaytoun ljanoub',
    'Main Factory Southern Olive SARL',
    'Beirut Hub'
  ];

  const filteredBranches = branches.filter(b => 
    b.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

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
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">VTrack</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">- {selectedBranch}</span>
              </div>
            </div>

            {/* TOP CONTROLS & FILTER STRIP matching Video V8 */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-end gap-2.5">
              {/* Branch Filter with Search Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setBranchSearchOpen(!branchSearchOpen)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-800 flex items-center gap-2 min-w-[200px] justify-between shadow-2xs"
                >
                  <span className="truncate">{selectedBranch}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {branchSearchOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-xl z-50 p-2 space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={branchSearchTerm}
                        onChange={(e) => setBranchSearchTerm(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {filteredBranches.map((b, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedBranch(b);
                            setBranchSearchOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                            selectedBranch === b 
                              ? 'bg-blue-600 text-white font-bold' 
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Branch Selector */}
              <select
                value={selectedSubBranch}
                onChange={(e) => setSelectedSubBranch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
              >
                <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
              </select>

              {/* Currency Selector */}
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
              >
                <option value="LBP">LBP</option>
                <option value="USD">USD ($)</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={() => {}}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-600 shadow-2xs transition-colors"
                title="Refresh VTrack Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: COMPARATIVE SALES (MTD/LYMTD) matching Video V8 */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#0b2447] text-white px-4 py-2 text-xs font-bold flex flex-col">
                <span>Comparative Sales (MTD/LYMTD)</span>
                <span className="text-[10px] text-slate-300 font-normal">All accessible brands and branches</span>
              </div>
              <div className="p-8 text-center text-xs text-slate-500 font-medium bg-slate-50/50">
                No branch comparison found for the selected filters.
              </div>
            </div>

            {/* SECTION 2: TWO COLUMNS (BRANCH SALES LIST & SALES GRAPH) matching Video V8 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* LEFT CARD: BRANCH SALES LIST */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-3 py-2 text-xs font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
                  <span>Branch Sales List</span>
                </div>

                <div className="bg-[#0b2447] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                  <span>Zeit w zaytoun ljanoub</span>
                  <span>0 LBP</span>
                </div>

                <div className="p-3 space-y-3 flex-1 bg-white">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1 border-b border-slate-100">
                    <span>Lebanon</span>
                    <span>0 LBP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2">
                    <span className="pl-3">Zeit w zaytoun ljanoub</span>
                    <span className="font-bold text-slate-800">0 LBP</span>
                  </div>

                  {/* Warning banner matching Video V8 */}
                  <div className="bg-slate-100 border border-slate-200 rounded p-3 text-[11px] text-slate-600 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      An active VTrack license is required. Please renew or activate the license for this branch.
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD: SALES GRAPH WITH DONUT MTD */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Sales Graph</span>
                    <span className="text-xs text-slate-500 font-mono font-semibold">0.00 LBP</span>
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
                      <span>Lebanon</span>
                      <span className="font-bold">0 LBP</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Zeit w zaytoun ljanoub</span>
                  </div>

                  {/* Authentic Donut Chart Visual with Center MTD */}
                  <div className="flex items-center justify-center py-6">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#e2e8f0"
                          strokeWidth="16"
                        />
                        {/* 0% dot indicator */}
                        <circle
                          cx="88"
                          cy="50"
                          r="3"
                          fill="#ef4444"
                        />
                      </svg>
                      {/* Center Badge */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-slate-800 tracking-wider">MTD</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend matching Video V8 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <span className="text-slate-700 font-medium">Zeit w zaytoun ljanoub</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-600">0 LBP</span>
                      <span className="font-bold text-slate-800">0%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

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
