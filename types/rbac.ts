// ==============================================================================
// VANGUARD ERP: ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) TYPES
// 12-Module Granular Permissions, Action Overrides, and Restricted Reports Matrix
// ==============================================================================

export type StandardEmployeeClassification =
  | 'CASHIER'
  | 'Delivery'
  | 'Finance department manager'
  | 'MANAGER'
  | 'sales'
  | 'ACCOUNTANT'
  | 'CHIEF_ACCOUNTANT'
  | 'MILL_OPERATOR'
  | 'QUALITY_CONTROLLER'
  | 'SUPER_ADMIN'
  | 'WAREHOUSE_SUPERVISOR'
  | 'HR_OFFICER'
  | 'OIL_OPERATOR';

export const STANDARD_EMPLOYEE_CLASSIFICATIONS: { value: StandardEmployeeClassification; label: string; labelAr: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Administrator (المدير العام للنظام)', labelAr: 'المدير العام للنظام' },
  { value: 'MANAGER', label: 'General / Operations Manager (مدير العمليات)', labelAr: 'مدير العمليات' },
  { value: 'OIL_OPERATOR', label: 'Field Oil Operations Specialist (مشغل عمليات الزيت والتعبئة)', labelAr: 'مشغل عمليات الزيت الميداني' },
  { value: 'Finance department manager', label: 'Finance Department Manager (مدير الإدارة المالية)', labelAr: 'مدير الإدارة المالية' },
  { value: 'CHIEF_ACCOUNTANT', label: 'Chief Accountant (رئيس الحسابات)', labelAr: 'رئيس الحسابات' },
  { value: 'ACCOUNTANT', label: 'Accountant (محاسب مالي)', labelAr: 'محاسب مالي' },
  { value: 'CASHIER', label: 'POS Terminal Cashier (أمين الصندوق / كاشير)', labelAr: 'أمين الصندوق / كاشير' },
  { value: 'sales', label: 'Sales Representative (مندوب مبيعات)', labelAr: 'مندوب مبيعات' },
  { value: 'Delivery', label: 'Fleet Delivery Driver (سائق توزيع وتوصيل)', labelAr: 'سائق توزيع وتوصيل' },
  { value: 'MILL_OPERATOR', label: 'Pressing Mill Technician (فني معصرة الزيتون)', labelAr: 'فني معصرة الزيتون' },
  { value: 'QUALITY_CONTROLLER', label: 'Quality Assurance Specialist (أخصائي مراقبة الجودة)', labelAr: 'أخصائي مراقبة الجودة' },
  { value: 'WAREHOUSE_SUPERVISOR', label: 'Warehouse & Inventory Supervisor (أمين المستودع)', labelAr: 'أمين المستودع' },
  { value: 'HR_OFFICER', label: 'Human Resources Officer (مسؤول الموارد البشرية)', labelAr: 'مسؤول الموارد البشرية' },
];

export interface NodePermissionValues {
  view?: boolean;
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
}

export interface ActionModalOption {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  defaultVal: boolean;
}

export interface RestrictedReportOption {
  id: string;
  name: string;
  nameAr: string;
  category: string;
}

export interface PermissionNode {
  id: string;
  name: string;
  nameAr: string;
  groupHeader?: string;
  hasActions?: boolean; // When true, renders Add, Edit, Delete checkboxes (hidden if role is read_only)
  actionModalKey?: string; // When set, renders Sliders icon for granular inline actions
  reportsModalKey?: string; // When set, renders Chart icon for restricted reports list
  hasBrandAccessModal?: boolean; // When true, renders Brand Access selector (Product Request)
  children?: PermissionNode[];
}

export interface ModulePermissionDefinition {
  moduleNumber: number;
  moduleCode: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  headerActionModalKey?: string; // e.g. 'Disable Accounting Year Selection'
  nodes: PermissionNode[];
}

export interface RoleBrandAccessRecord {
  roleId: string;
  brandId: string;
  brandName: string;
  canCreateRequest: boolean;
  canApproveRequest: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  employee_role: StandardEmployeeClassification | string;
  is_read_only: boolean;
  permissions: Record<string, NodePermissionValues>;
  action_overrides: Record<string, Record<string, boolean>>; // modalKey -> { actionId: boolean }
  restricted_reports: Record<string, string[]>; // modalKey -> allowedReportIds[]
  brand_access: string[]; // authorized brand IDs
  assignedCount: number;
  badgeColor: string;
  created_at?: string;
  updated_at?: string;
}
