'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Award,
  Crown,
  Gift,
  Users,
  MessageCircle,
  Building,
  TrendingUp,
  FileSpreadsheet,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  ArrowUpDown,
  Percent,
  Calendar,
  Search,
  Plus,
  Printer,
  QrCode,
  X,
  Sliders,
  Send,
  Layers
} from 'lucide-react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  ReportCategoryGroup,
} from '@/components/reports/ReportPageLayout';

export interface LoyaltyMember {
  id: string;
  cardNumber: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  group: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  cashbackUsd: number;
  joinedDate: string;
  status: 'ACTIVE' | 'BLOCKED';
}

const INITIAL_MEMBERS: LoyaltyMember[] = [
  {
    id: 'MEM-001',
    cardNumber: 'MERIT-880192',
    title: 'Mr.',
    firstName: 'Tariq',
    lastName: 'Mansour',
    phone: '+961 3 451 229',
    email: 'tariq@albaraka.com',
    group: 'Wholesale Commercial',
    tier: 'PLATINUM',
    points: 14500,
    cashbackUsd: 145.00,
    joinedDate: '2026-01-15',
    status: 'ACTIVE'
  },
  {
    id: 'MEM-002',
    cardNumber: 'MERIT-880193',
    title: 'Mrs.',
    firstName: 'Nadine',
    lastName: 'Kassir',
    phone: '+961 1 789 450',
    email: 'nadine@beirutgourmet.lb',
    group: 'Key Accounts',
    tier: 'GOLD',
    points: 8200,
    cashbackUsd: 82.00,
    joinedDate: '2026-02-10',
    status: 'ACTIVE'
  },
  {
    id: 'MEM-003',
    cardNumber: 'MERIT-880194',
    title: 'Dr.',
    firstName: 'Ibrahim',
    lastName: 'Saad',
    phone: '+961 7 721 340',
    email: 'ibrahim@sidon.org',
    group: 'Wholesale Commercial',
    tier: 'SILVER',
    points: 3400,
    cashbackUsd: 34.00,
    joinedDate: '2026-03-01',
    status: 'ACTIVE'
  },
  {
    id: 'MEM-004',
    cardNumber: 'MERIT-880195',
    title: 'Ms.',
    firstName: 'Maya',
    lastName: 'Chemali',
    phone: '+961 3 881 204',
    email: 'maya@verdun-olive.com',
    group: 'Retail Elite',
    tier: 'BRONZE',
    points: 1250,
    cashbackUsd: 12.50,
    joinedDate: '2026-04-18',
    status: 'ACTIVE'
  }
];

export interface LoyaltyProgramItem {
  id: string;
  name: string;
  type: string;
  rule: string;
  eligibility: string;
  validPeriod: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_PROGRAMS: LoyaltyProgramItem[] = [
  {
    id: 'PRG-01',
    name: 'Standard Spend-to-Points',
    type: 'Points Accumulation',
    rule: 'Earn 10 Points for every $1 spent',
    eligibility: 'All Enrolled Members',
    validPeriod: 'Ongoing (2026)',
    status: 'ACTIVE'
  },
  {
    id: 'PRG-02',
    name: 'Wholesale Cashback Rebate',
    type: 'Cashback Rebate',
    rule: '2.5% Cashback on orders exceeding $1,000',
    eligibility: 'Wholesale & Commercial Tier',
    validPeriod: 'Q3 - Q4 2026',
    status: 'ACTIVE'
  },
  {
    id: 'PRG-03',
    name: 'Birthday Harvest Gift',
    type: 'Birthday Bonus',
    rule: '500 Bonus Points + Complimentary 250ml Extra Virgin Flask',
    eligibility: 'Gold & Platinum Members',
    validPeriod: 'Annual',
    status: 'ACTIVE'
  }
];

export default function UnifiedLoyaltyManagementConsole() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get('section') || 'dashboard';

  const activeSection = useMemo(() => {
    switch (rawSection.toLowerCase()) {
      case 'reports': return 'reports';
      case 'members': return 'members';
      case 'loyalty_levels': return 'loyalty_levels';
      case 'loyalty_programs': return 'loyalty_programs';
      case 'send_messages': return 'send_messages';
      case 'company_info': return 'company_info';
      default: return 'dashboard';
    }
  }, [rawSection]);

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [adjustPointsModal, setAdjustPointsModal] = useState<LoyaltyMember | null>(null);
  const [adjustPointsAmount, setAdjustPointsAmount] = useState<number>(100);
  const [adjustPointsReason, setAdjustPointsReason] = useState('Special Commercial Goodwill Bonus');

  // Filtered members
  const filteredMembers = useMemo(() => {
    return INITIAL_MEMBERS.filter(m => {
      const matchSearch =
        m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery);
      const matchTier = tierFilter === 'ALL' || m.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [searchQuery, tierFilter]);

  return (
    <div dir={dir} className="space-y-4 font-sans text-slate-800">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              {t('module_loyalty_management', 'MODULE 5 • LOYALTY MANAGEMENT')}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {t('section_colon', 'SECTION:')} {t(activeSection, activeSection.toUpperCase().replace(/_/g, ' '))}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'dashboard' && t('loyalty_program_overview', 'Loyalty Program Overview & Member Retention')}
            {activeSection === 'reports' && t('loyalty_financial_points_reports', 'Merits Loyalty Financial & Points Reports')}
            {activeSection === 'members' && t('loyalty_enrolled_members_roster', 'Loyalty Program Enrolled Members Roster')}
            {activeSection === 'loyalty_levels' && t('loyalty_tier_levels_rules', 'Loyalty Tier Levels & Privilege Rules')}
            {activeSection === 'loyalty_programs' && t('promotional_loyalty_cashback', 'Promotional Loyalty Programs & Cashback')}
            {activeSection === 'send_messages' && t('member_broadcast_dispatcher', 'Member Broadcast Dispatcher (SMS / WhatsApp)')}
            {activeSection === 'company_info' && t('brand_loyalty_setup', 'Brand Loyalty Setup & Currency Parity')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition"
            title="Print View"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD VIEW */}
      {activeSection === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('active_members', 'Active Members')}</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">1,248</span>
              <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">{t('active_engagement_subtext', '+18 new this week')}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('points_issued_mtd', 'Points Issued (MTD)')}</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">348,200</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{t('points_per_dollar_spent', '10 Points / $1 spent')}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cashback_reserve', 'Cashback Reserve')}</span>
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-700 mt-2 block">$3,482.00</span>
              <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{t('total_redeemable_liability', 'Total redeemable liability')}</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('top_tier_platinum', 'Top Tier (Platinum)')}</span>
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 mt-2 block">84 VIPs</span>
              <span className="text-xs text-indigo-600 font-semibold mt-0.5 block">{t('generate_68_volume', 'Generate 68% of volume')}</span>
            </div>
          </div>

          {/* Tier Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-amber-600 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-amber-700 uppercase">{t('bronze_tier', 'Bronze Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">720 {t('members', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold', 'Threshold')}: 0 - 2,500 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-slate-400 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-slate-600 uppercase">{t('silver_tier', 'Silver Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">320 {t('members', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold', 'Threshold')}: 2,501 - 5,000 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-amber-400 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-amber-600 uppercase">{t('gold_tier', 'Gold Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">124 {t('members', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold', 'Threshold')}: 5,001 - 10,000 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-indigo-600 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-indigo-700 uppercase">{t('platinum_tier', 'Platinum Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">84 {t('members', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold', 'Threshold')}: &gt;10,000 Pts</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMBERS ROSTER */}
      {activeSection === 'members' && (
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={t('search_loyalty_members_placeholder', 'Search loyalty members by name, phone, card #, or email...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700"
              >
                <option value="ALL">{t('all_loyalty_tiers', 'All Loyalty Tiers')}</option>
                <option value="BRONZE">{t('bronze_tier', 'Bronze Tier')}</option>
                <option value="SILVER">{t('silver_tier', 'Silver Tier')}</option>
                <option value="GOLD">{t('gold_tier', 'Gold Tier')}</option>
                <option value="PLATINUM">{t('platinum_tier', 'Platinum Tier')}</option>
              </select>

              <button
                onClick={() => { setSearchQuery(''); setTierFilter('ALL'); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                {t('reset', 'Reset')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">{t('card_#', 'Card #')}</th>
                    <th className="py-3 px-3.5">{t('member_name', 'Member Name')}</th>
                    <th className="py-3 px-3.5">{t('phone_number', 'Phone Number')}</th>
                    <th className="py-3 px-3.5">{t('group', 'Group')}</th>
                    <th className="py-3 px-3.5 text-center">{t('tier', 'Tier')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('points_balance', 'Points Balance')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('cashback_$', 'Cashback ($)')}</th>
                    <th className="py-3 px-3.5">{t('joined_date', 'Joined Date')}</th>
                    <th className="py-3 px-3.5 text-center">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-primary">{m.cardNumber}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">{m.title} {m.firstName} {m.lastName}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">{m.phone}</td>
                      <td className="py-3 px-3.5 text-slate-600">{m.group}</td>
                      <td className="py-3 px-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.tier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-800' :
                          m.tier === 'GOLD' ? 'bg-amber-100 text-amber-800' :
                          m.tier === 'SILVER' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900">
                        {m.points.toLocaleString()} PTS
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                        ${m.cashbackUsd.toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-400">{m.joinedDate}</td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAdjustPointsModal(m)}
                            className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100"
                            title="Adjust Points"
                          >
                            Points
                          </button>
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                            title="Member Digital Card"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. LOYALTY LEVELS */}
      {activeSection === 'loyalty_levels' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">{t('loyalty_tier_progression_thresholds', 'Loyalty Tier Progression & Thresholds')}</span>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition">
              + {t('add_tier_level', 'Add Tier Level')}
            </button>
          </div>
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('level', 'Level')}</th>
                <th className="py-3 px-4">{t('tier_name', 'Tier Name')}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{t('points_threshold', 'Points Threshold')}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{t('points_per_usd', 'Points / $1 Spend')}</th>
                <th className="py-3 px-4 text-right rtl:text-left">{t('expiry_duration', 'Expiry Duration')}</th>
                <th className="py-3 px-4">{t('key_privileges', 'Key Privileges')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">1</td>
                <td className="py-3 px-4 font-sans font-bold text-orange-700">Bronze</td>
                <td className="py-3 px-4 text-right">0 PTS</td>
                <td className="py-3 px-4 text-right">10 PTS</td>
                <td className="py-3 px-4 text-right">365 Days</td>
                <td className="py-3 px-4 font-sans text-slate-600">Standard accumulation, newsletter specials</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">2</td>
                <td className="py-3 px-4 font-sans font-bold text-slate-700">Silver</td>
                <td className="py-3 px-4 text-right">2,500 PTS</td>
                <td className="py-3 px-4 text-right">12 PTS</td>
                <td className="py-3 px-4 text-right">365 Days</td>
                <td className="py-3 px-4 font-sans text-slate-600">Free delivery on orders &gt; $100, 2% cashback rebate</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">3</td>
                <td className="py-3 px-4 font-sans font-bold text-amber-600">Gold</td>
                <td className="py-3 px-4 text-right">5,000 PTS</td>
                <td className="py-3 px-4 text-right">15 PTS</td>
                <td className="py-3 px-4 text-right">730 Days</td>
                <td className="py-3 px-4 font-sans text-slate-600">Free delivery all orders, 5% cashback rebate, Birthday flask gift</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">4</td>
                <td className="py-3 px-4 font-sans font-bold text-indigo-700">Platinum VIP</td>
                <td className="py-3 px-4 text-right">10,000 PTS</td>
                <td className="py-3 px-4 text-right">20 PTS</td>
                <td className="py-3 px-4 text-right">No Expiry</td>
                <td className="py-3 px-4 font-sans text-slate-600">Dedicated Account Concierge, Priority Dispatch, 8% cashback rebate</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 5. LOYALTY PROGRAMS */}
      {activeSection === 'loyalty_programs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">Active Promotional Programs &amp; Incentives</span>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition">
              + New Program
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Program Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reward Rule</th>
                <th className="py-3 px-4">Eligibility</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_PROGRAMS.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{p.type}</td>
                  <td className="py-3 px-4 text-slate-700">{p.rule}</td>
                  <td className="py-3 px-4 text-slate-600">{p.eligibility}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{p.validPeriod}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. SEND MESSAGES */}
      {activeSection === 'send_messages' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Broadcast Member Loyalty Notification
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Channel *</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option value="WHATSAPP">WhatsApp Official Care Desk</option>
                <option value="SMS">Direct Mobile SMS</option>
                <option value="EMAIL">Customer Email Blast</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Audience *</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold">
                <option>All Enrolled Members (1,248)</option>
                <option>Platinum VIPs (84)</option>
                <option>Gold Tier Members (124)</option>
                <option>Members with Balance &gt; $50 Cashback</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Content *</label>
              <textarea
                rows={4}
                defaultValue="Dear {{first_name}}, your Southern Olive loyalty balance is {{points_balance}} PTS (${{cashback_balance}}). Enjoy double points on early-harvest tins this weekend!"
                className="w-full p-2 border border-slate-200 rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Placeholders: &#123;&#123;first_name&#125;&#125;, &#123;&#123;points_balance&#125;&#125;, &#123;&#123;tier&#125;&#125;, &#123;&#123;cashback_balance&#125;&#125;</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => alert('Message broadcast dispatched to 1,248 members!')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
            >
              Send Broadcast
            </button>
          </div>
        </div>
      )}

      {/* 7. COMPANY INFO */}
      {activeSection === 'company_info' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Brand Loyalty Profile &amp; Currency Settings
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
              <input
                type="text"
                readOnly
                value="Southern Olive Oil Products S.A.R.L"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Owner Name</label>
              <input
                type="text"
                readOnly
                value="Mohammed Jichi"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                readOnly
                value="+961 71 801140"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
              <input
                type="text"
                readOnly
                value="mohammed.jichi@gmail.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Points Parity Rate</label>
              <input
                type="text"
                readOnly
                value="$1.00 = 10 Loyalty Points"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-blue-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Redemption Value</label>
              <input
                type="text"
                readOnly
                value="100 Points = $1.00 USD Cashback"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL MEMBERSHIP CARD */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-foreground rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Vanguard Merits Pass</span>
              <button onClick={() => setSelectedMember(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Cardholder</span>
              <h3 className="text-lg font-extrabold tracking-wide text-foreground">{selectedMember.firstName} {selectedMember.lastName}</h3>
              <span className="text-xs font-mono tracking-wider text-primary font-bold block mt-1">{selectedMember.cardNumber}</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center text-xs border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground block">Tier Level</span>
                <span className="font-black text-foreground">{selectedMember.tier}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Points</span>
                <span className="font-black text-primary">{selectedMember.points.toLocaleString()} PTS</span>
              </div>
            </div>

            <div className="bg-muted/20 border border-border p-3 rounded-xl flex flex-col items-center justify-center">
              <QrCode className="w-24 h-24 text-foreground" />
              <span className="text-[9px] text-muted-foreground font-mono mt-1">Scan for in-store checkout POS discount</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST POINTS */}
      {adjustPointsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Adjust Member Points Balance</h3>
              <button onClick={() => setAdjustPointsModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-muted-foreground block">Member:</span>
              <span className="font-bold text-foreground">{adjustPointsModal.firstName} {adjustPointsModal.lastName} ({adjustPointsModal.cardNumber})</span>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Points Delta (+ or -) *</label>
              <input
                type="number"
                value={adjustPointsAmount}
                onChange={(e) => setAdjustPointsAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-border bg-background rounded-lg font-mono text-xs font-bold text-foreground"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Reason / Reference *</label>
              <input
                type="text"
                value={adjustPointsReason}
                onChange={(e) => setAdjustPointsReason(e.target.value)}
                className="w-full p-2 border border-border bg-background rounded-lg text-xs text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setAdjustPointsModal(null)}
                className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Successfully credited ${adjustPointsAmount} points to member ${adjustPointsModal.cardNumber}!`);
                  setAdjustPointsModal(null);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold"
              >
                Confirm Points Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
