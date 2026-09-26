'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabase';

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
        description: 'Printed Empty Metal Tin 16L (Food Grade Sealed Tins)',
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
        description: 'Sourani & Local First Grade Olives (Sourani Olive Crop)',
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
    name: 'Al-Dayaa',
    contact: 'Al Dayaa Co.',
    address: 'Marjeyoun District, South Lebanon',
    phone: '+961 70 325 417',
    email: 'aldayaa@gmail.com',
    emailCc: ''
  },
  {
    name: 'Abdo Trading Est.',
    contact: 'Abdo Trading Est.',
    address: 'Saida Coastal Highway, Lebanon',
    phone: '+961 7 725 330',
    email: 'abdo.trading@gmail.com',
    emailCc: ''
  }
];

// Inventory products catalog for quick item addition
const ITEMS_CATALOG = [
  { code: '528300201', barcode: '528300201', description: 'Printed Empty Metal Tin 16L', unit: 'TIN', price: 2.35, sp1: 300000 },
  { code: '528200301', barcode: '528200301', description: 'قنينة زجاج ماراسكا عاتمة 750مل كرتونة 12', unit: 'BOX', price: 10.75, sp1: 1200000 },
  { code: '528100101', barcode: '528100101', description: 'ثمار زيتون صوراني وبلدي عصير نخب أول', unit: 'KG', price: 0.724, sp1: 95000 },
  { code: '528100102', barcode: '528100102', description: 'زيت زيتون بكر ممتاز قنينة 750مل', unit: 'BOT', price: 5.36, sp1: 620000 },
  { code: '528100103', barcode: '528100103', description: 'زيت زيتون بكر ممتاز قنينة 500مل', unit: 'BOT', price: 3.91, sp1: 450000 },
  { code: '528400101', barcode: '528400101', description: 'صندوق مربى تين معقود مع سمسم و جوز 800غ*12', unit: 'BOX', price: 20.11, sp1: 2250000 },
  { code: '528400102', barcode: '528400102', description: 'صندوق مربى توت حب 800غ*12', unit: 'BOX', price: 20.11, sp1: 2250000 },
  { code: '528500101', barcode: '528500101', description: 'صندوق لبنة بقر مكمزلة سادة 600غ*12', unit: 'BOX', price: 23.46, sp1: 2600000 }
];

export default function PurchaseOrderView() {
  const { t, dir } = useLanguage();
  const { currentTenant } = useTenant();

  // Mount hydration from Supabase
  useEffect(() => {
    async function loadPersistedOrders() {
      try {
        const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data, error } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetId)
          .maybeSingle();

        if (data?.feature_flags?.purchase_orders && Array.isArray(data.feature_flags.purchase_orders) && data.feature_flags.purchase_orders.length > 0) {
          setOrders(data.feature_flags.purchase_orders);
        }
      } catch (err) {
        console.warn('Notice loading purchase orders from database:', err);
      }
    }
    loadPersistedOrders();
  }, [currentTenant?.id]);

  const persistOrdersToDatabase = async (newOrders: PurchaseOrderRecord[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || currentTenant?.feature_flags || {};
      const { error: dbError } = await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            purchase_orders: newOrders
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database connection error' };
    }
  };

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
          description: 'Printed Empty Metal Tin 16L',
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
  const handleSaveOrder = async (post: boolean = false) => {
    if (activeOrder && activeOrder.status === 'Converted') {
      triggerToast(t('po_locked_converted_notice', 'Cannot modify: Purchase Order is already converted to a Purchase Invoice and is locked.'));
      return;
    }
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

    let updated: PurchaseOrderRecord[];
    if (activeOrder) {
      updated = orders.map(o => o.id === activeOrder.id ? newOrder : o);
    } else {
      updated = [newOrder, ...orders];
    }

    const res = await persistOrdersToDatabase(updated);
    if (!res.success) {
      triggerToast(`Database persistence failed: ${res.error}`);
      return;
    }

    setOrders(updated);
    triggerToast(activeOrder ? `Purchase Order #${formPoNumber} updated in database.` : `Purchase Order #${formPoNumber} created in database.`);
    setShowPreviewList(true);
  };

  // Approve PO
  const handleApprovePO = async () => {
    if (!activeOrder) return;
    const updated = orders.map(o => o.id === activeOrder.id ? { ...o, status: 'Approved' as const } : o);
    const res = await persistOrdersToDatabase(updated);
    if (!res.success) {
      triggerToast(`Database persistence failed: ${res.error}`);
      return;
    }
    setOrders(updated);
    triggerToast(`Purchase Order #${activeOrder.poNumber} has been APPROVED in database.`);
    setShowPreviewList(true);
  };

  // Reject PO
  const handleRejectPO = async () => {
    if (!activeOrder) return;
    const reason = prompt('Enter reason for rejection:', 'Price exceeds seasonal threshold');
    if (reason !== null) {
      const updated = orders.map(o => o.id === activeOrder.id ? { ...o, status: 'Rejected' as const, notes: `Rejected: ${reason}` } : o);
      const res = await persistOrdersToDatabase(updated);
      if (!res.success) {
        triggerToast(`Database persistence failed: ${res.error}`);
        return;
      }
      setOrders(updated);
      triggerToast(`Purchase Order #${activeOrder.poNumber} REJECTED in database.`);
      setShowPreviewList(true);
    }
  };

  // Convert to Purchase Invoice (Creates Draft AP Bill in public.purchases_invoices & locks PO edits)
  const handleConvertToInvoice = async () => {
    if (!activeOrder) return;

    const invoiceId = crypto.randomUUID();
    const cleanPoNum = activeOrder.poNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-6);
    const invoiceNum = 'INV-PO-' + cleanPoNum;
    const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    const itemsSubtotal = activeOrder.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const orderGrandTotal = itemsSubtotal + (Number(activeOrder.freight) || 0) + (Number(activeOrder.customs) || 0) + (Number(activeOrder.otherCost) || 0) - (Number(activeOrder.discountValue) || 0);

    // 1. Write Draft AP Bill to public.purchases_invoices and items
    try {
      const { error: invErr } = await supabase
        .from('purchases_invoices')
        .insert([{
          id: invoiceId,
          tenant_id: targetTenantId,
          invoice_number: invoiceNum,
          po_number: activeOrder.poNumber,
          supplier_id: activeOrder.id,
          supplier_name: activeOrder.supplier,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: activeOrder.deliveryDate || new Date().toISOString().split('T')[0],
          currency: activeOrder.currency || 'USD',
          exchange_rate: Number(activeOrder.currencyRate) || 1.0,
          subtotal: itemsSubtotal,
          tax_amount: 0,
          total_amount: orderGrandTotal,
          status: 'DRAFT',
          is_posted: false,
          notes: 'Converted from Purchase Order #' + activeOrder.poNumber,
          created_by: 'Procurement Specialist',
          created_at: new Date().toISOString()
        }]);

      if (!invErr && activeOrder.items.length > 0) {
        const itemRows = activeOrder.items.map(it => ({
          id: crypto.randomUUID(),
          tenant_id: targetTenantId,
          invoice_id: invoiceId,
          item_code: it.code,
          description: it.description,
          quantity: it.qty,
          unit_price: it.priceUnit,
          subtotal: it.amount,
          created_at: new Date().toISOString()
        }));
        await supabase.from('purchases_invoice_items').insert(itemRows);
      }
    } catch (dbErr) {
      console.warn('purchases_invoices insert notice:', dbErr);
    }

    // 2. Dual-persist to feature_flags.purchases_invoices
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || {};
      const existingInvoices = Array.isArray(existingFlags.purchases_invoices) ? existingFlags.purchases_invoices : [];
      const newInvoiceObj = {
        id: invoiceId,
        invoiceNumber: invoiceNum,
        poNumber: activeOrder.poNumber,
        supplierName: activeOrder.supplier,
        date: new Date().toISOString().split('T')[0],
        totalAmount: orderGrandTotal,
        currency: activeOrder.currency || 'USD',
        status: 'DRAFT',
        items: activeOrder.items
      };

      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            purchases_invoices: [newInvoiceObj, ...existingInvoices]
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTenantId);
    } catch (fErr) {
      console.warn('Tenant sync for purchases_invoices notice:', fErr);
    }

    // 3. Mark PO status as Converted in database and lock further edits
    const updated = orders.map(o => o.id === activeOrder.id ? { ...o, status: 'Converted' as const } : o);
    const res = await persistOrdersToDatabase(updated);
    if (!res.success) {
      triggerToast('Database persistence failed: ' + res.error);
      return;
    }
    setOrders(updated);
    triggerToast('Purchase Order #' + activeOrder.poNumber + ' successfully converted to Draft AP Bill (' + invoiceNum + ') in database. Further edits locked.');
    setShowPreviewList(true);
  };

  // Delete PO
  const handleDeletePO = async () => {
    if (!activeOrder) return;
    if (confirm(`Are you sure you want to delete Purchase Order #${activeOrder.poNumber}?`)) {
      const updated = orders.filter(o => o.id !== activeOrder.id);
      const res = await persistOrdersToDatabase(updated);
      if (!res.success) {
        triggerToast(`Database persistence failed: ${res.error}`);
        return;
      }
      setOrders(updated);
      triggerToast(`Purchase Order #${activeOrder.poNumber} deleted from database.`);
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

  const handleSendEmail = async () => {
    if (activeOrder) {
      const updated = orders.map(o => o.id === activeOrder.id ? { ...o, emailStatus: 'Sent' as const } : o);
      const res = await persistOrdersToDatabase(updated);
      if (!res.success) {
        triggerToast('Database persistence failed: ' + (res.error || 'Unknown error'));
        return;
      }
      setOrders(updated);
    }
    setShowEmailModal(false);
    triggerToast('Purchase Order #' + formPoNumber + ' emailed to ' + emailTo);
  };

  return (
    <div className="w-full bg-background text-foreground font-sans antialiased min-h-screen text-[13px] leading-normal pb-16 select-text" dir={dir}>
      {/* GLOBAL NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-emerald-700 text-white px-5 py-3 rounded shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-700 text-sm font-medium">
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
            <h1 className="text-[24px] font-normal text-primary m-0 mb-1 leading-tight tracking-tight">
              {t('purchase_order', 'Purchase Order')}
            </h1>
            <div className="text-[12px] text-muted-foreground">
              <a
                href="#inventory"
                onClick={(e) => { e.preventDefault(); setShowPreviewList(true); }}
                className="text-primary hover:underline cursor-pointer"
              >{t('home', 'Home')}</a>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground">{t('purchase_order', 'Purchase Order')}</span>
            </div>
          </div>

          {/* OMEGA AUTHENTIC TWO-ROW FILTER BAR */}
          <div className="bg-white rounded border border-border p-3.5 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center mb-2.5">
              {/* Branch Selector */}
              <div className="col-span-12 md:col-span-3">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="All Branches">{t('all_branches', 'All Branches')}</option>
                  <option value="Main Branch">{t('main_branch', 'Main Branch')}</option>
                </select>
              </div>

              {/* Search input */}
              <div className="col-span-12 md:col-span-3">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_po_supplier_item', 'Search by Po #, Supplier, Item')}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground placeholder-[#999] focus:outline-none focus:border-primary"
                />
              </div>

              {/* Email Sent / Not Sent */}
              <div className="col-span-12 md:col-span-2">
                <select
                  value={filterSentStatus}
                  onChange={(e) => setFilterSentStatus(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="All Sent/NotSent">{t('all_sent_not_sent', 'All Sent/NotSent')}</option>
                  <option value="Sent">{t('sent', 'Sent')}</option>
                  <option value="Not Sent">{t('not_sent', 'Not Sent')}</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-span-12 md:col-span-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Pending">{t('pending', 'Pending')}</option>
                  <option value="Approved">{t('approved', 'Approved')}</option>
                  <option value="Rejected">{t('rejected', 'Rejected')}</option>
                  <option value="Converted">{t('converted', 'Converted')}</option>
                  <option value="All">{t('all_statuses', 'All Statuses')}</option>
                </select>
              </div>

              {/* Action Buttons: Filter & + New */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setHasAppliedFilter(true); triggerToast('Filtered records'); }}
                  className="h-[34px] px-4 bg-primary hover:bg-primary text-white text-[13px] font-medium rounded transition shadow-xs cursor-pointer"
                >{t('filter', 'Filter')}</button>
                <button
                  type="button"
                  onClick={handleNewBtnClick}
                  className="h-[34px] px-4 bg-primary hover:bg-primary text-white text-[13px] font-medium rounded transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-plus text-xs"></i>
                  <span>{t('new', 'New')}</span>
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
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="All Suppliers">{t('all_suppliers', 'All Suppliers')}</option>
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
                  className="w-full h-[34px] px-3 py-1 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Delivery Date">{t('delivery_date', 'Delivery Date')}</option>
                  <option value="Order Date">{t('order_date', 'Order Date')}</option>
                </select>
              </div>

              {/* From Date */}
              <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                <label className="text-[13px] text-foreground whitespace-nowrap min-w-[38px]">{t('from', 'From')}</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full h-[34px] pl-3 pr-8 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i className="fa fa-calendar text-xs"></i>
                  </span>
                </div>
              </div>

              {/* To Date */}
              <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                <label className="text-[13px] text-foreground whitespace-nowrap min-w-[20px]">{t('to', 'To')}</label>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full h-[34px] pl-3 pr-8 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i className="fa fa-calendar text-xs"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OMEGA AUTHENTIC PREVIEW TABLE (MATCHING PICTURE 1) */}
          <div className="bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground bg-card">
                    <th className="py-2.5 px-3 font-semibold text-left">{t('branch', 'Branch')}</th>
                    <th className="py-2.5 px-3 font-semibold text-left">{t('delivery_date', 'Delivery Date')}</th>
                    <th className="py-2.5 px-3 font-semibold text-left">{t('po_number', 'PO Number')}</th>
                    <th className="py-2.5 px-3 font-semibold text-left">{t('supplier', 'Supplier')}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{t('amount_ll', 'Amount (LL)')}</th>
                    <th className="py-2.5 px-3 font-semibold text-left">{t('entered_by', 'Entered By')}</th>
                    <th className="py-2.5 px-3 font-semibold text-left">{t('notes', 'Notes')}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{t('status', 'Status')}</th>
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
                          <td className="py-2.5 px-3 text-foreground">{po.branch}</td>
                          <td className="py-2.5 px-3 text-foreground">
                            {po.deliveryDate}
                            <div className="text-[11px] text-primary">#{po.poNumber}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">{po.poNumber}</td>
                          <td className="py-2.5 px-3 text-foreground">{po.supplier}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-foreground">
                            {amountLL.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{po.enteredBy}</td>
                          <td className="py-2.5 px-3 text-muted-foreground max-w-[200px] truncate">{po.notes}</td>
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
                              title={t('open', 'Open')}
                              onClick={() => handleEditOrder(po)}
                              className="w-7 h-7 inline-flex items-center justify-center bg-primary hover:bg-primary text-white rounded text-xs transition cursor-pointer"
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
            <div className="py-3 px-4 border-t border-border flex justify-center items-center bg-white">
              <div className="inline-flex items-center gap-1 text-[12px]">
                <button
                  disabled
                  className="w-8 h-8 rounded border border-border bg-white text-gray-400 flex items-center justify-center cursor-not-allowed text-xs"
                >
                  &laquo;
                </button>
                <button
                  className="w-8 h-8 rounded border border-primary bg-primary text-white flex items-center justify-center font-medium text-xs"
                >
                  1
                </button>
                <button
                  disabled
                  className="w-8 h-8 rounded border border-border bg-white text-gray-400 flex items-center justify-center cursor-not-allowed text-xs"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>

          {/* VANGUARD ENTERPRISE FOOTER */}
          <footer className="mt-16 text-center text-[11px] text-muted-foreground">
            <span>{t('copyright_vanguard', '© 2026 Vanguard ERP. All rights reserved.')}</span>
            <span className="mx-2">|</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('privacy_policy', 'Privacy Policy')}</a>
            <span className="mx-2">|</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('terms_conditions', 'Terms and Conditions')}</a>
            <span className="mx-2">|</span>
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('support', 'Support')}</a>
            <span className="mx-2">|</span>
            <a href="#feedback" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('feedback', 'Feedback')}</a>
          </footer>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: AUTHENTIC NEW / EDIT PURCHASE ORDER FORM
            ========================================================================= */
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 py-4">
          {/* HEADER */}
          <div className="header mb-3">
            <h1 className="text-[24px] font-normal text-primary m-0 mb-1 leading-tight tracking-tight">
              {t('purchase_order', 'Purchase Order')}
            </h1>
            <div className="text-[12px] text-muted-foreground">
              <a
                href="#inventory"
                onClick={(e) => { e.preventDefault(); setShowPreviewList(true); }}
                className="text-primary hover:underline cursor-pointer"
              >{t('home', 'Home')}</a>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground">{t('purchase_order', 'Purchase Order')}</span>
            </div>
          </div>

          {/* TOP ACTION TOOLBAR (IDENTICAL TO OMEGA ERP) */}
          <div className="bg-white border border-border rounded p-2 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Supporting Document */}
              <button
                type="button"
                title={t('supporting_document', 'Supporting Document')}
                onClick={() => setShowDocModal(true)}
                className="h-[32px] px-3 bg-emerald-700 hover:bg-emerald-700 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-upload"></i>
                <span className="hidden sm:inline">{t('supporting_document', 'Supporting Document')}</span>
              </button>

              {/* Email PO */}
              <button
                type="button"
                title={t('email_po', 'Email PO')}
                onClick={handleOpenEmailModal}
                className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-envelope"></i>
                <span className="hidden sm:inline">{t('email_po', 'Email PO')}</span>
              </button>

              {/* Preview Button (Takes user back to Picture 1 list) */}
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-search"></i>
                <span>{t('preview', 'Preview')}</span>
              </button>

              {/* Actions Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                  className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('actions', 'Actions')}</span>
                  <i className="fa fa-caret-down"></i>
                </button>

                {actionsMenuOpen && (
                  <div className="origin-top-left absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 text-xs text-foreground">
                    <button
                      onClick={() => { setShowStoreRecurringModal(true); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-repeat text-gray-500"></i>
                      <span>{t('store_recurring', 'Store Recurring')}</span>
                    </button>
                    <button
                      onClick={() => { setShowRecallRecurringModal(true); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-history text-gray-500"></i>
                      <span>{t('recall_recurring', 'Recall Recurring')}</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Items selling price synchronized with retail index'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-tags text-gray-500"></i>
                      <span>{t('update_items_sp', 'Update Items Selling Price')}</span>
                    </button>
                    <button
                      onClick={() => { window.print(); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-print text-gray-500"></i>
                      <span>{t('print_po', 'Print PO')}</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Barcodes generated for print queue'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-barcode text-gray-500"></i>
                      <span>{t('print_barcodes', 'Print Barcodes')}</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Purchase Order transferred to General Ledger'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-exchange text-gray-500"></i>
                      <span>{t('transfer_to_accounting', 'Transfer To Accounting')}</span>
                    </button>
                    <button
                      onClick={() => { triggerToast('Items Pricing Matrix Loaded'); setActionsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <i className="fa fa-dollar text-gray-500"></i>
                      <span>{t('items_pricing', 'Items Pricing')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* New Button */}
              <button
                type="button"
                onClick={handleNewBtnClick}
                className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-plus"></i>
                <span>{t('new', 'New')}</span>
              </button>
            </div>

            {/* Back button */}
            <div>
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[32px] px-3 bg-gray-100 hover:bg-gray-200 text-muted-foreground text-xs rounded border border-gray-300 transition cursor-pointer"
              >
                <i className="fa fa-arrow-left me-1"></i> {t('back_to_orders', 'Back to Orders')}
              </button>
            </div>
          </div>

          {/* TWO MAIN PANELS: SUPPLIER & TRANSACTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
            {/* LEFT CARD: SUPPLIER */}
            <div className="lg:col-span-5 bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="bg-card border-b border-border px-3.5 py-2 font-semibold text-foreground text-[13px] flex items-center justify-between">
                <span>{t('supplier', 'Supplier')}</span>
                <span className="text-gray-400 text-xs">{t('purchased_from', 'Purchased From')}</span>
              </div>
              <div className="p-3.5 min-h-[224px]">
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[13px] font-bold text-foreground whitespace-nowrap min-w-[110px]">
                    {t('purchased_from_req', 'Purchased From*')}
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formSupplier.name}
                      readOnly
                      placeholder={t('search_supplier', 'Search supplier ...')}
                      className="w-full h-[34px] px-3 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(true)}
                    className="h-[34px] px-3 bg-primary hover:bg-primary/90 text-white rounded text-xs transition cursor-pointer"
                    title={t('search_supplier', 'Search Supplier')}
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>

                {/* Supplier Information Card */}
                {formSupplier && (
                  <div className="border-t border-dotted border-gray-300 pt-3 text-[12px] space-y-1.5 text-muted-foreground">
                    <div className="flex">
                      <span className="font-semibold text-foreground w-28">{t('contact_name', 'Contact Name:')}</span>
                      <span className="flex-1">{formSupplier.contact || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-foreground w-28">{t('address', 'Address:')}</span>
                      <span className="flex-1">{formSupplier.address || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-foreground w-28">{t('phone', 'Phone:')}</span>
                      <span className="flex-1">{formSupplier.phone || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-foreground w-28">{t('email', 'Email:')}</span>
                      <span className="flex-1 text-primary">{formSupplier.email || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT CARD: TRANSACTION */}
            <div className="lg:col-span-7 bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="bg-card border-b border-border px-3.5 py-2 font-semibold text-foreground text-[13px] flex items-center justify-between">
                <span>{t('transaction', 'Transaction')}</span>
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
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('branch_colon', 'Branch*:')}</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    >
                      <option value="Main Branch">{t('main_branch', 'Main Branch')}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('location_colon', 'Location*:')}</label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    >
                      <option value="All Locations">{t('all_locations', 'All Locations')}</option>
                      <option value="Choueifat Main Facility">{t('choueifat_main_facility', 'Choueifat Main Facility')}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="h-[32px] w-[32px] bg-primary hover:bg-primary/90 text-white rounded text-xs flex items-center justify-center cursor-pointer"
                      title={t('add_location', 'Add Location')}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Shipment and Order Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('shipment_colon', 'Shipment*:')}</label>
                    <select
                      value={formShipment}
                      onChange={(e) => setFormShipment(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    >
                      <option value="Local Delivery">{t('local_delivery', 'Local Delivery')}</option>
                      <option value="Land Transport">{t('land_transport', 'Land Transport')}</option>
                      <option value="Maritime Cargo">{t('maritime_cargo', 'Maritime Cargo')}</option>
                      <option value="Air Freight">{t('air_freight', 'Air Freight')}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('date_colon', 'Date*:')}</label>
                    <input
                      type="date"
                      value={formOrderDate}
                      onChange={(e) => setFormOrderDate(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    />
                  </div>
                </div>

                {/* Currency and Delivery Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('currency_colon', 'Currency*:')}</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => {
                        const cur = e.target.value;
                        setFormCurrency(cur);
                        setFormCurrencyRate(cur === 'LL' || cur === 'LBP' ? 1 : 89500);
                      }}
                      className="w-24 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    >
                      <option value="USD">{t('usd', 'USD')}</option>
                      <option value="LL">{t('ll', 'LL')}</option>
                      <option value="EUR">{t('eur', 'EUR')}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCurrencyModal(true)}
                      className="h-[32px] w-[32px] bg-primary hover:bg-primary/90 text-white rounded text-xs flex items-center justify-center cursor-pointer"
                      title={t('add_currency', 'Add Currency')}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                    <input
                      type="number"
                      value={formCurrencyRate}
                      onChange={(e) => setFormCurrencyRate(parseFloat(e.target.value) || 1)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-right font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('delivery_colon', 'Delivery:')}</label>
                    <input
                      type="date"
                      value={formDeliveryDate}
                      onChange={(e) => setFormDeliveryDate(e.target.value)}
                      className="flex-1 h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="flex items-center gap-2">
                  <label className="text-[13px] font-bold text-foreground w-20 whitespace-nowrap">{t('note_colon', 'Note:')}</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={t('po_instructions_placeholder', 'General purchase order instructions, inspection terms, delivery gates...')}
                    className="flex-1 h-[32px] px-3 bg-white border border-border rounded text-[13px] text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS CARD: PRODUCTS GRID */}
          <div className="bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-3">
            <div className="bg-card border-b border-border px-3.5 py-2 font-semibold text-foreground text-[13px]">
              {t('details', 'Details')}
            </div>

            {/* DETAILS TOOLBAR */}
            <div className="p-3 border-b border-border bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Item input */}
                <div className="relative w-72">
                  <input
                    type="search"
                    value={searchItemInput}
                    onChange={(e) => setSearchItemInput(e.target.value)}
                    placeholder={t('search_items_placeholder', 'Search items by code or name...')}
                    className="w-full h-[32px] pl-3 pr-8 bg-white border border-border rounded text-[13px] text-foreground focus:outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowItemModal(true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowItemModal(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    <i className="fa fa-search text-xs"></i>
                  </button>
                </div>

                {/* Discount selector */}
                <select
                  value={formDiscType}
                  onChange={(e) => setFormDiscType(e.target.value as any)}
                  className="h-[32px] px-2 bg-white border border-border rounded text-[13px] text-foreground"
                >
                  <option value="percent">{t('discount_pct', 'Discount (%)')}</option>
                  <option value="amount">{t('discount_currency', 'Discount')} ({formCurrency})</option>
                </select>

                <input
                  type="number"
                  value={formDiscValue}
                  onChange={(e) => setFormDiscValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 h-[32px] px-2 text-right bg-white border border-border rounded text-[13px]"
                />

                {/* Manual Tax Checkbox */}
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={enableManualTax}
                    onChange={(e) => setEnableManualTax(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>{t('manual_tax_calculation', 'Manual tax calculation')}</span>
                </label>

                {/* Enable Total Price Checkbox */}
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-2">
                  <input
                    type="checkbox"
                    checked={enableTotalPrice}
                    onChange={(e) => setEnableTotalPrice(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>{t('enable_total_price', 'Enable Total Price')}</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierItemsModal(true)}
                  className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-cubes"></i>
                  <span>{t('supplier_items', 'Supplier Items')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(true)}
                  className="h-[32px] px-3 bg-primary hover:bg-primary/90 text-white text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa fa-plus"></i>
                  <span>{t('add_line', 'Add Line')}</span>
                </button>
              </div>
            </div>

            {/* DETAILS ITEMS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground bg-card">
                    <th className="py-2 px-3 font-semibold w-[120px]">{t('code', 'Code')}</th>
                    <th className="py-2 px-3 font-semibold min-w-[240px]">{t('description', 'Description')}</th>
                    <th className="py-2 px-3 font-semibold w-[160px]">{t('branch', 'Branch')}</th>
                    <th className="py-2 px-3 font-semibold text-right w-[90px]">{t('qty', 'Qty')}</th>
                    <th className="py-2 px-3 font-semibold w-[70px]">{t('unit', 'Unit')}</th>
                    <th className="py-2 px-3 font-semibold text-right w-[110px]">{t('price_unit', 'Price/Unit')} ({formCurrency})</th>
                    <th className="py-2 px-3 font-semibold text-right w-[80px]">{t('disc_pct', 'Disc.(%)')}</th>
                    <th className="py-2 px-3 font-semibold text-right w-[80px]">{t('disc', 'Disc.')}</th>
                    <th className="py-2 px-3 font-semibold text-right w-[110px]">{t('amount', 'Amount')} ({formCurrency})</th>
                    <th className="py-2 px-3 font-semibold text-center w-[60px]">{t('vat', 'VAT')}</th>
                    <th className="py-2 px-3 font-semibold text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {formItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-gray-400 bg-white">
                        <i className="fa fa-shopping-basket text-2xl mb-2 text-gray-300"></i>
                        <div>{t('no_po_items_yet', 'No items added to this purchase order yet.')}</div>
                        <button
                          type="button"
                          onClick={() => setShowItemModal(true)}
                          className="mt-2 text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <i className="fa fa-plus"></i> {t('click_select_catalog', 'Click here to select items from catalog')}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    formItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-mono text-xs font-semibold text-primary">
                          {item.code}
                        </td>
                        <td className="py-2 px-3 font-medium text-foreground">
                          {item.description}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">
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
                        <td className="py-2 px-3 text-xs text-muted-foreground">
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
                        <td className="py-2 px-3 text-right font-mono font-medium text-foreground">
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
                            title={t('remove_row', 'Remove row')}
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
            <div className="lg:col-span-6 bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3">
              <button
                type="button"
                onClick={() => setShowOtherCosts(!showOtherCosts)}
                className="w-full flex items-center justify-between font-semibold text-foreground text-[13px] cursor-pointer"
              >
                <span>{t('other_direct_costs', 'Other Direct Costs (Freight, Customs, Port)')}</span>
                <i className={`fa fa-chevron-${showOtherCosts ? 'up' : 'down'} text-gray-400`}></i>
              </button>

              {showOtherCosts && (
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{t('freight', 'Freight')} ({formCurrency})</label>
                    <input
                      type="number"
                      value={formFreight}
                      onChange={(e) => setFormFreight(parseFloat(e.target.value) || 0)}
                      className="w-full h-[28px] px-2 text-right border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{t('customs', 'Customs')} ({formCurrency})</label>
                    <input
                      type="number"
                      value={formCustoms}
                      onChange={(e) => setFormCustoms(parseFloat(e.target.value) || 0)}
                      className="w-full h-[28px] px-2 text-right border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{t('other_cost', 'Other Cost')} ({formCurrency})</label>
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
            <div className="lg:col-span-6 bg-white border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <table className="w-full text-[13px] border-collapse">
                <tbody>
                  <tr className="border-b border-border bg-muted">
                    <th className="py-1.5 px-3 font-semibold text-left text-foreground">{t('subtotal', 'Subtotal:')}</th>
                    <td className="py-1.5 px-3 text-right font-mono text-foreground">
                      {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <th className="py-1.5 px-3 font-semibold text-left text-foreground">{t('total_discount', 'Total Discount:')}</th>
                    <td className="py-1.5 px-3 text-right font-mono text-red-600">
                      -{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  {(formFreight > 0 || formCustoms > 0 || formOtherCost > 0) && (
                    <tr className="border-b border-border">
                      <th className="py-1.5 px-3 font-semibold text-left text-foreground">{t('additional_logistics', 'Additional Logistics:')}</th>
                      <td className="py-1.5 px-3 text-right font-mono text-foreground">
                        +{(formFreight + formCustoms + formOtherCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-border">
                    <th className="py-1.5 px-3 font-semibold text-left text-foreground">{t('vat_tax_11', 'VAT / Tax (11%):')}</th>
                    <td className="py-1.5 px-3 text-right font-mono text-foreground">
                      {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  <tr className="border-b border-border bg-muted">
                    <th className="py-2 px-3 font-bold text-left text-primary text-sm">{t('grand_total', 'Grand Total:')}</th>
                    <td className="py-2 px-3 text-right font-mono font-bold text-primary text-base">
                      {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formCurrency}
                    </td>
                  </tr>
                  {formCurrency !== 'LL' && (
                    <tr className="border-b border-border bg-white">
                      <th className="py-1.5 px-3 text-xs text-gray-500 text-left">Equivalent (LL @ {formCurrencyRate.toLocaleString()}):</th>
                      <td className="py-1.5 px-3 text-right font-mono text-xs text-gray-600 font-semibold">
                        {grandTotalLL.toLocaleString()} LL
                      </td>
                    </tr>
                  )}
                  <tr className="bg-white">
                    <th className="py-1.5 px-3 text-xs text-[#800000] text-left">{t('total_quantities', 'Total Quantities:')}</th>
                    <td className="py-1.5 px-3 text-right font-mono text-xs text-[#800000] font-semibold">
                      {totalQuantities.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM FORM ACTION BUTTONS (IDENTICAL TO OMEGA ERP) */}
          <div className="bg-white border border-border rounded p-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Omega Orange Save Button */}
              <button
                type="button"
                onClick={() => handleSaveOrder(false)}
                className="h-[36px] px-5 bg-amber-600 hover:bg-amber-700 border border-amber-600 text-white text-[13px] font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-save"></i>
                <span>{t('save', 'Save')}</span>
              </button>

              {/* Save & Post Button */}
              <button
                type="button"
                onClick={() => handleSaveOrder(true)}
                className="h-[36px] px-5 bg-emerald-700 hover:bg-emerald-700 text-white text-[13px] font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa fa-check"></i>
                <span>{t('save_and_post', 'Save & Post')}</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowPreviewList(true)}
                className="h-[36px] px-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-muted-foreground text-[13px] rounded transition cursor-pointer"
              >
                {t('cancel', 'Cancel')}
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
                      className="h-[36px] px-4 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa fa-thumbs-up"></i>
                      <span>{t('approve', 'Approve')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPO}
                      className="h-[36px] px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa fa-ban"></i>
                      <span>{t('reject', 'Reject')}</span>
                    </button>
                  </>
                )}

                {activeOrder.status === 'Converted' && (
                  <div className="h-[36px] px-4 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded flex items-center gap-1.5 select-none">
                    <i className="fa fa-lock"></i>
                    <span>{t('po_converted_locked', 'PO Converted to AP Bill (Locked)')}</span>
                  </div>
                )}

                {activeOrder.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={handleConvertToInvoice}
                    className="h-[36px] px-4 bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa fa-exchange"></i>
                    <span>{t('convert_to_purchase_invoice', 'Convert to Purchase Invoice')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeletePO}
                  className="h-[36px] px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa fa-trash"></i>
                  <span>{t('delete', 'Delete')}</span>
                </button>
              </div>
            )}
          </div>

          {/* VANGUARD ENTERPRISE FOOTER */}
          <footer className="mt-16 text-center text-[11px] text-muted-foreground pb-4">
            <span>{t('copyright_vanguard', '© 2026 Vanguard ERP. All rights reserved.')}</span>
            <span className="mx-2">|</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('privacy_policy', 'Privacy Policy')}</a>
            <span className="mx-2">|</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('terms_conditions', 'Terms and Conditions')}</a>
            <span className="mx-2">|</span>
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('support', 'Support')}</a>
            <span className="mx-2">|</span>
            <a href="#feedback" onClick={(e) => e.preventDefault()} className="hover:underline text-muted-foreground">{t('feedback', 'Feedback')}</a>
          </footer>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SEARCH SUPPLIER MODAL
          ========================================================================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-fade-in">
            <div className="bg-card border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <i className="fa fa-building text-primary"></i>
                <span>{t('select_supplier', 'Select Supplier')}</span>
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
                  className="p-3 border border-gray-200 rounded hover:border-primary hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-foreground text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">Contact: {s.contact} | {s.phone}</div>
                    <div className="text-[11px] text-gray-400">{s.address}</div>
                  </div>
                  <button className="text-xs px-2.5 py-1 bg-primary text-white rounded">{t('select', 'Select')}</button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-foreground text-xs rounded"
              >
                {t('close', 'Close')}
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
            <div className="bg-card border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <i className="fa fa-cubes text-primary"></i>
                <span>{t('search_inventory_catalog', 'Search Inventory Item Catalog')}</span>
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                    <th className="p-2">{t('code', 'Code')}</th>
                    <th className="p-2">{t('description', 'Description')}</th>
                    <th className="p-2">{t('unit', 'Unit')}</th>
                    <th className="p-2 text-right">{t('unit_price', 'Unit Price')}</th>
                    <th className="p-2 text-center w-20">{t('action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS_CATALOG.map((item) => (
                    <tr key={item.code} className="border-b border-gray-100 hover:bg-blue-50/40">
                      <td className="p-2 font-mono font-semibold text-primary">{item.code}</td>
                      <td className="p-2 font-medium text-foreground">{item.description}</td>
                      <td className="p-2 text-gray-500">{item.unit}</td>
                      <td className="p-2 text-right font-mono font-bold">${item.price.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            addItemToDetails(item);
                            setShowItemModal(false);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                        >
                          {t('add', 'Add')}
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
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-foreground text-xs rounded"
              >
                {t('close', 'Close')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
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
                <label className="font-bold text-gray-700 block mb-1">{t('to_email_req', 'To Email*:')}</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('cc_email', 'CC Email:')}</label>
                <input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('subject_req', 'Subject*:')}</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('message_body', 'Message Body:')}</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded flex items-center gap-1.5"
              >
                <i className="fa fa-paper-plane"></i>
                <span>{t('send_po', 'Send PO')}</span>
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
            <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-upload"></i>
                <span>{t('attach_supporting_document', 'Attach Supporting Document')}</span>
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('document_title_ref', 'Document Title / Reference:')}</label>
                <input
                  type="text"
                  value={docNameInput}
                  onChange={(e) => setDocNameInput(e.target.value)}
                  placeholder={t('eg_proforma_invoice_supplier_quotation', 'e.g. Proforma Invoice / Supplier Quotation #8841')}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-emerald-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('document_url_link', 'Document URL or Cloud File Link:')}</label>
                <input
                  type="url"
                  value={docUrlInput}
                  onChange={(e) => setDocUrlInput(e.target.value)}
                  placeholder="https://storage.vanguard-erp.lb/docs/po-603.pdf"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-emerald-700 focus:outline-none"
                />
              </div>
              <div className="p-3 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
                <i className="fa fa-cloud-upload text-2xl text-gray-400 mb-1 block"></i>
                <span>{t('drag_drop_proforma', 'Drag & drop signed proforma PDF or delivery specifications here')}</span>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                {t('close', 'Close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDocModal(false);
                  triggerToast('Supporting document attached successfully');
                }}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-bold rounded"
              >
                {t('save_document', 'Save Document')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-repeat"></i>
                <span>{t('store_recurring_template', 'Store as Recurring Purchase Template')}</span>
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
                <label className="font-bold text-gray-700 block mb-1">{t('template_name_req', 'Template Name*:')}</label>
                <input
                  type="text"
                  value={recurringName}
                  onChange={(e) => setRecurringName(e.target.value)}
                  placeholder="e.g. Monthly Olive Tin Supply (Marjeyoun)"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowStoreRecurringModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                {t('cancel', 'Cancel')}
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
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded"
              >
                {t('store_template', 'Store Template')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-history"></i>
                <span>{t('recall_recurring_template', 'Recall Recurring Template')}</span>
              </h3>
              <button onClick={() => setShowRecallRecurringModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-2 text-xs">
              {recurringTemplates.map((tpl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormItems(JSON.parse(JSON.stringify(tpl.items)));
                    setShowRecallRecurringModal(false);
                    triggerToast(`Recalled ${tpl.items.length} items from template "${tpl.name}"`);
                  }}
                  className="p-3 border border-gray-200 rounded hover:border-primary hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-foreground">{tpl.name}</div>
                    <div className="text-gray-500 text-[11px]">{tpl.items.length} item lines defined</div>
                  </div>
                  <button className="px-2.5 py-1 bg-primary text-white rounded text-xs">{t('recall', 'Recall')}</button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setShowRecallRecurringModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded"
              >
                {t('close', 'Close')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-map-marker"></i>
                <span>{t('add_storage_location', 'Add Storage Location')}</span>
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('location_name_req', 'Location Name*:')}</label>
                <input
                  type="text"
                  placeholder={t('eg_silo_c_raw_oil_tank_4', 'e.g. Silo C - Raw Oil Tank #4')}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
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
                {t('cancel', 'Cancel')}
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
                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded"
              >
                {t('add_location', 'Add Location')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <i className="fa fa-money"></i>
                <span>{t('add_currency', 'Add Currency')}</span>
              </h3>
              <button onClick={() => setShowCurrencyModal(false)} className="text-white hover:opacity-75">
                <i className="fa fa-times text-base"></i>
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('currency_symbol_label', 'Currency Symbol (e.g. GBP, AED):')}</label>
                <input
                  type="text"
                  placeholder={t('eg_gbp', 'e.g. GBP')}
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
                  id="newCurSymbol"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">{t('exchange_rate_ll', 'Exchange Rate to LL:')}</label>
                <input
                  type="number"
                  placeholder="114000"
                  className="w-full h-8 px-2.5 border border-gray-300 rounded focus:border-primary focus:outline-none"
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
                {t('cancel', 'Cancel')}
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
                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded"
              >
                {t('add_currency', 'Add Currency')}
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
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
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
                    <div className="font-bold text-foreground">{item.description}</div>
                    <div className="text-gray-500 font-mono text-[11px]">Code: {item.code} | Unit: {item.unit}</div>
                    <div className="text-emerald-700 font-bold font-mono">${item.price.toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addItemToDetails(item);
                      setShowSupplierItemsModal(false);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-700 text-white rounded font-medium text-xs flex items-center gap-1"
                  >
                    <i className="fa fa-plus"></i>
                    <span>{t('add_to_po', 'Add to PO')}</span>
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
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
