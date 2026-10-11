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
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

type TabKey = 'profile' | 'password' | 'security' | 'email_messages' | 'inbox_messages';

export default function MyAccountPage() {
  const { currentTenant } = useTenant();
  const { dir, t } = useLanguage();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);
  const tenantId = (currentTenant?.id && currentTenant.id !== '1300' && !String(currentTenant.id).startsWith('comp-'))
    ? currentTenant.id
    : '00000000-0000-0000-0000-000000000001';

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Formats flyout dropdown state
  const [formatsMenuOpen, setFormatsMenuOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<'headings' | 'inline' | 'blocks' | 'alignment' | null>(null);
  const formatsMenuRef = useRef<HTMLDivElement>(null);

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
    // V-Menu Group (Digital Ordering & QR)
    vmenu_group: true,
    new_vmenu_order: true,
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

    // V-Track Group (Live Audit & Fleet Engine)
    vtrack_group: true,
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
            setInboxTree((prev) => ({
              ...prev,
              ...inboxMessages,
              vmenu_group: inboxMessages.vmenu_group ?? inboxMessages.digital_menu_group ?? prev.vmenu_group,
              new_vmenu_order: inboxMessages.new_vmenu_order ?? inboxMessages.new_omenu_order ?? prev.new_vmenu_order,
              vtrack_group: inboxMessages.vtrack_group ?? inboxMessages.otrack_group ?? prev.vtrack_group,
            }));
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

  // Click-outside listener for formats flyout menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formatsMenuRef.current && !formatsMenuRef.current.contains(e.target as Node)) {
        setFormatsMenuOpen(false);
        setActiveFlyout(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Rich Text Editor Commands with CSS and Format Enforcement
  const formatDoc = (cmd: string, val: string | undefined = undefined) => {
    if (typeof document !== 'undefined' && editorRef.current) {
      editorRef.current.focus();

      try {
        document.execCommand('styleWithCSS', false, 'true');
      } catch (e) {}

      if (cmd === 'formatBlock') {
        const tag = val || 'p';
        try {
          document.execCommand('formatBlock', false, `<${tag.replace(/[<>]/g, '')}>`);
        } catch (e) {
          document.execCommand('formatBlock', false, tag.replace(/[<>]/g, ''));
        }
      } else if (['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(cmd)) {
        document.execCommand(cmd, false, val);

        // Explicitly enforce inline style on closest block container so justify & align visibly take effect
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let node: Node | null = selection.anchorNode;
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tagName = el.tagName.toLowerCase();
              if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'pre'].includes(tagName)) {
                if (cmd === 'justifyFull') {
                  el.style.textAlign = 'justify';
                  el.style.textJustify = 'inter-word';
                  el.style.width = '100%';
                } else if (cmd === 'justifyCenter') {
                  el.style.textAlign = 'center';
                } else if (cmd === 'justifyRight') {
                  el.style.textAlign = 'right';
                } else if (cmd === 'justifyLeft') {
                  el.style.textAlign = 'left';
                }
                break;
              }
            }
            node = node.parentNode;
          }
        }
      } else if (cmd === 'code') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const codeEl = document.createElement('code');
          codeEl.className = 'bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-xs';
          codeEl.textContent = range.toString() || 'code';
          range.deleteContents();
          range.insertNode(codeEl);
        }
      } else {
        document.execCommand(cmd, false, val);
      }

      setSignatureHtml(editorRef.current.innerHTML);
    }
  };

  // Live Backend Persistence for Inbox Message Settings
  const persistInboxSettings = async (updatedTree: typeof inboxTree, notify = true) => {
    try {
      const res = await fetch('/api/user/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          section: 'inbox_messages',
          payload: updatedTree,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to sync with backend');
      }

      if (notify) {
        showToast(t('inbox_settings_synced', 'Inbox message settings synchronized with backend!'), 'success');
      }
    } catch (err: any) {
      console.error('Error synchronizing inbox settings:', err);
      showToast(err.message || t('inbox_settings_error', 'Failed to synchronize with backend'), 'error');
    }
  };

  // Hierarchical Checkbox Tree Handlers (Direct live sync on toggle)
  const handleParentToggle = (parentKey: keyof typeof inboxTree, childKeys: (keyof typeof inboxTree)[]) => {
    const nextVal = !inboxTree[parentKey];
    const updated = { ...inboxTree, [parentKey]: nextVal };
    if (parentKey === 'vmenu_group') updated.digital_menu_group = nextVal;
    if (parentKey === 'vtrack_group') updated.otrack_group = nextVal;
    childKeys.forEach((k) => {
      updated[k] = nextVal;
    });
    if (childKeys.includes('new_vmenu_order')) updated.new_omenu_order = nextVal;

    setInboxTree(updated);
    persistInboxSettings(updated, true);
  };

  const handleChildToggle = (childKey: keyof typeof inboxTree, parentKey: keyof typeof inboxTree, siblingKeys: (keyof typeof inboxTree)[]) => {
    const nextChildVal = !inboxTree[childKey];
    const updated = { ...inboxTree, [childKey]: nextChildVal };
    if (childKey === 'new_vmenu_order') updated.new_omenu_order = nextChildVal;
    const allSiblings = [childKey, ...siblingKeys];
    const hasAnyChecked = allSiblings.some((k) => (k === childKey ? nextChildVal : inboxTree[k]));
    updated[parentKey] = hasAnyChecked;
    if (parentKey === 'vmenu_group') updated.digital_menu_group = hasAnyChecked;
    if (parentKey === 'vtrack_group') updated.otrack_group = hasAnyChecked;

    setInboxTree(updated);
    persistInboxSettings(updated, true);
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

  const vtrackChildren: (keyof typeof inboxTree)[] = [
    'alert_on_void_items',
    'alert_on_refund',
    'alert_on_discount',
    'alert_on_new_table_reservation',
    'alert_on_receipt_cancellation',
  ];
  const otrackChildren = vtrackChildren;

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
        <Link prefetch={false} href={`/${orgId}/dashboard`} className="hover:text-primary transition-colors">
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

                {/* Formats Flyout Menu with Headings, Inline, Blocks, and Alignment */}
                <div className="relative" ref={formatsMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormatsMenuOpen(!formatsMenuOpen);
                      setActiveFlyout(null);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>{t('formats', 'Formats')}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {formatsMenuOpen && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs animate-fadeIn">
                      {/* Sub-menu 1: Headings */}
                      <div
                        className="relative px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer font-semibold text-slate-700 select-none"
                        onMouseEnter={() => setActiveFlyout('headings')}
                        onClick={() => setActiveFlyout(activeFlyout === 'headings' ? null : 'headings')}
                      >
                        <span>{t('headings', 'Headings')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

                        {activeFlyout === 'headings' && (
                          <div
                            className="absolute left-full top-0 ml-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-60 animate-fadeIn"
                            onMouseLeave={() => setActiveFlyout(null)}
                          >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  formatDoc('formatBlock', `h${num}`);
                                  setFormatsMenuOpen(false);
                                  setActiveFlyout(null);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-slate-800 cursor-pointer font-bold"
                              >
                                <span>{t(`heading_${num}`, `Heading ${num}`)}</span>
                                <span className="text-[10px] text-slate-400 font-mono">H{num}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub-menu 2: Inline */}
                      <div
                        className="relative px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer font-semibold text-slate-700 select-none"
                        onMouseEnter={() => setActiveFlyout('inline')}
                        onClick={() => setActiveFlyout(activeFlyout === 'inline' ? null : 'inline')}
                      >
                        <span>{t('inline_styles', 'Inline')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

                        {activeFlyout === 'inline' && (
                          <div
                            className="absolute left-full top-0 ml-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-60 animate-fadeIn"
                            onMouseLeave={() => setActiveFlyout(null)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('bold');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 font-bold text-slate-800 cursor-pointer"
                            >
                              {t('bold', 'Bold')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('italic');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 italic text-slate-800 cursor-pointer"
                            >
                              {t('italic', 'Italic')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('underline');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 underline text-slate-800 cursor-pointer"
                            >
                              {t('underline', 'Underline')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('strikeThrough');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 line-through text-slate-800 cursor-pointer"
                            >
                              {t('strikethrough', 'Strikethrough')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('superscript');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 cursor-pointer"
                            >
                              {t('superscript', 'Superscript')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('subscript');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 cursor-pointer"
                            >
                              {t('subscript', 'Subscript')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('code');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 font-mono text-xs text-pink-600 cursor-pointer"
                            >
                              {t('code', 'Code')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sub-menu 3: Blocks */}
                      <div
                        className="relative px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer font-semibold text-slate-700 select-none"
                        onMouseEnter={() => setActiveFlyout('blocks')}
                        onClick={() => setActiveFlyout(activeFlyout === 'blocks' ? null : 'blocks')}
                      >
                        <span>{t('blocks', 'Blocks')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

                        {activeFlyout === 'blocks' && (
                          <div
                            className="absolute left-full top-0 ml-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-60 animate-fadeIn"
                            onMouseLeave={() => setActiveFlyout(null)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('formatBlock', 'p');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 cursor-pointer"
                            >
                              {t('paragraph', 'Paragraph')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('formatBlock', 'blockquote');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 italic text-slate-800 border-l-2 border-primary ml-1 cursor-pointer"
                            >
                              {t('blockquote', 'Blockquote')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('formatBlock', 'div');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 cursor-pointer"
                            >
                              {t('div', 'Div')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('formatBlock', 'pre');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 font-mono text-xs text-slate-800 cursor-pointer"
                            >
                              {t('pre', 'Pre')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sub-menu 4: Alignment */}
                      <div
                        className="relative px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer font-semibold text-slate-700 select-none"
                        onMouseEnter={() => setActiveFlyout('alignment')}
                        onClick={() => setActiveFlyout(activeFlyout === 'alignment' ? null : 'alignment')}
                      >
                        <span>{t('alignment', 'Alignment')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

                        {activeFlyout === 'alignment' && (
                          <div
                            className="absolute left-full top-0 ml-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-60 animate-fadeIn"
                            onMouseLeave={() => setActiveFlyout(null)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('justifyLeft');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('align_left', 'Align Left')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('justifyCenter');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <AlignCenter className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('align_center', 'Align Center')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('justifyRight');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <AlignRight className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('align_right', 'Align Right')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                formatDoc('justifyFull');
                                setFormatsMenuOpen(false);
                                setActiveFlyout(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <AlignJustify className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('align_justify', 'Justify')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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

              {/* Scoped CSS for Lists, Headings, Blocks, and Alignment */}
              <style dangerouslySetInnerHTML={{ __html: `
                .vanguard-rich-editor ol {
                  list-style-type: decimal !important;
                  padding-inline-start: 2.25rem !important;
                  margin-block: 0.5rem !important;
                }
                .vanguard-rich-editor ul {
                  list-style-type: disc !important;
                  padding-inline-start: 2.25rem !important;
                  margin-block: 0.5rem !important;
                }
                .vanguard-rich-editor li {
                  display: list-item !important;
                  margin-block: 0.25rem !important;
                }
                .vanguard-rich-editor h1 {
                  font-size: 2rem !important;
                  font-weight: 800 !important;
                  line-height: 1.25 !important;
                  margin-block: 0.75rem 0.5rem !important;
                }
                .vanguard-rich-editor h2 {
                  font-size: 1.625rem !important;
                  font-weight: 700 !important;
                  line-height: 1.3 !important;
                  margin-block: 0.625rem 0.375rem !important;
                }
                .vanguard-rich-editor h3 {
                  font-size: 1.375rem !important;
                  font-weight: 700 !important;
                  line-height: 1.35 !important;
                  margin-block: 0.5rem 0.35rem !important;
                }
                .vanguard-rich-editor h4 {
                  font-size: 1.15rem !important;
                  font-weight: 600 !important;
                  line-height: 1.4 !important;
                  margin-block: 0.4rem 0.25rem !important;
                }
                .vanguard-rich-editor h5 {
                  font-size: 1rem !important;
                  font-weight: 600 !important;
                  margin-block: 0.35rem 0.2rem !important;
                }
                .vanguard-rich-editor h6 {
                  font-size: 0.875rem !important;
                  font-weight: 600 !important;
                  color: #64748b !important;
                  margin-block: 0.25rem 0.15rem !important;
                }
                .vanguard-rich-editor p {
                  margin-bottom: 0.5rem !important;
                  min-height: 1.25rem !important;
                  line-height: 1.6 !important;
                }
                .vanguard-rich-editor blockquote {
                  border-left: 4px solid #6366f1 !important;
                  padding-left: 1rem !important;
                  padding-block: 0.375rem !important;
                  font-style: italic !important;
                  color: #475569 !important;
                  background-color: #f8fafc !important;
                  border-radius: 0 0.375rem 0.375rem 0 !important;
                  margin: 0.75rem 0 !important;
                }
                .vanguard-rich-editor pre {
                  background-color: #0f172a !important;
                  color: #f8fafc !important;
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
                  font-size: 0.85rem !important;
                  padding: 0.75rem 1rem !important;
                  border-radius: 0.5rem !important;
                  overflow-x: auto !important;
                  margin: 0.75rem 0 !important;
                }
                .vanguard-rich-editor div {
                  min-height: 1.2rem !important;
                  margin-bottom: 0.25rem !important;
                }
                .vanguard-rich-editor [style*="text-align: justify"],
                .vanguard-rich-editor p[align="justify"],
                .vanguard-rich-editor div[align="justify"] {
                  text-align: justify !important;
                  text-justify: inter-word !important;
                  width: 100% !important;
                }
                .vanguard-rich-editor [style*="text-align: center"],
                .vanguard-rich-editor p[align="center"],
                .vanguard-rich-editor div[align="center"] {
                  text-align: center !important;
                }
                .vanguard-rich-editor [style*="text-align: right"],
                .vanguard-rich-editor p[align="right"],
                .vanguard-rich-editor div[align="right"] {
                  text-align: right !important;
                }
                .vanguard-rich-editor [style*="text-align: left"],
                .vanguard-rich-editor p[align="left"],
                .vanguard-rich-editor div[align="left"] {
                  text-align: left !important;
                }
              ` }} />

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
                onInput={() => {
                  if (editorRef.current) {
                    setSignatureHtml(editorRef.current.innerHTML);
                  }
                }}
                className="vanguard-rich-editor p-4 min-h-[220px] focus:outline-none text-xs text-slate-800 leading-relaxed font-sans"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs shrink-0 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Supabase Sync</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group 1: V-Menu (Digital Ordering & QR) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inboxTree.vmenu_group}
                      onChange={() => handleParentToggle('vmenu_group', ['new_vmenu_order'])}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-black text-slate-900">
                      {t('vmenu_group', 'V-Menu (Digital Ordering & QR)')}
                    </span>
                  </label>
                  <Link prefetch={false}
                    href="/vmenu"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs"
                  >
                    <span>{t('open_vmenu', 'Open V-Menu')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('vmenu_digital_desc', 'Customer digital orders, table QR scans, and sales rep assisted checkouts route directly through the V-Menu engine.')}
                </p>
                <div className="ps-6 space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inboxTree.new_vmenu_order}
                      onChange={() => handleChildToggle('new_vmenu_order', 'vmenu_group', [])}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {t('new_vmenu_order', 'New V-Menu Order')}
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

              {/* Group 3: V-Track (Live Audit & Fleet Engine) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inboxTree.vtrack_group}
                      onChange={() => handleParentToggle('vtrack_group', vtrackChildren)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-black text-slate-900">
                      {t('vtrack_group', 'V-Track')}
                    </span>
                  </label>
                  <Link prefetch={false}
                    href="/vtrack"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t('open_vtrack', 'Open V-Track Engine')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {t('vtrack_audit_stream_desc', 'Live audit events (Void, Refund, Discount, Table Reservation, Receipt Cancellation) stream directly to active V-Track engine.')}
                </p>
                <div className="ps-6 space-y-2 pt-1">
                  {vtrackChildren.map((itemKey) => (
                    <label key={itemKey} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inboxTree[itemKey]}
                        onChange={() =>
                          handleChildToggle(
                            itemKey,
                            'vtrack_group',
                            vtrackChildren.filter((k) => k !== itemKey)
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
