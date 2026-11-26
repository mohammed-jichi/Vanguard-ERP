'use client';

import React, { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:border-blue-600';
export const cardCls = 'bg-white border border-slate-200 rounded-2xl shadow-2xs';

export function Modal({ title, onClose, children, footer, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} border border-slate-200 text-xs max-h-[90vh] flex flex-col`}>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-3">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-semibold text-slate-600 block">{label}</label>
      {children}
    </div>
  );
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 text-xs text-slate-600">
      <span>{total} record(s)</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1 rounded-lg border border-slate-300 disabled:opacity-40 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <span className="font-mono font-bold">{page} / {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1 rounded-lg border border-slate-300 disabled:opacity-40 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

export function usePaged<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safe = Math.min(page, pages);
  const slice = useMemo(() => rows.slice((safe - 1) * pageSize, safe * pageSize), [rows, safe, pageSize]);
  return { page: safe, pages, slice, setPage, total: rows.length };
}

export function downloadBlob(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
