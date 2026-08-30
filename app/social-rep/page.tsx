'use client';

import React, { useState } from 'react';
import SocialLandingPageOrder from '@/components/modules/social/SocialLandingPageOrder';
import SocialRepStatisticsAndTracking from '@/components/modules/social/SocialRepStatisticsAndTracking';

export default function SocialRepMainPage() {
  const [activeRepView, setActiveRepView] = useState<'approvals' | 'stats'>('approvals');

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-right font-sans">
      
      {/* Top Mobile/Desktop Navigation Bar */}
      <div className="bg-[#1e232d] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-xs">بوابة مندوب السوشيال ميديا</span>
          <span className="text-slate-400 text-xs">|</span>
          <span className="text-amber-400 text-xs font-bold">Southern Olive Oil Products S.A.R.L</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveRepView('approvals')}
            className={`px-3 py-1 rounded transition-colors ${
              activeRepView === 'approvals' ? 'bg-[#1a629b] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الطلبيات ومهلة الـ 1 ساعة
          </button>

          <button
            type="button"
            onClick={() => setActiveRepView('stats')}
            className={`px-3 py-1 rounded transition-colors ${
              activeRepView === 'stats' ? 'bg-[#1a629b] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الإحصائيات والتتبع الحي
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      <div className="p-4 md:p-6">
        {activeRepView === 'approvals' ? (
          <SocialLandingPageOrder />
        ) : (
          <SocialRepStatisticsAndTracking />
        )}
      </div>

    </div>
  );
}
