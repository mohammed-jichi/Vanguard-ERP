'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { ScheduleTemplate, WEEK, emptyTemplateDays } from '@/lib/hrPayrollData';
import { Modal, Field, Pager, usePaged, inputCls, cardCls } from './hrUi';

export default function HrScheduleTemplates() {
  const [items, setItems, status] = useTenantFlag<ScheduleTemplate[]>('hr_schedule_templates', []);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<null | { item: ScheduleTemplate; isNew: boolean }>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => items.filter((i) => !search.trim() || `${i.name} ${i.code}`.toLowerCase().includes(search.trim().toLowerCase())), [items, search]);
  const paged = usePaged(rows, 10);

  const openNew = () => {
    const n = items.reduce((m, i) => Math.max(m, Number(i.code.replace(/\D/g, '')) || 0), 0) + 1;
    setEditor({ isNew: true, item: { id: `tpl-${Date.now()}`, name: '', code: `TPL-${String(n).padStart(3, '0')}`, days: emptyTemplateDays() } });
  };

  const setDay = (day: string, patch: Partial<{ active: boolean }>) => editor && setEditor({ ...editor, item: { ...editor.item, days: { ...editor.item.days, [day]: { ...editor.item.days[day], ...patch } } } });
  const setSlot = (day: string, idx: number, key: 'start' | 'end', value: string) => {
    if (!editor) return;
    const slots = editor.item.days[day].slots.map((s, i) => (i === idx ? { ...s, [key]: value } : s));
    setEditor({ ...editor, item: { ...editor.item, days: { ...editor.item.days, [day]: { ...editor.item.days[day], slots } } } });
  };
  const addSlot = (day: string) => editor && setEditor({ ...editor, item: { ...editor.item, days: { ...editor.item.days, [day]: { ...editor.item.days[day], slots: [...editor.item.days[day].slots, { start: '12:00', end: '16:00' }] } } } });
  const removeSlot = (day: string, idx: number) => editor && setEditor({ ...editor, item: { ...editor.item, days: { ...editor.item.days, [day]: { ...editor.item.days[day], slots: editor.item.days[day].slots.filter((_, i) => i !== idx) } } } });
  const applyAll = () => {
    if (!editor) return;
    const monday = editor.item.days.Monday;
    const days = Object.fromEntries(WEEK.map((d) => [d, editor.item.days[d].active ? { ...editor.item.days[d], slots: monday.slots.map((s) => ({ ...s })) } : editor.item.days[d]]));
    setEditor({ ...editor, item: { ...editor.item, days } });
  };

  const save = () => {
    if (!editor) return;
    const name = editor.item.name.trim();
    if (!name) return setError('Template Name is required.');
    if (items.some((i) => i.id !== editor.item.id && i.name.toLowerCase() === name.toLowerCase())) return setError('A template with this name already exists.');
    if (!WEEK.some((d) => editor.item.days[d].active)) return setError('Tick at least one working day.');
    const item = { ...editor.item, name };
    setItems((prev) => (editor.isNew ? [...prev, item] : prev.map((i) => (i.id === item.id ? item : i))));
    setEditor(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Schedule Templates</h1>
          <p className="text-xs text-slate-500">Reusable weekly shift patterns that can be applied to employees.</p>
        </div>
        <button type="button" onClick={openNew} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> New</button>
      </div>
      {status.error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">{status.error}</div>}

      <div className={`${cardCls} overflow-hidden`}>
        <div className="p-3 border-b border-slate-100 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="w-full max-w-sm pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none" />
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-2.5 px-4">Template Name</th><th className="py-2.5 px-4">Created Code</th><th className="py-2.5 px-4">Working Days</th><th className="py-2.5 px-4 w-28 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {status.loading && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Loading...</td></tr>}
            {!status.loading && paged.slice.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">No schedule templates yet. Use New to create one.</td></tr>}
            {paged.slice.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-900">{r.name}</td>
                <td className="py-2.5 px-4 font-mono text-slate-600">{r.code}</td>
                <td className="py-2.5 px-4 text-slate-600">{WEEK.filter((d) => r.days[d]?.active).map((d) => d.slice(0, 3)).join(', ')}</td>
                <td className="py-2.5 px-4 text-right"><div className="inline-flex gap-1.5">
                  <button type="button" onClick={() => setEditor({ isNew: false, item: JSON.parse(JSON.stringify(r)) })} aria-label="Edit" className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => window.confirm(`Delete template "${r.name}"?`) && setItems((p) => p.filter((i) => i.id !== r.id))} aria-label="Delete" className="w-7 h-7 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
      </div>

      {editor && (
        <Modal wide title={editor.isNew ? 'New Schedule Template' : 'Edit Schedule Template'} onClose={() => { setEditor(null); setError(null); }} footer={<>
          <button type="button" onClick={() => { setEditor(null); setError(null); }} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={save} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">Save</button>
        </>}>
          {error && <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">{error}</div>}
          <Field label="Template Name*"><input value={editor.item.name} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, name: e.target.value } })} className={inputCls} /></Field>
          <div className="space-y-2">
            {WEEK.map((day) => {
              const d = editor.item.days[day];
              return (
                <div key={day} className={`border rounded-xl p-2.5 ${d.active ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-32 font-bold text-slate-800 cursor-pointer"><input type="checkbox" checked={d.active} onChange={(e) => setDay(day, { active: e.target.checked })} className="w-4 h-4" /> {day}</label>
                    <div className="flex-1 space-y-1.5">
                      {d.slots.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="time" value={s.start} disabled={!d.active} onChange={(e) => setSlot(day, i, 'start', e.target.value)} className={`${inputCls} max-w-[130px]`} />
                          <span className="text-slate-400">-</span>
                          <input type="time" value={s.end} disabled={!d.active} onChange={(e) => setSlot(day, i, 'end', e.target.value)} className={`${inputCls} max-w-[130px]`} />
                          {i === 0 && <button type="button" disabled={!d.active} onClick={() => addSlot(day)} title="Add split shift" className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-40"><Plus className="w-3.5 h-3.5" /></button>}
                          {i > 0 && <button type="button" onClick={() => removeSlot(day, i)} className="w-7 h-7 rounded-lg border border-rose-200 text-rose-700 inline-flex items-center justify-center cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
                          {day === 'Monday' && i === 0 && <button type="button" onClick={applyAll} className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer">Apply to all</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
