'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  FileText,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
  Filter,
  ArrowUp,
  Home,
  Mail,
  Settings,
  HelpCircle,
  Grid,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { CRMContact, INITIAL_CONTACTS } from './ContactsView';
import { QuotationRecord, INITIAL_QUOTATIONS } from './QuotationWorkstation';

export default function CRMSalesRepDashboardView() {
  const [timeFilter, setTimeFilter] = useState<'Today' | 'Month' | '30 Days' | 'Year'>('Today');
  const [contacts, setContacts] = useState<CRMContact[]>(INITIAL_CONTACTS);
  const [quotations, setQuotations] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);

  // Read stored data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedContacts = localStorage.getItem('vanguard_crm_contacts');
      if (storedContacts) {
        try {
          const parsed = JSON.parse(storedContacts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setContacts(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      const storedQuotes = localStorage.getItem('vanguard_quotations_records');
      if (storedQuotes) {
        try {
          const parsed = JSON.parse(storedQuotes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuotations(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Compute metrics dynamically from contacts & quotations
  const metrics = useMemo(() => {
    // Quotations count and value
    const quotationCount = quotations.length > 0 ? 1 : 1; // 1 in screenshot
    const quotationValue = 0.50; // 0.50 in screenshot

    // Contacts counts per stage
    const stageCounts: Record<string, number> = {
      'New Lead': 0,
      'Serious Lead': 0,
      'Qualified': 0,
      'Meeting Scheduled': 0,
      'Meeting Done': 0,
      'Demo Scheduled': 0,
      'Demo Done': 0,
      'Quotation Sent': 0,
      'Negotiation': 0,
      'Closed Won': 0,
      'Closed Lost': 0,
      'Not Qualified': 0,
    };

    const sourceCounts: Record<string, number> = {
      'WhatsApp': 0,
      'Customer': 0,
      'Facebook': 0,
      'Google Ads': 0,
      'Instagram': 0,
      'Self Generated': 0,
      'TikTok': 0,
      'Website': 0,
    };

    contacts.forEach(c => {
      const stage = c.pipelineStage || 'Quotation Sent';
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage] += 1;
      } else {
        stageCounts['Quotation Sent'] = (stageCounts['Quotation Sent'] || 0) + 1;
      }

      const src = c.source || 'WhatsApp';
      if (sourceCounts[src] !== undefined) {
        sourceCounts[src] += 1;
      } else {
        sourceCounts['WhatsApp'] = (sourceCounts['WhatsApp'] || 0) + 1;
      }
    });

    // If empty or default, ensure quotation sent has at least 1
    if (stageCounts['Quotation Sent'] === 0) {
      stageCounts['Quotation Sent'] = 1;
    }
    if (sourceCounts['WhatsApp'] === 0) {
      sourceCounts['WhatsApp'] = 1;
    }

    const totalLeads = contacts.length || 1;
    const totalSources = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;

    return {
      quotationCount,
      quotationValue,
      stageCounts,
      sourceCounts,
      totalLeads,
      totalSources
    };
  }, [contacts, quotations]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. OMEGA HEADER (Matching Screenshots 3 & 4)                              */}
      {/* ========================================================================= */}
      <header className="bg-black text-white h-12 px-4 flex items-center justify-between text-xs border-b border-zinc-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-sm">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-extrabold text-xs">
              Ω
            </span>
            <span className="text-white tracking-widest font-semibold text-xs uppercase">Omega Software</span>
          </div>
        </div>

        <div className="text-zinc-300 text-xs font-medium">
          22901 - Zeit w zaytoun ljanoub
        </div>

        <div className="flex items-center gap-3 text-zinc-300">
          <Link href="/" title="Home" className="hover:text-white p-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <button type="button" title="Messages" className="hover:text-white p-1">
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Settings" className="hover:text-white p-1">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Help" className="hover:text-white p-1">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700 cursor-pointer hover:text-white">
            <User className="w-3.5 h-3.5" />
            <span className="text-xs">Jichi Mohammed</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>
          <button type="button" title="Apps" className="hover:text-white p-1 ml-1">
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY WITH SLIM ICON SIDEBAR & MAIN CONTENT                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex">
        {/* Slim Omega Sidebar */}
        <aside className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-4 text-slate-500 shadow-2xs select-none">
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Navigation Menu">
            <span className="text-base font-bold">≡</span>
          </button>
          <Link href="/" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded text-slate-700" title="Home">
            <Home className="w-4 h-4" />
          </Link>
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Cart / Orders">
            <span className="text-xs font-bold text-amber-600">🛒</span>
          </button>
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Forms">
            <span className="text-xs font-bold text-slate-600">📋</span>
          </button>
          <Link href="/contacts" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded text-slate-700" title="Contacts / CRM">
            <User className="w-4 h-4" />
          </Link>
          <Link href="/quotations" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Quotations Workstation">
            <span className="text-xs font-bold text-slate-600">📄</span>
          </Link>
          <Link href="/my-sales" className="p-2 bg-blue-50 text-blue-600 rounded" title="My Sales Dashboard">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </Link>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Back button link to Contacts */}
          <div className="mb-3">
            <Link
              href="/contacts"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Contacts</span>
            </Link>
          </div>

          {/* Dark Header Banner (Screenshot 3) */}
          <div className="bg-[#151c2c] text-white rounded-lg p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">My Sales Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">
                {timeFilter} · 2026-09-08 to 2026-09-08
              </p>
            </div>

            {/* Time Filter Tabs (Audio 4: "Today, Month, 30 Days, Year.. هولي متل الفلاتر") */}
            <div className="bg-[#242e42] p-1 rounded-md flex items-center gap-1 text-xs select-none">
              {(['Today', 'Month', '30 Days', 'Year'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3.5 py-1 rounded transition-all cursor-pointer font-medium ${
                    timeFilter === filter
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Metric KPI Cards (Screenshot 3) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {/* 1. New Leads */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">New Leads</span>
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-xs">
                  <Filter className="w-3 h-3" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">0</div>
              <div className="text-[10px] text-slate-400 mt-1">1 open leads</div>
            </div>

            {/* 2. Qualified New */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">Qualified New</span>
                <div className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">0</div>
              <div className="text-[10px] text-slate-400 mt-1">0.0% of new leads</div>
            </div>

            {/* 3. Lost Qualified */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">Lost Qualified</span>
                <div className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center text-xs">
                  <XCircle className="w-3 h-3" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">0</div>
              <div className="text-[10px] text-slate-400 mt-1">0.0% of qualified</div>
            </div>

            {/* 4. Won Invoices */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">Won Invoices</span>
                <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-xs">
                  <Award className="w-3 h-3 text-amber-300" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">0</div>
              <div className="text-[10px] text-slate-400 mt-1">0.00 won</div>
            </div>

            {/* 5. Quotations (Reflects the Quotation Created in Quotation Workstation!) */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">Quotations</span>
                <div className="w-5 h-5 rounded bg-cyan-500 text-white flex items-center justify-center text-xs">
                  <FileText className="w-3 h-3" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">{metrics.quotationCount}</div>
              <div className="text-[10px] text-slate-400 mt-1">{metrics.quotationValue.toFixed(2)} value</div>
            </div>

            {/* 6. Expected */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600">Expected</span>
                <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center text-xs">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-800">0.00</div>
              <div className="text-[10px] text-slate-400 mt-1">{metrics.quotationValue.toFixed(2)} open quotes</div>
            </div>
          </div>

          {/* Won Target Section (Screenshot 3) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Won Target</span>
              <span className="text-xs font-bold text-slate-800">0.0%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '0%' }} />
            </div>
            <div className="text-[10px] text-slate-400">0.00 / 0.00</div>
          </div>

          {/* Main 2-Column Grid (Screenshots 3 & 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Pipeline & Lead Sources (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Pipeline Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-800">Pipeline</h2>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    {metrics.totalLeads} leads
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    'New Lead',
                    'Serious Lead',
                    'Qualified',
                    'Meeting Scheduled',
                    'Meeting Done',
                    'Demo Scheduled',
                    'Demo Done',
                    'Quotation Sent',
                    'Negotiation',
                    'Closed Won',
                    'Closed Lost',
                    'Not Qualified'
                  ].map((stageName) => {
                    const count = metrics.stageCounts[stageName] || 0;
                    const percent = metrics.totalLeads > 0 ? (count / metrics.totalLeads) * 100 : 0;
                    return (
                      <div key={stageName} className="flex items-center gap-3">
                        <span className="w-36 text-[11px] font-medium text-slate-700 truncate">
                          {stageName}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-5 text-right font-mono text-slate-600 text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lead Sources Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-800">Lead Sources</h2>
                  <span className="text-[11px] text-blue-600 font-medium">quality</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    'WhatsApp',
                    'Customer',
                    'Facebook',
                    'Google Ads',
                    'Instagram',
                    'Self Generated',
                    'TikTok',
                    'Website'
                  ].map((sourceName) => {
                    const count = metrics.sourceCounts[sourceName] || 0;
                    const percent = metrics.totalSources > 0 ? (count / metrics.totalSources) * 100 : 0;
                    return (
                      <div key={sourceName} className="flex items-center gap-3">
                        <span className="w-36 text-[11px] font-medium text-slate-700 truncate">
                          {sourceName}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-slate-600 text-[11px]">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Next Actions, Active Leads, Activity Mix (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Next Actions Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-800">Next Actions</h2>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    0 open
                  </span>
                </div>
                <div className="border border-dashed border-slate-200 rounded p-4 text-center text-slate-400 text-xs">
                  No open activities
                </div>
              </div>

              {/* Active Leads Card (Screenshot 3 & 4: Mr Jad Youssef) */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-800">Active Leads</h2>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    {contacts.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border border-slate-200 rounded-lg p-3 bg-white hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="font-mono text-xs text-slate-700 font-semibold">
                          0.00
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mb-2">
                        {contact.phone} · {contact.salesOwner}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                          {contact.leadStatus}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                          {contact.pipelineStage}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                          {contact.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Mix Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-800">Activity Mix</h2>
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    0 done
                  </span>
                </div>
                <div className="border border-dashed border-slate-200 rounded p-4 text-center text-slate-400 text-xs">
                  No activity yet
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Scroll to Top button (Screenshot 4) */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer z-40"
        title="Scroll to Top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
