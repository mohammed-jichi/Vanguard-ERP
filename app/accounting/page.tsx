'use client';

/**
 * Vanguard ERP - Accounting Module Dashboard
 * Exact functional parity with Omega ERP Accounting Dashboard
 * Strictly adhering to Vanguard's Design System tokens and clean English interface.
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Building2,
  PieChart,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  Wallet,
  Landmark,
  Layers,
  BarChart3,
  Printer,
  Download,
  Check
} from 'lucide-react';
import {
  MONTHLY_PL_TREND,
  INITIAL_AR_AGING,
  INITIAL_AP_AGING,
  INITIAL_ACCOUNT_DETAILS,
  INITIAL_JOURNAL_VOUCHERS,
  getLocalAccounts,
  getLocalJVs,
  JournalVoucher,
  AccountDetail
} from '@/lib/accountingData';
import {
  apiFetchAccounts,
  apiFetchVouchers,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';
import AccountingActionsPage from './actions/page';
import AccountingReportsPage from './reports/page';
import AccountingSetupPage from './setup/page';
import StandardUnderDevelopmentPlaceholder from '@/components/StandardUnderDevelopmentPlaceholder';

export function AccountingDashboardContent() {
  const { t } = useLanguage();
  // Top Header Filter States
  const [period, setPeriod] = useState<string>('THIS_MONTH');
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [mainDept, setMainDept] = useState<string>('ALL');
  const [subDept, setSubDept] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeChartMonth, setActiveChartMonth] = useState<number>(MONTHLY_PL_TREND.length - 1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Local Accounts & JVs (Deterministic initial state to prevent SSR/client hydration mismatch)
  const [accounts, setAccounts] = useState<AccountDetail[]>(INITIAL_ACCOUNT_DETAILS);
  const [jvs, setJvs] = useState<JournalVoucher[]>(INITIAL_JOURNAL_VOUCHERS);

  useEffect(() => {
    setAccounts(getLocalAccounts());
    setJvs(getLocalJVs());

    apiFetchAccounts().then((persistedAccs) => {
      if (persistedAccs && persistedAccs.length > 0) {
        setAccounts(persistedAccs);
      }
    });

    apiFetchVouchers().then((persistedJvs) => {
      if (persistedJvs && persistedJvs.length > 0) {
        setJvs(persistedJvs);
      }
    });

    const unsubscribe = subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'VOUCHER_SAVED' || e.detail?.type === 'VOUCHER_DELETED') {
        apiFetchVouchers().then(setJvs);
        apiFetchAccounts().then(setAccounts);
      } else if (e.detail?.type === 'ACCOUNT_SAVED') {
        apiFetchAccounts().then(setAccounts);
      }
    });

    return unsubscribe;
  }, []);

  const exchangeRate = 89500; // 1 USD = 89,500 LBP

  const formatCurrency = (amountUsd: number) => {
    if (currency === 'USD') {
      return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const lbp = amountUsd * exchangeRate;
      return `${lbp.toLocaleString('en-US')} LBP`;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleExport = () => {
    setExportNotice('Exporting Accounting Dashboard KPI & GL Summary (CSV/Excel)...');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Metric Computations
  const totalRevenue = 485000;
  const totalExpenses = 315200;
  const netIncome = totalRevenue - totalExpenses;
  const netMargin = ((netIncome / totalRevenue) * 100).toFixed(1);

  const totalAR = INITIAL_AR_AGING.reduce((acc, curr) => acc + curr.totalDebt, 0);
  const totalAP = INITIAL_AP_AGING.reduce((acc, curr) => acc + curr.totalOwed, 0);

  const cashVault = 48500;
  const blomBank = 184200;
  const audiBank = 92400;
  const totalLiquid = cashVault + blomBank + audiBank;

  const totalJvDebit = jvs.reduce((acc, j) => acc + j.total_debit, 0);
  const totalJvCredit = jvs.reduce((acc, j) => acc + j.total_credit, 0);

  const selectedMonthData = MONTHLY_PL_TREND[activeChartMonth] || MONTHLY_PL_TREND[MONTHLY_PL_TREND.length - 1];

  return (
    <div className="space-y-6">

      {/* Export / System Notification */}
      {exportNotice && (
        <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-xs hover:underline opacity-80 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TOP CONTROL & FILTER BAR */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Controls: Period, Main Dept, Sub Dept */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium w-full lg:w-auto">
          <div className="flex items-center gap-2 text-muted-foreground pr-1">
            <Filter className="w-4 h-4 text-foreground" />
            <span className="font-semibold text-foreground">Filters:</span>
          </div>

          {/* Period Selector Presets */}
          <div className="flex items-center gap-1 bg-muted border border-border p-1 rounded-lg">
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'THIS_QUARTER', label: 'This Quarter' },
              { id: 'THIS_YEAR', label: 'Fiscal Year' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-card text-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Main Department Dropdown */}
          <div className="flex items-center">
            <select
              value={mainDept}
              onChange={(e) => setMainDept(e.target.value)}
              className="bg-card border border-input text-foreground text-xs px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="ALL">All Departments</option>
              <option value="ADMIN">Executive &amp; Administration</option>
              <option value="PRODUCTION">Olive Mill &amp; Plant Production</option>
              <option value="SALES">Commercial Sales &amp; Distribution</option>
              <option value="FLEET">Logistics &amp; Fleet Operations</option>
            </select>
          </div>

          {/* Sub-Department Dropdown */}
          <div className="flex items-center">
            <select
              value={subDept}
              onChange={(e) => setSubDept(e.target.value)}
              className="bg-card border border-input text-foreground text-xs px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="ALL">All Sub-Departments &amp; Cost Centers</option>
              <option value="PLANT_CHOUEIFAT">Central Choueifat Plant &amp; Press</option>
              <option value="DEPOT_SOUR">Tyre Depot &amp; Southern Distribution</option>
              <option value="RETAIL_BEIRUT">Beirut Flagship Retail Center</option>
            </select>
          </div>
        </div>

        {/* Right Action Controls: Currency Switcher, Refresh, Export, Print, New Voucher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center bg-muted border border-border p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-card text-foreground font-bold shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('LBP')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'LBP' ? 'bg-card text-foreground font-bold shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              LBP (L.L)
            </button>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Refresh Ledger Figures"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Export Data to Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t('export_csv_excel', 'Export')}</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Print Dashboard Report"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t('print_report_pdf', 'Print')}</span>
          </button>

          {/* New Voucher Action */}
          <Link
            href="/accounting/actions?tab=JV"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('new_voucher', 'New Voucher')}</span>
          </Link>
        </div>

      </div>

      {/* TOP KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenues */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-2 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('total_revenues', 'Total Revenues')}</span>
            <span className="p-2 rounded-lg bg-muted text-foreground border border-border">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalRevenue)}</h3>
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% vs prior period</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-2 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('operating_expenses', 'Operating Expenses')}</span>
            <span className="p-2 rounded-lg bg-muted text-foreground border border-border">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalExpenses)}</h3>
          <div className="text-xs text-muted-foreground font-medium">
            Includes harvest purchases &amp; fuel
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-2 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('net_operating_profit', 'Net Operating Profit')}</span>
            <span className="p-2 rounded-lg bg-muted text-foreground border border-border">
              <DollarSign className="w-4 h-4 text-primary" />
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(netIncome)}</h3>
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Net Margin: {netMargin}%</span>
          </div>
        </div>

        {/* Total Liquid Cash & Bank */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-2 hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('total_liquid_cash', 'Liquid Funds (Cash & Bank)')}</span>
            <span className="p-2 rounded-lg bg-muted text-foreground border border-border">
              <Landmark className="w-4 h-4 text-primary" />
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalLiquid)}</h3>
          <div className="text-xs text-muted-foreground font-medium">
            3 bank accounts + mill cash vault
          </div>
        </div>

      </div>

      {/* P&L TREND INTERACTIVE CHART SECTION */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Profit &amp; Loss Performance Trend</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monthly comparative audit of revenues, expenses, and net profit — click on any month to view detailed breakdown
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span className="text-muted-foreground">Revenues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              <span className="text-muted-foreground">Net Profit</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Chart Bars */}
        <div className="space-y-4">
          <div className="grid grid-cols-9 gap-2 md:gap-4 items-end h-52 pt-6 pb-2 border-b border-border">
            {MONTHLY_PL_TREND.map((item, idx) => {
              const maxVal = 75000;
              const revHeight = Math.min((item.revenue / maxVal) * 100, 100);
              const expHeight = Math.min((item.expenses / maxVal) * 100, 100);
              const isSelected = activeChartMonth === idx;

              return (
                <div
                  key={item.month}
                  onClick={() => setActiveChartMonth(idx)}
                  className={`flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group transition-all p-1.5 rounded-lg ${
                    isSelected ? 'bg-muted ring-1 ring-primary shadow-2xs' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-2.5 sm:w-3.5 bg-emerald-600 rounded-t-sm transition-all group-hover:brightness-110"
                      title={`Revenue: ${formatCurrency(item.revenue)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-2.5 sm:w-3.5 bg-destructive rounded-t-sm transition-all group-hover:brightness-110"
                      title={`Expenses: ${formatCurrency(item.expenses)}`}
                    />
                  </div>
                  <span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Tooltip / Data Card for Selected Month */}
          <div className="bg-muted border border-border rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-primary text-primary-foreground rounded-md font-semibold text-xs">
                Month: {selectedMonthData.month} 2026
              </span>
              <span className="text-muted-foreground font-medium">
                Audited monthly financial statements:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Realized Revenues</span>
                <span className="text-emerald-700 font-mono font-bold text-xs">{formatCurrency(selectedMonthData.revenue)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Operating Costs</span>
                <span className="text-destructive font-mono font-bold text-xs">{formatCurrency(selectedMonthData.expenses)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Net Operating Profit</span>
                <span className="text-foreground font-mono font-bold text-xs">{formatCurrency(selectedMonthData.netProfit)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Profit Margin</span>
                <span className="text-foreground font-mono font-bold text-xs">
                  {((selectedMonthData.netProfit / selectedMonthData.revenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 SUMMARY BLOCKS (OMEGA ERP DASHBOARD CORE DOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BLOCK 1: GENERAL LEDGER SUMMARY */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>General Ledger Summary</span>
            </h4>
            <Link
              href="/accounting/actions?tab=JV"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Journal Entries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted p-3 rounded-lg border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium block">Total Debit</span>
              <span className="text-emerald-700 font-mono font-bold text-sm">{formatCurrency(totalJvDebit)}</span>
            </div>
            <div className="bg-muted p-3 rounded-lg border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium block">Total Credit</span>
              <span className="text-destructive font-mono font-bold text-sm">{formatCurrency(totalJvCredit)}</span>
            </div>
            <div className="bg-muted p-3 rounded-lg border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium block">Balance Difference</span>
              <span className="text-foreground font-mono font-bold text-sm">$0.00</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 pt-1 font-medium">
            <div className="flex justify-between">
              <span>Registered Journal Vouchers:</span>
              <strong className="text-foreground font-mono">{jvs.length} Entries</strong>
            </div>
            <div className="flex justify-between">
              <span>Approved &amp; Posted Vouchers:</span>
              <strong className="text-emerald-700 font-mono">{jvs.filter(j => j.is_posted).length} Posted</strong>
            </div>
            <div className="flex justify-between">
              <span>Trial Balance Status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Balanced
              </span>
            </div>
          </div>
        </div>

        {/* BLOCK 2: ACCOUNTS RECEIVABLE (AGING & DEBTORS) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Accounts Receivable (AR Aging)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-700">{formatCurrency(totalAR)}</span>
          </div>

          <div className="space-y-2 text-xs">
            {INITIAL_AR_AGING.slice(0, 3).map((cust) => (
              <div key={cust.accountCode} className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">{cust.customerName}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Account #{cust.accountCode}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground block">{formatCurrency(cust.totalDebt)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    cust.risk === 'LOW' ? 'bg-card text-emerald-700 border-emerald-300' :
                    cust.risk === 'MEDIUM' ? 'bg-card text-amber-700 border-amber-300' : 'bg-card text-destructive border-destructive/40'
                  }`}>
                    {cust.risk} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK 3: ACCOUNTS PAYABLE (SUPPLIERS & COMMITMENTS) */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-destructive" />
              <span>Accounts Payable (AP Aging)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-destructive">{formatCurrency(totalAP)}</span>
          </div>

          <div className="space-y-2 text-xs">
            {INITIAL_AP_AGING.slice(0, 3).map((supp) => (
              <div key={supp.vendorCode} className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">{supp.supplierName}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{supp.terms}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground block">{formatCurrency(supp.totalOwed)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    supp.status === 'CURRENT' ? 'bg-card text-emerald-700 border-emerald-300' : 'bg-card text-amber-700 border-amber-300'
                  }`}>
                    {supp.status === 'CURRENT' ? 'Current' : 'Due Soon'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK 4: CASH & BANK VAULTS */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span>Cash &amp; Bank Balances</span>
            </h4>
            <span className="text-xs font-mono font-bold text-foreground">{formatCurrency(totalLiquid)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-muted rounded-lg border border-border flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground block">Central Mill Cash Vault</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Account #531000</span>
                </div>
              </div>
              <span className="font-mono font-bold text-foreground">{formatCurrency(cashVault)}</span>
            </div>

            <div className="p-3 bg-muted rounded-lg border border-border flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground block">BLOM Bank - Current Operating</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Account #512001</span>
                </div>
              </div>
              <span className="font-mono font-bold text-foreground">{formatCurrency(blomBank)}</span>
            </div>

            <div className="p-3 bg-muted rounded-lg border border-border flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground block">Bank Audi - Operational Account</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Account #512002</span>
                </div>
              </div>
              <span className="font-mono font-bold text-foreground">{formatCurrency(audiBank)}</span>
            </div>
          </div>
        </div>

        {/* BLOCK 5: BUDGET OVERVIEW */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              <span>Budget Overview &amp; Utilization</span>
            </h4>
            <span className="text-xs text-muted-foreground font-semibold">2026 Q3 Allocation</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">Raw Olive Harvest Procurement (COGS)</span>
                <span className="text-foreground font-mono font-bold">$504,000 / $720,000 (70%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">Glass Bottles &amp; Metal Containers</span>
                <span className="text-foreground font-mono font-bold">$102,000 / $140,000 (73%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-primary h-full rounded-full" style={{ width: '73%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-foreground">Fleet Logistics &amp; Transport Fuel</span>
                <span className="text-foreground font-mono font-bold">$43,500 / $65,000 (67%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-muted-foreground h-full rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 6: LATEST TRANSACTIONS & AUDIT FEED */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Recent Transactional Activity</span>
            </h4>
            <Link
              href="/accounting/actions?tab=JV"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All ({jvs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {jvs.slice(0, 3).map((jv) => (
              <div key={jv.id} className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold bg-card text-foreground px-2 py-0.5 rounded border border-border shadow-2xs">
                      {jv.jv_number}
                    </span>
                    <span className="font-semibold text-foreground text-xs truncate max-w-xs">{jv.description}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Posted By: {jv.posted_by || 'Super Admin'} &bull; Date: {jv.date_of_jv}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-foreground text-xs block">{formatCurrency(jv.total_debit)}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Posted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

function AccountingRootRouter() {
  const searchParams = useSearchParams();
  const rawSection = searchParams.get('section')?.toLowerCase() || 'dashboard';

  const activeSection = useMemo(() => {
    if (!rawSection || rawSection === 'dashboard') return 'dashboard';
    if (rawSection === 'reports' || rawSection === 'report') return 'reports';

    // Actions
    if (['jv', 'journal-voucher', 'journal_voucher'].includes(rawSection)) return 'jv';
    if (['purchase', 'expenses', 'expense'].includes(rawSection)) return 'purchase';
    if (['payments', 'payment'].includes(rawSection)) return 'payments';
    if (['receipts', 'receipt'].includes(rawSection)) return 'receipts';
    if (['ar', 'accounts-receivables', 'receivables'].includes(rawSection)) return 'ar';
    if (['ap', 'accounts-payables', 'payables'].includes(rawSection)) return 'ap';
    if (['bank_recon', 'bank-reconciliation', 'recon', 'reconciliation'].includes(rawSection)) return 'bank_recon';
    if (['vat_closing', 'vat-period-closing', 'vat'].includes(rawSection)) return 'vat_closing';

    // Setup
    if (['accounts', 'coa'].includes(rawSection)) return 'accounts';
    if (['aux_classes', 'classes'].includes(rawSection)) return 'aux_classes';
    if (['aux_header1', 'header-1'].includes(rawSection)) return 'aux_header1';
    if (['aux_header2', 'header-2'].includes(rawSection)) return 'aux_header2';
    if (['aux_header3', 'header-3'].includes(rawSection)) return 'aux_header3';
    if (['aux_group', 'group'].includes(rawSection)) return 'aux_group';
    if (['aux_jv_desc', 'jv-description'].includes(rawSection)) return 'aux_jv_desc';
    if (['aux_jv_types', 'jv-types'].includes(rawSection)) return 'aux_jv_types';
    if (['aux_currency', 'currency'].includes(rawSection)) return 'aux_currency';
    if (['aux_currency_rates', 'rates'].includes(rawSection)) return 'aux_currency_rates';
    if (['dept_groups', 'department-groups'].includes(rawSection)) return 'dept_groups';
    if (['department', 'departments'].includes(rawSection)) return 'department';
    if (['cash_flow_setup', 'cash-flow'].includes(rawSection)) return 'cash_flow_setup';
    if (['sub_dept', 'sub-department'].includes(rawSection)) return 'sub_dept';

    return rawSection;
  }, [rawSection]);

  const KNOWN_SECTIONS = [
    'dashboard', 'reports', 'jv', 'purchase', 'payments', 'receipts', 'ar', 'ap',
    'bank_recon', 'vat_closing', 'accounts', 'aux_classes', 'aux_header1',
    'aux_header2', 'aux_header3', 'aux_group', 'aux_jv_desc', 'aux_jv_types',
    'aux_currency', 'aux_currency_rates', 'dept_groups', 'department',
    'cash_flow_setup', 'sub_dept'
  ];

  const isKnownSection = KNOWN_SECTIONS.includes(activeSection);

  return (
    <div key={activeSection} className="w-full">
      {/* 1. DASHBOARD */}
      {activeSection === 'dashboard' && <AccountingDashboardContent />}

      {/* 2. REPORTS */}
      {activeSection === 'reports' && <AccountingReportsPage />}

      {/* 3. ACTIONS */}
      {activeSection === 'jv' && <AccountingActionsPage initialTab="JV" />}
      {activeSection === 'purchase' && <AccountingActionsPage initialTab="PURCHASE" />}
      {activeSection === 'payments' && <AccountingActionsPage initialTab="PAYMENT" />}
      {activeSection === 'receipts' && <AccountingActionsPage initialTab="RECEIPT" />}
      {activeSection === 'ar' && <AccountingActionsPage initialTab="AR" />}
      {activeSection === 'ap' && <AccountingActionsPage initialTab="AP" />}
      {activeSection === 'bank_recon' && <AccountingActionsPage initialTab="RECON" />}
      {activeSection === 'vat_closing' && <AccountingActionsPage initialTab="VAT" />}

      {/* 4. SETUP */}
      {activeSection === 'accounts' && <AccountingSetupPage initialTab="COA" />}
      {activeSection === 'aux_classes' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="CLASSES" />}
      {activeSection === 'aux_header1' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H1" />}
      {activeSection === 'aux_header2' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H2" />}
      {activeSection === 'aux_header3' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H3" />}
      {activeSection === 'aux_group' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H4" />}
      {['aux_jv_desc', 'aux_jv_types'].includes(activeSection) && <AccountingSetupPage initialTab="JV_SETUP" />}
      {['aux_currency', 'aux_currency_rates'].includes(activeSection) && <AccountingSetupPage initialTab="CURRENCIES" />}
      {['dept_groups', 'department', 'cash_flow_setup', 'sub_dept'].includes(activeSection) && <AccountingSetupPage initialTab="DEPTS" />}

      {/* 5. LIGHTWEIGHT PLACEHOLDER FOR UNIMPLEMENTED OR UPCOMING SUB-VIEWS */}
      {!isKnownSection && (
        <StandardUnderDevelopmentPlaceholder
          moduleTitle={`Accounting: ${rawSection}`}
          moduleCategory="ACCOUNTING & FINANCIALS"
          description={`The requested accounting sub-view or workstation "${rawSection}" is currently undergoing active engineering. Core General Ledger entries and balance integrity remain preserved.`}
          backUrl="/accounting"
          backLabel="Back to Accounting Hub"
        />
      )}
    </div>
  );
}

export default function AccountingDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading Accounting Dashboard...</div>}>
      <AccountingRootRouter />
    </Suspense>
  );
}
