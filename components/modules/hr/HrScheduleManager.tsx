'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, FileSpreadsheet, Download } from 'lucide-react';
import ScheduleDesigner from './ScheduleDesigner';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { MONTH_SHORT, TimeOffRequest, dayStatus, shortShift, useHrEmployees, ymd } from '@/lib/hrTenantData';

export default function HrScheduleManager() {
  const params = useSearchParams();
  const initialEmployeeId = params.get('employeeId') || undefined;
  const { employees, loading } = useHrEmployees();
  const [timeOff] = useTenantFlag<TimeOffRequest[]>('hr_time_off', []);

  const [tab, setTab] = useState<'team' | 'manage'>(initialEmployeeId ? 'manage' : 'team');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dept, setDept] = useState('ALL');
  const [emp, setEmp] = useState('ALL');
  const [brand, setBrand] = useState('ALL');
  const [branch, setBranch] = useState('ALL');

  const active = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const opts = (pick: (e: (typeof active)[number]) => string) => Array.from(new Set(active.map(pick).filter(Boolean)));
  const depts = opts((e) => e.department);
  const brands = opts((e) => e.brand);
  const branches = opts((e) => e.branch);

  const staff = useMemo(
    () => active.filter((e) => (dept === 'ALL' || e.department === dept) && (emp === 'ALL' || e.id === emp) && (brand === 'ALL' || e.brand === brand) && (branch === 'ALL' || e.branch === branch)),
    [active, dept, emp, brand, branch]
  );
  const dim = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: dim }, (_, i) => i + 1);

  const grid = useMemo(
    () =>
      staff.map((e) => {
        const cells = days.map((d) => dayStatus(e, ymd(new Date(year, month, d)), timeOff));
        return { e, cells, hours: Math.round(cells.reduce((s, c) => s + c.hours, 0) * 100) / 100 };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staff, year, month, timeOff]
  );

  const exportFile = async (format: 'xlsx' | 'csv') => {
    const XLSX = await import('xlsx');
    const header = ['Employee', 'Department', 'Branch', 'Timed Hours', ...days.map(String)];
    const rows = grid.map((g) => [g.e.fullName, g.e.department || '', g.e.branch || '', g.hours, ...g.cells.map((c) => (c.status === 'working' ? c.label : c.label))]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTH_SHORT[month]} ${year}`);
    const name = `team-schedule-${year}-${String(month + 1).padStart(2, '0')}.${format}`;
    XLSX.writeFile(wb, name, { bookType: format });
  };

  const sel = 'px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';

  const Filters = (
    <div className="hr-no-print flex flex-wrap items-end gap-2 text-xs">
      <div className="space-y-1"><label className="font-semibold text-slate-600 block">Department</label>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className={sel}><option value="ALL">All Departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select></div>
      <div className="space-y-1"><label className="font-semibold text-slate-600 block">Employee</label>
        <select value={emp} onChange={(e) => setEmp(e.target.value)} className={sel}><option value="ALL">All Employees</option>{active.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select></div>
      <div className="space-y-1"><label className="font-semibold text-slate-600 block">Brand</label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={sel}><option value="ALL">All Brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></div>
      <div className="space-y-1"><label className="font-semibold text-slate-600 block">Branch</label>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className={sel}><option value="ALL">All Branches</option>{branches.map((b) => <option key={b}>{b}</option>)}</select></div>
      <div className="space-y-1"><label className="font-semibold text-slate-600 block">Year</label><div className="flex items-center gap-1"><button type="button" onClick={() => setYear((y) => y - 1)} className="px-2 py-1.5 border border-slate-300 rounded-lg font-bold cursor-pointer">&lt;</button><span className="px-3 py-1.5 font-mono font-bold">{year}</span><button type="button" onClick={() => setYear((y) => y + 1)} className="px-2 py-1.5 border border-slate-300 rounded-lg font-bold cursor-pointer">&gt;</button></div></div>
    </div>
  );

  const Months = (
    <div className="hr-no-print flex flex-wrap gap-1">
      {MONTH_SHORT.map((m, i) => (
        <button key={m} type="button" onClick={() => setMonth(i)} className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${i === month ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m}</button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <style>{`@media print { body * { visibility: hidden !important; } .hr-print-area, .hr-print-area * { visibility: visible !important; } .hr-print-area { position: absolute; left: 0; top: 0; width: 100%; } .hr-no-print { display: none !important; } @page { size: A4 landscape; margin: 8mm; } }`}</style>
      <div className="hr-no-print">
        <h1 className="text-xl font-black text-slate-900">Schedule Manager</h1>
        <p className="text-xs text-slate-500">View the whole team&apos;s monthly schedule or manage an individual employee&apos;s shifts, days off and yearly overview.</p>
      </div>

      <div className="hr-no-print flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit">
        {(['team', 'manage'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t === 'team' ? 'Team Schedule' : 'Manage Schedules'}
          </button>
        ))}
      </div>

      {tab === 'team' && (
        <div className="space-y-3">
          <div className="hr-no-print bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 space-y-3">
            {Filters}
            {Months}
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Print</button>
              <button type="button" onClick={() => exportFile('xlsx')} className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><FileSpreadsheet className="w-3.5 h-3.5" /> Export to Excel</button>
              <button type="button" onClick={() => exportFile('csv')} className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download className="w-3.5 h-3.5" /> CSV</button>
            </div>
          </div>

          <div className="hr-print-area bg-white border border-slate-200 rounded-2xl shadow-2xs p-3 overflow-x-auto">
            <div className="font-extrabold text-slate-900 text-sm mb-2">Team Schedule - {MONTH_SHORT[month]} {year}</div>
            <table className="text-[10.5px] border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold">
                  <th className="border border-slate-200 px-2 py-1.5 text-left sticky left-0 bg-slate-50">Employee</th>
                  <th className="border border-slate-200 px-2 py-1.5">Timed Hours</th>
                  {days.map((d) => <th key={d} className="border border-slate-200 px-1 py-1.5 min-w-[44px]">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={dim + 2} className="p-4 text-center text-slate-500">Loading...</td></tr>}
                {!loading && grid.length === 0 && <tr><td colSpan={dim + 2} className="p-4 text-center text-slate-500">No active employees match these filters.</td></tr>}
                {grid.map((g) => (
                  <tr key={g.e.id}>
                    <td className="border border-slate-200 px-2 py-1 font-bold text-slate-900 whitespace-nowrap sticky left-0 bg-white">{g.e.fullName}<div className="font-normal text-slate-500">{g.e.department}</div></td>
                    <td className="border border-slate-200 px-2 py-1 text-center font-mono font-bold">{g.hours}</td>
                    {g.cells.map((c, i) => (
                      <td key={i} className={`border border-slate-200 px-0.5 py-1 text-center whitespace-nowrap ${c.status === 'leave' ? 'bg-amber-50 text-amber-800 font-bold' : c.status === 'off' ? 'bg-slate-100 text-slate-400' : c.status === 'working' ? 'text-emerald-800' : 'text-slate-300'}`}>
                        {c.status === 'working' ? shortShift(c.label) : c.status === 'none' ? '-' : c.label}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'manage' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-3">
          <ScheduleDesigner initialEmployeeId={initialEmployeeId} />
        </div>
      )}
    </div>
  );
}
