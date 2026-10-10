'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  ShoppingCart,
  Truck,
  Share2,
  Factory,
  Box,
  Users,
  FileSpreadsheet,
  UserCheck,
  Globe,
  Sliders,
  Settings,
  MapPin,
  Fuel,
  Wrench,
  Route,
  IdCard,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Droplets,
  Building,
  Building2,
  ListFilter,
  Split,
  Tag,
  Lock,
  CalendarDays,
  Headphones,
  UserPlus,
  Scale,
  Package,
  CalendarCheck,
  TrendingUp,
  FileText,
  FileCheck,
  CreditCard,
  PieChart,
  UserCog,
  Search,
  ArrowRightLeft,
  BookOpen,
  ShieldCheck,
  Coins,
  Percent,
  Bookmark,
  Palette,
  Maximize2,
  Receipt,
  Mail,
  Gift,
  PlusCircle,
  XCircle,
  Folder,
  FolderTree,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  ClipboardList,
  ClipboardCheck,
  PackageCheck,
  ShieldAlert,
  FileCode,
  Monitor,
  ShoppingBag,
  MessageCircle,
  Activity,
  Target,
  Smartphone,
  Download
} from 'lucide-react';

import { useRouter, usePathname } from 'next/navigation';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { isModuleLicensed } from '@/lib/license';
import { usePermission } from '@/lib/PermissionContext';
import TenantSettingsModal from './TenantSettingsModal';
import StandaloneAppDownloadModal, { StandaloneAppType } from './StandaloneAppDownloadModal';

interface SidebarProps {
  activeScreen?: string;
  onSelectScreen?: (screenKey: string) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  className?: string;
}

export default function Sidebar({
  activeScreen = 'grid-dash',
  onSelectScreen,
  isOpen: externalIsOpen,
  onToggleOpen,
  className
}: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTenant, isModuleEnabled: contextIsModuleEnabled } = useTenant();
  const { canAccess, activeRole } = usePermission();
  const { language, dir, t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [downloadAppModal, setDownloadAppModal] = useState<StandaloneAppType | null>(null);
  const [sidebarFilter, setSidebarFilter] = useState<string>('');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    const nextState = !isOpen;
    setInternalIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
  };

  const ensureOpen = () => {
    if (!isOpen) {
      setInternalIsOpen(true);
      if (onToggleOpen) onToggleOpen(true);
    }
  };

  // Accordion toggle states for all 12 main modules & their sub-accordions
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sales: false,
    sc_setup: false,
    sc_moresetup: false,
    op: false,
    op_actions: false,
    op_prodreq: false,
    op_events: false,
    op_setup: false,
    op_more: false,
    purchasing: false,
    cust: false,
    cm_settings: false,
    feedback: false,
    fb_setup: false,
    loyalty: false,
    acc: false,
    acc_actions: false,
    acc_setup: false,
    acc_aux: false,
    acc_dept: false,
    hr: false,
    hr_orgsetup: false,
    hr_attendance: false,
    hr_payroll: false,
    supersonic: false,
    fleet: false,
    social: false,
    'pressing-mill': false,
    pressing: false,
    'v-store': false,
    store: false,
  });

// Accordion groups stay strictly closed on initial load and navigation unless user clicks to expand

  const toggleGroup = (groupKey: string) => {
    React.startTransition(() => {
      setExpandedGroups(prev => {
        const nextVal = !prev[groupKey];
        const nextState = { ...prev, [groupKey]: nextVal };
        if (groupKey === 'pressing-mill' || groupKey === 'pressing') {
          nextState['pressing-mill'] = nextVal;
          nextState['pressing'] = nextVal;
        }
        if (groupKey === 'v-store' || groupKey === 'store') {
          nextState['v-store'] = nextVal;
          nextState['store'] = nextVal;
        }
        if (groupKey === 'fleet' || groupKey === 'supersonic') {
          nextState['fleet'] = nextVal;
          nextState['supersonic'] = nextVal;
        }
        return nextState;
      });
    });
  };

  const handleNav = (screenKey: string, href?: string) => {
    React.startTransition(() => {
      if (onSelectScreen) {
        onSelectScreen(screenKey);
      }
      if (href) {
        router.push(href);
        return;
      }
    });
  };

  const matchesSearch = (title: string) => {
    if (!sidebarFilter) return true;
    return title.toLowerCase().includes(sidebarFilter.toLowerCase());
  };

  // Helper to check if a specific system module is enabled for the active tenant and permitted by active RBAC role
  const isModuleEnabled = (moduleKey: string): boolean => {
    // 1. Check tenant license/feature enablement
    const tenantLicensed = contextIsModuleEnabled ? contextIsModuleEnabled(moduleKey) : isModuleLicensed(currentTenant, moduleKey);
    if (!tenantLicensed) return false;

    // 2. Enforce Role-Based Access Control (RBAC) dynamically
    if (canAccess) {
      let rbacCode = moduleKey;
      if (moduleKey === 'sales') rbacCode = 'mod1_sales_pos';
      else if (moduleKey === 'operations' || moduleKey === 'inventory') rbacCode = 'mod2_operations_inventory';
      else if (moduleKey === 'crm' || moduleKey === 'customer') rbacCode = 'mod3_customer_crm';
      else if (moduleKey === 'loyalty') rbacCode = 'mod4_loyalty';
      else if (moduleKey === 'accounting' || moduleKey === 'finance') rbacCode = 'mod5_accounting_financials';
      else if (moduleKey === 'hr' || moduleKey === 'payroll') rbacCode = 'mod6_hr_payroll';
      else if (moduleKey === 'fleet' || moduleKey === 'supersonic' || moduleKey === 'vtrack') rbacCode = 'mod7_fleet_dispatch';
      else if (moduleKey === 'vconnect' || moduleKey === 'messaging') rbacCode = 'mod8_vconnect_messaging';
      else if (moduleKey === 'pressing' || moduleKey === 'pressing-mill') rbacCode = 'mod9_pressing_mill';
      else if (moduleKey === 'vmenu' || moduleKey === 'v-store' || moduleKey === 'store') rbacCode = 'mod10_vmenu_online';
      else if (moduleKey === 'formulations' || moduleKey === 'blending') rbacCode = 'mod11_commercial_formulations';
      else if (moduleKey === 'governance' || moduleKey === 'system_settings') rbacCode = 'mod12_system_governance';

      return canAccess(rbacCode, 'view');
    }

    return true;
  };

  return (
    <aside
      className={`bg-white border-e border-gray-200 shadow-2xs transition-all duration-300 flex flex-col shrink-0 z-30 font-sans select-none overflow-hidden ${
        isOpen ? 'w-64' : 'w-16'
      } ${className || 'min-h-[calc(100vh-96px)] h-full'}`}
      dir={dir}
    >
      {/* 1. SIDEBAR TOP CONTROL HEADER (HAMBURGER & HOME) */}
      <div className={`border-b border-gray-200 flex flex-col gap-2 bg-white overflow-hidden ${isOpen ? 'p-3' : 'py-2.5 px-2 items-center'}`}>
        <div className={`w-full flex ${isOpen ? 'items-center justify-between' : 'flex-col items-center justify-center gap-1.5'} overflow-hidden`}>
          {/* HAMBURGER TOGGLE ICON (☰) */}
          <button
            onClick={handleToggle}
            title={isOpen ? t('collapse_sidebar', 'Collapse Sidebar') : t('expand_sidebar', 'Expand Sidebar')}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 transition-colors cursor-pointer shrink-0"
          >
            <Menu strokeWidth={1.5} className="w-5 h-5 text-gray-700" />
          </button>

          {/* HOME ICON (🏠) */}
          <Link
            href="/backoffice"
            onClick={() => handleNav('grid-dash')}
            title={t('enterprise_main_hub', 'Enterprise Main Hub')}
            className="w-9 h-9 flex items-center justify-center hover:bg-amber-50 rounded-lg text-amber-600 transition-colors cursor-pointer shrink-0 overflow-hidden"
          >
            <Home strokeWidth={1.5} className="w-5 h-5" />
          </Link>
        </div>

        {/* SEARCH INPUT FIELD */}
        {isOpen && (
          <div className="relative w-full mt-1">
            <input
              type="text"
              placeholder={t('search_menu', 'search menu...')}
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              className="w-full text-xs font-normal bg-gray-50 border border-gray-200 rounded-lg py-1.5 ps-8 pe-3 text-gray-700 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <Search strokeWidth={1.5} className="w-3.5 h-3.5 text-gray-400 absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 2. SIDEBAR MODULE LIST & ACCORDIONS */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[13px] font-normal text-slate-700 custom-scrollbar">
        
        {/* ===================================================================
            MODULE 1: SALES CONTROL
            =================================================================== */}
        {isModuleEnabled('sales') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('sales'); }}
            title={t('sales', '1. Sales')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['sales'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <ShoppingCart strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('sales', '1. Sales')}</span>}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/dashboard/sales" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('dashboard', 'Dashboard')}</span>
              </Link>
              <Link href="/backoffice/reportview" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('reports', 'Reports')}</span>
              </Link>
              {isModuleEnabled('v-store') && (
                <Link href="/backoffice/online-orders" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                  <ShoppingBag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('online_orders', 'Online Orders')}</span>
                </Link>
              )}
              <Link href="/backoffice/end-of-day" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <CalendarCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('end_of_day', 'End of Day')}</span>
              </Link>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('sc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{t('setup', 'Setup')}</span>
                  </div>
                  <span className="text-[9px]">{expandedGroups['sc_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['sc_setup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/screens" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Monitor strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('screens', 'Screens')}</span>
                    </Link>
                    <Link href="/backoffice/payment-types" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <CreditCard strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('payment_types', 'Payment Types')}</span>
                    </Link>
                    <Link href="/backoffice/coupons" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Gift strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('coupons_gift_cert', 'Coupons & Gift Certificates')}</span>
                    </Link>
                    <Link href="/backoffice/discounts" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Percent strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('discounts', 'Discounts')}</span>
                    </Link>
                    <Link href="/backoffice/price-modes" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Tag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('price_modes', 'Price Modes')}</span>
                    </Link>
                    <Link href="/backoffice/workstations-printers" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('workstations_printers', 'Workstations & Printers')}</span>
                    </Link>

                    {/* More Setup */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('sc_moresetup')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>{t('more_setup', 'More Setup')}</span>
                        <span className="text-[9px] text-slate-400">{expandedGroups['sc_moresetup'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['sc_moresetup'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/void-reasons" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <XCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('void_reasons', 'Void Reasons')}</span>
                          </Link>
                          <Link href="/backoffice/vat-exemptions" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <FileCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('vat_exemptions', 'Vat Exemption Reason')}</span>
                          </Link>
                          <Link href="/backoffice/invoice-messages" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <MessageCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('invoice_messages', 'Message On Invoice')}</span>
                          </Link>
                          <Link href="/backoffice/zone-setup" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('zone_setup', 'Zone Setup')}</span>
                          </Link>
                          <Link href="/backoffice/currency-setup" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Coins strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('currency_setup', 'Currency Setup')}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 2: OPERATIONS CENTER (INVENTORY & WAREHOUSES)
            =================================================================== */}
        {isModuleEnabled('operations') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('op'); }}
            title={t('operations_center', '2. Operations Center')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['op'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/icons/inv_action_productions.png" className="w-4 h-4 object-contain" alt="" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('operations_center', '2. Operations Center')}</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/operations-center?tab=materials" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <img src="/icons/inv_setup_invitems.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('materials_units', 'Materials & Units')}</span>
              </Link>
              <Link href="/operations-center?tab=batches" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('batches', 'Batches')}</span>
              </Link>
              <Link href="/operations-center?tab=quality" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <Wrench strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('quality_control', 'Quality Control')}</span>
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 3: CUSTOMER MANAGEMENT
            =================================================================== */}
        {(isModuleEnabled('customers') || isModuleEnabled('feedback') || isModuleEnabled('loyalty')) && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('cust'); }}
            title={t('customers_crm', '3. Customers / CRM')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/icons/backoffice_customer_group.png" className="w-4 h-4 object-contain" alt="" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('customers_crm', '3. Customers / CRM')}</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/customer-management?tab=accounts" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <img src="/icons/backoffice_customer_rec.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('wholesale_accounts', 'Wholesale Accounts')}</span>
              </Link>
              <Link href="/customer-management?tab=zones" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('zones_territories', 'Zones & Territories')}</span>
              </Link>
              <Link href="/customer-management?tab=categories" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <img src="/icons/backoffice_customer_category.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('customer_categories', 'Customer Categories')}</span>
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 4: ACCOUNTING & FINANCIALS
            =================================================================== */}
        {isModuleEnabled('accounting') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('acc'); }}
            title={t('accounting_financials', '4. Accounting & Financials')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/icons/accounting.png" className="w-4 h-4 object-contain" alt="" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('accounting_financials', '4. Accounting & Financials')}</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/accounting-finance?tab=accounts" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <img src="/icons/accounting_setup_chartofaccounts.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('financial_accounts', 'Financial Accounts')}</span>
              </Link>
              <Link href="/accounting-finance?tab=categories" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <img src="/icons/accounting_action_expense.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('expense_categories', 'Expense Categories')}</span>
              </Link>
              <Link href="/accounting-finance?tab=expenses" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <img src="/icons/accounting_acc_payable.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('expenses', 'Expenses')}</span>
              </Link>
              <Link href="/accounting-finance?tab=transfers" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <TrendingUp strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('fund_transfers', 'Fund Transfers')}</span>
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 5: HUMAN RESOURCES & PAYROLL
            =================================================================== */}
        {isModuleEnabled('hr') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('hr'); }}
            title={t('human_resources', '5. Human Resources')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/icons/payroll-main.png" className="w-4 h-4 object-contain" alt="" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('human_resources', '5. Human Resources')}</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/hr-payroll?tab=departments" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <img src="/icons/payroll-departments.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('departments', 'Departments')}</span>
              </Link>
              <Link href="/hr-payroll?tab=roles" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <img src="/icons/payroll-designation.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('roles_designations', 'Roles & Designations')}</span>
              </Link>
              <Link href="/hr-payroll?tab=employees" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <img src="/icons/payroll-employees.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('employees', 'Employees')}</span>
              </Link>
              <Link href="/hr-payroll?tab=shifts" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <img src="/icons/payroll-schedules.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('shifts_schedules', 'Shifts & Schedules')}</span>
              </Link>
              <Link href="/hr-payroll?tab=deductions" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <img src="/icons/payroll-salaries.png" className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100" alt="" />
                <span>{t('deductions', 'Deductions')}</span>
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 6: SUPERSONIC FLEET MANAGEMENT (DISPATCH & FLEET LOGISTICS)
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('supersonic'); }}
            title={t('supersonic_hub', '6. SuperSonic Hub')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              (expandedGroups['supersonic'] || expandedGroups['fleet']) ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/icons/deliveringgoods.png" className="w-4 h-4 object-contain" alt="" />
              </div>
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('supersonic_hub', '6. SuperSonic Hub')}</span>
                  
                </span>
              )}
            </div>
            {isOpen && ((expandedGroups['supersonic'] || expandedGroups['fleet']) ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && (expandedGroups['supersonic'] || expandedGroups['fleet']) && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/super-sonic?tab=fleet" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('fleet_overview', 'Fleet Overview')}</span>
              </Link>
              <Link href="/super-sonic?tab=drivers" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('drivers_directory', 'Drivers Directory')}</span>
              </Link>
              <Link href="/super-sonic?tab=fuel" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Droplets strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('fuel_maintenance', 'Fuel & Maintenance')}</span>
              </Link>
              <Link href="/super-sonic?tab=trips" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Route strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('trip_logs', 'Trip Logs')}</span>
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 7: V-CONNECT (SOCIAL CRM & SUPPORT)
            =================================================================== */}
        {isModuleEnabled('social') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('social'); }}
            title={t('social_media_hub', '7. Social Media Hub')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <Share2 strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('social_media_hub', '7. Social Media Hub')}</span>
                  
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/connect" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-bold text-cyan-700">
                <Share2 strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('vconnect_hub', 'V-Connect Hub')}</span>
              </Link>
              <Link href="/backoffice/social-crm" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Activity strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('social_crm_dashboard', 'Social CRM Dashboard')}</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=cpl" className="w-full text-start p-1.5 hover:text-cyan-800 hover:bg-cyan-50/80 rounded transition-colors font-semibold text-cyan-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Target strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('lead_pipeline_acquisition', 'Lead Pipeline & Acquisition')}</span>
                </span>
                <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">{t('leads', 'LEADS')}</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=reports" className="w-full text-start p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('reports_hub', 'Reports Hub')}</span>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">{t('rep', 'REP')}</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=inbox" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <MessageSquare strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('omnichannel_inbox', 'Omnichannel Inbox')}</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=campaigns" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <TrendingUp strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('campaign_analytics', 'Campaign Analytics')}</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=bots" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('automation_bots', 'Automation Bots')}</span>
              </Link>

              {/* Standalone V-Connect Portal & Download Trigger */}
              <div className="pt-1 mt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDownloadAppModal('v-connect')}
                  className="w-full text-start p-1.5 bg-cyan-50/80 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-lg flex items-center justify-between font-bold transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone strokeWidth={1.5} className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                    <span>{t('launch_vconnect_client', 'V-Connect Agent Client')}</span>
                  </span>
                  <span className="text-[9px] bg-cyan-700 text-white px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                    <Download strokeWidth={1.5} className="w-2.5 h-2.5" /> CLIENT
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 8: PRESSING MILL ENGINE (MANUFACTURING)
            =================================================================== */}
        {isModuleEnabled('pressing-mill') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('pressing-mill'); }}
            title={t('pressing_mill', '8. Pressing Mill')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'} rounded-lg transition-colors ${
              (expandedGroups['pressing-mill'] || expandedGroups['pressing']) ? 'bg-slate-50 text-slate-900 font-bold' : 'hover:bg-slate-50 hover:text-slate-900 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
                <Scale strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('pressing_mill', '8. Pressing Mill')}</span>
                  
                </span>
              )}
            </div>
            {isOpen && ((expandedGroups['pressing-mill'] || expandedGroups['pressing']) ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && (expandedGroups['pressing-mill'] || expandedGroups['pressing']) && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link
                href="/pressing-mill/dashboard"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/dashboard' || pathname === '/pressing-mill'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <Activity strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('pm_dashboard', 'Dashboard')}</span>
              </Link>
              <Link
                href="/pressing-mill/seasons"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/seasons'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-teal-700 font-medium'
                }`}
              >
                <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('pm_seasons', 'Season Management')}</span>
              </Link>
              <Link
                href="/pressing-mill/intake"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/intake'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Scale strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_intake', 'Weighbridge & Intake')}</span>
              </Link>
              <Link
                href="/pressing-mill/batches"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/batches'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Factory strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_batches', 'Pressing Lines & Batches')}</span>
              </Link>
              <Link
                href="/pressing-mill/tanks"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/tanks'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Droplets strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('pm_tanks', 'Tanks Matrix (1-50)')}</span>
              </Link>
              <Link
                href="/pressing-mill/settlements"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/settlements'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <DollarSign strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_settlements', 'Settlements & Milling Fees')}</span>
              </Link>
              <Link
                href="/pressing-mill/dispatch"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/dispatch'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_dispatch', 'Oil Handover & Dispatch')}</span>
              </Link>
              <Link
                href="/pressing-mill/pos"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/pos'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-900 font-bold'
                }`}
              >
                <ShoppingCart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('pm_pos', 'Direct Counter Sales & POS')}</span>
              </Link>
              <Link
                href="/pressing-mill/directory"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/directory'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <BookOpen strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_directory', 'Directory & Ledgers')}</span>
              </Link>
              <Link
                href="/pressing-mill/reports"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/reports'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_reports', 'Mill Reports & Yield Audits')}</span>
              </Link>
              <Link
                href="/pressing-mill/setup"
                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                  pathname === '/pressing-mill/setup'
                    ? 'bg-slate-100 text-teal-800 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Settings strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('pm_setup', 'Mill Settings & Line Config')}</span>
              </Link>

              {/* Standalone Touch Workstation Portal & Download Trigger */}
              <div className="pt-1 mt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDownloadAppModal('pressing-mill')}
                  className="w-full text-start p-1.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg flex items-center justify-between font-bold transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Monitor strokeWidth={1.5} className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{t('launch_mill_kiosk', 'Touch Workstation Client')}</span>
                  </span>
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                    <Download strokeWidth={1.5} className="w-2.5 h-2.5" /> KIOSK
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* PROFILE & ADMIN FOOTER BUTTONS */}
        <div className="pt-2 border-t border-gray-200 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            title={t('identity_settings', 'Identity & Settings')}
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2'} rounded-lg bg-amber-50/60 text-amber-900 hover:bg-amber-100/70 border border-amber-200/60 transition-colors font-medium text-[12px] shadow-2xs cursor-pointer`}
          >
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
              <Settings strokeWidth={1.5} className="w-4 h-4" />
            </div>
            {isOpen && (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-800 font-semibold">{t('identity_settings', 'Identity & Settings')}</span>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase">{t('active', 'Active')}</span>
              </div>
            )}
          </button>

          <Link
            href="/backoffice/license"
            title={t('license_certificate', 'License Certificate')}
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2'} rounded-lg bg-emerald-50/60 text-emerald-950 hover:bg-emerald-100/70 border border-emerald-300/60 transition-colors font-medium text-[12px] shadow-2xs`}
          >
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center justify-center">
              <ShieldCheck strokeWidth={1.5} className="w-4 h-4" />
            </div>
            {isOpen && (
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-800">{t('license_certificate', 'License Certificate')}</span>
                <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full uppercase">{t('unlocked', 'Unlocked')}</span>
              </div>
            )}
          </Link>
        </div>

      </div>

      {/* FOOTER METRICS (WHEN EXPANDED) */}
      {isOpen && (
        <div className="p-2.5 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 font-medium text-center space-y-0.5">
          <p className="text-gray-700 font-bold">{t('vanguard_system', 'Vanguard ERP System')}</p>
          <p className="text-amber-600 font-bold">
            {currentTenant.brandNameEn || 'Southern Olive Oil Products S.A.R.L'}
          </p>
        </div>
      )}

      {/* TENANT PROFILE & LEGAL BRANDING MODAL */}
      <TenantSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* STANDALONE WORKSTATIONS APP PORTALS MODAL */}
      <StandaloneAppDownloadModal
        isOpen={downloadAppModal !== null}
        onClose={() => setDownloadAppModal(null)}
        initialApp={downloadAppModal || 'v-driver'}
      />
    </aside>
  );
}
