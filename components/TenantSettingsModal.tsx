'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Settings,
  Building,
  Image as ImageIcon,
  Camera,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';

interface TenantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantSettingsModal({ isOpen, onClose }: TenantSettingsModalProps) {
  const { currentTenant, updateTenantSettings } = useTenant();
  const { language, dir, t } = useLanguage();

  const [companyName, setCompanyName] = useState<string>('');
  const [brandNameAr, setBrandNameAr] = useState<string>('');
  const [brandNameEn, setBrandNameEn] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState<string>('');
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState<string>('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentTenant) {
      setCompanyName(currentTenant.name || '');
      setBrandNameAr(currentTenant.brandNameAr || currentTenant.name || '');
      setBrandNameEn(currentTenant.brandNameEn || currentTenant.name || '');
      setLogoUrl(currentTenant.logoUrl || '');
      setCompanyRegistrationNumber(currentTenant.companyRegistrationNumber || '');
      setTaxIdentificationNumber(currentTenant.taxIdentificationNumber || '');
    }
  }, [currentTenant, isOpen]);

  if (!isOpen) return null;

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const result = await updateTenantSettings({
      name: companyName,
      brandNameAr: brandNameAr || companyName,
      brandNameEn: brandNameEn || companyName,
      logoUrl: logoUrl,
      companyRegistrationNumber: companyRegistrationNumber,
      taxIdentificationNumber: taxIdentificationNumber
    });

    setIsSaving(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: t('settings_saved_success', 'Legal details, logo, and brand identity saved successfully!')
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || t('settings_save_error', 'An error occurred while saving settings.')
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans ${dir === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden space-y-0">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>{t('tenant_profile_title', 'Company Identity & Legal Settings')}</span>
                <span className="bg-blue-600/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                  Tenant Profile
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('tenant_profile_subtitle', 'Edit official name, logo, commercial registration, and tax ID.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* SECTION 1: BRAND IDENTITY & LOGO */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" /> {t('brand_identity', '1. Brand Identity & Official Logo')}
            </h4>

            {/* DIRECT CLICK TO ADD PICTURE LOGO DROPZONE */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
              <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-white hover:bg-blue-50/50 transition-all text-slate-500 hover:text-blue-600 relative overflow-hidden group shrink-0 shadow-2xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
                {logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Company Logo Preview"
                      className="w-full h-full object-contain p-1.5 rounded-xl"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <Camera className="w-7 h-7 text-slate-400 group-hover:text-blue-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600">{t('add_picture', 'Add Picture')}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{t('click_to_upload', 'Click to upload photo')}</span>
                  </div>
                )}
              </label>

              <div className="space-y-2 flex-1 w-full">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('logo_url', 'External Logo Image URL')}
                </label>
                <div className="relative w-full">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/company-logo.png"
                    style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-left ltr"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500">
                  {t('logo_help_text', 'Click the box above to upload a photo from your computer, or enter a direct image URL.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">{t('company_name_ar', 'Company Name (Arabic)')}</label>
                <input
                  type="text"
                  required
                  value={brandNameAr}
                  onChange={e => {
                    setBrandNameAr(e.target.value);
                    setCompanyName(e.target.value);
                  }}
                  placeholder="e.g. Southern Olive SARL"
                  style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">{t('company_name_en', 'Enterprise Brand Name (English)')}</label>
                <input
                  type="text"
                  required
                  value={brandNameEn}
                  onChange={e => setBrandNameEn(e.target.value)}
                  placeholder="e.g. Southern Olive Oil Products S.A.R.L"
                  style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

          </div>

          {/* SECTION 2: LEGAL REGISTRATION NUMBERS FOR INVOICING */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('legal_registration', '2. Legal Registration Numbers')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">{t('commercial_reg', 'Commercial Registration No. (CR)')}</label>
                <input
                  type="text"
                  value={companyRegistrationNumber}
                  onChange={e => setCompanyRegistrationNumber(e.target.value)}
                  placeholder="e.g. CR-104928-LB"
                  style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500">{t('cr_help_text', 'Printed on official tax receipts & invoices.')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">{t('tax_id', 'Tax Identification Number (MOF)')}</label>
                <input
                  type="text"
                  value={taxIdentificationNumber}
                  onChange={e => setTaxIdentificationNumber(e.target.value)}
                  placeholder="e.g. MOF-7489201"
                  style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500">{t('tax_help_text', 'Required for VAT filings & official reporting.')}</p>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              {t('cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t('saving', 'Saving Changes...') : t('save_changes', 'Save Changes')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
