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
import VanguardGlobalHeader from './VanguardGlobalHeader';
import VanguardSubHeader from './VanguardSubHeader';
import GenericDataTable from './GenericDataTable';
import SalesDashboard from './SalesDashboard';
import ReportsMasterDetail from './ReportsMasterDetail';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
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

const SALES_CONTROL_TITLES: Record<string, string> = {
  'sc-dashboard': 'Dashboard',
  'sc-reports': 'Reports',
  'sc-online-orders': 'Online Orders',
  'sc-eod': 'End of Day',
  'setup-screens': 'Screens',
  'setup-payment-types': 'Payment Types',
  'setup-coupons': 'Coupons and Gift Certificates',
  'setup-discounts': 'Discounts',
  'setup-price-modes': 'Price Modes',
  'setup-workstations': 'Workstations and Printers',
  'more-void': 'Void Reasons',
  'more-vat': 'VAT Exemptions Reason',
  'more-message': 'Message on Invoice',
  'more-zone': 'Zone Setup',
  'more-currency': 'Currency Setup',

  'sales-dash': 'Dashboard',
  'sales-reports': 'Reports',
  'sales-online': 'Online Orders',
  'sales-eod': 'End of Day',
  'sales-setup-screen': 'Screens',
  'sales-setup-payment': 'Payment Types',
  'sales-setup-coupons': 'Coupons and Gift Certificates',
  'sales-setup-discounts': 'Discounts',
  'sales-setup-pricemodes': 'Price Modes',
  'sales-setup-workstations': 'Workstations and Printers',
  'sales-moresetup-voidreasons': 'Void Reasons',
  'sales-moresetup-vatexempt': 'VAT Exemptions Reason',
  'sales-moresetup-invoicemsg': 'Message on Invoice',
  'sales-moresetup-zonesetup': 'Zone Setup',
  'sales-moresetup-currencysetup': 'Currency Setup'
};

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
  const { language, dir, t } = useLanguage();
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
      titleEn: 'Oil Pressing & Production',
      titleAr: 'معصرة الزيت والإنتاج',
      icon: <Droplets className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('oil-pressing')
    },
    {
      id: 'sales-dash',
      titleEn: 'Sales Dashboard',
      titleAr: 'لوحة تحكم المبيعات',
      icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-dash')
    },
    {
      id: 'sales-reports',
      titleEn: 'Executive Reports',
      titleAr: 'التقارير التنفيذية',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-reports')
    },
    {
      id: 'cust-tasks',
      titleEn: 'Tasks & Appointments',
      titleAr: 'المهام والمواعيد',
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('cust-tasks')
    },
    {
      id: 'cust-aged',
      titleEn: 'Aged Debtors',
      titleAr: 'أعمار الديون والذمم',
      icon: <Users className="w-6 h-6 text-rose-600" />,
      color: 'text-rose-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('cust-aged')
    },
    {
      id: 'hr-dir',
      titleEn: 'Employee Directory',
      titleAr: 'سجل الموظفين',
      icon: <UserCheck className="w-6 h-6 text-slate-700" />,
      color: 'text-slate-700',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('hr-dir')
    }
  ];

  const billingTiles: TileItem[] = [
    {
      id: 'sales-pos',
      titleEn: 'POS Cashier Terminal',
      titleAr: 'نقطة البيع الكاشير',
      icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-pos')
    },
    {
      id: 'sales-reports-billing',
      titleEn: 'Sales Cashier Reports',
      titleAr: 'تقارير المبيعات الصندوقية',
      icon: <FileText className="w-6 h-6 text-emerald-700" />,
      color: 'text-emerald-700',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-reports')
    },
    {
      id: 'sales-online',
      titleEn: 'Online Store Orders',
      titleAr: 'الطلبيات الإلكترونية',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-online')
    },
    {
      id: 'sales-eod',
      titleEn: 'End of Day Z-Report',
      titleAr: 'إغلاق الصندوق اليومي',
      icon: <CheckCircle2 className="w-6 h-6 text-slate-700" />,
      color: 'text-slate-700',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('sales-eod')
    },
    {
      id: 'op-quotes',
      titleEn: 'Quotations & Bids',
      titleAr: 'عروض الأسعار والمناقصات',
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-quotes')
    },
    {
      id: 'cust-dir',
      titleEn: 'Customers Directory',
      titleAr: 'دليل حسابات العملاء',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('cust-dir')
    }
  ];

  const movementsTiles: TileItem[] = [
    {
      id: 'product-master',
      titleEn: 'Products & Services Catalog',
      titleAr: 'دليل المنتجات والخدمات',
      icon: <Layers className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setIsProductModalOpen(true)
    },
    {
      id: 'inventory-stock',
      titleEn: 'Stock Inventory & Tanks',
      titleAr: 'جرد المواد والخزانات',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('inventory')
    },
    {
      id: 'stock-transfers',
      titleEn: 'Stock Transfers',
      titleAr: 'تحويلات المخزون',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-transfer')
    },
    {
      id: 'delivery-goods',
      titleEn: 'Delivery of Goods',
      titleAr: 'تسليم البضائع',
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('delivery-goods')
    },
    {
      id: 'lost-goods',
      titleEn: 'Lost & Damaged Goods',
      titleAr: 'البضائع المفقودة والتالفة',
      icon: <Package className="w-6 h-6 text-rose-600" />,
      color: 'text-rose-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-lostgoods')
    },
    {
      id: 'bom-assembly',
      titleEn: 'BOM Assembly',
      titleAr: 'تجميع المنتجات BOM',
      icon: <Layers className="w-6 h-6 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-bom')
    }
  ];

  const procurementsTiles: TileItem[] = [
    {
      id: 'suppliers-directory',
      titleEn: 'Suppliers Directory',
      titleAr: 'دليل الموردين والمزارعين',
      icon: <Warehouse className="w-6 h-6 text-slate-700" />,
      color: 'text-slate-700',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-setup-suppliers')
    },
    {
      id: 'purchase-orders',
      titleEn: 'Purchase Orders',
      titleAr: 'أوامر الشراء',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-po')
    },
    {
      id: 'purchases-ledger',
      titleEn: 'Purchases Ledger',
      titleAr: 'فواتير المشتريات',
      icon: <Receipt className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-purchases')
    },
    {
      id: 'reorder-guide',
      titleEn: 'Reorder Guide',
      titleAr: 'دليل إعادة الطلب',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('op-reorder')
    },
    {
      id: 'accounts-payable',
      titleEn: 'Accounts Payable (AP)',
      titleAr: 'ذمم الموردين الدائنة',
      icon: <DollarSign className="w-6 h-6 text-indigo-600" />,
      color: 'text-indigo-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('acc-ap')
    },
    {
      id: 'bank-reconciliation',
      titleEn: 'Bank Reconciliation',
      titleAr: 'مطابقة الحسابات البنكية',
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
      color: 'text-sky-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      action: () => setActiveScreen('acc-rec')
    }
  ];

  return (
    <div dir={dir} className="flex flex-col min-h-screen w-full bg-white text-gray-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. TOP MAIN DARK HEADER (SPANS 100% VIEWPORT WIDTH AT THE TOP, h-16) */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER FLEX CONTAINER DIRECTLY UNDERNEATH TOP DARK HEADER WITH 3CM GAP (PHASE 64) */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-white mt-8">
        
        {/* LEFT SIDE: PERSISTENT SIDEBAR - Touches bottom of top dark header & spans full remaining height */}
        <Sidebar activeScreen={activeScreen} onSelectScreen={(screen) => setActiveScreen(screen)} />

        {/* RIGHT SIDE: MAIN CONTENT COLUMN (flex-1 flex flex-col min-w-0) */}
        <div suppressHydrationWarning className="flex-1 flex flex-col min-w-0 bg-white">
          
          {/* SUB-HEADER / RECENTLY VISITED TOOLBAR - CONSTRAINED WITHIN RIGHT CONTENT COLUMN NEXT TO SIDEBAR */}
          <VanguardSubHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

          {/* MAIN DASHBOARD CONTENT AREA / TILES GRID */}
          <div className="p-3 md:p-6 space-y-5 flex-1 overflow-y-auto">

      {/* 3. DYNAMIC SCREEN ROUTER */}
      {/* 3. DYNAMIC SCREEN ROUTER */}
      {
        activeScreen === 'oil-pressing' ? (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveScreen('grid-dash')}
                  title="Return to Grid Dashboard"
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-600" /> مركز الاستلام والإنتاج والمعاصر -- {tenantName || "Vanguard ERP System"}
                </h2>
              </div>
            </div>
            <ReceiveAndProductionMaster />
          </div>
        ) : (activeScreen === 'delivery-goods' || activeScreen === 'supersonic-fleet') ? (
          <SuperSonicFleetManager onBack={() => setActiveScreen('grid-dash')} />
        ) : (activeScreen === 'sales-pos' || activeScreen === 'sales-dash' || activeScreen === 'sales') ? (
          /* FULL SALES CONTROL & POS TERMINAL MODULE */
          <div className="space-y-6">
            {/* CLEAN MODULE HEADER */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveScreen('grid-dash')}
                  title="Return to Grid Dashboard"
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shadow-2xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    نقطة البيع وإدارة المبيعات (POS & Sales Control)
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Live POS
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => typeof window !== 'undefined' && (window as any).openReportModal?.('sales_summary', 'تقرير المبيعات الصندوقي')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> تقرير المبيعات الصندوقي
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
        ) : activeScreen === 'sales-dash' || activeScreen === 'sc-dashboard' ? (
          <SalesDashboard onSelectScreen={(screen) => setActiveScreen(screen)} />
        ) : (activeScreen === 'sales-reports' || activeScreen === 'reports') ? (
          <ReportsMasterDetail onBack={() => setActiveScreen('grid-dash')} />
        ) : activeScreen !== 'grid-dash' ? (
          <div className="w-full font-sans">
            <GenericDataTable
              title={
                SALES_CONTROL_TITLES[activeScreen] ||
                getSectionMetadata(activeScreen).titleEn ||
                activeScreen
              }
              description={`View, create, and manage records for ${
                SALES_CONTROL_TITLES[activeScreen] ||
                getSectionMetadata(activeScreen).titleEn
              }.`}
              onBack={() => setActiveScreen('grid-dash')}
            />
          </div>
        ) : (
          /* MAIN VANGUARD ERP CLEAN SQUARE TILE GRID DASHBOARD */
          <div className="max-w-7xl mx-auto px-4 md:px-6 w-full space-y-6">

            {/* 1. OVERVIEW SECTION */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3 mt-2 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Overview</span>
                <span className="text-[10px] text-gray-400 font-medium">6 Modules</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {overviewTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border-2 border-[#EFE9D9] shadow-sm rounded-xl hover:shadow-md hover:border-amber-500/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center space-y-2.5 min-h-[110px] aspect-square"
                  >
                    <div className="shrink-0">{tile.icon}</div>
                    <span className="text-sm font-medium text-gray-700 leading-tight">
                      {language === 'ar' ? tile.titleAr : tile.titleEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. BILLING SECTION */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3 mt-6 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Billing</span>
                <span className="text-[10px] text-gray-400 font-medium">6 Modules</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {billingTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border-2 border-[#EFE9D9] shadow-sm rounded-xl hover:shadow-md hover:border-amber-500/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center space-y-2.5 min-h-[110px] aspect-square"
                  >
                    <div className="shrink-0">{tile.icon}</div>
                    <span className="text-sm font-medium text-gray-700 leading-tight">
                      {language === 'ar' ? tile.titleAr : tile.titleEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MOVEMENTS SECTION */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3 mt-6 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Movements</span>
                <span className="text-[10px] text-gray-400 font-medium">6 Modules</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movementsTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border-2 border-[#EFE9D9] shadow-sm rounded-xl hover:shadow-md hover:border-amber-500/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center space-y-2.5 min-h-[110px] aspect-square"
                  >
                    <div className="shrink-0">{tile.icon}</div>
                    <span className="text-sm font-medium text-gray-700 leading-tight">
                      {language === 'ar' ? tile.titleAr : tile.titleEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PROCUREMENTS SECTION */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3 mt-6 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Procurements</span>
                <span className="text-[10px] text-gray-400 font-medium">6 Modules</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {procurementsTiles.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={tile.action}
                    className="bg-white border-2 border-[#EFE9D9] shadow-sm rounded-xl hover:shadow-md hover:border-amber-500/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center space-y-2.5 min-h-[110px] aspect-square"
                  >
                    <div className="shrink-0">{tile.icon}</div>
                    <span className="text-sm font-medium text-gray-700 leading-tight">
                      {language === 'ar' ? tile.titleAr : tile.titleEn}
                    </span>
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
      <footer className="w-full bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-600 font-bold shadow-2xs mt-8 rounded-2xl">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <a href="/support" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors">Support</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-amber-600 transition-colors">Terms of Service</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-700">© 2026 Powered by Vanguard ERP System</span>
        </div>
      </footer>
        </div>
      </div>
    </div>
  </div>
  );
}