'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Calendar
} from 'lucide-react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  ReportCategoryGroup,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import { getLoyaltyTierTextClass, getReportStatusTextClass } from '@/components/reports/reportContrastTokens';
import UnifiedLoyaltyManagementConsole from '@/components/modules/loyalty/UnifiedLoyaltyManagementConsole';

// ============================================================================
// 1. OMEGA LOYALTY REPORT NAVIGATION TREE
// ============================================================================

const LOYALTY_REPORT_TREE: ReportCategoryGroup[] = [
  {
    title: 'Recommended',
    items: [
      'Loyalty Program Members Roster',
      'Points Accrual & Redemption Ledger',
      'Tier Progression & Upgrade Velocity',
    ],
  },
  {
    title: 'Member Activity & Engagement',
    items: [
      'Member Activity Audit',
      'Loyalty Program Members Roster',
      'New Registrations Log',
      'Churn Risk Members',
    ],
  },
  {
    title: 'Points Ledgers & Financial Liability',
    items: [
      'Points Accrual & Redemption Ledger',
      'Points Expiration Forecast',
      'Financial Liability Statement',
    ],
  },
  {
    title: 'Campaigns & Programs',
    items: [
      'Loyalty Promotion Conversion Rate',
      'Tier Progression & Upgrade Velocity',
      'Campaign ROI Report',
    ],
  },
];

// ============================================================================
// 2. MOCK DATASETS
// ============================================================================

const MEMBERS_DATA = [
  { id: 'MEM-0941', name: 'Al-Bustan Restaurant Group', tier: 'PLATINUM', points: 14250, joinDate: '2025-03-10', spendUsd: '$38,400', lastActive: '2026-09-14', status: 'ACTIVE' },
  { id: 'MEM-0942', name: 'Cedar Hospitality LLC', tier: 'GOLD', points: 8920, joinDate: '2025-06-14', spendUsd: '$21,800', lastActive: '2026-09-12', status: 'ACTIVE' },
  { id: 'MEM-0943', name: 'Verdun Fine Foods S.A.L', tier: 'GOLD', points: 6410, joinDate: '2025-08-01', spendUsd: '$16,500', lastActive: '2026-09-08', status: 'ACTIVE' },
  { id: 'MEM-0944', name: 'Mina Seaside Resort', tier: 'SILVER', points: 3820, joinDate: '2025-11-20', spendUsd: '$9,200', lastActive: '2026-08-25', status: 'ACTIVE' },
  { id: 'MEM-0945', name: 'Phoenicia Bakery Chain', tier: 'PLATINUM', points: 21900, joinDate: '2024-12-05', spendUsd: '$54,100', lastActive: '2026-09-15', status: 'ACTIVE' },
  { id: 'MEM-0946', name: 'Southern Heritage Bistro', tier: 'BRONZE', points: 1250, joinDate: '2026-02-18', spendUsd: '$3,400', lastActive: '2026-07-10', status: 'CHURN_RISK' },
  { id: 'MEM-0947', name: 'Byblos Gourmet Deli', tier: 'SILVER', points: 4100, joinDate: '2026-04-02', spendUsd: '$11,600', lastActive: '2026-09-11', status: 'ACTIVE' },
  { id: 'MEM-0948', name: 'Batroun Coast Lounge', tier: 'BRONZE', points: 890, joinDate: '2026-06-15', spendUsd: '$2,100', lastActive: '2026-06-20', status: 'INACTIVE' },
];

const POINTS_LEDGER_DATA = [
  { txId: 'PTX-8801', memberId: 'MEM-0941', memberName: 'Al-Bustan Restaurant Group', type: 'PURCHASE_ACCRUAL', points: '+1,450', usdValue: '$14.50', date: '2026-09-14', balanceAfter: '14,250 pts' },
  { txId: 'PTX-8802', memberId: 'MEM-0945', memberName: 'Phoenicia Bakery Chain', type: 'BULK_ORDER_BONUS', points: '+2,500', usdValue: '$25.00', date: '2026-09-13', balanceAfter: '21,900 pts' },
  { txId: 'PTX-8803', memberId: 'MEM-0942', memberName: 'Cedar Hospitality LLC', type: 'GIFT_REDEMPTION', points: '-5,000', usdValue: '-$50.00', date: '2026-09-10', balanceAfter: '8,920 pts' },
  { txId: 'PTX-8804', memberId: 'MEM-0943', memberName: 'Verdun Fine Foods S.A.L', type: 'HARVEST_PROMO', points: '+800', usdValue: '$8.00', date: '2026-09-08', balanceAfter: '6,410 pts' },
  { txId: 'PTX-8805', memberId: 'MEM-0944', memberName: 'Mina Seaside Resort', type: 'DISCOUNT_VOUCHER', points: '-2,000', usdValue: '-$20.00', date: '2026-08-25', balanceAfter: '3,820 pts' },
  { txId: 'PTX-8806', memberId: 'MEM-0947', memberName: 'Byblos Gourmet Deli', type: 'PURCHASE_ACCRUAL', points: '+620', usdValue: '$6.20', date: '2026-08-20', balanceAfter: '4,100 pts' },
];

const CAMPAIGNS_DATA = [
  { code: 'CMP-2026-01', name: '2026 Early Harvest Reserve Promo', targetTier: 'All Tiers', qualifyingOrders: 142, conversionRate: '34.2%', liftPct: '+28.4%', revenueUsd: '$48,200', roi: '380%' },
  { code: 'CMP-2026-02', name: 'VIP Gold to Platinum Fast-Track', targetTier: 'Gold Only', qualifyingOrders: 28, conversionRate: '41.5%', liftPct: '+36.0%', revenueUsd: '$31,500', roi: '450%' },
  { code: 'CMP-2026-03', name: 'Culinary Hospitality Bulk Tin Rebate', targetTier: 'Silver, Gold, Platinum', qualifyingOrders: 64, conversionRate: '29.8%', liftPct: '+22.1%', revenueUsd: '$59,000', roi: '520%' },
  { code: 'CMP-2026-04', name: 'Summer Season Churn Prevention Incentive', targetTier: 'Bronze / At Risk', qualifyingOrders: 19, conversionRate: '18.4%', liftPct: '+11.5%', revenueUsd: '$9,800', roi: '210%' },
];

import {
  LOYALTY_MANAGEMENT_OMEGA_TREE,
  getLoyaltyReportMeta,
} from '@/components/reports/loyaltyReportsTree';
import { SharedReportViewer, isSharedReport } from '@/components/reports/registry';

function LoyaltyManagementContent() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get('section') || 'reports';

  const [selectedReport, setSelectedReport] = useState<string>('Best Customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [loyaltyFilterValues, setLoyaltyFilterValues] = useState<Record<string, any>>({});

  const activeMeta = useMemo(() => getLoyaltyReportMeta(selectedReport), [selectedReport]);

  const handleSelectReport = (reportName: string) => {
    setSelectedReport(reportName);
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vanguard_recent_reports_loyalty');
        const prev = stored ? JSON.parse(stored) : [];
        if (Array.isArray(prev)) {
          const updated = [reportName, ...prev.filter((r: string) => r !== reportName)].slice(0, 5);
          localStorage.setItem('vanguard_recent_reports_loyalty', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('[handleSelectReport] loyalty error:', err);
    }
  };

  const metrics = [
    {
      id: 'ly-members-count',
      title: 'Active Loyalty Members',
      value: '1,420 Clients',
      change: { value: '+12.8% this quarter', trend: 'up' as const },
      subtext: '348 VIP & Platinum tier accounts',
      icon: <Users className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'ly-points-issued',
      title: 'Total Points Issued',
      value: '2.84M Pts',
      change: { value: '88% redemption rate', trend: 'up' as const },
      subtext: 'Olive harvest reward program active',
      icon: <Coins className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'ly-tiers',
      title: 'Loyalty Tiers',
      value: '4 Levels',
      change: { value: 'Bronze, Silver, Gold, Platinum', trend: 'neutral' as const },
      subtext: 'Tier qualification review every 90 days',
      icon: <Crown className="w-5 h-5 text-purple-600" />
    },
    {
      id: 'ly-retention',
      title: 'Repeat Purchase Rate',
      value: '78.4%',
      change: { value: '+5.1% program lift', trend: 'up' as const },
      subtext: 'Average member basket: $340',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />
    }
  ];

  // Determine active view mode based on selected report
  const isPointsView =
    selectedReport.includes('Points') ||
    selectedReport.includes('Cashback') ||
    selectedReport.includes('Expiry') ||
    selectedReport.includes('Redeemed');

  const isCampaignsView =
    selectedReport.includes('Campaign') ||
    selectedReport.includes('Conversion') ||
    selectedReport.includes('Progression');

  const filteredMembers = useMemo(() => {
    return MEMBERS_DATA.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === 'ALL' || m.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [searchQuery, tierFilter]);

  const filteredPoints = useMemo(() => {
    return POINTS_LEDGER_DATA.filter((p) => {
      return (
        p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.txId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const filteredCampaigns = useMemo(() => {
    return CAMPAIGNS_DATA.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <ReportPageLayout
      moduleTitle="Loyalty Management"
      moduleKey="loyalty"
      storageKeyOverride="vanguard_recent_reports_loyalty"
      categories={LOYALTY_MANAGEMENT_OMEGA_TREE}
      selectedReport={selectedReport}
      onSelectReport={handleSelectReport}
      header={
        <ReportHeader
          title={activeMeta.name}
          subtitle="Customer loyalty points, membership rewards, cashback ledgers, and transaction auditing"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice' },
            { label: '3. Loyalty Management', href: '/loyalty/reports' },
            { label: activeMeta.category },
            { label: activeMeta.name }
          ]}
          reportCode={activeMeta.code}
          badgeText="LOYALTY LEDGER"
          badgeVariant="success"
          actions={
            <ExportButtons
              onPrint={() => window.print()}
              onExportPdf={() => window.print()}
              onExportExcel={() => alert(`Exporting ${activeMeta.name} to Excel (.xlsx)...`)}
              onExportCsv={() => alert(`Exporting ${activeMeta.name} to CSV...`)}
            />
          }
        />
      }
      metrics={<ReportMetricCards metrics={metrics} />}
      // 3. Dynamic Filter Engine
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={selectedReport}
          module="loyalty"
          values={{
            tierFilter,
            searchQuery,
            ...loyaltyFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.tierFilter !== undefined) setTierFilter(newVals.tierFilter);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            setLoyaltyFilterValues(newVals);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${activeMeta.name}`)}
          onResetFilters={() => {
            setSearchQuery('');
            setTierFilter('ALL');
            setLoyaltyFilterValues({});
          }}
        />
      }
      table={
        <>
          {/* A. SHARED COMPONENT REUSE (DRY Principle): Reuses shared customer/transaction views */}
          {isSharedReport(selectedReport) && (
            <SharedReportViewer
              reportName={selectedReport}
              moduleContext="loyalty"
              searchQuery={searchQuery}
            />
          )}

          {/* B. VIEW 1: POINTS & FINANCIAL LIABILITY LEDGER */}
          {!isSharedReport(selectedReport) && isPointsView && (
            <ReportTableWrapper
              title={`${selectedReport} Register`}
              subtitle="Consolidated loyalty point accruals, redemptions, USD liability conversions, and expiration schedule"
              totalRecordsCount={filteredPoints.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">Transaction ID</th>
                      <th className="py-2 px-3">Member ID</th>
                      <th className="py-2 px-3">Member Account</th>
                      <th className="py-2 px-3">Event Type</th>
                      <th className="py-2 px-3 text-right">Points (+/-)</th>
                      <th className="py-2 px-3 text-right">USD Liability Equiv.</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredPoints.map((row) => (
                      <tr key={row.txId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{row.txId}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{row.memberId}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{row.memberName}</td>
                        <td className="py-2 px-3">
                          <span className={
                            row.type.includes('ACCRUAL') || row.type.includes('BONUS') || row.type.includes('PROMO')
                              ? 'text-emerald-700 font-bold tracking-wide uppercase text-xs'
                              : 'text-amber-800 font-bold tracking-wide uppercase text-xs'
                          }>
                            {row.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${row.points.startsWith('+') ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {row.points}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.usdValue}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{row.date}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* VIEW 2: CAMPAIGNS & PROMOTION PERFORMANCE */}
          {!isSharedReport(selectedReport) && isCampaignsView && (
            <ReportTableWrapper
              title={`${selectedReport} Dashboard`}
              subtitle="Promotional campaign efficacy, qualifying ticket volume, redemption lift, and financial return on investment"
              totalRecordsCount={filteredCampaigns.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">Campaign Code</th>
                      <th className="py-2 px-3">Campaign Program Name</th>
                      <th className="py-2 px-3">Target Tier</th>
                      <th className="py-2 px-3 text-right">Qualifying Orders</th>
                      <th className="py-2 px-3 text-right">Conversion Rate</th>
                      <th className="py-2 px-3 text-right">Redemption Lift</th>
                      <th className="py-2 px-3 text-right">Incremental Revenue</th>
                      <th className="py-2 px-3 text-right">Program ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredCampaigns.map((row) => (
                      <tr key={row.code} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">{row.code}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                        <td className="py-2 px-3 font-bold text-slate-800 text-xs">{row.targetTier}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.qualifyingOrders}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">{row.conversionRate}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{row.liftPct}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.revenueUsd}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{row.roi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* VIEW 3: MEMBERS ACTIVITY & ROSTER (DEFAULT) */}
          {!isSharedReport(selectedReport) && !isPointsView && !isCampaignsView && (
            <ReportTableWrapper
              title={`${selectedReport} Register`}
              subtitle="Active loyalty accounts, tier status, lifetime spend metrics, and engagement audit log"
              totalRecordsCount={filteredMembers.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">Member ID</th>
                      <th className="py-2 px-3">Account / Client Name</th>
                      <th className="py-2 px-3 text-center">Loyalty Level</th>
                      <th className="py-2 px-3 text-right">Points Balance</th>
                      <th className="py-2 px-3 text-right">Lifetime Spend</th>
                      <th className="py-2 px-3">Enrollment Date</th>
                      <th className="py-2 px-3">Last Activity</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredMembers.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">{row.id}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={getLoyaltyTierTextClass(row.tier)}>
                            {row.tier}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">{row.points.toLocaleString()} pts</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{row.spendUsd}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{row.joinDate}</td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{row.lastActive}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={getReportStatusTextClass(row.status)}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}
        </>
      }
    />
  );
}

function LoyaltyManagementPageRouter() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  if (section === 'reports') {
    return <LoyaltyManagementContent />;
  }
  return <UnifiedLoyaltyManagementConsole />;
}

export default function LoyaltyManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Loyalty Management...</div>}>
      <LoyaltyManagementPageRouter />
    </Suspense>
  );
}
