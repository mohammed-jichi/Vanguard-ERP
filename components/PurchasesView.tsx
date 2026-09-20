'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar as CalendarIcon,
  X,
  FileText,
  Save,
  Send,
  Eye,
  Trash2,
  Edit2,
  ArrowLeft,
  ChevronUp,
  Tag,
  Package,
  Layers,
  Building
} from 'lucide-react';
import Link from 'next/link';
import DatePickerInput from './DatePickerInput';

export interface PurchaseItemLine {
  id: string;
  barcode: string;
  description: string;
  qty: number;
  unit: string;
  priceUnit: number;
  discountPct: number;
  discountAmt: number;
  amount: number;
  spLL: number;
  spUSD: number;
  tax1: number;
  expiryDate: string;
}

export interface PurchaseInvoice {
  id: string;
  branch: string;
  date: string;
  deliveryDate: string;
  invoiceNumber: string;
  supplier: string;
  supplierContact?: string;
  supplierAddress?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  location: string;
  currency: string;
  currencyRate: number;
  notes: string;
  amountLL: number;
  enteredBy: string;
  updatedBy: string;
  updatedAt: string;
  posted: boolean;
  transferred: boolean;
  transactionType: 'Invoice' | 'Purchase with back order' | 'Inter Brands invoice';
  items: PurchaseItemLine[];
  freight: number;
  otherCost: number;
  customCost: number;
  charges: number;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
}

const DEFAULT_SUPPLIERS = [
  { id: 'SUP-01', name: 'Abbas & Hussein Dirani', contact: 'Abbas', address: 'Beirut, Lebanon', phone: '+961 1 550 120', email: 'dirani@gmail.com' },
  { id: 'SUP-02', name: 'Abbas Dirani', contact: 'Abbas Dirani', address: 'South Lebanon', phone: '+961 76 939 604', email: 'abbas.dirani@gmail.com' },
  { id: 'SUP-03', name: 'B GROUP', contact: 'B Group Logistics', address: 'Beirut Port Freezone, Lebanon', phone: '+961 1 445 670', email: 'info@bgroup.com.lb' },
  { id: 'SUP-04', name: 'C-Way Trading', contact: 'C-Way Procurement', address: 'Dekwaneh Industrial Park, Lebanon', phone: '+961 1 689 201', email: 'orders@cwaytrading.com' },
  { id: 'SUP-05', name: 'Clatchy', contact: 'Clatchy Packaging', address: 'Mkalles Industrial Zone, Lebanon', phone: '+961 1 432 890', email: 'contact@clatchy.com' },
  { id: 'SUP-06', name: 'Ezzeddin', contact: 'Ezzeddin Est.', address: 'Tyre Commercial Street, Lebanon', phone: '+961 7 740 555', email: 'ezzeddin@gmail.com' },
  { id: 'SUP-07', name: 'Koubeissi Est.', contact: 'Koubeissi', address: 'Choueifat Industrial Zone, Lebanon', phone: '+961 5 434 734', email: 'koubeissi.est@gmail.com' },
  { id: 'SUP-08', name: 'Mrs Randa', contact: 'Mrs Randa', address: 'Nabatieh Governorate, Lebanon', phone: '+961 7 760 120', email: 'randa.olives@gmail.com' },
  { id: 'SUP-09', name: 'Safa Bakery', contact: 'Safa Bakery Admin', address: 'Beirut, Lebanon', phone: '+961 1 820 400', email: 'safabakery@gmail.com' },
  { id: 'SUP-10', name: 'Sedi Hisham', contact: 'Abir', address: 'Beirut, Lebanon', phone: '+961 1 300 200', email: 'sedihisham@gmail.com' },
  { id: 'SUP-11', name: 'SOOL', contact: 'Southern Olive Oil Products Logistics', address: 'Choueifat Main Facility, Lebanon', phone: '+961 5 432 100', email: 'procurement@sool.com.lb' },
  { id: 'SUP-12', name: 'Zahwe', contact: 'Zahwe Agriculture', address: 'Kfarroummane, Nabatieh, Lebanon', phone: '+961 70 798 854', email: 'zahwe.farm@gmail.com' },
  { id: 'SUP-13', name: 'Al-Dayaa', contact: 'Al Dayaa Co.', address: 'Marjeyoun District, South Lebanon', phone: '+961 70 325 417', email: 'aldayaa@gmail.com' },
  { id: 'SUP-14', name: 'Abdo Trading Est.', contact: 'Abdo Trading Est.', address: 'Saida Coastal Highway, Lebanon', phone: '+961 7 725 330', email: 'abdo.trading@gmail.com' }
];

const PREDEFINED_CATALOG_ITEMS = [
  { barcode: '528100101', description: 'زيت زيتون بكر ممتاز تنكة 16 ليتر', unit: 'TIN', price: 7400000, spLL: 8500000, spUSD: 95, tax: 0 },
  { barcode: '528100102', description: 'زيت زيتون بكر ممتاز قنينة 750مل', unit: 'BOT', price: 480000, spLL: 620000, spUSD: 7, tax: 0 },
  { barcode: '528100103', description: 'زيت زيتون بكر ممتاز قنينة 500مل', unit: 'BOT', price: 350000, spLL: 450000, spUSD: 5, tax: 0 },
  { barcode: '528400101', description: 'صندوق مربى تين معقود مع سمسم و جوز 800غ*12', unit: 'BOX', price: 1800000, spLL: 2250000, spUSD: 25, tax: 0 },
  { barcode: '528400102', description: 'صندوق مربى توت حب 800غ*12', unit: 'BOX', price: 1800000, spLL: 2250000, spUSD: 25, tax: 0 },
  { barcode: '528400103', description: 'صندوق مربى فريز حب 800غ*12', unit: 'BOX', price: 1800000, spLL: 2250000, spUSD: 25, tax: 0 },
  { barcode: '528500101', description: 'صندوق لبنة بقر مكمزلة سادة 600غ*12', unit: 'BOX', price: 2100000, spLL: 2600000, spUSD: 29, tax: 0 },
  { barcode: '528500102', description: 'صندوق لبنة بقر مكمزلة بحبة البركة 600غ*12', unit: 'BOX', price: 2200000, spLL: 2700000, spUSD: 30, tax: 0 },
  { barcode: '528300201', description: 'Printed Empty Metal Tin 16L', unit: 'PCS', price: 300000, spLL: 400000, spUSD: 4.5, tax: 11 },
  { barcode: '528200301', description: 'قنينة زجاج ماراسكا عاتمة 750مل كرتونة 12', unit: 'BOX', price: 960000, spLL: 1200000, spUSD: 13.5, tax: 11 }
];

export default function PurchasesView() {
  // Current screen mode: 'list' (Screenshot 1) or 'form' (Screenshot 2)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  // List View Filter State (matching Screenshot 1)
  const [filterBranch, setFilterBranch] = useState('All Branches');
  const [searchFilter, setSearchFilter] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses'); // All Statuses | Unposted | Posted
  const [filterSupplier, setFilterSupplier] = useState('All Suppliers');
  const [filterTransType, setFilterTransType] = useState('Invoice');
  const [filterTransfer, setFilterTransfer] = useState('All Trans. / Not Trans.'); // All | Not Transferred | Transferred
  const [fromDate, setFromDate] = useState('01-Sep-2026');
  const [toDate, setToDate] = useState('08-Sep-2026');

  // Locations state: All Locations and Choueifat Main Facility
  const [locations, setLocations] = useState<string[]>([
    'All Locations',
    'Choueifat Main Facility'
  ]);

  // Currencies state (audio 2: default LL, USD, EUR)
  const [currencies, setCurrencies] = useState<Array<{ desc: string; symbol: string; posRate: number; boRate: number; decimals: number }>>([
    { desc: 'Lebanese Pound', symbol: 'LL', posRate: 1, boRate: 1, decimals: 0 },
    { desc: 'US Dollar', symbol: '$', posRate: 89500, boRate: 89500, decimals: 2 },
    { desc: 'Euro', symbol: '€', posRate: 97200, boRate: 97200, decimals: 2 }
  ]);

  // Modals state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocAccDep, setNewLocAccDep] = useState('');

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [newCurrDesc, setNewCurrDesc] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrPosRate, setNewCurrPosRate] = useState('89500');
  const [newCurrBoRate, setNewCurrBoRate] = useState('89500');
  const [newCurrDecimals, setNewCurrDecimals] = useState('2');

  const [notice, setNotice] = useState<string | null>(null);

  // Purchases Master List State
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([
    {
      id: 'PUR-01',
      branch: 'Main Branch',
      date: '04-Sep-2026',
      deliveryDate: '04-Sep-2026',
      invoiceNumber: '4000041',
      supplier: 'Hasbaya & Marjeyoun Farmers Cooperative',
      supplierContact: 'Hajj Rida Abou Hamdan',
      supplierAddress: 'Hasbaya, South Governorate, Lebanon',
      supplierPhone: '+961 7 550 123',
      supplierEmail: 'info@hasbayafarmers.org',
      location: 'Choueifat Main Facility',
      currency: 'LL',
      currencyRate: 1,
      notes: 'Extra Virgin cold-press delivery - Harvest lot #12',
      amountLL: 185000000,
      enteredBy: 'Mohammed Jichi',
      updatedBy: 'Mohammed Jichi',
      updatedAt: '04-Sep-2026 14:20',
      posted: true,
      transferred: true,
      transactionType: 'Invoice',
      freight: 0,
      otherCost: 0,
      customCost: 0,
      charges: 0,
      subtotal: 185000000,
      totalTax: 0,
      totalDiscount: 0,
      items: [
        {
          id: 'item-1',
          barcode: '528100101',
          description: 'زيت زيتون بكر ممتاز تنكة 16 ليتر',
          qty: 25,
          unit: 'TIN',
          priceUnit: 7400000,
          discountPct: 0,
          discountAmt: 0,
          amount: 185000000,
          spLL: 8500000,
          spUSD: 95,
          tax1: 0,
          expiryDate: '30-Sep-2028'
        }
      ]
    },
    {
      id: 'PUR-02',
      branch: 'Main Branch',
      date: '06-Sep-2026',
      deliveryDate: '08-Sep-2026',
      invoiceNumber: '4000042',
      supplier: 'Mediterranean Glass Industries S.A.L',
      supplierContact: 'Karim Haddad',
      supplierAddress: 'Mkalles Industrial Zone, Beirut, Lebanon',
      supplierPhone: '+961 1 432 890',
      supplierEmail: 'sales@medglass-lb.com',
      location: 'Choueifat Main Facility',
      currency: 'LL',
      currencyRate: 1,
      notes: 'Dark UV Marasca bottles pallets for upcoming bottling run',
      amountLL: 96000000,
      enteredBy: 'Mohammed Jichi',
      updatedBy: 'Mohammed Jichi',
      updatedAt: '06-Sep-2026 11:15',
      posted: false, // Unposted draft!
      transferred: false,
      transactionType: 'Invoice',
      freight: 0,
      otherCost: 0,
      customCost: 0,
      charges: 0,
      subtotal: 96000000,
      totalTax: 10560000,
      totalDiscount: 0,
      items: [
        {
          id: 'item-2',
          barcode: '528200301',
          description: 'قنينة زجاج ماراسكا عاتمة 750مل كرتونة 12',
          qty: 100,
          unit: 'BOX',
          priceUnit: 960000,
          discountPct: 0,
          discountAmt: 0,
          amount: 96000000,
          spLL: 1200000,
          spUSD: 13.5,
          tax1: 11,
          expiryDate: ''
        }
      ]
    },
    {
      id: 'PUR-03',
      branch: 'Main Branch',
      date: '08-Sep-2026',
      deliveryDate: '08-Sep-2026',
      invoiceNumber: '4000043',
      supplier: 'Levant Tinplate Packaging Co.',
      supplierContact: 'Sami Salameh',
      supplierAddress: 'Dekwaneh Industrial Park, Beirut, Lebanon',
      supplierPhone: '+961 1 689 201',
      supplierEmail: 'contact@levanttin.com',
      location: 'Choueifat Main Facility',
      currency: 'LL',
      currencyRate: 1,
      notes: 'Sealed metal cans with traditional Lebanese cedar imprint',
      amountLL: 45000000,
      enteredBy: 'Mohammed Jichi',
      updatedBy: 'Mohammed Jichi',
      updatedAt: '08-Sep-2026 09:30',
      posted: true,
      transferred: true,
      transactionType: 'Invoice',
      freight: 0,
      otherCost: 0,
      customCost: 0,
      charges: 0,
      subtotal: 45000000,
      totalTax: 4950000,
      totalDiscount: 0,
      items: [
        {
          id: 'item-3',
          barcode: '528300201',
          description: 'Printed Empty Metal Tin 16L',
          qty: 150,
          unit: 'PCS',
          priceUnit: 300000,
          discountPct: 0,
          discountAmt: 0,
          amount: 45000000,
          spLL: 400000,
          spUSD: 4.5,
          tax1: 11,
          expiryDate: ''
        }
      ]
    }
  ]);

  // Form State (matching Screenshot 2)
  const [formBranch, setFormBranch] = useState('Main Branch');
  const [formLocation, setFormLocation] = useState('Choueifat Main Facility');
  const [formDate, setFormDate] = useState('08-Sep-2026');
  const [formDeliveryDate, setFormDeliveryDate] = useState('08-Sep-2026');
  const [formCurrency, setFormCurrency] = useState('LL');
  const [formCurrencyRate, setFormCurrencyRate] = useState<string>('1');
  const [formInvNumber, setFormInvNumber] = useState('4000044');
  const [formNote, setFormNote] = useState('');

  // Selected Supplier
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Item lines & options
  const [formItems, setFormItems] = useState<PurchaseItemLine[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [itemDiscountType, setItemDiscountType] = useState<'No Discount' | 'Discount Amount' | 'Discount %'>('No Discount');
  const [manualTaxCalc, setManualTaxCalc] = useState(false);
  const [enableTotalPrice, setEnableTotalPrice] = useState(false);

  // Other costs
  const [freightCost, setFreightCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [customCost, setCustomCost] = useState(0);
  const [chargesCost, setChargesCost] = useState(0);

  // Active edit invoice ID (if editing existing invoice)
  const [activeEditingInvoiceId, setActiveEditingInvoiceId] = useState<string | null>(null);

  // Currently selected supplier record
  const currentSupplierRecord = useMemo(() => {
    return DEFAULT_SUPPLIERS.find((s) => s.name === selectedSupplierName);
  }, [selectedSupplierName]);

  // Computed Totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalQty = 0;

    formItems.forEach((it) => {
      subtotal += it.amount;
      totalDiscount += it.discountAmt;
      totalQty += Number(it.qty) || 0;
      if (it.tax1 > 0) {
        totalTax += (it.amount * it.tax1) / 100;
      }
    });

    const netTotal = subtotal + totalTax - totalDiscount + freightCost + otherCost + customCost + chargesCost;

    return {
      subtotal,
      totalTax,
      totalDiscount,
      totalQty,
      netTotal
    };
  }, [formItems, freightCost, otherCost, customCost, chargesCost]);

  // Count unposted invoices
  const unpostedCount = useMemo(() => {
    return purchases.filter((p) => !p.posted).length;
  }, [purchases]);

  // Filtered purchases list
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (filterBranch !== 'All Branches' && p.branch !== filterBranch) return false;
      if (filterSupplier !== 'All Suppliers' && p.supplier !== filterSupplier) return false;
      if (filterStatus === 'Unposted' && p.posted) return false;
      if (filterStatus === 'Posted' && !p.posted) return false;
      if (filterTransfer === 'Not Transferred' && p.transferred) return false;
      if (filterTransfer === 'Transferred' && !p.transferred) return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchInv = p.invoiceNumber.toLowerCase().includes(q);
        const matchSup = p.supplier.toLowerCase().includes(q);
        const matchBranch = p.branch.toLowerCase().includes(q);
        if (!matchInv && !matchSup && !matchBranch) return false;
      }

      return true;
    });
  }, [purchases, filterBranch, filterSupplier, filterStatus, filterTransfer, searchFilter]);

  // Open New Purchase form
  const handlePostAllPurchases = () => {
    setPurchases(prev => prev.map(p => ({ ...p, posted: true })));
    setNotice('All unposted purchase invoices posted successfully.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenNewForm = () => {
    setActiveEditingInvoiceId(null);
    setSelectedSupplierName('');
    setFormBranch('Zeit w zaytoun ljanoub');
    setFormLocation('Choueifat Main Facility');
    setFormDate('08-Sep-2026');
    setFormDeliveryDate('08-Sep-2026');
    setFormCurrency('LL');
    setFormCurrencyRate('1');
    setFormInvNumber((4000040 + purchases.length + 1).toString());
    setFormNote('');
    setFormItems([]);
    setFreightCost(0);
    setOtherCost(0);
    setCustomCost(0);
    setChargesCost(0);
    setViewMode('form');
  };

  // Open existing purchase to view/edit
  const handleOpenEditInvoice = (inv: PurchaseInvoice) => {
    setActiveEditingInvoiceId(inv.id);
    setSelectedSupplierName(inv.supplier);
    setFormBranch(inv.branch);
    setFormLocation(inv.location);
    setFormDate(inv.date);
    setFormDeliveryDate(inv.deliveryDate);
    setFormCurrency(inv.currency);
    setFormCurrencyRate(inv.currencyRate.toString());
    setFormInvNumber(inv.invoiceNumber);
    setFormNote(inv.notes);
    setFormItems([...inv.items]);
    setFreightCost(inv.freight || 0);
    setOtherCost(inv.otherCost || 0);
    setCustomCost(inv.customCost || 0);
    setChargesCost(inv.charges || 0);
    setViewMode('form');
  };

  // Add Item to table
  const handleAddItem = (catItem: typeof PREDEFINED_CATALOG_ITEMS[0]) => {
    const newItem: PurchaseItemLine = {
      id: 'line-' + Date.now() + Math.random(),
      barcode: catItem.barcode,
      description: catItem.description,
      qty: 1,
      unit: catItem.unit,
      priceUnit: catItem.price,
      discountPct: 0,
      discountAmt: 0,
      amount: catItem.price,
      spLL: catItem.spLL,
      spUSD: catItem.spUSD,
      tax1: catItem.tax,
      expiryDate: '30-Sep-2028'
    };
    setFormItems((prev) => [...prev, newItem]);
    setItemSearchQuery('');
    setShowItemDropdown(false);
  };

  // Update item line field
  const handleUpdateItemLine = (id: string, field: keyof PurchaseItemLine, val: any) => {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        // Recalculate amount if qty, priceUnit, or discount changes
        const q = Number(updated.qty) || 0;
        const p = Number(updated.priceUnit) || 0;
        let d = Number(updated.discountAmt) || 0;
        if (field === 'discountPct') {
          const pct = Number(val) || 0;
          d = (q * p * pct) / 100;
          updated.discountAmt = d;
        } else if (field === 'discountAmt') {
          d = Number(val) || 0;
          updated.discountPct = q * p > 0 ? (d / (q * p)) * 100 : 0;
        }
        updated.amount = Math.max(0, q * p - d);
        return updated;
      })
    );
  };

  // Remove Item line
  const handleRemoveItem = (id: string) => {
    setFormItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Save as Draft (Unposted) -> audio requirement: explains where it goes and status
  const handleSaveDraft = () => {
    if (!selectedSupplierName) {
      alert('Please select a Supplier before saving.');
      return;
    }

    const newInvoice: PurchaseInvoice = {
      id: activeEditingInvoiceId || 'PUR-' + Date.now(),
      branch: formBranch,
      date: formDate,
      deliveryDate: formDeliveryDate,
      invoiceNumber: formInvNumber,
      supplier: selectedSupplierName,
      supplierContact: currentSupplierRecord?.contact,
      supplierAddress: currentSupplierRecord?.address,
      supplierPhone: currentSupplierRecord?.phone,
      supplierEmail: currentSupplierRecord?.email,
      location: formLocation,
      currency: formCurrency,
      currencyRate: Number(formCurrencyRate) || 1,
      notes: formNote,
      amountLL: totals.netTotal,
      enteredBy: 'Mohammed Jichi',
      updatedBy: 'Mohammed Jichi',
      updatedAt: '08-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      posted: false, // DRAFT / UNPOSTED
      transferred: false,
      transactionType: 'Invoice',
      items: formItems,
      freight: freightCost,
      otherCost,
      customCost,
      charges: chargesCost,
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount
    };

    setPurchases((prev) => {
      const idx = prev.findIndex((p) => p.id === newInvoice.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newInvoice;
        return copy;
      }
      return [newInvoice, ...prev];
    });

    setNotice(`Invoice #${formInvNumber} saved as UNPOSTED draft. Stock is not yet committed.`);
    setTimeout(() => setNotice(null), 4000);
    setViewMode('list');
  };

  // Save & Post (Immediate stock entry and GL posting)
  const handleSaveAndPost = () => {
    if (!selectedSupplierName) {
      alert('Please select a Supplier before saving.');
      return;
    }

    const newInvoice: PurchaseInvoice = {
      id: activeEditingInvoiceId || 'PUR-' + Date.now(),
      branch: formBranch,
      date: formDate,
      deliveryDate: formDeliveryDate,
      invoiceNumber: formInvNumber,
      supplier: selectedSupplierName,
      supplierContact: currentSupplierRecord?.contact,
      supplierAddress: currentSupplierRecord?.address,
      supplierPhone: currentSupplierRecord?.phone,
      supplierEmail: currentSupplierRecord?.email,
      location: formLocation,
      currency: formCurrency,
      currencyRate: Number(formCurrencyRate) || 1,
      notes: formNote,
      amountLL: totals.netTotal,
      enteredBy: 'Mohammed Jichi',
      updatedBy: 'Mohammed Jichi',
      updatedAt: '08-Sep-2026 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      posted: true, // POSTED IMMEDIATELY!
      transferred: true,
      transactionType: 'Invoice',
      items: formItems,
      freight: freightCost,
      otherCost,
      customCost,
      charges: chargesCost,
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount
    };

    setPurchases((prev) => {
      const idx = prev.findIndex((p) => p.id === newInvoice.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newInvoice;
        return copy;
      }
      return [newInvoice, ...prev];
    });

    setNotice(`Invoice #${formInvNumber} saved and POSTED successfully. Inventory committed to ${formLocation}.`);
    setTimeout(() => setNotice(null), 4500);
    setViewMode('list');
  };

  // Post an existing unposted draft invoice from table
  const handlePostInvoiceFromTable = (id: string, invNum: string, loc: string) => {
    if (confirm(`Do you want to POST Invoice #${invNum}? This will increase inventory in ${loc} and commit costs.`)) {
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, posted: true, transferred: true } : p))
      );
      setNotice(`Invoice #${invNum} has been POSTED. Inventory committed to ${loc}.`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Add Location Modal save (Screenshot 3)
  const handleSaveNewLocation = () => {
    if (!newLocDesc.trim()) {
      alert('Location Description is required.');
      return;
    }
    const locName = newLocDesc.trim();
    if (!locations.includes(locName)) {
      setLocations((prev) => [...prev, locName]);
    }
    setFormLocation(locName);
    setNewLocDesc('');
    setNewLocAccDep('');
    setShowLocationModal(false);
    setNotice(`New location "${locName}" created and selected.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Add Currency Modal save (Screenshot 4)
  const handleSaveNewCurrency = () => {
    if (!newCurrDesc.trim() || !newCurrSymbol.trim()) {
      alert('Description and Symbol are required.');
      return;
    }
    const newCurr = {
      desc: newCurrDesc.trim(),
      symbol: newCurrSymbol.trim(),
      posRate: parseFloat(newCurrPosRate) || 1,
      boRate: parseFloat(newCurrBoRate) || 1,
      decimals: parseInt(newCurrDecimals, 10) || 2
    };
    setCurrencies((prev) => [...prev, newCurr]);
    setFormCurrency(newCurr.symbol);
    setFormCurrencyRate(newCurr.boRate.toString());
    setNewCurrDesc('');
    setNewCurrSymbol('');
    setShowCurrencyModal(false);
    setNotice(`New currency "${newCurr.desc} (${newCurr.symbol})" created and selected.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="w-full text-slate-800 font-sans flex flex-col justify-between">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notice}</span>
        </div>
      )}

      <div>
        {/* Breadcrumb & Header Title matching Screenshot 1 & 2 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Purchases</h1>
              <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5 font-medium">
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span className="text-slate-600">Purchases</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#tutorial"
                onClick={(e) => { e.preventDefault(); alert('Opening Purchases Video Tutorial...'); }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Watch Tutorial
              </a>
              {viewMode === 'form' && (
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Purchases List</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PURCHASES LIST (Exact pixel-perfect match to Screenshot 1)        */}
        {/* ========================================================================= */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Filter Bar (3 rows matching Screenshot 1) */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Branch */}
                <div className="col-span-3 relative">
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All Branches">All Branches</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Search */}
                <div className="col-span-4">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by invoice # or supplier name ..."
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Statuses (audio 1: All Statuses, Unposted, Posted) */}
                <div className="col-span-2 relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Unposted">Unposted</option>
                    <option value="Posted">Posted</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Action Buttons: Unposted alert + Filter + New */}
                <div className="col-span-3 flex items-center justify-end gap-2 whitespace-nowrap">
                  {unpostedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterStatus(filterStatus === 'Unposted' ? 'All Statuses' : 'Unposted')}
                      className="text-xs text-red-600 font-bold hover:underline mr-1 cursor-pointer"
                      title="Click to view only unposted invoices"
                    >
                      Unposted Invoices: {unpostedCount}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setNotice('Purchases filtered.');
                      setTimeout(() => setNotice(null), 2000);
                    }}
                    className="bg-primary hover:bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded shadow-2xs cursor-pointer transition-colors"
                  >
                    Filter
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewForm}
                    className="bg-primary hover:bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Suppliers */}
                <div className="col-span-3 relative">
                  <select
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All Suppliers">All Suppliers</option>
                    {DEFAULT_SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Transaction Type (audio 1: Invoice, Purchase with back order, Inter Brands invoice) */}
                <div className="col-span-3 relative">
                  <select
                    value={filterTransType}
                    onChange={(e) => setFilterTransType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Invoice">Invoice</option>
                    <option value="Purchase with back order">Purchase with back order</option>
                    <option value="Inter Brands invoice">Inter Brands invoice</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Transfer Status (audio 1: All Trans. / Not Trans., Not Transferred, Transferred) */}
                <div className="col-span-3 relative">
                  <select
                    value={filterTransfer}
                    onChange={(e) => setFilterTransfer(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="All Trans. / Not Trans.">All Trans. / Not Trans.</option>
                    <option value="Not Transferred">Not Transferred</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Row 3: From Date / To Date */}
              <div className="flex items-center gap-6 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-medium">From</span>
                  <DatePickerInput
                    value={fromDate}
                    onChange={setFromDate}
                    inputWidth="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-medium">To</span>
                  <DatePickerInput
                    value={toDate}
                    onChange={setToDate}
                    inputWidth="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Purchases Table matching Screenshot 1 */}
            <div className="bg-white border border-slate-200 rounded overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse min-w-[1150px]">
                <thead className="bg-white text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-right">Amount (LL)</th>
                    <th className="py-2.5 px-3">Entered By</th>
                    <th className="py-2.5 px-3">Updated By</th>
                    <th className="py-2.5 px-3">Updated At</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-center">Posted</th>
                    <th className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>Actions</span>
                        <button
                          type="button"
                          onClick={handlePostAllPurchases}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs cursor-pointer transition-colors"
                          title="Post all unposted purchase invoices"
                        >
                          Post All
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPurchases.map((pur) => (
                    <tr
                      key={pur.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !pur.posted ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-900 font-medium">{pur.branch}</td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{pur.date}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        <button
                          type="button"
                          onClick={() => handleOpenEditInvoice(pur)}
                          className="hover:underline cursor-pointer"
                        >
                          #{pur.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">{pur.supplier}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {pur.amountLL.toLocaleString()} LL
                      </td>
                      <td className="py-3 px-3 text-slate-600">{pur.enteredBy}</td>
                      <td className="py-3 px-3 text-slate-600">{pur.updatedBy}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{pur.updatedAt}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={pur.notes}>
                        {pur.notes || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {pur.posted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            No (Draft)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditInvoice(pur)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                        {!pur.posted && (
                          <button
                            type="button"
                            onClick={() => handlePostInvoiceFromTable(pur.id, pur.invoiceNumber, pur.location)}
                            className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-2xs transition-colors"
                            title="Post invoice now (commit inventory and GL)"
                          >
                            Post
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                        No Purchases Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Centered Pagination matching Screenshot 1 */}
              <div className="py-3 flex items-center justify-center border-t border-slate-200 bg-white">
                <div className="flex items-center gap-1 text-xs">
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50">
                    «
                  </button>
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded text-blue-600 font-semibold bg-blue-50/50">
                    1
                  </button>
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50">
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PURCHASES FORM (Exact pixel-perfect match to Screenshot 2)        */}
        {/* ========================================================================= */}
        {viewMode === 'form' && (
          <div className="space-y-4">
            {/* Action Bar matching Screenshot 2: Export, Preview, Actions, New */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => alert('Exporting purchase details...')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded shadow-2xs cursor-pointer"
                title="Export Data"
              >
                <Tag className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="bg-primary hover:bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => alert('Actions: Duplicate, Print Voucher, Cancel')}
                  className="bg-primary hover:bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleOpenNewForm}
                className="bg-primary hover:bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Top 2 Cards: Supplier (Left) & Transaction (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card 1: Supplier */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded p-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h3 className="font-bold text-xs text-slate-800">Supplier</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="w-32 shrink-0 font-bold text-slate-700">Purchased From*</label>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={selectedSupplierName || supplierSearchQuery}
                        onChange={(e) => {
                          setSupplierSearchQuery(e.target.value);
                          setSelectedSupplierName('');
                          setShowSupplierDropdown(true);
                        }}
                        onFocus={() => setShowSupplierDropdown(true)}
                        placeholder="Search supplier ..."
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
                      />

                      {showSupplierDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto z-20">
                          {DEFAULT_SUPPLIERS.filter((s) =>
                            s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase())
                          ).map((sup) => (
                            <button
                              key={sup.id}
                              type="button"
                              onClick={() => {
                                setSelectedSupplierName(sup.name);
                                setSupplierSearchQuery('');
                                setShowSupplierDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 border-b border-slate-50 flex flex-col"
                            >
                              <span className="font-semibold text-slate-800">{sup.name}</span>
                              <span className="text-[11px] text-slate-500">{sup.contact} • {sup.phone}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Display Selected Supplier Metadata */}
                  {currentSupplierRecord && (
                    <div className="border-t border-slate-100 pt-2 text-xs space-y-1 text-slate-600 bg-slate-50/60 p-2.5 rounded">
                      <div className="flex">
                        <span className="w-24 font-semibold text-slate-700">Contact Name:</span>
                        <span className="text-slate-800">{currentSupplierRecord.contact}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-semibold text-slate-700">Address:</span>
                        <span className="text-slate-800">{currentSupplierRecord.address}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-semibold text-slate-700">Phone:</span>
                        <span className="text-slate-800">{currentSupplierRecord.phone}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-semibold text-slate-700">Email:</span>
                        <span className="text-slate-800">{currentSupplierRecord.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Transaction */}
              <div className="md:col-span-7 bg-white border border-slate-200 rounded p-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <h3 className="font-bold text-xs text-slate-800">Transaction</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Branch* */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Branch*:</label>
                    <div className="flex-1 relative">
                      <select
                        value={formBranch}
                        onChange={(e) => setFormBranch(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 bg-white appearance-none pr-7 shadow-2xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Main Branch">Main Branch</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Location* + [+] button (opens Screenshot 3 modal!) */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Location*:</label>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="relative flex-1">
                        <select
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 bg-white appearance-none pr-7 shadow-2xs focus:outline-none focus:border-blue-500"
                        >
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationModal(true)}
                        className="p-1 bg-primary hover:bg-primary text-white rounded cursor-pointer shadow-2xs"
                        title="Add New Location"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date* */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Date*:</label>
                    <div className="flex-1">
                      <DatePickerInput
                        value={formDate}
                        onChange={setFormDate}
                        inputWidth="w-full"
                      />
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Delivery Date:</label>
                    <div className="flex-1">
                      <DatePickerInput
                        value={formDeliveryDate}
                        onChange={setFormDeliveryDate}
                        inputWidth="w-full"
                      />
                    </div>
                  </div>

                  {/* Currency* + [+] button (opens Screenshot 4 modal!) */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Currency*:</label>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="relative flex-1">
                        <select
                          value={formCurrency}
                          onChange={(e) => {
                            setFormCurrency(e.target.value);
                            const c = currencies.find((curr) => curr.symbol === e.target.value);
                            if (c) setFormCurrencyRate(c.boRate.toString());
                          }}
                          className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 bg-white appearance-none pr-7 shadow-2xs focus:outline-none focus:border-blue-500"
                        >
                          {currencies.map((c) => (
                            <option key={c.symbol} value={c.symbol}>{c.desc} ({c.symbol})</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCurrencyModal(true)}
                        className="p-1 bg-primary hover:bg-primary text-white rounded cursor-pointer shadow-2xs"
                        title="Add New Currency"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="text"
                        value={formCurrencyRate}
                        onChange={(e) => setFormCurrencyRate(e.target.value)}
                        className="w-16 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 shadow-2xs"
                        title="Exchange Rate"
                      />
                    </div>
                  </div>

                  {/* Inv #* */}
                  <div className="flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Inv #*:</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={formInvNumber}
                        onChange={(e) => setFormInvNumber(e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 shadow-2xs font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setFormInvNumber((4000040 + purchases.length + 1).toString())}
                        className="p-1 text-slate-500 hover:text-slate-800 border border-slate-300 rounded"
                        title="Generate New Invoice Number"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <label className="w-24 shrink-0 font-bold text-slate-700">Note:</label>
                    <input
                      type="text"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Add notes for this purchase order / invoice ..."
                      className="flex-1 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Details (Items Table matching Screenshot 2) */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs text-slate-800">Details</h3>
              </div>

              {/* Items Filter Bar matching Screenshot 2 */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md relative">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    <input
                      type="text"
                      value={itemSearchQuery}
                      onChange={(e) => {
                        setItemSearchQuery(e.target.value);
                        setShowItemDropdown(true);
                      }}
                      onFocus={() => setShowItemDropdown(true)}
                      placeholder="Search items..."
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
                    />

                    {/* Catalog Autocomplete Dropdown */}
                    {showItemDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded shadow-xl max-h-52 overflow-y-auto z-30">
                        {PREDEFINED_CATALOG_ITEMS.filter((it) =>
                          it.description.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                          it.barcode.includes(itemSearchQuery)
                        ).map((cat) => (
                          <button
                            key={cat.barcode}
                            type="button"
                            onClick={() => handleAddItem(cat)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 border-b border-slate-50 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium text-slate-900" dir="rtl">{cat.description}</span>
                              <span className="text-[11px] text-slate-400 ml-2 font-mono">{cat.barcode}</span>
                            </div>
                            <span className="font-bold text-slate-700">{cat.price.toLocaleString()} LL</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Discount Mode */}
                  <div className="relative">
                    <select
                      value={itemDiscountType}
                      onChange={(e) => setItemDiscountType(e.target.value as any)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 bg-white appearance-none pr-7 shadow-2xs"
                    >
                      <option value="No Discount">No Discount</option>
                      <option value="Discount Amount">Discount Amount</option>
                      <option value="Discount %">Discount %</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                  </div>

                  {/* Checkboxes */}
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={manualTaxCalc}
                      onChange={(e) => setManualTaxCalc(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Manual tax calculation</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableTotalPrice}
                      onChange={(e) => setEnableTotalPrice(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Enable Total Price</span>
                  </label>

                  {/* Supplier items & Import items buttons */}
                  <button
                    type="button"
                    onClick={() => {
                      // Add default sample supplier items
                      PREDEFINED_CATALOG_ITEMS.slice(0, 3).forEach((item) => handleAddItem(item));
                    }}
                    className="bg-[#5c6b84] hover:bg-[#4b5972] text-white text-xs font-semibold px-3 py-1 rounded shadow-2xs cursor-pointer"
                  >
                    Supplier Items
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Import items dialog...')}
                    className="bg-[#5c6b84] hover:bg-[#4b5972] text-white text-xs font-semibold px-3 py-1 rounded shadow-2xs cursor-pointer"
                  >
                    Import Items
                  </button>
                </div>
              </div>

              {/* Items Table matching Screenshot 2 */}
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Barcode</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3 text-right">Price/Unit ({formCurrency})</th>
                      <th className="py-2 px-3 text-right">Disc.(%)</th>
                      <th className="py-2 px-3 text-right">Disc.</th>
                      <th className="py-2 px-3 text-right font-bold text-blue-700">Amount ({formCurrency}) »</th>
                      <th className="py-2 px-3 text-right">SP (LL)</th>
                      <th className="py-2 px-3 text-right">SP ($)</th>
                      <th className="py-2 px-3 text-center">TAX 1 »</th>
                      <th className="py-2 px-3">Expiry Date</th>
                      <th className="py-2 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {formItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono text-slate-600">{item.barcode}</td>
                        <td className="py-2 px-3 text-slate-900 font-medium" dir="rtl">
                          {item.description}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItemLine(item.id, 'qty', e.target.value)}
                            className="w-16 border border-slate-300 rounded px-2 py-0.5 text-xs text-right font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item.unit}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.priceUnit}
                            onChange={(e) => handleUpdateItemLine(item.id, 'priceUnit', e.target.value)}
                            className="w-24 border border-slate-300 rounded px-2 py-0.5 text-xs text-right font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPct}
                            onChange={(e) => handleUpdateItemLine(item.id, 'discountPct', e.target.value)}
                            className="w-14 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-right text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.discountAmt}
                            onChange={(e) => handleUpdateItemLine(item.id, 'discountAmt', e.target.value)}
                            className="w-20 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-right text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {item.amount.toLocaleString()} LL
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          {item.spLL.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          ${item.spUSD}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[11px] font-semibold text-slate-600">{item.tax1}%</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {item.expiryDate || '-'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="Delete Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {formItems.length === 0 && (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-slate-400 font-medium">
                          No items added yet. Use &quot;Search items...&quot; above or click &quot;Supplier Items&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Other Costs & Totals matching Screenshot 2 */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h3 className="font-bold text-xs text-slate-800">Other Costs</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Left Side: Freight, Other Cost, Custom, Charges */}
                <div className="space-y-2 border-r border-slate-100 pr-6">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Freight:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={freightCost}
                        onChange={(e) => setFreightCost(Number(e.target.value) || 0)}
                        className="w-24 border border-slate-300 rounded px-2 py-0.5 text-right text-xs font-bold"
                      />
                      <span className="text-slate-500 font-semibold">LL</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Other Cost:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={otherCost}
                        onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
                        className="w-24 border border-slate-300 rounded px-2 py-0.5 text-right text-xs font-bold"
                      />
                      <span className="text-slate-500 font-semibold">LL</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Custom:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={customCost}
                        onChange={(e) => setCustomCost(Number(e.target.value) || 0)}
                        className="w-24 border border-slate-300 rounded px-2 py-0.5 text-right text-xs font-bold"
                      />
                      <span className="text-slate-500 font-semibold">LL</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Charges:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={chargesCost}
                        onChange={(e) => setChargesCost(Number(e.target.value) || 0)}
                        className="w-24 border border-slate-300 rounded px-2 py-0.5 text-right text-xs font-bold"
                      />
                      <span className="text-slate-500 font-semibold">LL</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Totals Summary matching Screenshot 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {totals.subtotal.toLocaleString()} LL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Tax:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {totals.totalTax.toLocaleString()} LL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Discount:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {totals.totalDiscount.toLocaleString()} LL
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="font-bold text-sm text-slate-900">Total:</span>
                    <span className="font-mono font-bold text-sm text-blue-700">
                      {totals.netTotal.toLocaleString()} LL
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Total Quantities:</span>
                    <span className="font-mono font-semibold">{totals.totalQty.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Save (Orange) & Save & Post (Green) matching Screenshot 2 */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {/* Save Draft (Orange button #f07e13) */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                title="Save as Unposted Draft (Invoice saved in Purchases list, stock not yet committed)"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              {/* Save & Post (Green button #198754) */}
              <button
                type="button"
                onClick={handleSaveAndPost}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                title="Save & Post (Immediately commits inventory to stock and posts to Accounts Payable)"
              >
                <FileText className="w-4 h-4" />
                <span>Save &amp; Post</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW LOCATION (Exact pixel-perfect match to Screenshot 3)         */}
      {/* ========================================================================= */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">New Location</h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields matching Screenshot 3 */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Location Description *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newLocDesc}
                    onChange={(e) => setNewLocDesc(e.target.value)}
                    placeholder="e.g. Damour Secondary Warehouse"
                    className="w-full border-2 border-blue-400 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Accounting Dep.
                  </label>
                  <input
                    type="text"
                    value={newLocAccDep}
                    onChange={(e) => setNewLocAccDep(e.target.value)}
                    placeholder="e.g. Center #3"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button (Dark navy blue #2f3b52) */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNewLocation}
                className="bg-primary hover:bg-primary text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEW CURRENCY (Exact pixel-perfect match to Screenshot 4)         */}
      {/* ========================================================================= */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">New Currency</h3>
              <button
                type="button"
                onClick={() => setShowCurrencyModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields matching Screenshot 4 */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Description*
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newCurrDesc}
                    onChange={(e) => setNewCurrDesc(e.target.value)}
                    placeholder="e.g. British Pound"
                    className="w-full border-2 border-blue-400 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Symbol*
                  </label>
                  <input
                    type="text"
                    value={newCurrSymbol}
                    onChange={(e) => setNewCurrSymbol(e.target.value)}
                    placeholder="e.g. £"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    POS Rate*
                  </label>
                  <input
                    type="number"
                    value={newCurrPosRate}
                    onChange={(e) => setNewCurrPosRate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 shadow-2xs font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    BackOffice Rate*
                  </label>
                  <input
                    type="number"
                    value={newCurrBoRate}
                    onChange={(e) => setNewCurrBoRate(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 shadow-2xs font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Decimal Number*
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={newCurrDecimals}
                    onChange={(e) => setNewCurrDecimals(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-400 shadow-2xs font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Save Button (Dark navy blue #2f3b52) */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNewCurrency}
                className="bg-primary hover:bg-primary text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer matching Screenshot 1 & 2 */}
      <footer className="mt-12 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
        <span>© 2026 Omega Software All rights reserved.</span>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#privacy" className="hover:text-slate-700">Privacy Policy</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#terms" className="hover:text-slate-700">Terms and Conditions</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#support" className="hover:text-slate-700">Support</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#feedback" className="hover:text-slate-700">Feedback</a>
      </footer>
    </div>
  );
}
