'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Target,
  Filter,
  CheckCircle2,
  XCircle,
  Trophy,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  ArrowUpRight,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Layers,
  BarChart3,
  Download,
  Printer,
  ChevronDown,
  RefreshCw,
  Sparkles,
  PieChart
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getAllBranchesList, getBranchData, BranchInfo } from '@/lib/branchData';

interface RepPerformance {
  id: string;
  name: string;
  territory: string;
  branchId: string;
  newLeads: number;
  qualifiedLeads: number;
  qualityRate: number;
  lostQualifiedLeads: number;
  lostRate: number;
  wonInvoices: number;
  wonAmount: number;
  target: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  percent: number;
  color: string;
}

interface LeadSource {
  source: string;
  leads: number;
  qualityRate: number;
  wonDeals: number;
}

interface NextAction {
  id: string;
  type: 'call' | 'meeting' | 'proposal' | 'followup';
  subject: string;
  client: string;
  rep: string;
  due: string;
  priority: 'high' | 'medium' | 'normal';
}

export default function SalesTeamPerformanceView() {
  const { t, dir } = useLanguage();
  const { currentTenant } = useTenant();

  // Active period filter matching authentic Vanguard CRM5
  const [activePeriod, setActivePeriod] = useState<string>('month');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'LBP'>('USD');
  const [selectedBranch, setSelectedBranch] = useState<string>('0');
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const periods = [
    { value: 'today', label: t('today', 'Today') },
    { value: 'yesterday', label: t('yesterday', 'Yesterday') },
    { value: 'week', label: t('this_week', 'This Week') },
    { value: 'month', label: t('this_month', 'This Month') },
    { value: 'quarter', label: t('this_quarter', 'This Quarter') },
    { value: 'year', label: t('this_year', 'This Year') },
  ];

  const triggerRefresh = (label: string) => {
    setRefreshToast(t('metrics_refreshed_toast', 'Refreshed {label} metrics successfully').replace('{label}', label));
    setTimeout(() => setRefreshToast(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    const val = amount * (selectedCurrency === 'USD' ? 1 : 89500);
    if (selectedCurrency === 'USD') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} L.L`;
  };

  const allBranchesList = useMemo(() => getAllBranchesList(), []);

  // Team Performance Data for Southern Olive Oil Products S.A.R.L
  const teamPerformance: RepPerformance[] = [
    {
      id: 'rep-1',
      name: 'Tariq Abboud',
      territory: 'Commercial Accounts & Wholesale',
      branchId: '00001',
      newLeads: 28,
      qualifiedLeads: 22,
      qualityRate: 78.6,
      lostQualifiedLeads: 3,
      lostRate: 13.6,
      wonInvoices: 18,
      wonAmount: 64200,
      target: 75000
    },
    {
      id: 'rep-2',
      name: 'Ziad Al-Amin',
      territory: 'Key Accounts & Supermarkets',
      branchId: '00001',
      newLeads: 24,
      qualifiedLeads: 19,
      qualityRate: 79.2,
      lostQualifiedLeads: 2,
      lostRate: 10.5,
      wonInvoices: 16,
      wonAmount: 51800,
      target: 60000
    },
    {
      id: 'rep-3',
      name: 'Fadi Mroueh',
      territory: 'Agricultural & Harvest Operations',
      branchId: '00001',
      newLeads: 22,
      qualifiedLeads: 16,
      qualityRate: 72.7,
      lostQualifiedLeads: 3,
      lostRate: 18.8,
      wonInvoices: 12,
      wonAmount: 43500,
      target: 50000
    },
    {
      id: 'rep-4',
      name: 'Karim Daher',
      territory: 'Hospitality & HORECA Supply',
      branchId: '00001',
      newLeads: 19,
      qualifiedLeads: 14,
      qualityRate: 73.7,
      lostQualifiedLeads: 2,
      lostRate: 14.3,
      wonInvoices: 11,
      wonAmount: 38900,
      target: 45000
    },
    {
      id: 'rep-5',
      name: 'Salim Kassir',
      territory: 'Direct Showroom & Retail Sales',
      branchId: '00001',
      newLeads: 16,
      qualifiedLeads: 11,
      qualityRate: 68.8,
      lostQualifiedLeads: 2,
      lostRate: 18.2,
      wonInvoices: 9,
      wonAmount: 29400,
      target: 35000
    },
    {
      id: 'rep-6',
      name: 'George Haddad',
      territory: 'Export & Gourmet Accounts',
      branchId: '00001',
      newLeads: 14,
      qualifiedLeads: 12,
      qualityRate: 85.7,
      lostQualifiedLeads: 1,
      lostRate: 8.3,
      wonInvoices: 10,
      wonAmount: 48600,
      target: 55000
    }
  ];

  const filteredTeamPerformance = useMemo(() => {
    if (selectedBranch === '0' || selectedBranch === 'ALL') return teamPerformance;
    return teamPerformance.filter(r => r.branchId === selectedBranch);
  }, [selectedBranch, teamPerformance]);

  const totalWonAmount = filteredTeamPerformance.reduce((acc, r) => acc + r.wonAmount, 0);
  const totalTarget = filteredTeamPerformance.reduce((acc, r) => acc + r.target, 0);
  const targetAttainment = totalTarget > 0 ? ((totalWonAmount / totalTarget) * 100).toFixed(1) : '0';

  const totalNewLeads = filteredTeamPerformance.reduce((a, b) => a + b.newLeads, 0);
  const totalQualified = filteredTeamPerformance.reduce((a, b) => a + b.qualifiedLeads, 0);
  const totalLostQualified = filteredTeamPerformance.reduce((a, b) => a + b.lostQualifiedLeads, 0);
  const totalWonInvoices = filteredTeamPerformance.reduce((a, b) => a + b.wonInvoices, 0);
  const totalQualityRate = totalNewLeads > 0 ? ((totalQualified / totalNewLeads) * 100).toFixed(1) : '0';
  const totalLostRate = totalQualified > 0 ? ((totalLostQualified / totalQualified) * 100).toFixed(1) : '0';

  // Pipeline Funnel scaled per branch
  const pipelineRatio = selectedBranch === '0' || selectedBranch === 'ALL' ? 1 : totalWonAmount / 276400;
  const pipelineStages: PipelineStage[] = [
    { stage: '1. New Inquiries & Inbound', count: Math.round(123 * pipelineRatio) || 15, value: Math.round(420000 * pipelineRatio) || 50000, percent: 100, color: '#3b82f6' },
    { stage: '2. Contacted & Samples Dispatched', count: Math.round(94 * pipelineRatio) || 12, value: Math.round(345000 * pipelineRatio) || 40000, percent: 76, color: '#6366f1' },
    { stage: '3. Technical Tasting & Spec Approval', count: Math.round(68 * pipelineRatio) || 9, value: Math.round(285000 * pipelineRatio) || 30000, percent: 55, color: '#8b5cf6' },
    { stage: '4. Quotations & Bulk Pricing Sent', count: Math.round(48 * pipelineRatio) || 6, value: Math.round(212000 * pipelineRatio) || 25000, percent: 39, color: '#06b6d4' },
    { stage: '5. Contract Finalization / PO Pending', count: Math.round(32 * pipelineRatio) || 4, value: Math.round(164000 * pipelineRatio) || 18000, percent: 26, color: '#f59e0b' },
    { stage: '6. Closed Won Invoices', count: totalWonInvoices, value: totalWonAmount, percent: 62, color: '#10b981' },
  ];

  // Lead Sources
  const leadSources: LeadSource[] = [
    { source: 'Direct Field Agro Sales', leads: Math.round(48 * pipelineRatio) || 7, qualityRate: 82.5, wonDeals: Math.round(31 * pipelineRatio) || 4 },
    { source: 'Wholesale Distributor Referrals', leads: Math.round(34 * pipelineRatio) || 5, qualityRate: 79.4, wonDeals: Math.round(22 * pipelineRatio) || 3 },
    { source: 'SuperSonic B2B Merchant Portal', leads: Math.round(26 * pipelineRatio) || 4, qualityRate: 73.1, wonDeals: Math.round(15 * pipelineRatio) || 2 },
    { source: 'Food Expo & Olive Oil Fair', leads: Math.round(18 * pipelineRatio) || 3, qualityRate: 88.9, wonDeals: Math.round(14 * pipelineRatio) || 2 },
    { source: 'Direct Website & Catalog Orders', leads: Math.round(15 * pipelineRatio) || 2, qualityRate: 60.0, wonDeals: Math.round(7 * pipelineRatio) || 1 },
  ];

  // Upcoming Next Actions
  const allNextActions: NextAction[] = [
    {
      id: 'act-1',
      type: 'proposal',
      subject: 'Deliver 16L Bulk Tin Annual Contract',
      client: 'Abou Hamza Nuts & Confectionery',
      rep: 'Tariq Abboud',
      due: 'Today, 2:30 PM',
      priority: 'high'
    },
    {
      id: 'act-2',
      type: 'meeting',
      subject: 'Early Harvest 2026 Tasting Session',
      client: 'Beirut Gourmet House - Ashrafieh',
      rep: 'George Haddad',
      due: 'Today, 4:00 PM',
      priority: 'high'
    },
    {
      id: 'act-3',
      type: 'call',
      subject: 'Review Credit Terms on Soap Shipment',
      client: 'Saida Wholesalers Consortium',
      rep: 'Ziad Al-Amin',
      due: 'Tomorrow, 10:00 AM',
      priority: 'medium'
    },
    {
      id: 'act-4',
      type: 'followup',
      subject: 'Confirm Delivery Gate at Tyre Coastal Depot',
      client: 'Tyre Coastal Hospitality Co.',
      rep: 'Karim Daher',
      due: 'Tomorrow, 1:15 PM',
      priority: 'normal'
    }
  ];

  const nextActions = useMemo(() => {
    if (selectedBranch === '0' || selectedBranch === 'ALL') return allNextActions;
    const repNames = new Set(filteredTeamPerformance.map(r => r.name));
    const filtered = allNextActions.filter(a => repNames.has(a.rep));
    return filtered.length > 0 ? filtered : allNextActions.slice(0, 1);
  }, [selectedBranch, filteredTeamPerformance]);

  return (
    <div className="w-full space-y-6" dir={dir}>
      {/* REFRESH TOAST NOTIFICATION */}
      {refreshToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. HERO BAR                                                             */}
      {/* ======================================================================= */}
      <div className="bg-[#101828] text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {t('sales_manager_dashboard', 'Sales Manager Dashboard')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {t('sales_team_performance', 'Sales Team Performance')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {t('sales_team_performance_desc', 'Live Field Reps, Quotations, Invoiced Wins & Target Attainment · Southern Olive Oil Products S.A.R.L')}
              </p>
            </div>
          </div>
        </div>

        {/* Authentic Vanguard CRM Period Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-sm">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePeriod === p.value
                    ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActivePeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                const bName = e.target.value === '0' || e.target.value === 'ALL' ? 'All Branches' : getBranchData(e.target.value).name;
                triggerRefresh(bName);
              }}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              {allBranchesList.length > 1 && (
                <option value="0">{t('all_branches_label', 'All Branches (جميع الفروع)')}</option>
              )}
              {allBranchesList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.arabicName})
                </option>
              ))}
            </select>

            {/* Currency toggle */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as 'USD' | 'LBP')}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">{t('currency_usd', 'USD ($)')}</option>
              <option value="LBP">{t('currency_lbp', 'LBP (ل.ل)')}</option>
            </select>

            <button
              type="button"
              onClick={() => triggerRefresh('Sales Pipeline')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
              title={t('refresh_data', 'Refresh Data')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('export_print', 'Export / Print')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SIX AUTHENTIC VANGUARD KPI CARDS                                     */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1: New Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('new_leads', 'New Leads')}</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalNewLeads}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{Math.round(totalNewLeads * 0.36)} {t('open_leads', 'open leads')}</div>
        </div>

        {/* KPI 2: Qualified New */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('qualified_new', 'Qualified New')}</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalQualified}</div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1">{totalQualityRate}% {t('conversion', 'conversion')}</div>
        </div>

        {/* KPI 3: Lost Qualified */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('lost_qualified', 'Lost Qualified')}</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalLostQualified}</div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1">{totalLostRate}% {t('of_qualified', 'of qualified')}</div>
        </div>

        {/* KPI 4: Won Invoices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('won_invoices', 'Won Invoices')}</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalWonInvoices}</div>
          <div className="text-[11px] font-bold text-emerald-700 mt-1">{formatCurrency(totalWonAmount)}</div>
        </div>

        {/* KPI 5: Quotations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('quotations', 'Quotations')}</span>
            <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{Math.round(totalWonInvoices * 0.63) || 8}</div>
          <div className="text-[11px] font-semibold text-slate-600 mt-1">{formatCurrency(Math.round(totalWonAmount * 0.77))} {t('val', 'val')}</div>
        </div>

        {/* KPI 6: Expected Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('expected_pipeline', 'Expected Pipeline')}</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(Math.round(totalTarget * 0.59))}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{Math.round(totalWonInvoices * 0.42) || 5} {t('active_quotes', 'active quotes')}</div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. WON TARGET ATTAINMENT PROGRESS BAR                                   */}
      {/* ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-black">{t('won_target_attainment', 'Won Target Attainment (Period Goal)')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">{t('attainment', 'Attainment:')}</span>
            <span className="text-emerald-700 font-mono font-black text-base">{targetAttainment}%</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 p-0.5">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(100, Number(targetAttainment))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-2.5">
          <span>{t('current_invoiced_won', 'Current Invoiced Won:')} <b className="text-slate-900 font-mono text-sm">{formatCurrency(totalWonAmount)}</b></span>
          <span>{t('target_monthly_quota', 'Target Monthly Quota:')} <b className="text-slate-900 font-mono text-sm">{formatCurrency(totalTarget)}</b></span>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. MAIN PERFORMANCE GRID                                                */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 8 COLS: SALESMAN LEADERBOARD & PIPELINE FUNNEL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Sales Team Performance Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{t('sales_team_leaderboard', 'Sales Team Performance Leaderboard')}</h2>
                  <p className="text-xs text-slate-500">{t('sales_team_leaderboard_desc', 'Live individual rep quota progress & conversion velocity')}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {filteredTeamPerformance.length} {t('field_reps', 'Field Reps')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-3.5">{t('salesman', 'Salesman')}</th>
                    <th className="py-3 px-3 text-right">{t('new_leads', 'New Leads')}</th>
                    <th className="py-3 px-3 text-right">{t('qualified', 'Qualified')}</th>
                    <th className="py-3 px-3 text-right">{t('qualified_pct', 'Qualified %')}</th>
                    <th className="py-3 px-3 text-right">{t('lost', 'Lost')}</th>
                    <th className="py-3 px-3 text-right">{t('lost_pct', 'Lost %')}</th>
                    <th className="py-3 px-3 text-right">{t('won_inv', 'Won Inv.')}</th>
                    <th className="py-3 px-3.5 text-right">{t('won_amount', 'Won Amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTeamPerformance.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 text-sm">{rep.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{rep.territory}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">{rep.newLeads}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">{rep.qualifiedLeads}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{rep.qualityRate}%</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">{rep.lostQualifiedLeads}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">{rep.lostRate}%</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">{rep.wonInvoices}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-800 bg-emerald-50/50">
                        {formatCurrency(rep.wonAmount)}
                      </td>
                    </tr>
                  ))}
                  {/* Consolidated Totals Row */}
                  <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300">
                    <td className="py-3.5 px-3.5 font-black text-slate-900 text-sm">{t('total_team_output', 'Total Team Output')}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-900 text-sm">
                      {totalNewLeads}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-emerald-800 text-sm">
                      {totalQualified}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-900 text-sm">{totalQualityRate}%</td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-700 text-sm">
                      {totalLostQualified}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-500 text-sm">{totalLostRate}%</td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-900 text-sm">
                      {totalWonInvoices}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-emerald-950 bg-emerald-200/80 text-sm font-black">
                      {formatCurrency(totalWonAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline Stage Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{t('active_deals_pipeline_funnel', 'Active Deals Pipeline Funnel')}</h2>
                  <p className="text-xs text-slate-500">{t('stage_progression_distribution', 'Stage progression & deal value distribution')}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold">{totalNewLeads} {t('total_deals', 'Total Deals')}</span>
            </div>

            <div className="space-y-4 pt-1">
              {pipelineStages.map((ps) => (
                <div key={ps.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{t('pipeline_stage_' + ps.stage.substring(0, 1), ps.stage)}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500">({ps.count} {t('deals', 'deals')})</span>
                      <span className="font-black text-slate-900">{formatCurrency(ps.value)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${ps.percent}%`, backgroundColor: ps.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 4 COLS: LEAD SOURCES & UPCOMING ACTIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Lead Sources Quality Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{t('lead_sources_quality', 'Lead Sources Quality')}</h2>
                  <p className="text-xs text-slate-500">{t('channel_qualification_conversion', 'Channel qualification conversion')}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {t('conversion', 'Conversion')}
              </span>
            </div>

            <div className="space-y-3">
              {leadSources.map((ls) => (
                <div key={ls.source} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{t('lead_source_' + ls.source.toLowerCase().replace(/[^a-z0-9]/g, '_'), ls.source)}</span>
                    <span className="font-mono font-black text-emerald-700">{ls.qualityRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium">
                    <span>{ls.leads} {t('inbound_leads', 'Inbound Leads')}</span>
                    <span className="font-bold text-slate-700">{ls.wonDeals} {t('deals_won', 'Deals Won')}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${ls.qualityRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Next Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{t('next_actions_rep_followups', 'Next Actions & Rep Follow-ups')}</h2>
                  <p className="text-xs text-slate-500">{t('upcoming_tasks_meetings', 'Upcoming tasks & meetings')}</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                {nextActions.length} {t('open', 'Open')}
              </span>
            </div>

            <div className="space-y-3">
              {nextActions.map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow hover:shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {act.subject}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      act.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t(act.priority, act.priority)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 font-bold mt-1">
                    {act.client}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
                    <span>{act.rep}</span>
                    <span className="font-mono text-slate-700 font-bold">{act.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
