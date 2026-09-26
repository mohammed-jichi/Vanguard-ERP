'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  UserCheck,
  Award,
  Star,
  RefreshCw,
  Sparkles,
  FileText,
  Info,
  Users,
  TrendingUp,
  DollarSign,
  UserX,
  Target,
  BarChart2,
  ShoppingBag,
  Zap,
  ChevronRight,
  ChevronDown,
  Download,
  Globe,
  MapPin,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Maximize2,
  ShieldCheck
} from 'lucide-react';

export interface CustomerInsightsViewProps {
  hideBreadcrumbs?: boolean;
}

export default function CustomerInsightsView({ hideBreadcrumbs = false }: CustomerInsightsViewProps) {
  const { t, dir } = useLanguage();
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [selectedGroup, setSelectedGroup] = useState<string>('All Groups');

  // Top 10 Buyers Expand State
  const [showAllBuyers, setShowAllBuyers] = useState<boolean>(false);

  // Panel Refresh Notification States
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const triggerRefreshToast = (panelName: string) => {
    setRefreshToast(t('panel_refreshed_toast', 'Refreshed {panel} panel successfully').replace('{panel}', panelName));
    setTimeout(() => setRefreshToast(null), 3000);
  };

  // Top 10 Buyers Data
  const topBuyersData = [
    { name: 'Shams Al-Janoub Resort & Restaurant', category: 'VIP Wholesale', ltv: 'LBP 1,450M', ordersCount: 42, avgTicket: 'LBP 34.5M' },
    { name: 'Al-Taawoniyah Grand Supermarket', category: 'Retail Chain', ltv: 'LBP 1,120M', ordersCount: 38, avgTicket: 'LBP 29.4M' },
    { name: 'Al-Baraka Distribution & Confectionery', category: 'Distributor', ltv: 'LBP 980M', ordersCount: 29, avgTicket: 'LBP 33.7M' },
    { name: 'Khiam Modern Pressing Facility', category: 'Industrial', ltv: 'LBP 850M', ordersCount: 24, avgTicket: 'LBP 35.4M' },
    { name: 'Tyre Tourist Hotel & Olive Lounge', category: 'Hospitality (HORECA)', ltv: 'LBP 720M', ordersCount: 31, avgTicket: 'LBP 23.2M' },
    { name: 'Al-Jabal General Trading Est.', category: 'Wholesale', ltv: 'LBP 680M', ordersCount: 20, avgTicket: 'LBP 34.0M' },
    { name: 'Pure Olive Retail Stores', category: 'Retail Shop', ltv: 'LBP 540M', ordersCount: 18, avgTicket: 'LBP 30.0M' },
    { name: 'Al-Sahel Food Supplies Co.', category: 'Distributor', ltv: 'LBP 490M', ordersCount: 15, avgTicket: 'LBP 32.6M' },
    { name: 'Al-Karam Al-Janoubi Restaurant Nabatieh', category: 'Hospitality', ltv: 'LBP 410M', ordersCount: 14, avgTicket: 'LBP 29.2M' },
    { name: 'Al-Arz Supermarket Beirut', category: 'Retail Chain', ltv: 'LBP 390M', ordersCount: 12, avgTicket: 'LBP 32.5M' }
  ];

  const displayedBuyers = showAllBuyers ? topBuyersData : topBuyersData.slice(0, 5);

  // At-Risk Customers Data (Authentic from Video V7)
  const atRiskCustomers = [
    { id: '00001', name: 'Mkasarat Abou Hamzeh', balance: '-148,524,120.00', lastTx: '2026-09-02' },
    { id: '00002', name: 'South Agri-Equipment Supplies Co.', balance: '0.00', lastTx: '2025-06-12' },
    { id: '00003', name: 'Zahrat Al-Zaytoun Est. Saida', balance: '0.00', lastTx: '2025-07-28' },
    { id: '00004', name: 'Nabatieh Regional Distributor', balance: '0.00', lastTx: '2025-08-02' }
  ];

  // At-Risk Customers Real Excel CSV Export
  const handleExportAtRiskExcel = () => {
    const csvHeader = "Cust.ID,Customer,Balance,Last Transaction\n";
    const csvRows = atRiskCustomers.map(c => `"${c.id}","${c.name}","${c.balance}","${c.lastTx}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'at_risk_customers_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Geographic Breakdown Data Tables
  const customersByCountry = [
    { name: 'Lebanon', count: 31 },
    { name: 'United Arab Emirates (UAE)', count: 1 },
    { name: 'Saudi Arabia (KSA)', count: 1 }
  ];

  const customersByRegion = [
    { name: 'South Lebanon', count: 18 },
    { name: 'Beirut & Mount Lebanon', count: 9 },
    { name: 'Bekaa & North', count: 6 }
  ];

  const customersByCity = [
    { name: 'Tyre', count: 8 },
    { name: 'Saida', count: 6 },
    { name: 'Nabatieh', count: 4 },
    { name: 'Beirut', count: 7 },
    { name: 'Khiam', count: 4 }
  ];

  const customersByGroup = [
    { name: 'Wholesale & Distributors', count: 14 },
    { name: 'Retail Chains & Shops', count: 11 },
    { name: 'HORECA & Hospitality', count: 6 }
  ];

  // Customer Behavior Trends (12 Months)
  const behaviorTrends = [
    { month: 'Aug 2026', active: 31, newAcc: 0, aov: 'LBP 29.4M', churn: '0.0%', sales: 'LBP 620.0M' },
    { month: 'Jul 2026', active: 31, newAcc: 2, aov: 'LBP 28.8M', churn: '1.2%', sales: 'LBP 592.5M' },
    { month: 'Jun 2026', active: 29, newAcc: 3, aov: 'LBP 27.5M', churn: '0.0%', sales: 'LBP 540.0M' },
    { month: 'May 2026', active: 26, newAcc: 1, aov: 'LBP 29.1M', churn: '2.0%', sales: 'LBP 510.2M' },
    { month: 'Apr 2026', active: 25, newAcc: 4, aov: 'LBP 26.8M', churn: '0.0%', sales: 'LBP 485.0M' },
    { month: 'Mar 2026', active: 21, newAcc: 2, aov: 'LBP 30.2M', churn: '1.5%', sales: 'LBP 460.8M' },
    { month: 'Feb 2026', active: 19, newAcc: 1, aov: 'LBP 25.4M', churn: '0.0%', sales: 'LBP 410.0M' },
    { month: 'Jan 2026', active: 18, newAcc: 3, aov: 'LBP 24.9M', churn: '3.1%', sales: 'LBP 395.0M' },
    { month: 'Dec 2025', active: 15, newAcc: 5, aov: 'LBP 31.0M', churn: '0.0%', sales: 'LBP 430.5M' },
    { month: 'Nov 2025', active: 10, newAcc: 2, aov: 'LBP 23.5M', churn: '0.0%', sales: 'LBP 310.0M' },
    { month: 'Oct 2025', active: 8, newAcc: 4, aov: 'LBP 22.0M', churn: '0.0%', sales: 'LBP 275.4M' },
    { month: 'Sep 2025', active: 4, newAcc: 4, aov: 'LBP 20.5M', churn: '0.0%', sales: 'LBP 180.0M' }
  ];

  const recommendations = [
    { title: 'Understand Your Customer Segments', desc: 'Analyze purchasing behaviors across wholesale, retail, and hospitality to tailor pricing strategy.', icon: Target, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Focus on Your Top Customers', desc: 'Identify VIP accounts generating 80% of revenue and assign dedicated account managers.', icon: Award, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'Track Buying Habits', desc: 'Monitor order frequency and product preferences to optimize stock availability.', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Improve Customer Retention', desc: 'Implement automated follow-ups for accounts with no orders in the last 60 days.', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { title: 'Personalize Your Offers', desc: 'Create tailored promotions and volume discounts for high-margin product categories.', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Measure Customer Value', desc: 'Continuously evaluate Customer Lifetime Value (CLV) against acquisition and service costs.', icon: DollarSign, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { title: 'Reduce Customer Churn', desc: 'Set up early warning triggers for accounts showing declining order volumes MTD.', icon: Zap, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { title: 'Optimize Sales Channels', desc: 'Compare direct, showroom, and distributor channels to maximize gross margins.', icon: BarChart2, color: 'text-sky-600 bg-sky-50 border-sky-200' }
  ];


  return (
    <div className="w-full relative" dir={dir}>
      {/* REFRESH TOAST NOTIFICATION */}
      {refreshToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{refreshToast}</span>
        </div>
      )}

          <div
            className="w-full py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300 space-y-8"
          >
            {/* 1. BREADCRUMBS & TOP HEADER CARD */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="hover:text-slate-600 cursor-pointer">{t('home', 'Home')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-blue-600 font-extrabold">{t('customer_insights', 'Customer Insights')}</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    <span>{t('customer_insights', 'Customer Insights')}</span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {t('your_customers_are_your_most_valuable', 'Your customers are your most valuable asset, know them well.')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                  <div className="relative inline-block text-left">
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                      className="appearance-none bg-white border border-slate-300 pl-3 pr-8 py-2 rounded-xl text-xs font-black !text-slate-900 text-slate-900 !opacity-100 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="All Brands" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('all_brands', 'All Brands')}</option>
                      <option value="Southern Olive SARL" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('southern_olive_sarl', 'Southern Olive SARL')}</option>
                      <option value="Beirut Branch" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('beirut_branch', 'Beirut Branch')}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => triggerRefreshToast('Header KPIs')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('refresh_kpis', 'Refresh KPIs')}</span>
                  </button>

                  <button
                    onClick={() => triggerRefreshToast('All Panels')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('refresh_panels', 'Refresh Panels')}</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('recommendations-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('recommendations', 'Recommendations')}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer border border-blue-600"
                  >
                    <FileText className="w-4 h-4 text-white" />
                    <span>{t('export_pdf', 'Export PDF')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. TOP 4 KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t('total_customers', 'Total Customers')}</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-mono block">31</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('active_accounts', 'Active Accounts')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-500 font-mono block">2</span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('inactive_accounts', 'Inactive Accounts')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t('acquisition_spend', 'Acquisition & Spend')}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">{t('new_t_w_m_y', 'New T / W / M / Y:')}</span>
                    <span className="font-mono font-black text-slate-900">0 / 0 / 0 / 31</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-semibold">{t('avg_annual_spend_cust', 'Avg Annual Spend / Cust:')}</span>
                    <span className="font-mono font-black text-slate-800">0 LL</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t('lifetime_value_clv', 'Lifetime Value (CLV)')}</span>
                    <div className="group relative inline-block">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl bg-slate-900 p-3 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        {t('clv_tooltip', 'Lifetime Net Sales / Distinct Customers with Sales, using ST_Sales_Amount - Discount, excluding rows with null or 0 Customers and type R.')}
                      </div>
                    </div>
                  </div>
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-purple-700 font-mono block">{t('lbp_9854m', 'LBP 985.4M')}</span>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('avg_account_clv', 'Avg Account CLV')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-600 font-mono block">2</span>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('at_risk_accounts', 'At-Risk Accounts')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t('growth_churn', 'Growth & Churn')}</span>
                    <div className="group relative inline-block">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl bg-slate-900 p-3 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        {t('churn_tooltip', 'Customers who bought in the previous year but did not buy in the current year, / Customers who bought in the previous year * 100.')}
                      </div>
                    </div>
                  </div>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-xl font-black text-slate-900 font-mono block">-100%</span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('growth_rate', 'Growth Rate')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-600 font-mono block">0%</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {t('yearly_churn', 'Yearly Churn')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. RECOMMENDATIONS SECTION */}
            <div id="recommendations-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-blue-600 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>{t('recommendations', 'Recommendations')}</span>
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                  {t('strategic_actions_count', '8 Strategic Actions')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((rec, idx) => {
                  const IconComp = rec.icon;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl bg-white p-4 space-y-2 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${rec.color} shrink-0`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <h3 className="text-xs font-black text-slate-900 leading-snug">{t('rec_title_' + idx, rec.title)}</h3>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {rec.desc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-blue-600">
                        <span>{t('execute_strategy', 'Execute Strategy')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. MIDDLE PANELS (3-COLUMN GRID: DATA QUALITY, FINANCIAL VALUE, CUSTOMER VOICE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PANEL 1: DATA QUALITY */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{t('data_quality', 'Data Quality')}</span>
                  </h3>
                  <button
                    onClick={() => triggerRefreshToast('Data Quality')}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title={t('refresh_data_quality', 'Refresh Data Quality')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('customers_no_tags', 'Customers With No Tags:')}</span>
                    <span className="font-mono font-bold text-amber-600">31 {t('accounts', 'Accounts')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('no_city', 'No City:')}</span>
                    <span className="font-mono font-bold text-amber-600">33 {t('accounts', 'Accounts')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('no_phone', 'No Phone:')}</span>
                    <span className="font-mono font-bold text-slate-500">1 {t('account', 'Account')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('no_email', 'No Email:')}</span>
                    <span className="font-mono font-bold text-amber-600">30 {t('accounts', 'Accounts')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('blacklisted', 'Blacklisted:')}</span>
                    <span className="font-mono font-bold text-emerald-600">0 {t('accounts', 'Accounts')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 font-medium">{t('loyalty_members', 'Loyalty Members:')}</span>
                    <span className="font-mono font-bold text-slate-500">0 {t('accounts', 'Accounts')}</span>
                  </div>
                </div>
              </div>

              {/* PANEL 2: FINANCIAL VALUE & PURCHASE PATTERNS (Authentic from Video V6) */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{t('financial_value', 'Financial Value')}</span>
                  </h3>
                  <button
                    onClick={() => triggerRefreshToast('Financial Value')}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={t('refresh_financial_value', 'Refresh Financial Value')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('with_balance', 'With Balance:')}</span>
                    <span className="font-mono font-bold text-slate-900">1 {t('account', 'Account')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('total_balance', 'Total Balance:')}</span>
                    <span className="font-mono font-bold text-rose-600">-148,524,120.00 LL</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-medium">{t('average_order_value_aov', 'Average Order Value (AOV):')}</span>
                      <div className="group relative inline-block">
                        <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-emerald-600" />
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-slate-900 p-2.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                          {t('aov_tooltip', 'Total net sales divided by total valid orders.')}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">0.00 LL</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">{t('purchase_patterns', 'Purchase Patterns')}</span>
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">{t('repeat_customers', 'Repeat Customers:')}</span>
                        <span className="font-mono font-bold text-slate-800">0</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">{t('one_time_buyers', 'One-Time Buyers:')}</span>
                        <span className="font-mono font-bold text-slate-800">2</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">{t('no_transactions', 'No Transactions:')}</span>
                        <span className="font-mono font-bold text-slate-800">33</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 3: CUSTOMER VOICE & FEEDBACK (Authentic from Video V7) */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>{t('customer_voice', 'Customer Voice')}</span>
                  </h3>
                  <button
                    onClick={() => triggerRefreshToast('Customer Voice')}
                    className="p-1 text-slate-400 hover:text-purple-600 transition-colors"
                    title={t('refresh_customer_voice', 'Refresh Customer Voice')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-medium">{t('csat_metric', 'CSAT:')}</span>
                      <div className="group relative inline-block">
                        <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-purple-600" />
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl bg-slate-900 p-2.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                          {t('csat_tooltip', 'Satisfied feedback responses divided by satisfied plus not satisfied responses, multiplied by 100.')}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">94.48%</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-medium">{t('rating_metric', 'Rating:')}</span>
                      <div className="group relative inline-block">
                        <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-purple-600" />
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl bg-slate-900 p-2.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                          {t('rating_tooltip', 'Average rating score from customer feedback answers.')}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-500">4.68</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">{t('ratings_count', 'Ratings:')}</span>
                    <span className="font-mono font-bold text-slate-800">71841</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-medium">{t('nps_metric', 'NPS:')}</span>
                      <div className="group relative inline-block">
                        <Info className="w-3 h-3 text-slate-400 cursor-pointer hover:text-purple-600" />
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl bg-slate-900 p-2.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                          {t('nps_tooltip', 'Promoters minus detractors divided by total survey respondents.')}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-600">78.77%</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600 font-medium">{t('complaints', 'Complaints:')}</span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      383
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* 5. BOTTOM PANELS ROW 1 (3-COLUMN GRID: TOP BUYERS, MARKETING REACH, AT-RISK) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* BOX 1: TOP 10 BUYERS WITH CONTROLS & EXPAND */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>{t('top_buyers', 'Top Buyers')}</span>
                  </h3>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => triggerRefreshToast('Top Buyers')}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                      title={t('recalculate_refresh', 'Recalculate & Refresh')}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowAllBuyers(!showAllBuyers)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition-colors"
                    >
                      {showAllBuyers ? t('show_less', 'Show Less') : t('show_more', 'Show More')}
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full appearance-none bg-white border border-slate-300 pl-2.5 pr-7 py-1.5 rounded-lg text-[11px] font-black !text-slate-900 text-slate-900 !opacity-100 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="All Brands" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('all_brands', 'All Brands')}</option>
                      <option value="Southern Olive SARL" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('southern_olive_sarl', 'Southern Olive SARL')}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-2 pointer-events-none" />
                  </div>

                  <div className="relative flex-1">
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full appearance-none bg-white border border-slate-300 pl-2.5 pr-7 py-1.5 rounded-lg text-[11px] font-black !text-slate-900 text-slate-900 !opacity-100 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="All Groups" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('all_groups', 'All Groups')}</option>
                      <option value="Wholesale" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('wholesale', 'Wholesale')}</option>
                      <option value="Retail" style={{ color: '#0f172a', opacity: 1, WebkitTextFillColor: '#0f172a', backgroundColor: '#ffffff' }} className="text-slate-900 bg-white font-bold">{t('retail', 'Retail')}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>

                {/* Buyers Data Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wide">
                      <tr>
                        <th className="py-2.5 px-3">{t('customer', 'CUSTOMER')}</th>
                        <th className="py-2.5 px-3">{t('ltv', 'LTV')}</th>
                        <th className="py-2.5 px-3">{t('avg_ticket', 'AVG TICKET')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {displayedBuyers.map((b, idx) => (
                        <tr key={idx} className="even:bg-slate-50/50 hover:bg-slate-100 transition-colors duration-150 cursor-pointer">
                          <td className="py-2.5 px-3 font-normal text-slate-900 truncate max-w-[130px]">{b.name}</td>
                          <td className="py-2.5 px-3 font-mono font-medium text-emerald-600">{b.ltv}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{b.avgTicket}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOX 2: MARKETING REACH */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>{t('marketing_reach', 'Marketing Reach')}</span>
                  </h3>
                  <button
                    onClick={() => triggerRefreshToast('Marketing Reach')}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title={t('refresh_marketing_reach', 'Refresh Marketing Reach')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t('contacts', 'Contacts')}</span>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between"><span className="text-slate-600">{t('sms_opt_in', 'SMS Opt-In:')}</span><span className="font-mono font-bold">28</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">{t('email_opt_in', 'Email Opt-In:')}</span><span className="font-mono font-bold">22</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">{t('whatsapp_verified', 'WhatsApp Verified:')}</span><span className="font-mono font-bold text-emerald-600">29</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t('geography_coverage', 'Geography Coverage')}</span>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between"><span className="text-slate-600">{t('regions_covered', 'Regions Covered:')}</span><span className="font-mono font-bold">8</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">{t('key_cities', 'Key Cities:')}</span><span className="font-mono font-bold">14</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">{t('loyalty', 'Loyalty')}</span>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('program_type', 'Program Type :')}</span><span className="font-mono font-bold text-slate-900">{t('loyalty_levels', 'Loyalty Levels')}</span></div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('loyalty_members', 'Loyalty Members :')}</span><span className="font-mono font-bold text-slate-900">0</span></div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('active_members_this_month', 'Active Members This Month :')}</span><span className="font-mono font-bold text-slate-900">0</span></div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('loyalty_sales_this_month', 'Loyalty Sales This Month :')}</span><span className="font-mono font-bold text-slate-900">0.00</span></div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('loyalty_aov_this_month', 'Loyalty AOV This Month :')}</span><span className="font-mono font-bold text-slate-900">0.00</span></div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200/60"><span className="text-slate-600">{t('active_loyalty_rules', 'Active Loyalty Rules :')}</span><span className="font-mono font-bold text-slate-900">0</span></div>
                      <div className="flex justify-between py-0.5"><span className="text-slate-600">{t('loyalty_levels', 'Loyalty Levels :')}</span><span className="font-mono font-bold text-slate-900">4</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX 3: AT-RISK CUSTOMERS WITH REAL EXCEL EXPORT */}
              <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{t('at_risk_customers', 'At-Risk Customers')}</span>
                    </h3>
                    <div className="group relative inline-block">
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-rose-600" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-xl bg-slate-900 p-3 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
                        {t('at_risk_tooltip', 'Active customers only. This list includes customers whose last valid sale date is older than or equal to 1 year.')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => triggerRefreshToast('At-Risk Customers')}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title={t('refresh_atrisk_list', 'Refresh At-Risk List')}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleExportAtRiskExcel}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title={t('export_atrisk_list_as_excel_csv', 'Export At-Risk List as Excel CSV')}
                    >
                      <Download className="w-3 h-3 text-white" />
                      <span>{t('excel', 'Excel')}</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wide">
                      <tr>
                        <th className="py-2.5 px-3">{t('cust_id', 'Cust.ID')}</th>
                        <th className="py-2.5 px-3">{t('customer', 'Customer')}</th>
                        <th className="py-2.5 px-3 text-right">{t('balance', 'Balance')}</th>
                        <th className="py-2.5 px-3 text-right">{t('last_transaction', 'Last Transaction')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {atRiskCustomers.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{c.id}</td>
                          <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[130px]">{c.name}</td>
                          <td className="py-2 px-3 font-mono text-right font-bold text-slate-700">{c.balance}</td>
                          <td className="py-2 px-3 font-mono text-right text-slate-500">{c.lastTx}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 6. BOTTOM PANELS ROW 2 (4-COLUMN GEOGRAPHIC & GROUP BREAKDOWN GRID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* BOX 1: COUNTRY */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-slate-900">{t('by_country', 'By Country')}</span>
                  <button onClick={() => triggerRefreshToast('By Country')} className="p-1 text-slate-400 hover:text-blue-600">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr><th className="py-2 px-2.5">{t('country', 'COUNTRY')}</th><th className="py-2 px-2.5">{t('count', 'COUNT')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customersByCountry.map((r, i) => (
                        <tr key={i}><td className="py-1.5 px-2.5 font-medium">{r.name}</td><td className="py-1.5 px-2.5 font-mono font-bold text-blue-600">{r.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOX 2: REGION */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-slate-900">{t('by_region', 'By Region')}</span>
                  <button onClick={() => triggerRefreshToast('By Region')} className="p-1 text-slate-400 hover:text-blue-600">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr><th className="py-2 px-2.5">{t('region', 'REGION')}</th><th className="py-2 px-2.5">{t('count', 'COUNT')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customersByRegion.map((r, i) => (
                        <tr key={i}><td className="py-1.5 px-2.5 font-medium">{r.name}</td><td className="py-1.5 px-2.5 font-mono font-bold text-purple-600">{r.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOX 3: CITY */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-slate-900">{t('by_city', 'By City')}</span>
                  <button onClick={() => triggerRefreshToast('By City')} className="p-1 text-slate-400 hover:text-blue-600">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr><th className="py-2 px-2.5">{t('city', 'CITY')}</th><th className="py-2 px-2.5">{t('count', 'COUNT')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customersByCity.map((r, i) => (
                        <tr key={i}><td className="py-1.5 px-2.5 font-medium">{r.name}</td><td className="py-1.5 px-2.5 font-mono font-bold text-emerald-600">{r.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOX 4: GROUP */}
              <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-slate-900">{t('by_group', 'By Group')}</span>
                  <button onClick={() => triggerRefreshToast('By Group')} className="p-1 text-slate-400 hover:text-blue-600">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr><th className="py-2 px-2.5">{t('group', 'GROUP')}</th><th className="py-2 px-2.5">{t('count', 'COUNT')}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customersByGroup.map((r, i) => (
                        <tr key={i}><td className="py-1.5 px-2.5 font-medium">{r.name}</td><td className="py-1.5 px-2.5 font-mono font-bold text-amber-600">{r.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 7. FULL WIDTH TRENDS TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>{t('customer_behavior_trends_engine', 'Customer Behavior Trends (12-Month Performance Engine)')}</span>
                </h2>
                <button
                  onClick={() => triggerRefreshToast('Customer Behavior Trends')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('refresh_trends', 'Refresh Trends')}</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">{t('month', 'MONTH')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('active_customers', 'ACTIVE CUSTOMERS')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('new_accounts', 'NEW ACCOUNTS')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('avg_order_value_aov', 'AVG ORDER VALUE (AOV)')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('churn_pct', 'CHURN %')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('net_sales', 'NET SALES')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {behaviorTrends.map((row, idx) => (
                      <tr key={idx} className="even:bg-slate-50/50 hover:bg-slate-100 transition-colors duration-150 cursor-pointer">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{row.month}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{row.active} {t('accounts', 'Accounts')}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">+{row.newAcc}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-normal">{row.aov}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-rose-600">{row.churn}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{row.sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRESERVED VIP CUSTOMERS TABLE (STRICT ENGLISH LTR) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4" dir="ltr">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>{t('top_5_ltv_vip_customers', 'Top 5 LTV VIP Customers')}</span>
              </h2>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-base font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">{t('customer_company_name', 'Customer / Company Name')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('customer_category', 'Customer Category')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('lifetime_value_ltv', 'Lifetime Value (LTV)')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('number_of_orders', 'Number of Orders')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('average_invoice', 'Average Invoice')}</th>
                      <th className="py-3.5 px-4 font-semibold">{t('last_order_date', 'Last Order Date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {topBuyersData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="even:bg-slate-50/50 hover:bg-slate-100 transition-colors duration-150 cursor-pointer">
                        <td className="py-3.5 px-4 font-normal text-slate-900">{row.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">{row.ltv}</td>
                        <td className="py-3.5 px-4 font-mono font-normal">{row.ordersCount} {t('orders', 'Orders')}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-normal">{row.avgTicket}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 font-normal">2026-08-24</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
    </div>
  );
}
