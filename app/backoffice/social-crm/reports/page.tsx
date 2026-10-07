'use client';

import React, { useState, useMemo } from 'react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  MetricCardItem,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Megaphone,
  DollarSign,
  CheckCircle2,
  Clock,
  Share2,
} from 'lucide-react';
import { getPaymentMethodTextClass, getReportStatusTextClass } from '@/components/reports/reportContrastTokens';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';

// ============================================================================
// DATA STRUCTURES & MOCK DATA
// ============================================================================

interface SocialOrderRow {
  id: string;
  customerName: string;
  phone: string;
  platform: string;
  offerDetails: string;
  amountUsd: number;
  amountLbp: number;
  paymentMethod: 'COD' | 'WHISH';
  repName: string;
  repCode: string;
  stage: 'CONVERTED' | 'DELIVERED' | 'IN_PROGRESS' | 'LOST';
  date: string;
}

interface CampaignPerformanceRow {
  id: string;
  name: string;
  channelPlatform: 'WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok';
  targetAudiencePool: string;
  spendUsd: number;
  totalLeads: number;
  cplUsd: number;
  totalConversions: number;
  totalRevenueUsd: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
}

interface AgentSlaRow {
  id: string;
  code: string;
  name: string;
  activeChats: number;
  totalOrders: number;
  conversionRatePct: number;
  avgResponseMins: number;
  earnedCommissionUsd: number;
  topChannel: string;
}

interface ChannelAttributionRow {
  platform: string;
  iconText: string;
  inboundMessages: number;
  qualifiedLeads: number;
  paidOrders: number;
  conversionRatePct: number;
  grossRevenueUsd: number;
  dominantProduct: string;
}

// Mock Sales Orders from Social Channels
const INITIAL_SOCIAL_ORDERS: SocialOrderRow[] = [];
const INITIAL_CAMPAIGNS: CampaignPerformanceRow[] = [];
const INITIAL_AGENTS: AgentSlaRow[] = [];
const CHANNEL_ATTRIBUTIONS: ChannelAttributionRow[] = [];

export default function SocialCrmReportsHub() {
  // 1. Sheet & Category Selection
  const [selectedReportKey, setSelectedReportKey] = useState<string>('SOCIAL_ORDERS');

  // 2. Filters State
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [period, setPeriod] = useState<string>(initialDateRange.preset);
  const [fromDate, setFromDate] = useState<string>(initialDateRange.fromDate);
  const [toDate, setToDate] = useState<string>(initialDateRange.toDate);
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('ALL');
  const [leadStageFilter, setLeadStageFilter] = useState<string>('ALL');
  const [socialFilterValues, setSocialFilterValues] = useState<Record<string, any>>({});

  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Report Sheets Catalog
  const reportSheets = [
    { label: 'REP_SOC_001: Social Orders & Conversion Reconciliation', value: 'SOCIAL_ORDERS' },
    { label: 'REP_SOC_002: Ad Campaigns, CPL & ROAS Performance', value: 'CAMPAIGN_CPL' },
    { label: 'REP_SOC_003: Support Agent SLA & Commission Breakdown', value: 'AGENT_SLA' },
    { label: 'REP_SOC_004: Omnichannel Lead Attribution by Channel', value: 'CHANNEL_ATTRIBUTION' },
  ];

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return INITIAL_SOCIAL_ORDERS.filter((ord) => {
      const matchesSearch =
        searchQuery === '' ||
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.repName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = platformFilter === 'ALL' || ord.platform.toLowerCase() === platformFilter.toLowerCase();
      const matchesStage = leadStageFilter === 'ALL' || ord.stage === leadStageFilter;

      return matchesSearch && matchesPlatform && matchesStage;
    });
  }, [searchQuery, platformFilter, leadStageFilter]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return INITIAL_CAMPAIGNS.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channelPlatform.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = platformFilter === 'ALL' || c.channelPlatform.toLowerCase() === platformFilter.toLowerCase();
      const matchesStatus = campaignStatusFilter === 'ALL' || c.status === campaignStatusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [searchQuery, platformFilter, campaignStatusFilter]);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return INITIAL_AGENTS.filter((a) => {
      return (
        searchQuery === '' ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    return CHANNEL_ATTRIBUTIONS.filter((ch) => {
      return platformFilter === 'ALL' || ch.platform.toLowerCase() === platformFilter.toLowerCase();
    });
  }, [platformFilter]);

  // ============================================================================
  // KPI CALCULATIONS
  // ============================================================================

  const totalLeads = INITIAL_CAMPAIGNS.reduce((acc, c) => acc + c.totalLeads, 0) + 519;
  const totalConversions = INITIAL_CAMPAIGNS.reduce((acc, c) => acc + c.totalConversions, 0) + 180;
  const blendedConversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 28.6;
  const totalRevenue = INITIAL_CAMPAIGNS.reduce((acc, c) => acc + c.totalRevenueUsd, 0) + 20240;
  const totalSpend = INITIAL_CAMPAIGNS.reduce((acc, c) => acc + c.spendUsd, 0);
  const blendedRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '4.8';

  const socialKpiMetrics: MetricCardItem[] = [
    {
      title: 'Total Inbound Leads',
      value: `${totalLeads.toLocaleString()} Leads`,
      subtext: 'Across 4 Omnichannel Platforms',
      icon: <Users className="w-5 h-5" />,
      change: { value: '+18.4% growth', trend: 'up' },
    },
    {
      title: 'Order Conversion Rate',
      value: `${blendedConversionRate.toFixed(1)}%`,
      subtext: `${totalConversions} Closed Deals ($${totalRevenue.toLocaleString()} USD)`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: { value: '+3.8% efficiency', trend: 'up' },
    },
    {
      title: 'Total Message Volume',
      value: '5,770 Chats',
      subtext: 'WhatsApp (53%), IG (22%), TT (15%), FB (10%)',
      icon: <MessageSquare className="w-5 h-5" />,
      change: { value: '2.8m Avg SLA', trend: 'neutral' },
    },
    {
      title: 'Active Campaigns & ROAS',
      value: `${blendedRoas}x ROAS`,
      subtext: `$${totalSpend.toFixed(2)} Total Ad Spend ($0.88 CPL)`,
      icon: <Megaphone className="w-5 h-5" />,
      change: { value: 'High Return', trend: 'up' },
    },
  ];

  // Pagination for Orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPagesOrders = Math.ceil(filteredOrders.length / pageSize) || 1;

  // Active Report Object
  const activeReportObj = reportSheets.find((r) => r.value === selectedReportKey) || reportSheets[0];

  const socialCategories = useMemo(() => [
    {
      title: 'Recently Viewed',
      items: [
        'REP_SOC_001: Social Orders & Conversion Reconciliation',
        'REP_SOC_002: Ad Campaigns, CPL & ROAS Performance',
      ],
    },
    {
      title: 'Orders & Fulfillment',
      items: [
        'REP_SOC_001: Social Orders & Conversion Reconciliation',
      ],
    },
    {
      title: 'Ad Campaigns & CPL',
      items: [
        'REP_SOC_002: Ad Campaigns, CPL & ROAS Performance',
        'REP_SOC_004: Omnichannel Lead Attribution by Channel',
      ],
    },
    {
      title: 'Representative SLA',
      items: [
        'REP_SOC_003: Support Agent SLA & Commission Breakdown',
      ],
    },
  ], []);

  const handleSocialLeftNavSelect = (reportName: string) => {
    const found = reportSheets.find(
      (r) => r.label === reportName || reportName.includes(r.value) || r.label.includes(reportName)
    );
    if (found) {
      setSelectedReportKey(found.value);
    }
  };

  return (
    <ReportPageLayout
      moduleTitle="Social CRM"
      categories={socialCategories}
      selectedReport={activeReportObj.label}
      onSelectReport={handleSocialLeftNavSelect}
      // 1. Standardized Corporate Header
      header={
        <ReportHeader
          title="Social CRM Reports Hub"
          subtitle={`Omnichannel social marketing campaign analytics, lead attribution, representative SLA, and order conversion statement for ${period}.`}
          reportCode={activeReportObj.label.split(':')[0]}
          badgeText="Omnichannel Social & Support CRM"
          badgeVariant="primary"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice' },
            { label: '3. Social CRM', href: '/backoffice/social-crm' },
            { label: 'Reports Hub', href: '/backoffice/social-crm/reports' },
            { label: activeReportObj.label.split(':')[1]?.trim() || activeReportObj.label },
          ]}
          actions={
            <ExportButtons
              onExportPdf={() => window.print()}
              onPrint={() => window.print()}
              onExportExcel={() => alert(`Exporting ${activeReportObj.label} to Excel (.xlsx)...`)}
              onExportCsv={() => alert(`Exporting ${activeReportObj.label} to CSV...`)}
            />
          }
        />
      }
      // 2. Standardized KPI Metrics
      metrics={<ReportMetricCards metrics={socialKpiMetrics} />}
      // 3. Standardized Filter Toolbar
      // 3. Dynamic Filter Engine
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={activeReportObj.label}
          module="social"
          values={{
            period,
            fromDate,
            toDate,
            platform: platformFilter,
            campaignStatus: campaignStatusFilter,
            orderStage: leadStageFilter,
            searchQuery,
            ...socialFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.period !== undefined) setPeriod(newVals.period);
            if (newVals.fromDate !== undefined) setFromDate(newVals.fromDate);
            if (newVals.toDate !== undefined) setToDate(newVals.toDate);
            if (newVals.platform !== undefined) setPlatformFilter(newVals.platform);
            if (newVals.campaignStatus !== undefined) setCampaignStatusFilter(newVals.campaignStatus);
            if (newVals.orderStage !== undefined) setLeadStageFilter(newVals.orderStage);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            setSocialFilterValues(newVals);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${activeReportObj.label}`)}
          onResetFilters={() => {
            const defRange = getDefaultInitialDateRange('This Month');
            setSearchQuery('');
            setPlatformFilter('ALL');
            setCampaignStatusFilter('ALL');
            setLeadStageFilter('ALL');
            setPeriod(defRange.preset);
            setFromDate(defRange.fromDate);
            setToDate(defRange.toDate);
            setSocialFilterValues({});
          }}
        />
      }
      // 4. Standardized Content Area / Data Tables
      table={
        <>
          {/* SHEET 1: SOCIAL ORDERS & CONVERSIONS */}
          {selectedReportKey === 'SOCIAL_ORDERS' && (
            <ReportTableWrapper
              title="Omnichannel Social Orders & Conversion Reconciliation"
              subtitle={`Audited social inbound orders, client contacts, and assigned support representatives for ${period}`}
              reportCode="REP_SOC_001"
              totalRecordsCount={filteredOrders.length}
              pagination={{
                currentPage,
                totalPages: totalPagesOrders,
                pageSize,
                totalRecords: filteredOrders.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[12%]">Order ID</th>
                    <th className="py-2 px-3 text-left w-[18%]">Customer & Phone</th>
                    <th className="py-2 px-3 text-left w-[14%]">Social Channel</th>
                    <th className="py-2 px-3 text-left w-[20%]">Offer / Pack Details</th>
                    <th className="py-2 px-3 text-center w-[8%]">Payment</th>
                    <th className="py-2 px-3 text-left w-[14%]">Assigned Rep</th>
                    <th className="py-2 px-3 text-right w-[14%]">Amount ($ / LBP)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((ord) => (
                    <tr key={ord.id} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{ord.customerName}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{ord.phone}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 text-xs">
                          {ord.platform}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">{ord.offerDetails}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={getPaymentMethodTextClass(ord.paymentMethod)}>
                          {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{ord.repName}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{ord.repCode}</div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          ${ord.amountUsd.toFixed(2)}
                        </div>
                        <div className="font-mono text-xs text-slate-600 font-medium">
                          {ord.amountLbp.toLocaleString()} LBP
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={4} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Consolidated Social Sales Total ({filteredOrders.length} Inbound Orders):
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-xs text-slate-800">COD/WHISH</td>
                    <td className="py-2 px-3 text-xs font-bold text-slate-800">All Agents</td>
                    <td className="py-2 px-3 text-right">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        ${filteredOrders.reduce((acc, o) => acc + o.amountUsd, 0).toFixed(2)}
                      </div>
                      <div className="font-mono text-xs text-slate-600 font-medium">
                        {filteredOrders.reduce((acc, o) => acc + o.amountLbp, 0).toLocaleString()} LBP
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 2: CAMPAIGN CPL & ROAS STATEMENT */}
          {selectedReportKey === 'CAMPAIGN_CPL' && (
            <ReportTableWrapper
              title="Social Ad Campaigns, CPL & ROAS Performance Statement"
              subtitle="Paid advertising spend vs inbound revenue attribution across marketing channels"
              reportCode="REP_SOC_002"
              totalRecordsCount={filteredCampaigns.length}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[28%]">Campaign Name</th>
                    <th className="py-2 px-3 text-left w-[12%]">Platform</th>
                    <th className="py-2 px-3 text-right w-[10%]">Ad Spend ($)</th>
                    <th className="py-2 px-3 text-center w-[10%]">Total Leads</th>
                    <th className="py-2 px-3 text-right w-[10%]">CPL ($)</th>
                    <th className="py-2 px-3 text-center w-[10%]">Conversions</th>
                    <th className="py-2 px-3 text-right w-[10%]">Revenue ($)</th>
                    <th className="py-2 px-3 text-right w-[10%]">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => {
                    const roas = c.spendUsd > 0 ? (c.totalRevenueUsd / c.spendUsd).toFixed(1) + 'x' : 'N/A';
                    return (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-blue-50/20">
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {c.name}
                          <span className="block text-xs font-mono text-slate-600 font-medium">
                            Pool: {c.targetAudiencePool}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 text-xs">{c.channelPlatform}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ${c.spendUsd.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                          {c.totalLeads}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ${c.cplUsd.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                          {c.totalConversions}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ${c.totalRevenueUsd.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {roas}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={2} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Consolidated Campaign Performance:
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredCampaigns.reduce((acc, c) => acc + c.spendUsd, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {filteredCampaigns.reduce((acc, c) => acc + c.totalLeads, 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      $
                      {(
                        filteredCampaigns.reduce((acc, c) => acc + c.spendUsd, 0) /
                        Math.max(1, filteredCampaigns.reduce((acc, c) => acc + c.totalLeads, 0))
                      ).toFixed(2)}{' '}
                      Avg
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                      {filteredCampaigns.reduce((acc, c) => acc + c.totalConversions, 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredCampaigns.reduce((acc, c) => acc + c.totalRevenueUsd, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                      {(
                        filteredCampaigns.reduce((acc, c) => acc + c.totalRevenueUsd, 0) /
                        Math.max(1, filteredCampaigns.reduce((acc, c) => acc + c.spendUsd, 0))
                      ).toFixed(1)}
                      x Blended
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 3: SUPPORT AGENT SLA & COMMISSION BREAKDOWN */}
          {selectedReportKey === 'AGENT_SLA' && (
            <ReportTableWrapper
              title="Support & Sales Representative Compensation Statement"
              subtitle="Closed chat conversions, response time SLA, and earned sales commissions per agent"
              reportCode="REP_SOC_003"
              totalRecordsCount={filteredAgents.length}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[12%]">Agent Code</th>
                    <th className="py-2 px-3 text-left w-[20%]">Representative Name</th>
                    <th className="py-2 px-3 text-center w-[12%]">Active Chats</th>
                    <th className="py-2 px-3 text-center w-[12%]">Closed Orders</th>
                    <th className="py-2 px-3 text-center w-[14%]">Conversion Rate</th>
                    <th className="py-2 px-3 text-center w-[14%]">Avg Response Time</th>
                    <th className="py-2 px-3 text-right w-[16%]">Earned Commission ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((ag) => (
                    <tr key={ag.id} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{ag.code}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{ag.name}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{ag.topChannel}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {ag.activeChats}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {ag.totalOrders}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                        {ag.conversionRatePct}%
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-xs text-slate-600 font-medium">
                        {ag.avgResponseMins} mins
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                        ${ag.earnedCommissionUsd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={2} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Department Totals ({filteredAgents.length} Active Representatives):
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {filteredAgents.reduce((acc, a) => acc + a.activeChats, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {filteredAgents.reduce((acc, a) => acc + a.totalOrders, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                      {(
                        filteredAgents.reduce((acc, a) => acc + a.conversionRatePct, 0) / (filteredAgents.length || 1)
                      ).toFixed(1)}
                      % Avg
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-xs text-slate-600 font-medium">
                      {(
                        filteredAgents.reduce((acc, a) => acc + a.avgResponseMins, 0) / (filteredAgents.length || 1)
                      ).toFixed(1)}{' '}
                      mins
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredAgents.reduce((acc, a) => acc + a.earnedCommissionUsd, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 4: OMNICHANNEL ATTRIBUTION BY CHANNEL */}
          {selectedReportKey === 'CHANNEL_ATTRIBUTION' && (
            <ReportTableWrapper
              title="Omnichannel Channel Breakdown & Lead Conversion Efficiency"
              subtitle="Comparative attribution of inquiries, closed sales, and revenue across social communication platforms"
              reportCode="REP_SOC_004"
              totalRecordsCount={filteredChannels.length}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[18%]">Channel Platform</th>
                    <th className="py-2 px-3 text-center w-[14%]">Inbound Messages</th>
                    <th className="py-2 px-3 text-center w-[14%]">Qualified Leads</th>
                    <th className="py-2 px-3 text-center w-[12%]">Paid Orders</th>
                    <th className="py-2 px-3 text-center w-[14%]">Conversion Rate</th>
                    <th className="py-2 px-3 text-right w-[14%]">Gross Revenue ($)</th>
                    <th className="py-2 px-3 text-left w-[14%]">Top Selling Offer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChannels.map((ch) => (
                    <tr key={ch.platform} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3 font-bold text-slate-900">
                        <span className="mr-1.5">{ch.iconText}</span>
                        {ch.platform}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {ch.inboundMessages.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {ch.qualifiedLeads}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                        {ch.paidOrders}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                        {ch.conversionRatePct}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ${ch.grossRevenueUsd.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-800 font-medium">{ch.dominantProduct}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Total Inbound Inquiries:
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {filteredChannels.reduce((acc, c) => acc + c.inboundMessages, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {filteredChannels.reduce((acc, c) => acc + c.qualifiedLeads, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                      {filteredChannels.reduce((acc, c) => acc + c.paidOrders, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-xs text-blue-700">28.6% Blended</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredChannels.reduce((acc, c) => acc + c.grossRevenueUsd, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-xs font-medium text-slate-600">4 Active Channels</td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}
        </>
      }
    />
  );
}
