'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertTriangle,
  CalendarCheck,
  ListChecks,
  PlayCircle,
  Clock,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Inbox,
  History,
  Lock
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { getTenantExchangeRate } from '@/lib/currencyEngine';
import { fetchCatalogRows, resolveTenantUuid } from '@/lib/productCatalogService';

type HubLink = { label: string; href: string };
type HubTab = { id: string; en: string; ar: string; moduleId: string; links: HubLink[] };

const OPS = '/backoffice/operations?section=';

const HUB_TABS: HubTab[] = [
  {
    id: 'operations',
    en: 'Operations Center',
    ar: 'مركز العمليات',
    moduleId: 'operations',
    links: [
      { label: 'Dashboard', href: `${OPS}dashboard` },
      { label: 'Reports', href: `${OPS}reports` },
      { label: 'Sales', href: `${OPS}sales` },
      { label: 'Quotations', href: `${OPS}quotations` },
      { label: 'Delivery of Goods', href: `${OPS}delivery_goods` },
      { label: 'Receipts', href: `${OPS}receiving_goods` },
      { label: 'Lost Goods', href: `${OPS}lost_goods` },
      { label: 'Item Assembly', href: `${OPS}item_assembly` },
      { label: 'Adjustments', href: `${OPS}adjustments` },
      { label: 'Product Requests', href: `${OPS}product_request` },
      { label: 'Transfers', href: `${OPS}transfers` },
      { label: 'Products & Services', href: '/backoffice/products' },
      { label: 'Suppliers', href: `${OPS}suppliers` },
      { label: 'Purchase Orders', href: `${OPS}purchase_orders` },
      { label: 'Purchases', href: `${OPS}purchases` }
    ]
  },
  {
    id: 'accounting',
    en: 'Accounting',
    ar: 'المحاسبة',
    moduleId: 'accounting',
    links: [
      { label: 'Dashboard', href: '/backoffice/accounting' },
      { label: 'Reports', href: '/accounting/reports' },
      { label: 'Bank Reconciliation', href: '/accounting/bank-reconciliation' },
      { label: 'Accounts Receivable', href: '/accounting/receivables' },
      { label: 'Accounts Payable', href: '/accounting/payables' },
      { label: 'Chart of Accounts', href: '/backoffice/accounting/coa' },
      { label: 'Journal Voucher', href: '/accounting/journal-voucher' },
      { label: 'Purchases & Expenses', href: '/accounting/purchase' },
      { label: 'Payment', href: '/accounting/payment' },
      { label: 'Receipt', href: '/accounting/receipt' }
    ]
  },
  {
    id: 'hr',
    en: 'Human Resources',
    ar: 'الموارد البشرية',
    moduleId: 'hr',
    links: [
      { label: 'Employees', href: '/backoffice/hr/employees' },
      { label: 'Payroll', href: '/backoffice/hr/payroll' },
      { label: 'Attendance', href: '/backoffice/hr/attendance' },
      { label: 'Shifts & Roles', href: '/backoffice/hr?tab=shifts' }
    ]
  },
  {
    id: 'customers',
    en: 'Customer Management',
    ar: 'إدارة العملاء',
    moduleId: 'customers',
    links: [
      { label: 'Customers', href: '/backoffice/customers' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Customer Insights', href: '/customer-insights' },
      { label: 'Customer Aged', href: '/backoffice/customers?tab=aged' },
      { label: 'Customer Receipts', href: '/backoffice/customers/receipts' },
      { label: 'Loyalty & Rewards', href: '/backoffice/loyalty' },
      { label: 'Feedback & Surveys', href: '/backoffice/feedback' }
    ]
  },
  {
    id: 'fleet',
    en: 'Logistics & Fleet',
    ar: 'اللوجستيات والأسطول',
    moduleId: 'fleet',
    links: [
      { label: 'SuperSonic Dispatch Hub', href: '/backoffice/fleet/dispatch' },
      { label: 'Driver App Portal', href: '/v-driver' },
      { label: 'Delivery Zones', href: '/backoffice/zone-setup' },
      { label: 'Fleet Tracking', href: '/backoffice/fleet' }
    ]
  },
  {
    id: 'social',
    en: 'Digital & Social Hub',
    ar: 'المركز الرقمي والاجتماعي',
    moduleId: 'social',
    links: [
      { label: 'V-Connect Social CRM', href: '/backoffice/social-crm' },
      { label: 'B2B & E-Commerce Ordering Portal', href: '/v-store' },
      { label: 'Campaign & Portal Links', href: '/backoffice/social-crm/cpl' }
    ]
  }
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RECENT_KEY = 'vanguard_hub_recent_v1';

interface AlertItem {
  name: string;
  code: string;
  qty: number;
  cost: number;
  price: number;
  min: number;
  group: string;
}
interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}
interface Checklist {
  id: string;
  name: string;
  isDefault: boolean;
  items: ChecklistItem[];
}

const TX_SOURCES: { label: string; keys: string[] }[] = [
  { label: 'Sales', keys: ['sales_invoices_directory', 'sales_invoices'] },
  { label: 'Purchases', keys: ['purchases', 'purchase_invoices'] },
  { label: 'Adjustments', keys: ['adjustments', 'stock_adjustments'] },
  { label: 'Transfers', keys: ['transfers', 'stock_transfers'] },
  { label: 'Quotations', keys: ['quotations'] },
  { label: 'Product Requests', keys: ['product_requests'] }
];

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} border border-slate-200 text-xs max-h-[88vh] flex flex-col`}>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default function EnterpriseOverviewHub() {  const { currentTenant } = useTenant();
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const tenantUuid = resolveTenantUuid(currentTenant);
  const liveRate = getTenantExchangeRate(currentTenant);

  const isModuleActive = (moduleId: string): boolean => {
    const modules = currentTenant?.enabledModules || (currentTenant as any)?.enabled_modules;
    if (!modules || !Array.isArray(modules) || modules.length === 0) return true;
    const aliases: Record<string, string[]> = {
      operations: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center'],
      accounting: ['accounting', 'acc', 'finance', 'financials'],
      hr: ['hr', 'human_resources', 'human-resources', 'payroll', 'personnel'],
      customers: ['customers', 'cust', 'crm', 'customer_management', 'customer-management'],
      fleet: ['fleet', 'supersonic', 'logistics', 'vtrack', 'v-driver'],
      social: ['social', 'social_crm', 'social-crm', 'omnichannel', 'connect', 'v-connect', 'vconnect', 'v-store']
    };
    const targets = aliases[moduleId] || [moduleId];
    return modules.some((m: string) => targets.includes(String(m).toLowerCase()));
  };

  const [activeTab, setActiveTab] = useState<string>('operations');
  const [recent, setRecent] = useState<HubLink[]>([]);
  const [modal, setModal] = useState<null | 'eom' | 'latest' | 'checklist' | 'tutorials' | 'alerts'>(null);
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // ---- tenant-scoped persisted config ----
  const [checklists, setChecklists, checklistStatus] = useTenantFlag<Checklist[]>('closing_checklists', []);
  const [tutorialsUrl, setTutorialsUrl, tutorialsStatus] = useTenantFlag<string>('tutorials_url', '');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      if (Array.isArray(saved)) setRecent(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const rememberVisit = (link: HubLink) => {
    setRecent((prev) => {
      const next = [link, ...prev.filter((l) => l.href !== link.href)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const loadFlags = useCallback(async () => {
    const { data } = await supabase.from('tenants').select('feature_flags').eq('id', tenantUuid).maybeSingle();
    const f = (data?.feature_flags as Record<string, any>) || {};
    setFlags(f);
    return f;
  }, [tenantUuid]);

  useEffect(() => {
    loadFlags().catch(() => undefined);
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => d?.success && setPendingApprovals(d.pendingApprovalsCount || 0))
      .catch(() => undefined);
  }, [loadFlags]);

  const postFlag = async (key: string, value: any, append = false) => {
    const res = await fetch('/api/tenant-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenantUuid, key, value, append })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || `Could not save ${key}`);
  };

  // ---- Inventory alerts (live from products) ----
  const [alerts, setAlerts] = useState<{ zeroCost: AlertItem[]; zeroQty: AlertItem[]; belowCost: AlertItem[]; lowStock: AlertItem[]; total: number } | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    const { rows, error } = await fetchCatalogRows(tenantUuid);
    if (error) {
      setAlertsError(error);
      return;
    }
    setAlertsError(null);
    const zeroCost: AlertItem[] = [];
    const zeroQty: AlertItem[] = [];
    const belowCost: AlertItem[] = [];
    const lowStock: AlertItem[] = [];
    const flagged = new Set<string>();
    rows.forEach((r: any) => {
      if (r.is_active === false) return;
      const rec = r.record && typeof r.record === 'object' ? r.record : {};
      const qty = Number(r.stock_quantity ?? rec.qtyOH ?? 0) || 0;
      const price = Number(r.price) || Number(rec.sellingPrice1USD) || 0;
      const cost =
        Number(rec.unitCostUSD) || (Number(rec.unitCostLL) && liveRate ? Number(rec.unitCostLL) / liveRate : 0) || (Number(rec.cost) && liveRate ? Number(rec.cost) / liveRate : 0) || 0;
      const min = Number(rec.reorderLevel ?? rec.stockRecords?.[0]?.reorderLevel ?? rec.minStock ?? 0) || 0;
      const item: AlertItem = {
        name: r.description || r.name || '',
        code: r.sku || '',
        qty,
        cost,
        price,
        min,
        group: rec.groupName || rec.categoryName || 'Uncategorized'
      };
      const key = item.code || item.name;
      if (cost <= 0) {
        zeroCost.push(item);
        flagged.add(key);
      }
      if (qty <= 0) {
        zeroQty.push(item);
        flagged.add(key);
      }
      if (cost > 0 && price > 0 && price < cost) {
        belowCost.push(item);
        flagged.add(key);
      }
      if (min > 0 && qty <= min) {
        lowStock.push(item);
        flagged.add(key);
      }
    });
    setAlerts({ zeroCost, zeroQty, belowCost, lowStock, total: flagged.size });
  }, [tenantUuid, liveRate]);

  useEffect(() => {
    loadAlerts().catch((e) => setAlertsError(e?.message || String(e)));
  }, [loadAlerts]);

  const alertRows: { key: 'zeroCost' | 'zeroQty' | 'belowCost' | 'lowStock'; label: string; hint: string }[] = [
    { key: 'zeroCost', label: 'Zero-Cost Items', hint: 'Items whose cost is 0 or missing' },
    { key: 'zeroQty', label: 'Zero-Qty Items', hint: 'Items with no stock on hand' },
    { key: 'belowCost', label: 'Below-Cost Items', hint: 'Selling price is lower than cost' },
    { key: 'lowStock', label: 'Low-Stock Items', hint: 'Stock on hand at or below the minimum stock level' }
  ];

  const groupItems = (list: AlertItem[]) => {
    const map = new Map<string, AlertItem[]>();
    list.forEach((i) => map.set(i.group, [...(map.get(i.group) || []), i]));
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  };

  // ---- End Of Month ----
  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [eomYear, setEomYear] = useState<number>(prevMonthDate.getFullYear());
  const [eomMonth, setEomMonth] = useState<number>(prevMonthDate.getMonth());
  const [eomBranch, setEomBranch] = useState<string>('');
  const [eomBusy, setEomBusy] = useState(false);
  const [eomMessage, setEomMessage] = useState<string | null>(null);
  const lastClosed = flags.last_month_closed as { year: number; month: number; closed_at?: string } | undefined;
  const branchOptions: string[] = useMemo(() => {
    const list = Array.isArray(flags.branches) ? flags.branches.map((b: any) => b.name).filter(Boolean) : [];
    return list.length ? list : [`${currentTenant?.name || 'Main'} - Main`];
  }, [flags.branches, currentTenant?.name]);
  useEffect(() => {
    if (!eomBranch && branchOptions.length) setEomBranch(branchOptions[0]);
  }, [branchOptions, eomBranch]);

  const executeEom = async () => {
    setEomMessage(null);
    if (lastClosed && eomYear * 12 + eomMonth <= lastClosed.year * 12 + lastClosed.month) {
      setEomMessage(`${MONTHS[eomMonth]} ${eomYear} is already closed (last closed: ${MONTHS[lastClosed.month]} ${lastClosed.year}).`);
      return;
    }
    const f = await loadFlags();
    const invoices: any[] = [...(f.sales_invoices_directory || []), ...(f.sales_invoices || [])];
    const unposted = invoices.filter((i) => {
      const d = new Date(i.createdAtIso || i.createdAt || i.date);
      return !isNaN(d.getTime()) && d.getFullYear() === eomYear && d.getMonth() === eomMonth && !(i.is_posted === true || i.posted === true);
    }).length;
    if (unposted > 0 && !window.confirm(`${unposted} unposted sales invoice(s) exist in ${MONTHS[eomMonth]} ${eomYear}. Close the month anyway?`)) return;
    try {
      setEomBusy(true);
      const entry = { year: eomYear, month: eomMonth, branch: eomBranch, closed_at: new Date().toISOString(), closed_by: 'Vanguard Operator' };
      await postFlag('last_month_closed', entry);
      await postFlag('eom_log', entry, true);
      setFlags((p) => ({ ...p, last_month_closed: entry }));
      setEomMessage(`${MONTHS[eomMonth]} ${eomYear} closed successfully.`);
    } catch (e: any) {
      setEomMessage(`End of month failed: ${e?.message || e}`);
    } finally {
      setEomBusy(false);
    }
  };

  // ---- Latest Transactions ----
  const latest = useMemo(
    () =>
      TX_SOURCES.map((src) => {
        let records: any[] = [];
        src.keys.forEach((k) => {
          if (Array.isArray(flags[k])) records = [...records, ...flags[k]];
        });
        const unposted = records.filter((r) => r.is_posted === false || r.posted === false || /unposted|draft/i.test(String(r.status || ''))).length;
        const times = records.map((r) => new Date(r.createdAtIso || r.createdAt || r.created_at || r.date).getTime()).filter((n) => !isNaN(n));
        return { label: src.label, total: records.length, unposted, last: times.length ? new Date(Math.max(...times)) : null };
      }),
    [flags]
  );

  // ---- Checklists ----
  const [newChecklistOpen, setNewChecklistOpen] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState('');
  const createChecklist = () => {
    const name = newChecklistName.trim();
    if (!name) return;
    const items = newChecklistItems
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, i) => ({ id: `${Date.now()}-${i}`, text, done: false }));
    setChecklists((prev) => [...prev, { id: `cl-${Date.now()}`, name, isDefault: prev.length === 0, items }]);
    setNewChecklistName('');
    setNewChecklistItems('');
    setNewChecklistOpen(false);
  };
  const toggleItem = (listId: string, itemId: string) =>
    setChecklists((prev) => prev.map((l) => (l.id === listId ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) } : l)));
  const setDefaultChecklist = (listId: string) => setChecklists((prev) => prev.map((l) => ({ ...l, isDefault: l.id === listId })));
  const orderedChecklists = [...checklists].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const tab = HUB_TABS.find((t) => t.id === activeTab) || HUB_TABS[0];
  const tabActive = isModuleActive(tab.moduleId);

  const utilBtn = 'px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors';

  return (
    <div dir={dir} className="max-w-7xl mx-auto space-y-4 pb-10">
      {/* Header + top-right utilities */}
      <section className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 truncate">{currentTenant?.name || 'Vanguard ERP'}</h1>
              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">#{currentTenant?.companyId || '1300'}</span>
            </div>
            <p className="text-[11px] text-slate-500">{isAr ? 'المركز الرئيسي لـ Vanguard ERP' : 'Vanguard ERP Enterprise Overview Hub'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModal('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              alerts && alerts.total > 0 ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert</span>
            <span className="px-1.5 rounded-full bg-white/70 font-mono">{alerts ? alerts.total : '…'}</span>
          </button>
          <button type="button" onClick={() => { loadFlags(); setEomMessage(null); setModal('eom'); }} className={utilBtn}>
            <CalendarCheck className="w-3.5 h-3.5" /> End Of Month
          </button>
          <button type="button" onClick={() => { loadFlags(); setModal('latest'); }} className={utilBtn}>
            <History className="w-3.5 h-3.5" /> Latest Transactions
          </button>
          <button type="button" onClick={() => setModal('checklist')} className={utilBtn}>
            <ListChecks className="w-3.5 h-3.5" /> Check List
          </button>
          <button type="button" onClick={() => setModal('tutorials')} className={utilBtn}>
            <PlayCircle className="w-3.5 h-3.5" /> Watch Tutorials
          </button>
          <Link prefetch={false} href="/backoffice/inbox" className={utilBtn}>
            <Inbox className="w-3.5 h-3.5" /> Inbox
            {pendingApprovals > 0 && <span className="px-1.5 bg-red-600 text-white rounded-full text-[10px]">{pendingApprovals}</span>}
          </Link>
        </div>
      </section>

      {/* Top tabs */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div role="tablist" className="flex flex-wrap items-center gap-1 px-2.5 pt-2.5 border-b border-slate-100">
          {HUB_TABS.map((t) => {
            const active = t.id === activeTab;
            const enabled = isModuleActive(t.moduleId);
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
                  active ? 'border-slate-900 text-slate-900 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                } ${enabled ? '' : 'opacity-60'}`}
              >
                {!enabled && <Lock className="w-3 h-3" />}
                <span>{isAr ? t.ar : t.en}</span>
              </button>
            );
          })}
        </div>

        {/* Recently visited quick-bar, directly below the tabs */}
        <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 shrink-0">
            <Clock className="w-3.5 h-3.5" /> {isAr ? 'تمت زيارتها مؤخراً' : 'Recently Visited'}
          </span>
          {recent.length === 0 ? (
            <span className="text-[11px] text-slate-400">{isAr ? 'ستظهر الشاشات التي تفتحها هنا' : 'Screens you open will appear here'}</span>
          ) : (
            recent.map((l) => (
              <Link
                prefetch={false}
                key={l.href}
                href={l.href}
                onClick={() => rememberVisit(l)}
                className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))
          )}
        </div>

        {/* Active tab links */}
        <div className="p-4">
          {!tabActive && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900">
              This module is not enabled in your subscription. Contact your administrator to activate it.
            </div>
          )}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 ${tabActive ? '' : 'opacity-50 pointer-events-none'}`}>
            {tab.links.map((l) => (
              <Link
                prefetch={false}
                key={l.href + l.label}
                href={l.href}
                onClick={() => rememberVisit(l)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-between gap-2 transition-colors"
              >
                <span className="truncate">{l.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Modals ---------------- */}
      {modal === 'alerts' && (
        <Modal title="Inventory Alerts" onClose={() => setModal(null)} wide>
          {alertsError && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">Could not load products: {alertsError}</div>}
          {!alerts && !alertsError && <div className="text-slate-500">Loading live inventory...</div>}
          {alerts &&
            alertRows.map((row) => {
              const list = alerts[row.key];
              const open = expandedAlert === row.key;
              return (
                <div key={row.key} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAlert(open ? null : row.key)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer text-left"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900">{row.label}</div>
                      <div className="text-[11px] text-slate-500">{row.hint}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold ${list.length ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{list.length}</span>
                      {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-3 space-y-2">
                      {list.length === 0 && <div className="text-slate-500">No items.</div>}
                      {groupItems(list).map(([group, items]) => (
                        <div key={group} className="bg-white border border-slate-200 rounded-lg">
                          <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-700 flex items-center justify-between">
                            <span>{group}</span>
                            <span className="font-mono text-slate-500">{items.length}</span>
                          </div>
                          <table className="w-full">
                            <tbody className="divide-y divide-slate-100">
                              {items.slice(0, 50).map((i, idx) => (
                                <tr key={`${i.code}-${idx}`}>
                                  <td className="px-3 py-1.5 font-semibold text-slate-800">{i.name}</td>
                                  <td className="px-3 py-1.5 font-mono text-slate-500">{i.code}</td>
                                  <td className="px-3 py-1.5 text-right font-mono">Qty {i.qty}</td>
                                  <td className="px-3 py-1.5 text-right font-mono">Cost ${i.cost.toFixed(2)}</td>
                                  <td className="px-3 py-1.5 text-right font-mono">Price ${i.price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {items.length > 50 && <div className="px-3 py-1.5 text-[11px] text-slate-500">Showing 50 of {items.length}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          <p className="text-[11px] text-slate-500">Live counts from the tenant product catalog. Cost and minimum stock come from each item&apos;s detail record.</p>
        </Modal>
      )}

      {modal === 'eom' && (
        <Modal title="End Of Month" onClose={() => setModal(null)}>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-600">Last month closed</span>
            <span className="font-mono font-extrabold text-slate-900">{lastClosed ? `${MONTHS[lastClosed.month]} ${lastClosed.year}` : 'Never closed'}</span>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-600">Branch</label>
            <select value={eomBranch} onChange={(e) => setEomBranch(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
              {branchOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Year</label>
              <select value={eomYear} onChange={(e) => setEomYear(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Month</label>
              <select value={eomMonth} onChange={(e) => setEomMonth(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          {eomMessage && <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold">{eomMessage}</div>}
          <div className="flex justify-end">
            <button type="button" disabled={eomBusy} onClick={executeEom} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold cursor-pointer">
              {eomBusy ? 'Closing...' : 'Execute End Of Month'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'latest' && (
        <Modal title="Latest Transactions" onClose={() => setModal(null)}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2 px-3 text-left">Module</th>
                <th className="py-2 px-3 text-right">Unposted</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-right">Latest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latest.map((r) => (
                <tr key={r.label}>
                  <td className="py-2 px-3 font-bold text-slate-900">{r.label}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${r.unposted ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{r.unposted}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{r.total}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">{r.last ? r.last.toLocaleDateString('en-GB') : 'No records'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-500">Counted from this tenant&apos;s saved transactions: unposted means is_posted is false (or draft/unposted status).</p>
        </Modal>
      )}

      {modal === 'checklist' && (
        <Modal title="Check List" onClose={() => setModal(null)} wide>
          {checklistStatus.error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">{checklistStatus.error}</div>}
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Month-end closing checklists for this tenant.</span>
            <button type="button" onClick={() => setNewChecklistOpen((v) => !v)} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> New Checklist
            </button>
          </div>
          {newChecklistOpen && (
            <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
              <input value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} placeholder="Checklist name (e.g. Month-End Closing)" className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white" />
              <textarea value={newChecklistItems} onChange={(e) => setNewChecklistItems(e.target.value)} rows={5} placeholder={'One task per line, e.g.\nPost all sales invoices\nReconcile bank accounts\nReview unposted purchases'} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewChecklistOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
                <button type="button" onClick={createChecklist} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">Create</button>
              </div>
            </div>
          )}
          {orderedChecklists.length === 0 && !newChecklistOpen && <div className="text-slate-500 py-4 text-center">No checklists yet. Create one with New Checklist.</div>}
          {orderedChecklists.map((l) => {
            const done = l.items.filter((i) => i.done).length;
            return (
              <div key={l.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    {l.name}
                    {l.isDefault && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Default</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{done}/{l.items.length}</span>
                    {!l.isDefault && (
                      <button type="button" onClick={() => setDefaultChecklist(l.id)} className="text-blue-700 font-bold hover:underline cursor-pointer">Set Default</button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {l.items.map((i) => (
                    <label key={i.id} className="px-4 py-2 flex items-center gap-2.5 cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={i.done} onChange={() => toggleItem(l.id, i.id)} className="w-4 h-4" />
                      <span className={i.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>{i.text}</span>
                    </label>
                  ))}
                  {l.items.length === 0 && <div className="px-4 py-3 text-slate-500">This checklist has no tasks.</div>}
                </div>
              </div>
            );
          })}
        </Modal>
      )}

      {modal === 'tutorials' && (
        <Modal title="Watch Tutorials" onClose={() => setModal(null)}>
          {tutorialsUrl ? (
            <a href={tutorialsUrl} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center font-extrabold text-slate-900">
              Open the Vanguard tutorials channel
              <div className="font-mono text-[11px] font-normal text-slate-500 mt-1 truncate">{tutorialsUrl}</div>
            </a>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-slate-600">
              Tutorial videos are coming soon. Add the official Vanguard YouTube channel link below and it will open from here.
            </div>
          )}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600">Vanguard YouTube channel URL</label>
            <input
              value={tutorialsUrl}
              onChange={(e) => setTutorialsUrl(e.target.value)}
              placeholder="https://www.youtube.com/@VanguardERP"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
            />
            {tutorialsStatus.error && <div className="text-rose-700 font-semibold">{tutorialsStatus.error}</div>}
            {tutorialsStatus.saving && <div className="text-slate-500">Saving...</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
