'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Save,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import {
  INITIAL_OMEGA_SUPPLIERS,
  OMEGA_COUNTRIES,
  OMEGA_CUST_TITLES,
  OMEGA_CURRENCIES,
  OMEGA_PAYMENT_TERMS,
  OMEGA_PAYMENT_TYPES,
  OMEGA_GRADES,
  SupplierItem
} from '@/lib/omegaSuppliersData';

export default function AuthenticOmegaSuppliersView() {
  // ---------------------------------------------------------------------------
  // Main State & Local Storage Sync
  // ---------------------------------------------------------------------------
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_suppliers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved suppliers:', e);
      }
    }
    return INITIAL_OMEGA_SUPPLIERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_suppliers', JSON.stringify(suppliers));
    } catch (e) {
      console.error('Error saving suppliers:', e);
    }
  }, [suppliers]);

  // ---------------------------------------------------------------------------
  // Toolbar Search & Filter States
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof SupplierItem>('CREATED_AT');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Actions dropdown
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // Modals States
  // ---------------------------------------------------------------------------
  // New Supplier Modal
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  // Edit Supplier Modal
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  // Form fields state for New / Edit Supplier
  const [formSupplierName, setFormSupplierName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactTitle, setFormContactTitle] = useState<string>('');
  const [formNotActive, setFormNotActive] = useState(false);

  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formFaxNumber, setFormFaxNumber] = useState('');
  const [formEmailAddress, setFormEmailAddress] = useState('');
  const [formEmailCC, setFormEmailCC] = useState('');

  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState<string>('Lebanon');
  const [formPostalCode, setFormPostalCode] = useState('');

  const [formCurrency, setFormCurrency] = useState<string>('USD');
  const [formPaymentTerms, setFormPaymentTerms] = useState<string>('0');
  const [formPaymentType, setFormPaymentType] = useState<string>('1');
  const [formBankInfo, setFormBankInfo] = useState('');
  const [formVatReg, setFormVatReg] = useState(false);
  const [formVatNb, setFormVatNb] = useState('');

  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formGrade, setFormGrade] = useState<string>('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Merge Suppliers Modal
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [fromSupplierId, setFromSupplierId] = useState<string>('');
  const [toSupplierId, setToSupplierId] = useState<string>('');

  // Merge Warning Dialog
  const [isMergeWarningOpen, setIsMergeWarningOpen] = useState(false);
  const [mergeConfirmationInput, setMergeConfirmationInput] = useState('');

  // Validation: only accepts 'Merge Suppliers', 'MERGE SUPPLIERS', or 'merge suppliers'
  const isMergeConfirmationValid = useMemo(() => {
    const trimmed = mergeConfirmationInput.trim();
    return (
      trimmed === 'MERGE SUPPLIERS' ||
      trimmed === 'Merge Suppliers' ||
      trimmed === 'merge suppliers'
    );
  }, [mergeConfirmationInput]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // Filtered and Sorted Suppliers
  // ---------------------------------------------------------------------------
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => {
        // Country filter
        if (selectedCountry !== 'All' && s.COUNTRY_NAME !== selectedCountry) {
          return false;
        }
        // Grade filter
        if (selectedGrade !== 'All') {
          if (!s.GRADE || s.GRADE !== selectedGrade) return false;
        }
        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          s.SUPPLIERNAME.toLowerCase().includes(q) ||
          (s.CONTACTNAME && s.CONTACTNAME.toLowerCase().includes(q)) ||
          (s.PHONENUMBER && s.PHONENUMBER.toLowerCase().includes(q)) ||
          (s.COUNTRY_NAME && s.COUNTRY_NAME.toLowerCase().includes(q)) ||
          (s.NOTES && s.NOTES.toLowerCase().includes(q)) ||
          String(s.SUPPLIERID).includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [suppliers, searchQuery, selectedCountry, selectedGrade, sortField, sortOrder]);

  const handleSort = (field: keyof SupplierItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // Reset Form
  // ---------------------------------------------------------------------------
  const resetFormFields = () => {
    setFormSupplierName('');
    setFormContactName('');
    setFormContactTitle('');
    setFormNotActive(false);

    setFormPhoneNumber('');
    setFormMobile('');
    setFormFaxNumber('');
    setFormEmailAddress('');
    setFormEmailCC('');

    setFormStreet('');
    setFormCity('');
    setFormCountry('Lebanon');
    setFormPostalCode('');

    setFormCurrency('USD');
    setFormPaymentTerms('0');
    setFormPaymentType('1');
    setFormBankInfo('');
    setFormVatReg(false);
    setFormVatNb('');

    setFormAccountNumber('');
    setFormGrade('');
    setFormWebsite('');
    setFormNotes('');
  };

  const openNewModal = () => {
    resetFormFields();
    setIsNewSupplierOpen(true);
  };

  const openEditModal = (s: SupplierItem) => {
    setEditingSupplier(s);
    setFormSupplierName(s.SUPPLIERNAME || '');
    setFormContactName(s.CONTACTNAME || '');
    setFormContactTitle(s.CONTACTTITLE ? String(s.CONTACTTITLE) : '');
    setFormNotActive(s.NOTACTIVE === -1 || s.NOTACTIVE === 1);

    setFormPhoneNumber(s.PHONENUMBER || '');
    setFormMobile(s.MOBILE || '');
    setFormFaxNumber(s.FAXNUMBER || '');
    setFormEmailAddress(s.EMAILADDRESS || '');
    setFormEmailCC(s.EMAILCC || '');

    setFormStreet(s.STREET || '');
    setFormCity(s.CITY || '');
    setFormCountry(s.COUNTRY_NAME || 'Lebanon');
    setFormPostalCode(s.POSTALCODE || '');

    setFormCurrency(s.MAINCURR === 1 ? 'LBP' : 'USD');
    setFormPaymentTerms(s.PAYMENTTERMS ? String(s.PAYMENTTERMS) : '0');
    setFormPaymentType(s.PAYMENTTYPE ? String(s.PAYMENTTYPE) : '1');
    setFormBankInfo(s.BANKINFO || '');
    setFormVatReg(Boolean(s.VATREGISTERED));
    setFormVatNb(s.VATNB || '');

    setFormAccountNumber(s.ACCOUNTNO ? String(s.ACCOUNTNO) : '');
    setFormGrade(s.GRADE || '');
    setFormWebsite(s.WEBSITE || '');
    setFormNotes(s.NOTES || '');

    setIsEditSupplierOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Save New Supplier
  // ---------------------------------------------------------------------------
  const handleSaveNewSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierName.trim()) {
      alert('Company Name is required');
      return;
    }

    const nextId = Math.max(0, ...suppliers.map((s) => s.SUPPLIERID)) + 1;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newSupplier: SupplierItem = {
      ID: nextId,
      SUPPLIERID: nextId,
      BRAND_ID: 9606,
      BRANCHID: 1,
      SUPPLIERNAME: formSupplierName.trim(),
      CONTACTNAME: formContactName.trim() || null,
      CONTACTTITLE: formContactTitle || null,
      STREET: formStreet.trim() || null,
      CITY: formCity.trim() || null,
      POSTALCODE: formPostalCode.trim() || null,
      COUNTRY: formCountry === 'Lebanon' ? '115' : '1',
      COUNTRY_NAME: formCountry,
      PHONENUMBER: formPhoneNumber.trim() || null,
      MOBILE: formMobile.trim() || null,
      FAXNUMBER: formFaxNumber.trim() || null,
      EMAILADDRESS: formEmailAddress.trim() || null,
      EMAILCC: formEmailCC.trim() || null,
      BANKINFO: formBankInfo.trim() || null,
      NOTES: formNotes.trim() || null,
      PAYMENTTERMS: formPaymentTerms || '0',
      PAYMENTTYPE: Number(formPaymentType) || 1,
      MAINCURR: formCurrency === 'LBP' ? 1 : 2,
      ACCOUNTNO: formAccountNumber.trim() || null,
      VATREGISTERED: formVatReg ? 1 : 0,
      VATNB: formVatNb.trim() || null,
      GRADE: formGrade || null,
      WEBSITE: formWebsite.trim() || null,
      NOTACTIVE: formNotActive ? -1 : 0,
      CREATED_AT: nowStr,
      UPDATED_AT: nowStr
    };

    setSuppliers([newSupplier, ...suppliers]);
    setIsNewSupplierOpen(false);
    resetFormFields();
    showToast(`Supplier "${newSupplier.SUPPLIERNAME}" created successfully`);
  };

  // ---------------------------------------------------------------------------
  // Update Existing Supplier
  // ---------------------------------------------------------------------------
  const handleUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    if (!formSupplierName.trim()) {
      alert('Company Name is required');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const updated = suppliers.map((s) => {
      if (s.SUPPLIERID === editingSupplier.SUPPLIERID) {
        return {
          ...s,
          SUPPLIERNAME: formSupplierName.trim(),
          CONTACTNAME: formContactName.trim() || null,
          CONTACTTITLE: formContactTitle || null,
          STREET: formStreet.trim() || null,
          CITY: formCity.trim() || null,
          POSTALCODE: formPostalCode.trim() || null,
          COUNTRY_NAME: formCountry,
          PHONENUMBER: formPhoneNumber.trim() || null,
          MOBILE: formMobile.trim() || null,
          FAXNUMBER: formFaxNumber.trim() || null,
          EMAILADDRESS: formEmailAddress.trim() || null,
          EMAILCC: formEmailCC.trim() || null,
          BANKINFO: formBankInfo.trim() || null,
          NOTES: formNotes.trim() || null,
          PAYMENTTERMS: formPaymentTerms || '0',
          PAYMENTTYPE: Number(formPaymentType) || 1,
          MAINCURR: formCurrency === 'LBP' ? 1 : 2,
          ACCOUNTNO: formAccountNumber.trim() || null,
          VATREGISTERED: formVatReg ? 1 : 0,
          VATNB: formVatNb.trim() || null,
          GRADE: formGrade || null,
          WEBSITE: formWebsite.trim() || null,
          NOTACTIVE: formNotActive ? -1 : 0,
          UPDATED_AT: nowStr
        };
      }
      return s;
    });

    setSuppliers(updated);
    setIsEditSupplierOpen(false);
    setEditingSupplier(null);
    resetFormFields();
    showToast(`Supplier updated successfully`);
  };

  // ---------------------------------------------------------------------------
  // Delete Supplier
  // ---------------------------------------------------------------------------
  const handleDeleteSupplier = (s: SupplierItem) => {
    if (confirm(`Are you sure that you want to delete this supplier: "${s.SUPPLIERNAME}"?`)) {
      setSuppliers(suppliers.filter((item) => item.SUPPLIERID !== s.SUPPLIERID));
      showToast(`Supplier "${s.SUPPLIERNAME}" deleted`);
    }
  };

  // ---------------------------------------------------------------------------
  // Merge Suppliers Flow
  // ---------------------------------------------------------------------------
  const handleInitiateMerge = () => {
    if (!fromSupplierId || !toSupplierId) {
      alert('Please choose from and to supplier');
      return;
    }
    if (fromSupplierId === toSupplierId) {
      alert('Choose different suppliers');
      return;
    }
    setMergeConfirmationInput('');
    setIsMergeWarningOpen(true);
  };

  const handleConfirmMerge = () => {
    if (!isMergeConfirmationValid) {
      alert('Please type "Merge Suppliers", "MERGE SUPPLIERS", or "merge suppliers" to confirm.');
      return;
    }

    const fromNum = Number(fromSupplierId);
    const toNum = Number(toSupplierId);

    const fromSup = suppliers.find((s) => s.SUPPLIERID === fromNum);
    const toSup = suppliers.find((s) => s.SUPPLIERID === toNum);

    // Filter out the source supplier (from)
    const updated = suppliers.filter((s) => s.SUPPLIERID !== fromNum);
    setSuppliers(updated);

    setIsMergeWarningOpen(false);
    setIsMergeModalOpen(false);
    setFromSupplierId('');
    setToSupplierId('');
    setMergeConfirmationInput('');
    showToast(`Suppliers merged successfully: "${fromSup?.SUPPLIERNAME}" into "${toSup?.SUPPLIERNAME}"`);
  };

  // Format date helper matching Omega: "03 Apr, 2026"
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 font-sans text-slate-800 animate-fade-in relative pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[99999] bg-[#1e293b] text-white px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          HEADER: Titles and Breadcrumb (Matching Screenshot 1)
          ======================================================================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-normal text-slate-800 tracking-tight">Suppliers</h1>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-[#195a96] hover:underline cursor-pointer">Home</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Suppliers</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          TOOLBAR: Search, All Countries, All Grades, Actions, + New
          ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left filters: Search, Country, Grade */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>

            {/* Country Dropdown Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer min-w-[140px]"
            >
              <option value="All">All Countries</option>
              {OMEGA_COUNTRIES.map((c) => (
                <option key={c.ID} value={c.NAME}>
                  {c.NAME}
                </option>
              ))}
            </select>

            {/* Grade Dropdown Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer min-w-[120px]"
            >
              <option value="All">All Grades</option>
              {OMEGA_GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  Grade {g.description}
                </option>
              ))}
            </select>
          </div>

          {/* Right buttons: Actions and + New */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Actions Dropdown */}
            <div className="relative" ref={actionsRef}>
              <button
                type="button"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="px-3 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#28323c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
              >
                <span>Actions</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-20 text-xs animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsOpen(false);
                      setFromSupplierId('');
                      setToSupplierId('');
                      setIsMergeModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Merge Suppliers</span>
                  </button>
                </div>
              )}
            </div>

            {/* + New Button */}
            <button
              type="button"
              onClick={openNewModal}
              className="px-3.5 py-1.5 rounded-sm bg-[#195a96] hover:bg-[#144777] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SUPPLIERS TABLE (Matching Screenshot 1)
          ======================================================================= */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('SUPPLIERID')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none w-12"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('SUPPLIERNAME')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CONTACTNAME')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[140px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Contact Person</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('PHONENUMBER')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[110px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Phone</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('GRADE')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[70px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Grade</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('COUNTRY_NAME')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[90px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Country</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('NOTES')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Notes</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CREATED_AT')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Created At</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('UPDATED_AT')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Updated At</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-2.5 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No suppliers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((row) => (
                  <tr key={row.SUPPLIERID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{row.SUPPLIERID}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.SUPPLIERNAME}</td>
                    <td className="px-3 py-2 text-slate-600">{row.CONTACTNAME || ''}</td>
                    <td className="px-3 py-2 text-slate-600 font-mono">{row.PHONENUMBER || ''}</td>
                    <td className="px-3 py-2 text-slate-600 font-semibold">{row.GRADE || ''}</td>
                    <td className="px-3 py-2 text-slate-600">{row.COUNTRY_NAME || 'Lebanon'}</td>
                    <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-[140px]">{row.NOTES || ''}</td>
                    <td className="px-3 py-2 text-slate-500 text-[11px] whitespace-nowrap">{formatDate(row.CREATED_AT)}</td>
                    <td className="px-3 py-2 text-slate-500 text-[11px] whitespace-nowrap">{formatDate(row.UPDATED_AT)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          title="Edit Supplier"
                          className="p-1.5 rounded-sm bg-[#323f4b] hover:bg-[#232c35] text-white cursor-pointer transition shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSupplier(row)}
                          title="Delete Supplier"
                          className="p-1.5 rounded-sm bg-[#842029] hover:bg-[#681920] text-white cursor-pointer transition shadow-2xs"
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

        {/* Bottom Pagination matching Omega: « 1 » */}
        <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs">
            <span className="px-2.5 py-1 text-slate-400 select-none">«</span>
            <span className="px-2.5 py-1 bg-blue-50 text-[#195a96] border border-blue-200 rounded-sm font-bold">1</span>
            <span className="px-2.5 py-1 text-slate-400 select-none">»</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MODAL 1: NEW & EDIT SUPPLIER (Matching Screenshots 2 & 3 Pixel-by-Pixel)
          ======================================================================= */}
      {(isNewSupplierOpen || isEditSupplierOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-[17px] font-normal text-slate-800">
                {isEditSupplierOpen ? 'Edit Supplier' : 'New Supplier'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsNewSupplierOpen(false);
                  setIsEditSupplierOpen(false);
                  setEditingSupplier(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form
              onSubmit={isEditSupplierOpen ? handleUpdateSupplier : handleSaveNewSupplier}
              className="p-5 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar"
            >
              {/* Card 1: General */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  General
                </div>
                <div className="p-4 space-y-3">
                  {/* Company Name with green search button */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Company Name*</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={formSupplierName}
                        onChange={(e) => setFormSupplierName(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        type="button"
                        title="Search in Omega Marketplace"
                        className="px-3 py-2 bg-[#23783a] hover:bg-[#1c602e] text-white rounded-sm flex items-center justify-center cursor-pointer transition shadow-2xs"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={formContactName}
                        onChange={(e) => setFormContactName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Contact Title</label>
                      <div className="flex gap-2">
                        <select
                          value={formContactTitle}
                          onChange={(e) => setFormContactTitle(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select title</option>
                          {OMEGA_CUST_TITLES.map((t) => (
                            <option key={t.ID} value={t.ID}>
                              {t.TITLEDESCRIPTION}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Not Active Checkbox */}
                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formNotActive}
                        onChange={(e) => setFormNotActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-700 font-medium">Not Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact Information */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  Contact Information
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={formPhoneNumber}
                        onChange={(e) => setFormPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Mobile</label>
                      <input
                        type="text"
                        value={formMobile}
                        onChange={(e) => setFormMobile(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Fax Number</label>
                      <input
                        type="text"
                        value={formFaxNumber}
                        onChange={(e) => setFormFaxNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formEmailAddress}
                        onChange={(e) => setFormEmailAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Email CC</label>
                      <input
                        type="email"
                        value={formEmailCC}
                        onChange={(e) => setFormEmailCC(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Address */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  Address
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Street</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label className="block text-slate-700 font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-slate-700 font-medium mb-1">Country</label>
                      <select
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      >
                        {OMEGA_COUNTRIES.map((c) => (
                          <option key={c.ID} value={c.NAME}>
                            {c.NAME}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-slate-700 font-medium mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={formPostalCode}
                        onChange={(e) => setFormPostalCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Billing */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  Billing
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Supplier Currency*</label>
                      <div className="flex gap-2">
                        <select
                          value={formCurrency}
                          onChange={(e) => setFormCurrency(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          {OMEGA_CURRENCIES.map((cur) => (
                            <option key={cur.ID} value={cur.DESCRIPTION}>
                              {cur.DESCRIPTION} ({cur.SYMBOL})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Payments Terms*</label>
                      <div className="flex gap-2">
                        <select
                          value={formPaymentTerms}
                          onChange={(e) => setFormPaymentTerms(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="0">Select Payment Terms</option>
                          {OMEGA_PAYMENT_TERMS.map((pt) => (
                            <option key={pt.ID} value={pt.TERM_ID}>
                              {pt.PAYMENTTERM}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Payments Types*</label>
                      <select
                        value={formPaymentType}
                        onChange={(e) => setFormPaymentType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      >
                        {OMEGA_PAYMENT_TYPES.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Bank Information</label>
                    <textarea
                      rows={2}
                      value={formBankInfo}
                      onChange={(e) => setFormBankInfo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-1 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formVatReg}
                        onChange={(e) => setFormVatReg(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-700 font-medium">V.A.T Reg</span>
                    </label>

                    {formVatReg && (
                      <div className="flex items-center gap-2">
                        <label className="text-slate-700 font-medium">V.A.T NB</label>
                        <input
                          type="text"
                          value={formVatNb}
                          onChange={(e) => setFormVatNb(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 5: Additional Information */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  Additional Information
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Account Number</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formAccountNumber}
                          onChange={(e) => setFormAccountNumber(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-[#e9ecef] text-slate-700 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const gen = 'ACC-' + Math.floor(100000 + Math.random() * 900000);
                            setFormAccountNumber(gen);
                          }}
                          title="Autogenerate Account Number"
                          className="px-3 py-2 bg-[#323f4b] hover:bg-[#28323c] text-white rounded-sm cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Grade</label>
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select grade</option>
                        {OMEGA_GRADES.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Website</label>
                    <input
                      type="text"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="e.g. https://example.com"
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Internal Note</label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: MERGE SUPPLIERS (Matching Screenshot 1 Flow)
          ======================================================================= */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">Merge Suppliers</h2>
              <button
                type="button"
                onClick={() => setIsMergeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">From Supplier</label>
                  <select
                    value={fromSupplierId}
                    onChange={(e) => setFromSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select From Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.SUPPLIERID} value={s.SUPPLIERID}>
                        {s.SUPPLIERNAME}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">To Supplier</label>
                  <select
                    value={toSupplierId}
                    onChange={(e) => setToSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select To Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.SUPPLIERID} value={s.SUPPLIERID}>
                        {s.SUPPLIERNAME}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleInitiateMerge}
                  disabled={!fromSupplierId || !toSupplierId}
                  className="px-4 py-2 rounded-sm bg-[#6c757d] hover:bg-[#5a6268] disabled:opacity-50 text-white font-semibold text-xs shadow-xs cursor-pointer transition"
                >
                  Merge Suppliers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: MERGE WARNING DIALOG (Matching Requirement with OK Locked & Blue)
          ======================================================================= */}
      {isMergeWarningOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 99999 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden relative"
            style={{ zIndex: 100000 }}
          >
            {/* Dark Header */}
            <div className="px-4 py-3 bg-[#1e1e1e] text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide">
                WARNING! THIS ACTION CANNOT BE RECOVERED ONCE EXECUTED.
              </h3>
              <button
                type="button"
                onClick={() => setIsMergeWarningOpen(false)}
                className="text-slate-400 hover:text-white text-base leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Warning Body */}
            <div className="p-5 space-y-3 text-xs text-slate-700 bg-white">
              <p className="leading-relaxed">
                All transactions will be transferred to the destination supplier and the source supplier will be deleted.
              </p>
              <p className="font-semibold text-slate-800">
                Are you sure you like to merge these 2 suppliers?
              </p>
              <p className="text-slate-800">
                If yes please type: <span className="font-mono font-bold text-slate-900">MERGE SUPPLIERS</span>
              </p>

              {/* Text Confirmation Input Box */}
              <div className="pt-2">
                <input
                  type="text"
                  autoFocus
                  value={mergeConfirmationInput}
                  onChange={(e) => setMergeConfirmationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isMergeConfirmationValid) {
                      handleConfirmMerge();
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  placeholder=""
                />
              </div>

              {/* Footer Buttons with OK Locked and turns Blue */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMergeWarningOpen(false)}
                  className="px-3.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMerge}
                  disabled={!isMergeConfirmationValid}
                  className={`px-4 py-1.5 rounded-sm text-xs font-bold transition shadow-xs ${
                    isMergeConfirmationValid
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white cursor-pointer shadow-sm'
                      : 'bg-[#4b5563] text-white opacity-40 cursor-not-allowed'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
