'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ChevronRight, ChevronDown, ArrowLeft, Users } from 'lucide-react';
import { useHrEmployees } from '@/lib/hrTenantData';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { computeEmployeePay, usePayrollRuns } from '@/lib/hrPayrollRuns';
import { DEFAULT_LABELS, EarningDeductionLabel, MONTH_NAMES, PaymentSetting, PayrollLine, PayrollRun, fmtMoney } from '@/lib/hrPayrollData';
import { Modal, Field, inputCls, cardCls } from './hrUi';

const netOf = (lines: PayrollLine[], empId: string) =>
  lines.filter((l) => l.employeeId === empId && !(l as any).employer).reduce((s, l) => s + (l.labelType === 'Earning' ? l.amount : -l.amount), 0);

export default function HrSalaryProcessing() {
  const { employees } = useHrEmployees();
  const { runs, loading, error, storage, saveRun, deleteRun, rate, currentTenant } = usePayrollRuns();
  const [settings] = useTenantFlag<PaymentSetting[]>('hr_payment_settings', []);
  const [labels] = useTenantFlag<EarningDeductionLabel[]>('hr_earnings_deductions', DEFAULT_LABELS);

  const now = new Date();
  const [fBrand, setFBrand] = useState('ALL');
  const [fBranch, setFBranch] = useState('ALL');
  const [fYear, setFYear] = useState(now.getFullYear());
  const [fMonth, setFMonth] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState<PayrollRun | null>(null);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [nameSearch, setNameSearch] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addLine, setAddLine] = useState<null | { department: string; employeeId: string; labelType: 'Earning' | 'Deduction'; label: string; amount: string; remark: string }>(null);

  const active = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const brands = Array.from(new Set(active.map((e) => e.brand).filter(Boolean)));
  const branches = Array.from(new Set(active.map((e) => e.branch).filter(Boolean)));

  const list = runs.filter((r) => (fBrand === 'ALL' || r.brand === fBrand) && (fBranch === 'ALL' || r.branch === fBranch) && r.year === fYear && (fMonth === 0 || r.month === fMonth));

  const startNew = () => {
    const brand = brands[0] || currentTenant?.name || '';
    const branch = branches[0] || '';
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const currency: 'USD' | 'LBP' = 'USD';
    const lines: PayrollLine[] = [];
    active.filter((e) => (!branch || e.branch === branch)).forEach((e) => {
      const p = computeEmployeePay(e, settings, labels, currency, rate);
      lines.push({ id: `${e.id}-base`, employeeId: e.id, employeeName: e.fullName, department: e.department || 'Unassigned', labelType: 'Earning', label: 'Base Salary', amount: p.base, remark: '' });
      p.earnings.forEach((x, i) => lines.push({ id: `${e.id}-e${i}`, employeeId: e.id, employeeName: e.fullName, department: e.department || 'Unassigned', labelType: 'Earning', label: x.label, amount: x.amount, remark: '' }));
      p.deductions.forEach((x, i) => lines.push({ id: `${e.id}-d${i}`, employeeId: e.id, employeeName: e.fullName, department: e.department || 'Unassigned', labelType: 'Deduction', label: x.label, amount: x.amount, remark: '' }));
      p.employer.forEach((x, i) => lines.push({ id: `${e.id}-x${i}`, employeeId: e.id, employeeName: e.fullName, department: e.department || 'Unassigned', labelType: 'Deduction', label: x.label, amount: x.amount, remark: 'Employer contribution', employer: true } as any));
    });
    setDraft({ id: `run-${Date.now()}`, year, month, brand, branch, label: `Salary ${MONTH_NAMES[month - 1]} ${year}`, totalSalary: 0, currency, status: 'Draft', lines });
    setMsg(null);
  };

  const save = async (status: 'Draft' | 'Posted') => {
    if (!draft) return;
    if (!draft.label.trim()) return setMsg('Enter a Processing Label.');
    const total = Math.round(Array.from(new Set(draft.lines.map((l) => l.employeeId))).reduce((s, id) => s + netOf(draft.lines, id), 0) * 100) / 100;
    const r = await saveRun({ ...draft, status, totalSalary: total });
    setMsg(r.message);
    if (r.ok) setDraft(null);
  };

  if (draft) {
    const staff = active.filter((e) => draft.lines.some((l) => l.employeeId === e.id));
    const filtered = staff.filter((e) => (deptFilter === 'ALL' || (e.department || 'Unassigned') === deptFilter) && (!nameSearch.trim() || e.fullName.toLowerCase().includes(nameSearch.trim().toLowerCase())));
    const depts = Array.from(new Set(staff.map((e) => e.department || 'Unassigned')));
    const grouped = depts.filter((d) => deptFilter === 'ALL' || d === deptFilter).map((d) => ({ d, emps: filtered.filter((e) => (e.department || 'Unassigned') === d) })).filter((g) => g.emps.length);
    const total = filtered.reduce((s, e) => s + netOf(draft.lines, e.id), 0);
    const setLine = (id: string, patch: Partial<PayrollLine>) => setDraft({ ...draft, lines: draft.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
    const locked = draft.status === 'Posted';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDraft(null)} className="p-1.5 rounded-xl border border-slate-300 cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
            <h1 className="text-xl font-black text-slate-900">{runs.some((r) => r.id === draft.id) ? 'Edit Payroll Run' : 'New Payroll Run'}</h1>
            {locked && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Posted</span>}
          </div>
        </div>
        {msg && <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900">{msg}</div>}

        <div className={`${cardCls} p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs`}>
          <Field label="Brand"><select disabled={locked} value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} className={inputCls}>{[draft.brand, ...brands].filter((v, i, a) => v && a.indexOf(v) === i).map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Branch"><select disabled={locked} value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} className={inputCls}>{[draft.branch, ...branches].filter((v, i, a) => v && a.indexOf(v) === i).map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Year"><select disabled={locked} value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} className={inputCls}>{[draft.year - 1, draft.year, draft.year + 1].map((y) => <option key={y}>{y}</option>)}</select></Field>
          <Field label="Month"><select disabled={locked} value={draft.month} onChange={(e) => setDraft({ ...draft, month: Number(e.target.value), label: `Salary ${MONTH_NAMES[Number(e.target.value) - 1]} ${draft.year}` })} className={inputCls}>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></Field>
          <Field label="Processing Label"><input disabled={locked} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className={inputCls} /></Field>
          <Field label="Currency"><select disabled={locked} value={draft.currency} onChange={(e) => {
            const to = e.target.value as 'USD' | 'LBP';
            const f = draft.currency === to ? 1 : to === 'LBP' ? rate : 1 / rate;
            setDraft({ ...draft, currency: to, lines: draft.lines.map((l) => ({ ...l, amount: l.amount * f })) });
          }} className={inputCls}><option>USD</option><option>LBP</option></select></Field>
          <Field label="All Departments"><select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputCls}><option value="ALL">All Departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Search by Name"><input value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} className={inputCls} /></Field>
        </div>

        <div className={`${cardCls} overflow-hidden`}>
          {grouped.length === 0 && <div className="p-6 text-center text-xs text-slate-500">No employees in this run. Add employees with a base salary under Personnel.</div>}
          {grouped.map((g) => (
            <div key={g.d}>
              <button type="button" onClick={() => setCollapsed({ ...collapsed, [g.d]: !collapsed[g.d] })} className="w-full flex items-center justify-between px-4 py-2 bg-slate-100 border-y border-slate-200 text-xs font-extrabold text-slate-800 cursor-pointer">
                <span className="flex items-center gap-1.5">{collapsed[g.d] ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} {g.d} ({g.emps.length})</span>
                <span className="font-mono">{fmtMoney(g.emps.reduce((s, e) => s + netOf(draft.lines, e.id), 0), draft.currency)}</span>
              </button>
              {!collapsed[g.d] && (
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="text-slate-500 font-bold text-[11px] uppercase">
                    <th className="py-2 px-3 w-8"></th><th className="py-2 px-3 text-left">Employee</th><th className="py-2 px-3 text-right">Base Salary</th><th className="py-2 px-3 text-right">Total Earnings</th><th className="py-2 px-3 text-right">Total Deductions</th><th className="py-2 px-3 text-right">Net Pay</th><th className="py-2 px-3">Currency</th>
                  </tr></thead>
                  <tbody>
                    {g.emps.map((e) => {
                      const mine = draft.lines.filter((l) => l.employeeId === e.id);
                      const base = mine.filter((l) => l.label === 'Base Salary').reduce((s, l) => s + l.amount, 0);
                      const earn = mine.filter((l) => l.labelType === 'Earning').reduce((s, l) => s + l.amount, 0);
                      const ded = mine.filter((l) => l.labelType === 'Deduction' && !(l as any).employer).reduce((s, l) => s + l.amount, 0);
                      const isOpen = !!open[e.id];
                      return (
                        <React.Fragment key={e.id}>
                          <tr className="border-t border-slate-100 hover:bg-slate-50/60">
                            <td className="py-2 px-3"><button type="button" onClick={() => setOpen({ ...open, [e.id]: !isOpen })} className="cursor-pointer">{isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</button></td>
                            <td className="py-2 px-3 font-bold text-slate-900">{e.fullName}</td>
                            <td className="py-2 px-3 text-right font-mono">{fmtMoney(base, draft.currency)}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-700">{fmtMoney(earn, draft.currency)}</td>
                            <td className="py-2 px-3 text-right font-mono text-rose-700">{fmtMoney(ded, draft.currency)}</td>
                            <td className="py-2 px-3 text-right font-mono font-black">{fmtMoney(earn - ded, draft.currency)}</td>
                            <td className="py-2 px-3 text-center">{draft.currency}</td>
                          </tr>
                          {isOpen && (
                            <tr><td colSpan={7} className="bg-slate-50 px-6 py-2">
                              {mine.map((l) => (
                                <div key={l.id} className="flex items-center gap-3 py-1">
                                  <span className={`w-20 font-bold ${l.labelType === 'Earning' ? 'text-emerald-700' : 'text-rose-700'}`}>{l.labelType}{(l as any).employer ? ' (Er)' : ''}</span>
                                  <span className="w-48 font-medium text-slate-800 truncate">{l.label}</span>
                                  <input disabled={locked} type="number" value={Math.round(l.amount * 100) / 100} onChange={(ev) => setLine(l.id, { amount: Number(ev.target.value) })} className="w-28 px-2 py-1 border border-slate-300 rounded-lg font-mono text-right" />
                                  <input disabled={locked} value={l.remark} onChange={(ev) => setLine(l.id, { remark: ev.target.value })} placeholder="Enter remark" className="flex-1 px-2 py-1 border border-slate-300 rounded-lg" />
                                  {!locked && l.label !== 'Base Salary' && <button type="button" onClick={() => setDraft({ ...draft, lines: draft.lines.filter((x) => x.id !== l.id) })} className="text-rose-600 cursor-pointer" aria-label="Remove line"><Trash2 className="w-3.5 h-3.5" /></button>}
                                </div>
                              ))}
                              {!locked && <button type="button" onClick={() => setAddLine({ department: e.department || 'Unassigned', employeeId: e.id, labelType: 'Earning', label: '', amount: '', remark: '' })} className="mt-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Add Earning / Deduction</button>}
                            </td></tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-sm font-black text-slate-900">Total Salary: <span className="font-mono">{fmtMoney(total, draft.currency)}</span></div>
            <div className="flex gap-2">
              {!locked && <button type="button" onClick={() => save('Draft')} className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer">Save Draft</button>}
              {!locked && <button type="button" onClick={() => save('Posted')} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">Save &amp; Post</button>}
              {locked && <span className="text-xs text-slate-500">This run is posted and read-only.</span>}
            </div>
          </div>
        </div>

        {addLine && (
          <Modal title="Add Earning / Deduction" onClose={() => setAddLine(null)} footer={<>
            <button type="button" onClick={() => setAddLine(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
            <button type="button" onClick={() => {
              const emp = active.find((e) => e.id === addLine.employeeId);
              const amt = Number(addLine.amount);
              if (!emp || !addLine.label || !Number.isFinite(amt) || amt <= 0) return setMsg('Choose an employee, a label and a positive amount.');
              setDraft({ ...draft, lines: [...draft.lines, { id: `${emp.id}-m${Date.now()}`, employeeId: emp.id, employeeName: emp.fullName, department: emp.department || 'Unassigned', labelType: addLine.labelType, label: addLine.label, amount: amt, remark: addLine.remark }] });
              setOpen({ ...open, [emp.id]: true });
              setAddLine(null);
            }} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer">Add</button>
          </>}>
            <Field label="Department"><select value={addLine.department} onChange={(e) => { const first = staff.find((s) => (s.department || 'Unassigned') === e.target.value); setAddLine({ ...addLine, department: e.target.value, employeeId: first?.id || '' }); }} className={inputCls}>{depts.map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Employee"><select value={addLine.employeeId} onChange={(e) => setAddLine({ ...addLine, employeeId: e.target.value })} className={inputCls}>{staff.filter((s) => (s.department || 'Unassigned') === addLine.department).map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></Field>
            <Field label="Label Type"><select value={addLine.labelType} onChange={(e) => setAddLine({ ...addLine, labelType: e.target.value as any, label: '' })} className={inputCls}><option value="Earning">Earning</option><option value="Deduction">Deduction</option></select></Field>
            <Field label="Label"><select value={addLine.label} onChange={(e) => setAddLine({ ...addLine, label: e.target.value })} className={inputCls}><option value="">Select...</option>{labels.filter((l) => l.type === (addLine.labelType === 'Earning' ? 'Earnings' : 'Deduction')).map((l) => <option key={l.id}>{l.description}</option>)}</select></Field>
            <Field label="Amount"><input type="number" min="0" step="0.01" value={addLine.amount} onChange={(e) => setAddLine({ ...addLine, amount: e.target.value })} className={inputCls} /></Field>
            <Field label="Remark"><input value={addLine.remark} onChange={(e) => setAddLine({ ...addLine, remark: e.target.value })} className={inputCls} /></Field>
          </Modal>
        )}
      </div>
    );
  }

  const sel = 'px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Salary Processing</h1>
          <p className="text-xs text-slate-500">Prepare, save and post monthly salary runs.</p>
        </div>
        <div className="flex gap-2">
          <Link prefetch={false} href="/backoffice/hr/employees" className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Personnel</Link>
          <button type="button" onClick={startNew} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> New</button>
        </div>
      </div>
      {(msg || error) && <div className={`p-2.5 rounded-xl border text-xs font-semibold ${error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>{error || msg}</div>}
      {storage === 'tenant_settings' && <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">Payroll runs are stored in tenant settings. Run lib/supabase/schema_hr_attendance_payroll.sql to move them to public.hr_payroll_runs.</div>}
      <div className={`${cardCls} p-3 flex flex-wrap gap-2 text-xs`}>
        <select value={fBrand} onChange={(e) => setFBrand(e.target.value)} className={sel}><option value="ALL">All Brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={fBranch} onChange={(e) => setFBranch(e.target.value)} className={sel}><option value="ALL">All Branches</option>{branches.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={fYear} onChange={(e) => setFYear(Number(e.target.value))} className={sel}>{[fYear - 1, fYear, fYear + 1].filter((v, i, a) => a.indexOf(v) === i).map((y) => <option key={y}>{y}</option>)}</select>
        <select value={fMonth} onChange={(e) => setFMonth(Number(e.target.value))} className={sel}><option value={0}>All Months</option>{MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      </div>
      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-xs text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-2.5 px-4">Year</th><th className="py-2.5 px-4">Month</th><th className="py-2.5 px-4">Brand</th><th className="py-2.5 px-4">Branch</th><th className="py-2.5 px-4">Processing Label</th><th className="py-2.5 px-4 text-right">Total Salary</th><th className="py-2.5 px-4">Saved at</th><th className="py-2.5 px-4">Status</th><th className="py-2.5 px-4 w-20"></th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={9} className="py-6 text-center text-slate-500">Loading...</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-slate-500">No payroll runs saved for these filters.</td></tr>}
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => { setDraft(JSON.parse(JSON.stringify(r))); setMsg(null); }}>
                <td className="py-2.5 px-4 font-mono">{r.year}</td><td className="py-2.5 px-4">{MONTH_NAMES[r.month - 1]}</td><td className="py-2.5 px-4">{r.brand}</td><td className="py-2.5 px-4">{r.branch}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{r.label}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold">{fmtMoney(r.totalSalary, r.currency)}</td>
                <td className="py-2.5 px-4 font-mono text-slate-600">{r.savedAt ? new Date(r.savedAt).toLocaleString('en-GB') : '-'}</td>
                <td className="py-2.5 px-4"><span className={`px-2.5 py-0.5 rounded-full font-bold ${r.status === 'Posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span></td>
                <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  {r.status !== 'Posted' && <button type="button" onClick={async () => { if (window.confirm('Delete this draft run?')) setMsg((await deleteRun(r.id)).message); }} className="text-rose-600 cursor-pointer" aria-label="Delete run"><Trash2 className="w-3.5 h-3.5" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
