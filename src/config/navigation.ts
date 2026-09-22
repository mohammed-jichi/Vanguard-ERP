// src/config/navigation.ts
import {
  LayoutDashboard,
  FileBarChart,
  ShoppingBag,
  Clock,
  Settings,
  Monitor,
  CreditCard,
  Gift,
  Tag,
  DollarSign,
  Printer,
  Ban,
  FileX,
  MessageSquare,
  MapPin,
  Coins,
  Receipt,
  FileText,
  Truck,
  ShoppingCart,
  ClipboardList,
  RotateCcw,
  ArrowLeftRight,
  PackageX,
  Layers,
  SlidersHorizontal,
  GitPullRequest,
  CheckSquare,
  PackageCheck,
  PackagePlus,
  AlertOctagon,
  Calendar,
  Building,
  Wrench,
  Bookmark,
  Zap,
  Boxes,
  FolderTree,
  Network,
  ListFilter,
  Ruler,
  Warehouse,
  Users,
  Building2,
  Maximize2,
  Palette,
  BadgePercent,
  Banknote,
  Send,
  Info,
  BookOpen,
  Landmark,
  FileSpreadsheet,
  Split,
  CalendarDays,
  UserCheck,
  Briefcase,
  ShieldCheck,
  CalendarRange,
  FileClock,
  History,
  Wallet,
  CoinsIcon,
  HelpCircle,
  Share2,
  Navigation,
  Scale
} from 'lucide-react';

export interface NavSubItem {
  title: string;
  href?: string;
  path?: string;
  icon?: any;
  items?: NavSubItem[];
}

export interface NavItem {
  title: string;
  icon: any;
  href?: string;
  path?: string;
  items?: NavSubItem[];
}

export const navigationConfig: NavItem[] = [
  // ==========================================
  // 1. SALES CONTROL
  // ==========================================
  {
    title: 'Sales Control',
    icon: ShoppingBag,
    items: [
      { title: 'Dashboard', href: '/sales-control/dashboard', icon: LayoutDashboard },
      { title: 'Reports', href: '/sales-control/reports', icon: FileBarChart },
      { title: 'Online Orders', href: '/sales-control/online-orders', icon: ShoppingCart },
      { title: 'End of Day', href: '/sales-control/end-of-day', icon: Clock },
      {
        title: 'Setup',
        href: '/sales-control/setup',
        icon: Settings,
        items: [
          { title: 'Screens', href: '/sales-control/setup/screens', icon: Monitor },
          { title: 'Payment Types', href: '/sales-control/setup/payment-types', icon: CreditCard },
          { title: 'Coupons & Gift Certificates', href: '/sales-control/setup/coupons', icon: Gift },
          { title: 'Discounts', href: '/sales-control/setup/discounts', icon: Tag },
          { title: 'Price Modes', href: '/sales-control/setup/price-modes', icon: DollarSign },
          { title: 'Workstations & Printers', href: '/sales-control/setup/workstations', icon: Printer },
          {
            title: 'More Setup',
            href: '/sales-control/setup/more',
            icon: SlidersHorizontal,
            items: [
              { title: 'Void Reasons', href: '/sales-control/setup/more/void-reasons', icon: Ban },
              { title: 'Vat Exemption Reason', href: '/sales-control/setup/more/vat-exemption', icon: FileX },
              { title: 'Message On Invoice', href: '/sales-control/setup/more/invoice-message', icon: MessageSquare },
              { title: 'Zone Setup', href: '/sales-control/setup/more/zones', icon: MapPin },
              { title: 'Currency Setup', href: '/sales-control/setup/more/currency', icon: Coins }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. OPERATIONS CENTER
  // ==========================================
  {
    title: 'Operations Center',
    icon: Boxes,
    items: [
      { title: 'Dashboard', href: '/operations-center/dashboard', icon: LayoutDashboard },
      { title: 'Reports', href: '/operations-center/reports', icon: FileBarChart },
      {
        title: 'Actions',
        href: '/operations-center/actions',
        icon: Zap,
        items: [
          { title: 'Sales', href: '/operations-center/actions/sales', icon: Receipt },
          { title: 'Quotations', href: '/operations-center/actions/quotations', icon: FileText },
          { title: 'Delivery of Goods', href: '/operations-center/actions/delivery', icon: Truck },
          { title: 'Purchases', href: '/operations-center/actions/purchases', icon: ShoppingCart },
          { title: 'Purchase Orders', href: '/operations-center/actions/purchase-orders', icon: ClipboardList },
          { title: 'Reorder Guide', href: '/operations-center/actions/reorder-guide', icon: RotateCcw },
          { title: 'Transfers', href: '/operations-center/actions/transfers', icon: ArrowLeftRight },
          { title: 'Lost Goods', href: '/operations-center/actions/lost-goods', icon: PackageX },
          { title: 'Item Assembly', href: '/operations-center/actions/item-assembly', path: '/operations-center/actions/item-assembly', icon: Layers },
          { title: 'Adjustments', href: '/operations-center/actions/adjustments', path: '/operations-center/actions/adjustments', icon: SlidersHorizontal },
          { title: 'Pressing Mill (المعصرة)', href: '/pressing-mill', path: '/pressing-mill', icon: Scale },
          {
            title: 'Product Request',
            href: '/operations-center/actions/product-request',
            icon: GitPullRequest,
            items: [
              { title: 'Product Request', href: '/operations-center/actions/product-request/new', icon: GitPullRequest },
              { title: 'Manage Product Requests', href: '/operations-center/actions/product-request/manage', icon: CheckSquare },
              { title: 'Product Req. Preparation', href: '/operations-center/actions/product-request/preparation', icon: PackageCheck },
              { title: 'Receiving of goods', href: '/operations-center/actions/product-request/receiving', icon: PackagePlus },
              { title: 'Reports', href: '/operations-center/actions/product-request/reports', icon: FileBarChart },
              { title: 'Request Reject Reasons', href: '/operations-center/actions/product-request/reject-reasons', icon: AlertOctagon }
            ]
          },
          {
            title: 'Events',
            href: '/operations-center/actions/events',
            icon: Calendar,
            items: [
              { title: 'Events', href: '/operations-center/actions/events/list', icon: Calendar },
              { title: 'Event Venues', href: '/operations-center/actions/events/venues', icon: Building },
              { title: 'Event Resources', href: '/operations-center/actions/events/resources', icon: Wrench },
              { title: 'Event Types', href: '/operations-center/actions/events/types', icon: Bookmark }
            ]
          }
        ]
      },
      {
        title: 'Setup',
        href: '/operations-center/setup',
        icon: Settings,
        items: [
          { title: 'Quick Setup', href: '/operations-center/setup/quick-setup', icon: Zap },
          { title: 'Products & Services', href: '/operations-center/setup/products-services', icon: Boxes },
          { title: 'Groups', href: '/operations-center/setup/groups', icon: FolderTree },
          { title: 'Divisions', href: '/operations-center/setup/divisions', icon: Network },
          { title: 'Categories', href: '/operations-center/setup/categories', icon: ListFilter },
          { title: 'Units', href: '/operations-center/setup/units', icon: Ruler },
          { title: 'Locations', href: '/operations-center/setup/locations', icon: Warehouse },
          { title: 'Suppliers', href: '/operations-center/setup/suppliers', icon: Users },
          { title: 'Departments', href: '/operations-center/setup/departments', icon: Building2 },
          {
            title: 'More',
            href: '/operations-center/setup/more',
            icon: SlidersHorizontal,
            items: [
              { title: 'Lost Goods Reason', href: '/operations-center/setup/more/lost-goods-reason', icon: PackageX },
              { title: 'Sizes Groups', href: '/operations-center/setup/more/sizes-groups', icon: FolderTree },
              { title: 'Sizes', href: '/operations-center/setup/more/sizes', icon: Maximize2 },
              { title: 'Colors', href: '/operations-center/setup/more/colors', icon: Palette },
              { title: 'Discounts', href: '/operations-center/setup/more/discounts', icon: BadgePercent },
              { title: 'Payment Types', href: '/operations-center/setup/more/payment-types', icon: CreditCard },
              { title: 'Currency Setup', href: '/operations-center/setup/more/currency-setup', icon: Banknote },
              { title: 'Inventory Brands', href: '/operations-center/setup/more/brands', icon: Bookmark },
              { title: 'Delivery Providers', href: '/operations-center/setup/more/delivery-providers', icon: Truck }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. CUSTOMER MANAGEMENT
  // ==========================================
  {
    title: 'Customer Management',
    icon: Users,
    items: [
      { title: 'Customers', href: '/customer-management/customers', icon: Users },
      { title: 'Customer Receipts', href: '/customer-management/receipts', icon: Receipt },
      { title: 'Customer Aged', href: '/customer-management/aged', icon: Clock },
      { title: 'Customer Insights', href: '/customer-management/insights', icon: LayoutDashboard },
      { title: 'Tasks and Appointments', href: '/customer-management/tasks', icon: Calendar },
      { title: 'Leads & Contacts', href: '/customer-management/leads', icon: Users },
      { title: 'Sales Team Performance', href: '/customer-management/performance', icon: FileBarChart },
      {
        title: 'Settings',
        href: '/customer-management/settings',
        icon: Settings,
        items: [
          { title: 'Customers Groups', href: '/customer-management/settings/groups', icon: FolderTree },
          { title: 'Customers Categories', href: '/customer-management/settings/categories', icon: ListFilter },
          { title: 'Customers Tags', href: '/customer-management/settings/tags', icon: Tag },
          { title: 'Leads Settings', href: '/customer-management/settings/leads', icon: SlidersHorizontal }
        ]
      }
    ]
  },

  // ==========================================
  // 4. FEEDBACK & SURVEYS
  // ==========================================
  {
    title: 'Feedback & Surveys',
    icon: HelpCircle,
    items: [
      { title: 'Dashboard', href: '/feedback/dashboard', icon: LayoutDashboard },
      { title: 'Manage Complaints', href: '/feedback/manage-complaints', icon: CheckSquare },
      { title: 'Add Complaints', href: '/feedback/add-complaints', icon: AlertOctagon },
      { title: 'Manage Surveys', href: '/feedback/manage-surveys', icon: ClipboardList },
      { title: 'Send Survey Emails', href: '/feedback/send-surveys', icon: Send },
      {
        title: 'Setup',
        href: '/feedback/setup',
        icon: Settings,
        items: [
          { title: 'Complaint Sources', href: '/feedback/setup/sources', icon: Bookmark },
          { title: 'Complaint Categories', href: '/feedback/setup/categories', icon: ListFilter },
          { title: 'Complaint Action Types', href: '/feedback/setup/actions', icon: Zap },
          { title: 'Customer care', href: '/feedback/setup/customer-care', icon: Users },
          { title: 'Surveys Setup', href: '/feedback/setup/surveys', icon: SlidersHorizontal }
        ]
      }
    ]
  },

  // ==========================================
  // 5. LOYALTY MANAGEMENT
  // ==========================================
  {
    title: 'Loyalty Management',
    icon: Gift,
    items: [
      { title: 'Dashboard', href: '/loyalty/dashboard', icon: LayoutDashboard },
      { title: 'Reports', href: '/loyalty/reports', icon: FileBarChart },
      { title: 'Members', href: '/loyalty/members', icon: Users },
      { title: 'Loyalty Levels', href: '/loyalty/levels', icon: Layers },
      { title: 'Loyalty Programs', href: '/loyalty/programs', icon: Bookmark },
      { title: 'Send Messages', href: '/loyalty/messages', icon: Send },
      { title: 'Company Info', href: '/loyalty/company-info', icon: Info }
    ]
  },

  // ==========================================
  // 6. ACCOUNTING
  // ==========================================
  {
    title: 'Accounting',
    icon: BookOpen,
    items: [
      { title: 'Dashboard', href: '/accounting/dashboard', icon: LayoutDashboard },
      { title: 'Reports', href: '/accounting/reports', icon: FileBarChart },
      {
        title: 'Actions',
        href: '/accounting/actions',
        icon: Zap,
        items: [
          { title: 'Journal Voucher', href: '/accounting/journal-voucher', icon: FileSpreadsheet },
          { title: 'Purchase', href: '/accounting/purchase', icon: ShoppingCart },
          { title: 'Payments', href: '/accounting/payment', icon: CreditCard },
          { title: 'Receipts', href: '/accounting/receipt', icon: Receipt },
          { title: 'Accounts Receivables', href: '/accounting/receivables', icon: Wallet },
          { title: 'Accounts Payables', href: '/accounting/payables', icon: DollarSign },
          { title: 'Bank Reconciliation', href: '/accounting/bank-reconciliation', icon: Landmark },
          { title: 'VAT Period Closing', href: '/accounting/vat-closing', icon: Clock }
        ]
      },
      {
        title: 'Setup',
        href: '/accounting/setup',
        icon: Settings,
        items: [
          { title: 'Accounts', href: '/accounting/setup/accounts', icon: BookOpen },
          {
            title: 'Account Auxiliaries',
            href: '/accounting/setup/auxiliaries',
            icon: FolderTree,
            items: [
              { title: 'Accounts Classes', href: '/accounting/setup/auxiliaries/classes', icon: Layers },
              { title: 'Account Header 1', href: '/accounting/setup/auxiliaries/header-1', icon: ListFilter },
              { title: 'Account Header 2', href: '/accounting/setup/auxiliaries/header-2', icon: ListFilter },
              { title: 'Account Header 3', href: '/accounting/setup/auxiliaries/header-3', icon: ListFilter },
              { title: 'Account Group', href: '/accounting/setup/auxiliaries/group', icon: FolderTree }
            ]
          },
          { title: 'Jv Description', href: '/accounting/setup/jv-description', icon: FileText },
          { title: 'Jv Types', href: '/accounting/setup/jv-types', icon: Bookmark },
          { title: 'Currency', href: '/accounting/setup/currency', icon: Coins },
          { title: 'Currency Rates', href: '/accounting/setup/rates', icon: Banknote },
          {
            title: 'Departments',
            href: '/accounting/setup/departments',
            icon: Building2,
            items: [
              { title: 'Department Groups', href: '/accounting/setup/departments/groups', icon: FolderTree },
              { title: 'Department', href: '/accounting/setup/departments/list', icon: Building2 },
              { title: 'Cash Flow Report Setup', href: '/accounting/setup/departments/cash-flow', icon: SlidersHorizontal },
              { title: 'Sub Department', href: '/accounting/setup/departments/sub', icon: Split }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 7. HUMAN RESOURCES
  // ==========================================
  {
    title: 'Human Resources',
    icon: Users,
    items: [
      { title: 'Schedule Overview', href: '/hr/schedule-overview', icon: CalendarDays },
      { title: 'Personnel', href: '/hr/personnel', icon: UserCheck },
      { title: 'Schedules', href: '/hr/schedules', icon: Calendar },
      {
        title: 'Organization Setup',
        href: '/hr/organization-setup',
        icon: Settings,
        items: [
          { title: 'Internal Departments', href: '/hr/organization-setup/departments', icon: Building2 },
          { title: 'Designations', href: '/hr/organization-setup/designations', icon: Briefcase },
          { title: 'POS Employee Roles', href: '/hr/organization-setup/pos-roles', icon: ShieldCheck }
        ]
      },
      {
        title: 'Time & Attendance',
        href: '/hr/time-attendance',
        icon: Clock,
        items: [
          { title: 'Time Off Requests', href: '/hr/time-attendance/time-off', icon: FileClock },
          { title: 'Schedule Templates', href: '/hr/time-attendance/templates', icon: CalendarRange },
          { title: 'Time Off Reasons', href: '/hr/time-attendance/reasons', icon: Bookmark },
          { title: 'Attendance Summary', href: '/hr/time-attendance/summary', icon: FileBarChart },
          { title: 'Attendance Log', href: '/hr/time-attendance/log', icon: History }
        ]
      },
      {
        title: 'Payroll',
        href: '/hr/payroll',
        icon: Wallet,
        items: [
          { title: 'Payroll Dashboard', href: '/hr/payroll/dashboard', icon: LayoutDashboard },
          { title: 'Salary Processing', href: '/hr/payroll/salary-processing', icon: DollarSign },
          { title: 'Payment Settings', href: '/hr/payroll/payment-settings', icon: Settings },
          { title: 'Earnings & Deductions', href: '/hr/payroll/earnings-deductions', icon: CoinsIcon }
        ]
      }
    ]
  },

  // ==========================================
  // 8. SUPERSONIC FLEET MANAGEMENT (RETAINED)
  // ==========================================
  {
    title: 'Supersonic Fleet Management',
    icon: Navigation,
    items: [
      { title: 'Fleet Dashboard', href: '/supersonic/dashboard', icon: LayoutDashboard },
      { title: 'V-Driver Mobile PWA', href: '/v-driver', icon: Truck },
      { title: 'Fleet Reports', href: '/supersonic/reports', icon: FileBarChart },
      { title: 'Active Dispatches', href: '/supersonic/dispatches', icon: Truck },
      { title: 'Driver Management', href: '/supersonic/drivers', icon: UserCheck },
      { title: 'Route Optimization', href: '/supersonic/routes', icon: MapPin },
      { title: 'Vehicle Maintenance', href: '/supersonic/maintenance', icon: Wrench },
      { title: 'Driver Settlements', href: '/supersonic/settlements', icon: Wallet }
    ]
  },

  // ==========================================
  // 9. SOCIAL CRM & SUPPORT (RETAINED)
  // ==========================================
  {
    title: 'Social CRM & Support',
    icon: Share2,
    items: [
      { title: 'Social CRM Dashboard', href: '/social-crm/dashboard', icon: LayoutDashboard },
      { title: 'Sales Rep Mobile PWA', href: '/sales-rep', icon: Users },
      { title: 'Reports Hub', href: '/social-crm/reports', icon: FileBarChart },
      { title: 'Omnichannel Inbox', href: '/social-crm/inbox', icon: MessageSquare },
      { title: 'Campaign Analytics', href: '/social-crm/campaigns', icon: FileBarChart },
      { title: 'Lead Pipeline', href: '/social-crm/leads', icon: Users },
      { title: 'Automation Bots', href: '/social-crm/automations', icon: Zap }
    ]
  },

  // ==========================================
  // 10. PRESSING MILL (STANDALONE MODULE)
  // ==========================================
  {
    title: '10. Pressing Mill',
    icon: Scale,
    href: '/pressing-mill/dashboard',
    path: '/pressing-mill',
    items: [
      { title: 'Dashboard', href: '/pressing-mill/dashboard', path: '/pressing-mill/dashboard', icon: LayoutDashboard },
      { title: 'Season Management', href: '/pressing-mill/seasons', path: '/pressing-mill/seasons', icon: Calendar },
      { title: 'Weighbridge & Intake', href: '/pressing-mill/intake', path: '/pressing-mill/intake', icon: Scale },
      { title: 'Pressing Lines & Batches', href: '/pressing-mill/batches', path: '/pressing-mill/batches', icon: Layers },
      { title: 'Tanks Matrix (1-50)', href: '/pressing-mill/tanks', path: '/pressing-mill/tanks', icon: Landmark },
      { title: 'Settlements & Milling Fees', href: '/pressing-mill/settlements', path: '/pressing-mill/settlements', icon: DollarSign },
      { title: 'Oil Handover & Dispatch', href: '/pressing-mill/dispatch', path: '/pressing-mill/dispatch', icon: Truck },
      { title: 'Direct Counter Sales & POS', href: '/pressing-mill/pos', path: '/pressing-mill/pos', icon: ShoppingCart },
      { title: 'Directory & Ledgers', href: '/pressing-mill/directory', path: '/pressing-mill/directory', icon: BookOpen },
      { title: 'Mill Settings & Line Config', href: '/pressing-mill/setup', path: '/pressing-mill/setup', icon: Settings }
    ]
  }
];
