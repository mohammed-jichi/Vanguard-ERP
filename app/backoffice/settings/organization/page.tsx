'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { Building2, ShieldCheck, Award, Users, ChevronRight, Store, Laptop, Minus, Plus, X } from 'lucide-react';
import LicenseActivationCertificateModal from '@/components/LicenseActivationCertificateModal';

/**
 * Organization settings: a strictly READ-ONLY, live reflection of the tenant.
 * - Team Members come from the HR / Employees module (employees table).
 * - ERP Users come from Users & Security settings (/api/users).
 * - License entitlements come from tenants.feature_flags; seats in use are derived from live users.
 * Nothing on this page creates or edits records.
 */

const HR_ROUTE = '/backoffice/hr/employees';
const USERS_ROUTE = '/backoffice/settings/users';

interface LicenseModuleItem {
  id: string;
  name: string;
  category: string;
  licenseCount: number | string;
  status: string;
  description: string;
  enabled?: boolean;
  seatsUsed?: number;
  purchaseDate?: string | null;
  renewalDate?: string | null;
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

interface PersonRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
}

interface BrandRecord {
  id: string;
  name: string;
  status: string;
}

interface BranchRecord {
  id: string;
  brandId: string;
  name: string;
  address: string;
  status: string;
}

const formatLicenseDate = (value?: string | null): string => {
  if (!value || /perpetual|lifetime|never|open/i.test(String(value))) return 'Open-ended';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function OrganizationSettingsPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);
  const tenantUuid = currentTenant?.id || '00000000-0000-0000-0000-000000000001';

  const [activeTab, setActiveTab] = useState<'organization' | 'licenses'>('organization');
  const [headOfficeData, setHeadOfficeData] = useState<HeadOfficeRecord>({
    companyName: (currentTenant as any)?.name || '',
    primaryContactEmail: '',
    phone: '',
    website: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    customerId: currentTenant?.companyId ? String(currentTenant.companyId) : ''
  });
  const [liveMetrics, setLiveMetrics] = useState<LiveTenantMetrics>({
    brandsCount: 0,
    branchesCount: 0,
    totalUsersCount: 0,
    teamMembersCount: 0,
    erpUsersCount: 0
  });
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [licenseModules, setLicenseModules] = useState<LicenseModuleItem[]>([]);
  const [licenseTier, setLicenseTier] = useState<string>('Enterprise License');
  const [erpUsers, setErpUsers] = useState<PersonRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<PersonRecord[]>([]);
  const [peopleModal, setPeopleModal] = useState<null | 'erp' | 'team'>(null);
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveTenantData() {
      try {
        const res = await fetch(`/api/organization?id=${encodeURIComponent(tenantUuid)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!(json.success && json.data && isMounted)) return;
        const tenant = json.data;
        const flags = tenant.feature_flags || {};

        setHeadOfficeData({
          companyName: tenant.name || '',
          primaryContactEmail: tenant.billing_email || flags.primary_admin?.email || '',
          phone: tenant.phone || tenant.phone_number || '',
          website: flags.website || '',
          streetAddress: tenant.address || tenant.headquarters_address || '',
          city: tenant.city || '',
          state: flags.state || '',
          country: tenant.country || '',
          customerId: tenant.company_id ? String(tenant.company_id) : ''
        });

        if (Array.isArray(tenant.brands)) setBrands(tenant.brands);
        if (Array.isArray(tenant.branches)) setBranches(tenant.branches);
        if (Array.isArray(tenant.license_modules)) setLicenseModules(tenant.license_modules);
        if (tenant.license_tier) setLicenseTier(String(tenant.license_tier));
        if (Array.isArray(tenant.erp_users)) setErpUsers(tenant.erp_users);
        if (Array.isArray(tenant.team_members)) setTeamMembers(tenant.team_members);

        if (tenant.metrics) {
          setLiveMetrics({
            brandsCount: Number(tenant.metrics.brandsCount) || 0,
            branchesCount: Number(tenant.metrics.branchesCount) || 0,
            totalUsersCount: Number(tenant.metrics.activeUsersCount) || 0,
            teamMembersCount: Number(tenant.metrics.teamMembersCount) || 0,
            erpUsersCount: Number(tenant.metrics.erpUsersCount) || 0
          });
        }
      } catch (err) {
        console.warn('Could not fetch live organization tenant metrics:', err);
      }
    }
    fetchLiveTenantData();
    return () => {
      isMounted = false;
    };
  }, [tenantUuid]);

  const tenantCode = headOfficeData.customerId || orgId;
  const branchesOfBrand = (brandId: string) => branches.filter((b) => b.brandId === brandId || (!b.brandId && brands.length === 1));
  const peopleList = peopleModal === 'erp' ? erpUsers : teamMembers;

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link prefetch={false} href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('workspace', 'Workspace')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{t('settings', 'Settings')}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('organization', 'Organization')}</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization</h1>
        <p className="text-xs text-slate-500 font-medium">
          Live, read-only view of {headOfficeData.companyName || 'your company'} (#{tenantCode}). Manage people in HR and Users &amp; Roles.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'organization' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'licenses' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Licenses &amp; Subscriptions</span>
        </button>
      </div>

      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Brands', value: liveMetrics.brandsCount, Icon: Building2 },
              { label: 'Branches', value: liveMetrics.branchesCount, Icon: Store },
              { label: 'Users', value: liveMetrics.totalUsersCount, Icon: Users }
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">{label}</div>
                  <div className="text-xl font-black text-slate-900">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Head Office</h2>
                <p className="text-[11px] text-slate-500">Primary details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Company Name', headOfficeData.companyName],
                ['Phone', headOfficeData.phone],
                ['Primary Contact Email', headOfficeData.primaryContactEmail],
                ['Website', headOfficeData.website]
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{label}</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 min-h-[38px]">{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Physical Address</h2>
                <p className="text-[11px] text-slate-500">Physical address details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                ['Street Address', headOfficeData.streetAddress],
                ['City', headOfficeData.city],
                ['State', headOfficeData.state],
                ['Country', headOfficeData.country]
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{label}</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 min-h-[38px]">{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900">Brands</h2>
              <p className="text-[11px] text-slate-500">The brands and the branches under each (read-only).</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-16 text-center"> </th>
                    <th className="py-3 px-4">Brand Name</th>
                    <th className="py-3 px-4 text-center">Branches</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 text-center text-slate-500">No brands found for this tenant.</td>
                    </tr>
                  )}
                  {brands.map((brand) => {
                    const isOpen = expandedBrandId === brand.id;
                    const brandBranches = branchesOfBrand(brand.id);
                    return (
                      <React.Fragment key={brand.id}>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedBrandId(isOpen ? null : brand.id)}
                              aria-label={isOpen ? 'Collapse brand details' : 'Expand brand details'}
                              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center cursor-pointer shadow-2xs"
                            >
                              {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{brand.name}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{brandBranches.length}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                brand.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {brand.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={4} className="p-4 border-t border-slate-200">
                              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch Facilities</div>
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
                                      {brandBranches.length === 0 && (
                                        <tr>
                                          <td colSpan={4} className="py-4 px-3 text-center text-slate-500">No branches for this brand.</td>
                                        </tr>
                                      )}
                                      {brandBranches.map((br) => (
                                        <tr key={br.id}>
                                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{br.id}</td>
                                          <td className="py-2.5 px-3 font-bold text-slate-900">{br.name}</td>
                                          <td className="py-2.5 px-3 text-slate-600">{br.address || '—'}</td>
                                          <td className="py-2.5 px-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${br.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>
                                              {br.status || 'Active'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
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

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900">Users</h2>
              <p className="text-[11px] text-slate-500">Live counts from HR and Users &amp; Security. Click a card to inspect (read-only).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <button type="button" onClick={() => setPeopleModal('team')} className="w-full text-left flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Team Members</div>
                    <div className="text-xl font-black text-slate-900">{liveMetrics.teamMembersCount}</div>
                  </div>
                </button>
                <Link prefetch={false} href={HR_ROUTE} className="inline-block text-[11px] font-bold text-blue-700 hover:underline">
                  Manage in HR →
                </Link>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <button type="button" onClick={() => setPeopleModal('erp')} className="w-full text-left flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">ERP Users</div>
                    <div className="text-xl font-black text-indigo-700">{liveMetrics.erpUsersCount}</div>
                  </div>
                </button>
                <Link prefetch={false} href={USERS_ROUTE} className="inline-block text-[11px] font-bold text-blue-700 hover:underline">
                  Manage Users &amp; Roles →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Licenses &amp; Subscriptions</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {licenseTier} · CUST ID: {tenantCode || '—'} · read-only entitlement status
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </button>
          </div>

          {licenseModules.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading license entitlements…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licenseModules.map((mod) => {
                const enabled = mod.enabled !== false;
                const licensed = Number(mod.licenseCount) || 0;
                const used = Number(mod.seatsUsed) || 0;
                const pct = licensed > 0 ? Math.min(100, Math.round((used / licensed) * 100)) : 0;
                return (
                  <div key={mod.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{mod.name}</div>
                        <div className="text-[11px] text-slate-500">{mod.category}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${enabled ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{mod.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Seats in use</span>
                        <span className="font-mono font-bold text-slate-900">{used} / {licensed} licensed</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${used > licensed ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CUST ID</span>
                        <span className="font-mono font-bold text-blue-700">{tenantCode || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchased</span>
                        <span className="font-mono font-bold text-slate-700">{formatLicenseDate(mod.purchaseDate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renewal</span>
                        <span className="font-mono font-bold text-slate-700">{formatLicenseDate(mod.renewalDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {peopleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 text-xs max-h-[85vh] flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                {peopleModal === 'erp' ? 'ERP Users (from Users & Security)' : 'Team Members (from HR / Employees)'}
              </h3>
              <div className="flex items-center gap-3">
                <Link prefetch={false} href={peopleModal === 'erp' ? USERS_ROUTE : HR_ROUTE} className="text-[11px] font-bold text-blue-700 hover:underline">
                  {peopleModal === 'erp' ? 'Manage Users & Roles →' : 'Manage in HR →'}
                </Link>
                <button type="button" onClick={() => setPeopleModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Email / Username</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {peopleList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 px-3 text-center text-slate-500">
                        {peopleModal === 'erp' ? 'No ERP users found for this tenant.' : 'No team members found for this tenant.'}
                      </td>
                    </tr>
                  )}
                  {peopleList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.role || '—'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.email || p.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <LicenseActivationCertificateModal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} />
    </div>
  );
}
