'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import {
  User,
  Lock,
  ShieldCheck,
  Mail,
  Inbox,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

type TabKey = 'profile' | 'password' | 'security' | 'email_messages' | 'inbox_messages';

export default function MyAccountPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);
  const tenantId = currentTenant?.id || '00000000-0000-0000-0000-000000000001';

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Tab 1: Profile State
  const [firstName, setFirstName] = useState('Mohammed');
  const [lastName, setLastName] = useState('Jichi');
  const [email, setEmail] = useState('mohammed.jichi@gmail.com');
  const [renewalDate, setRenewalDate] = useState('2026-12-02');
  const [landingPage, setLandingPage] = useState('home_page');
  const [role, setRole] = useState('Admin / General Operations Manager');
  const [defaultBrand, setDefaultBrand] = useState('Zeit w zaytoun ljanoub');
  const [defaultAccountingCompany, setDefaultAccountingCompany] = useState('Southern Olive Oil Products S.A.R.L');

  // Tab 2: Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Tab 3: Security State
  const [doNotUseSecurityQuestion, setDoNotUseSecurityQuestion] = useState(true);
  const [securityQuestion, setSecurityQuestion] = useState('What was your childhood nickname?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [receiveEmailAlertOnLogin, setReceiveEmailAlertOnLogin] = useState(false);
  const [enableTwoFactorAuth, setEnableTwoFactorAuth] = useState(false);

  // Tab 4: Email & Messages State (Rich Text)
  const editorRef = useRef<HTMLDivElement>(null);
  const [signatureHtml, setSignatureHtml] = useState(
    '<p><strong>Mohammed Jichi</strong><br>General Operations Manager<br>Southern Olive Oil Products S.A.R.L<br>Email: mohammed.jichi@gmail.com</p>'
  );

  // Tab 5: Inbox Message Settings (Hierarchical Checkbox Tree)
  const [inboxTree, setInboxTree] = useState({
    // Digital Menu Group
    digital_menu_group: true,
    new_omenu_order: true,

    // Operations Center Group
    operations_center_group: true,
    request_to_issue_invoice: true,
    new_product_request: true,
    product_request_approval: true,
    product_request_rejection: true,
    new_inter_brand_requisition: true,
    new_inter_brand_purchase: true,

    // O-Track Group
    otrack_group: true,
    alert_on_void_items: true,
    alert_on_refund: true,
    alert_on_discount: true,
    alert_on_new_table_reservation: true,
    alert_on_receipt_cancellation: true,

    // Reservation Group
    reservation_group: true,
    no_show_reservation: true,
    reservation_stay_period_alert: true,
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial account settings from Supabase
  useEffect(() => {
    async function loadAccountData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/user/account?tenantId=${tenantId}`);
        const result = await res.json();
        if (result.success && result.data) {
          const { profile, security, emailMessages, inboxMessages } = result.data;
          if (profile) {
            setFirstName(profile.firstName || 'Mohammed');
            setLastName(profile.lastName || 'Jichi');
            setEmail(profile.email || 'mohammed.jichi@gmail.com');
            setRenewalDate(profile.renewalDate || '2026-12-02');
            setLandingPage(profile.landingPage || 'home_page');
            setRole(profile.role || 'Admin / General Operations Manager');
            setDefaultBrand(profile.defaultBrand || 'Zeit w zaytoun ljanoub');
            setDefaultAccountingCompany(profile.defaultAccountingCompany || 'Southern Olive Oil Products S.A.R.L');
          }
          if (security) {
            setDoNotUseSecurityQuestion(security.doNotUseSecurityQuestion ?? true);
            setSecurityQuestion(security.securityQuestion || 'What was your childhood nickname?');
            setSecurityAnswer(security.securityAnswer || '');
            setReceiveEmailAlertOnLogin(security.receiveEmailAlertOnLogin ?? false);
            setEnableTwoFactorAuth(security.enableTwoFactorAuth ?? false);
          }
          if (emailMessages?.signatureHtml) {
            setSignatureHtml(emailMessages.signatureHtml);
            if (editorRef.current) {
              editorRef.current.innerHTML = emailMessages.signatureHtml;
            }
          }
          if (inboxMessages) {
            setInboxTree((prev) => ({ ...prev, ...inboxMessages }));
          }
        }
      } catch (err) {
        console.error('Failed to load user account settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccountData();
  }, [tenantId]);

  // Synchronize editor content on tab switch
  useEffect(() => {
    if (activeTab === 'email_messages' && editorRef.current) {
      if (editorRef.current.innerHTML !== signatureHtml) {
        editorRef.current.innerHTML = signatureHtml;
      }
    }
  }, [activeTab, signatureHtml]);

  // Save active tab preferences directly to Supabase via /api/user/account
  const handleSaveActiveTab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setPasswordError(null);

    try {
      let section = 'profile';
      let payload: any = {};

      if (activeTab === 'profile') {
        section = 'profile';
        payload = {
          firstName,
          lastName,
          landingPage,
          defaultBrand,
          defaultAccountingCompany,
        };
      } else if (activeTab === 'password') {
        section = 'password';
        if (!currentPassword) {
          setPasswordError(t('current_password_required', 'Current password is required.'));
          showToast(t('current_password_required', 'Current password is required.'), 'error');
          setIsSaving(false);
          return;
        }

        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!complexityRegex.test(newPassword)) {
          setPasswordError(
            t(
              'password_complexity_error',
              '* Password must have at least 8 characters that includes at least 1 lowercase, 1 uppercase, 1 number and 1 special character (!@#$%^&*)'
            )
          );
          showToast(t('password_complexity_error', 'Password complexity requirements not met.'), 'error');
          setIsSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setPasswordError(t('passwords_must_match', 'Passwords do not match.'));
          showToast(t('passwords_must_match', 'Passwords do not match.'), 'error');
          setIsSaving(false);
          return;
        }

        payload = {
          currentPassword,
          newPassword,
        };
      } else if (activeTab === 'security') {
        section = 'security';
        payload = {
          doNotUseSecurityQuestion,
          securityQuestion,
          securityAnswer,
          receiveEmailAlertOnLogin,
          enableTwoFactorAuth,
        };
      } else if (activeTab === 'email_messages') {
        section = 'email_messages';
        const currentHtml = editorRef.current ? editorRef.current.innerHTML : signatureHtml;
        setSignatureHtml(currentHtml);
        payload = {
          signatureHtml: currentHtml,
        };
      } else if (activeTab === 'inbox_messages') {
        section = 'inbox_messages';
        payload = inboxTree;
      }

      const res = await fetch('/api/user/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, section, payload }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || t('failed_to_save_settings', 'Failed to save settings'));
      }

      showToast(t('saved_successfully', 'Saved successfully!'), 'success');

      if (activeTab === 'password') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Error saving account settings:', err);
      showToast(err.message || t('error_occurred_saving', 'Error occurred while saving'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Rich Text Editor Commands
  const formatDoc = (cmd: string, val: string | undefined = undefined) => {
    if (typeof document !== 'undefined') {
      document.execCommand(cmd, false, val);
      if (editorRef.current) {
        setSignatureHtml(editorRef.current.innerHTML);
      }
    }
  };

  // Hierarchical Checkbox Tree Handlers
  const handleParentToggle = (parentKey: keyof typeof inboxTree, childKeys: (keyof typeof inboxTree)[]) => {
    const nextVal = !inboxTree[parentKey];
    setInboxTree((prev) => {
      const updated = { ...prev, [parentKey]: nextVal };
      childKeys.forEach((k) => {
        updated[k] = nextVal;
      });
      return updated;
    });
  };

  const handleChildToggle = (childKey: keyof typeof inboxTree, parentKey: keyof typeof inboxTree, siblingKeys: (keyof typeof inboxTree)[]) => {
    const nextChildVal = !inboxTree[childKey];
    setInboxTree((prev) => {
      const updated = { ...prev, [childKey]: nextChildVal };
      const allSiblings = [childKey, ...siblingKeys];
      const hasAnyChecked = allSiblings.some((k) => (k === childKey ? nextChildVal : prev[k]));
      updated[parentKey] = hasAnyChecked;
      return updated;
    });
  };

  // Child keys arrays for each group
  const operationsChildren: (keyof typeof inboxTree)[] = [
    'request_to_issue_invoice',
    'new_product_request',
    'product_request_approval',
    'product_request_rejection',
    'new_inter_brand_requisition',
    'new_inter_brand_purchase',
  ];

  const otrackChildren: (keyof typeof inboxTree)[] = [
    'alert_on_void_items',
    'alert_on_refund',
    'alert_on_discount',
    'alert_on_new_table_reservation',
    'alert_on_receipt_cancellation',
  ];

  const reservationChildren: (keyof typeof inboxTree)[] = ['no_show_reservation', 'reservation_stay_period_alert'];

  return (
    <div dir={dir} className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 end-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ms-3 text-white/80 hover:text-white cursor-pointer font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation: Home / Account */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
          {t('home', 'Home')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-primary font-bold">{t('account', 'Account')}</span>
      </div>

      {/* Header Banner: Clean Typography & Identification */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
            {firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('my_account_title', 'My Account')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                {role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-mono font-bold">
                {email}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('my_account_subtitle', 'Manage your personal profile, security credentials, email signature, and inbox routing preferences.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          title={t('refresh_database_records', 'Refresh database records')}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* 5 Main Navigation Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('tab_profile', 'Profile')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{t('tab_change_password', 'Change Password')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('tab_account_security', 'Account Security')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email_messages')}
          className={`flex-1 min-w-[150px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'email_messages'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{t('tab_email_messages_settings', 'Email & Messages Settings')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inbox_messages')}
          className={`flex-1 min-w-[150px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inbox_messages'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>{t('tab_inbox_message_settings', 'Inbox Message Settings')}</span>
        </button>
      </div>

      {/* Main Tab Panel Content */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* ===================================================================
            TAB 1: PROFILE DETAILS
            =================================================================== */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveActiveTab} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('first_name', 'First Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('last_name', 'Last Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('email', 'Email')}
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>

              {/* Renewal Date (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('renewal_date', 'Renewal Date')}
                </label>
                <input
                  type="text"
                  value={renewalDate}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed select-none font-mono"
                />
              </div>

              {/* Landing Page After Login */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('landing_page_after_login', 'Landing Page After Login')}
                </label>
                <select
                  value={landingPage}
                  onChange={(e) => setLandingPage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="home_page">{t('home_page', 'Home page')}</option>
                  <option value="sales_control">{t('sales_control', '1. Sales Control')}</option>
                  <option value="sales_control_dashboard">{t('sales_control_dashboard', 'Sales Control Dashboard')}</option>
                  <option value="operations_center">{t('operations_center', '2. Operations Center')}</option>
                  <option value="operations_center_dashboard">{t('operations_center_dashboard', 'Operations Center Dashboard')}</option>
                  <option value="customer_management">{t('customer_management', '3. Customer Management')}</option>
                  <option value="accounting">{t('accounting_finance', '4. Accounting & Financials')}</option>
                  <option value="accounting_dashboard">{t('accounting_dashboard', 'Accounting Dashboard')}</option>
                  <option value="human_resources">{t('human_resources', 'Human Resources')}</option>
                  <option value="supersonic_fleet_management">{t('supersonic_fleet_management', 'Supersonic Fleet Management')}</option>
                  <option value="pressing_mill_engine">{t('pressing_mill_engine', 'Pressing Mill Engine')}</option>
                </select>
              </div>

              {/* Role (Read-only Badge/Input) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('role', 'Role')}
                </label>
                <input
                  type="text"
                  value={role}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>

              {/* Default Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('default_brand', 'Default Brand')}
                </label>
                <select
                  value={defaultBrand}
                  onChange={(e) => setDefaultBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Zeit w zaytoun ljanoub">{t('brand_zeit_w_zaytoun', 'Zeit w zaytoun ljanoub')}</option>
                  <option value="Southern Olive Pressing Mill">{t('brand_southern_olive', 'Southern Olive Pressing Mill')}</option>
                  <option value="Vanguard Distribution Hub">{t('brand_vanguard_hub', 'Vanguard Distribution Hub')}</option>
                </select>
              </div>

              {/* Default Accounting Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('default_accounting_company', 'Default Accounting Company')}
                </label>
                <select
                  value={defaultAccountingCompany}
                  onChange={(e) => setDefaultAccountingCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Southern Olive Oil Products S.A.R.L">{t('company_southern_olive', 'Southern Olive Oil Products S.A.R.L')}</option>
                  <option value="Vanguard Trading International">{t('company_vanguard_trading', 'Vanguard Trading International')}</option>
                </select>
              </div>
            </div>

            {/* Bottom Right Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            TAB 2: CHANGE PASSWORD
            =================================================================== */}
        {activeTab === 'password' && (
          <form onSubmit={handleSaveActiveTab} className="space-y-6 max-w-xl">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('current_password', 'Current Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pe-10 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('new_password', 'New Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pe-10 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Complexity Display in Red */}
              <p className="text-[11px] text-red-600 font-semibold leading-relaxed pt-1">
                {t(
                  'password_complexity_error',
                  '* Password must have at least 8 characters that includes at least 1 lowercase, 1 uppercase, 1 number and 1 special character (!@#$%^&*)'
                )}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('confirm_password', 'Confirm Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pe-10 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Bottom Right Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            TAB 3: ACCOUNT SECURITY (LOGIN CONTROLS)
            =================================================================== */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveActiveTab} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              {/* Option 1: Do not Use Security Question */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doNotUseSecurityQuestion}
                    onChange={(e) => setDoNotUseSecurityQuestion(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {t('do_not_use_security_question', 'Do not Use Security Question')}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {t('do_not_use_security_question_desc', 'Suppresses security question challenge prompts upon sign-in')}
                    </span>
                  </div>
                </label>

                {/* Sub-inputs if user unchecks "Do not use" */}
                {!doNotUseSecurityQuestion && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 ps-7 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {t('security_question', 'Security Question')}
                      </label>
                      <select
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="What was your childhood nickname?">{t('sec_q_nickname', 'What was your childhood nickname?')}</option>
                        <option value="What is the name of your favorite pet?">{t('sec_q_pet', 'What is the name of your favorite pet?')}</option>
                        <option value="What was the make of your first car?">{t('sec_q_car', 'What was the make of your first car?')}</option>
                        <option value="What city were you born in?">{t('sec_q_city', 'What city were you born in?')}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {t('security_answer', 'Security Answer')}
                      </label>
                      <input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder={t('enter_answer_placeholder', 'Enter answer...')}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Receive Email Alert on Login */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={receiveEmailAlertOnLogin}
                    onChange={(e) => setReceiveEmailAlertOnLogin(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {t('receive_email_alert_on_login', 'Receive Email Alert on Login')}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {t('receive_email_alert_desc', 'Sends an automated notification email upon every new session login')}
                    </span>
                  </div>
                </label>
              </div>

              {/* Option 3: Enable Two-Factor Authentication (2FA) */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTwoFactorAuth}
                    onChange={(e) => setEnableTwoFactorAuth(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {t('enable_two_factor_auth', 'Enable Two-Factor Authentication (2FA)')}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {t('enable_two_factor_desc', 'Enforces dual-verification step via OTP/Authenticator upon login')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Right Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            TAB 4: EMAIL & MESSAGES SETTINGS (RICH TEXT EDITOR)
            =================================================================== */}
        {activeTab === 'email_messages' && (
          <form onSubmit={handleSaveActiveTab} className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t('email_signature_title', 'Outgoing Email Signature & Message Template')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'email_signature_desc',
                  'Customize the rich-text signature automatically appended to outgoing customer quotes, invoices, and system communications.'
                )}
              </p>
            </div>

            {/* Rich Text Editor Container */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              {/* Top Formatting Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
                {/* History Actions: Undo / Redo */}
                <button
                  type="button"
                  onClick={() => formatDoc('undo')}
                  title={t('undo', 'Undo')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('redo')}
                  title={t('redo', 'Redo')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Formats Dropdown with Headings, Inline, Blocks, and Alignment */}
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'div'].includes(val)) {
                      formatDoc('formatBlock', `<${val}>`);
                    } else if (['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript'].includes(val)) {
                      formatDoc(val);
                    } else if (val === 'code') {
                      formatDoc('formatBlock', '<pre>');
                    } else if (['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(val)) {
                      formatDoc(val);
                    }
                    e.target.value = '';
                  }}
                  className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700 cursor-pointer focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>{t('formats', 'Formats')}</option>
                  <optgroup label={t('headings', 'Headings')}>
                    <option value="h1">{t('heading_1', 'Heading 1')}</option>
                    <option value="h2">{t('heading_2', 'Heading 2')}</option>
                    <option value="h3">{t('heading_3', 'Heading 3')}</option>
                    <option value="h4">{t('heading_4', 'Heading 4')}</option>
                    <option value="h5">{t('heading_5', 'Heading 5')}</option>
                    <option value="h6">{t('heading_6', 'Heading 6')}</option>
                  </optgroup>
                  <optgroup label={t('inline_styles', 'Inline')}>
                    <option value="bold">{t('bold', 'Bold')}</option>
                    <option value="italic">{t('italic', 'Italic')}</option>
                    <option value="underline">{t('underline', 'Underline')}</option>
                    <option value="strikeThrough">{t('strikethrough', 'Strikethrough')}</option>
                    <option value="superscript">{t('superscript', 'Superscript')}</option>
                    <option value="subscript">{t('subscript', 'Subscript')}</option>
                    <option value="code">{t('code', 'Code')}</option>
                  </optgroup>
                  <optgroup label={t('blocks', 'Blocks')}>
                    <option value="p">{t('paragraph', 'Paragraph')}</option>
                    <option value="blockquote">{t('blockquote', 'Blockquote')}</option>
                    <option value="div">{t('div', 'Div')}</option>
                    <option value="pre">{t('pre', 'Pre')}</option>
                  </optgroup>
                  <optgroup label={t('alignment', 'Alignment')}>
                    <option value="justifyLeft">{t('align_left', 'Align Left')}</option>
                    <option value="justifyCenter">{t('align_center', 'Align Center')}</option>
                    <option value="justifyRight">{t('align_right', 'Align Right')}</option>
                    <option value="justifyFull">{t('align_justify', 'Justify')}</option>
                  </optgroup>
                </select>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Inline Buttons */}
                <button
                  type="button"
                  onClick={() => formatDoc('bold')}
                  title={t('bold', 'Bold')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  <BoldIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('italic')}
                  title={t('italic', 'Italic')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 italic cursor-pointer"
                >
                  <ItalicIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('underline')}
                  title={t('underline', 'Underline')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 underline cursor-pointer"
                >
                  <UnderlineIcon className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Alignments */}
                <button
                  type="button"
                  onClick={() => formatDoc('justifyLeft')}
                  title={t('align_left', 'Align Left')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('justifyCenter')}
                  title={t('align_center', 'Align Center')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('justifyRight')}
                  title={t('align_right', 'Align Right')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('justifyFull')}
                  title={t('align_justify', 'Justify')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Lists & Indentation */}
                <button
                  type="button"
                  onClick={() => formatDoc('insertUnorderedList')}
                  title={t('bullet_list', 'Bullet List')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('insertOrderedList')}
                  title={t('numbered_list', 'Numbered List')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('outdent')}
                  title={t('decrease_indent', 'Decrease Indent')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <Outdent className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatDoc('indent')}
                  title={t('increase_indent', 'Increase Indent')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <Indent className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editable Body */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={() => {
                  if (editorRef.current) {
                    setSignatureHtml(editorRef.current.innerHTML);
                  }
                }}
                className="p-4 min-h-[220px] focus:outline-none text-xs text-slate-800 leading-relaxed font-sans"
              />
            </div>

            {/* Bottom Right Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            TAB 5: INBOX MESSAGE SETTINGS (HIERARCHICAL CHECKBOX TREE)
            =================================================================== */}
        {activeTab === 'inbox_messages' && (
          <form onSubmit={handleSaveActiveTab} className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t('tab_inbox_message_settings', 'Inbox Message Settings')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'inbox_message_settings_desc',
                  'Select which operational events and audit notifications dispatch directly to your inbox and alert feed.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group 1: Digital Menu */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer pb-2 border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={inboxTree.digital_menu_group}
                    onChange={() => handleParentToggle('digital_menu_group', ['new_omenu_order'])}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-900">
                    {t('digital_menu_group', 'Digital Menu')}
                  </span>
                </label>
                <div className="ps-6 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inboxTree.new_omenu_order}
                      onChange={() => handleChildToggle('new_omenu_order', 'digital_menu_group', [])}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {t('new_omenu_order', 'New O-menu Order')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Group 2: Operations Center */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer pb-2 border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={inboxTree.operations_center_group}
                    onChange={() => handleParentToggle('operations_center_group', operationsChildren)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-900">
                    {t('operations_center_group', 'Operations Center')}
                  </span>
                </label>
                <div className="ps-6 space-y-2">
                  {operationsChildren.map((itemKey) => (
                    <label key={itemKey} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inboxTree[itemKey]}
                        onChange={() =>
                          handleChildToggle(
                            itemKey,
                            'operations_center_group',
                            operationsChildren.filter((k) => k !== itemKey)
                          )
                        }
                        className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {t(itemKey, itemKey.replace(/_/g, ' '))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group 3: O-Track / Audits */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer pb-2 border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={inboxTree.otrack_group}
                    onChange={() => handleParentToggle('otrack_group', otrackChildren)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-900">
                    {t('otrack_group', 'O Track')}
                  </span>
                </label>
                <div className="ps-6 space-y-2">
                  {otrackChildren.map((itemKey) => (
                    <label key={itemKey} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inboxTree[itemKey]}
                        onChange={() =>
                          handleChildToggle(
                            itemKey,
                            'otrack_group',
                            otrackChildren.filter((k) => k !== itemKey)
                          )
                        }
                        className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {t(itemKey, itemKey.replace(/_/g, ' '))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group 4: Reservation */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer pb-2 border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={inboxTree.reservation_group}
                    onChange={() => handleParentToggle('reservation_group', reservationChildren)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-900">
                    {t('reservation_group', 'Reservation')}
                  </span>
                </label>
                <div className="ps-6 space-y-2">
                  {reservationChildren.map((itemKey) => (
                    <label key={itemKey} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inboxTree[itemKey]}
                        onChange={() =>
                          handleChildToggle(
                            itemKey,
                            'reservation_group',
                            reservationChildren.filter((k) => k !== itemKey)
                          )
                        }
                        className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {t(itemKey, itemKey.replace(/_/g, ' '))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Right Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('saving', 'Saving...') : t('save', 'Save')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
