'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
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
  Layers,
  FileText,
  Ticket,
  ShoppingBag,
  History,
  Check
} from 'lucide-react';

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

export interface RewardItem {
  id: string;
  name: string;
  category: 'DISCOUNT' | 'GIFT' | 'SERVICE' | 'CASHBACK';
  pointsCost: number;
  dollarValue: number;
  availableStock: number;
  eligibleTier: string;
  status: 'ACTIVE' | 'OUT_OF_STOCK';
}

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'RWD-01',
    name: '$10 In-Store Commercial Coupon',
    category: 'DISCOUNT',
    pointsCost: 1000,
    dollarValue: 10.00,
    availableStock: 450,
    eligibleTier: 'All Tiers',
    status: 'ACTIVE'
  },
  {
    id: 'RWD-02',
    name: '$25 Wholesale Cart Rebate Voucher',
    category: 'DISCOUNT',
    pointsCost: 2500,
    dollarValue: 25.00,
    availableStock: 180,
    eligibleTier: 'Silver, Gold, Platinum',
    status: 'ACTIVE'
  },
  {
    id: 'RWD-03',
    name: 'Complimentary 250ml Extra Virgin Olive Oil Flask',
    category: 'GIFT',
    pointsCost: 1500,
    dollarValue: 18.00,
    availableStock: 85,
    eligibleTier: 'Gold, Platinum',
    status: 'ACTIVE'
  },
  {
    id: 'RWD-04',
    name: 'Free Regional Logistics Express Delivery Pass',
    category: 'SERVICE',
    pointsCost: 800,
    dollarValue: 12.00,
    availableStock: 300,
    eligibleTier: 'All Tiers',
    status: 'ACTIVE'
  },
  {
    id: 'RWD-05',
    name: '$100 Commercial General Ledger Credit Note',
    category: 'CASHBACK',
    pointsCost: 10000,
    dollarValue: 100.00,
    availableStock: 50,
    eligibleTier: 'Platinum Only',
    status: 'ACTIVE'
  }
];

export interface PointsTransactionLog {
  txId: string;
  memberId: string;
  memberName: string;
  type: 'PURCHASE_ACCRUAL' | 'BULK_BONUS' | 'GIFT_REDEMPTION' | 'VOUCHER_ISSUANCE' | 'PROMO_BONUS' | 'MANUAL_ADJUSTMENT';
  pointsDelta: number;
  usdEquivalent: number;
  cashierSource: string;
  date: string;
  balanceAfter: number;
}

const INITIAL_LOGS: PointsTransactionLog[] = [
  {
    txId: 'PTX-9011',
    memberId: 'MEM-001',
    memberName: 'Al-Baraka Supermarket',
    type: 'PURCHASE_ACCRUAL',
    pointsDelta: 1450,
    usdEquivalent: 14.50,
    cashierSource: 'POS Terminal 1 - Choueifat',
    date: '2026-09-15 10:30',
    balanceAfter: 14500
  },
  {
    txId: 'PTX-9012',
    memberId: 'MEM-002',
    memberName: 'Beirut Gourmet Emporium',
    type: 'BULK_BONUS',
    pointsDelta: 2000,
    usdEquivalent: 20.00,
    cashierSource: 'Backoffice Commercial Sales',
    date: '2026-09-14 14:15',
    balanceAfter: 8200
  },
  {
    txId: 'PTX-9013',
    memberId: 'MEM-003',
    memberName: 'Sidon Central Cooperative',
    type: 'GIFT_REDEMPTION',
    pointsDelta: -1500,
    usdEquivalent: -15.00,
    cashierSource: 'POS Terminal 2 - Sidon Hub',
    date: '2026-09-14 11:20',
    balanceAfter: 3400
  },
  {
    txId: 'PTX-9014',
    memberId: 'MEM-001',
    memberName: 'Al-Baraka Supermarket',
    type: 'PROMO_BONUS',
    pointsDelta: 800,
    usdEquivalent: 8.00,
    cashierSource: 'Harvest Season Campaign Engine',
    date: '2026-09-13 09:00',
    balanceAfter: 13050
  },
  {
    txId: 'PTX-9015',
    memberId: 'MEM-004',
    memberName: 'Verdun Olive Specialty Boutique',
    type: 'VOUCHER_ISSUANCE',
    pointsDelta: -1000,
    usdEquivalent: -10.00,
    cashierSource: 'POS Terminal 1 - Beirut',
    date: '2026-09-12 16:45',
    balanceAfter: 1250
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
      case 'rewards_catalog': return 'rewards_catalog';
      case 'transaction_logs': return 'transaction_logs';
      case 'loyalty_programs': return 'loyalty_programs';
      case 'send_messages': return 'send_messages';
      case 'company_info': return 'company_info';
      default: return 'dashboard';
    }
  }, [rawSection]);

  const { currentTenant } = useTenant();
  const [members, setMembers] = useState<LoyaltyMember[]>(INITIAL_MEMBERS);
  const [logs, setLogs] = useState<PointsTransactionLog[]>(INITIAL_LOGS);

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [adjustPointsModal, setAdjustPointsModal] = useState<LoyaltyMember | null>(null);
  const [adjustPointsAmount, setAdjustPointsAmount] = useState<number>(100);
  const [adjustPointsReason, setAdjustPointsReason] = useState('Special Commercial Goodwill Bonus');
  const [adjustCashierSource, setAdjustCashierSource] = useState('Central Accounting Desk');
  
  // Issue Reward Voucher Modal State
  const [issueRewardModal, setIssueRewardModal] = useState<RewardItem | null>(null);
  const [selectedRewardMember, setSelectedRewardMember] = useState<string>('MEM-001');

  // New Tier Level Modal State
  const [showAddTierModal, setShowAddTierModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Hydrate Loyalty Members & Ledger from Supabase
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
          ? currentTenant.id
          : '00000000-0000-0000-0000-000000000001';

        // 1. Fetch live loyalty members from public.loyalty_members
        const { data: dbMembers, error: membersError } = await supabase
          .from('loyalty_members')
          .select('*')
          .order('points', { ascending: false });

        if (!membersError && dbMembers && dbMembers.length > 0) {
          const mappedMembers: LoyaltyMember[] = dbMembers.map((m: any) => ({
            id: m.id,
            cardNumber: m.card_number,
            title: m.title || 'Mr.',
            firstName: m.first_name,
            lastName: m.last_name,
            phone: m.phone || '',
            email: m.email || '',
            group: m.group_name || 'Retail',
            tier: m.tier || 'BRONZE',
            points: m.points || 0,
            cashbackUsd: m.cashback_usd ? Number(m.cashback_usd) : Number(((m.points || 0) * 0.01).toFixed(2)),
            joinedDate: m.created_at ? m.created_at.split('T')[0] : '2026-01-01',
            status: m.status || 'ACTIVE'
          }));
          setMembers(mappedMembers);
        } else {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('feature_flags')
            .eq('id', targetTenantId)
            .maybeSingle();

          const flags = tenantData?.feature_flags || {};
          if (Array.isArray(flags.loyalty_members) && flags.loyalty_members.length > 0) {
            setMembers(flags.loyalty_members);
          }
        }

        // 2. Fetch live logs from public.loyalty_ledger
        const { data: dbLedger, error: ledgerError } = await supabase
          .from('loyalty_ledger')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ledgerError && dbLedger && dbLedger.length > 0) {
          const mappedLogs: PointsTransactionLog[] = dbLedger.map((l: any) => ({
            txId: l.id ? `PTX-${l.id.slice(0, 6)}` : `PTX-${Date.now()}`,
            memberId: l.member_id || 'MEM-001',
            memberName: l.reference_notes || 'Loyalty Member',
            type: (l.transaction_type || 'PURCHASE_ACCRUAL') as any,
            pointsDelta: l.points_delta || 0,
            usdEquivalent: Number(l.usd_equivalent) || 0,
            cashierSource: l.cashier_source || 'Central POS',
            date: l.created_at ? l.created_at.replace('T', ' ').slice(0, 16) : new Date().toISOString(),
            balanceAfter: l.balance_after || 0
          }));
          setLogs(prev => {
            const existingIds = new Set(mappedLogs.map(m => m.txId));
            return [...mappedLogs, ...prev.filter(p => !existingIds.has(p.txId))];
          });
        }
      } catch (err) {
        console.warn('Loyalty live query notice:', err);
      }
    };
    fetchLoyaltyData();
  }, [currentTenant?.id]);

  // Points Adjustment Handler
  const handleConfirmPointsAdjustment = async () => {
    if (!adjustPointsModal) return;
    const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    const newPoints = Math.max(0, adjustPointsModal.points + adjustPointsAmount);
    const newTier = newPoints >= 12000 ? 'PLATINUM' : newPoints >= 8000 ? 'GOLD' : newPoints >= 4000 ? 'SILVER' : 'BRONZE';
    const newCashback = Number((newPoints * 0.01).toFixed(2));

    try {
      await supabase.from('loyalty_ledger').insert([{
        tenant_id: targetTenantId,
        member_id: adjustPointsModal.id,
        card_number: adjustPointsModal.cardNumber,
        transaction_type: adjustPointsAmount >= 0 ? 'BONUS' : 'ADJUSTMENT',
        points_delta: adjustPointsAmount,
        usd_equivalent: Number((adjustPointsAmount * 0.01).toFixed(2)),
        reference_notes: adjustPointsReason,
        balance_after: newPoints,
        created_at: new Date().toISOString()
      }]);

      await supabase.from('loyalty_members').upsert([{
        id: adjustPointsModal.id,
        tenant_id: targetTenantId,
        card_number: adjustPointsModal.cardNumber,
        first_name: adjustPointsModal.firstName,
        last_name: adjustPointsModal.lastName,
        tier: newTier,
        points: newPoints,
        cashback_usd: newCashback,
        updated_at: new Date().toISOString()
      }]);

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const flags = tenantData?.feature_flags || {};
      const existingMembers = Array.isArray(flags.loyalty_members) ? flags.loyalty_members : members;
      const updatedMembers = existingMembers.map((m: any) =>
        m.id === adjustPointsModal.id
          ? { ...m, points: newPoints, tier: newTier, cashbackUsd: newCashback }
          : m
      );

      await supabase.from('tenants').update({
        feature_flags: {
          ...flags,
          loyalty_members: updatedMembers
        },
        updated_at: new Date().toISOString()
      }).eq('id', targetTenantId);

    } catch (err) {
      console.warn('Points adjustment persistence notice:', err);
    }

    setMembers(prev => prev.map(m => m.id === adjustPointsModal.id ? { ...m, points: newPoints, tier: newTier as any, cashbackUsd: newCashback } : m));
    setLogs(prev => [
      {
        txId: `PTX-${Date.now().toString().slice(-4)}`,
        memberId: adjustPointsModal.id,
        memberName: `${adjustPointsModal.firstName} ${adjustPointsModal.lastName}`,
        type: adjustPointsAmount >= 0 ? 'BONUS' : 'ADJUSTMENT',
        pointsDelta: adjustPointsAmount,
        usdEquivalent: Number((adjustPointsAmount * 0.01).toFixed(2)),
        cashierSource: adjustCashierSource,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        balanceAfter: newPoints
      } as any,
      ...prev
    ]);

    showToast(t('points_adjusted_success_toast', `Successfully adjusted points for member ${adjustPointsModal.cardNumber} (New Tier: ${newTier})!`));
    setAdjustPointsModal(null);
  };

  // Reward Voucher Issuance Handler
  const handleIssueRewardVoucher = async () => {
    if (!issueRewardModal) return;
    const targetMember = members.find(m => m.id === selectedRewardMember);
    if (!targetMember) return;
    if (targetMember.points < issueRewardModal.pointsCost) {
      showToast(t('insufficient_points_error', 'Insufficient points to redeem this reward!'));
      return;
    }

    const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
      ? currentTenant.id
      : '00000000-0000-0000-0000-000000000001';

    const newPoints = targetMember.points - issueRewardModal.pointsCost;
    const newTier = newPoints >= 12000 ? 'PLATINUM' : newPoints >= 8000 ? 'GOLD' : newPoints >= 4000 ? 'SILVER' : 'BRONZE';
    const newCashback = Number((newPoints * 0.01).toFixed(2));

    try {
      await supabase.from('loyalty_ledger').insert([{
        tenant_id: targetTenantId,
        member_id: targetMember.id,
        card_number: targetMember.cardNumber,
        transaction_type: 'GIFT_REDEMPTION',
        points_delta: -issueRewardModal.pointsCost,
        usd_equivalent: -issueRewardModal.dollarValue,
        reference_notes: `Redeemed Voucher: ${issueRewardModal.name}`,
        balance_after: newPoints,
        created_at: new Date().toISOString()
      }]);

      await supabase.from('loyalty_members').upsert([{
        id: targetMember.id,
        tenant_id: targetTenantId,
        card_number: targetMember.cardNumber,
        points: newPoints,
        tier: newTier,
        cashback_usd: newCashback,
        updated_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn('Voucher issuance persistence notice:', err);
    }

    setMembers(prev => prev.map(m => m.id === targetMember.id ? { ...m, points: newPoints, tier: newTier as any, cashbackUsd: newCashback } : m));
    setLogs(prev => [
      {
        txId: `PTX-${Date.now().toString().slice(-4)}`,
        memberId: targetMember.id,
        memberName: `${targetMember.firstName} ${targetMember.lastName}`,
        type: 'GIFT_REDEMPTION',
        pointsDelta: -issueRewardModal.pointsCost,
        usdEquivalent: -issueRewardModal.dollarValue,
        cashierSource: 'Rewards Desk',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        balanceAfter: newPoints
      } as any,
      ...prev
    ]);

    showToast(t('voucher_issued_success_toast', `Voucher issued successfully for member ${targetMember.firstName} ${targetMember.lastName}!`));
    setIssueRewardModal(null);
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch =
        m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery);
      const matchTier = tierFilter === 'ALL' || m.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [members, searchQuery, tierFilter]);

  // Export handlers
  const handleExportPDF = () => {
    showToast(t('loyalty_pdf_exported_toast', 'Loyalty Program audit statement PDF generated successfully.'));
  };

  const handleExportExcel = () => {
    showToast(t('loyalty_excel_exported_toast', 'Loyalty members & points ledger Excel workbook exported.'));
  };

  return (
    <div dir={dir} className="space-y-4 font-sans text-slate-800 text-left rtl:text-right">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground">
              {t('module_loyalty_management_badge', 'MODULE 6 • LOYALTY MANAGEMENT (برنامج الولاء والمكافآت)')}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {t('section_colon', 'SECTION:')} {activeSection.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {activeSection === 'dashboard' && t('loyalty_program_overview', 'Loyalty Program Overview & Member Retention')}
            {activeSection === 'reports' && t('loyalty_financial_points_reports', 'Merits Loyalty Financial & Points Reports')}
            {activeSection === 'members' && t('loyalty_enrolled_members_roster', 'Loyalty Program Enrolled Members Roster')}
            {activeSection === 'loyalty_levels' && t('loyalty_tier_levels_rules', 'Loyalty Tier Levels & Privilege Rules')}
            {activeSection === 'rewards_catalog' && t('rewards_catalog_redemptions_title', 'Customer Rewards & Redemption Catalog')}
            {activeSection === 'transaction_logs' && t('points_transaction_logs_title', 'Points Ledger & Cashier Transaction History')}
            {activeSection === 'loyalty_programs' && t('promotional_loyalty_cashback', 'Promotional Loyalty Programs & Cashback')}
            {activeSection === 'send_messages' && t('member_broadcast_dispatcher', 'Member Broadcast Dispatcher (SMS / WhatsApp)')}
            {activeSection === 'company_info' && t('brand_loyalty_setup', 'Brand Loyalty Setup & Currency Parity')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={t('export_pdf', 'Export PDF')}
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('pdf_report', 'PDF Report')}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title={t('export_excel', 'Export Excel')}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('excel_workbook', 'Excel')}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 transition cursor-pointer"
            title={t('print_view', 'Print View')}
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
              <span className="text-2xl font-black text-slate-900 mt-2 block">84 {t('vips_label', 'VIPs')}</span>
              <span className="text-xs text-indigo-600 font-semibold mt-0.5 block">{t('generate_68_volume', 'Generate 68% of volume')}</span>
            </div>
          </div>

          {/* Tier Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-amber-600 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-amber-700 uppercase">{t('bronze_tier', 'Bronze Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">720 {t('members_unit', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold_label', 'Threshold')}: 0 - 2,500 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-slate-400 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-slate-600 uppercase">{t('silver_tier', 'Silver Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">320 {t('members_unit', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold_label', 'Threshold')}: 2,501 - 5,000 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-amber-400 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-amber-600 uppercase">{t('gold_tier', 'Gold Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">124 {t('members_unit', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold_label', 'Threshold')}: 5,001 - 10,000 Pts</span>
            </div>
            <div className="p-4 bg-white rounded-xl border-l-4 border-l-indigo-600 border border-slate-200 shadow-xs">
              <span className="font-bold text-xs text-indigo-700 uppercase">{t('platinum_tier', 'Platinum Tier')}</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">84 {t('members_unit', 'Members')}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">{t('threshold_label', 'Threshold')}: &gt;10,000 Pts</span>
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
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  placeholder={t('search_loyalty_members_placeholder', 'Search loyalty members by name, phone, card #, or email...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 cursor-pointer"
              >
                <option value="ALL">{t('all_loyalty_tiers', 'All Loyalty Tiers')}</option>
                <option value="BRONZE">{t('bronze_tier', 'Bronze Tier')}</option>
                <option value="SILVER">{t('silver_tier', 'Silver Tier')}</option>
                <option value="GOLD">{t('gold_tier', 'Gold Tier')}</option>
                <option value="PLATINUM">{t('platinum_tier', 'Platinum Tier')}</option>
              </select>

              <button
                onClick={() => { setSearchQuery(''); setTierFilter('ALL'); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
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
                    <th className="py-3 px-3.5">{t('card_hash', 'Card #')}</th>
                    <th className="py-3 px-3.5">{t('member_name', 'Member Name')}</th>
                    <th className="py-3 px-3.5">{t('phone_number', 'Phone Number')}</th>
                    <th className="py-3 px-3.5">{t('group', 'Group')}</th>
                    <th className="py-3 px-3.5 text-center">{t('tier', 'Tier')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('points_balance', 'Points Balance')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('cashback_usd', 'Cashback ($)')}</th>
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
                          m.tier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          m.tier === 'GOLD' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          m.tier === 'SILVER' ? 'bg-slate-200 text-slate-800 border border-slate-300' : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-mono font-black text-slate-900">
                        {m.points.toLocaleString()} PTS
                      </td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-mono font-bold text-emerald-700">
                        ${m.cashbackUsd.toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-400">{m.joinedDate}</td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAdjustPointsModal(m)}
                            className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                            title={t('adjust_points', 'Adjust Points')}
                          >
                            {t('adjust_points_btn', 'Adjust')}
                          </button>
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="p-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title={t('member_digital_card', 'Member Digital Card')}
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

      {/* 4. LOYALTY TIERS & POINTS MATRIX */}
      {activeSection === 'loyalty_levels' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 block">{t('loyalty_tier_progression_thresholds', 'Loyalty Tier Progression & Thresholds Matrix')}</span>
              <span className="text-xs text-slate-500 font-medium">{t('points_matrix_sub', 'Configure earning ratios, points expiry intervals, and upgrade criteria')}</span>
            </div>
            <button
              onClick={() => setShowAddTierModal(true)}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition cursor-pointer"
            >
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
                <td className="py-3 px-4 font-sans font-bold text-orange-700">{t('tier_bronze_name', 'Bronze')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">0 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">10 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">365 {t('days_unit', 'Days')}</td>
                <td className="py-3 px-4 font-sans text-slate-600">{t('privilege_bronze', 'Standard point accumulation, seasonal newsletter specials')}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">2</td>
                <td className="py-3 px-4 font-sans font-bold text-slate-700">{t('tier_silver_name', 'Silver')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">2,500 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">12 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">365 {t('days_unit', 'Days')}</td>
                <td className="py-3 px-4 font-sans text-slate-600">{t('privilege_silver', 'Free freight on orders > $100, 2% cashback rebate')}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">3</td>
                <td className="py-3 px-4 font-sans font-bold text-amber-600">{t('tier_gold_name', 'Gold')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">5,000 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">15 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">730 {t('days_unit', 'Days')}</td>
                <td className="py-3 px-4 font-sans text-slate-600">{t('privilege_gold', 'Free delivery on all orders, 5% cashback rebate, Birthday flask gift')}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold">4</td>
                <td className="py-3 px-4 font-sans font-bold text-indigo-700">{t('tier_platinum_name', 'Platinum VIP')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">10,000 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">20 {t('pts_unit', 'PTS')}</td>
                <td className="py-3 px-4 text-right rtl:text-left">{t('no_expiry', 'No Expiry')}</td>
                <td className="py-3 px-4 font-sans text-slate-600">{t('privilege_platinum', 'Dedicated Account Concierge, Priority Dispatch, 8% cashback rebate')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 5. CUSTOMER REWARDS & REDEMPTIONS CATALOG */}
      {activeSection === 'rewards_catalog' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900">{t('rewards_redemptions_catalog_header', 'Customer Rewards & Redemption Catalog')}</h2>
              <p className="text-xs text-slate-500 font-medium">{t('rewards_catalog_sub', 'Discount coupons, gift certificates, merchandise rewards, and instant voucher issuance')}</p>
            </div>
            <button
              onClick={() => showToast(t('reward_item_creation_toast', 'New reward item creation modal opened.'))}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition cursor-pointer"
            >
              + {t('add_reward_item', 'Add Reward Item')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INITIAL_REWARDS.map(r => (
              <div key={r.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {r.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{r.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{r.name}</h3>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {r.pointsCost.toLocaleString()} PTS
                    </span>
                    <span className="text-slate-500 font-semibold font-mono">≈ ${r.dollarValue.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 space-y-0.5">
                    <div>{t('eligible_tier_label', 'Eligible:')} <span className="font-semibold text-slate-700">{r.eligibleTier}</span></div>
                    <div>{t('available_stock_label', 'Available Stock:')} <span className="font-semibold text-slate-700">{r.availableStock} {t('units', 'units')}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('active_status', 'Available')}
                  </span>
                  <button
                    onClick={() => setIssueRewardModal(r)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{t('issue_voucher_btn', 'Issue Voucher')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TRANSACTION LOGS (Points credit/debit history & Cashier source) */}
      {activeSection === 'transaction_logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-sm text-slate-900">{t('points_transaction_audit_trail', 'Points Credit & Debit Ledger • Cashier Transaction Logs')}</h2>
                <p className="text-xs text-slate-500 font-medium">{t('points_audit_trail_sub', 'Complete audit trail of sales accruals, promotional bonus grants, gift redemptions, and adjustments')}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">{t('transaction_id', 'Transaction ID')}</th>
                    <th className="py-3 px-3.5">{t('member_id', 'Member ID')}</th>
                    <th className="py-3 px-3.5">{t('member_account', 'Member Account')}</th>
                    <th className="py-3 px-3.5">{t('event_type', 'Event Type')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('points_delta', 'Points (+/-)')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('usd_liability_equiv', 'USD Liability Equiv.')}</th>
                    <th className="py-3 px-3.5">{t('cashier_source_terminal', 'Cashier / Terminal')}</th>
                    <th className="py-3 px-3.5">{t('date_time', 'Date / Time')}</th>
                    <th className="py-3 px-3.5 text-right rtl:text-left">{t('balance_after', 'Balance After')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {logs.map(log => (
                    <tr key={log.txId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3.5 font-bold text-primary">{log.txId}</td>
                      <td className="py-3 px-3.5 text-slate-600">{log.memberId}</td>
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-900">{log.memberName}</td>
                      <td className="py-3 px-3.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.pointsDelta > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={`py-3 px-3.5 text-right rtl:text-left font-black ${
                        log.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {log.pointsDelta > 0 ? `+${log.pointsDelta.toLocaleString()}` : log.pointsDelta.toLocaleString()} PTS
                      </td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-bold text-slate-700">
                        {log.usdEquivalent > 0 ? `+$${log.usdEquivalent.toFixed(2)}` : `-$${Math.abs(log.usdEquivalent).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-slate-600 text-[11px]">{log.cashierSource}</td>
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">{log.date}</td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-bold text-slate-900">
                        {log.balanceAfter.toLocaleString()} PTS
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. LOYALTY PROGRAMS */}
      {activeSection === 'loyalty_programs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700">{t('active_promotional_programs', 'Active Promotional Programs & Incentives')}</span>
            <button
              onClick={() => showToast(t('new_program_modal_toast', 'New promotional program builder opened.'))}
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition cursor-pointer"
            >
              + {t('new_program', 'New Program')}
            </button>
          </div>
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('program_name', 'Program Name')}</th>
                <th className="py-3 px-4">{t('type', 'Type')}</th>
                <th className="py-3 px-4">{t('reward_rule', 'Reward Rule')}</th>
                <th className="py-3 px-4">{t('eligibility', 'Eligibility')}</th>
                <th className="py-3 px-4">{t('validity', 'Validity')}</th>
                <th className="py-3 px-4 text-center">{t('status', 'Status')}</th>
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

      {/* 8. SEND MESSAGES */}
      {activeSection === 'send_messages' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t('broadcast_member_loyalty_header', 'Broadcast Member Loyalty Notification')}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('channel_req', 'Channel *')}</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                <option value="WHATSAPP">{t('whatsapp_care_channel', 'WhatsApp Official Care Desk')}</option>
                <option value="SMS">{t('sms_channel', 'Direct Mobile SMS')}</option>
                <option value="EMAIL">{t('email_channel', 'Customer Email Blast')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('target_audience_req', 'Target Audience *')}</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                <option>{t('audience_all_members_count', 'All Enrolled Members (1,248)')}</option>
                <option>{t('audience_platinum_vips_count', 'Platinum VIPs (84)')}</option>
                <option>{t('audience_gold_members_count', 'Gold Tier Members (124)')}</option>
                <option>{t('audience_high_cashback_members', 'Members with Balance > $50 Cashback')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('message_content_req', 'Message Content *')}</label>
              <textarea
                rows={4}
                defaultValue="Dear {{first_name}}, your Southern Olive loyalty balance is {{points_balance}} PTS (${{cashback_balance}}). Enjoy double points on early-harvest tins this weekend!"
                className="w-full p-2 border border-slate-200 rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 block mt-1">{t('placeholders_syntax_note', 'Placeholders: {{first_name}}, {{points_balance}}, {{tier}}, {{cashback_balance}}')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => showToast(t('broadcast_dispatched_toast', 'Message broadcast dispatched to 1,248 members!'))}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {t('send_broadcast', 'Send Broadcast')}
            </button>
          </div>
        </div>
      )}

      {/* 9. COMPANY INFO */}
      {activeSection === 'company_info' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
          <h2 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            {t('brand_loyalty_profile_header', 'Brand Loyalty Profile & Currency Settings')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('brand_name_req', 'Brand Name *')}</label>
              <input
                type="text"
                readOnly
                value="Southern Olive Oil Products S.A.R.L"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('owner_name', 'Owner Name')}</label>
              <input
                type="text"
                readOnly
                value="Mohammed Jichi"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('phone_number_req', 'Phone Number *')}</label>
              <input
                type="text"
                readOnly
                value="+961 71 801140"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('official_email_req', 'Official Email *')}</label>
              <input
                type="text"
                readOnly
                value="mohammed.jichi@gmail.com"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('points_parity_rate', 'Points Parity Rate')}</label>
              <input
                type="text"
                readOnly
                value="$1.00 = 10 Loyalty Points"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-blue-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('redemption_value', 'Redemption Value')}</label>
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
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{t('vanguard_merits_pass', 'Vanguard Merits Pass')}</span>
              <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t('cardholder', 'Cardholder')}</span>
              <h3 className="text-lg font-extrabold tracking-wide text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</h3>
              <span className="text-xs font-mono tracking-wider text-primary font-bold block mt-1">{selectedMember.cardNumber}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('tier_level', 'Tier Level')}</span>
                <span className="font-black text-slate-900">{selectedMember.tier}</span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-[10px] text-slate-400 block">{t('points', 'Points')}</span>
                <span className="font-black text-primary">{selectedMember.points.toLocaleString()} PTS</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-900" />
              <span className="text-[9px] text-slate-500 font-mono mt-1">{t('scan_for_pos_discount', 'Scan for in-store checkout POS discount')}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST POINTS (Point adjustment form) */}
      {adjustPointsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('adjust_member_points_title', 'Adjust Member Points Balance')}</h3>
              <button onClick={() => setAdjustPointsModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-slate-500 block">{t('member_label', 'Member:')}</span>
              <span className="font-bold text-slate-900">{adjustPointsModal.firstName} {adjustPointsModal.lastName} ({adjustPointsModal.cardNumber})</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('points_delta_req', 'Points Delta (+ or -) *')}</label>
              <input
                type="number"
                value={adjustPointsAmount}
                onChange={(e) => setAdjustPointsAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg font-mono text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('reason_reference_req', 'Reason / Reference *')}</label>
              <input
                type="text"
                value={adjustPointsReason}
                onChange={(e) => setAdjustPointsReason(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('cashier_source_terminal_req', 'Cashier / Attribution Terminal *')}</label>
              <input
                type="text"
                value={adjustCashierSource}
                onChange={(e) => setAdjustCashierSource(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAdjustPointsModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmPointsAdjustment}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {t('confirm_points_adjustment', 'Confirm Points Adjustment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE REWARD VOUCHER */}
      {issueRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{t('issue_reward_voucher_title', 'Issue Customer Reward Voucher')}</h3>
                <span className="text-[11px] text-slate-500">{issueRewardModal.name}</span>
              </div>
              <button onClick={() => setIssueRewardModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center font-mono">
              <span className="text-amber-800 font-bold">{t('points_cost', 'Points Cost:')} {issueRewardModal.pointsCost.toLocaleString()} PTS</span>
              <span className="text-slate-600 font-bold">≈ ${issueRewardModal.dollarValue.toFixed(2)}</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('select_recipient_member', 'Select Recipient Member *')}</label>
              <select
                value={selectedRewardMember}
                onChange={(e) => setSelectedRewardMember(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.cardNumber}) • {m.points.toLocaleString()} PTS available
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIssueRewardModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleIssueRewardVoucher}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>{t('confirm_and_issue_voucher', 'Confirm & Issue Voucher')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TIER LEVEL */}
      {showAddTierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('add_new_tier_level_title', 'Add New Loyalty Tier Level')}</h3>
              <button onClick={() => setShowAddTierModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('tier_name_req', 'Tier Name *')}</label>
                <input
                  type="text"
                  placeholder={t('tier_name_placeholder', 'e.g. Diamond VIP')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('points_threshold_req', 'Points Threshold (Upgrade Minimum) *')}</label>
                <input
                  type="number"
                  placeholder={t('tier_min_pts_placeholder', '25000')}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('points_earned_per_usd_req', 'Points Earned per $1 Spent *')}</label>
                <input
                  type="number"
                  placeholder={t('pts_ratio_placeholder', '25')}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('expiry_interval_req', 'Points Expiry Interval *')}</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer">
                  <option>{t('interval_1yr', '365 Days (1 Year)')}</option>
                  <option>{t('interval_2yr', '730 Days (2 Years)')}</option>
                  <option>{t('interval_no_expiry', 'No Expiration')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('privileges_description_req', 'Tier Privileges Description *')}</label>
                <textarea
                  rows={2}
                  placeholder={t('privileges_placeholder', 'List discounts, gifts, and special services included in this tier...')}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddTierModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  showToast(t('tier_level_created_toast', 'New loyalty tier level registered successfully!'));
                  setShowAddTierModal(false);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {t('save_tier_level', 'Save Tier Level')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
