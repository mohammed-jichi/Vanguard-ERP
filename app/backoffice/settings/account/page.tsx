'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  User,
  Building2,
  Users,
  Shield,
  ChevronRight,
  Mail,
  Phone,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Laptop,
  Smartphone
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { currentTenant } = useTenant();
  const { language, dir, setLanguage, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  const [fullName, setFullName] = useState('Jichi Mohammed');
  const [email, setEmail] = useState('mohammed@vanguard-erp.com');
  const [phone, setPhone] = useState('+961 70 892 110');
  const [jobTitle, setJobTitle] = useState('General Operations Manager');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [profileToast, setProfileToast] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileToast('Personal profile information updated successfully!');
    setTimeout(() => setProfileToast(null), 3500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordToast('Passwords do not match. Please verify.');
      return;
    }
    setPasswordToast('Security credentials updated. Re-authentication token refreshed.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordToast(null), 3500);
  };

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {language === 'ar' ? 'الرئيسية' : 'Workspace'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{language === 'ar' ? 'الإعدادات العامة' : 'Settings'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{language === 'ar' ? 'حسابي الشخصي' : 'My Account'}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center shadow-xs">
            M
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                {jobTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar'
                ? 'إدارة بيانات الحساب الشخصي، كلمة المرور، ولغة واجهة الاستخدام'
                : 'Manage profile credentials, system language preference, and active sessions.'}
            </p>
          </div>
        </div>

        {/* Quick Tabs Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/${orgId}/settings/organization`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المنشأة' : 'Organization'}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/users`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المستخدمين' : 'Users'}</span>
          </Link>
          <Link
            href={`/${orgId}/settings/roles`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الصلاحيات' : 'Roles'}</span>
          </Link>
        </div>
      </div>

      {profileToast && (
        <div className="p-4 rounded-2xl border bg-emerald-50 text-emerald-900 border-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{profileToast}</span>
        </div>
      )}

      {/* Main Grid: Profile Settings + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>{language === 'ar' ? 'البيانات الشخصية وتفضيلات الحساب' : 'Personal Information & Language'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'البريد الإلكتروني المهني' : 'Work Email *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Language Preference Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span>{language === 'ar' ? 'لغة واجهة النظام المفضلة' : 'Preferred System Language'}</span>
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    language === 'en'
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-base">🇺🇸</span>
                  <span>English (LTR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    language === 'ar'
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-base">🇱🇧</span>
                  <span>العربية (RTL)</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'ar' ? 'حفظ البيانات الشخصية' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{language === 'ar' ? 'تحديث كلمة المرور والأمان' : 'Security & Password Update'}</span>
            </h2>

            {passwordToast && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold">
                {passwordToast}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Update Credentials</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Sessions & Activity */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Active Authentication Sessions</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-primary" />
                    <span>Chrome on Windows 11</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    CURRENT
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-mono">IP: 185.190.142.20 • Beirut, Lebanon</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Vanguard Field App (iOS)</span>
                  </span>
                  <span className="text-[10.5px] font-mono text-slate-400">
                    2 hours ago
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-mono">Production Mill Floor Workstation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
