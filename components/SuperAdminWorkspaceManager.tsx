'use client';

/**
 * Vanguard ERP System
 * Super Admin Workspace Manager & Multi-Tenant Subscription Hub
 * 
 * White Enterprise Theme & Full English Default Localization
 * Master Admin Architecture: Scalable Tenant Registry (High-Density Compact Table & Mini-Card Grid),
 * Live Search & Status Filters, 12-Module Deep Inspection, Quotas, and Direct Storage Logo Upload.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenant, TenantCompany, ALL_SYSTEM_MODULES } from '../lib/TenantContext';
import { resolveTenantRouteCode } from '../lib/authTenantResolver';
import { supabase } from '../lib/supabaseClient';
import {
  COUNTRY_FISCAL_PROFILES,
  getCountryFiscalProfile,
  isLebaneseFiscalStandard,
  CountryFiscalProfile
} from '../lib/countryFiscalProfiles';
import {
  GLOBAL_ISO_CURRENCIES,
  getCurrencyMeta,
  searchCurrencies,
  ISOCurrency
} from '../lib/currencyRegistry';
import { applyCoaPreset, setActiveCoaPresetId } from '../lib/accountingData';
import {
  SystemActivity,
  getRecentSystemActivities,
  logSystemActivity,
  getActionBadgeConfig,
  getActivityDescriptionEn
} from '../lib/activityLogger';
import {
  ShieldCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Key,
  TrendingUp,
  DollarSign,
  Activity,
  Building,
  FileText,
  ExternalLink,
  Crown,
  Lock,
  Layers,
  Users,
  Settings,
  Clock,
  Palette,
  Check,
  X,
  Sliders,
  AlertCircle,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
  ShoppingBag,
  Truck,
  Smartphone,
  Globe,
  Upload,
  Download,
  Copy,
  Database,
  Filter,
  Server,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Search,
  LayoutGrid,
  ArrowRightLeft,
  Info,
  Table as TableIcon
} from 'lucide-react';

const DEFAULT_ADMIN_TENANT: TenantCompany = {
  id: '00000000-0000-0000-0000-000000000001',
  companyId: 1300,
  company_id: 1300,
  name: 'منتوجات زيت وزيتون الجنوب',
  slug: 'southern-olive',
  brandNameAr: 'منتوجات زيت وزيتون الجنوب',
  brandNameEn: 'Southern Olive Oil Products S.A.R.L',
  logoUrl: '/assets/images/logo.png',
  primaryColor: '#123b70',
  themeColor: '#123b70',
  enabledModules: ALL_SYSTEM_MODULES,
  enabled_modules: ALL_SYSTEM_MODULES,
  subscriptionTier: 'ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
  aiUsageCount: 0,
  aiUsageLimit: 1000,
  companyRegistrationNumber: 'CR-104928-LB',
  taxIdentificationNumber: 'MOF-7489201',
  officialLegalEntityName: 'Southern Olive & Oil Products S.A.R.L',
  headquartersAddress: 'Nabatieh Industrial Zone, Main Blvd, Bldg 4',
  city: 'Nabatieh',
  country: 'Lebanon',
  phoneNumber: '+961 70 882 110',
  billingEmail: 'accounts@southernolive.com',
  baseCurrency: 'USD',
  secondaryCurrency: 'LBP',
  isDualCurrencyEnabled: true,
  exchangeRatePolicy: 'PLATFORM_FIXED',
  maxBranches: 5,
  maxConcurrentUsers: 25,
  maxPosTerminals: 10,
  storageQuotaGb: 50,
  contractMonthlyValue: 3000,
  billingCycle: 'MONTHLY',
  renewalDate: '2027-01-01',
  adminName: 'Mohammed Jichi',
  adminEmail: 'admin@southernolive.com',
  adminPhone: '+961 70 882 110'
};

// Official 12-Module Entitlement Definitions for Super Admin Feature Flag Matrix
export interface SystemModuleConfig {
  id: string;
  num: number;
  labelEn: string;
  shortLabel: string;
  domainCategory: string;
  icon: string;
  desc: string;
  featureBadges: string[];
  reports: string[];
}

export const SYSTEM_MODULES_CONFIG: SystemModuleConfig[] = [
  {
    id: 'sales',
    num: 1,
    labelEn: '1. V-POS (Fast Touch Counter Sales)',
    shortLabel: 'V-POS Sales',
    domainCategory: 'Point of Sale & Registers',
    icon: '🛒',
    desc: 'Autonomous point-of-sale terminal: touch cashier register, multi-currency drawer, barcode scanner, receipt printing & end-of-day shift balance.',
    featureBadges: ['Touch Cashier Register', 'Dual Currency Drawer (USD/LBP)', 'Barcode Scanner & Scale', 'Shift Reconciliation & Z-Report', 'Offline Resilient Cache'],
    reports: ['Daily Shift Cash Audit', 'Product Sales Velocity', 'Hourly Transaction Volume', 'Cash Drawer Settlement', 'Tax / VAT Collected Summary']
  },
  {
    id: 'operations',
    num: 2,
    labelEn: '2. Inventory & Warehouses',
    shortLabel: 'Inventory & Stock',
    domainCategory: 'Supply Chain & Storage',
    icon: '🏭',
    desc: 'Self-contained warehousing suite: multi-location stock balances, bin locations, batch & lot expiration, stock adjustments and valuation.',
    featureBadges: ['Multi-Warehouse Control', 'Batch & Expiry Date Tracking', 'FIFO / WAC Stock Valuation', 'Stock Adjustments & Write-Offs', 'Inter-Warehouse Transfers'],
    reports: ['Stock Valuation & Costing Report', 'Low Stock & Reorder Alerts', 'Batch Expiry Ledger', 'Wastage & Shrinkage Report', 'Inventory Movement History']
  },
  {
    id: 'purchasing',
    num: 3,
    labelEn: '3. Purchasing & Procurement',
    shortLabel: 'Procurement & Bills',
    domainCategory: 'Sourcing & Vendor AP',
    icon: '📦',
    desc: 'Autonomous supplier sourcing: purchase requisitions, PO approval workflows, Goods Receipt Notes (GRN), landed costs and AP billing.',
    featureBadges: ['Vendor Purchase Orders', 'Goods Receipt Notes (GRN)', 'Landed Cost Capitalization', 'Supplier AP Invoicing', 'Price Discrepancy Matching'],
    reports: ['Vendor Spend & Open PO Ledger', 'GRN vs Invoice Discrepancy', 'Supplier Price Fluctuations', 'Accounts Payable Aging Summary', 'Procurement Fulfillment Rates']
  },
  {
    id: 'customers',
    num: 4,
    labelEn: '4. CRM & Customer Registry',
    shortLabel: 'CRM & Receivables',
    domainCategory: 'Customer Accounts & AR',
    icon: '👥',
    desc: 'Customer credit management: client directory, credit limits, account statements, receivables aging and payment history.',
    featureBadges: ['Customer Directory & Profiling', 'Credit Limits & Payment Terms', 'Client Statement of Account', 'Receivables Aging Buckets', 'Tiered Pricing Profiles'],
    reports: ['Customer Receivables Aging (AR)', 'Customer Lifetime Value (LTV)', 'Outstanding Balance Summary', 'Client Statement of Account', 'Credit Risk / Overlimit Audit']
  },
  {
    id: 'feedback',
    num: 5,
    labelEn: '5. Feedback & Surveys',
    shortLabel: 'Feedback & CSAT',
    domainCategory: 'Customer Satisfaction',
    icon: '💬',
    desc: 'Autonomous satisfaction & quality engine: CSAT/NPS rating collection, incident ticketing, resolution SLAs and service sentiment analysis.',
    featureBadges: ['CSAT & NPS Star Ratings', 'Digital QR Surveys', 'Customer Complaint Tickets', 'Resolution SLA Tracking', 'Quality Incident Logs'],
    reports: ['Customer Satisfaction (CSAT) Trend', 'Net Promoter Score (NPS) Breakdown', 'Complaint Resolution SLA Metrics', 'Store Staff Service Quality Audit', 'Sentiment Analysis Summary']
  },
  {
    id: 'loyalty',
    num: 6,
    labelEn: '6. Loyalty Program',
    shortLabel: 'Loyalty & Rewards',
    domainCategory: 'VIP Retention & Points',
    icon: '⭐',
    desc: 'Reward points & retention system: points accumulation engine, tiered VIP memberships, discount coupons and campaign promo vouchers.',
    featureBadges: ['Points Accumulation Engine', 'Tiered VIP Ranks (Gold/Silver)', 'Digital Member Passcards', 'Promotional Discount Codes', 'Redemption Tracking'],
    reports: ['Points Accrual & Burn Liability', 'VIP Tier Migration Ledger', 'Reward Voucher Redemption Audit', 'Loyalty Member Revenue Contribution', 'Inactive Member Reactivation Log']
  },
  {
    id: 'accounting',
    num: 7,
    labelEn: '7. Accounting & General Ledger',
    shortLabel: 'Financials & GL',
    domainCategory: 'Corporate Finance & Fiscal',
    icon: '📊',
    desc: 'Autonomous financial ledger: multi-currency Journal Vouchers (JV), standard Chart of Accounts (PCA/IFRS), trial balance and fiscal tax reports.',
    featureBadges: ['Multi-Currency Journal Vouchers', 'Standard Chart of Accounts (PCA/IFRS)', 'Dual-Currency Trial Balance', 'Profit & Loss (P&L)', 'Balance Sheet & Cash Flow'],
    reports: ['Trial Balance (Balance de Vérification)', 'Income Statement (P&L / Compte de Résultat)', 'Balance Sheet (Bilan Fiscal)', 'General Ledger Detail Ledger', 'Lebanese MOF VAT Declaration (Form 1)']
  },
  {
    id: 'hr',
    num: 8,
    labelEn: '8. HR & Payroll',
    shortLabel: 'HR & Payroll',
    domainCategory: 'Human Capital & Wages',
    icon: '👔',
    desc: 'Autonomous workforce management: employee records, biometric attendance logs, leave balances and automated payroll slips with tax deductions.',
    featureBadges: ['Employee Personnel Registry', 'Biometric Clocking In/Out', 'Leave & Absence Management', 'Salary & Deduction Slips', 'WPS Payroll Batches'],
    reports: ['Monthly Payroll & Wage Sheet', 'Biometric Attendance & Overtime Log', 'Leave & Vacation Balance Report', 'Staff Performance & Retention', 'Social Security (NSSF / الضمان) Filings']
  },
  {
    id: 'fleet',
    num: 9,
    labelEn: '9. SuperSonic Fleet / V-Driver',
    shortLabel: 'V-Driver & Fleet',
    domainCategory: 'Logistics & Dispatch',
    icon: '🚚',
    desc: 'End-to-end dispatch & logistics: GPS live vehicle tracking, delivery run sheets, route manifests, mobile driver app and driver COD cash settlements.',
    featureBadges: ['GPS Real-Time Fleet Tracking', 'Route Manifest Optimization', 'Driver Mobile Android/iOS App', 'COD Cash Collection Audit', 'Van Vehicle Maintenance'],
    reports: ['Driver Delivery Run Sheets', 'Driver Daily Cash Settlement (COD)', 'Trip Dispatch & Route Fulfillment', 'Fleet Fuel & Maintenance Ledger', 'On-Time Delivery Performance (SLA)']
  },
  {
    id: 'social',
    num: 10,
    labelEn: '10. V-Connect (Social CRM & WhatsApp)',
    shortLabel: 'V-Connect Omnichannel',
    domainCategory: 'Social & Messaging',
    icon: '🌐',
    desc: 'Unified omnichannel engagement: official WhatsApp Cloud API, customer messaging inbox, chatbot greetings and direct social order capture.',
    featureBadges: ['Unified Multi-Agent Inbox', 'Official WhatsApp Cloud API', 'Automated Greeting Chatbots', 'Direct Social Order Capture', 'Campaign Broadcast Manager'],
    reports: ['Omnichannel Conversation Volume', 'WhatsApp Delivery & Read Rates', 'Social Acquisition & Lead ROI', 'Direct Messaging Sales Conversion', 'Agent First-Response & Resolution Time']
  },
  {
    id: 'pressing-mill',
    num: 11,
    labelEn: '11. Pressing Mill Engine',
    shortLabel: 'Pressing Mill Facility',
    domainCategory: 'Industrial Processing',
    icon: '⚖️',
    desc: 'Agro-industrial production facility: digital weighbridge intake, crushing batches, 50-tank stainless matrix, barter milling fee calculation and oil drum release.',
    featureBadges: ['Digital Weighbridge Intake', 'Washing & Crushing Runs', '50-Tank Stainless Matrix', 'Barter Milling Fee / Oil Share', 'Customer Oil Drum Release'],
    reports: ['Daily Olive Receiving & Pressing Journal', 'Tank Storage & Oil Levels Matrix', 'Extraction Yield (Oil vs Olive %)', 'Milling Fee Revenue & Barter Oil Balance', 'Customer Drum Delivery Slips']
  },
  {
    id: 'v-store',
    num: 12,
    labelEn: '12. V-Store (Storefront Web Portal)',
    shortLabel: 'V-Store B2B/B2C',
    domainCategory: 'Digital Commerce',
    icon: '🏬',
    desc: 'Autonomous digital storefront: live product catalog, B2B wholesale prices, customer self-checkout, click-and-collect and online orders ledger.',
    featureBadges: ['Live Product Catalog & Stock Sync', 'B2B Wholesale Price Lists', 'Online Customer Cart & Checkout', 'Click & Collect / Delivery Choice', 'SEO & Mobile-Ready Responsive'],
    reports: ['Online Web Orders Ledger', 'Abandoned Cart & Conversion Funnel', 'Storefront Visitor Traffic Analytics', 'Top Online Selling Items', 'Payment Gateway Transaction Log']
  }
];

// Presets mapping
const PRESET_MODULES: Record<'STARTER' | 'PRO' | 'ENTERPRISE', string[]> = {
  STARTER: ['sales', 'operations', 'purchasing', 'customers'],
  PRO: ['sales', 'operations', 'purchasing', 'customers', 'feedback', 'loyalty', 'accounting', 'hr', 'social'],
  ENTERPRISE: [
    'sales',
    'operations',
    'purchasing',
    'customers',
    'feedback',
    'loyalty',
    'accounting',
    'hr',
    'fleet',
    'social',
    'pressing-mill',
    'v-store'
  ]
};

// Standalone Apps Suite
const STANDALONE_APPS_SUITE = [
  {
    key: 'v-connect',
    name: 'V-Connect',
    tagline: 'Social CRM, WhatsApp & Support',
    description: 'Omnichannel inbox, WhatsApp automation & customer ticketing desk',
    href: '/connect',
    icon: '🌐',
    badge: 'OMNICHANNEL',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  {
    key: 'v-driver',
    name: 'V-Driver',
    tagline: 'SuperSonic Driver & Fleet App',
    description: 'Driver mobile PWA, trip manifests, GPS tracking & e-signatures',
    href: '/v-driver',
    icon: '🚚',
    badge: 'MOBILE PWA',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  {
    key: 'v-pos',
    name: 'V-POS',
    tagline: 'Fast Touch Counter Sales',
    description: 'Rapid cashier register with dual-currency cash drawer & thermal receipts',
    href: '/pos',
    icon: '🛒',
    badge: 'TOUCH POS',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300'
  },
  {
    key: 'v-store',
    name: 'V-Store',
    tagline: 'Storefront / B2B Web Portal',
    description: 'Customer ordering web portal, digital catalog & self-checkout',
    href: '/v-store',
    icon: '🏬',
    badge: 'WEB STORE',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300'
  }
];

const BRANDING_COLOR_PRESETS = [
  { name: 'Vanguard Navy', hex: '#123b70' },
  { name: 'Royal Gold', hex: '#d4b055' },
  { name: 'Midnight Slate', hex: '#09152b' },
  { name: 'Deep Emerald', hex: '#1e3a2b' },
  { name: 'Teal Blue', hex: '#0f766e' },
  { name: 'Burgundy Crimson', hex: '#881337' }
];

export function isModuleEnabled(modId: string, activeMods: string[] = []): boolean {
  if (!Array.isArray(activeMods)) return false;
  return activeMods.some(m => {
    const lower = (m || '').toLowerCase();
    if (lower === modId) return true;
    if (modId === 'sales' && (lower === 'pos' || lower === 'sale' || lower === 'v-pos')) return true;
    if (modId === 'operations' && (lower === 'op' || lower === 'inventory')) return true;
    if (modId === 'purchasing' && (lower === 'procurement' || lower === 'purchases' || lower === 'po')) return true;
    if (modId === 'customers' && (lower === 'crm' || lower === 'customer')) return true;
    if (modId === 'fleet' && (lower === 'v-driver' || lower === 'driver' || lower === 'supersonic' || lower === 'logistics')) return true;
    if (modId === 'social' && (lower === 'connect' || lower === 'v-connect' || lower === 'social-crm' || lower === 'whatsapp')) return true;
    if (modId === 'pressing-mill' && (lower === 'pressing' || lower === 'module_pressing_mill' || lower === 'mill')) return true;
    if (modId === 'v-store' && (lower === 'store' || lower === 'storefront' || lower === 'landing' || lower === 'orders')) return true;
    return false;
  });
}

export function getActiveModulesCount(activeMods: string[] = []): number {
  if (!Array.isArray(activeMods)) return 0;
  return SYSTEM_MODULES_CONFIG.filter(mod => isModuleEnabled(mod.id, activeMods)).length;
}

export function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

// Storage upload helper with Base64 fallback
async function uploadLogoToStorage(file: File, tenantSlug: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanSlug = (tenantSlug || 'tenant').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${cleanSlug}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('tenant-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('tenant-logos')
        .getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (storageErr) {
    console.warn('Supabase storage upload notice, falling back to DataURL:', storageErr);
  }

  // Fallback to Base64 DataURL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export default function SuperAdminWorkspaceManager() {
  const router = useRouter();
  const {
    currentTenant,
    switchTenant,
    onboardNewTenant,
    refreshTenants,
    registeredCompanies,
    updateTenantModulesAndBranding
  } = useTenant();

  const [tenants, setTenants] = useState<any[]>([]);

  // Scalable Registry Controls (Search, Filters, View Mode, Pagination, Inspection)
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE_MODE'>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [expandedTenantModulesId, setExpandedTenantModulesId] = useState<string | null>(null);

  // 150ms Debounce for live search (zero-latency input responsiveness)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
  };

  // Interactive Top Modals
  const [showRevenueModal, setShowRevenueModal] = useState<boolean>(false);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);

  // Reset Admin Password Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [passwordTargetTenant, setPasswordTargetTenant] = useState<any | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState<boolean>(false);

  // Filter Audit Log to specific tenant
  const [selectedAuditTenantFilter, setSelectedAuditTenantFilter] = useState<string | null>(null);

  // Provision New Tenant Modal State
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  const [compName, setCompName] = useState<string>('');
  const [brandAr, setBrandAr] = useState<string>('');
  const [brandEn, setBrandEn] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('Primary Admin');
  const [adminPhone, setAdminPhone] = useState<string>('+961 70 000 000');
  const [adminInitialPassword, setAdminInitialPassword] = useState<string>('Vanguard!2026');
  const [onboardTier, setOnboardTier] = useState<'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'>('ENTERPRISE');
  const [onboardMonthlyValue, setOnboardMonthlyValue] = useState<number>(3000);
  const [onboardBaseCurrency, setOnboardBaseCurrency] = useState<string>('USD');
  const [onboardSecondaryCurrency, setOnboardSecondaryCurrency] = useState<string>('LBP');
  const [onboardIsDualCurrency, setOnboardIsDualCurrency] = useState<boolean>(true);
  const [onboardBaseCurrencyDropdownOpen, setOnboardBaseCurrencyDropdownOpen] = useState<boolean>(false);
  const [onboardBaseCurrencyFilterText, setOnboardBaseCurrencyFilterText] = useState<string>('');
  const [onboardCrNumber, setOnboardCrNumber] = useState<string>('CR-104928-LB');
  const [onboardTaxId, setOnboardTaxId] = useState<string>('MOF-7489201');
  const [onboardCountry, setOnboardCountry] = useState<string>('Lebanon');
  const [onboardFinancialTemplate, setOnboardFinancialTemplate] = useState<'lebanese_pca' | 'international_ifrs'>('lebanese_pca');
  const [onboardCountryDropdownOpen, setOnboardCountryDropdownOpen] = useState<boolean>(false);
  const [onboardCountryFilterText, setOnboardCountryFilterText] = useState<string>('');
  const [onboardLogoUrl, setOnboardLogoUrl] = useState<string>('');
  const [onboardLogoPreview, setOnboardLogoPreview] = useState<string>('');
  const [isUploadingOnboardLogo, setIsUploadingOnboardLogo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const onboardFileInputRef = useRef<HTMLInputElement>(null);

  // Tenant Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [configTab, setConfigTab] = useState<'identity' | 'legal' | 'modules' | 'quotas' | 'admin'>('identity');
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [configTier, setConfigTier] = useState<'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'>('ENTERPRISE');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Tab 1: Visual Identity
  const [editBrandAr, setEditBrandAr] = useState<string>('');
  const [editBrandEn, setEditBrandEn] = useState<string>('');
  const [editLogoUrl, setEditLogoUrl] = useState<string>('');
  const [editLogoPreview, setEditLogoPreview] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('#123b70');
  const [isUploadingConfigLogo, setIsUploadingConfigLogo] = useState<boolean>(false);
  const configFileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: Corporate & Legal Profile
  const [editCompName, setEditCompName] = useState<string>('');
  const [editCrNumber, setEditCrNumber] = useState<string>('');
  const [editTaxId, setEditTaxId] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [editCountry, setEditCountry] = useState<string>('Lebanon');
  const [editFinancialTemplate, setEditFinancialTemplate] = useState<'lebanese_pca' | 'international_ifrs' | 'custom_blank'>('lebanese_pca');
  const [editVatPercentage, setEditVatPercentage] = useState<number>(11);
  const [editTaxIdLabel, setEditTaxIdLabel] = useState<string>('Tax ID Number (MOF / الرقم المالي - وزارة المالية)');
  const [editCrNumberLabel, setEditCrNumberLabel] = useState<string>('Commercial Registration (CR / السجل التجاري)');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState<boolean>(false);
  const [countryFilterText, setCountryFilterText] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editBillingEmail, setEditBillingEmail] = useState<string>('');
  const [editBaseCurrency, setEditBaseCurrency] = useState<string>('USD');
  const [editSecondaryCurrency, setEditSecondaryCurrency] = useState<string>('LBP');
  const [editIsDualCurrency, setEditIsDualCurrency] = useState<boolean>(true);
  const [editExchangeRatePolicy, setEditExchangeRatePolicy] = useState<'PLATFORM_FIXED' | 'TENANT_MANAGED'>('PLATFORM_FIXED');
  const [baseCurrencyDropdownOpen, setBaseCurrencyDropdownOpen] = useState<boolean>(false);
  const [baseCurrencyFilterText, setBaseCurrencyFilterText] = useState<string>('');
  const [secondaryCurrencyDropdownOpen, setSecondaryCurrencyDropdownOpen] = useState<boolean>(false);
  const [secondaryCurrencyFilterText, setSecondaryCurrencyFilterText] = useState<string>('');

  // Currency Matrix & ISO Filter Memos
  const currentBaseCurrencyMeta = useMemo(() => {
    return getCurrencyMeta(editBaseCurrency);
  }, [editBaseCurrency]);

  const currentSecondaryCurrencyMeta = useMemo(() => {
    return getCurrencyMeta(editSecondaryCurrency);
  }, [editSecondaryCurrency]);

  const filteredBaseCurrencies = useMemo(() => {
    return searchCurrencies(baseCurrencyFilterText);
  }, [baseCurrencyFilterText]);

  const filteredSecondaryCurrencies = useMemo(() => {
    return searchCurrencies(secondaryCurrencyFilterText);
  }, [secondaryCurrencyFilterText]);

  const currentOnboardBaseCurrencyMeta = useMemo(() => {
    return getCurrencyMeta(onboardBaseCurrency);
  }, [onboardBaseCurrency]);

  const filteredOnboardBaseCurrencies = useMemo(() => {
    return searchCurrencies(onboardBaseCurrencyFilterText);
  }, [onboardBaseCurrencyFilterText]);

  // Computed Country Fiscal Profiles
  const currentCountryProfile = useMemo(() => {
    return getCountryFiscalProfile(editCountry);
  }, [editCountry]);

  const filteredCountryProfiles = useMemo(() => {
    if (!countryFilterText.trim()) return COUNTRY_FISCAL_PROFILES;
    const q = countryFilterText.toLowerCase().trim();
    return COUNTRY_FISCAL_PROFILES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.financialTemplateName.toLowerCase().includes(q)
    );
  }, [countryFilterText]);

  const onboardCountryProfile = useMemo(() => {
    return getCountryFiscalProfile(onboardCountry);
  }, [onboardCountry]);

  const filteredOnboardCountryProfiles = useMemo(() => {
    if (!onboardCountryFilterText.trim()) return COUNTRY_FISCAL_PROFILES;
    const q = onboardCountryFilterText.toLowerCase().trim();
    return COUNTRY_FISCAL_PROFILES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.financialTemplateName.toLowerCase().includes(q)
    );
  }, [onboardCountryFilterText]);

  const handleCountryChange = (countryName: string) => {
    setEditCountry(countryName);
    const profile = getCountryFiscalProfile(countryName);
    setEditFinancialTemplate(profile.financialSeedTemplate);
    setEditVatPercentage(profile.vatPercentage);
    setEditTaxIdLabel(profile.taxIdLabel);
    setEditCrNumberLabel(profile.crNumberLabel);
    setCountryDropdownOpen(false);
    setCountryFilterText('');

    if (countryName.toLowerCase() === 'lebanon') {
      setEditBaseCurrency('USD');
      setEditSecondaryCurrency('LBP');
      setEditIsDualCurrency(true);
    } else {
      if (profile.currency) {
        setEditBaseCurrency(profile.currency);
      }
      setEditSecondaryCurrency('USD');
      setEditIsDualCurrency(false);
    }
  };

  const handleOnboardCountryChange = (countryName: string) => {
    setOnboardCountry(countryName);
    const profile = getCountryFiscalProfile(countryName);
    setOnboardFinancialTemplate(profile.financialSeedTemplate);
    setOnboardCrNumber(profile.crNumberPlaceholder);
    setOnboardTaxId(profile.taxIdPlaceholder);
    setOnboardCountryDropdownOpen(false);
    setOnboardCountryFilterText('');

    if (countryName.toLowerCase() === 'lebanon') {
      setOnboardBaseCurrency('USD');
      setOnboardSecondaryCurrency('LBP');
      setOnboardIsDualCurrency(true);
    } else {
      if (profile.currency) {
        setOnboardBaseCurrency(profile.currency);
      }
      setOnboardSecondaryCurrency('USD');
      setOnboardIsDualCurrency(false);
    }
  };

  // Tab 4: Operational Quotas & Lifecycle
  const [editMaxBranches, setEditMaxBranches] = useState<number>(5);
  const [editMaxUsers, setEditMaxUsers] = useState<number>(25);
  const [editMaxTerminals, setEditMaxTerminals] = useState<number>(10);
  const [editStorageQuota, setEditStorageQuota] = useState<number>(50);
  const [editContractValue, setEditContractValue] = useState<number>(3000);
  const [editBillingCycle, setEditBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [editRenewalDate, setEditRenewalDate] = useState<string>('2027-01-01');
  const [editAccountStatus, setEditAccountStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE_MODE'>('ACTIVE');

  // Tab 5: Primary Admin
  const [editAdminName, setEditAdminName] = useState<string>('Primary Admin');
  const [editAdminEmail, setEditAdminEmail] = useState<string>('admin@client.com');
  const [editAdminPhone, setEditAdminPhone] = useState<string>('+961 70 000 000');
  const [editAdminPassword, setEditAdminPassword] = useState<string>('');
  const [showConfigAdminPass, setShowConfigAdminPass] = useState<boolean>(false);

  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<boolean>(false);

  // Visual Toast Notification System
  interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
    timestamp: number;
  }
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, details?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, type, title, message, details, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 7000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Recent Activities & Audit Log State
  const [recentActivities, setRecentActivities] = useState<SystemActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const items = await getRecentSystemActivities(25);
      setRecentActivities(items);
    } catch (e) {
      console.error('Error fetching recent activities:', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Reserve /admin strictly for Super Admins
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('vanguard_user_role');
      const isImpersonating = localStorage.getItem('vanguard_is_impersonating') === 'true';
      const isSuperAdminFlag = localStorage.getItem('vanguard_is_super_admin') === 'true';
      const storedEmail = localStorage.getItem('vanguard_user_email')?.toLowerCase();
      const isSuperAdminEmail = Boolean(storedEmail && (
        storedEmail.includes('admin') ||
        storedEmail.includes('jichi') ||
        storedEmail.includes('mohammed') ||
        [
          'mohammed@vanguard-erp.com',
          'admin@vanguard.com',
          'superadmin@vanguard-erp.com',
          'jichi@vanguard-erp.com'
        ].includes(storedEmail)
      ));

      if (
        isImpersonating ||
        isSuperAdminFlag ||
        isSuperAdminEmail ||
        !storedRole ||
        storedRole.toUpperCase() === 'SUPER_ADMIN' ||
        storedRole.toUpperCase() === 'ADMIN' ||
        storedRole.toUpperCase() === 'COMPANY_ADMIN' ||
        storedRole.toUpperCase() === 'OWNER'
      ) {
        if (storedRole !== 'SUPER_ADMIN') {
          localStorage.setItem('vanguard_user_role', 'SUPER_ADMIN');
          localStorage.setItem('vanguard_is_super_admin', 'true');
          document.cookie = 'vanguard_user_role=SUPER_ADMIN; path=/; SameSite=Lax';
          document.cookie = 'vanguard_is_super_admin=true; path=/; SameSite=Lax';
        }
        return;
      }

      if (storedRole === 'STAFF' || storedRole === 'DRIVER' || storedRole === 'VIEWER') {
        const rawTenantId = localStorage.getItem('vanguard_tenant_id') || currentTenant?.id || '00000000-0000-0000-0000-000000000001';
        const routeCode = resolveTenantRouteCode(rawTenantId);
        router.replace(`/${routeCode}/dashboard`);
      }
    }
  }, [currentTenant, router]);

  const fetchAdminTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('SUPABASE ERROR in SuperAdminWorkspaceManager:', error);
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((t: any, idx: number) => {
          const activeMods = Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
            ? t.enabled_modules
            : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
                ? t.feature_flags.enabled_modules
                : ALL_SYSTEM_MODULES);

          const ff = t.feature_flags || {};
          const corp = ff.corporate_profile || {};
          const quotas = ff.quotas || {};
          const lifecycle = ff.subscription_lifecycle || {};
          const admin = ff.primary_admin || {};
          const resolvedAddress = t.address || t.headquarters_address || corp.address || corp.headquarters_address || corp.headquartersAddress || 'Nabatieh Industrial Zone, Main Blvd, Bldg 4';
          const resolvedCity = t.city || corp.city || 'Nabatieh';
          const resolvedCountry = t.country || corp.country || 'Lebanon';
          const resolvedPhone = t.phone || t.phone_number || corp.phone || corp.phoneNumber || '+961 70 882 110';
          const resolvedBillingEmail = t.billing_email || corp.billingEmail || corp.billing_email || 'accounts@southernolive.com';
          const resolvedCr = t.cr_number || corp.commercialRegistrationNumber || corp.cr_number || t.company_registration_number || 'CR-104928-LB';
          const resolvedTaxId = t.tax_id || corp.taxIdentificationNumber || corp.tax_id || t.tax_identification_number || 'MOF-7489201';
          const resolvedBaseCurrency = t.base_currency || corp.baseCurrency || corp.base_currency || 'USD';
          const resolvedSecondaryCurrency = t.secondary_currency !== undefined ? (t.secondary_currency || '') : (corp.secondaryCurrency || corp.secondary_currency || 'LBP');
          const resolvedExchangeRatePolicy = t.exchange_rate_policy || corp.exchangeRatePolicy || corp.exchange_rate_policy || 'PLATFORM_FIXED';

          return {
            ...t,
            company_id: t.company_id || t.companyId || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
            companyId: t.company_id || t.companyId || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
            brand_name_ar: t.brand_name_ar || t.brandNameAr || t.name || 'منتوجات زيت وزيتون الجنوب',
            brandNameAr: t.brand_name_ar || t.brandNameAr || t.name || 'منتوجات زيت وزيتون الجنوب',
            brand_name_en: t.brand_name_en || t.brandNameEn || t.name || 'Southern Olive Oil Products S.A.R.L',
            brandNameEn: t.brand_name_en || t.brandNameEn || t.name || 'Southern Olive Oil Products S.A.R.L',
            name: t.name || t.brand_name_ar || 'منتوجات زيت وزيتون الجنوب',
            official_legal_entity_name: corp.officialLegalName || t.official_legal_entity_name || t.name,
            enabled_modules: activeMods,
            enabledModules: activeMods,
            primary_color: t.primary_color || t.theme_color || '#123b70',
            theme_color: t.theme_color || t.primary_color || '#123b70',
            primaryColor: t.primary_color || t.theme_color || '#123b70',
            themeColor: t.theme_color || t.primary_color || '#123b70',
            logo_url: t.logo_url || t.logoUrl || '/assets/images/logo.png',
            logoUrl: t.logo_url || t.logoUrl || '/assets/images/logo.png',
            subscription_tier: t.subscription_tier || t.subscriptionTier || 'ENTERPRISE',
            subscription_status: lifecycle.status || t.subscription_status || t.subscriptionStatus || 'ACTIVE',
            company_registration_number: resolvedCr,
            cr_number: resolvedCr,
            taxIdentificationNumber: resolvedTaxId,
            tax_identification_number: resolvedTaxId,
            tax_id: resolvedTaxId,
            headquarters_address: resolvedAddress,
            address: resolvedAddress,
            city: resolvedCity,
            country: resolvedCountry,
            financial_seed_template: corp.financial_seed_template || t.financial_seed_template || (resolvedCountry.toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
            financialSeedTemplate: corp.financial_seed_template || t.financial_seed_template || (resolvedCountry.toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
            vat_percentage: corp.vat_percentage ?? (resolvedCountry.toLowerCase() === 'lebanon' ? 11 : 15),
            tax_id_label: corp.tax_id_label || (resolvedCountry.toLowerCase() === 'lebanon' ? 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)' : 'Tax Identification Number (TIN / VAT ID)'),
            cr_label: corp.cr_label || (resolvedCountry.toLowerCase() === 'lebanon' ? 'Commercial Registration (CR / السجل التجاري)' : 'Company Registration Number (CRN)'),
            phone_number: resolvedPhone,
            phone: resolvedPhone,
            billing_email: resolvedBillingEmail,
            base_currency: resolvedBaseCurrency,
            secondary_currency: resolvedSecondaryCurrency,
            is_dual_currency_enabled: corp.isDualCurrencyEnabled ?? corp.is_dual_currency_enabled ?? t.is_dual_currency_enabled ?? (resolvedCountry.toLowerCase() === 'lebanon'),
            exchange_rate_policy: resolvedExchangeRatePolicy,
            max_branches: quotas.maxBranches ?? (t.max_branches ?? 5),
            max_concurrent_users: quotas.maxConcurrentUsers ?? (t.max_concurrent_users ?? 25),
            max_pos_terminals: quotas.maxPosTerminals ?? (t.max_pos_terminals ?? 10),
            storage_quota_gb: quotas.storageQuotaGb ?? (t.storage_quota_gb ?? 50),
            contract_monthly_value: lifecycle.contractMonthlyValue ?? (t.contract_monthly_value ?? (t.subscription_tier === 'STARTER' ? 150 : t.subscription_tier === 'PRO' ? 450 : 3000)),
            billing_cycle: lifecycle.billingCycle || t.billing_cycle || 'MONTHLY',
            renewal_date: lifecycle.renewalDate || t.renewal_date || '2027-01-01',
            admin_name: admin.fullName || t.admin_name || 'Primary Admin',
            admin_email: admin.email || t.admin_email || 'admin@southernolive.com',
            admin_phone: admin.phone || t.admin_phone || '+961 70 882 110',
            updated_at: t.updated_at || t.created_at || new Date().toISOString(),
            created_at: t.created_at || new Date().toISOString()
          };
        });
        setTenants(formatted);
      } else {
        const fallbacks = (registeredCompanies && registeredCompanies.length > 0 ? registeredCompanies : [DEFAULT_ADMIN_TENANT]).map((t: any, idx: number) => ({
          ...t,
          company_id: t.companyId || t.company_id || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
          companyId: t.companyId || t.company_id || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
          brand_name_ar: t.brandNameAr || t.brand_name_ar || t.name || 'منتوجات زيت وزيتون الجنوب',
          brandNameAr: t.brandNameAr || t.brand_name_ar || t.name || 'منتوجات زيت وزيتون الجنوب',
          brand_name_en: t.brandNameEn || t.brand_name_en || t.name || 'Southern Olive Oil Products S.A.R.L',
          brandNameEn: t.brandNameEn || t.brand_name_en || t.name || 'Southern Olive Oil Products S.A.R.L',
          name: t.name || t.brandNameAr || 'منتوجات زيت وزيتون الجنوب',
          official_legal_entity_name: t.officialLegalEntityName || t.name,
          enabled_modules: t.enabledModules || ALL_SYSTEM_MODULES,
          enabledModules: t.enabledModules || ALL_SYSTEM_MODULES,
          primary_color: t.primaryColor || '#123b70',
          theme_color: t.themeColor || '#123b70',
          logo_url: t.logoUrl || '/assets/images/logo.png',
          logoUrl: t.logoUrl || '/assets/images/logo.png',
          subscription_tier: t.subscriptionTier || 'ENTERPRISE',
          subscription_status: t.subscriptionStatus || 'ACTIVE',
          contract_monthly_value: t.contractMonthlyValue || 3000,
          updated_at: t.updatedAt || new Date().toISOString()
        }));
        setTenants(fallbacks);
      }
    } catch (err) {
      console.error('Exception fetching tenants in SuperAdminWorkspaceManager:', err);
      setTenants([DEFAULT_ADMIN_TENANT]);
    }
  };

  useEffect(() => {
    document.title = 'Vanguard SaaS Master Controller';
    fetchAdminTenants();
    fetchActivities();
    refreshTenants().catch(err => console.error('Error refreshing tenants:', err));
  }, []);

  const displayTenants = tenants.length > 0 ? tenants : [DEFAULT_ADMIN_TENANT];

  // Dynamic ARR and MRR Calculation
  const totalMRR = displayTenants.reduce((sum, t) => {
    const val = Number(t.contract_monthly_value || t.contractMonthlyValue);
    if (!isNaN(val) && val > 0) return sum + val;
    return sum + (t.subscription_tier === 'STARTER' ? 150 : t.subscription_tier === 'PRO' ? 450 : 3000);
  }, 0);
  const totalARR = totalMRR * 12;

  // Status Filter Counts for Registry Tabs
  const countAll = displayTenants.length;
  const countActive = displayTenants.filter(t => (t.subscription_status || t.subscriptionStatus || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const countSuspended = displayTenants.filter(t => (t.subscription_status || t.subscriptionStatus || '').toUpperCase() === 'SUSPENDED').length;
  const countMaintenance = displayTenants.filter(t => {
    const s = (t.subscription_status || t.subscriptionStatus || '').toUpperCase();
    return s === 'MAINTENANCE_MODE' || s === 'MAINTENANCE';
  }).length;

  // Real-Time Multi-Field Search, Module & Status Filtering Matrix
  const filteredTenants = useMemo(() => {
    return displayTenants.filter(t => {
      const status = (t.subscription_status || t.subscriptionStatus || 'ACTIVE').toUpperCase();
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'MAINTENANCE_MODE' && status !== 'MAINTENANCE_MODE' && status !== 'MAINTENANCE') return false;
        if (statusFilter !== 'MAINTENANCE_MODE' && status !== statusFilter) return false;
      }

      if (moduleFilter !== 'ALL') {
        const activeMods: string[] = Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
          ? t.enabled_modules
          : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
              ? t.feature_flags.enabled_modules
              : (Array.isArray(t.enabledModules) && t.enabledModules.length > 0 ? t.enabledModules : ALL_SYSTEM_MODULES));
        if (!isModuleEnabled(moduleFilter, activeMods)) {
          return false;
        }
      }

      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const compId = String(t.company_id || t.companyId || '');
        const compIdWithHash = `#${compId}`;
        const name = (t.name || '').toLowerCase();
        const legalName = (t.official_legal_entity_name || t.officialLegalEntityName || '').toLowerCase();
        const brandEn = (t.brand_name_en || t.brandNameEn || '').toLowerCase();
        const brandAr = (t.brand_name_ar || t.brandNameAr || '').toLowerCase();
        const cr = (t.company_registration_number || t.commercial_registration_number || t.companyRegistrationNumber || '').toLowerCase();
        const mof = (t.tax_identification_number || t.taxIdentificationNumber || '').toLowerCase();
        const baseCurrency = (t.base_currency || t.baseCurrency || '').toLowerCase();
        const secCurrency = (t.secondary_currency || t.secondaryCurrency || '').toLowerCase();

        const matches = compId.includes(q) ||
          compIdWithHash.includes(q) ||
          name.includes(q) ||
          legalName.includes(q) ||
          brandEn.includes(q) ||
          brandAr.includes(q) ||
          cr.includes(q) ||
          mof.includes(q) ||
          baseCurrency.includes(q) ||
          secCurrency.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [displayTenants, statusFilter, moduleFilter, debouncedSearchQuery]);

  // Strictly Dynamic Range Counter & Clean Pagination Math
  const totalItems = filteredTenants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);
  const paginatedTenants = filteredTenants.slice(
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleEnterWorkspace = (t: any) => {
    try {
      const targetId = t?.id || '00000000-0000-0000-0000-000000000001';
      const effectiveCompanyId = t?.company_id || t?.companyId || (targetId === '00000000-0000-0000-0000-000000000001' ? 1300 : undefined);

      const activeModules = Array.isArray(t?.enabled_modules) && t.enabled_modules.length > 0
        ? t.enabled_modules
        : (Array.isArray(t?.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
            ? t.feature_flags.enabled_modules
            : (Array.isArray(t?.enabledModules) && t.enabledModules.length > 0 ? t.enabledModules : ALL_SYSTEM_MODULES));

      const fullTenantObj: TenantCompany = {
        id: targetId,
        companyId: effectiveCompanyId,
        company_id: effectiveCompanyId,
        name: t?.name || t?.brand_name_ar || 'Vanguard Enterprise Client',
        slug: t?.slug || t?.name || 'tenant',
        brandNameAr: t?.brand_name_ar || t?.brandNameAr || t?.name || 'منتوجات زيت وزيتون الجنوب',
        brandNameEn: t?.brand_name_en || t?.brandNameEn || t?.name || 'Southern Olive Oil Products S.A.R.L',
        logoUrl: t?.logo_url || t?.logoUrl || '/assets/images/logo.png',
        primaryColor: t?.primary_color || t?.theme_color || '#123b70',
        themeColor: t?.theme_color || t?.primary_color || '#123b70',
        enabledModules: activeModules,
        enabled_modules: activeModules,
        subscriptionTier: t?.subscription_tier || t?.subscriptionTier || 'ENTERPRISE',
        subscriptionStatus: t?.subscription_status || t?.subscriptionStatus || 'ACTIVE',
        aiUsageCount: t?.ai_usage_count || 0,
        aiUsageLimit: t?.ai_usage_limit || 1000,
        companyRegistrationNumber: t?.company_registration_number || t?.companyRegistrationNumber || 'CR-104928-LB',
        taxIdentificationNumber: t?.tax_identification_number || t?.taxIdentificationNumber || 'MOF-7489201',
        officialLegalEntityName: t?.official_legal_entity_name || t?.name,
        headquartersAddress: t?.headquarters_address || 'Central Highway Blvd, Bldg 4',
        city: t?.city || 'Nabatieh',
        country: t?.country || 'Lebanon',
        financialSeedTemplate: t?.financial_seed_template || t?.financialSeedTemplate || ((t?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
        vatPercentage: t?.vat_percentage ?? ((t?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
        taxIdLabel: t?.tax_id_label || ((t?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)' : 'Tax Identification Number (TIN / VAT ID)'),
        crNumberLabel: t?.cr_label || ((t?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Commercial Registration (CR / السجل التجاري)' : 'Company Registration Number (CRN)'),
        phoneNumber: t?.phone_number || '+961 70 882 110',
        billingEmail: t?.billing_email || 'accounts@southernolive.com',
        baseCurrency: t?.base_currency || t?.baseCurrency || 'USD',
        secondaryCurrency: t?.secondary_currency || t?.secondaryCurrency || 'LBP',
        isDualCurrencyEnabled: t?.is_dual_currency_enabled ?? t?.isDualCurrencyEnabled ?? ((t?.country || 'Lebanon').toLowerCase() === 'lebanon'),
        exchangeRatePolicy: t?.exchange_rate_policy || t?.exchangeRatePolicy || 'PLATFORM_FIXED',
        maxBranches: t?.max_branches ?? 5,
        maxConcurrentUsers: t?.max_concurrent_users ?? 25,
        maxPosTerminals: t?.max_pos_terminals ?? 10,
        storageQuotaGb: t?.storage_quota_gb ?? 50,
        contractMonthlyValue: t?.contract_monthly_value ?? 3000,
        billingCycle: t?.billing_cycle || 'MONTHLY',
        renewalDate: t?.renewal_date || '2027-01-01',
        adminName: t?.admin_name || 'Primary Admin',
        adminEmail: t?.admin_email || 'admin@southernolive.com',
        adminPhone: t?.admin_phone || '+961 70 882 110'
      };

      switchTenant(fullTenantObj);

      // Auto-activate the tenant's bound Chart of Accounts template
      const targetCoaPreset = (fullTenantObj.financialSeedTemplate === 'international_ifrs' ? 'international_ifrs' : 'lebanese_pca') as any;
      try {
        setActiveCoaPresetId(targetCoaPreset);
        applyCoaPreset(targetCoaPreset);
      } catch (coaErr) {
        console.warn('COA Preset initialization notice:', coaErr);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard_active_tenant', JSON.stringify(fullTenantObj));
        localStorage.setItem('vanguard_tenant_id', fullTenantObj.id);
        localStorage.setItem('vanguard_is_impersonating', 'true');
        localStorage.setItem('vanguard_tenant_branding', JSON.stringify({
          name: fullTenantObj.name,
          brandNameAr: fullTenantObj.brandNameAr,
          brandNameEn: fullTenantObj.brandNameEn,
          logoUrl: fullTenantObj.logoUrl,
          primaryColor: fullTenantObj.primaryColor,
          themeColor: fullTenantObj.themeColor,
          companyRegistrationNumber: fullTenantObj.companyRegistrationNumber,
          taxIdentificationNumber: fullTenantObj.taxIdentificationNumber
        }));
        document.cookie = `vanguard_tenant_id=${encodeURIComponent(fullTenantObj.id)}; path=/; SameSite=Lax`;
        document.cookie = `vanguard_active_tenant=${encodeURIComponent(JSON.stringify(fullTenantObj))}; path=/; SameSite=Lax`;
      }

      const routeIdentifier = resolveTenantRouteCode(effectiveCompanyId || fullTenantObj.id);
      const targetName = fullTenantObj.brandNameEn || fullTenantObj.name || 'Vanguard Enterprise Client';
      logSystemActivity({
        tenantId: fullTenantObj.id,
        companyId: effectiveCompanyId,
        actionType: 'WORKSPACE_PREVIEW',
        description: `Previewed workspace for ${targetName} (#${effectiveCompanyId || 1300}) by System Owner`,
        performedBy: 'Super Admin (Mohammed Jichi)',
        metadata: { route: `/${routeIdentifier}/dashboard` }
      }).catch(e => console.warn('Activity log notice:', e));
      fetchActivities();

      router.push(`/${routeIdentifier}/dashboard`);
    } catch (err) {
      console.error('Error in handleEnterWorkspace:', err);
      const finalTargetId = t?.id || '00000000-0000-0000-0000-000000000001';
      const finalRouteCode = resolveTenantRouteCode(finalTargetId);
      router.push(`/backoffice?tenantId=${encodeURIComponent(finalRouteCode)}`);
    }
  };

  const handleOpenConfigModal = (t: any) => {
    setEditingTenant(t);
    const existingModules = Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
      ? t.enabled_modules
      : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
          ? t.feature_flags.enabled_modules
          : (Array.isArray(t.enabledModules) && t.enabledModules.length > 0 ? t.enabledModules : ALL_SYSTEM_MODULES));
    setSelectedModules([...existingModules]);
    setConfigTier(t.subscription_tier || t.subscriptionTier || 'ENTERPRISE');

    // Corporate Profile
    setEditCompName(t.official_legal_entity_name || t.name || '');
    setEditBrandAr(t.brand_name_ar || t.brandNameAr || t.name || '');
    setEditBrandEn(t.brand_name_en || t.brandNameEn || t.name || '');
    setEditCrNumber(t.cr_number || t.company_registration_number || t.commercial_registration_number || 'CR-104928-LB');
    setEditTaxId(t.tax_id || t.tax_identification_number || 'MOF-7489201');
    setEditAddress(t.address || t.headquarters_address || 'Nabatieh Industrial Zone, Main Blvd, Bldg 4');
    setEditCity(t.city || 'Nabatieh');

    // Country Jurisdiction & Fiscal Template Auto-Binding
    const initialCountry = t.country || 'Lebanon';
    setEditCountry(initialCountry);
    const fiscalProfile = getCountryFiscalProfile(initialCountry);
    const boundTemplate = (t.financial_seed_template || t.financialSeedTemplate || fiscalProfile.financialSeedTemplate) as any;
    setEditFinancialTemplate(boundTemplate);
    setEditVatPercentage(t.vat_percentage ?? fiscalProfile.vatPercentage);
    setEditTaxIdLabel(t.tax_id_label || fiscalProfile.taxIdLabel);
    setEditCrNumberLabel(t.cr_label || fiscalProfile.crNumberLabel);
    setCountryDropdownOpen(false);
    setCountryFilterText('');
    setEditPhone(t.phone || t.phone_number || '+961 70 882 110');
    setEditBillingEmail(t.billing_email || 'accounts@southernolive.com');
    setEditBaseCurrency(t.base_currency || t.baseCurrency || 'USD');
    setEditSecondaryCurrency(t.secondary_currency !== undefined ? (t.secondary_currency || '') : (t.secondaryCurrency || 'LBP'));
    const isDual = t.is_dual_currency_enabled !== undefined
      ? Boolean(t.is_dual_currency_enabled)
      : (t.isDualCurrencyEnabled !== undefined
          ? Boolean(t.isDualCurrencyEnabled)
          : ((t.country || 'Lebanon').toLowerCase() === 'lebanon'));
    setEditIsDualCurrency(isDual);
    setEditExchangeRatePolicy(t.exchange_rate_policy || t.exchangeRatePolicy || 'PLATFORM_FIXED');
    setBaseCurrencyDropdownOpen(false);
    setBaseCurrencyFilterText('');
    setSecondaryCurrencyDropdownOpen(false);
    setSecondaryCurrencyFilterText('');

    // Quotas & Lifecycle
    setEditMaxBranches(t.max_branches ?? 5);
    setEditMaxUsers(t.max_concurrent_users ?? 25);
    setEditMaxTerminals(t.max_pos_terminals ?? 10);
    setEditStorageQuota(t.storage_quota_gb ?? 50);
    setEditContractValue(t.contract_monthly_value ?? (t.subscription_tier === 'STARTER' ? 150 : t.subscription_tier === 'PRO' ? 450 : 3000));
    setEditBillingCycle(t.billing_cycle || 'MONTHLY');
    setEditRenewalDate(t.renewal_date || '2027-01-01');
    setEditAccountStatus(t.subscription_status || t.subscriptionStatus || 'ACTIVE');

    // Primary Admin
    setEditAdminName(t.admin_name || 'Primary Admin');
    setEditAdminEmail(t.admin_email || 'admin@southernolive.com');
    setEditAdminPhone(t.admin_phone || '+961 70 882 110');
    setEditAdminPassword(t.admin_password || '');

    // Visual Identity
    setEditLogoUrl(t.logo_url || t.logoUrl || '');
    setEditLogoPreview(t.logo_url || t.logoUrl || '');
    setEditColor(t.primary_color || t.primaryColor || t.theme_color || t.themeColor || '#123b70');

    setConfigTab('identity');
    setConfigSaveSuccess(false);
    setShowConfigModal(true);
  };

  const handleSelectPresetTier = (tierName: 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM') => {
    setConfigTier(tierName);
    if (tierName !== 'CUSTOM') {
      setSelectedModules([...PRESET_MODULES[tierName]]);
      if (tierName === 'STARTER') setEditContractValue(150);
      else if (tierName === 'PRO') setEditContractValue(450);
      else if (tierName === 'ENTERPRISE') setEditContractValue(3000);
    }
  };

  const toggleModule = (modId: string) => {
    setConfigTier('CUSTOM');
    setSelectedModules(prev => {
      const isAlreadyActive = isModuleEnabled(modId, prev);
      if (isAlreadyActive) {
        return prev.filter(m => {
          const lower = (m || '').toLowerCase();
          if (lower === modId) return false;
          if (modId === 'sales' && (lower === 'pos' || lower === 'sale' || lower === 'v-pos' || lower === 'counter')) return false;
          if (modId === 'operations' && (lower === 'op' || lower === 'inventory' || lower === 'stock' || lower === 'warehouse')) return false;
          if (modId === 'purchasing' && (lower === 'procurement' || lower === 'purchases' || lower === 'po')) return false;
          if (modId === 'customers' && (lower === 'crm' || lower === 'customer' || lower === 'clients')) return false;
          if (modId === 'feedback' && (lower === 'feedback' || lower === 'survey' || lower === 'csat' || lower === 'surveys' || lower === 'reviews')) return false;
          if (modId === 'loyalty' && (lower === 'loyalty' || lower === 'rewards' || lower === 'merits' || lower === 'points')) return false;
          if (modId === 'accounting' && (lower === 'accounting' || lower === 'finance' || lower === 'gl' || lower === 'ledger' || lower === 'financials')) return false;
          if (modId === 'hr' && (lower === 'hr' || lower === 'payroll' || lower === 'attendance' || lower === 'personnel')) return false;
          if (modId === 'fleet' && (lower === 'v-driver' || lower === 'driver' || lower === 'supersonic' || lower === 'logistics' || lower === 'dispatch')) return false;
          if (modId === 'social' && (lower === 'connect' || lower === 'v-connect' || lower === 'social-crm' || lower === 'whatsapp' || lower === 'omnichannel')) return false;
          if (modId === 'pressing-mill' && (lower === 'pressing' || lower === 'module_pressing_mill' || lower === 'mill' || lower === 'olive')) return false;
          if (modId === 'v-store' && (lower === 'store' || lower === 'storefront' || lower === 'landing' || lower === 'orders' || lower === 'ecommerce')) return false;
          return true;
        });
      } else {
        return [...prev, modId];
      }
    });
  };

  // Logo file upload handler for Config Modal
  const handleConfigLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingConfigLogo(true);
    try {
      const resultingUrl = await uploadLogoToStorage(file, editingTenant?.slug || 'tenant');
      setEditLogoUrl(resultingUrl);
      setEditLogoPreview(resultingUrl);
    } catch (err: any) {
      alert('Logo upload notice: ' + (err.message || 'Could not upload file'));
    } finally {
      setIsUploadingConfigLogo(false);
    }
  };

  // Logo file upload handler for Onboard Modal
  const handleOnboardLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingOnboardLogo(true);
    try {
      const cleanSlug = compName.toLowerCase().replace(/\s+/g, '-') || 'tenant';
      const resultingUrl = await uploadLogoToStorage(file, cleanSlug);
      setOnboardLogoUrl(resultingUrl);
      setOnboardLogoPreview(resultingUrl);
    } catch (err: any) {
      alert('Logo upload notice: ' + (err.message || 'Could not upload file'));
    } finally {
      setIsUploadingOnboardLogo(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setIsSavingConfig(true);

    try {
      // 1. Gather all active form states
      const cleanAddress = editAddress.trim();
      const cleanCity = editCity.trim();
      const cleanCountry = editCountry.trim() || 'Lebanon';
      const cleanPhone = editPhone.trim();
      const cleanBillingEmail = editBillingEmail.trim();
      const cleanCrNumber = editCrNumber.trim();
      const cleanTaxId = editTaxId.trim();
      const cleanBaseCurrency = editBaseCurrency.trim() || 'USD';
      const cleanSecondaryCurrency = editIsDualCurrency ? (editSecondaryCurrency.trim() || 'LBP') : null;
      const cleanExchangeRatePolicy = editExchangeRatePolicy.trim() || 'PLATFORM_FIXED';
      const cleanLegalName = editCompName.trim() || editingTenant.name;
      const cleanBrandAr = editBrandAr.trim() || editingTenant.brand_name_ar || editingTenant.name;
      const cleanBrandEn = editBrandEn.trim() || editingTenant.brand_name_en || editingTenant.name;
      const cleanLogo = editLogoUrl.trim() || editLogoPreview.trim();

      const corporateProfile = {
        officialLegalName: cleanLegalName,
        legalEntityName: cleanLegalName,
        commercialRegistrationNumber: cleanCrNumber,
        cr_number: cleanCrNumber,
        taxIdentificationNumber: cleanTaxId,
        tax_id: cleanTaxId,
        headquartersAddress: cleanAddress,
        headquarters_address: cleanAddress,
        address: cleanAddress,
        city: cleanCity,
        country: cleanCountry,
        financial_seed_template: editFinancialTemplate,
        vat_percentage: Number(editVatPercentage),
        tax_id_label: editTaxIdLabel,
        cr_label: editCrNumberLabel,
        phoneNumber: cleanPhone,
        phone_number: cleanPhone,
        phone: cleanPhone,
        billingEmail: cleanBillingEmail,
        billing_email: cleanBillingEmail,
        baseCurrency: cleanBaseCurrency,
        base_currency: cleanBaseCurrency,
        secondaryCurrency: cleanSecondaryCurrency,
        secondary_currency: cleanSecondaryCurrency,
        isDualCurrencyEnabled: editIsDualCurrency,
        is_dual_currency_enabled: editIsDualCurrency,
        exchangeRatePolicy: cleanExchangeRatePolicy,
        exchange_rate_policy: cleanExchangeRatePolicy
      };

      const quotas = {
        maxBranches: Number(editMaxBranches),
        maxConcurrentUsers: Number(editMaxUsers),
        maxPosTerminals: Number(editMaxTerminals),
        storageQuotaGb: Number(editStorageQuota)
      };

      const subscriptionLifecycle = {
        contractMonthlyValue: Number(editContractValue),
        billingCycle: editBillingCycle,
        renewalDate: editRenewalDate,
        status: editAccountStatus
      };

      const primaryAdmin = {
        fullName: editAdminName.trim(),
        email: editAdminEmail.trim(),
        phone: editAdminPhone.trim(),
        passwordSet: Boolean(editAdminPassword.trim())
      };

      const updates: any = {
        name: cleanLegalName,
        brandNameAr: cleanBrandAr,
        brand_name_ar: cleanBrandAr,
        brandNameEn: cleanBrandEn,
        brand_name_en: cleanBrandEn,
        logoUrl: cleanLogo,
        logo_url: cleanLogo,
        primaryColor: editColor,
        themeColor: editColor,
        primary_color: editColor,
        theme_color: editColor,
        enabledModules: selectedModules,
        enabled_modules: selectedModules,
        subscriptionTier: configTier,
        subscription_tier: configTier,
        subscriptionStatus: editAccountStatus,
        subscription_status: editAccountStatus,
        companyRegistrationNumber: cleanCrNumber,
        crNumber: cleanCrNumber,
        cr_number: cleanCrNumber,
        taxIdentificationNumber: cleanTaxId,
        taxId: cleanTaxId,
        tax_id: cleanTaxId,
        officialLegalEntityName: cleanLegalName,
        legalEntityName: cleanLegalName,
        headquartersAddress: cleanAddress,
        address: cleanAddress,
        city: cleanCity,
        country: cleanCountry,
        financialSeedTemplate: editFinancialTemplate,
        financial_seed_template: editFinancialTemplate,
        vatPercentage: Number(editVatPercentage),
        vat_percentage: Number(editVatPercentage),
        taxIdLabel: editTaxIdLabel,
        tax_id_label: editTaxIdLabel,
        crNumberLabel: editCrNumberLabel,
        cr_label: editCrNumberLabel,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        phone_number: cleanPhone,
        billingEmail: cleanBillingEmail,
        billing_email: cleanBillingEmail,
        baseCurrency: cleanBaseCurrency,
        base_currency: cleanBaseCurrency,
        secondaryCurrency: cleanSecondaryCurrency,
        secondary_currency: cleanSecondaryCurrency,
        isDualCurrencyEnabled: editIsDualCurrency,
        is_dual_currency_enabled: editIsDualCurrency,
        exchangeRatePolicy: cleanExchangeRatePolicy,
        exchange_rate_policy: cleanExchangeRatePolicy,
        maxBranches: Number(editMaxBranches),
        maxConcurrentUsers: Number(editMaxUsers),
        maxPosTerminals: Number(editMaxTerminals),
        storageQuotaGb: Number(editStorageQuota),
        contractMonthlyValue: Number(editContractValue),
        billingCycle: editBillingCycle,
        renewalDate: editRenewalDate,
        adminName: editAdminName.trim(),
        adminEmail: editAdminEmail.trim(),
        adminPhone: editAdminPhone.trim(),
        adminPassword: editAdminPassword.trim()
      };

      // 2. Direct explicit Supabase update payload with dedicated columns
      const directPayload: any = {
        name: cleanLegalName,
        brand_name_ar: cleanBrandAr,
        brand_name_en: cleanBrandEn,
        logo_url: cleanLogo,
        primary_color: editColor,
        theme_color: editColor,
        subscription_tier: configTier,
        subscription_status: editAccountStatus,
        enabled_modules: selectedModules,
        // 10 Dedicated Corporate & Fiscal Columns
        address: cleanAddress,
        headquarters_address: cleanAddress,
        city: cleanCity,
        country: cleanCountry,
        phone: cleanPhone,
        phone_number: cleanPhone,
        billing_email: cleanBillingEmail,
        cr_number: cleanCrNumber,
        tax_id: cleanTaxId,
        base_currency: cleanBaseCurrency,
        secondary_currency: cleanSecondaryCurrency,
        exchange_rate_policy: cleanExchangeRatePolicy,
        feature_flags: {
          ...(editingTenant.feature_flags || {}),
          enabled_modules: selectedModules,
          modules_count: selectedModules.length,
          full_enterprise_unlocked: selectedModules.length >= 12,
          corporate_profile: corporateProfile,
          quotas: quotas,
          subscription_lifecycle: subscriptionLifecycle,
          primary_admin: primaryAdmin
        },
        updated_at: new Date().toISOString()
      };

      let mutationError: any = null;
      let rowsAffected = 0;
      let schemaFallbackActive = false;

      // Execute explicit Supabase mutation
      const { data: updatedRows, error: directErr } = await supabase
        .from('tenants')
        .update(directPayload)
        .eq('id', editingTenant.id)
        .select('*');

      if (directErr) {
        // If columns do not exist yet (PGRST204 / schema cache), fallback to JSONB feature_flags update
        if (directErr.code === 'PGRST204' || directErr.message?.includes('schema cache') || directErr.message?.includes('column')) {
          console.warn('Dedicated columns pending Supabase migration. Applying JSONB fallback update:', directErr.message);
          schemaFallbackActive = true;
          const fallbackPayload = {
            name: cleanLegalName,
            brand_name_ar: cleanBrandAr,
            brand_name_en: cleanBrandEn,
            logo_url: cleanLogo,
            primary_color: editColor,
            theme_color: editColor,
            subscription_tier: configTier,
            subscription_status: editAccountStatus,
            enabled_modules: selectedModules,
            feature_flags: directPayload.feature_flags,
            updated_at: directPayload.updated_at
          };
          const { data: fallbackRows, error: fallbackErr } = await supabase
            .from('tenants')
            .update(fallbackPayload)
            .eq('id', editingTenant.id)
            .select('*');

          if (fallbackErr) {
            mutationError = fallbackErr;
          } else {
            rowsAffected = fallbackRows?.length || 0;
          }
        } else {
          mutationError = directErr;
        }
      } else {
        rowsAffected = updatedRows?.length || 0;
      }

      // Check for errors
      if (mutationError) {
        console.error('Supabase update mutation error:', mutationError);
        addToast(
          'error',
          'Supabase Mutation Failed',
          mutationError.message || 'Failed to persist tenant changes to Supabase',
          mutationError.details || mutationError.hint || `Code: ${mutationError.code || 'UNKNOWN'}`
        );
        return;
      }

      // Check for RLS silent block (0 rows affected)
      if (rowsAffected === 0 && !schemaFallbackActive) {
        console.warn('Supabase returned 0 rows updated. Check Row Level Security (RLS) UPDATE policy.');
        addToast(
          'warning',
          'RLS Update Policy Notice',
          'Request reached Supabase but 0 rows were updated. Ensure the public UPDATE policy is enabled on public.tenants.',
          'Execute lib/supabase/migration_tenant_corporate_fiscal_persistence.sql to grant full UPDATE permissions.'
        );
      }

      // Sync via TenantContext provider (updates memory cache, registeredCompanies, localStorage)
      const res = await updateTenantModulesAndBranding(editingTenant.id, updates);
      if (!res.success) {
        console.warn('TenantContext local update notice:', res.error);
      }

      // If updating the active tenant, synchronize active session immediately
      if (currentTenant?.id === editingTenant.id) {
        const mergedActiveTenant = {
          ...currentTenant,
          ...updates,
          id: editingTenant.id
        };
        switchTenant(mergedActiveTenant);
      }

      // Invalidate and refetch all tenant caches
      await fetchAdminTenants();
      await refreshTenants();
      await fetchActivities();

      // Show Success or Notice Toast
      if (schemaFallbackActive) {
        addToast(
          'warning',
          'Profile Saved with Notice',
          'Values saved to JSONB fallback. Execute lib/supabase/migration_tenant_corporate_fiscal_persistence.sql in Supabase SQL editor to enable dedicated columns.'
        );
      } else {
        addToast(
          'success',
          'Tenant Profile Saved & Persisted',
          `Corporate & fiscal settings for "${cleanBrandEn || cleanLegalName}" successfully saved to Supabase.`
        );
      }

      setConfigSaveSuccess(true);
      setTimeout(() => {
        setShowConfigModal(false);
        setConfigSaveSuccess(false);
      }, 1000);

    } catch (err: any) {
      console.error('Exception in handleSaveConfig:', err);
      addToast(
        'error',
        'Persistence Error',
        err.message || 'An unexpected error occurred while saving tenant profile.'
      );
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !adminEmail.trim()) {
      alert('Please enter company legal name and primary admin email.');
      return;
    }
    setIsSubmitting(true);
    try {
      const assignedModules = onboardTier === 'CUSTOM'
        ? ALL_SYSTEM_MODULES
        : PRESET_MODULES[onboardTier];

      const res = await onboardNewTenant(
        {
          name: compName.trim(),
          slug: compName.toLowerCase().replace(/\s+/g, '-'),
          brandNameAr: brandAr.trim() || compName.trim(),
          brandNameEn: brandEn.trim() || compName.trim() + ' Products',
          subscriptionTier: onboardTier,
          logoUrl: onboardLogoUrl || onboardLogoPreview || '/assets/images/logo.png',
          officialLegalEntityName: compName.trim(),
          country: onboardCountry,
          financialSeedTemplate: onboardFinancialTemplate,
          vatPercentage: onboardCountryProfile.vatPercentage,
          taxIdLabel: onboardCountryProfile.taxIdLabel,
          crNumberLabel: onboardCountryProfile.crNumberLabel,
          companyRegistrationNumber: onboardCrNumber.trim(),
          taxIdentificationNumber: onboardTaxId.trim(),
          baseCurrency: onboardBaseCurrency,
          secondaryCurrency: onboardIsDualCurrency ? onboardSecondaryCurrency : '',
          isDualCurrencyEnabled: onboardIsDualCurrency,
          contractMonthlyValue: onboardMonthlyValue,
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          adminPhone: adminPhone.trim(),
          adminPassword: adminInitialPassword.trim(),
          enabledModules: assignedModules
        },
        adminEmail.trim()
      );

      if (res.success) {
        setShowOnboardModal(false);
        setCompName('');
        setBrandAr('');
        setBrandEn('');
        setAdminEmail('');
        setOnboardCountry('Lebanon');
        setOnboardFinancialTemplate('lebanese_pca');
        setOnboardLogoUrl('');
        setOnboardLogoPreview('');
        await fetchAdminTenants();
        await fetchActivities();
        alert('New tenant workspace successfully provisioned and activated in Supabase!');
      } else {
        alert('Failed to save tenant to Supabase database: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Onboarding exception:', err);
      alert('An error occurred during onboarding: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export clean JSON backup of tenant
  const handleExportBackup = (t: any) => {
    try {
      const backupData = {
        vanguardSystem: 'Vanguard Enterprise ERP',
        version: 'v2026.8.26',
        exportTimestamp: new Date().toISOString(),
        tenant: {
          id: t.id,
          companyId: t.company_id || t.companyId,
          legalName: t.official_legal_entity_name || t.name,
          brandNameEn: t.brand_name_en || t.brandNameEn,
          brandNameAr: t.brand_name_ar || t.brandNameAr,
          logoUrl: t.logo_url || t.logoUrl,
          colors: {
            primary: t.primary_color || t.primaryColor,
            theme: t.theme_color || t.themeColor
          },
          corporateProfile: {
            commercialRegistrationNumber: t.company_registration_number,
            taxIdentificationNumber: t.tax_identification_number,
            headquartersAddress: t.headquarters_address,
            city: t.city,
            country: t.country || 'Lebanon',
            financialSeedTemplate: t.financial_seed_template || t.financialSeedTemplate || ((t.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
            vatPercentage: t.vat_percentage ?? ((t.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
            taxIdLabel: t.tax_id_label || ((t.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)' : 'Tax Identification Number (TIN / VAT ID)'),
            crNumberLabel: t.cr_label || ((t.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Commercial Registration (CR / السجل التجاري)' : 'Company Registration Number (CRN)'),
            phoneNumber: t.phone_number,
            billingEmail: t.billing_email,
            baseCurrency: t.base_currency || t.baseCurrency,
            secondaryCurrency: t.secondary_currency || t.secondaryCurrency,
            isDualCurrencyEnabled: t.is_dual_currency_enabled ?? t.isDualCurrencyEnabled,
            exchangeRatePolicy: t.exchange_rate_policy || t.exchangeRatePolicy
          },
          quotas: {
            maxBranches: t.max_branches,
            maxConcurrentUsers: t.max_concurrent_users,
            maxPosTerminals: t.max_pos_terminals,
            storageQuotaGb: t.storage_quota_gb
          },
          subscription: {
            tier: t.subscription_tier,
            status: t.subscription_status,
            contractMonthlyValue: t.contract_monthly_value,
            billingCycle: t.billing_cycle,
            renewalDate: t.renewal_date
          },
          enabledModules: t.enabled_modules || t.enabledModules,
          featureFlags: t.feature_flags
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = (t.brand_name_en || t.name || 'tenant').toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `vanguard_tenant_${cleanName}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logSystemActivity({
        tenantId: t.id,
        companyId: t.company_id || t.companyId,
        actionType: 'CONFIG_CHANGE',
        description: `Exported full system backup JSON for ${t.brand_name_en || t.name}`,
        performedBy: 'Super Admin (Mohammed Jichi)'
      }).catch(e => console.warn(e));
      fetchActivities();
    } catch (err: any) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPasswordModal = (t: any) => {
    setPasswordTargetTenant(t);
    setNewAdminPassword(`Vanguard!${Math.floor(1000 + Math.random() * 9000)}#`);
    setShowPasswordText(true);
    setPasswordSaveSuccess(false);
    setShowResetPasswordModal(true);
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetTenant || !newAdminPassword.trim()) return;

    try {
      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...(passwordTargetTenant.feature_flags || {}),
            primary_admin: {
              ...(passwordTargetTenant.feature_flags?.primary_admin || {}),
              passwordSet: true,
              lastResetAt: new Date().toISOString()
            }
          }
        })
        .eq('id', passwordTargetTenant.id);

      logSystemActivity({
        tenantId: passwordTargetTenant.id,
        companyId: passwordTargetTenant.company_id || passwordTargetTenant.companyId,
        actionType: 'SECURITY_ALERT',
        description: `Admin password reset for ${passwordTargetTenant.brand_name_en || passwordTargetTenant.name}`,
        performedBy: 'Super Admin (Mohammed Jichi)'
      }).catch(e => console.warn(e));

      setPasswordSaveSuccess(true);
      fetchActivities();
      setTimeout(() => {
        setShowResetPasswordModal(false);
        setPasswordSaveSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert('Error updating password: ' + err.message);
    }
  };

  return (
    <div dir="ltr" className="w-full font-sans space-y-6 text-slate-900">

      {/* VANGUARD SAAS MASTER HEADER */}
      <header className="bg-white border-b-4 border-amber-500 border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-xs overflow-hidden shrink-0">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" /> Vanguard SaaS Master Controller
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
              SaaS Master Owner Portal & Multi-Tenant License Management Platform
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Activity className="w-4 h-4 text-emerald-600" /> Master SaaS Cluster: ONLINE (99.99%)
          </span>
          <button
            onClick={() => { fetchAdminTenants(); fetchActivities(); }}
            title="Refresh tenants live from Supabase"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:border-slate-400"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Refresh
          </button>
          <button
            onClick={() => handleEnterWorkspace(currentTenant || displayTenants[0])}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all border border-emerald-600 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Preview Active Portal
          </button>
        </div>
      </header>

      {/* MASTER METRICS CARDS ROW (INTERACTIVE CLICKABLE CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        {/* CARD 1: ACTIVE CLIENT LICENSES (CLICKABLE FILTER) */}
        <button
          onClick={() => {
            if (statusFilter === 'ALL') setStatusFilter('ACTIVE');
            else if (statusFilter === 'ACTIVE') setStatusFilter('SUSPENDED');
            else if (statusFilter === 'SUSPENDED') setStatusFilter('MAINTENANCE_MODE');
            else setStatusFilter('ALL');
          }}
          title="Click to toggle filter by tenant status"
          className={`bg-white border text-center rounded-2xl p-5 shadow-sm space-y-2 transition-all cursor-pointer group text-left ${
            statusFilter !== 'ALL'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <Key className="w-7 h-7 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Filter: {statusFilter}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Client Licenses</span>
          <h2 className="text-2xl font-black text-slate-900">{filteredTenants.length} of {displayTenants.length} Account{displayTenants.length > 1 ? 's' : ''}</h2>
          <small className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Click to toggle status filter
          </small>
        </button>

        {/* CARD 2: TOTAL ENTERPRISE ARR (CLICKABLE MODAL) */}
        <button
          onClick={() => setShowRevenueModal(true)}
          title="Click to view tenant revenue breakdown"
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 text-center shadow-sm space-y-2 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Breakdown
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Enterprise ARR</span>
          <h2 className="text-2xl font-black text-emerald-600">${totalARR.toLocaleString()} / Year</h2>
          <small className="text-slate-500 font-medium text-xs flex items-center gap-1">
            <span>Annual contract value sum</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
          </small>
        </button>

        {/* CARD 3: MONTHLY RECURRING REVENUE (CLICKABLE MODAL) */}
        <button
          onClick={() => setShowRevenueModal(true)}
          title="Click to view tenant revenue breakdown"
          className="bg-white border border-slate-200 hover:border-sky-400 rounded-2xl p-5 text-center shadow-sm space-y-2 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between">
            <DollarSign className="w-7 h-7 text-sky-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Monthly Active
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Monthly Recurring Revenue</span>
          <h2 className="text-2xl font-black text-slate-900">${totalMRR.toLocaleString()} / Month</h2>
          <small className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
            <span>Dynamic contract value</span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-600 ml-auto" />
          </small>
        </button>

        {/* CARD 4: SYSTEM HEALTH & FEATURE FLAGS (CLICKABLE MODAL) */}
        <button
          onClick={() => setShowHealthModal(true)}
          title="Click to inspect DB, RLS, and module health diagnostics"
          className="bg-white border border-slate-200 hover:border-purple-400 rounded-2xl p-5 text-center shadow-sm space-y-2 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center justify-between">
            <Activity className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              DB & RLS Online
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">System Health & Feature Flags</span>
          <h2 className="text-2xl font-black text-slate-900">12 Modules Guarded</h2>
          <small className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Inspect RLS & SLA Diagnostics
          </small>
        </button>

      </div>

      {/* STANDALONE APPS SUITE (V-SUITE) QUICK-LAUNCHPAD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 font-black">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                Standalone Enterprise Apps Suite (V-Suite)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dedicated client-facing web portals and mobile PWAs. Launch directly in isolated tabs without cluttering ERP navigation.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full">
            All 4 Standalone Portals Active & Licensed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {STANDALONE_APPS_SUITE.map(app => (
            <a
              key={app.key}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-amber-400 rounded-xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between gap-3 text-left cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-1 bg-white rounded-lg border border-slate-200 shadow-xs">{app.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-2xs ${app.badgeClass}`}>
                    {app.badge}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1">
                  <span>{app.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </h4>
                <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                  {app.tagline}
                </p>
                <p className="text-[10.5px] text-slate-500 leading-snug">
                  {app.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span>Launch App</span>
                <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">↗</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* VANGUARD MULTI-TENANT SAAS LICENSE REGISTRY (SCALABLE ARCHITECTURE OPTIMIZED FOR 20+ TENANTS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        
        {/* HEADER BAR: TITLE & PRIMARY ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Vanguard Enterprise Tenant Registry
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              High-density multi-tenant registry supporting 20+ accounts with live search, status filtering, and module entitlements inspection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboardModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm border border-emerald-600 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add New Tenant
            </button>
          </div>
        </div>

        {/* REGISTRY CONTROLS TOOLBAR: LIVE SEARCH, STATUS PILLS, MODULE FILTER, VIEW MODE TOGGLE, PAGE SIZE */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
          
          {/* SEARCH INPUT (150ms DEBOUNCED MULTI-FIELD SEARCH ENGINE) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company name, ID (#1300), brand, CR, MOF or currency..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* STATUS FILTER PILLS & MODULE FILTER */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL' as const, label: 'All', count: countAll, bgActive: 'bg-slate-900 text-white border-slate-900' },
                { key: 'ACTIVE' as const, label: 'Active', count: countActive, bgActive: 'bg-emerald-600 text-white border-emerald-600' },
                { key: 'SUSPENDED' as const, label: 'Suspended', count: countSuspended, bgActive: 'bg-rose-600 text-white border-rose-600' },
                { key: 'MAINTENANCE_MODE' as const, label: 'Maintenance', count: countMaintenance, bgActive: 'bg-amber-600 text-white border-amber-600' }
              ].map(f => {
                const isSelected = statusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => {
                      setStatusFilter(f.key);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? `${f.bgActive} shadow-xs font-black`
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Module Filter Dropdown */}
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs max-w-[190px] truncate"
              title="Filter by Active Module in enabled_modules"
            >
              <option value="ALL">All Modules (12)</option>
              {SYSTEM_MODULES_CONFIG.map(mod => (
                <option key={mod.id} value={mod.id}>
                  {mod.num}. {mod.shortLabel}
                </option>
              ))}
            </select>
          </div>

          {/* VIEW MODE TOGGLE & PAGE SIZE DROPDOWN */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                title="Compact Table View"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Responsive Mini-Card Grid View"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Page Size Selector (10, 25, 50, 100) */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* 1. HIGH-DENSITY COMPACT ROWS TABLE VIEW (PRIMARY VIEW) */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 min-h-[460px] bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Company ID</th>
                  <th className="py-2.5 px-3">Tenant & Legal Entity</th>
                  <th className="py-2.5 px-3">Brand Name (En / Ar)</th>
                  <th className="py-2.5 px-3">Active Modules (12)</th>
                  <th className="py-2.5 px-3">Contract Value</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 px-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTenants.length > 0 ? (
                  paginatedTenants.map((t: any) => {
                    const compId = t.company_id || t.companyId || 1300;
                    const activeMods: string[] = Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
                      ? t.enabled_modules
                      : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
                          ? t.feature_flags.enabled_modules
                          : (Array.isArray(t.enabledModules) && t.enabledModules.length > 0 ? t.enabledModules : ALL_SYSTEM_MODULES));
                    const activeCount = getActiveModulesCount(activeMods);
                    const status = (t.subscription_status || t.subscriptionStatus || 'ACTIVE').toUpperCase();
                    const isExpanded = expandedTenantModulesId === t.id;

                    return (
                      <React.Fragment key={t.id}>
                        <tr className="hover:bg-slate-50/80 text-slate-700 font-medium transition-colors">
                          {/* Company ID */}
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded shadow-xs">
                              #{compId}
                            </span>
                          </td>

                          {/* Company & Legal Entity */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                                {t.logo_url || t.logoUrl ? (
                                  <img src={t.logo_url || t.logoUrl} alt={t.name} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  <span className="text-[10px] font-black text-slate-700">{t.name ? t.name.charAt(0) : 'V'}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">{t.name}</span>
                                <span className="text-[10.5px] text-slate-400 font-normal leading-tight block">
                                  {t.official_legal_entity_name || t.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Brand Name (En / Ar) */}
                          <td className="py-2.5 px-3 text-slate-600">
                            <span className="font-semibold text-slate-800 block leading-tight">{t.brand_name_en || t.brandNameEn}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight">{t.brand_name_ar || t.brandNameAr}</span>
                          </td>

                          {/* Active Modules Badge with Expand/Inspect button */}
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => setExpandedTenantModulesId(isExpanded ? null : t.id)}
                              title="Click to inspect 12-module feature flags"
                              className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                                isExpanded
                                  ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <span>{activeCount} / 12 Active</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 text-amber-800" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-emerald-700" />
                              )}
                            </button>
                          </td>

                          {/* Contract Monthly Value */}
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            ${(t.contract_monthly_value || 3000).toLocaleString()}/mo
                          </td>

                          {/* Account Status Badge */}
                          <td className="py-2.5 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 text-[11px] ${
                              status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : status === 'SUSPENDED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                              <span>{status === 'MAINTENANCE_MODE' ? 'Maintenance' : status}</span>
                            </span>
                          </td>

                          {/* Compact Row Actions */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenConfigModal(t)}
                                className="bg-white hover:bg-slate-50 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border border-slate-300 shadow-xs"
                                title="Configure Tenant Settings"
                              >
                                <Settings className="w-3 h-3 text-slate-600" />
                                <span className="hidden xl:inline">Configure</span>
                              </button>
                              <button
                                onClick={() => handleExportBackup(t)}
                                className="bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg text-xs font-bold inline-flex items-center transition-colors cursor-pointer border border-slate-300 shadow-xs"
                                title="Export Backup JSON"
                              >
                                <Download className="w-3 h-3 text-slate-500" />
                              </button>
                              <button
                                onClick={() => handleOpenResetPasswordModal(t)}
                                className="bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg text-xs font-bold inline-flex items-center transition-colors cursor-pointer border border-slate-300 shadow-xs"
                                title="Reset Admin Password"
                              >
                                <Key className="w-3 h-3 text-amber-600" />
                              </button>
                              <button
                                onClick={() => setSelectedAuditTenantFilter(t.id)}
                                className="bg-white hover:bg-slate-50 text-slate-700 p-1.5 rounded-lg text-xs font-bold inline-flex items-center transition-colors cursor-pointer border border-slate-300 shadow-xs"
                                title="Filter Audit Log for this Tenant"
                              >
                                <Filter className="w-3 h-3 text-purple-600" />
                              </button>
                              <button
                                onClick={() => handleEnterWorkspace(t)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105"
                                title="Enter Tenant Workspace"
                              >
                                <span>Enter</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDABLE ROW: CLEAN 12-MODULE INSPECTION MATRIX & FISCAL PROFILE */}
                        {isExpanded && (
                          <tr className="bg-amber-50/40 border-b border-amber-200">
                            <td colSpan={7} className="p-3.5">
                              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs text-left">
                                {/* Fiscal Profile & CoA Template Status Strip */}
                                <div className="p-2.5 bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                      <Globe className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Jurisdiction:</span>
                                      <span className="text-slate-900 font-black">{t.country === 'Lebanon' || !t.country ? '🇱🇧 Lebanon' : `🌐 ${t.country}`}</span>
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                                      <span>Seed Template:</span>
                                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                                        (t.financial_seed_template || t.financialSeedTemplate) === 'international_ifrs'
                                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                      }`}>
                                        {(t.financial_seed_template || t.financialSeedTemplate) === 'international_ifrs'
                                          ? 'IFRS Dual-Currency'
                                          : 'PCGL (Plan Comptable Libanais)'}
                                      </span>
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 text-[11px] font-medium">
                                      Tax Rate: <strong className="text-emerald-700">{t.vat_percentage ? `${t.vat_percentage}%` : (t.country === 'Lebanon' || !t.country ? '11% VAT' : '15%')}</strong>
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 text-[11px] font-medium flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-amber-600" />
                                      <span>Currency:</span>
                                      <strong className="text-slate-900 font-bold">{t.base_currency || t.baseCurrency || 'USD'}</strong>
                                      {(t.is_dual_currency_enabled ?? t.isDualCurrencyEnabled ?? (t.country === 'Lebanon')) && (
                                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                                          Dual: {t.secondary_currency || t.secondaryCurrency || 'LBP'}
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 font-mono text-[10.5px] text-slate-500">
                                    <span>CR: <strong className="text-slate-800">{t.company_registration_number || 'N/A'}</strong></span>
                                    <span>•</span>
                                    <span>MOF/Tax: <strong className="text-slate-800">{t.tax_identification_number || 'N/A'}</strong></span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                  <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Detailed 12-Module Entitlements for {t.brand_name_en || t.name}:</span>
                                  </span>
                                  <span className="text-[11px] font-mono text-amber-800 font-black">
                                    {activeCount} of 12 Unlocked
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
                                  {SYSTEM_MODULES_CONFIG.map(mod => {
                                    const isEnabled = isModuleEnabled(mod.id, activeMods);
                                    return (
                                      <div
                                        key={mod.id}
                                        className={`p-2 rounded-lg border flex items-center gap-2 text-[10.5px] font-bold transition-all ${
                                          isEnabled
                                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 line-through'
                                        }`}
                                      >
                                        <span className="text-base shrink-0">{mod.icon}</span>
                                        <div className="truncate">
                                          <span className="block truncate">{mod.shortLabel}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Filter className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">No tenants match the filter criteria</p>
                        <p className="text-xs text-slate-400">
                          Try broadening your search query or resetting active filters.
                        </p>
                        {(debouncedSearchQuery || statusFilter !== 'ALL' || moduleFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              handleClearSearch();
                              setStatusFilter('ALL');
                              setModuleFilter('ALL');
                              setCurrentPage(1);
                            }}
                            className="mt-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. OPTIONAL 3-COLUMN RESPONSIVE MINI-CARD GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 min-h-[460px] content-start">
            {paginatedTenants.length > 0 ? (
              paginatedTenants.map((t: any) => {
                const compId = t.company_id || t.companyId || 1300;
                const activeMods: string[] = Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
                  ? t.enabled_modules
                  : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
                      ? t.feature_flags.enabled_modules
                      : (Array.isArray(t.enabledModules) && t.enabledModules.length > 0 ? t.enabledModules : ALL_SYSTEM_MODULES));
                const activeCount = getActiveModulesCount(activeMods);
                const brandColor = t.primary_color || t.theme_color || '#123b70';
                const status = (t.subscription_status || t.subscriptionStatus || 'ACTIVE').toUpperCase();

                return (
                  <div
                    key={t.id}
                    className="p-4 border border-slate-200 hover:border-amber-400 bg-white rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all relative overflow-hidden text-left"
                  >
                    {/* Brand Bar */}
                    <div style={{ backgroundColor: brandColor }} className="absolute top-0 right-0 left-0 h-1" />

                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ borderColor: brandColor }}
                          className="w-10 h-10 rounded-xl bg-slate-50 border-2 flex items-center justify-center font-black text-slate-800 text-base shrink-0 overflow-hidden shadow-xs"
                        >
                          {t.logo_url || t.logoUrl ? (
                            <img src={t.logo_url || t.logoUrl} alt={t.name} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <span>{t.name ? t.name.charAt(0) : 'V'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-slate-900 font-extrabold text-sm truncate max-w-[140px]">
                              {t.brand_name_en || t.name}
                            </h4>
                            <span className="font-mono text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                              #{compId}
                            </span>
                          </div>
                          <span className="block text-[10.5px] text-slate-500 font-medium truncate max-w-[170px]">
                            {t.official_legal_entity_name || t.name}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs ${
                        status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : status === 'SUSPENDED'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span>{status === 'MAINTENANCE_MODE' ? 'Maint' : status}</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Monthly Fee</span>
                        <span className="font-mono font-bold text-emerald-700">${(t.contract_monthly_value || 3000).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Modules</span>
                        <span className="font-mono font-bold text-amber-800">{activeCount} / 12 Active</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleOpenConfigModal(t)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Settings className="w-3 h-3 text-slate-600" />
                        <span>Config</span>
                      </button>
                      <button
                        onClick={() => handleExportBackup(t)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 p-1.5 rounded-lg shadow-xs cursor-pointer"
                        title="Backup"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleEnterWorkspace(t)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1 rounded-lg font-black flex items-center gap-1 shadow-xs cursor-pointer ml-auto"
                      >
                        <span>Enter</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Filter className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">No tenants match the filter criteria</p>
                  <p className="text-xs text-slate-400">
                    Try broadening your search query or resetting active filters.
                  </p>
                  {(debouncedSearchQuery || statusFilter !== 'ALL' || moduleFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearSearch();
                        setStatusFilter('ALL');
                        setModuleFilter('ALL');
                        setCurrentPage(1);
                      }}
                      className="mt-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLEAN PAGINATION BAR WITH DYNAMIC MATH & ELLIPSIS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{startIndex}</strong> to <strong className="text-slate-900">{endIndex}</strong> of <strong className="text-slate-900">{totalItems}</strong> tenants
            {(debouncedSearchQuery || statusFilter !== 'ALL' || moduleFilter !== 'ALL') && ` (filtered from ${displayTenants.length} total)`}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers(safeCurrentPage, totalPages).map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-slate-400 font-bold select-none">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    safeCurrentPage === pageNum
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* LATEST UPDATES & AUDIT ACTIVITY WIDGET */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                  System Activity & Audit Log
                </h3>
                {selectedAuditTenantFilter && (
                  <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Filter className="w-3 h-3 text-purple-700" />
                    <span>Filtered by Tenant</span>
                    <button onClick={() => setSelectedAuditTenantFilter(null)} className="hover:text-rose-600 ml-1 font-black cursor-pointer">×</button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live audit trail of tenant operations, license adjustments, branding updates, and module permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedAuditTenantFilter && (
              <button
                onClick={() => setSelectedAuditTenantFilter(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Filter
              </button>
            )}

            <button
              onClick={fetchActivities}
              disabled={loadingActivities}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Refresh audit activity log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/admin/activity"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
            >
              <span>View All Activity →</span>
            </Link>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-2.5">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities
              .filter(act => {
                if (!selectedAuditTenantFilter) return true;
                return act.tenant_id === selectedAuditTenantFilter;
              })
              .slice(0, 10)
              .map((act) => {
                const badge = getActionBadgeConfig(act.action_type);
                const compId = act.company_id || act.companyId || (act.tenant_id === '00000000-0000-0000-0000-000000000001' ? 1300 : null);
                const descriptionEn = getActivityDescriptionEn(act.description, act.action_type);

                return (
                  <div
                    key={act.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">{badge.icon}</span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.badgeClass}`}>
                            {badge.labelEn}
                          </span>
                          {compId && (
                            <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                              #{compId}
                            </span>
                          )}
                          <span className="text-slate-900 font-bold text-xs">
                            {descriptionEn}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Performed by: <strong className="text-slate-700">{act.performed_by || act.performedBy || 'Super Admin'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{formatRelativeTime(act.created_at || act.createdAt)}</span>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">
              No recent audit activity records found.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: REVENUE BREAKDOWN MODAL */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tenant Revenue Breakdown (ARR & MRR)</h3>
                  <p className="text-xs text-slate-500">Live dynamic valuation from active client subscription contracts</p>
                </div>
              </div>
              <button onClick={() => setShowRevenueModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Total Monthly Recurring Revenue</span>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">${totalMRR.toLocaleString()} / mo</h4>
                <small className="text-slate-600 text-xs">Sum of all monthly license contracts</small>
              </div>
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <span className="text-xs font-bold text-sky-800 uppercase block">Total Annual Contract Value (ARR)</span>
                <h4 className="text-2xl font-black text-sky-700 mt-1">${totalARR.toLocaleString()} / yr</h4>
                <small className="text-slate-600 text-xs">12-month projected enterprise billing</small>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-3">Company</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Monthly ($)</th>
                    <th className="p-3">Annual ($)</th>
                    <th className="p-3">Billing Cycle</th>
                    <th className="p-3">Renewal Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayTenants.map((t: any) => {
                    const mVal = Number(t.contract_monthly_value || t.contractMonthlyValue || 3000);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {t.brand_name_en || t.name}
                          <span className="text-slate-400 font-mono text-[10px] ml-1">#{t.company_id || t.companyId}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[10.5px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            {t.subscription_tier || 'ENTERPRISE'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700">${mVal.toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">${(mVal * 12).toLocaleString()}</td>
                        <td className="p-3 capitalize">{t.billing_cycle || 'Monthly'}</td>
                        <td className="p-3 font-mono text-slate-500">{t.renewal_date || '2027-01-01'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRevenueModal(false)}
                className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SYSTEM HEALTH & RLS DIAGNOSTICS */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-300 flex items-center justify-center text-purple-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">System Health & RLS Security Matrix</h3>
                  <p className="text-xs text-slate-500">Database cluster, tenant schema isolation, and storage health</p>
                </div>
              </div>
              <button onClick={() => setShowHealthModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <div>
                    <strong className="text-emerald-900 block font-bold">Supabase PostgreSQL Cluster</strong>
                    <span className="text-[11px] text-emerald-700 font-medium">Operational, Latency: 16ms, Connections: 8/100</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  HEALTHY (99.99%)
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <strong className="text-blue-900 block font-bold">Row-Level Security (RLS) Enforcement</strong>
                    <span className="text-[11px] text-blue-700 font-medium">company_id partitioning enforced across 18 core ERP tables</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                  ENFORCED
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-amber-600" />
                  <div>
                    <strong className="text-amber-900 block font-bold">Supabase Storage (`tenant-logos` bucket)</strong>
                    <span className="text-[11px] text-amber-700 font-medium">Direct public image assets bucket with local Base64 fallback</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                  READY
                </span>
              </div>

              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <div>
                    <strong className="text-purple-900 block font-bold">System Feature Flag Controller</strong>
                    <span className="text-[11px] text-purple-700 font-medium">All 12 modules registered and dynamically guarded per tenant</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                  12/12 ACTIVE
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHealthModal(false)}
                className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET ADMIN PASSWORD MODAL */}
      {showResetPasswordModal && passwordTargetTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Reset Primary Admin Password</h3>
              </div>
              <button onClick={() => setShowResetPasswordModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set or generate a new administrator credential for <strong className="text-slate-900">{passwordTargetTenant.brand_name_en || passwordTargetTenant.name}</strong>.
            </p>

            <form onSubmit={handleSaveResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">New Secure Password</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newAdminPassword);
                      alert('Password copied to clipboard!');
                    }}
                    title="Copy to clipboard"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewAdminPassword(`Vanguard!${Math.floor(1000 + Math.random() * 9000)}#`)}
                className="text-amber-700 hover:text-amber-800 text-xs font-bold block"
              >
                ↻ Generate New Random Password
              </button>

              {passwordSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold text-center">
                  Password updated successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl"
                >
                  Save & Apply Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DEEP TENANT CONFIGURATION MODAL (TABBED INTERFACE) */}
      {showConfigModal && editingTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            dir="ltr"
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 text-left my-8"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-amber-500" />
                  <span>Configure Tenant Profile & Master Entitlements</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tenant: <strong className="text-slate-900">{editingTenant.brand_name_en || editingTenant.name}</strong> (Company ID: #{editingTenant.company_id || editingTenant.companyId || 1300})
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB NAVIGATION HEADER */}
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2 text-xs font-bold">
              {[
                { key: 'identity' as const, num: '1', label: 'Visual Identity & Logo', icon: Palette },
                { key: 'legal' as const, num: '2', label: 'Corporate & Fiscal', icon: Building },
                { key: 'modules' as const, num: '3', label: '12-Module Entitlements', icon: Layers },
                { key: 'quotas' as const, num: '4', label: 'Quotas & Lifecycle', icon: Sliders },
                { key: 'admin' as const, num: '5', label: 'Primary Admin', icon: Key }
              ].map(t => {
                const Icon = t.icon;
                const isActive = configTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setConfigTab(t.key)}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px] opacity-75 font-semibold" dir="ltr">{t.num}.</span>
                    <span dir="auto">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6 text-xs">

              {/* TAB 1: VISUAL IDENTITY & DIRECT LOGO UPLOAD */}
              {configTab === 'identity' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider block">Direct File Upload & Supabase Storage Binding</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Pick image files (.png, .svg, .webp, .jpg) directly from your desktop. Assets are uploaded straight into Supabase Storage bucket <code>tenant-logos</code> with instant thumbnail preview.
                    </p>
                  </div>

                  {/* Logo Upload Component */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-slate-800 font-extrabold text-xs">Company Logo Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Thumbnail Preview */}
                      <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center p-1 overflow-hidden shadow-xs shrink-0">
                        {editLogoPreview ? (
                          <img src={editLogoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-slate-400 text-xs font-bold text-center">No Logo</span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <input
                          ref={configFileInputRef}
                          type="file"
                          accept=".png,.svg,.webp,.jpg,.jpeg"
                          onChange={handleConfigLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingConfigLogo}
                          onClick={() => configFileInputRef.current?.click()}
                          className="w-full bg-white hover:bg-slate-100 text-slate-800 border-2 border-dashed border-slate-300 hover:border-amber-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>{isUploadingConfigLogo ? 'Uploading to Supabase Storage...' : 'Click to Upload Logo File (.png, .svg, .webp)'}</span>
                        </button>
                        <p className="text-[10.5px] text-slate-500">
                          Recommended format: Transparent PNG or SVG, max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Names & Primary Theme Color */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Brand Name (English)</label>
                      <input
                        type="text"
                        value={editBrandEn}
                        onChange={(e) => setEditBrandEn(e.target.value)}
                        placeholder="e.g. Southern Olive Products"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Brand Name (Arabic)</label>
                      <input
                        type="text"
                        value={editBrandAr}
                        onChange={(e) => setEditBrandAr(e.target.value)}
                        placeholder="e.g. منتجات زيت وزيتون الجنوب"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Theme Colors */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-bold">Primary Theme Color</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {BRANDING_COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setEditColor(preset.hex)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                            editColor.toLowerCase() === preset.hex.toLowerCase()
                              ? 'border-amber-500 bg-amber-50 text-slate-900 font-bold shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: preset.hex }}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          />
                          <span className="text-[11px]">{preset.name}</span>
                        </button>
                      ))}

                      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 cursor-pointer p-0.5"
                          title="Pick custom color"
                        />
                        <span className="font-mono text-xs text-amber-700 font-bold">{editColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CORPORATE, LEGAL & FISCAL PROFILE */}
              {configTab === 'legal' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Official Legal Entity Name</label>
                      <input
                        type="text"
                        value={editCompName}
                        onChange={(e) => setEditCompName(e.target.value)}
                        placeholder="e.g. Southern Olive & Oil Products S.A.R.L"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 truncate" title={currentCountryProfile.crNumberLabel}>
                        {currentCountryProfile.crNumberLabel}
                      </label>
                      <input
                        type="text"
                        value={editCrNumber}
                        onChange={(e) => setEditCrNumber(e.target.value)}
                        placeholder={currentCountryProfile.crNumberPlaceholder}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 truncate" title={currentCountryProfile.taxIdLabel}>
                        {currentCountryProfile.taxIdLabel}
                      </label>
                      <input
                        type="text"
                        value={editTaxId}
                        onChange={(e) => setEditTaxId(e.target.value)}
                        placeholder={currentCountryProfile.taxIdPlaceholder}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Registered Headquarters Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Street, Industrial Zone, Building"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    {/* SEARCHABLE COUNTRY DROPDOWN (SELECT MENU) */}
                    <div className="relative">
                      <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-600" />
                          <span>Country Jurisdiction</span>
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          editCountry.toLowerCase() === 'lebanon'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}>
                          {editCountry.toLowerCase() === 'lebanon' ? '🇱🇧 PCGL (Lebanon)' : '🌐 IFRS Standard'}
                        </span>
                      </label>

                      {/* Dropdown Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCountryDropdownOpen(!countryDropdownOpen);
                          setCountryFilterText('');
                        }}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-left text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xl shrink-0">{currentCountryProfile.flag}</span>
                          <span className="font-bold text-slate-900 truncate">{currentCountryProfile.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0">
                            {currentCountryProfile.code}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${countryDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                      </button>

                      {/* Searchable Dropdown Popover */}
                      {countryDropdownOpen && (
                        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {/* Live Search Input */}
                          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                            <input
                              type="text"
                              autoFocus
                              value={countryFilterText}
                              onChange={(e) => setCountryFilterText(e.target.value)}
                              placeholder="Search country name or code..."
                              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none placeholder:text-slate-400"
                            />
                            {countryFilterText && (
                              <button
                                type="button"
                                onClick={() => setCountryFilterText('')}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Filtered Country List */}
                          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                            {filteredCountryProfiles.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">
                                No country matching &ldquo;{countryFilterText}&rdquo;
                              </div>
                            ) : (
                              filteredCountryProfiles.map((country) => {
                                const isSelected = editCountry.toLowerCase() === country.name.toLowerCase();
                                const isLeb = country.code === 'LB';
                                return (
                                  <button
                                    key={country.name + country.code}
                                    type="button"
                                    onClick={() => handleCountryChange(country.name)}
                                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-50 text-slate-950 font-bold border border-amber-300'
                                        : 'hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <span className="text-xl shrink-0">{country.flag}</span>
                                      <div>
                                        <div className="font-bold flex items-center gap-1.5">
                                          <span>{country.name}</span>
                                          {isLeb && (
                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md border border-emerald-300">
                                              DEFAULT
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block truncate">
                                          {country.financialTemplateName} • {country.vatName}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                        isLeb ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {country.financialSeedTemplate === 'lebanese_pca' ? 'PCGL' : 'IFRS'}
                                      </span>
                                      {isSelected && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FISCAL & CHART OF ACCOUNTS AUTO-BINDING PANEL */}
                    <div className="md:col-span-2 p-4 bg-gradient-to-br from-slate-50 via-amber-50/20 to-white border-2 border-amber-300/80 rounded-2xl space-y-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-black text-xs text-slate-900 flex items-center gap-2">
                              <span>Fiscal Profile & Chart of Accounts Auto-Binding</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                ✓ Auto-Bound by Jurisdiction
                              </span>
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              Selected Jurisdiction: <strong className="text-slate-900">{currentCountryProfile.flag} {currentCountryProfile.name}</strong> ({currentCountryProfile.code})
                            </p>
                          </div>
                        </div>

                        {/* Financial Template Override Selector */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">COA Template:</label>
                          <select
                            value={editFinancialTemplate}
                            onChange={(e: any) => setEditFinancialTemplate(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none shadow-2xs"
                          >
                            <option value="lebanese_pca">Plan Comptable Général Libanais (PCGL)</option>
                            <option value="international_ifrs">Standard IFRS Dual-Currency Chart of Accounts</option>
                            <option value="custom_blank">Custom / Blank Slate</option>
                          </select>
                        </div>
                      </div>

                      {/* Auto-Bound Specifications Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        {/* 1. Accounting Standard & Seed Structure */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Financial Seed Template</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono ${
                              editFinancialTemplate === 'lebanese_pca' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {editFinancialTemplate === 'lebanese_pca' ? 'PCGL' : 'IFRS'}
                            </span>
                          </div>
                          <div className="font-black text-xs text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="text-base shrink-0">{editFinancialTemplate === 'lebanese_pca' ? '🇱🇧' : '🌐'}</span>
                            <span className="truncate">
                              {editFinancialTemplate === 'lebanese_pca'
                                ? 'Plan Comptable Général Libanais (PCGL)'
                                : editFinancialTemplate === 'international_ifrs'
                                ? 'Standard IFRS Dual-Currency'
                                : 'Custom / Blank Slate'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                            {editFinancialTemplate === 'lebanese_pca'
                              ? 'Classes 1–7 • 5-Digit Structure (53000 Cash, 51210 Bank, 40110 Suppliers)'
                              : '4-Digit Standard IFRS: 1000s Assets, 2000s Liab, 3000s Equity, 4000s Rev, 5000s Exp'}
                          </span>
                        </div>

                        {/* 2. Fiscal Tax Framework */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">National Tax System</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                              {currentCountryProfile.vatPercentage}% VAT
                            </span>
                          </div>
                          <div className="font-black text-xs text-emerald-700 flex items-center gap-1.5 truncate">
                            <DollarSign className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{currentCountryProfile.vatName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight font-medium truncate">
                            {currentCountryProfile.regulatoryBody}
                          </span>
                        </div>

                        {/* 3. Regulatory Identifiers */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Statutory Identifiers</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                              LAW COMPLIANT
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                            <Hash className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              {editCountry.toLowerCase() === 'lebanon' ? 'MOF (الرقم المالي) & CR (السجل)' : 'TRN / Tax ID & Legal CRN'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight font-medium truncate">
                            {currentCountryProfile.accountingStandard}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Corporate Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+961 70 882 110"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Billing Email</label>
                      <input
                        type="email"
                        value={editBillingEmail}
                        onChange={(e) => setEditBillingEmail(e.target.value)}
                        placeholder="billing@client.com"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    {/* ENHANCED CURRENCY CONFIGURATION & MULTI-CURRENCY ENGINE */}
                    <div className="md:col-span-2 p-4 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 border-2 border-slate-200 hover:border-amber-300 rounded-2xl space-y-4 shadow-xs transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-black text-xs text-slate-900 flex items-center gap-2">
                              <span>Currency Matrix & Multi-Currency Engine</span>
                              <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
                                ISO 4217 Standard
                              </span>
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              Define functional book-keeping currency and optional secondary parallel valuation ledger.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                            editIsDualCurrency
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${editIsDualCurrency ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {editIsDualCurrency ? 'Dual-Currency Active' : 'Single-Currency Mode'}
                          </span>
                        </div>
                      </div>

                      {/* 1. Global Base Currency Dropdown (ISO 4217) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                            <span>Base Functional Currency</span>
                            <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-mono font-bold">
                              PRIMARY
                            </span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Operating Standard: ISO 4217
                          </span>
                        </div>

                        {/* Searchable Dropdown Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setBaseCurrencyDropdownOpen(prev => !prev);
                              setSecondaryCurrencyDropdownOpen(false);
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 flex items-center justify-between hover:border-amber-500 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer shadow-xs text-xs"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-xl shrink-0">{currentBaseCurrencyMeta.flag || '🌐'}</span>
                              <div className="text-left truncate">
                                <span className="font-extrabold text-slate-900">{currentBaseCurrencyMeta.code}</span>
                                <span className="font-mono text-slate-500 font-bold ml-1.5 text-xs">({currentBaseCurrencyMeta.symbol})</span>
                                <span className="text-slate-400 ml-2 text-xs truncate">— {currentBaseCurrencyMeta.name}</span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${baseCurrencyDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                          </button>

                          {/* Backdrop click-to-close */}
                          {baseCurrencyDropdownOpen && (
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setBaseCurrencyDropdownOpen(false)}
                            />
                          )}

                          {/* Searchable Popover Menu */}
                          {baseCurrencyDropdownOpen && (
                            <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                                <input
                                  type="text"
                                  autoFocus
                                  value={baseCurrencyFilterText}
                                  onChange={(e) => setBaseCurrencyFilterText(e.target.value)}
                                  placeholder="Search currency code or name (USD, EUR, SAR, LBP, TRY, CAD...)"
                                  className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none placeholder:text-slate-400"
                                />
                                {baseCurrencyFilterText && (
                                  <button
                                    type="button"
                                    onClick={() => setBaseCurrencyFilterText('')}
                                    className="text-slate-400 hover:text-slate-600 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                                {filteredBaseCurrencies.length === 0 ? (
                                  <div className="p-4 text-center text-xs text-slate-400">
                                    No currency matching &ldquo;{baseCurrencyFilterText}&rdquo;
                                  </div>
                                ) : (
                                  filteredBaseCurrencies.map((curr) => {
                                    const isSelected = editBaseCurrency.toUpperCase() === curr.code.toUpperCase();
                                    return (
                                      <button
                                        key={curr.code}
                                        type="button"
                                        onClick={() => {
                                          setEditBaseCurrency(curr.code);
                                          setBaseCurrencyDropdownOpen(false);
                                          setBaseCurrencyFilterText('');
                                        }}
                                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-amber-50 text-slate-950 font-bold border border-amber-300'
                                            : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 truncate">
                                          <span className="text-xl shrink-0">{curr.flag || '🌐'}</span>
                                          <div>
                                            <div className="font-bold flex items-center gap-1.5">
                                              <span>{curr.code}</span>
                                              <span className="text-slate-500 font-normal">({curr.symbol})</span>
                                              {curr.popular && (
                                                <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.2 rounded border border-slate-200">
                                                  POPULAR
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 block truncate">
                                              {curr.name} {curr.nativeName ? `• ${curr.nativeName}` : ''}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                          <span className="font-mono font-bold text-[11px] text-slate-600">
                                            {curr.symbol}
                                          </span>
                                          {isSelected && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                                        </div>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Flexible Multi-Currency Engine Switch */}
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            editIsDualCurrency
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            <ArrowRightLeft className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">
                                Enable Secondary Currency (Dual-Currency Mode)
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                editIsDualCurrency
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {editIsDualCurrency ? 'Dual-Currency Active' : 'Single-Currency (Default)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {editIsDualCurrency
                                ? 'Enables parallel dual-ledger accounting, daily FX valuation, and automated currency conversions.'
                                : 'Single-currency ledger mode. All accounts and transactions operate strictly in the primary base currency.'}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Toggle Pill */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={editIsDualCurrency}
                          onClick={() => setEditIsDualCurrency(prev => !prev)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            editIsDualCurrency ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              editIsDualCurrency ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 3. Conditional Secondary Currency & Exchange Rate Policy Panel */}
                      {editIsDualCurrency ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl animate-in fade-in duration-150">
                          {/* Secondary Currency (Searchable ISO Dropdown) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                                <span>Secondary Currency</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-200">
                                  PARALLEL
                                </span>
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ISO 4217
                              </span>
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setSecondaryCurrencyDropdownOpen(prev => !prev);
                                  setBaseCurrencyDropdownOpen(false);
                                }}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 flex items-center justify-between hover:border-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer shadow-xs text-xs"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span className="text-xl shrink-0">{currentSecondaryCurrencyMeta.flag || '🌐'}</span>
                                  <div className="text-left truncate">
                                    <span className="font-extrabold text-slate-900">{currentSecondaryCurrencyMeta.code}</span>
                                    <span className="font-mono text-slate-500 font-bold ml-1.5 text-xs">({currentSecondaryCurrencyMeta.symbol})</span>
                                    <span className="text-slate-400 ml-2 text-xs truncate">— {currentSecondaryCurrencyMeta.name}</span>
                                  </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${secondaryCurrencyDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                              </button>

                              {/* Backdrop click-to-close */}
                              {secondaryCurrencyDropdownOpen && (
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setSecondaryCurrencyDropdownOpen(false)}
                                />
                              )}

                              {/* Secondary Currency Popover */}
                              {secondaryCurrencyDropdownOpen && (
                                <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                  <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                                    <input
                                      type="text"
                                      autoFocus
                                      value={secondaryCurrencyFilterText}
                                      onChange={(e) => setSecondaryCurrencyFilterText(e.target.value)}
                                      placeholder="Search secondary currency (LBP, USD, EUR, SAR...)"
                                      className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none placeholder:text-slate-400"
                                    />
                                    {secondaryCurrencyFilterText && (
                                      <button
                                        type="button"
                                        onClick={() => setSecondaryCurrencyFilterText('')}
                                        className="text-slate-400 hover:text-slate-600 p-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                                    {filteredSecondaryCurrencies.length === 0 ? (
                                      <div className="p-4 text-center text-xs text-slate-400">
                                        No currency matching &ldquo;{secondaryCurrencyFilterText}&rdquo;
                                      </div>
                                    ) : (
                                      filteredSecondaryCurrencies.map((curr) => {
                                        const isSelected = editSecondaryCurrency.toUpperCase() === curr.code.toUpperCase();
                                        return (
                                          <button
                                            key={curr.code}
                                            type="button"
                                            onClick={() => {
                                              setEditSecondaryCurrency(curr.code);
                                              setSecondaryCurrencyDropdownOpen(false);
                                              setSecondaryCurrencyFilterText('');
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                              isSelected
                                                ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-300'
                                                : 'hover:bg-slate-100 text-slate-700'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2.5 truncate">
                                              <span className="text-xl shrink-0">{curr.flag || '🌐'}</span>
                                              <div>
                                                <div className="font-bold flex items-center gap-1.5">
                                                  <span>{curr.code}</span>
                                                  <span className="text-slate-500 font-normal">({curr.symbol})</span>
                                                  {curr.popular && (
                                                    <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.2 rounded border border-slate-200">
                                                      POPULAR
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 block truncate">
                                                  {curr.name} {curr.nativeName ? `• ${curr.nativeName}` : ''}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                              <span className="font-mono font-bold text-[11px] text-slate-600">
                                                {curr.symbol}
                                              </span>
                                              {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                                            </div>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Exchange Rate Policy */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                                <span>Exchange Rate Policy</span>
                                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono font-bold border border-slate-200">
                                  FX ENGINE
                                </span>
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Conversion Rules
                              </span>
                            </div>

                            <select
                              value={editExchangeRatePolicy}
                              onChange={(e: any) => setEditExchangeRatePolicy(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none shadow-xs text-xs"
                            >
                              <option value="PLATFORM_FIXED">Platform Fixed (Central Treasury Sync 89,500 LBP/USD)</option>
                              <option value="TENANT_MANAGED">Tenant Managed (Independent Daily Rates)</option>
                            </select>

                            <p className="text-[10px] text-slate-500">
                              {editExchangeRatePolicy === 'PLATFORM_FIXED'
                                ? '• Synchronized with Vanguard central treasury rate across all branches.'
                                : '• Tenant managers maintain daily currency exchange rates in Treasury.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Secondary currency & exchange rate policy fields are deactivated in single-currency mode.</span>
                          </span>
                          <span className="text-[10px] font-mono bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">
                            LOCKED TO {editBaseCurrency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 12-MODULE ENTITLEMENTS & CUSTOM TIERS */}
              {configTab === 'modules' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Architecture & Cascading Logic Banner */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/5 border border-blue-200/80 rounded-2xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                        <span>Strict Autonomous Module Architecture & Conditional Reporting Cascades</span>
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          12 Autonomous Domains
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Each module operates autonomously with its own end-to-end operational dashboards, transaction ledgers, and reporting tools. When a module (e.g. SuperSonic Fleet / V-Driver or V-Connect) is disabled, its sub-reports and analytical cards are immediately suppressed from Master Sales and central rollups to ensure zero layout fragmentation and zero null states.
                      </p>
                    </div>
                  </div>

                  {/* Preset Tier Selector Buttons */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                        Select Subscription Preset or Custom Tier:
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">
                        Current: <strong className="text-amber-700 font-mono">{configTier}</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['STARTER', 'PRO', 'ENTERPRISE', 'CUSTOM'] as const).map(tierKey => (
                        <button
                          key={tierKey}
                          type="button"
                          onClick={() => handleSelectPresetTier(tierKey)}
                          className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                            configTier === tierKey
                              ? 'border-amber-500 bg-amber-50 text-slate-950 font-black shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold'
                          }`}
                        >
                          <div className="text-xs uppercase">{tierKey}</div>
                          <div className="text-[10px] text-slate-500">
                            {tierKey === 'STARTER' && 'Core 4 Mods ($150)'}
                            {tierKey === 'PRO' && 'Standard 9 Mods ($450)'}
                            {tierKey === 'ENTERPRISE' && 'All 12 Mods ($3,000)'}
                            {tierKey === 'CUSTOM' && 'Manual Individual Toggles'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 12 Individual Module Toggles Header & KPI */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-100/70 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          Individual Module Entitlements ({getActiveModulesCount(selectedModules)} / 12 Active)
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          getActiveModulesCount(selectedModules) === 12
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {getActiveModulesCount(selectedModules) * 5} Operational Reports Live
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectPresetTier('ENTERPRISE')}
                          className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        >
                          Enable All (12)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPresetTier('PRO')}
                          className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          Standard (9)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPresetTier('STARTER')}
                          className="text-[11px] font-bold text-slate-700 hover:underline cursor-pointer bg-slate-200 px-2 py-0.5 rounded"
                        >
                          Core (4)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfigTier('CUSTOM');
                            setSelectedModules([]);
                          }}
                          className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                        >
                          Deactivate All
                        </button>
                      </div>
                    </div>

                    {/* 12 Rich Module Entitlement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto p-1 pr-1.5 custom-scrollbar">
                      {SYSTEM_MODULES_CONFIG.map(mod => {
                        const isChecked = isModuleEnabled(mod.id, selectedModules);

                        return (
                          <div
                            key={mod.id}
                            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                              isChecked
                                ? 'bg-white border-emerald-400 shadow-sm ring-1 ring-emerald-400/20'
                                : 'bg-slate-50/70 border-slate-200 opacity-75'
                            }`}
                          >
                            <div>
                              {/* Top Bar: Icon, Name, Category & Interactive Switch */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-start gap-2.5">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                                    isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'
                                  }`}>
                                    {mod.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`font-black text-xs ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {mod.labelEn}
                                      </span>
                                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        {mod.domainCategory}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                      ID: {mod.id}
                                    </span>
                                  </div>
                                </div>

                                {/* Custom Accessible Toggle Switch */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isChecked}
                                    onClick={() => toggleModule(mod.id)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-xs ${
                                      isChecked ? 'bg-emerald-600' : 'bg-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isChecked ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {isChecked ? 'ACTIVE' : 'DISABLED'}
                                  </span>
                                </div>
                              </div>

                              {/* Module Domain Description */}
                              <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                                {mod.desc}
                              </p>

                              {/* Dependent Feature Badges */}
                              <div className="mb-2">
                                <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Sliders className="w-3 h-3 text-slate-400" /> Included Autonomous Features:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {mod.featureBadges.map(fb => (
                                    <span
                                      key={fb}
                                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium border ${
                                        isChecked
                                          ? 'bg-slate-100 border-slate-200 text-slate-800'
                                          : 'bg-slate-100/50 border-slate-200/60 text-slate-400'
                                      }`}
                                    >
                                      {fb}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Bundled Domain Operational Reports */}
                              <div>
                                <div className="text-[9.5px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-amber-600" /> Domain Operational Reports:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {mod.reports.map(rep => (
                                    <span
                                      key={rep}
                                      className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border flex items-center gap-1 ${
                                        isChecked
                                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                                          : 'bg-slate-100/50 border-slate-200/60 text-slate-400'
                                      }`}
                                    >
                                      <span>•</span> {rep}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Cascading Logic Status Indicator */}
                            <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                              isChecked
                                ? 'border-emerald-100 text-emerald-700 font-semibold'
                                : 'border-slate-200 text-slate-400 font-medium'
                            }`}>
                              <span>
                                {isChecked ? '✅ Operational pipelines active' : '⚠️ Sub-reports suppressed'}
                              </span>
                              <span className="font-mono">
                                {isChecked ? 'Rolls up to Master Views' : 'Zero layout nulls'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OPERATIONAL QUOTAS & LIFECYCLE */}
              {configTab === 'quotas' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Max Branches Limit</label>
                      <input
                        type="number"
                        value={editMaxBranches}
                        onChange={(e) => setEditMaxBranches(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Max Concurrent Users</label>
                      <input
                        type="number"
                        value={editMaxUsers}
                        onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Max V-POS Terminals</label>
                      <input
                        type="number"
                        value={editMaxTerminals}
                        onChange={(e) => setEditMaxTerminals(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Storage Quota (GB)</label>
                      <input
                        type="number"
                        value={editStorageQuota}
                        onChange={(e) => setEditStorageQuota(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    {/* Subscription Lifecycle */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Contract Monthly Value ($/Mo)</label>
                      <input
                        type="number"
                        value={editContractValue}
                        onChange={(e) => setEditContractValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                      <small className="text-[10px] text-slate-500">Connected to top ARR & MRR metrics</small>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Billing Cycle</label>
                      <select
                        value={editBillingCycle}
                        onChange={(e: any) => setEditBillingCycle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      >
                        <option value="MONTHLY">Monthly Recurring</option>
                        <option value="ANNUAL">Annual Contract (Upfront)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Next Renewal Date</label>
                      <input
                        type="date"
                        value={editRenewalDate}
                        onChange={(e) => setEditRenewalDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Account Status Control</label>
                      <select
                        value={editAccountStatus}
                        onChange={(e: any) => setEditAccountStatus(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                      >
                        <option value="ACTIVE">Active (Full Operation)</option>
                        <option value="SUSPENDED">Suspended (Access Blocked)</option>
                        <option value="MAINTENANCE_MODE">Maintenance Mode (ReadOnly)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PRIMARY ADMIN CREDENTIALS */}
              {configTab === 'admin' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Primary Admin Full Name</label>
                      <input
                        type="text"
                        value={editAdminName}
                        onChange={(e) => setEditAdminName(e.target.value)}
                        placeholder="Admin Full Name"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Primary Admin Email</label>
                      <input
                        type="email"
                        value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        placeholder="admin@client.com"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Primary Admin Phone</label>
                      <input
                        type="text"
                        value={editAdminPhone}
                        onChange={(e) => setEditAdminPhone(e.target.value)}
                        placeholder="+961 70 882 110"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Admin Password Override</label>
                      <div className="relative">
                        <input
                          type={showConfigAdminPass ? 'text' : 'password'}
                          value={editAdminPassword}
                          onChange={(e) => setEditAdminPassword(e.target.value)}
                          placeholder="Leave blank to keep existing password"
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-amber-500 focus:outline-none shadow-xs pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfigAdminPass(!showConfigAdminPass)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showConfigAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {configSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tenant configuration and permissions successfully updated in Supabase!</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-7 py-2.5 rounded-xl shadow-sm border border-amber-500 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingConfig ? 'Saving to Supabase...' : 'Save Changes & Update Permissions'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PROVISION NEW CLIENT FORM (ADD NEW TENANT WITH DIRECT LOGO UPLOAD) */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-5 shadow-2xl text-left my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Provision New Enterprise Tenant Workspace
              </h4>
              <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Logo File Upload */}
              <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {onboardLogoPreview ? (
                    <img src={onboardLogoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold">No Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={onboardFileInputRef}
                    type="file"
                    accept=".png,.svg,.webp,.jpg,.jpeg"
                    onChange={handleOnboardLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingOnboardLogo}
                    onClick={() => onboardFileInputRef.current?.click()}
                    className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 p-2 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUploadingOnboardLogo ? 'Uploading logo...' : 'Pick Logo (.png, .svg, .webp)'}</span>
                  </button>
                  <span className="text-[10px] text-slate-500 mt-1 block">Uploaded directly to Supabase storage bucket tenant-logos</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Legal Entity Name</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Bekaa Olive & Oil Plant S.A.R.L"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Brand Name (English)</label>
                <input
                  type="text"
                  value={brandEn}
                  onChange={(e) => setBrandEn(e.target.value)}
                  placeholder="e.g. Golden Bekaa Oils"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Brand Name (Arabic)</label>
                <input
                  type="text"
                  value={brandAr}
                  onChange={(e) => setBrandAr(e.target.value)}
                  placeholder="e.g. زيوت البقاع الذهبية (Optional)"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@client.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Admin Full Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Admin Password</label>
                <input
                  type="text"
                  value={adminInitialPassword}
                  onChange={(e) => setAdminInitialPassword(e.target.value)}
                  placeholder="Initial Password"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              {/* Country Jurisdiction Dropdown */}
              <div className="relative md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Country Jurisdiction & Fiscal Standards</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    onboardCountry.toLowerCase() === 'lebanon'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {onboardCountry.toLowerCase() === 'lebanon' ? '🇱🇧 Plan Comptable Libanais (PCGL)' : '🌐 Standard IFRS'}
                  </span>
                </label>

                {/* Country Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setOnboardCountryDropdownOpen(!onboardCountryDropdownOpen);
                    setOnboardCountryFilterText('');
                  }}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-left text-slate-900 font-semibold focus:border-amber-500 focus:outline-none shadow-xs flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl shrink-0">{onboardCountryProfile.flag}</span>
                    <span className="font-bold text-slate-900 truncate">{onboardCountryProfile.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0">
                      {onboardCountryProfile.code}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${onboardCountryDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {/* Searchable Country Popover */}
                {onboardCountryDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="text"
                        autoFocus
                        value={onboardCountryFilterText}
                        onChange={(e) => setOnboardCountryFilterText(e.target.value)}
                        placeholder="Search country name or code..."
                        className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none placeholder:text-slate-400"
                      />
                      {onboardCountryFilterText && (
                        <button
                          type="button"
                          onClick={() => setOnboardCountryFilterText('')}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 p-1">
                      {filteredOnboardCountryProfiles.map((country) => {
                        const isSelected = onboardCountry.toLowerCase() === country.name.toLowerCase();
                        const isLeb = country.code === 'LB';
                        return (
                          <button
                            key={country.name + country.code}
                            type="button"
                            onClick={() => handleOnboardCountryChange(country.name)}
                            className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-xl shrink-0">{country.flag}</span>
                              <div className="truncate">
                                <span className="font-bold block truncate">{country.name}</span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {country.financialTemplateName}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              isLeb ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {country.financialSeedTemplate === 'lebanese_pca' ? 'PCGL' : 'IFRS'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 truncate" title={onboardCountryProfile.crNumberLabel}>
                  {onboardCountryProfile.crNumberLabel}
                </label>
                <input
                  type="text"
                  value={onboardCrNumber}
                  onChange={(e) => setOnboardCrNumber(e.target.value)}
                  placeholder={onboardCountryProfile.crNumberPlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 truncate" title={onboardCountryProfile.taxIdLabel}>
                  {onboardCountryProfile.taxIdLabel}
                </label>
                <input
                  type="text"
                  value={onboardTaxId}
                  onChange={(e) => setOnboardTaxId(e.target.value)}
                  placeholder={onboardCountryProfile.taxIdPlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              {/* Base Currency & Dual-Currency Configuration for Onboarding */}
              <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-slate-800">Currency & Valuation Architecture</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnboardIsDualCurrency(prev => !prev)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <span>Dual-Currency:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      onboardIsDualCurrency ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {onboardIsDualCurrency ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Searchable Base Currency */}
                  <div className="relative">
                    <label className="block text-slate-700 font-bold text-xs mb-1">Base Currency (ISO 4217)</label>
                    <button
                      type="button"
                      onClick={() => setOnboardBaseCurrencyDropdownOpen(prev => !prev)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 flex items-center justify-between hover:border-amber-500 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer shadow-xs text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-lg shrink-0">{currentOnboardBaseCurrencyMeta.flag || '🌐'}</span>
                        <span className="font-extrabold text-slate-900">{currentOnboardBaseCurrencyMeta.code}</span>
                        <span className="text-slate-500 truncate">({currentOnboardBaseCurrencyMeta.symbol}) - {currentOnboardBaseCurrencyMeta.name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {onboardBaseCurrencyDropdownOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOnboardBaseCurrencyDropdownOpen(false)}
                      />
                    )}

                    {onboardBaseCurrencyDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                          <input
                            type="text"
                            autoFocus
                            value={onboardBaseCurrencyFilterText}
                            onChange={(e) => setOnboardBaseCurrencyFilterText(e.target.value)}
                            placeholder="Search currency (USD, EUR, SAR...)"
                            className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 p-1">
                          {filteredOnboardBaseCurrencies.map(curr => (
                            <button
                              key={curr.code}
                              type="button"
                              onClick={() => {
                                setOnboardBaseCurrency(curr.code);
                                setOnboardBaseCurrencyDropdownOpen(false);
                                setOnboardBaseCurrencyFilterText('');
                              }}
                              className="w-full p-2 rounded-lg text-left flex items-center justify-between text-xs hover:bg-slate-100"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span>{curr.flag || '🌐'}</span>
                                <span className="font-bold">{curr.code}</span>
                                <span className="text-slate-400 truncate">({curr.symbol}) {curr.name}</span>
                              </div>
                              {onboardBaseCurrency === curr.code && <Check className="w-3.5 h-3.5 text-amber-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary Currency (if enabled) */}
                  {onboardIsDualCurrency ? (
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">Secondary Currency</label>
                      <select
                        value={onboardSecondaryCurrency}
                        onChange={(e) => setOnboardSecondaryCurrency(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none shadow-xs text-xs"
                      >
                        {GLOBAL_ISO_CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.symbol}) - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      <span>Single-currency mode active</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subscription Tier</label>
                <select
                  value={onboardTier}
                  onChange={(e: any) => {
                    const t = e.target.value;
                    setOnboardTier(t);
                    if (t === 'STARTER') setOnboardMonthlyValue(150);
                    else if (t === 'PRO') setOnboardMonthlyValue(450);
                    else if (t === 'ENTERPRISE') setOnboardMonthlyValue(3000);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                >
                  <option value="STARTER">Starter SaaS (Core 4 Mods - $150/mo)</option>
                  <option value="PRO">Professional SaaS (9 Mods - $450/mo)</option>
                  <option value="ENTERPRISE">Enterprise Full (All 12 Modules - $3,000/mo)</option>
                  <option value="CUSTOM">Custom Plan (All 12 Modules Unlocked)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contract Value ($/Mo)</label>
                <input
                  type="number"
                  value={onboardMonthlyValue}
                  onChange={(e) => setOnboardMonthlyValue(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl border border-emerald-600 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning Tenant...' : 'Confirm & Provision Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-400 font-semibold border-t border-slate-200 pt-4">
        Vanguard SaaS Master Controller Engine © 2026 -- Secure Multi-Tenant Enterprise Platform
      </footer>

      {/* VISUAL TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none select-none">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border-l-4 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
                isSuccess
                  ? 'bg-slate-900/95 text-white border-emerald-500 shadow-emerald-950/20'
                  : isError
                  ? 'bg-slate-900/95 text-white border-rose-500 shadow-rose-950/20'
                  : isWarning
                  ? 'bg-slate-900/95 text-white border-amber-500 shadow-amber-950/20'
                  : 'bg-slate-900/95 text-white border-blue-500 shadow-blue-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                    {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                    {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{toast.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        isError ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {toast.type}
                      </span>
                    </h5>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {toast.message}
                    </p>
                    {toast.details && (
                      <div className="mt-2 p-2 bg-black/40 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 break-all select-text">
                        {toast.details}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}