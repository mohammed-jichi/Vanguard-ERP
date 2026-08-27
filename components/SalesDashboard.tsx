'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Clock3,
  Layers,
  PieChart as PieIcon,
  CreditCard,
  Ban,
  User,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown
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

  // Phase 75: Customers Tab States & Data
  const [topNCount, setTopNCount] = useState<number>(10);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [isDemographicsExpanded, setIsDemographicsExpanded] = useState<boolean>(true);
  const [isGroupByGroupExpanded, setIsGroupByGroupExpanded] = useState<boolean>(true);
  const [sortField, setSortField] = useState<'orders' | 'name' | 'value'>('orders');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const topCustomersData = [
    { name: 'Colonel Mahmoud Abboud Colonel Abboud', orders: 2, value: '0 LL', rawValue: 0 },
    { name: 'مطعم وريزورت شمس الجنوب', orders: 42, value: 'LBP 1,450,000,000', rawValue: 1450000000 },
    { name: 'شركة البركة للمواد الغذائية', orders: 18, value: 'LBP 420,000,000', rawValue: 420000000 },
    { name: 'مؤسسة الجنوب لتجارة الزيت', orders: 15, value: 'LBP 310,000,000', rawValue: 310000000 },
    { name: 'سوبرماركت الهناء - بيروت', orders: 12, value: 'LBP 185,000,000', rawValue: 185000000 },
    { name: 'محل الزهراء للمواد التموينية', orders: 9, value: 'LBP 115,000,000', rawValue: 115000000 },
    { name: 'خالد المحمود', orders: 7, value: 'LBP 95,000,000', rawValue: 95000000 },
    { name: 'حسان السيد', orders: 5, value: 'LBP 65,000,000', rawValue: 65000000 },
    { name: 'مؤسسة النور التجاري', orders: 4, value: 'LBP 48,000,000', rawValue: 48000000 },
    { name: 'محمد علي الحاج', orders: 3, value: 'LBP 35,000,000', rawValue: 35000000 },
  ];

  const demographicsCitiesData = [
    { city: 'Bourj Albarajne', count: 1, percent: '14.29%' },
    { city: 'Choueifat', count: 1, percent: '14.29%' },
    { city: 'Dbaye', count: 1, percent: '14.29%' },
    { city: 'Jebaa', count: 1, percent: '14.29%' },
    { city: 'JEITA', count: 1, percent: '14.29%' },
    { city: 'البقاع', count: 1, percent: '14.29%' },
    { city: 'الشويفات العمروسية', count: 1, percent: '14.29%' },
  ];

  const salesByGroupPieData = [
    { name: 'Clients', value: 248400000, color: '#10b981', percentage: '100.00%' }
  ];

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

  const divisionSalesData = [
    { name: 'Retail Olive Oil (زيت مفرق)', value: 52, amount: 'LBP 322.4M', color: '#10b981' },
    { name: 'Wholesale Drums (براميل جملة)', value: 25, amount: 'LBP 155.0M', color: '#3b82f6' },
    { name: 'Extraction & Pressing (عصر الزيتون)', value: 15, amount: 'LBP 93.0M', color: '#f59e0b' },
    { name: 'Organic Soaps (صابون بلدي)', value: 8, amount: 'LBP 49.6M', color: '#8b5cf6' }
  ];

  const groupSalesData = [
    { name: 'Glass Bottles', value: 40, amount: 'LBP 248.0M', color: '#06b6d4' },
    { name: 'Tin Cans 16L', value: 35, amount: 'LBP 217.0M', color: '#ec4899' },
    { name: 'Plastic Containers', value: 15, amount: 'LBP 93.0M', color: '#f97316' },
    { name: 'Loose Bulk', value: 10, amount: 'LBP 62.0M', color: '#64748b' }
  ];

  const departmentSalesData = [
    { name: 'MAIN DEPARTMENT', value: 68, amount: 'LBP 421.6M', color: '#3b82f6' },
    { name: 'Showroom', value: 22, amount: 'LBP 136.4M', color: '#10b981' },
    { name: 'Direct Delivery', value: 10, amount: 'LBP 62.0M', color: '#f59e0b' }
  ];

  const discountSummaryData = [
    { name: 'AMOUNT DISCOUNT', value: 65, amount: 'LBP 1,625,000', color: '#ef4444' },
    { name: 'PERCENTAGE DISCOUNT', value: 35, amount: 'LBP 875,000', color: '#8b5cf6' }
  ];

  const discountByCategoryData = [
    { type: 'AMOUNT DISCOUNT', raw: 'LBP 50,000', retail: 'LBP 950,000', promo: 'LBP 625,000', total: 'LBP 1,625,000' },
    { type: 'PERCENTAGE DISCOUNT', raw: 'LBP 25,000', retail: 'LBP 450,000', promo: 'LBP 400,000', total: 'LBP 875,000' },
    { type: 'TOTAL DISCOUNTS', raw: 'LBP 75,000', retail: 'LBP 1,400,000', promo: 'LBP 1,025,000', total: 'LBP 2,500,000', isTotal: true }
  ];

  const voidSummaryData = [
    { reason: 'Price Correction', value: 50, amount: 'LBP 1,200,000', count: 6, color: '#f59e0b' },
    { reason: 'Customer Cancellation', value: 30, amount: 'LBP 720,000', count: 4, color: '#ef4444' },
    { reason: 'Cashier Error', value: 20, amount: 'LBP 480,000', count: 2, color: '#64748b' }
  ];

  const userSummaryData = [
    { user: 'Hiba Aloulou', value: 30, amount: 'LBP 186.0M', color: '#ec4899' },
    { user: 'Mahdi', value: 25, amount: 'LBP 155.0M', color: '#8b5cf6' },
    { user: 'Cashier N2', value: 23, amount: 'LBP 142.6M', color: '#10b981' },
    { user: 'Nour Yazbeck', value: 22, amount: 'LBP 136.4M', color: '#06b6d4' }
  ];

  const paymentSummaryData = [
    { method: 'CASH LBP', value: 70, amount: 'LBP 434.0M', color: '#10b981' },
    { method: 'CASH USD', value: 25, amount: 'LBP 155.0M', color: '#3b82f6' },
    { method: 'Credit Card', value: 5, amount: 'LBP 31.0M', color: '#8b5cf6' }
  ];

  const employeeByCategoryData = [
    { user: 'Hiba Aloulou', raw: 'LBP 10.0M', wholesale: 'LBP 45.0M', promo: 'LBP 41.0M', retail: 'LBP 90.0M', total: 'LBP 186.0M' },
    { user: 'Mahdi', raw: 'LBP 8.0M', wholesale: 'LBP 35.0M', promo: 'LBP 32.0M', retail: 'LBP 80.0M', total: 'LBP 155.0M' },
    { user: 'Cashier N2', raw: 'LBP 6.0M', wholesale: 'LBP 30.0M', promo: 'LBP 31.6M', retail: 'LBP 75.0M', total: 'LBP 142.6M' },
    { user: 'Nour Yazbeck', raw: 'LBP 6.0M', wholesale: 'LBP 25.0M', promo: 'LBP 30.4M', retail: 'LBP 75.0M', total: 'LBP 136.4M' }
  ];

  // --- LIVE DATA: COMPARATIVE TAB ---
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

  const hourlyData = [
    { hour: '08:00', sales: 15, count: 6 },
    { hour: '09:00', sales: 25, count: 10 },
    { hour: '10:00', sales: 38, count: 15 },
    { hour: '11:00', sales: 52, count: 20 },
    { hour: '12:00', sales: 68, count: 26 },
    { hour: '13:00', sales: 62, count: 24 },
    { hour: '14:00', sales: 45, count: 18 },
    { hour: '15:00', sales: 40, count: 16 },
    { hour: '16:00', sales: 60, count: 22 },
    { hour: '17:00', sales: 85, count: 32 },
    { hour: '18:00', sales: 72, count: 28 },
    { hour: '19:00', sales: 55, count: 21 },
    { hour: '20:00', sales: 48, count: 19 },
    { hour: '21:00', sales: 35, count: 14 },
    { hour: '22:00', sales: 22, count: 9 },
    { hour: '23:00', sales: 12, count: 5 },
    { hour: '00:00', sales: 5, count: 2 }
  ];

  const yearlyStackedRevenueData = [
    {
      year: '2025',
      jan: 350, feb: 310, mar: 420, apr: 390, may: 450, jun: 490,
      jul: 520, aug: 580, sep: 460, oct: 410, nov: 360, dec: 610
    },
    {
      year: '2026',
      jan: 420, feb: 380, mar: 510, apr: 470, may: 540, jun: 590,
      jul: 650, aug: 720, sep: 550, oct: 490, nov: 410, dec: 710
    }
  ];

  const monthKeys = [
    { key: 'jan', name: 'January', color: '#10b981' },
    { key: 'feb', name: 'February', color: '#06b6d4' },
    { key: 'mar', name: 'March', color: '#3b82f6' },
    { key: 'apr', name: 'April', color: '#6366f1' },
    { key: 'may', name: 'May', color: '#8b5cf6' },
    { key: 'jun', name: 'June', color: '#d946ef' },
    { key: 'jul', name: 'July', color: '#ec4899' },
    { key: 'aug', name: 'August', color: '#f43f5e' },
    { key: 'sep', name: 'September', color: '#ef4444' },
    { key: 'oct', name: 'October', color: '#f97316' },
    { key: 'nov', name: 'November', color: '#f59e0b' },
    { key: 'dec', name: 'December', color: '#84cc16' }
  ];

  const comparativeVoidSummaryRows = [
    {
      branch: 'منتوجات زيت وزيتون الجنوب',
      jan: '1.2M', feb: '0.8M', mar: '1.5M', apr: '1.0M',
      may: '1.8M', jun: '2.1M', jul: '2.4M', aug: '2.8M',
      sep: '1.6M', oct: '1.2M', nov: '0.9M', dec: '2.5M',
      total: '19.8M'
    }
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
    window.print();
  };

  const handleRecalculate = () => {
    alert('Sales balances and MTD/YTD metrics recalculated successfully!');
  };

  // Interactive Legend Toggling State
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const handleLegendClick = (entry: any) => {
    const key = entry.dataKey || entry.value;
    if (key) {
      setHiddenSeries((prev) => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  // Custom Dark Tooltip for LineCharts & Single BarCharts (Daily Summary, Hourly, Weekdays)
  const DarkLineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const activePayload = payload.filter((p: any) => !p.hide);
    if (!activePayload.length) return null;
    return (
      <div className="bg-slate-900 border border-slate-700 !text-white text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1.5 font-sans min-w-[150px]" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
        <p className="font-bold !text-white text-white border-b border-slate-800 pb-1" style={{ color: '#ffffff' }}>
          {label}
        </p>
        {activePayload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 font-semibold !text-white text-white" style={{ color: '#ffffff' }}>
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: entry.color || entry.fill || '#10b981' }}
            ></span>
            <span className="!text-white text-white" style={{ color: '#ffffff' }}>
              Sales: LBP {entry.value}{typeof entry.value === 'number' && entry.value < 1000 ? 'M' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Custom Dark Tooltip for Yearly Revenue Stacked BarChart
  const YearlyRevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const activePayload = payload.filter((p: any) => !p.hide);
    if (!activePayload.length) return null;
    return (
      <div className="bg-slate-900 border border-slate-700 !text-white text-white p-3 rounded-xl shadow-xl text-xs space-y-2 font-sans min-w-[200px]" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
        <p className="font-extrabold !text-amber-300 text-amber-300 border-b border-slate-800 pb-1 text-sm" style={{ color: '#fde047' }}>
          Year {label}
        </p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {activePayload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-3 font-semibold !text-white text-white text-[11px]" style={{ color: '#ffffff' }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color || entry.fill }}></span>
                <span className="!text-slate-200 text-slate-200" style={{ color: '#e2e8f0' }}>{entry.name || entry.dataKey}:</span>
              </div>
              <span className="font-mono font-bold !text-white text-white" style={{ color: '#ffffff' }}>LBP {entry.value}M</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom White Tooltip for Monthly Category Comparison Stacked BarChart
  const CategoryComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const activePayload = payload.filter((p: any) => !p.hide);
    if (!activePayload.length) return null;
    return (
      <div className="bg-white border border-slate-200 text-slate-900 p-3.5 rounded-xl shadow-xl text-xs space-y-2 font-sans min-w-[210px]">
        <p className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1.5">
          {activePayload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-700 font-semibold">{entry.name || entry.dataKey}:</span>
              </div>
              <span className="font-mono font-extrabold text-slate-900">
                LBP {entry.value}{typeof entry.value === 'number' && entry.value < 1000 ? 'M' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom White Tooltip for Employee Monthly Sales Stacked BarChart
  const EmployeeComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const activePayload = payload.filter((p: any) => !p.hide);
    if (!activePayload.length) return null;
    return (
      <div className="bg-white border border-slate-200 text-slate-900 p-3.5 rounded-xl shadow-xl text-xs space-y-2 font-sans min-w-[220px]">
        <p className="font-black text-slate-900 text-sm border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1.5">
          {activePayload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-700 font-semibold">{entry.name || entry.dataKey}:</span>
              </div>
              <span className="font-mono font-extrabold text-slate-900">LBP {entry.value}M</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // EOD Status Modal State
  const [isEodModalOpen, setIsEodModalOpen] = useState<boolean>(false);

  // Hidden Pie Slices State (for dynamic 360-degree calculation & two-way toggling)
  const [hiddenPieItems, setHiddenPieItems] = useState<string[]>([]);

  const handleTogglePieItem = (itemKey: string) => {
    if (!itemKey) return;
    setHiddenPieItems((prev) =>
      prev.includes(itemKey) ? prev.filter((k) => k !== itemKey) : [...prev, itemKey]
    );
  };

  const getItemKey = (item: any, labelKey?: string) => {
    if (!item) return '';
    if (labelKey && item[labelKey] !== undefined) return String(item[labelKey]);
    return String(item.reason || item.method || item.user || item.name || item.type || '');
  };

  // Custom Tooltip for Monthly Revenue BarChart
  const MonthlyRevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const monthVal = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700 !text-white text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans min-w-[190px]" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
        <p className="font-black !text-amber-300 text-amber-300 border-b border-slate-800 pb-1 text-sm" style={{ color: '#fde047' }}>{label} 2026</p>
        <p className="text-[11px] font-bold !text-slate-200 text-slate-200" style={{ color: '#e2e8f0' }}>Branch: منتوجات زيت وزيتون الجنوب</p>
        <div className="flex items-center justify-between text-xs font-semibold !text-emerald-400 text-emerald-400 pt-1" style={{ color: '#34d399' }}>
          <span className="!text-white text-white" style={{ color: '#ffffff' }}>Net Revenue:</span>
          <span className="font-mono font-bold !text-emerald-400 text-emerald-400" style={{ color: '#34d399' }}>LBP {monthVal.value}M</span>
        </div>
      </div>
    );
  };

  // Reusable Widget Card Component (Centered Title Header)
  const WidgetCard = ({ id, title, className = '', children }: { id: string; title: string; className?: string; children: React.ReactNode }) => {
    return (
      <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between ${className}`}>
        <div className="relative flex items-center justify-center border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-center gap-2 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{title}</span>
          </h3>
          <div className="absolute right-0 flex items-center gap-1">
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

  // Custom Dark Tooltip for All Pie Slices (Category, Division, Group, Department, Discount, Void, User, Payment, Customers)
  const PieSliceTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    if (!item) return null;
    const dataObj = item.payload || {};
    const nameLabel = item.name || dataObj.name || dataObj.reason || dataObj.method || dataObj.user || dataObj.type || dataObj.label || 'Slice';
    const amountVal = dataObj.amount || (dataObj.value ? (typeof dataObj.value === 'number' ? `LBP ${dataObj.value.toLocaleString()}` : dataObj.value) : null);
    const countVal = dataObj.count !== undefined && dataObj.count !== null ? dataObj.count : null;
    const shareVal = dataObj.percentage || (dataObj.value !== undefined && typeof dataObj.value === 'number' ? `${dataObj.value}%` : (item.value !== undefined ? `${item.value}%` : null));

    return (
      <div className="bg-slate-900 border border-slate-700 !text-white text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans min-w-[180px] pointer-events-none z-50" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill || dataObj.color || '#10b981' }}></span>
          <p className="font-extrabold !text-white text-white text-sm" style={{ color: '#ffffff' }}>
            {nameLabel}
          </p>
        </div>
        {amountVal && (
          <div className="flex items-center justify-between text-[11px] font-semibold gap-3">
            <span className="!text-slate-300 text-slate-300" style={{ color: '#cbd5e1' }}>Value / Net:</span>
            <span className="font-mono font-bold !text-emerald-400 text-emerald-400" style={{ color: '#34d399' }}>{amountVal}</span>
          </div>
        )}
        {countVal !== null && (
          <div className="flex items-center justify-between text-[11px] font-semibold gap-3">
            <span className="!text-slate-300 text-slate-300" style={{ color: '#cbd5e1' }}>Count:</span>
            <span className="font-mono font-bold !text-amber-400 text-amber-400" style={{ color: '#fbbf24' }}>{countVal}</span>
          </div>
        )}
        {shareVal && (
          <div className="flex items-center justify-between text-[11px] font-semibold gap-3">
            <span className="!text-slate-300 text-slate-300" style={{ color: '#cbd5e1' }}>Share:</span>
            <span className="font-mono font-bold !text-white text-white" style={{ color: '#ffffff' }}>{shareVal}</span>
          </div>
        )}
      </div>
    );
  };

  const CustomTooltip = PieSliceTooltip;

  // Helper PieChart Widget Renderer (Solid Pies, Dynamic Filtering & Proper NameKey Legends)
  const RenderPieWidget = ({
    id,
    title,
    data,
    labelKey = 'name',
    className = ''
  }: {
    id: string;
    title: string;
    data: any[];
    labelKey?: string;
    className?: string;
  }) => {
    const activeData = data.filter((item) => {
      const key = getItemKey(item, labelKey);
      return !hiddenPieItems.includes(key);
    });

    const isFullWidth = className.includes('col-span-full');

    return (
      <WidgetCard id={id} title={title} className={className}>
        <div className={`flex flex-col space-y-4 ${isFullWidth ? 'items-center text-center' : ''}`}>
          <div className={`h-52 w-full ${isFullWidth ? 'max-w-2xl mx-auto flex justify-center' : ''}`}>
            {activeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey={labelKey}
                  >
                    {activeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieSliceTooltip />} />
                  <Legend
                    onClick={(e: any) => {
                      const key = e.value || e.name || (e.payload && (e.payload[labelKey] || e.payload.name || e.payload.user || e.payload.method || e.payload.reason));
                      if (key && typeof key === 'string') handleTogglePieItem(key);
                    }}
                    wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-xs italic">
                All slices hidden. Click table rows below to restore.
              </div>
            )}
          </div>

          <div className={`border border-slate-200 rounded-xl overflow-hidden text-base w-full ${isFullWidth ? 'max-w-4xl mx-auto' : ''}`}>
            <table className="w-full text-left font-sans">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                {data.map((row: any) => {
                  const key = getItemKey(row, labelKey);
                  const isHidden = hiddenPieItems.includes(key);
                  return (
                    <tr
                      key={key}
                      onClick={() => handleTogglePieItem(key)}
                      className={`cursor-pointer transition-all ${
                        isHidden ? 'opacity-40 grayscale bg-slate-100 line-through' : 'hover:bg-slate-50'
                      }`}
                      title="Click to toggle slice on/off"
                    >
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: isHidden ? '#94a3b8' : row.color }}
                        ></span>
                        <span className={isHidden ? 'text-slate-400 font-normal line-through' : ''}>{key}</span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono ${isHidden ? 'text-slate-400' : ''}`}>{row.amount}</td>
                      <td className={`py-3.5 px-4 text-right font-medium ${isHidden ? 'text-slate-400' : 'text-emerald-700'}`}>{row.value}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </WidgetCard>
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
              style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-extrabold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="منتجات زيت وزيتون الجنوب" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>منتجات زيت وزيتون الجنوب (Southern Olive Oil S.A.R.L)</option>
              <option value="Beirut Central Branch" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Beirut Central Branch</option>
              <option value="Saida Production Press" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Saida Production Press</option>
            </select>
          </div>

          {/* CURRENCY DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="LBP" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>LBP</option>
              <option value="USD" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>USD</option>
              <option value="EUR" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>EUR</option>
            </select>
          </div>

          {/* YEAR DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="2026" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2026</option>
              <option value="2025" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2025</option>
              <option value="2024" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2024</option>
            </select>
          </div>

          {/* MONTH DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="August" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>August</option>
              <option value="July" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>July</option>
              <option value="June" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>June</option>
              <option value="May" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>May</option>
            </select>
          </div>

          {/* DATE DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All Days" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>All Days</option>
              <option value="Today" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Today</option>
              <option value="This Week" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>This Week</option>
              <option value="MTD" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>MTD</option>
            </select>
          </div>

        </div>

        {/* RIGHT ACTIONS GROUP */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* EXPORT PDF BUTTON */}
          <button
            onClick={handleExportPDF}
            style={{ color: '#ffffff' }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 !text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span style={{ color: '#ffffff' }} className="!text-white">Export PDF</span>
          </button>

          {/* THREE ICON BUTTONS */}
          <button
            onClick={() => setIsEodModalOpen(true)}
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

          <a
            href="/sales-report"
            target="_blank"
            rel="noopener noreferrer"
            title="BarChart / Reports"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors shadow-2xs flex items-center justify-center"
          >
            <BarChart3 className="w-4 h-4" />
          </a>

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

          if (t.id === 'product-insights') {
            return (
              <a
                key={t.id}
                href="/product-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm"
              >
                Product Insights ↗
              </a>
            );
          }

          if (t.id === 'customer-insights') {
            return (
              <a
                key={t.id}
                href="/customer-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm"
              >
                Customer Insights ↗
              </a>
            );
          }

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={isActive ? { color: '#ffffff' } : {}}
              className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 !text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? '!text-white' : 'text-slate-400'}`} style={isActive ? { color: '#ffffff' } : {}} />
              <span style={isActive ? { color: '#ffffff' } : {}} className={isActive ? '!text-white' : ''}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- SUMMARY TAB VIEW (PHASE 43 POPULATED) ---------------- */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          
          {/* SECTION TITLE: PERFORMANCE HIGHLIGHTS */}
          <h2 className="text-center font-bold text-lg text-slate-800 tracking-tight pt-2">
            Performance Highlights
          </h2>

          {/* 6 PERFORMANCE HIGHLIGHTS CARDS WITH INTERACTIVE TOOLTIPS */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Highlight 1: Revenue YoY */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-500 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Revenue YoY</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-60 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Completed-month YoY: Net Sales from 2026 Jan-Jul vs 2025 Jan-Jul. Current month is excluded until it is complete.
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2 flex items-center gap-1">
                <span className="text-emerald-600 text-sm">▲</span> +18.4%
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">3.1 B LL | +100.0% YoY</p>
            </div>

            {/* Highlight 2: Best Month */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-blue-500 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Best Month</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Highest month revenue
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2">Aug 2026</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">202.3 M LL | Peak Month</p>
            </div>

            {/* Highlight 3: Softest Month */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-amber-500 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Softest Month</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Lowest month revenue
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2">Feb 2026</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">135.0 M LL | Softest Month</p>
            </div>

            {/* Highlight 4: Top YoY Month */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-teal-500 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Top YoY Month</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Highest month YoY change
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2">July</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">+32.5% YoY Growth</p>
            </div>

            {/* Highlight 5: Best Category */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-purple-500 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Best Category</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Highest category revenue
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2">مفرق</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">45.0% Share | Top Cat</p>
            </div>

            {/* Highlight 6: Peak Hour */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-slate-600 rounded-xl p-4 shadow-2xs relative group">
              <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
                <span>Peak Hour</span>
                <div className="relative group/tooltip">
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-52 p-2.5 bg-slate-900 border border-slate-700 !text-white text-white rounded-xl shadow-xl text-[11px] font-medium z-30 hidden group-hover/tooltip:block pointer-events-none" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                    Highest average hourly sales
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-black mt-2">13:00 - 14:00</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">18.5 M LL Avg | Peak Hour</p>
            </div>
          </div>

          {/* MAIN 2-COLUMN GRID FOR WIDGETS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* WIDGET 1: MONTHLY REVENUE (BAR CHART) - FULL WIDTH */}
            <WidgetCard id="monthly-revenue" title="Monthly Revenue (Jan - Dec 2026)" className="col-span-full">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<MonthlyRevenueTooltip />} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetCard>

            {/* WIDGET 2: SALES BY CATEGORY DISTRIBUTION */}
            <RenderPieWidget id="sales-category" title="Sales By Category Distribution" data={categorySalesData} />

            {/* WIDGET 3: SALES BY DIVISION */}
            <RenderPieWidget id="sales-division" title="Sales By Division" data={divisionSalesData} />

            {/* WIDGET 4: SALES BY GROUP */}
            <RenderPieWidget id="sales-group" title="Sales By Group" data={groupSalesData} />

            {/* WIDGET 5: SALES BY DEPARTMENT */}
            <RenderPieWidget id="sales-department" title="Sales By Department" data={departmentSalesData} />

            {/* WIDGET 6: DISCOUNT SUMMARY */}
            <RenderPieWidget id="discount-summary" title="Discount Summary" data={discountSummaryData} />

            {/* WIDGET 7: DISCOUNT BY CATEGORY SUMMARY (DATA TABLE ONLY) */}
            <WidgetCard id="discount-by-category" title="Discount By Category Summary">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900 text-white font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4">Discount Type</th>
                      <th className="py-3.5 px-4 text-right">Raw Materials</th>
                      <th className="py-3.5 px-4 text-right">مفرق</th>
                      <th className="py-3.5 px-4 text-right">عروض</th>
                      <th className="py-3.5 px-4 text-right bg-slate-800">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {discountByCategoryData.map((r) => (
                      <tr key={r.type} className={r.isTotal ? 'bg-amber-50 font-semibold text-amber-950 border-t-2 border-amber-300' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-medium">{r.type}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">{r.raw}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-blue-700">{r.retail}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-700">{r.promo}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-700">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WidgetCard>

            {/* WIDGET 8: VOID SUMMARY */}
            <WidgetCard id="void-summary" title="Void Summary">
              <div className="flex flex-col space-y-4">
                <div className="h-52 w-full">
                  {voidSummaryData.filter((item) => !hiddenPieItems.includes(item.reason)).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={voidSummaryData.filter((item) => !hiddenPieItems.includes(item.reason))}
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="reason"
                        >
                          {voidSummaryData.filter((item) => !hiddenPieItems.includes(item.reason)).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieSliceTooltip />} />
                        <Legend
                          onClick={(e: any) => {
                            const key = e.value || e.name || (e.payload && (e.payload.reason || e.payload.name));
                            if (key && typeof key === 'string') handleTogglePieItem(key);
                          }}
                          wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-xs italic">
                      All slices hidden. Click table rows below to restore.
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                      <tr>
                        <th className="py-3.5 px-4">Reason</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                      {voidSummaryData.map((v) => {
                        const key = v.reason;
                        const isHidden = hiddenPieItems.includes(key);
                        return (
                          <tr
                            key={key}
                            onClick={() => handleTogglePieItem(key)}
                            className={`cursor-pointer transition-all ${
                              isHidden ? 'opacity-40 grayscale bg-slate-100 line-through' : 'hover:bg-slate-50'
                            }`}
                            title="Click to toggle slice on/off"
                          >
                            <td className="py-3.5 px-4 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: isHidden ? '#94a3b8' : v.color }}
                              ></span>
                              <span className={isHidden ? 'text-slate-400 font-normal line-through' : ''}>{key}</span>
                            </td>
                            <td className={`py-3.5 px-4 text-right font-mono ${isHidden ? 'text-slate-400' : 'text-rose-700'}`}>{v.amount}</td>
                            <td className={`py-3.5 px-4 text-right font-medium ${isHidden ? 'text-slate-400' : 'text-slate-700'}`}>{v.count} voids</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </WidgetCard>

            {/* WIDGET 9: USER SUMMARY */}
            <RenderPieWidget id="user-summary" title="User Summary" data={userSummaryData} labelKey="user" />

            {/* WIDGET 10: PAYMENT SUMMARY (FULL WIDTH & CENTERED) */}
            <RenderPieWidget id="payment-summary" title="Payment Summary" data={paymentSummaryData} labelKey="method" className="col-span-full" />

          </div>

          {/* WIDGET 11: SALES BY EMPLOYEE BY CATEGORY (FULL WIDTH AT BOTTOM) */}
          <WidgetCard id="employee-by-category" title="Sales By Employee By Category (Complete Breakdown)">
            <div className="border border-slate-200 rounded-xl overflow-x-auto text-base">
              <table className="w-full text-left font-sans">
                <thead className="bg-slate-900 text-white font-semibold uppercase text-base tracking-wide">
                  <tr>
                    <th className="py-3.5 px-4">User Name</th>
                    <th className="py-3.5 px-4 text-right">Raw Materials</th>
                    <th className="py-3.5 px-4 text-right">جملة (Wholesale)</th>
                    <th className="py-3.5 px-4 text-right">عروض (Promotions)</th>
                    <th className="py-3.5 px-4 text-right">مفرق (Retail)</th>
                    <th className="py-3.5 px-4 text-right bg-slate-800">Total Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                  {employeeByCategoryData.map((emp) => (
                    <tr key={emp.user} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{emp.user}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{emp.raw}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-700">{emp.wholesale}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-blue-700">{emp.promo}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700">{emp.retail}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 bg-slate-50">{emp.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WidgetCard>

        </div>
      )}

      {/* ---------------- PHASE 41: COMPARATIVE TAB VIEW ---------------- */}
      {activeTab === 'comparative' && (
        <div className="space-y-6">
          
          {/* 1. DAILY SUMMARY WIDGET (FULL WIDTH LINECHART + DATA TABLE) */}
          <WidgetCard id="daily-summary-trends" title="Daily Summary">
            <div className="space-y-4">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 300]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkLineTooltip />} />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Daily Revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                      hide={!!hiddenSeries['revenue'] || !!hiddenSeries['Daily Revenue']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* DAILY DATA SUMMARY TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-base max-h-56 overflow-y-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide sticky top-0 bg-slate-100 z-10">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Net Revenue</th>
                      <th className="py-3.5 px-4 text-right">Orders Count</th>
                      <th className="py-3.5 px-4 text-right">Average Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {dailyTrendsData.map((d) => (
                      <tr key={d.date} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{d.date}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">LBP {d.revenue} Million</td>
                        <td className="py-3 px-4 text-right font-mono">{d.count} invoices</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">LBP {d.avgTicket}</td>
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
                    <Tooltip content={<CategoryComparisonTooltip />} />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                    <Bar dataKey="retail26" name="مفرق (2026)" stackId="a" fill="#10b981" hide={!!hiddenSeries['retail26'] || !!hiddenSeries['مفرق (2026)']} />
                    <Bar dataKey="promo26" name="عروض (2026)" stackId="a" fill="#3b82f6" hide={!!hiddenSeries['promo26'] || !!hiddenSeries['عروض (2026)']} />
                    <Bar dataKey="wholesale26" name="جملة (2026)" stackId="a" fill="#f59e0b" hide={!!hiddenSeries['wholesale26'] || !!hiddenSeries['جملة (2026)']} />
                    <Bar dataKey="raw26" name="Raw Materials (2026)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} hide={!!hiddenSeries['raw26'] || !!hiddenSeries['Raw Materials (2026)']} />
                    <Bar dataKey="total25" name="Total 2025 (Ref)" fill="#94a3b8" radius={[4, 4, 0, 0]} hide={!!hiddenSeries['total25'] || !!hiddenSeries['Total 2025 (Ref)']} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* DETAILED CATEGORY COMPARISON TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-base">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900 text-white font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4">Category Name</th>
                      <th className="py-3.5 px-4 text-right">2026 Amount</th>
                      <th className="py-3.5 px-4 text-right">2025 Amount</th>
                      <th className="py-3.5 px-4 text-right">Difference Amount</th>
                      <th className="py-3.5 px-4 text-right">Growth %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-normal text-base">
                    {categoryTableData.map((row) => (
                      <tr key={row.name} className={row.isTotal ? 'bg-amber-50 font-semibold text-amber-950 border-t-2 border-amber-300' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-medium">{row.name}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{row.year2026}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">{row.year2025}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">{row.diff}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">{row.growth}</td>
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
            <WidgetCard id="hourly-sales-trends" title="Average Sales by Hour">
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkLineTooltip />} />
                      <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="Avg Hourly Revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#3b82f6' }}
                        hide={!!hiddenSeries['sales'] || !!hiddenSeries['Avg Hourly Revenue']}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-base max-h-48 overflow-y-auto">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                      <tr>
                        <th className="py-3 px-4">Hour</th>
                        <th className="py-3 px-4 text-right">Avg Sales</th>
                        <th className="py-3 px-4 text-right">Avg Invoices</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                      {hourlyData.map((h) => (
                        <tr key={h.hour} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-medium">{h.hour}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700">LBP {h.sales}M</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-600">{h.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </WidgetCard>

            {/* WEEKDAYS WIDGET */}
            <WidgetCard id="weekdays-sales-trends" title="Sales by WeekDays">
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkLineTooltip />} />
                      <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                      <Bar
                        dataKey="sales"
                        name="Total Revenue"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                        hide={!!hiddenSeries['sales'] || !!hiddenSeries['Total Revenue']}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-base max-h-48 overflow-y-auto">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-base tracking-wide">
                      <tr>
                        <th className="py-3 px-4">Weekday</th>
                        <th className="py-3 px-4 text-right">Total Revenue</th>
                        <th className="py-3 px-4 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                      {weekdayData.map((w) => (
                        <tr key={w.day} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-medium">{w.day}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-amber-700">LBP {w.sales}M</td>
                          <td className="py-2.5 px-4 text-right font-medium text-slate-700">{w.share}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </WidgetCard>

          </div>

          {/* WIDGET A: YEARLY REVENUE (STACKED BARCHART BY MONTH) */}
          <WidgetCard id="yearly-revenue-comparison" title="Yearly Revenue">
            <div className="space-y-4">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyStackedRevenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<YearlyRevenueTooltip />} />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                    {monthKeys.map((m) => (
                      <Bar
                        key={m.key}
                        dataKey={m.key}
                        name={m.name}
                        stackId="year"
                        fill={m.color}
                        hide={!!hiddenSeries[m.key] || !!hiddenSeries[m.name]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </WidgetCard>

          {/* WIDGET B: VOID SUMMARY (DATA TABLE ONLY) */}
          <WidgetCard id="comparative-void-summary" title="Void Summary">
            <div className="border border-slate-200 rounded-xl overflow-x-auto text-base">
              <table className="w-full text-left font-sans">
                <thead className="bg-slate-900 text-white font-semibold uppercase text-base tracking-wide">
                  <tr>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-3 text-right">January</th>
                    <th className="py-3.5 px-3 text-right">February</th>
                    <th className="py-3.5 px-3 text-right">March</th>
                    <th className="py-3.5 px-3 text-right">April</th>
                    <th className="py-3.5 px-3 text-right">May</th>
                    <th className="py-3.5 px-3 text-right">June</th>
                    <th className="py-3.5 px-3 text-right">July</th>
                    <th className="py-3.5 px-3 text-right">August</th>
                    <th className="py-3.5 px-3 text-right">September</th>
                    <th className="py-3.5 px-3 text-right">October</th>
                    <th className="py-3.5 px-3 text-right">November</th>
                    <th className="py-3.5 px-3 text-right">December</th>
                    <th className="py-3.5 px-4 text-right bg-slate-800">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                  {comparativeVoidSummaryRows.map((r) => (
                    <tr key={r.branch} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-medium text-slate-900">{r.branch}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.jan}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.feb}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.mar}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.apr}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.may}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.jun}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.jul}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.aug}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.sep}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.oct}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.nov}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">{r.dec}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-700 bg-slate-50">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WidgetCard>

          {/* 4. COMPARATIVE MONTHLY SALES BY EMPLOYEE (STACKED BARCHART + COMPREHENSIVE TABLE) */}
          <WidgetCard id="employee-monthly-comparison" title="Comparative Monthly Sales By Employee">
            <div className="space-y-5">
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<EmployeeComparisonTooltip />} />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '11px', color: '#334155' }} />
                    <Bar dataKey="cashierN2" name="Cashier N2" stackId="emp" fill="#10b981" hide={!!hiddenSeries['cashierN2'] || !!hiddenSeries['Cashier N2']} />
                    <Bar dataKey="cashierNK" name="Cashier NK" stackId="emp" fill="#3b82f6" hide={!!hiddenSeries['cashierNK'] || !!hiddenSeries['Cashier NK']} />
                    <Bar dataKey="cashierR" name="Cashier R" stackId="emp" fill="#f59e0b" hide={!!hiddenSeries['cashierR'] || !!hiddenSeries['Cashier R']} />
                    <Bar dataKey="hiba" name="Hiba Aloulou" stackId="emp" fill="#ec4899" hide={!!hiddenSeries['hiba'] || !!hiddenSeries['Hiba Aloulou']} />
                    <Bar dataKey="mahdi" name="Mahdi" stackId="emp" fill="#8b5cf6" hide={!!hiddenSeries['mahdi'] || !!hiddenSeries['Mahdi']} />
                    <Bar dataKey="nour" name="Nour Yazbeck" stackId="emp" fill="#06b6d4" radius={[4, 4, 0, 0]} hide={!!hiddenSeries['nour'] || !!hiddenSeries['Nour Yazbeck']} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* COMPREHENSIVE EMPLOYEE SALES DATA TABLE */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-base">
                <table className="w-full text-left font-sans">
                  <thead className="bg-slate-900 text-white font-semibold uppercase text-base tracking-wide">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-3 text-right">Jan</th>
                      <th className="py-3.5 px-3 text-right">Feb</th>
                      <th className="py-3.5 px-3 text-right">Mar</th>
                      <th className="py-3.5 px-3 text-right">Apr</th>
                      <th className="py-3.5 px-3 text-right">May</th>
                      <th className="py-3.5 px-3 text-right">Jun</th>
                      <th className="py-3.5 px-3 text-right">Jul</th>
                      <th className="py-3.5 px-3 text-right">Aug</th>
                      <th className="py-3.5 px-3 text-right">Sep</th>
                      <th className="py-3.5 px-3 text-right">Oct</th>
                      <th className="py-3.5 px-3 text-right">Nov</th>
                      <th className="py-3.5 px-3 text-right">Dec</th>
                      <th className="py-3.5 px-4 text-right bg-slate-800">Total</th>
                      <th className="py-3.5 px-4 text-right bg-slate-800">Monthly Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-normal text-base">
                    {employeeTableRows.map((emp) => (
                      <tr key={emp.name} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: emp.color }}></span>
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.jan}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.feb}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.mar}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.apr}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.may}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.jun}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.jul}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.aug}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.sep}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.oct}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.nov}</td>
                        <td className="py-3.5 px-3 text-right font-mono">{emp.dec}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700 bg-slate-50">{emp.total}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700 bg-slate-50">{emp.avg}</td>
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

      {/* ---------------- PHASE 75: CUSTOMERS TAB VIEW (IN-PLACE RENDER) ---------------- */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* SECTION 1: CUSTOMERS STATISTICS (3-COLUMN GRID) */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 text-center">
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                Customers Statistics
              </h2>
            </div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* COLUMN 1: STATS TABLES (LEFT) */}
              <div className="space-y-4">
                
                {/* Table 1: Customers */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-3">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Customers</h3>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs font-sans">
                    <div className="flex justify-between py-2 px-3 bg-white">
                      <span className="text-slate-600 font-medium">Total Number of Customers</span>
                      <span className="font-mono font-bold text-slate-900">33</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-slate-50/50">
                      <span className="text-slate-600 font-medium">New Customers (August)</span>
                      <span className="font-mono font-bold text-slate-900">0</span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-200 bg-white">
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">MTD</span>
                        <span className="font-mono font-bold text-slate-900">0</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">YTD</span>
                        <span className="font-mono font-bold text-slate-900">31</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/50">
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">LMTD</span>
                        <span className="font-mono font-bold text-slate-900">1</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">LYTD</span>
                        <span className="font-mono font-bold text-slate-900">33</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-200 bg-white">
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">LM</span>
                        <span className="font-mono font-bold text-slate-900">1</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-slate-500 font-medium">LY</span>
                        <span className="font-mono font-bold text-slate-900">2</span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-slate-50/50">
                      <span className="text-slate-600 font-medium">Not Active Customers</span>
                      <span className="font-mono font-bold text-amber-600">2</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-white">
                      <span className="text-slate-600 font-medium">Repeated Customers Rate</span>
                      <span className="font-mono font-bold text-emerald-600">100%</span>
                    </div>
                  </div>
                </div>

                {/* Table 2: Delivery Orders */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-3">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Delivery Orders</h3>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs font-sans">
                    <div className="flex justify-between py-2 px-3 bg-white">
                      <span className="text-slate-600 font-medium">Total Number of Delivery Orders</span>
                      <span className="font-mono font-bold text-slate-900">0</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-slate-50/50">
                      <span className="text-slate-600 font-medium">Delivery Orders Value</span>
                      <span className="font-mono font-bold text-slate-900">0 LL</span>
                    </div>
                    <div className="flex justify-between py-2 px-3 bg-white">
                      <span className="text-slate-600 font-medium">Average Delivery Value</span>
                      <span className="font-mono font-bold text-slate-900">0 LL</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* COLUMN 2: TOP CUSTOMERS LIST (MIDDLE) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between bg-white">
                <div>
                  {/* Table Header Controls */}
                  <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <span>Customer</span>
                      <button
                        onClick={() => {
                          setSortField('name');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title="Sort by Customer Name"
                      >
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 font-medium">Top:</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={topNCount}
                        onChange={(e) => setTopNCount(Math.max(1, parseInt(e.target.value) || 10))}
                        className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono font-bold text-slate-800"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-24 pl-6 pr-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-sans text-slate-800"
                        />
                        <Search className="w-3 h-3 text-slate-400 absolute left-1.5 top-1.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wide border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">CUSTOMER</th>
                          <th className="py-2 px-2 text-center">ORDERS</th>
                          <th className="py-2 px-3 text-right">VALUE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {topCustomersData
                          .filter((c) => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()))
                          .slice(0, topNCount)
                          .map((cust, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/80'}>
                              <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[160px]" title={cust.name}>
                                {cust.name}
                              </td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-slate-700">
                                {cust.orders}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                {cust.value}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 py-1.5 px-3 text-[11px] text-slate-500 font-semibold text-right">
                  Showing top {topNCount} customers
                </div>
              </div>

              {/* COLUMN 3: DEMOGRAPHICS (RIGHT) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between bg-white">
                <div>
                  <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-3">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Demographics</h3>
                  </div>

                  {/* Collapsible Group Header: Lebanon */}
                  <div
                    onClick={() => setIsDemographicsExpanded(!isDemographicsExpanded)}
                    className="bg-slate-100 border-b border-slate-200 py-2 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      {isDemographicsExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                      <span>Lebanon</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded-full">
                      Total: 7
                    </span>
                  </div>

                  {/* Demographics Data Table */}
                  {isDemographicsExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wide border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">CITY</th>
                            <th className="py-2 px-3 text-center">TOTAL</th>
                            <th className="py-2 px-3 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {demographicsCitiesData.map((d, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/80'}>
                              <td className="py-2 px-3 font-medium text-slate-900">{d.city}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">{d.count}</td>
                              <td className="py-2 px-3 text-right font-mono font-semibold text-indigo-600">{d.percent}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border-t border-slate-200 py-1.5 px-3 text-[11px] text-slate-500 font-semibold text-right">
                  7 Lebanese regions mapped
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: SALES BY CUSTOMER BY GROUP */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 flex items-center justify-between">
              <span className="w-8"></span>
              <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide text-center">
                Sales By Customer By Group
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setExpandedWidget('sales-by-customer-by-group')}
                  title="Expand Fullscreen"
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert('Options for Sales By Customer By Group')}
                  title="Options"
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center justify-center space-y-6">
              
              {/* Solid Pie Chart (innerRadius = 0) */}
              <div className="w-full max-w-sm h-64 flex items-center justify-center">
                {salesByGroupPieData.filter((i) => !hiddenPieItems.includes(i.name)).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByGroupPieData.filter((i) => !hiddenPieItems.includes(i.name))}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={95}
                        dataKey="value"
                        nameKey="name"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {salesByGroupPieData
                          .filter((i) => !hiddenPieItems.includes(i.name))
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip content={<PieSliceTooltip />} />
                      <Legend
                        onClick={(e: any) => {
                          const key = e.value || e.name;
                          if (key) handleTogglePieItem(key);
                        }}
                        wrapperStyle={{ cursor: 'pointer', fontSize: '12px', color: '#334155' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-xs italic border border-dashed border-slate-300 rounded-xl p-8 text-center">
                    All slices hidden. Click table row below to restore.
                  </div>
                )}
              </div>

              {/* Legend & Data Table Below Chart */}
              <div className="w-full max-w-xl border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* Collapsible Header Row: All Groups */}
                <div
                  onClick={() => setIsGroupByGroupExpanded(!isGroupByGroupExpanded)}
                  className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    {isGroupByGroupExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    )}
                    <span>All Groups</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-white border border-slate-300 px-3 py-1 rounded-full">
                    Total Value: 248,400,000 LL
                  </span>
                </div>

                {/* Data Rows */}
                {isGroupByGroupExpanded && (
                  <div className="divide-y divide-slate-100 text-xs font-sans bg-white">
                    {salesByGroupPieData.map((item) => {
                      const isHidden = hiddenPieItems.includes(item.name);
                      return (
                        <div
                          key={item.name}
                          onClick={() => handleTogglePieItem(item.name)}
                          className={`flex items-center justify-between py-3 px-4 transition-all cursor-pointer ${
                            isHidden ? 'opacity-40 grayscale bg-slate-100 line-through' : 'hover:bg-slate-50'
                          }`}
                          title="Click to toggle slice on/off"
                        >
                          <div className="flex items-center gap-2.5 font-medium text-slate-900">
                            <span
                              className="w-3.5 h-3.5 rounded-sm inline-block border"
                              style={{
                                backgroundColor: isHidden ? '#94a3b8' : item.color,
                                borderColor: isHidden ? '#64748b' : item.color
                              }}
                            ></span>
                            <span className={isHidden ? 'line-through text-slate-400 font-normal' : ''}>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-6 font-mono">
                            <span className={`font-bold ${isHidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              248,400,000 LL
                            </span>
                            <span
                              className={`font-bold px-2.5 py-0.5 rounded-full border ${
                                isHidden
                                  ? 'bg-slate-200 text-slate-400 border-slate-300 line-through'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}
                            >
                              {item.percentage}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
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
                {expandedWidget === 'sales-division' && 'Sales By Division - Detailed Breakdown'}
                {expandedWidget === 'sales-group' && 'Sales By Group - Detailed Breakdown'}
                {expandedWidget === 'sales-department' && 'Sales By Department - Detailed Breakdown'}
                {expandedWidget === 'discount-summary' && 'Discount Summary - Detailed Breakdown'}
                {expandedWidget === 'discount-by-category' && 'Discount By Category Summary - Detailed Grid'}
                {expandedWidget === 'void-summary' && 'Void Summary - Detailed Breakdown'}
                {expandedWidget === 'user-summary' && 'User Summary - Detailed Breakdown'}
                {expandedWidget === 'payment-summary' && 'Payment Summary - Detailed Breakdown'}
                {expandedWidget === 'employee-by-category' && 'Sales By Employee By Category - Full Breakdown'}
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

          {/* MODAL BODY (ENLARGED LIVE CHART / TABLE) */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl my-4 p-6 overflow-hidden flex flex-col justify-center">
            {expandedWidget === 'daily-summary-trends' ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={dailyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#334155' }} />
                  <YAxis domain={[0, 300]} tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip content={<DarkLineTooltip />} />
                  <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '13px', color: '#334155' }} />
                  <Line type="monotone" dataKey="revenue" name="Daily Revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 8 }} hide={!!hiddenSeries['revenue'] || !!hiddenSeries['Daily Revenue']} />
                </LineChart>
              </ResponsiveContainer>
            ) : expandedWidget === 'monthly-category-comparison' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={categoryMonthlyComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip content={<CategoryComparisonTooltip />} />
                  <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '13px', color: '#334155' }} />
                  <Bar dataKey="retail26" name="مفرق (2026)" stackId="a" fill="#10b981" hide={!!hiddenSeries['retail26'] || !!hiddenSeries['مفرق (2026)']} />
                  <Bar dataKey="promo26" name="عروض (2026)" stackId="a" fill="#3b82f6" hide={!!hiddenSeries['promo26'] || !!hiddenSeries['عروض (2026)']} />
                  <Bar dataKey="wholesale26" name="جملة (2026)" stackId="a" fill="#f59e0b" hide={!!hiddenSeries['wholesale26'] || !!hiddenSeries['جملة (2026)']} />
                  <Bar dataKey="raw26" name="Raw Materials (2026)" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} hide={!!hiddenSeries['raw26'] || !!hiddenSeries['Raw Materials (2026)']} />
                  <Bar dataKey="total25" name="Total 2025 (Ref)" fill="#94a3b8" radius={[6, 6, 0, 0]} hide={!!hiddenSeries['total25'] || !!hiddenSeries['Total 2025 (Ref)']} />
                </BarChart>
              </ResponsiveContainer>
            ) : expandedWidget === 'employee-monthly-comparison' ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={employeeMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 13, fill: '#334155' }} />
                  <Tooltip content={<EmployeeComparisonTooltip />} />
                  <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer', fontSize: '13px', color: '#334155' }} />
                  <Bar dataKey="cashierN2" name="Cashier N2" stackId="emp" fill="#10b981" hide={!!hiddenSeries['cashierN2'] || !!hiddenSeries['Cashier N2']} />
                  <Bar dataKey="cashierNK" name="Cashier NK" stackId="emp" fill="#3b82f6" hide={!!hiddenSeries['cashierNK'] || !!hiddenSeries['Cashier NK']} />
                  <Bar dataKey="cashierR" name="Cashier R" stackId="emp" fill="#f59e0b" hide={!!hiddenSeries['cashierR'] || !!hiddenSeries['Cashier R']} />
                  <Bar dataKey="hiba" name="Hiba Aloulou" stackId="emp" fill="#ec4899" hide={!!hiddenSeries['hiba'] || !!hiddenSeries['Hiba Aloulou']} />
                  <Bar dataKey="mahdi" name="Mahdi" stackId="emp" fill="#8b5cf6" hide={!!hiddenSeries['mahdi'] || !!hiddenSeries['Mahdi']} />
                  <Bar dataKey="nour" name="Nour Yazbeck" stackId="emp" fill="#06b6d4" radius={[6, 6, 0, 0]} hide={!!hiddenSeries['nour'] || !!hiddenSeries['Nour Yazbeck']} />
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
                      data={
                        expandedWidget === 'sales-division' ? divisionSalesData :
                        expandedWidget === 'sales-group' ? groupSalesData :
                        expandedWidget === 'sales-department' ? departmentSalesData :
                        expandedWidget === 'discount-summary' ? discountSummaryData :
                        expandedWidget === 'void-summary' ? voidSummaryData :
                        expandedWidget === 'user-summary' ? userSummaryData :
                        expandedWidget === 'payment-summary' ? paymentSummaryData :
                        categorySalesData
                      }
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(
                        expandedWidget === 'sales-division' ? divisionSalesData :
                        expandedWidget === 'sales-group' ? groupSalesData :
                        expandedWidget === 'sales-department' ? departmentSalesData :
                        expandedWidget === 'discount-summary' ? discountSummaryData :
                        expandedWidget === 'void-summary' ? voidSummaryData :
                        expandedWidget === 'user-summary' ? userSummaryData :
                        expandedWidget === 'payment-summary' ? paymentSummaryData :
                        categorySalesData
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieSliceTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', color: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-base">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-900 text-white font-semibold text-base uppercase tracking-wide">
                      <tr>
                        <th className="py-3.5 px-4">Name</th>
                        <th className="py-3.5 px-4 text-right">Revenue Amount</th>
                        <th className="py-3.5 px-4 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-normal text-base">
                      {(
                        expandedWidget === 'sales-division' ? divisionSalesData :
                        expandedWidget === 'sales-group' ? groupSalesData :
                        expandedWidget === 'sales-department' ? departmentSalesData :
                        expandedWidget === 'discount-summary' ? discountSummaryData :
                        expandedWidget === 'void-summary' ? voidSummaryData :
                        expandedWidget === 'user-summary' ? userSummaryData :
                        expandedWidget === 'payment-summary' ? paymentSummaryData :
                        categorySalesData
                      ).map((c: any) => (
                        <tr key={c.name || c.reason || c.user || c.method} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 flex items-center gap-3 font-medium">
                            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                            <span>{c.name || c.reason || c.user || c.method}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">{c.amount}</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">{c.value}%</td>
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

      {/* END OF DAY STATUS MODAL OVERLAY */}
      {isEodModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-xs w-full border border-slate-200 space-y-4">
            <h3 className="text-red-600 font-extrabold text-base border-b border-slate-200 pb-2 text-center">
              End of Day Status
            </h3>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 py-3 px-1 border-b border-slate-100">
              <span className="text-slate-900 font-black">منتوجات زيت وزيتون الجنوب :</span>
              <span className="font-mono text-slate-600">25 Aug, 2026</span>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setIsEodModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-lg text-xs transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
