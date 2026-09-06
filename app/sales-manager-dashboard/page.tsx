'use client';

import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';

interface RepPerformance {
  id: string;
  name: string;
  territory: string;
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

export default function AuthenticSalesManagerDashboard() {
  const { currentTenant } = useTenant();

  // Active period filter matching authentic Omega CRM5
  const [activePeriod, setActivePeriod] = useState<string>('month');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'LBP'>('USD');
  const [selectedBranch, setSelectedBranch] = useState<string>('0');

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const formatCurrency = (amount: number) => {
    const val = amount * (selectedCurrency === 'USD' ? 1 : 89500);
    if (selectedCurrency === 'USD') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} L.L`;
  };

  // Team Performance Data
  const teamPerformance: RepPerformance[] = [
    {
      id: 'rep-1',
      name: 'Tariq Abboud',
      territory: 'Beirut & Mount Lebanon Commercial',
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
      territory: 'Saida & Coastal Wholesalers',
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
      territory: 'Nabatieh & South Agricultural Hubs',
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
      territory: 'Tyre & Southern Hospitality',
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
      territory: 'Choueifat & Koura Food Retail',
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
      territory: 'Export & Gourmet Supermarkets',
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

  const totalWonAmount = teamPerformance.reduce((acc, r) => acc + r.wonAmount, 0);
  const totalTarget = teamPerformance.reduce((acc, r) => acc + r.target, 0);
  const targetAttainment = ((totalWonAmount / totalTarget) * 100).toFixed(1);

  // Pipeline Funnel
  const pipelineStages: PipelineStage[] = [
    { stage: '1. New Inquiries & Inbound', count: 123, value: 420000, percent: 100, color: '#3b82f6' },
    { stage: '2. Contacted & Samples Dispatched', count: 94, value: 345000, percent: 76, color: '#6366f1' },
    { stage: '3. Technical Tasting & Spec Approval', count: 68, value: 285000, percent: 55, color: '#8b5cf6' },
    { stage: '4. Quotations & Bulk Pricing Sent', count: 48, value: 212000, percent: 39, color: '#06b6d4' },
    { stage: '5. Contract Finalization / PO Pending', count: 32, value: 164000, percent: 26, color: '#f59e0b' },
    { stage: '6. Closed Won Invoices', count: 76, value: 276400, percent: 62, color: '#10b981' },
  ];

  // Lead Sources
  const leadSources: LeadSource[] = [
    { source: 'Direct Field Agro Sales', leads: 48, qualityRate: 82.5, wonDeals: 31 },
    { source: 'Wholesale Distributor Referrals', leads: 34, qualityRate: 79.4, wonDeals: 22 },
    { source: 'SuperSonic B2B Merchant Portal', leads: 26, qualityRate: 73.1, wonDeals: 15 },
    { source: 'Food Expo & Olive Oil Fair', leads: 18, qualityRate: 88.9, wonDeals: 14 },
    { source: 'Direct Website & Catalog Orders', leads: 15, qualityRate: 60.0, wonDeals: 7 },
  ];

  // Upcoming Next Actions
  const nextActions: NextAction[] = [
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

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#172033] font-sans pb-16 crm5-app">
      <style jsx global>{`
        .crm5-app {
          --crm5-bg: #f6f7f9;
          --crm5-ink: #172033;
          --crm5-muted: #6b7280;
          --crm5-line: #e6e8ee;
          --crm5-card: #ffffff;
          --crm5-blue: #2563eb;
          --crm5-green: #0f9f6e;
          --crm5-amber: #d97706;
          --crm5-red: #dc2626;
          --crm5-cyan: #0891b2;
        }

        .crm5-hero {
          background: #101828;
          color: #ffffff;
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 4px 14px rgba(16, 24, 40, 0.12);
        }

        .crm5-periods {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .crm5-periods button {
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.75);
          border-radius: 6px;
          min-height: 32px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .crm5-periods button.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .crm5-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
        }

        .crm5-kpi {
          background: #ffffff;
          border: 1px solid #e6e8ee;
          border-radius: 12px;
          padding: 16px;
          min-height: 104px;
          display: flex;
          flex-col;
          justify-content: space-between;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .crm5-kpi:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
        }

        .crm5-section {
          background: #ffffff;
          border: 1px solid #e6e8ee;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
        }

        .crm5-table {
          width: 100%;
          border-collapse: collapse;
        }
        .crm5-table th {
          background: #f8fafc;
          color: #475569;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        .crm5-table td {
          font-size: 12.5px;
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* TOP HEADER / BREADCRUMB                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/backoffice/operations/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition flex items-center gap-1"
            >
              <span>← Back to Operations Overview</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">Sales Manager Dashboard</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Branch selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white shadow-2xs"
            >
              <option value="0">All Branches & Territories</option>
              <option value="1">00001 - Southern Olive Oil Products S.A.R.L</option>
              <option value="2">00002 - Nabatieh Southern Hub</option>
              <option value="3">00003 - Saida Distribution Depot</option>
              <option value="4">00004 - Tyre Coastal Center</option>
            </select>

            {/* Currency toggle */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as 'USD' | 'LBP')}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white shadow-2xs"
            >
              <option value="USD">USD ($)</option>
              <option value="LBP">LBP (ل.ل)</option>
            </select>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-4 lg:px-8 mt-5 space-y-5">
        
        {/* ======================================================================= */}
        {/* 1. HERO BAR                                                             */}
        {/* ======================================================================= */}
        <div className="crm5-hero">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Sales Manager Dashboard</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Team Performance
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Real-time Field Reps, Quotations, Invoiced Wins & Target Attainment &middot; September 2026
            </p>
          </div>

          {/* Authentic Period Switcher */}
          <div className="crm5-periods">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                className={activePeriod === p.value ? 'active' : ''}
                onClick={() => setActivePeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. SIX AUTHENTIC KPI CARDS                                              */}
        {/* ======================================================================= */}
        <div className="crm5-kpi-grid">
          {/* KPI 1: New Leads */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>New Leads</span>
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <Filter className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">123</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">45 open leads</div>
          </div>

          {/* KPI 2: Qualified New */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Qualified New</span>
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">94</div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1">76.4% of new leads</div>
          </div>

          {/* KPI 3: Lost Qualified */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Lost Qualified</span>
              <span className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center">
                <XCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">13</div>
            <div className="text-[11px] font-semibold text-red-600 mt-1">13.8% of qualified</div>
          </div>

          {/* KPI 4: Won Invoices */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Won Invoices</span>
              <span className="w-6 h-6 rounded-md bg-slate-900 text-amber-400 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">76</div>
            <div className="text-[11px] font-bold text-emerald-700 mt-1">{formatCurrency(totalWonAmount)} won</div>
          </div>

          {/* KPI 5: Quotations */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Quotations</span>
              <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">48</div>
            <div className="text-[11px] font-semibold text-slate-600 mt-1">{formatCurrency(212000)} value</div>
          </div>

          {/* KPI 6: Expected Pipeline */}
          <div className="crm5-kpi">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Expected Pipeline</span>
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(164000)}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">32 open quotes</div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. WON TARGET ATTAINMENT BAR                                             */}
        {/* ======================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Won Target Attainment (Period Goal)</span>
            </div>
            <span className="text-emerald-700 font-mono font-black text-sm">{targetAttainment}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 p-0.5">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(100, Number(targetAttainment))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-2">
            <span>Current Won: <b className="text-slate-900 font-mono">{formatCurrency(totalWonAmount)}</b></span>
            <span>Target Goal: <b className="text-slate-900 font-mono">{formatCurrency(totalTarget)}</b></span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. MAIN GRID: TEAM PERFORMANCE & SIDEBAR ANALYTICS                      */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT 8 COLS: TEAM PERFORMANCE TABLE & PIPELINE FUNNEL */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Team Performance Table */}
            <div className="crm5-section">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900">Sales Team Performance Leaderboard</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                  {teamPerformance.length} Field Reps
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="crm5-table">
                  <thead>
                    <tr>
                      <th>Salesman</th>
                      <th className="text-right">New Leads</th>
                      <th className="text-right">Qualified</th>
                      <th className="text-right">Qualified %</th>
                      <th className="text-right">Lost</th>
                      <th className="text-right">Lost %</th>
                      <th className="text-right">Won Inv.</th>
                      <th className="text-right">Won Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                        <td>
                          <div className="font-bold text-slate-900">{rep.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{rep.territory}</div>
                        </td>
                        <td className="text-right font-mono font-semibold text-slate-700">{rep.newLeads}</td>
                        <td className="text-right font-mono font-bold text-emerald-700">{rep.qualifiedLeads}</td>
                        <td className="text-right font-mono font-bold text-slate-800">{rep.qualityRate}%</td>
                        <td className="text-right font-mono font-semibold text-red-600">{rep.lostQualifiedLeads}</td>
                        <td className="text-right font-mono text-slate-500">{rep.lostRate}%</td>
                        <td className="text-right font-mono font-black text-slate-900">{rep.wonInvoices}</td>
                        <td className="text-right font-mono font-black text-emerald-800 bg-emerald-50/40">
                          {formatCurrency(rep.wonAmount)}
                        </td>
                      </tr>
                    ))}
                    {/* Consolidated Totals */}
                    <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300">
                      <td className="font-bold text-slate-900">Total Team Output</td>
                      <td className="text-right font-mono text-slate-900">
                        {teamPerformance.reduce((a, b) => a + b.newLeads, 0)}
                      </td>
                      <td className="text-right font-mono text-emerald-800">
                        {teamPerformance.reduce((a, b) => a + b.qualifiedLeads, 0)}
                      </td>
                      <td className="text-right font-mono text-slate-900">75.8%</td>
                      <td className="text-right font-mono text-red-700">
                        {teamPerformance.reduce((a, b) => a + b.lostQualifiedLeads, 0)}
                      </td>
                      <td className="text-right font-mono text-slate-500">13.8%</td>
                      <td className="text-right font-mono text-slate-900">
                        {teamPerformance.reduce((a, b) => a + b.wonInvoices, 0)}
                      </td>
                      <td className="text-right font-mono text-emerald-950 bg-emerald-100 text-sm">
                        {formatCurrency(totalWonAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline Stage Funnel */}
            <div className="crm5-section">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Active Deals Pipeline Funnel</h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">123 Total Deals</span>
              </div>

              <div className="space-y-3 pt-1">
                {pipelineStages.map((ps) => (
                  <div key={ps.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{ps.stage}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500">({ps.count} deals)</span>
                        <span className="font-bold text-slate-900">{formatCurrency(ps.value)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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
          <div className="lg:col-span-4 space-y-5">
            
            {/* Lead Sources Quality Rate */}
            <div className="crm5-section">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Lead Sources Quality</h2>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Conversion
                </span>
              </div>

              <div className="space-y-3">
                {leadSources.map((ls) => (
                  <div key={ls.source} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{ls.source}</span>
                      <span className="font-mono text-emerald-700">{ls.qualityRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium">
                      <span>{ls.leads} Inbound Leads</span>
                      <span className="font-bold text-slate-700">{ls.wonDeals} Deals Won</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
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
            <div className="crm5-section">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">Next Actions & Rep Follow-ups</h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                  {nextActions.length} Open
                </span>
              </div>

              <div className="space-y-2.5">
                {nextActions.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {act.subject}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        act.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {act.priority}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 font-semibold mt-1">
                      {act.client}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span className="font-medium">{act.rep}</span>
                      <span className="font-mono text-slate-600 font-bold">{act.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
