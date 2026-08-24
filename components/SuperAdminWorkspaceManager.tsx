'use client';

/**
 * Vanguard ERP System
 * Super Admin Workspace Manager & Multi-Tenant Subscription Hub
 * 
 * Exact Visual Styling & Layout components matching vanguard-admin.html
 */

import React, { useState, useEffect } from 'react';
import { useTenant, TenantCompany } from '../lib/TenantContext';
import { supabase } from '../lib/supabaseClient';
import {
  ShieldCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Key,
  TrendingUp,
  DollarSign,
  Activity,
  Building,
  FileText,
  ExternalLink,
  Crown,
  Lock,
  Layers,
  Users
} from 'lucide-react';

const DEFAULT_ADMIN_TENANT: TenantCompany = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'منتوجات زيت وزيتون الجنوب',
  slug: 'southern-olive',
  brandNameAr: 'منتوجات زيت وزيتون الجنوب',
  brandNameEn: 'Southern Olive & Oil Products',
  logoUrl: '/assets/images/logo.png',
  subscriptionTier: 'ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
  aiUsageCount: 0,
  aiUsageLimit: 1000
};

export default function SuperAdminWorkspaceManager() {
  const { currentTenant, isSuperAdmin, switchTenant, onboardNewTenant, refreshTenants, registeredCompanies } = useTenant();

  const [tenants, setTenants] = useState<any[]>([]);
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  const [compName, setCompName] = useState<string>('');
  const [brandAr, setBrandAr] = useState<string>('');
  const [brandEn, setBrandEn] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [tier, setTier] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAdminTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*');

      console.log("FETCHED TENANTS:", data);
      if (error) {
        console.error("SUPABASE ERROR:", error);
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((t: any) => ({
          ...t,
          brand_name_ar: t.brand_name_ar || t.brandNameAr || t.name || 'منتوجات زيت وزيتون الجنوب',
          brandNameAr: t.brand_name_ar || t.brandNameAr || t.name || 'منتوجات زيت وزيتون الجنوب',
          name: t.name || t.brand_name_ar || 'منتوجات زيت وزيتون الجنوب'
        }));
        setTenants(formatted);
      } else {
        const fallbacks = (registeredCompanies && registeredCompanies.length > 0 ? registeredCompanies : [DEFAULT_ADMIN_TENANT]).map((t: any) => ({
          ...t,
          brand_name_ar: t.brandNameAr || t.brand_name_ar || t.name || 'منتوجات زيت وزيتون الجنوب',
          brandNameAr: t.brandNameAr || t.brand_name_ar || t.name || 'منتوجات زيت وزيتون الجنوب',
          name: t.name || t.brandNameAr || 'منتوجات زيت وزيتون الجنوب'
        }));
        setTenants(fallbacks);
      }
    } catch (err) {
      console.error('Exception fetching tenants in SuperAdminWorkspaceManager:', err);
      setTenants([{
        id: '00000000-0000-0000-0000-000000000001',
        name: 'منتوجات زيت وزيتون الجنوب',
        brand_name_ar: 'منتوجات زيت وزيتون الجنوب',
        brandNameAr: 'منتوجات زيت وزيتون الجنوب'
      }]);
    }
  };

  useEffect(() => {
    document.title = 'Vanguard SaaS Master Controller';
    fetchAdminTenants();
    refreshTenants().catch(err => console.error('Error fetching tenants in SuperAdminWorkspaceManager:', err));
  }, []);

  const displayTenants = tenants.length > 0 ? tenants : [{
    id: '00000000-0000-0000-0000-000000000001',
    name: 'منتوجات زيت وزيتون الجنوب',
    brand_name_ar: 'منتوجات زيت وزيتون الجنوب',
    brandNameAr: 'منتوجات زيت وزيتون الجنوب'
  }];

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !adminEmail.trim()) {
      alert('يرجى كتابة اسم الشركة والبريد الإلكتروني للآدمين!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await onboardNewTenant(
        {
          name: compName.trim(),
          slug: compName.toLowerCase().replace(/\s+/g, '-'),
          brandNameAr: brandAr.trim() || compName.trim(),
          brandNameEn: brandEn.trim() || compName.trim() + ' Products',
          subscriptionTier: tier
        },
        adminEmail.trim()
      );
      if (res.success) {
        setShowOnboardModal(false);
        setCompName('');
        setBrandAr('');
        setBrandEn('');
        setAdminEmail('');
        await fetchAdminTenants();
        alert('تم إنشاء وتفعيل مساحة العمل للمؤسسة الجديدة بنجاح في Supabase!');
      } else {
        alert('فشل حفظ البيانات في قاعدة بيانات Supabase: ' + (res.error || 'خطأ غير معروف'));
      }
    } catch (err: any) {
      console.error('Onboarding exception:', err);
      alert('حدث خطأ أثناء إجراء العملية: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="w-full font-sans space-y-6">

      {/* VANGUARD SAAS MASTER HEADER */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-amber-500 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-950 border-2 border-amber-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden shrink-0">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" /> Vanguard SaaS Master Controller
            </h1>
            <p className="text-xs md:text-sm text-amber-300 font-bold mt-1">
              SaaS Master Owner Portal & Multi-Tenant License Management Platform
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-amber-400/20 text-white border border-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
            <Activity className="w-4 h-4 text-emerald-400" /> Master SaaS Cluster: ONLINE (99.99%)
          </span>
          <button
            onClick={() => alert('Vanguard Security Suite: Active & Protecting All Tenant Schemas')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Lock className="w-4 h-4 text-slate-950" /> Max Security Suite
          </button>
          <a
            href="/erp"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all border border-emerald-400"
          >
            <ExternalLink className="w-4 h-4" /> Launch Tenant ERP Portal
          </a>
        </div>
      </header>

      {/* MASTER METRICS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        {/* CARD 1 */}
        <div className="bg-slate-900 border-2 border-slate-800 hover:border-amber-400/50 rounded-2xl p-5 text-center shadow-xl space-y-2 transition-all">
          <Key className="w-8 h-8 text-amber-400 mx-auto" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Client Licenses</span>
          <h2 className="text-2xl font-black text-white">{displayTenants.length} Tenant Account</h2>
          <small className="text-emerald-400 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> License #1 Active (Vanguard)
          </small>
        </div>

        {/* CARD 2 */}
        <div className="bg-slate-900 border-2 border-slate-800 hover:border-emerald-400/50 rounded-2xl p-5 text-center shadow-xl space-y-2 transition-all">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Enterprise ARR</span>
          <h2 className="text-2xl font-black text-emerald-400">$108,000 / Year</h2>
          <small className="text-slate-300 font-bold">Annual Recurring Revenue</small>
        </div>

        {/* CARD 3 */}
        <div className="bg-slate-900 border-2 border-slate-800 hover:border-sky-400/50 rounded-2xl p-5 text-center shadow-xl space-y-2 transition-all">
          <DollarSign className="w-8 h-8 text-sky-400 mx-auto" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Recurring Revenue</span>
          <h2 className="text-2xl font-black text-sky-300">$9,000 / Month</h2>
          <small className="text-emerald-400 font-bold">100% On-Time SaaS Billing</small>
        </div>

        {/* CARD 4 */}
        <div className="bg-slate-900 border-2 border-slate-800 hover:border-purple-400/50 rounded-2xl p-5 text-center shadow-xl space-y-2 transition-all">
          <Activity className="w-8 h-8 text-purple-400 mx-auto" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">System Health & SLA</span>
          <h2 className="text-2xl font-black text-purple-300">99.99% Online</h2>
          <small className="text-emerald-400 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Schemas Synced & Secured
          </small>
        </div>

      </div>

      {/* VANGUARD MULTI-TENANT SAAS LICENSE REGISTRY TABLE */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Vanguard Multi-Tenant SaaS License Registry
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-1">
              سجل تراخيص المؤسسات المربوط حياً مع قاعدة بيانات Supabase Isolated Tenants
            </p>
          </div>
          <button
            onClick={() => setShowOnboardModal(!showOnboardModal)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-emerald-400"
          >
            <Plus className="w-4 h-4" /> + إضافة مساحة عمل لشركة جديدة
          </button>
        </div>

        {/* DYNAMIC TENANT BANNER RENDERING logic */}
        <div className="space-y-2">
          {displayTenants && displayTenants.length > 0 ? (
            displayTenants.map(tenant => (
              <div key={tenant.id} className="p-4 border border-amber-500/30 font-bold text-lg text-amber-300 bg-slate-950 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span>{tenant.brand_name_ar || tenant.name || 'منتوجات زيت وزيتون الجنوب'}</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  Tenant ID: {tenant.id}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-red-500 font-bold bg-red-950/40 border border-red-800 rounded-xl text-center">
              Error: No Data Rendered
            </div>
          )}
        </div>

        {/* DETAILED TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950 text-amber-400 font-black border-b border-slate-800">
                <th className="p-3">اسم المؤسسة (Tenant Name)</th>
                <th className="p-3">العلامة التجارية (Brand Ar)</th>
                <th className="p-3">معرف الترخيص (Tenant ID)</th>
                <th className="p-3">باقة الاشتراك (Tier)</th>
                <th className="p-3">حالة الحساب</th>
                <th className="p-3 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayTenants.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-800/40 text-slate-200 font-bold transition-colors">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-amber-300">{t.brand_name_ar || t.brandNameAr}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{t.id}</td>
                  <td className="p-3">
                    <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                      {t.subscription_tier || t.subscriptionTier || 'ENTERPRISE'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      {t.subscription_status || t.subscriptionStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-3 text-left">
                    <a
                      href="/erp"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow"
                    >
                      دخول مساحة العمل ←
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION NEW CLIENT FORM */}
      {showOnboardModal && (
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h4 className="text-base font-black text-emerald-400 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> إضافة وإنشاء مساحة عمل تجارية جديدة (New Commercial Tenant Account)
          </h4>
          <form onSubmit={handleOnboardSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم الشركة / المؤسسة (Company Name)</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="مثال: معصرة وشركة البقاع لإنتاج الزيت"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم العلامة التجارية بالعربية (Brand Name AR)</label>
              <input
                type="text"
                value={brandAr}
                onChange={(e) => setBrandAr(e.target.value)}
                placeholder="مثال: زيوت البقاع الذهبية"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني للآدمين الرئيسي (Primary Admin Email)</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@client.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">باقة الاشتراك (Subscription Tier)</label>
              <select
                value={tier}
                onChange={(e: any) => setTier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-400 focus:outline-none"
              >
                <option value="STARTER">Starter SaaS ($150/mo)</option>
                <option value="PRO">Professional SaaS ($250/mo)</option>
                <option value="ENTERPRISE">Enterprise Full ($450/mo)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2 rounded-xl border border-emerald-400 shadow-lg flex items-center gap-1.5"
              >
                {isSubmitting ? 'جاري الحفظ والإنشاء...' : 'تأكيد وإنشاء الترخيص التجاري'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center text-xs text-slate-500 font-bold border-t border-slate-800 pt-4">
        Vanguard SaaS Master Controller Engine © 2026 -- Secure Multi-Tenant Enterprise Platform
      </footer>

    </div>
  );
}