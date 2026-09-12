'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Home,
  MessageSquare,
  Settings,
  HelpCircle,
  Grid,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export interface CRMContact {
  id: string;
  leadNumber: number;
  brand: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  country: string;
  email: string;
  otherPhone?: string;
  source: string;
  leadStatus: string;
  pipelineStage: string;
  expectedValue: number;
  expectedCloseDate?: string;
  nextActionAt?: string;
  externalLeadId?: string;
  notes?: string;
  salesOwner: string;
  createdBy: string;
  dateCreated: string;
}

export const ARAB_AND_NORTH_AFRICA_COUNTRIES = [
  'All Countries',
  'Lebanon',
  'Syria',
  'Jordan',
  'Iraq',
  'Palestine',
  'Egypt',
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Yemen',
  'Morocco',
  'Algeria',
  'Tunisia',
  'Libya',
  'Sudan',
  'Mauritania',
  'Somalia',
  'Djibouti',
  'Comoros'
];

export const SALES_OWNER_OPTIONS = [
  'Mohammed Jichi',
  'My Contacts',
  'All Sales Owners',
  'Unassigned'
];

export const DATE_FILTER_OPTIONS = [
  'All Dates',
  'Today',
  'This Week',
  'This Month',
  'Last 30 Days',
  'This Year'
];

export const LEAD_SOURCE_OPTIONS = [
  'Select Lead Source',
  'WhatsApp',
  'Customer',
  'Facebook',
  'Google Ads',
  'Instagram',
  'Self Generated',
  'TikTok',
  'Website'
];

export const LEAD_STATUS_OPTIONS = [
  'New',
  'Qualified',
  'Contacted',
  'Unqualified',
  'Cold'
];

export const PIPELINE_STAGE_OPTIONS = [
  'New Lead',
  'Serious Lead',
  'Qualified',
  'Meeting Scheduled',
  'Meeting Done',
  'Demo Scheduled',
  'Demo Done',
  'Quotation Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
  'Not Qualified'
];

export const INITIAL_CONTACTS: CRMContact[] = [
  {
    id: 'cnt-37',
    leadNumber: 37,
    brand: 'Zeit w zaytoun ljanoub',
    firstName: 'Mr Jad',
    lastName: 'Youssef',
    phone: '70569641',
    company: '',
    country: 'Lebanon',
    email: 'jad.youssef@example.com',
    otherPhone: '',
    source: 'WhatsApp',
    leadStatus: 'Qualified',
    pipelineStage: 'Quotation Sent',
    expectedValue: 0.50,
    expectedCloseDate: '2026-09-15',
    nextActionAt: '2026-09-10 14:00',
    externalLeadId: 'WA-70569641',
    notes: 'Inquired about organic extra virgin olive oil 250ml sample quotation via WhatsApp.',
    salesOwner: 'Mohammed Jichi',
    createdBy: 'Mohammed Jichi',
    dateCreated: '31 Jul 2026 15:51'
  }
];

export default function ContactsView() {
  // Contacts data state synced with localStorage
  const [contacts, setContacts] = useState<CRMContact[]>(INITIAL_CONTACTS);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Zeit w zaytoun ljanoub');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedSalesOwner, setSelectedSalesOwner] = useState('Mohammed Jichi');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Dates');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    brand: 'Zeit w zaytoun ljanoub',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    country: 'Lebanon',
    email: '',
    otherPhone: '',
    source: 'Select Lead Source',
    leadStatus: 'New',
    pipelineStage: 'New Lead',
    expectedValue: '0',
    expectedCloseDate: '',
    nextActionAt: '',
    externalLeadId: '',
    notes: ''
  });

  // Delete Confirmation State
  const [deletingContact, setDeletingContact] = useState<CRMContact | null>(null);

  // Notification
  const [notice, setNotice] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanguard_crm_contacts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setContacts(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vanguard_crm_contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingContactId(null);
    setFormData({
      brand: 'Zeit w zaytoun ljanoub',
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      country: 'Lebanon',
      email: '',
      otherPhone: '',
      source: 'Select Lead Source',
      leadStatus: 'New',
      pipelineStage: 'New Lead',
      expectedValue: '0',
      expectedCloseDate: '',
      nextActionAt: '',
      externalLeadId: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal (Audio 5: "القلم هيدا هي Edit تفتح صفحة الـ Edit")
  const handleOpenEdit = (contact: CRMContact) => {
    setModalMode('edit');
    setEditingContactId(contact.id);
    setFormData({
      brand: contact.brand || 'Zeit w zaytoun ljanoub',
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      company: contact.company || '',
      country: contact.country || 'Lebanon',
      email: contact.email || '',
      otherPhone: contact.otherPhone || '',
      source: contact.source || 'Select Lead Source',
      leadStatus: contact.leadStatus || 'New',
      pipelineStage: contact.pipelineStage || 'New Lead',
      expectedValue: contact.expectedValue?.toString() || '0',
      expectedCloseDate: contact.expectedCloseDate || '',
      nextActionAt: contact.nextActionAt || '',
      externalLeadId: contact.externalLeadId || '',
      notes: contact.notes || ''
    });
    setIsModalOpen(true);
  };

  // Handle Save (Create or Edit)
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone.trim()) {
      alert('Please fill in required fields: First Name and Phone');
      return;
    }

    if (modalMode === 'create') {
      const nextNum = contacts.length > 0 ? Math.max(...contacts.map(c => c.leadNumber || 0)) + 1 : 1;
      const newContact: CRMContact = {
        id: `cnt-${Date.now()}`,
        leadNumber: nextNum,
        brand: formData.brand,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        country: formData.country,
        email: formData.email.trim(),
        otherPhone: formData.otherPhone?.trim() || '',
        source: formData.source === 'Select Lead Source' ? 'Self Generated' : formData.source,
        leadStatus: formData.leadStatus,
        pipelineStage: formData.pipelineStage,
        expectedValue: parseFloat(formData.expectedValue) || 0,
        expectedCloseDate: formData.expectedCloseDate,
        nextActionAt: formData.nextActionAt,
        externalLeadId: formData.externalLeadId,
        notes: formData.notes,
        salesOwner: 'Mohammed Jichi',
        createdBy: 'Mohammed Jichi',
        dateCreated: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };
      setContacts([newContact, ...contacts]);
      showNotification(`Contact "${newContact.firstName} ${newContact.lastName}" created successfully!`);
    } else if (modalMode === 'edit' && editingContactId) {
      setContacts(prev =>
        prev.map(c => {
          if (c.id === editingContactId) {
            return {
              ...c,
              brand: formData.brand,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              phone: formData.phone.trim(),
              company: formData.company.trim(),
              country: formData.country,
              email: formData.email.trim(),
              otherPhone: formData.otherPhone?.trim() || '',
              source: formData.source === 'Select Lead Source' ? c.source : formData.source,
              leadStatus: formData.leadStatus,
              pipelineStage: formData.pipelineStage,
              expectedValue: parseFloat(formData.expectedValue) || 0,
              expectedCloseDate: formData.expectedCloseDate,
              nextActionAt: formData.nextActionAt,
              externalLeadId: formData.externalLeadId,
              notes: formData.notes
            };
          }
          return c;
        })
      );
      showNotification(`Contact updated successfully!`);
    }

    setIsModalOpen(false);
  };

  // Handle Delete (Audio 5: "وعندك Delete")
  const handleDeleteConfirm = () => {
    if (deletingContact) {
      setContacts(prev => prev.filter(c => c.id !== deletingContact.id));
      showNotification(`Contact "${deletingContact.firstName} ${deletingContact.lastName}" deleted.`);
      setDeletingContact(null);
    }
  };

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesPhone = (contact.phone || '').includes(q);
        const matchesCompany = (contact.company || '').toLowerCase().includes(q);
        const matchesSource = (contact.source || '').toLowerCase().includes(q);
        const matchesStage = (contact.pipelineStage || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCompany && !matchesSource && !matchesStage) {
          return false;
        }
      }

      // Country filter
      if (selectedCountry !== 'All Countries') {
        if (contact.country !== selectedCountry) return false;
      }

      // Sales owner filter
      if (selectedSalesOwner === 'Unassigned') {
        if (contact.salesOwner && contact.salesOwner !== 'Unassigned') return false;
      } else if (selectedSalesOwner !== 'All Sales Owners') {
        if (contact.salesOwner !== 'Mohammed Jichi' && contact.salesOwner !== selectedSalesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, searchTerm, selectedCountry, selectedSalesOwner]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. OMEGA HEADER (Matching Screenshot 1 exactly)                           */}
      {/* ========================================================================= */}
      <header className="bg-black text-white h-12 px-4 flex items-center justify-between text-xs border-b border-zinc-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-sm">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black font-extrabold text-xs">
              Ω
            </span>
            <span className="text-white tracking-widest font-semibold text-xs uppercase">Omega Software</span>
          </div>
        </div>

        <div className="text-zinc-300 text-xs font-medium">
          22901 - Zeit w zaytoun ljanoub
        </div>

        <div className="flex items-center gap-3 text-zinc-300">
          <Link href="/" title="Home" className="hover:text-white p-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <button type="button" title="Messages" className="hover:text-white p-1">
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Settings" className="hover:text-white p-1">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Help" className="hover:text-white p-1">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700 cursor-pointer hover:text-white">
            <User className="w-3.5 h-3.5" />
            <span className="text-xs">Jichi Mohammed</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>
          <button type="button" title="Apps" className="hover:text-white p-1 ml-1">
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY WITH SLIM ICON SIDEBAR & MAIN CONTENT                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex">
        {/* Slim Omega Sidebar (Matching Left Bar in Screenshot 1) */}
        <aside className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-4 text-slate-500 shadow-2xs select-none">
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Navigation Menu">
            <span className="text-base font-bold">≡</span>
          </button>
          <Link href="/" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded text-slate-700" title="Home">
            <Home className="w-4 h-4" />
          </Link>
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Cart / Orders">
            <span className="text-xs font-bold text-amber-600">🛒</span>
          </button>
          <button type="button" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Forms">
            <span className="text-xs font-bold text-slate-600">📋</span>
          </button>
          <Link href="/contacts" className="p-2 bg-blue-50 text-blue-600 rounded" title="Contacts / CRM">
            <User className="w-4 h-4" />
          </Link>
          <Link href="/quotations" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="Quotations Workstation">
            <span className="text-xs font-bold text-slate-600">📄</span>
          </Link>
          <Link href="/my-sales" className="p-2 hover:text-blue-600 hover:bg-slate-100 rounded" title="My Sales Dashboard">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </Link>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-5 overflow-y-auto">
          {/* Notice Toast */}
          {notice && (
            <div className="mb-4 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded shadow-lg flex items-center justify-between transition-all">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="text-white hover:text-zinc-200">✕</button>
            </div>
          )}

          {/* Title & Breadcrumb */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-[#1e3a8a]">Contacts</h1>
            <div className="text-[11px] text-slate-500 mt-0.5">
              <Link href="/" className="text-blue-600 hover:underline">Home</Link>
              <span className="mx-1 text-slate-400">/</span>
              <span>Contacts</span>
            </div>
          </div>

          {/* Action Row: Search input on left, My Sales & + New buttons on right (Screenshot 1) */}
          <div className="bg-white border border-slate-200 rounded p-4 mb-4 shadow-2xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons: My Sales + New */}
              <div className="flex items-center gap-2">
                {/* My Sales Button (Audio 2: "تكبس My Sales بتروح على My Sales Dashboard") */}
                <Link
                  href="/my-sales"
                  className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Go to Sales Rep Dashboard"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                  <span>My Sales</span>
                </Link>

                {/* + New Button (Screenshot 2: Opens New Contact modal) */}
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Create New Contact"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Filter Bar (Audio 4 & Screenshot 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
              {/* Brand filter */}
              <div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
                  <option value="Beirut Main Branch">Beirut Main Branch</option>
                  <option value="Sidon Regional Hub">Sidon Regional Hub</option>
                </select>
              </div>

              {/* Country filter (Audio 4: "كل الدول العربية وشمال أفريقيا ولبنان أكيد") */}
              <div>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {ARAB_AND_NORTH_AFRICA_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Owner filter (Audio 4: "مطرح محمد جشي فيك My Contacts، في All Sales Owners، في Unassigned") */}
              <div>
                <select
                  value={selectedSalesOwner}
                  onChange={(e) => setSelectedSalesOwner(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {SALES_OWNER_OPTIONS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates filter (Audio 4: "All Dates, Today, This Week, This Month, Last 30 Days, This Year") */}
              <div>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {DATE_FILTER_OPTIONS.map((df) => (
                    <option key={df} value={df}>
                      {df}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Button */}
              <div className="flex items-center gap-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => showNotification('Filters applied successfully.')}
                  className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                {/* Reset / Refresh Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCountry('All Countries');
                    setSelectedSalesOwner('Mohammed Jichi');
                    setSelectedDateFilter('All Dates');
                    showNotification('Filters reset.');
                  }}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 3. CONTACTS TABLE (Matching Screenshot 1 exactly)                       */}
          {/* ======================================================================= */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-[11px] whitespace-nowrap">
                    <th className="py-2.5 px-3"># ⇅</th>
                    <th className="py-2.5 px-3">First Name ⇅</th>
                    <th className="py-2.5 px-3">Last Name ⇅</th>
                    <th className="py-2.5 px-3">Company ⇅</th>
                    <th className="py-2.5 px-3">Source ⇅</th>
                    <th className="py-2.5 px-3">Lead Status ⇅</th>
                    <th className="py-2.5 px-3">Stage ⇅</th>
                    <th className="py-2.5 px-3">Sales Owner ⇅</th>
                    <th className="py-2.5 px-3">Phone ⇅</th>
                    <th className="py-2.5 px-3">Date Created ⇅</th>
                    <th className="py-2.5 px-3">Created By ⇅</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        No contacts found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-600">{c.leadNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span className="bg-blue-100/70 text-blue-900 px-1 py-0.5 rounded">
                            {c.firstName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{c.lastName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{c.company || '-'}</td>
                        <td className="py-2.5 px-3">{c.source}</td>
                        <td className="py-2.5 px-3">{c.leadStatus}</td>
                        <td className="py-2.5 px-3">
                          {/* Stage Pill Badge (Quotation Sent) */}
                          <span className="inline-block border border-slate-300 bg-white text-slate-800 font-medium px-2 py-0.5 rounded text-[11px] shadow-2xs">
                            {c.pipelineStage}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{c.salesOwner}</td>
                        <td className="py-2.5 px-3 font-mono">{c.phone}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{c.dateCreated}</td>
                        <td className="py-2.5 px-3">{c.createdBy}</td>
                        <td className="py-2.5 px-3">
                          {/* Action Buttons: Edit (Pen) & Delete (Trash) - Audio 5 */}
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button (Pen) */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="w-6 h-6 bg-[#2f3b52] hover:bg-blue-700 text-white rounded flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                              title="Edit Contact"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {/* Delete Button (Red Box) */}
                            <button
                              type="button"
                              onClick={() => setDeletingContact(c)}
                              className="w-6 h-6 bg-[#7f1d1d] hover:bg-rose-700 text-white rounded flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (Screenshot 1: « 1 ») */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-center gap-1 text-xs">
              <button
                type="button"
                disabled
                className="w-6 h-6 border border-slate-200 text-slate-300 rounded flex items-center justify-center"
              >
                «
              </button>
              <button
                type="button"
                className="w-6 h-6 border border-blue-500 bg-blue-50 text-blue-600 font-semibold rounded flex items-center justify-center"
              >
                1
              </button>
              <button
                type="button"
                disabled
                className="w-6 h-6 border border-slate-200 text-slate-300 rounded flex items-center justify-center"
              >
                »
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. NEW / EDIT CONTACT MODAL (Matching Screenshot 2 exactly)              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-semibold text-[#1e3a8a]">
                {modalMode === 'create' ? 'New Contact' : 'Edit Contact'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveContact} className="p-5 space-y-5 text-xs">
              {/* Profile Section */}
              <div className="border border-slate-200 rounded p-4 relative pt-5">
                <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600">
                  Profile
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Brand* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Brand*</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Empty for layout or row 1 wrap */}
                  <div className="hidden sm:block" />

                  {/* First Name* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">First Name*</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      required
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Last Name*</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      required
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Phone* with Flag */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Phone*</label>
                    <div className="flex">
                      <div className="flex items-center gap-1 bg-slate-50 border border-r-0 border-slate-300 rounded-l px-2 py-1 text-xs text-slate-700 select-none">
                        <span>🇱🇧</span>
                        <span>+961</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="w-full bg-white border border-slate-300 rounded-r px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Country* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Country*</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {ARAB_AND_NORTH_AFRICA_COUNTRIES.filter(c => c !== 'All Countries').map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Email*</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Other Phone */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Other Phone</label>
                    <div className="flex">
                      <div className="flex items-center gap-1 bg-slate-50 border border-r-0 border-slate-300 rounded-l px-2 py-1 text-xs text-slate-700 select-none">
                        <span>🇱🇧</span>
                        <span>+961</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.otherPhone}
                        onChange={(e) => setFormData({ ...formData, otherPhone: e.target.value })}
                        placeholder="Enter other phone number"
                        className="w-full bg-white border border-slate-300 rounded-r px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Management Section */}
              <div className="border border-slate-200 rounded p-4 relative pt-5">
                <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[11px] font-semibold text-slate-600">
                  Lead Management
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                  {/* Lead Source* */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Lead Source*</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {LEAD_SOURCE_OPTIONS.map((src) => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Status */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Lead Status</label>
                    <select
                      value={formData.leadStatus}
                      onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {LEAD_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pipeline Stage */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Pipeline Stage</label>
                    <select
                      value={formData.pipelineStage}
                      onChange={(e) => setFormData({ ...formData, pipelineStage: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {PIPELINE_STAGE_OPTIONS.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3.5">
                  {/* Expected Value */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Expected Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expectedValue}
                      onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Expected Close Date */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Expected Close Date</label>
                    <input
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Next Action At */}
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Next Action At</label>
                    <input
                      type="datetime-local"
                      value={formData.nextActionAt}
                      onChange={(e) => setFormData({ ...formData, nextActionAt: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* External Lead ID */}
                <div className="mb-3.5">
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">External Lead ID</label>
                  <input
                    type="text"
                    value={formData.externalLeadId}
                    onChange={(e) => setFormData({ ...formData, externalLeadId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. WA-70569641"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Enter notes..."
                  />
                </div>
              </div>

              {/* Modal Footer (Save Button) */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-5 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Delete Contact</h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete <span className="font-semibold text-rose-700">{deletingContact.firstName} {deletingContact.lastName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
