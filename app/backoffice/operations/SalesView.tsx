'use client';

import { Corporate3ZoneHeader, CorporatePrintableFooter } from '@/components/documents/Corporate3ZoneHeader';
import { printElementById } from '@/lib/utils/printDocument';
import { peekNextDocNumber, commitNextDocNumber, cleanDocumentNumber, formatDocLabel } from '@/lib/utils/documentSequence';
import SalesOptionsModal from '@/components/modules/sales/SalesOptionsModal';
import MainReadingModal from '@/components/modules/sales/MainReadingModal';
import CustomerLookupModal, { CustomerLookupItem } from '@/components/modules/sales/CustomerLookupModal';
import PaidInOutModal, { PrintableCashVoucher } from '@/components/modules/sales/PaidInOutModal';
import CustomerReceiptsModal from '@/components/modules/sales/CustomerReceiptsModal';
import CustomerAgedModal from '@/components/modules/sales/CustomerAgedModal';
import CustomerPricingModal from '@/components/modules/sales/CustomerPricingModal';
import RecurringInvoicesModal from '@/components/modules/sales/RecurringInvoicesModal';
import CreditNoteModal from '@/components/modules/sales/CreditNoteModal';
import {
  resolveItemPriceWaterfall,
  getCustomerSpecialPrices,
  getCustomerReceipts,
  CustomerReceipt,
  RecurringInvoiceTemplate,
  CreditNoteRecord,
  postCreditNote
} from '@/lib/customerSalesService';
import { calculateDocumentTotals, resolveItemUnitPrice } from '@/lib/engine/erpCalculationEngine';
import {
  SalesOptionsState,
  DEFAULT_SALES_OPTIONS,
  fetchSalesOptions,
  SALES_OPTIONS_UPDATED_EVENT
} from '@/lib/salesOptionsService';
import {
  PosShift,
  getActiveShift,
  getCashMovements,
  recordCashMovement,
  POS_EXCHANGE_RATE_LBP,
  isInvoicePostedToday,
  isReceiptPostedToday,
  isCashMovementToday
} from '@/lib/posShiftService';
import {
  DeliveryProviderRecord,
  DeliveryProviderClassification,
  DEFAULT_UNIFIED_DELIVERY_PROVIDERS,
  fetchUnifiedDeliveryProviders,
  persistUnifiedDeliveryProviders,
  DELIVERY_PROVIDERS_UPDATED_EVENT,
  normalizeDeliveryProvider
} from '@/lib/deliveryProviders';
import {
  getCompanyBankAccounts,
  updateCompanyBankAccountNumber,
  getCompanyWhishAccounts,
  updateCompanyWhishAccountNumber,
  resolveSettlementGlAccount,
  getSavedSettlementAccount,
  saveOrUpdateSettlementAccount,
  cleanAccountLabel,
  CompanyBankAccount,
  CompanyWhishAccount,
  SETTLEMENT_ACCOUNTS_UPDATED_EVENT
} from '@/lib/companySettlementAccounts';

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
  Tag,
  Unlock
} from 'lucide-react';
import DatePickerInput from '@/components/DatePickerInput';
import { useTenant } from '@/lib/TenantContext';
import { useActiveUser } from '@/lib/useActiveUser';
import { supabase } from '@/lib/supabaseClient';
import { toggleDocumentPosting } from '@/lib/dataGateway';


const getTodayFormatted = () => {
  return new Date().toISOString().split('T')[0];
};

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
  salesman?: string;
}

export interface PaymentEntry {
  id: string;
  type: string;
  amount: number;
  cardholderName?: string;
  cardNumber?: string;
  cardBank?: string;
  whishSenderPhone?: string;
  whishAccountNumber?: string;
  companyAccountId?: string;
  companyAccountName?: string;
  companyAccountNumber?: string;
  senderBank?: string;
  checkNumber?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  refCode?: string;
  docType?: 'SALE' | 'CREDIT_NOTE';
  doc_type?: 'SALE' | 'CREDIT_NOTE';
  parentInvoiceNo?: string;
  parent_invoice_id?: string;
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
  reference?: string;
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
  is_posted?: boolean;
  posted?: boolean;
  createdAt: string;
  createdAtIso?: string;
  shiftId?: string;
  shiftNumber?: number;
  isReconciledOrClosed?: boolean;
  closedInZReport?: boolean;
  shiftClosed?: boolean;
  closedShiftId?: string;
}

// 100% Authentic Vanguard ERP Catalog Items
export const VANGUARD_SALES_ITEMS: SalesItem[] = [
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

export const VANGUARD_CATALOG_ITEMS = VANGUARD_SALES_ITEMS;

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
  { id: 'CUST-005', name: 'Cedar Valley Organics', address: 'Ashrafieh, Tabaris, Beirut' },
  { id: 'CUST-006', name: 'Tripoli Olive Press & Co', address: 'Mina Coastal Road, Tripoli' }
];

export const PAYMENT_TYPES = [
  { id: 'cash_usd', name: 'Cash USD' },
  { id: 'cash_lbp', name: 'Cash LBP' },
  { id: 'visa', name: 'Visa / MasterCard' },
  { id: 'check', name: 'Bank Check' },
  { id: 'on_account', name: 'On Account / Credit' },
  { id: 'whish', name: 'Whish Money / OMT' }
];

export const INITIAL_INVOICES_DIRECTORY: InvoiceRecord[] = [
  {
    id: '0002601',
    invoiceNumber: '0002601',
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
        location: 'Southern Olive and Oil Products - Main'
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
        location: 'Southern Olive and Oil Products - Main'
      }
    ],
    subtotal: 266.00,
    discount: 0.00,
    tax: 0.00,
    grandTotal: 266.00,
    payments: [{ id: 'p-01', type: 'Cash USD', amount: 266.00 }],
    status: 'Posted',
    is_posted: true,
    posted: true,
    createdAt: '2026-09-04 11:20'
  },
  {
    id: '0002602',
    invoiceNumber: '0002602',
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
    is_posted: true,
    posted: true,
    createdAt: '2026-09-05 14:30'
  },
  {
    id: '0002603',
    invoiceNumber: '0002603',
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
    is_posted: false,
    posted: false,
    createdAt: '2026-09-06 16:45'
  },
  {
    id: '0002604',
    invoiceNumber: '0002604',
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
    is_posted: true,
    posted: true,
    createdAt: '2026-09-07 09:15'
  },
  {
    id: '0002605',
    invoiceNumber: '0002605',
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
    is_posted: true,
    posted: true,
    createdAt: '2026-09-07 10:30'
  }
];

function generateUniqueInvoiceNumber(existingList?: { invoiceNumber?: string }[]): string {
  return peekNextDocNumber('SALES_INVOICE', existingList);
}

export const DEFAULT_DELIVERY_PROVIDERS = DEFAULT_UNIFIED_DELIVERY_PROVIDERS;

export default function AuthenticVanguardSalesWorkstation({
  withSidebar = false,
  initialDocType,
  initialReceiptsOpen
}: {
  withSidebar?: boolean;
  initialDocType?: 'SALE' | 'CREDIT_NOTE';
  initialReceiptsOpen?: boolean;
}) {
  const { currentTenant } = useTenant();
  const profile = useActiveUser();
  // --- Sidebar State (when running in Standalone layout) ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // --- Header & Settings State ---
  const [selectedBranch, setSelectedBranch] = useState('southern');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState('Retail');
  const [activeTabDivision, setActiveTabDivision] = useState('Retail Distillates & Seasonings');
  const [activeTabGroup, setActiveTabGroup] = useState('Retail Distillates 250ml');
  const [catalogSearch, setCatalogSearch] = useState('');

  // --- Invoice Header State ---
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() =>
    generateUniqueInvoiceNumber(INITIAL_INVOICES_DIRECTORY)
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMER_PRESETS[0]);
  const [invoiceDate, setInvoiceDate] = useState(getTodayFormatted());
  const [deliveryDate, setDeliveryDate] = useState(getTodayFormatted());
  const [deliveredBy, setDeliveredBy] = useState('Providers');
  const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProviderRecord[]>(DEFAULT_UNIFIED_DELIVERY_PROVIDERS);
  const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderPhone, setNewProviderPhone] = useState('');
  const [newProviderClassification, setNewProviderClassification] = useState<DeliveryProviderClassification>('3PL_EXPRESS');
  const [newProviderContactPerson, setNewProviderContactPerson] = useState('');
  const [newProviderStatus, setNewProviderStatus] = useState<'Active Carrier' | 'Inactive'>('Active Carrier');
  const [newProviderNotes, setNewProviderNotes] = useState('');
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState('Local');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // --- Cart State ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- Payments State ---
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // Configurable Settlement Accounts in SalesView (Currency-Aware)
  const [salesCompanyBankAccounts, setSalesCompanyBankAccounts] = useState<CompanyBankAccount[]>(() => getCompanyBankAccounts('USD'));
  const [salesCompanyWhishAccounts, setSalesCompanyWhishAccounts] = useState<CompanyWhishAccount[]>(() => getCompanyWhishAccounts('USD'));

  // Card details
  const [salesCardholderName, setSalesCardholderName] = useState('');
  const [salesCardNumber, setSalesCardNumber] = useState('');
  const [salesCardBank, setSalesCardBank] = useState('');
  const [salesCardCompanyBankName, setSalesCardCompanyBankName] = useState<string>(() => getSavedSettlementAccount('BANK', 'USD').name);
  const [salesCardAccountNumber, setSalesCardAccountNumber] = useState<string>(() => getSavedSettlementAccount('BANK', 'USD').accountNumber);

  // Whish details
  const [salesWhishSenderPhone, setSalesWhishSenderPhone] = useState('');
  const [salesWhishCompanyWalletName, setSalesWhishCompanyWalletName] = useState<string>(() => getSavedSettlementAccount('WHISH', 'USD').name);
  const [salesWhishAccountNumber, setSalesWhishAccountNumber] = useState<string>(() => getSavedSettlementAccount('WHISH', 'USD').accountNumber);

  // Bank Check details
  const [salesCheckNumber, setSalesCheckNumber] = useState('');
  const [salesCheckIssuingBank, setSalesCheckIssuingBank] = useState('');
  const [salesCheckCompanyBankName, setSalesCheckCompanyBankName] = useState<string>(() => getSavedSettlementAccount('BANK', 'USD').name);
  const [salesCheckAccountNumber, setSalesCheckAccountNumber] = useState<string>(() => getSavedSettlementAccount('BANK', 'USD').accountNumber);


  // --- Modals State ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceInfoModalOpen, setIsInvoiceInfoModalOpen] = useState(false);

  // --- Invoice Info State ---
  const [invoiceRate, setInvoiceRate] = useState('90000');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [workstationId, setWorkstationId] = useState('W#: 2000');
  const [isEditingWorkstation, setIsEditingWorkstation] = useState(false);
  const [invoiceSalesman, setInvoiceSalesman] = useState(profile?.name || 'Vanguard Operator');
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
    { id: 'SN-VNG-9901', expiry: '2027-12-31', loc: 'Southern Olive and Oil Products - Main' },
    { id: 'SN-VNG-9902', expiry: '2027-12-31', loc: 'Southern Olive and Oil Products - Main' },
    { id: 'SN-VNG-9903', expiry: '2028-06-30', loc: 'Southern Olive and Oil Products - Main' },
    { id: 'SN-VNG-9904', expiry: '2028-06-30', loc: 'Southern Olive and Oil Products - Main' }
  ]);
  const [salesSelectedSerials, setSalesSelectedSerials] = useState<string[]>(['SN-VNG-9901']);
  const [isQuotationsModalOpen, setIsQuotationsModalOpen] = useState(false);
  const [quotationBranchFilter, setQuotationBranchFilter] = useState('Zeit w zaytoun ljanoub');
  const [quotationCustomerSearch, setQuotationCustomerSearch] = useState('');
  const [quotationCustomerGroup, setQuotationCustomerGroup] = useState('All Customer Groups');
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [quotationFromDate, setQuotationFromDate] = useState(getTodayFormatted());
  const [quotationToDate, setQuotationToDate] = useState(getTodayFormatted());
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
        }
      ]
    }
  ]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // --- Actions Dropdown Functional Modals State ---
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [printSnapshotInvoice, setPrintSnapshotInvoice] = useState<any | null>(null);
  const [isPrintInvoiceModalOpen, setIsPrintInvoiceModalOpen] = useState(false);
  const [isDeliveryNoteModalOpen, setIsDeliveryNoteModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [isStoreRecurringModalOpen, setIsStoreRecurringModalOpen] = useState(false);
  const [isRecallRecurringModalOpen, setIsRecallRecurringModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringModalMode, setRecurringModalMode] = useState<'STORE' | 'RECALL'>('STORE');
  const [docType, setDocType] = useState<'SALE' | 'CREDIT_NOTE'>(initialDocType || 'SALE');
  const [parentInvoiceNo, setParentInvoiceNo] = useState<string | null>(null);
  const [isCustomerPricingModalOpen, setIsCustomerPricingModalOpen] = useState(false);
  const [isCustomerAgedModalOpen, setIsCustomerAgedModalOpen] = useState(false);
  const [isCustomerReceiptsModalOpen, setIsCustomerReceiptsModalOpen] = useState(Boolean(initialReceiptsOpen));

  // Sync initial docType and receipts modal states from props or URL
  useEffect(() => {
    if (initialDocType) {
      setDocType(initialDocType);
    }
  }, [initialDocType]);

  useEffect(() => {
    if (initialReceiptsOpen) {
      setIsCustomerReceiptsModalOpen(true);
    }
  }, [initialReceiptsOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get('section');
      if (s === 'credit_notes') {
        setDocType('CREDIT_NOTE');
      } else if (s === 'customer_receipts') {
        setIsCustomerReceiptsModalOpen(true);
      }
    }
  }, []);
  const [isPaidInOutModalOpen, setIsPaidInOutModalOpen] = useState(false);
  const [printCashVoucherSnapshot, setPrintCashVoucherSnapshot] = useState<any | null>(null);
  const [isMainReadingModalOpen, setIsMainReadingModalOpen] = useState(false);
  const [isCustomerLookupModalOpen, setIsCustomerLookupModalOpen] = useState(false);
  const [isNoTransactionsModalOpen, setIsNoTransactionsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [salesOptions, setSalesOptions] = useState<SalesOptionsState>(DEFAULT_SALES_OPTIONS);

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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
          location: 'Southern Olive and Oil Products - Main'
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
  const [drawerCashBalance, setDrawerCashBalance] = useState(0);
  const [paidInOutType, setPaidInOutType] = useState<'in' | 'out'>('out');
  const [paidInOutAmount, setPaidInOutAmount] = useState('');
  const [paidInOutCategory, setPaidInOutCategory] = useState('Delivery Driver Fuel');
  const [paidInOutNotes, setPaidInOutNotes] = useState('');
  const [paidInOutHistory, setPaidInOutHistory] = useState<any[]>([]);

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

  // --- Customer Outstanding Invoices & Aging State ---
  const [customerInvoices, setCustomerInvoices] = useState([
    { id: 'INV-2026-08940', date: '06-Sep-2026', dueDate: '20-Sep-2026', total: 145.00, balanceDue: 145.00, agingDays: 1 },
    { id: 'INV-2026-08870', date: '18-Aug-2026', dueDate: '01-Sep-2026', total: 280.00, balanceDue: 280.00, agingDays: 20 },
    { id: 'INV-2026-08795', date: '10-Jul-2026', dueDate: '24-Jul-2026', total: 50.00, balanceDue: 50.00, agingDays: 58 },
  ]);

  const customerAgingSummary = useMemo(() => {
    let b0_30 = 0;
    let b31_60 = 0;
    let b61_90 = 0;
    let b90_plus = 0;

    customerInvoices.forEach(inv => {
      if (inv.balanceDue <= 0) return;
      if (inv.agingDays <= 30) b0_30 += inv.balanceDue;
      else if (inv.agingDays <= 60) b31_60 += inv.balanceDue;
      else if (inv.agingDays <= 90) b61_90 += inv.balanceDue;
      else b90_plus += inv.balanceDue;
    });

    const totalOutstanding = b0_30 + b31_60 + b61_90 + b90_plus;
    return { b0_30, b31_60, b61_90, b90_plus, totalOutstanding };
  }, [customerInvoices]);

  // Hydrate Customer Receipts from Supabase & feature_flags
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        const { data: dbPayments, error } = await supabase
          .from('customer_payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbPayments && dbPayments.length > 0) {
          const mapped = dbPayments.map((p: any) => ({
            id: p.receipt_number || p.id,
            date: new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            customerName: p.customer_name || 'Customer',
            customerId: p.customer_id || 'CUST-001',
            method: p.payment_method || 'Cash USD',
            invoiceRef: p.reference_invoice || 'INV-2026-0001',
            amount: Number(p.amount) || 0,
            cleared: true
          }));
          setCustomerReceipts(prev => {
            const existingIds = new Set(mapped.map((m: any) => m.id));
            return [...mapped, ...prev.filter(p => !existingIds.has(p.id))];
          });
        } else {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('feature_flags')
            .eq('id', targetTenantId)
            .maybeSingle();

          const flags = tenantData?.feature_flags || {};
          if (Array.isArray(flags.customer_payments) && flags.customer_payments.length > 0) {
            setCustomerReceipts(prev => {
              const existingIds = new Set(flags.customer_payments.map((m: any) => m.id));
              return [...flags.customer_payments, ...prev.filter(p => !existingIds.has(p.id))];
            });
          }
        }
      } catch (err) {
        console.warn('Customer receipts initial fetch notice:', err);
      }
    };
    fetchPayments();
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchSalesOptions(currentTenant?.id).then((opts) => {
      setSalesOptions(opts);
    });

    const handleOptionsUpdated = (e: any) => {
      if (e.detail) {
        setSalesOptions(e.detail);
      }
    };
    window.addEventListener(SALES_OPTIONS_UPDATED_EVENT, handleOptionsUpdated);
    return () => window.removeEventListener(SALES_OPTIONS_UPDATED_EVENT, handleOptionsUpdated);
  }, [currentTenant?.id]);

  // --- POS Reading (X/Z) State ---
  const [readingType, setReadingType] = useState<'X' | 'Z'>('X');

  // --- Credit Note State ---
  const [creditNoteReason, setCreditNoteReason] = useState('Customer Return / Defective');
  const [creditNoteReturnQty, setCreditNoteReturnQty] = useState<Record<string, number>>({});

  // --- Payment Modal Temp State ---
  const [selectedPaymentType, setSelectedPaymentType] = useState('Cash USD');
  const [paymentAmountInput, setPaymentAmountInput] = useState('0.00');

  // Sync settlement accounts on currency or payment method change
  useEffect(() => {
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    const banks = getCompanyBankAccounts(payCurr);
    const whish = getCompanyWhishAccounts(payCurr);
    setSalesCompanyBankAccounts(banks);
    setSalesCompanyWhishAccounts(whish);

    const savedBank = getSavedSettlementAccount('BANK', payCurr);
    setSalesCardCompanyBankName(savedBank.name);
    setSalesCardAccountNumber(savedBank.accountNumber);
    setSalesCheckCompanyBankName(savedBank.name);
    setSalesCheckAccountNumber(savedBank.accountNumber);

    const savedWhish = getSavedSettlementAccount('WHISH', payCurr);
    setSalesWhishCompanyWalletName(savedWhish.name);
    setSalesWhishAccountNumber(savedWhish.accountNumber);
  }, [currency, selectedPaymentType]);

  // Sync settlement accounts across windows/tabs
  useEffect(() => {
    const handleAccountsUpdate = () => {
      const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
      const banks = getCompanyBankAccounts(payCurr);
      const whish = getCompanyWhishAccounts(payCurr);
      setSalesCompanyBankAccounts(banks);
      setSalesCompanyWhishAccounts(whish);
    };
    window.addEventListener(SETTLEMENT_ACCOUNTS_UPDATED_EVENT, handleAccountsUpdate);
    return () => {
      window.removeEventListener(SETTLEMENT_ACCOUNTS_UPDATED_EVENT, handleAccountsUpdate);
    };
  }, [currency, selectedPaymentType]);

  const handleSalesCardBankNameChange = (name: string) => {
    setSalesCardCompanyBankName(name);
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    const cleanTyped = cleanAccountLabel(name).toLowerCase();
    const found = salesCompanyBankAccounts.find(
      (b) => cleanAccountLabel(b.accountName).toLowerCase() === cleanTyped || cleanAccountLabel(b.bankName).toLowerCase() === cleanTyped
    );
    if (found && found.accountNumber) {
      setSalesCardAccountNumber(found.accountNumber);
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: found.accountName, accountNumber: found.accountNumber });
    } else {
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name, accountNumber: salesCardAccountNumber });
    }
  };

  const handleSaveSalesCardAccount = (num?: string) => {
    const accNo = num !== undefined ? num : salesCardAccountNumber;
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: salesCardCompanyBankName, accountNumber: accNo });
  };

  const handleSalesWhishWalletNameChange = (name: string) => {
    setSalesWhishCompanyWalletName(name);
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    const cleanTyped = cleanAccountLabel(name).toLowerCase();
    const found = salesCompanyWhishAccounts.find(
      (w) => cleanAccountLabel(w.walletName).toLowerCase() === cleanTyped
    );
    if (found && found.accountNumber) {
      setSalesWhishAccountNumber(found.accountNumber);
      saveOrUpdateSettlementAccount({ type: 'WHISH', currency: payCurr, name: found.walletName, accountNumber: found.accountNumber });
    } else {
      saveOrUpdateSettlementAccount({ type: 'WHISH', currency: payCurr, name, accountNumber: salesWhishAccountNumber });
    }
  };

  const handleSaveSalesWhishAccount = (num?: string) => {
    const accNo = num !== undefined ? num : salesWhishAccountNumber;
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    saveOrUpdateSettlementAccount({ type: 'WHISH', currency: payCurr, name: salesWhishCompanyWalletName, accountNumber: accNo });
  };

  const handleSalesCheckBankNameChange = (name: string) => {
    setSalesCheckCompanyBankName(name);
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    const cleanTyped = cleanAccountLabel(name).toLowerCase();
    const found = salesCompanyBankAccounts.find(
      (b) => cleanAccountLabel(b.accountName).toLowerCase() === cleanTyped || cleanAccountLabel(b.bankName).toLowerCase() === cleanTyped
    );
    if (found && found.accountNumber) {
      setSalesCheckAccountNumber(found.accountNumber);
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: found.accountName, accountNumber: found.accountNumber });
    } else {
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name, accountNumber: salesCheckAccountNumber });
    }
  };

  const handleSaveSalesCheckAccount = (num?: string) => {
    const accNo = num !== undefined ? num : salesCheckAccountNumber;
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';
    saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: salesCheckCompanyBankName, accountNumber: accNo });
  };

  // --- Preview Sales Filter States ---
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

  // Confirmation & loading states for Invoice Posting (Single & Batch)
  const [isConfirmPostAllOpen, setIsConfirmPostAllOpen] = useState(false);
  const [invoiceToPost, setInvoiceToPost] = useState<InvoiceRecord | null>(null);
  const [isPostingAction, setIsPostingAction] = useState(false);
  const [isPostingAll, setIsPostingAll] = useState(false);

  // Current loaded invoice in the editor & Unpost states
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceRecord | null>(null);
  const [isConfirmUnpostOpen, setIsConfirmUnpostOpen] = useState(false);
  const [invoiceToUnpost, setInvoiceToUnpost] = useState<InvoiceRecord | null>(null);
  const [isUnpostingAction, setIsUnpostingAction] = useState(false);

  const [previewFromDate, setPreviewFromDate] = useState(getTodayFormatted());
  const [previewToDate, setPreviewToDate] = useState(getTodayFormatted());

  // Existing Invoices Directory (initialized with static seeds, then hydrated from persistent store)
  const [invoicesDirectory, setInvoicesDirectory] = useState<InvoiceRecord[]>(INITIAL_INVOICES_DIRECTORY);

  // Memoized data slices for Main Reading modal (calculated strictly on demand when modal is open)
  const mainReadingInvoices = useMemo(() => {
    if (!isMainReadingModalOpen) return [];
    const activeWorkingDate = invoiceDate || getTodayFormatted();
    const currentShift = getActiveShift();
    return invoicesDirectory.filter((inv) => isInvoicePostedToday(inv, activeWorkingDate, currentShift));
  }, [isMainReadingModalOpen, invoicesDirectory, invoiceDate]);

  const mainReadingPaidInOut = useMemo(() => {
    if (!isMainReadingModalOpen) return [];
    const activeWorkingDate = invoiceDate || getTodayFormatted();
    const currentShift = getActiveShift();
    return getCashMovements().filter((m) => isCashMovementToday(m, activeWorkingDate, currentShift));
  }, [isMainReadingModalOpen, invoiceDate]);

  const mainReadingReceipts = useMemo(() => {
    if (!isMainReadingModalOpen) return [];
    const activeWorkingDate = invoiceDate || getTodayFormatted();
    const currentShift = getActiveShift();
    const all = [...customerReceipts, ...getCustomerReceipts()];
    const uniqueMap = new Map();
    for (const r of all) {
      const key = (r as any).id || (r as any).receiptNo || JSON.stringify(r);
      uniqueMap.set(key, r);
    }
    return Array.from(uniqueMap.values()).filter((rct: any) => isReceiptPostedToday(rct, activeWorkingDate, currentShift));
  }, [isMainReadingModalOpen, customerReceipts, invoiceDate]);

  const handleSelectCustomerFromModal = (cust: any) => {
    setSelectedCustomer(cust);
    setCustomerSearch('');
    setIsCustomerDropdownOpen(false);
    setIsCustomerLookupModalOpen(false);

    // Apply dynamic Price Waterfall to cart items for this customer ONLY if prices change
    setCartItems((prev) => {
      const needsUpdate = prev.some((item) => {
        const resolved = resolveItemPriceWaterfall({
          itemCode: item.code,
          customerId: cust.id,
          standardPrice: item.unitPrice,
          customerPriceTier: (cust as any).category || 'Retail Counter'
        });
        const unitPrice = resolved.resolvedPrice > 0 ? resolved.resolvedPrice : item.unitPrice;
        return unitPrice !== item.unitPrice;
      });
      if (!needsUpdate) return prev;
      return prev.map((item) => {
        const resolved = resolveItemPriceWaterfall({
          itemCode: item.code,
          customerId: cust.id,
          standardPrice: item.unitPrice,
          customerPriceTier: (cust as any).category || 'Retail Counter'
        });
        const unitPrice = resolved.resolvedPrice > 0 ? resolved.resolvedPrice : item.unitPrice;
        return {
          ...item,
          unitPrice,
          total: Number((item.qty * unitPrice).toFixed(2))
        };
      });
    });

    if (cust.salesman) {
      setInvoiceSalesman(cust.salesman);
    }
  };

  // Hydrate Delivery Providers from unified persistent store & listen to real-time sync
  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      try {
        const list = await fetchUnifiedDeliveryProviders(currentTenant?.id);
        if (isMounted && list && list.length > 0) {
          setDeliveryProviders(list);
        }
      } catch (err) {
        console.warn('Error hydrating delivery providers in SalesView:', err);
      }
    };

    loadProviders();

    const handleUpdate = (e: any) => {
      if (isMounted && e?.detail && Array.isArray(e.detail)) {
        setDeliveryProviders(e.detail);
      } else {
        loadProviders();
      }
    };

    window.addEventListener(DELIVERY_PROVIDERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', loadProviders);

    return () => {
      isMounted = false;
      window.removeEventListener(DELIVERY_PROVIDERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', loadProviders);
    };
  }, [currentTenant?.id]);

  // Hydrate Invoices Directory & Persistent Posting Status from Supabase, feature_flags, and API
  useEffect(() => {
    let isMounted = true;

    const hydrateInvoices = async () => {
      try {
        const targetTenantId =
          currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-')
            ? currentTenant.id
            : '00000000-0000-0000-0000-000000000001';

        const persistentStatusMap: Record<string, boolean> = {};
        let savedDirectoryList: any[] = [];

        // 1. Fetch from /api/ledger/toggle-post?documentType=SALES
        try {
          const apiRes = await fetch(
            `/api/ledger/toggle-post?documentType=SALES&tenantId=${encodeURIComponent(targetTenantId)}`
          );
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.sales_posting_status) {
              Object.assign(persistentStatusMap, apiData.sales_posting_status);
            }
            if (Array.isArray(apiData.sales_invoices_directory)) {
              savedDirectoryList = apiData.sales_invoices_directory;
            } else if (Array.isArray(apiData.sales_invoices)) {
              savedDirectoryList = apiData.sales_invoices;
            }
            if (Array.isArray(apiData.db_invoices)) {
              apiData.db_invoices.forEach((row: any) => {
                const k = row.invoice_ref || row.invoice_number || row.id;
                if (k && (row.is_posted !== undefined || row.posted !== undefined)) {
                  persistentStatusMap[k] = Boolean(row.is_posted === true || row.posted === true || row.status === 'Posted');
                }
              });
            }
          }
        } catch (apiErr) {
          console.warn('[SalesView] API toggle-post GET hydration notice:', apiErr);
        }

        // 2. Direct Supabase query to tenants.feature_flags as authoritative fallback/supplement
        try {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('feature_flags')
            .eq('id', targetTenantId)
            .maybeSingle();

          const flags = (tenantData?.feature_flags as Record<string, any>) || {};
          if (flags.sales_posting_status) {
            Object.assign(persistentStatusMap, flags.sales_posting_status);
          }
          const flagList = Array.isArray(flags.sales_invoices_directory)
            ? flags.sales_invoices_directory
            : Array.isArray(flags.sales_invoices)
            ? flags.sales_invoices
            : [];
          if (flagList.length > 0) {
            savedDirectoryList = [...flagList, ...savedDirectoryList];
          }
        } catch (tenantErr) {
          console.warn('[SalesView] Supabase tenant feature_flags hydration notice:', tenantErr);
        }

        // 3. Direct Supabase query to sales_invoices table
        try {
          const { data: dbSales } = await supabase
            .from('sales_invoices')
            .select('*')
            .order('created_at', { ascending: false });

          if (Array.isArray(dbSales)) {
            dbSales.forEach((row: any) => {
              const k = row.invoice_ref || row.invoice_number || row.id;
              if (k && (row.is_posted !== undefined || row.posted !== undefined)) {
                persistentStatusMap[k] = Boolean(row.is_posted === true || row.posted === true || row.status === 'Posted');
              }
            });
          }
        } catch (dbErr) {
          console.warn('[SalesView] Supabase sales_invoices query notice:', dbErr);
        }

        // 4. Local storage fallback for client offline / instant refresh
        try {
          const stored = localStorage.getItem('vanguard_sales_posting_status');
          if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(persistentStatusMap, parsed);
          }
        } catch {}

        // Populate from savedDirectoryList
        savedDirectoryList.forEach((saved: any) => {
          const k = saved.invoiceNumber || saved.id || saved.invoice_number;
          if (k && (saved.posted !== undefined || saved.is_posted !== undefined || saved.status !== undefined)) {
            persistentStatusMap[k] = Boolean(
              saved.posted === true || saved.is_posted === true || saved.status === 'Posted'
            );
          }
        });

        if (!isMounted) return;

        // 5. Merge persistent status over invoicesDirectory
        setInvoicesDirectory((prev) => {
          return prev.map((inv) => {
            const invKey = inv.invoiceNumber || inv.id;
            const hasExplicitStatus = persistentStatusMap[invKey] !== undefined || persistentStatusMap[inv.id] !== undefined;
            if (hasExplicitStatus) {
              const isPosted = persistentStatusMap[invKey] !== undefined ? persistentStatusMap[invKey] : persistentStatusMap[inv.id];
              return {
                ...inv,
                posted: isPosted,
                is_posted: isPosted,
                status: isPosted ? 'Posted' : 'Unposted',
              };
            }

            const matchSaved = savedDirectoryList.find(
              (s: any) => s.id === inv.id || s.invoiceNumber === inv.invoiceNumber
            );
            if (matchSaved && (matchSaved.posted !== undefined || matchSaved.is_posted !== undefined || matchSaved.status !== undefined)) {
              const isPosted = Boolean(
                matchSaved.posted === true || matchSaved.is_posted === true || matchSaved.status === 'Posted'
              );
              return {
                ...inv,
                ...matchSaved,
                posted: isPosted,
                is_posted: isPosted,
                status: isPosted ? 'Posted' : 'Unposted',
              };
            }

            return inv;
          });
        });

        // 6. Synchronize currentInvoice ONLY if explicitly loaded (prev !== null)
        setCurrentInvoice((prev) => {
          if (!prev) return null;
          const targetKey = prev.id || prev.invoiceNumber;
          const isPosted = persistentStatusMap[targetKey];
          if (isPosted !== undefined) {
            return {
              ...prev,
              posted: isPosted,
              is_posted: isPosted,
              status: isPosted ? 'Posted' : 'Unposted',
            };
          }
          return prev;
        });

      } catch (err) {
        console.warn('[SalesView] Invoices directory hydration exception:', err);
      }
    };

    hydrateInvoices();

    return () => {
      isMounted = false;
    };
  }, [currentTenant?.id]);

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
    return VANGUARD_SALES_ITEMS.filter((item) => {
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

  // Cart Calculations via Central ERP Calculation Engine
  const cartDocumentTotals = useMemo(() => {
    return calculateDocumentTotals({
      items: cartItems.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discountPercent: (item as any).discountPercent || 0,
        discountAmount: (item as any).discountAmount || 0,
        taxPercent: (item as any).taxPercent
      })),
      taxRate: 0.11,
      isTaxEnabled: true,
      noTax: salesOptions.no_tax,
      removeTaxForInternational: salesOptions.remove_tax_for_international,
      transactionType: transactionType,
      exchangeRate: POS_EXCHANGE_RATE_LBP || 89500
    });
  }, [cartItems, salesOptions.no_tax, salesOptions.remove_tax_for_international, transactionType]);

  const subtotal = cartDocumentTotals.grossSubtotal;
  const isTaxExempt = cartDocumentTotals.isTaxExempt;
  const discount = cartDocumentTotals.totalDiscount;
  const tax = cartDocumentTotals.taxAmount;
  const grandTotal = cartDocumentTotals.grandTotalPrimary;

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingBalance = Math.max(0, grandTotal - totalPaid);
  const changeDue = Math.max(0, totalPaid - grandTotal);

  const targetPrintInvoice = useMemo(() => {
    if (printSnapshotInvoice) return printSnapshotInvoice;
    if (currentInvoice) return currentInvoice;
    return {
      id: invoiceNumber,
      invoiceNumber: invoiceNumber,
      docType: docType,
      date: invoiceDate,
      deliveryDate: deliveryDate,
      branch: BRANCH_OPTIONS.find((b) => b.id === selectedBranch)?.name || 'Southern Olive and Oil Products S.A.R.L.',
      customerName: selectedCustomer?.name || 'Miscellaneous / Cash Customer',
      customerAddress: selectedCustomer?.address || 'Local Branch',
      deliveredBy: deliveredBy,
      currency: currency,
      transactionType: transactionType,
      salesman: invoiceSalesman || 'Direct Counter',
      refNumber: invoiceReferenceNumber || '—',
      reference: invoiceReferenceNumber || '—',
      items: cartItems,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      grandTotal: grandTotal,
      payments: payments,
      status: 'Draft'
    };
  }, [
    printSnapshotInvoice,
    currentInvoice,
    invoiceNumber,
    docType,
    invoiceDate,
    deliveryDate,
    selectedBranch,
    selectedCustomer,
    deliveredBy,
    currency,
    transactionType,
    invoiceSalesman,
    invoiceReferenceNumber,
    cartItems,
    subtotal,
    discount,
    tax,
    grandTotal,
    payments
  ]);

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentAmountInput((Number(remainingBalance) || 0).toFixed(2));
    }
  }, [isPaymentModalOpen, remainingBalance]);

  // Handlers
  const handleAddItemToCart = (item: SalesItem) => {
    // Check QTOH stock restriction
    if (!salesOptions.allow_sales_negative_stock && item.stockQty <= 0) {
      alert(`Item "${item.name}" has 0 or negative stock (${item.stockQty} ${item.unit}). Sales disallowed under active Sales Options.`);
      return;
    }

    // Calculate Selling Price with 4-tier waterfall resolver via Central ERP Engine
    const resolvedPriceInfo = resolveItemUnitPrice({
      itemCode: item.code,
      standardPrice: item.price,
      customerId: selectedCustomer?.id,
      customerSpecialPrices: getCustomerSpecialPrices(),
      customerPriceTier: (selectedCustomer as any)?.category,
      isMarkupEnabled: salesOptions.apply_markup_on_item,
      costBasisValue: item.cost || (item.price * 0.7),
      markupPercent: salesOptions.mark_up_pct
    });
    const calculatedPrice = resolvedPriceInfo.unitPrice;

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
          unitPrice: calculatedPrice,
          total: calculatedPrice,
          location: salesOptions.default_location || 'Southern Olive and Oil Products - Main',
          cost: item.cost,
          salesman: invoiceSalesman || salesOptions.default_salesman || 'Direct Counter'
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
    setCurrentInvoice(null);
    setPrintSnapshotInvoice(null);
    setDocType('SALE');
    setParentInvoiceNo(null);
    const nextNb = generateUniqueInvoiceNumber(invoicesDirectory);
    setInvoiceNumber(nextNb);
    setCartItems([]);
    setPayments([]);
    setSelectedCustomer(CUSTOMER_PRESETS[0]);
    setCustomerSearch('');
    setInvoiceDate(getTodayFormatted());
    setDeliveryDate(getTodayFormatted());
    if (salesOptions.default_currency) {
      setCurrency(salesOptions.default_currency);
    }
    if (salesOptions.default_branch) {
      setSelectedBranch(salesOptions.default_branch);
    }
    if (salesOptions.default_payment) {
      setSelectedPaymentType(salesOptions.default_payment);
    }
    if (salesOptions.default_salesman) {
      setInvoiceSalesman(salesOptions.default_salesman);
    }
    setStatusNotice(`New blank invoice initialized: ${nextNb}`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSwitchToDirectCreditNoteMode = () => {
    setDocType('CREDIT_NOTE');
    setInvoiceNumber(peekNextDocNumber('CREDIT_NOTE', invoicesDirectory));
    setStatusNotice('Switched active workstation to Credit Note & Return Mode.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleAddPayment = () => {
    const amt = parseFloat(paymentAmountInput);
    if (isNaN(amt) || amt <= 0) return;

    const isCard = selectedPaymentType.includes('Visa') || selectedPaymentType.includes('Card');
    const isWhish = selectedPaymentType.includes('Whish') || selectedPaymentType.includes('OMT');
    const isCheck = selectedPaymentType.includes('Check') || selectedPaymentType.includes('Cheque');
    const payCurr = (selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD';

    let companyAccountId: string | undefined = undefined;
    let companyAccountName: string | undefined = undefined;
    let companyAccountNumber: string | undefined = undefined;

    if (isCard) {
      companyAccountName = salesCardCompanyBankName || (payCurr === 'LBP' ? 'Bank of Beirut (BOB)' : 'BLOM Bank S.A.L.');
      companyAccountNumber = salesCardAccountNumber;
      companyAccountId = `bank_${payCurr.toLowerCase()}`;
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: companyAccountName, accountNumber: companyAccountNumber });
    } else if (isWhish) {
      companyAccountName = salesWhishCompanyWalletName || (payCurr === 'LBP' ? 'Whish Money Operations Wallet' : 'Whish Money Merchant Wallet');
      companyAccountNumber = salesWhishAccountNumber;
      companyAccountId = `whish_${payCurr.toLowerCase()}`;
      saveOrUpdateSettlementAccount({ type: 'WHISH', currency: payCurr, name: companyAccountName, accountNumber: companyAccountNumber });
    } else if (isCheck) {
      companyAccountName = salesCheckCompanyBankName || (payCurr === 'LBP' ? 'Bank of Beirut (BOB)' : 'BLOM Bank S.A.L.');
      companyAccountNumber = salesCheckAccountNumber;
      companyAccountId = `bank_${payCurr.toLowerCase()}`;
      saveOrUpdateSettlementAccount({ type: 'BANK', currency: payCurr, name: companyAccountName, accountNumber: companyAccountNumber });
    }

    const newEntry: PaymentEntry = {
      id: `pay-${Date.now()}`,
      type: selectedPaymentType,
      amount: amt,
      cardholderName: isCard ? salesCardholderName.trim() : undefined,
      cardNumber: isCard ? salesCardNumber.trim() : undefined,
      cardBank: isCard ? salesCardBank.trim() : undefined,
      whishSenderPhone: isWhish ? salesWhishSenderPhone.trim() : undefined,
      whishAccountNumber: isWhish ? (salesWhishAccountNumber || companyAccountNumber) : undefined,
      companyAccountId,
      companyAccountName,
      companyAccountNumber,
      senderBank: isCheck ? salesCheckIssuingBank.trim() : (isCard ? salesCardBank.trim() : undefined),
      checkNumber: isCheck ? salesCheckNumber.trim() : undefined
    };
    setPayments((prev) => [...prev, newEntry]);
    setPaymentAmountInput('0.00');
  };

  const handleRemovePayment = (payId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== payId));
  };

  const handleSaveInvoice = async (postImmediately = false) => {
    if (localStorage.getItem('vanguard_is_read_only') === 'true') {
      alert('Action disabled in Read-Only grace mode');
      return;
    }
    if (salesOptions.disable_sales_save_button) {
      alert('Saving invoices is currently disabled in Sales Options.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Cannot save an empty invoice. Please select at least one item from the catalog.');
      return;
    }

    if (salesOptions.verify_customer_credit_limit && selectedCustomer && docType !== 'CREDIT_NOTE') {
      const creditLimit = typeof (selectedCustomer as any)?.creditLimit === 'number'
        ? (selectedCustomer as any).creditLimit
        : (Number((selectedCustomer as any)?.creditLimit ?? 5000) || 5000);
      const currentBalance = typeof (selectedCustomer as any)?.balance === 'number'
        ? (selectedCustomer as any).balance
        : (Number((selectedCustomer as any)?.balance ?? (selectedCustomer as any)?.openBalance ?? (selectedCustomer as any)?.outstandingBalance ?? 0) || 0);
      if (currentBalance + grandTotal > creditLimit) {
        if (!confirm(`Warning: Customer credit limit ($${(Number(creditLimit) || 0).toLocaleString()}) will be exceeded by $${(Number(currentBalance + grandTotal - creditLimit) || 0).toLocaleString()}. Do you wish to proceed?`)) {
          return;
        }
      }
    }

    const branchName =
      BRANCH_OPTIONS.find((b) => b.id === selectedBranch)?.name || 'Southern Olive and Oil Products S.A.R.L.';

    // If active document is Credit Note, route to postCreditNote workflow
    if (docType === 'CREDIT_NOTE') {
      const isCashRefund = !transactionType.toLowerCase().includes('credit') && !transactionType.toLowerCase().includes('account');
      const activeShift = getActiveShift();
      const nowIso = new Date().toISOString();
      const crnRecord: CreditNoteRecord = {
        id: invoiceNumber,
        invoiceNumber: invoiceNumber,
        parentInvoiceNo: parentInvoiceNo || undefined,
        docType: 'CREDIT_NOTE',
        doc_type: 'CREDIT_NOTE',
        date: invoiceDate,
        customerId: selectedCustomer.id || 'CUST-001',
        customerName: selectedCustomer.name || 'Miscellaneous / Cash Customer',
        customerAddress: selectedCustomer.address || 'Local Branch',
        settlementMethod: isCashRefund ? 'CASH_REFUND' : 'ON_ACCOUNT',
        reason: creditNoteReason || 'Customer Return',
        notes: invoiceNote || 'Direct Return',
        branch: branchName,
        currency: currency,
        exchangeRate: POS_EXCHANGE_RATE_LBP,
        shiftId: activeShift.id,
        shiftNumber: activeShift.shiftNumber,
        createdAt: nowIso,
        createdAtIso: nowIso,
        isReconciledOrClosed: false,
        closedInZReport: false,
        shiftClosed: false,
        items: cartItems.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          unit: item.unit,
          qty: item.qty,
          unitPrice: item.unitPrice,
          total: item.total,
          location: (item as any).location || 'Main Store',
          costPrice: item.unitPrice * 0.65
        })),
        subtotal: subtotal,
        tax: tax,
        grandTotal: grandTotal,
        status: 'Posted',
        posted: true,
        is_posted: true
      };

      await postCreditNote(crnRecord, currentTenant?.id);
      setInvoicesDirectory((prev) => [
        crnRecord as any,
        ...prev.filter((i) => i.id !== crnRecord.id && i.invoiceNumber !== crnRecord.invoiceNumber)
      ]);
      setPrintSnapshotInvoice(crnRecord);
      setCurrentInvoice(crnRecord as any);
      setStatusNotice(`Credit Note #${invoiceNumber} POSTED! Inventory restocked (+qty) and GL updated.`);

      const cleanCrnNo = invoiceNumber.replace(/^CRN-/i, '');
      const shouldAutoPrint = salesOptions.print_report_on_save === 'auto' || (salesOptions.print_report_on_save as string) === 'always';
      const shouldAskPrint = salesOptions.print_report_on_save === 'ask';

      if (shouldAutoPrint) {
        setTimeout(() => {
          printElementById('printable-sales-invoice', 'Credit Note');
        }, 150);
      } else if (shouldAskPrint) {
        setTimeout(() => {
          if (confirm(`Credit Note #${cleanCrnNo} saved! Do you want to print now?`)) {
            printElementById('printable-sales-invoice', 'Credit Note');
          }
        }, 150);
      } else {
        setTimeout(() => {
          handleNewInvoice();
        }, 1500);
      }
      return;
    }

    const activeShift = getActiveShift();
    const nowIso = new Date().toISOString();
    const newRecord: InvoiceRecord = {
      id: invoiceNumber,
      invoiceNumber: invoiceNumber,
      docType: 'SALE',
      doc_type: 'SALE',
      date: invoiceDate,
      deliveryDate: deliveryDate,
      branch: branchName,
      customerName: selectedCustomer.name || 'Miscellaneous / Cash Customer',
      customerId: selectedCustomer.id || 'CUST-001',
      company: ((selectedCustomer as any).company && (selectedCustomer as any).company !== '-') ? (selectedCustomer as any).company : (selectedCustomer.name || 'Walk-in Cash Customer'),
      customerAddress: selectedCustomer.address || 'Local Branch',
      salesman: invoiceSalesman || 'Direct Counter',
      createdBy: profile?.name || 'Vanguard Operator',
      deliveredBy: deliveredBy,
      currency: currency,
      transactionType: transactionType,
      items: [...cartItems],
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      grandTotal: grandTotal,
      payments: [...payments],
      status: postImmediately ? 'Posted' : 'Draft',
      is_posted: postImmediately,
      posted: postImmediately,
      shiftId: activeShift.id,
      shiftNumber: activeShift.shiftNumber,
      createdAt: nowIso,
      createdAtIso: nowIso,
      isReconciledOrClosed: false,
      closedInZReport: false,
      shiftClosed: false
    };

    // 1. Snapshot the saved invoice immediately before any form changes
    setPrintSnapshotInvoice(newRecord);
    setCurrentInvoice(newRecord);

    setInvoicesDirectory((prev) => {
      const exists = prev.some((inv) => inv.id === newRecord.id || inv.invoiceNumber === newRecord.invoiceNumber);
      if (exists) {
        return prev.map((inv) =>
          inv.id === newRecord.id || inv.invoiceNumber === newRecord.invoiceNumber ? newRecord : inv
        );
      }
      return [newRecord, ...prev];
    });

    // Advance and persist sequence counter
    commitNextDocNumber('SALES_INVOICE', newRecord.invoiceNumber, currentTenant?.id);

    if (postImmediately) {
      executeDatabasePost([newRecord]);
      const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      const stockTxns = cartItems.map(item => ({
        tenant_id: targetTenantId,
        item_id: (item as any).sku || item.id,
        transaction_type: 'SALES_DEDUCTION',
        quantity: -item.qty,
        reference_number: invoiceNumber,
        branch_id: selectedBranch || 'BRANCH-01',
        created_at: new Date().toISOString()
      }));

      supabase.from('stock_transactions').insert(stockTxns).then(({ error }) => {
        if (error) console.warn('Stock transaction deduction failed:', error.message);
      });
    }

    // Dual persist invoice settlement payments to accounting GL ledger
    if (postImmediately && newRecord.payments && newRecord.payments.length > 0) {
      if (typeof window !== 'undefined') {
        try {
          const STORAGE_JVS_KEY = 'vanguard_accounting_jvs_data';
          const STORAGE_ACCOUNTS_KEY = 'vanguard_accounting_accounts_data';
          const rawJvs = localStorage.getItem(STORAGE_JVS_KEY);
          const jvs = rawJvs ? JSON.parse(rawJvs) : [];

          const accountsRaw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
          let accounts = accountsRaw ? JSON.parse(accountsRaw) : [];

          const jvLines: any[] = [];
          let lineNo = 1;
          let totalDebit = 0;

          newRecord.payments.forEach((p) => {
            const payCurr = (p.type.includes('LBP') || newRecord.currency === 'LBP') ? 'LBP' : 'USD';
            const resolvedGl = resolveSettlementGlAccount(p.type, p.companyAccountId, p.companyAccountName, payCurr);
            const debitAccountNo = resolvedGl.code;
            const debitAccountId = `acc-${debitAccountNo}`;
            const debitAccountName = p.companyAccountName || resolvedGl.name;

            const accDetail = p.companyAccountNumber ? ` - Acc: ${p.companyAccountNumber}` : '';
            jvLines.push({
              id: `line-${Date.now()}-${lineNo}`,
              line_number: lineNo++,
              account_id: debitAccountId,
              account_number: debitAccountNo,
              account_name: debitAccountName,
              description: `Settlement for Invoice #${newRecord.invoiceNumber} (${p.type}${accDetail})`,
              amount_debit: p.amount,
              amount_credit: 0,
              currency_rate: payCurr === 'LBP' ? 1 : 89500,
              amount_native: p.amount
            });
            totalDebit += p.amount;

            // Increment GL Account Balance
            if (Array.isArray(accounts)) {
              accounts = accounts.map((acc: any) => {
                const accNo = String(acc.account_number || acc.id || '');
                if (accNo === debitAccountNo || acc.id === debitAccountId) {
                  return {
                    ...acc,
                    balance: Number((Number(acc.balance || 0) + p.amount).toFixed(2))
                  };
                }
                return acc;
              });
            }
          });

          // Credit Sales / Customer AR
          jvLines.push({
            id: `line-${Date.now()}-${lineNo}`,
            line_number: lineNo,
            account_id: 'acc-41100',
            account_number: '41100',
            account_name: `Trade Customers / ذمم الزبائن (${newRecord.customerName})`,
            description: `Payment applied to Invoice #${newRecord.invoiceNumber}`,
            amount_debit: 0,
            amount_credit: totalDebit,
            currency_rate: 89500,
            amount_native: totalDebit
          });

          if (Array.isArray(accounts)) {
            accounts = accounts.map((acc: any) => {
              const accNo = String(acc.account_number || acc.id || '');
              if (accNo === '41100' || acc.id === 'acc-41100') {
                return {
                  ...acc,
                  balance: Number((Number(acc.balance || 0) - totalDebit).toFixed(2))
                };
              }
              return acc;
            });
            localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
          }

          const jv = {
            id: `jv-inv-${Date.now()}`,
            tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
            jv_number: `JV-INV-${newRecord.invoiceNumber}`,
            date_of_jv: new Date().toISOString().split('T')[0],
            jv_type: 'RV',
            currency_id: 'USD',
            doc_ref_number: newRecord.invoiceNumber,
            description: `[Sales Settlement] Invoice #${newRecord.invoiceNumber} - ${newRecord.customerName}`,
            payee_or_recipient: newRecord.customerName,
            created_by: profile?.name || 'Vanguard Operator',
            total_debit: totalDebit,
            total_credit: totalDebit,
            is_posted: true,
            status: 'POSTED',
            created_at: new Date().toISOString(),
            lines: jvLines
          };

          localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify([jv, ...jvs]));
          window.dispatchEvent(new CustomEvent('vanguard_accounting_sync', {
            detail: { type: 'VOUCHER_SAVED', data: jv }
          }));
        } catch (e) {
          console.warn('Error recording accounting JV for sales invoice:', e);
        }
      }
    }

    // Sequence Print on Save workflow
    const cleanInvoiceNo = invoiceNumber.replace(/^INV-/i, '');
    const shouldAutoPrint = salesOptions.print_report_on_save === 'auto' || (salesOptions.print_report_on_save as string) === 'always';
    const shouldAskPrint = salesOptions.print_report_on_save === 'ask';

    const triggerPrintFlow = () => {
      printElementById('printable-sales-invoice', 'Sales Invoice');
      if (salesOptions.print_delivery_note) {
        setTimeout(() => {
          printElementById('printable-delivery-note', 'Delivery Note');
        }, 500);
      }
    };

    if (shouldAutoPrint) {
      setTimeout(() => {
        triggerPrintFlow();
      }, 150);
    } else if (shouldAskPrint) {
      setTimeout(() => {
        if (confirm(`Invoice #${cleanInvoiceNo} saved! Do you want to print the sales invoice now?`)) {
          triggerPrintFlow();
        }
      }, 150);
    } else if (salesOptions.print_delivery_note) {
      setTimeout(() => {
        printElementById('printable-delivery-note', 'Delivery Note');
      }, 150);
    }

    setStatusNotice(
      postImmediately
        ? `Invoice #${cleanInvoiceNo} SAVED & POSTED! Inventory deducted.`
        : `Invoice #${cleanInvoiceNo} saved as DRAFT.`
    );
    setTimeout(() => setStatusNotice(null), 4000);

    // Keep invoice loaded in posted state; only auto-advance to blank invoice if printing is not configured
    if (postImmediately && salesOptions.print_report_on_save === 'never' && !salesOptions.print_delivery_note) {
      setTimeout(() => {
        handleNewInvoice();
      }, 1500);
    }
  };

  const handleLoadInvoice = (rec: InvoiceRecord) => {
    setCurrentInvoice(rec);
    setPrintSnapshotInvoice(rec);
    setInvoiceNumber(rec.invoiceNumber);
    setInvoiceDate(rec.date);
    setDeliveryDate(rec.deliveryDate);
    setDeliveredBy(rec.deliveredBy);
    if (rec.deliveredBy && !deliveryProviders.some((p) => p.name === rec.deliveredBy || p.id === rec.deliveredBy)) {
      const customProvider = normalizeDeliveryProvider(rec.deliveredBy);
      setDeliveryProviders((prev) => [...prev, customProvider]);
    }
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

  const handleSaveDeliveryProvider = async () => {
    const trimmed = newProviderName.trim();
    if (!trimmed) {
      setStatusNotice('Please enter a delivery provider or carrier name.');
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    setIsSavingProvider(true);
    try {
      const slug = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15);
      const newRecord: DeliveryProviderRecord = {
        id: `DP-${slug || Math.floor(1000 + Math.random() * 9000)}`,
        providerId: `DP-${slug || Math.floor(1000 + Math.random() * 9000)}`,
        name: trimmed,
        classification: newProviderClassification,
        providerType: newProviderClassification,
        contactPerson: newProviderContactPerson.trim() || 'Operations Dispatch Desk',
        phone: newProviderPhone.trim() || '+961 70 000 000',
        status: newProviderStatus,
        active: newProviderStatus === 'Active Carrier'
      };

      const updatedList = [
        newRecord,
        ...deliveryProviders.filter((p) => p.name.toLowerCase() !== trimmed.toLowerCase())
      ];
      setDeliveryProviders(updatedList);
      setDeliveredBy(trimmed);

      await persistUnifiedDeliveryProviders(updatedList, currentTenant?.id);

      setStatusNotice(`Delivery provider "${trimmed}" added and synchronized.`);
      setTimeout(() => setStatusNotice(null), 3500);

      // Reset modal inputs & close
      setNewProviderName('');
      setNewProviderPhone('');
      setNewProviderClassification('3PL_EXPRESS');
      setNewProviderContactPerson('');
      setNewProviderStatus('Active Carrier');
      setNewProviderNotes('');
      setIsAddProviderModalOpen(false);
    } catch (err) {
      console.error('Error saving delivery provider:', err);
    } finally {
      setIsSavingProvider(false);
    }
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

  const handleLoadRecurringTemplate = (tpl: RecurringInvoiceTemplate | any) => {
    const mappedItems: CartItem[] = (tpl.items || []).map((it: any) => {
      let finalPrice = it.unitPrice || (it as any).fixedUnitPrice || 0;
      if (tpl.useLivePrice) {
        const resolved = resolveItemPriceWaterfall({
          itemCode: it.code,
          customerId: tpl.customerId,
          standardPrice: it.unitPrice || 0
        });
        if (resolved.resolvedPrice > 0) finalPrice = resolved.resolvedPrice;
      }
      return {
        id: `cart-${Date.now()}-${Math.random()}`,
        itemId: it.code || it.itemId || it.id,
        code: it.code,
        name: it.name,
        unit: it.unit,
        qty: it.qty,
        unitPrice: finalPrice,
        total: Number((it.qty * finalPrice).toFixed(2)),
        location: it.location || 'Southern Olive and Oil Products - Main'
      };
    });

    setCartItems(mappedItems);
    const cust = CUSTOMER_PRESETS.find((c) => c.id === tpl.customerId) || {
      id: tpl.customerId,
      name: tpl.customerName,
      address: 'Local Branch'
    };
    setSelectedCustomer(cust);
    setCustomerSearch(tpl.customerName);
    if (tpl.currency) setCurrency(tpl.currency);
    if (tpl.transactionType) setTransactionType(tpl.transactionType);
    if (tpl.deliveredBy) setDeliveredBy(tpl.deliveredBy);
    if (tpl.salesman) setInvoiceSalesman(tpl.salesman);
    setIsRecallRecurringModalOpen(false);
    setIsRecurringModalOpen(false);
    setStatusNotice(`Loaded recurring template: ${tpl.name} (${tpl.useLivePrice ? 'Live Customer Pricing Applied' : 'Template Locked Prices'})`);
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
    const activeShift = getActiveShift();
    const nowIso = new Date().toISOString();
    const newEntry = {
      id: `PIO-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: paidInOutType,
      category: paidInOutCategory,
      amount: amt,
      notes: paidInOutNotes.trim() || (paidInOutType === 'in' ? 'Cash Deposit' : 'Cash Payout'),
      shiftId: activeShift.id,
      shiftNumber: activeShift.shiftNumber,
      createdAtIso: nowIso,
      createdAt: nowIso,
      isReconciledOrClosed: false
    };
    setPaidInOutHistory((prev) => [newEntry, ...prev]);
    setDrawerCashBalance((prev) => (paidInOutType === 'in' ? prev + amt : Math.max(0, prev - amt)));

    // Sync with POS Shift Cash Movements
    recordCashMovement({
      shiftId: activeShift.id,
      shiftNumber: activeShift.shiftNumber,
      createdAtIso: nowIso,
      movementType: paidInOutType === 'in' ? 'PAID_IN' : 'PAID_OUT',
      type: paidInOutType === 'in' ? 'PAID_IN' : 'PAID_OUT',
      amount: amt,
      category: paidInOutCategory,
      amountUsd: amt,
      amountLbp: amt * POS_EXCHANGE_RATE_LBP,
      notes: newEntry.notes,
      isReconciledOrClosed: false
    }, currentTenant?.id);

    setPaidInOutAmount('');
    setPaidInOutNotes('');
    setIsPaidInOutModalOpen(false);
    setStatusNotice(`Cash drawer ${paidInOutType === 'in' ? 'Paid In' : 'Paid Out'} ($${(Number(amt) || 0).toFixed(2)}) recorded.`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleIssueCreditNote = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please select items or load an invoice to issue a Credit Note.');
      return;
    }
    const crnNumber = peekNextDocNumber('CREDIT_NOTE', invoicesDirectory);
    commitNextDocNumber('CREDIT_NOTE', crnNumber, currentTenant?.id);
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
      is_posted: true,
      posted: true,
      createdAt: new Date().toLocaleString()
    };
    setInvoicesDirectory((prev) => [crnRecord, ...prev]);
    setIsCreditNoteModalOpen(false);
    setStatusNotice(`Credit Note ${crnNumber} posted! $${(Number(grandTotal) || 0).toFixed(2)} credited.`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleRecordCustomerReceipt = async () => {
    const amt = parseFloat(newReceiptAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid receipt amount.');
      return;
    }
    const rctNum = peekNextDocNumber('CUSTOMER_RECEIPT');
    commitNextDocNumber('CUSTOMER_RECEIPT', rctNum, currentTenant?.id);
    const newRct = {
      id: rctNum,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: selectedCustomer.name || 'Miscellaneous Customer',
      customerId: selectedCustomer.id || 'CUST-001',
      method: newReceiptMethod,
      invoiceRef: cleanDocumentNumber(invoiceNumber) || '0002601',
      amount: amt,
      cleared: true
    };

    const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    try {
      // 1. Direct write to public.customer_payments
      const { error: dbError } = await supabase
        .from('customer_payments')
        .insert([{
          tenant_id: targetTenantId,
          customer_id: selectedCustomer.id || 'CUST-001',
          customer_name: selectedCustomer.name || 'Miscellaneous Customer',
          receipt_number: rctNum,
          amount: amt,
          payment_method: newReceiptMethod,
          reference_invoice: invoiceNumber || 'INV-2026-0001',
          notes: newReceiptNotes || 'Customer Receipt Settlement',
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        console.warn('Direct customer_payments insert notice, dual-persisting:', dbError.message);
      }

      // 2. Dual-persist to feature_flags
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || {};
      const existingPayments = Array.isArray(existingFlags.customer_payments) ? existingFlags.customer_payments : [];
      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            customer_payments: [newRct, ...existingPayments].slice(0, 100)
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTenantId);

    } catch (err: any) {
      console.warn('Customer payment persistence notice:', err);
    }

    // 3. Clear customer balance and adjust aging buckets (0-30, 31-60, 61-90, 90+)
    let remainingToClear = amt;
    setCustomerInvoices((prev) =>
      prev.map((inv) => {
        if (remainingToClear <= 0 || inv.balanceDue <= 0) return inv;
        const deduction = Math.min(inv.balanceDue, remainingToClear);
        remainingToClear -= deduction;
        return {
          ...inv,
          balanceDue: Math.max(0, inv.balanceDue - deduction)
        };
      })
    );

    setCustomerReceipts((prev) => [newRct, ...prev]);
    setNewReceiptAmount('');
    setNewReceiptNotes('');
    setStatusNotice(`Payment Receipt ${rctNum} recorded ($${(Number(amt) || 0).toFixed(2)}) & aging balance cleared for ${selectedCustomer.name}`);
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
    setStatusNotice(`Quotation ${quote.quotationNumber} ($${(Number(quote.amount) || 0).toFixed(2)}) loaded into active bill!`);
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
        const isPosted = inv.status === 'Posted' || (inv as any).is_posted === true || (inv as any).posted === true;
        if (previewStatusFilter === 'Posted' && !isPosted) return false;
        if (previewStatusFilter === 'Unposted' && isPosted) return false;
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
    const netUSD = filteredPreviewInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const netLL = netUSD * 89500;
    const discountTotal = filteredPreviewInvoices.reduce((sum, inv) => sum + (Number(inv.discount) || 0), 0);
    const taxTotal = filteredPreviewInvoices.reduce((sum, inv) => sum + (Number(inv.tax) || 0), 0);
    return {
      netUSD,
      netLL,
      discountTotal,
      taxTotal,
      count: filteredPreviewInvoices.length
    };
  }, [filteredPreviewInvoices]);

  // Check for unposted invoices in the current filtered list
  const hasUnpostedInvoices = useMemo(() => {
    return filteredPreviewInvoices.some((inv) => !inv.posted);
  }, [filteredPreviewInvoices]);

  // Check if currently loaded invoice in editor is posted
  const isCurrentInvoicePosted = Boolean(
    currentInvoice &&
      (currentInvoice.posted === true ||
        (currentInvoice as any).is_posted === true ||
        currentInvoice.status === 'Posted')
  );

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

  // --- Invoice Posting Handlers (Single & Bulk) ---
  const handlePromptPostSingleInvoice = (inv: InvoiceRecord) => {
    setInvoiceToPost(inv);
    setIsConfirmPostAllOpen(true);
  };

  const handlePostAllInvoices = () => {
    if (!hasUnpostedInvoices) return;
    setInvoiceToPost(null);
    setIsConfirmPostAllOpen(true);
  };

  const handlePostAll = handlePostAllInvoices;

  async function executeDatabasePost(invoicesToUpdate: InvoiceRecord[]) {
    const isUUID = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const targetTenantId =
      currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-')
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

    for (const inv of invoicesToUpdate) {
      const invRef = inv.invoiceNumber || inv.id;

      // Trigger authoritative unified toggle-post service
      try {
        await toggleDocumentPosting('SALES', invRef, true, undefined, targetTenantId);
      } catch (toggleErr) {
        console.warn('Unified toggle-post notice:', toggleErr);
      }

      // 1. Update sales_invoices table in database
      try {
        if (isUUID(inv.id)) {
          const { error } = await supabase
            .from('sales_invoices')
            .update({ is_posted: true, status: 'Posted' })
            .eq('id', inv.id);

          if (error) {
            await supabase
              .from('sales_invoices')
              .update({ is_posted: true })
              .eq('id', inv.id);
          }
        } else {
          const { error } = await supabase
            .from('sales_invoices')
            .update({ is_posted: true, status: 'Posted' })
            .eq('invoice_ref', invRef);

          if (error) {
            await supabase
              .from('sales_invoices')
              .update({ is_posted: true })
              .eq('invoice_ref', invRef);
          }
        }
      } catch (err) {
        console.warn('Supabase sales_invoices update notice:', err);
      }

      // 2. Update orders table in database if linked
      try {
        if (isUUID(inv.id)) {
          await supabase
            .from('orders')
            .update({ is_posted: true, status: 'POSTED' })
            .eq('id', inv.id);
        } else {
          await supabase
            .from('orders')
            .update({ is_posted: true, status: 'POSTED' })
            .eq('order_number', invRef);
        }
      } catch (err) {
        console.warn('Supabase orders update notice:', err);
      }

      // 3. Post stock transaction deduction if items present
      if (inv.items && inv.items.length > 0) {
        try {
          const stockTxns = inv.items.map((item) => ({
            tenant_id: targetTenantId,
            item_id: (item as any).sku || item.id,
            transaction_type: 'SALES_DEDUCTION',
            quantity: -item.qty,
            reference_number: inv.invoiceNumber,
            branch_id: inv.branch || selectedBranch || 'BRANCH-01',
            created_at: new Date().toISOString()
          }));

          await supabase.from('stock_transactions').insert(stockTxns);
        } catch (err) {
          console.warn('Stock transaction deduction notice:', err);
        }
      }

      // 4. Synchronize tenant feature_flags and local client cache
      try {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', targetTenantId)
          .maybeSingle();

        const flags = (tenantData?.feature_flags as Record<string, any>) || {};
        flags.sales_posting_status = flags.sales_posting_status || {};
        flags.sales_posting_status[invRef] = true;
        flags.sales_posting_status[inv.id] = true;

        if (!Array.isArray(flags.sales_invoices_directory)) {
          flags.sales_invoices_directory = [];
        }
        const dirIdx = flags.sales_invoices_directory.findIndex(
          (item: any) => item.id === inv.id || item.invoiceNumber === invRef
        );
        const updatedEntry = {
          ...inv,
          posted: true,
          is_posted: true,
          status: 'Posted',
          posted_at: new Date().toISOString(),
        };
        if (dirIdx >= 0) {
          flags.sales_invoices_directory[dirIdx] = updatedEntry;
        } else {
          flags.sales_invoices_directory.push(updatedEntry);
        }

        await supabase
          .from('tenants')
          .update({ feature_flags: flags, updated_at: new Date().toISOString() })
          .eq('id', targetTenantId);

        try {
          const cached = JSON.parse(localStorage.getItem('vanguard_sales_posting_status') || '{}');
          cached[invRef] = true;
          cached[inv.id] = true;
          localStorage.setItem('vanguard_sales_posting_status', JSON.stringify(cached));
        } catch {}
      } catch (flagErr) {
        console.warn('Feature flags post persistence notice:', flagErr);
      }
    }
  };

  const postInvoice = async (invoiceId: string) => {
    const inv = invoicesDirectory.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) return;

    // a) Await database update
    await executeDatabasePost([inv]);

    // b) Update local state
    setInvoicesDirectory((prev) =>
      prev.map((item) =>
        item.id === invoiceId || item.invoiceNumber === invoiceId
          ? { ...item, status: 'Posted', is_posted: true, posted: true }
          : item
      )
    );

    // c) Provide feedback
    setStatusNotice(`Invoice #${inv.invoiceNumber} successfully posted to General Ledger!`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const batchPostInvoices = async () => {
    const unposted = invoicesDirectory.filter(
      (inv) => inv.status !== 'Posted' && (inv as any).is_posted !== true && (inv as any).posted !== true
    );
    if (unposted.length === 0) {
      setStatusNotice('No unposted invoices to post.');
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    // a) Await database update
    await executeDatabasePost(unposted);

    // b) Update local state
    setInvoicesDirectory((prev) =>
      prev.map((inv) => ({
        ...inv,
        status: 'Posted',
        is_posted: true,
        posted: true
      }))
    );

    // c) Provide feedback
    setStatusNotice(`All ${unposted.length} unposted invoices successfully posted to General Ledger!`);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleConfirmPost = async () => {
    setIsPostingAction(true);
    if (!invoiceToPost) {
      setIsPostingAll(true);
    }

    try {
      if (invoiceToPost) {
        await postInvoice(invoiceToPost.id || invoiceToPost.invoiceNumber);
      } else {
        await batchPostInvoices();
      }
    } catch (error) {
      console.error('Error posting invoice(s):', error);
      setStatusNotice(`Failed to post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsPostingAction(false);
      setIsPostingAll(false);
      setInvoiceToPost(null);
      setIsConfirmPostAllOpen(false);
    }
  };

  const handleExecutePostAll = handleConfirmPost;

  // --- UNPOST EXECUTION LOGIC (VANGUARD POS LEDGER CONTROL PATTERN) ---
  async function executeDatabaseUnpost(invoice: InvoiceRecord) {
    const isUUID = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const invRef = invoice.invoiceNumber || invoice.id;

    // Trigger authoritative unified toggle-post service for unposting & ledger reversal
    try {
      await toggleDocumentPosting('SALES', invRef, false, 'Unposted by user from Sales workstation');
    } catch (toggleErr) {
      console.warn('Unified toggle-post unpost notice:', toggleErr);
    }

    // 1. Update sales_invoices table in database
    try {
      if (isUUID(invoice.id)) {
        await supabase
          .from('sales_invoices')
          .update({ is_posted: false, status: 'Unposted' })
          .eq('id', invoice.id);
      } else {
        await supabase
          .from('sales_invoices')
          .update({ is_posted: false, status: 'Unposted' })
          .eq('invoice_ref', invRef);
      }
    } catch (err) {
      console.warn('Supabase sales_invoices unpost notice:', err);
    }

    // 2. Update orders table in database if linked
    try {
      if (isUUID(invoice.id)) {
        await supabase
          .from('orders')
          .update({ is_posted: false, status: 'DRAFT' })
          .eq('id', invoice.id);
      } else {
        await supabase
          .from('orders')
          .update({ is_posted: false, status: 'DRAFT' })
          .eq('order_number', invRef);
      }
    } catch (err) {
      console.warn('Supabase orders unpost notice:', err);
    }

    // 3. Synchronize tenant feature_flags and local client cache for unposting
    try {
      const targetTenantId =
        currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-')
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const flags = (tenantData?.feature_flags as Record<string, any>) || {};
      flags.sales_posting_status = flags.sales_posting_status || {};
      flags.sales_posting_status[invRef] = false;
      flags.sales_posting_status[invoice.id] = false;

      if (!Array.isArray(flags.sales_invoices_directory)) {
        flags.sales_invoices_directory = [];
      }
      const dirIdx = flags.sales_invoices_directory.findIndex(
        (item: any) => item.id === invoice.id || item.invoiceNumber === invRef
      );
      const updatedEntry = {
        ...invoice,
        posted: false,
        is_posted: false,
        status: 'Unposted',
        unposted_at: new Date().toISOString(),
      };
      if (dirIdx >= 0) {
        flags.sales_invoices_directory[dirIdx] = updatedEntry;
      } else {
        flags.sales_invoices_directory.push(updatedEntry);
      }

      await supabase
        .from('tenants')
        .update({ feature_flags: flags, updated_at: new Date().toISOString() })
        .eq('id', targetTenantId);

      try {
        const cached = JSON.parse(localStorage.getItem('vanguard_sales_posting_status') || '{}');
        cached[invRef] = false;
        cached[invoice.id] = false;
        localStorage.setItem('vanguard_sales_posting_status', JSON.stringify(cached));
      } catch {}
    } catch (flagErr) {
      console.warn('Feature flags unpost persistence notice:', flagErr);
    }
  };

  const handlePromptUnpost = (inv?: InvoiceRecord) => {
    const target = inv || currentInvoice;
    if (!target) return;
    setInvoiceToUnpost(target);
    setIsConfirmUnpostOpen(true);
  };

  const handleConfirmUnpost = async () => {
    const target = invoiceToUnpost || currentInvoice;
    if (!target) return;

    setIsUnpostingAction(true);
    try {
      // a) Execute mutation in Supabase / data store
      await executeDatabaseUnpost(target);

      // b) Update local state (invoicesDirectory, previewInvoices, currentInvoice)
      const targetId = target.id || target.invoiceNumber;
      setInvoicesDirectory((prev) =>
        prev.map((item) =>
          item.id === targetId || item.invoiceNumber === target.invoiceNumber
            ? { ...item, status: 'Unposted', is_posted: false, posted: false }
            : item
        )
      );

      if (currentInvoice && (currentInvoice.id === targetId || currentInvoice.invoiceNumber === target.invoiceNumber)) {
        setCurrentInvoice((prev) =>
          prev ? { ...prev, status: 'Unposted', is_posted: false, posted: false } : null
        );
      }

      // d) Display toast confirmation
      setStatusNotice('Invoice successfully unposted.');
      setTimeout(() => setStatusNotice(null), 3500);
    } catch (error) {
      console.error('Error unposting invoice:', error);
      setStatusNotice(`Failed to unpost invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsUnpostingAction(false);
      setInvoiceToUnpost(null);
      setIsConfirmUnpostOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-slate-800 font-sans select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 0. AUTHENTIC NAVIGATION SIDEBAR                                           */}
      {/* ========================================================================= */}
      {withSidebar && (
        <div
          className={`${
            sidebarCollapsed ? 'w-14' : 'w-56'
          } bg-white border-r border-border flex flex-col shrink-0 h-full transition-all duration-150 z-30 select-none overflow-hidden`}
        >
          {/* Top Bar: Hamburger on left, Home on right */}
          <div className="h-9 border-b border-border flex items-center justify-between px-3 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {!sidebarCollapsed && (
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
          {!sidebarCollapsed && (
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
                {!sidebarCollapsed && <span>Sales Control</span>}
              </div>
              {!sidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
            </div>

            {/* Operations Center */}
            <div className="mt-1">
              <div className="px-2.5 py-1.5 flex items-center justify-between text-slate-800 hover:bg-slate-50 cursor-pointer font-bold text-[11.5px]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {!sidebarCollapsed && <span>Operations Center</span>}
                </div>
                {!sidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
              </div>

              {!sidebarCollapsed && (
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
                {!sidebarCollapsed && <span>Customer Management</span>}
              </div>
              {!sidebarCollapsed && <ChevronDown className="w-3 h-3 text-primary" />}
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
              alert('Vanguard ERP Video Tutorial: Operations Center -> Sales Invoicing');
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
                          setIsPrintInvoiceModalOpen(true);
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
                          setRecurringModalMode('STORE');
                          setIsRecurringModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Store Recurring
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          setRecurringModalMode('RECALL');
                          setIsRecurringModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Recall Recurring
                      </button>
                    </div>

                    <div className="py-0.5">
                      {salesOptions.allow_customer_pricing && (
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
                      )}
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
                          const activeWorkingDate = invoiceDate || getTodayFormatted();
                          const postedTodayInvoices = invoicesDirectory.filter((inv) =>
                            isInvoicePostedToday(inv, activeWorkingDate)
                          );
                          const allReceipts = Array.from(
                            new Map(
                              [...customerReceipts, ...getCustomerReceipts()].map((r: any) => [
                                r.id || r.receiptNo || JSON.stringify(r),
                                r
                              ])
                            ).values()
                          );
                          const postedTodayReceipts = allReceipts.filter((rct) =>
                            isReceiptPostedToday(rct, activeWorkingDate)
                          );
                          const todayCashMovements = getCashMovements().filter(
                            (m) =>
                              isCashMovementToday(m, activeWorkingDate) &&
                              m.reasonCategory !== 'OPENING_FLOAT' &&
                              m.category !== 'Opening Float'
                          );

                          const totalActivityCount =
                            postedTodayInvoices.length + postedTodayReceipts.length + todayCashMovements.length;

                          if (totalActivityCount === 0) {
                            setIsNoTransactionsModalOpen(true);
                          } else {
                            setIsMainReadingModalOpen(true);
                          }
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                      >
                        Main Reading
                      </button>
                      {salesOptions.allow_import_from_csv && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsDropdownOpen(false);
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = '.csv';
                            fileInput.onchange = (e: any) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setStatusNotice(`CSV "${f.name}" loaded into cart successfully.`);
                                setTimeout(() => setStatusNotice(null), 3500);
                              }
                            };
                            fileInput.click();
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer block text-slate-800"
                        >
                          Import From CSV
                        </button>
                      )}
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
              {!salesOptions.hide_divisions_in_carousel && (
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
              )}

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
                        {(Number(item.price) || 0).toFixed(2)} $
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
            
            {/* Credit Note / Direct Return Header Banner */}
            {docType === 'CREDIT_NOTE' && (
              <div className="bg-red-700 text-white px-3.5 py-2 rounded flex items-center justify-between text-xs font-bold shadow-xs mb-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-red-200" />
                  <span>CREDIT NOTE / RETURN — إشعار دائن / مرتجع مبيعات</span>
                  {parentInvoiceNo && (
                    <span className="bg-red-900 text-red-200 px-2 py-0.5 rounded text-[11px] font-mono">
                      Ref: {parentInvoiceNo}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDocType('SALE');
                    setParentInvoiceNo(null);
                    setInvoiceNumber(generateUniqueInvoiceNumber(invoicesDirectory));
                    setStatusNotice('Switched back to standard Sales Invoice mode.');
                    setTimeout(() => setStatusNotice(null), 2500);
                  }}
                  className="bg-white text-red-700 hover:bg-red-50 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Exit Credit Note Mode
                </button>
              </div>
            )}

            {/* Invoice Number Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {docType === 'CREDIT_NOTE' ? `Credit Note #${invoiceNumber}` : `Invoice #${invoiceNumber}`}
                </span>
                {docType === 'CREDIT_NOTE' && (
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    CREDIT NOTE
                  </span>
                )}
              </div>
            </div>
            
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setIsCustomerDropdownOpen(false);
                          setIsCustomerLookupModalOpen(true);
                        }
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

                              // Apply dynamic Price Waterfall to cart items for this customer ONLY if prices change
                              setCartItems((prev) => {
                                const needsUpdate = prev.some((item) => {
                                  const resolved = resolveItemPriceWaterfall({
                                    itemCode: item.code,
                                    customerId: cust.id,
                                    standardPrice: item.unitPrice,
                                    customerPriceTier: (cust as any).category || 'Retail Counter'
                                  });
                                  const unitPrice = resolved.resolvedPrice > 0 ? resolved.resolvedPrice : item.unitPrice;
                                  return unitPrice !== item.unitPrice;
                                });
                                if (!needsUpdate) return prev;
                                return prev.map((item) => {
                                  const resolved = resolveItemPriceWaterfall({
                                    itemCode: item.code,
                                    customerId: cust.id,
                                    standardPrice: item.unitPrice,
                                    customerPriceTier: (cust as any).category || 'Retail Counter'
                                  });
                                  const unitPrice = resolved.resolvedPrice > 0 ? resolved.resolvedPrice : item.unitPrice;
                                  return {
                                    ...item,
                                    unitPrice,
                                    total: Number((item.qty * unitPrice).toFixed(2))
                                  };
                                });
                              });
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

                {/* Salesman Selector */}
                <div className="flex items-center gap-2">
                  <span className="font-normal text-slate-700 w-16 text-[11px]">Salesman:</span>
                  <div className="flex-1">
                    <select
                      value={invoiceSalesman}
                      onChange={(e) => setInvoiceSalesman(e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-0.5 text-xs text-slate-700 shadow-2xs cursor-pointer"
                    >
                      <option value="Direct Counter">Direct Counter</option>
                      <option value="Mahdi">Mahdi</option>
                      <option value="Hiba Aloulou">Hiba Aloulou</option>
                      <option value="HUSSEIN">HUSSEIN</option>
                      <option value="Ricky">Ricky</option>
                      {invoiceSalesman && !['Direct Counter', 'Mahdi', 'Hiba Aloulou', 'HUSSEIN', 'Ricky'].includes(invoiceSalesman) && (
                        <option value={invoiceSalesman}>{invoiceSalesman}</option>
                      )}
                    </select>
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
                      className="w-full bg-white border border-border rounded px-2 py-0.5 text-xs text-slate-700 shadow-2xs cursor-pointer"
                    >
                      <option value="Providers">Providers (Default / Unassigned)</option>
                      {deliveredBy && deliveredBy !== 'Providers' && !deliveryProviders.some((p) => (p.status === 'Active Carrier' || (p as any).active !== false) && p.name === deliveredBy) && (
                        <option value={deliveredBy}>{deliveredBy}</option>
                      )}
                      {deliveryProviders
                        .filter((provider) => provider.status === 'Active Carrier' || (provider as any).active !== false)
                        .map((provider) => (
                          <option key={provider.id || provider.name} value={provider.name}>
                            {provider.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddProviderModalOpen(true)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white p-1 rounded shrink-0 cursor-pointer transition-colors"
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
                  {salesOptions.show_location_in_details && (
                    <th className="py-2 px-2 text-left font-medium w-24">Location</th>
                  )}
                  {salesOptions.select_salesman_per_item && (
                    <th className="py-2 px-2 text-left font-medium w-24">Salesman</th>
                  )}
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
                        {(Number(item.total) || 0).toFixed(2)} $
                      </td>
                      {salesOptions.show_location_in_details && (
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
                            <option value="Southern Olive and Oil Products - Main">Southern Olive and Oil Products - Main</option>
                          </select>
                        </td>
                      )}
                      {salesOptions.select_salesman_per_item && (
                        <td className="py-2 px-2 text-left">
                          <input
                            type="text"
                            value={item.salesman || invoiceSalesman || 'Direct Counter'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCartItems((prev) =>
                                prev.map((p) => (p.id === item.id ? { ...p, salesman: val } : p))
                              );
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] font-normal text-slate-700 shadow-2xs"
                          />
                        </td>
                      )}
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

            {/* Right Action Buttons: Unpost (Danger) | Save (Orange) & Save & Post (Green) */}
            <div className="flex items-center gap-2">
              
              {/* Unpost Button (Danger Theme) - Active when loaded invoice is posted */}
              {isCurrentInvoicePosted ? (
                <button
                  type="button"
                  onClick={() => handlePromptUnpost(currentInvoice || undefined)}
                  className="py-1.5 px-4 rounded text-xs text-white font-semibold shadow-2xs transition-colors flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 cursor-pointer"
                  title="Unpost this invoice to unlock transaction for modification"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unpost</span>
                </button>
              ) : null}

              {/* Save Button (Orange #fb8205) - Disabled when posted */}
              <button
                type="button"
                onClick={() => {
                  if (isCurrentInvoicePosted) return;
                  handleSaveInvoice(false);
                }}
                disabled={cartItems.length === 0 || isCurrentInvoicePosted || salesOptions.disable_sales_save_button}
                className={`py-1.5 px-4 rounded text-xs text-white font-medium shadow-2xs transition-colors flex items-center gap-1 ${
                  isCurrentInvoicePosted || salesOptions.disable_sales_save_button
                    ? 'bg-slate-400 opacity-50 cursor-not-allowed'
                    : cartItems.length === 0
                    ? 'bg-amber-600/60 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                }`}
                title={salesOptions.disable_sales_save_button ? 'Saving invoices is disabled in Sales Options' : isCurrentInvoicePosted ? 'Cannot edit posted ledger transaction. Unpost first.' : 'Save Draft'}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {/* Save & Post Button (Green #1e3a2b / #15803d) - Disabled when posted */}
              <button
                type="button"
                onClick={() => {
                  if (isCurrentInvoicePosted) return;
                  handleSaveInvoice(true);
                }}
                disabled={cartItems.length === 0 || isCurrentInvoicePosted}
                className={`py-1.5 px-4 rounded text-xs text-white font-medium shadow-2xs transition-colors flex items-center gap-1 ${
                  isCurrentInvoicePosted
                    ? 'bg-primary/40 opacity-50 cursor-not-allowed'
                    : cartItems.length === 0
                    ? 'bg-primary/60 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 cursor-pointer'
                }`}
                title={isCurrentInvoicePosted ? 'Invoice is already posted.' : 'Save and Post to General Ledger'}
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
      {/* 3. AUTHENTIC PAYMENT MODAL                                                */}
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
                  <span className="text-slate-900 font-bold">{(Number(grandTotal) || 0).toFixed(2)} USD</span>
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
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-semibold">{p.type}</span>
                            {p.cardholderName && (
                              <span className="text-[10px] text-slate-500">
                                {p.cardholderName} {p.cardNumber ? `(•••• ${p.cardNumber.slice(-4)})` : ''}
                              </span>
                            )}
                            {p.whishSenderPhone && (
                              <span className="text-[10px] text-purple-700 font-mono">
                                Whish: {p.whishSenderPhone}
                              </span>
                            )}
                            {p.checkNumber && (
                              <span className="text-[10px] text-blue-700 font-mono">
                                Cheque #{p.checkNumber}
                              </span>
                            )}
                            {p.companyAccountName && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Settled to: {p.companyAccountName} {p.companyAccountNumber ? `(${p.companyAccountNumber})` : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <span>{(Number(p.amount) || 0).toFixed(2)} USD</span>
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

                {/* Conditional Settlement Details for Selected Payment Type */}
                {(selectedPaymentType.includes('Visa') || selectedPaymentType.includes('Card')) && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5 space-y-2">
                    <div className="font-bold text-[11px] text-amber-900 flex items-center justify-between">
                      <span>Cardholder & POS Terminal Settlement</span>
                      <span className="text-[10px] font-mono text-amber-800">
                        Merchant POS ({(selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD'})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Cardholder Name:</span>
                        <input
                          type="text"
                          value={salesCardholderName}
                          onChange={(e) => setSalesCardholderName(e.target.value)}
                          placeholder="Name on card"
                          className="w-full bg-white border border-amber-200 rounded px-2 py-0.5 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Card Number / Digits:</span>
                        <input
                          type="text"
                          value={salesCardNumber}
                          onChange={(e) => setSalesCardNumber(e.target.value)}
                          placeholder="e.g. •••• 4242"
                          className="w-full bg-white border border-amber-200 rounded px-2 py-0.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Issuing Bank:</span>
                        <input
                          type="text"
                          value={salesCardBank}
                          onChange={(e) => setSalesCardBank(e.target.value)}
                          placeholder="e.g. BLOM Bank"
                          className="w-full bg-white border border-amber-200 rounded px-2 py-0.5 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Receiving Bank Account:</span>
                        <input
                          type="text"
                          list="sales-card-banks-list"
                          value={salesCardCompanyBankName}
                          onChange={(e) => handleSalesCardBankNameChange(e.target.value)}
                          placeholder="e.g. BLOM Bank, Bank Audi, BOB..."
                          className="w-full bg-white border border-amber-200 rounded px-2 py-0.5 text-xs font-medium"
                        />
                        <datalist id="sales-card-banks-list">
                          {salesCompanyBankAccounts.map((b) => (
                            <option key={b.id} value={b.accountName}>
                              {b.accountNumber ? `${b.accountName} (${b.accountNumber})` : b.accountName}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>
                    {/* Inline editable Account / IBAN */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-amber-200/60">
                      <span className="text-[10px] font-semibold text-amber-900 shrink-0">Company Receiving IBAN / Account #:</span>
                      <input
                        type="text"
                        value={salesCardAccountNumber}
                        onChange={(e) => setSalesCardAccountNumber(e.target.value)}
                        onBlur={() => handleSaveSalesCardAccount()}
                        className="flex-1 bg-white border border-amber-200 rounded px-1.5 py-0.5 text-[11px] font-mono"
                        placeholder="Enter Account / IBAN..."
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSalesCardAccount()}
                        className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                        title="Save Account / IBAN globally for this currency"
                      >
                        Save Account #
                      </button>
                    </div>
                  </div>
                )}

                {(selectedPaymentType.includes('Whish') || selectedPaymentType.includes('OMT')) && (
                  <div className="bg-purple-50/70 border border-purple-200 rounded p-2.5 space-y-2">
                    <div className="font-bold text-[11px] text-purple-900 flex items-center justify-between">
                      <span>Whish Money Digital Settlement</span>
                      <span className="text-[10px] font-mono text-purple-800">
                        Wallet ({(selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD'})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Customer Whish Phone:</span>
                        <input
                          type="text"
                          value={salesWhishSenderPhone}
                          onChange={(e) => setSalesWhishSenderPhone(e.target.value)}
                          placeholder="e.g. 03-123456"
                          className="w-full bg-white border border-purple-200 rounded px-2 py-0.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Receiving Wallet:</span>
                        <input
                          type="text"
                          list="sales-whish-wallets-list"
                          value={salesWhishCompanyWalletName}
                          onChange={(e) => handleSalesWhishWalletNameChange(e.target.value)}
                          placeholder="e.g. Whish Money Merchant Wallet"
                          className="w-full bg-white border border-purple-200 rounded px-2 py-0.5 text-xs font-medium"
                        />
                        <datalist id="sales-whish-wallets-list">
                          {salesCompanyWhishAccounts.map((w) => (
                            <option key={w.id} value={w.walletName}>
                              {w.accountNumber ? `${w.walletName} (${w.accountNumber})` : w.walletName}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>
                    {/* Inline editable Whish Wallet # */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-purple-200/60">
                      <span className="text-[10px] font-semibold text-purple-900 shrink-0">Company Whish Wallet / Phone #:</span>
                      <input
                        type="text"
                        value={salesWhishAccountNumber}
                        onChange={(e) => setSalesWhishAccountNumber(e.target.value)}
                        onBlur={() => handleSaveSalesWhishAccount()}
                        className="flex-1 bg-white border border-purple-200 rounded px-1.5 py-0.5 text-[11px] font-mono"
                        placeholder="Enter Whish wallet #..."
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSalesWhishAccount()}
                        className="px-2 py-0.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                        title="Save Whish wallet # globally for this currency"
                      >
                        Save Whish #
                      </button>
                    </div>
                  </div>
                )}

                {(selectedPaymentType.includes('Check') || selectedPaymentType.includes('Cheque')) && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded p-2.5 space-y-2">
                    <div className="font-bold text-[11px] text-blue-900 flex items-center justify-between">
                      <span>Bank Cheque Clearance</span>
                      <span className="text-[10px] font-mono text-blue-800">
                        Commercial Cheque ({(selectedPaymentType.includes('LBP') || currency === 'LBP') ? 'LBP' : 'USD'})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Cheque Number:</span>
                        <input
                          type="text"
                          value={salesCheckNumber}
                          onChange={(e) => setSalesCheckNumber(e.target.value)}
                          placeholder="e.g. CHK-12345"
                          className="w-full bg-white border border-blue-200 rounded px-2 py-0.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Issuing Bank:</span>
                        <input
                          type="text"
                          value={salesCheckIssuingBank}
                          onChange={(e) => setSalesCheckIssuingBank(e.target.value)}
                          placeholder="e.g. Byblos Bank"
                          className="w-full bg-white border border-blue-200 rounded px-2 py-0.5 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Receiving Bank Account:</span>
                        <input
                          type="text"
                          list="sales-check-banks-list"
                          value={salesCheckCompanyBankName}
                          onChange={(e) => handleSalesCheckBankNameChange(e.target.value)}
                          placeholder="e.g. BLOM Bank S.A.L."
                          className="w-full bg-white border border-blue-200 rounded px-2 py-0.5 text-xs font-medium"
                        />
                        <datalist id="sales-check-banks-list">
                          {salesCompanyBankAccounts.map((b) => (
                            <option key={b.id} value={b.accountName}>
                              {b.accountNumber ? `${b.accountName} (${b.accountNumber})` : b.accountName}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>
                    {/* Inline editable Account / IBAN */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-blue-200/60">
                      <span className="text-[10px] font-semibold text-blue-900 shrink-0">Company Receiving IBAN / Account #:</span>
                      <input
                        type="text"
                        value={salesCheckAccountNumber}
                        onChange={(e) => setSalesCheckAccountNumber(e.target.value)}
                        onBlur={() => handleSaveSalesCheckAccount()}
                        className="flex-1 bg-white border border-blue-200 rounded px-1.5 py-0.5 text-[11px] font-mono"
                        placeholder="Enter Account / IBAN..."
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSalesCheckAccount()}
                        className="px-2 py-0.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer shadow-2xs"
                        title="Save Account / IBAN globally for this currency"
                      >
                        Save Account #
                      </button>
                    </div>
                  </div>
                )}

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
                        onClick={() => setPaymentAmountInput((Number(amt) || 0).toFixed(2))}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-2 py-0.5 rounded text-[11px] shadow-2xs cursor-pointer"
                      >
                        ${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPaymentAmountInput((Number(remainingBalance) || 0).toFixed(2))}
                      className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs cursor-pointer"
                    >
                      Exact
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-700">Total Payments:</span>
                    <span className="text-slate-900">{(Number(totalPaid) || 0).toFixed(2)} USD</span>
                  </div>
                  {remainingBalance > 0 ? (
                    <div className="flex items-center justify-between font-bold text-red-600">
                      <span>Remaining Amount:</span>
                      <span>{(Number(remainingBalance) || 0).toFixed(2)} USD</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between font-bold text-emerald-600">
                      <span>Change:</span>
                      <span>{(Number(changeDue) || 0).toFixed(2)} USD</span>
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
                onClick={() => printElementById('printable-sales-report', 'Sales Report')}
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
            <div id="printable-sales-report" className="printable-document vanguard-printable bg-white border border-slate-300 shadow-xl rounded-sm w-full max-w-[850px] p-8 text-slate-800 font-sans space-y-6">
              {/* Standardized 3-Zone Corporate Header */}
              <Corporate3ZoneHeader
                documentTitle={previewSalesFilter === 'Quotations' ? 'SALES QUOTATION' : 'SALES INVOICE'}
                voucherCode={reportTargetInvoice?.invoiceNumber || invoiceNumber}
                voucherLabel="Invoice #"
                transactionDate={reportTargetInvoice?.date || '10-Sep-2026'}
                refNumber={reportTargetInvoice?.refNumber || reportTargetInvoice?.reference || (reportTargetInvoice ? reportTargetInvoice.refCode : invoiceReferenceNumber) || '—'}
                hideStatusBadge={true}
                facilityName="Facility: [1300-01] Main"
              />

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
                  <div className="text-slate-500">Salesman: {reportTargetInvoice?.salesman || invoiceSalesman || 'Direct Counter'}</div>
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
                        {(Number(item.unitPrice || item.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-bold text-blue-950">
                        {(Number(item.total || (item.qty || 1) * (item.unitPrice || 0))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300">Subtotal ({currency}):</td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono">
                      {(Number(subtotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300">
                      {isTaxExempt ? 'Tax (Exempt 0%):' : 'Tax (11% VAT):'}
                    </td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono">
                      {(Number(tax) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 text-sm font-black">
                    <td colSpan={6} className="py-2 px-3 text-right border border-slate-300 text-blue-900">Grand Total ({currency}):</td>
                    <td className="py-2 px-3 text-right border border-slate-300 font-mono text-blue-900 font-bold">
                      {(Number(grandTotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Custom Sales Report Footer */}
              {salesOptions.sales_report_footer && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 whitespace-pre-line text-center font-medium">
                  {salesOptions.sales_report_footer}
                </div>
              )}

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

              {/* Standardized Corporate Footer */}
              <CorporatePrintableFooter voucherCode={reportTargetInvoice?.invoiceNumber || invoiceNumber} />
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
                    <td className="p-2 text-slate-500">Southern Olive and Oil Products - Main</td>
                    <td className="p-2 text-right font-mono font-semibold">134.50</td>
                    <td className="p-2 text-right font-mono text-amber-700">12.00</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-700">122.50</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Main Branch</td>
                    <td className="p-2 text-slate-500">Southern Olive and Oil Products - Main</td>
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

              {/* Row 2: 6 Searchable Dropdowns */}
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
                      {previewSalesFilter !== 'Quotations' && hasUnpostedInvoices ? (
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
                  {/* Total Summary Row */}
                  <tr className="bg-slate-50 font-bold border-b border-slate-200 text-xs text-slate-800">
                    <td colSpan={10} className="py-2.5 px-3">
                      Total:
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                      {(Number(previewTotals?.discountTotal) || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                      {(Number(previewTotals?.taxTotal) || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                      {(Number(previewTotals?.netLL) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        {inv.company && inv.company !== '-' ? inv.company : 'Walk-in Cash Customer'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.salesman || 'Direct Counter'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.createdBy || 'Vanguard Operator'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.source || 'Inventory'}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-700">
                        {inv.refNumber || ''}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {(Number(inv.discount) || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {(Number(inv.tax) || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-primary">
                        {(Number(inv.grandTotal) || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {inv.currency}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {((inv as any).is_posted === true || inv.status === 'Posted' || (inv as any).posted === true) ? (
                          <button
                            type="button"
                            onClick={() => handlePromptUnpost(inv)}
                            className="bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-800 border border-emerald-300 hover:border-rose-300 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 group"
                            title="Posted to GL — Click to Unpost"
                          >
                            <Check className="w-3 h-3 text-emerald-600 group-hover:hidden" />
                            <Unlock className="w-3 h-3 text-rose-600 hidden group-hover:inline" />
                            <span className="group-hover:hidden">Posted</span>
                            <span className="hidden group-hover:inline">Unpost</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePromptPostSingleInvoice(inv)}
                            className="bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 border border-amber-300 hover:border-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                            title="Click to post this invoice"
                          >
                            <span>Unposted</span>
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {((inv as any).is_posted === true || inv.status === 'Posted' || (inv as any).posted === true) ? (
                            <button
                              type="button"
                              onClick={() => handlePromptUnpost(inv)}
                              className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded cursor-pointer shadow-2xs transition-colors"
                              title="Unpost Invoice (Unlock for Editing)"
                            >
                              <Unlock className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePromptPostSingleInvoice(inv)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded cursor-pointer shadow-2xs transition-colors"
                              title="Post Invoice to GL"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}
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

            {/* Confirmation Dialog for Posting (Single Invoice or Post All) */}
            {isConfirmPostAllOpen && (
              <div className="fixed inset-0 z-60 bg-black/25 flex items-start justify-center pt-8 animate-fade-in">
                <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-md p-5 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="pr-4">
                      <p className="text-sm font-medium text-slate-800">
                        {invoiceToPost
                          ? `Are you sure you want to post invoice #${invoiceToPost.invoiceNumber}?`
                          : 'Are you sure you want to post all sales transactions?'}
                      </p>
                      {invoiceToPost ? (
                        <p className="text-xs text-slate-500 mt-1">
                          Customer: <span className="font-medium text-slate-700">{invoiceToPost.customerName}</span> • Total:{' '}
                          <span className="font-semibold text-primary">${(Number(invoiceToPost.grandTotal) || 0).toFixed(2)} {invoiceToPost.currency}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">
                          All unposted sales invoices will be committed to the General Ledger and stock deducted.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isPostingAction || isPostingAll}
                      onClick={() => {
                        setIsConfirmPostAllOpen(false);
                        setInvoiceToPost(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 text-base font-light cursor-pointer disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      type="button"
                      disabled={isPostingAction || isPostingAll}
                      onClick={() => {
                        setIsConfirmPostAllOpen(false);
                        setInvoiceToPost(null);
                      }}
                      className="text-slate-600 hover:text-slate-800 text-xs font-medium px-3 py-1 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isPostingAction || isPostingAll}
                      onClick={handleConfirmPost}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {(isPostingAction || isPostingAll) ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Yes, Post</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INVOICE INFO MODAL                                                     */}
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
      {/* 6. PENDING QUOTATIONS MODAL                                              */}
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
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">${(Number(q.amount) || 0).toFixed(2)}</td>
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
      {/* 7. SETTINGS MODAL (FULL SALES OPTIONS & INVOICE SETUP)                   */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <SalesOptionsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentOptions={salesOptions}
          onSaveSuccess={(updated) => setSalesOptions(updated)}
          tenantId={currentTenant?.id}
          branchOptions={BRANCH_OPTIONS}
          paymentTypeOptions={PAYMENT_TYPES}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. PRINT INVOICE MODAL                                                    */}
      {/* ========================================================================= */}
      <div
        className={
          isPrintInvoiceModalOpen
            ? 'fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in'
            : 'fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden w-[850px] max-w-[850px] z-[-100]'
        }
        aria-hidden={!isPrintInvoiceModalOpen}
      >
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
            <div id="printable-sales-invoice" className="printable-document vanguard-printable bg-white p-6 rounded shadow-sm border border-slate-200 space-y-4">
              {/* Standardized 3-Zone Corporate Header */}
              <Corporate3ZoneHeader
                documentTitle={
                  targetPrintInvoice?.docType === 'CREDIT_NOTE'
                    ? 'CREDIT NOTE / إشعار دائن'
                    : salesOptions.invoice_language === 'ar'
                      ? 'فاتورة مبيعات'
                      : salesOptions.invoice_language === 'bilingual'
                        ? 'SALES INVOICE / فاتورة مبيعات'
                        : 'SALES INVOICE'
                }
                voucherCode={targetPrintInvoice?.invoiceNumber || invoiceNumber}
                voucherLabel={
                  targetPrintInvoice?.docType === 'CREDIT_NOTE'
                    ? 'Credit Note #'
                    : salesOptions.invoice_language === 'ar'
                      ? 'رقم الفاتورة'
                      : 'Invoice #'
                }
                transactionDate={targetPrintInvoice?.date || invoiceDate}
                refNumber={targetPrintInvoice?.refNumber || targetPrintInvoice?.reference || currentInvoice?.refNumber || currentInvoice?.reference || invoiceReferenceNumber || '—'}
                hideStatusBadge={true}
                facilityName={targetPrintInvoice?.branch || BRANCH_OPTIONS.find(b => b.id === selectedBranch)?.name || 'Facility: [1300-01] Main'}
              />

              {/* Optional Branch Address & Payment Info Banners */}
              {salesOptions.show_branch_address && (
                <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  Branch: {targetPrintInvoice?.branch || BRANCH_OPTIONS.find(b => b.id === selectedBranch)?.name || 'Southern Olive and Oil Products S.A.R.L.'} • Nabatieh Industrial Blvd, South Lebanon
                </div>
              )}

              {salesOptions.show_branch_payment_info && (() => {
                const invCurr = targetPrintInvoice?.currency || currency || 'USD';
                const bankInfo = getSavedSettlementAccount('BANK', invCurr);
                const whishInfo = getSavedSettlementAccount('WHISH', invCurr);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[10px] text-slate-700 flex justify-between">
                    <span><strong>Bank Payment ({invCurr}):</strong> {bankInfo.name} {bankInfo.accountNumber ? `(IBAN: ${bankInfo.accountNumber})` : ''}</span>
                    <span><strong>OMT / Whish ({invCurr}):</strong> {whishInfo.accountNumber ? `${whishInfo.accountNumber} (${whishInfo.name})` : whishInfo.name}</span>
                  </div>
                );
              })()}

              {/* Customer Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bill To:</span>
                  <p className="font-bold text-slate-800 text-sm">{targetPrintInvoice?.customerName || selectedCustomer.name}</p>
                  <p className="text-slate-600 text-[11px]">{targetPrintInvoice?.customerAddress || selectedCustomer.address}</p>
                  {salesOptions.show_delivery_provider_info && (targetPrintInvoice?.deliveredBy || deliveredBy) && (
                    <p className="text-slate-500 text-[10px] mt-1">Delivery Provider: <span className="font-semibold text-slate-700">{targetPrintInvoice?.deliveredBy || deliveredBy}</span></p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Details:</span>
                  <p className="text-slate-700">Currency: <span className="font-semibold">{targetPrintInvoice?.currency || currency}</span></p>
                  <p className="text-slate-700">Payment: <span className="font-semibold">{targetPrintInvoice?.transactionType || transactionType}</span></p>
                  <p className="text-slate-500 text-[10px]">Salesman: <span className="font-semibold text-slate-700">{targetPrintInvoice?.salesman || invoiceSalesman || 'Direct Counter'}</span></p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-2 px-2.5">Item Description</th>
                    {salesOptions.show_barcode_on_invoice && (
                      <th className="py-2 px-2 font-mono text-[10px]">Barcode / Code</th>
                    )}
                    <th className="py-2 px-2 text-center">Unit</th>
                    <th className="py-2 px-2 text-right">Qty</th>
                    <th className="py-2 px-2 text-right">Price</th>
                    <th className="py-2 px-2.5 text-right">Total ({targetPrintInvoice?.currency || currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((targetPrintInvoice?.items && targetPrintInvoice.items.length > 0) ? targetPrintInvoice.items : (cartItems.length > 0 ? cartItems : [
                    { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 2, unitPrice: 115.00, total: 230.00 },
                    { id: '2', code: 'CWV250MLB103', name: 'White Vinegar 250ml', unit: 'BOT', qty: 12, unitPrice: 0.50, total: 6.00 }
                  ])).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                      </td>
                      {salesOptions.show_barcode_on_invoice && (
                        <td className="py-2 px-2 font-mono text-[10px] text-slate-500">{item.code}</td>
                      )}
                      <td className="py-2 px-2 text-center text-slate-600">{item.unit}</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-800">{item.qty}</td>
                      <td className="py-2 px-2 text-right text-slate-600">${Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900">${Number(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Summary */}
              <div className="border-t border-slate-300 pt-3 flex justify-between items-start">
                <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
                  {salesOptions.show_message_on_invoice && (
                    <>
                      <p className="font-semibold text-slate-700">Payment Terms & Conditions:</p>
                      <p>Goods received in good condition. All returns subject to inspection within 7 days.</p>
                    </>
                  )}
                </div>
                <div className="w-56 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold font-mono">${Number(targetPrintInvoice?.subtotal !== undefined ? targetPrintInvoice.subtotal : (cartItems.length > 0 ? subtotal : 236.00)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-semibold font-mono">${Number(targetPrintInvoice?.discount !== undefined ? targetPrintInvoice.discount : discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{isTaxExempt ? 'Tax (Exempt 0%):' : 'Tax (VAT 11%):'}</span>
                    <span className="font-semibold font-mono">${Number(targetPrintInvoice?.tax !== undefined ? targetPrintInvoice.tax : tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700 font-mono">${Number(targetPrintInvoice?.grandTotal !== undefined ? targetPrintInvoice.grandTotal : (cartItems.length > 0 ? grandTotal : 236.00)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Custom Sales Report Footer */}
              {salesOptions.sales_report_footer && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 whitespace-pre-line text-center font-medium">
                  {salesOptions.sales_report_footer}
                </div>
              )}

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

              {/* Standardized Corporate Footer */}
              <CorporatePrintableFooter voucherCode={targetPrintInvoice?.invoiceNumber || invoiceNumber} />
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
                  printElementById('printable-sales-invoice', 'Sales Invoice');
                  setIsPrintInvoiceModalOpen(false);
                  setStatusNotice(`Invoice #${(targetPrintInvoice?.invoiceNumber || invoiceNumber).replace(/^INV-/i, '')} sent to printer!`);
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

      {/* ========================================================================= */}
      {/* 9. PRINT DELIVERY NOTE MODAL                                              */}
      {/* ========================================================================= */}
      <div
        className={
          isDeliveryNoteModalOpen
            ? 'fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in'
            : 'fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden w-[850px] max-w-[850px] z-[-100]'
        }
        aria-hidden={!isDeliveryNoteModalOpen}
      >
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
            <div id="printable-delivery-note" className="printable-document vanguard-printable bg-white p-6 rounded shadow-sm border border-slate-200 space-y-4">
              {/* Standardized 3-Zone Corporate Header */}
              {(() => {
                const cleanInv = cleanDocumentNumber(targetPrintInvoice?.invoiceNumber || invoiceNumber);
                const delivCode = cleanInv.startsWith('0') && cleanInv.length === 7 ? '2' + cleanInv.slice(1) : peekNextDocNumber('DELIVERY_NOTE');
                return (
                  <Corporate3ZoneHeader
                    documentTitle="DELIVERY NOTE"
                    voucherCode={delivCode}
                    transactionDate={targetPrintInvoice?.deliveryDate || targetPrintInvoice?.date || deliveryDate}
                    refNumber={targetPrintInvoice?.refNumber || targetPrintInvoice?.reference || currentInvoice?.refNumber || currentInvoice?.reference || invoiceReferenceNumber || '—'}
                    status="DISPATCHED"
                    facilityName={targetPrintInvoice?.branch || BRANCH_OPTIONS.find(b => b.id === selectedBranch)?.name || 'Facility: [1300-01] Main'}
                  />
                );
              })()}

              <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Destination:</span>
                  <p className="font-bold text-slate-800 text-sm">{targetPrintInvoice?.customerName || selectedCustomer.name}</p>
                  <p className="text-slate-600 text-[11px]">{targetPrintInvoice?.customerAddress || selectedCustomer.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carrier / Driver:</span>
                  <p className="font-semibold text-slate-800">{targetPrintInvoice?.deliveredBy || deliveredBy}</p>
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
                  {((targetPrintInvoice?.items && targetPrintInvoice.items.length > 0) ? targetPrintInvoice.items : (cartItems.length > 0 ? cartItems : [
                    { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 2, total: 230.00 },
                    { id: '2', code: 'CWV250MLB103', name: 'White Vinegar 250ml', unit: 'BOT', qty: 12, total: 6.00 }
                  ])).map((item: any, idx: number) => (
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

              {/* Standardized Corporate Footer */}
              {(() => {
                const cleanInv = cleanDocumentNumber(targetPrintInvoice?.invoiceNumber || invoiceNumber);
                const delivCode = cleanInv.startsWith('0') && cleanInv.length === 7 ? '2' + cleanInv.slice(1) : peekNextDocNumber('DELIVERY_NOTE');
                return <CorporatePrintableFooter voucherCode={delivCode} />;
              })()}
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
                  printElementById('printable-delivery-note', 'Delivery Note');
                  setIsDeliveryNoteModalOpen(false);
                  const cleanInv = cleanDocumentNumber(targetPrintInvoice?.invoiceNumber || invoiceNumber);
                  const delivCode = cleanInv.startsWith('0') && cleanInv.length === 7 ? '2' + cleanInv.slice(1) : peekNextDocNumber('DELIVERY_NOTE');
                  setStatusNotice(`Delivery Note #${delivCode} printed.`);
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

      {/* ========================================================================= */}
      {/* 9b. ADD DELIVERY PROVIDER MODAL                                           */}
      {/* ========================================================================= */}
      {isAddProviderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-border w-full max-w-md overflow-hidden flex flex-col text-xs font-sans">
            {/* Modal Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Add Delivery Provider & Carrier</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddProviderModalOpen(false);
                  setNewProviderName('');
                  setNewProviderPhone('');
                  setNewProviderClassification('3PL_EXPRESS');
                  setNewProviderContactPerson('');
                  setNewProviderStatus('Active Carrier');
                  setNewProviderNotes('');
                }}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5 bg-slate-50 text-slate-800">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Provider / Carrier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                  placeholder="e.g. SuperSonic Fleet, Aramex Lebanon, DHL Express"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary shadow-2xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveDeliveryProvider();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newProviderClassification}
                  onChange={(e) => setNewProviderClassification(e.target.value as DeliveryProviderClassification)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
                >
                  <option value="INTERNAL_FLEET">Internal Fleet Management (Dedicated In-House)</option>
                  <option value="3PL_EXPRESS">3PL Express Courier & Logistics</option>
                  <option value="AGGREGATOR">Logistics Aggregator (Multi-carrier Broker)</option>
                  <option value="DIRECT">Direct Counter / Customer Pickup</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Person / Dispatch Officer (Optional)
                </label>
                <input
                  type="text"
                  value={newProviderContactPerson}
                  onChange={(e) => setNewProviderContactPerson(e.target.value)}
                  placeholder="e.g. Tony Khoury (Lead Driver)"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={newProviderPhone}
                  onChange={(e) => setNewProviderPhone(e.target.value)}
                  placeholder="e.g. +961 71 332 901"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary shadow-2xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Carrier Status
                </label>
                <select
                  value={newProviderStatus}
                  onChange={(e) => setNewProviderStatus(e.target.value as 'Active Carrier' | 'Inactive')}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
                >
                  <option value="Active Carrier">Active Carrier</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddProviderModalOpen(false);
                  setNewProviderName('');
                  setNewProviderPhone('');
                  setNewProviderClassification('3PL_EXPRESS');
                  setNewProviderContactPerson('');
                  setNewProviderStatus('Active Carrier');
                  setNewProviderNotes('');
                }}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingProvider || !newProviderName.trim()}
                onClick={handleSaveDeliveryProvider}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingProvider ? 'Saving...' : 'Save Provider'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. CREDIT NOTE MODAL (UNIFIED COMPONENT)                                 */}
      {/* ========================================================================= */}
      {isCreditNoteModalOpen && (
        <CreditNoteModal
          isOpen={isCreditNoteModalOpen}
          onClose={() => setIsCreditNoteModalOpen(false)}
          invoices={invoicesDirectory}
          activeCustomer={selectedCustomer}
          customers={CUSTOMER_PRESETS}
          catalogItems={VANGUARD_SALES_ITEMS}
          currentCartItems={cartItems}
          tenantId={currentTenant?.id}
          onCreditNotePosted={(crn) => {
            setInvoicesDirectory((prev) => [
              crn as any,
              ...prev.filter((i) => i.id !== crn.id && i.invoiceNumber !== crn.invoiceNumber)
            ]);
            setStatusNotice(`Credit Note ${crn.invoiceNumber} posted!`);
            setTimeout(() => setStatusNotice(null), 3500);
          }}
          onSwitchToDirectMode={handleSwitchToDirectCreditNoteMode}
        />
      )}

      {/* ========================================================================= */}
      {/* 11 & 12. RECURRING INVOICES MODAL (STORE & RECALL UNIFIED COMPONENT)      */}
      {/* ========================================================================= */}
      {(isRecurringModalOpen || isStoreRecurringModalOpen || isRecallRecurringModalOpen) && (
        <RecurringInvoicesModal
          isOpen={isRecurringModalOpen || isStoreRecurringModalOpen || isRecallRecurringModalOpen}
          onClose={() => {
            setIsRecurringModalOpen(false);
            setIsStoreRecurringModalOpen(false);
            setIsRecallRecurringModalOpen(false);
          }}
          initialMode={isStoreRecurringModalOpen ? 'STORE' : isRecallRecurringModalOpen ? 'RECALL' : recurringModalMode}
          activeCustomer={selectedCustomer}
          customers={CUSTOMER_PRESETS}
          currentCartItems={cartItems}
          activeGrandTotal={grandTotal}
          currency={currency}
          transactionType={transactionType}
          deliveredBy={deliveredBy}
          salesman={invoiceSalesman}
          tenantId={currentTenant?.id}
          onLoadTemplate={handleLoadRecurringTemplate}
        />
      )}

      {/* ========================================================================= */}
      {/* 13. CUSTOMER PRICING MODAL (UNIFIED COMPONENT)                            */}
      {/* ========================================================================= */}
      {isCustomerPricingModalOpen && (
        <CustomerPricingModal
          isOpen={isCustomerPricingModalOpen}
          onClose={() => setIsCustomerPricingModalOpen(false)}
          activeCustomer={selectedCustomer}
          customers={CUSTOMER_PRESETS}
          invoicesDirectory={invoicesDirectory}
          catalogItems={VANGUARD_SALES_ITEMS}
          tenantId={currentTenant?.id}
          onApplyRatesToCart={(rates: Record<string, number>) => {
            setCartItems((prev) =>
              prev.map((item) => {
                if (rates[item.code] !== undefined) {
                  const p = rates[item.code];
                  return {
                    ...item,
                    unitPrice: p,
                    total: Number((item.qty * p).toFixed(2))
                  };
                }
                return item;
              })
            );
            setStatusNotice('Negotiated contract rates applied to active bill.');
            setTimeout(() => setStatusNotice(null), 3000);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 14. CUSTOMER AGED RECEIVABLES MODAL (UNIFIED COMPONENT)                   */}
      {/* ========================================================================= */}
      {isCustomerAgedModalOpen && (
        <CustomerAgedModal
          isOpen={isCustomerAgedModalOpen}
          onClose={() => setIsCustomerAgedModalOpen(false)}
          invoices={invoicesDirectory}
          activeCustomer={selectedCustomer}
          tenantId={currentTenant?.id}
          onSelectCustomerForReceipt={(cust: any) => {
            setSelectedCustomer(cust);
            setIsCustomerReceiptsModalOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 15. CUSTOMER RECEIPTS & VOUCHERS MODAL (UNIFIED COMPONENT)                */}
      {/* ========================================================================= */}
      {isCustomerReceiptsModalOpen && (
        <CustomerReceiptsModal
          isOpen={isCustomerReceiptsModalOpen}
          onClose={() => setIsCustomerReceiptsModalOpen(false)}
          invoicesDirectory={invoicesDirectory}
          activeCustomer={selectedCustomer}
          customers={CUSTOMER_PRESETS.filter((c) => c.name)}
          tenantId={currentTenant?.id}
          cashierName={profile?.name || invoiceSalesman || 'Active Cashier'}
          onInvoicesUpdated={(updated) => {
            setInvoicesDirectory(updated);
          }}
          onReceiptRecorded={(receipt) => {
            setStatusNotice(`Customer receipt #${receipt.receiptNo} posted ($${(Number(receipt.amountReceived) || 0).toFixed(2)})`);
            setTimeout(() => setStatusNotice(null), 3500);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 16. PAID IN / OUT CASH MOVEMENTS MODAL (UNIFIED COMPONENT)                */}
      {/* ========================================================================= */}
      {isPaidInOutModalOpen && (
        <PaidInOutModal
          isOpen={isPaidInOutModalOpen}
          onClose={() => setIsPaidInOutModalOpen(false)}
          tenantId={currentTenant?.id}
          cashierName={profile?.name || invoiceSalesman || 'Active Cashier'}
          setPrintCashVoucherSnapshot={setPrintCashVoucherSnapshot}
          onMovementRecorded={(movement: any) => {
            setDrawerCashBalance((prev) =>
              movement.type === 'PAID_IN' ? prev + movement.amountUsd : Math.max(0, prev - movement.amountUsd)
            );
            setStatusNotice(
              `Cash drawer ${movement.type === 'PAID_IN' ? 'Deposit' : 'Payout'} ($${(Number(movement.amountUsd) || 0).toFixed(2)}) recorded.`
            );
            setTimeout(() => setStatusNotice(null), 3500);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* ALWAYS-MOUNTED OFF-SCREEN CASH VOUCHER PRINT CONTAINER                    */}
      {/* ========================================================================= */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none" aria-hidden="true">
        <div id="printable-cash-voucher">
          <PrintableCashVoucher voucher={printCashVoucherSnapshot} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 17. MAIN READING (X/Z READING) MODAL (UNIFIED COMPONENT)                  */}
      {/* ========================================================================= */}
      {isMainReadingModalOpen && (
        <MainReadingModal
          isOpen={isMainReadingModalOpen}
          onClose={() => setIsMainReadingModalOpen(false)}
          invoices={mainReadingInvoices}
          paidInOutList={mainReadingPaidInOut}
          customerReceipts={mainReadingReceipts}
          workingDate={invoiceDate || getTodayFormatted()}
          branchName={BRANCH_OPTIONS.find((b) => b.id === selectedBranch)?.name || 'Southern Olive and Oil Products S.A.R.L.'}
          cashierName={profile?.name || invoiceSalesman || 'Active Cashier'}
          tenantId={currentTenant?.id}
          printerType={salesOptions.printer_type}
          onShiftClosed={(closedShift, newShift, closedIds) => {
            setDrawerCashBalance(newShift.openingCashUsd);
            setPaidInOutHistory([]);
            if (closedIds && closedIds.length > 0) {
              setInvoicesDirectory((prev) =>
                prev.map((inv) =>
                  closedIds.includes(inv.id) || closedIds.includes(inv.invoiceNumber)
                    ? { ...inv, isReconciledOrClosed: true, closedInZReport: true, shiftClosed: true, closedShiftId: closedShift.id }
                    : inv
                )
              );
            }
            setStatusNotice(
              `Shift #${closedShift.shiftNumber} closed! Shift #${newShift.shiftNumber} opened with opening cash $${(Number(newShift.openingCashUsd) || 0).toFixed(2)}.`
            );
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 18. CUSTOMER LOOKUP DIRECTORY MODAL (ENTER KEY SHORTCUT)                  */}
      {/* ========================================================================= */}
      {isCustomerLookupModalOpen && (
        <CustomerLookupModal
          isOpen={isCustomerLookupModalOpen}
          onClose={() => setIsCustomerLookupModalOpen(false)}
          initialSearch={customerSearch}
          customers={CUSTOMER_PRESETS.filter((c) => c.name)}
          onSelectCustomer={handleSelectCustomerFromModal}
        />
      )}

      {/* ========================================================================= */}
      {/* NO TRANSACTIONS EMPTY-STATE GUARD DIALOG                                  */}
      {/* ========================================================================= */}
      {isNoTransactionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-sm p-6 text-center text-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-600">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">No Transactions.</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              No posted invoices, customer receipts, or cash movements recorded for the current working date / shift ({invoiceDate || getTodayFormatted()}).
            </p>
            <button
              type="button"
              onClick={() => setIsNoTransactionsModalOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-md transition-colors cursor-pointer shadow-xs"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG FOR UNPOSTING INVOICE (VANGUARD POS PATTERN)           */}
      {/* ========================================================================= */}
      {isConfirmUnpostOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md p-6 text-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="p-2 bg-rose-100 rounded-full">
                  <Unlock className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Unpost Invoice #{invoiceToUnpost?.invoiceNumber || currentInvoice?.invoiceNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ledger Transaction Unlock
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isUnpostingAction}
                onClick={() => {
                  setIsConfirmUnpostOpen(false);
                  setInvoiceToUnpost(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-light cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/90 rounded-lg p-3 text-slate-700 text-xs leading-relaxed font-medium">
              Are you sure you want to unpost this invoice? This will unlock the transaction for modification.
            </div>

            {(invoiceToUnpost || currentInvoice) && (
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Customer:</span>
                  <span className="font-semibold text-slate-800">
                    {(invoiceToUnpost || currentInvoice)?.customerName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount:</span>
                  <span className="font-mono font-bold text-primary">
                    ${(Number((invoiceToUnpost || currentInvoice)?.grandTotal) || 0).toFixed(2)}{' '}
                    {(invoiceToUnpost || currentInvoice)?.currency}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date:</span>
                  <span className="font-medium text-slate-700">
                    {(invoiceToUnpost || currentInvoice)?.date}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUnpostingAction}
                onClick={() => {
                  setIsConfirmUnpostOpen(false);
                  setInvoiceToUnpost(null);
                }}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUnpostingAction}
                onClick={handleConfirmUnpost}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUnpostingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Unposting...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Yes, Unpost</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
