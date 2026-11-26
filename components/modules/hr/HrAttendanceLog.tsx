'use client';

import React, { useMemo, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { useAttendanceLogs } from '@/lib/hrAttendanceData';
import { useHrEmployees, ymd } from '@/lib/hrTenantData';
import { Modal, Pager, usePaged, cardCls, downloadBlob } from './hrUi';

const fmtDur = (h: number) => `${Math.floor(h)}h ${String(Math.round((h - Math.floor(h)) * 60)).padStart(2, '0')}m`;

export default function HrAttendanceLog() {
  const { employees } = useHrEmployees();
  const { logs, loading, error, storage } = useAttendanceLogs();
  const [brand, setBrand] = useState('ALL');
  const [branch, setBranch] = useState('ALL');
  const [emp, setEmp] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ brand: 'ALL', branch: 'ALL', emp: 'ALL', from: '', to: '' });
  const [report, setReport] = useState(false);

  const active = employees.filter((e) => e.active !== false);
  const brands = Array.from(new Set(active.map((e) => e.brand).filter(Boolean)));
  const branches = Array.from(new Set(active.map((e) => e.branch).filter(Boolean)));

  const rows = useMemo(
    () =>
      logs.filter((l) => {
        const d = ymd(new Date(l.punchIn));
        return (applied.brand === 'ALL' || l.brand === applied.brand) && (applied.branch === 'ALL' || l.branch === applied.branch) && (applied.emp === 'ALL' || l.employeeId === applied.emp) && (!applied.from || d >= applied.from) && (!applied.to || d <= applied.to);
      }),
    [logs, applied]
  );
  const paged = usePaged(rows, 15);

  const table = () => [['Employee', 'Branch', 'Punch In', 'Punch Out', 'Duration (hours)'], ...rows.map((l) => [l.employeeName || l.employeeId, l.branch, new Date(l.punchIn).toLocaleString('en-GB'), l.punchOut ? new Date(l.punchOut).toLocaleString('en-GB') : '', l.durationHours])];
  const exportFile = async (format: 'xlsx' | 'csv') => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(table());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Log');
    XLSX.writeFile(wb, `attendance-log.${format}`, { bookType: format });
  };
  const exportReportCsv = () => downloadBlob('punch-in-out-report.csv', table().map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));

  const sel = 'px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';
  return (
    <div className="space-y-4">
      <style>{`@media print { body * { visibility: hidden !important; } .hr-print-area, .hr-print-area * { visibility: visible !important; } .hr-print-area { position: absolute; left: 0; top: 0; width: 100%; } .hr-no-print { display: none !important; } }`}</style>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Attendance Log</h1>
          <p className="text-xs text-slate-500">Individual punch records and durations per employee.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setReport(true)} className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><FileText className="w-3.5 h-3.5" /> Punch In/Out Report</button>
          <button type="button" onClick={() => exportFile('xlsx')} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download className="w-3.5 h-3.5" /> Export</button>
          <button type="button" onClick={() => exportFile('csv')} className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer">CSV</button>
        </div>
      </div>
      {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">{error}</div>}
      {storage === 'tenant_settings' && <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">Attendance is stored in tenant settings. Run lib/supabase/schema_hr_attendance_payroll.sql to move it to public.hr_attendance_logs.</div>}

      <div className={`${cardCls} p-3 flex flex-wrap items-end gap-2 text-xs`}>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={sel}><option value="ALL">Brand</option>{brands.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className={sel}><option value="ALL">Branch</option>{branches.map((b) => <option key={b}>{b}</option>)}</select>
        <label className="flex items-center gap-1">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={sel} /></label>
        <label className="flex items-center gap-1">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={sel} /></label>
        <select value={emp} onChange={(e) => setEmp(e.target.value)} className={sel}><option value="ALL">All Employees</option>{active.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select>
        <button type="button" onClick={() => setApplied({ brand, branch, emp, from, to })} className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">Filter</button>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-xs text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-2.5 px-4">Employee</th><th className="py-2.5 px-4">Punch In</th><th className="py-2.5 px-4">Punch Out</th><th className="py-2.5 px-4 text-right">Duration</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Loading...</td></tr>}
            {!loading && paged.slice.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">No attendance records. Import punches from the Attendance Summary page.</td></tr>}
            {paged.slice.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-900">{l.employeeName || l.employeeId}<div className="font-normal text-slate-500">{l.branch}</div></td>
                <td className="py-2.5 px-4 font-mono">{new Date(l.punchIn).toLocaleString('en-GB')}</td>
                <td className="py-2.5 px-4 font-mono">{l.punchOut ? new Date(l.punchOut).toLocaleString('en-GB') : '-'}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold">{fmtDur(l.durationHours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
      </div>

      {report && (
        <Modal wide title="Punch In/Out Report" onClose={() => setReport(false)} footer={<>
          <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Print Report</button>
          <button type="button" onClick={exportReportCsv} className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"><Download className="w-3.5 h-3.5" /> Export Report</button>
        </>}>
          <div className="hr-print-area">
            <div className="font-extrabold text-slate-900 mb-2">Punch In/Out Report ({rows.length} records)</div>
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-slate-50 text-slate-600 font-bold"><th className="border border-slate-200 px-2 py-1 text-left">Employee</th><th className="border border-slate-200 px-2 py-1 text-left">Punch In</th><th className="border border-slate-200 px-2 py-1 text-left">Punch Out</th><th className="border border-slate-200 px-2 py-1 text-right">Hours</th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={4} className="border border-slate-200 px-2 py-4 text-center text-slate-500">No records for the applied filters.</td></tr>}
                {rows.slice(0, 500).map((l) => (
                  <tr key={l.id}><td className="border border-slate-200 px-2 py-1">{l.employeeName || l.employeeId}</td><td className="border border-slate-200 px-2 py-1 font-mono">{new Date(l.punchIn).toLocaleString('en-GB')}</td><td className="border border-slate-200 px-2 py-1 font-mono">{l.punchOut ? new Date(l.punchOut).toLocaleString('en-GB') : '-'}</td><td className="border border-slate-200 px-2 py-1 text-right font-mono">{l.durationHours}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
