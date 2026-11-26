'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { DEFAULT_LABELS, EarningDeductionLabel, FREQUENCIES, LabelRate, LabelType, PaymentSetting } from '@/lib/hrPayrollData';
import { Modal, Field, Pager, usePaged, inputCls, cardCls } from './hrUi';

export default function HrPaymentSettings() {
  const [settings, setSettings, status] = useTenantFlag<PaymentSetting[]>('hr_payment_settings', []);
  const [labels] = useTenantFlag<EarningDeductionLabel[]>('hr_earnings_deductions', DEFAULT_LABELS);
  const [rates, setRates] = useTenantFlag<LabelRate[]>('hr_label_rates', []);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Earnings' | 'Deduction'>('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const [editor, setEditor] = useState<null | { item: PaymentSetting; isNew: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateModal, setRateModal] = useState<null | { rate: string; description: string }>(null);

  const labelOptions = (t: LabelType) => labels.filter((l) => l.type === t).map((l) => l.description);

  const rows = useMemo(
    () =>
      settings.filter(
        (s) =>
          (typeFilter === 'All' || s.labelType === typeFilter) &&
          (labelFilter === 'All' || s.labelName === labelFilter) &&
          (!search.trim() || `${s.labelName} ${s.remarks}`.toLowerCase().includes(search.trim().toLowerCase()))
      ),
    [settings, typeFilter, labelFilter, search]
  );
  const paged = usePaged(rows, 10);

  const openNew = () => setEditor({ isNew: true, item: { id: `ps-${Date.now()}`, labelType: 'Earnings', labelName: '', rateId: '', rate: 0, method: 'Fixed Amount', frequency: 'Monthly', remarks: '' } });

  const save = () => {
    if (!editor) return;
    const it = editor.item;
    if (!it.labelName) return setError(`Select ${it.labelType === 'Earnings' ? 'an earning' : 'a deduction'}.`);
    if (!it.rateId) return setError('Select a rate type (use + to create one).');
    if (!it.frequency) return setError('Select a frequency.');
    setSettings((prev) => (editor.isNew ? [...prev, it] : prev.map((s) => (s.id === it.id ? it : s))));
    setEditor(null);
    setError(null);
  };

  const addRate = () => {
    if (!rateModal) return;
    const n = Number(rateModal.rate);
    if (!Number.isFinite(n) || n <= 0) return;
    const r: LabelRate = { id: `rate-${Date.now()}`, rate: n, description: rateModal.description.trim() };
    setRates((prev) => [...prev, r]);
    if (editor) setEditor({ ...editor, item: { ...editor.item, rateId: r.id, rate: r.rate } });
    setRateModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900">Payment Settings</h1>
          <p className="text-xs text-slate-500">Rates applied to employees in payroll: fixed amounts or percentages of base salary.</p>
        </div>
        <button type="button" onClick={openNew} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> New</button>
      </div>
      {status.error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">{status.error}</div>}

      <div className={`${cardCls} overflow-hidden`}>
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Remarks or Label" className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none w-64" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setLabelFilter('All'); }} className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs font-bold">
            <option value="All">All</option><option value="Earnings">Earnings</option><option value="Deduction">Deductions</option>
          </select>
          {typeFilter !== 'All' && (
            <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs">
              <option value="All">{typeFilter === 'Earnings' ? 'Select Earnings' : 'Select Deductions'}</option>
              {labelOptions(typeFilter).map((l) => <option key={l}>{l}</option>)}
            </select>
          )}
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-2.5 px-4 w-12">#</th><th className="py-2.5 px-4">Label Name</th><th className="py-2.5 px-4">Type</th><th className="py-2.5 px-4">Calculation Method</th><th className="py-2.5 px-4 text-right">Rate</th><th className="py-2.5 px-4">Frequency</th><th className="py-2.5 px-4">Remarks</th><th className="py-2.5 px-4 w-24 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {status.loading && <tr><td colSpan={8} className="py-6 text-center text-slate-500">Loading...</td></tr>}
            {!status.loading && paged.slice.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-500">No payment settings yet.</td></tr>}
            {paged.slice.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-mono text-slate-500">{(paged.page - 1) * 10 + i + 1}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900">{s.labelName}</td>
                <td className="py-2.5 px-4"><span className={`px-2.5 py-0.5 rounded-full font-bold ${s.labelType === 'Earnings' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{s.labelType}</span></td>
                <td className="py-2.5 px-4">{s.method}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold">{s.rate}{s.method === 'Percentage' ? '%' : ''}</td>
                <td className="py-2.5 px-4">{s.frequency}</td>
                <td className="py-2.5 px-4 text-slate-600">{s.remarks}</td>
                <td className="py-2.5 px-4 text-right"><div className="inline-flex gap-1.5">
                  <button type="button" onClick={() => setEditor({ isNew: false, item: { ...s } })} aria-label="Edit" className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => window.confirm('Delete this payment setting?') && setSettings((p) => p.filter((x) => x.id !== s.id))} aria-label="Delete" className="w-7 h-7 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
      </div>

      {editor && (
        <Modal title={editor.isNew ? 'Add Payment Setting' : 'Edit Payment Setting'} onClose={() => { setEditor(null); setError(null); }} footer={<>
          <button type="button" onClick={() => { setEditor(null); setError(null); }} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={save} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">Save</button>
        </>}>
          {error && <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">{error}</div>}
          <Field label="Label Type*">
            <select value={editor.item.labelType} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, labelType: e.target.value as LabelType, labelName: '' } })} className={inputCls}>
              <option value="Earnings">Earnings</option><option value="Deduction">Deduction</option>
            </select>
          </Field>
          <Field label={editor.item.labelType === 'Earnings' ? 'Earnings*' : 'Deductions*'}>
            <select value={editor.item.labelName} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, labelName: e.target.value } })} className={inputCls}>
              <option value="">Select...</option>
              {labelOptions(editor.item.labelType).map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Rate Type*">
            <div className="flex gap-2">
              <select value={editor.item.rateId} onChange={(e) => { const r = rates.find((x) => x.id === e.target.value); setEditor({ ...editor, item: { ...editor.item, rateId: e.target.value, rate: r ? r.rate : 0 } }); }} className={inputCls}>
                <option value="">Select...</option>
                {rates.map((r) => <option key={r.id} value={r.id}>{r.rate}{r.description ? ` - ${r.description}` : ''}</option>)}
              </select>
              <button type="button" onClick={() => setRateModal({ rate: '', description: '' })} className="w-9 rounded-xl bg-slate-900 text-white font-bold cursor-pointer" title="Add Label Rate">+</button>
            </div>
          </Field>
          <Field label="Calculation Method">
            <div className="flex gap-4">
              {(['Fixed Amount', 'Percentage'] as const).map((m) => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer"><input type="radio" checked={editor.item.method === m} onChange={() => setEditor({ ...editor, item: { ...editor.item, method: m } })} /> {m}</label>
              ))}
            </div>
          </Field>
          <Field label="Frequency*">
            <select value={editor.item.frequency} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, frequency: e.target.value } })} className={inputCls}>{FREQUENCIES.map((f) => <option key={f}>{f}</option>)}</select>
          </Field>
          <Field label="Remarks"><textarea rows={2} value={editor.item.remarks} onChange={(e) => setEditor({ ...editor, item: { ...editor.item, remarks: e.target.value } })} className={inputCls} /></Field>
        </Modal>
      )}

      {rateModal && (
        <Modal title="Add Label Rate" onClose={() => setRateModal(null)} footer={<>
          <button type="button" onClick={() => setRateModal(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-xl font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={addRate} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer">Save</button>
        </>}>
          <Field label="Enter Rate*"><input type="number" min="0" step="0.01" value={rateModal.rate} onChange={(e) => setRateModal({ ...rateModal, rate: e.target.value })} className={inputCls} /></Field>
          <Field label="Enter Rate Description"><input value={rateModal.description} onChange={(e) => setRateModal({ ...rateModal, description: e.target.value })} className={inputCls} /></Field>
        </Modal>
      )}
    </div>
  );
}
