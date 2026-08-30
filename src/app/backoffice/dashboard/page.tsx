'use client';

import React from 'react';
import Link from 'next/link';

export default function BackofficeDashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen select-none font-sans text-left text-slate-800">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a629b]"></span>
            <h1 className="text-xl font-bold text-slate-900">Executive Operations Command Center</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Southern Olive Oil Products S.A.R.L - Choueifat Facility & Beirut Branch Operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-50 text-[#1a629b] font-bold px-3 py-1.5 rounded-lg border border-blue-200">
            System Live ✓
          </span>
          <Link
            href="/pos"
            target="_blank"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>🛒 Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Operational Metrics (4 Core KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">TODAY REVENUE</span>
              <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full">+18.5%</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 font-mono block mt-2">$4,850.00</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100 flex justify-between mt-3">
            <span>42 Total Invoices</span>
            <span className="text-[#1a629b] font-bold">Choueifat & Beirut</span>
          </div>
        </div>

        {/* Social Reps & SLA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">ACTIVE SOCIAL REPS</span>
              <span className="text-blue-600 bg-blue-50 text-[10px] font-bold px-2 py-0.5 rounded-full">3 Online</span>
            </div>
            <span className="text-2xl font-bold text-[#1a629b] font-mono block mt-2">23 Orders Today</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100 flex justify-between mt-3">
            <span>1-Hour SLA Active</span>
            <span className="text-emerald-600 font-bold">100% On-Time</span>
          </div>
        </div>

        {/* Pressing & Olive Oil Production */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">OLIVE PRESSING (SEASON)</span>
              <span className="text-amber-700 bg-amber-50 text-[10px] font-bold px-2 py-0.5 rounded-full">Yield: 21.8%</span>
            </div>
            <span className="text-2xl font-bold text-amber-600 font-mono block mt-2">14,250 KG</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100 flex justify-between mt-3">
            <span>Storage Tanks: 85% Cap</span>
            <span className="font-bold text-slate-700">Extra Virgin</span>
          </div>
        </div>

        {/* Master Customers & KYC */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">CUSTOMER CONTACTS</span>
              <span className="text-purple-600 bg-purple-50 text-[10px] font-bold px-2 py-0.5 rounded-full">Unified Pool</span>
            </div>
            <span className="text-2xl font-bold text-purple-700 font-mono block mt-2">104,850</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100 flex justify-between mt-3">
            <span>Wholesale KYC Verified</span>
            <span className="text-emerald-600 font-bold">All Lebanon</span>
          </div>
        </div>

      </div>

      {/* 3. Facility Production & Quick Navigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Production Runs Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800">🏭 Facility Production Batches</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Choueifat Mill</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Pomegranate Molasses Batch #44</span>
                <span className="text-[10.5px] text-slate-500">Viscosity: 68° Brix | Status: Heating</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">In Progress</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Eau de Javel 4L Packaging Run</span>
                <span className="text-[10.5px] text-slate-500">1,200 Gallons Packed | pH: 11.4</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Completed ✓</span>
            </div>
          </div>
        </div>

        {/* SuperSonic Fleet Real-time Runs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800">🚚 SuperSonic Live Delivery Runs</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Live Dispatch</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Van 01 (Beirut & Metn Route)</span>
                <span className="text-[10.5px] text-slate-500">14 Stops | Driver: Tony Saad</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">On Route</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Van 02 (South & Saida Route)</span>
                <span className="text-[10.5px] text-slate-500">8 Stops | Driver: Fadi Kassem</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">On Route</span>
            </div>
          </div>
        </div>

        {/* Quick Module Shortcuts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800">⚡ Quick Management Shortcuts</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/backoffice/reportview"
              className="p-3 bg-blue-50 hover:bg-blue-100 text-[#1a629b] font-bold rounded-xl text-center transition-colors block"
            >
              📊 Sales Reports (93)
            </Link>
            <Link
              href="/backoffice/social-crm"
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-center transition-colors block"
            >
              💬 Social CRM Hub
            </Link>
            <Link
              href="/backoffice/customers"
              className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-center transition-colors block"
            >
              👥 Customer KYC
            </Link>
            <Link
              href="/backoffice/end-of-day"
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-center transition-colors block"
            >
              🧾 EOD Z-Report
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
