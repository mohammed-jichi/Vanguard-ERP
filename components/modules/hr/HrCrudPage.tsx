'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { Modal, Field, Pager, usePaged, inputCls, cardCls } from './hrUi';

export interface CrudColumn<T> {
  header: string;
  render: (row: T, idx: number) => React.ReactNode;
  sort?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
}

export interface CrudField<T> {
  key: keyof T & string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
  readOnlyOnEdit?: boolean;
  help?: string;
}

interface Props<T extends { id: string }> {
  title: string;
  subtitle?: string;
  noun: string;
  flagKey: string;
  defaults: T[];
  columns: CrudColumn<T>[];
  fields: CrudField<T>[];
  makeNew: (items: T[]) => T;
  searchText: (row: T) => string;
  filter?: (row: T) => boolean;
  toolbarExtra?: (ctx: { items: T[]; setItems: (v: T[] | ((p: T[]) => T[])) => void; setMessage: (m: string | null) => void }) => React.ReactNode;
  validate?: (item: T, items: T[], isNew: boolean) => string | null;
  deleteWarning?: (item: T) => string | null;
  newLabel?: string;
  pageSize?: number;
  emptyText?: string;
  addTitle?: string;
  editTitle?: string;
}

export default function HrCrudPage<T extends { id: string }>(p: Props<T>) {
  const [items, setItems, status] = useTenantFlag<T[]>(p.flagKey, p.defaults);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [editor, setEditor] = useState<null | { item: T; isNew: boolean }>(null);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    let r = items.filter((i) => (!p.filter || p.filter(i)) && (!search.trim() || p.searchText(i).toLowerCase().includes(search.trim().toLowerCase())));
    if (sort) {
      const get = p.columns[sort.col].sort;
      if (get) r = [...r].sort((a, b) => (get(a) > get(b) ? sort.dir : get(a) < get(b) ? -sort.dir : 0));
    }
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, sort, p.filter]);
  const paged = usePaged(rows, p.pageSize || 10);

  const save = () => {
    if (!editor) return;
    for (const f of p.fields) {
      if (f.required && !String((editor.item as any)[f.key] ?? '').trim()) return setMessage(`${f.label.replace('*', '')} is required.`);
    }
    const err = p.validate ? p.validate(editor.item, items, editor.isNew) : null;
    if (err) return setMessage(err);
    setItems((prev) => (editor.isNew ? [...prev, editor.item] : prev.map((i) => (i.id === editor.item.id ? editor.item : i))));
    setEditor(null);
    setMessage(null);
  };

  const remove = (item: T) => {
    const warn = p.deleteWarning ? p.deleteWarning(item) : null;
    if (window.confirm(warn || `Delete this ${p.noun.toLowerCase()}?`)) setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">{p.title}</h1>
          {p.subtitle && <p className="text-xs text-slate-500">{p.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {p.toolbarExtra?.({ items, setItems, setMessage })}
          <button type="button" onClick={() => setEditor({ isNew: true, item: p.makeNew(items) })} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> {p.newLabel || 'New'}
          </button>
        </div>
      </div>

      {(message || status.error) && (
        <div className={`p-2.5 rounded-xl border text-xs font-semibold ${status.error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>{status.error || message}</div>
      )}

      <div className={`${cardCls} overflow-hidden`}>
        <div className="p-3 border-b border-slate-100 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full max-w-sm pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400" />
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              {p.columns.map((c, i) => (
                <th key={c.header} className={`py-2.5 px-4 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''}`}>
                  {c.sort ? (
                    <button type="button" onClick={() => setSort((s) => (s && s.col === i ? { col: i, dir: (s.dir * -1) as 1 | -1 } : { col: i, dir: 1 }))} className="inline-flex items-center gap-1 uppercase font-bold cursor-pointer">
                      {c.header} <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  ) : c.header}
                </th>
              ))}
              <th className="py-2.5 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {status.loading && <tr><td colSpan={p.columns.length + 1} className="py-6 px-4 text-center text-slate-500">Loading...</td></tr>}
            {!status.loading && paged.slice.length === 0 && <tr><td colSpan={p.columns.length + 1} className="py-8 px-4 text-center text-slate-500">{p.emptyText || `No ${p.noun.toLowerCase()} entries yet.`}</td></tr>}
            {paged.slice.map((r, idx) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                {p.columns.map((c) => (
                  <td key={c.header} className={`py-2.5 px-4 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''}`}>{c.render(r, (paged.page - 1) * (p.pageSize || 10) + idx)}</td>
                ))}
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button type="button" onClick={() => setEditor({ isNew: false, item: { ...r } })} aria-label="Edit" className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => remove(r)} aria-label="Delete" className="w-7 h-7 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
      </div>

      {editor && (
        <Modal
          title={editor.isNew ? p.addTitle || `Add ${p.noun}` : p.editTitle || `Edit ${p.noun}`}
          onClose={() => { setEditor(null); setMessage(null); }}
          footer={<>
            <button type="button" onClick={() => { setEditor(null); setMessage(null); }} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
            <button type="button" onClick={save} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">Save</button>
          </>}
        >
          {message && <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">{message}</div>}
          {p.fields.map((f) => {
            const val = (editor.item as any)[f.key];
            const set = (v: any) => setEditor({ ...editor, item: { ...editor.item, [f.key]: v } });
            const locked = f.readOnlyOnEdit && !editor.isNew;
            return (
              <Field key={f.key} label={f.label}>
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!val} onChange={(e) => set(e.target.checked)} className="w-4 h-4" /> <span>{f.help || ''}</span></label>
                ) : f.type === 'select' ? (
                  <select value={val ?? ''} onChange={(e) => set(e.target.value)} disabled={locked} className={inputCls}>{(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select>
                ) : (
                  <input type={f.type} value={val ?? ''} disabled={locked} onChange={(e) => set(f.type === 'number' ? Number(e.target.value) : e.target.value)} className={`${inputCls} ${locked ? 'bg-slate-100 cursor-not-allowed' : ''}`} />
                )}
              </Field>
            );
          })}
        </Modal>
      )}
    </div>
  );
}
