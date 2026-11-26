'use client';

import React, { useMemo, useState } from 'react';
import { Search, Check, X as XIcon } from 'lucide-react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { TIME_OFF_REASONS, TimeOffRequest, daysInclusive, useHrEmployees, ymd } from '@/lib/hrTenantData';

export default function HrTimeOffManager() {
  const { employees, loading } = useHrEmployees();
  const [requests, setRequests, status] = useTenantFlag<TimeOffRequest[]>('hr_time_off', []);
  const year = new Date().getFullYear();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [message, setMessage] = useState<string | null>(null);

  const today = ymd(new Date());
  const [form, setForm] = useState({ startDate: today, endDate: today, reason: TIME_OFF_REASONS[0], type: 'Full Day' as 'Full Day' | 'Partial', hoursOff: 4, paid: 'Yes' as 'Yes' | 'No', notes: '' });
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [applied, setApplied] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const active = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const daysOffFor = (empId: string) => {
    const approved = requests
      .filter((r) => r.employeeId === empId && r.status === 'Approved' && r.startDate.startsWith(String(year)))
      .reduce((s, r) => s + r.days, 0);
    const emp = employees.find((e) => e.id === empId);
    const scheduled = (emp?.schedule?.daysOff || []).filter((d) => d.startDate.startsWith(String(year))).reduce((s, d) => s + daysInclusive(d.startDate, d.endDate), 0);
    return approved + scheduled;
  };

  const list = active.filter((e) => !search.trim() || (e.fullName || '').toLowerCase().includes(search.trim().toLowerCase()) || (e.department || '').toLowerCase().includes(search.trim().toLowerCase()));
  const selected = active.find((e) => e.id === selectedId) || null;
  const days = daysInclusive(form.startDate, form.endDate);

  const submit = () => {
    setMessage(null);
    if (!selected) return setMessage('Select an employee first.');
    if (!form.startDate || !form.endDate || days <= 0) return setMessage('End date must be on or after the start date.');
    if (!form.reason) return setMessage('Select a reason.');
    const req: TimeOffRequest = {
      id: `TO-${Date.now()}`,
      employeeId: selected.id,
      employeeName: selected.fullName,
      department: selected.department || '',
      startDate: form.startDate,
      endDate: form.endDate,
      days,
      reason: form.reason,
      type: form.type,
      hoursOff: form.type === 'Partial' ? form.hoursOff : undefined,
      paid: form.paid,
      notes: form.notes,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setRequests((prev) => [req, ...prev]);
    setForm({ ...form, notes: '' });
    setMessage('Request submitted and waiting for approval.');
  };

  const decide = (id: string, statusValue: 'Approved' | 'Rejected') =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: statusValue, decidedAt: new Date().toISOString() } : r)));

  const inRange = (r: TimeOffRequest) => (!applied.from || r.endDate >= applied.from) && (!applied.to || r.startDate <= applied.to);
  const pending = requests.filter((r) => r.status === 'Pending' && inRange(r));
  const history = requests.filter((r) => r.status !== 'Pending' && inRange(r) && (!selected || r.employeeId === selected.id));

  const input = 'w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">Time Off Requests</h1>
        <p className="text-xs text-slate-500">Create, approve and review employee time off. Approved requests appear in the Schedule Overview and Schedule Manager.</p>
      </div>
      {(message || status.error) && (
        <div className={`p-2.5 rounded-xl border text-xs font-semibold ${status.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>{status.error || message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left pane: employees */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none" />
          </div>
          <div className="grid grid-cols-12 px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <span className="col-span-6">Employee Name</span>
            <span className="col-span-4">Department</span>
            <span className="col-span-2 text-right">Days Off {year}</span>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
            {loading && <div className="p-4 text-xs text-slate-500">Loading employees...</div>}
            {!loading && list.length === 0 && <div className="p-4 text-xs text-slate-500">No active employees found.</div>}
            {list.map((e) => (
              <button type="button" key={e.id} onClick={() => setSelectedId(e.id)} className={`w-full grid grid-cols-12 px-3 py-2 text-xs text-left cursor-pointer hover:bg-slate-50 ${selectedId === e.id ? 'bg-blue-50' : ''}`}>
                <span className="col-span-6 font-bold text-slate-900 truncate">{e.fullName}</span>
                <span className="col-span-4 text-slate-600 truncate">{e.department || '-'}</span>
                <span className="col-span-2 text-right font-mono font-bold">{daysOffFor(e.id)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right pane */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit">
            {(['pending', 'history'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t === 'pending' ? 'New & Pending Requests' : 'Request History'}
              </button>
            ))}
          </div>

          {tab === 'pending' && (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 space-y-3 text-xs">
                <div className="font-extrabold text-slate-900">Create New Request {selected ? <span className="text-blue-700">- {selected.fullName}</span> : <span className="text-slate-400">(select an employee on the left)</span>}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate < e.target.value ? e.target.value : form.endDate })} className={input} /></div>
                  <div className="space-y-1"><label className="font-semibold text-slate-600">End Date</label><input type="date" value={form.endDate} min={form.startDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={input} /></div>
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Nb. Of Days</label><div className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold">{days}</div></div>
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Select Reason</label>
                    <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={input}>{TIME_OFF_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                  </div>
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'Full Day' | 'Partial' })} className={input}><option>Full Day</option><option>Partial</option></select>
                  </div>
                  {form.type === 'Partial' && (
                    <div className="space-y-1"><label className="font-semibold text-slate-600">Hours Off</label><input type="number" min={1} max={12} value={form.hoursOff} onChange={(e) => setForm({ ...form, hoursOff: Number(e.target.value) })} className={input} /></div>
                  )}
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Paid</label>
                    <select value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value as 'Yes' | 'No' })} className={input}><option>Yes</option><option>No</option></select>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-4"><label className="font-semibold text-slate-600">Notes / Details</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={input} /></div>
                </div>
                <div className="flex justify-end"><button type="button" onClick={submit} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">Submit Request</button></div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1"><label className="font-semibold text-slate-600">Start Date</label><input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={input} /></div>
                  <div className="space-y-1"><label className="font-semibold text-slate-600">End Date</label><input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={input} /></div>
                  <button type="button" onClick={() => setApplied({ from: filterFrom, to: filterTo })} className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">Filter</button>
                  <button type="button" onClick={() => { setFilterFrom(''); setFilterTo(''); setApplied({ from: '', to: '' }); }} className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer">Reset</button>
                </div>
                <div className="font-extrabold text-slate-900">Pending Requests ({pending.length})</div>
                <table className="w-full border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2 px-3 text-left">Employee</th><th className="py-2 px-3 text-left">Dates</th><th className="py-2 px-3 text-right">Days</th><th className="py-2 px-3 text-left">Reason</th><th className="py-2 px-3 text-left">Paid</th><th className="py-2 px-3 text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {pending.length === 0 && <tr><td colSpan={6} className="py-5 px-3 text-center text-slate-500">No pending requests.</td></tr>}
                    {pending.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.employeeName}<div className="font-normal text-slate-500">{r.department}</div></td>
                        <td className="py-2 px-3 font-mono">{r.startDate} → {r.endDate}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{r.days}</td>
                        <td className="py-2 px-3">{r.reason}{r.notes && <div className="text-slate-500">{r.notes}</div>}</td>
                        <td className="py-2 px-3">{r.paid}</td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex gap-1.5">
                            <button type="button" onClick={() => decide(r.id, 'Approved')} className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1 cursor-pointer"><Check className="w-3 h-3" /> Approve</button>
                            <button type="button" onClick={() => decide(r.id, 'Rejected')} className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold inline-flex items-center gap-1 cursor-pointer"><XIcon className="w-3 h-3" /> Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 text-xs space-y-2">
              <div className="font-extrabold text-slate-900">Request History {selected ? `- ${selected.fullName}` : '(all employees)'}</div>
              <table className="w-full border-collapse">
                <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2 px-3 text-left">Employee</th><th className="py-2 px-3 text-left">Dates</th><th className="py-2 px-3 text-right">Days</th><th className="py-2 px-3 text-left">Reason</th><th className="py-2 px-3 text-left">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 && <tr><td colSpan={5} className="py-5 px-3 text-center text-slate-500">No decided requests yet.</td></tr>}
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.employeeName}</td>
                      <td className="py-2 px-3 font-mono">{r.startDate} → {r.endDate}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{r.days}</td>
                      <td className="py-2 px-3">{r.reason}</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full font-bold ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
