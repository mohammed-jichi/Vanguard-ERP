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
  Target
} from 'lucide-react';

import { useRouter, usePathname } from 'next/navigation';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { isModuleLicensed } from '@/lib/license';
import TenantSettingsModal from './TenantSettingsModal';

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
  const { language, dir, t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
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
    sales: true,
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

  useEffect(() => {
    if (pathname && (pathname.includes('/accounting') || pathname.includes('/backoffice/accounting'))) {
      setExpandedGroups(prev => ({
        ...prev,
        acc: true,
        acc_actions: true,
        acc_setup: prev.acc_setup || pathname.includes('setup') || pathname.includes('currencies') || pathname.includes('rates') || pathname.includes('aux') || pathname.includes('classes') || pathname.includes('department'),
      }));
    }
    if (pathname && (pathname.includes('/pressing-mill') || pathname.includes('/pressing'))) {
      setExpandedGroups(prev => ({
        ...prev,
        'pressing-mill': true,
        pressing: true,
      }));
    }
    if (pathname && (pathname.includes('/purchas') || pathname.includes('/purchase-orders'))) {
      setExpandedGroups(prev => ({
        ...prev,
        purchasing: true,
      }));
    }
    if (pathname && (pathname.includes('/v-store') || pathname.includes('/online-orders') || pathname.includes('/landing'))) {
      setExpandedGroups(prev => ({
        ...prev,
        'v-store': true,
        store: true,
      }));
    }
    if (pathname && (pathname.includes('/fleet') || pathname.includes('/vtrack') || pathname.includes('/supersonic') || pathname.includes('/v-driver'))) {
      setExpandedGroups(prev => ({
        ...prev,
        fleet: true,
        supersonic: true,
      }));
    }
  }, [pathname]);

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

  // Helper to check if a specific system module is enabled for the active tenant
  const isModuleEnabled = (moduleKey: string): boolean => {
    return contextIsModuleEnabled ? contextIsModuleEnabled(moduleKey) : isModuleLicensed(currentTenant, moduleKey);
  };

  return (
    <aside
      className={`bg-white border-e border-gray-200 shadow-2xs transition-all duration-300 flex flex-col shrink-0 z-30 font-sans select-none ${
        isOpen ? 'w-64' : 'w-16'
      } ${className || 'min-h-[calc(100vh-96px)] h-full'}`}
      dir={dir}
    >
      {/* 1. SIDEBAR TOP CONTROL HEADER (HAMBURGER & HOME) */}
      <div className="p-3 border-b border-gray-200 flex flex-col gap-2 bg-white">
        <div className="flex items-center justify-between w-full">
          {/* HAMBURGER TOGGLE ICON (☰) */}
          <button
            onClick={handleToggle}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* HOME ICON (🏠) */}
          <Link
            href="/backoffice"
            onClick={() => handleNav('grid-dash')}
            title="Enterprise Main Hub"
            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>

        {/* SEARCH INPUT FIELD */}
        {isOpen && (
          <div className="relative w-full mt-1">
            <input
              type="text"
              placeholder="search menu..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              className="w-full text-xs font-normal bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 pr-8 text-gray-700 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
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
            title='Sales Control'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['sales'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('sales_control', '1. Sales Control')}</span>}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/dashboard/sales" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/reportview" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Reports</Link>
              {isModuleEnabled('v-store') && (
                <Link href="/backoffice/online-orders" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Online Orders</Link>
              )}
              <Link href="/backoffice/end-of-day" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">End of Day</Link>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('sc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['sc_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['sc_setup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/screens" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Screens</Link>
                    <Link href="/backoffice/payment-types" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Payment Types</Link>
                    <Link href="/backoffice/coupons" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Coupons &amp; Gift Certificates</Link>
                    <Link href="/backoffice/discounts" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Discounts</Link>
                    <Link href="/backoffice/price-modes" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Price Modes</Link>
                    <Link href="/backoffice/workstations-printers" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Workstations &amp; Printers</Link>

                    {/* More Setup */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('sc_moresetup')}
                        className="w-full flex items-center justify-between p-1 text-slate-700 hover:text-primary hover:bg-slate-50 rounded font-semibold text-xs transition-colors"
                      >
                        <span>More Setup</span>
                        <span className="text-[9px] text-primary">{expandedGroups['sc_moresetup'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['sc_moresetup'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/void-reasons" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Void Reasons</Link>
                          <Link href="/backoffice/vat-exemptions" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Vat Exemption Reason</Link>
                          <Link href="/backoffice/invoice-messages" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Message On Invoice</Link>
                          <Link href="/backoffice/zone-setup" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Zone Setup</Link>
                          <Link href="/backoffice/currency-setup" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Currency Setup</Link>
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
            title='Inventory & Warehouses'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['op'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Factory className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('operations_center', '2. Operations Center')}</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/operations?section=dashboard" className="block w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors font-semibold">Dashboard</Link>
              <Link href="/backoffice/operations?section=reports" className="block w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors font-semibold">Reports</Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Actions</span>
                  <span className="text-[9px]">{expandedGroups['op_actions'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_actions'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=sales" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Sales</Link>
                    <Link href="/backoffice/operations?section=quotations" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Quotations</Link>
                    <Link href="/backoffice/operations?section=delivery_goods" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Delivery of Goods</Link>
                    {isModuleEnabled('purchasing') && (
                      <>
                        <Link href="/backoffice/operations?section=purchases" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Purchases</Link>
                        <Link href="/backoffice/operations?section=purchase_orders" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Purchase Orders</Link>
                        <Link href="/backoffice/operations?section=reorder_guide" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Reorder Guide</Link>
                      </>
                    )}
                    <Link href="/backoffice/operations?section=transfers" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Transfers</Link>
                    <Link href="/backoffice/operations?section=lost_goods" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Lost Goods</Link>
                    <Link href="/backoffice/operations?section=item_assembly" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Item Assembly</Link>
                    <Link href="/backoffice/operations?section=adjustments" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Adjustments</Link>

                    {/* Product Request */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_prodreq')}
                        className="w-full flex items-center justify-between p-1 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                      >
                        <span>Product Request</span>
                        <span className="text-[9px]">{expandedGroups['op_prodreq'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_prodreq'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=product_request" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Product Request</Link>
                          <Link href="/backoffice/operations?section=manage_product_requests" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Manage Product Requests</Link>
                          <Link href="/backoffice/operations?section=product_req_prep" className="block p-1 hover:text-primary hover:bg-slate-50 rounded font-bold text-teal-700">Product Req. Preparation</Link>
                          {isModuleEnabled('purchasing') && (
                            <Link href="/backoffice/operations?section=receiving_goods" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Receiving of goods</Link>
                          )}
                          <Link href="/backoffice/operations?section=product_req_reports" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Reports</Link>
                          <Link href="/backoffice/operations?section=request_reject_reasons" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Request Reject Reasons</Link>
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_events')}
                        className="w-full flex items-center justify-between p-1 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                      >
                        <span>Events</span>
                        <span className="text-[9px]">{expandedGroups['op_events'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_events'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=events" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Events</Link>
                          <Link href="/backoffice/operations?section=event_venues" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Event Venues</Link>
                          <Link href="/backoffice/operations?section=event_resources" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Event Resources</Link>
                          <Link href="/backoffice/operations?section=event_types" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Event Types</Link>
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
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['op_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_setup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=quick_setup" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Sliders className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Quick Setup</span>
                    </Link>
                    <Link href="/backoffice/operations?section=products_services" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Products &amp; Services</span>
                    </Link>
                    <Link href="/backoffice/operations?section=groups" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Layers className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Groups</span>
                    </Link>
                    <Link href="/backoffice/operations?section=divisions" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Divisions</span>
                    </Link>
                    <Link href="/backoffice/operations?section=categories" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Categories</span>
                    </Link>
                    <Link href="/backoffice/operations?section=units" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Scale className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>Units</span>
                    </Link>
                    <Link href="/backoffice/operations?section=locations" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Locations</span>
                    </Link>
                    <Link href="/backoffice/operations?section=suppliers" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Users className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span>Suppliers</span>
                    </Link>
                    <Link href="/backoffice/operations?section=departments" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                      <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Departments</span>
                    </Link>

                    {/* More Sub-Accordion */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('op_more')}
                        className="w-full flex items-center justify-between p-1 text-slate-700 hover:text-primary hover:bg-slate-50 rounded font-semibold text-xs transition-colors"
                      >
                        <span className="font-semibold text-slate-800">More</span>
                        <span className="text-[9px] text-primary">{expandedGroups['op_more'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_more'] && (
                        <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=lost_goods_reason" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Search className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Lost Goods Reason</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes_groups" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Sizes Groups</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Maximize2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Sizes</span>
                          </Link>
                          <Link href="/backoffice/operations?section=colors" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>Colors</span>
                          </Link>
                          <Link href="/backoffice/operations?section=discounts" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Percent className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span>Discounts</span>
                          </Link>
                          <Link href="/backoffice/operations?section=payment_types" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>Payment Types</span>
                          </Link>
                          <Link href="/backoffice/operations?section=currency_setup" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Currency Setup</span>
                          </Link>
                          <Link href="/backoffice/operations?section=inventory_brands" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Award className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>Inventory Brands</span>
                          </Link>
                          <Link href="/backoffice/operations?section=delivery_providers" className="flex items-center gap-2 p-1 hover:text-primary hover:bg-slate-50 rounded">
                            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Delivery Providers</span>
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
            MODULE 3: PURCHASING & PROCUREMENT
            =================================================================== */}
        {isModuleEnabled('purchasing') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('purchasing'); }}
            title='Purchasing & Procurement'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['purchasing'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-primary shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('purchases', '3. Purchasing & Procurement')}</span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.2 rounded font-bold">PO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['purchasing'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['purchasing'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/purchases" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded font-semibold">Purchases &amp; AP Bills</Link>
              <Link href="/purchase-orders" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Purchase Orders</Link>
              <Link href="/backoffice/operations?section=reorder_guide" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Reorder Guide</Link>
              <Link href="/receiving-of-goods" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Goods Receiving (GRN)</Link>
              <Link href="/backoffice/operations?section=suppliers" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Suppliers Directory</Link>
              <Link href="/backoffice/operations?section=reports" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded text-emerald-700 font-medium">Procurement Reports</Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 4: CUSTOMER MANAGEMENT (CRM)
            =================================================================== */}
        {isModuleEnabled('customers') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('cust'); }}
            title='Customer Management (CRM)'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('crm_debtors', '4. Customer Management (CRM)')}</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/customers" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded font-semibold">Customers Directory</Link>
              <Link href="/backoffice/customers?section=receipts" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Customer Receipts</Link>
              <Link href="/backoffice/customers?section=aged" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Customer Aged Receivables</Link>
              <Link href="/customer-insights" className="w-full text-start p-1.5 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100 rounded transition-colors font-bold text-blue-700 flex items-center justify-between block">
                <span>Customer Insights</span>
                <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">AI CRM</span>
              </Link>
              <Link href="/schedule" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Tasks and Appointments</Link>
              <Link href="/sales-manager-dashboard" target="_blank" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Sales Team Performance</Link>

              {/* Settings */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('cm_settings')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Settings</span>
                  <span className="text-[9px]">{expandedGroups['cm_settings'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['cm_settings'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/customers?section=groups" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Customers Groups</Link>
                    <Link href="/backoffice/customers?section=categories" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Customers Categories</Link>
                    <Link href="/backoffice/customers?section=tags" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Customers Tags</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 5: FEEDBACK & SURVEYS
            =================================================================== */}
        {isModuleEnabled('feedback') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('feedback'); }}
            title='Feedback & Surveys'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['feedback'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('complaints_dashboard', '5. Feedback & Surveys')}</span>}
            </div>
            {isOpen && (expandedGroups['feedback'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['feedback'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/feedback?section=dashboard" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/feedback?section=manage_complaints" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Manage Complaints</Link>
              <Link href="/backoffice/feedback?section=add_complaints" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Add Complaints</Link>
              <Link href="/backoffice/feedback?section=manage_surveys" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Manage Surveys</Link>
              <Link href="/backoffice/feedback?section=send_survey_emails" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Send Survey Emails</Link>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('fb_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['fb_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['fb_setup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/feedback?section=complaint_sources" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Complaint Sources</Link>
                    <Link href="/backoffice/feedback?section=complaint_categories" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Complaint Categories</Link>
                    <Link href="/backoffice/feedback?section=complaint_action_types" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Complaint Action Types</Link>
                    <Link href="/backoffice/feedback?section=customer_care" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Customer Care</Link>
                    <Link href="/backoffice/feedback?section=surveys_setup" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Surveys Setup</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 6: LOYALTY MANAGEMENT
            =================================================================== */}
        {isModuleEnabled('loyalty') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('loyalty'); }}
            title='Loyalty Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['loyalty'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('loyalty_program', '6. Loyalty Management')}</span>}
            </div>
            {isOpen && (expandedGroups['loyalty'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['loyalty'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/loyalty?section=dashboard" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/loyalty?section=reports" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Reports</Link>
              <Link href="/backoffice/loyalty?section=members" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Members</Link>
              <Link href="/backoffice/loyalty?section=loyalty_levels" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Loyalty Levels</Link>
              <Link href="/backoffice/loyalty?section=loyalty_programs" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Loyalty Programs</Link>
              <Link href="/backoffice/loyalty?section=send_messages" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Send Messages</Link>
              <Link href="/backoffice/loyalty?section=company_info" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Company Info</Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 7: ACCOUNTING & FINANCIALS
            =================================================================== */}
        {isModuleEnabled('accounting') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('acc'); }}
            title='Accounting & Financials'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('accounting_finance', '7. Accounting & Financials')}</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="relative ml-2.5 pl-2.5 border-l-2 border-border/80 space-y-0.5 mt-1 text-xs">
              <Link
                href="/backoffice/accounting?section=dashboard"
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/backoffice/accounting?section=reports"
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span>Reports</span>
              </Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('acc_actions')}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-foreground hover:text-primary hover:bg-accent rounded-md font-semibold text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Actions</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                      expandedGroups['acc_actions'] ? 'rotate-90 text-foreground' : ''
                    }`}
                  />
                </button>
                {expandedGroups['acc_actions'] && (
                  <div className="relative ml-2.5 pl-2.5 border-l-2 border-border/80 space-y-0.5 mt-0.5 text-xs transition-all">
                    <Link
                      href="/accounting/journal-voucher"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/journal-voucher'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/journal-voucher' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Journal Voucher</span>
                    </Link>
                    <Link
                      href="/accounting/purchase"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/purchase'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <ShoppingCart className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/purchase' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Purchase</span>
                    </Link>
                    <Link
                      href="/accounting/payment"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/payment'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <CreditCard className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/payment' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Payments</span>
                    </Link>
                    <Link
                      href="/accounting/receipt"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/receipt'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Receipt className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/receipt' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Receipts</span>
                    </Link>
                    <Link
                      href="/accounting/receivables"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/receivables'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <TrendingUp className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/receivables' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Accounts Receivables</span>
                    </Link>
                    <Link
                      href="/accounting/payables"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/payables'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <DollarSign className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/payables' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Accounts Payables</span>
                    </Link>
                    <Link
                      href="/accounting/bank-reconciliation"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/bank-reconciliation'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Scale className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/bank-reconciliation' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>Bank Reconciliation</span>
                    </Link>
                    <Link
                      href="/accounting/vat-closing"
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        pathname === '/accounting/vat-closing'
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 shrink-0 transition-colors ${pathname === '/accounting/vat-closing' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                      <span>VAT Period Closing</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Setup (Parent Root) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup('acc_setup')}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-foreground hover:text-primary hover:bg-accent rounded-md font-semibold text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:rotate-45 duration-300" />
                    <span>Setup</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                      expandedGroups['acc_setup'] ? 'rotate-90 text-foreground' : ''
                    }`}
                  />
                </button>

                {expandedGroups['acc_setup'] && (
                  <div className="relative ml-2.5 pl-2.5 border-l-2 border-border/80 space-y-0.5 mt-0.5 text-xs transition-all">
                    {/* 1. Accounts (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=accounts"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>Accounts</span>
                    </Link>

                    {/* 2. Account Auxiliaries (Collapsible Nested Sub-menu) */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup('acc_aux')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md font-semibold text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <FolderTree className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span>Account Auxiliaries</span>
                        </div>
                        <ChevronRight
                          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                            expandedGroups['acc_aux'] ? 'rotate-90 text-foreground' : ''
                          }`}
                        />
                      </button>

                      {expandedGroups['acc_aux'] && (
                        <div className="relative ml-2.5 pl-2.5 border-l-2 border-border/60 space-y-0.5 mt-0.5 transition-all">
                          {/* Accounts Classes */}
                          <Link
                            href="/backoffice/accounting?section=aux_classes"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Accounts Classes</span>
                          </Link>
                          {/* Account Header 1 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header1"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Account Header 1</span>
                          </Link>
                          {/* Account Header 2 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header2"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Account Header 2</span>
                          </Link>
                          {/* Account Header 3 */}
                          <Link
                            href="/backoffice/accounting?section=aux_header3"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ListFilter className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Account Header 3</span>
                          </Link>
                          {/* Account Group */}
                          <Link
                            href="/backoffice/accounting?section=aux_group"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Boxes className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Account Group</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* 3. Jv Description (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_jv_desc"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>Jv Description</span>
                    </Link>

                    {/* 4. Jv Types (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_jv_types"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>Jv Types</span>
                    </Link>

                    {/* 5. Currency (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_currency"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>Currency</span>
                    </Link>

                    {/* 6. Currency Rates (direct route) */}
                    <Link
                      href="/backoffice/accounting?section=aux_currency_rates"
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span>Currency Rates</span>
                    </Link>

                    {/* 7. Departments (Collapsible Nested Sub-menu) */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup('acc_dept')}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md font-semibold text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span>Departments</span>
                        </div>
                        <ChevronRight
                          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                            expandedGroups['acc_dept'] ? 'rotate-90 text-foreground' : ''
                          }`}
                        />
                      </button>

                      {expandedGroups['acc_dept'] && (
                        <div className="relative ml-2.5 pl-2.5 border-l-2 border-border/60 space-y-0.5 mt-0.5 transition-all">
                          {/* Department Groups */}
                          <Link
                            href="/backoffice/accounting?section=dept_groups"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <FolderTree className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Department Groups</span>
                          </Link>
                          {/* Department */}
                          <Link
                            href="/backoffice/accounting?section=department"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Building className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Department</span>
                          </Link>
                          {/* Cash Flow Report Setup */}
                          <Link
                            href="/backoffice/accounting?section=cash_flow_setup"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Cash Flow Report Setup</span>
                          </Link>
                          {/* Sub Department */}
                          <Link
                            href="/backoffice/accounting?section=sub_dept"
                            className="group flex items-center gap-2 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Split className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span>Sub Department</span>
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
            MODULE 8: HUMAN RESOURCES & PAYROLL
            =================================================================== */}
        {isModuleEnabled('hr') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('hr'); }}
            title='Human Resources & Payroll'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-primary shrink-0" />
              {isOpen && <span className="truncate font-semibold">{t('hr_payroll', '8. Human Resources & Payroll')}</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/hr?section=schedule_overview" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Schedule Overview</Link>
              <Link href="/backoffice/hr?section=personnel" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Personnel</Link>
              <Link href="/backoffice/hr?section=schedules" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded">Schedules</Link>

              {/* Organization Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_orgsetup')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Organization Setup</span>
                  <span className="text-[9px]">{expandedGroups['hr_orgsetup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_orgsetup'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=internal_departments" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Internal Departments</Link>
                    <Link href="/backoffice/hr?section=designations" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Designations</Link>
                    <Link href="/backoffice/hr?section=pos_employee_roles" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">POS Employee Roles</Link>
                  </div>
                )}
              </div>

              {/* Time & Attendance */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_attendance')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Time &amp; Attendance</span>
                  <span className="text-[9px]">{expandedGroups['hr_attendance'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_attendance'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=time_off_requests" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Time Off Requests</Link>
                    <Link href="/backoffice/hr?section=schedule_templates" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Schedule Templates</Link>
                    <Link href="/backoffice/hr?section=time_off_reasons" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Time Off Reasons</Link>
                    <Link href="/backoffice/hr?section=attendance_summary" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Attendance Summary</Link>
                    <Link href="/backoffice/hr?section=attendance_log" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Attendance Log</Link>
                  </div>
                )}
              </div>

              {/* Payroll */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_payroll')}
                  className="w-full flex items-center justify-between p-1.5 text-primary hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Payroll</span>
                  <span className="text-[9px]">{expandedGroups['hr_payroll'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_payroll'] && (
                  <div className="ms-2 ps-2 border-s border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=payroll_dashboard" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Payroll Dashboard</Link>
                    <Link href="/backoffice/hr?section=salary_processing" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Salary Processing</Link>
                    <Link href="/backoffice/hr?section=payment_settings" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Payment Settings</Link>
                    <Link href="/backoffice/hr?section=earnings_deductions" className="block p-1 hover:text-primary hover:bg-slate-50 rounded">Earnings &amp; Deductions</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 9: SUPERSONIC FLEET / V-DRIVER
            =================================================================== */}
        {isModuleEnabled('fleet') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('supersonic'); }}
            title='Supersonic Fleet Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              (expandedGroups['supersonic'] || expandedGroups['fleet']) ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('supersonic_fleet', '9. Supersonic Fleet / V-Driver')}</span>
                  <span className="bg-blue-100 text-primary text-[9px] px-1 py-0.2 rounded font-bold">PRO</span>
                </span>
              )}
            </div>
            {isOpen && ((expandedGroups['supersonic'] || expandedGroups['fleet']) ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && (expandedGroups['supersonic'] || expandedGroups['fleet']) && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/fleet" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Fleet Dashboard</Link>
              <Link href="/backoffice/fleet?tab=reports" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between block">
                <span>Fleet Reports</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">REP</span>
              </Link>
              <Link href="/backoffice/fleet?tab=dispatch" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Active Dispatches</Link>
              <Link href="/backoffice/fleet?tab=vendors" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Driver Management</Link>
              <Link href="/backoffice/fleet?tab=path-cards" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Route Optimization</Link>
              <Link href="/backoffice/fleet?tab=vehicles" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Vehicle Maintenance</Link>
              <Link href="/backoffice/fleet?tab=accounting" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Driver Settlements</Link>
              <Link href="/vtrack" className="w-full text-start p-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded flex items-center justify-between font-bold transition-colors mt-1 block">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-600" /> V-Track Geographics</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black">ACTIVE</span>
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 10: V-CONNECT (SOCIAL CRM) & LEAD PIPELINE
            =================================================================== */}
        {isModuleEnabled('social') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('social'); }}
            title='Social CRM & Support'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-primary shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('social_crm', '10. V-Connect (Social CRM)')}</span>
                  <span className="bg-cyan-100 text-cyan-800 text-[9px] px-1 py-0.2 rounded font-bold">CONNECT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/connect" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block font-bold text-cyan-700">V-Connect Hub</Link>
              <Link href="/backoffice/social-crm" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Social CRM Dashboard</Link>
              <Link href="/backoffice/social-crm?tab=cpl" className="w-full text-start p-1.5 hover:text-cyan-800 hover:bg-cyan-50/80 rounded transition-colors font-semibold text-cyan-900 flex items-center justify-between block">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Lead Pipeline &amp; Acquisition</span>
                </span>
                <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">LEADS</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=reports" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between block">
                <span>Reports Hub</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">REP</span>
              </Link>
              <Link href="/backoffice/social-crm?tab=inbox" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Omnichannel Inbox</Link>
              <Link href="/backoffice/social-crm?tab=campaigns" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Campaign Analytics</Link>
              <Link href="/backoffice/social-crm?tab=bots" className="w-full text-start p-1.5 hover:text-primary hover:bg-slate-50 rounded transition-colors block">Automation Bots</Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 11: PRESSING MILL ENGINE (MANUFACTURING)
            =================================================================== */}
        {isModuleEnabled('pressing-mill') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('pressing-mill'); }}
            title={t('pressing_mill_nav', '11. Pressing Mill Engine')}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              (expandedGroups['pressing-mill'] || expandedGroups['pressing']) ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('pressing_mill_nav', '11. Pressing Mill Engine')}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 py-0.2 rounded font-bold">MILL</span>
                </span>
              )}
            </div>
            {isOpen && ((expandedGroups['pressing-mill'] || expandedGroups['pressing']) ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && (expandedGroups['pressing-mill'] || expandedGroups['pressing']) && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link
                href="/pressing-mill/dashboard"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/dashboard' || pathname === '/pressing-mill'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                {t('pm_dashboard', 'Dashboard')}
              </Link>
              <Link
                href="/pressing-mill/seasons"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/seasons'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-emerald-700 font-medium'
                }`}
              >
                {t('pm_seasons', 'Season Management')}
              </Link>
              <Link
                href="/pressing-mill/intake"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/intake'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_intake', 'Weighbridge & Intake')}
              </Link>
              <Link
                href="/pressing-mill/batches"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/batches'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_batches', 'Pressing Lines & Batches')}
              </Link>
              <Link
                href="/pressing-mill/tanks"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/tanks'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_tanks', 'Tanks Matrix (1-50)')}
              </Link>
              <Link
                href="/pressing-mill/settlements"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/settlements'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_settlements', 'Settlements & Milling Fees')}
              </Link>
              <Link
                href="/pressing-mill/dispatch"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/dispatch'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_dispatch', 'Oil Handover & Dispatch')}
              </Link>
              <Link
                href="/pressing-mill/pos"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/pos'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-emerald-700 font-bold'
                }`}
              >
                {t('pm_pos', 'Direct Counter Sales & POS')}
              </Link>
              <Link
                href="/pressing-mill/directory"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/directory'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_directory', 'Directory & Ledgers')}
              </Link>
              <Link
                href="/pressing-mill/setup"
                className={`w-full text-start p-1.5 rounded transition-colors block ${
                  pathname === '/pressing-mill/setup'
                    ? 'bg-slate-100 text-primary font-bold'
                    : 'hover:text-primary hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t('pm_setup', 'Mill Settings & Line Config')}
              </Link>
            </div>
          )}
        </div>
        )}

        {/* ===================================================================
            MODULE 12: V-STORE (ONLINE STOREFRONT & E-COMMERCE)
            =================================================================== */}
        {isModuleEnabled('v-store') && (
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('v-store'); }}
            title='V-Store (Online Storefront)'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              (expandedGroups['v-store'] || expandedGroups['store']) ? 'bg-slate-50 text-primary font-bold' : 'hover:bg-slate-50 hover:text-primary text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>{t('online_orders', '12. V-Store (Online Storefront)')}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 py-0.2 rounded font-bold">WEB</span>
                </span>
              )}
            </div>
            {isOpen && ((expandedGroups['v-store'] || expandedGroups['store']) ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && (expandedGroups['v-store'] || expandedGroups['store']) && (
            <div className="ms-3 ps-2 border-s border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/online-orders" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded font-semibold text-emerald-700 flex items-center justify-between">
                <span>Online Orders</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">LIVE</span>
              </Link>
              <Link href="/landing" target="_blank" className="block p-1.5 hover:text-primary hover:bg-slate-50 rounded text-slate-700 flex items-center justify-between">
                <span>Customer Storefront</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          )}
        </div>
        )}

        {/* PROFILE & ADMIN FOOTER BUTTONS */}
        <div className="pt-2 border-t border-gray-200 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-colors font-medium text-[12px] shadow-2xs cursor-pointer`}
          >
            <Settings className="w-4 h-4 text-amber-600 shrink-0" />
            {isOpen && (
              <div className="flex items-center justify-between w-full">
                <span>Identity &amp; Settings</span>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase">Active</span>
              </div>
            )}
          </button>

          <Link
            href="/backoffice/license"
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border border-emerald-300 transition-colors font-medium text-[12px] shadow-2xs`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {isOpen && (
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">License Certificate</span>
                <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full uppercase">Unlocked</span>
              </div>
            )}
          </Link>
        </div>

      </div>

      {/* FOOTER METRICS (WHEN EXPANDED) */}
      {isOpen && (
        <div className="p-2.5 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 font-medium text-center space-y-0.5">
          <p className="text-gray-700 font-bold">Vanguard ERP System</p>
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
    </aside>
  );
}
