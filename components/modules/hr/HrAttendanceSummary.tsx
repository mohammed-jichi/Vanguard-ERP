'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fingerprint, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useAttendanceLogs } from '@/lib/hrAttendanceData';
import { MONTH_SHORT, TimeOffRequest, dayStatus, useHrEmployees, ymd } from '@/lib/hrTenantData';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { MONTH_NAMES } from '@/lib/hrPayrollData';
import { Modal, Field, inputCls, cardCls } from './hrUi';

export default function HrAttendanceSummary() {
  const router = useRouter();
  const { employees } = useHrEmployees();
  const { logs, loading, error, storage, importRows } = useAttendanceLogs();
  const [timeOff] = useTenantFlag<TimeOffRequest[]>('hr_time_off', []);

  const now = new Date();
  const [brand, setBrand] = useState('ALL');
  const [branch, setBranch] = useState('ALL');
  const [emp, setEmp] = useState('ALL');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showFilter, setShowFilter] = useState(false);
  const [allTime, setAllTime] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [modal, setModal] = useState<null | 'sync' | 'excel'>(null);
  const [message, setMessage] = useState<string | null>(null);

  const active = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const brands = Array.from(new Set(active.map((e) => e.brand).filter(Boolean)));
  const branches = Array.from(new Set(active.map((e) => e.branch).filter(Boolean)));

  const staff = active.filter((e) => (brand === 'ALL' || e.brand === brand) && (branch === 'ALL' || e.branch === branch) && (emp === 'ALL' || e.id === emp));

  const rows = useMemo(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    return staff.map((e) => {
      const mine = logs.filter((l) => {
        if (l.employeeId !== e.id) return false;
        const d = ymd(new Date(l.punchIn));
        if (!allTime) return (!from || d >= from) && (!to || d <= to);
        const dt = new Date(l.punchIn);
        return dt.getFullYear() === year && dt.getMonth() === month;
      });
      const total = mine.reduce((s, l) => s + l.durationHours, 0);
      let expected = 0;
      if (allTime) for (let d = 1; d <= dim; d++) expected += dayStatus(e, ymd(new Date(year, month, d)), timeOff).hours;
      else if (from && to) for (let d = new Date(`${from}T00:00:00`); d <= new Date(`${to}T00:00:00`); d.setDate(d.getDate() + 1)) expected += dayStatus(e, ymd(d), timeOff).hours;
      return { e, total: Math.round(total * 100) / 100, expected: Math.round(expected * 100) / 100, overtime: Math.round(Math.max(0, total - expected) * 100) / 100 };
    });
  }, [staff, logs, year, month, allTime, from, to, timeOff]);

  // Synchronize modal
  const [sync, setSync] = useState({ brand: 'ALL', branch: 'ALL', year, month });
  const runSync = async () => {
    setMessage('Looking for back-office punches...');
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const { resolveTenantUuid } = await import('@/lib/productCatalogService');
      void resolveTenantUuid;
      setMessage('No back-office punch source is connected for this tenant yet - use Import From Excel to load attendance.');
    } catch (e: any) {
      setMessage(e?.message || String(e));
    }
    setModal(null);
  };

  // Excel import modal
  const [xl, setXl] = useState({ brand: '', branch: '', fileName: '', busy: false });
  const [xlRows, setXlRows] = useState<any[]>([]);
  const onFile = async (file?: File | null) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['xlsx', 'xls', 'csv'].includes(ext)) return setMessage('Use an .xlsx, .xls or .csv file.');
    const XLSX = await import('xlsx');
    const wb = ext === 'csv' ? XLSX.read(await file.text(), { type: 'string', cellDates: true }) : XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const sheet: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pick = (r: any, names: string[]) => { for (const k of Object.keys(r)) if (names.includes(norm(k))) return r[k]; return ''; };
    const toIso = (v: any) => { if (!v) return ''; const d = v instanceof Date ? v : new Date(v); return isNaN(d.getTime()) ? '' : d.toISOString(); };
    const parsed = sheet
      .map((r) => {
        const idRaw = String(pick(r, ['employeeid', 'id', 'empid', 'employeecode', 'code'])).trim();
        const nameRaw = String(pick(r, ['employee', 'employeename', 'name'])).trim();
        const found = active.find((e) => e.id === idRaw || (e as any).attendanceMachineId === idRaw || (nameRaw && e.fullName.toLowerCase() === nameRaw.toLowerCase()));
        let pin = toIso(pick(r, ['punchin', 'in', 'checkin', 'timein', 'clockin']));
        let pout = toIso(pick(r, ['punchout', 'out', 'checkout', 'timeout', 'clockout']));
        const date = pick(r, ['date', 'day']);
        if (!pin && date) pin = toIso(`${date instanceof Date ? ymd(date) : date}`);
        return found && pin ? { employeeId: found.id, employeeName: found.fullName, brand: xl.brand || found.brand, branch: xl.branch || found.branch, punchIn: pin, punchOut: pout || null, durationHours: Number(pick(r, ['duration', 'hours', 'durationhours'])) || 0, source: 'excel' } : null;
      })
      .filter(Boolean);
    setXlRows(parsed as any[]);
    setXl((s) => ({ ...s, fileName: file.name }));
    setMessage(`${parsed.length} of ${sheet.length} rows matched an active employee.`);
  };
  const runExcelImport = async () => {
    if (!xlRows.length) return setMessage('Choose a file with at least one matching row first.');
    setXl((s) => ({ ...s, busy: true }));
    const r = await importRows(xlRows);
    setMessage(r.message);
    setXl({ brand: '', branch: '', fileName: '', busy: false });
    setXlRows([]);
    if (r.ok) setModal(null);
  };

  const sel = 'px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Attendance Summary</h1>
          <p className="text-xs text-slate-500">Hours worked vs expected hours per employee, from attendance punches and saved schedules.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => router.push('/backoffice/hr/attendance-log')} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Fingerprint className="w-3.5 h-3.5" /> Attendance Tracking</button>
          <button type="button" onClick={() => { setSync({ brand: 'ALL', branch: 'ALL', year, month }); setModal('sync'); }} className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Synchronize With Attendance</button>
          <button type="button" onClick={() => setModal('excel')} className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><FileSpreadsheet className="w-3.5 h-3.5" /> Import From Excel</button>
        </div>
      </div>
      {(message || error) && <div className={`p-2.5 rounded-xl border text-xs font-semibold ${error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>{error || message}</div>}
      {storage === 'tenant_settings' && <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">Attendance is stored in tenant settings. Run lib/supabase/schema_hr_attendance_payroll.sql to move it to public.hr_attendance_logs.</div>}

      <div className={`${cardCls} p-3 flex flex-wrap items-end gap-2 text-xs`}>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={sel}><option value="ALL">All Brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className={sel}><option value="ALL">All Branches</option>{branches.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={emp} onChange={(e) => setEmp(e.target.value)} className={sel}><option value="ALL">All Employees</option>{active.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={sel}>{[year - 1, year, year + 1].filter((v, i, a) => a.indexOf(v) === i).map((y) => <option key={y}>{y}</option>)}</select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={sel}>{MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
        <button type="button" onClick={() => setShowFilter((v) => !v)} className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">Filter</button>
        {showFilter && (
          <>
            <select value={allTime ? 'all' : 'range'} onChange={(e) => setAllTime(e.target.value === 'all')} className={sel}><option value="all">All Time</option><option value="range">Date Range</option></select>
            {!allTime && (<>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={sel} />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={sel} />
            </>)}
            <button type="button" onClick={() => { setBrand('ALL'); setBranch('ALL'); setEmp('ALL'); setAllTime(true); setFrom(''); setTo(''); setYear(now.getFullYear()); setMonth(now.getMonth()); }} className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold cursor-pointer">Reset</button>
          </>
        )}
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-xs text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-2.5 px-4">Employee</th><th className="py-2.5 px-4">Year</th><th className="py-2.5 px-4">Month</th><th className="py-2.5 px-4 text-right">Total Hours</th><th className="py-2.5 px-4 text-right">Expected Hours</th><th className="py-2.5 px-4 text-right">Overtime</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={6} className="py-6 text-center text-slate-500">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">No active employees match these filters.</td></tr>}
            {rows.map((r) => (
              <tr key={r.e.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-900">{r.e.fullName}</td>
                <td className="py-2.5 px-4 font-mono">{year}</td>
                <td className="py-2.5 px-4">{MONTH_SHORT[month]}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold">{r.total}</td>
                <td className="py-2.5 px-4 text-right font-mono">{r.expected}</td>
                <td className={`py-2.5 px-4 text-right font-mono font-bold ${r.overtime > 0 ? 'text-amber-700' : 'text-slate-500'}`}>{r.overtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link prefetch={false} href="/backoffice/hr/attendance-log" className="hidden">log</Link>

      {modal === 'sync' && (
        <Modal title="Import Attendance from Backoffice" onClose={() => setModal(null)} footer={<>
          <button type="button" onClick={() => setModal(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={runSync} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer">Import</button>
        </>}>
          <Field label="Brand"><select value={sync.brand} onChange={(e) => setSync({ ...sync, brand: e.target.value })} className={inputCls}><option value="ALL">All Brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Branch"><select value={sync.branch} onChange={(e) => setSync({ ...sync, branch: e.target.value })} className={inputCls}><option value="ALL">All Branches</option>{branches.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Year"><select value={sync.year} onChange={(e) => setSync({ ...sync, year: Number(e.target.value) })} className={inputCls}>{[year - 1, year, year + 1].map((y) => <option key={y}>{y}</option>)}</select></Field>
            <Field label="Month"><select value={sync.month} onChange={(e) => setSync({ ...sync, month: Number(e.target.value) })} className={inputCls}>{MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}</select></Field>
          </div>
        </Modal>
      )}

      {modal === 'excel' && (
        <Modal title="Import Attendance from Excel" onClose={() => setModal(null)} footer={<>
          <button type="button" onClick={() => setModal(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
          <button type="button" disabled={xl.busy} onClick={runExcelImport} className="px-4 py-1.5 bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer">{xl.busy ? 'Importing...' : 'Import'}</button>
        </>}>
          <Field label="Select Brand"><select value={xl.brand} onChange={(e) => setXl({ ...xl, brand: e.target.value })} className={inputCls}><option value="">Use employee brand</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="Branch"><select value={xl.branch} onChange={(e) => setXl({ ...xl, branch: e.target.value })} className={inputCls}><option value="">Use employee branch</option>{branches.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="File (.xlsx, .xls, .csv)">
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} className={inputCls} />
            <p className="text-slate-500 mt-1">Columns: Employee (name or ID), Punch In, Punch Out{xl.fileName ? ` - loaded ${xl.fileName}: ${xlRows.length} usable rows` : ''}.</p>
          </Field>
        </Modal>
      )}
    </div>
  );
}
