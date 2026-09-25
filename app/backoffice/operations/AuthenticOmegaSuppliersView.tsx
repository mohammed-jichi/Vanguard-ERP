'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
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
  SupplierItem,
  CustTitleItem,
  CurrencyItem,
  PaymentTermItem
} from '@/lib/omegaSuppliersData';

export default function AuthenticOmegaSuppliersView() {
  const { t, dir } = useLanguage();
  // ---------------------------------------------------------------------------
  // Main State & Local Storage Sync
  // ---------------------------------------------------------------------------
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_suppliers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= INITIAL_OMEGA_SUPPLIERS.length) {
            return parsed.map((item: SupplierItem) => {
              if (item.SUPPLIERID === 11 || item.SUPPLIERNAME === 'Abdo Trading Est.') {
                return { ...item, SUPPLIERNAME: 'Abdo Trading Est.' };
              }
              return item;
            });
          }
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

  // Customer Titles State (synced with localStorage)
  const [custTitles, setCustTitles] = useState<CustTitleItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_cust_titles');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved cust titles:', e);
      }
    }
    return OMEGA_CUST_TITLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_cust_titles', JSON.stringify(custTitles));
    } catch (e) {
      console.error('Error saving cust titles:', e);
    }
  }, [custTitles]);

  // Currencies State (synced with localStorage)
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_currencies');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved currencies:', e);
      }
    }
    return OMEGA_CURRENCIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_currencies', JSON.stringify(currencies));
    } catch (e) {
      console.error('Error saving currencies:', e);
    }
  }, [currencies]);

  // Payment Terms State (synced with localStorage)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_payment_terms');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved payment terms:', e);
      }
    }
    return OMEGA_PAYMENT_TERMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_payment_terms', JSON.stringify(paymentTerms));
    } catch (e) {
      console.error('Error saving payment terms:', e);
    }
  }, [paymentTerms]);

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

  // Titles Modal States (Screenshot 2 & 3)
  const [isTitlesModalOpen, setIsTitlesModalOpen] = useState(false);
  const [isNewTitleModalOpen, setIsNewTitleModalOpen] = useState(false);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);

  // New Currency Modal States (Screenshot 4)
  const [isNewCurrencyModalOpen, setIsNewCurrencyModalOpen] = useState(false);
  const [newCurDescription, setNewCurDescription] = useState('');
  const [newCurSymbol, setNewCurSymbol] = useState('');
  const [newCurPosRate, setNewCurPosRate] = useState('');
  const [newCurBoRate, setNewCurBoRate] = useState('');
  const [newCurDecimals, setNewCurDecimals] = useState('');

  // New Payment Term Modal States (Screenshot 5)
  const [isNewPaymentTermModalOpen, setIsNewPaymentTermModalOpen] = useState(false);
  const [newPtDescription, setNewPtDescription] = useState('');
  const [newPtDays, setNewPtDays] = useState('');

  // Autogenerate Account Confirmation Modal State
  const [isAutogenAccountConfirmOpen, setIsAutogenAccountConfirmOpen] = useState(false);

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
  // Titles Handlers (Matching Screenshots 2 & 3)
  // ---------------------------------------------------------------------------
  const handleOpenNewTitle = () => {
    setTitleInput('');
    setIsNewTitleModalOpen(true);
  };

  const handleSaveNewTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      alert('Title is required');
      return;
    }
    const nextId = Math.max(0, ...custTitles.map((t) => t.ID)) + 1;
    const newTitle: CustTitleItem = {
      ID: nextId,
      TITLEDESCRIPTION: titleInput.trim()
    };
    setCustTitles((prev) => [...prev, newTitle]);
    setFormContactTitle(String(nextId));
    setIsNewTitleModalOpen(false);
    showToast(`Title "${newTitle.TITLEDESCRIPTION}" saved`);
  };

  const handleOpenEditTitle = (t: CustTitleItem) => {
    setEditingTitleId(t.ID);
    setTitleInput(t.TITLEDESCRIPTION);
    setIsEditTitleModalOpen(true);
  };

  const handleSaveEditTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      alert('Title is required');
      return;
    }
    setCustTitles((prev) =>
      prev.map((t) => (t.ID === editingTitleId ? { ...t, TITLEDESCRIPTION: titleInput.trim() } : t))
    );
    setIsEditTitleModalOpen(false);
    setEditingTitleId(null);
    showToast('Title updated successfully');
  };

  const handleDeleteTitle = (t: CustTitleItem) => {
    if (confirm(`Are you sure you want to delete title "${t.TITLEDESCRIPTION}"?`)) {
      setCustTitles((prev) => prev.filter((item) => item.ID !== t.ID));
      if (formContactTitle === String(t.ID)) {
        setFormContactTitle('');
      }
      showToast(`Title "${t.TITLEDESCRIPTION}" deleted`);
    }
  };

  // ---------------------------------------------------------------------------
  // Currency Handlers (Matching Screenshot 4)
  // ---------------------------------------------------------------------------
  const handleOpenNewCurrency = () => {
    setNewCurDescription('');
    setNewCurSymbol('');
    setNewCurPosRate('');
    setNewCurBoRate('');
    setNewCurDecimals('');
    setIsNewCurrencyModalOpen(true);
  };

  const handleSaveNewCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurDescription.trim() || !newCurSymbol.trim()) {
      alert('Description and Symbol are required');
      return;
    }
    const nextId = Math.max(0, ...currencies.map((c) => c.ID)) + 1;
    const newCur: CurrencyItem = {
      ID: nextId,
      DESCRIPTION: newCurDescription.trim(),
      SYMBOL: newCurSymbol.trim(),
      POS_RATE: newCurPosRate ? Number(newCurPosRate) : 1,
      BACKOFFICE_RATE: newCurBoRate ? Number(newCurBoRate) : 1,
      DECIMAL_NUMBER: newCurDecimals ? Number(newCurDecimals) : 2
    };
    setCurrencies((prev) => [...prev, newCur]);
    setFormCurrency(newCur.DESCRIPTION);
    setIsNewCurrencyModalOpen(false);
    showToast(`Currency "${newCur.DESCRIPTION}" added successfully`);
  };

  // ---------------------------------------------------------------------------
  // Payment Term Handlers (Matching Screenshot 5)
  // ---------------------------------------------------------------------------
  const handleOpenNewPaymentTerm = () => {
    setNewPtDescription('');
    setNewPtDays('');
    setIsNewPaymentTermModalOpen(true);
  };

  const handleSaveNewPaymentTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtDescription.trim() || !newPtDays.trim()) {
      alert('Description and Number of Days are required');
      return;
    }
    const nextId = Math.max(0, ...paymentTerms.map((p) => p.ID)) + 1;
    const newPt: PaymentTermItem = {
      ID: nextId,
      TERM_ID: nextId,
      PAYMENTTERM: newPtDescription.trim(),
      DAYS: Number(newPtDays) || 0
    };
    setPaymentTerms((prev) => [...prev, newPt]);
    setFormPaymentTerms(String(newPt.TERM_ID));
    setIsNewPaymentTermModalOpen(false);
    showToast(`Payment Term "${newPt.PAYMENTTERM}" added successfully`);
  };

  // ---------------------------------------------------------------------------
  // Autogenerate Account Confirmation Handler
  // ---------------------------------------------------------------------------
  const handleConfirmAutogenAccount = () => {
    const nextAcc = `411000${String(suppliers.length + 1).padStart(2, '0')}`;
    setFormAccountNumber(nextAcc);
    setIsAutogenAccountConfirmOpen(false);
    showToast(`Accounting account autogenerated for supplier: ${nextAcc}`);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 font-sans text-slate-800 animate-fade-in relative pb-12" dir={dir}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[99999] bg-primary text-white px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          HEADER: Titles and Breadcrumb (Matching Screenshot 1)
          ======================================================================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-normal text-slate-800 tracking-tight">{t('suppliers', 'Suppliers')}</h1>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-primary hover:underline cursor-pointer">{t('home', 'Home')}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">{t('suppliers', 'Suppliers')}</span>
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
                placeholder={t('search_placeholder', 'Search...')}
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
              <option value="All">{t('all_countries', 'All Countries')}</option>
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
              <option value="All">{t('all_grades', 'All Grades')}</option>
              {OMEGA_GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {t('grade', 'Grade')} {g.description}
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
                className="px-3 py-1.5 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
              >
                <span>{t('actions', 'Actions')}</span>
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
                    <span>{t('merge_suppliers', 'Merge Suppliers')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* + New Button */}
            <button
              type="button"
              onClick={openNewModal}
              className="px-3.5 py-1.5 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('new', 'New')}</span>
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
            <thead className="bg-background text-slate-700 font-semibold border-b border-slate-200">
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
                    <span>{t('name', 'Name')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CONTACTNAME')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[140px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('contact_person', 'Contact Person')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('PHONENUMBER')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[110px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('phone', 'Phone')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('GRADE')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[70px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('grade', 'Grade')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('COUNTRY_NAME')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[90px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('country', 'Country')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('NOTES')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('notes', 'Notes')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CREATED_AT')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('created_at', 'Created At')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('UPDATED_AT')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-100 select-none min-w-[100px]"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('updated_at', 'Updated At')}</span>
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
                    {t('no_suppliers_found', 'No suppliers found matching your criteria')}
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
                          title={t('edit_supplier', 'Edit Supplier')}
                          className="p-1.5 rounded-sm bg-primary hover:bg-primary/90 text-white cursor-pointer transition shadow-2xs"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSupplier(row)}
                          title={t('delete_supplier', 'Delete Supplier')}
                          className="p-1.5 rounded-sm bg-destructive hover:bg-destructive/90 text-white cursor-pointer transition shadow-2xs"
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
            <span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 rounded-sm font-bold">1</span>
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
                {isEditSupplierOpen ? t('edit_supplier', 'Edit Supplier') : t('new_supplier', 'New Supplier')}
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
                <div className="bg-background px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  {t('general', 'General')}
                </div>
                <div className="p-4 space-y-3">
                  {/* Company Name with green search button */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">{t('company_name_req', 'Company Name*')}</label>
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
                        title={t('search_in_omega_marketplace', 'Search in Omega Marketplace')}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-sm flex items-center justify-center cursor-pointer transition shadow-2xs"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('contact_person', 'Contact Person')}</label>
                      <input
                        type="text"
                        value={formContactName}
                        onChange={(e) => setFormContactName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('contact_title', 'Contact Title')}</label>
                      <div className="flex gap-2">
                        <select
                          value={formContactTitle}
                          onChange={(e) => setFormContactTitle(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">{t('select_title', 'Select title')}</option>
                          {custTitles.map((titleItem) => (
                            <option key={titleItem.ID} value={titleItem.ID}>
                              {titleItem.TITLEDESCRIPTION}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsTitlesModalOpen(true)}
                          title={t('manage_titles', 'Manage Titles')}
                          className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm cursor-pointer shadow-2xs"
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
                      <span className="text-slate-700 font-medium">{t('not_active', 'Not Active')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact Information */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-background px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  {t('contact_information', 'Contact Information')}
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('phone_number', 'Phone Number')}</label>
                      <input
                        type="text"
                        value={formPhoneNumber}
                        onChange={(e) => setFormPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('mobile', 'Mobile')}</label>
                      <input
                        type="text"
                        value={formMobile}
                        onChange={(e) => setFormMobile(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('fax_number', 'Fax Number')}</label>
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
                      <label className="block text-slate-700 font-medium mb-1">{t('email_address', 'Email Address')}</label>
                      <input
                        type="email"
                        value={formEmailAddress}
                        onChange={(e) => setFormEmailAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('email_cc', 'Email CC')}</label>
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
                <div className="bg-background px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  {t('address', 'Address')}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">{t('street', 'Street')}</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label className="block text-slate-700 font-medium mb-1">{t('city', 'City')}</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-slate-700 font-medium mb-1">{t('country', 'Country')}</label>
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
                      <label className="block text-slate-700 font-medium mb-1">{t('postal_code', 'Postal Code')}</label>
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
                <div className="bg-background px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  {t('billing', 'Billing')}
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('supplier_currency_req', 'Supplier Currency*')}</label>
                      <div className="flex">
                        <select
                          value={formCurrency}
                          onChange={(e) => setFormCurrency(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          {currencies.map((cur) => (
                            <option key={cur.ID} value={cur.DESCRIPTION}>
                              {cur.DESCRIPTION} ({cur.SYMBOL})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleOpenNewCurrency}
                          title={t('add_new_currency', 'Add New Currency')}
                          className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-r-sm cursor-pointer shadow-2xs border border-primary shrink-0 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('payments_terms_req', 'Payments Terms*')}</label>
                      <div className="flex">
                        <select
                          value={formPaymentTerms}
                          onChange={(e) => setFormPaymentTerms(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-xs rounded-l-sm rounded-r-none border border-r-0 border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="0">{t('select_payment_terms', 'Select Payment Terms')}</option>
                          {paymentTerms.map((pt) => (
                            <option key={pt.ID} value={pt.TERM_ID}>
                              {pt.PAYMENTTERM}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleOpenNewPaymentTerm}
                          title={t('add_new_payment_term', 'Add New Payment Term')}
                          className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-r-sm cursor-pointer shadow-2xs border border-primary shrink-0 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('payments_types_req', 'Payments Types*')}</label>
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
                    <label className="block text-slate-700 font-medium mb-1">{t('bank_information', 'Bank Information')}</label>
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
                      <span className="text-slate-700 font-medium">{t('vat_reg', 'V.A.T Reg')}</span>
                    </label>

                    {formVatReg && (
                      <div className="flex items-center gap-2">
                        <label className="text-slate-700 font-medium">{t('vat_nb', 'V.A.T NB')}</label>
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
                <div className="bg-background px-4 py-2.5 border-b border-slate-200 font-semibold text-slate-800">
                  {t('additional_information', 'Additional Information')}
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('account_number', 'Account Number')}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formAccountNumber}
                          onChange={(e) => setFormAccountNumber(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-sm border border-slate-300 bg-muted text-slate-700 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setIsAutogenAccountConfirmOpen(true)}
                          title={t('autogenerate_account_number', 'Autogenerate Account Number')}
                          className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">{t('grade', 'Grade')}</label>
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">{t('select_grade', 'Select grade')}</option>
                        {OMEGA_GRADES.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">{t('website', 'Website')}</label>
                    <input
                      type="text"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="e.g. https://example.com"
                      className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">{t('internal_note', 'Internal Note')}</label>
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
                  className="px-5 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
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
              <h2 className="text-[17px] font-normal text-slate-800">{t('merge_suppliers', 'Merge Suppliers')}</h2>
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
                  <label className="block text-slate-700 font-medium mb-1">{t('from_supplier', 'From Supplier')}</label>
                  <select
                    value={fromSupplierId}
                    onChange={(e) => setFromSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">{t('select_from_supplier', 'Select From Supplier')}</option>
                    {suppliers.map((s) => (
                      <option key={s.SUPPLIERID} value={s.SUPPLIERID}>
                        {s.SUPPLIERNAME}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('to_supplier', 'To Supplier')}</label>
                  <select
                    value={toSupplierId}
                    onChange={(e) => setToSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">{t('select_to_supplier', 'Select To Supplier')}</option>
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
                  className="px-4 py-2 rounded-sm bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs cursor-pointer transition"
                >
                  {t('merge_suppliers', 'Merge Suppliers')}
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
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide">
                {t('warning_merge_irreversible', 'WARNING! THIS ACTION CANNOT BE RECOVERED ONCE EXECUTED.')}
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
                {t('merge_suppliers_desc', 'All transactions will be transferred to the destination supplier and the source supplier will be deleted.')}
              </p>
              <p className="font-semibold text-slate-800">
                {t('merge_suppliers_confirm_q', 'Are you sure you like to merge these 2 suppliers?')}
              </p>
              <p className="text-slate-800">
                {t('if_yes_type', 'If yes please type:')} <span className="font-mono font-bold text-slate-900">MERGE SUPPLIERS</span>
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
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMerge}
                  disabled={!isMergeConfirmationValid}
                  className={`px-4 py-1.5 rounded-sm text-xs font-bold transition shadow-xs ${
                    isMergeConfirmationValid
                      ? 'bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-sm'
                      : 'bg-slate-600 text-white opacity-40 cursor-not-allowed'
                  }`}
                >
                  {t('ok', 'OK')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: TITLES (Matching Screenshot 2 Pixel-by-Pixel)
          ======================================================================= */}
      {isTitlesModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 70000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-xl rounded-sm overflow-hidden"
            style={{ zIndex: 70001 }}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">{t('titles', 'Titles')}</h2>
              <button
                type="button"
                onClick={() => setIsTitlesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Table */}
            <div className="p-5">
              <div className="border border-border rounded-sm overflow-hidden">
                <div className="p-3 border-b border-border flex justify-end">
                  <button
                    type="button"
                    onClick={handleOpenNewTitle}
                    className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('new', 'New')}</span>
                  </button>
                </div>
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-border bg-white font-bold text-slate-800 text-[12px]">
                      <th className="py-2.5 px-3 w-12 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">{t('description', 'Description')}</th>
                      <th className="py-2.5 px-3 w-20 text-end"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {custTitles.map((titleItem, idx) => (
                      <tr key={titleItem.ID} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-normal text-slate-800">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{titleItem.TITLEDESCRIPTION}</td>
                        <td className="py-2.5 px-3 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTitle(titleItem)}
                              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-xs cursor-pointer transition shadow-2xs"
                              title={t('edit_title', 'Edit Title')}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTitle(titleItem)}
                              className="bg-destructive hover:bg-destructive/90 text-white p-1.5 rounded-xs cursor-pointer transition shadow-2xs"
                              title={t('delete_title', 'Delete Title')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: NEW TITLE (Matching Screenshot 3 Pixel-by-Pixel)
          ======================================================================= */}
      {isNewTitleModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">{t('new_title', 'New Title')}</h2>
              <button
                type="button"
                onClick={() => setIsNewTitleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNewTitle} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">{t('title', 'Title')}</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={t('new_title_placeholder', 'New title...')}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: EDIT TITLE
          ======================================================================= */}
      {isEditTitleModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 75000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden"
            style={{ zIndex: 75001 }}
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">{t('edit_title', 'Edit Title')}</h2>
              <button
                type="button"
                onClick={() => setIsEditTitleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditTitle} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">{t('title', 'Title')}</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: NEW CURRENCY (Matching Screenshot 4 Pixel-by-Pixel)
          ======================================================================= */}
      {isNewCurrencyModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 70000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-xl rounded-sm overflow-hidden"
            style={{ zIndex: 70001 }}
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">{t('new_currency', 'New Currency')}</h2>
              <button
                type="button"
                onClick={() => setIsNewCurrencyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNewCurrency} className="p-5 space-y-4 text-xs">
              {/* Row 1: Description*, Symbol* */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('description_req', 'Description*')}</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCurDescription}
                    onChange={(e) => setNewCurDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('symbol_req', 'Symbol*')}</label>
                  <input
                    type="text"
                    required
                    value={newCurSymbol}
                    onChange={(e) => setNewCurSymbol(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: POS Rate*, BackOffice Rate*, Decimal Number* */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('pos_rate_req', 'POS Rate*')}</label>
                  <input
                    type="text"
                    required
                    value={newCurPosRate}
                    onChange={(e) => setNewCurPosRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('backoffice_rate_req', 'BackOffice Rate*')}</label>
                  <input
                    type="text"
                    required
                    value={newCurBoRate}
                    onChange={(e) => setNewCurBoRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">{t('decimal_number_req', 'Decimal Number*')}</label>
                  <input
                    type="text"
                    required
                    value={newCurDecimals}
                    onChange={(e) => setNewCurDecimals(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: NEW PAYMENT TERM (Matching Screenshot 5 Pixel-by-Pixel)
          ======================================================================= */}
      {isNewPaymentTermModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 70000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden"
            style={{ zIndex: 70001 }}
          >
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">{t('new_payment_term', 'New Payment Term')}</h2>
              <button
                type="button"
                onClick={() => setIsNewPaymentTermModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNewPaymentTerm} className="p-6 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
                <div className="flex-[6] min-w-0">
                  <label className="block text-slate-700 font-medium mb-1">{t('description_req', 'Description*')}</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newPtDescription}
                    onChange={(e) => setNewPtDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="flex-[4] min-w-0">
                  <label className="block text-slate-700 font-medium mb-1">{t('nb_of_days_req', 'Nb. Of Days*')}</label>
                  <input
                    type="number"
                    required
                    value={newPtDays}
                    onChange={(e) => setNewPtDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="shrink-0">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-sm bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition h-[35px]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('save', 'Save')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: AUTOGENERATE ACCOUNT CONFIRMATION BOX
          ======================================================================= */}
      {isAutogenAccountConfirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 80000 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-md rounded-sm overflow-hidden"
            style={{ zIndex: 80001 }}
          >
            <div className="p-6 space-y-4 text-xs text-slate-700 bg-white">
              <p className="leading-relaxed text-[13px] text-slate-800">
                {t('autogen_account_confirm_msg', 'Are you sure you want to autogenerate accounting account for this supplier? Account will be created for companies linked with this brand after saving supplier')}
              </p>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAutogenAccountConfirmOpen(false)}
                  className="px-4 py-1.5 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAutogenAccount}
                  className="px-5 py-1.5 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs font-bold cursor-pointer transition shadow-xs"
                >
                  {t('ok', 'OK')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
