'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  QrCode,
  UtensilsCrossed,
  UserCheck,
  Share2,
  Copy,
  Printer,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Truck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Store,
  Layers,
  Phone,
} from 'lucide-react';
import {
  VMENU_SALES_REPS,
  VMENU_EXCHANGE_RATE,
  calculateRepCommission,
} from '@/lib/vmenuService';
import {
  renderQrSvgString,
  buildVMenuUrl,
  buildWhatsAppShareUrl,
} from '@/lib/vmenuQrGenerator';

export default function VMenuQrGeneratorConsole() {
  const [activeTab, setActiveTab] = useState<'tables' | 'reps' | 'commissions'>('tables');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Table QR Generator state
  const [selectedTable, setSelectedTable] = useState<string>('4');
  const [selectedBranch, setSelectedBranch] = useState<string>('showroom');

  // Rep QR Generator state
  const [selectedRepCode, setSelectedRepCode] = useState<string>('REP-002');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('whatsapp');

  // Live commissions state
  const [commissions, setCommissions] = useState<any[]>([]);
  const [repsData, setRepsData] = useState<any[]>([]);
  const [vmenuOrders, setVmenuOrders] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const fetchLiveVMenuData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/vmenu/order');
      const data = await res.json();
      if (data.success) {
        setCommissions(data.commissions || []);
        setRepsData(data.reps || []);
        setVmenuOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to load V-Menu backoffice data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLiveVMenuData();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Build URLs
  const tableVMenuUrl = useMemo(() => {
    return buildVMenuUrl({
      table: selectedTable,
      branch: selectedBranch,
    });
  }, [selectedTable, selectedBranch]);

  const selectedRep = VMENU_SALES_REPS[selectedRepCode] || VMENU_SALES_REPS['REP-002'];

  const repVMenuUrl = useMemo(() => {
    return buildVMenuUrl({
      repId: selectedRepCode,
      campaign: selectedCampaign,
    });
  }, [selectedRepCode, selectedCampaign]);

  const repWhatsAppUrl = useMemo(() => {
    return buildWhatsAppShareUrl(selectedRep.phone, repVMenuUrl, selectedRep.fullName);
  }, [selectedRep, repVMenuUrl]);

  // Generate QR SVGs
  const tableQrSvg = useMemo(() => {
    return renderQrSvgString(tableVMenuUrl, {
      size: 220,
      color: '#1b4332',
      includeCenterLogo: true,
    });
  }, [tableVMenuUrl]);

  const repQrSvg = useMemo(() => {
    return renderQrSvgString(repVMenuUrl, {
      size: 220,
      color: '#003566',
      includeCenterLogo: true,
    });
  }, [repVMenuUrl]);

  const quickTables = ['1', '2', '3', '4', '5', '8', '12', 'Showroom Counter', 'Tasting Bar'];

  return (
    <div className="space-y-6 font-sans">
      {/* Console Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                V-Menu & QR Generator Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                Module 1 POS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate printable table tents, dynamic showroom QR displays, and personalized sales rep attribution links with automated commission accounting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link prefetch={false}
            href="/vmenu"
            target="_blank"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
          >
            <span>Preview Public V-Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link prefetch={false}
            href="/vtrack"
            target="_blank"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>V-Track Fleet Engine</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Table & Showroom QR Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'reps'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Sales Rep QR & WhatsApp Links</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('commissions');
            fetchLiveVMenuData();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'commissions'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Rep Commission Ledger & Orders</span>
          {commissions.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {commissions.length}
            </span>
          )}
        </button>
      </div>

      {/* Copy Alert Toast */}
      {copiedLink && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{copiedLink} copied to clipboard successfully!</span>
        </div>
      )}

      {/* =====================================================================
          TAB 1: TABLE & SHOWROOM QR GENERATOR
          ===================================================================== */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Configure Table / Display Spot</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate dynamic QR codes bound directly to dining tables or showroom tasting counters.
              </p>
            </div>

            {/* Quick Select Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quick Select Table / Station
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTables.map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setSelectedTable(tbl)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition border cursor-pointer ${
                      selectedTable === tbl
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tbl.startsWith('Showroom') || tbl.startsWith('Tasting') ? tbl : `#${tbl}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Table Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Table Label / Number
              </label>
              <input
                type="text"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                placeholder="e.g. Table 4, VIP Lounge, Terrace 2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Branch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch / Facility
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="showroom">Choueifat Showroom & Tasting Center</option>
                <option value="beirut">Beirut Downtown Gourmet Boutique</option>
                <option value="deep_south">Southern Olive Pressing Mill (Tyre)</option>
              </select>
            </div>

            {/* Target URL Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Generated Target URL
              </span>
              <div className="font-mono text-xs text-emerald-800 break-all bg-white p-2 rounded-lg border border-slate-200 select-all font-semibold">
                {tableVMenuUrl}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopy(tableVMenuUrl, `Table #${selectedTable} Link`)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <Link prefetch={false}
                href={tableVMenuUrl}
                target="_blank"
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>Live Test</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Printable Table Tent Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Print-Ready Table Tent Card
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Preview for Table #{selectedTable}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Table Tent</span>
              </button>
            </div>

            {/* Simulated Table Tent Display Card */}
            <div className="w-full max-w-sm border-2 border-emerald-800 rounded-3xl p-6 bg-gradient-to-b from-amber-50/50 via-white to-emerald-50/30 shadow-md space-y-4 my-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  Southern Olive Oil Products
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Vanguard Digital Menu
                </h2>
                <div className="inline-block bg-emerald-800 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  Table #{selectedTable}
                </div>
              </div>

              {/* Dynamic QR Code Vector Preview */}
              <div
                className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block mx-auto"
                dangerouslySetInnerHTML={{ __html: tableQrSvg }}
              />

              <div className="space-y-1 text-slate-600">
                <p className="text-xs font-bold text-slate-800">
                  Scan with your mobile camera to order
                </p>
                <p className="text-[11px] text-slate-500 font-semibold" dir="rtl">
                  امسح الرمز بكاميرا هاتفك للطلب مباشرة إلى هذه الطاولة
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
                <span>V-Menu Engine</span>
                <span>•</span>
                <span>Self-Ordering & Instant Counter Dispatch</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 max-w-md">
              Table orders skip customer delivery addresses and dispatch directly to the showroom counter with active table numbers.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SALES REP QR & WHATSAPP LINK GENERATOR
          ===================================================================== */}
      {activeTab === 'reps' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Sales Representative Attribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate personalized QR codes and shareable WhatsApp links that tag the rep&apos;s code and calculate automated commissions.
              </p>
            </div>

            {/* Representative Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Representative
              </label>
              <div className="space-y-2">
                {Object.values(VMENU_SALES_REPS).map((r) => (
                  <div
                    key={r.repCode}
                    onClick={() => setSelectedRepCode(r.repCode)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedRepCode === r.repCode
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${r.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                        {r.repCode.slice(-3)}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {r.fullName} ({r.repCode})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.assignedChannel} • Phone: {r.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {Math.round(r.defaultCommissionRate * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Channel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign / Attribution Channel
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whatsapp">💬 WhatsApp Direct Customer Share</option>
                <option value="instagram">📸 Instagram Bio & Stories</option>
                <option value="tiktok">🎵 TikTok Showcase / Bio</option>
                <option value="field_qr">📇 Physical Business Card / Flyer QR</option>
              </select>
            </div>

            {/* Personalized URL Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Personalized Attribution URL
              </span>
              <div className="font-mono text-xs text-blue-900 break-all bg-white p-2 rounded-lg border border-slate-200 select-all font-semibold">
                {repVMenuUrl}
              </div>
            </div>

            {/* Share Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={repWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share via WhatsApp with Pre-written Intro</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(repVMenuUrl, `${selectedRep.fullName} Link`)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Rep Link</span>
                </button>
                <Link prefetch={false}
                  href={repVMenuUrl}
                  target="_blank"
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <span>Test Rep Landing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Rep Card Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Representative Personalized Card
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedRep.fullName} • Code {selectedRep.repCode}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rep Handout</span>
              </button>
            </div>

            {/* Representative Display Card */}
            <div className="w-full max-w-sm border-2 border-slate-900 rounded-3xl p-6 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl space-y-4 my-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${selectedRep.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                    {selectedRep.repCode.slice(-3)}
                  </div>
                  <div className="text-start">
                    <h3 className="text-xs font-black text-white">{selectedRep.fullName}</h3>
                    <p className="text-[10px] text-slate-400">{selectedRep.assignedChannel} Specialist</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {Math.round(selectedRep.defaultCommissionRate * 100)}% Comm.
                </span>
              </div>

              {/* Dynamic QR Vector Preview */}
              <div
                className="p-3 bg-white border border-slate-700 rounded-2xl shadow-inner inline-block mx-auto"
                dangerouslySetInnerHTML={{ __html: repQrSvg }}
              />

              <div className="space-y-1 text-slate-300">
                <p className="text-xs font-bold text-white">
                  Order Lebanese Harvest with Personal Guidance
                </p>
                <p className="text-[11px] text-slate-400 font-semibold" dir="rtl">
                  اطلب الآن مباشرة عبر رمز الاستجابة السريعة للمندوب
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Code: {selectedRep.repCode}</span>
                <span>Phone: {selectedRep.phone}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-start text-xs text-slate-600 space-y-1 max-w-md w-full">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Automated Commission Calculation</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Orders placed via this link auto-credit {Math.round(selectedRep.defaultCommissionRate * 100)}% of the total order USD directly into {selectedRep.fullName}&apos;s commission ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: REP COMMISSION LEDGER & LIVE V-MENU ORDERS
          ===================================================================== */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Performance Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {repsData.map((rep) => (
              <div
                key={rep.id || rep.rep_code}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {rep.rep_code}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {Math.round((rep.commission_rate || 0.05) * 100)}% Tier
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{rep.full_name}</h4>
                  <p className="text-[11px] text-slate-500">{rep.assigned_channel}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Accrued:</span>
                  <span className="font-mono font-black text-emerald-700">
                    ${(rep.total_commission_usd || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Unpaid Balance:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ${(rep.current_unpaid_balance_usd || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Commission Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Automated Sales Rep Commission Ledger
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchLiveVMenuData}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Rep Code & Name</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-end">Order USD</th>
                    <th className="py-2.5 px-3 text-center">Rate</th>
                    <th className="py-2.5 px-3 text-end">Commission (USD)</th>
                    <th className="py-2.5 px-3 text-end">Commission (LBP)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400">
                        No commission entries recorded yet. Place orders via V-Menu with rep attribution to see entries populate automatically.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {c.order_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800">{c.rep_code}</span>
                          <span className="text-[11px] text-slate-500 block">{c.rep_name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{c.customer_name}</td>
                        <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-900">
                          ${Number(c.order_total_usd).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {Math.round(c.commission_rate * 100)}%
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-black text-emerald-700">
                          ${Number(c.commission_amount_usd).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-500">
                          {Math.round(c.commission_amount_lbp).toLocaleString()} LBP
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {c.payout_status || 'UNPAID'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* V-Menu Fleet Queue Monitor */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  V-Menu Recent Orders & Fleet Queue
                </h3>
              </div>
              <Link prefetch={false}
                href="/vtrack"
                target="_blank"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Open SuperSonic Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Destination / Table</th>
                    <th className="py-2.5 px-3">Corridor</th>
                    <th className="py-2.5 px-3">Assigned Driver</th>
                    <th className="py-2.5 px-3 text-end">Amount ($)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vmenuOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No V-Menu orders logged yet.
                      </td>
                    </tr>
                  ) : (
                    vmenuOrders.slice(0, 10).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {ord.order_number}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800">{ord.customer_name}</span>
                          <span className="text-[10px] text-slate-500 block">{ord.customer_phone}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {ord.destination_town}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {ord.corridor_id > 0 ? `Corridor #${ord.corridor_id}` : 'Showroom Table'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">
                          {ord.assigned_driver_name || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-900">
                          ${Number(ord.product_amount_usd).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.order_status === 'queued'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : ord.order_status === 'moved_to_pos_pickup'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ord.order_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
