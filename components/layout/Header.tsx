'use client';

import React, { useState } from 'react';
import { useLanguage, LanguageCode } from '@/context/LanguageContext';
import {
  Globe,
  User,
  Bell,
  Shield,
  Users as UsersIcon,
  ChevronDown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onSelectScreen?: (screenKey: string) => void;
}

export default function VanguardHeader({ onSelectScreen }: HeaderProps = {}) {
  const { language, setLanguage, t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English (US)', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية (RTL)', flag: '🇸🇦' },
    { code: 'fa', label: 'فارسی (RTL)', flag: '🇮🇷' },
  ];

  return (
    <header className="w-full bg-[#0f1218] border-b border-slate-800 px-4 py-2.5 text-white flex items-center justify-between shadow-md select-none font-sans">
      
      {/* 1. Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
          SO
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
            Southern Olive Oil Products S.A.R.L
          </h1>
          <p className="text-[10.5px] text-slate-400 font-medium">
            Vanguard ERP v2.6 - Enterprise Central System
          </p>
        </div>
      </div>

      {/* 2. User Profile & Quick Actions */}
      <div className="flex items-center gap-3 relative">
        
        {/* User Profile Button */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
            M
          </div>
          <span className="text-slate-200">Mohammed</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Profile & Language Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-semibold text-left">
            
            {/* User Info Header */}
            <div className="p-2 border-b border-slate-100">
              <p className="text-slate-900 font-bold">Mohammed</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                Southern Olive Oil Products S.A.R.L
              </p>
            </div>

            {/* Language Selector Section */}
            <div className="p-2 border-t border-b border-slate-100 my-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block px-1 mb-1">
                SELECT LANGUAGE
              </span>
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsProfileOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    language === item.code
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  {language === item.code && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Account & Settings Links */}
            <button
              type="button"
              onClick={() => {
                if (onSelectScreen) onSelectScreen('settings');
                setIsProfileOpen(false);
              }}
              className="w-full p-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>My Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSelectScreen) onSelectScreen('hr-orgsetup-permissions');
                setIsProfileOpen(false);
              }}
              className="w-full p-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Roles & Permissions</span>
            </button>

            <a
              href="/support"
              target="_blank"
              rel="noreferrer"
              className="w-full p-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 font-medium cursor-pointer block"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Support Center</span>
            </a>

          </div>
        )}

      </div>

    </header>
  );
}
