'use client';

/**
 * SOUTHERN OLIVE OIL PRODUCTS S.A.R.L. (منتوجات زيت وزيتون الجنوب ش.م.م)
 * Main ERP Dashboard Component: <MainTileDashboard />
 * 
 * High-End Omega POS Style Tile Grid / Tile View Dashboard
 */

import React, { useState, useEffect } from 'react';
import ReceiveAndProductionMaster from './ReceiveAndProductionMaster';
import ProductMasterModal from './ProductMasterModal';
import SuperSonicFleetManager from './SuperSonicFleetManager';
import Sidebar from './Sidebar';
import TenantSettingsModal from './TenantSettingsModal';
import { useTenant } from '@/lib/TenantContext';
import {
  Building2,
  Droplets,
  ShieldCheck,
  UserCheck,
  LogOut,
  Package,
  Truck,
  BarChart3,
  CheckCircle2,
  Warehouse,
  LayoutGrid,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  Receipt,
  DollarSign,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Settings,
  Bell,
  Search,
  Mic,
  Sliders,
  Layers,
  Award,
  ClipboardList,
  RefreshCw,
  Plus
} from 'lucide-react';

interface TileItem {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  action?: () => void;
}

function getSectionMetadata(screenKey: string) {
  const map: Record<string, { titleAr: string; titleEn: string; module: string }> = {
    // Sales
    'sales-dash': { titleAr: 'لوحة تحكم المبيعات', titleEn: 'Sales Dashboard', module: 'Sales Control (المبيعات ونقطة البيع)' },
    'sales-reports': { titleAr: 'تقارير المبيعات الصندوقية', titleEn: 'Sales Cashier Reports', module: 'Sales Control (المبيعات ونقطة البيع)' },
    'sales-online': { titleAr: 'الطلبيات الإلكترونية والمتاجر', titleEn: 'Online Store Orders', module: 'Sales Control (المبيعات ونقطة البيع)' },
    'sales-eod': { titleAr: 'إغلاق الصندوق اليومي (Z-Report)', titleEn: 'End of Day Z-Report', module: 'Sales Control (المبيعات ونقطة البيع)' },
    'sales-setup-screen': { titleAr: 'تنسيق شاشات نقطة البيع', titleEn: 'POS Layout Screen Config', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-setup-payment': { titleAr: 'أنواع الدفع ووسائل السداد', titleEn: 'Payment Types & Methods', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-setup-coupons': { titleAr: 'الكوبونات وقسائم الهدايا', titleEn: 'Coupons & Gift Certificates', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-setup-discounts': { titleAr: 'سياسات الخصومات والتنزيلات', titleEn: 'Discounts & Promotions', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-setup-pricemodes': { titleAr: 'أنماط أسعار المبيعات', titleEn: 'Price Modes', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-setup-workstations': { titleAr: 'محطات العمل وطابعات الفواتير', titleEn: 'Workstations & Printers', module: 'Sales Setup (إعدادات المبيعات)' },
    'sales-moresetup-voidreasons': { titleAr: 'أسباب إلغاء الفواتير', titleEn: 'Void Invoice Reasons', module: 'Sales Advanced Setup' },
    'sales-moresetup-vatexempt': { titleAr: 'أسباب الإعفاء الضريبي', titleEn: 'VAT Exemption Reasons', module: 'Sales Advanced Setup' },
    'sales-moresetup-invoicemsg': { titleAr: 'رسائل وتذييل الفواتير', titleEn: 'Message on Invoice', module: 'Sales Advanced Setup' },
    'sales-moresetup-zonesetup': { titleAr: 'تنسيق مناطق البيع', titleEn: 'Zone Setup', module: 'Sales Advanced Setup' },
    'sales-moresetup-currencysetup': { titleAr: 'تهيئة العملات وسعر الصرف', titleEn: 'Currency Setup', module: 'Sales Advanced Setup' },

    // Fleet (🔒 PRO)
    'fleet-map': { titleAr: 'خريطة تتبع الشاحنات الحي GPS 🔒', titleEn: 'Live Fleet GPS Map', module: 'SuperSonic Management (🔒 Fleet & Logistics)' },
    'fleet-km': { titleAr: 'سجل المسافات والعدّادات 🔒', titleEn: 'KM Logs & Mileage', module: 'SuperSonic Management (🔒 Fleet & Logistics)' },
    'fleet-fuel': { titleAr: 'استهلاك الوقود والتعبئة 🔒', titleEn: 'Fuel Consumption & Refills', module: 'SuperSonic Management (🔒 Fleet & Logistics)' },
    'fleet-maint': { titleAr: 'صيانة وخدمة المركبات 🔒', titleEn: 'Vehicle Maintenance', module: 'SuperSonic Management (🔒 Fleet & Logistics)' },
    'fleet-playback': { titleAr: 'سجل الرحلات وإعادة التشغيل 🔒', titleEn: 'Trip History & Route Playback', module: 'SuperSonic Management (🔒 Fleet & Logistics)' },

    // Social CRM (🔒 ENT)
    'social-inbox': { titleAr: 'صندوق الرسائل الموحد 🔒', titleEn: 'Omnichannel Unified Inbox', module: 'Social Media Management (🔒 Social CRM)' },
    'social-orders': { titleAr: 'طلبات منصات التواصل 🔒', titleEn: 'Platform Orders & Draft Invoices', module: 'Social Media Management (🔒 Social CRM)' },
    'social-calendar': { titleAr: 'رزنامة المحتوى والنشر 🔒', titleEn: 'Content & Publishing Calendar', module: 'Social Media Management (🔒 Social CRM)' },
    'social-campaigns': { titleAr: 'الحملات الإعلانية وتكلفة الليد 🔒', titleEn: 'Ad Campaigns & CPL Analytics', module: 'Social Media Management (🔒 Social CRM)' },
    'social-agents': { titleAr: 'فريق الدعم الداخلي 🔒', titleEn: 'Internal Support Agents', module: 'Social Media Management (🔒 Social CRM)' },
    'social-distributors': { titleAr: 'دليل الموزعين الخارجيين 🔒', titleEn: 'External Distributors Directory', module: 'Social Media Management (🔒 Social CRM)' },

    // Operations
    'op-dash': { titleAr: 'لوحة تحكم العمليات الرئيسية', titleEn: 'Operations Center Dashboard', module: 'Operations Center & Olive Pressing' },
    'op-reports': { titleAr: 'تقارير العمليات والمعاصرة', titleEn: 'Operations & Pressing Reports', module: 'Operations Center & Olive Pressing' },
    'op-sales': { titleAr: 'مبيعات الجملة والتصدير', titleEn: 'Wholesale Sales & Export', module: 'Operations Actions' },
    'op-quotes': { titleAr: 'عروض الأسعار والتثمين', titleEn: 'Quotations & Valuations', module: 'Operations Actions' },
    'op-purchases': { titleAr: 'المشتريات والتوريد', titleEn: 'Purchases & Procurement', module: 'Operations Actions' },
    'op-po': { titleAr: 'أوامر الشراء الرسمية', titleEn: 'Official Purchase Orders (PO)', module: 'Operations Actions' },
    'op-reorder': { titleAr: 'دليل إعادة الطلب التلقائي', titleEn: 'Automated Reorder Guide', module: 'Operations Actions' },
    'op-transfer': { titleAr: 'تحويلات المخزون بين الخزانات', titleEn: 'Inventory Tank Transfer', module: 'Operations Actions' },
    'op-lostgoods': { titleAr: 'البضائع المفقودة والتالفة', titleEn: 'Lost & Damaged Goods Log', module: 'Operations Actions' },
    'op-bom': { titleAr: 'تركيبة وتجميع المنتجات (BOM Assembly)', titleEn: 'Item Assembly & Multi-Decimal BOM', module: 'Operations Actions' },
    'op-adjustments': { titleAr: 'تسويات المخزون الدوري', titleEn: 'Inventory Stock Adjustments', module: 'Operations Actions' },

    // Product Requests
    'op-prodreq-create': { titleAr: 'إنشاء طلب منتجات', titleEn: 'Create Product Request', module: 'Product Requests System' },
    'op-prodreq-manage': { titleAr: 'إدارة طلبات المنتجات', titleEn: 'Manage Product Requests', module: 'Product Requests System' },
    'op-prodreq-prep': { titleAr: 'تجهيز وإعداد الطلبات', titleEn: 'Preparation & Fulfilling', module: 'Product Requests System' },
    'op-prodreq-receive': { titleAr: 'استلام البضائع والمواد', titleEn: 'Receiving of Goods', module: 'Product Requests System' },
    'op-prodreq-reject': { titleAr: 'أسباب رفض شحنات البضائع', titleEn: 'Goods Reject Reasons', module: 'Product Requests System' },

    // Events
    'op-events-main': { titleAr: 'سجل الفعاليات والمناسبات', titleEn: 'Events Directory', module: 'Events Management' },
    'op-events-venues': { titleAr: 'أماكن وقاعات الفعاليات', titleEn: 'Event Venues', module: 'Events Management' },
    'op-events-resources': { titleAr: 'موارد تجهيز الفعاليات', titleEn: 'Event Resources', module: 'Events Management' },
    'op-events-types': { titleAr: 'تصنيفات وأنواع الفعاليات', titleEn: 'Event Types', module: 'Events Management' },

    // Setup
    'op-setup-quick': { titleAr: 'الإعداد السريع للمؤسسة', titleEn: 'Quick Operations Setup', module: 'Operations Setup' },
    'products-services': { titleAr: 'دليل المنتجات والخدمات', titleEn: 'Products & Services Master Catalog', module: 'Operations Setup' },
    'op-setup-groups': { titleAr: 'مجموعات الأصناف', titleEn: 'Item Groups', module: 'Operations Setup' },
    'op-setup-divisions': { titleAr: 'أقسام المنتجات', titleEn: 'Product Divisions', module: 'Operations Setup' },
    'op-setup-categories': { titleAr: 'فئات الأصناف', titleEn: 'Item Categories', module: 'Operations Setup' },
    'op-setup-locations': { titleAr: 'المواقع والمستودعات', titleEn: 'Warehouse Locations & Tanks', module: 'Operations Setup' },
    'op-setup-suppliers': { titleAr: 'دليل الموردين والمزارعين', titleEn: 'Suppliers Directory', module: 'Operations Setup' },
    'op-setup-depts': { titleAr: 'الإدارات التشغيلية', titleEn: 'Operational Departments', module: 'Operations Setup' },
    'op-setup-lostreasons': { titleAr: 'أسباب تلف البضائع', titleEn: 'Lost Goods Reasons', module: 'Operations Setup' },
    'op-setup-sizegroups': { titleAr: 'مجموعات المقاسات والأحجام', titleEn: 'Size Groups', module: 'Operations Setup' },
    'op-setup-sizes': { titleAr: 'مقاسات المنتجات', titleEn: 'Product Sizes', module: 'Operations Setup' },
    'op-setup-colors': { titleAr: 'ألوان العبوات', titleEn: 'Colors', module: 'Operations Setup' },
    'op-setup-brands': { titleAr: 'العلامات التجارية', titleEn: 'Brands', module: 'Operations Setup' },
    'op-setup-deliveryproviders': { titleAr: 'شركات التوصيل والشحن', titleEn: 'Delivery Providers', module: 'Operations Setup' },

    // CRM
    'cust-dir': { titleAr: 'دليل حسابات العملاء', titleEn: 'Customers Directory', module: 'Customer Management (CRM)' },
    'cust-receipts': { titleAr: 'إيصالات المقبوضات (Money-in)', titleEn: 'Customer Receipts', module: 'Customer Management (CRM)' },
    'cust-aged': { titleAr: 'أعمار ديون العملاء (Aged Debtors)', titleEn: 'Customer Aged Debtors', module: 'Customer Management (CRM)' },
    'cust-insights': { titleAr: 'تحليلات القيمة الممتدة للعميل (LTV)', titleEn: 'Customer Insights & LTV', module: 'Customer Management (CRM)' },
    'cust-tasks': { titleAr: 'المهام والمواعيد للعملاء', titleEn: 'Tasks & Appointments', module: 'Customer Management (CRM)' },
    'cust-leads': { titleAr: 'الفرص البيعية والجهات الاتصالية', titleEn: 'Leads & Contacts', module: 'Customer Management (CRM)' },
    'cust-performance': { titleAr: 'أداء فريق المبيعات والعملاء', titleEn: 'Sales Team Performance', module: 'Customer Management (CRM)' },
    'cust-settings-groups': { titleAr: 'مجموعات العملاء', titleEn: 'Customer Groups', module: 'CRM Setup' },
    'cust-settings-categories': { titleAr: 'تصنيفات العملاء', titleEn: 'Customer Categories', module: 'CRM Setup' },
    'cust-settings-tags': { titleAr: 'علامات ووسوم العملاء', titleEn: 'Customer Tags', module: 'CRM Setup' },
    'cust-settings-lead': { titleAr: 'إعدادات الفرص البيعية', titleEn: 'Lead Settings', module: 'CRM Setup' },

    // Feedback & Loyalty
    'cust-feedback-dash': { titleAr: 'لوحة الشكاوى والاقتراحات', titleEn: 'Feedback Dashboard', module: 'Feedback System' },
    'cust-feedback-manage': { titleAr: 'إدارة شكاوى العملاء', titleEn: 'Manage Complaints', module: 'Feedback System' },
    'cust-feedback-add': { titleAr: 'تسجيل شكوى جديدة', titleEn: 'Add Complaint', module: 'Feedback System' },
    'cust-feedback-surveys': { titleAr: 'استطلاعات الرأي والتقييم', titleEn: 'Manage Surveys', module: 'Feedback System' },
    'cust-feedback-emails': { titleAr: 'إرسال الاستطلاعات بالبريد', titleEn: 'Send Survey Emails', module: 'Feedback System' },
    'cust-feedback-resources': { titleAr: 'مصادر الشكاوى', titleEn: 'Complaint Resources', module: 'Feedback Setup' },
    'cust-feedback-cat': { titleAr: 'تصنيفات الشكاوى', titleEn: 'Complaint Categories', module: 'Feedback Setup' },
    'cust-feedback-actions': { titleAr: 'أنواع الإجراءات للشكاوى', titleEn: 'Action Types', module: 'Feedback Setup' },
    'cust-feedback-care': { titleAr: 'برنامج العناية بالعميل', titleEn: 'Complaint Care', module: 'Feedback Setup' },
    'cust-feedback-surveysetup': { titleAr: 'تهيئة استطلاعات الرأي', titleEn: 'Survey Setup', module: 'Feedback Setup' },
    'cust-loyalty-dash': { titleAr: 'لوحة برنامج الولاء والنقاط', titleEn: 'Loyalty Dashboard', module: 'Loyalty System' },
    'cust-loyalty-reports': { titleAr: 'تقارير النقاط والخصومات', titleEn: 'Loyalty Reports', module: 'Loyalty System' },
    'cust-loyalty-members': { titleAr: 'سجل أعضاء بطاقات الولاء', titleEn: 'Loyalty Members', module: 'Loyalty System' },
    'cust-loyalty-levels': { titleAr: 'مستويات ومراحل الولاء', titleEn: 'Loyalty Levels', module: 'Loyalty System' },
    'cust-loyalty-programs': { titleAr: 'برامج وتحديات الولاء', titleEn: 'Loyalty Programs', module: 'Loyalty System' },
    'cust-loyalty-msg': { titleAr: 'إرسال الرسائل الترويجية', titleEn: 'Send Promotional Messages', module: 'Loyalty System' },
    'cust-loyalty-company': { titleAr: 'بيانات برنامج ولاء الشركة', titleEn: 'Company Loyalty Info', module: 'Loyalty System' },

    // Accounting
    'acc-dash': { titleAr: 'لوحة النظام المحاسبي الشامل', titleEn: 'Accounting Dashboard', module: 'Accounting & Finance' },
    'acc-reports': { titleAr: 'القوائم والتقارير المالية', titleEn: 'Financial Reports (GL, Trial Balance, P&L, Balance Sheet)', module: 'Accounting & Finance' },
    'acc-jv': { titleAr: 'سندات اليومية العامة (JV)', titleEn: 'Journal Vouchers (JV)', module: 'Accounting Actions' },
    'acc-purchases': { titleAr: 'فواتير ومستندات المشتريات', titleEn: 'Purchase Vouchers', module: 'Accounting Actions' },
    'acc-payments': { titleAr: 'سندات الصرف والمدفوعات', titleEn: 'Payment Vouchers', module: 'Accounting Actions' },
    'acc-receipts': { titleAr: 'سندات القبض والمقبوضات', titleEn: 'Receipt Vouchers', module: 'Accounting Actions' },
    'acc-ar': { titleAr: 'حسابات ذمم العملاء المدينة', titleEn: 'Accounts Receivables (AR)', module: 'Accounting Actions' },
    'acc-ap': { titleAr: 'حسابات ذمم الموردين الدائنة', titleEn: 'Accounts Payables (AP)', module: 'Accounting Actions' },
    'acc-rec': { titleAr: 'تسوية ومطابقة الحسابات البنكية', titleEn: 'Bank Reconciliation', module: 'Accounting Actions' },
    'acc-vat': { titleAr: 'إغلاق فترة ضريبة القيمة المضافة T.V.A', titleEn: 'VAT Period Closing', module: 'Accounting Actions' },
    'acc-coa': { titleAr: 'شجرة الحسابات العامة (COA)', titleEn: 'Chart of Accounts Tree', module: 'Accounting Setup' },
    'acc-aux-classes': { titleAr: 'تصنيفات الحسابات المالية', titleEn: 'Account Classes', module: 'Account Auxiliaries' },
    'acc-aux-headers': { titleAr: 'المستويات القيادية 1-3', titleEn: 'Headers 1-3', module: 'Account Auxiliaries' },
    'acc-aux-groups': { titleAr: 'مجموعات الحسابات', titleEn: 'Account Groups', module: 'Account Auxiliaries' },
    'acc-aux-jvdesc': { titleAr: 'شروحات القيد النمطية', titleEn: 'JV Description Templates', module: 'Account Auxiliaries' },
    'acc-aux-jvtypes': { titleAr: 'أنواع سندات اليومية', titleEn: 'JV Types', module: 'Account Auxiliaries' },
    'acc-aux-currency': { titleAr: 'جدول العملات المحاسبية', titleEn: 'Currency Setup', module: 'Account Auxiliaries' },
    'acc-aux-rates': { titleAr: 'أسعار الصرف اليومية', titleEn: 'Currency Rates', module: 'Account Auxiliaries' },
    'acc-deptsetup-groups': { titleAr: 'مجموعات مراكز التكلفة', titleEn: 'Department Groups', module: 'Department Setup' },
    'acc-deptsetup-depts': { titleAr: 'دليل مراكز التكلفة والإدارات', titleEn: 'Cost Center Departments', module: 'Department Setup' },
    'acc-deptsetup-cashflow': { titleAr: 'إعداد تقرير التدفقات النقدية', titleEn: 'Cash Flow Report Setup', module: 'Department Setup' },
    'acc-deptsetup-subdepts': { titleAr: 'الأقسام والمراكز الفرعية', titleEn: 'Sub Departments', module: 'Department Setup' },

    // HR
    'hr-overview': { titleAr: 'جدول دوام وحضور الموظفين', titleEn: 'Schedule Overview', module: 'Human Resources & Payroll' },
    'hr-dir': { titleAr: 'سجل الموظفين والكادر الوظيفي', titleEn: 'Personnel Directory', module: 'Human Resources & Payroll' },
    'hr-schedules': { titleAr: 'مناوبات وجداول العمل', titleEn: 'Work Schedules & Shifts', module: 'Human Resources & Payroll' },
    'hr-orgsetup-depts': { titleAr: 'الإدارات والأقسام الداخلية', titleEn: 'Internal Departments', module: 'Organization Setup' },
    'hr-orgsetup-designations': { titleAr: 'المسميات الوظيفية والرتب', titleEn: 'Job Designations', module: 'Organization Setup' },
    'hr-orgsetup-permissions': { titleAr: 'صلاحيات الموظفين والكاشير', titleEn: 'POS Employee Permissions', module: 'Organization Setup' },
    'hr-timeoff': { titleAr: 'طلبات الإجازات والمغادرات', titleEn: 'Time Off Requests', module: 'Time & Attendance' },
    'hr-scheduletemplates': { titleAr: 'قوالب المناوبات والدوام', titleEn: 'Schedule Templates', module: 'Time & Attendance' },
    'hr-timeoffreasons': { titleAr: 'تصنيفات وأسباب الإجازات', titleEn: 'Time Off Reasons', module: 'Time & Attendance' },
    'hr-attendancesummary': { titleAr: 'ملخص الحضور والغياب', titleEn: 'Attendance Summary', module: 'Time & Attendance' },
    'hr-attendancelog': { titleAr: 'سجل البصمة الإلكتروني', titleEn: 'Attendance Biometric Log', module: 'Time & Attendance' },
    'hr-payroll-dash': { titleAr: 'لوحة مسير الرواتب والأجور', titleEn: 'Payroll Dashboard', module: 'Payroll Management' },
    'hr-payroll-payslips': { titleAr: 'قسائم الرواتب واحتساب الصافي', titleEn: 'Net Pay & Payslips', module: 'Payroll Management' },
    'hr-payroll-paymentsettings': { titleAr: 'إعدادات تحويل الرواتب للبنك', titleEn: 'Payroll Payment Settings', module: 'Payroll Management' },
    'hr-payroll-earningsdeductions': { titleAr: 'التعويضات المكافآت والحسميات', titleEn: 'Earnings & Deductions', module: 'Payroll Management' }
  };

  return map[screenKey] || {
    titleAr: screenKey,
    titleEn: 'ERP Workspace Sub-Module',
    module: 'Vanguard Enterprise Resource Planning'
  };
}

interface MainTileDashboardProps {
  initialScreen?: string;
}

export default function MainTileDashboard({ initialScreen = 'grid-dash' }: MainTileDashboardProps) {
  const { currentTenant, currentUser } = useTenant();
  const [activeScreen, setActiveScreen] = useState<string>(initialScreen);
  const [usdRate, setUsdRate] = useState<number>(89500);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isTenantSettingsOpen, setIsTenantSettingsOpen] = useState<boolean>(false);
  const tenantName = currentTenant?.brandNameAr || currentTenant?.name || "منتوجات زيت وزيتون الجنوب";

  useEffect(() => {
    document.title = 'Vanguard ERP - لوحة التحكم الرئيسية';
  }, []);

  const overviewTiles: TileItem[] = [
    {
      id: 'oil-pressing',
      titleAr: 'معصرة الزيت، الاستلام والإنتاج',
      titleEn: 'Oil Press, Receive & Production',
      icon: <Droplets className="w-8 h-8 text-emerald-600" />,
      badge: 'نشط الآن',
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('oil-pressing')
    },
    {
      id: 'analytics-dash',
      titleAr: 'لوحة تحليلات المبيعات والعمليات',
      titleEn: 'Executive Sales & Operations',
      icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
      badge: '+18.4%',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('analytics-dash')
    },
    {
      id: 'reports-summary',
      titleAr: 'التقارير المجمعة والتنفيذية',
      titleEn: 'Executive Summary Reports',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('reports-summary')
    },
    {
      id: 'tasks-events',
      titleAr: 'جدول المهام والمواعيد',
      titleEn: 'Tasks & Calendar Events',
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      badge: '3 اليوم',
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('tasks-events')
    },
    {
      id: 'aged-debtors',
      titleAr: 'أعمار الديون والذمم المدينة',
      titleEn: 'Customer Aged & Debtors',
      icon: <Users className="w-8 h-8 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('aged-debtors')
    }
  ];

  const billingTiles: TileItem[] = [
    {
      id: 'customers-dir',
      titleAr: 'دليل وحسابات العملاء',
      titleEn: 'Customers Directory',
      icon: <Users className="w-8 h-8 text-sky-600" />,
      color: 'text-sky-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('customers-dir')
    },
    {
      id: 'quotations',
      titleAr: 'عروض الأسعار والمناقصات',
      titleEn: 'Quotations & Bids',
      icon: <ClipboardList className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('quotations')
    },
    {
      id: 'sales-pos',
      titleAr: 'نقطة البيع ومراقبة المبيعات',
      titleEn: 'POS & Sales Control',
      icon: <ShoppingCart className="w-8 h-8 text-emerald-600" />,
      badge: 'POS ON',
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-pos')
    },
    {
      id: 'delivery-goods',
      titleAr: 'سندات وتسليم البضائع',
      titleEn: 'Delivery of Goods',
      icon: <Truck className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('delivery-goods')
    }
  ];

  const inventoryTiles: TileItem[] = [
    {
      id: 'product-master',
      titleAr: 'بطاقة تعريف المادة والمنتجات',
      titleEn: 'Products & Services Master Modal',
      icon: <Layers className="w-8 h-8 text-amber-600" />,
      badge: 'المركزي',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setIsProductModalOpen(true)
    },
    {
      id: 'inventory-stock',
      titleAr: 'جرد أصناف المواد والخزانات',
      titleEn: 'Inventory Stock & Tanks',
      icon: <Package className="w-8 h-8 text-amber-600" />,
      badge: '1,500 صنف',
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('inventory-stock')
    },
    {
      id: 'stock-transfers',
      titleAr: 'تحويلات المخازن والفروع',
      titleEn: 'Stock Transfers & Inter-branch',
      icon: <RefreshCw className="w-8 h-8 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('stock-transfers')
    },
    {
      id: 'vendors-purchases',
      titleAr: 'الموردين وأوامر الشراء',
      titleEn: 'Vendors & Purchase Orders',
      icon: <Warehouse className="w-8 h-8 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('vendors-purchases')
    },
    {
      id: 'inventory-brands',
      titleAr: 'العلامات التجارية والبراندات',
      titleEn: 'Inventory Brands & Lines',
      icon: <Layers className="w-8 h-8 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('inventory-brands')
    }
  ];

  const accountingTiles: TileItem[] = [
    {
      id: 'journal-vouchers',
      titleAr: 'سندات القيد اليومية (JVs)',
      titleEn: 'Journal Vouchers',
      icon: <Receipt className="w-8 h-8 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('journal-vouchers')
    },
    {
      id: 'accounts-receivables',
      titleAr: 'متابعة الذمم والتحصيل',
      titleEn: 'Accounts Receivables',
      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('accounts-receivables')
    },
    {
      id: 'bank-rec',
      titleAr: 'المطابقة والترصيد المصرفي',
      titleEn: 'Bank Reconciliation',
      icon: <ShieldCheck className="w-8 h-8 text-sky-600" />,
      color: 'text-sky-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('bank-rec')
    },
    {
      id: 'vat-closing',
      titleAr: 'إغلاق فترة ضريبة T.V.A',
      titleEn: 'VAT Period Closing',
      icon: <CheckCircle2 className="w-8 h-8 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('vat-closing')
    }
  ];

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-800 font-sans overflow-x-hidden">
      {/* 0. PERSISTENT GLOBAL NAVIGATION SIDEBAR */}
      <Sidebar activeScreen={activeScreen} onSelectScreen={(screen) => setActiveScreen(screen)} />

      {/* MAIN DASHBOARD CONTENT AREA */}
      <div suppressHydrationWarning className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-x-hidden">

      {/* 1. TOP SYSTEM HEADER (Vanguard ERP Top Banner) */}
      <header className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

        {/* BRAND IDENTITY: VANGUARD ERP PROVIDER + TENANT WORKSPACE */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 max-w-[56px] max-h-[56px] bg-slate-900 border-2 border-amber-500 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
            <img
              src={currentTenant?.logoUrl || '/assets/images/vanguard_logo.png'}
              alt={currentTenant?.brandNameAr || 'Tenant Logo'}
              className="w-full h-full object-cover rounded-xl shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src = '/assets/images/vanguard_logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Vanguard ERP
              </span>
              <span className="bg-slate-900 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Role: {currentUser?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2 mt-1">
              Workspace: <span className="text-amber-700">{currentTenant?.brandNameAr || currentTenant?.name || 'منتوجات زيت وزيتون الجنوب SARL'}</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {currentTenant?.subscriptionTier || 'ENTERPRISE'}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mt-0.5">
              <span>{currentTenant?.brandNameEn || 'Southern Olive & Oil Products SARL'}</span>
              {currentTenant?.companyRegistrationNumber && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 font-mono text-[10px]">
                  س.ت: {currentTenant.companyRegistrationNumber}
                </span>
              )}
              {currentTenant?.taxIdentificationNumber && (
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">
                  MOF: {currentTenant.taxIdentificationNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center gap-2">

          {/* TENANT SETTINGS BUTTON */}
          <button
            onClick={() => setIsTenantSettingsOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="إعدادات الهوية والترخيص والسجل التجاري"
          >
            <Settings className="w-4 h-4 text-amber-600" />
            <span>إعدادات الهوية والتراخيص</span>
          </button>

          {/* USD RATE BADGE */}
          <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>سعر الصرف: <strong className="text-amber-600">{usdRate.toLocaleString()} LBP</strong></span>
          </div>

          {/* ACTIVE SYSTEM STATUS BADGE */}
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>النظام التشغيلي الفعّال</span>
          </div>

          {/* BACK TO MAIN DASHBOARD TILE GRID BUTTON */}
          {activeScreen !== 'grid-dash' && (
            <button
              onClick={() => setActiveScreen('grid-dash')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> العودة إلى لوحة المربعات الرئيسية
            </button>
          )}
        </div>
      </header>

      {/* 2. SUBHEADER ACTION & QUICK SEARCH BAR */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث سريع في الشاشات والمعاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 pr-10 text-xs text-gray-800 font-bold focus:border-amber-500 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* QUICK BUTTON TABS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveScreen('grid-dash')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeScreen === 'grid-dash'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <LayoutGrid className="w-4 h-4 inline me-1" /> لوحة المربعات الرئيسية (Grid Dashboard)
          </button>

          <button
            onClick={() => setActiveScreen('oil-pressing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeScreen === 'oil-pressing'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-emerald-700 hover:bg-gray-200'
              }`}
          >
            <Droplets className="w-4 h-4 inline me-1" /> المعصرة والإنتاج (Oil Pressing)
          </button>
        </div>

      </div>

      {/* 3. DYNAMIC SCREEN ROUTER */}
      {
        activeScreen === 'oil-pressing' ? (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <h2 className="text-sm font-black text-amber-600 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-emerald-600" /> مركز الاستلام والإنتاج والمعاصر -- {tenantName || "Vanguard ERP System"}
              </h2>
              <button
                onClick={() => setActiveScreen('grid-dash')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200"
              >
                ← العودة للشبكة الرئيسية
              </button>
            </div>
            <ReceiveAndProductionMaster />
          </div>
        ) : (activeScreen === 'delivery-goods' || activeScreen === 'supersonic-fleet') ? (
          <SuperSonicFleetManager onBack={() => setActiveScreen('grid-dash')} />
        ) : (activeScreen === 'sales-pos' || activeScreen === 'sales-dash' || activeScreen === 'sales') ? (
          /* FULL SALES CONTROL & POS TERMINAL MODULE */
          <div className="space-y-6">
            {/* MODULE HEADER */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    نقطة البيع وإدارة المبيعات (POS & Sales Control)
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      مباشر - مباشر
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">
                    سجل الفواتير المباشرة وحركات المبيعات لـ {tenantName || "منتوجات زيت وزيتون الجنوب"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => typeof window !== 'undefined' && (window as any).openReportModal?.('sales_summary', 'تقرير المبيعات الصندوقي')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" /> تقرير المبيعات الصندوقي
                </button>
                <button
                  onClick={() => setActiveScreen('grid-dash')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200"
                >
                  ← العودة للشبكة الرئيسية
                </button>
              </div>
            </div>

            {/* KPI METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-500">إجمالي مبيعات اليوم ($USD)</p>
                <p className="text-2xl font-black text-emerald-600">$12,480.00</p>
                <p className="text-[10px] text-gray-400 font-bold">1,116,960,000 LBP @ 89,500</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-500">عدد الفواتير المنفذة</p>
                <p className="text-2xl font-black text-gray-900">48 فاتورة</p>
                <p className="text-[10px] text-emerald-600 font-bold">100% مكتمل ومثبت</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-500">متوسط قيمة الفاتورة</p>
                <p className="text-2xl font-black text-amber-600">$260.00</p>
                <p className="text-[10px] text-gray-400 font-bold">زيتون وثمار وزيت بكر</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-500">صندوق الكاش والمقبوضات</p>
                <p className="text-2xl font-black text-blue-600">نشط (Open POS)</p>
                <p className="text-[10px] text-gray-400 font-bold">أمناء الصندوق: 2 موظف</p>
              </div>
            </div>

            {/* RECENT SALES TRANSACTIONS TABLE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> جدول حركات المبيعات الصادرة حديثاً
                </h3>
                <span className="text-xs font-bold text-gray-500">آخر تحديث: الآن</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-black border-b border-gray-200">
                    <tr>
                      <th className="p-3">رقم الفاتورة</th>
                      <th className="p-3">العميل / الجهة</th>
                      <th className="p-3">الفرع / الصندوق</th>
                      <th className="p-3">المبلغ ($USD)</th>
                      <th className="p-3">المبلغ (LBP)</th>
                      <th className="p-3">حالة الدفع</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-gray-800">
                    <tr className="hover:bg-gray-50/80">
                      <td className="p-3 text-amber-600">SO-INV-2026-048</td>
                      <td className="p-3">تعاونية الشوف التجارية</td>
                      <td className="p-3 text-gray-500">صندوق المعصرة الرئيسي</td>
                      <td className="p-3 text-emerald-600 font-black">$1,450.00</td>
                      <td className="p-3 text-gray-500">129,775,000 LBP</td>
                      <td className="p-3"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px]">مدفوع نقداً</span></td>
                      <td className="p-3 text-center"><button className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg text-[10px] text-gray-700">طباعة الفاتورة</button></td>
                    </tr>
                    <tr className="hover:bg-gray-50/80">
                      <td className="p-3 text-amber-600">SO-INV-2026-047</td>
                      <td className="p-3">مؤسسة الجنوب للمواد الغذائية</td>
                      <td className="p-3 text-gray-500">POS فرع صيدا</td>
                      <td className="p-3 text-emerald-600 font-black">$2,890.00</td>
                      <td className="p-3 text-gray-500">258,655,000 LBP</td>
                      <td className="p-3"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px]">مدفوع نقداً</span></td>
                      <td className="p-3 text-center"><button className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg text-[10px] text-gray-700">طباعة الفاتورة</button></td>
                    </tr>
                    <tr className="hover:bg-gray-50/80">
                      <td className="p-3 text-amber-600">SO-INV-2026-046</td>
                      <td className="p-3">سوبرماركت الرائد</td>
                      <td className="p-3 text-gray-500">صندوق المبيعات الجملة</td>
                      <td className="p-3 text-emerald-600 font-black">$870.00</td>
                      <td className="p-3 text-gray-500">77,865,000 LBP</td>
                      <td className="p-3"><span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">ذمم ذمم كمبيالة</span></td>
                      <td className="p-3 text-center"><button className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg text-[10px] text-gray-700">طباعة الفاتورة</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeScreen !== 'grid-dash' ? (
          <div className="space-y-6 dir-rtl font-sans">
            {/* SECTION HEADER CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
                    <span>Vanguard ERP</span>
                    <span>/</span>
                    <span>{getSectionMetadata(activeScreen).module}</span>
                    <span>/</span>
                    <span className="text-amber-600 font-black">{getSectionMetadata(activeScreen).titleAr}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                    {getSectionMetadata(activeScreen).titleAr}
                    <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                      {getSectionMetadata(activeScreen).titleEn}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveScreen('grid-dash')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-gray-200"
                >
                  ← العودة للمربعات الرئيسية
                </button>
              </div>
            </div>

            {/* WORKSPACE DATA CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-black text-sm text-gray-900">سجل وتفاصيل {getSectionMetadata(activeScreen).titleAr}</h3>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">
                    إدارة حركات واستعلامات قسم {getSectionMetadata(activeScreen).module} لشركة {tenantName || "منتوجات زيت وزيتون الجنوب SARL"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-xl font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> النظام متصل وجاهز (Live Connected)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-gray-800">وحدة {getSectionMetadata(activeScreen).titleAr} ({getSectionMetadata(activeScreen).titleEn})</h4>
                <p className="text-xs text-gray-500 max-w-lg mx-auto font-medium">
                  يتم تحميل البيانات المباشرة وتطابق الجداول المحاسبية والتشغيلية لهذا القسم تلقائياً عبر محرك Vanguard ERP.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => alert(`تم تحديث بيانات ${getSectionMetadata(activeScreen).titleAr} بنجاح!`)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                  >
                    مزامنة وتحديث البيانات
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN OMEGA POS TILE GRID DASHBOARD */
          <div className="space-y-8">

            {/* SECTION 1: OVERVIEW BLOCK */}
            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-black text-amber-600 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-amber-600" /> 1. Overview & Oil Production (نظرة عامة والإنتاج)
                </h2>
                <span className="text-xs text-gray-500 font-bold">5 وحدات تشغيلية</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {overviewTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border border-gray-200 shadow-sm hover:border-amber-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                  >
                    <div className="relative">
                      {tile.icon}
                      {tile.badge && (
                        <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          {tile.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-800 group-hover:text-amber-600 transition-colors leading-tight">
                        {tile.titleAr}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        {tile.titleEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: BILLING & SALES BLOCK */}
            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" /> 2. Billing & Sales Control (المبيعات والفوترة)
                </h2>
                <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {billingTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border border-gray-200 shadow-sm hover:border-emerald-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                  >
                    <div className="relative">
                      {tile.icon}
                      {tile.badge && (
                        <span className="absolute -top-2 -right-3 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          {tile.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-800 group-hover:text-emerald-600 transition-colors leading-tight">
                        {tile.titleAr}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        {tile.titleEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: INVENTORY & SUPPLY CHAIN BLOCK */}
            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-black text-sky-600 flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky-600" /> 3. Inventory & Supply Chain (المخازن والتوريد)
                </h2>
                <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {inventoryTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border border-gray-200 shadow-sm hover:border-sky-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                  >
                    <div className="relative">
                      {tile.icon}
                      {tile.badge && (
                        <span className="absolute -top-2 -right-3 bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                          {tile.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-800 group-hover:text-sky-600 transition-colors leading-tight">
                        {tile.titleAr}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        {tile.titleEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: FINANCE & ACCOUNTING BLOCK */}
            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-black text-purple-600 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" /> 4. Finance & Accounting (المالية والحسابات)
                </h2>
                <span className="text-xs text-gray-500 font-bold">4 وحدات تشغيلية</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {accountingTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border border-gray-200 shadow-sm hover:border-purple-500 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md group space-y-3 min-h-[160px]"
                  >
                    <div className="relative">
                      {tile.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-gray-800 group-hover:text-purple-600 transition-colors leading-tight">
                        {tile.titleAr}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        {tile.titleEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )
      }

      {/* PRODUCT MASTER SUB-SYSTEM MODAL */}
      <ProductMasterModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* TENANT PROFILE, LOGO & LEGAL NUMBERS SETTINGS MODAL */}
      <TenantSettingsModal
        isOpen={isTenantSettingsOpen}
        onClose={() => setIsTenantSettingsOpen(false)}
      />

      {/* GLOBAL SAAS FOOTER - POWERED BY VANGUARD ERP */}
      <footer className="bg-white border-t border-gray-200 p-4 rounded-2xl text-center text-xs text-gray-500 font-bold space-y-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-700">
          <span className="font-black text-amber-600 flex items-center gap-1">
            ⚡ Powered by Vanguard ERP System
          </span>
          <span>© 2026 جميع الحقوق محفوظة</span>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-amber-600 transition-colors">سياسة الخصوصية (Privacy Policy)</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-amber-600 transition-colors">الشروط والأحكام (Terms of Service)</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-amber-600 transition-colors">الدعم والاتصال (Support)</a>
        </div>
        <p className="text-[10px] text-gray-400 font-mono">
          Workspace: {tenantName || "منتوجات زيت وزيتون الجنوب SARL"} | سجل تجاري: {currentTenant?.companyRegistrationNumber || 'CR-104928-LB'} | رقم مالي MOF: {currentTenant?.taxIdentificationNumber || 'MOF-7489201'}
        </p>
      </footer>
    </div>
  </div>
  );
}