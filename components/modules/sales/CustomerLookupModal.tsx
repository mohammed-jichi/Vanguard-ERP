'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Users, Phone, MapPin, Building, ChevronRight, DollarSign } from 'lucide-react';

export interface CustomerLookupItem {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  category?: string;
  priceTier?: string;
  balance?: number;
  openBalance?: number;
  creditLimit?: number;
  salesman?: string;
}

interface CustomerLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
  customers: CustomerLookupItem[];
  onSelectCustomer: (customer: CustomerLookupItem) => void;
}

export default function CustomerLookupModal({
  isOpen,
  onClose,
  initialSearch = '',
  customers,
  onSelectCustomer
}: CustomerLookupModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialSearch || '');
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialSearch]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const validCustomers = customers.filter((c) => c && c.name && c.name.trim() !== '');
    if (!term) return validCustomers;
    return validCustomers.filter((c) => {
      const id = (c.id || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const company = (c.company || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const address = (c.address || '').toLowerCase();
      const tier = (c.category || c.priceTier || '').toLowerCase();
      return (
        id.includes(term) ||
        name.includes(term) ||
        company.includes(term) ||
        phone.includes(term) ||
        address.includes(term) ||
        tier.includes(term)
      );
    });
  }, [customers, searchTerm]);

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCustomers]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCustomers.length - 1 ? prev + 1 : prev));
      scrollIndexIntoView(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollIndexIntoView(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCustomers.length > 0 && selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
        onSelectCustomer(filteredCustomers[selectedIndex]);
      }
    }
  };

  const scrollIndexIntoView = (index: number) => {
    if (!listContainerRef.current) return;
    const rows = listContainerRef.current.querySelectorAll('[data-customer-row]');
    if (rows[index]) {
      (rows[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white border border-slate-300 rounded-xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[85vh] overflow-hidden text-slate-800 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Registered Customers Directory
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {filteredCustomers.length} Accounts
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Select an enterprise customer account to load pricing tier, salesman, and address (↑↓ to navigate, Enter to select)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer ID, name, company, phone, city, or price tier..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* CUSTOMERS TABLE CONTAINER */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto min-h-[300px]">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Users className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No matching customers found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching with a customer name, ID, phone number, or city
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider sticky top-0 border-b border-slate-200 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-28">Customer ID</th>
                  <th className="py-2.5 px-3">Customer / Company Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Address / City</th>
                  <th className="py-2.5 px-3">Price Tier</th>
                  <th className="py-2.5 px-3 text-right">Open Balance</th>
                  <th className="py-2.5 px-3 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  const priceTier = cust.category || cust.priceTier || 'Retail Counter';
                  const openBal = cust.balance ?? cust.openBalance ?? 0;
                  return (
                    <tr
                      key={cust.id || idx}
                      data-customer-row
                      onClick={() => onSelectCustomer(cust)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted ? 'bg-emerald-50/80 text-emerald-950 font-medium' : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 text-[11px]">
                        {cust.id || 'CUST-001'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex flex-col">
                          <span>{cust.name}</span>
                          {cust.company && cust.company !== cust.name && (
                            <span className="text-[10px] text-slate-400 font-normal">{cust.company}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {cust.phone || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate" title={cust.address}>
                        {cust.address || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {priceTier}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={openBal > 0 ? 'text-amber-600' : 'text-emerald-700'}>
                          ${openBal.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCustomer(cust);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                            isHighlighted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <span>Select</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">↓</kbd> to
              navigate
            </span>
            <span>
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Enter</kbd>{' '}
              to select
            </span>
            <span>
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Esc</kbd> to
              close
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
