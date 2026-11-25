'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Building2,
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  Store,
  Plus,
  Minus,
  Laptop,
  Pencil,
  X
} from 'lucide-react';
import LicenseActivationCertificateModal from '@/components/LicenseActivationCertificateModal';

interface LicenseModuleItem {
  id: string;
  name: string;
  category: string;
  licenseCount: number | string;
  allocatedQty: string;
  status: string;
  description: string;
  enabled?: boolean;
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

interface BrandRecord {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

interface PersonRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  status: string;
  code?: string;
}

const ROLE_OPTIONS = ['Super Admin', 'Accountant', 'Warehouse Manager', 'POS Cashier', 'Driver', 'Staff'];

interface BranchRecord {
  id: string;
  brandId: string;
  name: string;
  address: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_LICENSE_MODULES: LicenseModuleItem[] = [
  { id: 'core-accounting', name: 'Vanguard Accounting & General Ledger', category: 'Financials & General Ledger', licenseCount: 1, allocatedQty: '1', status: 'ACTIVE', enabled: true, description: 'Multi-currency general ledger, journal vouchers, audit trail and trial balance.' },
  { id: 'cloud-back-office', name: 'Vanguard Cloud Back Office & Inventory', category: 'Back Office & Warehouse', licenseCount: 1, allocatedQty: '1', status: 'ACTIVE', enabled: true, description: 'Cloud controllership console, configuration, stock management, receiving and warehouse transfers.' },
  { id: 'sales-workstations', name: 'Vanguard ERP Sales & Billing Workstations', category: 'Sales Distribution', licenseCount: 1, allocatedQty: '1', status: 'ACTIVE', enabled: true, description: 'Sales and billing workstations, quotations and invoicing.' },
  { id: 'pos-workstations', name: 'Vanguard POS & Cash Register Terminals', category: 'Point of Sale', licenseCount: 4, allocatedQty: '4', status: 'ACTIVE', enabled: true, description: 'Touch counter checkout terminals and cash registers with scale integrations.' },
  { id: 'dispatch-fleet', name: 'Vanguard SuperSonic Dispatch & Fleet Portal', category: 'Dispatch & Fleet', licenseCount: 1, allocatedQty: '1', status: 'ACTIVE', enabled: true, description: 'Delivery dispatch, driver portal and fleet tracking.' }
];
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
  const [licenseModules, setLicenseModules] = useState<LicenseModuleItem[]>(DEFAULT_LICENSE_MODULES);
  const [licenseTier, setLicenseTier] = useState<string>('Enterprise License');
  const [erpUsers, setErpUsers] = useState<PersonRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<PersonRecord[]>([]);
  const [peopleModal, setPeopleModal] = useState<null | 'erp' | 'team'>(null);
  const [addForm, setAddForm] = useState<null | { kind: 'erp_user' | 'team_member'; name: string; email: string; phone: string; role: string; status: string }>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [openLicenseModule, setOpenLicenseModule] = useState<string | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Brand / Branch editor
  const [editor, setEditor] = useState<null | { kind: 'brand' | 'branch'; item: any; isNew: boolean }>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        const code = tenant.company_id ? String(tenant.company_id) : '';

        setHeadOfficeData({
          companyName: tenant.name || '',
          primaryContactEmail: tenant.billing_email || flags.primary_admin?.email || '',
          phone: tenant.phone || tenant.phone_number || '',
          website: flags.website || '',
          streetAddress: tenant.address || tenant.headquarters_address || '',
          city: tenant.city || '',
          state: flags.state || '',
          country: tenant.country || '',
          customerId: code
        });

        if (Array.isArray(tenant.brands)) setBrands(tenant.brands);
        if (Array.isArray(tenant.branches)) setBranches(tenant.branches);
        if (Array.isArray(tenant.license_modules) && tenant.license_modules.length > 0) setLicenseModules(tenant.license_modules);
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

  const tenantCode = headOfficeData.customerId || (currentTenant?.companyId ? String(currentTenant.companyId) : orgId);

  const persistStructure = async (kind: 'brands' | 'branches' | 'license_modules', items: any[]): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/organization/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenantUuid, kind, items })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setSaveMessage(`Save failed: ${json.error || res.statusText}`);
        return false;
      }
      setSaveMessage(`Saved ${kind} to Supabase.`);
      return true;
    } catch (e: any) {
      setSaveMessage(`Save failed: ${e?.message || e}`);
      return false;
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const openBrandEditor = (brand?: BrandRecord) =>
    setEditor({ kind: 'brand', isNew: !brand, item: brand ? { ...brand } : { id: `brand-${Date.now()}`, name: '', status: 'Active' } });

  const openBranchEditor = (brandId: string, branch?: BranchRecord) =>
    setEditor({
      kind: 'branch',
      isNew: !branch,
      item: branch
        ? { ...branch }
        : {
            id: `${tenantCode || 'BR'}-${String(branches.length + 1).padStart(2, '0')}`,
            brandId,
            name: '',
            address: '',
            status: 'Active'
          }
    });

  const handleEditorSave = async () => {
    if (!editor) return;
    const item = editor.item;
    if (!String(item.name || '').trim()) {
      setSaveMessage('Name is required.');
      return;
    }
    if (editor.kind === 'brand') {
      const next = editor.isNew ? [...brands, item] : brands.map((b) => (b.id === item.id ? item : b));
      if (await persistStructure('brands', next)) {
        setBrands(next);
        setLiveMetrics((m) => ({ ...m, brandsCount: next.length }));
        setEditor(null);
      }
    } else {
      const next = editor.isNew ? [...branches, item] : branches.map((b) => (b.id === item.id ? item : b));
      if (await persistStructure('branches', next)) {
        setBranches(next);
        setLiveMetrics((m) => ({ ...m, branchesCount: next.length }));
        setEditor(null);
      }
    }
  };

  const saveLicenseModule = async (modId: string, patch: { enabled?: boolean; licenseCount?: number }) => {
    const next = licenseModules.map((m) => {
      if (m.id !== modId) return m;
      const enabled = patch.enabled !== undefined ? patch.enabled : m.enabled !== false;
      const count = patch.licenseCount !== undefined ? patch.licenseCount : Number(m.licenseCount) || 0;
      return { ...m, enabled, licenseCount: count, allocatedQty: String(count), status: enabled ? 'ACTIVE' : 'DISABLED' };
    });
    const payload = next.map((m) => ({
      id: m.id,
      enabled: m.enabled !== false,
      licenseCount: Number(m.licenseCount) || 0,
      purchaseDate: m.purchaseDate || null,
      renewalDate: m.renewalDate || null
    }));
    if (await persistStructure('license_modules', payload)) setLicenseModules(next);
  };

  const handleAddPerson = async () => {
    if (!addForm) return;
    if (!addForm.name.trim()) {
      setSaveMessage('Name is required.');
      return;
    }
    if (addForm.kind === 'erp_user' && !addForm.email.trim()) {
      setSaveMessage('Email is required for ERP users.');
      return;
    }
    setIsAddingPerson(true);
    try {
      const res = await fetch('/api/organization/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tenantUuid,
          kind: addForm.kind,
          person: { name: addForm.name, email: addForm.email, phone: addForm.phone, role: addForm.role, status: addForm.status }
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setSaveMessage(`Could not add ${addForm.kind === 'erp_user' ? 'user' : 'team member'}: ${json.error || res.statusText}`);
        return;
      }
      const active = addForm.status !== 'Inactive' ? 1 : 0;
      if (addForm.kind === 'erp_user') {
        setErpUsers((prev) => [...prev, json.person]);
        setLiveMetrics((m) => ({ ...m, erpUsersCount: m.erpUsersCount + active, totalUsersCount: m.totalUsersCount + active }));
        setPeopleModal('erp');
        setSaveMessage(json.linkedToUsersTable ? 'ERP user created and linked.' : 'ERP user added to the tenant roster (the global users table did not accept the record).');
      } else {
        setTeamMembers((prev) => [...prev, json.person]);
        setLiveMetrics((m) => ({ ...m, teamMembersCount: m.teamMembersCount + active, totalUsersCount: m.totalUsersCount + active }));
        setPeopleModal('team');
        setSaveMessage('Team member added to HR staff.');
      }
      setAddForm(null);
    } catch (e: any) {
      setSaveMessage(`Could not add person: ${e?.message || e}`);
    } finally {
      setIsAddingPerson(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const branchesOfBrand = (brandId: string) => branches.filter((b) => b.brandId === brandId || (!b.brandId && brands.length === 1));

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
        <p className="text-xs text-slate-500 font-medium">Company branches, modules, and sub organizations</p>
      </div>

      {saveMessage && (
        <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-900">{saveMessage}</div>
      )}

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
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">{label}</div>
                    <div className="text-xl font-black text-slate-900">{value}</div>
                  </div>
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
                ['Company Name', headOfficeData.companyName, 'font-bold'],
                ['Phone', headOfficeData.phone, 'font-mono font-bold'],
                ['Primary Contact Email', headOfficeData.primaryContactEmail, 'font-mono font-bold'],
                ['Website', headOfficeData.website, 'font-medium']
              ].map(([label, value, cls]) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{label}</label>
                  <div className={`p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[38px] ${cls}`}>{value || '—'}</div>
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
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Brands</h2>
                <p className="text-[11px] text-slate-500">List the brands and the branches under each. Manage repository locations and regional offices.</p>
              </div>
              <button
                type="button"
                onClick={() => openBrandEditor()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Brand</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-24 text-center">Action</th>
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
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setExpandedBrandId(isOpen ? null : brand.id)}
                                aria-label={isOpen ? 'Collapse brand details' : 'Expand brand details'}
                                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center cursor-pointer shadow-2xs"
                              >
                                {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => openBrandEditor(brand)}
                                aria-label="Edit brand"
                                className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                                <div className="flex items-center justify-between">
                                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch Facilities</div>
                                  <button
                                    type="button"
                                    onClick={() => openBranchEditor(brand.id)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Branch</span>
                                  </button>
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-slate-100">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10.5px]">
                                        <th className="py-2 px-3">Branch ID</th>
                                        <th className="py-2 px-3">Branch Name</th>
                                        <th className="py-2 px-3">Address</th>
                                        <th className="py-2 px-3 text-center">Status</th>
                                        <th className="py-2 px-3 text-center w-16">Edit</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {brandBranches.length === 0 && (
                                        <tr>
                                          <td colSpan={5} className="py-4 px-3 text-center text-slate-500">No branches yet for this brand.</td>
                                        </tr>
                                      )}
                                      {brandBranches.map((br) => (
                                        <tr key={br.id}>
                                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{br.id}</td>
                                          <td className="py-2.5 px-3 font-bold text-slate-900">{br.name}</td>
                                          <td className="py-2.5 px-3 text-slate-600">{br.address || '—'}</td>
                                          <td className="py-2.5 px-3 text-center">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                br.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                                              }`}
                                            >
                                              {br.status || 'Active'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-center">
                                            <button
                                              type="button"
                                              onClick={() => openBranchEditor(brand.id, br)}
                                              aria-label="Edit branch"
                                              className="w-6 h-6 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </button>
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
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Users</h2>
                <p className="text-[11px] text-slate-500">Overview of system access and user allocation</p>
              </div>
              <button
                type="button"
                onClick={() => setAddForm({ kind: 'erp_user', name: '', email: '', phone: '', role: 'Accountant', status: 'Active' })}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User / Team Member</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPeopleModal('team')}
                className="text-left p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Team Members</div>
                  <div className="text-xl font-black text-slate-900">{liveMetrics.teamMembersCount}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPeopleModal('erp')}
                className="text-left p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">ERP Users</div>
                  <div className="text-xl font-black text-indigo-700">{liveMetrics.erpUsersCount}</div>
                </div>
              </button>
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
                {licenseTier} · Active. Track software licenses, modules, and renewal dates.
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
                            onClick={() => setOpenLicenseModule(isOpen ? null : mod.id)}
                            aria-label={isOpen ? `Collapse ${mod.name}` : `Expand ${mod.name}`}
                            className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            {isOpen ? <Minus className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{mod.name}{mod.enabled === false && <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Disabled</span>}</td>
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
                                  <span className="font-mono font-bold text-blue-700 mt-0.5 block">{tenantCode || '—'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</span>
                                  <span className="font-bold text-slate-900 mt-0.5 block truncate">{headOfficeData.companyName || '—'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Date</span>
                                  <span className="font-mono font-bold text-slate-700 mt-0.5 block">{formatLicenseDate(mod.purchaseDate)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Renewal Date</span>
                                  <span className="font-mono font-bold text-slate-700 mt-0.5 block">{formatLicenseDate(mod.renewalDate)}</span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                                <label className="flex items-center gap-2">
                                  Seats / workstations:
                                  <input
                                    key={`${mod.id}-${mod.licenseCount}`}
                                    type="number"
                                    min={0}
                                    defaultValue={Number(mod.licenseCount) || 0}
                                    onBlur={(e) => {
                                      const v = Math.max(0, Number(e.target.value) || 0);
                                      if (v !== Number(mod.licenseCount)) saveLicenseModule(mod.id, { licenseCount: v });
                                    }}
                                    className="w-20 px-2 py-1 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                                  />
                                </label>
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => saveLicenseModule(mod.id, { enabled: mod.enabled === false })}
                                  className="px-3 py-1 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                                >
                                  {mod.enabled === false ? 'Enable entitlement' : 'Disable entitlement'}
                                </button>
                                <span className={`font-bold ${mod.enabled === false ? 'text-slate-500' : 'text-emerald-700'}`}>
                                  ● {mod.enabled === false ? 'Disabled' : `${licenseTier} · Active`}
                                </span>
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

      {editor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 text-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                {editor.isNew ? 'Add' : 'Edit'} {editor.kind === 'brand' ? 'Brand' : 'Branch'}
              </h3>
              <button type="button" onClick={() => setEditor(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">{editor.kind === 'brand' ? 'Brand Name' : 'Branch Name'}</label>
                <input
                  type="text"
                  value={editor.item.name}
                  onChange={(e) => setEditor({ ...editor, item: { ...editor.item, name: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
              {editor.kind === 'branch' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Address</label>
                  <input
                    type="text"
                    value={editor.item.address}
                    onChange={(e) => setEditor({ ...editor, item: { ...editor.item, address: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Status</label>
                <select
                  value={editor.item.status}
                  onChange={(e) => setEditor({ ...editor, item: { ...editor.item, status: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setEditor(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleEditorSave}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {peopleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 text-xs max-h-[85vh] flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{peopleModal === 'erp' ? 'ERP Users' : 'Team Members'}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddForm({ kind: peopleModal === 'erp' ? 'erp_user' : 'team_member', name: '', email: '', phone: '', role: peopleModal === 'erp' ? 'Accountant' : 'Driver', status: 'Active' })}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{peopleModal === 'erp' ? 'Add User' : 'Add Team Member'}</span>
                </button>
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
                  {(peopleModal === 'erp' ? erpUsers : teamMembers).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 px-3 text-center text-slate-500">
                        {peopleModal === 'erp' ? 'No ERP users are linked to this tenant yet.' : 'No team members found for this tenant.'}
                      </td>
                    </tr>
                  )}
                  {(peopleModal === 'erp' ? erpUsers : teamMembers).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.role}</td>
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

      {addForm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 text-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Add User / Team Member</h3>
              <button type="button" onClick={() => setAddForm(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Type</label>
                <select
                  value={addForm.kind}
                  onChange={(e) => setAddForm({ ...addForm, kind: e.target.value as 'erp_user' | 'team_member' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="erp_user">ERP User (system login)</option>
                  <option value="team_member">Team Member (HR staff)</option>
                </select>
              </div>
              {[
                ['Full Name', 'name'],
                [addForm.kind === 'erp_user' ? 'Email (required)' : 'Email', 'email'],
                ['Phone', 'phone']
              ].map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <label className="font-semibold text-slate-600">{label}</label>
                  <input
                    type="text"
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Status</label>
                  <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setAddForm(null)} className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                Cancel
              </button>
              <button type="button" disabled={isAddingPerson} onClick={handleAddPerson} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold cursor-pointer">
                {isAddingPerson ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LicenseActivationCertificateModal isOpen={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} />
    </div>
  );
}
