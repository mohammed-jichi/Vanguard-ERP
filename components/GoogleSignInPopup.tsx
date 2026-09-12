'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Key,
  Download,
  X,
  Minus,
  Square,
  ChevronDown,
  Lock,
  Check,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';

interface GoogleSignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountSelect: (email: string, name: string) => void;
  currentEmail: string;
}

export const SAVED_GOOGLE_ACCOUNTS = [
  {
    name: 'mohammed jichi',
    email: 'mohammed.jichi@gmail.com',
    avatarLetter: 'm',
    avatarBg: 'bg-[#5c3d2e]'
  },
  {
    name: 'Zeit w Zaytoun Ljanoub',
    email: 'zeit.zaytoun.ljanoub@gmail.com',
    avatarLetter: 'Z',
    avatarBg: 'bg-[#1e5c3d]'
  },
  {
    name: 'Vanguard ERP Admin',
    email: 'vanguard.erp.lb@gmail.com',
    avatarLetter: 'V',
    avatarBg: 'bg-[#1e3a8a]'
  }
];

export default function GoogleSignInPopup({
  isOpen,
  onClose,
  onAccountSelect,
  currentEmail
}: GoogleSignInPopupProps) {
  const [emailInput, setEmailInput] = useState(currentEmail || 'mohammed.jichi@gmail.com');
  const [isSavedAccountsDropdownOpen, setIsSavedAccountsDropdownOpen] = useState(false);
  const [isSiteInfoOpen, setIsSiteInfoOpen] = useState(false);
  const [isPasswordManagerOpen, setIsPasswordManagerOpen] = useState(false);
  const [isDownloadPromptOpen, setIsDownloadPromptOpen] = useState(false);
  const [isCreateAccountMenuOpen, setIsCreateAccountMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'signin' | 'forgot_email' | 'guest_mode' | 'success'>('signin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const siteInfoRef = useRef<HTMLDivElement>(null);
  const passwordManagerRef = useRef<HTMLDivElement>(null);

  const GOOGLE_AUTH_URL =
    'accounts.google.com/v3/signin/identifier?flowName=GlifWebSignIn&flowEntry=AddSession&dsh=S1409398882:1788872082999641';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setIsSavedAccountsDropdownOpen(false);
      }
      if (siteInfoRef.current && !siteInfoRef.current.contains(e.target as Node)) {
        setIsSiteInfoOpen(false);
      }
      if (passwordManagerRef.current && !passwordManagerRef.current.contains(e.target as Node)) {
        setIsPasswordManagerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Handle Next / Sign In
  const handleNext = (selectedEmail?: string) => {
    const targetEmail = selectedEmail || emailInput.trim();
    if (!targetEmail) return;

    setIsProcessing(true);
    setTimeout(() => {
      const found = SAVED_GOOGLE_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
      );
      const name = found ? found.name : targetEmail.split('@')[0];

      setIsProcessing(false);
      onAccountSelect(targetEmail, name);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      {/* Chrome Window Container */}
      <div
        className={`bg-[#202124] border border-[#3c4043] rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized ? 'w-full h-full max-w-none rounded-none' : 'w-full max-w-[480px] min-h-[640px]'
        }`}
      >
        {/* ===================================================================== */}
        {/* 1. CHROME TITLE BAR (Matching Screenshot)                             */}
        {/* ===================================================================== */}
        <div className="bg-[#202124] text-slate-300 h-9 px-3 flex items-center justify-between border-b border-[#3c4043] select-none text-xs">
          <div className="flex items-center gap-2 truncate">
            {/* Google Chrome Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#ffffff" opacity="0.1" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="#4285f4"
              />
              <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
              <circle cx="12" cy="12" r="3.5" fill="#4285f4" />
            </svg>
            <span className="truncate text-slate-200 font-sans text-xs">
              Sign in – Google accounts - Google Chrome
            </span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#3c4043] text-slate-300 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-8 flex items-center justify-center hover:bg-[#3c4043] text-slate-300 hover:text-white transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. CHROME ADDRESS BAR / TOOLBAR (Matching Screenshot & Audio 1)       */}
        {/* ===================================================================== */}
        <div className="bg-[#2b2a33] px-2.5 py-1.5 border-b border-[#3c4043] flex items-center gap-2 select-none relative">
          <div className="flex-1 bg-[#1c1b22] border border-[#3c4043] rounded-full px-3 py-1 flex items-center gap-2 text-xs text-slate-300">
            {/* View site information icon (Audio 1: "الشحطتين قبال بعض") */}
            <div className="relative" ref={siteInfoRef}>
              <button
                type="button"
                onClick={() => setIsSiteInfoOpen(!isSiteInfoOpen)}
                className="hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                title="View site information"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
              </button>

              {/* Site Information Popover */}
              {isSiteInfoOpen && (
                <div className="absolute left-0 top-7 mt-1 w-64 bg-[#2b2a33] border border-[#4a4955] rounded-lg shadow-2xl p-3 z-50 text-slate-200 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#4a4955] font-medium text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Connection is secure</span>
                  </div>
                  <div className="py-2 text-[11px] text-slate-300 space-y-1">
                    <p>Your information (e.g. passwords or credit card numbers) is private when it is sent to this site.</p>
                    <p className="text-slate-400">Certificate: Valid (Google Trust Services)</p>
                  </div>
                  <div className="pt-2 border-t border-[#4a4955] text-[10px] text-blue-400">
                    <span>accounts.google.com</span>
                  </div>
                </div>
              )}
            </div>

            {/* URL string from user screenshot & user audio */}
            <div className="flex-1 truncate font-mono text-[11px] text-slate-200 select-text">
              {GOOGLE_AUTH_URL}
            </div>

            {/* Manage passwords key icon (Audio 1: "علامة المفتاح بتفتح الـ Manage Password") */}
            <div className="relative" ref={passwordManagerRef}>
              <button
                type="button"
                onClick={() => setIsPasswordManagerOpen(!isPasswordManagerOpen)}
                className="hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                title="Google Password Manager"
              >
                <Key className="w-3.5 h-3.5 text-slate-400 hover:text-amber-300" />
              </button>

              {/* Google Password Manager Popover */}
              {isPasswordManagerOpen && (
                <div className="absolute right-0 top-7 mt-1 w-72 bg-[#2b2a33] border border-[#4a4955] rounded-lg shadow-2xl p-3 z-50 text-slate-200 text-xs animate-in fade-in">
                  <div className="font-bold text-white text-xs mb-2 flex items-center justify-between">
                    <span>Google Password Manager</span>
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">
                    Saved accounts for accounts.google.com:
                  </p>
                  <div className="space-y-1.5 mb-2">
                    {SAVED_GOOGLE_ACCOUNTS.map((acc) => (
                      <div
                        key={acc.email}
                        onClick={() => {
                          setEmailInput(acc.email);
                          setIsPasswordManagerOpen(false);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded cursor-pointer flex items-center justify-between text-[11px]"
                      >
                        <span className="truncate">{acc.email}</span>
                        <span className="text-slate-400">••••••••</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Download icon (Audio 1: "وعندك الداونلود بتعمل داونلود للـ URL / App") */}
            <button
              type="button"
              onClick={() => setIsDownloadPromptOpen(true)}
              className="hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
              title="Install Google Account / Save URL"
            >
              <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
            </button>
          </div>
        </div>

        {/* Download / Install Toast Prompt */}
        {isDownloadPromptOpen && (
          <div className="bg-[#3c4043] px-3 py-2 text-xs text-white flex items-center justify-between border-b border-[#5f6368]">
            <span>Install &ldquo;Google Account&rdquo; app on this device?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDownloadPromptOpen(false);
                  alert('Google Accounts app installed.');
                }}
                className="bg-[#8ab4f8] text-[#041e49] font-medium px-2.5 py-1 rounded text-[11px]"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setIsDownloadPromptOpen(false)}
                className="text-slate-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. GOOGLE SIGN IN PAGE BODY (Matching Screenshot Exactly)            */}
        {/* ===================================================================== */}
        <div className="flex-1 bg-[#131314] text-white p-8 flex flex-col justify-between overflow-y-auto">
          {currentStep === 'signin' && (
            <div>
              {/* Google Multicolored "G" Logo */}
              <div className="mb-6">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-3xl font-normal text-white mb-2 tracking-tight">Sign in</h1>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                with your Google Account. This account will be available to other Google apps in the browser.
              </p>

              {/* Email / Phone Input with Outlined Border & Saved Accounts Dropdown (Audio 1) */}
              <div className="relative mb-3" ref={inputContainerRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onFocus={() => setIsSavedAccountsDropdownOpen(true)}
                    placeholder="Email or phone"
                    className="w-full bg-transparent border border-slate-500 focus:border-[#8ab4f8] focus:border-2 rounded px-3.5 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
                  />
                  <label className="absolute -top-2 left-3 bg-[#131314] px-1 text-[11px] text-slate-400">
                    Email or phone
                  </label>
                </div>

                {/* Dropdown of Saved Accounts (Audio 1: "بتفتح قائمة الايميلات المحفظة") */}
                {isSavedAccountsDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#202124] border border-[#3c4043] rounded-lg shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-[#3c4043]">
                      Saved Accounts on this Computer
                    </div>
                    {SAVED_GOOGLE_ACCOUNTS.map((acc) => (
                      <div
                        key={acc.email}
                        onClick={() => {
                          setEmailInput(acc.email);
                          setIsSavedAccountsDropdownOpen(false);
                          handleNext(acc.email);
                        }}
                        className="px-3.5 py-2.5 hover:bg-white/10 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#3c4043]/50 last:border-0"
                      >
                        <div
                          className={`w-7 h-7 rounded-full ${acc.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0`}
                        >
                          {acc.avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{acc.name}</div>
                          <div className="text-slate-400 text-[11px] truncate">{acc.email}</div>
                        </div>
                        {emailInput === acc.email && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Forgot Email Link */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep('forgot_email')}
                  className="text-xs font-semibold text-[#8ab4f8] hover:text-[#aecbfa] transition-colors cursor-pointer"
                >
                  Forgot email?
                </button>
              </div>

              {/* Guest Mode Informational Text (Screenshot) */}
              <p className="text-xs text-slate-300 leading-relaxed">
                Not your computer? Use Guest mode to sign in privately.{' '}
                <button
                  type="button"
                  onClick={() => setCurrentStep('guest_mode')}
                  className="text-[#8ab4f8] hover:text-[#aecbfa] font-semibold cursor-pointer underline"
                >
                  Learn more about using Guest mode
                </button>
              </p>
            </div>
          )}

          {/* Alternate Step: Forgot Email */}
          {currentStep === 'forgot_email' && (
            <div>
              <h2 className="text-2xl font-normal text-white mb-2">Find your email</h2>
              <p className="text-xs text-slate-300 mb-6">
                Enter your phone number or recovery email
              </p>
              <input
                type="text"
                placeholder="Phone number or email"
                className="w-full bg-transparent border border-slate-500 focus:border-[#8ab4f8] rounded px-3.5 py-3 text-sm text-white focus:outline-none mb-4"
              />
              <button
                type="button"
                onClick={() => setCurrentStep('signin')}
                className="text-xs text-[#8ab4f8] hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
          )}

          {/* Alternate Step: Guest Mode Info */}
          {currentStep === 'guest_mode' && (
            <div>
              <h2 className="text-2xl font-normal text-white mb-2">Guest mode</h2>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                When using Guest mode, you won&apos;t see or change any other Chrome profile&apos;s info. When you exit Guest mode, your browsing activity is deleted from the computer.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep('signin')}
                className="text-xs text-[#8ab4f8] hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
          )}

          {/* Bottom Action Buttons (Create Account + Next Pill Button) */}
          <div className="flex items-center justify-between pt-6 border-t border-transparent select-none relative">
            {/* Create Account Link / Menu (Audio 1 & Screenshot) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCreateAccountMenuOpen(!isCreateAccountMenuOpen)}
                className="text-xs font-semibold text-[#8ab4f8] hover:text-[#aecbfa] cursor-pointer"
              >
                Create account
              </button>

              {isCreateAccountMenuOpen && (
                <div className="absolute left-0 bottom-8 mb-2 w-48 bg-[#202124] border border-[#3c4043] rounded-lg shadow-2xl py-1 z-50 text-xs animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateAccountMenuOpen(false);
                      setEmailInput('new.user@gmail.com');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-slate-200"
                  >
                    For my personal use
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateAccountMenuOpen(false);
                      setEmailInput('enterprise@southernolive-lb.com');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-slate-200"
                  >
                    For work or my business
                  </button>
                </div>
              )}
            </div>

            {/* Next Pill Button (Screenshot: Light blue #a8c7fa with dark text) */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleNext()}
              className="bg-[#a8c7fa] hover:bg-[#8ab4f8] text-[#041e49] font-medium px-6 py-2 rounded-full text-xs cursor-pointer transition-all shadow-md flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#041e49] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Next</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
