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
                <Factory strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('operations_center', '2. Operations Center')}</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/operations?section=dashboard" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors font-semibold">
                <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('dashboard', 'Dashboard')}</span>
              </Link>
              <Link href="/backoffice/operations?section=reports" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors font-semibold">
                <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('reports', 'Reports')}</span>
              </Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{t('actions', 'Actions')}</span>
                  </div>
                  <span className="text-[9px]">{expandedGroups['op_actions'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_actions'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=sales" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <ShoppingCart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('sales', 'Sales')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=quotations" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('quotations', 'Quotations')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=delivery_goods" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('delivery_goods', 'Delivery of Goods')}</span>
                    </Link>
                    {isModuleEnabled('purchasing') && (
                      <>
                        <Link href="/backoffice/operations?section=purchases" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                          <ShoppingBag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t('purchases', 'Purchases')}</span>
                        </Link>
                        <Link href="/backoffice/operations?section=purchase_orders" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                          <ClipboardList strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t('purchase_orders', 'Purchase Orders')}</span>
                        </Link>
                        <Link href="/backoffice/operations?section=reorder_guide" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                          <ListFilter strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t('reorder_guide', 'Reorder Guide')}</span>
                        </Link>
                      </>
                    )}
                    <Link href="/backoffice/operations?section=transfers" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <ArrowRightLeft strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('transfers', 'Transfers')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=lost_goods" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <ShieldAlert strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('lost_goods', 'Lost Goods')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=item_assembly" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Boxes strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('item_assembly', 'Item Assembly')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=adjustments" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('adjustments', 'Adjustments')}</span>
                    </Link>

                    {/* Product Request */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_prodreq')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Package strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{t('product_request', 'Product Request')}</span>
                        </div>
                        <span className="text-[9px]">{expandedGroups['op_prodreq'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_prodreq'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=product_request" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Package strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('product_request', 'Product Request')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=manage_product_requests" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <ClipboardCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('manage_product_requests', 'Manage Product Requests')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=product_req_prep" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded font-bold text-teal-700">
                            <PackageCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{t('product_req_prep', 'Product Req. Preparation')}</span>
                          </Link>
                          {isModuleEnabled('purchasing') && (
                            <Link href="/backoffice/operations?section=receiving_goods" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                              <Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{t('receiving_goods', 'Receiving of goods')}</span>
                            </Link>
                          )}
                          <Link href="/backoffice/operations?section=product_req_reports" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('product_req_reports', 'Reports')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=request_reject_reasons" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <XCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('request_reject_reasons', 'Request Reject Reasons')}</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_events')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{t('events', 'Events')}</span>
                        </div>
                        <span className="text-[9px]">{expandedGroups['op_events'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_events'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=events" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('events', 'Events')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=event_venues" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('event_venues', 'Event Venues')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=event_resources" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Boxes strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('event_resources', 'Event Resources')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=event_types" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Tag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('event_types', 'Event Types')}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>{t('setup', 'Setup')}</span>
                  <span className="text-[9px]">{expandedGroups['op_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_setup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=quick_setup" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('quick_setup', 'Quick Setup')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=products_services" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Package strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('products_services', 'Products & Services')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=groups" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{t('groups', 'Groups')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=divisions" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Bookmark strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('divisions', 'Divisions')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=categories" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Tag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('categories', 'Categories')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=units" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Scale strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('units', 'Units')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=locations" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('locations', 'Locations')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=suppliers" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span>{t('suppliers', 'Suppliers')}</span>
                    </Link>
                    <Link href="/backoffice/operations?section=departments" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Building strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('departments', 'Departments')}</span>
                    </Link>

                    {/* More Sub-Accordion */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('op_more')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800">{t('more', 'More')}</span>
                        <span className="text-[9px] text-primary">{expandedGroups['op_more'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_more'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=lost_goods_reason" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Search strokeWidth={1.5} className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{t('lost_goods_reason', 'Lost Goods Reason')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes_groups" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Maximize2 strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{t('sizes_groups', 'Sizes Groups')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Maximize2 strokeWidth={1.5} className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>{t('sizes', 'Sizes')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=colors" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Palette strokeWidth={1.5} className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>{t('colors', 'Colors')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=discounts" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Percent strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{t('discounts', 'Discounts')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=payment_types" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <CreditCard strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{t('payment_types', 'Payment Types')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=currency_setup" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Coins strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{t('currency_setup', 'Currency Setup')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=inventory_brands" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Award strokeWidth={1.5} className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>{t('inventory_brands', 'Inventory Brands')}</span>
                          </Link>
                          <Link href="/backoffice/operations?section=delivery_providers" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{t('delivery_providers', 'Delivery Providers')}</span>
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
                <Users strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('customers_crm', '3. Customers / CRM')}</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              {/* Core Directory & Accounts */}
              <Link href="/backoffice/customers" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-slate-800">
                <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('customers_directory', 'Customers')}</span>
              </Link>
              <Link href="/backoffice/customers?section=receipts" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Receipt strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('customer_receipts', 'Customer Receipt')}</span>
              </Link>
              <Link href="/backoffice/customers?section=aged" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('customer_aged_receivables', 'Customer Aged')}</span>
              </Link>
              <Link href="/customer-insights" className="w-full text-start p-1.5 hover:text-slate-900 bg-blue-50/60 hover:bg-blue-100 rounded transition-colors font-bold text-blue-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('customer_insights', 'Customer Insights')}</span>
                </div>
                <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">{t('ai_crm', 'AI CRM')}</span>
              </Link>
              <Link href="/schedule" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('tasks_appointments', 'Tasks and Appointments')}</span>
              </Link>
              <Link href="/contacts" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <UserPlus strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('leads_contacts', 'Leads and Contacts')}</span>
              </Link>
              <Link href="/sales-manager-dashboard" target="_blank" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Award strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('sales_team_performance', 'Sales Team Performance')}</span>
              </Link>

              {/* Loyalty Sub-menu */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('cm_loyalty')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Award strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{t('loyalty_program', 'Loyalty Management')}</span>
                  </div>
                  <span className="text-[9px] text-slate-400">{expandedGroups['cm_loyalty'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['cm_loyalty'] && (
                  <div className="ms-2 ps-2 border-s border-amber-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/loyalty?section=dashboard" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('dashboard', 'Dashboard')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=reports" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('reports', 'Reports')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=members" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('members', 'Members')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=loyalty_levels" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Award strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('loyalty_levels', 'Loyalty Levels')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=loyalty_programs" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Gift strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('loyalty_programs', 'Loyalty Programs')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=send_messages" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Mail strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('send_messages', 'Send Messages')}</span>
                    </Link>
                    <Link href="/backoffice/loyalty?section=company_info" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded font-medium text-amber-800">
                      <Building strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('company_info', 'Company Info')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Feedback & Surveys Sub-menu */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('cm_feedback')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{t('feedback_surveys', 'Feedback & Surveys')}</span>
                  </div>
                  <span className="text-[9px] text-slate-400">{expandedGroups['cm_feedback'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['cm_feedback'] && (
                  <div className="ms-2 ps-2 border-s border-blue-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/feedback?section=dashboard" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('dashboard', 'Dashboard')}</span>
                    </Link>
                    <Link href="/backoffice/feedback?section=manage_complaints" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <ShieldAlert strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('manage_complaints', 'Manage Complaints')}</span>
                    </Link>
                    <Link href="/backoffice/feedback?section=add_complaints" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <PlusCircle strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('add_complaints', 'Add Complaint')}</span>
                    </Link>
                    <Link href="/backoffice/feedback?section=manage_surveys" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('manage_surveys', 'Manage Surveys')}</span>
                    </Link>
                    <Link href="/backoffice/feedback?section=send_survey_emails" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Mail strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('send_survey_emails', 'Send Survey Emails')}</span>
                    </Link>

                    {/* Feedback Setup */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup('cm_fb_setup')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>{t('feedback_setup', 'Feedback Setup')}</span>
                        <span className="text-[9px] text-slate-400">{expandedGroups['cm_fb_setup'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['cm_fb_setup'] && (
                        <div className="ms-2 ps-2 border-s border-blue-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/feedback?section=complaint_sources" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Search strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('complaint_resources', 'Complaint Resources')}</span>
                          </Link>
                          <Link href="/backoffice/feedback?section=complaint_categories" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Tag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('complaint_categories', 'Complaint Categories')}</span>
                          </Link>
                          <Link href="/backoffice/feedback?section=complaint_action_types" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('complaint_action_types', 'Complaint Action Type')}</span>
                          </Link>
                          <Link href="/backoffice/feedback?section=customer_care" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Headphones strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('customer_care', 'Customer Care')}</span>
                          </Link>
                          <Link href="/backoffice/feedback?section=surveys_setup" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                            <Settings strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('survey_setup', 'Survey Setup')}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('cm_settings')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{t('setup', 'Setup')}</span>
                  </div>
                  <span className="text-[9px]">{expandedGroups['cm_settings'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['cm_settings'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/customers?section=groups" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('customers_groups', 'Customer Groups')}</span>
                    </Link>
                    <Link href="/backoffice/customers?section=categories" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Tag strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('customers_categories', 'Customer Categories')}</span>
                    </Link>
                    <Link href="/backoffice/customers?section=tags" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Bookmark strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('customers_tags', 'Customer Tags')}</span>
                    </Link>
                    <Link href="/backoffice/customers?section=leads_settings" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded font-medium text-blue-700">
                      <Settings strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('leads_settings', 'Leads Settings')}</span>
                    </Link>
                  </div>
                )}
              </div>
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
                <FileSpreadsheet strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('accounting_financials', '4. Accounting & Financials')}</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="relative ms-2.5 ps-2.5 border-s-2 border-border/80 space-y-0.5 mt-1 text-xs">
              <Link
                href="/backoffice/accounting?section=dashboard"
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Home strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span>{t('dashboard', 'Dashboard')}</span>
              </Link>
              <Link
                href="/backoffice/accounting?section=reports"
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span>{t('reports', 'Reports')}</span>
              </Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('acc_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{t('actions', 'Actions')}</span>
                  </div>
                  <ChevronRight strokeWidth={1.5}
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                      expandedGroups['acc_actions'] ? 'rotate-90 text-foreground' : ''
                    }`}
                  />
                </button>
                {expandedGroups['acc_actions'] && (
                  <div className="relative ms-2.5 ps-2.5 border-s-2 border-border/80 space-y-0.5 mt-0.5 text-xs transition-all">
                    <Link
                      href="/accounting/journal-voucher"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/journal-voucher'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <FileSpreadsheet strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/journal-voucher' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('journal_voucher', 'Journal Voucher')}</span>
                    </Link>
                    <Link
                      href="/accounting/purchase"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/purchase'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <ShoppingCart strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/purchase' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('purchase', 'Purchase')}</span>
                    </Link>
                    <Link
                      href="/accounting/payment"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/payment'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <CreditCard strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/payment' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('payments', 'Payments')}</span>
                    </Link>
                    <Link
                      href="/accounting/receipt"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/receipt'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Receipt strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/receipt' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('receipts', 'Receipts')}</span>
                    </Link>
                    <Link
                      href="/accounting/receivables"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/receivables'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <TrendingUp strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/receivables' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('receivables', 'Accounts Receivables')}</span>
                    </Link>
                    <Link
                      href="/accounting/payables"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/payables'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <DollarSign strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/payables' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('payables', 'Accounts Payables')}</span>
                    </Link>
                    <Link
                      href="/accounting/bank-reconciliation"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/bank-reconciliation'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Scale strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/bank-reconciliation' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('bank_reconciliation', 'Bank Reconciliation')}</span>
                    </Link>
                    <Link
                      href="/accounting/vat-closing"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/vat-closing'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Clock strokeWidth={1.5} className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/vat-closing' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>{t('vat_closing', 'VAT Period Closing')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Setup (Parent Root) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('acc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings strokeWidth={1.5} className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:rotate-45 duration-300" />
                    <span>{t('setup', 'Setup')}</span>
                  </div>
                  <ChevronRight strokeWidth={1.5}
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                      expandedGroups['acc_setup'] ? 'rotate-90 text-foreground' : ''
                    }`}
                  />
                </button>

                {expandedGroups['acc_setup'] && (
                  <div className="relative ms-2.5 ps-2.5 border-s-2 border-border/80 space-y-0.5 mt-0.5 text-xs transition-all">
                    {/* 1. Accounts (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=accounts"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <BookOpen strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>{t('accounts', 'Accounts')}</span>
                    </Link>

                    {/* 2. Account Auxiliaries (Collapsible Nested Sub-menu) */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup('acc_aux')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FolderTree strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span>{t('account_auxiliaries', 'Account Auxiliaries')}</span>
                        </div>
                        <ChevronRight strokeWidth={1.5}
                          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                            expandedGroups['acc_aux'] ? 'rotate-90 text-foreground' : ''
                          }`}
                        />
                      </button>

                      {expandedGroups['acc_aux'] && (
                        <div className="relative ms-2.5 ps-2.5 border-s-2 border-border/60 space-y-0.5 mt-0.5 transition-all">
                          {/* Accounts Classes */}
                          <Link
                            href="/backoffice/accounting?section=aux_classes"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('aux_classes', 'Accounts Classes')}</span>
                          </Link>
                          {/* Account Header 1 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header1"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('aux_header1', 'Account Header 1')}</span>
                          </Link>
                          {/* Account Header 2 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header2"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('aux_header2', 'Account Header 2')}</span>
                          </Link>
                          {/* Account Header 3 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header3"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('aux_header3', 'Account Header 3')}</span>
                          </Link>
                          {/* Account Group */}
                          <Link
                            href="/backoffice/accounting?section=aux_group"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Boxes strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('aux_group', 'Account Group')}</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* 3. Jv Description (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_jv_desc"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>{t('jv_description', 'Jv Description')}</span>
                    </Link>

                    {/* 4. Jv Types (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_jv_types"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Bookmark strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>{t('jv_types', 'Jv Types')}</span>
                    </Link>

                    {/* 5. Currency (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_currency"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Coins strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>{t('currency', 'Currency')}</span>
                    </Link>

                    {/* 6. Currency Rates (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_currency_rates"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <TrendingUp strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>{t('currency_rates', 'Currency Rates')}</span>
                    </Link>

                    {/* 7. Departments (Collapsible Nested Sub-menu) */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup('acc_dept')}
                        className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span>{t('departments', 'Departments')}</span>
                        </div>
                        <ChevronRight strokeWidth={1.5}
                          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                            expandedGroups['acc_dept'] ? 'rotate-90 text-foreground' : ''
                          }`}
                        />
                      </button>

                      {expandedGroups['acc_dept'] && (
                        <div className="relative ms-2.5 ps-2.5 border-s-2 border-border/60 space-y-0.5 mt-0.5 transition-all">
                          {/* Department Groups */}
                          <Link
                            href="/backoffice/accounting?section=dept_groups"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <FolderTree strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('dept_groups', 'Department Groups')}</span>
                          </Link>
                          {/* Department */}
                          <Link
                            href="/backoffice/accounting?section=department"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Building strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('department', 'Department')}</span>
                          </Link>
                          {/* Cash Flow Report Setup */}
                          <Link
                            href="/backoffice/accounting?section=cash_flow_setup"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <SlidersHorizontal strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('cash_flow_setup', 'Cash Flow Report Setup')}</span>
                          </Link>
                          {/* Sub Department */}
                          <Link
                            href="/backoffice/accounting?section=sub_dept"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Split strokeWidth={1.5} className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>{t('sub_department', 'Sub Department')}</span>
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
                <UserCheck strokeWidth={1.5} className="w-4 h-4" />
              </div>
              {isOpen && <span className="truncate font-semibold">{t('human_resources', '5. Human Resources')}</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/hr/employees" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('personnel_directory', 'Personnel Directory')}</span>
              </Link>
              <Link href="/accounting/payroll/employee-schedules" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-amber-50/70 rounded font-bold text-slate-900 border-s-2 border-primary">
                <CalendarDays strokeWidth={1.5} className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{t('employee_schedules_day_off', 'Employee Schedules & Day Off')}</span>
                <span className="ms-auto text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">2026</span>
              </Link>
              <Link href="/backoffice/hr/payroll" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <DollarSign strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('payroll_runs', 'Payroll Runs')}</span>
              </Link>
              <Link href="/backoffice/hr/attendance" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('biometric_attendance', 'Biometric Attendance')}</span>
              </Link>
              <Link href="/backoffice/hr?tab=reports" className="flex items-center gap-2 p-1.5 hover:text-primary hover:bg-slate-50 rounded font-medium">
                <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('hr_reports_hub', 'HR Reports Hub')}</span>
              </Link>

              {/* Organization Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_orgsetup')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>{t('organization_setup', 'Organization Setup')}</span>
                  <span className="text-[9px]">{expandedGroups['hr_orgsetup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_orgsetup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=internal_departments" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Building strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('internal_departments', 'Internal Departments')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=designations" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Award strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('designations', 'Designations')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=pos_employee_roles" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <UserCog strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('pos_employee_roles', 'POS Employee Roles')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Time & Attendance */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_attendance')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>{t('time_attendance', 'Time & Attendance')}</span>
                  <span className="text-[9px]">{expandedGroups['hr_attendance'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_attendance'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/accounting/payroll/employee-schedules" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded font-bold text-amber-700">
                      <CalendarDays strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('schedules_shift_manager', 'Schedules & Shift Manager (2026)')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=time_off_requests" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <CalendarCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('time_off_requests', 'Time Off Requests')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=schedule_templates" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Layers strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('schedule_templates', 'Schedule Templates')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=time_off_reasons" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <FileText strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('time_off_reasons', 'Time Off Reasons')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=attendance_summary" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('attendance_summary', 'Attendance Summary')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=attendance_log" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('attendance_log', 'Attendance Log')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Payroll */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_payroll')}
                  className="w-full flex items-center justify-between p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>{t('payroll', 'Payroll')}</span>
                  <span className="text-[9px]">{expandedGroups['hr_payroll'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_payroll'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=payroll_dashboard" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{t('payroll_dashboard', 'Payroll Dashboard')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=salary_processing" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <DollarSign strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('salary_processing', 'Salary Processing')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=payment_settings" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <CreditCard strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('payment_settings', 'Payment Settings')}</span>
                    </Link>
                    <Link href="/backoffice/hr?section=earnings_deductions" className="flex items-center gap-2 p-1 hover:text-slate-900 hover:bg-slate-50 rounded">
                      <Percent strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('earnings_deductions', 'Earnings & Deductions')}</span>
                    </Link>
                  </div>
                )}
              </div>
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
                <Truck strokeWidth={1.5} className="w-4 h-4" />
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
              <Link href="/backoffice/fleet" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <PieChart strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('fleet_dashboard', 'Fleet Dashboard')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=reports" className="w-full text-start p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('fleet_reports', 'Fleet Reports')}</span>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">{t('rep', 'REP')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=dispatch" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Route strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('active_dispatches', 'Active Dispatches')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=vendors" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Users strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('driver_management', 'Driver Management')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=path-cards" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('route_optimization', 'Route Optimization')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=vehicles" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <Wrench strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('vehicle_maintenance', 'Vehicle Maintenance')}</span>
              </Link>
              <Link href="/backoffice/fleet?tab=accounting" className="flex items-center gap-2 p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded font-medium">
                <DollarSign strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('driver_settlements', 'Driver Settlements')}</span>
              </Link>
              <Link href="/vtrack" className="w-full text-start p-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded flex items-center justify-between font-bold transition-colors mt-1">
                <span className="flex items-center gap-1.5"><Truck strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {t('vtrack_geographics', 'V-Track Geographics')}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black">{t('active', 'ACTIVE')}</span>
              </Link>

              {/* Standalone V-Driver Portal & Download Trigger */}
              <div className="pt-1 mt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDownloadAppModal('v-driver')}
                  className="w-full text-start p-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg flex items-center justify-between font-bold transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{t('launch_vdriver_app', 'V-Driver App / PWA')}</span>
                  </span>
                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                    <Download strokeWidth={1.5} className="w-2.5 h-2.5" /> PWA
                  </span>
                </button>
              </div>
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
