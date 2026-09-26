'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Award,
  FileText,
  Key,
  Copy,
  Users,
  Shield,
  User,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
  Store,
  Monitor,
  Check,
  Calendar,
  Hash,
  Briefcase,
  Plus,
  Minus
} from 'lucide-react';
import LicenseActivationCertificateModal from '@/components/LicenseActivationCertificateModal';

interface LicenseModuleItem {
  id: string;
  name: string;
  category: string;
  licenseCount: string;
  allocatedQty: string;
  status: 'ACTIVE' | 'LICENSED';
  description: string;
}

export default function OrganizationSettingsPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  // Active Top Tabs: 'organization' | 'licenses'
  const [activeTab, setActiveTab] = useState<'organization' | 'licenses'>('organization');

  // Head Office Details (Strictly Read-Only Enterprise Record)
  const headOfficeData = {
    companyName: 'Southern Olive and Oil Products S.A.R.L',
    primaryContactEmail: 'mohammed.jichi@gmail.com',
    phone: '707673828',
    website: 'https://vanguard-erp.net',
    streetAddress: 'Old Saida Road',
    city: 'Kfarchima',
    state: 'Mount Lebanon',
    country: 'Lebanon',
    customerId: '1300',
  };

  // Brands & Sub-branches Accordion State
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);

  // Mutual Exclusive License Accordion State (single open module id)
  const [openLicenseModule, setOpenLicenseModule] = useState<string | null>(null);

  // Certificate Modal & Copy Feedback State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleLicenseAccordion = (moduleId: string) => {
    setOpenLicenseModule((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('VANGUARD-PERPETUAL-SO-OLIVE-2026-988421');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // The 5 Required Enterprise Modules
  const licenseModules: LicenseModuleItem[] = [
    {
      id: 'core-accounting',
      name: 'Vanguard Core Accounting',
      category: 'Financials & General Ledger',
      licenseCount: 'Enterprise / Unlimited',
      allocatedQty: 'Unlimited / 999',
      status: 'ACTIVE',
      description: 'Multi-currency dual-ledger engine, automated PCA & IFRS fiscal chart of accounts, tax return generators, and balance sheet auditing.',
    },
    {
      id: 'cloud-back-office',
      name: 'Vanguard Cloud Back Office',
      category: 'HQ Management & Controllership',
      licenseCount: 'Enterprise / Unlimited',
      allocatedQty: 'Unlimited / 999',
      status: 'ACTIVE',
      description: 'Master controllership console, multi-tenant workspace routing, cross-departmental operations inbox, and executive BI analytics.',
    },
    {
      id: 'cloud-inventory',
      name: 'Vanguard Cloud Inventory Management',
      category: 'Warehouse & Operations Center',
      licenseCount: 'Enterprise / Unlimited',
      allocatedQty: 'Unlimited / 999',
      status: 'ACTIVE',
      description: 'Real-time multi-depot stock balance, olive oil tank volume tracking, batch formulation assembly, and automated reorder triggers.',
    },
    {
      id: 'sales-workstations',
      name: 'Vanguard ERP Sales Workstations',
      category: 'Commercial Distribution & CRM',
      licenseCount: 'Enterprise / Unlimited',
      allocatedQty: 'Unlimited / 999',
      status: 'ACTIVE',
      description: 'Enterprise commercial distribution, B2B wholesale quotation lifecycle, van sales dispatch, and credit limit validations.',
    },
    {
      id: 'pos-workstations',
      name: 'POS Workstations',
      category: 'Retail Point-of-Sale (V-POS)',
      licenseCount: 'Enterprise / Unlimited',
      allocatedQty: 'Unlimited / 999',
      status: 'ACTIVE',
      description: 'Touch-optimized fast retail terminals, electronic scale barcode decoding, cash drawer kicks, and dual-currency receipts.',
    },
  ];

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('workspace', 'Workspace')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{t('settings', 'Settings')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('organization', 'Organization')}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-2xl shadow-xs">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {headOfficeData.companyName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                Cust ID# {headOfficeData.customerId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold uppercase tracking-wider">
                Enterprise Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('org_settings_desc', 'Enterprise corporate identity, head office directory, brand branches, and licensed modules.')}
            </p>
          </div>
        </div>

        {/* Quick Top Navigation Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${orgId}/settings/users`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('users', 'Users')}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/roles`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('roles', 'Roles')}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/account`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('account', 'Account')}</span>
          </Link>
        </div>
      </div>

      {/* Main Mode Navigation Tabs: Organization vs Licenses & Subscriptions */}
      <div className="flex items-center border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('organization')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === 'organization'
              ? 'bg-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('organization', 'Organization')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            activeTab === 'licenses'
              ? 'bg-primary text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Licenses &amp; Subscriptions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
            5 Modules
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORGANIZATION MODE (Head Office Info & Brands Accordion)             */}
      {/* ========================================================================= */}
      {activeTab === 'organization' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. General Mode & Head Office Info (Clean Read-Only Enterprise Spec) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Head Office Information
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Corporate headquarters and verified communication endpoints
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Read-Only Enterprise Record</span>
              </div>
            </div>

            {/* Read-Only Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Company Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={headOfficeData.companyName}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-900 font-bold focus:outline-none select-all cursor-default shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText(headOfficeData.companyName, 'companyName')}
                    title="Copy Company Name"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    {copiedField === 'companyName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Primary Contact Email */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Primary Contact Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    readOnly
                    value={headOfficeData.primaryContactEmail}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-900 font-bold font-mono focus:outline-none select-all cursor-default shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText(headOfficeData.primaryContactEmail, 'email')}
                    title="Copy Email"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={headOfficeData.phone}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-900 font-bold font-mono focus:outline-none select-all cursor-default shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText(headOfficeData.phone, 'phone')}
                    title="Copy Phone"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Website</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={headOfficeData.website}
                    className="w-full px-4 py-2.5 pe-9 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-blue-700 font-bold focus:outline-none select-all cursor-default shadow-2xs"
                  />
                  <a
                    href={headOfficeData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Website"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Street Address</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={headOfficeData.streetAddress}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-800 font-semibold focus:outline-none select-all cursor-default shadow-2xs"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>City</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={headOfficeData.city}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-800 font-semibold focus:outline-none select-all cursor-default shadow-2xs"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>State</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={headOfficeData.state}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-800 font-semibold focus:outline-none select-all cursor-default shadow-2xs"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Country</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={headOfficeData.country}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl text-slate-800 font-semibold focus:outline-none select-all cursor-default shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Summary Cards Specification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Brands (Expandable) */}
            <div
              onClick={() => setIsBrandDrawerOpen(!isBrandDrawerOpen)}
              className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brands</span>
                <span className="text-xs text-blue-600 font-bold group-hover:underline">
                  {isBrandDrawerOpen ? 'Collapse ▲' : 'Expand ▼'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">1</span>
                <span className="text-xs text-slate-500 font-medium">(Expandable)</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>Active Brand Record</span>
              </div>
            </div>

            {/* Card 2: Branches (Expandable) */}
            <div
              onClick={() => setIsBrandDrawerOpen(!isBrandDrawerOpen)}
              className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branches</span>
                <span className="text-xs text-blue-600 font-bold group-hover:underline">
                  {isBrandDrawerOpen ? 'Collapse ▲' : 'Expand ▼'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">1</span>
                <span className="text-xs text-slate-500 font-medium">(Expandable)</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>Southern Olive - Main Facility</span>
              </div>
            </div>

            {/* Card 3: Users */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Users</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-black text-slate-900">Unlimited</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  6 Active
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Enterprise plan perpetual seats
              </div>
            </div>

            {/* Card 4: Team Members & ERP Users Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Breakdown</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3 flex items-center justify-between divide-x divide-slate-100">
                <div className="pr-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Members</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">4</div>
                </div>
                <div className="pl-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ERP Users</div>
                  <div className="text-xl font-black text-primary mt-0.5">2</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Staff: 4 | ERP Operators: 2
              </div>
            </div>
          </div>

          {/* 3. Brands & Sub-branches Table with Detailed Accordion Drawer */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Brands &amp; Sub-Branches Directory
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select row action toggle to view assigned physical branch facilities
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 font-mono">
                1 Registered Brand Entity
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-12 text-center">Action</th>
                    <th className="py-3.5 px-4">Brand Name</th>
                    <th className="py-3.5 px-4 text-center">Branches</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Primary Row */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setIsBrandDrawerOpen(!isBrandDrawerOpen)}
                        aria-label={isBrandDrawerOpen ? 'Collapse branch details' : 'Expand branch details'}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold inline-flex items-center justify-center transition-all shadow-xs cursor-pointer"
                      >
                        {isBrandDrawerOpen ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        Southern Olive and Oil Products
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Primary Corporate Brand Identifier
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs">
                        1
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                  </tr>

                  {/* Expandable Detailed Branch Drawer */}
                  {isBrandDrawerOpen && (
                    <tr className="bg-slate-50/90 animate-fadeIn">
                      <td colSpan={4} className="p-4 sm:p-5 border-t border-blue-200">
                        <div className="bg-white rounded-2xl border-2 border-blue-500/40 p-4 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-blue-600" />
                              <span>Registered Facility Branches (1 Detail Row)</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              Cust ID# 1300
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200">
                                  <th className="py-2.5 px-3.5">Cust ID#</th>
                                  <th className="py-2.5 px-3.5">Branch ID#</th>
                                  <th className="py-2.5 px-3.5">Branch Name</th>
                                  <th className="py-2.5 px-3.5">Address</th>
                                  <th className="py-2.5 px-3.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="hover:bg-blue-50/40 transition-colors">
                                  <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">1300</td>
                                  <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">1</td>
                                  <td className="py-2.5 px-3.5 font-bold text-slate-900">
                                    Southern Olive and Oil Products - Main
                                  </td>
                                  <td className="py-2.5 px-3.5 text-slate-600">
                                    Old Saida Road, Lebanon
                                  </td>
                                  <td className="py-2.5 px-3.5 text-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      Active
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LICENSES & SUBSCRIPTIONS (Mutual Exclusive Single-Open Accordion)   */}
      {/* ========================================================================= */}
      {activeTab === 'licenses' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top License Overview Banner */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold uppercase tracking-wider">
                  ENTERPRISE ACTIVE
                </span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Perpetual 5-Year Contract
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Vanguard Enterprise Software Suite
              </h2>
              <p className="text-xs text-slate-300">
                Licensed to: <strong className="text-white">{headOfficeData.companyName}</strong> (Cust ID# {headOfficeData.customerId})
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>View Certificate of Authenticity</span>
              </button>

              <button
                type="button"
                onClick={handleCopyKey}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied!' : 'Copy License'}</span>
              </button>
            </div>
          </div>

          {/* Mutual Exclusive Accordion Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Licensed Modules &amp; Allocated Workstations
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click the blue &quot;+&quot; button to view details for any module. Only one module drawer opens at a time.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Single-Open Mutual Exclusive View
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-14 text-center">Action</th>
                    <th className="py-3.5 px-4">License / Module</th>
                    <th className="py-3.5 px-4 text-center">License Count</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {licenseModules.map((mod) => {
                    const isOpen = openLicenseModule === mod.id;

                    return (
                      <React.Fragment key={mod.id}>
                        {/* Parent License Row */}
                        <tr className={`transition-colors ${isOpen ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`}>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleLicenseAccordion(mod.id)}
                              aria-label={isOpen ? `Collapse ${mod.name}` : `Expand ${mod.name}`}
                              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold inline-flex items-center justify-center transition-all shadow-xs cursor-pointer"
                            >
                              {isOpen ? <Minus className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">{mod.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {mod.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {mod.description}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs">
                              {mod.licenseCount}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Active
                            </span>
                          </td>
                        </tr>

                        {/* License Details Drawer (Mutual-Exclusive Single-Open) */}
                        {isOpen && (
                          <tr className="bg-slate-50/95 animate-fadeIn">
                            <td colSpan={4} className="p-4 sm:p-5 border-t border-blue-200">
                              <div className="bg-white rounded-2xl border-2 border-blue-500/50 p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                      License Details &bull; {mod.name}
                                    </span>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                                    Verified Read-Only Allocation
                                  </span>
                                </div>

                                {/* Read-Only License Data Grid Specification */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                                  {/* Cust ID# */}
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      <Hash className="w-3 h-3 text-slate-400" />
                                      <span>Cust ID#</span>
                                    </span>
                                    <div className="font-mono font-black text-sm text-blue-700">
                                      1300
                                    </div>
                                  </div>

                                  {/* Company Name */}
                                  <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-slate-400" />
                                      <span>Company Name</span>
                                    </span>
                                    <div className="font-bold text-xs text-slate-900 truncate">
                                      Southern Olive and Oil Products S.A.R.L
                                    </div>
                                  </div>

                                  {/* Purchase Date */}
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <span>Purchase Date</span>
                                    </span>
                                    <div className="font-bold text-xs text-slate-800 font-mono">
                                      20 Sep, 2026
                                    </div>
                                  </div>

                                  {/* Renewal Date */}
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-emerald-600" />
                                      <span>Renewal Date</span>
                                    </span>
                                    <div className="font-bold text-xs text-emerald-800 font-mono">
                                      20 Sep, 2031
                                    </div>
                                    <div className="text-[9.5px] text-emerald-600 font-semibold">
                                      (5-Year Enterprise Plan)
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Meta: Quantity and Scope */}
                                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between text-xs gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-600 font-bold">Quantity Allocation:</span>
                                    <span className="font-mono font-black text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                                      Unlimited / 999
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-500 font-medium">
                                    Security Seal: <span className="font-mono text-slate-700">SHA256:7e8a9f0b1c2d3e4f-VG2026</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <LicenseActivationCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
