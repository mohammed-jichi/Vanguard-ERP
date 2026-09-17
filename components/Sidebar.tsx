'use client';

import React, { useState } from 'react';
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
  Crown,
  Droplets,
  Building,
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
  Activity
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
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
  const { currentTenant } = useTenant();
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

  // Accordion toggle states for all 9 main modules & their sub-accordions
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
    social: false,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleNav = (screenKey: string, href?: string) => {
    if (onSelectScreen) {
      onSelectScreen(screenKey);
    }
    if (href) {
      router.push(href);
      return;
    }
  };

  const matchesSearch = (title: string) => {
    if (!sidebarFilter) return true;
    return title.toLowerCase().includes(sidebarFilter.toLowerCase());
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 shadow-2xs transition-all duration-300 flex flex-col shrink-0 z-30 font-sans select-none ${
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
            href="/backoffice/dashboard"
            onClick={() => handleNav('grid-dash')}
            title="Home Dashboard"
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
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('sales'); }}
            title='Sales Control'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['sales'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">1. Sales Control</span>}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/dashboard" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/reportview" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Reports</Link>
              <Link href="/backoffice/online-orders" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Online Orders</Link>
              <Link href="/backoffice/end-of-day" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">End of Day</Link>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('sc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['sc_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['sc_setup'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/screens" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Screens</Link>
                    <Link href="/backoffice/payment-types" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Payment Types</Link>
                    <Link href="/backoffice/coupons" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Coupons &amp; Gift Certificates</Link>
                    <Link href="/backoffice/discounts" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Discounts</Link>
                    <Link href="/backoffice/price-modes" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Price Modes</Link>
                    <Link href="/backoffice/workstations-printers" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Workstations &amp; Printers</Link>

                    {/* More Setup */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('sc_moresetup')}
                        className="w-full flex items-center justify-between p-1 text-slate-700 hover:text-[#195a96] hover:bg-slate-50 rounded font-semibold text-xs transition-colors"
                      >
                        <span>More Setup</span>
                        <span className="text-[9px] text-[#195a96]">{expandedGroups['sc_moresetup'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['sc_moresetup'] && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/void-reasons" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Void Reasons</Link>
                          <Link href="/backoffice/vat-exemptions" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Vat Exemption Reason</Link>
                          <Link href="/backoffice/invoice-messages" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Message On Invoice</Link>
                          <Link href="/backoffice/zone-setup" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Zone Setup</Link>
                          <Link href="/backoffice/currency-setup" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Currency Setup</Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 2: OPERATIONS CENTER
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('op'); }}
            title='Operations Center'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['op'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Factory className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">2. Operations Center</span>}
            </div>
            {isOpen && (expandedGroups['op'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['op'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/operations?section=dashboard" className="block w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-semibold">Dashboard</Link>
              <Link href="/backoffice/operations?section=reports" className="block w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-semibold">Reports</Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Actions</span>
                  <span className="text-[9px]">{expandedGroups['op_actions'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_actions'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=sales" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Sales</Link>
                    <Link href="/backoffice/operations?section=quotations" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Quotations</Link>
                    <Link href="/backoffice/operations?section=delivery_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Delivery of Goods</Link>
                    <Link href="/backoffice/operations?section=purchases" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Purchases</Link>
                    <Link href="/backoffice/operations?section=purchase_orders" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Purchase Orders</Link>
                    <Link href="/backoffice/operations?section=reorder_guide" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Reorder Guide</Link>
                    <Link href="/backoffice/operations?section=transfers" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Transfers</Link>
                    <Link href="/backoffice/operations?section=lost_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Lost Goods</Link>
                    <Link href="/backoffice/operations?section=item_assembly" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Item Assembly</Link>
                    <Link href="/backoffice/operations?section=adjustments" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Adjustments</Link>

                    {/* Product Request */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_prodreq')}
                        className="w-full flex items-center justify-between p-1 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                      >
                        <span>Product Request</span>
                        <span className="text-[9px]">{expandedGroups['op_prodreq'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_prodreq'] && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=product_request" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Product Request</Link>
                          <Link href="/backoffice/operations?section=manage_product_requests" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Manage Product Requests</Link>
                          <Link href="/backoffice/operations?section=product_req_prep" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded font-bold text-teal-700">Product Req. Preparation</Link>
                          <Link href="/backoffice/operations?section=receiving_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Receiving of goods</Link>
                          <Link href="/backoffice/operations?section=product_req_reports" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Reports</Link>
                          <Link href="/backoffice/operations?section=request_reject_reasons" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Request Reject Reasons</Link>
                        </div>
                      )}
                    </div>

                    {/* Events */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('op_events')}
                        className="w-full flex items-center justify-between p-1 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                      >
                        <span>Events</span>
                        <span className="text-[9px]">{expandedGroups['op_events'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_events'] && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=events" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Events</Link>
                          <Link href="/backoffice/operations?section=event_venues" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Event Venues</Link>
                          <Link href="/backoffice/operations?section=event_resources" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Event Resources</Link>
                          <Link href="/backoffice/operations?section=event_types" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Event Types</Link>
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
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['op_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_setup'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=quick_setup" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Sliders className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Quick Setup</span>
                    </Link>
                    <Link href="/backoffice/operations?section=products_services" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Products &amp; Services</span>
                    </Link>
                    <Link href="/backoffice/operations?section=groups" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Layers className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Groups</span>
                    </Link>
                    <Link href="/backoffice/operations?section=divisions" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Divisions</span>
                    </Link>
                    <Link href="/backoffice/operations?section=categories" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Categories</span>
                    </Link>
                    <Link href="/backoffice/operations?section=units" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Scale className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>Units</span>
                    </Link>
                    <Link href="/backoffice/operations?section=locations" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Locations</span>
                    </Link>
                    <Link href="/backoffice/operations?section=suppliers" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Users className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span>Suppliers</span>
                    </Link>
                    <Link href="/backoffice/operations?section=departments" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                      <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Departments</span>
                    </Link>

                    {/* More Sub-Accordion */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleGroup('op_more')}
                        className="w-full flex items-center justify-between p-1 text-slate-700 hover:text-[#195a96] hover:bg-slate-50 rounded font-semibold text-xs transition-colors"
                      >
                        <span className="font-semibold text-slate-800">More</span>
                        <span className="text-[9px] text-[#195a96]">{expandedGroups['op_more'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['op_more'] && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/operations?section=lost_goods_reason" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Search className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Lost Goods Reason</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes_groups" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Sizes Groups</span>
                          </Link>
                          <Link href="/backoffice/operations?section=sizes" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Maximize2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Sizes</span>
                          </Link>
                          <Link href="/backoffice/operations?section=colors" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span>Colors</span>
                          </Link>
                          <Link href="/backoffice/operations?section=discounts" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Percent className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span>Discounts</span>
                          </Link>
                          <Link href="/backoffice/operations?section=payment_types" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>Payment Types</span>
                          </Link>
                          <Link href="/backoffice/operations?section=currency_setup" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Currency Setup</span>
                          </Link>
                          <Link href="/backoffice/operations?section=inventory_brands" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Award className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>Inventory Brands</span>
                          </Link>
                          <Link href="/backoffice/operations?section=delivery_providers" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
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

        {/* ===================================================================
            MODULE 3: CUSTOMER MANAGEMENT
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('cust'); }}
            title='Customer Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">3. Customer Management</span>}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/customers" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Customers</Link>
              <Link href="/backoffice/customers?section=receipts" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Customer Receipts</Link>
              <Link href="/backoffice/customers?section=aged" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Customer Aged</Link>
              <Link href="/customer-insights" className="w-full text-left p-1.5 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100 rounded transition-colors font-bold text-blue-700 flex items-center justify-between block">
                <span>Customer Insights</span>
                <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">AI CRM</span>
              </Link>
              <Link href="/schedule" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Tasks and Appointments</Link>
              <Link href="/backoffice/customers?section=leads" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Leads &amp; Contacts</Link>
              <Link href="/sales-manager-dashboard" target="_blank" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Sales Team Performance</Link>

              {/* Settings */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('cm_settings')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Settings</span>
                  <span className="text-[9px]">{expandedGroups['cm_settings'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['cm_settings'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/customers?section=groups" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Customers Groups</Link>
                    <Link href="/backoffice/customers?section=categories" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Customers Categories</Link>
                    <Link href="/backoffice/customers?section=tags" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Customers Tags</Link>
                    <Link href="/backoffice/customers?section=leads_settings" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Leads Settings</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 4: FEEDBACK & SURVEYS
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('feedback'); }}
            title='Feedback & Surveys'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['feedback'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">4. Feedback &amp; Surveys</span>}
            </div>
            {isOpen && (expandedGroups['feedback'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['feedback'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/feedback?section=dashboard" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/feedback?section=manage_complaints" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Manage Complaints</Link>
              <Link href="/backoffice/feedback?section=add_complaints" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Add Complaints</Link>
              <Link href="/backoffice/feedback?section=manage_surveys" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Manage Surveys</Link>
              <Link href="/backoffice/feedback?section=send_survey_emails" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Send Survey Emails</Link>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('fb_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['fb_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['fb_setup'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/feedback?section=complaint_sources" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Complaint Sources</Link>
                    <Link href="/backoffice/feedback?section=complaint_categories" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Complaint Categories</Link>
                    <Link href="/backoffice/feedback?section=complaint_action_types" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Complaint Action Types</Link>
                    <Link href="/backoffice/feedback?section=customer_care" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Customer Care</Link>
                    <Link href="/backoffice/feedback?section=surveys_setup" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Surveys Setup</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 5: LOYALTY MANAGEMENT
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('loyalty'); }}
            title='Loyalty Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['loyalty'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">5. Loyalty Management</span>}
            </div>
            {isOpen && (expandedGroups['loyalty'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['loyalty'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/loyalty?section=dashboard" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/loyalty?section=reports" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Reports</Link>
              <Link href="/backoffice/loyalty?section=members" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Members</Link>
              <Link href="/backoffice/loyalty?section=loyalty_levels" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Loyalty Levels</Link>
              <Link href="/backoffice/loyalty?section=loyalty_programs" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Loyalty Programs</Link>
              <Link href="/backoffice/loyalty?section=send_messages" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Send Messages</Link>
              <Link href="/backoffice/loyalty?section=company_info" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Company Info</Link>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 6: ACCOUNTING
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('acc'); }}
            title='Accounting'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">6. Accounting</span>}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/accounting?section=dashboard" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Dashboard</Link>
              <Link href="/backoffice/accounting?section=reports" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Reports</Link>

              {/* Actions */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('acc_actions')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Actions</span>
                  <span className="text-[9px]">{expandedGroups['acc_actions'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['acc_actions'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/accounting?section=jv" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Journal Voucher</Link>
                    <Link href="/backoffice/accounting?section=purchase" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Purchase</Link>
                    <Link href="/backoffice/accounting?section=payments" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Payments</Link>
                    <Link href="/backoffice/accounting?section=receipts" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Receipts</Link>
                    <Link href="/backoffice/accounting?section=ar" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Accounts Receivables</Link>
                    <Link href="/backoffice/accounting?section=ap" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Accounts Payables</Link>
                    <Link href="/backoffice/accounting?section=bank_recon" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Bank Reconciliation</Link>
                    <Link href="/backoffice/accounting?section=vat_closing" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">VAT Period Closing</Link>
                  </div>
                )}
              </div>

              {/* Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('acc_setup')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Setup</span>
                  <span className="text-[9px]">{expandedGroups['acc_setup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['acc_setup'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/accounting?section=accounts" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Accounts</Link>

                    {/* Account Auxiliaries */}
                    <div className="pt-0.5">
                      <button
                        onClick={() => toggleGroup('acc_aux')}
                        className="w-full flex items-center justify-between p-1 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                      >
                        <span>Account Auxiliaries</span>
                        <span className="text-[9px]">{expandedGroups['acc_aux'] ? '▲' : '▼'}</span>
                      </button>
                      {expandedGroups['acc_aux'] && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          <Link href="/backoffice/accounting?section=aux_classes" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Accounts Classes</Link>
                          <Link href="/backoffice/accounting?section=aux_header1" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Account Header 1</Link>
                          <Link href="/backoffice/accounting?section=aux_header2" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Account Header 2</Link>
                          <Link href="/backoffice/accounting?section=aux_header3" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Account Header 3</Link>
                          <Link href="/backoffice/accounting?section=aux_group" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Account Group</Link>
                          <Link href="/backoffice/accounting?section=aux_jv_desc" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Jv Description</Link>
                          <Link href="/backoffice/accounting?section=aux_jv_types" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Jv Types</Link>
                          <Link href="/backoffice/accounting?section=aux_currency" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Currency</Link>
                          <Link href="/backoffice/accounting?section=aux_currency_rates" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Currency Rates</Link>

                          {/* Departments */}
                          <div className="pt-0.5">
                            <button
                              onClick={() => toggleGroup('acc_dept')}
                              className="w-full flex items-center justify-between p-1 text-slate-700 hover:text-[#195a96] hover:bg-slate-50 rounded font-semibold text-xs transition-colors"
                            >
                              <span>Departments</span>
                              <span className="text-[9px] text-[#195a96]">{expandedGroups['acc_dept'] ? '▲' : '▼'}</span>
                            </button>
                            {expandedGroups['acc_dept'] && (
                              <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                                <Link href="/backoffice/accounting?section=dept_groups" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Department Groups</Link>
                                <Link href="/backoffice/accounting?section=department" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Department</Link>
                                <Link href="/backoffice/accounting?section=cash_flow_setup" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Cash Flow Report Setup</Link>
                                <Link href="/backoffice/accounting?section=sub_dept" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Sub Department</Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 7: HUMAN RESOURCES
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('hr'); }}
            title='Human Resources'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && <span className="truncate font-semibold">7. Human Resources</span>}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/hr?section=schedule_overview" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Schedule Overview</Link>
              <Link href="/backoffice/hr?section=personnel" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Personnel</Link>
              <Link href="/backoffice/hr?section=schedules" className="block p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded">Schedules</Link>

              {/* Organization Setup */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_orgsetup')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Organization Setup</span>
                  <span className="text-[9px]">{expandedGroups['hr_orgsetup'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_orgsetup'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=internal_departments" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Internal Departments</Link>
                    <Link href="/backoffice/hr?section=designations" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Designations</Link>
                    <Link href="/backoffice/hr?section=pos_employee_roles" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">POS Employee Roles</Link>
                  </div>
                )}
              </div>

              {/* Time & Attendance */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_attendance')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Time &amp; Attendance</span>
                  <span className="text-[9px]">{expandedGroups['hr_attendance'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_attendance'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=time_off_requests" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Time Off Requests</Link>
                    <Link href="/backoffice/hr?section=schedule_templates" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Schedule Templates</Link>
                    <Link href="/backoffice/hr?section=time_off_reasons" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Time Off Reasons</Link>
                    <Link href="/backoffice/hr?section=attendance_summary" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Attendance Summary</Link>
                    <Link href="/backoffice/hr?section=attendance_log" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Attendance Log</Link>
                  </div>
                )}
              </div>

              {/* Payroll */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('hr_payroll')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Payroll</span>
                  <span className="text-[9px]">{expandedGroups['hr_payroll'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['hr_payroll'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/hr?section=payroll_dashboard" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Payroll Dashboard</Link>
                    <Link href="/backoffice/hr?section=salary_processing" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Salary Processing</Link>
                    <Link href="/backoffice/hr?section=payment_settings" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Payment Settings</Link>
                    <Link href="/backoffice/hr?section=earnings_deductions" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Earnings &amp; Deductions</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 8: SUPERSONIC FLEET MANAGEMENT (VANGUARD CUSTOM - PRESERVED)
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('supersonic'); }}
            title='Supersonic Fleet Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['supersonic'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>8. Supersonic Fleet Management</span>
                  <span className="bg-blue-100 text-[#195a96] text-[9px] px-1 py-0.2 rounded font-bold">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/fleet" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Fleet Dashboard</Link>
              <Link href="/backoffice/fleet?tab=reports" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between block">
                <span>Fleet Reports</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">REP</span>
              </Link>
              <Link href="/backoffice/fleet?tab=dispatch" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Active Dispatches</Link>
              <Link href="/backoffice/fleet?tab=vendors" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Driver Management</Link>
              <Link href="/backoffice/fleet?tab=path-cards" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Route Optimization</Link>
              <Link href="/backoffice/fleet?tab=vehicles" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Vehicle Maintenance</Link>
              <Link href="/backoffice/fleet?tab=accounting" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Driver Settlements</Link>
              <Link href="/vtrack" className="w-full text-left p-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded flex items-center justify-between font-bold transition-colors mt-1 block">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-600" /> V-Track Geographics</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black">ACTIVE</span>
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================================
            MODULE 9: SOCIAL CRM & SUPPORT (VANGUARD CUSTOM - PRESERVED)
            =================================================================== */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('social'); }}
            title='Social CRM & Support'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>9. Social CRM &amp; Support</span>
                  <span className="bg-blue-100 text-[#195a96] text-[9px] px-1 py-0.2 rounded font-bold">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Social CRM Dashboard</Link>
              <Link href="/backoffice/social-crm?tab=reports" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium text-emerald-700 flex items-center justify-between block">
                <span>Reports Hub</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">REP</span>
              </Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Omnichannel Inbox</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Campaign Analytics</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Lead Pipeline</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Automation Bots</Link>
            </div>
          )}
        </div>

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

          <a
            href="/admin"
            className={`w-full flex items-center ${isOpen ? 'gap-2 px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-medium text-[12px] shadow-2xs`}
          >
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            {isOpen && <span>Master Admin Panel</span>}
          </a>
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
