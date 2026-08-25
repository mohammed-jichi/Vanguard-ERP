'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/lib/TenantContext';
import {
  Settings,
  Building,
  Image as ImageIcon,
  FileText,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Upload,
  Link as LinkIcon
} from 'lucide-react';

interface TenantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantSettingsModal({ isOpen, onClose }: TenantSettingsModalProps) {
  const { currentTenant, updateTenantSettings } = useTenant();

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
        text: 'تم حفظ البيانات القانونية والشعار والهوية التجارية للمؤسسة بنجاح!'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'حدث خطأ أثناء حفظ البيانات'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans dir-rtl">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden space-y-0">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                إعدادات هوية المؤسسة والبيانات القانونية
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                  Tenant Profile
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                تعديل الاسم الشعار الرسمي وتضمين رقم السجل التجاري والرقم المالي للشركة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
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
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Building className="w-4 h-4 text-amber-600" /> 1. الاسم التجاري والشعار الرسمي (Logo & Branding)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">اسم الشركة / المؤسسة (بالعربي)</label>
                <input
                  type="text"
                  required
                  value={brandNameAr}
                  onChange={e => {
                    setBrandNameAr(e.target.value);
                    setCompanyName(e.target.value);
                  }}
                  placeholder="مثال: منتوجات زيت وزيتون الجنوب ش.م.م"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Enterprise Brand Name (English)</label>
                <input
                  type="text"
                  required
                  value={brandNameEn}
                  onChange={e => setBrandNameEn(e.target.value)}
                  placeholder="e.g. Southern Olive & Oil Products SARL"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* EXTERNAL LOGO URL INPUT & PREVIEW */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>رابط الشعار الخارجي (External Logo Image URL)</span>
                <span className="text-[10px] text-gray-400">يدعم روابط HTTP / HTTPS والصور المباشرة</span>
              </label>

              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/company-logo.png"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none ltr text-left"
                  />
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>

                {/* LIVE LOGO PREVIEW BOX */}
                <div className="w-12 h-12 bg-slate-900 border-2 border-amber-500 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Company Logo Preview"
                      className="w-full h-full object-cover rounded-xl"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LEGAL REGISTRATION NUMBERS FOR INVOICING */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. البيانات القانونية والترخيص (Legal Registration Numbers)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">رقم السجل التجاري (Commercial Reg No.)</label>
                <input
                  type="text"
                  value={companyRegistrationNumber}
                  onChange={e => setCompanyRegistrationNumber(e.target.value)}
                  placeholder="مثال: CR-104928-LB"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400">يتم ختمه تلقائياً على كافة الفواتير الصادرة</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">الرقم المالي MOF (Tax ID Number)</label>
                <input
                  type="text"
                  value={taxIdentificationNumber}
                  onChange={e => setTaxIdentificationNumber(e.target.value)}
                  placeholder="مثال: MOF-7489201"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400">خاص بإغلاق ضريبة TVA والإقرارات المالية</p>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات الهيكلية'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
