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
  Maximize2
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import TenantSettingsModal from './TenantSettingsModal';

interface SalesMenuItem {
  id: string;
  title: string;
  type: 'link' | 'accordion';
  external?: boolean;
  href?: string;
  children?: Array<{ id: string; title: string; href?: string }>;
}

const salesControlMenu: SalesMenuItem[] = [
  { id: 'sc-dashboard', title: 'Dashboard', type: 'link', href: '/backoffice/dashboard' },
  { id: 'sc-reports', title: 'Reports', type: 'link', href: '/backoffice/reportview' },
  { id: 'sc-online-orders', title: 'Online Orders', type: 'link', href: '/backoffice/online-orders' },
  { id: 'sc-eod', title: 'End of Day', type: 'link', href: '/backoffice/end-of-day' },
  { 
    id: 'sc-setup', 
    title: 'Setup', 
    type: 'accordion', 
    children: [
      { id: 'setup-screens', title: 'Screens', href: '/backoffice/screens' },
      { id: 'setup-payment-types', title: 'Payment Types', href: '/backoffice/payment-types' },
      { id: 'setup-coupons', title: 'Coupon and Gift Certificates', href: '/backoffice/coupons' },
      { id: 'setup-discounts', title: 'Discounts', href: '/backoffice/discounts' },
      { id: 'setup-price-modes', title: 'Price Modes', href: '/backoffice/price-modes' },
      { id: 'setup-workstations', title: 'Workstations and Printers', href: '/backoffice/workstations-printers' }
    ] 
  },
  { 
    id: 'sc-more-setup', 
    title: 'More Setup', 
    type: 'accordion', 
    children: [
      { id: 'more-void', title: 'Void Reasons', href: '/backoffice/void-reasons' },
      { id: 'more-vat', title: 'VAT Exemption Reason', href: '/backoffice/vat-exemptions' },
      { id: 'more-message', title: 'Message on Invoice', href: '/backoffice/invoice-messages' },
      { id: 'more-zone', title: 'Zone Setup', href: '/backoffice/zone-setup' },
      { id: 'more-currency', title: 'Currency Setup', href: '/backoffice/currency-setup' }
    ] 
  }
];

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
}: SidebarProps) {
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

  // Accordion toggle states for all main & sub-accordions
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sales: true,
    'sc-setup': false,
    'sc-more-setup': false,
    sales_setup: false,
    sales_moresetup: false,
    supersonic: false,
    social: false,
    op: true,
    op_actions: false,
    op_prodreq: false,
    op_events: false,
    op_setup: false,
    op_more: false,
    cust: false,
    cust_settings: false,
    cust_feedback: false,
    cust_feedback_setup: false,
    cust_loyalty: false,
    acc: false,
    acc_actions: false,
    acc_setup: false,
    acc_aux: false,
    acc_deptsetup: false,
    hr: false,
    hr_orgsetup: false,
    hr_attendance: false,
    hr_payroll: false,
  });

  // Auto-expand accordions when active route matches their children
  React.useEffect(() => {
    if (activeScreen) {
      if (
        activeScreen.includes('/backoffice/void-reasons') ||
        activeScreen.includes('/backoffice/vat-exemptions') ||
        activeScreen.includes('/backoffice/invoice-messages') ||
        activeScreen.includes('/backoffice/zone-setup') ||
        activeScreen.includes('/backoffice/currency-setup')
      ) {
        setExpandedGroups(prev => ({
          ...prev,
          sales: true,
          'sc-more-setup': true
        }));
      } else if (
        activeScreen.includes('/backoffice/screens') ||
        activeScreen.includes('/backoffice/payment-types') ||
        activeScreen.includes('/backoffice/coupons') ||
        activeScreen.includes('/backoffice/discounts') ||
        activeScreen.includes('/backoffice/price-modes') ||
        activeScreen.includes('/backoffice/workstations-printers')
      ) {
        setExpandedGroups(prev => ({
          ...prev,
          sales: true,
          'sc-setup': true
        }));
      }
    }
  }, [activeScreen]);

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
    switch (screenKey) {
      case 'grid-dash':
      case 'sc-dashboard':
        router.push('/backoffice/dashboard');
        break;
      case 'sc-reports':
        router.push('/backoffice/reportview');
        break;
      case 'sc-online-orders':
        router.push('/backoffice/online-orders');
        break;
      case 'sc-eod':
        router.push('/backoffice/end-of-day');
        break;
      case 'fleet-map':
      case 'fleet-playback':
        router.push('/vtrack');
        break;
      case 'fleet-km':
        router.push('/backoffice/fleet?tab=vehicles');
        break;
      case 'fleet-fuel':
        router.push('/backoffice/fleet?tab=fuel');
        break;
      case 'fleet-maint':
        router.push('/backoffice/fleet?tab=maintenance');
        break;
      case 'supersonic-fleet':
        router.push('/backoffice/fleet?tab=vendors');
        break;
      case 'social-inbox':
      case 'social-orders':
      case 'social-calendar':
      case 'social-campaigns':
      case 'social-agents':
      case 'social-distributors':
        router.push('/backoffice/social-crm');
        break;
      case 'cust-dir':
        router.push('/contacts');
        break;
      case 'cust-insights':
        router.push('/customer-insights');
        break;
      case 'cust-receipts':
        router.push('/backoffice/operations?section=sales');
        break;
      case 'cust-aged':
        router.push('/backoffice/reportview');
        break;
      case 'cust-tasks':
        router.push('/schedule');
        break;
      case 'cust-leads':
        router.push('/customer-insights');
        break;
      case 'cust-performance':
        router.push('/sales-manager-dashboard');
        break;
      case 'acc-dash':
        router.push('/backoffice/operations?section=dashboard');
        break;
      case 'acc-reports':
        router.push('/backoffice/reportview');
        break;
      case 'acc-coa':
        router.push('/backoffice/operations?section=adjustments');
        break;
      case 'acc-jv':
        router.push('/backoffice/operations?section=adjustments');
        break;
      case 'acc-ap':
        router.push('/purchases');
        break;
      case 'acc-rec':
        router.push('/backoffice/reportview');
        break;
      case 'acc-vat':
        router.push('/backoffice/operations?section=currency_setup');
        break;
      case 'hr-overview':
      case 'hr-payroll-dash':
        router.push('/schedule');
        break;
      case 'hr-dir':
        router.push('/contacts');
        break;
      default:
        break;
    }
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

        {/* SEARCH INPUT FIELD (RENDERED IN EXPANDED STATE BELOW HOME ICON) */}
        {isOpen && (
          <div className="relative w-full mt-1">
            <input
              type="text"
              placeholder="search..."
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
        
        {/* MODULE 1: SALES CONTROL */}
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
              {isOpen && (
                <span className="truncate font-semibold">
                  1. Sales Control
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['sales'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['sales'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              {salesControlMenu.map((item) => {
                if (item.type === 'link') {
                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href || "/pos"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-50 rounded font-bold transition-colors"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#195a96] shrink-0" />
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={item.id}
                      href={item.href || '#'}
                      onClick={() => handleNav(item.id, item.href)}
                      className={`w-full block text-left p-1.5 rounded transition-colors ${
                        activeScreen === item.id || activeScreen === item.href ? 'text-[#195a96] font-bold bg-slate-50 border-l-2 border-[#195a96]' : 'font-medium text-slate-700 hover:text-[#195a96] hover:bg-slate-50'
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                }

                if (item.type === 'accordion') {
                  const isExpanded = expandedGroups[item.id];
                  return (
                    <div key={item.id} className="pt-1">
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="w-full flex items-center justify-between p-1.5 text-[#195a96] bg-slate-50/80 hover:bg-slate-100/80 rounded font-bold text-xs transition-colors"
                      >
                        <span>{item.title}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#195a96]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#195a96]" />}
                      </button>
                      {isExpanded && item.children && (
                        <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href || '#'}
                              onClick={() => handleNav(child.id, child.href)}
                              className={`w-full block text-left p-1 rounded transition-colors ${
                                activeScreen === child.id || activeScreen === child.href ? 'text-[#195a96] font-bold bg-slate-50 border-l-2 border-[#195a96]' : 'font-medium text-slate-700 hover:text-[#195a96] hover:bg-slate-50'
                              }`}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* MODULE 2: SUPERSONIC FLEET (PRO) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('supersonic'); }}
            title='SuperSonic Fleet Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['supersonic'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>2. SuperSonic Fleet Management</span>
                  <span className="bg-blue-100 text-[#195a96] text-[9px] px-1 py-0.2 rounded font-bold">PRO</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['supersonic'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['supersonic'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/vtrack" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Live GPS Fleet Map</Link>
              <Link href="/backoffice/fleet?tab=vehicles" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">KM & Odometer Logs</Link>
              <Link href="/backoffice/fleet?tab=fuel" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Fuel Consumption</Link>
              <Link href="/backoffice/fleet?tab=maintenance" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Vehicle Maintenance</Link>
              <Link href="/vtrack" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Trip History & Route Playback</Link>
              <Link href="/backoffice/fleet?tab=vendors" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium text-[#195a96] block">Drivers Directory</Link>
              <a href="/supersonic/driver" target="_blank" className="w-full text-left p-1.5 text-[#195a96] hover:bg-slate-50 rounded flex items-center gap-1 font-medium transition-colors block">
                <ExternalLink className="w-3 h-3" /> Driver App PWA
              </a>
              <Link href="/vtrack" className="w-full text-left p-1.5 text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded flex items-center justify-between font-bold transition-colors mt-1 block">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-600" /> V-Track Geographics</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black">ACTIVE</span>
              </Link>
            </div>
          )}
        </div>

        {/* MODULE 3: SOCIAL CRM (ENT) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('social'); }}
            title='Social Media CRM'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['social'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate flex items-center gap-1 font-semibold">
                  <span>3. Social CRM & Support</span>
                  <span className="bg-blue-100 text-[#195a96] text-[9px] px-1 py-0.2 rounded font-bold">ENT</span>
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['social'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['social'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Unified Social Inbox</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Platform Orders</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Publishing Calendar</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Ad Campaigns & CPL</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Support Agents</Link>
              <Link href="/backoffice/social-crm" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Distributors Directory</Link>
            </div>
          )}
        </div>

        {/* MODULE 4: OPERATIONS CENTER & OLIVE PRESSING */}
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
              {isOpen && (
                <span className="truncate font-semibold">
                  4. Operations Center
                </span>
              )}
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
                    <Link href="/backoffice/operations?section=quotations" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Quotation</Link>
                    <Link href="/backoffice/operations?section=delivery_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Delivery Of Goods</Link>
                    <Link href="/backoffice/operations?section=purchases" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Purchases</Link>
                    <Link href="/backoffice/operations?section=purchase_orders" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Purchases Orders</Link>
                    <Link href="/backoffice/operations?section=reorder_guide" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Reorder Guide</Link>
                    <Link href="/backoffice/operations?section=transfers" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Transfers</Link>
                    <Link href="/backoffice/operations?section=lost_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Lost Goods</Link>
                    <Link href="/backoffice/operations?section=item_assembly" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Item Assembly</Link>
                    <Link href="/backoffice/operations?section=adjustments" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Adjustments</Link>
                  </div>
                )}
              </div>

              {/* Product Request */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_prodreq')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
                >
                  <span>Product Request</span>
                  <span className="text-[9px]">{expandedGroups['op_prodreq'] ? '▲' : '▼'}</span>
                </button>
                {expandedGroups['op_prodreq'] && (
                  <div className="ml-2 pl-2 border-l border-slate-200 space-y-0.5 mt-0.5 text-xs text-slate-700">
                    <Link href="/backoffice/operations?section=product_request" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Product Request</Link>
                    <Link href="/backoffice/operations?section=manage_product_requests" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Manage Product Request</Link>
                    <Link href="/backoffice/operations?section=receiving_goods" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Receiving Of Goods</Link>
                    <Link href="/backoffice/operations?section=product_req_reports" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Reports</Link>
                    <Link href="/backoffice/operations?section=request_reject_reasons" className="block p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">Request Reject Reasons</Link>
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="pt-0.5">
                <button
                  onClick={() => toggleGroup('op_events')}
                  className="w-full flex items-center justify-between p-1.5 text-[#195a96] hover:bg-slate-100 rounded font-bold text-xs transition-colors"
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
                          <Link href="/backoffice/operations?section=inventory_sources" className="flex items-center gap-2 p-1 hover:text-[#195a96] hover:bg-slate-50 rounded">
                            <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span>All Sources</span>
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

        {/* MODULE 5: CUSTOMER MANAGEMENT (CRM) */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('cust'); }}
            title='Customer Management & AR'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['cust'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  5. Customer Management & AR
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['cust'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['cust'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/contacts" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Customer Accounts Directory</Link>
              <Link href="/customer-insights" className="w-full text-left p-1.5 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-100 rounded transition-colors font-bold text-blue-700 flex items-center justify-between block">
                <span>Customer LTV Insights</span>
                <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">AI CRM</span>
              </Link>
              <Link href="/backoffice/operations?section=sales" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Receipt Vouchers</Link>
              <Link href="/backoffice/reportview" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Aged Debtors Analysis</Link>
              <Link href="/schedule" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Tasks & Appointments</Link>
              <Link href="/customer-insights" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Leads & Opportunities</Link>
              <Link href="/sales-manager-dashboard" target="_blank" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Sales Rep Performance</Link>
            </div>
          )}
        </div>

        {/* MODULE 6: ACCOUNTING & FINANCE */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('acc'); }}
            title='Accounting & Finance'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['acc'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  6. Accounting & Finance
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['acc'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['acc'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/backoffice/operations?section=dashboard" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium block">Accounting Dashboard</Link>
              <Link href="/backoffice/reportview" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Financial Statements (P&L, Balance Sheet)</Link>
              <Link href="/backoffice/operations?section=quick_setup" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-semibold text-slate-900 block">Chart of Accounts (COA)</Link>
              <Link href="/backoffice/operations?section=adjustments" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Journal Vouchers (JV)</Link>
              <Link href="/purchases" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block font-semibold text-amber-800">Accounts Payable (AP)</Link>
              <Link href="/backoffice/reportview" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Bank Reconciliation</Link>
              <Link href="/backoffice/operations?section=currency_setup" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium block">VAT Tax Closing</Link>
            </div>
          )}
        </div>

        {/* MODULE 7: HUMAN RESOURCES & PAYROLL */}
        <div>
          <button
            onClick={() => { ensureOpen(); toggleGroup('hr'); }}
            title='HR & Payroll Management'
            className={`w-full flex items-center ${isOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2.5'} rounded-lg transition-colors ${
              expandedGroups['hr'] ? 'bg-slate-50 text-[#195a96] font-bold' : 'hover:bg-slate-50 hover:text-[#195a96] text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-[#195a96] shrink-0" />
              {isOpen && (
                <span className="truncate font-semibold">
                  7. HR & Payroll Management
                </span>
              )}
            </div>
            {isOpen && (expandedGroups['hr'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />)}
          </button>

          {isOpen && expandedGroups['hr'] && (
            <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5 mt-1 text-xs">
              <Link href="/schedule" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Employee Schedule</Link>
              <Link href="/contacts" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors block">Employee Directory</Link>
              <Link href="/schedule" className="w-full text-left p-1.5 hover:text-[#195a96] hover:bg-slate-50 rounded transition-colors font-medium text-[#195a96] block">Payroll Management</Link>
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
                <span>Identity & Settings</span>
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
