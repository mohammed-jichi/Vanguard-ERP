/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async rewrites() {
    return [
      // ==========================================
      // 0. WORKSPACE & ERP MULTI-TENANT CORE ALIASES
      // ==========================================
      { source: '/index.html', destination: '/backoffice/dashboard' },
      { source: '/erp', destination: '/backoffice/dashboard' },
      { source: '/dashboard', destination: '/backoffice/dashboard' },
      { source: '/workspace', destination: '/backoffice/dashboard' },
      { source: '/workspace/:workspaceId', destination: '/backoffice/dashboard?tenantId=:workspaceId' },
      { source: '/workspace/:workspaceId/dashboard', destination: '/backoffice/dashboard?tenantId=:workspaceId' },
      { source: '/workspace/:workspaceId/customers', destination: '/backoffice/customers?tenantId=:workspaceId' },
      { source: '/workspace/:workspaceId/feedback', destination: '/backoffice/feedback?tenantId=:workspaceId' },
      { source: '/workspace/:workspaceId/loyalty', destination: '/backoffice/loyalty?tenantId=:workspaceId' },
      { source: '/:tenantId/dashboard', destination: '/backoffice/dashboard?tenantId=:tenantId' },
      { source: '/:tenantId/customers', destination: '/backoffice/customers?tenantId=:tenantId' },
      { source: '/:tenantId/feedback', destination: '/backoffice/feedback?tenantId=:tenantId' },
      { source: '/:tenantId/loyalty', destination: '/backoffice/loyalty?tenantId=:tenantId' },

      // ==========================================
      // 1. SALES CONTROL
      // ==========================================
      { source: '/sales-control/dashboard', destination: '/backoffice/dashboard' },
      { source: '/sales-control/reports', destination: '/backoffice/reportview' },
      { source: '/sales-control/online-orders', destination: '/backoffice/online-orders' },
      { source: '/sales-control/end-of-day', destination: '/backoffice/end-of-day' },
      { source: '/sales-control/setup', destination: '/backoffice/screens' },
      { source: '/sales-control/setup/screens', destination: '/backoffice/screens' },
      { source: '/sales-control/setup/payment-types', destination: '/backoffice/payment-types' },
      { source: '/sales-control/setup/coupons', destination: '/backoffice/coupons' },
      { source: '/sales-control/setup/discounts', destination: '/backoffice/discounts' },
      { source: '/sales-control/setup/price-modes', destination: '/backoffice/price-modes' },
      { source: '/sales-control/setup/workstations', destination: '/backoffice/workstations-printers' },
      { source: '/sales-control/setup/more', destination: '/backoffice/void-reasons' },
      { source: '/sales-control/setup/more/void-reasons', destination: '/backoffice/void-reasons' },
      { source: '/sales-control/setup/more/vat-exemption', destination: '/backoffice/vat-exemptions' },
      { source: '/sales-control/setup/more/invoice-message', destination: '/backoffice/invoice-messages' },
      { source: '/sales-control/setup/more/zones', destination: '/backoffice/zone-setup' },
      { source: '/sales-control/setup/more/currency', destination: '/backoffice/currency-setup' },

      // ==========================================
      // 2. OPERATIONS CENTER
      // ==========================================
      { source: '/operations-center/dashboard', destination: '/backoffice/operations?section=dashboard' },
      { source: '/operations-center/reports', destination: '/backoffice/operations?section=reports' },
      { source: '/operations-center/actions', destination: '/backoffice/operations?section=sales' },
      { source: '/operations-center/actions/sales', destination: '/backoffice/operations?section=sales' },
      { source: '/operations-center/actions/quotations', destination: '/backoffice/operations?section=quotations' },
      { source: '/operations-center/actions/delivery', destination: '/backoffice/operations?section=delivery_goods' },
      { source: '/operations-center/actions/purchases', destination: '/backoffice/operations?section=purchases' },
      { source: '/operations-center/actions/purchase-orders', destination: '/backoffice/operations?section=purchase_orders' },
      { source: '/operations-center/actions/reorder-guide', destination: '/backoffice/operations?section=reorder_guide' },
      { source: '/operations-center/actions/transfers', destination: '/backoffice/operations?section=transfers' },
      { source: '/operations-center/actions/lost-goods', destination: '/backoffice/operations?section=lost_goods' },
      { source: '/operations-center/actions/item-assembly', destination: '/backoffice/operations?section=item_assembly' },
      { source: '/operations-center/actions/adjustments', destination: '/backoffice/operations?section=adjustments' },
      { source: '/operations-center/actions/product-request', destination: '/backoffice/operations?section=product_request' },
      { source: '/operations-center/actions/product-request/new', destination: '/backoffice/operations?section=product_request' },
      { source: '/operations-center/actions/product-request/manage', destination: '/backoffice/operations?section=manage_product_requests' },
      { source: '/operations-center/actions/product-request/preparation', destination: '/backoffice/operations?section=product_req_prep' },
      { source: '/operations-center/actions/product-request/receiving', destination: '/backoffice/operations?section=receiving_goods' },
      { source: '/operations-center/actions/product-request/reports', destination: '/backoffice/operations?section=product_req_reports' },
      { source: '/operations-center/actions/product-request/reject-reasons', destination: '/backoffice/operations?section=request_reject_reasons' },
      { source: '/operations-center/actions/events', destination: '/backoffice/operations?section=events' },
      { source: '/operations-center/actions/events/list', destination: '/backoffice/operations?section=events' },
      { source: '/operations-center/actions/events/venues', destination: '/backoffice/operations?section=event_venues' },
      { source: '/operations-center/actions/events/resources', destination: '/backoffice/operations?section=event_resources' },
      { source: '/operations-center/actions/events/types', destination: '/backoffice/operations?section=event_types' },
      { source: '/operations-center/setup', destination: '/backoffice/operations?section=quick_setup' },
      { source: '/operations-center/setup/quick-setup', destination: '/backoffice/operations?section=quick_setup' },
      { source: '/operations-center/setup/products-services', destination: '/backoffice/operations?section=products_services' },
      { source: '/operations-center/setup/groups', destination: '/backoffice/operations?section=groups' },
      { source: '/operations-center/setup/divisions', destination: '/backoffice/operations?section=divisions' },
      { source: '/operations-center/setup/categories', destination: '/backoffice/operations?section=categories' },
      { source: '/operations-center/setup/units', destination: '/backoffice/operations?section=units' },
      { source: '/operations-center/setup/locations', destination: '/backoffice/operations?section=locations' },
      { source: '/operations-center/setup/suppliers', destination: '/backoffice/operations?section=suppliers' },
      { source: '/operations-center/setup/departments', destination: '/backoffice/operations?section=departments' },
      { source: '/operations-center/setup/more', destination: '/backoffice/operations?section=lost_goods_reason' },
      { source: '/operations-center/setup/more/lost-goods-reason', destination: '/backoffice/operations?section=lost_goods_reason' },
      { source: '/operations-center/setup/more/sizes-groups', destination: '/backoffice/operations?section=sizes_groups' },
      { source: '/operations-center/setup/more/sizes', destination: '/backoffice/operations?section=sizes' },
      { source: '/operations-center/setup/more/colors', destination: '/backoffice/operations?section=colors' },
      { source: '/operations-center/setup/more/discounts', destination: '/backoffice/operations?section=discounts' },
      { source: '/operations-center/setup/more/payment-types', destination: '/backoffice/operations?section=payment_types' },
      { source: '/operations-center/setup/more/currency-setup', destination: '/backoffice/operations?section=currency_setup' },
      { source: '/operations-center/setup/more/brands', destination: '/backoffice/operations?section=inventory_brands' },
      { source: '/operations-center/setup/more/delivery-providers', destination: '/backoffice/operations?section=delivery_providers' },

      // ==========================================
      // 3. CUSTOMER MANAGEMENT
      // ==========================================
      { source: '/customer-management/customers', destination: '/backoffice/customers' },
      { source: '/customer-management/receipts', destination: '/backoffice/customers?section=receipts' },
      { source: '/customer-management/aged', destination: '/backoffice/customers?section=aged' },
      { source: '/customer-management/insights', destination: '/customer-insights' },
      { source: '/customer-management/tasks', destination: '/schedule' },
      { source: '/customer-management/leads', destination: '/backoffice/customers?section=leads' },
      { source: '/customer-management/performance', destination: '/sales-manager-dashboard' },
      { source: '/customer-management/settings', destination: '/backoffice/customers?section=groups' },
      { source: '/customer-management/settings/groups', destination: '/backoffice/customers?section=groups' },
      { source: '/customer-management/settings/categories', destination: '/backoffice/customers?section=categories' },
      { source: '/customer-management/settings/tags', destination: '/backoffice/customers?section=tags' },
      { source: '/customer-management/settings/leads', destination: '/backoffice/customers?section=leads_settings' },

      // ==========================================
      // 4. FEEDBACK & SURVEYS
      // ==========================================
      { source: '/feedback', destination: '/backoffice/feedback?section=dashboard' },
      { source: '/feedback/dashboard', destination: '/backoffice/feedback?section=dashboard' },
      { source: '/feedback/manage-complaints', destination: '/backoffice/feedback?section=manage_complaints' },
      { source: '/feedback/add-complaints', destination: '/backoffice/feedback?section=add_complaints' },
      { source: '/feedback/manage-surveys', destination: '/backoffice/feedback?section=manage_surveys' },
      { source: '/feedback/send-surveys', destination: '/backoffice/feedback?section=send_survey_emails' },
      { source: '/feedback/setup', destination: '/backoffice/feedback?section=complaint_sources' },
      { source: '/feedback/setup/sources', destination: '/backoffice/feedback?section=complaint_sources' },
      { source: '/feedback/setup/categories', destination: '/backoffice/feedback?section=complaint_categories' },
      { source: '/feedback/setup/actions', destination: '/backoffice/feedback?section=complaint_action_types' },
      { source: '/feedback/setup/customer-care', destination: '/backoffice/feedback?section=customer_care' },
      { source: '/feedback/setup/surveys', destination: '/backoffice/feedback?section=surveys_setup' },

      // ==========================================
      // 5. LOYALTY MANAGEMENT
      // ==========================================
      { source: '/loyalty', destination: '/backoffice/loyalty?section=dashboard' },
      { source: '/loyalty/dashboard', destination: '/backoffice/loyalty?section=dashboard' },
      { source: '/loyalty/reports', destination: '/backoffice/loyalty?section=reports' },
      { source: '/loyalty/members', destination: '/backoffice/loyalty?section=members' },
      { source: '/loyalty/levels', destination: '/backoffice/loyalty?section=loyalty_levels' },
      { source: '/loyalty/programs', destination: '/backoffice/loyalty?section=loyalty_programs' },
      { source: '/loyalty/messages', destination: '/backoffice/loyalty?section=send_messages' },
      { source: '/loyalty/company-info', destination: '/backoffice/loyalty?section=company_info' },

      // ==========================================
      // 6. ACCOUNTING
      // ==========================================
      { source: '/accounting', destination: '/backoffice/accounting?section=dashboard' },
      { source: '/accounting/dashboard', destination: '/backoffice/accounting?section=dashboard' },
      { source: '/accounting/reports', destination: '/backoffice/accounting?section=reports' },
      { source: '/accounting/actions', destination: '/backoffice/accounting?section=jv' },
      { source: '/accounting/actions/journal-voucher', destination: '/backoffice/accounting?section=jv' },
      { source: '/accounting/actions/purchase', destination: '/backoffice/accounting?section=purchase' },
      { source: '/accounting/actions/payments', destination: '/backoffice/accounting?section=payments' },
      { source: '/accounting/actions/receipts', destination: '/backoffice/accounting?section=receipts' },
      { source: '/accounting/actions/accounts-receivables', destination: '/backoffice/accounting?section=ar' },
      { source: '/accounting/actions/accounts-payables', destination: '/backoffice/accounting?section=ap' },
      { source: '/accounting/actions/bank-reconciliation', destination: '/backoffice/accounting?section=bank_recon' },
      { source: '/accounting/actions/vat-period-closing', destination: '/backoffice/accounting?section=vat_closing' },
      { source: '/accounting/setup', destination: '/backoffice/accounting?section=accounts' },
      { source: '/accounting/setup/accounts', destination: '/backoffice/accounting?section=accounts' },
      { source: '/accounting/setup/auxiliaries', destination: '/backoffice/accounting?section=aux_classes' },
      { source: '/accounting/setup/auxiliaries/classes', destination: '/backoffice/accounting?section=aux_classes' },
      { source: '/accounting/setup/auxiliaries/header-1', destination: '/backoffice/accounting?section=aux_header1' },
      { source: '/accounting/setup/auxiliaries/header-2', destination: '/backoffice/accounting?section=aux_header2' },
      { source: '/accounting/setup/auxiliaries/header-3', destination: '/backoffice/accounting?section=aux_header3' },
      { source: '/accounting/setup/auxiliaries/group', destination: '/backoffice/accounting?section=aux_group' },
      { source: '/accounting/setup/auxiliaries/jv-description', destination: '/backoffice/accounting?section=aux_jv_desc' },
      { source: '/accounting/setup/auxiliaries/jv-types', destination: '/backoffice/accounting?section=aux_jv_types' },
      { source: '/accounting/setup/auxiliaries/currency', destination: '/backoffice/accounting?section=aux_currency' },
      { source: '/accounting/setup/auxiliaries/rates', destination: '/backoffice/accounting?section=aux_currency_rates' },
      { source: '/accounting/setup/auxiliaries/departments', destination: '/backoffice/accounting?section=dept_groups' },
      { source: '/accounting/setup/auxiliaries/departments/groups', destination: '/backoffice/accounting?section=dept_groups' },
      { source: '/accounting/setup/auxiliaries/departments/list', destination: '/backoffice/accounting?section=department' },
      { source: '/accounting/setup/auxiliaries/departments/cash-flow', destination: '/backoffice/accounting?section=cash_flow_setup' },
      { source: '/accounting/setup/auxiliaries/departments/sub', destination: '/backoffice/accounting?section=sub_dept' },

      // ==========================================
      // 7. HUMAN RESOURCES
      // ==========================================
      { source: '/hr', destination: '/backoffice/hr?section=schedule_overview' },
      { source: '/hr/schedule-overview', destination: '/backoffice/hr?section=schedule_overview' },
      { source: '/hr/personnel', destination: '/backoffice/hr?section=personnel' },
      { source: '/hr/schedules', destination: '/backoffice/hr?section=schedules' },
      { source: '/hr/organization-setup', destination: '/backoffice/hr?section=internal_departments' },
      { source: '/hr/organization-setup/departments', destination: '/backoffice/hr?section=internal_departments' },
      { source: '/hr/organization-setup/designations', destination: '/backoffice/hr?section=designations' },
      { source: '/hr/organization-setup/pos-roles', destination: '/backoffice/hr?section=pos_employee_roles' },
      { source: '/hr/time-attendance', destination: '/backoffice/hr?section=time_off_requests' },
      { source: '/hr/time-attendance/time-off', destination: '/backoffice/hr?section=time_off_requests' },
      { source: '/hr/time-attendance/templates', destination: '/backoffice/hr?section=schedule_templates' },
      { source: '/hr/time-attendance/reasons', destination: '/backoffice/hr?section=time_off_reasons' },
      { source: '/hr/time-attendance/summary', destination: '/backoffice/hr?section=attendance_summary' },
      { source: '/hr/time-attendance/log', destination: '/backoffice/hr?section=attendance_log' },
      { source: '/hr/payroll', destination: '/backoffice/hr?section=payroll_dashboard' },
      { source: '/hr/payroll/dashboard', destination: '/backoffice/hr?section=payroll_dashboard' },
      { source: '/hr/payroll/salary-processing', destination: '/backoffice/hr?section=salary_processing' },
      { source: '/hr/payroll/payment-settings', destination: '/backoffice/hr?section=payment_settings' },
      { source: '/hr/payroll/earnings-deductions', destination: '/backoffice/hr?section=earnings_deductions' },

      // ==========================================
      // 8. SUPERSONIC FLEET MANAGEMENT (RETAINED)
      // ==========================================
      { source: '/supersonic/dashboard', destination: '/backoffice/fleet' },
      { source: '/supersonic/reports', destination: '/backoffice/fleet/reports' },
      { source: '/supersonic/dispatches', destination: '/backoffice/fleet?tab=dispatch' },
      { source: '/supersonic/drivers', destination: '/backoffice/fleet?tab=vendors' },
      { source: '/supersonic/routes', destination: '/backoffice/fleet?tab=path-cards' },
      { source: '/supersonic/maintenance', destination: '/backoffice/fleet?tab=vehicles' },
      { source: '/supersonic/settlements', destination: '/backoffice/fleet?tab=accounting' },

      // ==========================================
      // 9. SOCIAL CRM & SUPPORT (RETAINED)
      // ==========================================
      { source: '/social-crm/dashboard', destination: '/backoffice/social-crm' },
      { source: '/social-crm/reports', destination: '/backoffice/social-crm/reports' },
      { source: '/social-crm/inbox', destination: '/backoffice/social-crm' },
      { source: '/social-crm/campaigns', destination: '/backoffice/social-crm' },
      { source: '/social-crm/leads', destination: '/backoffice/social-crm' },
      { source: '/social-crm/automations', destination: '/backoffice/social-crm' },
    ];
  }
};

module.exports = nextConfig;
