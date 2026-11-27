'use client';

import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { CoaOption } from '@/lib/salesSetupShared';

interface Props {
  value: string;
  onChange: (code: string) => void;
  accounts: CoaOption[];
  placeholder?: string;
}

/** Searchable chart-of-accounts combobox that still accepts a custom typed code. */
function SalesAccountComboboxImpl({ value, onChange, accounts, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);
  const deferred = useDeferredValue(query);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const matches = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    const list = !q || q === value.toLowerCase() ? accounts : accounts.filter((a) => a.account_number.toLowerCase().includes(q) || a.account_name.toLowerCase().includes(q));
    return list.slice(0, 60);
  }, [accounts, deferred, value]);

  const pick = useCallback(
    (code: string) => {
      setQuery(code);
      onChange(code);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value.trim());
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && open) {
            e.preventDefault();
            setOpen(false);
          }
        }}
        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-[60] mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg text-xs">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-slate-500">Custom code: {query || '—'}</li>
          ) : (
            matches.map((a) => (
              <li
                key={a.account_number}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(a.account_number);
                }}
                className={`cursor-pointer px-3 py-1.5 hover:bg-blue-50 ${a.account_number === value ? 'bg-blue-50' : ''}`}
              >
                <span className="font-mono font-bold text-blue-700">{a.account_number}</span> <span className="text-slate-700">{a.account_name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default memo(SalesAccountComboboxImpl);
