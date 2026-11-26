'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useHrEmployees, TimeOffRequest } from '@/lib/hrTenantData';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { computeEmployeePay, usePayrollRuns } from '@/lib/hrPayrollRuns';
import { DEFAULT_LABELS, EarningDeductionLabel, PaymentSetting, PayrollRun, fmtMoney, rolling12Months, baseSalaryIn } from '@/lib/hrPayrollData';
import { useAttendanceLogs } from '@/lib/hrAttendanceData';
import { Modal, cardCls, inputCls } from './hrUi';

type Tab = 'overview' | 'summary' | 'salary' | 'deductions' | 'employer' | 'attendance';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Employee Overview' },
  { id: 'summary', label: 'Payroll Summary' },
  { id: 'salary', label: 'Salary Breakdown' },
  { id: 'deductions', label: 'Deductions Breakdown' },
  { id: 'employer', label: 'Employer Contributions' },
  { id: 'attendance', label: 'Attendance & Time' }
];

interface Totals {
  gross: number;
  deductions: number;
  employer: number;
  net: number;
  earn: Map<string, number>;
  ded: Map<string, number>;
  emp: Map<string, number>;
  byDept: Map<string, { cost: number; count: number }>;
  source: 'run' | 'computed';
}

export default function HrPayrollDashboard() {
  const { employees, loading } = useHrEmployees();
  const { runs, rate } = usePayrollRuns();
  const { logs } = useAttendanceLogs();
  const [settings] = useTenantFlag<PaymentSetting[]>('hr_payment_settings', []);
  const [labels] = useTenantFlag<EarningDeductionLabel[]>('hr_earnings_deductions', DEFAULT_LABELS);
  const [timeOff] = useTenantFlag<TimeOffRequest[]>('hr_time_off', []);

  const months = useMemo(() => rolling12Months(), []);
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [periodKey, setPeriodKey] = useState(months[0].key);
  const [periodSearch, setPeriodSearch] = useState('');
  const [dept, setDept] = useState('ALL');
  const [deptSearch, setDeptSearch] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [breakdown, setBreakdown] = useState(false);

  const period = months.find((m) => m.key === periodKey) || months[0];
  const active = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const depts = Array.from(new Set(active.map((e) => e.department).filter(Boolean)));
  const staff = active.filter((e) => dept === 'ALL' || e.department === dept);
  const conv = (v: number, from: 'USD' | 'LBP') => (from === currency ? v : currency === 'LBP' ? v * rate : v / rate);

  const totalsFor = (year: number, month: number): Totals => {
    const t: Totals = { gross: 0, deductions: 0, employer: 0, net: 0, earn: new Map(), ded: new Map(), emp: new Map(), byDept: new Map(), source: 'computed' };
    const inRuns = runs.filter((r) => r.year === year && r.month === month);
    const add = (m: Map<string, number>, k: string, v: number) => m.set(k, (m.get(k) || 0) + v);
    const dept = (e: { department?: string }) => e.department || 'Unassigned';
    if (inRuns.length > 0) {
      t.source = 'run';
      const ids = new Set(staff.map((e) => e.id));
      inRuns.forEach((r: PayrollRun) =>
        r.lines.filter((l) => ids.has(l.employeeId)).forEach((l) => {
          const amt = conv(l.amount, r.currency);
          const d = (staff.find((s) => s.id === l.employeeId)?.department) || 'Unassigned';
          if ((l as any).employer) { t.employer += amt; add(t.emp, l.label, amt); return; }
          if (l.labelType === 'Earning') { t.gross += amt; add(t.earn, l.label, amt); const c = t.byDept.get(d) || { cost: 0, count: 0 }; c.cost += amt; t.byDept.set(d, c); }
          else { t.deductions += amt; add(t.ded, l.label, amt); const c = t.byDept.get(d) || { cost: 0, count: 0 }; c.cost -= amt; t.byDept.set(d, c); }
        })
      );
      staff.forEach((s) => { const c = t.byDept.get(dept(s)); if (c) c.count += 1; });
    } else {
      const ref = new Date(year, month, 0);
      staff.filter((e) => !e.dateHired || new Date(e.dateHired) <= ref).forEach((e) => {
        const p = computeEmployeePay(e, settings, labels, currency, rate);
        const d = dept(e);
        const c = t.byDept.get(d) || { cost: 0, count: 0 };
        t.gross += p.base; add(t.earn, 'Base Salary', p.base);
        p.earnings.forEach((x) => { t.gross += x.amount; add(t.earn, x.label, x.amount); });
        p.deductions.forEach((x) => { t.deductions += x.amount; add(t.ded, x.label, x.amount); });
        p.employer.forEach((x) => { t.employer += x.amount; add(t.emp, x.label, x.amount); });
        c.cost += p.base + p.earnings.reduce((s, x) => s + x.amount, 0) - p.deductions.reduce((s, x) => s + x.amount, 0);
        c.count += 1;
        t.byDept.set(d, c);
      });
    }
    t.net = t.gross - t.deductions;
    return t;
  };

  const cur = totalsFor(period.year, period.month);
  const burdenPct = cur.gross > 0 ? (cur.employer / cur.gross) * 100 : 0;
  const trend = useMemo(() => months.slice(0, 6).reverse().map((m) => ({ m, v: totalsFor(m.year, m.month).gross })), [months, runs, staff, settings, labels, currency, rate]); // eslint-disable-line react-hooks/exhaustive-deps
  const trendMax = Math.max(1, ...trend.map((t) => t.v));

  const monthKey = `${period.year}-${String(period.month).padStart(2, '0')}`;
  const hired = staff.filter((e) => (e.dateHired || '').startsWith(monthKey)).length;
  const left = employees.filter((e) => (e.dateLeft || '').startsWith(monthKey) && (dept === 'ALL' || e.department === dept)).length;
  const approvedOff = timeOff.filter((r) => r.status === 'Approved' && r.startDate.startsWith(monthKey));
  const unpaidDays = approvedOff.filter((r) => r.paid === 'No').reduce((s, r) => s + r.days, 0);
  const periodLogs = logs.filter((l) => l.punchIn.startsWith(monthKey) && staff.some((s) => s.id === l.employeeId));
  const hoursWorked = periodLogs.reduce((s, l) => s + l.durationHours, 0);
  const byReason = new Map<string, { days: number; count: number }>();
  approvedOff.filter((r) => staff.some((s) => s.id === r.employeeId)).forEach((r) => { const c = byReason.get(r.reason) || { days: 0, count: 0 }; c.days += r.days; c.count += 1; byReason.set(r.reason, c); });
  const byLocation = new Map<string, number>();
  staff.forEach((e) => byLocation.set(e.location || e.branch || 'Unassigned', (byLocation.get(e.location || e.branch || 'Unassigned') || 0) + 1));
  const byDeptCount = new Map<string, number>();
  staff.forEach((e) => byDeptCount.set(e.department || 'Unassigned', (byDeptCount.get(e.department || 'Unassigned') || 0) + 1));

  const money = (v: number) => fmtMoney(v, currency);
  const pct = (v: number, total: number) => (total > 0 ? `${((v / total) * 100).toFixed(1)}%` : '0.0%');
  const kpi = 'text-2xl font-black text-slate-900 mt-1';

  const Breakdown = ({ rows, total, title }: { rows: [string, number][]; total: number; title: string }) => (
    <div className={`${cardCls} overflow-hidden`}>
      <table className="w-full text-xs border-collapse">
        <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]"><th className="py-2.5 px-4 text-left">{title}</th><th className="py-2.5 px-4 text-right">Amount</th><th className="py-2.5 px-4 text-right">% of Total</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-slate-500">Nothing to show for this period.</td></tr>}
          {rows.map(([k, v]) => <tr key={k}><td className="py-2 px-4 font-medium text-slate-800">{k}</td><td className="py-2 px-4 text-right font-mono">{money(v)}</td><td className="py-2 px-4 text-right font-mono text-slate-500">{pct(v, total)}</td></tr>)}
          <tr className="bg-slate-50 font-black"><td className="py-2.5 px-4">Total</td><td className="py-2.5 px-4 text-right font-mono">{money(total)}</td><td className="py-2.5 px-4 text-right font-mono">{rows.length ? '100.0%' : '0.0%'}</td></tr>
        </tbody>
      </table>
    </div>
  );
  const sortRows = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <aside className={`${cardCls} w-full lg:w-60 shrink-0 p-3 space-y-3 text-xs`}>
        <div>
          <div className="font-bold text-slate-600 mb-1">Currency</div>
          <div className="flex gap-1">{(['USD', 'LBP'] as const).map((c) => <button key={c} type="button" onClick={() => setCurrency(c)} className={`flex-1 px-2 py-1.5 rounded-lg font-bold cursor-pointer ${currency === c ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-600'}`}>{c}</button>)}</div>
          {currency === 'LBP' && <div className="text-[11px] text-slate-500 mt-1">1 USD = {rate.toLocaleString()} LBP (tenant rate)</div>}
        </div>
        <div>
          <div className="font-bold text-slate-600 mb-1">Payroll period</div>
          <div className="relative mb-1"><Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" /><input value={periodSearch} onChange={(e) => setPeriodSearch(e.target.value)} placeholder="Search period..." className="w-full pl-7 pr-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50" /></div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {months.filter((m) => !periodSearch.trim() || m.label.toLowerCase().includes(periodSearch.trim().toLowerCase())).map((m) => (
              <button key={m.key} type="button" onClick={() => setPeriodKey(m.key)} className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${periodKey === m.key ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>{m.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-600 mb-1">Department</div>
          <input value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} placeholder="Search department..." className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 mb-1" />
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            {['ALL', ...depts].filter((d) => d === 'ALL' || !deptSearch.trim() || d.toLowerCase().includes(deptSearch.trim().toLowerCase())).map((d) => (
              <button key={d} type="button" onClick={() => setDept(d)} className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${dept === d ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>{d === 'ALL' ? 'All Departments' : d}</button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 w-full space-y-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Payroll Dashboard</h1>
          <p className="text-xs text-slate-500">{period.label} - {cur.source === 'run' ? 'from saved salary runs' : 'estimated from base salaries and payment settings (no run saved for this period)'}.{loading ? ' Loading...' : ''}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${cardCls} p-4`}><div className="text-[11px] font-semibold text-slate-500">Total Employees (Active)</div><div className={kpi}>{staff.length}</div></div>
          <div className={`${cardCls} p-4`}><div className="text-[11px] font-semibold text-slate-500">Gross payroll</div><div className={kpi}>{money(cur.gross)}</div></div>
          <div className={`${cardCls} p-4`}><div className="text-[11px] font-semibold text-slate-500">Total Deductions</div><div className={`${kpi} text-rose-700`}>{money(cur.deductions)}</div></div>
          <div className={`${cardCls} p-4`}><div className="text-[11px] font-semibold text-slate-500">Employer burden %</div><div className={kpi}>{burdenPct.toFixed(1)}%</div></div>
        </div>

        <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-2xl p-1.5">
          {TABS.map((t) => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t.label}</button>)}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
            <div className={`${cardCls} p-4 space-y-2`}>
              <div className="font-extrabold text-slate-900 text-sm">Metrics</div>
              <div className="flex justify-between"><span>Active employees</span><b>{staff.length}</b></div>
              <div className="flex justify-between"><span>Inactive employees</span><b>{employees.filter((e) => e.active === false && (dept === 'ALL' || e.department === dept)).length}</b></div>
              <div className="font-extrabold text-slate-900 text-sm pt-2">Movement</div>
              <div className="flex justify-between"><span>New hires ({period.label})</span><b>{hired}</b></div>
              <div className="flex justify-between"><span>Leavers ({period.label})</span><b>{left}</b></div>
              <div className="font-extrabold text-slate-900 text-sm pt-2">Quick alerts</div>
              <div className="flex justify-between"><span>Attrition rate</span><b>{staff.length + left > 0 ? ((left / (staff.length + left)) * 100).toFixed(1) : '0.0'}%</b></div>
              <div className="flex justify-between"><span>Unpaid leave days</span><b>{unpaidDays}</b></div>
              <div className="flex justify-between"><span>Deduction rate</span><b>{pct(cur.deductions, cur.gross)}</b></div>
            </div>
            <div className="space-y-3">
              <div className={`${cardCls} p-4`}><div className="font-extrabold text-slate-900 text-sm mb-2">Employees by location</div>{byLocation.size === 0 ? <div className="text-slate-500">No employees.</div> : Array.from(byLocation.entries()).map(([k, v]) => <div key={k} className="flex justify-between py-0.5"><span>{k}</span><b>{v}</b></div>)}</div>
              <div className={`${cardCls} p-4`}><div className="font-extrabold text-slate-900 text-sm mb-2">Headcount per department</div>{byDeptCount.size === 0 ? <div className="text-slate-500">No employees.</div> : Array.from(byDeptCount.entries()).map(([k, v]) => <div key={k} className="flex justify-between py-0.5"><span>{k}</span><b>{v}</b></div>)}</div>
            </div>
          </div>
        )}

        {tab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
            <div className={`${cardCls} p-4 space-y-2`}>
              <div className="flex justify-between"><span className="text-slate-500">Total gross payroll</span><b className="font-mono">{money(cur.gross)}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Total net salaries payable</span><b className="font-mono">{money(cur.net)}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Total deductions</span><b className="font-mono text-rose-700">{money(cur.deductions)}</b></div>
              <div className="pt-2 border-t border-slate-100 font-extrabold text-slate-900 text-sm">Insights</div>
              <div className="text-slate-600">{cur.byDept.size > 0 ? `Highest cost department: ${Array.from(cur.byDept.entries()).sort((a, b) => b[1].cost - a[1].cost)[0][0]}.` : 'No payroll data for this period.'}</div>
              <button type="button" onClick={() => setBreakdown(true)} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">View Breakdown</button>
            </div>
            <div className={`${cardCls} p-4`}>
              <div className="font-extrabold text-slate-900 text-sm mb-3">Trend (last 6 months, gross)</div>
              <div className="flex items-end gap-2 h-40">
                {trend.map((t) => (
                  <div key={t.m.key} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="text-[10px] font-mono text-slate-500">{t.v > 0 ? Math.round(t.v).toLocaleString() : ''}</div>
                    <div className="w-full max-w-[40px] bg-blue-600 rounded-t" style={{ height: `${Math.max(3, (t.v / trendMax) * 100)}%` }} />
                    <div className="text-[10px] text-slate-500 mt-1">{t.m.label.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'salary' && <Breakdown title="Earnings component" rows={sortRows(cur.earn)} total={cur.gross} />}
        {tab === 'deductions' && <Breakdown title="Deduction component" rows={sortRows(cur.ded)} total={cur.deductions} />}
        {tab === 'employer' && (
          <div className="space-y-3">
            <Breakdown title="Employer burden component" rows={sortRows(cur.emp)} total={cur.employer} />
            <div className={`${cardCls} p-3 text-xs font-bold`}>Total employer burden (%): <span className="font-mono">{burdenPct.toFixed(1)}%</span> of gross payroll</div>
          </div>
        )}
        {tab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
            <div className={`${cardCls} p-4 space-y-2`}>
              <div className="font-extrabold text-slate-900 text-sm">Attendance &amp; Time Impact</div>
              <div className="flex justify-between"><span>Attendance records</span><b>{periodLogs.length}</b></div>
              <div className="flex justify-between"><span>Hours worked</span><b>{hoursWorked.toFixed(1)}</b></div>
              <div className="flex justify-between"><span>Approved leave days</span><b>{approvedOff.reduce((s, r) => s + r.days, 0)}</b></div>
              <div className="flex justify-between"><span>Unpaid leave days</span><b>{unpaidDays}</b></div>
            </div>
            <div className={`${cardCls} overflow-hidden`}>
              <div className="px-4 py-2.5 font-extrabold text-slate-900 text-sm border-b border-slate-100">Leave Reason Breakdown</div>
              <table className="w-full"><tbody className="divide-y divide-slate-100">
                {byReason.size === 0 && <tr><td className="py-5 px-4 text-center text-slate-500">No approved leave in this period.</td></tr>}
                {Array.from(byReason.entries()).map(([k, v]) => <tr key={k}><td className="py-2 px-4 font-medium">{k}</td><td className="py-2 px-4 text-right font-mono">{v.count} request(s)</td><td className="py-2 px-4 text-right font-mono font-bold">{v.days} d</td></tr>)}
              </tbody></table>
            </div>
          </div>
        )}
      </div>

      {breakdown && (
        <Modal title={`Payroll breakdown - ${period.label}`} onClose={() => setBreakdown(false)}>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-slate-50 text-slate-600 font-bold"><th className="py-2 px-3 text-left">Department</th><th className="py-2 px-3 text-right">Total Cost</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {cur.byDept.size === 0 && <tr><td colSpan={2} className="py-5 text-center text-slate-500">No payroll data for this period.</td></tr>}
              {Array.from(cur.byDept.entries()).sort((a, b) => b[1].cost - a[1].cost).map(([d, v]) => <tr key={d}><td className="py-2 px-3 font-medium">{d} <span className="text-slate-400">({v.count})</span></td><td className="py-2 px-3 text-right font-mono font-bold">{money(v.cost)}</td></tr>)}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}
