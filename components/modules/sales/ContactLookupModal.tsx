'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, User, Phone, Building, Check, ArrowUpDown, ChevronRight } from 'lucide-react';
import { CRMContact } from '@/components/ContactsView';

interface ContactLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
  contacts: CRMContact[];
  onSelectContact: (contact: CRMContact) => void;
}

export default function ContactLookupModal({
  isOpen,
  onClose,
  initialSearch = '',
  contacts,
  onSelectContact
}: ContactLookupModalProps) {
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

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) => {
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      const company = (c.company || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const source = (c.source || '').toLowerCase();
      const stage = (c.pipelineStage || '').toLowerCase();
      const owner = (c.salesOwner || '').toLowerCase();
      const leadNum = String(c.leadNumber || '');
      return (
        fullName.includes(term) ||
        company.includes(term) ||
        phone.includes(term) ||
        source.includes(term) ||
        stage.includes(term) ||
        owner.includes(term) ||
        leadNum.includes(term)
      );
    });
  }, [contacts, searchTerm]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredContacts]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredContacts.length - 1 ? prev + 1 : prev));
      scrollIndexIntoView(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollIndexIntoView(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredContacts.length > 0 && selectedIndex >= 0 && selectedIndex < filteredContacts.length) {
        onSelectContact(filteredContacts[selectedIndex]);
      }
    }
  };

  const scrollIndexIntoView = (index: number) => {
    if (!listContainerRef.current) return;
    const rows = listContainerRef.current.querySelectorAll('[data-contact-row]');
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
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Registered Contacts Directory
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {filteredContacts.length} Available
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Select a contact person to populate Quotation or Sales details (Use ↑↓ arrows and Enter to select)
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
              placeholder="Search contact name, company, phone, stage, or owner..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
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

        {/* CONTACTS TABLE CONTAINER */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto min-h-[300px]">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <User className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No matching contacts found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching with a different name, phone number, or company
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider sticky top-0 border-b border-slate-200 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Sales Owner</th>
                  <th className="py-2.5 px-3 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
                  return (
                    <tr
                      key={contact.id || idx}
                      data-contact-row
                      onClick={() => onSelectContact(contact)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted ? 'bg-blue-50/80 text-blue-950 font-medium' : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                        {contact.leadNumber || idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </span>
                          <span>{fullName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {contact.company || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {contact.phone || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {contact.source || 'Direct'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            contact.pipelineStage === 'Closed Won'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : contact.pipelineStage === 'Quotation Sent'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {contact.pipelineStage || 'Lead'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {contact.salesOwner || 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectContact(contact);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                            isHighlighted
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
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
