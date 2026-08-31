'use client';

import React from 'react';
import Link from 'next/link';

export default function BackofficeDashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-[#f7f5f0] min-h-screen select-none font-sans text-left text-slate-800">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#c4a97d]/35 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8c733e]"></span>
            <h1 className="text-xl font-bold text-[#292218]">Executive Operations Command Center</h1>
          </div>
          <p className="text-xs text-[#73634e] font-medium mt-0.5">
            Southern Olive Oil Products S.A.R.L - Choueifat Facility & Beirut Branch Operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-[#ede8df] text-[#3d3222] font-bold px-3.5 py-1.5 rounded-lg border border-[#c4a97d]/40 shadow-2xs">
            System Live Active ✓
          </span>
          <Link
            href="/pos"
            target="_blank"
            className="px-4 py-1.5 bg-[#3d3222] hover:bg-[#292218] text-amber-100 font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 border border-[#c4a97d]/40"
          >
            <span>🛒 Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Operational Metrics (4 Cashmere & Bronze Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales Metric */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#8c733e] text-xs font-bold uppercase tracking-wider">TODAY REVENUE</span>
              <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">+18.5%</span>
            </div>
            <span className="text-2xl font-bold text-[#292218] font-mono block mt-2">$4,850.00</span>
          </div>
          <div className="text-[11px] text-[#73634e] font-medium pt-3 border-t border-[#c4a97d]/20 flex justify-between mt-3">
            <span>42 Total Invoices</span>
            <span className="text-[#3d3222] font-bold">Choueifat & Beirut</span>
          </div>
        </div>

        {/* Social Reps & SLA */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#8c733e] text-xs font-bold uppercase tracking-wider">ACTIVE SOCIAL REPS</span>
              <span className="text-[#3d3222] bg-[#ede8df] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c4a97d]/30">3 Reps Online</span>
            </div>
            <span className="text-2xl font-bold text-[#3d3222] font-mono block mt-2">23 Orders Today</span>
          </div>
          <div className="text-[11px] text-[#73634e] font-medium pt-3 border-t border-[#c4a97d]/20 flex justify-between mt-3">
            <span>1-Hour SLA Active</span>
            <span className="text-emerald-700 font-bold">100% On-Time</span>
          </div>
        </div>

        {/* Pressing & Olive Oil Production */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#8c733e] text-xs font-bold uppercase tracking-wider">OLIVE PRESSING (SEASON)</span>
              <span className="text-[#8c733e] bg-[#fbf9f5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c4a97d]/30">Yield: 21.8%</span>
            </div>
            <span className="text-2xl font-bold text-[#8c733e] font-mono block mt-2">14,250 KG</span>
          </div>
          <div className="text-[11px] text-[#73634e] font-medium pt-3 border-t border-[#c4a97d]/20 flex justify-between mt-3">
            <span>Storage Tanks: 85% Cap</span>
            <span className="font-bold text-[#292218]">Extra Virgin</span>
          </div>
        </div>

        {/* Master Customers & KYC */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#8c733e] text-xs font-bold uppercase tracking-wider">CUSTOMER CONTACTS</span>
              <span className="text-[#3d3222] bg-[#ede8df] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#c4a97d]/30">Unified Pool</span>
            </div>
            <span className="text-2xl font-bold text-[#292218] font-mono block mt-2">104,850</span>
          </div>
          <div className="text-[11px] text-[#73634e] font-medium pt-3 border-t border-[#c4a97d]/20 flex justify-between mt-3">
            <span>Wholesale KYC Verified</span>
            <span className="text-emerald-700 font-bold">All Lebanon</span>
          </div>
        </div>

      </div>

      {/* 3. Facility Production & Quick Navigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Production Runs Status */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#c4a97d]/20 pb-2.5">
            <h3 className="text-xs font-bold text-[#292218]">🏭 Facility Production Batches</h3>
            <span className="text-[10px] font-bold text-[#8c733e] font-mono">Choueifat Mill</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#c4a97d]/25 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#292218] block">Pomegranate Molasses Batch #44</span>
                <span className="text-[10.5px] text-[#73634e]">Viscosity: 68° Brix | Status: Heating</span>
              </div>
              <span className="px-2 py-0.5 bg-[#ede8df] text-[#8c733e] rounded-md font-bold text-[10px] border border-[#c4a97d]/30">In Progress</span>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#c4a97d]/25 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#292218] block">Eau de Javel 4L Packaging Run</span>
                <span className="text-[10.5px] text-[#73634e]">1,200 Gallons Packed | pH: 11.4</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[10px] border border-emerald-200">Completed ✓</span>
            </div>
          </div>
        </div>

        {/* SuperSonic Fleet Real-time Runs */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#c4a97d]/20 pb-2.5">
            <h3 className="text-xs font-bold text-[#292218]">🚚 SuperSonic Live Delivery Runs</h3>
            <span className="text-[10px] font-bold text-[#8c733e] font-mono">Live Dispatch</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#c4a97d]/25 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#292218] block">Van 01 (Beirut & Metn Route)</span>
                <span className="text-[10.5px] text-[#73634e]">14 Stops | Driver: Tony Saad</span>
              </div>
              <span className="px-2 py-0.5 bg-[#ede8df] text-[#3d3222] rounded-md font-bold text-[10px] border border-[#c4a97d]/30">On Route</span>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#c4a97d]/25 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#292218] block">Van 02 (South & Saida Route)</span>
                <span className="text-[10.5px] text-[#73634e]">8 Stops | Driver: Fadi Kassem</span>
              </div>
              <span className="px-2 py-0.5 bg-[#ede8df] text-[#3d3222] rounded-md font-bold text-[10px] border border-[#c4a97d]/30">On Route</span>
            </div>
          </div>
        </div>

        {/* Quick Module Shortcuts */}
        <div className="bg-white/90 p-5 rounded-2xl border border-[#c4a97d]/35 shadow-xs space-y-3">
          <div className="border-b border-[#c4a97d]/20 pb-2.5">
            <h3 className="text-xs font-bold text-[#292218]">⚡ Quick Management Shortcuts</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/backoffice/reportview"
              className="p-3 bg-[#ede8df] hover:bg-[#e2dacb] text-[#292218] font-bold rounded-xl text-center transition-colors block border border-[#c4a97d]/30"
            >
              📊 Sales Reports (93)
            </Link>
            <Link
              href="/backoffice/social-crm"
              className="p-3 bg-[#ede8df] hover:bg-[#e2dacb] text-[#292218] font-bold rounded-xl text-center transition-colors block border border-[#c4a97d]/30"
            >
              💬 Social CRM Hub
            </Link>
            <Link
              href="/backoffice/customers"
              className="p-3 bg-[#ede8df] hover:bg-[#e2dacb] text-[#292218] font-bold rounded-xl text-center transition-colors block border border-[#c4a97d]/30"
            >
              👥 Customer KYC
            </Link>
            <Link
              href="/backoffice/end-of-day"
              className="p-3 bg-[#ede8df] hover:bg-[#e2dacb] text-[#292218] font-bold rounded-xl text-center transition-colors block border border-[#c4a97d]/30"
            >
              🧾 EOD Z-Report
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
