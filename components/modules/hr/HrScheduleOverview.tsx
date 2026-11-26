'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { DOW, MONTH_SHORT, TimeOffRequest, dayStatus, daysInclusive, useHrEmployees, ymd } from '@/lib/hrTenantData';

const bar = (value: number, max: number, color = 'bg-blue-600') => (
  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
    <div className={`h-full ${color}`} style={{ width: `${max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0}%` }} />
  </div>
);

export default function HrScheduleOverview() {
  const { employees, loading } = useHrEmployees();
  const [timeOff] = useTenantFlag<TimeOffRequest[]>('hr_time_off', []);

  const [branch, setBranch] = useState('ALL');
  const [dept, setDept] = useState('ALL');
  const [date, setDate] = useState(ymd(new Date()));
  const [kpiModal, setKpiModal] = useState<null | { title: string; people: { id: string; name: string; dept: string; note: string }[] }>(null);
  const [attendance, setAttendance] = useState<{ rows: number; overtime: number; worked: number } | null>(null);

  useEffect(() => {
    fetch('/api/hr/attendance')
      .then((r) => r.json())
      .then((j) => {
        const rows: any[] = Array.isArray(j?.data) ? j.data : Array.isArray(j?.records) ? j.records : Array.isArray(j) ? j : [];
        const month = date.slice(0, 7);
        const mine = rows.filter((r) => String(r.date || r.punch_date || r.work_date || '').startsWith(month));
        setAttendance({
          rows: mine.length,
          overtime: mine.reduce((s, r) => s + (Number(r.overtime_hours ?? r.overtimeHours) || 0), 0),
          worked: mine.reduce((s, r) => s + (Number(r.worked_hours ?? r.workedHours) || 0), 0)
        });
      })
      .catch(() => setAttendance(null));
  }, [date]);

  const branches = useMemo(() => Array.from(new Set(employees.map((e) => e.branch).filter(Boolean))), [employees]);
  const depts = useMemo(() => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))), [employees]);
  const staff = useMemo(
    () => employees.filter((e) => e.active !== false && (branch === 'ALL' || e.branch === branch) && (dept === 'ALL' || e.department === dept)),
    [employees, branch, dept]
  );

  const d0 = new Date(`${date}T00:00:00`);
  const year = d0.getFullYear();
  const month = d0.getMonth();
  const dim = new Date(year, month + 1, 0).getDate();
  const dateOf = (day: number) => ymd(new Date(year, month, day));

  const today = useMemo(() => staff.map((e) => ({ e, s: dayStatus(e, date, timeOff) })), [staff, date, timeOff]);
  const scheduledToday = today.filter((x) => x.s.status === 'working');
  const leaveToday = today.filter((x) => x.s.status === 'leave');

  const month_ = useMemo(() => {
    const days = Array.from({ length: dim }, (_, i) => {
      const ds = dateOf(i + 1);
      let working = 0, off = 0, leave = 0;
      staff.forEach((e) => {
        const s = dayStatus(e, ds, timeOff).status;
        if (s === 'working') working++;
        else if (s === 'off') off++;
        else if (s === 'leave') leave++;
      });
      return { day: i + 1, ds, working, off, leave };
    });
    const upto = d0.getDate();
    const mtd = days.slice(0, upto);
    const distinct = new Set<string>();
    staff.forEach((e) => {
      for (let i = 0; i < upto; i++) if (dayStatus(e, dateOf(i + 1), timeOff).status === 'working') { distinct.add(e.id); break; }
    });
    return { days, mtdScheduled: distinct.size, mtdOff: mtd.reduce((s, d) => s + d.off + d.leave, 0) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, timeOff, date]);

  const monthStart = dateOf(1);
  const monthEnd = dateOf(dim);
  const leaveEntries = useMemo(() => {
    const out: { name: string; start: string; end: string; reason: string }[] = [];
    const ids = new Set(staff.map((e) => e.id));
    timeOff.filter((r) => r.status === 'Approved' && ids.has(r.employeeId) && r.endDate >= monthStart && r.startDate <= monthEnd).forEach((r) => out.push({ name: r.employeeName, start: r.startDate, end: r.endDate, reason: r.reason }));
    staff.forEach((e) => (e.schedule?.daysOff || []).filter((d) => d.approved !== false && d.endDate >= monthStart && d.startDate <= monthEnd).forEach((d) => out.push({ name: e.fullName, start: d.startDate, end: d.endDate, reason: d.reason })));
    return out.sort((a, b) => a.start.localeCompare(b.start));
  }, [staff, timeOff, monthStart, monthEnd]);

  const pending = timeOff.filter((r) => r.status === 'Pending');
  const tally = (rows: { key: string }[]) => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.key || 'Unspecified', (m.get(r.key || 'Unspecified') || 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };
  const shiftMix = tally(scheduledToday.map((x) => ({ key: x.s.label })));
  const deptMix = tally(scheduledToday.map((x) => ({ key: x.e.department })));
  const branchShifts = tally(scheduledToday.map((x) => ({ key: `${x.e.branch || 'No branch'} | ${x.s.label}` })));
  const unscheduled = today.filter((x) => x.s.status === 'none').length;

  const mtdLists = useMemo(() => {
    const upto = d0.getDate();
    const sched: typeof staff = [];
    const off: { e: (typeof staff)[number]; n: number }[] = [];
    staff.forEach((e) => {
      let w = 0, o = 0;
      for (let i = 1; i <= upto; i++) { const s = dayStatus(e, dateOf(i), timeOff).status; if (s === 'working') w++; else if (s === 'off' || s === 'leave') o++; }
      if (w > 0) sched.push(e);
      if (o > 0) off.push({ e, n: o });
    });
    return { sched, off };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, timeOff, date]);

  const card = 'bg-white border border-slate-200 rounded-2xl shadow-2xs p-4';
  const sel = 'px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Schedule Overview</h1>
        <p className="text-xs text-slate-500">Live staffing view computed from saved employee schedules, day-offs and approved time-off.</p>
      </div>

      <div className={`${card} flex flex-wrap items-end gap-3 text-xs`}>
        <div className="space-y-1"><label className="font-semibold text-slate-600 block">Select Branch</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={sel}><option value="ALL">All Branches</option>{branches.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
        <div className="space-y-1"><label className="font-semibold text-slate-600 block">Date</label>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={sel} /></div>
        <div className="space-y-1"><label className="font-semibold text-slate-600 block">All Departments</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className={sel}><option value="ALL">All Departments</option>{depts.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
        <button type="button" onClick={() => { setBranch('ALL'); setDept('ALL'); setDate(ymd(new Date())); }} className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Reset Filters</button>
        {loading && <span className="text-slate-500">Loading...</span>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Scheduled Staff (Day)', value: scheduledToday.length, tone: 'text-emerald-700', people: scheduledToday.map((x) => ({ id: x.e.id, name: x.e.fullName, dept: x.e.department || '', note: x.s.label })) },
          { label: 'Leave / Vacation (Day)', value: leaveToday.length, tone: 'text-amber-700', people: leaveToday.map((x) => ({ id: x.e.id, name: x.e.fullName, dept: x.e.department || '', note: 'On leave' })) },
          { label: 'MTD Scheduled Staff', value: month_.mtdScheduled, tone: 'text-blue-700', people: mtdLists.sched.map((e) => ({ id: e.id, name: e.fullName, dept: e.department || '', note: 'Scheduled this month' })) },
          { label: 'MTD Off', value: month_.mtdOff, tone: 'text-slate-700', people: mtdLists.off.map((x) => ({ id: x.e.id, name: x.e.fullName, dept: x.e.department || '', note: `${x.n} day(s) off` })) }
        ].map((k) => (
          <button type="button" key={k.label} onClick={() => setKpiModal({ title: k.label, people: k.people })} className={`${card} text-left cursor-pointer hover:border-slate-300`}>
            <div className="text-[11px] font-semibold text-slate-500">{k.label}</div>
            <div className={`text-2xl font-black mt-1 ${k.tone}`}>{k.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Click to list employees</div>
          </button>
        ))}
      </div>
      {kpiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 text-xs max-h-[85vh] flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between"><h3 className="font-extrabold text-sm text-slate-900">{kpiModal.title} ({kpiModal.people.length})</h3><button type="button" onClick={() => setKpiModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">Close</button></div>
            <div className="p-5 overflow-y-auto divide-y divide-slate-100">
              {kpiModal.people.length === 0 && <div className="text-slate-500">No employees.</div>}
              {kpiModal.people.map((p) => (<div key={p.id} className="py-2 flex items-center justify-between gap-3"><span className="font-bold text-slate-900">{p.name}<span className="font-normal text-slate-500"> - {p.dept}</span></span><span className="font-mono text-slate-600">{p.note}</span></div>))}
            </div>
          </div>
        </div>
      )}      {staff.length === 0 && !loading && <div className={`${card} text-xs text-slate-500`}>No active employees match these filters. Add employees under Personnel and assign schedules in the Schedule Manager.</div>}
      {unscheduled > 0 && <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">{unscheduled} active employee(s) have no schedule assigned yet.</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Leave and Vacation Calendar - {MONTH_SHORT[month]} {year}</div>
          {leaveEntries.length === 0 ? <div className="text-xs text-slate-500">No approved leave this month.</div> : (
            <div className="divide-y divide-slate-100 text-xs max-h-56 overflow-y-auto">
              {leaveEntries.map((l, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-900">{l.name}</span>
                  <span className="font-mono text-slate-600">{l.start === l.end ? l.start : `${l.start} → ${l.end}`} ({daysInclusive(l.start, l.end)}d)</span>
                  <span className="text-slate-500 truncate">{l.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Branch Shifts (today)</div>
          {branchShifts.length === 0 ? <div className="text-xs text-slate-500">Nobody is scheduled on this date.</div> : (
            <div className="space-y-1.5 text-xs">{branchShifts.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3"><span className="truncate text-slate-700 font-medium">{k}</span><span className="font-mono font-bold">{v}</span></div>)}</div>
          )}
        </div>

        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Time-Off Alerts</div>
          {pending.length === 0 ? <div className="text-xs text-slate-500">No pending time-off requests.</div> : (
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-amber-800">{pending.length} request(s) waiting for a decision</div>
              {pending.slice(0, 6).map((r) => <div key={r.id} className="flex justify-between gap-3"><span className="font-bold text-slate-900">{r.employeeName}</span><span className="font-mono text-slate-600">{r.startDate} ({r.days}d)</span></div>)}
            </div>
          )}
        </div>

        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Overtime / Attendance Summary - {MONTH_SHORT[month]}</div>
          {attendance && attendance.rows > 0 ? (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-slate-500">Records</div><div className="font-black text-lg">{attendance.rows}</div></div>
              <div><div className="text-slate-500">Worked hrs</div><div className="font-black text-lg">{attendance.worked.toFixed(1)}</div></div>
              <div><div className="text-slate-500">Overtime hrs</div><div className="font-black text-lg text-amber-700">{attendance.overtime.toFixed(1)}</div></div>
            </div>
          ) : <div className="text-xs text-slate-500">No attendance records for this month.</div>}
        </div>

        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Shift Staffing Mix</div>
          {shiftMix.length === 0 ? <div className="text-xs text-slate-500">No scheduled shifts today.</div> : (
            <div className="space-y-2 text-xs">{shiftMix.map(([k, v]) => <div key={k}><div className="flex justify-between"><span className="font-medium text-slate-700">{k}</span><span className="font-mono font-bold">{v}</span></div>{bar(v, shiftMix[0][1])}</div>)}</div>
          )}
        </div>

        <div className={card}>
          <div className="font-extrabold text-slate-900 text-sm mb-2">Department Mix</div>
          {deptMix.length === 0 ? <div className="text-xs text-slate-500">No scheduled staff today.</div> : (
            <div className="space-y-2 text-xs">{deptMix.map(([k, v]) => <div key={k}><div className="flex justify-between"><span className="font-medium text-slate-700">{k}</span><span className="font-mono font-bold">{v}</span></div>{bar(v, deptMix[0][1], 'bg-emerald-600')}</div>)}</div>
          )}
        </div>
      </div>

      <div className={card}>
        <div className="font-extrabold text-slate-900 text-sm mb-3">Monthly Calendar Planner - {MONTH_SHORT[month]} {year}</div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {month_.days.map((d) => {
            const isSel = d.day === d0.getDate();
            return (
              <button type="button" key={d.day} onClick={() => setDate(d.ds)} className={`text-left rounded-xl border p-2 cursor-pointer transition-colors ${isSel ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <div className="flex items-center justify-between"><span className="font-black text-sm text-slate-900">{String(d.day).padStart(2, '0')}</span><span className="text-[10px] text-slate-400">{DOW[new Date(`${d.ds}T00:00:00`).getDay()]}</span></div>
                <div className="mt-1 text-[11px] space-y-0.5">
                  <div className="text-emerald-700 font-semibold">{d.working} scheduled</div>
                  <div className="text-slate-500">{d.off} off</div>
                  {d.leave > 0 && <div className="text-amber-700 font-semibold">{d.leave} leave</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
