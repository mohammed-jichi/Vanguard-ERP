'use client';

import React, { useState } from 'react';
import { useLanguage, LanguageCode } from '@/context/LanguageContext';

export default function VanguardSidebar() {
  const { language, setLanguage, t } = useLanguage();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('choueifat');

  return (
    <aside className="w-64 bg-[#141820] text-slate-300 border-r border-slate-800/80 flex flex-col h-screen select-none font-sans text-left">
      
      {/* 1. Corporate Brand Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#0f1218]">
        <div className="text-[13px] font-bold text-white tracking-tight leading-tight">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-amber-400 font-semibold font-mono">Vanguard ERP v2.6</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('system_live', 'System Live')}</span>
          </div>
        </div>
      </div>

      {/* 2. Branch & Language Selectors */}
      <div className="p-2.5 bg-[#181d26] border-b border-slate-800 space-y-2 text-xs">
        {/* Branch Selector */}
        <div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-[#10141b] text-slate-200 border border-slate-700 rounded px-2 py-1 text-[11px] font-medium focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="choueifat">Choueifat Main Branch</option>
            <option value="beirut">Beirut Branch</option>
            <option value="pressing_plant">Central Pressing Plant</option>
          </select>
        </div>

        {/* Global Language Selector (Default: English) */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-[#10141b] text-amber-400 border border-slate-700 rounded px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer"
          >
            <option value="en">English (Default)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="fr">Français (French)</option>
            <option value="es">Español (Spanish)</option>
            <option value="fa">فارسی (Persian)</option>
          </select>
        </div>
      </div>

      {/* 3. 7 Core Navigation Modules (Clean - No Lock Icons) */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar text-[12.5px]">
        
        {/* 1. Sales Control & POS */}
        <a 
          href="/pos" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">🛒</span>
            <span>{t('mod_sales_pos', '1. Sales Control & POS')}</span>
          </div>
          <span className="text-[10px] text-slate-500">›</span>
        </a>

        {/* 2. SuperSonic Fleet Management (Clean - No Lock Icon) */}
        <a 
          href="/fleet" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">🚚</span>
            <span>{t('mod_fleet', '2. SuperSonic Fleet Management')}</span>
          </div>
          <span className="text-[10px] text-slate-500">›</span>
        </a>

        {/* 3. Social CRM & Support (Clean - No Lock Icon) */}
        <a 
          href="/social-crm" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">💬</span>
            <span>{t('mod_social_crm', '3. Social CRM & Support')}</span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ENT
          </span>
        </a>

        {/* 4. Operations & Pressing Center */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setOperationsOpen(!operationsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md font-bold text-amber-400 bg-slate-800/80 border-l-2 border-amber-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 text-center text-sm">⚙️</span>
              <span>{t('mod_operations', '4. Operations & Pressing Center')}</span>
            </div>
            <span className={`text-[10px] transition-transform ${operationsOpen ? 'rotate-90' : ''}`}>›</span>
          </button>

          {operationsOpen && (
            <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/50 ml-4 mt-1 text-[12px]">
              <a href="/operations/dashboard" className="w-full block py-1 px-2 rounded text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer">
                {t('ops_dashboard', 'Operations Center Dashboard')}
              </a>
              <a href="/operations/pressing" className="w-full block py-1 px-2 rounded font-semibold text-amber-300 bg-amber-500/10 cursor-pointer">
                {t('ops_olive_pressing', 'Olive Pressing & Production')}
              </a>
              <a href="/operations/reports" className="w-full block py-1 px-2 rounded text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer">
                {t('ops_reports', 'Operations & Pressing Reports')}
              </a>
            </div>
          )}
        </div>

        {/* 5. Customer Management & AR */}
        <a 
          href="/customers" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">👥</span>
            <span>{t('mod_customers_ar', '5. Customer Management & AR')}</span>
          </div>
          <span className="text-[10px] text-slate-500">›</span>
        </a>

        {/* 6. Accounting & Finance */}
        <a 
          href="/accounting" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">📊</span>
            <span>{t('mod_accounting', '6. Accounting & Finance')}</span>
          </div>
          <span className="text-[10px] text-slate-500">›</span>
        </a>

        {/* 7. HR & Payroll Management */}
        <a 
          href="/hr" 
          className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center text-sm group-hover:text-amber-400">🪪</span>
            <span>{t('mod_hr', '7. HR & Payroll Management')}</span>
          </div>
          <span className="text-[10px] text-slate-500">›</span>
        </a>

      </nav>

      {/* 4. Footer */}
      <div className="p-2.5 bg-[#0d1015] border-t border-slate-800 text-[10.5px] text-slate-500 flex items-center justify-between">
        <span>© 2026 Vanguard ERP</span>
        <span className="font-mono text-slate-400">SO-SARL</span>
      </div>

    </aside>
  );
}
