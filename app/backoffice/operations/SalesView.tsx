'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Save,
  Check,
  Calendar as CalendarIcon,
  Info,
  Bell,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  CreditCard,
  DollarSign,
  Printer,
  Mail,
  Download,
  CheckCircle2,
  RefreshCw,
  Menu,
  Home,
  Briefcase,
  Building2,
  BarChart3,
  PieChart,
  Zap,
  ShoppingBag,
  FileText,
  Truck,
  ShoppingCart,
  ClipboardList,
  Compass,
  ArrowLeftRight,
  PackageX,
  Boxes,
  Scale,
  Package,
  Users,
  RotateCcw,
  Receipt,
  Repeat,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Tag
} from 'lucide-react';
import DatePickerInput from '@/components/DatePickerInput';

export interface SalesItem {
  id: string;
  code: string;
  name: string;
  category: string;
  division: string;
  group: string;
  unit: string;
  stockQty: number;
  price: number;
  cost?: number;
}

export interface CartItem {
  id: string;
  itemId: string;
  code: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  location: string;
  cost?: number;
}

export interface PaymentEntry {
  id: string;
  type: string;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  refCode?: string;
  date: string;
  deliveryDate: string;
  branch: string;
  customerName: string;
  customerId: string;
  company?: string;
  salesman?: string;
  createdBy?: string;
  source?: string;
  refNumber?: string;
  customerAddress: string;
  deliveredBy: string;
  currency: string;
  transactionType: string;
  invoiceType?: string;
  salesChannel?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  payments: PaymentEntry[];
  status: 'Posted' | 'Unposted' | 'Draft';
  createdAt: string;
}

// 100% Authentic Catalog Items from the Omega Screenshot
export const OMEGA_SALES_ITEMS: SalesItem[] = [
  {
    id: 'CWV250MLB103',
    code: 'CWV250MLB103',
    name: 'White Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.50,
    cost: 0.32
  },
  {
    id: 'CACV250MLB103',
    code: 'CACV250MLB103',
    name: 'Apple Cider Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.50,
    cost: 0.31
  },
  {
    id: 'OACV250MLB103',
    code: 'OACV250MLB103',
    name: 'Local Apple Cider Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 1.11,
    cost: 0.70
  },
  {
    id: 'CSGV250MLB103',
    code: 'CSGV250MLB103',
    name: 'Verjuice Sour Grape Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.50,
    cost: 0.32
  },
  {
    id: 'CGV250MLB103',
    code: 'CGV250MLB103',
    name: 'Grape Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.50,
    cost: 0.32
  },
  {
    id: 'OGV250MLB103',
    code: 'OGV250MLB103',
    name: 'Local Grape Vinegar 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 1.11,
    cost: 0.70
  },
  {
    id: 'PGM250MLB103',
    code: 'PGM250MLB103',
    name: 'Pomegranate Molasses 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.67,
    cost: 0.45
  },
  {
    id: 'CDBW250MLB103',
    code: 'CDBW250MLB103',
    name: 'Orange Blossom Water 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.56,
    cost: 0.38
  },
  {
    id: 'CARW250GB103',
    code: 'CARW250GB103',
    name: 'Rose Water 250ml',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Retail Distillates 250ml',
    unit: 'BOT',
    stockQty: 0,
    price: 0.56,
    cost: 0.38
  },

  // Gallon Distillates
  {
    id: 'GAL-ROSE-4L',
    code: 'GAL-ROSE-4L',
    name: 'Distilled Rose Water Gallon 4L',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Distillates & Seasonings Gallon',
    unit: 'GAL',
    stockQty: 18,
    price: 6.50,
    cost: 4.20
  },
  {
    id: 'GAL-ORANGE-4L',
    code: 'GAL-ORANGE-4L',
    name: 'Distilled Orange Blossom Water Gallon 4L',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Distillates & Seasonings Gallon',
    unit: 'GAL',
    stockQty: 24,
    price: 6.50,
    cost: 4.20
  },

  // 1 Liter Distillates
  {
    id: 'LIT-ROSE-1L',
    code: 'LIT-ROSE-1L',
    name: 'Distilled Rose Water Premium 1L',
    category: 'Retail',
    division: 'Retail Distillates & Seasonings',
    group: 'Distillates 1 Liter',
    unit: 'BOT',
    stockQty: 45,
    price: 1.85,
    cost: 1.15
  },

  // Traditional Pantry (Retail Traditional Provisions)
  {
    id: 'MOUNA-KISHK-1KG',
    code: 'MOUNA-KISHK-1KG',
    name: 'Pure Local Cow Kishk 1kg',
    category: 'Retail',
    division: 'Retail Traditional Provisions',
    group: 'Wholesale Traditional Provisions',
    unit: 'KG',
    stockQty: 35,
    price: 9.50,
    cost: 6.80
  },
  {
    id: 'MOUNA-ZAATAR-1KG',
    code: 'MOUNA-ZAATAR-1KG',
    name: 'Premium Local Thyme with Sesame 1kg',
    category: 'Retail',
    division: 'Retail Traditional Provisions',
    group: 'Wholesale Traditional Provisions',
    unit: 'KG',
    stockQty: 60,
    price: 7.20,
    cost: 4.50
  },

  // Wholesale Oils & Olives (Wholesale)
  {
    id: 'EVOO-TIN-16L',
    code: 'EVOO-TIN-16L',
    name: 'Extra Virgin Olive Oil 16L Tin (First Press)',
    category: 'Wholesale',
    division: 'Wholesale Oils',
    group: 'Wholesale Virgin Olive Oil',
    unit: 'TIN',
    stockQty: 120,
    price: 115.00,
    cost: 88.00
  },
  {
    id: 'EVOO-BTL-1L',
    code: 'EVOO-BTL-1L',
    name: 'Extra Virgin Olive Oil Glass Bottle 1L',
    category: 'Wholesale',
    division: 'Wholesale Oils',
    group: 'Wholesale Virgin Olive Oil',
    unit: 'BOT',
    stockQty: 340,
    price: 8.50,
    cost: 6.20
  },
  {
    id: 'OLIVE-GRN-10KG',
    code: 'OLIVE-GRN-10KG',
    name: 'Pickled Local Green Olives Bucket 10kg',
    category: 'Wholesale',
    division: 'Wholesale Olives',
    group: 'Wholesale Green Olives',
    unit: 'BUCKET',
    stockQty: 45,
    price: 28.00,
    cost: 19.50
  },

  // Offers (Promotions)
  {
    id: 'OFFER-COMBO-01',
    code: 'OFFER-COMBO-01',
    name: 'Family Saver Bundle: 2L Olive Oil + 1kg Thyme + Pomegranate Molasses',
    category: 'Promotions',
    division: 'Promotions',
    group: 'Promotions',
    unit: 'PACK',
    stockQty: 50,
    price: 22.00,
    cost: 16.00
  },

  // Raw Materials
  {
    id: 'RAW-GLASS-250ML',
    code: 'RAW-GLASS-250ML',
    name: 'Empty Glass Bottles 250ml with Cap',
    category: 'Raw Materials',
    division: 'Bottles',
    group: 'Bottles',
    unit: 'CARTON',
    stockQty: 500,
    price: 0.18,
    cost: 0.12
  }
];

export const CATEGORIES_LIST = ['Retail', 'Wholesale', 'Promotions', 'Raw Materials'];

export const DIVISIONS_MAP: Record<string, string[]> = {
  'Retail': [
    'Retail Distillates & Seasonings',
    'Retail Traditional Provisions',
    'Retail Jams',
    'Retail Honey',
    'Retail Dried Fruits',
    'Retail Spices',
    'Refrigerated',
    'Services'
  ],
  'Wholesale': ['Wholesale Oils', 'Wholesale Olives', 'Wholesale Honey', 'Wholesale Jams', 'Wholesale Traditional Provisions'],
  'Promotions': ['Promotions'],
  'Raw Materials': ['Bottles', 'Plastic', 'Jars', 'Main Materials']
};

export const GROUPS_MAP: Record<string, string[]> = {
  'Retail Distillates & Seasonings': [
    'Retail Distillates 250ml',
    'Distillates & Seasonings Gallon',
    'Retail Distillates 500ml',
    'Distillates 1 Liter'
  ],
  'Retail Traditional Provisions': ['Wholesale Traditional Provisions', 'Bagged Legumes & Grains', 'Dairy & Cheese'],
  'Retail Jams': ['Retail Jams', 'Jar 510'],
  'Retail Honey': ['Retail Honey', 'Wholesale Honey'],
  'Retail Dried Fruits': ['Retail Dried Fruits'],
  'Retail Spices': ['Spices (g)', 'Spice Box'],
  'Refrigerated': ['Dairy & Cheese'],
  'Services': ['General Services'],
  'Wholesale Oils': ['Wholesale Virgin Olive Oil', 'Wholesale Sunflower Oil'],
  'Wholesale Olives': ['Wholesale Green Olives', 'Wholesale Black Olives'],
  'Wholesale Honey': ['Wholesale Honey'],
  'Wholesale Jams': ['Wholesale Jams'],
  'Wholesale Traditional Provisions': ['Wholesale Traditional Provisions'],
  'Promotions': ['Promotions'],
  'Bottles': ['Bottles', 'Plastic Bottles'],
  'Plastic': ['Plastic Gallon'],
  'Jars': ['JAR', 'Jar 509'],
  'Main Materials': ['Main materials']
};

export const BRANCH_OPTIONS = [
  { id: 'southern', name: 'Southern Olive Oil Products S.A.R.L' },
  { id: 'zeit', name: 'Zeit w zaytoun ljanoub' }
];

export const CUSTOMER_PRESETS = [
  { id: '', name: '', address: '' },
  { id: 'CUST-001', name: 'Walk-in Cash Customer', address: 'Local Branch Outlet' },
  { id: 'CUST-002', name: 'Beirut Gourmet Market', address: 'Hamra Street, Bloc B, Beirut' },
  { id: 'CUST-003', name: 'Al-Janoub Mart Supermarket', address: 'Main Highway, Nabatieh' },
  { id: 'CUST-004', name: 'Tyre Regional Co-op', address: 'Port Road, Tyre' },
  { id: 'CUST-005', name: 'Cedar Valley Organics', address: 'Ashrafieh, Tabaris, Beirut' }
];

export const PAYMENT_TYPES = [
  { id: 'cash_usd', name: 'Cash USD' },
  { id: 'cash_lbp', name: 'Cash LBP' },
  { id: 'visa', name: 'Visa / MasterCard' },
  { id: 'check', name: 'Bank Check' },
  { id: 'on_account', name: 'On Account / Credit' },
  { id: 'whish', name: 'Whish Money / OMT' }
];

export default function AuthenticOmegaSalesWorkstation({
  withOmegaSidebar = false
}: {
  withOmegaSidebar?: boolean;
}) {
  // --- Sidebar State (when running in Standalone Omega layout) ---
  const [omegaSidebarCollapsed, setOmegaSidebarCollapsed] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // --- Header & Settings State ---
  const [selectedBranch, setSelectedBranch] = useState('southern');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState('Retail');
  const [activeTabDivision, setActiveTabDivision] = useState('Retail Distillates & Seasonings');
  const [activeTabGroup, setActiveTabGroup] = useState('Retail Distillates 250ml');
  const [catalogSearch, setCatalogSearch] = useState('');

  // --- Invoice Header State ---
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-08942');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMER_PRESETS[0]);
  const [invoiceDate, setInvoiceDate] = useState('07-Sep-2026');
  const [deliveryDate, setDeliveryDate] = useState('07-Sep-2026');
  const [deliveredBy, setDeliveredBy] = useState('Providers');
  const [currency, setCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState('Local');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // --- Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- Payments State ---
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // --- Modals State ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceInfoModalOpen, setIsInvoiceInfoModalOpen] = useState(false);

  // --- Invoice Info State (Exact Omega Replica from Screenshots) ---
  const [invoiceRate, setInvoiceRate] = useState('90000');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [workstationId, setWorkstationId] = useState('W#: 2000');
  const [isEditingWorkstation, setIsEditingWorkstation] = useState(false);
  const [invoiceSalesman, setInvoiceSalesman] = useState('Mahdi');
  const [invoiceDepartment, setInvoiceDepartment] = useState('Showroom');
  const [invoiceReferenceNumber, setInvoiceReferenceNumber] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [invoiceInternalNote, setInvoiceInternalNote] = useState('');

  const [isPreviewSalesModalOpen, setIsPreviewSalesModalOpen] = useState(false);

  // Authentic Report Viewer Screen (showReportInvoice)
  const [showReportInvoice, setShowReportInvoice] = useState(false);
  const [reportTargetInvoice, setReportTargetInvoice] = useState<any>(null);
  const [isSendSalesReportModalOpen, setIsSendSalesReportModalOpen] = useState(false);
  const [salesReportEmailTo, setSalesReportEmailTo] = useState('');
  const [salesReportSubject, setSalesReportSubject] = useState('Sales Invoice / Quotation');
  const [salesReportMessage, setSalesReportMessage] = useState('Please find attached your sales document.');

  // Quantity On Hand by Branch Modal
  const [itemQtyohModalOpen, setItemQtyohModalOpen] = useState(false);
  const [itemQtyohTargetItem, setItemQtyohTargetItem] = useState<any>(null);

  // Serial Numbers Modal
  const [salesSerialModalOpen, setSalesSerialModalOpen] = useState(false);
  const [salesSerialTargetItem, setSalesSerialTargetItem] = useState<any>(null);
  const [salesAvailableSerials] = useState([
    { id: 'SN-VNG-9901', expiry: '2027-12-31', loc: 'Choueifat Main Facility' },
    { id: 'SN-VNG-9902', expiry: '2027-12-31', loc: 'Choueifat Main Facility' },
    { id: 'SN-VNG-9903', expiry: '2028-06-30', loc: 'Choueifat Main Facility' },
    { id: 'SN-VNG-9904', expiry: '2028-06-30', loc: 'Choueifat Main Facility' }
  ]);
  const [salesSelectedSerials, setSalesSelectedSerials] = useState<string[]>(['SN-VNG-9901']);
  const [isQuotationsModalOpen, setIsQuotationsModalOpen] = useState(false);
  const [quotationBranchFilter, setQuotationBranchFilter] = useState('Zeit w zaytoun ljanoub');
  const [quotationCustomerSearch, setQuotationCustomerSearch] = useState('');
  const [quotationCustomerGroup, setQuotationCustomerGroup] = useState('All Customer Groups');
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [quotationFromDate, setQuotationFromDate] = useState('01-Sep-2026');
  const [quotationToDate, setQuotationToDate] = useState('07-Sep-2026');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>('QUO-2026-0041');

  // --- Pending Quotations Dataset ---
  const [pendingQuotations, setPendingQuotations] = useState([
    {
      id: 'QUO-2026-0041',
      quotationNumber: 'QUO-2026-0041',
      customerName: 'Cedar Valley Organics',
      customerId: 'CUST-005',
      customerGroup: 'Hotels & Restaurants',
      amount: 420.00,
      createdBy: 'Mohammed Jichi',
      date: '04-Sep-2026',
      items: [
        {
          id: 'q-item-1',
          itemId: 'EVOO-TIN-16L',
          code: 'EVOO-TIN-16L',
          name: 'Extra Virgin Olive Oil 16L Tin (First Press)',
          qty: 3,
          unit: 'TIN',
          unitPrice: 115.00,
          total: 345.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'q-item-2',
          itemId: 'OACV250MLB103',
          code: 'OACV250MLB103',
          name: 'Local Apple Cider Vinegar 250ml',
          qty: 60,
          unit: 'BOT',
          unitPrice: 1.25,
          total: 75.00,
          location: 'Choueifat Main Facility'
        }
      ]
    },
    {
      id: 'QUO-2026-0038',
      quotationNumber: 'QUO-2026-0038',
      customerName: 'Beirut Gourmet Market',
      customerId: 'CUST-002',
      customerGroup: 'Supermarkets & Hypermarkets',
      amount: 680.50,
      createdBy: 'Sales Desk #1',
      date: '03-Sep-2026',
      items: [
        {
          id: 'q-item-3',
          itemId: 'EVOO-GL-1L',
          code: 'EVOO-GL-1L',
          name: 'Extra Virgin Olive Oil Glass Bottle 1L',
          qty: 50,
          unit: 'BOT',
          unitPrice: 9.50,
          total: 475.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'q-item-4',
          itemId: 'PGM250MLB103',
          code: 'PGM250MLB103',
          name: 'Pomegranate Molasses 250ml',
          qty: 150,
          unit: 'BOT',
          unitPrice: 1.37,
          total: 205.50,
          location: 'Choueifat Main Facility'
        }
      ]
    },
    {
      id: 'QUO-2026-0035',
      quotationNumber: 'QUO-2026-0035',
      customerName: 'Al-Janoub Mart Supermarket',
      customerId: 'CUST-003',
      customerGroup: 'Supermarkets & Hypermarkets',
      amount: 1240.00,
      createdBy: 'Admin',
      date: '02-Sep-2026',
      items: [
        {
          id: 'q-item-5',
          itemId: 'EVOO-TIN-16L',
          code: 'EVOO-TIN-16L',
          name: 'Extra Virgin Olive Oil 16L Tin (First Press)',
          qty: 10,
          unit: 'TIN',
          unitPrice: 115.00,
          total: 1150.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'q-item-6',
          itemId: 'CWV250MLB103',
          code: 'CWV250MLB103',
          name: 'White Vinegar 250ml',
          qty: 180,
          unit: 'BOT',
          unitPrice: 0.50,
          total: 90.00,
          location: 'Choueifat Main Facility'
        }
      ]
    },
    {
      id: 'QUO-2026-0029',
      quotationNumber: 'QUO-2026-0029',
      customerName: 'Tyre Regional Co-op',
      customerId: 'CUST-004',
      customerGroup: 'Wholesale Co-ops',
      amount: 950.00,
      createdBy: 'Fadi Kassir',
      date: '01-Sep-2026',
      items: [
        {
          id: 'q-item-7',
          itemId: 'EVOO-TIN-16L',
          code: 'EVOO-TIN-16L',
          name: 'Extra Virgin Olive Oil 16L Tin (First Press)',
          qty: 8,
          unit: 'TIN',
          unitPrice: 115.00,
          total: 920.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'q-item-8',
          itemId: 'CARW250GB103',
          code: 'CARW250GB103',
          name: 'Rose Water 250ml',
          qty: 50,
          unit: 'BOT',
          unitPrice: 0.60,
          total: 30.00,
          location: 'Choueifat Main Facility'
        }
      ]
    }
  ]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // --- Actions Dropdown Functional Modals State ---
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isPrintInvoiceModalOpen, setIsPrintInvoiceModalOpen] = useState(false);
  const [isDeliveryNoteModalOpen, setIsDeliveryNoteModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [isStoreRecurringModalOpen, setIsStoreRecurringModalOpen] = useState(false);
  const [isRecallRecurringModalOpen, setIsRecallRecurringModalOpen] = useState(false);
  const [isCustomerPricingModalOpen, setIsCustomerPricingModalOpen] = useState(false);
  const [isCustomerAgedModalOpen, setIsCustomerAgedModalOpen] = useState(false);
  const [isCustomerReceiptsModalOpen, setIsCustomerReceiptsModalOpen] = useState(false);
  const [isPaidInOutModalOpen, setIsPaidInOutModalOpen] = useState(false);
  const [isMainReadingModalOpen, setIsMainReadingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // --- Recurring Templates State ---
  const [recurringTemplateName, setRecurringTemplateName] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState('Weekly');
  const [recurringTemplates, setRecurringTemplates] = useState([
    {
      id: 'REC-01',
      name: 'Weekly Restock - Beirut Gourmet Market',
      customerName: 'Beirut Gourmet Market',
      customerId: 'CUST-002',
      frequency: 'Weekly',
      items: [
        {
          id: 'CWV250MLB103',
          itemId: 'CWV250MLB103',
          code: 'CWV250MLB103',
          name: 'White Vinegar 250ml',
          qty: 24,
          unit: 'BOT',
          unitPrice: 0.50,
          total: 12.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'OACV250MLB103',
          itemId: 'OACV250MLB103',
          code: 'OACV250MLB103',
          name: 'Local Apple Cider Vinegar 250ml',
          qty: 20,
          unit: 'BOT',
          unitPrice: 1.11,
          total: 22.20,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'PGM250MLB103',
          itemId: 'PGM250MLB103',
          code: 'PGM250MLB103',
          name: 'Pomegranate Molasses 250ml',
          qty: 30,
          unit: 'BOT',
          unitPrice: 0.67,
          total: 20.10,
          location: 'Choueifat Main Facility'
        }
      ]
    },
    {
      id: 'REC-02',
      name: 'Bi-Weekly Order - Al-Janoub Mart',
      customerName: 'Al-Janoub Mart Supermarket',
      customerId: 'CUST-003',
      frequency: 'Bi-Weekly',
      items: [
        {
          id: 'CDBW250MLB103',
          itemId: 'CDBW250MLB103',
          code: 'CDBW250MLB103',
          name: 'Orange Blossom Water 250ml',
          qty: 50,
          unit: 'BOT',
          unitPrice: 0.56,
          total: 28.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'CARW250GB103',
          itemId: 'CARW250GB103',
          code: 'CARW250GB103',
          name: 'Rose Water 250ml',
          qty: 50,
          unit: 'BOT',
          unitPrice: 0.56,
          total: 28.00,
          location: 'Choueifat Main Facility'
        }
      ]
    }
  ]);

  // --- Customer Special Pricing Overrides State ---
  const [customerSpecialPrices, setCustomerSpecialPrices] = useState<Record<string, number>>({
    'CWV250MLB103': 0.45,
    'CACV250MLB103': 0.45,
    'OACV250MLB103': 1.00,
    'PGM250MLB103': 0.60
  });

  // --- Paid In / Out Drawer State ---
  const [drawerCashBalance, setDrawerCashBalance] = useState(1250.00);
  const [paidInOutType, setPaidInOutType] = useState<'in' | 'out'>('out');
  const [paidInOutAmount, setPaidInOutAmount] = useState('');
  const [paidInOutCategory, setPaidInOutCategory] = useState('Delivery Driver Fuel');
  const [paidInOutNotes, setPaidInOutNotes] = useState('');
  const [paidInOutHistory, setPaidInOutHistory] = useState([
    { id: 'PIO-01', time: '09:15 AM', type: 'in', category: 'Opening Float', amount: 200.00, notes: 'Cash drawer morning float' },
    { id: 'PIO-02', time: '11:30 AM', type: 'out', category: 'Delivery Driver Fuel', amount: 25.00, notes: 'Van #4 fuel receipt' },
    { id: 'PIO-03', time: '02:15 PM', type: 'out', category: 'Packaging Supplies', amount: 15.00, notes: 'Cardboard tape & markers' }
  ]);

  // --- Customer Receipts History State ---
  const [customerReceipts, setCustomerReceipts] = useState([
    {
      id: 'RCT-2026-0048',
      date: '05-Sep-2026',
      customerName: 'Beirut Gourmet Market',
      customerId: 'CUST-002',
      method: 'Cash USD',
      invoiceRef: 'INV-2026-08920',
      amount: 450.00,
      cleared: true
    },
    {
      id: 'RCT-2026-0042',
      date: '28-Aug-2026',
      customerName: 'Beirut Gourmet Market',
      customerId: 'CUST-002',
      method: 'Bank Cheque (BLOM)',
      invoiceRef: 'INV-2026-08890',
      amount: 1200.00,
      cleared: true
    },
    {
      id: 'RCT-2026-0039',
      date: '15-Aug-2026',
      customerName: 'Al-Janoub Mart Supermarket',
      customerId: 'CUST-003',
      method: 'Visa / MasterCard',
      invoiceRef: 'INV-2026-08855',
      amount: 820.00,
      cleared: true
    },
    {
      id: 'RCT-2026-0031',
      date: '02-Aug-2026',
      customerName: 'Cedar Valley Organics',
      customerId: 'CUST-005',
      method: 'Whish Money',
      invoiceRef: 'INV-2026-08812',
      amount: 345.00,
      cleared: true
    }
  ]);
  const [newReceiptAmount, setNewReceiptAmount] = useState('');
  const [newReceiptMethod, setNewReceiptMethod] = useState('Cash USD');
  const [newReceiptNotes, setNewReceiptNotes] = useState('');

  // --- POS Reading (X/Z) State ---
  const [readingType, setReadingType] = useState<'X' | 'Z'>('X');

  // --- Credit Note State ---
  const [creditNoteReason, setCreditNoteReason] = useState('Customer Return / Defective');
  const [creditNoteReturnQty, setCreditNoteReturnQty] = useState<Record<string, number>>({});

  // --- Payment Modal Temp State ---
  const [selectedPaymentType, setSelectedPaymentType] = useState('Cash USD');
  const [paymentAmountInput, setPaymentAmountInput] = useState('0.00');

  // --- Preview Sales Filter States (Matching Omega Screenshots) ---
  const [previewBranchFilter, setPreviewBranchFilter] = useState('Zeit w zaytoun ljanoub');
  const [previewCustomerSearch, setPreviewCustomerSearch] = useState('');
  const [previewInvoiceSearch, setPreviewInvoiceSearch] = useState('');
  const [previewTransactionType, setPreviewTransactionType] = useState('Show All');
  const [previewInvoiceType, setPreviewInvoiceType] = useState('All Invoices');
  const [previewStatusFilter, setPreviewStatusFilter] = useState('All Status');
  const [previewSalesmanFilter, setPreviewSalesmanFilter] = useState('All Salesmen');
  const [previewUserFilter, setPreviewUserFilter] = useState('All Users');
  const [previewSalesFilter, setPreviewSalesFilter] = useState('All Sales');

  // Active searchable dropdown popover
  const [activeSearchDropdown, setActiveSearchDropdown] = useState<string | null>(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');

  // Confirmation & loading states for Post All (Matching Screenshot 2)
  const [isConfirmPostAllOpen, setIsConfirmPostAllOpen] = useState(false);
  const [isPostingAll, setIsPostingAll] = useState(false);

  const [previewFromDate, setPreviewFromDate] = useState('01-Sep-2026');
  const [previewToDate, setPreviewToDate] = useState('07-Sep-2026');

  // Existing Invoices Directory
  const [invoicesDirectory, setInvoicesDirectory] = useState<InvoiceRecord[]>([
    {
      id: '4000035',
      invoiceNumber: '4000035',
      refCode: '3SO538A0D9',
      date: '04 Sep, 2026',
      deliveryDate: '04 Sep, 2026',
      branch: 'Zeit w zaytoun ljanoub',
      customerName: 'Abou Hamza',
      customerId: '31',
      company: 'Abou Hamzeh Nuts',
      salesman: 'Mahdi',
      createdBy: 'Mohammed Jichi',
      source: 'Local',
      refNumber: '',
      customerAddress: 'Saida Main Road, Abou Hamza Center',
      deliveredBy: 'Providers',
      currency: 'USD',
      transactionType: 'Local',
      invoiceType: 'All Invoices',
      salesChannel: 'Retail',
      items: [
        {
          id: 'item-1',
          itemId: 'EVOO-TIN-16L',
          code: 'EVOO-TIN-16L',
          name: 'Extra Virgin Olive Oil 16L Tin',
          qty: 2,
          unit: 'TIN',
          unitPrice: 115.00,
          total: 230.00,
          location: 'Choueifat Main Facility'
        },
        {
          id: 'item-2',
          itemId: 'CWV250MLB103',
          code: 'CWV250MLB103',
          name: 'White Vinegar 250ml',
          qty: 72,
          unit: 'BOT',
          unitPrice: 0.50,
          total: 36.00,
          location: 'Choueifat Main Facility'
        }
      ],
      subtotal: 266.00,
      discount: 0.00,
      tax: 0.00,
      grandTotal: 266.00,
      payments: [{ id: 'p-01', type: 'Cash USD', amount: 266.00 }],
      status: 'Posted',
      createdAt: '2026-09-04 11:20'
    },
    {
      id: 'INV-2026-08940',
      invoiceNumber: 'INV-2026-08940',
      refCode: '3SO538B12F',
      date: '05 Sep, 2026',
      deliveryDate: '06 Sep, 2026',
      branch: 'Zeit w zaytoun ljanoub',
      customerName: 'Beirut Gourmet Market',
      customerId: 'CUST-002',
      company: 'Beirut Gourmet S.A.L',
      salesman: 'Hiba Aloulou',
      createdBy: 'Mohammed Jichi',
      source: 'Vanguard Market place',
      refNumber: 'REF-8901',
      customerAddress: 'Hamra Street, Bloc B, Beirut',
      deliveredBy: 'In-House Fleet',
      currency: 'USD',
      transactionType: 'Local',
      invoiceType: 'All Invoices',
      salesChannel: 'Wholesale Orders',
      items: [],
      subtotal: 145.00,
      discount: 0.00,
      tax: 0.00,
      grandTotal: 145.00,
      payments: [{ id: 'p-02', type: 'Cash USD', amount: 145.00 }],
      status: 'Posted',
      createdAt: '2026-09-05 14:30'
    },
    {
      id: 'INV-2026-08942',
      invoiceNumber: 'INV-2026-08942',
      refCode: '3SO538C44A',
      date: '06 Sep, 2026',
      deliveryDate: '07 Sep, 2026',
      branch: 'Zeit w zaytoun ljanoub',
      customerName: 'Cedar Valley Organics',
      customerId: 'CUST-005',
      company: 'Cedar Organics SARL',
      salesman: 'Mahdi',
      createdBy: 'Admin',
      source: 'Local',
      refNumber: '',
      customerAddress: 'Ashrafieh, Tabaris, Beirut',
      deliveredBy: 'Providers',
      currency: 'USD',
      transactionType: 'Local',
      invoiceType: 'With Discounts',
      salesChannel: 'Retail Counter',
      items: [],
      subtotal: 435.00,
      discount: 15.00,
      tax: 0.00,
      grandTotal: 420.00,
      payments: [],
      status: 'Unposted',
      createdAt: '2026-09-06 16:45'
    },
    {
      id: 'INV-2026-08870',
      invoiceNumber: 'INV-2026-08870',
      refCode: '3SO538D98C',
      date: '07 Sep, 2026',
      deliveryDate: '07 Sep, 2026',
      branch: 'Zeit w zaytoun ljanoub',
      customerName: 'Al-Janoub Mart Supermarket',
      customerId: 'CUST-003',
      company: 'Al Janoub Group',
      salesman: 'HUSSEIN',
      createdBy: 'Mohammed Jichi',
      source: 'Local',
      refNumber: 'REF-8840',
      customerAddress: 'Main Highway, Nabatieh',
      deliveredBy: 'In-House Fleet',
      currency: 'USD',
      transactionType: 'Local',
      invoiceType: 'All Invoices',
      salesChannel: 'Wholesale Orders',
      items: [],
      subtotal: 1240.00,
      discount: 0.00,
      tax: 0.00,
      grandTotal: 1240.00,
      payments: [{ id: 'p-03', type: 'Bank Check', amount: 1240.00 }],
      status: 'Posted',
      createdAt: '2026-09-07 09:15'
    },
    {
      id: 'INV-2026-08795',
      invoiceNumber: 'INV-2026-08795',
      refCode: '3SO538E55B',
      date: '07 Sep, 2026',
      deliveryDate: '08 Sep, 2026',
      branch: 'Zeit w zaytoun ljanoub',
      customerName: 'Tyre Regional Co-op',
      customerId: 'CUST-004',
      company: 'Tyre Farmers Co-op',
      salesman: 'Ricky',
      createdBy: 'Fadi Kassir',
      source: 'Vanguard Market place',
      refNumber: 'REF-8710',
      customerAddress: 'Port Road, Tyre',
      deliveredBy: 'Providers',
      currency: 'USD',
      transactionType: 'Local',
      invoiceType: 'All Invoices',
      salesChannel: 'Wholesale Orders',
      items: [],
      subtotal: 950.00,
      discount: 0.00,
      tax: 0.00,
      grandTotal: 950.00,
      payments: [{ id: 'p-04', type: 'Cash USD', amount: 950.00 }],
      status: 'Posted',
      createdAt: '2026-09-07 10:30'
    }
  ]);

  // Synchronize division options when category changes
  useEffect(() => {
    const divs = DIVISIONS_MAP[activeTabCategory] || [];
    if (divs.length > 0 && !divs.includes(activeTabDivision)) {
      setActiveTabDivision(divs[0]);
    }
  }, [activeTabCategory]);

  // Synchronize group options when division changes
  useEffect(() => {
    const grps = GROUPS_MAP[activeTabDivision] || [];
    if (grps.length > 0 && !grps.includes(activeTabGroup)) {
      setActiveTabGroup(grps[0]);
    }
  }, [activeTabDivision]);

  // Filtered Catalog Items
  const filteredCatalogItems = useMemo(() => {
    return OMEGA_SALES_ITEMS.filter((item) => {
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q)
        );
      }
      return (
        item.category === activeTabCategory &&
        item.division === activeTabDivision &&
        item.group === activeTabGroup
      );
    });
  }, [activeTabCategory, activeTabDivision, activeTabGroup, catalogSearch]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const discount = 0;
  const tax = 0;
  const grandTotal = subtotal;

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingBalance = Math.max(0, grandTotal - totalPaid);
  const changeDue = Math.max(0, totalPaid - grandTotal);

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentAmountInput(remainingBalance.toFixed(2));
    }
  }, [isPaymentModalOpen, remainingBalance]);

  // Handlers
  const handleAddItemToCart = (item: SalesItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.itemId === item.id);
      if (existing) {
        return prev.map((p) =>
          p.itemId === item.id
            ? { ...p, qty: p.qty + 1, total: Number(((p.qty + 1) * p.unitPrice).toFixed(2)) }
            : p
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          itemId: item.id,
          code: item.code,
          name: item.name,
          qty: 1,
          unit: item.unit,
          unitPrice: item.price,
          total: item.price,
          location: 'Choueifat Main Facility',
          cost: item.cost
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateCartQty = (cartId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartId
          ? { ...item, qty: newQty, total: Number((newQty * item.unitPrice).toFixed(2)) }
          : item
      )
    );
  };

  const handleUpdateCartPrice = (cartId: string, newPrice: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartId
          ? { ...item, unitPrice: newPrice, total: Number((item.qty * newPrice).toFixed(2)) }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartId));
  };

  const handleNewInvoice = () => {
    const nextNb = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setInvoiceNumber(nextNb);
    setCartItems([]);
    setPayments([]);
    setSelectedCustomer(CUSTOMER_PRESETS[0]);
    setCustomerSearch('');
    setStatusNotice(`New blank invoice initialized: ${nextNb}`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleAddPayment = () => {
    const amt = parseFloat(paymentAmountInput);
    if (isNaN(amt) || amt <= 0) return;
    const newEntry: PaymentEntry = {
      id: `pay-${Date.now()}`,
      type: selectedPaymentType,
      amount: amt
    };
    setPayments((prev) => [...prev, newEntry]);
    setPaymentAmountInput('0.00');
  };

  const handleRemovePayment = (payId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== payId));
  };

  const handleSaveInvoice = (postImmediately = false) => {
    if (cartItems.length === 0) {
      alert('Cannot save an empty invoice. Please select at least one item from the catalog.');
      return;
    }

    const branchName =
      BRANCH_OPTIONS.find((b) => b.id === selectedBranch)?.name || 'Zeit w zaytoun ljanoub';

    const newRecord: InvoiceRecord = {
      id: invoiceNumber,
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      deliveryDate: deliveryDate,
      branch: branchName,
      customerName: selectedCustomer.name || 'Miscellaneous / Cash Customer',
      customerId: selectedCustomer.id || 'CUST-001',
      customerAddress: selectedCustomer.address || 'Local Branch',
      deliveredBy: deliveredBy,
      currency: currency,
      transactionType: transactionType,
      items: [...cartItems],
      subtotal: subtotal,
      discount: 0,
      tax: 0,
      grandTotal: grandTotal,
      payments: [...payments],
      status: postImmediately ? 'Posted' : 'Draft',
      createdAt: new Date().toLocaleString()
    };

    setInvoicesDirectory((prev) => [newRecord, ...prev]);
    setStatusNotice(
      postImmediately
        ? `Invoice ${invoiceNumber} SAVED & POSTED! Inventory deducted.`
        : `Invoice ${invoiceNumber} saved as DRAFT.`
    );
    setTimeout(() => setStatusNotice(null), 4000);

    if (postImmediately) {
      setTimeout(() => {
        handleNewInvoice();
      }, 1500);
    }
  };

  const handleLoadInvoice = (rec: InvoiceRecord) => {
    setInvoiceNumber(rec.invoiceNumber);
    setInvoiceDate(rec.date);
    setDeliveryDate(rec.deliveryDate);
    setDeliveredBy(rec.deliveredBy);
    setCurrency(rec.currency);
    setTransactionType(rec.transactionType);
    setSelectedCustomer({
      id: rec.customerId,
      name: rec.customerName,
      address: rec.customerAddress
    });
    setCustomerSearch(rec.customerName);
    setCartItems(rec.items.length > 0 ? rec.items : []);
    setPayments(rec.payments);
    setIsPreviewSalesModalOpen(false);
    setStatusNotice(`Loaded invoice: ${rec.invoiceNumber} (${rec.status})`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // --- Handlers for the 11 Actions ---
  const handleStoreRecurring = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please add items before storing as recurring template.');
      return;
    }
    const name = recurringTemplateName.trim() || `${recurringFrequency} - ${selectedCustomer.name || 'Store Order'}`;
    const newTpl = {
      id: `REC-${Date.now()}`,
      name,
      customerName: selectedCustomer.name || 'Miscellaneous',
      customerId: selectedCustomer.id || 'CUST-001',
      frequency: recurringFrequency,
      items: [...cartItems]
    };
    setRecurringTemplates((prev) => [newTpl, ...prev]);
    setIsStoreRecurringModalOpen(false);
    setRecurringTemplateName('');
    setStatusNotice(`Recurring Template "${name}" saved successfully!`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleLoadRecurringTemplate = (tpl: (typeof recurringTemplates)[0]) => {
    setCartItems(tpl.items.map((it) => ({ ...it, id: `cart-${Date.now()}-${Math.random()}` })));
    const cust = CUSTOMER_PRESETS.find((c) => c.id === tpl.customerId) || {
      id: tpl.customerId,
      name: tpl.customerName,
      address: 'Local Branch'
    };
    setSelectedCustomer(cust);
    setCustomerSearch(tpl.customerName);
    setIsRecallRecurringModalOpen(false);
    setStatusNotice(`Loaded recurring template: ${tpl.name}`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleDeleteRecurringTemplate = (id: string) => {
    setRecurringTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveCustomerSpecialPrice = (code: string, price: number) => {
    setCustomerSpecialPrices((prev) => ({ ...prev, [code]: price }));
  };

  const handleApplyCustomerPricing = () => {
    setCartItems((prev) =>
      prev.map((item) => {
        const special = customerSpecialPrices[item.code];
        if (special !== undefined) {
          return {
            ...item,
            unitPrice: special,
            total: Number((item.qty * special).toFixed(2))
          };
        }
        return item;
      })
    );
    setIsCustomerPricingModalOpen(false);
    setStatusNotice(`Special customer contract prices applied to cart!`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleRecordPaidInOut = () => {
    const amt = parseFloat(paidInOutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    const newEntry = {
      id: `PIO-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: paidInOutType,
      category: paidInOutCategory,
      amount: amt,
      notes: paidInOutNotes.trim() || (paidInOutType === 'in' ? 'Cash Deposit' : 'Cash Payout')
    };
    setPaidInOutHistory((prev) => [newEntry, ...prev]);
    setDrawerCashBalance((prev) => (paidInOutType === 'in' ? prev + amt : Math.max(0, prev - amt)));
    setPaidInOutAmount('');
    setPaidInOutNotes('');
    setIsPaidInOutModalOpen(false);
    setStatusNotice(`Cash drawer ${paidInOutType === 'in' ? 'Paid In' : 'Paid Out'} ($${amt.toFixed(2)}) recorded.`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleIssueCreditNote = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please select items or load an invoice to issue a Credit Note.');
      return;
    }
    const crnNumber = `CRN-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const crnRecord: InvoiceRecord = {
      id: crnNumber,
      invoiceNumber: crnNumber,
      date: invoiceDate,
      deliveryDate: deliveryDate,
      branch: BRANCH_OPTIONS.find((b) => b.id === selectedBranch)?.name || 'Southern Olive Oil Products S.A.R.L',
      customerName: selectedCustomer.name || 'Miscellaneous Customer',
      customerId: selectedCustomer.id || 'CUST-001',
      customerAddress: selectedCustomer.address || 'Local Branch',
      deliveredBy: deliveredBy,
      currency: currency,
      transactionType: 'Credit Note',
      items: cartItems.map((item) => ({
        ...item,
        qty: creditNoteReturnQty[item.id] !== undefined ? creditNoteReturnQty[item.id] : item.qty,
        total: Number(((creditNoteReturnQty[item.id] !== undefined ? creditNoteReturnQty[item.id] : item.qty) * item.unitPrice).toFixed(2))
      })),
      subtotal: -subtotal,
      discount: 0,
      tax: 0,
      grandTotal: -grandTotal,
      payments: [{ id: `p-${Date.now()}`, type: 'Credit to Account', amount: grandTotal }],
      status: 'Posted',
      createdAt: new Date().toLocaleString()
    };
    setInvoicesDirectory((prev) => [crnRecord, ...prev]);
    setIsCreditNoteModalOpen(false);
    setStatusNotice(`Credit Note ${crnNumber} posted! $${grandTotal.toFixed(2)} credited.`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleRecordCustomerReceipt = () => {
    const amt = parseFloat(newReceiptAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid receipt amount.');
      return;
    }
    const rctNum = `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRct = {
      id: rctNum,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: selectedCustomer.name || 'Miscellaneous Customer',
      customerId: selectedCustomer.id || 'CUST-001',
      method: newReceiptMethod,
      invoiceRef: invoiceNumber || 'INV-2026-08942',
      amount: amt,
      cleared: true
    };
    setCustomerReceipts((prev) => [newRct, ...prev]);
    setNewReceiptAmount('');
    setNewReceiptNotes('');
    setStatusNotice(`Payment Receipt ${rctNum} recorded ($${amt.toFixed(2)}) for ${selectedCustomer.name}`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Filtered Pending Quotations
  const filteredPendingQuotations = useMemo(() => {
    return pendingQuotations.filter((q) => {
      if (quotationCustomerSearch.trim()) {
        const query = quotationCustomerSearch.toLowerCase();
        if (!q.customerName.toLowerCase().includes(query) && !q.customerId.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (quotationCustomerGroup !== 'All Customer Groups' && q.customerGroup !== quotationCustomerGroup) {
        return false;
      }
      if (quotationSearchQuery.trim()) {
        const query = quotationSearchQuery.toLowerCase();
        if (!q.quotationNumber.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [pendingQuotations, quotationCustomerSearch, quotationCustomerGroup, quotationSearchQuery]);

  const handleConvertQuotationToInvoice = (quote: typeof pendingQuotations[0]) => {
    const cust = CUSTOMER_PRESETS.find((c) => c.id === quote.customerId) || {
      id: quote.customerId,
      name: quote.customerName,
      address: 'Local Branch'
    };
    setSelectedCustomer(cust);
    setCustomerSearch(quote.customerName);
    setCartItems(quote.items.map((it) => ({ ...it, id: `cart-${Date.now()}-${Math.random()}` })));
    setIsQuotationsModalOpen(false);
    setSelectedQuotationId(null);
    setStatusNotice(`Quotation ${quote.quotationNumber} ($${quote.amount.toFixed(2)}) loaded into active bill!`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleConfirmQuotationSelection = () => {
    if (!selectedQuotationId) {
      setIsQuotationsModalOpen(false);
      return;
    }
    const quote = pendingQuotations.find((q) => q.id === selectedQuotationId);
    if (quote) {
      handleConvertQuotationToInvoice(quote);
    } else {
      setIsQuotationsModalOpen(false);
    }
  };

  // Filtered Preview Sales Invoices (Matching Screenshots 1, 2, 3, 4, 5)
  const filteredPreviewInvoices = useMemo(() => {
    return invoicesDirectory.filter((inv) => {
      // Branch filter
      if (previewBranchFilter !== 'All Branches' && previewBranchFilter !== 'Zeit w zaytoun ljanoub' && inv.branch !== previewBranchFilter) {
        return false;
      }
      // Customer search
      if (previewCustomerSearch.trim()) {
        const q = previewCustomerSearch.toLowerCase();
        if (!inv.customerName.toLowerCase().includes(q) && !inv.customerId.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Invoice search
      if (previewInvoiceSearch.trim()) {
        const q = previewInvoiceSearch.toLowerCase();
        const numMatch = inv.invoiceNumber.toLowerCase().includes(q);
        const refMatch = inv.refCode && inv.refCode.toLowerCase().includes(q);
        if (!numMatch && !refMatch) {
          return false;
        }
      }
      // Transaction Type (Show All, Local, International, Online)
      if (previewTransactionType !== 'Show All' && inv.transactionType !== previewTransactionType) {
        return false;
      }
      // Invoice Type (All Invoices, With Discounts, Back Orders, Layaway, Inter Brands Invoice, Not Delivered)
      if (previewInvoiceType !== 'All Invoices' && inv.invoiceType && inv.invoiceType !== previewInvoiceType) {
        return false;
      }
      // Status (All Status, Unposted, Posted)
      if (previewStatusFilter !== 'All Status') {
        if (previewStatusFilter === 'Posted' && inv.status !== 'Posted') return false;
        if (previewStatusFilter === 'Unposted' && inv.status === 'Posted') return false;
      }
      // Salesman
      if (previewSalesmanFilter !== 'All Salesmen' && inv.salesman !== previewSalesmanFilter) {
        return false;
      }
      // User
      if (previewUserFilter !== 'All Users' && inv.createdBy !== previewUserFilter) {
        return false;
      }
      // Sales Filter matching Screenshot 1 (Positive Sales, 0 Value Sales, Negative Sales, All Sales)
      if (previewSalesFilter === 'Positive Sales' && inv.grandTotal <= 0) {
        return false;
      }
      if (previewSalesFilter === '0 Value Sales' && inv.grandTotal !== 0) {
        return false;
      }
      if (previewSalesFilter === 'Negative Sales' && inv.grandTotal >= 0) {
        return false;
      }
      return true;
    });
  }, [
    invoicesDirectory,
    previewBranchFilter,
    previewCustomerSearch,
    previewInvoiceSearch,
    previewTransactionType,
    previewInvoiceType,
    previewStatusFilter,
    previewSalesmanFilter,
    previewUserFilter,
    previewSalesFilter
  ]);

  // Preview Totals
  const previewTotals = useMemo(() => {
    const netUSD = filteredPreviewInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const netLL = netUSD * 89500;
    const discountTotal = filteredPreviewInvoices.reduce((sum, inv) => sum + inv.discount, 0);
    const taxTotal = filteredPreviewInvoices.reduce((sum, inv) => sum + inv.tax, 0);
    return {
      netUSD,
      netLL,
      discountTotal,
      taxTotal,
      count: filteredPreviewInvoices.length
    };
  }, [filteredPreviewInvoices]);

  const handleOpenReportScreen = (inv?: any) => {
    setReportTargetInvoice(inv || {
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      customerName: selectedCustomer.name,
      items: cartItems,
      total: grandTotal,
      currency: currency
    });
    setShowReportInvoice(true);
  };

  const handleCloseReportScreen = () => {
    setShowReportInvoice(false);
  };

  const handlePostAllInvoices = () => {
    setIsConfirmPostAllOpen(true);
  };

  const handleExecutePostAll = () => {
    setIsConfirmPostAllOpen(false);
    setIsPostingAll(true);
    setTimeout(() => {
      setInvoicesDirectory((prev) =>
        prev.map((inv) => ({
          ...inv,
          status: 'Posted'
        }))
      );
      setIsPostingAll(false);
      setStatusNotice(`All ${filteredPreviewInvoices.length} invoices successfully posted to General Ledger!`);
      setTimeout(() => setStatusNotice(null), 3500);
    }, 700);
  };

  return (
    <div className="flex h-screen w-full bg-background text-slate-800 font-sans select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 0. AUTHENTIC OMEGA NAVIGATION SIDEBAR (Matching media_1788788432926.png)   */}
      {/* ========================================================================= */}
      {withOmegaSidebar && (
        <div
          className={`${
            omegaSidebarCollapsed ? 'w-14' : 'w-56'
          } bg-white border-r border-border flex flex-col shrink-0 h-full transition-all duration-150 z-30 select-none overflow-hidden`}
        >
          {/* Top Bar: Hamburger on left, Home on right */}
          <div className="h-9 border-b border-border flex items-center justify-between px-3 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setOmegaSidebarCollapsed(!omegaSidebarCollapsed)}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {!omegaSidebarCollapsed && (
              <a
                href="/backoffice"
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Enterprise Main Hub"
              >
                <Home className="w-4 h-4 text-slate-500" />
              </a>
            )}
          </div>

          {/* Search Box */}
          {!omegaSidebarCollapsed && (
            <div className="p-2 border-b border-border bg-white shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="search"
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded pl-7 pr-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Nav Items Tree */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2 text-xs">
            {/* Sales Control */}
            <div className="px-2.5 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11.5px]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                {!omegaSidebarCollapsed && <span>Sales Control</span>}
              </div>
              {!omegaSidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
            </div>

            {/* Operations Center */}
            <div className="mt-1">
              <div className="px-2.5 py-1.5 flex items-center justify-between text-slate-800 hover:bg-slate-50 cursor-pointer font-bold text-[11.5px]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {!omegaSidebarCollapsed && <span>Operations Center</span>}
                </div>
                {!omegaSidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
              </div>

              {!omegaSidebarCollapsed && (
                <div className="pl-4 pr-1 space-y-0.5 mt-0.5 text-[11px]">
                  {/* Dashboard */}
                  <a
                    href="/backoffice/operations?section=dashboard"
                    className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dashboard</span>
                  </a>

                  {/* Reports */}
                  <a
                    href="/backoffice/operations?section=reports"
                    className="flex items-center gap-2 px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  >
                    <PieChart className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reports</span>
                  </a>

                  {/* Actions (Expanded) */}
                  <div className="pt-0.5">
                    <div className="flex items-center justify-between px-2 py-1 font-semibold text-slate-800 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Actions</span>
                      </div>
                      <ChevronDown className="w-2.5 h-2.5 text-primary" />
                    </div>

                    <div className="pl-3.5 space-y-0.5 mt-0.5 border-l border-slate-200">
                      {/* Sales (Active) */}
                      <a
                        href="/sales"
                        className="flex items-center gap-2 px-2 py-1.5 rounded font-bold text-primary bg-muted"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sales</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=quotations"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Quotations</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=delivery_goods"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Delivery of Goods</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=purchases"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                        <span>Purchases</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=purchase_orders"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                        <span>Purchase Orders</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=reorder_guide"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Compass className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reorder Guide</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=transfers"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>Transfers</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=lost_goods"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <PackageX className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lost Goods</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=item_assembly"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Boxes className="w-3.5 h-3.5 text-slate-400" />
                        <span>Item Assembly</span>
                      </a>

                      <a
                        href="/backoffice/operations?section=adjustments"
                        className="flex items-center gap-2 px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                      >
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        <span>Adjustments</span>
                      </a>

                      <div className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span>Product Request</span>
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 text-primary" />
                      </div>

                      <div className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Events</span>
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Setup */}
                  <div className="flex items-center justify-between px-2 py-1 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium mt-1">
                    <div className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Setup</span>
                    </div>
                    <ChevronDown className="w-2.5 h-2.5 text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Customer Management */}
            <div className="px-2.5 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 cursor-pointer font-medium text-[11.5px] mt-2">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                {!omegaSidebarCollapsed && <span>Customer Management</span>}
              </div>
              {!omegaSidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIGHT MAIN WORKSTATION                                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BAR: WATCH TUTORIAL (TOP RIGHT) + CONTROLS ROW              */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-border px-3 py-1.5 flex flex-col gap-1 shrink-0 z-20">
        
        {/* Very top line: Watch Tutorial on top right */}
        <div className="flex justify-end w-full">
          <a
            href="#watchTutorial"
            onClick={(e) => {
              e.preventDefault();
              alert('Omega Video Tutorial: Operations Center -> Sales Invoicing');
            }}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Watch Tutorial
          </a>
        </div>

        {/* Controls row: Branch select on left, Search + Buttons on right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Branch Selector */}
          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-72">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-white border border-border rounded px-3 py-1 text-xs font-normal text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs pr-8 cursor-pointer"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {statusNotice && (
              <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-2.5 py-0.5 rounded">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{statusNotice}</span>
              </div>
            )}
          </div>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-1">
            
            {/* Search by Invoice Nb Input */}
            <div className="relative w-56 md:w-64 mr-2">
              <input
                type="text"
                placeholder="Search by Invoice Nb"
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && invoiceSearchQuery.trim()) {
                    const match = invoicesDirectory.find((inv) =>
                      inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
                    );
                    if (match) handleLoadInvoice(match);
                    else alert(`No invoice found matching "${invoiceSearchQuery}"`);
                  }
                }}
                className="w-full bg-white border border-border rounded px-3 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* + New Button (#2f3b52) */}
            <button
              type="button"
              onClick={handleNewInvoice}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Start New Invoice"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {/* Calendar Icon Button (Opens Schedule in new tab) */}
            <button
              type="button"
              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
              title="Schedule / Appointments Calendar (Opens in new tab)"
              onClick={() => window.open('/schedule', '_blank')}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-orange-400" />
            </button>

            {/* Info Icon Button (Invoice Info) */}
            <button
              type="button"
              onClick={() => setIsInvoiceInfoModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
              title="Invoice Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {/* Search/Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewSalesModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
              title="Search & Preview Invoices"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Bell Button (Pending Quotations) */}
            <button
              type="button"
              onClick={() => setIsQuotationsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
              title="Pending Quotations to Convert"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Operations Actions"
              >
                <span>Actions</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isActionsDropdownOpen && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsActionsDropdownOpen(false)}
                  />

                  <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded shadow-xl py-1 z-50 text-[13px] text-slate-800 font-sans divide-y divide-slate-100">
                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          handleOpenReportScreen();
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsDeliveryNoteModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Print Delivery Note
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsCreditNoteModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Credit Note
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsStoreRecurringModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Store Recurring
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsRecallRecurringModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Recall Recurring
                      </button>
                    </div>

                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsCustomerPricingModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Customer Pricing
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsCustomerAgedModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Customer Aged
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsCustomerReceiptsModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Customers Receipts
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsPaidInOutModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Paid In / Out
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsMainReadingModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Main Reading
                      </button>
                    </div>

                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL PANE WORKSPACE (LEFT: CATALOG | RIGHT: BILL & CART)               */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANE: CATALOG & PRODUCT SELECTION                                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full md:w-[50%] lg:w-[52%] border-r border-border bg-white flex flex-col overflow-hidden">
          
          {/* Search Items Header Input */}
          <div className="p-2.5 border-b border-border bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search Items By Description, Code or Barcode..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-white border border-border rounded pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Hierarchical 3-Tier Tab Bar */}
          {!catalogSearch && (
            <div className="border-b border-border bg-white flex flex-col">
              
              {/* Row 1: Categories (Retail / Wholesale / Promotions / Raw Materials) */}
              <div className="flex items-center border-b border-border overflow-x-auto custom-scrollbar px-1 py-1 gap-1">
                {CATEGORIES_LIST.map((cat) => {
                  const isActive = activeTabCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveTabCategory(cat)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-muted text-primary font-bold border border-border'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-border'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Divisions */}
              <div className="flex items-center border-b border-border overflow-x-auto custom-scrollbar px-1 py-1 gap-1 bg-card">
                {(DIVISIONS_MAP[activeTabCategory] || []).map((div) => {
                  const isActive = activeTabDivision === div;
                  return (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setActiveTabDivision(div)}
                      className={`px-2.5 py-1 text-[11px] font-normal rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-muted text-primary font-semibold border border-border'
                          : 'bg-white text-slate-600 border border-border hover:bg-slate-50'
                      }`}
                    >
                      {div}
                    </button>
                  );
                })}
              </div>

              {/* Row 3: Groups */}
              <div className="flex items-center overflow-x-auto custom-scrollbar px-1 py-1 gap-1 bg-muted">
                {(GROUPS_MAP[activeTabDivision] || []).map((grp) => {
                  const isActive = activeTabGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setActiveTabGroup(grp)}
                      className={`px-2 py-0.5 text-[11px] font-normal rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-muted text-primary font-semibold border border-border'
                          : 'bg-white text-slate-500 border border-border hover:bg-slate-50'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Items Listing Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-border">
                {filteredCatalogItems.length > 0 ? (
                  filteredCatalogItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/60 transition-colors group cursor-pointer"
                      onClick={() => handleAddItemToCart(item)}
                    >
                      <td className="py-2 px-3">
                        <div className="font-normal text-slate-800 text-[13px]">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">({item.code})</div>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 text-xs font-normal">
                        {item.unit}
                      </td>
                      <td className="py-2 px-3 text-center font-normal text-slate-600 text-xs">
                        {item.stockQty}
                      </td>
                      <td className="py-2 px-4 text-right font-normal text-slate-800 text-xs">
                        {item.price.toFixed(2)} $
                      </td>
                      <td className="py-2 px-3 text-center w-8">
                        <span className="text-slate-400 group-hover:text-slate-800 text-base font-bold select-none cursor-pointer">
                          +
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No items found in this group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANE: BILL TO & CART INVOICE                                      */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full md:w-[50%] lg:w-[48%] bg-white flex flex-col overflow-hidden border-t md:border-t-0">
          
          {/* Customer & Metadata Block */}
          <div className="p-3 bg-white border-b border-border space-y-2 shrink-0">
            
            {/* Upper Section: Customer info on Left, Metadata on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start text-xs">
              
              {/* Left 7 Columns: Customer Details */}
              <div className="lg:col-span-7 space-y-1.5">
                
                {/* Bill To */}
                <div className="flex items-center gap-2">
                  <span className="font-normal text-slate-700 w-16 text-[11px]">Bill To:</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search customer ..."
                      value={customerSearch || selectedCustomer.name}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                    {isCustomerDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded shadow-xl z-50 max-h-48 overflow-y-auto text-xs py-1">
                        {CUSTOMER_PRESETS.filter((c) => c.name).map((cust) => (
                          <div
                            key={cust.id}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setCustomerSearch('');
                              setIsCustomerDropdownOpen(false);
                            }}
                            className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800">{cust.name}</span>
                            <span className="text-[10px] text-slate-400">{cust.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer ID */}
                <div className="flex items-center gap-2">
                  <span className="font-normal text-slate-700 w-20 text-[11px]">Customer ID:</span>
                  <span className="text-slate-600 font-medium">{selectedCustomer.id || ''}</span>
                </div>

                {/* Address with dark square edit pencil button */}
                <div className="flex items-center gap-2">
                  <span className="font-normal text-slate-700 w-16 text-[11px]">Address:</span>
                  <div className="flex-1 flex items-center justify-between pr-2">
                    <span className="text-slate-600 truncate text-[11px]">{selectedCustomer.address || ''}</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white p-1 rounded cursor-pointer shrink-0"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Metadata Controls */}
              <div className="lg:col-span-5 space-y-1.5">
                
                {/* Date */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-normal text-slate-700 text-[11px] w-20 text-right">Date:</span>
                  <div className="flex-1">
                    <DatePickerInput
                      value={invoiceDate}
                      onChange={setInvoiceDate}
                      className="w-full"
                      inputWidth="w-full"
                    />
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-normal text-slate-700 text-[11px] w-20 text-right">Delivery Date:</span>
                  <div className="flex-1">
                    <DatePickerInput
                      value={deliveryDate}
                      onChange={setDeliveryDate}
                      className="w-full"
                      inputWidth="w-full"
                    />
                  </div>
                </div>

                {/* Delivered By with green plus button */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-normal text-slate-700 text-[11px] w-20 text-right">Delivered By:</span>
                  <div className="flex items-center gap-1 flex-1">
                    <select
                      value={deliveredBy}
                      onChange={(e) => setDeliveredBy(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-0.5 text-xs text-slate-700 shadow-2xs"
                    >
                      <option value="Providers">Providers</option>
                      <option value="In-House Fleet">In-House Fleet</option>
                      <option value="Customer Pickup">Customer Pickup</option>
                    </select>
                    <button
                      type="button"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white p-1 rounded shrink-0"
                      title="Add Delivery Provider"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Currency with dark square edit button */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-normal text-slate-700 text-[11px] w-20 text-right">Currency:</span>
                  <div className="flex items-center gap-1 flex-1">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-0.5 text-xs text-slate-700 shadow-2xs"
                    >
                      <option value="USD">USD</option>
                      <option value="LBP">LBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <button
                      type="button"
                      className="bg-primary hover:bg-primary/90 text-white p-1 rounded shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Transaction Type */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-normal text-slate-700 text-[11px] w-20 text-right">Transaction Type:</span>
                  <div className="flex-1">
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-0.5 text-xs text-slate-700 shadow-2xs"
                    >
                      <option value="Local">Local</option>
                      <option value="Export">Export</option>
                      <option value="Internal">Internal</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="text-slate-700 font-semibold border-b border-border bg-white sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 font-medium">Product</th>
                  <th className="py-2 px-2 text-right font-medium w-16">Qty</th>
                  <th className="py-2 px-2 text-center font-medium w-12">Unit</th>
                  <th className="py-2 px-2 text-right font-medium w-24">Unit Price ($)</th>
                  <th className="py-2 px-3 text-right font-medium w-20">Total</th>
                  <th className="py-2 px-2 text-left font-medium w-24">Location</th>
                  <th className="py-2 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-normal text-slate-800 text-[12px]">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">({item.code})</div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateCartQty(item.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-14 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs text-right text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600 font-normal">
                        {item.unit}
                      </td>
                      <td className="py-2 px-2 text-right font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleUpdateCartPrice(item.id, isNaN(val) ? 0 : val);
                            }}
                            className="w-18 bg-white border border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 text-xs text-right font-mono font-medium text-slate-800 focus:outline-none shadow-2xs"
                            title="Edit Unit Price manually"
                          />
                          <span className="text-slate-500 text-xs font-mono">$</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">
                        {item.total.toFixed(2)} $
                      </td>
                      <td className="py-2 px-2 text-left">
                        <select
                          value={item.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCartItems((prev) =>
                              prev.map((p) => (p.id === item.id ? { ...p, location: val } : p))
                            );
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] font-normal text-slate-700 shadow-2xs"
                        >
                          <option value="All Locations">All Locations</option>
                          <option value="Choueifat Main Facility">Choueifat Main Facility</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-300 text-xs">
                      {/* Empty table matching screenshot */}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Area: Payment on Left | Save and Save & Post on Right */}
          <div className="bg-white border-t border-border p-3 shrink-0 flex items-center justify-between gap-4">
            
            {/* Payment Button (Exact Slate Blue-Gray #71829e) */}
            <div className="w-48 md:w-56">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cartItems.length === 0}
                className={`w-full py-2 px-4 rounded font-normal text-xs text-white shadow-2xs transition-colors text-center cursor-pointer ${
                  cartItems.length === 0
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                Payment {payments.length > 0 ? `(${payments.length})` : ''}
              </button>
            </div>

            {/* Right Action Buttons: Save (Orange) & Save & Post (Green) */}
            <div className="flex items-center gap-1.5">
              
              {/* Save Button (Orange #fb8205) */}
              <button
                type="button"
                onClick={() => handleSaveInvoice(false)}
                disabled={cartItems.length === 0}
                className={`py-1.5 px-4 rounded text-xs text-white font-medium shadow-2xs transition-colors flex items-center gap-1 cursor-pointer ${
                  cartItems.length === 0
                    ? 'bg-amber-600/60 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {/* Save & Post Button (Green #1e3a2b / #15803d) */}
              <button
                type="button"
                onClick={() => handleSaveInvoice(true)}
                disabled={cartItems.length === 0}
                className={`py-1.5 px-4 rounded text-xs text-white font-medium shadow-2xs transition-colors flex items-center gap-1 cursor-pointer ${
                  cartItems.length === 0
                    ? 'bg-primary/60 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Post</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* 3. AUTHENTIC OMEGA PAYMENT MODAL                                         */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded shadow-2xl border-4 border-border w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Payments</h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              
              {/* Left: Choose Payment Types */}
              <div className="md:col-span-5 space-y-2">
                <div className="font-semibold text-slate-700 text-[11px]">
                  Choose Payment Types
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {PAYMENT_TYPES.map((pt) => {
                    const isSelected = selectedPaymentType === pt.name;
                    return (
                      <div
                        key={pt.id}
                        onClick={() => setSelectedPaymentType(pt.name)}
                        className={`px-3 py-2 rounded-xs border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pt.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Payment Breakdown */}
              <div className="md:col-span-7 border border-slate-200 rounded p-3 space-y-3 bg-background">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-semibold">
                  <span className="text-slate-700">Invoice Amount:</span>
                  <span className="text-slate-900 font-bold">{grandTotal.toFixed(2)} USD</span>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700">Amount Paid:</div>
                  {payments.length > 0 ? (
                    <div className="space-y-1">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded px-2.5 py-1 text-xs"
                        >
                          <span className="text-slate-700">{p.type}</span>
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <span>{p.amount.toFixed(2)} USD</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePayment(p.id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">No payments entered yet.</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700">
                    Add Payment ({selectedPaymentType}):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmountInput}
                      onChange={(e) => setPaymentAmountInput(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPayment}
                      className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPaymentAmountInput(amt.toFixed(2))}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-2 py-0.5 rounded text-[11px] shadow-2xs cursor-pointer"
                      >
                        ${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPaymentAmountInput(remainingBalance.toFixed(2))}
                      className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs cursor-pointer"
                    >
                      Exact
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700">Total Payments:</span>
                    <span className="text-slate-900">{totalPaid.toFixed(2)} USD</span>
                  </div>
                  {remainingBalance > 0 ? (
                    <div className="flex items-center justify-between font-bold text-red-600">
                      <span>Remaining Amount:</span>
                      <span>{remainingBalance.toFixed(2)} USD</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between font-bold text-emerald-600">
                      <span>Change:</span>
                      <span>{changeDue.toFixed(2)} USD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* AUTHENTIC REPORT SCREEN (showReportInvoice)                               */}
      {/* ========================================================================= */}
      {showReportInvoice && (
        <div className="fixed inset-0 z-50 bg-muted flex flex-col overflow-y-auto animate-in fade-in-50 duration-150">
          {/* Top Actions Bar (Print, Export, Send By Email, Close) */}
          <div className="bg-primary text-white px-6 py-2.5 flex items-center justify-between shadow-md print:hidden sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm tracking-wide">
                Sales Report / Invoice #{reportTargetInvoice?.invoiceNumber || invoiceNumber}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-medium">
                {reportTargetInvoice?.date || '10-Sep-2026'}
              </span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusNotice('Exporting PDF document...');
                  setTimeout(() => setStatusNotice(null), 2500);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSendSalesReportModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send By Email</span>
              </button>
              <button
                type="button"
                onClick={handleCloseReportScreen}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Printable Report Document */}
          <div className="flex-1 p-6 flex justify-center">
            <div className="bg-white border border-slate-300 shadow-xl rounded-sm w-full max-w-[850px] p-8 text-slate-800 font-sans space-y-6">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">SOUTHERN OLIVE OIL PRODUCTS S.A.L.</h1>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">Vanguard ERP Enterprise • Financial & Sales Division</div>
                  <div className="text-xs text-slate-500 mt-1">Branch: Zeit w zaytoun ljanoub | Tax ID: 3049281-601</div>
                  <div className="text-xs text-slate-500">Address: Nabatieh Industrial Zone, Building B, South Lebanon</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-blue-900 uppercase">
                    {previewSalesFilter === 'Quotations' ? 'Sales Quotation' : 'Official Sales Invoice'}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                    Doc #: {reportTargetInvoice?.invoiceNumber || invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">Date: {reportTargetInvoice?.date || '10-Sep-2026'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Currency: {currency} (Rate: 89,500 LBP/$)</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Billed To:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{reportTargetInvoice?.customerName || selectedCustomer.name}</div>
                  <div className="text-slate-500">{selectedCustomer.address || 'Nabatieh Main Road, South Lebanon'}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700">Payment Terms:</span>
                  <div className="font-medium text-slate-800 mt-0.5">Cash / On Delivery</div>
                  <div className="text-slate-500">Salesman: {invoiceSalesman} • Status: Posted</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead className="bg-primary text-white font-semibold">
                  <tr>
                    <th className="py-2 px-2.5 border border-slate-400">#</th>
                    <th className="py-2 px-2.5 border border-slate-400">Item Code</th>
                    <th className="py-2 px-2.5 border border-slate-400">Description</th>
                    <th className="py-2 px-2.5 border border-slate-400 text-right">Qty</th>
                    <th className="py-2 px-2.5 border border-slate-400">Unit</th>
                    <th className="py-2 px-2.5 border border-slate-400 text-right">Price ({currency})</th>
                    <th className="py-2 px-2.5 border border-slate-400 text-right">Total ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(reportTargetInvoice?.items && reportTargetInvoice.items.length > 0 ? reportTargetInvoice.items : cartItems).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-2.5 border border-slate-300 font-mono">{item.code}</td>
                      <td className="py-2 px-2.5 border border-slate-300 font-medium">{item.name || item.description}</td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-semibold">{item.qty || item.quantity || 1}</td>
                      <td className="py-2 px-2.5 border border-slate-300">{item.unit || 'PCS'}</td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-semibold">
                        {(item.unitPrice || item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-bold text-blue-950">
                        {(item.total || (item.qty || 1) * (item.unitPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300">Subtotal ({currency}):</td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono">
                      {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300">Tax (11% VAT):</td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono">
                      {(subtotal * 0.11).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 text-sm font-black">
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300 text-blue-900">Grand Total ({currency}):</td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono text-blue-900 font-bold">
                      {(grandTotal * 1.11).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-700">Issued By:</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Authorized Signature & Stamp</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="font-bold text-slate-700">Received By:</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Customer Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEND SALES REPORT MODAL */}
      {isSendSalesReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden text-xs text-slate-800">
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Send Sales Report</h3>
              <button
                type="button"
                onClick={() => setIsSendSalesReportModalOpen(false)}
                className="text-slate-300 hover:text-white text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 bg-white">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recipient Email:</label>
                <input
                  type="email"
                  value={salesReportEmailTo}
                  onChange={(e) => setSalesReportEmailTo(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  value={salesReportSubject}
                  onChange={(e) => setSalesReportSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message Body:</label>
                <textarea
                  rows={3}
                  value={salesReportMessage}
                  onChange={(e) => setSalesReportMessage(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSendSalesReportModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSendSalesReportModalOpen(false);
                  setStatusNotice(`Report sent successfully to ${salesReportEmailTo || 'customer@example.com'}.`);
                  setTimeout(() => setStatusNotice(null), 3000);
                }}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUANTITY ON HAND BY BRANCH MODAL */}
      {itemQtyohModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden text-xs text-slate-800">
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Quantity On Hand by Branches</h3>
              <button
                type="button"
                onClick={() => setItemQtyohModalOpen(false)}
                className="text-slate-300 hover:text-white text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 bg-white">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-semibold text-slate-800">
                Item: {itemQtyohTargetItem?.name || 'Extra Virgin Olive Oil 1L'} ({itemQtyohTargetItem?.code || 'EVOO-1L'})
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2 border-b">Branch Name</th>
                    <th className="p-2 border-b">Location</th>
                    <th className="p-2 border-b text-right">Qty OH</th>
                    <th className="p-2 border-b text-right">Reserved</th>
                    <th className="p-2 border-b text-right font-bold text-emerald-800">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-medium">Zeit w zaytoun ljanoub</td>
                    <td className="p-2 text-slate-500">Choueifat Main Facility</td>
                    <td className="p-2 text-right font-mono font-semibold">134.50</td>
                    <td className="p-2 text-right font-mono text-amber-700">12.00</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700">122.50</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Main Branch</td>
                    <td className="p-2 text-slate-500">Choueifat Main Facility</td>
                    <td className="p-2 text-right font-mono font-semibold">45.00</td>
                    <td className="p-2 text-right font-mono text-amber-700">0.00</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700">45.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setItemQtyohModalOpen(false)}
                className="px-5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERIAL NUMBERS MODAL */}
      {salesSerialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden text-xs text-slate-800">
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Serial Numbers - {salesSerialTargetItem?.name || 'Sales Item'}</h3>
              <button
                type="button"
                onClick={() => setSalesSerialModalOpen(false)}
                className="text-slate-300 hover:text-white text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded p-2.5">
                  <div className="font-bold text-slate-900 mb-1 border-b pb-1">Available Serials</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {salesAvailableSerials.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setSalesSelectedSerials(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                        className={`p-1.5 rounded border text-[11px] cursor-pointer flex justify-between ${
                          salesSelectedSerials.includes(s.id) ? 'bg-blue-50 border-blue-400 font-bold text-blue-900' : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="font-mono">{s.id}</span>
                        <span>{salesSelectedSerials.includes(s.id) ? '✓' : '+'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded p-2.5">
                  <div className="font-bold text-slate-900 mb-1 border-b pb-1">Selected for Invoice</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {salesSelectedSerials.map(sn => (
                      <div key={sn} className="p-1.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-900 flex justify-between text-[11px]">
                        <span className="font-mono font-semibold">{sn}</span>
                        <button
                          type="button"
                          onClick={() => setSalesSelectedSerials(prev => prev.filter(x => x !== sn))}
                          className="text-red-500 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSalesSerialModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSalesSerialModalOpen(false);
                  setStatusNotice('Serial numbers updated.');
                  setTimeout(() => setStatusNotice(null), 2000);
                }}
                className="px-5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PREVIEW SALES INVOICES MODAL                                          */}
      {/* ========================================================================= */}
      {isPreviewSalesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-[1260px] max-h-[94vh] flex flex-col overflow-hidden text-xs text-slate-800">
            {/* Backdrop for active searchable dropdown */}
            {activeSearchDropdown && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => {
                  setActiveSearchDropdown(null);
                  setDropdownSearchTerm('');
                }}
              />
            )}

            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <h2 className="text-base font-medium text-slate-700">Preview Sales</h2>
              <button
                type="button"
                onClick={() => setIsPreviewSalesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-light leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filters Section */}
            <div className="p-5 border-b border-slate-200 space-y-3 bg-white">
              {/* Row 1: Branch, Customer Search, Invoice Search, + New Button */}
              <div className="flex items-center gap-3 w-full">
                {/* Branch Select */}
                <div className="w-56 shrink-0 relative">
                  <select
                    value={previewBranchFilter}
                    onChange={(e) => setPreviewBranchFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
                    <option value="Beirut Main Branch">Beirut Main Branch</option>
                    <option value="All Branches">All Branches</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Customer Search */}
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={previewCustomerSearch}
                    onChange={(e) => setPreviewCustomerSearch(e.target.value)}
                    placeholder="Search customer"
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Invoice Search */}
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={previewInvoiceSearch}
                    onChange={(e) => setPreviewInvoiceSearch(e.target.value)}
                    placeholder={previewSalesFilter === 'Quotations' ? 'Search Quotation...' : 'Search Invoice...'}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* + New Button: Opens new sales in a new tab */}
                <button
                  type="button"
                  onClick={() => {
                    window.open('/sales', '_blank');
                    setIsPreviewSalesModalOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer transition-colors"
                  title="Open New Sales in a new tab"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Row 2: 6 Searchable Dropdowns matching Omega Screenshots */}
              <div className="grid grid-cols-6 gap-3 w-full">
                {/* 1. Transaction Type (Show All, Local, International, Online) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'trans' ? null : 'trans');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewTransactionType}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'trans' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-52 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {['Show All', 'Local', 'International', 'Online']
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewTransactionType(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewTransactionType === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Invoice Type (All Invoices, With Discounts, Back Orders, Layaway, Inter Brands Invoice, Not Delivered) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'invType' ? null : 'invType');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewInvoiceType}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'invType' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-56 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {[
                          'All Invoices',
                          'With Discounts',
                          'Back Orders',
                          'Layaway',
                          'Inter Brands Invoice',
                          'Not Delivered'
                        ]
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewInvoiceType(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewInvoiceType === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Status (All Status, Unposted, Posted) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'status' ? null : 'status');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewStatusFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'status' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-48 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {['All Status', 'Unposted', 'Posted']
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewStatusFilter(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewStatusFilter === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Salesman (All Salesmen, Hiba Aloulou, HUSSEIN, Hussien Mahdi, Mahdi, Nour Yazbeck, Ricky) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'salesman' ? null : 'salesman');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewSalesmanFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'salesman' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-52 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {[
                          'All Salesmen',
                          'Hiba Aloulou',
                          'HUSSEIN',
                          'Hussien Mahdi',
                          'Mahdi',
                          'Nour Yazbeck',
                          'Ricky'
                        ]
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewSalesmanFilter(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewSalesmanFilter === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Users (All Users, Admin, Mohammed Jichi, Mahdi, Hiba Aloulou, Ricky, Fadi Kassir) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'user' ? null : 'user');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewUserFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'user' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-52 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {[
                          'All Users',
                          'Admin',
                          'Mohammed Jichi',
                          'Mahdi',
                          'Hiba Aloulou',
                          'Ricky',
                          'Fadi Kassir'
                        ]
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewUserFilter(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewUserFilter === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Sales Channels (All Sales, Retail, Wholesale Orders, Export, Direct) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchDropdown(activeSearchDropdown === 'sales' ? null : 'sales');
                      setDropdownSearchTerm('');
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                  >
                    <span className="truncate">{previewSalesFilter}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                  {activeSearchDropdown === 'sales' && (
                    <div className="absolute z-30 top-full left-0 mt-1 w-52 bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                      <div className="p-1.5 border-b border-slate-200">
                        <div className="relative flex items-center">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchTerm}
                            onChange={(e) => setDropdownSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {['Positive Sales', '0 Value Sales', 'Negative Sales', 'All Sales']
                          .filter((opt) => opt.toLowerCase().includes(dropdownSearchTerm.toLowerCase()))
                          .map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setPreviewSalesFilter(opt);
                                setActiveSearchDropdown(null);
                                setDropdownSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                                previewSalesFilter === opt
                                  ? 'bg-primary text-white font-medium'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Date Range and Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                {/* Date Pickers */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-medium">From</span>
                  <DatePickerInput
                    value={previewFromDate}
                    onChange={setPreviewFromDate}
                    inputWidth="w-32"
                  />
                  <span className="text-slate-600 font-medium">To</span>
                  <DatePickerInput
                    value={previewToDate}
                    onChange={setPreviewToDate}
                    inputWidth="w-32"
                  />
                </div>

                {/* Right Action Buttons: Filter & Delivery of Goods */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusNotice('Preview filters applied.');
                      setTimeout(() => setStatusNotice(null), 2000);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open('/sales/delivery-of-goods', '_blank');
                    }}
                    className="bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded shadow-2xs cursor-pointer transition-colors"
                    title="Open Delivery of Goods in new tab"
                  >
                    Delivery Of Goods
                  </button>
                </div>
              </div>
            </div>

            {/* Table Area: 16 Columns + Total Row + Action Buttons */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                <thead className="bg-white text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-2">Branch</th>
                    <th className="py-2.5 px-2">{previewSalesFilter === 'Quotations' ? 'Quot' : 'Inv'}. #</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">CustomerID</th>
                    <th className="py-2.5 px-2">Company</th>
                    <th className="py-2.5 px-2">Salesman</th>
                    <th className="py-2.5 px-2">Created by</th>
                    <th className="py-2.5 px-2">Source</th>
                    <th className="py-2.5 px-2">Ref. #</th>
                    <th className="py-2.5 px-2 text-right">Discount</th>
                    <th className="py-2.5 px-2 text-right">Tax</th>
                    <th className="py-2.5 px-2 text-right">Net Total</th>
                    <th className="py-2.5 px-2">Cur.</th>
                    <th className="py-2.5 px-2 text-center">Posted</th>
                    <th className="py-2.5 px-3 text-center">
                      {previewSalesFilter !== 'Quotations' ? (
                        <button
                          type="button"
                          onClick={handlePostAllInvoices}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
                          title="Post all unposted invoices to GL"
                        >
                          Post All
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Actions</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {/* Total Summary Row (Matching Omega Screenshot) */}
                  <tr className="bg-slate-50 font-bold border-b border-slate-200 text-xs text-slate-800">
                    <td colSpan={10} className="py-2.5 px-3">
                      Total:
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                      {previewTotals.discountTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                      {previewTotals.taxTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                      {previewTotals.netLL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-slate-700">
                      LL
                    </td>
                    <td colSpan={2} className="py-2.5 px-2 text-slate-600 font-normal whitespace-nowrap">
                      ({previewTotals.count} Invoices)
                    </td>
                  </tr>

                  {/* Posting loader animation (matching Screenshot 2: 3 cyan dots) */}
                  {isPostingAll && (
                    <tr className="bg-white">
                      <td colSpan={16} className="py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-bounce"></span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Invoice Rows */}
                  {filteredPreviewInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-blue-50/40 border-b border-slate-100 text-[11px] text-slate-700 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-800 font-medium">
                        {inv.date}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.branch}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                        {inv.refCode && <div className="text-[10px] text-slate-500">({inv.refCode})</div>}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500">{inv.customerName}</div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {inv.customerId}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700" dir="rtl">
                        {inv.company || '—'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.salesman || '—'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.createdBy || '—'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.source || 'Inventory'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.refNumber || ''}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {inv.discount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {inv.tax.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-primary">
                        {inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {inv.currency}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {inv.status === 'Posted' ? (
                          <Check className="w-4 h-4 text-emerald-600 inline-block font-bold" />
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadInvoice(inv)}
                            className="bg-primary hover:bg-primary/90 text-white p-1 rounded cursor-pointer shadow-2xs transition-colors"
                            title="Edit / Load Invoice"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadInvoice(inv);
                              setIsPrintInvoiceModalOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white p-1 rounded cursor-pointer shadow-2xs transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStatusNotice(`Invoice #${inv.invoiceNumber} tags: [${inv.transactionType || 'Local'}, ${inv.invoiceType || 'Standard'}]`);
                              setTimeout(() => setStatusNotice(null), 3000);
                            }}
                            className="bg-slate-600 hover:bg-slate-700 text-white p-1 rounded cursor-pointer shadow-2xs transition-colors"
                            title="Invoice Tags / Category"
                          >
                            <Tag className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPreviewInvoices.length === 0 && (
                    <tr>
                      <td colSpan={16} className="text-center py-8 text-slate-400">
                        No sales invoices match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer / Pagination */}
            <div className="px-5 py-3 flex items-center justify-center border-t border-slate-200 bg-white">
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  className="px-3 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  «
                </button>
                <button
                  type="button"
                  className="px-3 py-1 border border-slate-300 rounded text-blue-600 font-semibold bg-blue-50/50"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-3 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  »
                </button>
              </div>
            </div>

            {/* Confirmation Dialog for Post All (Matching Screenshot 2) */}
            {isConfirmPostAllOpen && (
              <div className="fixed inset-0 z-60 bg-black/25 flex items-start justify-center pt-8 animate-fade-in">
                <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-md p-5 text-xs">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-800 pr-4">
                      Are you sure you want to post all sales transactions?
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsConfirmPostAllOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-base font-light cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsConfirmPostAllOpen(false)}
                      className="text-slate-600 hover:text-slate-800 text-xs font-medium px-3 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePostAll}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVOICE INFO MODAL (Exact Omega Replica from Screenshots 1 & 2)        */}
      {/* ========================================================================= */}
      {isInvoiceInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-[490px] overflow-hidden flex flex-col font-sans text-xs text-slate-800">
            {/* Modal Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-slate-700">Invoice Info</h2>
              <button
                type="button"
                onClick={() => setIsInvoiceInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-light leading-none cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5">
              {/* 1. Rate */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Rate</label>
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={invoiceRate}
                    onChange={(e) => setInvoiceRate(e.target.value)}
                    disabled={!isEditingRate}
                    className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 ${
                      isEditingRate ? 'bg-white' : 'bg-slate-100/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingRate(!isEditingRate)}
                    className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded ml-2 shrink-0 cursor-pointer shadow-2xs transition-colors"
                    title={isEditingRate ? 'Save Rate' : 'Edit Rate'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Workstation */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Workstation</label>
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={workstationId}
                    onChange={(e) => setWorkstationId(e.target.value)}
                    disabled={!isEditingWorkstation}
                    className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 ${
                      isEditingWorkstation ? 'bg-white' : 'bg-slate-100/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingWorkstation(!isEditingWorkstation)}
                    className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded ml-2 shrink-0 cursor-pointer shadow-2xs transition-colors"
                    title={isEditingWorkstation ? 'Save Workstation' : 'Edit Workstation'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dotted separator line */}
              <hr className="border-t border-dashed border-slate-200 my-1" />

              {/* 3. Salesman */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Salesman</label>
                <div className="flex-1 relative">
                  <select
                    value={invoiceSalesman}
                    onChange={(e) => setInvoiceSalesman(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mahdi">Mahdi</option>
                    <option value="Hiba Aloulou">Hiba Aloulou</option>
                    <option value="HUSSEIN">HUSSEIN</option>
                    <option value="Hussien Mahdi">Hussien Mahdi</option>
                    <option value="Nour Yazbeck">Nour Yazbeck</option>
                    <option value="Ricky">Ricky</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 4. Department* */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Department*</label>
                <div className="flex-1 relative">
                  <select
                    value={invoiceDepartment}
                    onChange={(e) => setInvoiceDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="Showroom">Showroom</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Factory">Factory</option>
                    <option value="Retail Store">Retail Store</option>
                    <option value="Main Office">Main Office</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 5. Reference # */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Reference #</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={invoiceReferenceNumber}
                    onChange={(e) => setInvoiceReferenceNumber(e.target.value)}
                    placeholder=""
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 6. Invoice note */}
              <div className="flex items-start">
                <label className="w-28 shrink-0 font-semibold text-slate-800 pt-1.5">Invoice note</label>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={invoiceNote}
                    onChange={(e) => setInvoiceNote(e.target.value)}
                    placeholder="Invoice note"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              </div>

              {/* 7. Internal Note */}
              <div className="flex items-start">
                <label className="w-28 shrink-0 font-semibold text-slate-800 pt-1.5">Internal Note</label>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={invoiceInternalNote}
                    onChange={(e) => setInvoiceInternalNote(e.target.value)}
                    placeholder="Internal note"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              </div>

              {/* 8. Transaction Type (Screenshot 2: Local, International, Online) */}
              <div className="flex items-center">
                <label className="w-28 shrink-0 font-semibold text-slate-800">Transaction Type</label>
                <div className="flex-1 relative">
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="Local">Local</option>
                    <option value="International">International</option>
                    <option value="Online">Online</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsInvoiceInfoModalOpen(false);
                  setStatusNotice('Invoice Info updated.');
                  setTimeout(() => setStatusNotice(null), 2500);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PENDING QUOTATIONS MODAL                                              */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 6. PENDING QUOTATIONS MODAL (Exact Omega Replica from Screenshot)         */}
      {/* ========================================================================= */}
      {isQuotationsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col font-sans">
            {/* Modal Header */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Pending Quotations</h3>
              <button
                type="button"
                onClick={() => setIsQuotationsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Filters */}
            <div className="px-5 py-3 space-y-3 text-xs">
              {/* Row 1: Branch Dropdown & Search Customer Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={quotationBranchFilter}
                    onChange={(e) => setQuotationBranchFilter(e.target.value)}
                    className="w-full bg-white border border-border rounded px-3 py-1.5 text-slate-800 text-xs shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-slate-400"
                  >
                    <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
                    <option value="Southern Olive Oil S.A.R.L">Southern Olive Oil S.A.R.L</option>
                    <option value="All Branches">All Branches</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search customer"
                    value={quotationCustomerSearch}
                    onChange={(e) => setQuotationCustomerSearch(e.target.value)}
                    className="w-full bg-white border border-border rounded pl-8 pr-3 py-1.5 text-slate-800 text-xs shadow-2xs placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                  {quotationCustomerSearch && (
                    <button
                      type="button"
                      onClick={() => setQuotationCustomerSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Customer Groups Dropdown & Search Quotation Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={quotationCustomerGroup}
                    onChange={(e) => setQuotationCustomerGroup(e.target.value)}
                    className="w-full bg-white border border-border rounded px-3 py-1.5 text-slate-800 text-xs shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-slate-400"
                  >
                    <option value="All Customer Groups">All Customer Groups</option>
                    <option value="Supermarkets & Hypermarkets">Supermarkets & Hypermarkets</option>
                    <option value="Wholesale Co-ops">Wholesale Co-ops</option>
                    <option value="Hotels & Restaurants">Hotels & Restaurants</option>
                    <option value="Retail & Individuals">Retail & Individuals</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Quotation..."
                    value={quotationSearchQuery}
                    onChange={(e) => setQuotationSearchQuery(e.target.value)}
                    className="w-full bg-white border border-border rounded px-3 py-1.5 text-slate-800 text-xs shadow-2xs placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                  {quotationSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setQuotationSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: From and To Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 w-10 shrink-0">From</span>
                  <DatePickerInput
                    value={quotationFromDate}
                    onChange={setQuotationFromDate}
                    className="flex-1"
                    inputWidth="w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 w-6 shrink-0">To</span>
                  <DatePickerInput
                    value={quotationToDate}
                    onChange={setQuotationToDate}
                    className="flex-1"
                    inputWidth="w-full"
                  />
                </div>
              </div>

              {/* Row 4: Filter Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStatusNotice(`Filtered: showing ${filteredPendingQuotations.length} pending quotations.`);
                    setTimeout(() => setStatusNotice(null), 2500);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Table of Pending Quotations */}
              <div className="border-t border-slate-200 pt-3">
                <div className="overflow-x-auto min-h-[160px] max-h-[260px] overflow-y-auto border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Quotation #</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Cust #</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3">Created By</th>
                        <th className="py-2 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPendingQuotations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                            No pending quotations found matching filters.
                          </td>
                        </tr>
                      ) : (
                        filteredPendingQuotations.map((q) => {
                          const isSelected = selectedQuotationId === q.id;
                          return (
                            <tr
                              key={q.id}
                              onClick={() => setSelectedQuotationId(q.id)}
                              onDoubleClick={() => handleConvertQuotationToInvoice(q)}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-muted font-medium text-slate-900 border-l-4 border-border'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <td className="py-2 px-3 font-mono font-semibold text-slate-800">{q.quotationNumber}</td>
                              <td className="py-2 px-3">{q.customerName}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{q.customerId}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">${q.amount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-slate-600">{q.createdBy}</td>
                              <td className="py-2 px-3 text-slate-500 font-mono">{q.date}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {selectedQuotationId && (
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    Selected quotation: <strong>{selectedQuotationId}</strong>. Click <strong>OK</strong> or double-click row to convert into current sales invoice.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-5 py-3 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={handleConfirmQuotationSelection}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-1.5 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SETTINGS MODAL                                                        */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded shadow-2xl border-4 border-border w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Invoice Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Payment Method</label>
                <select className="w-full bg-white border border-border rounded px-2.5 py-1 text-slate-800 shadow-2xs">
                  <option value="cash_usd">Cash USD</option>
                  <option value="visa">Visa / MasterCard</option>
                  <option value="on_account">On Account</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Printer Type</label>
                <select className="w-full bg-white border border-border rounded px-2.5 py-1 text-slate-800 shadow-2xs">
                  <option value="thermal">Thermal 80mm POS Receipt</option>
                  <option value="a4">Standard A4 Invoice</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1 rounded text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PRINT INVOICE MODAL                                                    */}
      {/* ========================================================================= */}
      {isPrintInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Print Sales Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintInvoiceModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Document Paper */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans bg-slate-50">
              <div className="bg-white p-6 rounded shadow-sm border border-slate-200 space-y-4">
                {/* Header Letterhead */}
                <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Southern Olive Oil Products S.A.R.L</h2>
                    <p className="text-[11px] text-slate-500 font-arabic">Southern Olive Oil Products S.A.R.L - Olive Mills & Manufacturing</p>
                    <p className="text-[11px] text-slate-500">Commercial Reg: 102488 | MOF: 3819200-01</p>
                    <p className="text-[11px] text-slate-500">Nabatieh - Tyre Highway, South Lebanon</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-slate-100 text-slate-800 font-mono font-bold px-2.5 py-1 rounded text-xs border border-slate-300">
                      {invoiceNumber}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">Date: <span className="font-semibold">{invoiceDate}</span></p>
                    <p className="text-[11px] text-slate-600">Delivery: <span className="font-semibold">{deliveryDate}</span></p>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bill To:</span>
                    <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                    <p className="text-slate-600 text-[11px]">{selectedCustomer.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Details:</span>
                    <p className="text-slate-700">Currency: <span className="font-semibold">{currency}</span></p>
                    <p className="text-slate-700">Payment: <span className="font-semibold">{transactionType}</span></p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2 px-2.5">Item Description</th>
                      <th className="py-2 px-2 text-center">Unit</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-2.5 text-right">Total ({currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(cartItems.length > 0 ? cartItems : [
                      { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 2, unitPrice: 115.00, total: 230.00 },
                      { id: '2', code: 'CWV250MLB103', name: 'White Vinegar 250ml', unit: 'BOT', qty: 12, unitPrice: 0.50, total: 6.00 }
                    ]).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                        <td className="py-2 px-2 text-right font-semibold text-slate-800">{item.qty}</td>
                        <td className="py-2 px-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-right font-bold text-slate-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="border-t border-slate-300 pt-3 flex justify-between items-start">
                  <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
                    <p className="font-semibold text-slate-700">Payment Terms & Conditions:</p>
                    <p>Goods received in good condition. All returns subject to inspection within 7 days.</p>
                    <p className="font-mono text-[10px] text-slate-400">BLOM Bank USD Acc: #2481-992018-01</p>
                  </div>
                  <div className="w-56 space-y-1.5 text-xs text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold font-mono">${(cartItems.length > 0 ? subtotal : 236.00).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-semibold font-mono">${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (VAT 11%):</span>
                      <span className="font-semibold font-mono">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1.5">
                      <span>Grand Total:</span>
                      <span className="text-emerald-700 font-mono">${(cartItems.length > 0 ? grandTotal : 236.00).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-[11px] text-slate-500 text-center border-t border-slate-200">
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Prepared By / Sales Officer</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Client Signature & Stamp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Ready for Thermal 80mm or Laser A4</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintInvoiceModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIsPrintInvoiceModalOpen(false);
                    setStatusNotice(`Invoice ${invoiceNumber} sent to printer!`);
                    setTimeout(() => setStatusNotice(null), 3000);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. PRINT DELIVERY NOTE MODAL                                              */}
      {/* ========================================================================= */}
      {isDeliveryNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Delivery Note (Bon de Livraison)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryNoteModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans bg-slate-50">
              <div className="bg-white p-6 rounded shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Southern Olive Oil Products S.A.R.L</h2>
                    <p className="text-[11px] text-slate-500">Warehouse Dispatch & Logistics Division</p>
                    <p className="text-[11px] text-slate-500">Facility: Main Depot #1, South Industrial Zone</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-amber-50 text-amber-900 font-mono font-bold px-2.5 py-1 rounded text-xs border border-amber-300">
                      DN-{invoiceNumber.replace('INV-', '')}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">Ref Invoice: <span className="font-semibold">{invoiceNumber}</span></p>
                    <p className="text-[11px] text-slate-600">Dispatch Date: <span className="font-semibold">{deliveryDate}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Destination:</span>
                    <p className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</p>
                    <p className="text-slate-600 text-[11px]">{selectedCustomer.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carrier / Driver:</span>
                    <p className="font-semibold text-slate-800">{deliveredBy}</p>
                    <p className="text-slate-500 text-[11px]">Vehicle: Van #4 (License 289410-B)</p>
                  </div>
                </div>

                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                      <th className="py-2 px-2.5">Item Code & Name</th>
                      <th className="py-2 px-2 text-center">Unit</th>
                      <th className="py-2 px-2 text-right">Ordered</th>
                      <th className="py-2 px-2 text-right">Dispatched Qty</th>
                      <th className="py-2 px-2 text-center">Packaging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(cartItems.length > 0 ? cartItems : [
                      { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 2, total: 230.00 },
                      { id: '2', code: 'CWV250MLB103', name: 'White Vinegar 250ml', unit: 'BOT', qty: 12, total: 6.00 }
                    ]).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                        <td className="py-2 px-2 text-right text-slate-600">{item.qty}</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-700">{item.qty}</td>
                        <td className="py-2 px-2 text-center text-slate-500">Carton / Crate</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-8 grid grid-cols-3 gap-4 text-[11px] text-slate-500 text-center border-t border-slate-200">
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Warehouse Keeper (Dispatched)</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Delivery Driver (Transit)</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <span className="mt-1 block">Customer Received (Full & Intact)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Warehouse Dispatch Authorization Copy</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryNoteModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setIsDeliveryNoteModalOpen(false);
                    setStatusNotice(`Delivery Note DN-${invoiceNumber.replace('INV-', '')} printed.`);
                    setTimeout(() => setStatusNotice(null), 3000);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Delivery Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. CREDIT NOTE MODAL                                                     */}
      {/* ========================================================================= */}
      {isCreditNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold">Issue Credit Note (Sales Return)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreditNoteModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Credit Note Generator</span>
                  <span className="text-[11px] text-red-700">Creates a negative credit voucher and deducts from customer debt balance.</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-red-200">
                  Customer: {selectedCustomer.name}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Return</label>
                <select
                  value={creditNoteReason}
                  onChange={(e) => setCreditNoteReason(e.target.value)}
                  className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-slate-800 shadow-2xs font-sans"
                >
                  <option value="Customer Return / Defective">Customer Return / Defective Goods</option>
                  <option value="Damaged Goods in Transit">Damaged Goods in Transit</option>
                  <option value="Incorrect Item Dispatched">Incorrect Item Dispatched</option>
                  <option value="Quality Inspection Failure">Quality Inspection Failure / Taste Issue</option>
                  <option value="Over-invoiced Quantity Correction">Over-invoiced Quantity Correction</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Items to Return & Quantity</label>
                {cartItems.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 rounded text-center text-slate-500">
                    Cart is currently empty. Add products to cart first to specify return items, or load an invoice.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">Item</th>
                          <th className="py-2 px-2 text-center">Sold Qty</th>
                          <th className="py-2 px-2 text-center">Return Qty</th>
                          <th className="py-2 px-2 text-right">Refund Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cartItems.map((it) => {
                          const retQty = creditNoteReturnQty[it.id] !== undefined ? creditNoteReturnQty[it.id] : it.qty;
                          const refAmt = (retQty * it.unitPrice).toFixed(2);
                          return (
                            <tr key={it.id} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5">
                                <p className="font-semibold text-slate-800">{it.name}</p>
                                <span className="text-[10px] text-slate-400 font-mono">{it.code}</span>
                              </td>
                              <td className="py-2 px-2 text-center text-slate-600">{it.qty} {it.unit}</td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={it.qty}
                                  value={retQty}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(it.qty, parseFloat(e.target.value) || 0));
                                    setCreditNoteReturnQty((prev) => ({ ...prev, [it.id]: val }));
                                  }}
                                  className="w-16 text-center border border-slate-300 rounded px-1 py-0.5 font-bold text-red-700"
                                />
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-red-600 font-mono">${refAmt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Total Credit to Issue:</span>
                <span className="text-base font-mono font-bold text-red-600">
                  -${(cartItems.length > 0 ? grandTotal : 0).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreditNoteModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueCreditNote}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Issue Credit Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. STORE RECURRING MODAL                                                 */}
      {/* ========================================================================= */}
      {isStoreRecurringModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Store Recurring Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreRecurringModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-blue-900 text-xs">
                Save the current {cartItems.length} items in cart as a recurring template for <strong>{selectedCustomer.name}</strong>.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Restock - Gourmet Market"
                  value={recurringTemplateName}
                  onChange={(e) => setRecurringTemplateName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recurring Interval</label>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-slate-800"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-700 flex justify-between items-center font-mono">
                <span>Cart Items: {cartItems.length} items</span>
                <span className="font-bold text-slate-900">Total: ${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsStoreRecurringModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStoreRecurring}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. RECALL RECURRING MODAL                                                */}
      {/* ========================================================================= */}
      {isRecallRecurringModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Recall Recurring Invoices</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecallRecurringModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <p className="text-slate-600 text-xs">
                Select a recurring invoice template below to automatically populate the bill with its customer and item lines:
              </p>

              {recurringTemplates.length === 0 ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-300 rounded">
                  No recurring templates found. Use &quot;Store Recurring&quot; to create one.
                </div>
              ) : (
                recurringTemplates.map((tpl) => (
                  <div key={tpl.id} className="border border-slate-200 rounded p-3 hover:border-slate-400 transition-colors bg-white flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 mb-1">
                          {tpl.frequency}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                        <p className="text-slate-500 text-xs">Customer: <strong className="text-slate-800">{tpl.customerName}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ${tpl.items.reduce((s, i) => s + i.total, 0).toFixed(2)}
                        </span>
                        <span className="block text-[11px] text-slate-400">{tpl.items.length} items</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                      {tpl.items.slice(0, 3).map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span>• {it.name}</span>
                          <span className="font-mono">{it.qty} {it.unit} @ ${it.unitPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {tpl.items.length > 3 && (
                        <span className="text-slate-400 italic">+{tpl.items.length - 3} more items...</span>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecurringTemplate(tpl.id)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadRecurringTemplate(tpl)}
                        className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <span>Load Into Bill</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsRecallRecurringModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. CUSTOMER PRICING MODAL                                                */}
      {/* ========================================================================= */}
      {isCustomerPricingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Customer Special Pricing</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerPricingModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-900 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-sm">Contract Pricing Matrix</span>
                  <span className="text-[11px] text-amber-700">Client: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.id})</span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-1 rounded border border-amber-300">
                  Negotiated Rates
                </span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-2 text-center">Unit</th>
                      <th className="py-2 px-2 text-right">Standard Price</th>
                      <th className="py-2 px-2 text-center">Contract Price</th>
                      <th className="py-2 px-3 text-right">Saving</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {OMEGA_SALES_ITEMS.slice(0, 8).map((it) => {
                      const spec = customerSpecialPrices[it.code] !== undefined ? customerSpecialPrices[it.code] : it.price;
                      const diff = it.price - spec;
                      return (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <p className="font-semibold text-slate-800">{it.name}</p>
                            <span className="text-[10px] font-mono text-slate-400">{it.code}</span>
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600">{it.unit}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500 line-through">
                            ${it.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="inline-flex items-center gap-1">
                              <span className="text-slate-400 font-mono">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={spec}
                                onChange={(e) => handleSaveCustomerSpecialPrice(it.code, parseFloat(e.target.value) || 0)}
                                className="w-18 border border-slate-300 rounded px-1.5 py-0.5 font-bold font-mono text-slate-800 text-right bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            {diff > 0 ? `-$${diff.toFixed(2)}` : '0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">Changes persist in active customer profile</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerPricingModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomerPricing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Contract to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. CUSTOMER AGED MODAL                                                   */}
      {/* ========================================================================= */}
      {isCustomerAgedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold">Customer Aged Receivables</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerAgedModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedCustomer.name}</h4>
                  <p className="text-slate-500 text-xs">Account ID: {selectedCustomer.id} | Limit: $2,500.00</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Outstanding Debt</span>
                  <span className="text-lg font-mono font-extrabold text-red-600">$475.00 USD</span>
                </div>
              </div>

              {/* 4 Aging Buckets */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block uppercase">0 - 30 Days</span>
                  <span className="text-sm font-mono font-bold text-emerald-900">$280.00</span>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Current / On Time</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-center">
                  <span className="text-[10px] text-blue-800 font-semibold block uppercase">31 - 60 Days</span>
                  <span className="text-sm font-mono font-bold text-blue-900">$145.00</span>
                  <span className="text-[9px] text-blue-600 block mt-0.5">Follow-up due</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-center">
                  <span className="text-[10px] text-amber-800 font-semibold block uppercase">61 - 90 Days</span>
                  <span className="text-sm font-mono font-bold text-amber-900">$50.00</span>
                  <span className="text-[9px] text-amber-600 block mt-0.5">Overdue Warning</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">&gt; 90 Days</span>
                  <span className="text-sm font-mono font-bold text-slate-700">$0.00</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">No Bad Debts</span>
                </div>
              </div>

              {/* Outstanding Invoices Table */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5">Unpaid Invoices Breakdown</h5>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Invoice #</th>
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Due Date</th>
                        <th className="py-2 px-2 text-right">Total</th>
                        <th className="py-2 px-2 text-right">Balance Due</th>
                        <th className="py-2 px-2 text-center">Aging Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-800">INV-2026-08940</td>
                        <td className="py-2 px-2 text-slate-600">06-Sep-2026</td>
                        <td className="py-2 px-2 text-slate-600">20-Sep-2026</td>
                        <td className="py-2 px-2 text-right font-mono">$145.00</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">$145.00</td>
                        <td className="py-2 px-2 text-center"><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">1 day</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-800">INV-2026-08870</td>
                        <td className="py-2 px-2 text-slate-600">18-Aug-2026</td>
                        <td className="py-2 px-2 text-slate-600">01-Sep-2026</td>
                        <td className="py-2 px-2 text-right font-mono">$280.00</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">$280.00</td>
                        <td className="py-2 px-2 text-center"><span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">20 days</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-800">INV-2026-08795</td>
                        <td className="py-2 px-2 text-slate-600">10-Jul-2026</td>
                        <td className="py-2 px-2 text-slate-600">24-Jul-2026</td>
                        <td className="py-2 px-2 text-right font-mono">$50.00</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-amber-700">$50.00</td>
                        <td className="py-2 px-2 text-center"><span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">58 days</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setStatusNotice('Customer statement sent to printer.');
                  setTimeout(() => setStatusNotice(null), 3000);
                }}
                className="text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement of Account</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCustomerAgedModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 15. CUSTOMERS RECEIPTS MODAL                                              */}
      {/* ========================================================================= */}
      {isCustomerReceiptsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Customer Receipts & Vouchers</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerReceiptsModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick Record New Receipt */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2.5">
                <span className="font-bold text-slate-800 block">Record New Payment Receipt</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Amount ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newReceiptAmount}
                      onChange={(e) => setNewReceiptAmount(e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Method</label>
                    <select
                      value={newReceiptMethod}
                      onChange={(e) => setNewReceiptMethod(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                    >
                      <option value="Cash USD">Cash USD</option>
                      <option value="Cash LBP">Cash LBP</option>
                      <option value="Visa / MasterCard">Visa / MasterCard</option>
                      <option value="Bank Cheque (BLOM)">Bank Cheque (BLOM)</option>
                      <option value="Whish Money">Whish Money</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleRecordCustomerReceipt}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded cursor-pointer shadow-2xs text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Receipt</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Receipts Ledger Table */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5">Previous Receipts History</h5>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Receipt #</th>
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Customer</th>
                        <th className="py-2 px-2">Method</th>
                        <th className="py-2 px-2 text-right">Amount</th>
                        <th className="py-2 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerReceipts.map((rct) => (
                        <tr key={rct.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-800">{rct.id}</td>
                          <td className="py-2 px-2 text-slate-600">{rct.date}</td>
                          <td className="py-2 px-2 text-slate-800 font-medium">{rct.customerName}</td>
                          <td className="py-2 px-2 text-slate-600">{rct.method}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">${rct.amount.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Cleared
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomerReceiptsModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16. PAID IN / OUT MODAL                                                   */}
      {/* ========================================================================= */}
      {isPaidInOutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Paid In / Out - Cash Drawer Movements</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaidInOutModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Current Drawer Cash Balance Banner */}
              <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-4 flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Active Cash Drawer Balance</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-700">
                    ${drawerCashBalance.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Register: POS-01</p>
                  <p>Drawer Status: <span className="text-emerald-700 font-semibold">Active</span></p>
                </div>
              </div>

              {/* Movement Form */}
              <div className="border border-slate-200 rounded p-3.5 space-y-3 bg-white">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaidInOutType('out')}
                    className={`flex-1 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                      paidInOutType === 'out'
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Paid Out (Cash Payout)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidInOutType('in')}
                    className={`flex-1 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                      paidInOutType === 'in'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Paid In (Cash Deposit)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={paidInOutAmount}
                      onChange={(e) => setPaidInOutAmount(e.target.value)}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={paidInOutCategory}
                      onChange={(e) => setPaidInOutCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                    >
                      <option value="Delivery Driver Fuel">Delivery Driver Fuel</option>
                      <option value="Packaging Supplies">Packaging Supplies</option>
                      <option value="Petty Cash Expense">Petty Cash Expense</option>
                      <option value="Office Refreshments">Office Refreshments</option>
                      <option value="Opening Float">Opening Float</option>
                      <option value="Owner Drawing">Owner Cash Drawing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes & Justification</label>
                  <input
                    type="text"
                    placeholder="e.g. Van #4 fuel receipt - Coral Station"
                    value={paidInOutNotes}
                    onChange={(e) => setPaidInOutNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRecordPaidInOut}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded text-xs cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Record Cash Movement</span>
                </button>
              </div>

              {/* Movement History Log */}
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5">Today&apos;s Drawer Movements</h5>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Time</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Category & Note</th>
                        <th className="py-2 px-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paidInOutHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-mono text-slate-500">{item.time}</td>
                          <td className="py-2 px-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type === 'in' ? 'Paid In' : 'Paid Out'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            <p className="font-medium">{item.category}</p>
                            <span className="text-[10px] text-slate-400">{item.notes}</span>
                          </td>
                          <td className={`py-2 px-2 text-right font-mono font-bold ${
                            item.type === 'in' ? 'text-emerald-700' : 'text-red-600'
                          }`}>
                            {item.type === 'in' ? '+' : '-'}${item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsPaidInOutModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 17. MAIN READING (X/Z READING) MODAL                                      */}
      {/* ========================================================================= */}
      {isMainReadingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">POS Main Reading (X-Reading / Z-Reading)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMainReadingModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Mode Toggle */}
              <div className="flex rounded border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setReadingType('X')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                    readingType === 'X' ? 'bg-primary text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  X-Reading (Mid-Shift Audit)
                </button>
                <button
                  type="button"
                  onClick={() => setReadingType('Z')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                    readingType === 'Z' ? 'bg-red-700 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Z-Reading (End of Shift Final)
                </button>
              </div>

              {/* Terminal Details */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Branch: <strong className="text-slate-800">Southern Olive Oil S.A.R.L</strong></p>
                  <p className="text-slate-500">Terminal: <strong className="text-slate-800">POS-01 (Main Counter)</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Cashier: <strong className="text-slate-800">Mohammed Jichi</strong></p>
                  <p className="text-slate-500">Shift #44 • <span className="font-mono font-semibold">{invoiceDate}</span></p>
                </div>
              </div>

              {/* Financial Figures Report Card */}
              <div className="border border-slate-200 rounded p-4 space-y-3 bg-white">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-[11px] tracking-wider text-slate-500">
                  Sales & Turnover Breakdown
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Gross Invoiced Sales:</span>
                    <span className="font-mono font-bold">$1,820.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Discounts Allowed:</span>
                    <span className="font-mono text-red-600">-$35.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Returns & Credit Notes:</span>
                    <span className="font-mono text-red-600">$0.00 USD</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 text-sm">
                    <span>Net Sales Turnover:</span>
                    <span className="font-mono text-emerald-700">$1,785.00 USD</span>
                  </div>
                </div>

                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 pt-2 uppercase text-[11px] tracking-wider text-slate-500">
                  Collections by Tender Type
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Cash USD:</span>
                    <span className="font-mono font-bold">$950.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Visa / MasterCard Payments:</span>
                    <span className="font-mono font-bold">$520.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Credit / On Account (Receivable):</span>
                    <span className="font-mono font-bold">$315.00 USD</span>
                  </div>
                </div>

                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 pt-2 uppercase text-[11px] tracking-wider text-slate-500">
                  Cash Drawer Reconciliation
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Opening Float (Cash In):</span>
                    <span className="font-mono">$200.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Cash Sales Collected:</span>
                    <span className="font-mono">+$950.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Paid Out (Expenses from Drawer):</span>
                    <span className="font-mono text-red-600">-$40.00 USD</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 bg-slate-50 p-2 rounded">
                    <span>Expected Cash in Drawer:</span>
                    <span className="font-mono text-emerald-700">${drawerCashBalance.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                {readingType === 'X' ? 'Audit mode does not clear counters' : 'Z-Report resets daily counters'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMainReadingModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    if (readingType === 'Z') {
                      setStatusNotice('Shift #44 finalized! Z-Report printed and counters archived.');
                    } else {
                      setStatusNotice('X-Reading audit slip printed successfully.');
                    }
                    setIsMainReadingModalOpen(false);
                    setTimeout(() => setStatusNotice(null), 3500);
                  }}
                  className={`${
                    readingType === 'Z' ? 'bg-red-700 hover:bg-red-800' : 'bg-primary hover:bg-primary/90'
                  } text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{readingType === 'Z' ? 'Finalize & Print Z-Report' : 'Print X-Reading Audit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
