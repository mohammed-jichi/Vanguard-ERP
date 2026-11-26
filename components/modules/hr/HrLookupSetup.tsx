'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Download } from 'lucide-react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { HrLookupItem, useHrEmployees } from '@/lib/hrTenantData';

type Kind = 'departments' | 'designations' | 'roles';

const CONFIG: Record<Kind, { key: string; title: string; noun: string; nameHeader: string; hint: string }> = {
  departments: { key: 'hr_departments', title: 'Internal Departments', noun: 'Department', nameHeader: 'Department Name', hint: 'Departments available for employees, schedules and reports.' },
  designations: { key: 'hr_designations', title: 'Payroll Designations', noun: 'Designation', nameHeader: 'Designation', hint: 'Job titles used in employee records and payroll.' },
  roles: { key: 'hr_roles', title: 'Employees Role', noun: 'Role', nameHeader: 'Description', hint: 'Roles that can be assigned to employees and used in schedules.' }
};

export default function HrLookupSetup({ kind }: { kind: Kind }) {
  const cfg = CONFIG[kind];
  const [items, setItems, status] = useTenantFlag<HrLookupItem[]>(cfg.key, []);
  const { employees } = useHrEmployees();
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<null | { item: HrLookupItem; isNew: boolean }>(null);
  const [message, setMessage] = useState<string | null>(null);

  const field: 'department' | 'designation' | null = kind === 'departments' ? 'department' : kind === 'designations' ? 'designation' : null;
  const activeEmployees = employees.filter((e) => e.active !== false);
  const countFor = (name: string) => (field ? activeEmployees.filter((e) => String((e as any)[field] || '').toLowerCase() === name.toLowerCase()).length : 0);

  const rows = useMemo(
    () =>
      [...items]
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name))
        .filter((i) => !search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase())),
    [items, search]
  );

  const save = () => {
    if (!editor) return;
    const name = editor.item.name.trim();
    if (!name) {
      setMessage(`${cfg.noun} name is required.`);
      return;
    }
    if (items.some((i) => i.id !== editor.item.id && i.name.toLowerCase() === name.toLowerCase())) {
      setMessage(`A ${cfg.noun.toLowerCase()} named "${name}" already exists.`);
      return;
    }
    const clean = { ...editor.item, name, sortOrder: Number(editor.item.sortOrder) || 0 };
    setItems((prev) => (editor.isNew ? [...prev, clean] : prev.map((i) => (i.id === clean.id ? clean : i))));
    setEditor(null);
    setMessage(null);
  };

  const remove = (item: HrLookupItem) => {
    const n = countFor(item.name);
    const warn = n > 0 ? `${n} active employee(s) use "${item.name}". Delete it anyway?` : `Delete "${item.name}"?`;
    if (window.confirm(warn)) setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const importFromEmployees = () => {
    if (!field) return;
    const existing = new Set(items.map((i) => i.name.toLowerCase()));
    const found = Array.from(new Set(activeEmployees.map((e) => String((e as any)[field] || '').trim()).filter(Boolean))).filter((n) => !existing.has(n.toLowerCase()));
    if (found.length === 0) {
      setMessage(`No new ${cfg.noun.toLowerCase()} values were found in employee records.`);
      return;
    }
    setItems((prev) => [...prev, ...found.map((name, i) => ({ id: `${kind}-${Date.now()}-${i}`, name, sortOrder: prev.length + i + 1 }))]);
    setMessage(`Imported ${found.length} ${cfg.noun.toLowerCase()} value(s) from employee records.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">{cfg.title}</h1>
          <p className="text-xs text-slate-500">{cfg.hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {field && (
            <button type="button" onClick={importFromEmployees} className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Import from employees
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditor({ isNew: true, item: { id: `${kind}-${Date.now()}`, name: '', sortOrder: items.length + 1 } })}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      {(message || status.error) && (
        <div className={`p-2.5 rounded-xl border text-xs font-semibold ${status.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>{status.error || message}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full max-w-sm pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400" />
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4 w-14">#</th>
              <th className="py-2.5 px-4">{cfg.nameHeader}</th>
              {kind === 'departments' && <th className="py-2.5 px-4 w-28 text-right">Sort Order</th>}
              {kind === 'departments' && <th className="py-2.5 px-4 w-36 text-right">Employee Count</th>}
              <th className="py-2.5 px-4 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {status.loading && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-slate-500">Loading...</td>
              </tr>
            )}
            {!status.loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                  {items.length === 0 ? `No ${cfg.noun.toLowerCase()} entries yet. Use New${field ? ' or Import from employees' : ''}.` : 'Nothing matches your search.'}
                </td>
              </tr>
            )}
            {rows.map((r, idx) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{r.name}</td>
                {kind === 'departments' && <td className="py-2.5 px-4 text-right font-mono">{r.sortOrder}</td>}
                {kind === 'departments' && <td className="py-2.5 px-4 text-right font-mono font-bold">{countFor(r.name)}</td>}
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button type="button" onClick={() => setEditor({ isNew: false, item: { ...r } })} aria-label="Edit" className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => remove(r)} aria-label="Delete" className="w-7 h-7 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 text-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{editor.isNew ? 'New' : 'Edit'} {cfg.noun}</h3>
              <button type="button" onClick={() => setEditor(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">{cfg.nameHeader}</label>
                <input autoFocus value={editor.item.name} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, name: e.target.value } })} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600" />
              </div>
              {kind === 'departments' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Sort Order</label>
                  <input type="number" value={editor.item.sortOrder} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, sortOrder: Number(e.target.value) } })} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600" />
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setEditor(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
              <button type="button" onClick={save} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
