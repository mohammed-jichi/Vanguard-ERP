'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  Plus,
  Search,
  Banknote,
  Save,
  X,
  CreditCard,
  BookOpen,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Coins
} from 'lucide-react';
import {
  OmegaPaymentType,
  OmegaCurrency,
  OmegaInvoiceMessage,
  OmegaAccount,
  OmegaPaymentBill,
  INITIAL_PAYMENT_TYPES,
  OMEGA_PAYMENT_TYPES_OPTIONS,
  OMEGA_CREDIT_CARD_OPTIONS,
  OMEGA_TICKET_OPTIONS,
  OMEGA_PAYMENT_STATUS_OPTIONS,
  OMEGA_BRANCHES,
  OMEGA_CURRENCIES,
  OMEGA_INVOICE_MESSAGES,
  OMEGA_ACCOUNTS,
  INITIAL_PAYMENT_BILLS
} from '@/lib/omegaPaymentData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function PaymentTypesView() {
  // Navigation & Sub-views
  const [activeView, setActiveView] = useState<'types' | 'bills'>('types');

  // Main data state
  const [paymentTypes, setPaymentTypes] = useState<OmegaPaymentType[]>(INITIAL_PAYMENT_TYPES);
  const [currencies, setCurrencies] = useState<OmegaCurrency[]>(OMEGA_CURRENCIES);
  const [paymentBills, setPaymentBills] = useState<OmegaPaymentBill[]>(INITIAL_PAYMENT_BILLS);

  // Filters & Sorting for Payment Types
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('allbranch');
  const [sortConfig, setSortConfig] = useState<{ field: keyof OmegaPaymentType; dir: 'asc' | 'desc' }>({
    field: 'SORTING',
    dir: 'asc'
  });

  // Filters & Sorting for Payment Bills
  const [billSearch, setBillSearch] = useState<string>('');
  const [billTypeFilter, setBillTypeFilter] = useState<string>('');
  const [billSortDir, setBillSortDir] = useState<'asc' | 'desc'>('asc');

  // Toast notifications
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<OmegaPaymentType | null>(null);
  const [showSortingModal, setShowSortingModal] = useState<boolean>(false);
  const [sortingItems, setSortingItems] = useState<OmegaPaymentType[]>([]);
  const [showAccountSearchModal, setShowAccountSearchModal] = useState<boolean>(false);
  const [accountSearchQuery, setAccountSearchQuery] = useState<string>('');
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState<boolean>(false);
  const [newCurrencyDesc, setNewCurrencyDesc] = useState<string>('');
  const [newCurrencySymbol, setNewCurrencySymbol] = useState<string>('');
  const [newCurrencyRate, setNewCurrencyRate] = useState<number>(1);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<OmegaPaymentType | null>(null);

  // Bill Modals
  const [showBillModal, setShowBillModal] = useState<boolean>(false);
  const [editingBill, setEditingBill] = useState<OmegaPaymentBill | null>(null);
  const [deleteConfirmBill, setDeleteConfirmBill] = useState<OmegaPaymentBill | null>(null);

  // Payment Type Form State
  const [formDesc, setFormDesc] = useState<string>('');
  const [formCurrency, setFormCurrency] = useState<number>(1);
  const [formType, setFormType] = useState<number>(3); // Default Cash
  const [formCreditCardOpt, setFormCreditCardOpt] = useState<number>(1);
  const [formTicketOpt, setFormTicketOpt] = useState<number>(1);
  const [formRegPrice, setFormRegPrice] = useState<string>('');
  const [formWeekPrice, setFormWeekPrice] = useState<string>('');
  const [formInstruction, setFormInstruction] = useState<string>('');
  const [formStatus, setFormStatus] = useState<number>(1); // Change
  const [formCommission, setFormCommission] = useState<string>('');
  const [formAccNo, setFormAccNo] = useState<string>('');
  const [formDepositAccNo, setFormDepositAccNo] = useState<string>('');
  const [formInvoiceMsg, setFormInvoiceMsg] = useState<number>(0);
  const [formSorting, setFormSorting] = useState<number>(1);
  const [formOpenCashDrawer, setFormOpenCashDrawer] = useState<boolean>(true);
  const [formNotActive, setFormNotActive] = useState<boolean>(false);
  const [formBranches, setFormBranches] = useState<Record<number, boolean>>({ 1: true });

  // Bill Form State
  const [billFormType, setBillFormType] = useState<string>('');
  const [billFormPaymentId, setBillFormPaymentId] = useState<number>(1);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDesc('');
    setFormCurrency(1);
    setFormType(3); // Cash
    setFormCreditCardOpt(0);
    setFormTicketOpt(1);
    setFormRegPrice('');
    setFormWeekPrice('');
    setFormInstruction('');
    setFormStatus(1);
    setFormCommission('');
    setFormAccNo('51100010');
    setFormDepositAccNo('');
    setFormInvoiceMsg(0);
    const maxSort = paymentTypes.reduce((acc, curr) => Math.max(acc, curr.SORTING || 0), 0);
    setFormSorting(maxSort + 1);
    setFormOpenCashDrawer(true);
    setFormNotActive(false);
    setFormBranches({ 1: true });
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: OmegaPaymentType) => {
    setEditingItem(item);
    setFormDesc(item.PAYMENTTYPE);
    setFormCurrency(item.PAYMENTCURRENCY);
    setFormType(item.CREDIT);
    setFormCreditCardOpt(item.CREDITCARDOPTIONS ?? 0);
    setFormTicketOpt(item.PREPAIDTYPE ?? 1);
    setFormRegPrice(item.PRICEOFTICKET ? String(item.PRICEOFTICKET) : '');
    setFormWeekPrice(item.PRICE2OFTICKET ? String(item.PRICE2OFTICKET) : '');
    setFormInstruction(item.INSTRUCTION ?? '');
    setFormStatus(item.CHANGESTATUS ?? 1);
    setFormCommission(item.COMMISSIONCHARGE ? String(item.COMMISSIONCHARGE) : '');
    setFormAccNo(item.ACCNO ?? '');
    setFormDepositAccNo(item.DEPOSITACCNO ?? '');
    setFormInvoiceMsg(item.MESSAGEONINVID ?? 0);
    setFormSorting(item.SORTING);
    setFormOpenCashDrawer(Boolean(item.OPENCASHDRAWER));
    setFormNotActive(item.NOTACTIVE === -1);
    const branchMap: Record<number, boolean> = {};
    if (item.sd_paymenttype_brand_branch && item.sd_paymenttype_brand_branch.length > 0) {
      item.sd_paymenttype_brand_branch.forEach(b => {
        branchMap[b.BRANCHID] = true;
      });
    } else {
      branchMap[1] = true;
    }
    setFormBranches(branchMap);
    setShowAddEditModal(true);
  };

  // Save Add/Edit Payment Type
  const handleSavePaymentType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) {
      showToast('Please enter a payment description', 'warning');
      return;
    }

    const typeDesc = OMEGA_PAYMENT_TYPES_OPTIONS.find(t => t.value === formType)?.description || 'Cash';
    const statusDesc = OMEGA_PAYMENT_STATUS_OPTIONS.find(s => s.value === formStatus)?.description || 'Change';

    if (editingItem) {
      // Update existing
      setPaymentTypes(prev =>
        prev.map(p => {
          if (p.ID === editingItem.ID) {
            return {
              ...p,
              PAYMENTTYPE: formDesc.trim(),
              PAYMENTCURRENCY: formCurrency,
              CREDIT: formType,
              CREDITVALUE: typeDesc,
              CHANGESTATUS: formStatus,
              PAYMENTSTATUS: statusDesc,
              ACCNO: formAccNo.trim() || null,
              DEPOSITACCNO: formDepositAccNo.trim() || null,
              CREDITCARDOPTIONS: formType === 1 ? formCreditCardOpt : null,
              PREPAIDTYPE: formType === 5 ? formTicketOpt : null,
              PRICEOFTICKET: formRegPrice ? parseFloat(formRegPrice) : null,
              PRICE2OFTICKET: formWeekPrice ? parseFloat(formWeekPrice) : null,
              INSTRUCTION: formInstruction.trim() || null,
              COMMISSIONCHARGE: formCommission ? parseFloat(formCommission) : null,
              MESSAGEONINVID: formInvoiceMsg,
              SORTING: formSorting,
              OPENCASHDRAWER: formOpenCashDrawer,
              NOTACTIVE: formNotActive ? -1 : 0
            };
          }
          return p;
        })
      );
      showToast(`Payment Type "${formDesc}" updated successfully!`, 'success');
    } else {
      // Create new
      const newId = Math.max(100, ...paymentTypes.map(p => p.ID)) + 1;
      const newPayId = Math.max(25, ...paymentTypes.map(p => p.PAYMENTID)) + 1;
      const newItem: OmegaPaymentType = {
        ID: newId,
        PAYMENTID: newPayId,
        PAYIDBRANCHID: 100 + newPayId,
        BRAND_ID: 9606,
        BRANCHID: 1,
        PAYMENTTYPE: formDesc.trim(),
        PAYMENTCURRENCY: formCurrency,
        CREDIT: formType,
        CREDITVALUE: typeDesc,
        ACCNO: formAccNo.trim() || null,
        DEPOSITACCNO: formDepositAccNo.trim() || null,
        CHANGESTATUS: formStatus,
        PAYMENTSTATUS: statusDesc,
        CREDITCARDOPTIONS: formType === 1 ? formCreditCardOpt : null,
        PREPAIDTYPE: formType === 5 ? formTicketOpt : null,
        PRICEOFTICKET: formRegPrice ? parseFloat(formRegPrice) : null,
        PRICE2OFTICKET: formWeekPrice ? parseFloat(formWeekPrice) : null,
        INSTRUCTION: formInstruction.trim() || null,
        COMMISSIONCHARGE: formCommission ? parseFloat(formCommission) : null,
        MESSAGEONINVID: formInvoiceMsg,
        SORTING: formSorting,
        OPENCASHDRAWER: formOpenCashDrawer,
        NOTACTIVE: formNotActive ? -1 : 0,
        TOTALEXCEPTIONS: 0,
        sd_paymenttype_brand_branch: []
      };
      setPaymentTypes(prev => [...prev, newItem]);
      showToast(`Payment Type "${formDesc}" created successfully!`, 'success');
    }

    setShowAddEditModal(false);
  };

  // Delete payment type
  const handleDeletePaymentType = () => {
    if (!deleteConfirmItem) return;
    setPaymentTypes(prev => prev.filter(p => p.ID !== deleteConfirmItem.ID));
    showToast(`Payment Type "${deleteConfirmItem.PAYMENTTYPE}" deleted`, 'warning');
    setDeleteConfirmItem(null);
  };

  // Sorting Modal Actions
  const handleOpenSortingModal = () => {
    setSortingItems([...paymentTypes].sort((a, b) => (a.SORTING || 0) - (b.SORTING || 0)));
    setShowSortingModal(true);
  };

  const handleSaveSorting = () => {
    setPaymentTypes(sortingItems);
    showToast('Sorting sequence saved successfully', 'success');
    setShowSortingModal(false);
  };

  const moveSortingItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sortingItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    // Re-assign sequential sorting values
    newItems.forEach((item, idx) => {
      item.SORTING = idx + 1;
    });
    setSortingItems(newItems);
  };

  // Add Currency Action
  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrencyDesc.trim() || !newCurrencySymbol.trim()) {
      showToast('Please fill all currency fields', 'warning');
      return;
    }
    const newCurr: OmegaCurrency = {
      ID: Math.max(5000, ...currencies.map(c => c.ID)) + 1,
      BRAND_ID: 9606,
      BRANCHID: 1,
      DESCRIPTION: newCurrencyDesc.trim(),
      RATE: newCurrencyRate,
      SYNBOL: newCurrencySymbol.trim(),
      ASYNBOL: newCurrencySymbol.trim(),
      DIGITNUMBER: 2,
      BACKRATE: newCurrencyRate,
      DECIMALNBRINV: 2,
      maincurrency: 3
    };
    setCurrencies(prev => [...prev, newCurr]);
    setFormCurrency(newCurr.ID);
    showToast(`Currency "${newCurr.DESCRIPTION}" added!`, 'success');
    setShowAddCurrencyModal(false);
    setNewCurrencyDesc('');
    setNewCurrencySymbol('');
    setNewCurrencyRate(1);
  };

  // Payment Bills Actions
  const handleOpenAddBill = () => {
    setEditingBill(null);
    setBillFormType('');
    setBillFormPaymentId(paymentTypes[0]?.PAYMENTID || 1);
    setShowBillModal(true);
  };

  const handleOpenEditBill = (bill: OmegaPaymentBill) => {
    setEditingBill(bill);
    setBillFormType(bill.TYPES);
    setBillFormPaymentId(bill.PAYMENTID);
    setShowBillModal(true);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billFormType.trim()) {
      showToast('Please enter bill type description', 'warning');
      return;
    }
    const pt = paymentTypes.find(p => p.PAYMENTID === billFormPaymentId);
    const payName = pt ? pt.PAYMENTTYPE : 'CASH';

    if (editingBill) {
      setPaymentBills(prev =>
        prev.map(b => (b.ID === editingBill.ID ? { ...b, TYPES: billFormType.trim(), PAYMENTID: billFormPaymentId, PAYMENTTYPE: payName } : b))
      );
      showToast(`Bill "${billFormType}" updated!`, 'success');
    } else {
      const newBill: OmegaPaymentBill = {
        ID: Math.max(10, ...paymentBills.map(b => b.ID)) + 1,
        TYPES: billFormType.trim(),
        PAYMENTID: billFormPaymentId,
        PAYMENTTYPE: payName
      };
      setPaymentBills(prev => [...prev, newBill]);
      showToast(`Bill "${billFormType}" added!`, 'success');
    }
    setShowBillModal(false);
  };

  const handleDeleteBill = () => {
    if (!deleteConfirmBill) return;
    setPaymentBills(prev => prev.filter(b => b.ID !== deleteConfirmBill.ID));
    showToast(`Bill "${deleteConfirmBill.TYPES}" deleted`, 'warning');
    setDeleteConfirmBill(null);
  };

  // Filtered & Sorted Payment Types
  const filteredPaymentTypes = useMemo(() => {
    return paymentTypes
      .filter(item => {
        const matchesSearch =
          !searchVal.trim() ||
          item.PAYMENTTYPE.toLowerCase().includes(searchVal.toLowerCase()) ||
          (item.ACCNO && item.ACCNO.toLowerCase().includes(searchVal.toLowerCase())) ||
          (item.CREDITVALUE && item.CREDITVALUE.toLowerCase().includes(searchVal.toLowerCase()));

        const matchesBranch = selectedBranch === 'allbranch' || item.BRANCHID === parseInt(selectedBranch);
        return matchesSearch && matchesBranch;
      })
      .sort((a, b) => {
        let valA = a[sortConfig.field];
        let valB = b[sortConfig.field];
        if (typeof valA === 'string') {
          return sortConfig.dir === 'asc'
            ? (valA as string).localeCompare((valB as string) || '')
            : ((valB as string) || '').localeCompare(valA as string);
        }
        valA = valA ?? 0;
        valB = valB ?? 0;
        return sortConfig.dir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [paymentTypes, searchVal, selectedBranch, sortConfig]);

  // Filtered Payment Bills
  const filteredBills = useMemo(() => {
    return paymentBills
      .filter(b => {
        const matchesSearch = !billSearch.trim() || b.TYPES.toLowerCase().includes(billSearch.toLowerCase());
        const matchesPt = !billTypeFilter || b.PAYMENTID === parseInt(billTypeFilter);
        return matchesSearch && matchesPt;
      })
      .sort((a, b) => {
        return billSortDir === 'asc' ? a.TYPES.localeCompare(b.TYPES) : b.TYPES.localeCompare(a.TYPES);
      });
  }, [paymentBills, billSearch, billTypeFilter, billSortDir]);

  // Filtered Chart of Accounts for Search Modal
  const filteredAccounts = useMemo(() => {
    return OMEGA_ACCOUNTS.filter(acc => {
      if (!accountSearchQuery.trim()) return true;
      const q = accountSearchQuery.toLowerCase();
      return (
        acc.account_number.toLowerCase().includes(q) ||
        acc.account_name.toLowerCase().includes(q) ||
        acc.account_type.toLowerCase().includes(q)
      );
    });
  }, [accountSearchQuery]);

  const toggleSort = (field: keyof OmegaPaymentType) => {
    setSortConfig(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="wspaceCont font-sans text-slate-800 bg-background min-h-screen pb-12">
      {/* Toast Popup Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'warning'
              ? 'bg-amber-600'
              : 'bg-blue-600'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-white hover:opacity-80">
            ×
          </button>
        </div>
      )}

      <div className="content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header & Breadcrumbs matching Omega ERP */}
        <div className="header mb-4 pb-2 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="page-title text-2xl font-bold text-slate-800 tracking-tight">
                {activeView === 'types' ? 'Payment Types' : 'Payment Bills'}
              </h1>
              <ul className="breadcrumb flex items-center gap-2 text-xs text-slate-500 mt-1">
                <li>
                  <Link href="/backoffice" className="text-blue-600 hover:underline">
                    Home
                  </Link>
                </li>
                <li>/</li>
                {activeView === 'bills' ? (
                  <>
                    <li>
                      <button onClick={() => setActiveView('types')} className="text-blue-600 hover:underline">
                        Payment Types
                      </button>
                    </li>
                    <li>/</li>
                    <li className="active text-slate-700 font-semibold" aria-current="page">
                      Payment Bills
                    </li>
                  </>
                ) : (
                  <li className="active text-slate-700 font-semibold" aria-current="page">
                    Payment Types
                  </li>
                )}
              </ul>
            </div>

            {/* Quick view switch banner */}
            <div className="flex items-center gap-2">
              {activeView === 'bills' && (
                <button
                  type="button"
                  onClick={() => setActiveView('types')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Payment Types
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PAYMENT TYPES LIST VIEW */}
        {/* ========================================================================= */}
        {activeView === 'types' && (
          <div className="main-content">
            {/* Filter Toolbar matching Omega Bootstrap 5 structure */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Input */}
                <div className="col-span-12 md:col-span-4">
                  <div className="relative">
                    <input
                      type="search"
                      enterKeyHint="search"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Branch Dropdown */}
                <div className="col-span-12 md:col-span-3">
                  <select
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                  >
                    <option value="allbranch">All Branches</option>
                    {OMEGA_BRANCHES.map(b => (
                      <option key={b.BRANCHID} value={String(b.BRANCHID)}>
                        {b.BARANCHNAME}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons: Sorting, Payment Bills, New */}
                <div className="col-span-12 md:col-span-5 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenSortingModal}
                    className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4" /> Sorting
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('bills')}
                    className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Banknote className="w-4 h-4" /> Payment Bills
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container matching Omega styling */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                    <tr>
                      <th
                        onClick={() => toggleSort('PAYMENTID')}
                        className="px-4 py-3 w-16 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          #
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'PAYMENTID' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('PAYMENTTYPE')}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          Name
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'PAYMENTTYPE' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('CREDIT')}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'CREDIT' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('CHANGESTATUS')}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                      >
                        <div className="flex items-center gap-1">
                          Change Status
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'CHANGESTATUS' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('ACCNO')}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden lg:table-cell"
                      >
                        <div className="flex items-center gap-1">
                          Account Number
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'ACCNO' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('SORTING')}
                        className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors hidden sm:table-cell"
                      >
                        <div className="flex items-center gap-1">
                          Sorting
                          <ArrowUpDown className={`w-3.5 h-3.5 text-slate-400 ${sortConfig.field === 'SORTING' ? 'text-blue-600' : ''}`} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center w-24">Exceptions</th>
                      <th className="px-4 py-3 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPaymentTypes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                          No payment types match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPaymentTypes.map(row => (
                        <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-500">{row.PAYMENTID}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            <span>{row.PAYMENTTYPE}</span>
                            <span className="sm:hidden block text-xs text-slate-400 mt-0.5">{row.CREDITVALUE}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                              {row.CREDITVALUE || 'Cash'}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-600">{row.PAYMENTSTATUS || 'Change'}</td>
                          <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-blue-700">
                            {row.ACCNO || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{row.SORTING}</td>
                          <td className="px-4 py-3 text-center">
                            {(row.TOTALEXCEPTIONS || 0) > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                {row.TOTALEXCEPTIONS}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(row)}
                                className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-blue-200 hover:border-blue-600"
                                title="Edit Payment Type"
                              >
                                <Pencil className="w-4 h-4 stroke-[2.2]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmItem(row)}
                                className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-red-200 hover:border-red-600"
                                title="Delete Payment Type"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.2]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={8} className="px-4 py-2.5 text-xs text-slate-500 text-center">
                        Showing {filteredPaymentTypes.length} of {paymentTypes.length} Payment Types | Active Database:
                        Zeit w zaytoun ljanoub S.A.R.L
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PAYMENT BILLS VIEW */}
        {/* ========================================================================= */}
        {activeView === 'bills' && (
          <div className="main-content">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="col-span-12 md:col-span-4">
                  <div className="relative">
                    <input
                      type="search"
                      value={billSearch}
                      onChange={e => setBillSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search Bills..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <select
                    value={billTypeFilter}
                    onChange={e => setBillTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="">All Payment Types</option>
                    {paymentTypes.map(pt => (
                      <option key={pt.PAYMENTID} value={String(pt.PAYMENTID)}>
                        {pt.PAYMENTTYPE}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddBill}
                    className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New Bill
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-16">#</th>
                    <th
                      onClick={() => setBillSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1">
                        Types
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Payment Type</th>
                    <th className="px-4 py-3 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No payment bills recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map(row => (
                      <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-500">{row.ID}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{row.TYPES}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {row.PAYMENTTYPE}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditBill(row)}
                              className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-blue-200 hover:border-blue-600"
                              title="Edit Bill"
                            >
                              <Pencil className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmBill(row)}
                              className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-red-200 hover:border-red-600"
                              title="Delete Bill"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW / EDIT PAYMENT TYPE (Exact Omega Modal Structure) */}
      {/* ========================================================================= */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                {editingItem ? 'Edit Payment Type' : 'New Payment Type'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePaymentType} className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Payment Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Description*
                </label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. CASH, CREDIT CARD, OMT"
                />
              </div>

              {/* Currency & Type in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Currency with Add Button */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Currency*
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={formCurrency}
                      onChange={e => setFormCurrency(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {currencies.map(c => (
                        <option key={c.ID} value={c.ID}>
                          {c.DESCRIPTION} ({c.SYNBOL})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddCurrencyModal(true)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors"
                      title="Add New Currency"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type*</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {OMEGA_PAYMENT_TYPES_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Panel: Credit Card Options (if type == 1) */}
              {formType === 1 && (
                <div className="p-3.5 bg-blue-50/70 rounded-md border border-blue-200 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Credit Card Options</h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Options*</label>
                    <select
                      value={formCreditCardOpt}
                      onChange={e => setFormCreditCardOpt(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                    >
                      {OMEGA_CREDIT_CARD_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Panel: Ticket Option (if type == 5) */}
              {formType === 5 && (
                <div className="p-3.5 bg-amber-50/70 rounded-md border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Ticket Options</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Option Type*</label>
                      <select
                        value={formTicketOpt}
                        onChange={e => setFormTicketOpt(parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      >
                        {OMEGA_TICKET_OPTIONS.map(t => (
                          <option key={t.value} value={t.value}>
                            {t.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Regular Price*</label>
                      <input
                        type="number"
                        value={formRegPrice}
                        onChange={e => setFormRegPrice(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Weekend Price*</label>
                      <input
                        type="number"
                        value={formWeekPrice}
                        onChange={e => setFormWeekPrice(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Instruction</label>
                    <input
                      type="text"
                      value={formInstruction}
                      onChange={e => setFormInstruction(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                      placeholder="Special ticket printing instructions"
                    />
                  </div>
                </div>
              )}

              {/* Change Status & Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Change Status*
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {OMEGA_PAYMENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCommission}
                    onChange={e => setFormCommission(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1.5"
                  />
                </div>
              </div>

              {/* Account Numbers (Main + Bank Deposit) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account Number
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formAccNo}
                      onChange={e => setFormAccNo(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 58100010"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountSearchModal(true)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold border border-slate-300 transition-colors flex items-center justify-center"
                      title="Search Chart of Accounts"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bank Deposit Account Number
                  </label>
                  <input
                    type="text"
                    value={formDepositAccNo}
                    onChange={e => setFormDepositAccNo(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 58100010"
                  />
                </div>
              </div>

              {/* Message on Invoice & Sorting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Message On Invoice
                  </label>
                  <select
                    value={formInvoiceMsg}
                    onChange={e => setFormInvoiceMsg(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={0}>None</option>
                    {OMEGA_INVOICE_MESSAGES.map(msg => (
                      <option key={msg.MESSAGEID} value={msg.MESSAGEID}>
                        {msg.MESSAGETITLE} - {msg.MESSAGEDESC.substring(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sorting</label>
                  <input
                    type="number"
                    value={formSorting}
                    onChange={e => setFormSorting(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Checkboxes: Open Cash Drawer, Not Active */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formOpenCashDrawer}
                    onChange={e => setFormOpenCashDrawer(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Open Cash Drawer</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formNotActive}
                    onChange={e => setFormNotActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>Not Active</span>
                </label>
              </div>

              {/* Branches Restriction Collapsible Panel */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50/50">
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Branches Restriction
                </div>
                <div className="p-3 space-y-2">
                  {OMEGA_BRANCHES.map(b => (
                    <label key={b.BRANCHID} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formBranches[b.BRANCHID])}
                        onChange={e =>
                          setFormBranches(prev => ({
                            ...prev,
                            [b.BRANCHID]: e.target.checked
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span>
                        {b.BARANCHNAME} ({b.CITY})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Payment Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SORTING MODAL (#sortingModal from Omega) */}
      {/* ========================================================================= */}
      {showSortingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-4 py-3 bg-primary text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" /> Sorting
              </h3>
              <button
                type="button"
                onClick={() => setShowSortingModal(false)}
                className="text-white/80 hover:text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-3">
                Adjust order of payment buttons on the POS workstation screen:
              </p>
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-100 text-xs text-slate-600">
                  <tr>
                    <th className="p-2 w-10">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2 w-20 text-center">Order</th>
                    <th className="p-2 w-16 text-center">Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortingItems.map((item, idx) => (
                    <tr key={item.ID} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-xs text-slate-400">{item.PAYMENTID}</td>
                      <td className="p-2 font-semibold text-slate-800">{item.PAYMENTTYPE}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={item.SORTING}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setSortingItems(prev => prev.map((it, i) => (i === idx ? { ...it, SORTING: val } : it)));
                          }}
                          className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded text-center"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSortingItem(idx, 'up')}
                            className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sortingItems.length - 1}
                            onClick={() => moveSortingItem(idx, 'down')}
                            className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSortingModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSorting}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Sorting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CHART OF ACCOUNTS SEARCH MODAL (#searchaccountsmodel) */}
      {/* ========================================================================= */}
      {showAccountSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Select Account from General Ledger
              </h3>
              <button
                type="button"
                onClick={() => setShowAccountSearchModal(false)}
                className="text-white/80 hover:text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <input
                  type="search"
                  value={accountSearchQuery}
                  onChange={e => setAccountSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Search account code or name..."
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2">Acc No</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Curr</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map(acc => (
                      <tr key={acc.account_number} className="hover:bg-blue-50/50">
                        <td className="p-2 font-mono font-bold text-blue-700">{acc.account_number}</td>
                        <td className="p-2 text-slate-800 font-medium">{acc.account_name}</td>
                        <td className="p-2 text-slate-500">{acc.account_type}</td>
                        <td className="p-2 text-slate-500">{acc.currency}</td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setFormAccNo(acc.account_number);
                              setShowAccountSearchModal(false);
                              showToast(`Linked account: ${acc.account_number}`, 'info');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px]"
                          >
                            Select
                          </button>
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

      {/* ========================================================================= */}
      {/* MODAL 4: ADD NEW CURRENCY QUICK DIALOG */}
      {/* ========================================================================= */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" /> Add New Currency
            </h3>
            <form onSubmit={handleSaveCurrency} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Currency Name</label>
                <input
                  type="text"
                  required
                  value={newCurrencyDesc}
                  onChange={e => setNewCurrencyDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  placeholder="e.g. Canadian Dollar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={newCurrencySymbol}
                  onChange={e => setNewCurrencySymbol(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  placeholder="e.g. CAD"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Exchange Rate (to LBP)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newCurrencyRate}
                  onChange={e => setNewCurrencyRate(parseFloat(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCurrencyModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold">
                  Save Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: NEW / EDIT PAYMENT BILL MODAL */}
      {/* ========================================================================= */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-600" />
              {editingBill ? 'Edit Payment Bill' : 'New Payment Bill'}
            </h3>
            <form onSubmit={handleSaveBill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bill Denomination / Name*</label>
                <input
                  type="text"
                  required
                  value={billFormType}
                  onChange={e => setBillFormType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  placeholder="e.g. 50,000 LBP or $20 USD"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Payment Type*</label>
                <select
                  value={billFormPaymentId}
                  onChange={e => setBillFormPaymentId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                >
                  {paymentTypes.map(p => (
                    <option key={p.PAYMENTID} value={p.PAYMENTID}>
                      {p.PAYMENTTYPE}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODALS */}
      {/* ========================================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Confirm Deletion</h4>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete payment type <b>{deleteConfirmItem.PAYMENTTYPE}</b>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePaymentType}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmBill && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Confirm Deletion</h4>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete bill <b>{deleteConfirmBill.TYPES}</b>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmBill(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBill}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
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
