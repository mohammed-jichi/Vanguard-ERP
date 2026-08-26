'use client';

import React, { useState } from 'react';
import ProductInsightsView from './ProductInsightsView';
import {
  FileText,
  Clock,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  GitCompare,
  Package,
  UserCheck,
  Users,
  Calendar,
  Globe,
  Maximize2,
  Minimize2,
  MoreVertical,
  X,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users2,
  Clock3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface SalesDashboardProps {
  onSelectScreen?: (screen: string) => void;
}

export default function SalesDashboard({ onSelectScreen }: SalesDashboardProps) {
  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('منتجات زيت وزيتون الجنوب');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('LBP');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedDate, setSelectedDate] = useState<string>('All Days');

  // Active Sub-Tab State (default: summary)
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Widget Expand Modal State
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // --- LIVE DATA: SUMMARY TAB ---
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 420 },
    { month: 'Feb', revenue: 380 },
    { month: 'Mar', revenue: 510 },
    { month: 'Apr', revenue: 490 },
    { month: 'May', revenue: 580 },
    { month: 'Jun', revenue: 620 },
    { month: 'Jul', revenue: 690 },
    { month: 'Aug', revenue: 750 },
    { month: 'Sep', revenue: 610 },
    { month: 'Oct', revenue: 540 },
    { month: 'Nov', revenue: 480 },
    { month: 'Dec', revenue: 710 }
  ];

  const categorySalesData = [
    { name: 'Extra Virgin Olive Oil', value: 45, amount: 'LBP 91,035,000', color: '#10b981' },
    { name: 'Bottled Oil & Jars', value: 30, amount: 'LBP 60,690,000', color: '#3b82f6' },
    { name: 'Pressing Services', value: 15, amount: 'LBP 30,345,000', color: '#f59e0b' },
    { name: 'Soaps & Byproducts', value: 10, amount: 'LBP 20,230,000', color: '#8b5cf6' }
  ];

  // --- LIVE DATA: COMPARATIVE TAB ---
  
  // 1. Daily Summary Revenue Trends (Sat Aug 1 - Sat Aug 22)
  const dailyTrendsData = [
    { date: 'Sat, Aug 1', revenue: 42, count: 18, avgTicket: '2.33M' },
    { date: 'Sun, Aug 2', revenue: 65, count: 24, avgTicket: '2.70M' },
    { date: 'Mon, Aug 3', revenue: 98, count: 35, avgTicket: '2.80M' },
    { date: 'Tue, Aug 4', revenue: 145, count: 48, avgTicket: '3.02M' },
    { date: 'Wed, Aug 5', revenue: 180, count: 52, avgTicket: '3.46M' },
    { date: 'Thu, Aug 6', revenue: 210, count: 64, avgTicket: '3.28M' },
    { date: 'Fri, Aug 7', revenue: 195, count: 58, avgTicket: '3.36M' },
    { date: 'Sat, Aug 8', revenue: 240, count: 72, avgTicket: '3.33M' },
    { date: 'Sun, Aug 9', revenue: 265, count: 81, avgTicket: '3.27M' },
    { date: 'Mon, Aug 10', revenue: 290, count: 88, avgTicket: '3.29M' },
    { date: 'Tue, Aug 11', revenue: 215, count: 65, avgTicket: '3.30M' },
    { date: 'Wed, Aug 12', revenue: 230, count: 70, avgTicket: '3.28M' },
    { date: 'Thu, Aug 13', revenue: 275, count: 82, avgTicket: '3.35M' },
    { date: 'Fri, Aug 14', revenue: 250, count: 76, avgTicket: '3.28M' },
    { date: 'Sat, Aug 15', revenue: 285, count: 85, avgTicket: '3.35M' },
    { date: 'Sun, Aug 16', revenue: 295, count: 90, avgTicket: '3.27M' },
    { date: 'Mon, Aug 17', revenue: 260, count: 78, avgTicket: '3.33M' },
    { date: 'Tue, Aug 18', revenue: 240, count: 72, avgTicket: '3.33M' },
    { date: 'Wed, Aug 19', revenue: 270, count: 80, avgTicket: '3.37M' },
    { date: 'Thu, Aug 20', revenue: 280, count: 84, avgTicket: '3.33M' },
    { date: 'Fri, Aug 21', revenue: 265, count: 79, avgTicket: '3.35M' },
    { date: 'Sat, Aug 22', revenue: 300, count: 92, avgTicket: '3.26M' }
  ];

  // 2. Monthly Sales By Category (2026 vs 2025 Stacked / Clustered)
  const categoryMonthlyComparisonData = [
    { month: 'Jan', retail26: 35, promo26: 15, wholesale26: 12, raw26: 5, total25: 55 },
    { month: 'Feb', retail26: 30, promo26: 12, wholesale26: 10, raw26: 4, total25: 48 },
    { month: 'Mar', retail26: 45, promo26: 20, wholesale26: 18, raw26: 6, total25: 75 },
    { month: 'Apr', retail26: 42, promo26: 18, wholesale26: 15, raw26: 5, total25: 68 },
    { month: 'May', retail26: 50, promo26: 22, wholesale26: 20, raw26: 7, total25: 82 },
    { month: 'Jun', retail26: 55, promo26: 25, wholesale26: 22, raw26: 8, total25: 90 },
    { month: 'Jul', retail26: 62, promo26: 28, wholesale26: 25, raw26: 9, total25: 102 },
    { month: 'Aug', retail26: 68, promo26: 30, wholesale26: 28, raw26: 10, total25: 112 },
    { month: 'Sep', retail26: 52, promo26: 22, wholesale26: 20, raw26: 6, total25: 85 },
    { month: 'Oct', retail26: 48, promo26: 20, wholesale26: 18, raw26: 5, total25: 78 },
    { month: 'Nov', retail26: 40, promo26: 16, wholesale26: 14, raw26: 4, total25: 64 },
    { month: 'Dec', retail26: 65, promo26: 28, wholesale26: 26, raw26: 9, total25: 108 }
  ];

  const categoryTableData = [
    { name: 'مفرق (Retail Olive Products)', year2026: 'LBP 320,000,000', year2025: 'LBP 270,000,000', diff: '+LBP 50,000,000', growth: '+18.5%' },
    { name: 'عروض (Promotional Sets)', year2026: 'LBP 145,000,000', year2025: 'LBP 110,000,000', diff: '+LBP 35,000,000', growth: '+31.8%' },
    { name: 'جملة (Wholesale Barrels)', year2026: 'LBP 125,000,000', year2025: 'LBP 105,000,000', diff: '+LBP 20,000,000', growth: '+19.0%' },
    { name: 'Raw Materials (مواد خام)', year2026: 'LBP 30,000,000', year2025: 'LBP 25,000,000', diff: '+LBP 5,000,000', growth: '+20.0%' },
    { name: 'TOTAL SUMMARY', year2026: 'LBP 620,000,000', year2025: 'LBP 510,000,000', diff: '+LBP 110,000,000', growth: '+21.6%', isTotal: true }
  ];

  // 3. Hourly & WeekDays Sales Trends
  const hourlyData = [
    { hour: '09:00', sales: 12, count: 5 },
    { hour: '10:00', sales: 28, count: 12 },
    { hour: '11:00', sales: 45, count: 18 },
    { hour: '12:00', sales: 62, count: 24 },
    { hour: '13:00', sales: 55, count: 22 },
    { hour: '14:00', sales: 40, count: 16 },
    { hour: '15:00', sales: 35, count: 14 },
    { hour: '16:00', sales: 58, count: 21 },
    { hour: '17:00', sales: 78, count: 29 },
    { hour: '18:00', sales: 65, count: 25 },
    { hour: '19:00', sales: 42, count: 17 }
  ];

  const weekdayData = [
    { day: 'Monday', sales: 82, share: '13.2%' },
    { day: 'Tuesday', sales: 78, share: '12.6%' },
    { day: 'Wednesday', sales: 88, share: '14.2%' },
    { day: 'Thursday', sales: 95, share: '15.3%' },
    { day: 'Friday', sales: 105, share: '16.9%' },
    { day: 'Saturday', sales: 112, share: '18.1%' },
    { day: 'Sunday', sales: 60, share: '9.7%' }
  ];

  // 4. Comparative Monthly Sales By Employee
  const employeeMonthlyData = [
    { month: 'Jan', cashierN2: 80, cashierNK: 65, cashierR: 90, hiba: 70, mahdi: 55, nour: 60 },
    { month: 'Feb', cashierN2: 75, cashierNK: 60, cashierR: 85, hiba: 65, mahdi: 50, nour: 45 },
    { month: 'Mar', cashierN2: 95, cashierNK: 80, cashierR: 110, hiba: 85, mahdi: 70, nour: 70 },
    { month: 'Apr', cashierN2: 90, cashierNK: 75, cashierR: 100, hiba: 80, mahdi: 65, nour: 80 },
    { month: 'May', cashierN2: 105, cashierNK: 90, cashierR: 120, hiba: 95, mahdi: 80, nour: 90 },
    { month: 'Jun', cashierN2: 115, cashierNK: 98, cashierR: 130, hiba: 105, mahdi: 88, nour: 84 },
    { month: 'Jul', cashierN2: 125, cashierNK: 110, cashierR: 145, hiba: 115, mahdi: 95, nour: 100 },
    { month: 'Aug', cashierN2: 135, cashierNK: 120, cashierR: 155, hiba: 125, mahdi: 105, nour: 110 },
    { month: 'Sep', cashierN2: 110, cashierNK: 95, cashierR: 125, hiba: 100, mahdi: 85, nour: 95 },
    { month: 'Oct', cashierN2: 100, cashierNK: 85, cashierR: 115, hiba: 90, mahdi: 75, nour: 85 },
    { month: 'Nov', cashierN2: 85, cashierNK: 70, cashierR: 95, hiba: 75, mahdi: 60, nour: 65 },
    { month: 'Dec', cashierN2: 130, cashierNK: 115, cashierR: 150, hiba: 120, mahdi: 100, nour: 95 }
  ];

  const employeeTableRows = [
    { name: 'Cashier N2', color: '#10b981', jan: '80M', feb: '75M', mar: '95M', apr: '90M', may: '105M', jun: '115M', jul: '125M', aug: '135M', sep: '110M', oct: '100M', nov: '85M', dec: '130M', total: '1,245M', avg: '103.7M' },
    { name: 'Cashier NK', color: '#3b82f6', jan: '65M', feb: '60M', mar: '80M', apr: '75M', may: '90M', jun: '98M', jul: '110M', aug: '120M', sep: '95M', oct: '85M', nov: '70M', dec: '115M', total: '1,068M', avg: '89.0M' },
    { name: 'Cashier R', color: '#f59e0b', jan: '90M', feb: '85M', mar: '110M', apr: '100M', may: '120M', jun: '130M', jul: '145M', aug: '155M', sep: '125M', oct: '115M', nov: '95M', dec: '150M', total: '1,420M', avg: '118.3M' },
    { name: 'Hiba Aloulou', color: '#ec4899', jan: '70M', feb: '65M', mar: '85M', apr: '80M', may: '95M', jun: '105M', jul: '115M', aug: '125M', sep: '100M', oct: '90M', nov: '75M', dec: '120M', total: '1,125M', avg: '93.7M' },
    { name: 'Mahdi', color: '#8b5cf6', jan: '55M', feb: '50M', mar: '70M', apr: '65M', may: '80M', jun: '88M', jul: '95M', aug: '105M', sep: '85M', oct: '75M', nov: '60M', dec: '100M', total: '928M', avg: '77.3M' },
    { name: 'Nour Yazbeck', color: '#06b6d4', jan: '60M', feb: '45M', mar: '70M', apr: '80M', may: '90M', jun: '84M', jul: '100M', aug: '110M', sep: '95M', oct: '85M', nov: '65M', dec: '95M', total: '979M', avg: '81.5M' }
  ];

  // Sub-Navigation Tabs Config
  const tabs = [
    { id: 'summary', label: 'Summary', icon: LayoutDashboard },
    { id: 'comparative', label: 'Comparative', icon: GitCompare },
    { id: 'product-insights', label: 'Product Insights', icon: Package },
    { id: 'customer-insights', label: 'Customer Insights', icon: UserCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'geographics', label: 'Geographics', icon: Globe }
  ];

  const handleExportPDF = () => {
    alert(`Exporting Sales Control Dashboard PDF report for ${selectedBranch}...`);
  };

  const handleRecalculate = () => {
    alert('Sales balances and MTD/YTD metrics recalculated successfully!');
  };

  // Reusable Widget Card Component
  const WidgetCard = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{title}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpandedWidget(id)}
              title="Expand Chart Fullscreen"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert(`Options for ${title}`)}
              title="Widget Options"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-full flex-1">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-6 font-sans dir-ltr text-left">
      
      {/* 1. TOP FILTER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* DROPDOWNS GROUP */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
          
          {/* BRANCH DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="منتجات زيت وزيتون الجنوب">منتجات زيت وزيتون الجنوب (Southern Olive Oil S.A.R.L)</option>
              <option value="Beirut Central Branch">Beirut Central Branch</option>
              <option value="Saida Production Press">Saida Production Press</option>
            </select>
          </div>

          {/* CURRENCY DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="LBP">LBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* YEAR DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* MONTH DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="August">August</option>
              <option value="July">July</option>
              <option value="June">June</option>
              <option value="May">May</option>
            </select>
          </div>

          {/* DATE DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All Days">All Days</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="MTD">MTD</option>
            </select>
          </div>

        </div>

        {/* RIGHT ACTIONS GROUP */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* EXPORT PDF BUTTON */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          {/* THREE ICON BUTTONS */}
          <button
            onClick={() => alert('Last EOD Report: 25-Aug-2026 at 23:45 PM')}
            title="Clock / Last EOD"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={handleRecalculate}
            title="Refresh / Recalculate"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectScreen ? onSelectScreen('sc-reports') : alert('Opening Detailed Sales Reports...')}
            title="BarChart / Reports"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* 2. KPI CARDS GRID OF 4 (ALL TEXT-WHITE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: GREEN (bg-emerald-700) */}
        <div className="bg-emerald-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-200">Today's Net Sales</span>
            <h2 className="text-2xl font-black text-white mt-1">LBP 42,500,000</h2>
          </div>
          <div className="border-t border-emerald-600/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-emerald-100">
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Receipts</p>
              <p className="font-extrabold text-white">42.5M</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Discounts</p>
              <p className="font-extrabold text-white">0.00</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Refunds</p>
              <p className="font-extrabold text-white">0.00</p>
            </div>
          </div>
        </div>

        {/* CARD 2: BLUE (bg-blue-800) */}
        <div className="bg-blue-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-200">Net Sales Summary</span>
            <div className="mt-1">
              <span className="text-[10px] text-blue-300 uppercase font-bold">Net Sales Total</span>
              <h2 className="text-2xl font-black text-white">LBP 202,300,000</h2>
            </div>
          </div>
          <div className="border-t border-blue-700/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-blue-100">
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Gross</p>
              <p className="font-extrabold text-white">185M</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Discount</p>
              <p className="font-extrabold text-white">2.5M</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-bold uppercase">Tax</p>
              <p className="font-extrabold text-white">19.8M</p>
            </div>
          </div>
        </div>

        {/* CARD 3: GOLD (bg-amber-600) */}
        <div className="bg-amber-600 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-200">MTD / YTD Performance</span>
            <h2 className="text-2xl font-black text-white mt-1">LBP 620,000,000</h2>
          </div>
          <div className="border-t border-amber-500/60 pt-3 grid grid-cols-2 gap-2 text-[11px] text-amber-100">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">YTD Sales</p>
              <p className="font-extrabold text-white">4.85B</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Cust. Aged</p>
              <p className="font-extrabold text-white">14.2M</p>
            </div>
          </div>
        </div>

        {/* CARD 4: BROWN (bg-[#8c4a32]) */}
        <div className="bg-[#8c4a32] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-200">Cashier Operations</span>
            <h2 className="text-2xl font-black text-white mt-1">142 Invoices</h2>
          </div>
          <div className="border-t border-amber-800/60 pt-3 grid grid-cols-3 gap-1 text-[11px] text-amber-100">
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Paid In/Out</p>
              <p className="font-extrabold text-white">5M / 1.2M</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Avg Invoice</p>
              <p className="font-extrabold text-white">1.45M</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-200 font-bold uppercase">Voids/Ref</p>
              <p className="font-extrabold text-white">0 / 0</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
        {tabs.map((t) => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- SUMMARY TAB VIEW ---------------- */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: MONTHLY REVENUE (BAR CHART) */}
          <WidgetCard id="monthly-revenue" title="Monthly Revenue (Jan - Dec 2026)">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val}M`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </WidgetCard>

          {/* CHART 2: SALES BY CATEGORY (PIE CHART & DATA TABLE) */}
          <WidgetCard id="sales-category" title="Sales By Category Distribution">
            <div className="flex flex-col space-y-4">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* CATEGORY BREAKDOWN DATA TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {categorySalesData.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{c.amount}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">{c.value}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </WidgetCard>

        </div>
      )}

      {/* ---------------- PHASE 41: COMPARATIVE TAB VIEW ---------------- */}
      {activeTab === 'comparative' && (
        <div className="space-y-6">
          
          {/* 1. DAILY SUMMARY WIDGET (FULL WIDTH LINECHART + DATA TABLE) */}
          <WidgetCard id="daily-summary-trends" title="Daily Summary Revenue Trends (Sat Aug 1 - Sat Aug 22)">
            <div className="space-y-4">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 300]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`LBP ${val} Million`, 'Daily Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* DAILY DATA SUMMARY TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs max-h-48 overflow-y-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] sticky top-0 bg-slate-100 z-10">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Net Revenue</th>
                      <th className="py-2 px-3 text-right">Orders Count</th>
                      <th className="py-2 px-3 text-right">Average Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {dailyTrendsData.map((d) => (
                      <tr key={d.date} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-bold">{d.date}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">LBP {d.revenue} Million</td>
                        <td className="py-1.5 px-3 text-right font-mono">{d.count} invoices</td>
                        <td className="py-1.5 px-3 text-right font-mono text-slate-600">LBP {d.avgTicket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </WidgetCard>

          {/* 2. MONTHLY SALES BY CATEGORY (STACKED BARCHART + DATA TABLE) */}
          <WidgetCard id="monthly-category-comparison" title="Monthly Sales By Category (2026 vs 2025)">
            <div className="space-y-4">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryMonthlyComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`LBP ${val}M`, 'Sales']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                    <Bar dataKey="retail26" name="مفرق (2026)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="promo26" name="عروض (2026)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="wholesale26" name="جملة (2026)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="raw26" name="Raw Materials (2026)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total25" name="Total 2025 (Ref)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* DETAILED CATEGORY COMPARISON TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Category Name</th>
                      <th className="py-2.5 px-4 text-right">2026 Amount</th>
                      <th className="py-2.5 px-4 text-right">2025 Amount</th>
                      <th className="py-2.5 px-4 text-right">Difference Amount</th>
                      <th className="py-2.5 px-4 text-right">Growth %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                    {categoryTableData.map((row) => (
                      <tr key={row.name} className={row.isTotal ? 'bg-amber-50 font-black text-amber-950 border-t-2 border-amber-300' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-4 font-bold">{row.name}</td>
                        <td className="py-2.5 px-4 text-right font-mono">{row.year2026}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.year2025}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">{row.diff}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-emerald-700">{row.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </WidgetCard>

          {/* 3. AVERAGE SALES BY HOUR & WEEKDAYS (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* HOURLY WIDGET */}
            <WidgetCard id="hourly-sales-trends" title="Average Sales by Hour (09:00 - 19:00)">
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val: any) => [`LBP ${val} Million`, 'Avg Hourly Revenue']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs max-h-36 overflow-y-auto">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="py-1.5 px-3">Hour</th>
                        <th className="py-1.5 px-3 text-right">Avg Sales</th>
                        <th className="py-1.5 px-3 text-right">Avg Invoices</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                      {hourlyData.map((h) => (
                        <tr key={h.hour} className="hover:bg-slate-50">
                          <td className="py-1 px-3 font-bold">{h.hour}</td>
                          <td className="py-1 px-3 text-right font-mono font-bold text-blue-700">LBP {h.sales}M</td>
                          <td className="py-1 px-3 text-right font-mono text-slate-600">{h.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </WidgetCard>

            {/* WEEKDAYS WIDGET */}
            <WidgetCard id="weekdays-sales-trends" title="Sales by WeekDays Distribution">
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val: any) => [`LBP ${val} Million`, 'Total Revenue']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs max-h-36 overflow-y-auto">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="py-1.5 px-3">Weekday</th>
                        <th className="py-1.5 px-3 text-right">Total Revenue</th>
                        <th className="py-1.5 px-3 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                      {weekdayData.map((w) => (
                        <tr key={w.day} className="hover:bg-slate-50">
                          <td className="py-1 px-3 font-bold">{w.day}</td>
                          <td className="py-1 px-3 text-right font-mono font-bold text-amber-700">LBP {w.sales}M</td>
                          <td className="py-1 px-3 text-right font-extrabold text-slate-700">{w.share}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </WidgetCard>

          </div>

          {/* 4. COMPARATIVE MONTHLY SALES BY EMPLOYEE (STACKED BARCHART + COMPREHENSIVE TABLE) */}
          <WidgetCard id="employee-monthly-comparison" title="Comparative Monthly Sales By Employee">
            <div className="space-y-5">
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`LBP ${val}M`, 'Employee Sales']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                    <Bar dataKey="cashierN2" name="Cashier N2" stackId="emp" fill="#10b981" />
                    <Bar dataKey="cashierNK" name="Cashier NK" stackId="emp" fill="#3b82f6" />
                    <Bar dataKey="cashierR" name="Cashier R" stackId="emp" fill="#f59e0b" />
                    <Bar dataKey="hiba" name="Hiba Aloulou" stackId="emp" fill="#ec4899" />
                    <Bar dataKey="mahdi" name="Mahdi" stackId="emp" fill="#8b5cf6" />
                    <Bar dataKey="nour" name="Nour Yazbeck" stackId="emp" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* COMPREHENSIVE EMPLOYEE SALES DATA TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-2 text-right">Jan</th>
                      <th className="py-2.5 px-2 text-right">Feb</th>
                      <th className="py-2.5 px-2 text-right">Mar</th>
                      <th className="py-2.5 px-2 text-right">Apr</th>
                      <th className="py-2.5 px-2 text-right">May</th>
                      <th className="py-2.5 px-2 text-right">Jun</th>
                      <th className="py-2.5 px-2 text-right">Jul</th>
                      <th className="py-2.5 px-2 text-right">Aug</th>
                      <th className="py-2.5 px-2 text-right">Sep</th>
                      <th className="py-2.5 px-2 text-right">Oct</th>
                      <th className="py-2.5 px-2 text-right">Nov</th>
                      <th className="py-2.5 px-2 text-right">Dec</th>
                      <th className="py-2.5 px-3 text-right bg-slate-800">Total</th>
                      <th className="py-2.5 px-3 text-right bg-slate-800">Monthly Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold text-[11px]">
                    {employeeTableRows.map((emp) => (
                      <tr key={emp.name} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emp.color }}></span>
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono">{emp.jan}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.feb}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.mar}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.apr}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.may}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.jun}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.jul}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.aug}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.sep}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.oct}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.nov}</td>
                        <td className="py-2 px-2 text-right font-mono">{emp.dec}</td>
                        <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-700 bg-slate-50">{emp.total}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700 bg-slate-50">{emp.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </WidgetCard>

        </div>
      )}

      {/* ---------------- PHASE 42: PRODUCT INSIGHTS TAB VIEW ---------------- */}
      {activeTab === 'product-insights' && (
        <ProductInsightsView />
      )}

      {/* FULLSCREEN EXPANDED WIDGET MODAL OVERLAY */}
      {expandedWidget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 p-6 flex flex-col justify-between animate-in fade-in duration-150">
          
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>
                {expandedWidget === 'monthly-revenue' && 'Monthly Revenue (Jan - Dec 2026) - Expanded Analysis'}
                {expandedWidget === 'sales-category' && 'Sales By Category Distribution - Detailed Breakdown'}
                {expandedWidget === 'daily-summary-trends' && 'Daily Summary Revenue Trends - Detailed Breakdown'}
                {expandedWidget === 'monthly-category-comparison' && 'Monthly Sales By Category (2026 vs 2025) - Comparative View'}
                {expandedWidget === 'hourly-sales-trends' && 'Average Sales by Hour (09:00 - 19:00) - Detailed View'}
                {expandedWidget === 'weekdays-sales-trends' && 'Sales by WeekDays Distribution - Detailed View'}
                {expandedWidget === 'employee-monthly-comparison' && 'Comparative Monthly Sales By Employee - Expanded Breakdown'}
              </span>
            </h3>
            <button
              onClick={() => setExpandedWidget(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Reduce View</span>
            </button>
          </div>

          {/* MODAL BODY (ENLARGED LIVE CHART) */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl my-4 p-6 overflow-hidden flex flex-col justify-center">
            {expandedWidget === 'daily-summary-trends' ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={dailyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#334155' }} />
                  <YAxis domain={[0, 300]} tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val} Million`, 'Daily Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : expandedWidget === 'monthly-category-comparison' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={categoryMonthlyComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val}M`, 'Sales']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', color: '#334155' }} />
                  <Bar dataKey="retail26" name="مفرق (2026)" stackId="a" fill="#10b981" />
                  <Bar dataKey="promo26" name="عروض (2026)" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="wholesale26" name="جملة (2026)" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="raw26" name="Raw Materials (2026)" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="total25" name="Total 2025 (Ref)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : expandedWidget === 'employee-monthly-comparison' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={employeeMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val}M`, 'Employee Sales']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', color: '#334155' }} />
                  <Bar dataKey="cashierN2" name="Cashier N2" stackId="emp" fill="#10b981" />
                  <Bar dataKey="cashierNK" name="Cashier NK" stackId="emp" fill="#3b82f6" />
                  <Bar dataKey="cashierR" name="Cashier R" stackId="emp" fill="#f59e0b" />
                  <Bar dataKey="hiba" name="Hiba Aloulou" stackId="emp" fill="#ec4899" />
                  <Bar dataKey="mahdi" name="Mahdi" stackId="emp" fill="#8b5cf6" />
                  <Bar dataKey="nour" name="Nour Yazbeck" stackId="emp" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : expandedWidget === 'monthly-revenue' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [`LBP ${val} Million`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-center">
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '14px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px', color: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-900 text-white font-black text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4">Category Name</th>
                        <th className="py-3 px-4 text-right">Revenue Amount</th>
                        <th className="py-3 px-4 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                      {categorySalesData.map((c) => (
                        <tr key={c.name} className="hover:bg-slate-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                            <span>{c.name}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">{c.amount}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{c.value}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
