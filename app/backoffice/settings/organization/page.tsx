'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  Globe,
  Award,
  FileText,
  Key,
  Copy,
  Users,
  Shield,
  User,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import LicenseActivationCertificateModal from '@/components/LicenseActivationCertificateModal';

export default function OrganizationSettingsPage() {
  const { currentTenant, updateTenantSettings } = useTenant();
  const { language, dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  const [companyName, setCompanyName] = useState('');
  const [brandNameAr, setBrandNameAr] = useState('');
  const [brandNameEn, setBrandNameEn] = useState('');
  const [crn, setCrn] = useState('');
  const [tin, setTin] = useState('');
  const [address, setAddress] = useState('Choueifat Industrial District, Mount Lebanon');
  const [phone, setPhone] = useState('+961 5 430 890');
  const [email, setEmail] = useState('operations@southernolive-lb.com');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      setCompanyName(currentTenant.name || 'Southern Olive Oil Products S.A.R.L');
      setBrandNameAr(currentTenant.brandNameAr || 'شركة منتجات زيتون الجنوب ذ.م.م');
      setBrandNameEn(currentTenant.brandNameEn || 'Southern Olive Oil Products S.A.R.L');
      setCrn(currentTenant.companyRegistrationNumber || 'CR-2018-98442');
      setTin(currentTenant.taxIdentificationNumber || 'TIN-401928-88');
    }
  }, [currentTenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await updateTenantSettings({
        name: companyName,
        brandNameAr,
        brandNameEn,
        companyRegistrationNumber: crn,
        taxIdentificationNumber: tin
      });
      setStatusMsg({
        type: 'success',
        text: t('org_profile_updated', 'Organization profile updated successfully!')
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('VANGUARD-PERPETUAL-SO-OLIVE-2026-988421');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-xl shadow-xs">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('organization_enterprise_settings', 'Organization & Enterprise Settings')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                #{orgId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('org_settings_desc', 'Configure legal entity identity, tax parameters, headquarters & perpetual software licensing.')}
            </p>
          </div>
        </div>

        {/* Quick Tabs Links */}
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

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{t('corporate_legal_profile', 'Corporate & Legal Profile')}</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('registered_legal_name', 'Registered Legal Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('arabic_brand_name', 'Arabic Brand Name')}
                  </label>
                  <input
                    type="text"
                    value={brandNameAr}
                    onChange={(e) => setBrandNameAr(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('english_brand_name', 'English Brand Name')}
                  </label>
                  <input
                    type="text"
                    value={brandNameEn}
                    onChange={(e) => setBrandNameEn(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('crn', 'Commercial Registration No (CRN)')}
                  </label>
                  <input
                    type="text"
                    value={crn}
                    onChange={(e) => setCrn(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('tin', 'Tax Identification Number (TIN)')}
                  </label>
                  <input
                    type="text"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('hq_address', 'HQ Address')}</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('telephone', 'Telephone')}</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('official_email', 'Official Email')}</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving_changes', 'Saving Changes...') : t('save_organization_details', 'Save Organization Details')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Software License & Perpetual Activation */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                OFFICIAL LICENSE
              </span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                Vanguard Perpetual Tier
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authorized for Southern Olive Oil Products S.A.R.L
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">License Number:</span>
                <span className="font-mono font-bold text-amber-400">VG-9842-SARL-2026</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Max Terminals:</span>
                <span className="font-mono font-bold text-white">Unlimited (Enterprise)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Pressing Mill Lines:</span>
                <span className="font-mono font-bold text-white">Lines 1 - 4 Unlocked</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>{t('view_certificate_authenticity', 'View Certificate of Authenticity')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyKey}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? t('copied_clipboard', 'Copied to Clipboard!') : t('copy_license_key', 'Copy License Key')}</span>
              </button>
            </div>
          </div>

          {/* Quick Operations Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              {t('active_branches_facilities', 'Active Branches & Facilities')}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Choueifat Central Plant</div>
                  <div className="text-[10px] text-slate-500">Olive Pressing & Bottling</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ONLINE
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Beirut Corporate Hub</div>
                  <div className="text-[10px] text-slate-500">Wholesale & Export Sales</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      <LicenseActivationCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}
