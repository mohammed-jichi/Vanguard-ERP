'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Copy,
  Printer,
  X,
  Lock,
  Sparkles,
  QrCode,
  Building,
  Key,
  Layers,
  FileText,
  Calendar,
  Check
} from 'lucide-react';
import { SOUTHERN_OLIVE_OFFICIAL_LICENSE } from '@/lib/TenantContext';

interface LicenseActivationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LicenseActivationCertificateModal({
  isOpen,
  onClose
}: LicenseActivationCertificateModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const license = SOUTHERN_OLIVE_OFFICIAL_LICENSE;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(license.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* NON-PRINTABLE TOP TOOLBAR */}
        <div className="print:hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-4 px-6 text-white flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{t('vanguard_erp_official_license', 'Vanguard ERP Official License Certificate')}</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  {t('verified_authorized', 'Verified & Authorized')}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {t('official_perpetual_enterprise_license', 'Official perpetual enterprise license authorized for Southern Olive Oil Products S.A.R.L')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title={t('copy_license_key_to_clipboard', 'Copy License Key to Clipboard')}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Key Copied!' : 'Copy License Key'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title={t('print_official_certificate', 'Print Official Certificate')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print_certificate', 'Print Certificate')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('close_modal', 'Close modal')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE CANVAS */}
        <div id="vanguard-license-certificate" className="p-6 sm:p-8 md:p-10 bg-[#faf9f5] text-slate-900 relative overflow-hidden font-serif">
          
          {/* ORNATE CERTIFICATE BORDER */}
          <div className="absolute inset-2 sm:inset-3 border-4 border-double border-amber-600/50 pointer-events-none rounded-2xl" />
          <div className="absolute inset-4 sm:inset-5 border border-amber-700/20 pointer-events-none rounded-xl" />

          {/* WATERMARK BACKGROUND EMBLEM */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <ShieldCheck className="w-[500px] h-[500px] text-amber-900" />
          </div>

          <div className="relative z-10 space-y-6">
            
            {/* CERTIFICATE HEADER */}
            <div className="text-center space-y-2 pb-4 border-b-2 border-amber-600/30">
              <div className="flex items-center justify-center gap-2 text-amber-700 font-sans uppercase tracking-[0.25em] text-xs font-black">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t('vanguard_enterprise_resource_planning', 'Vanguard Enterprise Resource Planning Systems')}</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-serif uppercase">
                {t('certificate_of_software_activation', 'Certificate of Software Activation')}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-xl mx-auto italic">
                {t('this_document_certifies_that_the', 'This document certifies that the commercial enterprise named herein is legally licensed, authenticated, and authorized to operate all modules of the Vanguard ERP Suite with zero feature restrictions.')}
              </p>
            </div>

            {/* AUTHORIZED LICENSEE INFORMATION */}
            <div className="bg-white/80 backdrop-blur-xs border border-amber-500/30 rounded-2xl p-5 shadow-xs font-sans space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wide">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>{t('licensed_enterprise_entity', 'Licensed Enterprise Entity')}</span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-amber-300">
                  {t('perpetual_unlimited_enterprise_license', 'Perpetual Unlimited Enterprise License')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">{t('official_company_name', 'Official Company Name:')}</span>
                  <strong className="text-slate-900 text-sm">{license.authorizedEntity}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Commercial Registration (CR):</span>
                  <strong className="text-slate-800 font-mono">{t('cr104928lb', 'CR-104928-LB')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px]">Tax Identification (MOF):</span>
                  <strong className="text-slate-800 font-mono">{t('mof7489201', 'MOF-7489201')}</strong>
                </div>
              </div>
            </div>

            {/* LICENSE KEY & SECURITY HASH STRIP */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg font-sans border border-amber-500/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> {t('master_enterprise_license_key', 'Master Enterprise License Key')}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Valid & Unlocked
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
                <code className="text-amber-300 font-mono text-xs sm:text-sm font-bold tracking-wider break-all select-all">
                  {license.licenseKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="print:hidden p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                  title={t('copy', 'Copy')}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400 block">{t('certificate_id', 'Certificate ID:')}</span>
                  <strong className="font-mono text-amber-200">{license.certificateId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('license_tier', 'License Tier:')}</span>
                  <strong className="text-white">{t('enterprise_unlimited', 'Enterprise Unlimited')}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('authorized_scale', 'Authorized Scale:')}</span>
                  <strong className="text-white">{t('unlimited_users_devices', 'Unlimited Users & Devices')}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('validity_duration', 'Validity Duration:')}</span>
                  <strong className="text-emerald-400 font-bold">{t('lifetime_perpetual', 'Lifetime Perpetual')}</strong>
                </div>
              </div>
            </div>

            {/* UNLOCKED MODULES MATRIX */}
            <div className="space-y-2 font-sans">
              <div className="flex items-center justify-between border-b border-amber-600/20 pb-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" /> Authorized Systems & Fully Unlocked Modules (18 of 18)
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {t('all_systems_online', 'All Systems Online')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                {[
                  { name: 'Inventory & Warehouse Control', desc: 'Raw Olives & Packaged EVOO' },
                  { name: 'Procurements & Goods Receiving', desc: 'Automated PO & Vendor GRN' },
                  { name: 'Sales & Touch POS Terminal', desc: 'Offline/Online Sync & Shifts' },
                  { name: 'Wastage & Shrinkage Analytics', desc: 'Variance Tracking & Reasons' },
                  { name: 'Financials & General Ledger', desc: 'USD/LBP Ledger & VAT Reports' },
                  { name: 'Oil Pressing & Production Facility', desc: 'Crushing, Extraction & Tanks' },
                  { name: 'SuperSonic Fleet Logistics', desc: 'Live GPS Telemetry & Dispatch' },
                  { name: 'V-Track Cloud & Mobile Tracking', desc: 'Real-time Cross-device Sync' },
                  { name: 'Human Resources & Payroll', desc: 'Personnel Records & Wages' },
                  { name: 'Merits & Customer Loyalty', desc: 'Rewards Engine & Points' },
                  { name: 'Operations Center Reports', desc: 'All 10 Categories Full Access' },
                  { name: 'Product Requisitions & Requests', desc: 'Inter-Branch Orders' },
                  { name: 'Executive BI Analytics', desc: 'Real-Time Revenue Margins' },
                  { name: 'Quotations & Supplier Invoicing', desc: 'Commercial Billing' },
                  { name: 'Inter-Location Stock Dispatches', desc: 'Plant-to-Store Transfers' },
                  { name: 'Maximum Security Suite (RLS)', desc: 'Isolated Database Schemas' },
                  { name: 'AI Assistant & Demand Forecast', desc: 'Olive Harvest Prediction' },
                  { name: 'Unlimited Client Terminals', desc: 'Zero Connection Limits' }
                ].map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white/90 border border-amber-200/80 rounded-xl flex items-start gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] leading-tight">{mod.name}</span>
                      <span className="text-[10px] text-slate-500 leading-tight">{mod.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TRI-SIGNATURE & LEGAL SEAL SECTION */}
            <div className="pt-4 border-t-2 border-amber-600/30 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
              
              {/* VANGUARD SEAL */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-2 border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 flex flex-col items-center justify-center text-amber-900 shadow-md text-center p-1">
                  <Award className="w-5 h-5 text-amber-700" />
                  <span className="text-[7px] font-black uppercase tracking-tighter leading-tight mt-0.5">{t('vanguard_erp', 'Vanguard ERP')}</span>
                  <span className="text-[6px] font-bold text-amber-800">{t('verified_2026', 'Verified 2026')}</span>
                </div>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <strong className="text-slate-800 block font-bold">{t('vanguard_systems_global_licensing', 'Vanguard Systems Global Licensing')}</strong>
                  <span>{t('registry_zurbeyvng2026', 'Registry: ZUR-BEY-VNG-2026')}</span>
                  <span className="block font-mono text-[9px] text-slate-400 truncate max-w-[200px]">
                    {license.digitalSignature}
                  </span>
                </div>
              </div>

              {/* SIGNATURE BLOCKS */}
              <div className="flex items-center gap-6 text-center text-xs">
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 pb-1 font-serif italic text-slate-700">
                    {t('k_m_vanguard', 'K. M. Vanguard')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 block">{t('chief_systems_architect', 'Chief Systems Architect')}</span>
                  <span className="text-[9px] text-slate-400 block">{t('vanguard_software_corp', 'Vanguard Software Corp')}</span>
                </div>

                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 pb-1 font-serif italic text-slate-700">
                    {t('compliance_dir', 'Compliance Dir.')}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 block">{t('licensing_authority', 'Licensing Authority')}</span>
                  <span className="text-[9px] text-slate-400 block">{t('global_operations', 'Global Operations')}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="print:hidden p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium">
            {t('status', 'Status:')} <strong className="text-emerald-700 font-bold">100% Active & Unlocked</strong> {t('for_southern_olive_oil_products_sarl', 'for Southern Olive Oil Products S.A.R.L')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t('print_official_certificate', 'Print Official Certificate')}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              {t('close', 'Close')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
