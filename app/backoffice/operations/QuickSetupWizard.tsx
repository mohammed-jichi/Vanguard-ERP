'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Smartphone,
  Package,
  Users,
  Check,
  CheckCircle2,
  X,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Coins,
  Receipt,
  CreditCard,
  Printer,
  Monitor,
  AlertCircle,
  Sparkles,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import InteractiveVenueMap from '@/components/InteractiveVenueMap';

export interface TaxRow {
  id: number;
  description: string;
  rate: number;
}

export interface PaymentTypeRow {
  id: number;
  description: string;
  type: string;
  currency: string;
}

export interface LogicalPrinterRow {
  id: number;
  description: string;
}

export interface PhysicalPrinterRow {
  id: number;
  description: string;
  brand?: string;
  printerType: string;
  printerSeries?: string;
  address: string;
}

export interface WorkstationRow {
  id: number;
  workstationId: number;
  name: string;
  type: string;
  check1?: string;
  check2?: string;
  menu?: string;
  mode?: string;
  mainScreen?: string;
  custDisPort?: string;
  cashDrawerPort?: string;
  callerIdPort?: string;
  scalePort?: string;
  readerSerial?: string;
  locations?: { [index: number]: string };
}

export interface InventoryCategoryRow {
  id: number;
  name: string;
  secondLangName?: string;
  sorting?: number;
  image?: string | null;
  divisions: InventoryDivisionRow[];
}

export interface InventoryDivisionRow {
  id: number;
  name: string;
  categoryId: number;
  secondLangName?: string;
  sorting?: number;
  image?: string | null;
  groups: InventoryGroupRow[];
}

export interface InventoryGroupRow {
  id: number;
  name: string;
  divisionId: number;
  otherDescription?: string;
  secondLangName?: string;
  sorting?: number;
  discountPercentage?: number;
  useAsMasterInEcommerce?: boolean;
  assetAccount?: string;
  revenueAccount?: string;
  expenseAccount?: string;
  adjustmentAccount?: string;
  taxes?: { [key: string]: boolean };
  ecommerceImage?: string | null;
  items: InventoryItemRow[];
}

export interface InventoryItemRow {
  id: number;
  name: string;
  secondLangName?: string;
  groupId: number;
  barcode?: string;
  price?: number;
  cost?: number;
  unit?: string;
  image?: string | null;
}

export default function AuthenticOmegaQuickSetupWizard() {
  // Main Stepper: 1: Company Info, 2: Device Settings, 3: Inventory Setup, 4: Employee Setup
  const [activeStep, setActiveStep] = useState<number>(1);

  // Step 1 Sub-panels (Accordion: Branch Info, Currency Setup, Tax Setup, Payment Types)
  const [activeSubStep, setActiveSubStep] = useState<'branch' | 'currency' | 'tax' | 'payment'>('branch');

  // Step 2 Sub-panels (Printers, Workstations)
  const [activeDeviceSubStep, setActiveDeviceSubStep] = useState<'printers' | 'workstations'>('printers');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // -------------------------------------------------------------
  // 1. BRANCH INFO STATE (Authentic Omega Screenshot 1)
  // -------------------------------------------------------------
  const [branchName] = useState('Zeit w zaytoun ljanoub');
  const [street, setStreet] = useState('Old Saida Raod');
  const [stateName, setStateName] = useState('Lebanon');
  const [cityName, setCityName] = useState('Kfarchima');
  const [countryName] = useState('Lebanon');
  const [zipCode, setZipCode] = useState('');
  const [phone] = useState('707673828');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [fax, setFax] = useState('');

  // Map Coordinates (Amroussieh / Kfarchima branch from Screenshot 1)
  const [lat, setLat] = useState<number>(33.82043643318973);
  const [lng, setLng] = useState<number>(35.5262232999065);

  // Business Type
  const [businessTypes, setBusinessTypes] = useState<string[]>([
    'Olive oil Wholesale and retail',
    'Agro-Food Processing & Bottling',
    'Mediterranean Gourmet & Organics',
    'Restaurant & Tasting Room'
  ]);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('Olive oil Wholesale and retail');

  // Company Logo State
  const [hasCustomLogo, setHasCustomLogo] = useState<boolean>(true);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Tax Registrations & Fiscal Dates
  const [taxReg1, setTaxReg1] = useState('');
  const [taxReg2, setTaxReg2] = useState('');
  const [fiscalStart, setFiscalStart] = useState('2026-01-01');
  const [fiscalEnd, setFiscalEnd] = useState('2026-12-31');

  // Invoice Messages
  const [invoiceMsg1, setInvoiceMsg1] = useState('');
  const [invoiceMsg2, setInvoiceMsg2] = useState('');
  const [invoiceMsg3, setInvoiceMsg3] = useState('');
  const [invoiceMsg4, setInvoiceMsg4] = useState('');
  const [invoiceMsg5, setInvoiceMsg5] = useState('');

  // -------------------------------------------------------------
  // 2. CURRENCY SETUP STATE (Authentic Omega Screenshot 2)
  // -------------------------------------------------------------
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['LBP', 'USD', 'EUR', 'AED', 'SAR']);
  const [mainCurrency, setMainCurrency] = useState<string>('LBP');
  const [useSecondCurrency, setUseSecondCurrency] = useState<boolean>(true);
  const [secondCurrency, setSecondCurrency] = useState<string>('USD');
  const [showOnlyOneCurrencyOnInvoice, setShowOnlyOneCurrencyOnInvoice] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 3. TAX SETUP STATE (Authentic Omega Screenshots 2 & 3)
  // -------------------------------------------------------------
  const [taxes, setTaxes] = useState<TaxRow[]>([
    { id: 1, description: 'TAX 1', rate: 0 },
    { id: 2, description: 'TAX 2', rate: 0 },
    { id: 3, description: 'TAX 3', rate: 0 },
    { id: 4, description: 'TAX 4', rate: 0 },
    { id: 5, description: 'TAX 5', rate: 0 },
    { id: 6, description: 'TAX 6', rate: 0 }
  ]);

  // -------------------------------------------------------------
  // 4. PAYMENT TYPES STATE (Authentic Omega Screenshot 3)
  // -------------------------------------------------------------
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeRow[]>([
    { id: 1, description: 'CASH', type: 'Cash', currency: 'LBP' },
    { id: 2, description: 'CREDIT', type: 'Credit', currency: 'LBP' },
    { id: 3, description: 'CASH USD', type: 'Cash', currency: 'USD' },
    { id: 4, description: 'CREDIT CARD', type: 'Credit Card', currency: 'LBP' },
    { id: 5, description: 'CREDIT CARD USD', type: 'Credit Card', currency: 'USD' }
  ]);

  // -------------------------------------------------------------
  // 5. STEP 2: DEVICE SETTINGS (Printers & Workstations, Screenshot 4 & 5)
  // -------------------------------------------------------------
  const [logicalPrinters, setLogicalPrinters] = useState<LogicalPrinterRow[]>([
    { id: 1, description: 'Main Store' }
  ]);

  const [physicalPrinters, setPhysicalPrinters] = useState<PhysicalPrinterRow[]>([
    { id: 1, description: 'Invoice', brand: 'Epson', printerType: 'Ip', printerSeries: 'TM-T20', address: '192.168.0.1' },
    { id: 2, description: 'Kitchen', brand: 'Epson', printerType: 'Ip', printerSeries: 'TM-T88', address: '192.168.0.1' },
    { id: 3, description: 'Bar', brand: 'Star Micronics', printerType: 'Ip', printerSeries: 'TSP100', address: '192.168.0.1' }
  ]);

  const [workstations, setWorkstations] = useState<WorkstationRow[]>([
    {
      id: 1,
      workstationId: 2000,
      name: 'Admin',
      type: 'Inventory',
      check1: 'A4',
      check2: 'Null',
      menu: 'MAIN DEPARTMENT',
      mode: 'MODE 1',
      mainScreen: 'MAIN',
      custDisPort: 'Select Cust. dis. port',
      cashDrawerPort: 'Null',
      callerIdPort: '3',
      scalePort: 'Select Scale Port',
      readerSerial: '',
      locations: { 0: 'Main Store' }
    },
    {
      id: 2,
      workstationId: 1,
      name: 'Showroom 1',
      type: 'POS Offline',
      check1: 'Invoice',
      check2: 'Kitchen',
      menu: 'MAIN DEPARTMENT',
      mode: 'MODE 1',
      mainScreen: 'MAIN',
      custDisPort: 'COM 1',
      cashDrawerPort: 'Printer RJ12',
      callerIdPort: '1',
      scalePort: 'Select Scale Port',
      readerSerial: 'SN-00192',
      locations: { 0: 'Main Store' }
    },
    {
      id: 3,
      workstationId: 2,
      name: 'w2',
      type: 'POS Offline',
      check1: 'Invoice',
      check2: 'Null',
      menu: 'Retail POS',
      mode: 'MODE 1',
      mainScreen: 'MAIN',
      custDisPort: 'COM 2',
      cashDrawerPort: 'Printer RJ12',
      callerIdPort: '2',
      scalePort: 'Select Scale Port',
      readerSerial: 'SN-00193',
      locations: { 0: 'Main Store' }
    },
    {
      id: 4,
      workstationId: 3,
      name: 'w3',
      type: 'POS Offline',
      check1: 'Invoice',
      check2: 'Null',
      menu: 'Retail POS',
      mode: 'MODE 1',
      mainScreen: 'MAIN',
      custDisPort: 'Null',
      cashDrawerPort: 'Printer RJ12',
      callerIdPort: 'Null',
      scalePort: 'Select Scale Port',
      readerSerial: 'SN-00194',
      locations: { 0: 'Main Store' }
    },
    {
      id: 5,
      workstationId: 4,
      name: 'w4',
      type: 'POS Offline',
      check1: 'Invoice',
      check2: 'Null',
      menu: 'Retail POS',
      mode: 'MODE 1',
      mainScreen: 'MAIN',
      custDisPort: 'Null',
      cashDrawerPort: 'Printer RJ12',
      callerIdPort: 'Null',
      scalePort: 'Select Scale Port',
      readerSerial: 'SN-00195',
      locations: { 0: 'Main Store' }
    }
  ]);

  // -------------------------------------------------------------
  // MODALS STATE
  // -------------------------------------------------------------
  // Modal: Edit Tax Configuration
  const [editingTax, setEditingTax] = useState<TaxRow | null>(null);

  // Modal: New Currency
  const [isNewCurrencyModalOpen, setIsNewCurrencyModalOpen] = useState<boolean>(false);
  const [newCurrencyForm, setNewCurrencyForm] = useState({
    code: 'EUR',
    symbol: '€',
    description: 'Euro Member Currency',
    rateVsUsd: 0.92,
    decimals: 2
  });

  // Modal: Add/Edit Payment Type
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] = useState<boolean>(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentTypeRow | null>(null);
  const [paymentTypeForm, setPaymentTypeForm] = useState({
    description: 'WHISH MONEY USD',
    type: 'Credit Card',
    currency: 'USD'
  });

  // Modal: Add Business Type
  const [isBusinessTypeModalOpen, setIsBusinessTypeModalOpen] = useState<boolean>(false);
  const [newBusinessTypeInput, setNewBusinessTypeInput] = useState<string>('');

  // Modal: Logical Warehouse (media_1789170497961.png)
  const [isLogicalWarehouseModalOpen, setIsLogicalWarehouseModalOpen] = useState<boolean>(false);
  const [editingLogicalWarehouse, setEditingLogicalWarehouse] = useState<LogicalPrinterRow | null>(null);
  const [logicalWarehouseDesc, setLogicalWarehouseDesc] = useState<string>('');

  // Modal: Physical Printer (Description, Brand, Printer Type, Printer Series)
  const [isPhysicalPrinterModalOpen, setIsPhysicalPrinterModalOpen] = useState<boolean>(false);
  const [editingPhysicalPrinter, setEditingPhysicalPrinter] = useState<PhysicalPrinterRow | null>(null);
  const [physicalPrinterForm, setPhysicalPrinterForm] = useState({
    description: '',
    brand: 'Epson',
    printerType: 'Ip',
    printerSeries: 'TM-T20',
    address: '192.168.0.1'
  });

  // Modal: Edit Workstation (media_1789170497972.png & media_1789170497990.png)
  const [editingWorkstation, setEditingWorkstation] = useState<WorkstationRow | null>(null);
  const [workstationForm, setWorkstationForm] = useState<WorkstationRow>({
    id: 1,
    workstationId: 2000,
    name: 'Admin',
    type: 'Inventory',
    check1: 'A4',
    check2: 'Null',
    menu: 'MAIN DEPARTMENT',
    mode: 'MODE 1',
    mainScreen: 'MAIN',
    custDisPort: 'Select Cust. dis. port',
    cashDrawerPort: 'Null',
    callerIdPort: '3',
    scalePort: 'Select Scale Port',
    readerSerial: '',
    locations: { 0: 'Main Store' }
  });
  const [showMoreLocations, setShowMoreLocations] = useState<boolean>(false);

  // Menus & Screens Lists (Dynamic with + quick modal)
  const [menusList, setMenusList] = useState<string[]>([
    'MAIN DEPARTMENT',
    'Retail POS',
    'Wholesale Catalog',
    'Tasting Room'
  ]);
  const [screensList, setScreensList] = useState<string[]>([
    'MAIN',
    'RETAIL_GRID',
    'TOUCH_SCREEN',
    'BAR_EXPRESS'
  ]);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState<boolean>(false);
  const [newMenuInput, setNewMenuInput] = useState<string>('');
  const [isAddScreenModalOpen, setIsAddScreenModalOpen] = useState<boolean>(false);
  const [newScreenInput, setNewScreenInput] = useState<string>('');

  // -------------------------------------------------------------
  // 6. STEP 3: INVENTORY SETUP & TAXONOMY HIERARCHY
  // Categories -> Divisions -> Groups -> Items (Omega ERP 100% Clone)
  // -------------------------------------------------------------
  const [categories, setCategories] = useState<InventoryCategoryRow[]>([
    {
      id: 1,
      name: 'Raw Materials',
      secondLangName: 'Raw Materials',
      sorting: 1,
      image: null,
      divisions: [
        {
          id: 101,
          categoryId: 1,
          name: 'Assembled Items',
          secondLangName: 'Assembled Items',
          sorting: 1,
          image: null,
          groups: [
            {
              id: 1001,
              divisionId: 101,
              name: 'Extra Virgin Olive Oil',
              otherDescription: 'Premium First Cold Pressed Extraction',
              secondLangName: 'Extra Virgin Olive Oil',
              sorting: 1,
              discountPercentage: 0,
              useAsMasterInEcommerce: false,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 10001,
                  groupId: 1001,
                  name: 'EXTRA VIRGIN OLIVE OIL 1 LITRE (J)',
                  secondLangName: 'Extra Virgin Olive Oil 1L (Glass)',
                  barcode: '528000100101',
                  price: 14.5,
                  cost: 9.8,
                  unit: 'Litre'
                },
                {
                  id: 10002,
                  groupId: 1001,
                  name: 'EXTRA VIRGIN OLIVE OIL 1 LITRE (N)',
                  secondLangName: 'Extra Virgin Olive Oil 1L (PET)',
                  barcode: '528000100102',
                  price: 15.0,
                  cost: 10.2,
                  unit: 'Litre'
                },
                {
                  id: 10003,
                  groupId: 1001,
                  name: 'EXTRA VIRGIN OLIVE OIL 500ML',
                  secondLangName: 'Extra Virgin Olive Oil 500ml',
                  barcode: '528000100103',
                  price: 8.5,
                  cost: 5.4,
                  unit: 'Bottle'
                },
                {
                  id: 10004,
                  groupId: 1001,
                  name: 'EXTRA VIRGIN OLIVE OIL 5 LITRE TIN',
                  secondLangName: 'Extra Virgin Olive Oil 5L Tin',
                  barcode: '528000100104',
                  price: 65.0,
                  cost: 44.0,
                  unit: 'Tin'
                }
              ]
            },
            {
              id: 1002,
              divisionId: 101,
              name: 'Vinegars',
              otherDescription: 'Natural Artisanal and Commercial Vinegars',
              secondLangName: 'Vinegar & Seasonings',
              sorting: 2,
              discountPercentage: 0,
              useAsMasterInEcommerce: false,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 10005,
                  groupId: 1002,
                  name: 'COMMERCIAL WHITE VINEGAR 1 LITRE',
                  secondLangName: 'Commercial White Vinegar 1L',
                  barcode: '528000100201',
                  price: 2.5,
                  cost: 1.2,
                  unit: 'Litre'
                },
                {
                  id: 10006,
                  groupId: 1002,
                  name: 'APPLE CIDER VINEGAR 1 LITRE',
                  secondLangName: 'Natural Apple Cider Vinegar 1L',
                  barcode: '528000100202',
                  price: 4.2,
                  cost: 2.1,
                  unit: 'Litre'
                },
                {
                  id: 10007,
                  groupId: 1002,
                  name: 'BALSAMIC VINEGAR MODENA 500ML',
                  secondLangName: 'Modena Balsamic Vinegar 500ml',
                  barcode: '528000100203',
                  price: 6.8,
                  cost: 3.5,
                  unit: 'Bottle'
                }
              ]
            },
            {
              id: 1003,
              divisionId: 101,
              name: 'Vegetable Oils',
              otherDescription: 'Pure Seed Cooking Oils',
              secondLangName: 'Vegetable Oils',
              sorting: 3,
              discountPercentage: 0,
              useAsMasterInEcommerce: false,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 10008,
                  groupId: 1003,
                  name: 'PURE SUNFLOWER OIL 1.8L',
                  secondLangName: 'Pure Sunflower Oil 1.8L',
                  barcode: '528000100301',
                  price: 5.5,
                  cost: 3.8,
                  unit: 'Bottle'
                },
                {
                  id: 10009,
                  groupId: 1003,
                  name: 'PURE CORN OIL 1.8L',
                  secondLangName: 'Pure Corn Oil 1.8L',
                  barcode: '528000100302',
                  price: 6.0,
                  cost: 4.1,
                  unit: 'Bottle'
                }
              ]
            }
          ]
        },
        {
          id: 102,
          categoryId: 1,
          name: 'Bulk Silos',
          secondLangName: 'Wholesale Bulk Tanks',
          sorting: 2,
          image: null,
          groups: [
            {
              id: 1004,
              divisionId: 102,
              name: 'Storage Silos',
              otherDescription: 'Stainless Steel Temperature Controlled Silos',
              secondLangName: 'Storage Silos',
              sorting: 1,
              discountPercentage: 0,
              useAsMasterInEcommerce: false,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 10010,
                  groupId: 1004,
                  name: 'SILO A - BALADI UNFILTERED 1000L',
                  secondLangName: 'Silo A - Unfiltered Local',
                  barcode: '528000100401',
                  price: 11000,
                  cost: 8500,
                  unit: 'Silo'
                },
                {
                  id: 10011,
                  groupId: 1004,
                  name: 'SILO B - SOURI EXTRACTION 1500L',
                  secondLangName: 'Silo B - First Press Souri',
                  barcode: '528000100402',
                  price: 16500,
                  cost: 12800,
                  unit: 'Silo'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Bottled Goods',
      secondLangName: 'Packaged Goods',
      sorting: 2,
      image: null,
      divisions: [
        {
          id: 201,
          categoryId: 2,
          name: 'Retail Glass Bottling',
          secondLangName: 'Retail Glass Bottling',
          sorting: 1,
          image: null,
          groups: [
            {
              id: 2001,
              divisionId: 201,
              name: 'Gourmet Selection',
              otherDescription: 'Infused & High-Polyphenol oils',
              secondLangName: 'Gourmet Assortment',
              sorting: 1,
              discountPercentage: 0,
              useAsMasterInEcommerce: true,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 20001,
                  groupId: 2001,
                  name: 'CHILI INFUSED EVOO 250ML',
                  secondLangName: 'Olive Oil Infused with Chili 250ml',
                  barcode: '528000200101',
                  price: 9.5,
                  cost: 5.0,
                  unit: 'Bottle'
                },
                {
                  id: 20002,
                  groupId: 2001,
                  name: 'GARLIC & HERBS INFUSED EVOO 250ML',
                  secondLangName: 'Olive Oil Infused with Garlic & Herbs 250ml',
                  barcode: '528000200102',
                  price: 9.5,
                  cost: 5.0,
                  unit: 'Bottle'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Packaging & Supplies',
      secondLangName: 'Packaging Materials',
      sorting: 3,
      image: null,
      divisions: [
        {
          id: 301,
          categoryId: 3,
          name: 'Bottles & Caps',
          secondLangName: 'Bottles & Caps',
          sorting: 1,
          image: null,
          groups: [
            {
              id: 3001,
              divisionId: 301,
              name: 'Glass Containers',
              otherDescription: 'Empty bottles and closures for bottling line',
              secondLangName: 'Empty Glass Containers',
              sorting: 1,
              discountPercentage: 0,
              useAsMasterInEcommerce: false,
              assetAccount: '0',
              revenueAccount: '0',
              expenseAccount: '0',
              adjustmentAccount: '0',
              taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
              ecommerceImage: null,
              items: [
                {
                  id: 30001,
                  groupId: 3001,
                  name: 'MARASCA BOTTLE 1000ML UV PROTECT',
                  secondLangName: 'Marasca Bottle 1000ml',
                  barcode: '528000300101',
                  price: 0.85,
                  cost: 0.45,
                  unit: 'Piece'
                },
                {
                  id: 30002,
                  groupId: 3001,
                  name: 'DOP ANTI-DROP POURER CAP 31.5MM',
                  secondLangName: 'Non-Drip Pourer Cap 31.5mm',
                  barcode: '528000300102',
                  price: 0.25,
                  cost: 0.1,
                  unit: 'Piece'
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // Selected Active Hierarchy IDs
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number>(101);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1001);

  // Derived Objects from Active Selection
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;
  const currentDivisions = selectedCategory ? selectedCategory.divisions : [];
  const selectedDivision = currentDivisions.find((d) => d.id === selectedDivisionId) || currentDivisions[0] || null;
  const currentGroups = selectedDivision ? selectedDivision.groups : [];
  const selectedGroup = currentGroups.find((g) => g.id === selectedGroupId) || currentGroups[0] || null;
  const currentItems = selectedGroup ? selectedGroup.items : [];

  // Hierarchy Selection Handlers (Matching Omega ng-click cascade)
  const handleSelectCategory = (cat: InventoryCategoryRow) => {
    setSelectedCategoryId(cat.id);
    const firstDiv = cat.divisions[0] || null;
    if (firstDiv) {
      setSelectedDivisionId(firstDiv.id);
      const firstGrp = firstDiv.groups[0] || null;
      if (firstGrp) {
        setSelectedGroupId(firstGrp.id);
      } else {
        setSelectedGroupId(0);
      }
    } else {
      setSelectedDivisionId(0);
      setSelectedGroupId(0);
    }
  };

  const handleSelectDivision = (div: InventoryDivisionRow) => {
    setSelectedDivisionId(div.id);
    const firstGrp = div.groups[0] || null;
    if (firstGrp) {
      setSelectedGroupId(firstGrp.id);
    } else {
      setSelectedGroupId(0);
    }
  };

  const handleSelectGroup = (grp: InventoryGroupRow) => {
    setSelectedGroupId(grp.id);
  };

  // Predefined Categories List for Category Modal Dropdown
  const predefinedCategoriesList = [
    'Select Predefined Category',
    'Raw Materials & Extracts',
    'Olive Oils & Vinegars',
    'Bottled & Packaged Goods',
    'Bakery & Pastry',
    'Beverages & Soft Drinks',
    'Dairy & Cold Cuts',
    'Fresh Produce & Fruits',
    'Meat & Poultry',
    'Dry Goods & Grains',
    'Packaging & Disposables',
    'Cleaning & Sanitation Supplies'
  ];

  // -------------------------------------------------------------
  // MODALS STATE FOR STEP 3 (Matching Screenshots 1, 2, 3 & Item)
  // -------------------------------------------------------------
  // 1. Category Modal State (Screenshot 1)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategoryRow | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    description: '',
    secondLangDescription: '',
    sorting: '1',
    image: null as string | null,
    predefined: 'Select Predefined Category'
  });

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      description: '',
      secondLangDescription: '',
      sorting: String(categories.length + 1),
      image: null,
      predefined: 'Select Predefined Category'
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: InventoryCategoryRow) => {
    setEditingCategory(cat);
    setCategoryForm({
      description: cat.name,
      secondLangDescription: cat.secondLangName || '',
      sorting: String(cat.sorting || 1),
      image: cat.image || null,
      predefined: 'Select Predefined Category'
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.description.trim()) {
      showToast('Please enter category description!');
      return;
    }

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: categoryForm.description.trim(),
                secondLangName: categoryForm.secondLangDescription.trim(),
                sorting: parseInt(categoryForm.sorting) || 1,
                image: categoryForm.image
              }
            : c
        )
      );
      showToast(`Category "${categoryForm.description.trim()}" updated successfully!`);
    } else {
      const newCat: InventoryCategoryRow = {
        id: Date.now(),
        name: categoryForm.description.trim(),
        secondLangName: categoryForm.secondLangDescription.trim(),
        sorting: parseInt(categoryForm.sorting) || categories.length + 1,
        image: categoryForm.image,
        divisions: []
      };
      setCategories([...categories, newCat]);
      setSelectedCategoryId(newCat.id);
      setSelectedDivisionId(0);
      setSelectedGroupId(0);
      // Auto update division modal category if open
      setDivisionForm((prev) => ({ ...prev, categoryId: newCat.id }));
      showToast(`Category "${newCat.name}" added successfully!`);
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: number) => {
    const remaining = categories.filter((c) => c.id !== catId);
    setCategories(remaining);
    if (selectedCategoryId === catId && remaining.length > 0) {
      handleSelectCategory(remaining[0]);
    }
    showToast('Category removed.');
  };

  // 2. Division Modal State (Screenshot 2)
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState<boolean>(false);
  const [editingDivision, setEditingDivision] = useState<InventoryDivisionRow | null>(null);
  const [divisionForm, setDivisionForm] = useState({
    name: '',
    categoryId: 1,
    secondLangName: '',
    sorting: '1',
    image: null as string | null
  });

  const openNewDivisionModal = () => {
    setEditingDivision(null);
    setDivisionForm({
      name: '',
      categoryId: selectedCategoryId || (categories[0]?.id ?? 1),
      secondLangName: '',
      sorting: String((currentDivisions.length || 0) + 1),
      image: null
    });
    setIsDivisionModalOpen(true);
  };

  const openEditDivisionModal = (div: InventoryDivisionRow) => {
    setEditingDivision(div);
    setDivisionForm({
      name: div.name,
      categoryId: div.categoryId,
      secondLangName: div.secondLangName || '',
      sorting: String(div.sorting || 1),
      image: div.image || null
    });
    setIsDivisionModalOpen(true);
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionForm.name.trim()) {
      showToast('Please enter division name!');
      return;
    }

    const targetCatId = divisionForm.categoryId;
    if (editingDivision) {
      setCategories(
        categories.map((c) => ({
          ...c,
          divisions: c.divisions.map((d) =>
            d.id === editingDivision.id
              ? {
                  ...d,
                  name: divisionForm.name.trim(),
                  categoryId: targetCatId,
                  secondLangName: divisionForm.secondLangName.trim(),
                  sorting: parseInt(divisionForm.sorting) || 1,
                  image: divisionForm.image
                }
              : d
          )
        }))
      );
      showToast(`Division "${divisionForm.name.trim()}" updated successfully!`);
    } else {
      const newDiv: InventoryDivisionRow = {
        id: Date.now(),
        categoryId: targetCatId,
        name: divisionForm.name.trim(),
        secondLangName: divisionForm.secondLangName.trim(),
        sorting: parseInt(divisionForm.sorting) || 1,
        image: divisionForm.image,
        groups: []
      };
      setCategories(
        categories.map((c) =>
          c.id === targetCatId ? { ...c, divisions: [...c.divisions, newDiv] } : c
        )
      );
      setSelectedCategoryId(targetCatId);
      setSelectedDivisionId(newDiv.id);
      setSelectedGroupId(0);
      // Auto update group modal division if open
      setGroupForm((prev) => ({ ...prev, divisionId: newDiv.id }));
      showToast(`Division "${newDiv.name}" added successfully!`);
    }
    setIsDivisionModalOpen(false);
  };

  const handleDeleteDivision = (divId: number) => {
    setCategories(
      categories.map((c) => ({
        ...c,
        divisions: c.divisions.filter((d) => d.id !== divId)
      }))
    );
    if (selectedDivisionId === divId) {
      const remaining = currentDivisions.filter((d) => d.id !== divId);
      if (remaining.length > 0) {
        handleSelectDivision(remaining[0]);
      } else {
        setSelectedDivisionId(0);
        setSelectedGroupId(0);
      }
    }
    showToast('Division removed.');
  };

  // 3. Group Modal State (Screenshot 3)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<InventoryGroupRow | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    otherDescription: '',
    divisionId: 101,
    secondLangName: '',
    sorting: '1',
    discountPercentage: 0,
    useAsMasterInEcommerce: false,
    assetAccount: '0',
    revenueAccount: '0',
    expenseAccount: '0',
    adjustmentAccount: '0',
    taxes: {
      Tax1: true,
      Tax2: false,
      Tax3: false,
      Tax4: false,
      Tax5: false,
      Tax6: false
    } as { [key: string]: boolean },
    ecommerceImage: null as string | null
  });

  const openNewGroupModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      otherDescription: '',
      divisionId: selectedDivisionId || (currentDivisions[0]?.id ?? 101),
      secondLangName: '',
      sorting: String((currentGroups.length || 0) + 1),
      discountPercentage: 0,
      useAsMasterInEcommerce: false,
      assetAccount: '0',
      revenueAccount: '0',
      expenseAccount: '0',
      adjustmentAccount: '0',
      taxes: { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
      ecommerceImage: null
    });
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (grp: InventoryGroupRow) => {
    setEditingGroup(grp);
    setGroupForm({
      name: grp.name,
      otherDescription: grp.otherDescription || '',
      divisionId: grp.divisionId,
      secondLangName: grp.secondLangName || '',
      sorting: String(grp.sorting || 1),
      discountPercentage: grp.discountPercentage || 0,
      useAsMasterInEcommerce: !!grp.useAsMasterInEcommerce,
      assetAccount: grp.assetAccount || '0',
      revenueAccount: grp.revenueAccount || '0',
      expenseAccount: grp.expenseAccount || '0',
      adjustmentAccount: grp.adjustmentAccount || '0',
      taxes: grp.taxes || { Tax1: true, Tax2: false, Tax3: false, Tax4: false, Tax5: false, Tax6: false },
      ecommerceImage: grp.ecommerceImage || null
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) {
      showToast('Please enter group name!');
      return;
    }

    const targetDivId = groupForm.divisionId;
    if (editingGroup) {
      setCategories(
        categories.map((c) => ({
          ...c,
          divisions: c.divisions.map((d) => ({
            ...d,
            groups: d.groups.map((g) =>
              g.id === editingGroup.id
                ? {
                    ...g,
                    name: groupForm.name.trim(),
                    otherDescription: groupForm.otherDescription.trim(),
                    divisionId: targetDivId,
                    secondLangName: groupForm.secondLangName.trim(),
                    sorting: parseInt(groupForm.sorting) || 1,
                    discountPercentage: Number(groupForm.discountPercentage) || 0,
                    useAsMasterInEcommerce: groupForm.useAsMasterInEcommerce,
                    assetAccount: groupForm.assetAccount,
                    revenueAccount: groupForm.revenueAccount,
                    expenseAccount: groupForm.expenseAccount,
                    adjustmentAccount: groupForm.adjustmentAccount,
                    taxes: groupForm.taxes,
                    ecommerceImage: groupForm.ecommerceImage
                  }
                : g
            )
          }))
        }))
      );
      showToast(`Group "${groupForm.name.trim()}" updated successfully!`);
    } else {
      const newGrp: InventoryGroupRow = {
        id: Date.now(),
        divisionId: targetDivId,
        name: groupForm.name.trim(),
        otherDescription: groupForm.otherDescription.trim(),
        secondLangName: groupForm.secondLangName.trim(),
        sorting: parseInt(groupForm.sorting) || 1,
        discountPercentage: Number(groupForm.discountPercentage) || 0,
        useAsMasterInEcommerce: groupForm.useAsMasterInEcommerce,
        assetAccount: groupForm.assetAccount,
        revenueAccount: groupForm.revenueAccount,
        expenseAccount: groupForm.expenseAccount,
        adjustmentAccount: groupForm.adjustmentAccount,
        taxes: groupForm.taxes,
        ecommerceImage: groupForm.ecommerceImage,
        items: []
      };

      setCategories(
        categories.map((c) => ({
          ...c,
          divisions: c.divisions.map((d) =>
            d.id === targetDivId ? { ...d, groups: [...d.groups, newGrp] } : d
          )
        }))
      );
      setSelectedDivisionId(targetDivId);
      setSelectedGroupId(newGrp.id);
      // Auto update item modal group if open
      setItemForm((prev) => ({ ...prev, groupId: newGrp.id }));
      showToast(`Group "${newGrp.name}" added successfully!`);
    }
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = (grpId: number) => {
    setCategories(
      categories.map((c) => ({
        ...c,
        divisions: c.divisions.map((d) => ({
          ...d,
          groups: d.groups.filter((g) => g.id !== grpId)
        }))
      }))
    );
    if (selectedGroupId === grpId) {
      const remaining = currentGroups.filter((g) => g.id !== grpId);
      if (remaining.length > 0) {
        handleSelectGroup(remaining[0]);
      } else {
        setSelectedGroupId(0);
      }
    }
    showToast('Group removed.');
  };

  // 4. Item Modal State (Table 4)
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItemRow | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    secondLangName: '',
    groupId: 1001,
    barcode: '',
    price: 0,
    cost: 0,
    unit: 'Litre',
    image: null as string | null
  });

  const openNewItemModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      secondLangName: '',
      groupId: selectedGroupId || (currentGroups[0]?.id ?? 1001),
      barcode: `528000${Math.floor(100000 + Math.random() * 900000)}`,
      price: 15.0,
      cost: 10.0,
      unit: 'Litre',
      image: null
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventoryItemRow) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      secondLangName: item.secondLangName || '',
      groupId: item.groupId,
      barcode: item.barcode || '',
      price: item.price || 0,
      cost: item.cost || 0,
      unit: item.unit || 'Litre',
      image: item.image || null
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      showToast('Please enter item description!');
      return;
    }

    const targetGrpId = itemForm.groupId;
    if (editingItem) {
      setCategories(
        categories.map((c) => ({
          ...c,
          divisions: c.divisions.map((d) => ({
            ...d,
            groups: d.groups.map((g) => ({
              ...g,
              items: g.items.map((it) =>
                it.id === editingItem.id
                  ? {
                      ...it,
                      name: itemForm.name.trim(),
                      secondLangName: itemForm.secondLangName.trim(),
                      groupId: targetGrpId,
                      barcode: itemForm.barcode.trim(),
                      price: Number(itemForm.price) || 0,
                      cost: Number(itemForm.cost) || 0,
                      unit: itemForm.unit,
                      image: itemForm.image
                    }
                  : it
              )
            }))
          }))
        }))
      );
      showToast(`Item "${itemForm.name.trim()}" updated successfully!`);
    } else {
      const newItem: InventoryItemRow = {
        id: Date.now(),
        groupId: targetGrpId,
        name: itemForm.name.trim(),
        secondLangName: itemForm.secondLangName.trim(),
        barcode: itemForm.barcode.trim(),
        price: Number(itemForm.price) || 0,
        cost: Number(itemForm.cost) || 0,
        unit: itemForm.unit,
        image: itemForm.image
      };
      setCategories(
        categories.map((c) => ({
          ...c,
          divisions: c.divisions.map((d) => ({
            ...d,
            groups: d.groups.map((g) =>
              g.id === targetGrpId ? { ...g, items: [...g.items, newItem] } : g
            )
          }))
        }))
      );
      showToast(`Item "${newItem.name}" added successfully!`);
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: number) => {
    setCategories(
      categories.map((c) => ({
        ...c,
        divisions: c.divisions.map((d) => ({
          ...d,
          groups: d.groups.map((g) => ({
            ...g,
            items: g.items.filter((it) => it.id !== itemId)
          }))
        }))
      }))
    );
    showToast('Item removed.');
  };

  // Helper list of all divisions across all categories for Division dropdown in Group Modal
  const allDivisionsList = categories.flatMap((c) =>
    c.divisions.map((d) => ({
      ...d,
      categoryName: c.name
    }))
  );

  // Helper list of all groups across all categories/divisions for Group dropdown in Item Modal
  const allGroupsList = categories.flatMap((c) =>
    c.divisions.flatMap((d) =>
      d.groups.map((g) => ({
        ...g,
        divisionName: d.name
      }))
    )
  );

  // Handle Image Upload Helper for Modals
  const handleImageFilePick = (
    e: React.ChangeEvent<HTMLInputElement>,
    maxKb: number,
    onSuccess: (dataUrl: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > maxKb * 1024) {
        showToast(`Image size exceeds recommended ${maxKb}KB limit!`);
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        onSuccess(ev.target?.result as string);
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo Upload Simulation
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024) {
        showToast('Image size exceeds recommended 50KB limit!');
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target?.result as string);
        setHasCustomLogo(true);
        showToast('Company logo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setHasCustomLogo(false);
    setCustomLogoUrl(null);
    showToast('Company logo removed.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER GREETING (Exact Match to Screenshots 1 & 4) */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Welcome Mohammed,
        </h1>
      </div>

      {/* =========================================================================
          AUTHENTIC OMEGA STEPPER (4 STEPS CONNECTED BY BAR)
          1: Company Info | 2: Device Settings | 3: Inventory Setup | 4: Employee Setup
          ========================================================================= */}
      <div className="flex items-center justify-center py-4">
        <div className="relative flex items-center justify-between w-full max-w-3xl px-4">
          {/* Connecting Progress Bar Background */}
          <div className="absolute left-12 right-12 top-5 h-2.5 bg-slate-300 rounded-full z-0" />
          
          {/* Active Progress Fill */}
          <div
            className="absolute left-12 top-5 h-2.5 bg-amber-600 rounded-full transition-all duration-300 z-0"
            style={{
              width:
                activeStep === 1
                  ? '0%'
                  : activeStep === 2
                  ? '33%'
                  : activeStep === 3
                  ? '66%'
                  : '100%'
            }}
          />

          {/* Stepper Items */}
          {[
            { step: 1, name: 'Company Info', icon: Building },
            { step: 2, name: 'Device Settings', icon: Smartphone },
            { step: 3, name: 'Inventory Setup', icon: Package },
            { step: 4, name: 'Employee Setup', icon: Users }
          ].map((s) => {
            const isCurrent = activeStep === s.step;
            const isCompleted = activeStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                    isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-orange-200 scale-110'
                      : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-slate-400 text-white'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <span
                  className={`text-xs mt-2 font-semibold transition-colors ${
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STEP 1: COMPANY INFO (AUTHENTIC OMEGA ACCORDION WITH 4 SUB-PANELS)
          ========================================================================= */}
      {activeStep === 1 && (
        <div className="space-y-4">
          {/* -------------------------------------------------------------
              SUB-PANEL 1.1: BRANCH INFO
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubStep(activeSubStep === 'branch' ? 'branch' : 'branch')}
              className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between transition"
            >
              <span>Branch Info</span>
              <span className="text-xs text-slate-400 font-normal">
                {activeSubStep === 'branch' ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {activeSubStep === 'branch' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Branch Details & Interactive Map */}
                  <div className="lg:col-span-7 space-y-4 lg:pr-6 lg:border-r lg:border-dashed lg:border-slate-300">
                    {/* Name */}
                    <div className="grid grid-cols-12 items-center gap-3 text-xs">
                      <label className="col-span-2 text-right font-semibold text-slate-700">Name</label>
                      <div className="col-span-10">
                        <input
                          type="text"
                          disabled
                          value={branchName}
                          className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 font-medium cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Street */}
                    <div className="grid grid-cols-12 items-center gap-3 text-xs">
                      <label className="col-span-2 text-right font-semibold text-slate-700">Street</label>
                      <div className="col-span-10">
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* State & City */}
                    <div className="grid grid-cols-12 items-center gap-3 text-xs">
                      <label className="col-span-2 text-right font-semibold text-slate-700">State</label>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <label className="col-span-2 text-right font-semibold text-slate-700">City</label>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Country & Zip Code */}
                    <div className="grid grid-cols-12 items-center gap-3 text-xs">
                      <label className="col-span-2 text-right font-semibold text-slate-700">Country</label>
                      <div className="col-span-4">
                        <input
                          type="text"
                          disabled
                          value={countryName}
                          className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 font-medium cursor-not-allowed"
                        />
                      </div>
                      <label className="col-span-2 text-right font-semibold text-slate-700">Zip Code</label>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Phone Numbers Divider */}
                    <div className="pt-3 border-t border-dashed border-slate-200 space-y-3">
                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-2 text-right font-semibold text-slate-700">Phone</label>
                        <div className="col-span-10">
                          <input
                            type="text"
                            disabled
                            value={phone}
                            className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-2 text-right font-semibold text-slate-700">Phone 2</label>
                        <div className="col-span-10">
                          <input
                            type="text"
                            value={phone2}
                            onChange={(e) => setPhone2(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-2 text-right font-semibold text-slate-700">Phone 3</label>
                        <div className="col-span-10">
                          <input
                            type="text"
                            value={phone3}
                            onChange={(e) => setPhone3(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-2 text-right font-semibold text-slate-700">Fax</label>
                        <div className="col-span-10">
                          <input
                            type="text"
                            value={fax}
                            onChange={(e) => setFax(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Leaflet Map for Branch (Exact Coordinates from Screenshot 1) */}
                    <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                      <div className="h-36 w-full rounded-lg border border-slate-300 overflow-hidden shadow-xs relative">
                        <InteractiveVenueMap
                          lat={lat}
                          lng={lng}
                          onChange={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                          }}
                          className="h-full w-full"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Set your branch location on the map directly.
                      </p>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs pt-1">
                        <label className="col-span-2 text-right font-semibold text-slate-700">Lat</label>
                        <div className="col-span-4">
                          <input
                            type="number"
                            step="any"
                            value={lat}
                            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                          />
                        </div>
                        <label className="col-span-2 text-right font-semibold text-slate-700">Lng</label>
                        <div className="col-span-4">
                          <input
                            type="number"
                            step="any"
                            value={lng}
                            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Type */}
                    <div className="pt-3 border-t border-dashed border-slate-200">
                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-3 text-right font-semibold text-slate-700">
                          Business Type<span className="text-red-500">*</span>
                        </label>
                        <div className="col-span-8">
                          <select
                            value={selectedBusinessType}
                            onChange={(e) => setSelectedBusinessType(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          >
                            {businessTypes.map((bt) => (
                              <option key={bt} value={bt}>
                                {bt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => setIsBusinessTypeModalOpen(true)}
                            className="w-full py-1.5 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs"
                            title="Add new business type"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Company Logo, Tax Reg, Fiscal Dates, Invoice Msgs */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Company Logo Card (Matching Screenshot 1) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Company Logo</label>
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center flex flex-col items-center">
                        <div className="w-64 h-28 border border-slate-300 bg-white rounded-lg flex items-center justify-center p-2 mb-3 shadow-inner overflow-hidden">
                          {hasCustomLogo ? (
                            customLogoUrl ? (
                              <img src={customLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                            ) : (
                              /* Authentic Southern Olive Oil Products SVG Logo from Screenshot 1 */
                              <svg viewBox="0 0 280 120" className="w-full h-full">
                                <ellipse cx="140" cy="60" rx="130" ry="52" fill="#fff9c4" stroke="#7cb342" strokeWidth="4" />
                                <ellipse cx="140" cy="60" rx="122" ry="46" fill="none" stroke="#fbc02d" strokeWidth="2" />
                                
                                {/* Olive branch on left */}
                                <g transform="translate(25, 45)">
                                  <path d="M 0,20 Q 25,0 45,15" fill="none" stroke="#558b2f" strokeWidth="3" />
                                  <path d="M 12,8 C 5,0 20,-8 28,5 Z" fill="#7cb342" />
                                  <path d="M 28,14 C 25,25 40,28 42,15 Z" fill="#7cb342" />
                                  <circle cx="18" cy="22" r="5" fill="#33691e" />
                                  <circle cx="34" cy="8" r="6" fill="#212121" />
                                  <circle cx="44" cy="25" r="5.5" fill="#558b2f" />
                                </g>

                                {/* Arabic Text */}
                                <text x="180" y="42" textAnchor="middle" fill="#2e7d32" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                                  Products
                                </text>
                                <text x="180" y="68" textAnchor="middle" fill="#1b5e20" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                                  Southern Olive Oil
                                </text>

                                {/* English Text */}
                                <text x="180" y="90" textAnchor="middle" fill="#c62828" fontSize="10" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">
                                  Southern olive oil products
                                </text>
                              </svg>
                            )
                          ) : (
                            <div className="text-slate-400 text-xs italic">No logo uploaded</div>
                          )}
                        </div>

                        {/* Logo Buttons & Constraints */}
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition">
                            <span>Select image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-4 py-1.5 rounded bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold shadow-xs transition"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="text-[11px] text-red-500 font-semibold mt-1.5">Max: 50KB</span>
                      </div>
                    </div>

                    {/* Tax Registrations */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-5 text-right font-semibold text-slate-700">Tax Registration #1</label>
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={taxReg1}
                            onChange={(e) => setTaxReg1(e.target.value)}
                            placeholder="e.g. 108849-601"
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-5 text-right font-semibold text-slate-700">Tax Registration #2</label>
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={taxReg2}
                            onChange={(e) => setTaxReg2(e.target.value)}
                            placeholder="e.g. LB-VAT-449"
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-5 text-right font-semibold text-slate-700">Fiscal Start</label>
                        <div className="col-span-7">
                          <input
                            type="date"
                            value={fiscalStart}
                            onChange={(e) => setFiscalStart(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-3 text-xs">
                        <label className="col-span-5 text-right font-semibold text-slate-700">Fiscal End</label>
                        <div className="col-span-7">
                          <input
                            type="date"
                            value={fiscalEnd}
                            onChange={(e) => setFiscalEnd(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Invoice Messages 1-5 */}
                    <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                      {[
                        { label: 'Invoice Msg 1', val: invoiceMsg1, set: setInvoiceMsg1 },
                        { label: 'Invoice Msg 2', val: invoiceMsg2, set: setInvoiceMsg2 },
                        { label: 'Invoice Msg 3', val: invoiceMsg3, set: setInvoiceMsg3 },
                        { label: 'Invoice Msg 4', val: invoiceMsg4, set: setInvoiceMsg4 },
                        { label: 'Invoice Msg 5', val: invoiceMsg5, set: setInvoiceMsg5 }
                      ].map((m, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center gap-3 text-xs">
                          <label className="col-span-4 text-right font-semibold text-slate-700">{m.label}</label>
                          <div className="col-span-8">
                            <input
                              type="text"
                              value={m.val}
                              onChange={(e) => m.set(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION: NEXT (Closes Branch Info, Opens Currency Setup) */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubStep('currency');
                      showToast('Branch Info saved. Navigated to Currency Setup.');
                    }}
                    className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              SUB-PANEL 1.2: CURRENCY SETUP
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubStep(activeSubStep === 'currency' ? 'branch' : 'currency')}
              className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between transition"
            >
              <span>Currency Setup</span>
              <span className="text-xs text-slate-400 font-normal">
                {activeSubStep === 'currency' ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {activeSubStep === 'currency' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  {/* Currency Fields */}
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    {/* Main Currency */}
                    <div className="flex items-center gap-3">
                      <label className="font-semibold text-slate-700">Main Currency</label>
                      <select
                        value={mainCurrency}
                        onChange={(e) => setMainCurrency(e.target.value)}
                        className="w-28 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary"
                      >
                        {availableCurrencies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Use Second Currency */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSecondCurrency}
                          onChange={(e) => setUseSecondCurrency(e.target.checked)}
                          className="rounded border-slate-300 text-primary focus:ring-0"
                        />
                        <span>Use Second Currency</span>
                      </label>
                      {useSecondCurrency && (
                        <select
                          value={secondCurrency}
                          onChange={(e) => setSecondCurrency(e.target.value)}
                          className="w-28 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary"
                        >
                          {availableCurrencies.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Actions: + New Currency & Manage Currencies (Matching Screenshot 2) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewCurrencyModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Currency</span>
                    </button>
                    <a
                      href="/backoffice/operations?section=currency_setup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition shadow-xs"
                    >
                      <span>Manage Currencies</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>

                {/* Checkbox: Show Only One Currency on Invoice */}
                {useSecondCurrency && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyOneCurrencyOnInvoice}
                        onChange={(e) => setShowOnlyOneCurrencyOnInvoice(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-0"
                      />
                      <span>Show Only One Currency on Invoice</span>
                    </label>
                  </div>
                )}

                {/* BOTTOM ACTIONS: BACK & NEXT */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubStep('branch')}
                    className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubStep('tax');
                      showToast('Currency Setup updated. Navigated to Tax Setup.');
                    }}
                    className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              SUB-PANEL 1.3: TAX SETUP
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubStep(activeSubStep === 'tax' ? 'currency' : 'tax')}
              className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between transition"
            >
              <span>Tax Setup</span>
              <span className="text-xs text-slate-400 font-normal">
                {activeSubStep === 'tax' ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {activeSubStep === 'tax' && (
              <div className="p-6 space-y-6">
                {/* Authentic Tax Table (Matching Screenshot 2 & 3) */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-4 py-2.5 w-12">#</th>
                        <th className="px-4 py-2.5">Tax Description</th>
                        <th className="px-4 py-2.5 text-right w-32">Tax Rate</th>
                        <th className="px-4 py-2.5 text-center w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {taxes.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-2.5 text-slate-500 font-bold">{t.id}</td>
                          <td className="px-4 py-2.5 text-slate-800 font-semibold">{t.description}</td>
                          <td className="px-4 py-2.5 text-right text-slate-800 font-mono font-bold">
                            {t.rate} %
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setEditingTax(t)}
                              className="text-primary hover:text-primary transition p-1 cursor-pointer"
                              title="Edit Tax Configuration"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM ACTIONS: BACK & NEXT */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubStep('currency')}
                    className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubStep('payment');
                      showToast('Tax Setup verified. Navigated to Payment Types.');
                    }}
                    className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              SUB-PANEL 1.4: PAYMENT TYPES
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSubStep(activeSubStep === 'payment' ? 'tax' : 'payment')}
              className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between transition"
            >
              <span>Payment Types</span>
              <span className="text-xs text-slate-400 font-normal">
                {activeSubStep === 'payment' ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {activeSubStep === 'payment' && (
              <div className="p-6 space-y-6">
                {/* Authentic Payment Types Table (Matching Screenshot 3) */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Payment Description</th>
                        <th className="px-4 py-2.5">Payment Type</th>
                        <th className="px-4 py-2.5">Currency</th>
                        <th className="px-4 py-2.5 text-right w-20">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaymentType(null);
                              setPaymentTypeForm({
                                description: 'NEW PAYMENT',
                                type: 'Cash',
                                currency: 'USD'
                              });
                              setIsPaymentTypeModalOpen(true);
                            }}
                            className="text-white hover:text-amber-200 transition p-1"
                            title="Add Payment Type"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {paymentTypes.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-2.5 text-slate-800 font-bold">{p.description}</td>
                          <td className="px-4 py-2.5 text-slate-600">{p.type}</td>
                          <td className="px-4 py-2.5 text-slate-700 font-mono font-bold">{p.currency}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPaymentType(p);
                                  setPaymentTypeForm({
                                    description: p.description,
                                    type: p.type,
                                    currency: p.currency
                                  });
                                  setIsPaymentTypeModalOpen(true);
                                }}
                                className="text-primary hover:text-primary transition"
                                title="Edit Payment Type"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentTypes(paymentTypes.filter((x) => x.id !== p.id));
                                  showToast(`Payment Type "${p.description}" deleted.`);
                                }}
                                className="text-red-700 hover:text-red-900 transition"
                                title="Delete Payment Type"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM ACTIONS: BACK & NEXT (Advances to Step 2 Device Settings) */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubStep('tax')}
                    className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(2);
                      showToast('Company Info setup finished! Proceeding to Step 2: Device Settings.');
                    }}
                    className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: DEVICE SETTINGS (AUTHENTIC OMEGA SCREENSHOT 1 & 4)
          Card 1: Printers (Logical & Physical) | Card 2: Workstations
          ========================================================================= */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* -------------------------------------------------------------
              CARD 2.1: PRINTERS (Matching media_1789170497936.png)
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-800">
              Printers
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Logical Warehouse Table */}
                <div className="lg:col-span-4 border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5">Logical Warehouse</th>
                        <th className="px-3 py-2.5 text-right w-12">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLogicalWarehouse(null);
                              setLogicalWarehouseDesc('');
                              setIsLogicalWarehouseModalOpen(true);
                            }}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer"
                            title="Add Logical Warehouse"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {logicalPrinters.map((lp) => (
                        <tr key={lp.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-2.5 text-slate-800 font-bold">{lp.description}</td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLogicalWarehouse(lp);
                                  setLogicalWarehouseDesc(lp.description);
                                  setIsLogicalWarehouseModalOpen(true);
                                }}
                                className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                                title="Edit Logical Warehouse"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLogicalPrinters(logicalPrinters.filter((x) => x.id !== lp.id));
                                  showToast(`Logical Warehouse "${lp.description}" deleted.`);
                                }}
                                className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                                title="Delete Logical Warehouse"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Physical Printers Table */}
                <div className="lg:col-span-8 border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5">Physical Printers</th>
                        <th className="px-3 py-2.5">Printer Type</th>
                        <th className="px-3 py-2.5">Printer IP/Name</th>
                        <th className="px-3 py-2.5 text-right w-12">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhysicalPrinter(null);
                              setPhysicalPrinterForm({
                                description: '',
                                brand: 'Epson',
                                printerType: 'Ip',
                                printerSeries: 'TM-T20',
                                address: '192.168.0.1'
                              });
                              setIsPhysicalPrinterModalOpen(true);
                            }}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer"
                            title="Add Physical Printer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {physicalPrinters.map((pp) => (
                        <tr key={pp.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-2.5 text-slate-800 font-bold">{pp.description}</td>
                          <td className="px-3 py-2.5 text-slate-600">{pp.printerType}</td>
                          <td className="px-3 py-2.5 text-slate-700 font-mono">{pp.address}</td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPhysicalPrinter(pp);
                                  setPhysicalPrinterForm({
                                    description: pp.description,
                                    brand: pp.brand || 'Epson',
                                    printerType: pp.printerType,
                                    printerSeries: pp.printerSeries || 'TM-T20',
                                    address: pp.address
                                  });
                                  setIsPhysicalPrinterModalOpen(true);
                                }}
                                className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                                title="Edit Physical Printer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhysicalPrinters(physicalPrinters.filter((x) => x.id !== pp.id));
                                  showToast(`Physical Printer "${pp.description}" deleted.`);
                                }}
                                className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                                title="Delete Physical Printer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTTOM ACTIONS FOR PRINTERS CARD (Matching Screenshot 1) */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Printers verified. Proceed to configure Workstations below.');
                  }}
                  className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              CARD 2.2: WORKSTATIONS (Matching media_1789170497936.png)
              ------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-800">
              Workstations
            </div>
            <div className="p-6 space-y-6">
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-primary text-white font-bold">
                    <tr>
                      <th className="px-4 py-2.5 w-16">#</th>
                      <th className="px-4 py-2.5">Workstation Name</th>
                      <th className="px-4 py-2.5">Workstation Type</th>
                      <th className="px-4 py-2.5 text-right w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {workstations.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5 text-slate-600 font-bold">{w.workstationId}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-bold">{w.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{w.type}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingWorkstation(w);
                              setWorkstationForm({
                                id: w.id,
                                workstationId: w.workstationId,
                                name: w.name,
                                type: w.type,
                                check1: w.check1 || 'A4',
                                check2: w.check2 || 'Null',
                                menu: w.menu || 'MAIN DEPARTMENT',
                                mode: w.mode || 'MODE 1',
                                mainScreen: w.mainScreen || 'MAIN',
                                custDisPort: w.custDisPort || 'Select Cust. dis. port',
                                cashDrawerPort: w.cashDrawerPort || 'Null',
                                callerIdPort: w.callerIdPort || '3',
                                scalePort: w.scalePort || 'Select Scale Port',
                                readerSerial: w.readerSerial || '',
                                locations: w.locations || { 0: 'Main Store' }
                              });
                              setShowMoreLocations(false);
                            }}
                            className="text-primary hover:text-primary transition p-1 cursor-pointer"
                            title="Edit Workstation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BOTTOM ACTIONS FOR WORKSTATIONS CARD (Matching Screenshot 1) */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(3);
                    showToast('Device settings verified! Proceeding to Step 3: Inventory Setup.');
                  }}
                  className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: INVENTORY SETUP & MASTER TAXONOMY (AUTHENTIC OMEGA CLOUDPOS)
          Categories, Divisions, Groups & Items (Lines 5074-5154 in Omega HTML)
          ========================================================================= */}
      {activeStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Card: Categories, Divisions, Groups & Items Panel */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Header Accordion Bar (Matching Omega .panel-heading) */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="text-slate-800">Categories, Divisions, Groups &amp; Items</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-primary">
                Cloud POS Taxonomy
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Row 1: Categories (Left) & Divisions (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table 1: Categories */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5" colSpan={2}>
                          Categories
                        </th>
                        <th className="px-3 py-2.5 text-right w-16" colSpan={2}>
                          <button
                            type="button"
                            onClick={openNewCategoryModal}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer"
                            title="Add New Category"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <tr
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-muted border-l-4 border-primary text-slate-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <td className="w-8 pl-3 py-2 text-center">
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt=""
                                  className="w-5 h-5 rounded object-cover mx-auto"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="px-2 py-2">
                              <div>{cat.name}</div>
                              {cat.secondLangName && (
                                <div className="text-[10px] text-slate-500 font-normal">
                                  {cat.secondLangName}
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditCategoryModal(cat);
                                }}
                                className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="px-2 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(cat.id);
                                }}
                                className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-400 italic">
                            No categories created. Click + to add.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table 2: Divisions (Filtered by active Category) */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5">
                          Divisions
                          {selectedCategory && (
                            <span className="text-[11px] font-normal text-blue-100 ml-1.5">
                              ({selectedCategory.name})
                            </span>
                          )}
                        </th>
                        <th className="px-3 py-2.5 text-right w-16" colSpan={2}>
                          <button
                            type="button"
                            onClick={openNewDivisionModal}
                            disabled={!selectedCategory}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer disabled:opacity-50"
                            title="Add New Division"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {currentDivisions.map((div) => {
                        const isSelected = selectedDivisionId === div.id;
                        return (
                          <tr
                            key={div.id}
                            onClick={() => handleSelectDivision(div)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-muted border-l-4 border-primary text-slate-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <td className="px-3 py-2">
                              <div>{div.name}</div>
                              {div.secondLangName && (
                                <div className="text-[10px] text-slate-500 font-normal">
                                  {div.secondLangName}
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDivisionModal(div);
                                }}
                                className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                                title="Edit Division"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="px-2 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDivision(div.id);
                                }}
                                className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                                title="Delete Division"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {currentDivisions.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-slate-400 italic">
                            {selectedCategory
                              ? 'No divisions under this category. Click + to add.'
                              : 'Select a category to view divisions.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 2: Groups (Left) & Items (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table 3: Groups (Filtered by active Division) */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5">
                          Groups
                          {selectedDivision && (
                            <span className="text-[11px] font-normal text-blue-100 ml-1.5">
                              ({selectedDivision.name})
                            </span>
                          )}
                        </th>
                        <th className="px-3 py-2.5 text-right w-16" colSpan={2}>
                          <button
                            type="button"
                            onClick={openNewGroupModal}
                            disabled={!selectedDivision}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer disabled:opacity-50"
                            title="Add New Group"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {currentGroups.map((grp) => {
                        const isSelected = selectedGroupId === grp.id;
                        return (
                          <tr
                            key={grp.id}
                            onClick={() => handleSelectGroup(grp)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-muted border-l-4 border-primary text-slate-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <td className="px-3 py-2">
                              <div>{grp.name}</div>
                              {grp.secondLangName && (
                                <div className="text-[10px] text-slate-500 font-normal">
                                  {grp.secondLangName}
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditGroupModal(grp);
                                }}
                                className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                                title="Edit Group"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="px-2 py-2 text-right w-8">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGroup(grp.id);
                                }}
                                className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                                title="Delete Group"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {currentGroups.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-slate-400 italic">
                            {selectedDivision
                              ? 'No groups under this division. Click + to add.'
                              : 'Select a division to view groups.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table 4: Items (Filtered by active Group) */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-primary text-white font-bold">
                      <tr>
                        <th className="px-3 py-2.5">
                          Items
                          {selectedGroup && (
                            <span className="text-[11px] font-normal text-blue-100 ml-1.5">
                              ({selectedGroup.name})
                            </span>
                          )}
                        </th>
                        <th className="px-3 py-2.5 text-right w-16" colSpan={2}>
                          <button
                            type="button"
                            onClick={openNewItemModal}
                            disabled={!selectedGroup}
                            className="text-white hover:text-amber-200 transition p-0.5 cursor-pointer disabled:opacity-50"
                            title="Add New Item"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {currentItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-2">
                            <div className="text-slate-800 font-bold">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal flex items-center gap-2">
                              {item.secondLangName && <span>{item.secondLangName}</span>}
                              {item.barcode && <span className="font-mono">[{item.barcode}]</span>}
                              {item.price !== undefined && (
                                <span className="text-emerald-700 font-semibold">${item.price.toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-1 py-2 text-right w-8">
                            <button
                              type="button"
                              onClick={() => openEditItemModal(item)}
                              className="text-primary hover:text-primary transition p-0.5 cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="px-2 py-2 text-right w-8">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-700 hover:text-red-900 transition p-0.5 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {currentItems.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-slate-400 italic">
                            {selectedGroup
                              ? 'No items under this group. Click + to add.'
                              : 'Select a group to view items.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step Navigation Buttons (Matching Omega lines 5143-5150) */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(4);
                    showToast('Inventory setup synchronized! Proceeding to Step 4: Employee Setup.');
                  }}
                  className="px-8 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Employee Setup & Access Roles</h2>
              <p className="text-xs text-slate-500">Cashiers, Administrators, Station Operators, and PIN security credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block text-sm">Active System Operator</span>
              <span className="text-slate-600 mt-1 block">Mohammed (Super Administrator) - Branch Zeit w zaytoun ljanoub</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block text-sm">Security Matrix</span>
              <span className="text-slate-600 mt-1 block">Full permissions granted for Sales Control, Cash Closing & Invoicing</span>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Congratulations! Quick Setup Complete</h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Your Vanguard / Omega ERP deployment is fully synchronized. All branch profiles, multi-currencies, tax tables, payment types, and workstations are operational.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href="/backoffice/operations?section=sales"
                className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                Open Sales Workstation
              </a>
              <a
                href="/backoffice/operations?section=products_services"
                className="px-6 py-2 rounded bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-sm"
              >
                Products &amp; Services Matrix
              </a>
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-8 py-2 rounded bg-destructive hover:bg-destructive/90 text-white font-bold text-xs transition shadow-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT TAX CONFIGURATION (AUTHENTIC OMEGA FEATURE)
          Fields: ID / Tax Description / Tax Rate*
          Buttons: Apply On All Groups | Apply On All Employee Roles | Save
          ========================================================================= */}
      {editingTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Receipt className="w-4 h-4" />
                <span>Edit Tax Configuration</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTax(null)}
                className="text-white hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Table / Form */}
            <div className="p-6 space-y-4">
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 w-16">ID</th>
                      <th className="px-4 py-2.5">Tax Description</th>
                      <th className="px-4 py-2.5 w-32">Tax Rate*</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-500">{editingTax.id}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editingTax.description}
                          onChange={(e) =>
                            setEditingTax({ ...editingTax, description: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            value={editingTax.rate}
                            onChange={(e) =>
                              setEditingTax({
                                ...editingTax,
                                rate: parseFloat(e.target.value) || 0
                              })
                            }
                            className="w-20 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-bold font-mono focus:outline-none focus:border-primary"
                          />
                          <span className="font-bold text-slate-600">%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Set fiscal VAT or sales levy rate. Use the buttons below to bulk propagate changes to inventory groups or role overrides.
              </p>

              {/* 3 Buttons requested by user: Apply On All Groups / Apply On All Employee Roles / Save */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Applied Tax #${editingTax.id} (${editingTax.rate}%) to All Groups!`);
                  }}
                  className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                >
                  Apply On All Groups
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Applied Tax #${editingTax.id} Configuration to All Employee Roles!`);
                  }}
                  className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                >
                  Apply On All Employee Roles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTaxes(taxes.map((t) => (t.id === editingTax.id ? editingTax : t)));
                    setEditingTax(null);
                    showToast(`Tax #${editingTax.id} (${editingTax.description}) updated successfully!`);
                  }}
                  className="px-5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NEW CURRENCY (Opened from Currency Setup "+ New Currency")
          ========================================================================= */}
      {isNewCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-6 py-3.5 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Coins className="w-4 h-4 text-amber-300" />
                <span>New Currency Configuration</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCurrencyModalOpen(false)}
                className="text-white hover:text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!availableCurrencies.includes(newCurrencyForm.code.toUpperCase())) {
                  setAvailableCurrencies([...availableCurrencies, newCurrencyForm.code.toUpperCase()]);
                }
                setIsNewCurrencyModalOpen(false);
                showToast(`Currency "${newCurrencyForm.code.toUpperCase()}" added to Quick Setup!`);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code (3-Letters)</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={newCurrencyForm.code}
                  onChange={(e) =>
                    setNewCurrencyForm({ ...newCurrencyForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    required
                    value={newCurrencyForm.symbol}
                    onChange={(e) =>
                      setNewCurrencyForm({ ...newCurrencyForm, symbol: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Decimals</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={newCurrencyForm.decimals}
                    onChange={(e) =>
                      setNewCurrencyForm({
                        ...newCurrencyForm,
                        decimals: parseInt(e.target.value) || 2
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newCurrencyForm.description}
                  onChange={(e) =>
                    setNewCurrencyForm({ ...newCurrencyForm, description: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exchange Rate vs USD ($)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newCurrencyForm.rateVsUsd}
                  onChange={(e) =>
                    setNewCurrencyForm({
                      ...newCurrencyForm,
                      rateVsUsd: parseFloat(e.target.value) || 1
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCurrencyModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
                >
                  Save Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PAYMENT TYPE
          ========================================================================= */}
      {isPaymentTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-6 py-3.5 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>
                  {editingPaymentType ? 'Edit Payment Type' : 'Add Payment Type'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentTypeModalOpen(false)}
                className="text-white hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingPaymentType) {
                  setPaymentTypes(
                    paymentTypes.map((pt) =>
                      pt.id === editingPaymentType.id
                        ? {
                            ...pt,
                            description: paymentTypeForm.description,
                            type: paymentTypeForm.type,
                            currency: paymentTypeForm.currency
                          }
                        : pt
                    )
                  );
                  showToast(`Payment Type "${paymentTypeForm.description}" updated!`);
                } else {
                  setPaymentTypes([
                    ...paymentTypes,
                    {
                      id: Date.now(),
                      description: paymentTypeForm.description,
                      type: paymentTypeForm.type,
                      currency: paymentTypeForm.currency
                    }
                  ]);
                  showToast(`Payment Type "${paymentTypeForm.description}" added!`);
                }
                setIsPaymentTypeModalOpen(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Description</label>
                <input
                  type="text"
                  required
                  value={paymentTypeForm.description}
                  onChange={(e) =>
                    setPaymentTypeForm({ ...paymentTypeForm, description: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Type</label>
                  <select
                    value={paymentTypeForm.type}
                    onChange={(e) =>
                      setPaymentTypeForm({ ...paymentTypeForm, type: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Voucher">Voucher</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={paymentTypeForm.currency}
                    onChange={(e) =>
                      setPaymentTypeForm({ ...paymentTypeForm, currency: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  >
                    {availableCurrencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentTypeModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
                >
                  Save Payment Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD BUSINESS TYPE
          ========================================================================= */}
      {isBusinessTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-5 py-3 bg-primary text-white flex items-center justify-between">
              <span className="font-bold text-xs">Add New Business Type</span>
              <button
                type="button"
                onClick={() => setIsBusinessTypeModalOpen(false)}
                className="text-white hover:opacity-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newBusinessTypeInput.trim()) {
                  setBusinessTypes([...businessTypes, newBusinessTypeInput.trim()]);
                  setSelectedBusinessType(newBusinessTypeInput.trim());
                  setNewBusinessTypeInput('');
                  setIsBusinessTypeModalOpen(false);
                  showToast('New Business Type added!');
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Classification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olive oil Milling & Bottling"
                  value={newBusinessTypeInput}
                  onChange={(e) => setNewBusinessTypeInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBusinessTypeModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white font-bold shadow-xs"
                >
                  Add Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LOGICAL WAREHOUSE (AUTHENTIC OMEGA media_1789170497961.png)
          ========================================================================= */}
      {isLogicalWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Logical Warehouse</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingLogicalWarehouse ? 'Edit Logical Warehouse' : 'New Logical Warehouse'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogicalWarehouseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingLogicalWarehouse) {
                  setLogicalPrinters(
                    logicalPrinters.map((lp) =>
                      lp.id === editingLogicalWarehouse.id
                        ? { ...lp, description: logicalWarehouseDesc }
                        : lp
                    )
                  );
                  showToast(`Logical Warehouse "${logicalWarehouseDesc}" saved.`);
                } else {
                  setLogicalPrinters([
                    ...logicalPrinters,
                    { id: Date.now(), description: logicalWarehouseDesc }
                  ]);
                  showToast(`New Logical Warehouse "${logicalWarehouseDesc}" added.`);
                }
                setIsLogicalWarehouseModalOpen(false);
              }}
              className="p-6 space-y-5 text-xs"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={logicalWarehouseDesc}
                  onChange={(e) => setLogicalWarehouseDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingLogicalWarehouse) {
                      setLogicalPrinters(
                        logicalPrinters.map((lp) =>
                          lp.id === editingLogicalWarehouse.id
                            ? { ...lp, description: logicalWarehouseDesc }
                            : lp
                        )
                      );
                    } else {
                      setLogicalPrinters([
                        ...logicalPrinters,
                        { id: Date.now(), description: logicalWarehouseDesc }
                      ]);
                    }
                    showToast(`Logical Warehouse "${logicalWarehouseDesc}" saved for all Branches!`);
                    setIsLogicalWarehouseModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save for all Branches</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PHYSICAL PRINTER (AUTHENTIC OMEGA fetched_CompanyInfo_PhysicalPrinterModify)
          ========================================================================= */}
      {isPhysicalPrinterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Physical Printer</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingPhysicalPrinter ? 'Edit Physical Printer' : 'New Physical Printer'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhysicalPrinterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingPhysicalPrinter) {
                  setPhysicalPrinters(
                    physicalPrinters.map((pp) =>
                      pp.id === editingPhysicalPrinter.id
                        ? {
                            ...pp,
                            description: physicalPrinterForm.description,
                            brand: physicalPrinterForm.brand,
                            printerType: physicalPrinterForm.printerType,
                            printerSeries: physicalPrinterForm.printerSeries,
                            address: physicalPrinterForm.address
                          }
                        : pp
                    )
                  );
                  showToast(`Physical Printer "${physicalPrinterForm.description}" updated.`);
                } else {
                  setPhysicalPrinters([
                    ...physicalPrinters,
                    {
                      id: Date.now(),
                      description: physicalPrinterForm.description,
                      brand: physicalPrinterForm.brand,
                      printerType: physicalPrinterForm.printerType,
                      printerSeries: physicalPrinterForm.printerSeries,
                      address: physicalPrinterForm.address
                    }
                  ]);
                  showToast(`Physical Printer "${physicalPrinterForm.description}" created.`);
                }
                setIsPhysicalPrinterModalOpen(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={physicalPrinterForm.description}
                    onChange={(e) =>
                      setPhysicalPrinterForm({ ...physicalPrinterForm, description: e.target.value })
                    }
                    placeholder="e.g. Barista 2"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <select
                    value={physicalPrinterForm.brand}
                    onChange={(e) =>
                      setPhysicalPrinterForm({ ...physicalPrinterForm, brand: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  >
                    <option value="Epson">Epson</option>
                    <option value="Star Micronics">Star Micronics</option>
                    <option value="Bixolon">Bixolon</option>
                    <option value="Citizen">Citizen</option>
                    <option value="Custom">Custom</option>
                    <option value="Sunmi">Sunmi</option>
                    <option value="Xprinter">Xprinter</option>
                    <option value="Rongta">Rongta</option>
                    <option value="Generic ESC/POS">Generic ESC/POS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Printer Type</label>
                  <select
                    value={physicalPrinterForm.printerType}
                    onChange={(e) =>
                      setPhysicalPrinterForm({ ...physicalPrinterForm, printerType: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  >
                    <option value="Ip">Network / IP</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="USB">USB / Driver</option>
                    <option value="Spooler">Windows Spooler</option>
                  </select>
                </div>

                {physicalPrinterForm.printerType === 'Ip' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">printer Ip *</label>
                    <input
                      type="text"
                      required
                      value={physicalPrinterForm.address}
                      onChange={(e) =>
                        setPhysicalPrinterForm({ ...physicalPrinterForm, address: e.target.value })
                      }
                      placeholder="192.168.0.1"
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">printer Name *</label>
                    <input
                      type="text"
                      required
                      value={physicalPrinterForm.address}
                      onChange={(e) =>
                        setPhysicalPrinterForm({ ...physicalPrinterForm, address: e.target.value })
                      }
                      placeholder="e.g. EPSON TM-T20"
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Printer Series</label>
                  <select
                    value={physicalPrinterForm.printerSeries}
                    onChange={(e) =>
                      setPhysicalPrinterForm({ ...physicalPrinterForm, printerSeries: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  >
                    <option value="TM-T20">TM-T20 / TM-T20II / TM-T20III</option>
                    <option value="TM-T88">TM-T88IV / TM-T88V / TM-T88VI</option>
                    <option value="TM-m30">TM-m30 / TM-m30II</option>
                    <option value="TSP100">TSP100 / TSP143</option>
                    <option value="TSP650">TSP650II</option>
                    <option value="SRP-350">SRP-350plusIII</option>
                    <option value="SRP-330">SRP-330II</option>
                    <option value="Generic ESC/POS">Standard ESC/POS 80mm</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhysicalPrinterModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-semibold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: WORKSTATION EDIT (AUTHENTIC OMEGA media_1789170497972.png & media_1789170497990.png)
          ========================================================================= */}
      {editingWorkstation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-2xl my-8 rounded-xl overflow-hidden shadow-2xl text-slate-800 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
              <h2 className="text-2xl font-bold text-foreground">Workstation</h2>
              <button
                type="button"
                onClick={() => setEditingWorkstation(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Top Row: ID & WorkStation Name */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-slate-700 font-semibold mb-1">ID</label>
                  <input
                    type="text"
                    disabled
                    value={workstationForm.workstationId}
                    className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 font-bold cursor-not-allowed"
                  />
                </div>
                <div className="col-span-9">
                  <label className="block text-slate-700 font-semibold mb-1">WorkStation Name *</label>
                  <input
                    type="text"
                    required
                    value={workstationForm.name}
                    onChange={(e) =>
                      setWorkstationForm({ ...workstationForm, name: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Fieldset 1: Printers */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Printers
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Check 1</label>
                    <select
                      value={workstationForm.check1}
                      onChange={(e) =>
                        setWorkstationForm({ ...workstationForm, check1: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      <option value="A4">A4</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bar">Bar</option>
                      <option value="Null">Null</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Check 2</label>
                    <select
                      value={workstationForm.check2}
                      onChange={(e) =>
                        setWorkstationForm({ ...workstationForm, check2: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      <option value="Null">Null</option>
                      <option value="A4">A4</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bar">Bar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fieldset 2: Options */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Options
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Menu */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Menu *</label>
                    <select
                      value={workstationForm.menu}
                      onChange={(e) =>
                        setWorkstationForm({ ...workstationForm, menu: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 mb-1.5"
                    >
                      {menusList.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddMenuModalOpen(true)}
                      className="p-1 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Add Menu"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Mode *</label>
                    <select
                      value={workstationForm.mode}
                      onChange={(e) =>
                        setWorkstationForm({ ...workstationForm, mode: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      <option value="MODE 1">MODE 1</option>
                      <option value="MODE 2">MODE 2</option>
                      <option value="MODE 3">MODE 3</option>
                      <option value="MODE 4">MODE 4</option>
                    </select>
                  </div>

                  {/* Main Screen */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Main Screen *</label>
                    <select
                      value={workstationForm.mainScreen}
                      onChange={(e) =>
                        setWorkstationForm({ ...workstationForm, mainScreen: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 mb-1.5"
                    >
                      {screensList.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddScreenModalOpen(true)}
                      className="p-1 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Add Main Screen"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fieldset 3: Preference */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Preference
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Cust. dis. port</label>
                      <select
                        value={workstationForm.custDisPort}
                        onChange={(e) =>
                          setWorkstationForm({ ...workstationForm, custDisPort: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      >
                        <option value="Select Cust. dis. port">Select Cust. dis. port</option>
                        <option value="COM 1">COM 1</option>
                        <option value="COM 2">COM 2</option>
                        <option value="COM 3">COM 3</option>
                        <option value="COM 4">COM 4</option>
                        <option value="Null">Null</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Cash Drawer Port *</label>
                      <select
                        value={workstationForm.cashDrawerPort}
                        onChange={(e) =>
                          setWorkstationForm({ ...workstationForm, cashDrawerPort: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      >
                        <option value="Null">Null</option>
                        <option value="COM 1">COM 1</option>
                        <option value="COM 2">COM 2</option>
                        <option value="Printer RJ12">Printer RJ12</option>
                        <option value="USB">USB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Caller ID Port *</label>
                      <select
                        value={workstationForm.callerIdPort}
                        onChange={(e) =>
                          setWorkstationForm({ ...workstationForm, callerIdPort: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      >
                        <option value="3">3</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="Null">Null</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Scale Port</label>
                      <select
                        value={workstationForm.scalePort}
                        onChange={(e) =>
                          setWorkstationForm({ ...workstationForm, scalePort: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      >
                        <option value="Select Scale Port">Select Scale Port</option>
                        <option value="COM 1">COM 1</option>
                        <option value="COM 2">COM 2</option>
                        <option value="USB HID">USB HID</option>
                        <option value="Null">Null</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Reader Serial Number</label>
                      <input
                        type="text"
                        value={workstationForm.readerSerial}
                        onChange={(e) =>
                          setWorkstationForm({ ...workstationForm, readerSerial: e.target.value })
                        }
                        placeholder="Enter Serial Number"
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fieldset 4: Logical Warehouse (Matching Screenshots 3 & 4) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Logical Warehouse
                </div>
                <div className="p-4 space-y-3">
                  {/* Green Button: Apply Locations On All Workstations */}
                  <button
                    type="button"
                    onClick={() => {
                      setWorkstations(
                        workstations.map((w) => ({
                          ...w,
                          locations: { ...workstationForm.locations }
                        }))
                      );
                      showToast('Locations applied to all workstations successfully!');
                    }}
                    className="w-full py-2 px-4 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs cursor-pointer text-center"
                  >
                    Apply Locations On All Workstations
                  </button>

                  {/* Table: Logical Warehouse & Location */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 w-1/2">Logical Warehouse</th>
                          <th className="px-3 py-2 w-1/2">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {Array.from({ length: showMoreLocations ? 20 : 10 }).map((_, idx) => {
                          const warehouseName = idx === 0 ? 'Main Store' : 'Null';
                          const selectedLoc =
                            workstationForm.locations?.[idx] || (idx === 0 ? 'Main Store' : 'Select Location');

                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 text-slate-700 font-semibold">
                                {warehouseName}
                              </td>
                              <td className="px-3 py-1.5">
                                <select
                                  value={selectedLoc}
                                  onChange={(e) =>
                                    setWorkstationForm({
                                      ...workstationForm,
                                      locations: {
                                        ...workstationForm.locations,
                                        [idx]: e.target.value
                                      }
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                                >
                                  <option value="Select Location">Select Location</option>
                                  <option value="Main Store">Main Store</option>
                                  <option value="Warehouse A">Warehouse A</option>
                                  <option value="Warehouse B">Warehouse B</option>
                                  <option value="Retail Shelf">Retail Shelf</option>
                                  <option value="Cold Storage">Cold Storage</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Show More Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowMoreLocations(!showMoreLocations)}
                      className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      {showMoreLocations ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Save Button */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setWorkstations(
                    workstations.map((w) =>
                      w.id === editingWorkstation.id
                        ? {
                            ...w,
                            ...workstationForm
                          }
                        : w
                    )
                  );
                  showToast(`Workstation "${workstationForm.name}" saved successfully!`);
                  setEditingWorkstation(null);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUICK SUB-MODALS: ADD MENU & ADD SCREEN (For Workstation Options)
          ========================================================================= */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-5 py-3 bg-primary text-white flex items-center justify-between">
              <span className="font-bold text-xs">Add New Menu</span>
              <button
                type="button"
                onClick={() => setIsAddMenuModalOpen(false)}
                className="text-white hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMenuInput.trim()) {
                  setMenusList([...menusList, newMenuInput.trim()]);
                  setWorkstationForm({ ...workstationForm, menu: newMenuInput.trim() });
                  setNewMenuInput('');
                  setIsAddMenuModalOpen(false);
                  showToast(`Menu "${newMenuInput.trim()}" added!`);
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Menu Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Express POS Menu"
                  value={newMenuInput}
                  onChange={(e) => setNewMenuInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMenuModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white font-bold shadow-xs cursor-pointer"
                >
                  Add Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddScreenModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl text-slate-800">
            <div className="px-5 py-3 bg-primary text-white flex items-center justify-between">
              <span className="font-bold text-xs">Add New Main Screen</span>
              <button
                type="button"
                onClick={() => setIsAddScreenModalOpen(false)}
                className="text-white hover:opacity-75 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newScreenInput.trim()) {
                  setScreensList([...screensList, newScreenInput.trim()]);
                  setWorkstationForm({ ...workstationForm, mainScreen: newScreenInput.trim() });
                  setNewScreenInput('');
                  setIsAddScreenModalOpen(false);
                  showToast(`Main Screen "${newScreenInput.trim()}" added!`);
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Screen Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. DINE_IN_MAP"
                  value={newScreenInput}
                  onChange={(e) => setNewScreenInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddScreenModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white font-bold shadow-xs cursor-pointer"
                >
                  Add Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: NEW / EDIT INVENTORY CATEGORY (AUTHENTIC OMEGA SCREENSHOT 1)
          Header: New Inventory Category
          Predefined: Select Predefined Category
          Fields: Category description* | Second Lang Description | Sorting
          Image Box: Preview, Select image, Remove, "50 x 50px    Max: 10KB" (in red)
          Footer: Save button with Floppy disk icon
          ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded-md overflow-hidden shadow-2xl text-slate-800 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-normal text-slate-700">
                {editingCategory ? 'Edit Inventory Category' : 'New Inventory Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              {/* Top Right: Select Predefined Category */}
              <div className="flex justify-end">
                <div className="w-64">
                  <select
                    value={categoryForm.predefined}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryForm((prev) => ({
                        ...prev,
                        predefined: val,
                        description: val !== 'Select Predefined Category' ? val : prev.description
                      }));
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  >
                    {predefinedCategoriesList.map((pc) => (
                      <option key={pc} value={pc}>
                        {pc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Row: Category description* | Second Lang Description | Sorting */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Category description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    className="w-full bg-white border border-blue-400 ring-2 ring-blue-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    value={categoryForm.secondLangDescription}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        secondLangDescription: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Sorting</label>
                  <input
                    type="number"
                    value={categoryForm.sorting}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, sorting: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Panel: Image (100% Matching Screenshot 1) */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Image
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-3">
                  {/* Image Preview Box */}
                  <div className="w-48 h-32 bg-muted border border-slate-200 flex items-center justify-center overflow-hidden">
                    {categoryForm.image ? (
                      <img
                        src={categoryForm.image}
                        alt="Category Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  {/* Buttons: Select image & Remove */}
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-xs">
                      Select image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFilePick(e, 10, (url) =>
                            setCategoryForm((prev) => ({ ...prev, image: url }))
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, image: null })}
                      className="px-4 py-1.5 rounded bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Red Limit Warning */}
                  <div className="text-[11px] text-red-600 font-medium flex items-center gap-4">
                    <span>50 x 50px</span>
                    <span>Max: 10KB</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Save Button with Floppy Disk */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: NEW / EDIT INVENTORY DIVISION (AUTHENTIC OMEGA SCREENSHOT 2)
          Header: New Inventory Division
          Fields: Division Name* | Category* (+ button) | Sorting | Second Lang Name
          Image Box: Preview, Select image, Remove
          Footer: Save button with Floppy disk icon
          ========================================================================= */}
      {isDivisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded-md overflow-hidden shadow-2xl text-slate-800 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-normal text-slate-700">
                {editingDivision ? 'Edit Inventory Division' : 'New Inventory Division'}
              </h2>
              <button
                type="button"
                onClick={() => setIsDivisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDivision} className="p-6 space-y-4 text-xs">
              {/* Row 1: Division Name* | Category* (+ button) | Sorting */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Division Name*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={divisionForm.name}
                    onChange={(e) =>
                      setDivisionForm({ ...divisionForm, name: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">Category*</label>
                  <div className="flex gap-1.5">
                    <select
                      value={divisionForm.categoryId}
                      onChange={(e) =>
                        setDivisionForm({
                          ...divisionForm,
                          categoryId: parseInt(e.target.value) || 1
                        })
                      }
                      className="flex-1 bg-white border border-blue-400 ring-2 ring-blue-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNewCategoryModal()}
                      className="px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Add New Category"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Sorting</label>
                  <input
                    type="number"
                    value={divisionForm.sorting}
                    onChange={(e) =>
                      setDivisionForm({ ...divisionForm, sorting: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Second Lang Name */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={divisionForm.secondLangName}
                    onChange={(e) =>
                      setDivisionForm({ ...divisionForm, secondLangName: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Panel: Image (100% Matching Screenshot 2) */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Image
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-3">
                  {/* Image Preview Box */}
                  <div className="w-48 h-32 bg-muted border border-slate-200 flex items-center justify-center overflow-hidden">
                    {divisionForm.image ? (
                      <img
                        src={divisionForm.image}
                        alt="Division Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  {/* Buttons: Select image & Remove */}
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-xs">
                      Select image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFilePick(e, 50, (url) =>
                            setDivisionForm((prev) => ({ ...prev, image: url }))
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setDivisionForm({ ...divisionForm, image: null })}
                      className="px-4 py-1.5 rounded bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Save Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NEW / EDIT INVENTORY GROUP (AUTHENTIC OMEGA SCREENSHOT 3)
          Header: New Inventory Group
          Fields: Group name* | Other description
          Row 2: Division* (+ button) | Second Lang Name | Sorting
          Row 3: Discount Percentage | [ ] Use as Master in E-Commerce
          Panel: Accounting (Asset account, Revenue account, Expense account, Adjustment account)
          Panel: Tax (Tax1..Tax6 checkboxes with Tax1 checked by default)
          Panel: E-Commerce Image (Preview, Select image, Remove)
          Footer: Save button with Floppy disk icon
          ========================================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded-md overflow-hidden shadow-2xl text-slate-800 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-normal text-slate-700">
                {editingGroup ? 'Edit Inventory Group' : 'New Inventory Group'}
              </h2>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4 text-xs">
              {/* Row 1: Group name* | Other description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Group name*</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="w-full bg-white border border-blue-400 ring-2 ring-blue-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Other description</label>
                  <input
                    type="text"
                    value={groupForm.otherDescription}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, otherDescription: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Division* (+ button) | Second Lang Name | Sorting */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">Division*</label>
                  <div className="flex gap-1.5">
                    <select
                      value={groupForm.divisionId}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          divisionId: parseInt(e.target.value) || 101
                        })
                      }
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      {allDivisionsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.categoryName})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNewDivisionModal()}
                      className="px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Add New Division"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                </div>

                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Second Lang Name
                  </label>
                  <input
                    type="text"
                    value={groupForm.secondLangName}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, secondLangName: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Sorting</label>
                  <input
                    type="number"
                    value={groupForm.sorting}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, sorting: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 3: Discount Percentage | [ ] Use as Master in E-Commerce */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-6">
                  <label className="block text-slate-700 font-medium mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={groupForm.discountPercentage}
                    onChange={(e) =>
                      setGroupForm({
                        ...groupForm,
                        discountPercentage: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div className="col-span-6 pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={groupForm.useAsMasterInEcommerce}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          useAsMasterInEcommerce: e.target.checked
                        })
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-400 w-4 h-4"
                    />
                    <span className="text-slate-700 font-medium text-xs">
                      Use as Master in E-Commerce
                    </span>
                  </label>
                </div>
              </div>

              {/* Panel: Accounting (Exact Match to Screenshot 3) */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Accounting
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Asset account
                      </label>
                      <input
                        type="text"
                        value={groupForm.assetAccount}
                        onChange={(e) =>
                          setGroupForm({ ...groupForm, assetAccount: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Revenue account
                      </label>
                      <input
                        type="text"
                        value={groupForm.revenueAccount}
                        onChange={(e) =>
                          setGroupForm({ ...groupForm, revenueAccount: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Expense account
                      </label>
                      <input
                        type="text"
                        value={groupForm.expenseAccount}
                        onChange={(e) =>
                          setGroupForm({ ...groupForm, expenseAccount: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Adjustment account
                      </label>
                      <input
                        type="text"
                        value={groupForm.adjustmentAccount}
                        onChange={(e) =>
                          setGroupForm({
                            ...groupForm,
                            adjustmentAccount: e.target.value
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel: Tax (Exact Match to Screenshot 3: 3 Columns x 2 Rows) */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Tax
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                    {['Tax1', 'Tax2', 'Tax3', 'Tax4', 'Tax5', 'Tax6'].map((taxKey) => (
                      <label
                        key={taxKey}
                        className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={!!groupForm.taxes[taxKey]}
                          onChange={(e) =>
                            setGroupForm({
                              ...groupForm,
                              taxes: {
                                ...groupForm.taxes,
                                [taxKey]: e.target.checked
                              }
                            })
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-400 w-4 h-4"
                        />
                        <span>{taxKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel: E-Commerce Image (Exact Match to Screenshot 3) */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  E-Commerce Image
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-3">
                  {/* Image Preview Box */}
                  <div className="w-48 h-32 bg-muted border border-slate-200 flex items-center justify-center overflow-hidden">
                    {groupForm.ecommerceImage ? (
                      <img
                        src={groupForm.ecommerceImage}
                        alt="Group Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  {/* Buttons: Select image & Remove */}
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-xs">
                      Select image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFilePick(e, 50, (url) =>
                            setGroupForm((prev) => ({ ...prev, ecommerceImage: url }))
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setGroupForm({ ...groupForm, ecommerceImage: null })
                      }
                      className="px-4 py-1.5 rounded bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Save Button with Floppy Disk */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NEW / EDIT INVENTORY ITEM (Table 4 Items in Omega Hierarchy)
          Header: New Inventory Item
          Fields: Item description* | Second Lang Description | Group* (+ button)
                  Barcode | Unit | Selling Price | Cost
          Image Box: Preview, Select image, Remove
          Footer: Save button with Floppy disk icon
          ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-xl rounded-md overflow-hidden shadow-2xl text-slate-800 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-normal text-slate-700">
                {editingItem ? 'Edit Inventory Item' : 'New Inventory Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              {/* Row 1: Item description* | Second Lang Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Item description*
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. EXTRA VIRGIN OLIVE OIL 1 LITRE (J)"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full bg-white border border-blue-400 ring-2 ring-blue-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Second Lang Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra Virgin Olive Oil 1L"
                    value={itemForm.secondLangName}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, secondLangName: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Group* (+ button) | Barcode | Unit */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">Group*</label>
                  <div className="flex gap-1.5">
                    <select
                      value={itemForm.groupId}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          groupId: parseInt(e.target.value) || 1001
                        })
                      }
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    >
                      {allGroupsList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.divisionName})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openNewGroupModal()}
                      className="px-2 py-1.5 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Add New Group"
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                </div>

                <div className="col-span-4">
                  <label className="block text-slate-700 font-medium mb-1">Barcode</label>
                  <input
                    type="text"
                    value={itemForm.barcode}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, barcode: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-slate-700 font-medium mb-1">Unit</label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  >
                    <option value="Litre">Litre</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Tin">Tin</option>
                    <option value="Piece">Piece</option>
                    <option value="Kg">Kg</option>
                    <option value="Box">Box</option>
                    <option value="Silo">Silo</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Price & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={itemForm.cost}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, cost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Panel: Image */}
              <div className="border border-slate-200 rounded-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs text-slate-800">
                  Image
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-3">
                  <div className="w-48 h-32 bg-muted border border-slate-200 flex items-center justify-center overflow-hidden">
                    {itemForm.image ? (
                      <img
                        src={itemForm.image}
                        alt="Item Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg select-none">
                        no-image
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer shadow-xs">
                      Select image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFilePick(e, 50, (url) =>
                            setItemForm((prev) => ({ ...prev, image: url }))
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setItemForm({ ...itemForm, image: null })}
                      className="px-4 py-1.5 rounded bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Save Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
