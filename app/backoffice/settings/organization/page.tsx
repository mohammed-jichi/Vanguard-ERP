'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Building2,
  ShieldCheck,
  Globe,
  Award,
  Copy,
  Users,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Lock,
  ExternalLink,
  Store,
  Check,
  Calendar,
  Hash,
  Briefcase,
  Plus,
  Minus,
  Laptop
} from 'lucide-react';
import LicenseActivationCertificateModal from '@/components/LicenseActivationCertificateModal';
import { SOUTHERN_OLIVE_OFFICIAL_LICENSE } from '@/lib/TenantContext';

interface LicenseModuleItem {
  id: string;
  name: string;
  category: string;
  licenseCount: number;
  allocatedQty: string;
  status: 'ACTIVE' | 'LICENSED';
  description: string;
  custId: string;
  companyName: string;
  purchaseDate: string;
  renewalDate: string;
}

interface HeadOfficeRecord {
  companyName: string;
  primaryContactEmail: string;
  phone: string;
  website: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  customerId: string;
}

interface LiveTenantMetrics {
  brandsCount: number;
  branchesCount: number;
  totalUsersCount: number;
  teamMembersCount: number;
  erpUsersCount: number;
}

export default function OrganizationSettingsPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  // Active Top Tabs: Strictly ONLY 'organization' | 'licenses'
  const [activeTab, setActiveTab] = useState<'organization' | 'licenses'>('organization');

  // Head Office Details (Strictly Read-Only Enterprise Record matching Omega structure)
  const [headOfficeData, setHeadOfficeData] = useState<HeadOfficeRecord>({
    companyName: 'Zeit w zaytoun ljanoub',
    primaryContactEmail: 'mohammed.jichi@gmail.com',
    phone: '707673828',
    website: '',
    streetAddress: 'Old Saida Road',
    city: 'Kfarchima',
    state: 'Lebanon',
    country: 'Lebanon',
    customerId: '22901',
  });

  // Dynamic Live Tenant Metrics (Matching Omega: Brands 1, Branches 1, Users 7; Breakdown: Team 5, ERP 2)
  const [liveMetrics, setLiveMetrics] = useState<LiveTenantMetrics>({
    brandsCount: 1,
    branchesCount: 1,
    totalUsersCount: 7,
    teamMembersCount: 5,
    erpUsersCount: 2,
  });

  // Accordion States for Brands Table
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>('brand-1');

  // Mutual-Exclusive Single-Open License Accordion State
  const [openLicenseModule, setOpenLicenseModule] = useState<string | null>(null);

  // Certificate Modal & Copy Feedback State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch Live Tenant Data from API if available
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveTenantData() {
      try {
        const targetId = currentTenant?.id || '00000000-0000-0000-0000-000000000001';
        const res = await fetch(`/api/organization?id=${encodeURIComponent(targetId)}`);
        if (!res.ok) return;

        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const tenant = json.data;
          const flags = tenant.feature_flags || {};

          setHeadOfficeData({
            companyName: tenant.name || 'Zeit w zaytoun ljanoub',
            primaryContactEmail: tenant.billing_email || flags.primary_admin?.email || 'mohammed.jichi@gmail.com',
            phone: tenant.phone || tenant.phone_number || '707673828',
            website: flags.website || '',
            streetAddress: tenant.address || tenant.headquarters_address || 'Old Saida Road',
            city: tenant.city || 'Kfarchima',
            state: flags.state || 'Lebanon',
            country: tenant.country || 'Lebanon',
            customerId: tenant.company_id ? String(tenant.company_id) : '22901',
          });

          if (tenant.metrics) {
            setLiveMetrics({
              brandsCount: Number(tenant.metrics.brandsCount) || 1,
              branchesCount: Number(tenant.metrics.branchesCount) || 1,
              totalUsersCount: Number(tenant.metrics.totalUsersCount) || 7,
              teamMembersCount: Number(tenant.metrics.teamMembersCount) || 5,
              erpUsersCount: Number(tenant.metrics.erpUsersCount) || 2,
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch live organization tenant metrics:', err);
      }
    }

    fetchLiveTenantData();
    return () => {
      isMounted = false;
    };
  }, [currentTenant?.id]);

  const toggleBrandAccordion = (brandId: string) => {
    setExpandedBrandId((prev) => (prev === brandId ? null : brandId));
  };

  const toggleLicenseAccordion = (moduleId: string) => {
    setOpenLicenseModule((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SOUTHERN_OLIVE_OFFICIAL_LICENSE.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Official Omega License Modules matching Omega video exactly
  const licenseModules: LicenseModuleItem[] = [
    {
      id: 'omega-accounting',
      name: 'Omega Accounting',
      category: 'Financials & General Ledger',
      licenseCount: 1,
      allocatedQty: '1',
      status: 'ACTIVE',
      custId: '22901',
      companyName: 'Zeit w Zaytoun Ljanoub',
      purchaseDate: '02 Dec, 2025',
      renewalDate: '02 Dec, 2026',
      description: 'Multi-currency general ledger, journal vouchers, audit trail and trial balance.',
    },
    {
      id: 'omega-cloud-back-office',
      name: 'Omega Cloud Back Office',
      category: 'Back Office Management',
      licenseCount: 1,
      allocatedQty: '1',
      status: 'ACTIVE',
      custId: '22901',
      companyName: 'Zeit w Zaytoun Ljanoub',
      purchaseDate: '02 Dec, 2025',
      renewalDate: '02 Dec, 2026',
      description: 'Cloud controllership console, centralized configuration and enterprise administration.',
    },
    {
      id: 'omega-cloud-inventory',
      name: 'Omega Cloud Inventory Management',
      category: 'Warehouse & Stock',
      licenseCount: 1,
      allocatedQty: '1',
      status: 'ACTIVE',
      custId: '22901',
      companyName: 'Zeit w Zaytoun Ljanoub',
      purchaseDate: '02 Dec, 2025',
      renewalDate: '02 Dec, 2026',
      description: 'Stock management, receiving, adjustments, batch formulations and warehouse transfers.',
    },
    {
      id: 'omega-erp-sales',
      name: 'Omega ERP Sales Workstations',
      category: 'Sales Distribution',
      licenseCount: 1,
      allocatedQty: '1',
      status: 'ACTIVE',
      custId: '22901',
      companyName: 'Zeit w Zaytoun Ljanoub',
      purchaseDate: '02 Dec, 2025',
      renewalDate: '02 Dec, 2026',
      description: 'Commercial sales distribution workstations, quotations and van sales dispatch.',
    },
    {
      id: 'pos-workstations',
      name: 'POS Workstations',
      category: 'Point of Sale',
      licenseCount: 4,
      allocatedQty: '4',
      status: 'ACTIVE',
      custId: '22901',
      companyName: 'Zeit w Zaytoun Ljanoub',
      purchaseDate: '02 Dec, 2025',
      renewalDate: '02 Dec, 2026',
      description: 'Touch counter retail and wholesale checkout terminals with scale integrations.',
    },
  ];

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link prefetch={false} href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('workspace', 'Workspace')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{t('settings', 'Settings')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('organization', 'Organization')}</span>
      </div>

      {/* Page Header (Exact Omega styling) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization</h1>
        <p className="text-xs text-slate-500 font-medium">Company branches, modules, and sub organizations</p>
      </div>

      {/* Tabs (Organization / Licenses & Subscriptions) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'organization'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'licenses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Licenses &amp; Subscriptions</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORGANIZATION MODE                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          {/* Top 3 Summary Cards matching Omega Software */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Brands</div>
                  <div className="text-xl font-black text-slate-900">{liveMetrics.brandsCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Branches</div>
                  <div className="text-xl font-black text-slate-900">{liveMetrics.branchesCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Users</div>
                  <div className="text-xl font-black text-slate-900">{liveMetrics.totalUsersCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Head Office (Primary details) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Head Office</h2>
                <p className="text-[11px] text-slate-500">Primary details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Company Name</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                  {headOfficeData.companyName}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900">
                  {headOfficeData.phone}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Primary Contact Email</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900">
                  {headOfficeData.primaryContactEmail}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Website</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium min-h-[38px]">
                  {headOfficeData.website || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Physical Address (Physical address details) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Physical Address</h2>
                <p className="text-[11px] text-slate-500">Physical address details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-500">Street Address</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                  {headOfficeData.streetAddress}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">City</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                  {headOfficeData.city}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">State</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                  {headOfficeData.state}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Country</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                  {headOfficeData.country}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Brands (List the brands and the branches under each) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900">Brands</h2>
              <p className="text-[11px] text-slate-500">
                List the brands and the branches under each. Manage repository locations and regional offices.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">Action</th>
                    <th className="py-3 px-4">Brand Name</th>
                    <th className="py-3 px-4 text-center">Branches</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleBrandAccordion('brand-1')}
                        aria-label={expandedBrandId === 'brand-1' ? 'Collapse brand details' : 'Expand brand details'}
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        {expandedBrandId === 'brand-1' ? <Minus className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {headOfficeData.companyName}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      1
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>

                  {expandedBrandId === 'brand-1' && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={4} className="p-4 border-t border-slate-200">
                        <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Branch Facilities
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-slate-100">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10.5px]">
                                  <th className="py-2 px-3">Branch ID</th>
                                  <th className="py-2 px-3">Branch Name</th>
                                  <th className="py-2 px-3">Address</th>
                                  <th className="py-2 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">22901-01</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">Zeit w zaytoun ljanoub - Main</td>
                                  <td className="py-2.5 px-3 text-slate-600">Old Saida Road, Kfarchima, Lebanon</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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

          {/* Section: Users (Overview of system access and user allocation) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900">Users</h2>
              <p className="text-[11px] text-slate-500">Overview of system access and user allocation</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Team Members</div>
                    <div className="text-xl font-black text-slate-900">{liveMetrics.teamMembersCount}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">ERP Users</div>
                    <div className="text-xl font-black text-indigo-700">{liveMetrics.erpUsersCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LICENSES & SUBSCRIPTIONS (Exact Omega structure)                   */}
      {/* ========================================================================= */}
      {activeTab === 'licenses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Licenses &amp; Subscriptions</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Track software licenses, modules, and expiry dates.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificate</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">Action</th>
                  <th className="py-3 px-4">License/Module</th>
                  <th className="py-3 px-4 text-center">License count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licenseModules.map((mod) => {
                  const isOpen = openLicenseModule === mod.id;

                  return (
                    <React.Fragment key={mod.id}>
                      <tr className={`transition-colors ${isOpen ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'}`}>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleLicenseAccordion(mod.id)}
                            aria-label={isOpen ? `Collapse ${mod.name}` : `Expand ${mod.name}`}
                            className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          >
                            {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {mod.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-900 border border-slate-200 text-xs">
                            {mod.licenseCount}
                          </span>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={3} className="p-4 border-t border-blue-200">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cust ID#</span>
                                  <span className="font-mono font-bold text-blue-700 mt-0.5 block">{mod.custId}</span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</span>
                                  <span className="font-bold text-slate-900 mt-0.5 block truncate">{mod.companyName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Date</span>
                                  <span className="font-mono font-bold text-slate-700 mt-0.5 block">{mod.purchaseDate}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renewal Date</span>
                                  <span className="font-mono font-bold text-slate-700 mt-0.5 block">{mod.renewalDate}</span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                <span>Quantity: <strong className="text-slate-900 font-mono">{mod.allocatedQty}</strong></span>
                                <span className="text-emerald-700 font-bold">● Active &amp; Validated</span>
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
      )}

      {/* Official Certificate Modal */}
      <LicenseActivationCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
