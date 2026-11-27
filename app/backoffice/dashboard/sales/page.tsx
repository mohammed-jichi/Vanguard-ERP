'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Search,
  MapPin,
  Map,
  Smartphone,
  ShieldCheck,
  Navigation,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Filter,
  Store,
  Lock,
  QrCode
} from 'lucide-react';
import VMenuQrGeneratorConsole from '@/components/modules/sales/VMenuQrGeneratorConsole';
import { getBranchData, getAllBranchesList, BranchInfo } from '@/lib/branchData';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
import { resolveTenantUuid } from '@/lib/productCatalogService';
import { getTenantExchangeRate } from '@/lib/currencyEngine';
import { useHrEmployees } from '@/lib/hrTenantData';
import { extractInvoices, toLL, ccyToLL, liveRateFrom, computeEodState, PostedInvoice, VoidedInvoice } from '@/lib/eodLive';

export default function AuthenticVanguardSalesDashboard() {
  const { currentTenant, isModuleEnabled } = useTenant();
  const isFleetEnabled = isModuleEnabled('fleet');
  const isSocialEnabled = isModuleEnabled('social');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<'LBP' | 'USD'>('LBP');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1)); // current live month
  const [selectedDay, setSelectedDay] = useState('ALL');
  
  // Dynamic Branch Resolution
  const currentBranchData: BranchInfo = useMemo(() => {
    return getBranchData(selectedBranch);
  }, [selectedBranch]);

  const allBranchesList = useMemo(() => {
    return getAllBranchesList();
  }, []);

  const [recalcToast, setRecalcToast] = useState<string | null>(null);

  // Chart Mode: Pie or Line (toggled from the top right pill bar)
  const [chartMode, setChartMode] = useState<'pie' | 'line'>('pie');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'summary' | 'comparative' | 'customers' | 'today' | 'geographics' | 'vtrack' | 'vmenu_qr'>('summary');
  const [customerTopN, setCustomerTopN] = useState<number>(10);
  const [customerGroupFilter, setCustomerGroupFilter] = useState<string>('All Groups');

  // Auto-redirect if fleet module is disabled and user was on a fleet-dependent tab
  useEffect(() => {
    if (!isFleetEnabled && (activeTab === 'geographics' || activeTab === 'vtrack')) {
      setActiveTab('summary');
    }
  }, [isFleetEnabled, activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'vmenu_qr') {
        setActiveTab('vmenu_qr');
      }
    }
  }, []);

  const renderFleetEntitlementNotice = (featureName: string) => (
    <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto my-8">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-3xl mx-auto shadow-xs">
        🚚
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-black text-amber-700 uppercase tracking-widest bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300">
          Module Entitlement Required
        </span>
        <h3 className="text-base font-extrabold text-slate-900 mt-2">
          {featureName} is Deactivated
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Under strict domain isolation, spatial fleet telemetry, GPS vehicle tracking, and delivery run sheets belong to the <strong>SuperSonic Fleet / V-Driver</strong> module. When disabled for <strong>{currentTenant?.brandNameEn || currentTenant?.name}</strong>, its operational views and central aggregations are automatically suppressed.
        </p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
        >
          Return to Master Sales Summary
        </button>
        <Link prefetch={false}
          href="/admin"
          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs transition"
        >
          Configure 12-Module Entitlements
        </Link>
      </div>
    </div>
  );

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

  const [liveFlags, setLiveFlags] = useState<any>(null);
  // Live USD<->LBP rate from tenants.feature_flags (exchange_rate / currency_setup); falls back to tenant profile rate
  const usdRate = liveFlags ? liveRateFrom(liveFlags, getTenantExchangeRate(currentTenant)) : getTenantExchangeRate(currentTenant);

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
      setRecalcToast(`Recalculated live metrics for ${currentBranchData.name}`);
      setTimeout(() => setRecalcToast(null), 3500);
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

  // Days list for the selected month (live calendar)
  const dayMonthNum = /^\d+$/.test(selectedMonth) && selectedMonth !== '0' ? Number(selectedMonth) : new Date().getMonth() + 1;
  const daysInSelectedMonth = new Date(Number(selectedYear), dayMonthNum, 0).getDate();
  const daysList = [
    { id: 'ALL', label: 'All Days' },
    ...Array.from({ length: daysInSelectedMonth }, (_, i) => ({
      id: String(i + 1),
      label: `${new Date(Number(selectedYear), dayMonthNum - 1, i + 1).toLocaleDateString('en-US', { weekday: 'long' })} ${i + 1}`
    }))
  ];
  // ---- Live posted sales (tenants.feature_flags sales invoices, is_posted === true) ----
  const [rawPosted, setRawPosted] = useState<PostedInvoice[]>([]);
  const [rawVoided, setRawVoided] = useState<VoidedInvoice[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from('tenants').select('feature_flags').eq('id', resolveTenantUuid(currentTenant)).maybeSingle();
        const flags: any = data?.feature_flags || {};
        const { posted, voided } = extractInvoices(flags);
        if (!cancelled) {
          setLiveFlags(flags);
          setRawPosted(posted);
          setRawVoided(voided);
        }
      } catch (e) {
        console.warn('[SalesDashboard] live posted sales load failed:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant?.id]);

  // Single LBP base: every posted invoice is converted ONCE with the live rate; display converts LL -> USD once in formatVal.
  const livePosted = useMemo(
    () =>
      rawPosted.map((p) => {
        const d = new Date(p.ts);
        const cats: Record<string, number> = {};
        Object.entries(p.cats).forEach(([k, v]) => (cats[k] = toLL(p, v, usdRate)));
        return { ts: p.ts, year: d.getFullYear(), month: d.getMonth(), hour: d.getHours(), total: toLL(p, p.total, usdRate), cats };
      }),
    [rawPosted, usdRate]
  );

  // ---- Period filter (selected year / month|quarter / day) ----
  const inPeriod = (ts: number) => {
    const d = new Date(ts);
    if (d.getFullYear() !== Number(selectedYear)) return false;
    if (/^\d+$/.test(selectedMonth) && selectedMonth !== '0' && d.getMonth() + 1 !== Number(selectedMonth)) return false;
    if (/^Q\d$/.test(selectedMonth) && Math.floor(d.getMonth() / 3) + 1 !== Number(selectedMonth[1])) return false;
    if (selectedDay !== 'ALL' && d.getDate() !== Number(selectedDay)) return false;
    return true;
  };
  const nowD = new Date();
  const refMonth = /^\d+$/.test(selectedMonth) && selectedMonth !== '0' ? Number(selectedMonth) : Number(selectedYear) === nowD.getFullYear() ? nowD.getMonth() + 1 : 12;

  const kpi = useMemo(() => {
    const L = (p: PostedInvoice, v: number) => toLL(p, v, usdRate);
    const net = (p: PostedInvoice) => L(p, p.total - p.tax);
    const receipts = (p: PostedInvoice) => p.pays.reduce((s, x) => s + ccyToLL(x.ccy, x.amount, usdRate) * p.sign, 0);
    const Y = Number(selectedYear);
    // "Today" = the selected day when one is chosen, otherwise the calendar day
    const dayTarget = selectedDay !== 'ALL' ? new Date(Y, refMonth - 1, Number(selectedDay)) : new Date();
    const isTargetDay = (ts: number) => new Date(ts).toDateString() === dayTarget.toDateString();
    const out = {
      todayNetSales: 0, todayReceipts: 0, todayDiscounts: 0, todayRefunds: 0,
      grossSales: 0, discount: 0, tax: 0, netSales: 0,
      mtdSales: 0, lymSales: 0, ytdSales: 0, lytmSales: 0, customerAged: 0, mtdReceipts: 0,
      paidIn: 0, paidOut: 0, voids: 0, refunds: 0, avgInvoice: 0, avgByCust: 0, custCount: 0, invCount: 0
    };
    const custs = new Set<string>();
    rawPosted.forEach((p) => {
      const d = new Date(p.ts);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (isTargetDay(p.ts)) {
        out.todayNetSales += net(p);
        out.todayReceipts += receipts(p);
        out.todayDiscounts += L(p, p.discount);
        if (p.sign < 0) out.todayRefunds += Math.abs(L(p, p.total));
      }
      if (inPeriod(p.ts)) {
        out.grossSales += L(p, p.total - p.tax + p.discount);
        out.discount += L(p, p.discount);
        out.tax += L(p, p.tax);
        out.netSales += net(p);
        out.invCount += 1;
        if (p.customer) custs.add(p.customer);
        if (p.sign < 0) out.refunds += Math.abs(L(p, p.total));
      }
      if (y === Y && m === refMonth) {
        out.mtdSales += net(p);
        out.mtdReceipts += receipts(p);
      }
      if (y === Y - 1 && m === refMonth) out.lymSales += net(p);
      if (y === Y && m <= refMonth) out.ytdSales += net(p);
      if (y === Y - 1 && m <= refMonth) out.lytmSales += net(p);
    });
    rawVoided.forEach((v) => {
      if (inPeriod(v.ts)) out.voids += ccyToLL(v.ccy, v.total, usdRate);
    });
    out.custCount = custs.size;
    out.avgInvoice = out.invCount ? out.netSales / out.invCount : 0;
    out.avgByCust = out.custCount ? out.netSales / out.custCount : 0;
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPosted, rawVoided, usdRate, selectedYear, selectedMonth, selectedDay]);

  // ---- Live breakdowns for the selected period: category / employee / payment / discount ----
  const PALETTE = ['#1e3a8a', '#0f766e', '#475569', '#854d0e', '#4c1d95', '#166534', '#991b1b', '#374151'];
  const { employees: hrEmployees } = useHrEmployees();
  const live = useMemo(() => {
    const catTot: Record<string, number> = {};
    const payTot: Record<string, number> = {};
    const userTot: Record<string, { total: number; cats: Record<string, number> }> = {};
    let discount = 0;
    const hrName = (raw: string) => {
      const n = raw.trim().toLowerCase();
      if (!n) return 'Unassigned';
      const hit = (hrEmployees || []).find((e: any) => {
        const full = String(e.fullName || `${e.firstName || ''} ${e.lastName || ''}`).trim().toLowerCase();
        return full === n || full.startsWith(n + ' ') || String(e.firstName || '').trim().toLowerCase() === n;
      });
      return hit ? String(hit.fullName || `${hit.firstName} ${hit.lastName}`).trim() : raw.trim();
    };
    rawPosted.forEach((p) => {
      if (!inPeriod(p.ts)) return;
      const total = toLL(p, p.total, usdRate);
      let catSum = 0;
      const user = hrName(p.salesman);
      const u = (userTot[user] = userTot[user] || { total: 0, cats: {} });
      u.total += total;
      Object.entries(p.cats).forEach(([k, v]) => {
        const ll = toLL(p, v, usdRate);
        catTot[k] = (catTot[k] || 0) + ll;
        u.cats[k] = (u.cats[k] || 0) + ll;
        catSum += ll;
      });
      const rest = total - catSum;
      if (Math.abs(rest) > 0.5) {
        catTot['Uncategorized'] = (catTot['Uncategorized'] || 0) + rest;
        u.cats['Uncategorized'] = (u.cats['Uncategorized'] || 0) + rest;
      }
      p.pays.forEach((x) => (payTot[x.method] = (payTot[x.method] || 0) + ccyToLL(x.ccy, x.amount, usdRate) * p.sign));
      discount += toLL(p, p.discount, usdRate);
    });
    const toSlices = (m: Record<string, number>) => {
      const entries = Object.entries(m).filter(([, v]) => v !== 0).sort((a, b) => b[1] - a[1]);
      const sum = entries.reduce((s, [, v]) => s + Math.abs(v), 0) || 1;
      return entries.map(([name, amount], i) => ({ label: name, name, amount, color: PALETTE[i % PALETTE.length], pct: (Math.abs(amount) / sum) * 100 }));
    };
    const categories = toSlices(catTot);
    const topCats = categories.slice(0, 4).map((c) => c.name);
    const hasOther = categories.length > 4;
    const empRows = Object.entries(userTot)
      .map(([name, u]) => {
        const cols = topCats.map((c) => u.cats[c] || 0);
        const other = u.total - cols.reduce((s, v) => s + v, 0);
        return { name, cols, other, total: u.total };
      })
      .sort((a, b) => b.total - a.total);
    return {
      categories,
      users: toSlices(Object.fromEntries(Object.entries(userTot).map(([k, v]) => [k, v.total]))),
      payments: toSlices(payTot),
      discounts: discount > 0 ? [{ label: 'DISCOUNT', name: 'DISCOUNT', amount: discount, color: PALETTE[0], pct: 100 }] : [],
      topCats,
      hasOther,
      empRows
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPosted, usdRate, selectedYear, selectedMonth, selectedDay, hrEmployees]);
  const eodSt = useMemo(() => (liveFlags ? computeEodState(liveFlags) : null), [liveFlags]);

  const shortLabel = (v: number) => (v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${Math.round(v / 1e6)}M` : v > 0 ? `${Math.round(v / 1e3)}K` : '0');
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const liveStats = useMemo(() => {
    const year = Number(selectedYear);
    const cur = new Array(12).fill(0);
    const prev = new Array(12).fill(0);
    const cats: Record<string, number> = {};
    const hours: Record<number, { sum: number; n: number }> = {};
    let invoiceCount = 0;
    livePosted.forEach((p) => {
      if (p.year === year) {
        cur[p.month] += p.total;
        invoiceCount++;
        Object.entries(p.cats as Record<string, number>).forEach(([k, v]) => (cats[k] = (cats[k] || 0) + v));
        const h = hours[p.hour] || { sum: 0, n: 0 };
        h.sum += p.total;
        h.n += 1;
        hours[p.hour] = h;
      } else if (p.year === year - 1) {
        prev[p.month] += p.total;
      }
    });
    const months = MONTH_NAMES.map((month, i) => ({
      month,
      val: Math.round(cur[i]),
      ly: Math.round(prev[i]),
      label: shortLabel(cur[i]),
      pct: prev[i] > 0 ? `${cur[i] >= prev[i] ? '+' : ''}${(((cur[i] - prev[i]) / prev[i]) * 100).toFixed(1)}%` : cur[i] > 0 ? '+100.0%' : '0.0%'
    }));
    const active = months.filter((m) => m.val > 0);
    const best = active.length ? active.reduce((a, b) => (b.val > a.val ? b : a)) : null;
    const softest = active.length ? active.reduce((a, b) => (b.val < a.val ? b : a)) : null;
    const growth = (m: { val: number; ly: number }) => (m.ly > 0 ? (m.val - m.ly) / m.ly : m.val > 0 ? 1 : -Infinity);
    const topYoy = active.length ? active.reduce((a, b) => (growth(b) > growth(a) ? b : a)) : null;
    const nowYear = new Date().getFullYear();
    const doneUpTo = year === nowYear ? new Date().getMonth() : 12; // completed months only
    const yoyCur = months.slice(0, doneUpTo).reduce((s, m) => s + m.val, 0);
    const yoyPrev = months.slice(0, doneUpTo).reduce((s, m) => s + m.ly, 0);
    const catEntries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const catTotal = catEntries.reduce((s, [, v]) => s + v, 0);
    const hourEntries = Object.entries(hours).map(([h, v]) => ({ hour: Number(h), avg: v.sum / v.n, n: v.n })).sort((a, b) => b.n - a.n || b.avg - a.avg);
    return {
      months,
      best,
      softest,
      topYoy,
      yoyCur,
      yoyPrev,
      yoyPct: yoyPrev > 0 ? ((yoyCur - yoyPrev) / yoyPrev) * 100 : yoyCur > 0 ? 100 : 0,
      topCat: catEntries[0] ? { name: catEntries[0][0], amount: catEntries[0][1], share: catTotal > 0 ? (catEntries[0][1] / catTotal) * 100 : 0 } : null,
      peak: hourEntries[0] || null,
      invoiceCount
    };
  }, [livePosted, selectedYear]);

  const monthlyBarData = liveStats.months;
  const totalAnnualSales = monthlyBarData.reduce((acc, m) => acc + m.val, 0);
  const totalLastYear = monthlyBarData.reduce((acc, m) => acc + m.ly, 0);
  const totalYoyText = totalLastYear > 0 ? `${totalAnnualSales >= totalLastYear ? '+' : ''}${(((totalAnnualSales - totalLastYear) / totalLastYear) * 100).toFixed(1)}%` : totalAnnualSales > 0 ? '+100.0%' : '0.0%';
  const chartMax = Math.max(1, ...monthlyBarData.map((m) => m.val));
  const chartTop = chartMax / 0.85;
  const emptyHL = 'No posted sales yet';
  const fmtYoy = (m: { val: number; ly: number } | null) => (m ? (m.ly > 0 ? `${m.val >= m.ly ? '+' : ''}${(((m.val - m.ly) / m.ly) * 100).toFixed(1)}% YoY` : m.val > 0 ? 'New vs last year' : '0.0% YoY') : '');
  const highlightCards = [
    { key: 'yoy', label: 'Revenue YoY', color: '#1976d2', tip: 'Completed-month YoY: net sales this year vs the same completed months last year. The current month is excluded until complete.', value: liveStats.yoyCur > 0 || liveStats.yoyPrev > 0 ? `${liveStats.yoyPct >= 0 ? '+' : ''}${liveStats.yoyPct.toFixed(1)}%` : '0.0%', sub: `${selectedYear}: ${formatVal(liveStats.yoyCur, 'short')} | ${Number(selectedYear) - 1}: ${formatVal(liveStats.yoyPrev, 'short')}` },
    { key: 'best', label: 'Best Month', color: '#2e7d32', tip: 'Month with the highest total posted sales in the selected year.', value: liveStats.best ? liveStats.best.month : '-', sub: liveStats.best ? `${formatVal(liveStats.best.val, 'short')} | ${fmtYoy(liveStats.best)}` : emptyHL },
    { key: 'softest', label: 'Softest Month', color: '#f59e0b', tip: 'Lowest posted sales among months with activity.', value: liveStats.softest ? liveStats.softest.month : '-', sub: liveStats.softest ? `${formatVal(liveStats.softest.val, 'short')} | ${fmtYoy(liveStats.softest)}` : emptyHL },
    { key: 'topyoy', label: 'Top YoY Month', color: '#0f766e', tip: 'Highest year-over-year growth versus the previous year.', value: liveStats.topYoy ? liveStats.topYoy.month : '-', sub: liveStats.topYoy ? `${formatVal(liveStats.topYoy.val, 'short')} | ${fmtYoy(liveStats.topYoy)}` : emptyHL },
    { key: 'category', label: 'Best Category', color: '#7c3aed', tip: 'Category with the highest revenue contribution (from invoice line categories).', value: liveStats.topCat ? liveStats.topCat.name : '-', sub: liveStats.topCat ? `${formatVal(liveStats.topCat.amount, 'short')} | ${liveStats.topCat.share.toFixed(1)}% Share` : emptyHL },
    { key: 'peakhour', label: 'Peak Hour', color: '#64748b', tip: 'Hour with the most posted invoices.', value: liveStats.peak ? `${String(liveStats.peak.hour).padStart(2, '0')}:00` : '-', sub: liveStats.peak ? `${formatVal(liveStats.peak.avg, 'short')} avg | ${liveStats.peak.n} Orders` : emptyHL }
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
                  fill={isHovered ? "#0f172a" : "var(--muted-foreground, #64748b)"} 
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

  // Datasets for Pie & Line modes dynamically derived from current selected branch
  const categoryData = live.categories;
  const divisionData = currentBranchData.divisionData;
  const groupData = currentBranchData.groupData;
  const departmentData = currentBranchData.departmentData;
  const discountData = live.discounts;
  const userData = live.users;
  const paymentData = live.payments;
  const sumAmt = (arr: { amount: number }[]) => arr.reduce((t, x) => t + x.amount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16 branch-dashboard-shell">
      <style jsx global>{`
        /* Authentic Vanguard Light Styles */
        :root {
          --bd-bg: var(--background, #f8fafc);
          --bd-surface: #ffffff;
          --bd-surface-soft: #f3f7fc;
          --bd-surface-muted: #dbe4f0;
          --bd-card: #e7eef8;
          --bd-card-soft: #f8fbff;
          --bd-border: var(--border, #cbd5e1);
          --bd-text: var(--foreground, #0f172a);
          --bd-text-muted: var(--muted-foreground, #64748b);
          --bd-accent: var(--primary, #0f172a);
          --bd-shadow: 0 20px 45px rgba(15, 23, 42, 0.09);
        }

        .branch-dashboard-shell {
          background-color: #edf3f9;
          color: #0f172a;
        }

        /* Vanguard Header Bar: Dark Charcoal #3e3e3e */
        .vanguard-panel-header, .vanguard-panel-header, .dashboard-branches-country {
          background-color: #3e3e3e !important;
          color: #ffffff !important;
          font-weight: 700;
          font-size: 14.5px;
          padding: 8px 14px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          border: 1px solid #3e3e3e;
          border-bottom: none;
          letter-spacing: 0.3px;
        }

        .vanguard-panel-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
        }

        .vanguard-panel-actions button {
          color: #ffffff;
          opacity: 0.9;
          transition: opacity 0.15s;
        }
        .vanguard-panel-actions button:hover {
          opacity: 1;
        }

        .vanguard-panel-body, .dashboard-branches-branches.body.other-tables {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-top: none;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        /* Performance Highlights Panel */
        .performance-highlights-panel {
          padding: 10px 12px !important;
        }

        .performance-highlights-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        @media (max-width: 1280px) {
          .performance-highlights-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .performance-highlights-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .performance-highlight-card {
          background: #ffffff;
          border: 1px solid #d7dee8;
          border-top: 3px solid #1976d2;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          justify-content: space-between;
          min-height: 78px;
          padding: 8px 10px 9px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .performance-highlight-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .performance-highlight-top {
          align-items: center;
          border-bottom: 1px solid rgba(148, 163, 184, 0.35);
          display: flex;
          gap: 6px;
          justify-content: space-between;
          min-width: 0;
          padding-bottom: 4px;
        }

        .performance-highlight-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .performance-highlight-value {
          color: #111827;
          display: inline-flex;
          align-items: center;
          font-size: 15px;
          font-weight: 700;
          gap: 4px;
          line-height: 1.2;
        }

        .performance-highlight-sub {
          color: #475569;
          font-size: 11px;
          line-height: 1.25;
        }

        .performance-highlight-separator {
          color: #0f172a;
          display: inline-block;
          font-size: 12px;
          font-weight: 900;
          margin: 0 4px;
        }

        /* Vanguard Dense Tables */
        .vanguard-dense-table, .vanguard-dense-table, .monthly-revenue-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .vanguard-dense-table th, .vanguard-dense-table td,
        .monthly-revenue-table th, .monthly-revenue-table td {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .vanguard-dense-table tr.header-row,
        .monthly-revenue-table tr.table-total,
        tr.header-row, tr.table-total {
          background-color: #dbe4f0 !important;
          color: #0f172a !important;
          font-weight: 700;
          font-size: 12px;
          border-bottom: 2px solid #cbd5e1;
        }
        .vanguard-dense-table tbody tr:nth-child(odd),
        .monthly-revenue-table tbody tr:nth-of-type(odd),
        table.table-striped tbody tr:nth-of-type(odd) {
          background-color: rgb(234, 252, 255) !important;
        }
        .vanguard-dense-table tbody tr:nth-child(even),
        .monthly-revenue-table tbody tr:nth-of-type(even),
        table.table-striped tbody tr:nth-of-type(even) {
          background-color: #ffffff !important;
        }
        .vanguard-dense-table tbody tr:hover,
        .monthly-revenue-table tbody tr:hover,
        table.table-striped tbody tr:hover {
          background-color: rgb(202, 232, 235) !important;
        }

        /* Sticky Column */
        .sticky-col {
          position: sticky !important;
          left: 0 !important;
          z-index: 12;
          background-color: #f8fafc !important;
          color: #0f172a !important;
          min-width: 190px;
          border-right: 2px solid #cbd5e1 !important;
          box-shadow: 2px 0 4px -2px rgba(0,0,0,0.06);
        }
        tr.header-row .sticky-col,
        tr.table-total .sticky-col {
          background-color: #dbe4f0 !important;
        }

        /* Monthly revenue cells */
        .monthly-revenue-cell {
          min-width: 150px;
          vertical-align: top;
          text-align: right;
        }
        .monthly-revenue-current {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 3px;
          font-weight: 700;
          color: #0f172a;
          font-size: 12px;
        }
        .monthly-revenue-previous {
          display: block;
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
        .monthly-revenue-total-col {
          min-width: 160px;
          background-color: #f1f5f9;
          font-weight: 700;
          text-align: right;
        }

        /* Nav Tabs */
        .vanguard-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: var(--muted-foreground, #64748b);
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .vanguard-pill-btn:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .vanguard-pill-btn.active {
          background-color: var(--primary, #0f172a) !important;
          border-color: var(--primary, #0f172a) !important;
          color: #ffffff !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .vanguard-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: var(--muted-foreground, #64748b);
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .vanguard-circle-btn:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }
        .vanguard-circle-btn.active {
          background-color: var(--primary, #0f172a);
          border-color: var(--primary, #0f172a);
          color: #ffffff;
        }
      `}</style>

      <div className="max-w-[1720px] mx-auto p-3 sm:p-4">
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-slate-900 mb-2">Sales Dashboard</h1>

        {/* Topbar Filter Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-3.5 flex flex-wrap items-center gap-2.5 shadow-sm">
          {/* Branch Select */}
          <div className="flex-1 min-w-[260px]">
            <select 
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setRecalculating(true);
                setTimeout(() => setRecalculating(false), 400);
              }}
              className="w-full bg-white border border-blue-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {allBranchesList.length > 1 && (
                <option value="ALL">🏢 All Branches</option>
              )}
              {allBranchesList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded transition"
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
            className="border border-blue-400 bg-blue-50/50 hover:bg-blue-100 p-1.5 rounded text-blue-700 transition flex items-center gap-1.5 px-2.5 font-bold text-xs"
            title="Recalculate Data by Selected Branch and Month"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
            <span>Recalculate</span>
          </button>

          {/* Reports link */}
          <Link prefetch={false} 
            href="/backoffice/reportview"
            className="border border-slate-300 hover:bg-slate-100 p-1.5 rounded text-slate-700 transition"
            title="Reports"
          >
            <BarChart3 className="w-4 h-4" />
          </Link>
        </div>

        {/* Recalculate Toast Alert */}
        {recalcToast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg p-2.5 mb-3 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {recalcToast}
            </span>
            <button onClick={() => setRecalcToast(null)} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}



        {/* 4 SIGNATURE VANGUARD METRIC CARDS (DYNAMIC PER SELECTED BRANCH) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3.5">
          
          {/* Card 1: Green (#337718) */}
          <div className="rounded-[10px] overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#337718' }}>
            <div className="w-14 bg-white/20 flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs" style={{ backgroundColor: '#337718' }}>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Net Sales</span>
                <span className="font-black text-[13.5px]">{formatVal(kpi.todayNetSales)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Receipts</span>
                <span className="font-semibold">{formatVal(kpi.todayReceipts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Discounts</span>
                <span className="font-semibold">{formatVal(kpi.todayDiscounts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Today&apos;s Refunds</span>
                <span className="font-semibold">{formatVal(kpi.todayRefunds)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Navy (#003566) */}
          <div className="rounded-[10px] overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#003566' }}>
            <div className="w-14 bg-white/20 flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs" style={{ backgroundColor: '#003566' }}>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Gross Sales</span>
                <span className="font-semibold">{formatVal(kpi.grossSales, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Discount</span>
                <span className="font-semibold">{formatVal(kpi.discount, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Tax</span>
                <span className="font-semibold">{formatVal(kpi.tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Net Sales</span>
                <span className="font-black text-[13.5px]">{formatVal(kpi.netSales, 'short')}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Brown/Gold (#8a6a1f) */}
          <div className="rounded-[10px] overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#8a6a1f' }}>
            <div className="w-14 bg-white/20 flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs" style={{ backgroundColor: '#8a6a1f' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">MTD:</span>
                  <span className="font-black">{formatVal(kpi.mtdSales, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">LYM:</span>
                  <span className="font-semibold">{formatVal(kpi.lymSales, 'short')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">YTD:</span>
                  <span className="font-black">{formatVal(kpi.ytdSales, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">LYTM:</span>
                  <span className="font-semibold">{formatVal(kpi.lytmSales, 'short')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Customer Aged</span>
                <span className="font-semibold">{formatVal(kpi.customerAged, 'short')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">MTD Receipts</span>
                <span className="font-black text-[13.5px]">{formatVal(kpi.mtdReceipts, 'short')}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Dark Charcoal / Red-Brown (#852b12) */}
          <div className="rounded-[10px] overflow-hidden flex shadow-sm h-[116px]" style={{ backgroundColor: '#852b12' }}>
            <div className="w-14 bg-white/20 flex items-center justify-center text-white">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="flex-1 p-2 text-white flex flex-col justify-between text-xs" style={{ backgroundColor: '#852b12' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Paid In:</span>
                  <span className="font-semibold">{formatVal(kpi.paidIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Paid out:</span>
                  <span className="font-semibold">{formatVal(kpi.paidOut, 'short')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between items-center">
                  <span className="opacity-80 text-[11px]">Voids:</span>
                  <span className="px-1.5 py-0.2 rounded bg-destructive/10 text-destructive font-bold text-[11px]">{formatVal(kpi.voids)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-80 text-[11px]">Refunds:</span>
                  <span className="px-1.5 py-0.2 rounded bg-destructive/10 text-destructive font-bold text-[11px]">{formatVal(kpi.refunds)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Avg. Invoice:</span>
                  <span className="font-semibold">{formatVal(kpi.avgInvoice, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Avg. by Cust:</span>
                  <span className="font-semibold">{formatVal(kpi.avgByCust, 'short')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Cust. Count:</span>
                  <span className="font-bold">{kpi.custCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80 text-[11px]">Inv. Count:</span>
                  <span className="font-bold">{kpi.invCount}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* REAL VANGUARD NAVIGATION TABS STRIP */}
        <div className="flex items-center gap-2 mb-3.5 overflow-x-auto pb-1 dashboard-section-tabs-bar">
          <button 
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`vanguard-pill-btn ${activeTab === 'summary' ? 'active' : ''}`}
          >
            <Scale className="w-4 h-4" /> Summary
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('comparative')}
            className={`vanguard-pill-btn ${activeTab === 'comparative' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" /> Comparative
          </button>

          <Link prefetch={false} 
            href="/product-insights"
            target="_blank"
            className="vanguard-pill-btn"
          >
            <Boxes className="w-4 h-4" /> Product Insights
          </Link>

          <Link prefetch={false} 
            href="/customer-insights"
            target="_blank"
            className="vanguard-pill-btn"
          >
            <UserCircle2 className="w-4 h-4" /> Customer Insights
          </Link>

          <Link prefetch={false} 
            href="/customer-insights?tab=team"
            target="_blank"
            className="vanguard-pill-btn"
          >
            <Users className="w-4 h-4" /> Sales Team Performance
          </Link>

          {/* VTrack opens in new tab (Guarded by Fleet Module Entitlement) */}
          {isFleetEnabled && (
            <Link prefetch={false} 
              href="/vtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="vanguard-pill-btn"
            >
              <Truck className="w-4 h-4" /> VTrack
            </Link>
          )}

          <button 
            type="button"
            onClick={() => setActiveTab('vmenu_qr')}
            className={`vanguard-pill-btn ${activeTab === 'vmenu_qr' ? 'active' : ''}`}
          >
            <QrCode className="w-4 h-4" /> V-Menu & QR Generator
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`vanguard-pill-btn ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" /> Customers
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('today')}
            className={`vanguard-pill-btn ${activeTab === 'today' ? 'active' : ''}`}
          >
            <Calendar className="w-4 h-4" /> Today
          </button>

          {/* Geographics (Guarded by Fleet Module Entitlement) */}
          {isFleetEnabled && (
            <button 
              type="button"
              onClick={() => setActiveTab('geographics')}
              className={`vanguard-pill-btn ${activeTab === 'geographics' ? 'active' : ''}`}
            >
              <Globe className="w-4 h-4" /> Geographics
            </button>
          )}

          <div className="flex-1"></div>

          {/* Chart mode toggle buttons: Line and Pie */}
          <div className="dashboard-chart-mode-group flex items-center gap-2 pl-2">
            <button 
              type="button"
              onClick={() => setChartMode('line')}
              className={`vanguard-circle-btn ${chartMode === 'line' ? 'active' : ''}`}
              title="Line Mode"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              onClick={() => setChartMode('pie')}
              className={`vanguard-circle-btn ${chartMode === 'pie' ? 'active' : ''}`}
              title="Pie Mode"
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB: SUMMARY */}
        {activeTab === 'summary' && (
          <div>
            {/* Performance Highlights Banner */}
            <div className="mb-3.5 performance-highlights-section">
              <div className="vanguard-panel-header dashboard-branches-country">
                <span>Performance Highlights</span>
              </div>
              <div className="vanguard-panel-body performance-highlights-panel">
                <div className="performance-highlights-grid">
                  {highlightCards.map((card) => (
                    <div key={card.key} className="performance-highlight-card relative group" style={{ borderTopColor: card.color }}>
                      <div className="performance-highlight-top">
                        <span className="performance-highlight-label">{card.label}</span>
                        <div className="cursor-pointer p-0.5" onMouseEnter={() => setHoveredHighlightCard(card.key)} onMouseLeave={() => setHoveredHighlightCard(null)}>
                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
                        </div>
                      </div>
                      {hoveredHighlightCard === card.key && (
                        <div className="absolute top-7 left-0 z-30 bg-slate-900/95 text-white text-[10.5px] rounded px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-normal w-56 border border-slate-700 leading-tight">
                          {card.tip}
                        </div>
                      )}
                      <div className="performance-highlight-value my-1">
                        <span>{card.value}</span>
                      </div>
                      <div className="performance-highlight-sub leading-tight">
                        <span>{card.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue Banner & Green Bar Chart */}
            <div className={`mb-3.5 monthly-revenue-section ${enlargedWidget === 'revenue' ? 'fixed inset-4 z-50 overflow-auto bg-white p-4 rounded-xl shadow-2xl' : ''}`}>
              <div className="vanguard-panel-header dashboard-branches-country">
                <span>Monthly Revenue</span>
                <div className="vanguard-panel-actions">
                  <button 
                    type="button" 
                    onClick={() => toggleEnlarge('revenue')}
                    className="hover:text-blue-200"
                    title={enlargedWidget === 'revenue' ? 'Reduce' : 'Enlarge'}
                  >
                    {enlargedWidget === 'revenue' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <span className="text-lg leading-none cursor-pointer" title="Options">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
                {/* Legend */}
                <div className="flex items-center justify-center gap-2 mb-3 text-xs text-slate-700">
                  <span className="w-3 h-3 bg-emerald-700 rounded-sm inline-block"></span>
                  <span className="font-medium">{currentTenant?.name || 'Vanguard ERP'}</span>
                </div>

                {/* Vertical Bars Container with Authentic Highcharts Gridlines */}
                <div className="relative h-60 px-6 pt-4 pb-2 border-b border-slate-200">
                  {/* Background Horizontal Gridlines matching Video V2 */}
                  <div className="absolute inset-x-6 top-4 bottom-7 flex flex-col justify-between pointer-events-none">
                    {[1, 0.75, 0.5, 0.25, 0].map((f) => (f === 0 ? '0' : formatVal(chartTop * f, 'short'))).map((tick, tIdx) => (
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
                      const maxVal = chartMax;
                      const heightPct = d.val > 0 ? (d.val / maxVal) * 85 : 0;
                      const isHovered = hoveredSummaryMonth === d.month;

                      return (
                        <div 
                          key={i} 
                          className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                          onMouseEnter={() => setHoveredSummaryMonth(d.month)}
                          onMouseLeave={() => setHoveredSummaryMonth(null)}
                        >
                          {/* Authentic Highcharts Floating Tooltip */}
                          {isHovered && (
                            <div className="absolute bottom-full mb-3 z-30 bg-black/90 text-white rounded px-3 py-2 shadow-2xl text-[11px] pointer-events-none whitespace-nowrap animate-in fade-in duration-150 border border-slate-700 min-w-[210px]">
                              <div className="font-bold text-slate-200 text-xs mb-1 border-b border-slate-700/80 pb-0.5">
                                {d.month}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200">
                                <span className="w-2.5 h-2.5 bg-emerald-700 rounded-sm inline-block flex-shrink-0" />
                                <span>{currentTenant?.name || 'Vanguard ERP'}:</span>
                                <span className="font-bold text-white ml-auto">
                                  {formatVal(d.val)}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300 mt-0.5 pl-4">
                                Change: <span className="text-emerald-400 font-semibold">{d.val > 0 ? `+${formatVal(d.val)} (${d.pct})` : '0 (0.0%)'}</span>
                              </div>
                            </div>
                          )}

                          {d.val > 0 && (
                            <span className="text-[10px] font-bold text-slate-700 mb-1">
                              {formatVal(d.val, 'short')}
                            </span>
                          )}
                          <div 
                            className={`w-full max-w-[44px] rounded-t transition-all duration-150 ${
                              isHovered ? 'bg-emerald-800 ring-2 ring-emerald-400 shadow-md' : 'bg-emerald-700 hover:bg-emerald-800'
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

                {/* Monthly Revenue Table with Total Column */}
                <div className="overflow-x-auto mt-3" id="sales_month_table">
                  <table className="vanguard-dense-table monthly-revenue-table">
                    <thead>
                      <tr className="header-row table-total">
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
                        <th className="text-right font-bold monthly-revenue-total-col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="text-left font-semibold sticky-col bg-white">{currentTenant?.name || 'Vanguard ERP'}</th>
                        {monthlyBarData.map((m, idx) => (
                          <td key={idx} className="monthly-revenue-cell">
                            {m.val > 0 ? (
                              <div>
                                <div className="monthly-revenue-current">
                                  <span>{formatVal(m.val, 'short')}</span>
                                  <span className="text-emerald-600 text-[10px]">▲</span>
                                </div>
                                <div className="monthly-revenue-previous">
                                  LY {formatVal(m.ly || 0, 'short')} ({m.pct})
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-500">0</div>
                                <div className="monthly-revenue-previous">LY {formatVal(m.ly || 0, 'short')} (0.0%)</div>
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="monthly-revenue-cell monthly-revenue-total-col">
                          <div className="monthly-revenue-current">
                            <span>{formatVal(totalAnnualSales, 'short')}</span>
                            <span className="text-emerald-600 text-[10px]">▲</span>
                          </div>
                          <div className="monthly-revenue-previous font-normal">
                            LY {formatVal(totalLastYear, 'short')} ({totalYoyText})
                          </div>
                        </td>
                      </tr>
                      <tr className="font-bold bg-slate-100 table-total">
                        <th className="text-left font-bold sticky-col bg-slate-100">Total</th>
                        {monthlyBarData.map((m, idx) => (
                          <td key={idx} className="monthly-revenue-cell">
                            {m.val > 0 ? (
                              <div>
                                <div className="monthly-revenue-current font-bold">
                                  <span>{formatVal(m.val, 'short')}</span>
                                  <span className="text-emerald-600 text-[10px]">▲</span>
                                </div>
                                <div className="monthly-revenue-previous">
                                  LY {formatVal(m.ly || 0, 'short')} ({m.pct})
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-500">0</div>
                                <div className="monthly-revenue-previous">LY {formatVal(m.ly || 0, 'short')} (0.0%)</div>
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="monthly-revenue-cell monthly-revenue-total-col font-bold">
                          <div className="monthly-revenue-current font-bold">
                            <span>{formatVal(totalAnnualSales, 'short')}</span>
                            <span className="text-emerald-600 text-[10px]">▲</span>
                          </div>
                          <div className="monthly-revenue-previous font-normal">
                            LY {formatVal(totalLastYear, 'short')} ({totalYoyText})
                          </div>
                        </td>
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
                <div className="vanguard-panel-header">
                  Sales By Category
                  <div className="vanguard-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('cat')}>
                      {enlargedWidget === 'cat' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Categories ↕</th>
                        <th className="text-right">{formatVal(sumAmt(categoryData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales By Division */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'div' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="vanguard-panel-header">
                  Sales By Division
                  <div className="vanguard-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('div')}>
                      {enlargedWidget === 'div' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Divisions ↕</th>
                        <th className="text-right">{formatVal(sumAmt(divisionData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
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
                <div className="vanguard-panel-header">
                  Sales By Group
                  <div className="vanguard-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('grp')}>
                      {enlargedWidget === 'grp' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Groups ↕</th>
                        <th className="text-right">{formatVal(sumAmt(groupData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-medium">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales By Department */}
              <div className={`bg-white rounded-lg shadow-sm ${enlargedWidget === 'dept' ? 'fixed inset-6 z-50 overflow-auto p-4' : ''}`}>
                <div className="vanguard-panel-header">
                  Sales By Department
                  <div className="vanguard-panel-actions">
                    <button type="button" onClick={() => toggleEnlarge('dept')}>
                      {enlargedWidget === 'dept' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Departments ↕</th>
                        <th className="text-right">{formatVal(sumAmt(departmentData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
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
                <div className="vanguard-panel-header">
                  Discount Summary
                  <div className="vanguard-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
                  {chartMode === 'pie' ? (
                    <>
                      {renderPieSvg(discountData)}
                      <div className="flex justify-center gap-2 my-2 text-xs font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 bg-emerald-700 rounded-sm inline-block"></span>
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Discounts ↕</th>
                        <th className="text-right">{formatVal(sumAmt(discountData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-medium">DISCOUNT</td>
                        <td className="text-right font-bold">{formatVal(sumAmt(discountData))}</td>
                        <td className="text-right text-slate-500">{discountData.length ? '100.00%' : '0.00%'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discount By Category Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="vanguard-panel-header">
                  Discount By Category Summary
                  <div className="vanguard-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
                  <table className="vanguard-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Discount</th>
                        <th className="text-right">Raw Materials</th>
                        <th className="text-right">Retail</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-bold">DISCOUNT</td>
                        <td className="text-right">{formatVal(0)}</td>
                        <td className="text-right font-bold">{formatVal(sumAmt(discountData))}</td>
                        <td className="text-right font-black text-slate-900">{formatVal(sumAmt(discountData))}</td>
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
                <div className="vanguard-panel-header">
                  User Summary
                  <div className="vanguard-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Users ↕</th>
                        <th className="text-right">{formatVal(sumAmt(userData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
                          <td className="text-right text-slate-500">{s.pct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="vanguard-panel-header">
                  Payment Summary
                  <div className="vanguard-panel-actions">
                    <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                    <span className="text-lg leading-none">⋮</span>
                  </div>
                </div>
                <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table mt-2">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">All Payments ↕</th>
                        <th className="text-right">{formatVal(sumAmt(paymentData))}</th>
                        <th className="text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentData.map((s, i) => (
                        <tr key={i}>
                          <td className="text-left font-semibold">{s.name}</td>
                          <td className="text-right font-bold">{formatVal(s.amount)}</td>
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
              <div className="vanguard-panel-header">
                Sales By Employee By Category
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
                <table className="vanguard-dense-table">
                  <thead>
                    <tr className="header-row">
                      <th className="text-left">User Name</th>
                      {live.topCats.map((c) => (
                        <th key={c} className="text-right">{c}</th>
                      ))}
                      <th className="text-right">{live.hasOther || live.topCats.length === 0 ? 'Other' : 'Other / Uncategorized'}</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {live.empRows.length === 0 && (
                      <tr>
                        <td colSpan={live.topCats.length + 3} className="text-center text-slate-500 py-4">No posted sales for the selected period.</td>
                      </tr>
                    )}
                    {live.empRows.map((r) => (
                      <tr key={r.name}>
                        <td className="text-left font-bold">{r.name}</td>
                        {r.cols.map((v, i) => (
                          <td key={i} className="text-right">{formatVal(v)}</td>
                        ))}
                        <td className="text-right">{formatVal(r.other)}</td>
                        <td className="text-right font-extrabold text-slate-900">{formatVal(r.total)}</td>
                      </tr>
                    ))}
                    {live.empRows.length > 0 && (
                      <tr className="header-row">
                        <th className="text-left font-black">Total</th>
                        {live.topCats.map((c, i) => (
                          <td key={c} className="text-right font-black">{formatVal(live.empRows.reduce((t, r) => t + r.cols[i], 0))}</td>
                        ))}
                        <td className="text-right font-black">{formatVal(live.empRows.reduce((t, r) => t + r.other, 0))}</td>
                        <td className="text-right font-black text-slate-950">{formatVal(live.empRows.reduce((t, r) => t + r.total, 0))}</td>
                      </tr>
                    )}
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
              <div className="vanguard-panel-header">
                Daily Summary
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
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
              <div className="vanguard-panel-header">
                Monthly Sales By Category
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
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
                            { series: '2026 Wholesale', c: '#1976d2', h: 60, val: '2,144,645,080' },
                            { series: '2026 Promotions', c: '#f59e0b', h: 32, val: '535,500,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 28, val: '424,787,350' },
                          ] 
                        },
                        { 
                          m: 'February', 
                          segments: [
                            { series: '2026 Wholesale', c: '#1976d2', h: 30, val: '895,931,000' },
                            { series: '2026 Promotions', c: '#f59e0b', h: 52, val: '880,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 24, val: '325,164,942' },
                          ] 
                        },
                        { 
                          m: 'March', 
                          segments: [
                            { series: '2026 Raw Materials', c: '#2e7d32', h: 0, val: '0' },
                            { series: '2026 Promotions', c: '#f59e0b', h: 4, val: '120,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 14, val: '212,743,800' },
                          ] 
                        },
                        { 
                          m: 'April', 
                          segments: [
                            { series: '2026 Wholesale', c: '#1976d2', h: 4, val: '50,000,000' },
                            { series: '2026 Promotions', c: '#f59e0b', h: 14, val: '250,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 22, val: '347,849,550' },
                          ] 
                        },
                        { 
                          m: 'May', 
                          segments: [
                            { series: '2026 Retail', c: '#d32f2f', h: 10, val: '192,590,050' },
                          ] 
                        },
                        { 
                          m: 'June', 
                          segments: [
                            { series: '2026 Promotions', c: '#f59e0b', h: 24, val: '420,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 14, val: '242,845,750' },
                          ] 
                        },
                        { 
                          m: 'July', 
                          segments: [
                            { series: '2026 Wholesale', c: '#1976d2', h: 12, val: '250,000,000' },
                            { series: '2026 Promotions', c: '#f59e0b', h: 54, val: '930,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 38, val: '604,311,315' },
                          ] 
                        },
                        { 
                          m: 'August', 
                          segments: [
                            { series: '2026 Promotions', c: '#f59e0b', h: 56, val: '980,000,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 52, val: '883,715,000' },
                          ] 
                        },
                        { 
                          m: 'September', 
                          segments: [
                            { series: '2026 Promotions', c: '#f59e0b', h: 4, val: '53,550,000' },
                            { series: '2026 Retail', c: '#d32f2f', h: 5, val: '78,301,800' },
                          ] 
                        },
                        { m: 'October', segments: [] },
                        { m: 'November', segments: [] },
                        { 
                          m: 'December', 
                          segments: [
                            { series: '2025 Retail', c: '#ef9a9a', h: 8, val: '103,890,400' },
                            { series: '2025 Wholesale', c: '#90caf9', h: 4, val: '50,023,000' },
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
                            { label: 'Wholesale', c: '#1976d2', val: hoveredCategoryMonth === 'January' ? '2.1 B' : hoveredCategoryMonth === 'February' ? '895.9 M' : hoveredCategoryMonth === 'December' ? '50.0 M' : '0' },
                            { label: '2026 Promotions', c: '#f59e0b', val: hoveredCategoryMonth === 'January' ? '535.5 M' : hoveredCategoryMonth === 'February' ? '880.0 M' : hoveredCategoryMonth === 'August' ? '980.0 M' : '0' },
                            { label: '2025 Promotions', c: '#ffe082', val: '0' },
                            { label: '2026 Retail', c: '#d32f2f', val: hoveredCategoryMonth === 'January' ? '424.8 M' : hoveredCategoryMonth === 'August' ? '883.7 M' : '0' },
                            { label: '2025 Retail', c: '#ef9a9a', val: hoveredCategoryMonth === 'December' ? '103.9 M' : '0' },
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
                      { name: '2026 Wholesale', c: '#1976d2' },
                      { name: '2025 Wholesale', c: '#90caf9' },
                      { name: '2026 Promotions', c: '#f59e0b' },
                      { name: '2025 Promotions', c: '#ffe082' },
                      { name: '2026 Retail', c: '#d32f2f' },
                      { name: '2025 Retail', c: '#ef9a9a' },
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
                  <table className="vanguard-dense-table">
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
                        <td className="text-left font-semibold">Wholesale</td>
                        <td className="text-right">3,436,121,625</td>
                        <td className="text-right">50,023,000</td>
                        <td className="text-right font-semibold">3,386,098,625</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold">Promotions</td>
                        <td className="text-right">3,947,922,600</td>
                        <td className="text-right">0</td>
                        <td className="text-right font-semibold">3,947,922,600</td>
                      </tr>
                      <tr>
                        <td className="text-left font-semibold">Retail</td>
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
              <div className="vanguard-panel-header">
                Average Sales by Hour
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Left Hourly Table */}
                  <div className="lg:col-span-4 overflow-y-auto max-h-[220px]">
                    <table className="vanguard-dense-table">
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
              <div className="vanguard-panel-header">
                Sales by WeekDays
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
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
              <div className="vanguard-panel-header">
                Yearly Revenue
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
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
                      
                      <text x="265" y="215" fill="var(--muted-foreground, #64748b)" fontSize="11" fontWeight="bold" textAnchor="middle">
                        2026
                      </text>
                    </g>

                    {/* 2025 Thin Baseline Bar */}
                    <g>
                      <rect x="520" y="196" width="290" height="4" fill="#1e40af" />
                      <text x="665" y="215" fill="var(--muted-foreground, #64748b)" fontSize="11" fontWeight="bold" textAnchor="middle">
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
                    { m: 'October', c: '#475569' },
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
              <div className="vanguard-panel-header">
                Void Summary
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body overflow-x-auto">
                <table className="vanguard-dense-table">
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
                      <th className="text-left font-semibold sticky-col bg-white">{currentTenant?.name || 'Vanguard ERP'}</th>
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
              <div className="vanguard-panel-header">
                Comparative Monthly Sales By Employee
                <div className="vanguard-panel-actions">
                  <span className="cursor-pointer"><Maximize2 className="w-4 h-4" /></span>
                  <span className="text-lg leading-none">⋮</span>
                </div>
              </div>
              <div className="vanguard-panel-body">
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
                  <table className="vanguard-dense-table">
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

        {/* TAB: CUSTOMERS (Authentic from Video V10) */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="text-center font-bold text-slate-700 text-sm py-1">
              Customers Statistics
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Two Stacked Cards (Customers & Delivery Orders) */}
              <div className="space-y-4">
                {/* Upper Card: Customers */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="vanguard-panel-header flex justify-between items-center text-xs">
                    <span>Customers</span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">Total Number of Customers:</span>
                      <span className="font-bold text-slate-800">33</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">New Customers (September):</span>
                      <span className="font-bold text-slate-800">0</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">MTD:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">YTD:</span>
                        <span className="font-semibold">31</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">LMTD:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">LYTD:</span>
                        <span className="font-semibold">33</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">LM:</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">LY:</span>
                        <span className="font-semibold">2</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">Not Active Customers:</span>
                      <span className="font-bold text-slate-800">2</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Repeated Customers Rate:</span>
                      <span className="font-bold text-slate-800">0%</span>
                    </div>
                  </div>
                </div>

                {/* Lower Card: Delivery Orders (Guarded) or Direct Counter Walk-Ins */}
                {isFleetEnabled ? (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="vanguard-panel-header flex justify-between items-center text-xs">
                      <span>Delivery Orders</span>
                    </div>
                    <div className="p-3 text-xs space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Total Number of Delivery Orders:</span>
                        <span className="font-bold text-slate-800">0</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Delivery Orders Value:</span>
                        <span className="font-bold text-slate-800">{formatVal(0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-600">Average Delivery Value:</span>
                        <span className="font-bold text-slate-800">{formatVal(0)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="vanguard-panel-header flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-blue-600" /> Direct Counter Walk-Ins
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% In-Store POS
                      </span>
                    </div>
                    <div className="p-3 text-xs space-y-2">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Total Walk-In Transactions:</span>
                        <span className="font-bold text-slate-800">33</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Direct Register Turnover:</span>
                        <span className="font-bold text-slate-800">{formatVal(132460000)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-600">Average Counter Ticket:</span>
                        <span className="font-bold text-slate-800">{formatVal(4013939)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Column: Top Customers */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="vanguard-panel-header flex justify-between items-center text-xs">
                  <span>Customer</span>
                  <div className="flex items-center gap-1.5">
                    <span>Top</span>
                    <input 
                      type="number" 
                      value={customerTopN} 
                      onChange={(e) => setCustomerTopN(Number(e.target.value) || 10)}
                      className="w-12 h-6 px-1.5 text-center text-xs border border-slate-300 rounded bg-white text-slate-900 font-bold"
                    />
                    <button className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Apply filter">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-2 overflow-x-auto flex-1">
                  <table className="vanguard-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Customer</th>
                        <th className="text-center">Nbr Of Orders</th>
                        <th className="text-right">Top {customerTopN}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-bold text-slate-800 ">Abou Hamzeh Nuts</td>
                        <td className="text-center font-semibold">1</td>
                        <td className="text-right font-bold text-slate-900">{formatVal(23940000)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Demographics */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="vanguard-panel-header flex justify-between items-center text-xs">
                  <span>Demographics</span>
                  <span className="text-[11px] font-normal opacity-90">Lebanon (7)</span>
                </div>
                <div className="p-2 overflow-x-auto flex-1">
                  <table className="vanguard-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">City</th>
                        <th className="text-center">Total</th>
                        <th className="text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { city: 'Bourj Albarajne', total: 1, pct: '14.29%' },
                        { city: 'Choueifat', total: 1, pct: '14.29%' },
                        { city: 'Dbaye', total: 1, pct: '14.29%' },
                        { city: 'Jebaa', total: 1, pct: '14.29%' },
                        { city: 'JEITA', total: 1, pct: '14.29%' },
                        { city: 'Ghobeiry', total: 1, pct: '14.29%' },
                        { city: 'Promotional Companies', total: 1, pct: '14.29%' },
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="text-left font-medium text-slate-700">{row.city}</td>
                          <td className="text-center font-semibold text-slate-800">{row.total}</td>
                          <td className="text-right font-mono text-slate-600">{row.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lower Section: Sales By Customer By Group */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 text-xs">Sales By Customer By Group</span>
                  <select 
                    value={customerGroupFilter}
                    onChange={(e) => setCustomerGroupFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700"
                  >
                    <option value="All Groups">All Groups</option>
                    <option value="Clients">Clients</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Maximize2 className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                </div>
              </div>

              {/* Chart Visual matching Vanguard */}
              <div className="relative h-48 w-full bg-slate-50/50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200 pb-1">
                  <span>24M</span>
                  <span>24M</span>
                  <span>24M</span>
                  <span>24M</span>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm ring-4 ring-blue-100 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-800 mt-2">Mkasarat Abou Hamzeh (Clients)</span>
                    <span className="text-[11px] font-mono text-blue-600 font-extrabold">{formatVal(23940000)} (100.0%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-bold">Total Selected:</span>
                  <span className="font-mono font-bold text-slate-900">{formatVal(23940000)} (100.00%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TODAY - UNLOCKED & ACTIVE (Connected with V-Track Geographics) */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Live Sync Active Status Header */}
            <div className="bg-card border border-border rounded-xl p-4 text-foreground shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute inset-0"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 relative"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">
                      {isFleetEnabled ? 'V-Track Live Operations Sync: ACTIVE' : 'V-POS Live Real-time Operations: ACTIVE'}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      LIVE STREAM ON
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {isFleetEnabled
                      ? 'Live operational data from Vanguard POS (Today) is streaming directly into V-Track Geographics for spatial mapping and fleet dispatch.'
                      : 'Live operational counter sales from Vanguard POS (Today) are recorded and audited in real-time across active cashier drawers.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isFleetEnabled ? (
                  <>
                    <button
                      onClick={() => setActiveTab('geographics')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>View in Geographics</span>
                    </button>
                    <Link prefetch={false} 
                      href="/vtrack" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded shadow transition"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open VTrack App</span>
                    </Link>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded shadow-xs">
                    <Store className="w-3.5 h-3.5" />
                    <span>POS Direct Registers</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Live KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Live Sales Today</span>
                <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-0.5">
                  {formatVal(132460000)}
                </div>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" /> +18.4% vs yesterday
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Open Invoices & Orders</span>
                <div className="text-base sm:text-lg font-black font-mono text-blue-600 mt-0.5">
                  14 <span className="text-xs font-semibold text-slate-500">Orders</span>
                </div>
                <span className="text-[10px] text-slate-600 font-medium block mt-1">
                  {isFleetEnabled ? '11 Counter POS / 3 Delivery' : '14 Direct Counter POS Orders'}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Cashier Shift</span>
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
                  {formatVal(35800000)}
                </div>
                <span className="text-[10px] text-slate-600 font-medium block mt-1">
                  + $420.00 USD Drawer Hold
                </span>
              </div>
            </div>

            {/* Live Operations & Geographics Stream Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Payment Breakdown */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    Today Payment Methods Breakdown
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    RECONCILED
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">Cash LBP</span>
                      <span className="text-[10px] text-slate-500">Local Currency Drawer</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-slate-900 block">{formatVal(85000000)}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">64.17%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">Cash USD</span>
                      <span className="text-[10px] text-slate-500">Foreign Currency Vault</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-emerald-700 block">$350.00 ({formatVal(31325000)})</span>
                      <span className="text-[10px] text-slate-500 font-semibold">23.65%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">Whish Money & Digital</span>
                      <span className="text-[10px] text-slate-500">Instant Mobile Payment</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-blue-700 block">{formatVal(16135000)}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">12.18%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Total Net Collections Today:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{formatVal(132460000)}</span>
                </div>
              </div>

              {/* Real-time Today Orders Feed */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      {isFleetEnabled ? 'Today Real-time Orders & Geographics Feed' : 'Today Real-time Orders & Counter Feed'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {isFleetEnabled 
                        ? 'Live dispatch queue automatically mirrored on V-Track map'
                        : 'Live POS register transactions recorded and audited in real-time'}
                    </span>
                  </div>
                  {isFleetEnabled && (
                    <button 
                      onClick={() => setActiveTab('geographics')} 
                      className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Map</span> &rarr;
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="vanguard-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Order #</th>
                        <th className="text-left">Customer & Destination</th>
                        <th className="text-right">Total</th>
                        <th className="text-center">{isFleetEnabled ? 'Assigned Fleet' : 'Fulfillment Channel'}</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-mono font-bold text-blue-700">#ORD-104</td>
                        <td className="text-left">
                          <span className="font-bold text-slate-900 block">Al-Baraka Supermarket</span>
                          <span className="text-[10px] text-slate-500">Saida Coastal Highway</span>
                        </td>
                        <td className="text-right font-mono font-bold">{formatVal(15200000)}</td>
                        <td className="text-center">
                          {isFleetEnabled ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Truck className="w-3 h-3 text-blue-600" /> Van #02 (Ziad)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Store className="w-3 h-3 text-emerald-600" /> Direct POS Counter
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isFleetEnabled ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isFleetEnabled ? 'Out for Delivery' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left font-mono font-bold text-blue-700">#ORD-102</td>
                        <td className="text-left">
                          <span className="font-bold text-slate-900 block">Hamra Gourmet Center</span>
                          <span className="text-[10px] text-slate-500">Beirut Hamra Main</span>
                        </td>
                        <td className="text-right font-mono font-bold">{formatVal(16557500)}</td>
                        <td className="text-center">
                          {isFleetEnabled ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Truck className="w-3 h-3 text-blue-600" /> Van #01 (Tarek)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Store className="w-3 h-3 text-emerald-600" /> Walk-In Register
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {isFleetEnabled ? 'Delivered' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left font-mono font-bold text-blue-700">#ORD-103</td>
                        <td className="text-left">
                          <span className="font-bold text-slate-900 block">Al-Mahaba Wholesale</span>
                          <span className="text-[10px] text-slate-500">Choueifat Industrial Zone</span>
                        </td>
                        <td className="text-right font-mono font-bold">{formatVal(8502500)}</td>
                        <td className="text-center">
                          {isFleetEnabled ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Truck className="w-3 h-3 text-blue-600" /> Van #04 (Ali)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Store className="w-3 h-3 text-blue-600" /> Customer Store Pickup
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isFleetEnabled ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isFleetEnabled ? 'In Transit' : 'Ready for Pickup'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-left font-mono font-bold text-blue-700">#ORD-105</td>
                        <td className="text-left">
                          <span className="font-bold text-slate-900 block">Jounieh Olive Branch</span>
                          <span className="text-[10px] text-slate-500">Mount Lebanon Highway</span>
                        </td>
                        <td className="text-right font-mono font-bold">{formatVal(22375000)}</td>
                        <td className="text-center">
                          {isFleetEnabled ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              <Truck className="w-3 h-3 text-blue-600" /> SuperSonic Hub
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Store className="w-3 h-3 text-emerald-600" /> Express Checkout
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isFleetEnabled ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isFleetEnabled ? 'Dispatched' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VTRACK CLOUD - UNLOCKED & ACTIVE (Guarded) */}
        {activeTab === 'vtrack' && (
          !isFleetEnabled ? renderFleetEntitlementNotice('VTrack Cloud Telemetry') : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl p-5 text-foreground shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-500/20 border border-blue-400/40 rounded-lg text-blue-400">
                      <Truck className="w-5 h-5" />
                    </span>
                    <h2 className="text-base font-extrabold text-white tracking-wide">
                      V-Track Cloud & Mobile Platform
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE & LICENSED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Cloud platform and mobile application by Vanguard Software. Enables managers and business owners to track sales, shifts, financial reports, and live operations in real-time with instant alerts.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Link prefetch={false}
                    href="/vtrack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow transition flex items-center gap-2"
                  >
                    <span>Open Full V-Track Platform</span>
                    <Truck className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* License Details Strip */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-300 gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span><strong>License Tier:</strong> Enterprise Unlimited</span>
                  <span>|</span>
                  <span><strong>Account:</strong> {currentTenant?.name || 'Vanguard ERP'}</span>
                  <span>|</span>
                  <span><strong>Key:</strong> <code className="text-amber-300 font-mono font-bold">VNG-LIC-2026-SOUTHERN-OLIVE-ULTIMATE-UNLIMITED-X992</code></span>
                  <span>|</span>
                  <span><strong>Status:</strong> <span className="text-emerald-400 font-bold">ACTIVE & UNLOCKED</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/backoffice/license"
                    className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1"
                  >
                    View Official Certificate &rarr;
                  </a>
                  <div className="text-slate-400 font-mono">
                    Sync: 12ms
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">Real-time Mobile Tracking</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Mobile app for managers to monitor gross sales, cash drawer shifts, and end-of-day closings 24/7 on any device.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 cursor-pointer hover:border-blue-400 transition" onClick={() => setActiveTab('geographics')}>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Map className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">Geographics & Fleet Tracking</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Transforms real-time Today operational data into an interactive map tracking delivery drivers (V-Driver) and field order dispatches.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 cursor-pointer hover:border-blue-400 transition" onClick={() => setActiveTab('today')}>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">Live Sync with Vanguard POS (Today)</h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Any delivery order or sale recorded in the POS is streamed immediately to the live map and cloud reports without latency.
                </p>
              </div>
            </div>
          </div>
          )
        )}

        {/* TAB: GEOGRAPHICS - INTERACTIVE SPATIAL MAPPING (Guarded) */}
        {activeTab === 'geographics' && (
          !isFleetEnabled ? renderFleetEntitlementNotice('V-Track Geographics') : (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header info explaining the Today -> Geographics link */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    V-Track Geographics: Live Operational Data Mapped in Real-time
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                    LIVE TODAY DATA
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 max-w-3xl leading-relaxed">
                  Geographics directly utilizes real-time feeds from Vanguard POS Today module. Every live sale and dispatch is projected immediately on the map for driver routing and regional density analysis.
                </p>
              </div>
              <Link prefetch={false}
                href="/vtrack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded shadow-xs hover:bg-primary/90 transition shrink-0"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Full-Screen V-Track Map</span>
              </Link>
            </div>

            {/* Interactive Map & Fleet Telemetry Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Spatial Lebanon Map Representation */}
              <div className="lg:col-span-7 bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-md flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-10">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200">Lebanon Real-time Operations Map</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 3 Vans Active</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> 4 In-Transit Orders</span>
                  </div>
                </div>

                {/* Spatial Nodes and Delivery Pins */}
                <div className="relative flex-1 my-4 flex items-center justify-center">
                  <div className="w-full max-w-md h-64 bg-slate-950/60 rounded-xl border border-slate-800 relative p-4 flex flex-col justify-between">
                    {/* Region: Tripoli / North */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-[8px] font-bold text-purple-300">N</span>
                        <span className="font-bold text-slate-300 text-[11px]">North (Tripoli & Koura)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">1 Cargo SuperSonic En Route</span>
                    </div>

                    {/* Region: Beirut */}
                    <div className="p-2.5 bg-blue-900/30 border border-blue-500/40 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                          <span className="font-bold text-white text-xs block">Greater Beirut (Hamra / Achrafieh)</span>
                          <span className="text-[10px] text-slate-300">Van #01 - Driver Tarek M. (45 km/h)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30">Order #102 Delivered</span>
                      </div>
                    </div>

                    {/* Region: Mount Lebanon / Choueifat Central Plant */}
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <div>
                          <span className="font-bold text-white text-xs block">Mount Lebanon (Southern Olive and Oil Products - Main)</span>
                          <span className="text-[10px] text-slate-300">Central Hub Depot - POS Touch active</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300">14 Orders Today</span>
                    </div>

                    {/* Region: South Lebanon / Saida & Tyre */}
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <div>
                          <span className="font-bold text-white text-xs block">South Lebanon (Saida Highway)</span>
                          <span className="text-[10px] text-slate-300">Van #02 - Driver Ziad K. (Order #104)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-300">ETA: 12 mins</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                  <span>GPS Precision: High-Accuracy Fleet Tracking via V-Driver Mobile App</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Signal</span>
                </div>
              </div>

              {/* Right: Regional Performance & Active Fleet Details */}
              <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="vanguard-panel-header">
                    Geographics Regional Performance (Today & MTD)
                  </div>
                  <table className="vanguard-dense-table">
                    <thead>
                      <tr className="header-row">
                        <th className="text-left">Governorate / Branch</th>
                        <th className="text-left">Primary Depot</th>
                        <th className="text-right">Today Sales</th>
                        <th className="text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left font-bold">Mount Lebanon (Choueifat Facility)</td>
                        <td className="text-left">Southern Olive and Oil Products - Main</td>
                        <td className="text-right font-bold font-mono">{formatVal(132460000)}</td>
                        <td className="text-right font-bold text-blue-700">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Total Active Fleet Revenue</span>
                    <span className="font-mono">{formatVal(132460000)}</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    All deliveries are recorded live in POS, reconciled at the cashier drawer, and spatial data is updated on V-Track every 5 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
          )
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

        {/* V-Menu & QR Generator Tab */}
        {activeTab === 'vmenu_qr' && (
          <div className="mt-4">
            <VMenuQrGeneratorConsole />
          </div>
        )}

      </div>

      {/* FLOATING SCROLL TO TOP BUTTON matching screenshot */}
      <button 
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-40 w-11 h-11 bg-white hover:bg-slate-50 text-primary border border-slate-200 rounded-lg shadow-md flex items-center justify-center transition"
        title="Scroll to Top"
      >
        <ChevronsUp className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* BRANCHES LAST EOD MODAL - AUTHENTIC VANGUARD STYLE */}
      {eodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-4 text-slate-800 shadow-2xl">
            <div style={{ padding: '6px', background: '#ffffff', borderRadius: '6px' }}>
              <table className="w-full" style={{ marginBottom: 0, color: '#0f172a', background: '#ffffff', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d7dee8' }}>
                    <th colSpan={2} style={{ textAlign: 'center', color: '#dc2626', fontSize: '16px', padding: '8px', fontWeight: 800 }}>
                      End of Day Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allBranchesList.map((branch, idx) => (
                    <tr key={branch.code}>
                      <th style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'normal', color: '#1f2937', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: '10px 12px', textAlign: 'left' }}>
                        {branch.code} - {branch.name} :
                      </th>
                      <td style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'center', color: '#475569', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: '10px 12px', fontWeight: 600 }}>
                        {eodSt ? `${eodSt.workingDate} \u00b7 ${eodSt.status}` : '\u2014'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link prefetch={false}
                href="/backoffice/end-of-day"
                onClick={() => setEodModalOpen(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>{eodSt?.status === 'Closed' ? 'Open New Workday / Start Shift' : 'Execute End of Day Process'} →</span>
              </Link>
              <button 
                onClick={() => setEodModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
