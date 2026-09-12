'use client';

import React, { useState, useMemo, useEffect } from 'react';

// Interfaces for Purchase Order
export interface PurchaseOrderItem {
  id: string;
  code: string;
  barcode: string;
  description: string;
  branchName: string;
  qty: number;
  qtyReceived?: number;
  unit: string;
  priceUnit: number;
  discPercent: number;
  discAmount: number;
  amount: number;
  deliveryDate?: string;
  sp1?: number;
  spSecCur?: number;
  tax1: number;
  taxEnabled?: boolean;
  notes?: string;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  branch: string;
  location: string;
  shipmentType: string;
  orderDate: string; // e.g. '2026-09-02'
  deliveryDate: string; // e.g. '2026-09-18'
  supplier: string;
  supplierContact?: string;
  supplierAddress?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierEmailCc?: string;
  currency: string;
  currencyRate: number;
  notes: string;
  enteredBy: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Converted';
  emailStatus: 'Sent' | 'Not Sent';
  items: PurchaseOrderItem[];
  discountType: 'percent' | 'amount';
  discountValue: number;
  freight: number;
  customs: number;
  otherCost: number;
  documentUrl?: string;
  documentName?: string;
}

// Pre-seeded authentic initial Purchase Orders
const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: 'PO-REC-01',
    poNumber: 'PO-2026-601',
    branch: 'Main Branch',
    location: 'Choueifat Main Facility',
    shipmentType: 'Local Delivery',
    orderDate: '2026-09-04',
    deliveryDate: '2026-09-18',
    supplier: 'Levant Tinplate Packaging Co.',
    supplierContact: 'Sami Salameh',
    supplierAddress: 'Dekwaneh Industrial Park, Beirut, Lebanon',
    supplierPhone: '+961 1 689 201',
    supplierEmail: 'contact@levanttin.com',
    supplierEmailCc: 'logistics@levanttin.com',
    currency: 'USD',
    currencyRate: 89500,
    notes: 'Lithographed 16-Liter Food Grade Sealed Tins batch',
    enteredBy: 'Mohamad Jichi',
    status: 'Approved',
    emailStatus: 'Sent',
    discountType: 'percent',
    discountValue: 0,
    freight: 150,
    customs: 0,
    otherCost: 50,
    items: [
      {
        id: 'POI-101',
        code: '528300201',
        barcode: '528300201',
        description: 'تنكة معدنية فارغة مطبوعة 16 ليتر (Food Grade Sealed Tins)',
        branchName: 'Main Branch',
        qty: 2000,
        qtyReceived: 0,
        unit: 'TIN',
        priceUnit: 2.35,
        discPercent: 0,
        discAmount: 0,
        amount: 4700,
        deliveryDate: '2026-09-18',
        sp1: 300000,
        tax1: 0,
        taxEnabled: false
      }
    ]
  },
  {
    id: 'PO-REC-02',
    poNumber: 'PO-2026-602',
    branch: 'Main Branch',
    location: 'Choueifat Main Facility',
    shipmentType: 'Land Transport',
    orderDate: '2026-09-02',
    deliveryDate: '2026-09-12',
    supplier: 'Hasbaya & Marjeyoun Farmers Cooperative',
    supplierContact: 'Hajj Rida Abou Hamdan',
    supplierAddress: 'Hasbaya, South Governorate, Lebanon',
    supplierPhone: '+961 7 550 123',
    supplierEmail: 'info@hasbayafarmers.org',
    supplierEmailCc: 'coop@hasbayafarmers.org',
    currency: 'USD',
    currencyRate: 89500,
    notes: 'Second Harvest Wave Sourani & Baladi Olives Batch',
    enteredBy: 'Mohamad Jichi',
    status: 'Approved',
    emailStatus: 'Sent',
    discountType: 'percent',
    discountValue: 0,
    freight: 250,
    customs: 0,
    otherCost: 0,
    items: [
      {
        id: 'POI-201',
        code: '528100101',
        barcode: '528100101',
        description: 'ثمار زيتون صوراني وبلدي نخب أول (Sourani Olive Crop)',
        branchName: 'Main Branch',
        qty: 15000,
        qtyReceived: 0,
        unit: 'KG',
        priceUnit: 0.724,
        discPercent: 0,
        discAmount: 0,
        amount: 10860,
        deliveryDate: '2026-09-12',
        sp1: 8500000,
        tax1: 0,
        taxEnabled: false
      }
    ]
  }
];

// Available Suppliers catalog
const SUPPLIERS_CATALOG = [
  {
    name: 'Abbas & Hussein Dirani',
    contact: 'Abbas',
    address: 'Beirut, Lebanon',
    phone: '+961 1 550 120',
    email: 'dirani@gmail.com',
    emailCc: ''
  },
  {
    name: 'Abbas Dirani',
    contact: 'Abbas Dirani',
    address: 'South Lebanon',
    phone: '+961 76 939 604',
    email: 'abbas.dirani@gmail.com',
    emailCc: ''
  },
  {
    name: 'B GROUP',
    contact: 'B Group Logistics',
    address: 'Beirut Port Freezone, Lebanon',
    phone: '+961 1 445 670',
    email: 'info@bgroup.com.lb',
    emailCc: 'logistics@bgroup.com.lb'
  },
  {
    name: 'C-Way Trading',
    contact: 'C-Way Procurement',
    address: 'Dekwaneh Industrial Park, Lebanon',
    phone: '+961 1 689 201',
    email: 'orders@cwaytrading.com',
    emailCc: 'accounts@cwaytrading.com'
  },
  {
    name: 'Clatchy',
    contact: 'Clatchy Packaging',
    address: 'Mkalles Industrial Zone, Lebanon',
    phone: '+961 1 432 890',
    email: 'contact@clatchy.com',
    emailCc: 'support@clatchy.com'
  },
  {
    name: 'Ezzeddin',
    contact: 'Ezzeddin Est.',
    address: 'Tyre Commercial Street, Lebanon',
    phone: '+961 7 740 555',
    email: 'ezzeddin@gmail.com',
    emailCc: ''
  },
  {
    name: 'Koubeissi Est.',
    contact: 'Koubeissi',
    address: 'Choueifat Industrial Zone, Lebanon',
    phone: '+961 5 434 734',
    email: 'koubeissi.est@gmail.com',
    emailCc: ''
  },
  {
    name: 'Mrs Randa',
    contact: 'Mrs Randa',
    address: 'Nabatieh Governorate, Lebanon',
    phone: '+961 7 760 120',
    email: 'randa.olives@gmail.com',
    emailCc: ''
  },
  {
    name: 'Safa Bakery',
    contact: 'Safa Bakery Admin',
    address: 'Beirut, Lebanon',
    phone: '+961 1 820 400',
    email: 'safabakery@gmail.com',
    emailCc: ''
  },
  {
    name: 'Sedi Hisham',
    contact: 'Abir',
    address: 'Beirut, Lebanon',
    phone: '+961 1 300 200',
    email: 'sedihisham@gmail.com',
    emailCc: ''
  },
  {
    name: 'SOOL',
    contact: 'Southern Olive Oil Products Logistics',
    address: 'Choueifat Main Facility, Lebanon',
    phone: '+961 5 432 100',
    email: 'procurement@sool.com.lb',
    emailCc: 'logistics@sool.com.lb'
  },
  {
    name: 'Zahwe',
    contact: 'Zahwe Agriculture',
    address: 'Kfarroummane, Nabatieh, Lebanon',
    phone: '+961 70 798 854',
    email: 'zahwe.farm@gmail.com',
    emailCc: ''
  },
  {
    name: 'الضيعة',
    contact: 'Al Dayaa Co.',
    address: 'Marjeyoun District, South Lebanon',
    phone: '+961 70 325 417',
    email: 'aldayaa@gmail.com',
    emailCc: ''
  },
  {
    name: 'مؤسسة عبده للتجارة',
    contact: 'Abdo Trading Est.',
    address: 'Saida Coastal Highway, Lebanon',
    phone: '+961 7 725 330',
    email: 'abdo.trading@gmail.com',
    emailCc: ''
  }
];

// Inventory products catalog for quick item addition
const ITEMS_CATALOG = [
  { code: '528300201', barcode: '528300201', description: 'تنكة معدنية فارغة مطبوعة 16 ليتر', unit: 'TIN', price: 2.35, sp1: 300000 },
  { code: '528200301', barcode: '528200301', description: 'قنينة زجاج ماراسكا عاتمة 750مل كرتونة 12', unit: 'BOX', price: 10.75, sp1: 1200000 },
  { code: '528100101', barcode: '528100101', description: 'ثمار زيتون صوراني وبلدي عصير نخب أول', unit: 'KG', price: 0.724, sp1: 95000 },
  { code: '528100102', barcode: '528100102', description: 'زيت زيتون بكر ممتاز قنينة 750مل', unit: 'BOT', price: 5.36, sp1: 620000 },
  { code: '528100103', barcode: '528100103', description: 'زيت زيتون بكر ممتاز قنينة 500مل', unit: 'BOT', price: 3.91, sp1: 450000 },
  { code: '528400101', barcode: '528400101', description: 'صندوق مربى تين معقود مع سمسم و جوز 800غ*12', unit: 'BOX', price: 20.11, sp1: 2250000 },
  { code: '528400102', barcode: '528400102', description: 'صندوق مربى توت حب 800غ*12', unit: 'BOX', price: 20.11, sp1: 2250000 },
  { code: '528500101', barcode: '528500101', description: 'صندوق لبنة بقر مكمزلة سادة 600غ*12', unit: 'BOX', price: 23.46, sp1: 2600000 }
];

export default function PurchaseOrderView() {
  // Mode: true = Preview Table (Picture 1), false = New/Edit Form
  const [showPreviewList, setShowPreviewList] = useState<boolean>(true);

  // Purchase orders list state
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>(INITIAL_PURCHASE_ORDERS);
  const [activeOrder, setActiveOrder] = useState<PurchaseOrderRecord | null>(null);

  // Preview List Filter States (Matching Picture 1)
  const [filterBranch, setFilterBranch] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentStatus, setFilterSentStatus] = useState('All Sent/NotSent');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [filterSupplier, setFilterSupplier] = useState('All Suppliers');
  const [filterDateType, setFilterDateType] = useState('Delivery Date');
  const [fromDate, setFromDate] = useState('01-Sep-2026');
  const [toDate, setToDate] = useState('10-Sep-2026');
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  // Form State (when showPreviewList == false)
  const [formPoNumber, setFormPoNumber] = useState('PO-2026-603');
  const [formBranch, setFormBranch] = useState('Main Branch');
  const [formLocation, setFormLocation] = useState('Choueifat Main Facility');
  const [formShipment, setFormShipment] = useState('Local Delivery');
  const [formOrderDate, setFormOrderDate] = useState('2026-09-10');
  const [formDeliveryDate, setFormDeliveryDate] = useState('2026-09-24');
  const [formSupplier, setFormSupplier] = useState(SUPPLIERS_CATALOG[0]);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formCurrencyRate, setFormCurrencyRate] = useState<number>(89500);
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<PurchaseOrderItem[]>([]);
  const [formDiscType, setFormDiscType] = useState<'percent' | 'amount'>('percent');
  const [formDiscValue, setFormDiscValue] = useState<number>(0);
  const [formFreight, setFormFreight] = useState<number>(0);
  const [formCustoms, setFormCustoms] = useState<number>(0);
  const [formOtherCost, setFormOtherCost] = useState<number>(0);
  const [enableManualTax, setEnableManualTax] = useState(false);
  const [enableTotalPrice, setEnableTotalPrice] = useState(false);
  const [searchItemInput, setSearchItemInput] = useState('');
  const [showOtherCosts, setShowOtherCosts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showStoreRecurringModal, setShowStoreRecurringModal] = useState(false);
  const [showRecallRecurringModal, setShowRecallRecurringModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showSupplierItemsModal, setShowSupplierItemsModal] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  // Email modal inputs
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Supporting Doc inputs
  const [docUrlInput, setDocUrlInput] = useState('');
  const [docNameInput, setDocNameInput] = useState('');

  // Recurring template name input
  const [recurringName, setRecurringName] = useState('');
  const [recurringTemplates, setRecurringTemplates] = useState<{ name: string; items: PurchaseOrderItem[] }[]>([
    {
      name: 'Standard Weekly 16L Tinplate Supply',
      items: [
        {
          id: 'REC-01',
          code: '528300201',
          barcode: '528300201',
          description: 'تنكة معدنية فارغة مطبوعة 16 ليتر',
          branchName: 'Marjeyoun Press Mill & Silos',
          qty: 1000,
          unit: 'TIN',
          priceUnit: 2.35,
          discPercent: 0,
          discAmount: 0,
          amount: 2350,
          tax1: 0
        }
      ]
    }
  ]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: Open New Purchase Order
  const handleNewBtnClick = () => {
    const nextSeq = orders.length + 601;
    const nextPoNum = `PO-2026-${nextSeq}`;
    setFormPoNumber(nextPoNum);
    setFormBranch('Marjeyoun Press Mill & Silos');
    setFormLocation('Choueifat Main Facility');
    setFormShipment('Local Delivery');
    setFormOrderDate('2026-09-10');
    setFormDeliveryDate('2026-09-24');
    setFormSupplier(SUPPLIERS_CATALOG[0]);
    setFormCurrency('USD');
    setFormCurrencyRate(89500);
    setFormNotes('');
    setFormItems([]);
    setFormDiscType('percent');
    setFormDiscValue(0);
    setFormFreight(0);
    setFormCustoms(0);
    setFormOtherCost(0);
    setActiveOrder(null);
    setShowPreviewList(false);
  };

  // Helper: Open existing Purchase Order for Edit / Review
  const handleEditOrder = (po: PurchaseOrderRecord) => {
    setActiveOrder(po);
    setFormPoNumber(po.poNumber);
    setFormBranch(po.branch);
    setFormLocation(po.location);
    setFormShipment(po.shipmentType);
    setFormOrderDate(po.orderDate);
    setFormDeliveryDate(po.deliveryDate);
    const supp = SUPPLIERS_CATALOG.find(s => s.name === po.supplier) || {
      name: po.supplier,
      contact: po.supplierContact || '',
      address: po.supplierAddress || '',
      phone: po.supplierPhone || '',
      email: po.supplierEmail || '',
      emailCc: po.supplierEmailCc || ''
    };
    setFormSupplier(supp);
    setFormCurrency(po.currency);
    setFormCurrencyRate(po.currencyRate);
    setFormNotes(po.notes);
    setFormItems(JSON.parse(JSON.stringify(po.items)));
    setFormDiscType(po.discountType);
    setFormDiscValue(po.discountValue);
    setFormFreight(po.freight);
    setFormCustoms(po.customs);
    setFormOtherCost(po.otherCost);
    setShowPreviewList(false);
  };

  // Filter logic for preview list
  const filteredOrders = useMemo(() => {
    // In Picture 1, the user's initial screen is filtered to "Pending" and "01-Sep-2026" to "10-Sep-2026",
    // where no pending orders exist yet, so the list renders completely empty (matching Picture 1).
    return orders.filter(po => {
      // Branch filter
      if (filterBranch !== 'All Branches' && po.branch !== filterBranch) return false;
      // Supplier filter
      if (filterSupplier !== 'All Suppliers' && po.supplier !== filterSupplier) return false;
      // Sent / NotSent filter
      if (filterSentStatus === 'Sent' && po.emailStatus !== 'Sent') return false;
      if (filterSentStatus === 'Not Sent' && po.emailStatus !== 'Not Sent') return false;
      // Status filter
      if (filterStatus !== 'All' && filterStatus !== 'All Statuses') {
        if (po.status !== filterStatus) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = po.poNumber.toLowerCase().includes(q);
        const matchSupp = po.supplier.toLowerCase().includes(q);
        const matchItem = po.items.some(it => it.description.toLowerCase().includes(q) || it.code.includes(q));
        if (!matchNum && !matchSupp && !matchItem) return false;
      }
      return true;
    });
  }, [orders, filterBranch, filterSupplier, filterSentStatus, filterStatus, searchQuery]);

  // Calculations for active form
  const subtotal = useMemo(() => {
    return formItems.reduce((acc, it) => acc + (it.qty * it.priceUnit), 0);
  }, [formItems]);

  const discountAmount = useMemo(() => {
    if (formDiscType === 'percent') {
      return (subtotal * formDiscValue) / 100;
    }
    return formDiscValue;
  }, [subtotal, formDiscType, formDiscValue]);

  const totalTax = useMemo(() => {
    return formItems.reduce((acc, it) => acc + (it.taxEnabled ? (it.amount * 0.11) : 0), 0);
  }, [formItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + totalTax + formFreight + formCustoms + formOtherCost);
  }, [subtotal, discountAmount, totalTax, formFreight, formCustoms, formOtherCost]);

  const grandTotalLL = useMemo(() => {
    if (formCurrency === 'LL' || formCurrency === 'LBP') return grandTotal;
    return grandTotal * formCurrencyRate;
  }, [grandTotal, formCurrency, formCurrencyRate]);

  const totalQuantities = useMemo(() => {
    return formItems.reduce((acc, it) => acc + it.qty, 0);
  }, [formItems]);

  // Handle item updates
  const updateItemRow = (id: string, field: keyof PurchaseOrderItem, value: any) => {
    setFormItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'priceUnit' || field === 'discPercent' || field === 'discAmount') {
        const lineNet = updated.qty * updated.priceUnit;
        const disc = updated.discPercent > 0 ? (lineNet * updated.discPercent / 100) : updated.discAmount;
        updated.amount = Math.max(0, lineNet - disc);
      }
      return updated;
    }));
  };

  // Remove item row
  const removeItemRow = (id: string) => {
    setFormItems(prev => prev.filter(i => i.id !== id));
  };

  // Add Item to details grid
  const addItemToDetails = (catItem: typeof ITEMS_CATALOG[0]) => {
    const newItem: PurchaseOrderItem = {
      id: `POI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: catItem.code,
      barcode: catItem.barcode,
      description: catItem.description,
      branchName: formBranch,
      qty: 1,
      unit: catItem.unit,
      priceUnit: catItem.price,
      discPercent: 0,
      discAmount: 0,
      amount: catItem.price,
      deliveryDate: formDeliveryDate,
      sp1: catItem.sp1,
      tax1: 0,
      taxEnabled: false
    };
    setFormItems(prev => [...prev, newItem]);
    triggerToast(`Added ${catItem.description}`);
  };

  // Save Purchase Order
  const handleSaveOrder = (post: boolean = false) => {
    if (!formSupplier || !formSupplier.name) {
      alert('Please choose a supplier');
      return;
    }
    if (formItems.length === 0) {
      alert('Please add at least one item to the purchase order details');
      return;
    }

    const newOrder: PurchaseOrderRecord = {
      id: activeOrder ? activeOrder.id : `PO-REC-${Date.now()}`,
      poNumber: formPoNumber,
      branch: formBranch,
      location: formLocation,
      shipmentType: formShipment,
      orderDate: formOrderDate,
      deliveryDate: formDeliveryDate,
      supplier: formSupplier.name,
      supplierContact: formSupplier.contact,
      supplierAddress: formSupplier.address,
      supplierPhone: formSupplier.phone,
      supplierEmail: formSupplier.email,
      supplierEmailCc: formSupplier.emailCc,
      currency: formCurrency,
      currencyRate: formCurrencyRate,
      notes: formNotes,
      enteredBy: 'Mohamad Jichi',
      status: post ? 'Approved' : (activeOrder ? activeOrder.status : 'Pending'),
      emailStatus: activeOrder ? activeOrder.emailStatus : 'Not Sent',
      items: formItems,
      discountType: formDiscType,
      discountValue: formDiscValue,
      freight: formFreight,
      customs: formCustoms,
      otherCost: formOtherCost,
      documentUrl: activeOrder?.documentUrl,
      documentName: activeOrder?.documentName
    };

    if (activeOrder) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? newOrder : o));
      triggerToast(`Purchase Order #${formPoNumber} updated successfully.`);
    } else {
      setOrders(prev => [newOrder, ...prev]);
      triggerToast(`Purchase Order #${formPoNumber} created successfully.`);
    }

    setShowPreviewList(true);
  };

  // Approve PO
  const handleApprovePO = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'Approved' } : o));
    triggerToast(`Purchase Order #${activeOrder.poNumber} has been APPROVED.`);
    setShowPreviewList(true);
  };

  // Reject PO
  const handleRejectPO = () => {
    if (!activeOrder) return;
    const reason = prompt('Enter reason for rejection:', 'Price exceeds seasonal threshold');
    if (reason !== null) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'Rejected', notes: `Rejected: ${reason}` } : o));
      triggerToast(`Purchase Order #${activeOrder.poNumber} REJECTED.`);
      setShowPreviewList(true);
    }
  };

  // Convert to Purchase Invoice
  const handleConvertToInvoice = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'Converted' } : o));
    triggerToast(`Purchase Order #${activeOrder.poNumber} successfully converted to Purchase Invoice.`);
    setShowPreviewList(true);
  };

  // Delete PO
  const handleDeletePO = () => {
    if (!activeOrder) return;
    if (confirm(`Are you sure you want to delete Purchase Order #${activeOrder.poNumber}?`)) {
      setOrders(prev => prev.filter(o => o.id !== activeOrder.id));
      triggerToast(`Purchase Order #${activeOrder.poNumber} deleted.`);
      setShowPreviewList(true);
    }
  };

  // Send PO via Email
  const handleOpenEmailModal = () => {
    setEmailTo(formSupplier.email || '');
    setEmailCc(formSupplier.emailCc || '');
    setEmailSubject(`Purchase Order #${formPoNumber} - Vanguard Southern Olive Oil Products`);
    setEmailBody(`Dear ${formSupplier.contact || formSupplier.name},\n\nPlease find attached Purchase Order #${formPoNumber} for delivery scheduled on ${formDeliveryDate}.\n\nTotal Items: ${formItems.length}\nGrand Total: $${grandTotal.toLocaleString()} (${formCurrency})\n\nPlease confirm receipt and processing.\n\nBest regards,\nProcurement Department\nSouthern Olive Oil Products S.A.R.L`);
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    if (activeOrder) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, emailStatus: 'Sent' } : o));
    }
    setShowEmailModal(false);
    triggerToast(`Purchase Order #${formPoNumber} emailed to ${emailTo}`);
  };

  return (
    <div className="w-full bg-[#f4f6f9] text-[#333] font-sans antialiased min-h-screen text-[13px] leading-normal pb-16 select-text">
      {/* GLOBAL NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#27ae60] text-white px-5 py-3 rounded shadow-xl flex items-center gap-3 animate-fade-in border border-[#219d55] text-sm font-medium">
          <i className="fa fa-check-circle text-lg"></i>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-white hover:opacity-75">
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 1: SHOW PREVIEW LIST (PICTURE 1)
          ========================================================================= */}
      {showPreviewList ? (
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 py-4">
          {/* OMEGA AUTHENTIC HEADER */}
          <div className="header mb-4">
            <h1 className="text-[24px] font-normal text-[#2b5797] m-0 mb-1 leading-tight tracking-tight">
              Purchase Order
            </h1>
            <div className="text-[12px] text-[#777]">
              <a
                href="#inventory"
                onClick={(e) => { e.preventDefault(); setShowPreviewList(true); }}
                className="text-[#337ab7] hover:underline cursor-pointer"
              >
                Home
              </a>
              <span className="mx-1 text-[#999]">/</span>
              <span className="text-[#777]">Purchase Order</span>
            </div>
          </div>

          {/* OMEGA AUTHENTIC TWO-ROW FILTER BAR */}
          <div className="bg-white rounded border border-[#e7ebee] p-3.5 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center mb-2.5">
              {/* Branch Selector */}
              <div className="col-span-12 md:col-span-3">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="All Branches">All Branches</option>
                  <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                </select>
              </div>

              {/* Search input */}
              <div className="col-span-12 md:col-span-3">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Po #, Supplier, Item"
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#337ab7]"
                />
              </div>

              {/* Email Sent / Not Sent */}
              <div className="col-span-12 md:col-span-2">
                <select
                  value={filterSentStatus}
                  onChange={(e) => setFilterSentStatus(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="All Sent/NotSent">All Sent/NotSent</option>
                  <option value="Sent">Sent</option>
                  <option value="Not Sent">Not Sent</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-span-12 md:col-span-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Converted">Converted</option>
                  <option value="All">All Statuses</option>
                </select>
              </div>

              {/* Action Buttons: Filter & + New */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setHasAppliedFilter(true); triggerToast('Filtered records'); }}
                  className="h-[34px] px-4 bg-[#34495e] hover:bg-[#2c3e50] text-white text-[13px] font-medium rounded transition shadow-xs cursor-pointer"
                >
                  Filter
                </button>
                <button
                  type="button"
                  onClick={handleNewBtnClick}
                  className="h-[34px] px-4 bg-[#34495e] hover:bg-[#2c3e50] text-white text-[13px] font-medium rounded transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-plus text-xs"></i>
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Supplier Selector */}
              <div className="col-span-12 md:col-span-3">
                <select
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="All Suppliers">All Suppliers</option>
                  {SUPPLIERS_CATALOG.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Delivery Date Filter Type */}
              <div className="col-span-12 md:col-span-3">
                <select
                  value={filterDateType}
                  onChange={(e) => setFilterDateType(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="Delivery Date">Delivery Date</option>
                  <option value="Order Date">Order Date</option>
                </select>
              </div>

              {/* From Date */}
              <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                <label className="text-[13px] text-[#333] whitespace-nowrap min-w-[38px]">From</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full h-[34px] pl-3 pr-8 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i className="fa fa-calendar text-xs"></i>
                  </span>
                </div>
              </div>

              {/* To Date */}
              <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                <label className="text-[13px] text-[#333] whitespace-nowrap min-w-[20px]">To</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full h-[34px] pl-3 pr-8 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i className="fa fa-calendar text-xs"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OMEGA AUTHENTIC PREVIEW TABLE (MATCHING PICTURE 1) */}
          <div className="bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7ebee] text-[#333] bg-[#fafafa]">
                    <th className="py-2.5 px-3 font-semibold text-left">Branch</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Delivery Date</th>
                    <th className="py-2.5 px-3 font-semibold text-left">PO Number</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Supplier</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount (LL)</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Entered By</th>
                    <th className="py-2.5 px-3 font-semibold text-left">Notes</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    /* EMPTY ROW STATE - IDENTICAL TO PICTURE 1 */
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 bg-white">
                        {/* Clean subtle divider spacing exactly matching Omega ERP empty list */}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((po) => {
                      const amountLL = po.currency === 'LL' ? po.items.reduce((s, i) => s + i.amount, 0) : po.items.reduce((s, i) => s + i.amount, 0) * po.currencyRate;
                      return (
                        <tr
                          key={po.id}
                          className="border-b border-gray-100 hover:bg-slate-50 transition"
                        >
                          <td className="py-2.5 px-3 text-[#333]">{po.branch}</td>
                          <td className="py-2.5 px-3 text-[#333]">
                            {po.deliveryDate}
                            <div className="text-[11px] text-[#337ab7]">#{po.poNumber}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#333]">{po.poNumber}</td>
                          <td className="py-2.5 px-3 text-[#333]">{po.supplier}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#333]">
                            {amountLL.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-[#555]">{po.enteredBy}</td>
                          <td className="py-2.5 px-3 text-[#777] max-w-[200px] truncate">{po.notes}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                                po.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : po.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : po.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              title="Open"
                              onClick={() => handleEditOrder(po)}
                              className="w-7 h-7 inline-flex items-center justify-center bg-[#34495e] hover:bg-[#2c3e50] text-white rounded text-xs transition cursor-pointer"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* OMEGA PAGINATION « 1 » (EXACTLY MATCHING PICTURE 1) */}
            <div className="py-3 px-4 border-t border-[#e7ebee] flex justify-center items-center bg-white">
              <div className="inline-flex items-center gap-1 text-[12px]">
                <button
                  disabled
                  className="w-8 h-8 rounded border border-[#d2d6de] bg-white text-gray-400 flex items-center justify-center cursor-not-allowed text-xs"
                >
                  &laquo;
                </button>
                <button
                  className="w-8 h-8 rounded border border-[#337ab7] bg-[#337ab7] text-white flex items-center justify-center font-medium text-xs"
                >
                  1
                </button>
                <button
                  disabled
                  className="w-8 h-8 rounded border border-[#d2d6de] bg-white text-gray-400 flex items-center justify-center cursor-not-allowed text-xs"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>

          {/* OMEGA AUTHENTIC FOOTER (MATCHING PICTURE 1) */}
          <footer className="mt-16 text-center text-[11px] text-[#777]">
            <span>&copy; 2026 Omega Software All rights reserved.</span>
            <span className="mx-2">|</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline text-[#777]">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline text-[#777]">Terms and Conditions</a>
            <span className="mx-2">|</span>
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:underline text-[#777]">Support</a>
            <span className="mx-2">|</span>
            <a href="#feedback" onClick={(e) => e.preventDefault()} className="hover:underline text-[#777]">Feedback</a>
          </footer>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: AUTHENTIC NEW / EDIT PURCHASE ORDER FORM
            ========================================================================= */
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 py-4">
          {/* HEADER */}
          <div className="header mb-3">
            <h1 className="text-[24px] font-normal text-[#2b5797] m-0 mb-1 leading-tight tracking-tight">
              Purchase Order
            </h1>
            <div className="text-[12px] text-[#777]">
              <a
                href="#inventory"
                onClick={(e) => { e.preventDefault(); setShowPreviewList(true); }}
                className="text-[#337ab7] hover:underline cursor-pointer"
              >
                Home
              </a>
              <span className="mx-1 text-[#999]">/</span>
              <span className="text-[#777]">Purchase Order</span>
            </div>
          </div>

          {/* TOP ACTION TOOLBAR (IDENTICAL TO OMEGA ERP) */}
          <div className="bg-white border border-[#e7ebee] rounded p-2 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Supporting Document */}
              <button
                type="button"
                title="Supporting Document"
                onClick={() => setShowDocModal(true)}
                className="h-[32px] px-3 bg-[#27ae60] hover:bg-[#219d55] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-upload"></i>
                <span className="hidden sm:inline">Supporting Document</span>
              </button>

              {/* Email PO */}
              <button
                type="button"
                title="Email PO"
                onClick={handleOpenEmailModal}
                className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-envelope"></i>
                <span className="hidden sm:inline">Email PO</span>
              </button>

              {/* Preview Button (Takes user back to Picture 1 list) */}
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-search"></i>
                <span>Preview</span>
              </button>

              {/* Actions Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                  className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Actions</span>
                  <i className="fa fa-caret-down"></i>
                </button>

                {actionsMenuOpen && (
                  <div className="origin-top-left absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 text-xs text-[#333]">
                    <button
                      onClick={() => { setShowStoreRecurringModal(true); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-repeat text-gray-500"></i>
                      <span>Store Recurring</span>
                    </button>
                    <button
                      onClick={() => { setShowRecallRecurringModal(true); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-history text-gray-500"></i>
                      <span>Recall Recurring</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Items selling price synchronized with retail index'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-tags text-gray-500"></i>
                      <span>Update Items Selling Price</span>
                    </button>
                    <button
                      onClick={() => { window.print(); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-print text-gray-500"></i>
                      <span>Print PO</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Barcodes generated for print queue'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-barcode text-gray-500"></i>
                      <span>Print Barcodes</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Purchase Order transferred to General Ledger'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-exchange text-gray-500"></i>
                      <span>Transfer To Accounting</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Items Pricing Matrix Loaded'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-dollar text-gray-500"></i>
                      <span>Items Pricing</span>
                    </button>
                  </div>
                )}
              </div>

              {/* New Button */}
              <button
                type="button"
                onClick={handleNewBtnClick}
                className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-plus"></i>
                <span>New</span>
              </button>
            </div>

            {/* Back button */}
            <div>
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[32px] px-3 bg-gray-100 hover:bg-gray-200 text-[#555] text-xs rounded border border-gray-300 transition cursor-pointer"
              >
                <i className="fa fa-arrow-left me-1"></i> Back to Orders
              </button>
            </div>
          </div>

          {/* TWO MAIN PANELS: SUPPLIER & TRANSACTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
            {/* LEFT CARD: SUPPLIER */}
            <div className="lg:col-span-5 bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="bg-[#fafafa] border-b border-[#e7ebee] px-3.5 py-2 font-semibold text-[#333] text-[13px] flex items-center justify-between">
                <span>Supplier</span>
                <span className="text-gray-400 text-xs">Purchased From</span>
              </div>
              <div className="p-3.5 min-h-[224px]">
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[13px] font-bold text-[#333] whitespace-nowrap min-w-[110px]">
                    Purchased From*
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formSupplier.name}
                      readOnly
                      placeholder="Search supplier ..."
                      className="w-full h-[34px] px-3 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(true)}
                    className="h-[34px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-xs transition cursor-pointer"
                    title="Search Supplier"
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>

                {/* Supplier Information Card */}
                {formSupplier && (
                  <div className="border-t border-dotted border-gray-300 pt-3 text-[12px] space-y-1.5 text-[#555]">
                    <div className="flex">
                      <span className="font-semibold text-[#333] w-28">Contact Name:</span>
                      <span className="flex-1">{formSupplier.contact || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-[#333] w-28">Address:</span>
                      <span className="flex-1">{formSupplier.address || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-[#333] w-28">Phone:</span>
                      <span className="flex-1">{formSupplier.phone || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-[#333] w-28">Email:</span>
                      <span className="flex-1 text-[#337ab7]">{formSupplier.email || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT CARD: TRANSACTION */}
            <div className="lg:col-span-7 bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="bg-[#fafafa] border-b border-[#e7ebee] px-3.5 py-2 font-semibold text-[#333] text-[13px] flex items-center justify-between">
                <span>Transaction</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-normal">#</span>
                  <input
                    type="text"
                    value={formPoNumber}
                    onChange={(e) => setFormPoNumber(e.target.value)}
                    className="h-[22px] w-[130px] px-2 text-xs border border-gray-300 rounded bg-gray-50 font-mono font-medium"
                  />
                </div>
              </div>
              <div className="p-3.5 space-y-2.5">
                {/* Branch and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Branch*:</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    >
                      <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Location*:</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    >
                      <option value="All Locations">All Locations</option>
                      <option value="Choueifat Main Facility">Choueifat Main Facility</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="h-[32px] w-[32px] bg-[#337ab7] hover:bg-[#286090] text-white rounded text-xs flex items-center justify-center cursor-pointer"
                      title="Add Location"
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Shipment and Order Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Shipment*:</label>
                    <select
                      value={formShipment}
                      onChange={(e) => setFormShipment(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    >
                      <option value="Local Delivery">Local Delivery</option>
                      <option value="Land Transport">Land Transport</option>
                      <option value="Maritime Cargo">Maritime Cargo</option>
                      <option value="Air Freight">Air Freight</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Date*:</label>
                    <input
                      type="date"
                      value={formOrderDate}
                      onChange={(e) => setFormOrderDate(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    />
                  </div>
                </div>

                {/* Currency and Delivery Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Currency*:</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => {
                        const cur = e.target.value;
                        setFormCurrency(cur);
                        setFormCurrencyRate(cur === 'LL' || cur === 'LBP' ? 1 : 89500);
                      }}
                      className="w-24 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    >
                      <option value="USD">USD</option>
                      <option value="LL">LL</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCurrencyModal(true)}
                      className="h-[32px] w-[32px] bg-[#337ab7] hover:bg-[#286090] text-white rounded text-xs flex items-center justify-center cursor-pointer"
                      title="Add Currency"
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                    <input
                      type="number"
                      value={formCurrencyRate}
                      onChange={(e) => setFormCurrencyRate(parseFloat(e.target.value) || 1)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-right font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Delivery:</label>
                    <input
                      type="date"
                      value={formDeliveryDate}
                      onChange={(e) => setFormDeliveryDate(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="flex items-center gap-2">
                  <label className="text-[13px] font-bold text-[#333] w-20 whitespace-nowrap">Note:</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="General purchase order instructions, inspection terms, delivery gates..."
                    className="flex-1 h-[32px] px-3 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS CARD: PRODUCTS GRID */}
          <div className="bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-3">
            <div className="bg-[#fafafa] border-b border-[#e7ebee] px-3.5 py-2 font-semibold text-[#333] text-[13px]">
              Details
            </div>

            {/* DETAILS TOOLBAR */}
            <div className="p-3 border-b border-[#e7ebee] bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Item input */}
                <div className="relative w-72">
                  <input
                    type="search"
                    value={searchItemInput}
                    onChange={(e) => setSearchItemInput(e.target.value)}
                    placeholder="Search items by code or name..."
                    className="w-full h-[32px] pl-3 pr-8 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333] focus:outline-none focus:border-[#337ab7]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowItemModal(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowItemModal(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#337ab7]"
                  >
                    <i className="fa fa-search text-xs"></i>
                  </button>
                </div>

                {/* Discount selector */}
                <select
                  value={formDiscType}
                  onChange={(e) => setFormDiscType(e.target.value as any)}
                  className="h-[32px] px-2 bg-white border border-[#d2d6de] rounded text-[13px] text-[#333]"
                >
                  <option value="percent">Discount (%)</option>
                  <option value="amount">Discount ({formCurrency})</option>
                </select>

                <input
                  type="number"
                  value={formDiscValue}
                  onChange={(e) => setFormDiscValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 h-[32px] px-2 text-right bg-white border border-[#d2d6de] rounded text-[13px]"
                />

                {/* Manual Tax Checkbox */}
                <label className="flex items-center gap-1.5 text-xs text-[#555] cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={enableManualTax}
                    onChange={(e) => setEnableManualTax(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Manual tax calculation</span>
                </label>

                {/* Enable Total Price Checkbox */}
                <label className="flex items-center gap-1.5 text-xs text-[#555] cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={enableTotalPrice}
                    onChange={(e) => setEnableTotalPrice(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Enable Total Price</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierItemsModal(true)}
                  className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-cubes"></i>
                  <span>Supplier Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(true)}
                  className="h-[32px] px-3 bg-[#337ab7] hover:bg-[#286090] text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-plus"></i>
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            {/* DETAILS ITEMS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7ebee] text-[#333] bg-[#fafafa]">
                    <th className="py-2 px-3 font-semibold w-[120px]">Code</th>
                    <th className="py-2 px-3 font-semibold min-w-[240px]">Description</th>
                    <th className="py-2 px-3 font-semibold w-[160px]">Branch</th>
                    <th className="py-2 px-3 font-semibold text-right w-[90px]">Qty</th>
                    <th className="py-2 px-3 font-semibold w-[70px]">Unit</th>
                    <th className="py-2 px-3 font-semibold text-right w-[110px]">Price/Unit ({formCurrency})</th>
                    <th className="py-2 px-3 font-semibold text-right w-[80px]">Disc.(%)</th>
                    <th className="py-2 px-3 font-semibold text-right w-[80px]">Disc.</th>
                    <th className="py-2 px-3 font-semibold text-right w-[110px]">Amount ({formCurrency})</th>
                    <th className="py-2 px-3 font-semibold text-center w-[60px]">VAT</th>
                    <th className="py-2 px-3 font-semibold text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {formItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-gray-400 bg-white">
                        <i className="fa fa-shopping-basket text-2xl mb-2 text-gray-300"></i>
                        <div>No items added to this purchase order yet.</div>
                        <button
                          type="button"
                          onClick={() => setShowItemModal(true)}
                          className="mt-2 text-xs text-[#337ab7] hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <i className="fa fa-plus"></i> Click here to select items from catalog
                        </button>
                      </td>
                    </tr>
                  ) : (
                    formItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-mono text-xs font-semibold text-[#337ab7]">
                          {item.code}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#333]">
                          {item.description}
                        </td>
                        <td className="py-2 px-3 text-[#555] text-xs">
                          {item.branchName}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            value={item.qty}
                            onChange={(e) => updateItemRow(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-20 h-[26px] px-1.5 text-right font-mono border border-gray-300 rounded text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-xs text-[#555]">
                          {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={item.priceUnit}
                            onChange={(e) => updateItemRow(item.id, 'priceUnit', parseFloat(e.target.value) || 0)}
                            className="w-24 h-[26px] px-1.5 text-right font-mono border border-gray-300 rounded text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={item.discPercent}
                            onChange={(e) => updateItemRow(item.id, 'discPercent', parseFloat(e.target.value) || 0)}
                            className="w-16 h-[26px] px-1.5 text-right font-mono border border-gray-300 rounded text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={item.discAmount}
                            onChange={(e) => updateItemRow(item.id, 'discAmount', parseFloat(e.target.value) || 0)}
                            className="w-16 h-[26px] px-1.5 text-right font-mono border border-gray-300 rounded text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-[#333]">
                          {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.taxEnabled || false}
                            onChange={(e) => updateItemRow(item.id, 'taxEnabled', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove row"
                          >
                            <i className="fa fa-trash-o text-sm"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS SUMMARY & BOTTOM ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
            {/* OTHER COSTS ACCORDION */}
            <div className="lg:col-span-6 bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3">
              <button
                type="button"
                onClick={() => setShowOtherCosts(!showOtherCosts)}
                className="w-full flex items-center justify-between font-semibold text-[#333] text-[13px] cursor-pointer"
              >
                <span>Other Direct Costs (Freight, Customs, Port)</span>
                <i className={`fa fa-chevron-${showOtherCosts ? 'up' : 'down'} text-gray-400`}></i>
              </button>

              {showOtherCosts && (
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs text-[#555] block mb-1">Freight ({formCurrency})</label>
                    <input
                      type="number"
                      value={formFreight}
                      onChange={(e) => setFormFreight(parseFloat(e.target.value) || 0)}
                      className="w-full h-[28px] px-2 text-right border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#555] block mb-1">Customs ({formCurrency})</label>
                    <input
                      type="number"
                      value={formCustoms}
                      onChange={(e) => setFormCustoms(parseFloat(e.target.value) || 0)}
                      className="w-full h-[28px] px-2 text-right border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#555] block mb-1">Other Cost ({formCurrency})</label>
                    <input
                      type="number"
                      value={formOtherCost}
                      onChange={(e) => setFormOtherCost(parseFloat(e.target.value) || 0)}
                      className="w-full h-[28px] px-2 text-right border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TOTALS SUMMARY TABLE (MATCHING OMEGA EXACTLY) */}
            <div className="lg:col-span-6 bg-white border border-[#e7ebee] rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <table className="w-full text-[13px] border-collapse">
                <tbody>
                  <tr className="border-b border-[#e7ebee] bg-[#f2f4f7]">
                    <th className="py-1.5 px-3 font-semibold text-left text-[#333]">Subtotal:</th>
                    <td className="py-1.5 px-3 text-right font-mono text-[#333]">
                      {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  <tr className="border-b border-[#e7ebee]">
                    <th className="py-1.5 px-3 font-semibold text-left text-[#333]">Total Discount:</th>
                    <td className="py-1.5 px-3 text-right font-mono text-red-600">
                      -{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  {(formFreight > 0 || formCustoms > 0 || formOtherCost > 0) && (
                    <tr className="border-b border-[#e7ebee]">
                      <th className="py-1.5 px-3 font-semibold text-left text-[#333]">Additional Logistics:</th>
                      <td className="py-1.5 px-3 text-right font-mono text-[#333]">
                        +{(formFreight + formCustoms + formOtherCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-[#e7ebee]">
                    <th className="py-1.5 px-3 font-semibold text-left text-[#333]">VAT / Tax (11%):</th>
                    <td className="py-1.5 px-3 text-right font-mono text-[#333]">
                      {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  <tr className="border-b border-[#c9cfd8] bg-[#eef2f7]">
                    <th className="py-2 px-3 font-bold text-left text-[#2b5797] text-sm">Grand Total:</th>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#2b5797] text-base">
                      {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  {formCurrency !== 'LL' && (
                    <tr className="border-b border-[#e7ebee] bg-white">
                      <th className="py-1.5 px-3 text-xs text-gray-500 text-left">Equivalent (LL @ {formCurrencyRate.toLocaleString()}):</th>
                      <td className="py-1.5 px-3 text-right font-mono text-xs text-gray-600 font-semibold">
                        {grandTotalLL.toLocaleString()} LL
                      </td>
                    </tr>
                  )}
                  <tr className="bg-white">
                    <th className="py-1.5 px-3 text-xs text-[#800000] text-left">Total Quantities:</th>
                    <td className="py-1.5 px-3 text-right font-mono text-xs text-[#800000] font-semibold">
                      {totalQuantities.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM FORM ACTION BUTTONS (IDENTICAL TO OMEGA ERP) */}
          <div className="bg-white border border-[#e7ebee] rounded p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Omega Orange Save Button */}
              <button
                type="button"
                onClick={() => handleSaveOrder(false)}
                className="h-[36px] px-5 bg-[#fb8205] hover:bg-[#e07302] border border-[#da6f00] text-white text-[13px] font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-save"></i>
                <span>Save</span>
              </button>

              {/* Save & Post Button */}
              <button
                type="button"
                onClick={() => handleSaveOrder(true)}
                className="h-[36px] px-5 bg-[#27ae60] hover:bg-[#219d55] text-white text-[13px] font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-check"></i>
                <span>Save & Post</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[36px] px-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[#555] text-[13px] rounded transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* If editing existing PO: Approve, Reject, Convert, Delete */}
            {activeOrder && (
              <div className="flex items-center gap-2">
                {activeOrder.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={handleApprovePO}
                      className="h-[36px] px-4 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa fa-thumbs-up"></i>
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPO}
                      className="h-[36px] px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa fa-ban"></i>
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {activeOrder.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={handleConvertToInvoice}
                    className="h-[36px] px-4 bg-[#27ae60] hover:bg-[#219d55] text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa fa-exchange"></i>
                    <span>Convert to Purchase Invoice</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeletePO}
                  className="h-[36px] px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa fa-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SEARCH SUPPLIER MODAL
          ========================================================================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#fafafa] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-[#333] text-sm flex items-center gap-2">
                <i className="fa fa-building text-[#337ab7]"></i>
                <span>Select Supplier</span>
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
              {SUPPLIERS_CATALOG.map((s) => (
                <div
                  key={s.name}
                  onClick={() => {
                    setFormSupplier(s);
                    setShowSupplierModal(false);
                    triggerToast(`Selected supplier: ${s.name}`);
                  }}
                  className="p-3 border border-gray-200 rounded hover:border-[#337ab7] hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#333] text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">Contact: {s.contact} | {s.phone}</div>
                    <div className="text-[11px] text-gray-400">{s.address}</div>
                  </div>
                  <button className="text-xs px-2.5 py-1 bg-[#337ab7] text-white rounded">Select</button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-[#333] text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SEARCH INVENTORY ITEMS MODAL
          ========================================================================= */}
      {showItemModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#fafafa] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-[#333] text-sm flex items-center gap-2">
                <i className="fa fa-cubes text-[#337ab7]"></i>
                <span>Search Inventory Item Catalog</span>
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                    <th className="p-2">Code</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS_CATALOG.map((item) => (
                    <tr key={item.code} className="border-b border-gray-100 hover:bg-blue-50/40">
                      <td className="p-2 font-mono font-semibold text-[#337ab7]">{item.code}</td>
                      <td className="p-2 font-medium text-[#333]">{item.description}</td>
                      <td className="p-2 text-gray-500">{item.unit}</td>
                      <td className="p-2 text-right font-mono font-bold">${item.price.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            addItemToDetails(item);
                            setShowItemModal(false);
                          }}
                          className="px-2.5 py-1 bg-[#27ae60] hover:bg-[#219d55] text-white rounded text-[11px] font-medium"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-[#333] text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EMAIL PO MODAL
          ========================================================================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-envelope"></i>
                <span>Email Purchase Order #{formPoNumber}</span>
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">To Email*:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">CC Email:</label>
                <input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject*:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Message Body:</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5"
              >
                <i className="fa fa-paper-plane"></i>
                <span>Send PO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SUPPORTING DOCUMENT MODAL
          ========================================================================= */}
      {showDocModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#27ae60] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-upload"></i>
                <span>Attach Supporting Document</span>
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Title / Reference:</label>
                <input
                  type="text"
                  value={docNameInput}
                  onChange={(e) => setDocNameInput(e.target.value)}
                  placeholder="e.g. Proforma Invoice / Supplier Quotation #8841"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#27ae60] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Document URL or Cloud File Link:</label>
                <input
                  type="url"
                  value={docUrlInput}
                  onChange={(e) => setDocUrlInput(e.target.value)}
                  placeholder="https://storage.vanguard-erp.lb/docs/po-603.pdf"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#27ae60] focus:outline-none"
                />
              </div>
              <div className="p-3 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
                <i className="fa fa-cloud-upload text-2xl text-gray-400 mb-1 block"></i>
                <span>Drag & drop signed proforma PDF or delivery specifications here</span>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDocModal(false);
                  triggerToast('Supporting document attached successfully');
                }}
                className="px-4 py-1.5 bg-[#27ae60] hover:bg-[#219d55] text-white text-xs font-bold rounded"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: STORE RECURRING MODAL
          ========================================================================= */}
      {showStoreRecurringModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-repeat"></i>
                <span>Store as Recurring Purchase Template</span>
              </h3>
              <button onClick={() => setShowStoreRecurringModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-gray-600">
                Save the {formItems.length} lines in this order to recall them instantly in future purchase orders.
              </p>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Template Name*:</label>
                <input
                  type="text"
                  value={recurringName}
                  onChange={(e) => setRecurringName(e.target.value)}
                  placeholder="e.g. Monthly Olive Tin Supply (Marjeyoun)"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStoreRecurringModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!recurringName.trim()) {
                    alert('Please enter template name');
                    return;
                  }
                  setRecurringTemplates(prev => [...prev, { name: recurringName, items: formItems }]);
                  setShowStoreRecurringModal(false);
                  triggerToast(`Saved template "${recurringName}"`);
                  setRecurringName('');
                }}
                className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded"
              >
                Store Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: RECALL RECURRING MODAL
          ========================================================================= */}
      {showRecallRecurringModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-history"></i>
                <span>Recall Recurring Template</span>
              </h3>
              <button onClick={() => setShowRecallRecurringModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-2 text-xs">
              {recurringTemplates.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormItems(JSON.parse(JSON.stringify(t.items)));
                    setShowRecallRecurringModal(false);
                    triggerToast(`Recalled ${t.items.length} items from template "${t.name}"`);
                  }}
                  className="p-3 border border-gray-200 rounded hover:border-[#337ab7] hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#333]">{t.name}</div>
                    <div className="text-gray-500 text-[11px]">{t.items.length} item lines defined</div>
                  </div>
                  <button className="px-2.5 py-1 bg-[#337ab7] text-white rounded text-xs">Recall</button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowRecallRecurringModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: QUICK ADD LOCATION MODAL
          ========================================================================= */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-map-marker"></i>
                <span>Add Storage Location</span>
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Location Name*:</label>
                <input
                  type="text"
                  placeholder="e.g. Silo C - Raw Oil Tank #4"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                  id="newLocationName"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('newLocationName') as HTMLInputElement;
                  if (el && el.value.trim()) {
                    setFormLocation(el.value.trim());
                    triggerToast(`Location "${el.value.trim()}" added`);
                  }
                  setShowLocationModal(false);
                }}
                className="px-3 py-1 bg-[#337ab7] text-white text-xs font-bold rounded"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 8: QUICK ADD CURRENCY MODAL
          ========================================================================= */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-money"></i>
                <span>Add Currency</span>
              </h3>
              <button onClick={() => setShowCurrencyModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Currency Symbol (e.g. GBP, AED):</label>
                <input
                  type="text"
                  placeholder="e.g. GBP"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                  id="newCurSymbol"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Exchange Rate to LL:</label>
                <input
                  type="number"
                  placeholder="114000"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-[#337ab7] focus:outline-none"
                  id="newCurRate"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCurrencyModal(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const symEl = document.getElementById('newCurSymbol') as HTMLInputElement;
                  const rateEl = document.getElementById('newCurRate') as HTMLInputElement;
                  if (symEl && symEl.value.trim()) {
                    setFormCurrency(symEl.value.trim());
                    if (rateEl && rateEl.value) {
                      setFormCurrencyRate(parseFloat(rateEl.value) || 89500);
                    }
                    triggerToast(`Currency "${symEl.value.trim()}" activated`);
                  }
                  setShowCurrencyModal(false);
                }}
                className="px-3 py-1 bg-[#337ab7] text-white text-xs font-bold rounded"
              >
                Add Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 9: SUPPLIER ITEMS MODAL
          ========================================================================= */}
      {showSupplierItemsModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-[#337ab7] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-cubes"></i>
                <span>Items Supplied by {formSupplier.name}</span>
              </h3>
              <button onClick={() => setShowSupplierItemsModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[380px] overflow-y-auto space-y-2 text-xs">
              {ITEMS_CATALOG.slice(0, 4).map((item) => (
                <div
                  key={item.code}
                  className="p-3 border border-gray-200 rounded flex items-center justify-between hover:bg-slate-50"
                >
                  <div>
                    <div className="font-bold text-[#333]">{item.description}</div>
                    <div className="text-gray-500 font-mono text-[11px]">Code: {item.code} | Unit: {item.unit}</div>
                    <div className="text-emerald-700 font-bold font-mono">${item.price.toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addItemToDetails(item);
                      setShowSupplierItemsModal(false);
                    }}
                    className="px-3 py-1.5 bg-[#27ae60] hover:bg-[#219d55] text-white rounded font-medium text-xs flex items-center gap-1"
                  >
                    <i className="fa fa-plus"></i>
                    <span>Add to PO</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowSupplierItemsModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
