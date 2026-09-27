// ==============================================================================
// VANGUARD ERP: 12-MODULE MASTER RBAC NAVIGATION TREE & PERMISSION SPECIFICATIONS
// Fully ground in the unified enterprise architecture.
// ==============================================================================

import {
  ModulePermissionDefinition,
  ActionModalOption,
  RestrictedReportOption,
  RoleDefinition,
  NodePermissionValues,
} from '@/types/rbac';

// ------------------------------------------------------------------------------
// INLINE ACTION MODAL OPTIONS (Sliders Icon)
// ------------------------------------------------------------------------------
export const ACTION_MODALS_CONFIG: Record<string, { title: string; titleAr: string; description: string; options: ActionModalOption[] }> = {
  // Module 1: Reports Actions Modal
  mod1_reports_actions: {
    title: 'Sales Reports & Invoices Fine-Grained Permissions',
    titleAr: 'صلاحيات تقارير وفواتير المبيعات التفصيلية',
    description: 'Configure permitted inline modifications for invoices, salesmen, and receipt tips.',
    options: [
      { id: 'allow_change_customer', name: 'Allow Change Customer on Invoice', nameAr: 'السماح بتغيير الزبون على الفاتورة', description: 'Enable modifying the customer on existing closed or pending receipts', defaultVal: true },
      { id: 'allow_change_payment_type', name: 'Allow Change Payment Type', nameAr: 'السماح بتعديل طريقة الدفع', description: 'Enable switching between Cash, Card, and Credit post-checkout', defaultVal: true },
      { id: 'allow_change_salesman', name: 'Allow Change Salesman / Rep', nameAr: 'السماح بتغيير مندوب المبيعات', description: 'Enable reassigning the attributed representative code on invoices', defaultVal: true },
      { id: 'allow_change_invoice_customer_no', name: 'Allow Change Invoice Customer #', nameAr: 'السماح بتعديل رقم زبون الفاتورة', description: 'Permit custom external customer numbering override', defaultVal: false },
      { id: 'allow_change_tip_value', name: 'Allow Change Tip & Gratuity Value', nameAr: 'السماح بتعديل قيمة الإكرامية', description: 'Authorize editing collected tips during receipt reconciliation', defaultVal: true },
    ],
  },

  // Module 2: Sales Actions Modal (20+ actions)
  mod2_sales_actions: {
    title: 'Operations Center — Sales Transaction Permissions',
    titleAr: 'صلاحيات عمليات المبيعات في مركز العمليات',
    description: 'Granular permissions controlling posting, discounts, voiding, pricing, and dispatch.',
    options: [
      { id: 'allow_post_sales', name: 'Post Sales Transaction to GL', nameAr: 'ترحيل حركة المبيعات لدفتر الأستاذ', description: 'Directly commit invoice to general ledger balances', defaultVal: true },
      { id: 'allow_unpost_sales', name: 'Unpost Committed Sales', nameAr: 'إلغاء ترحيل المبيعات المرحلة', description: 'Reopen posted invoice for critical corrections', defaultVal: false },
      { id: 'allow_price_override', name: 'Override Fixed Catalog Unit Price', nameAr: 'تجاوز سعر الوحدة الثابت', description: 'Manually alter prices below or above price list', defaultVal: false },
      { id: 'allow_zero_price_sale', name: 'Allow Zero-Price Free Samples', nameAr: 'السماح بعينات مجانية بسعر صفر', description: 'Permit checkout of complimentary sample bottles', defaultVal: false },
      { id: 'allow_max_discount_bypass', name: 'Bypass Maximum Discount Threshold', nameAr: 'تجاوز الحد الأقصى للخصم المسموح', description: 'Authorize discounts exceeding branch manager limits (>15%)', defaultVal: false },
      { id: 'allow_change_warehouse', name: 'Change Dispatch Warehouse / Location', nameAr: 'تغيير مستودع الصرف', description: 'Re-route item deduction to an alternate warehouse location', defaultVal: true },
      { id: 'allow_negative_stock_sale', name: 'Allow Negative Stock Sales', nameAr: 'السماح بالبيع بالسالب (دون رصيد)', description: 'Permit invoice posting when stock ledger shows zero', defaultVal: false },
      { id: 'allow_void_sales_item', name: 'Void Line Items on Open Bill', nameAr: 'إلغاء بنود من الفاتورة المفتوحة', description: 'Remove active item line with supervisor logging', defaultVal: true },
      { id: 'allow_cancel_entire_invoice', name: 'Cancel / Delete Entire Invoice', nameAr: 'إلغاء الفاتورة بالكامل', description: 'Full cancellation requiring audit reason code', defaultVal: false },
      { id: 'allow_edit_posted_date', name: 'Modify Invoice Accounting Date', nameAr: 'تعديل تاريخ القيد المحاسبي', description: 'Backdate or forward-date invoice execution', defaultVal: false },
      { id: 'allow_exceed_credit_limit', name: 'Exceed Customer Credit Limit', nameAr: 'تجاوز السقف الائتماني للزبون', description: 'Issue invoices when customer balance exceeds limit', defaultVal: false },
      { id: 'allow_reprint_tax_invoice', name: 'Reprint Official Tax Invoice', nameAr: 'إعادة طباعة الفاتورة الضريبية الرسمية', description: 'Generate duplicate copy of fiscal invoice', defaultVal: true },
      { id: 'allow_change_currency_rate', name: 'Override Exchange Rate for Invoice', nameAr: 'تعديل سعر صرف الفاتورة يدوياً', description: 'Custom daily LBP/USD exchange rate modification', defaultVal: false },
      { id: 'allow_split_bill', name: 'Split Bill & Multi-Tender', nameAr: 'تقسيم الفاتورة وتعدد وسائل الدفع', description: 'Enable split payment across multiple cards and currencies', defaultVal: true },
      { id: 'allow_merge_tables', name: 'Merge Tables & Checkouts', nameAr: 'دمج الطاولات والحسابات', description: 'Consolidate multiple showroom tables onto one bill', defaultVal: true },
      { id: 'allow_tax_exemption_override', name: 'Apply Tax Exemption Override', nameAr: 'تطبيق إعفاء ضريبي استثنائي', description: 'Zero-out VAT with official exemption certificate', defaultVal: false },
      { id: 'allow_view_profit_margin', name: 'View Real-Time Margin on Bill', nameAr: 'رؤية هامش الربح المباشر في الفاتورة', description: 'Display cost price and margin percentage to cashier', defaultVal: false },
      { id: 'allow_export_sales_data', name: 'Export Sales History to CSV/Excel', nameAr: 'تصدير بيانات المبيعات لإكسل', description: 'Download raw customer transactions dataset', defaultVal: false },
      { id: 'allow_edit_delivery_fee', name: 'Modify / Waive Delivery Run Fee', nameAr: 'تعديل أو إعفاء رسوم التوصيل', description: 'Adjust fleet delivery tariff on order', defaultVal: true },
      { id: 'allow_assign_driver_direct', name: 'Directly Assign Driver from Sales Desk', nameAr: 'تعيين السائق مباشرة من مكتب المبيعات', description: 'Bypass dispatcher queue and assign driver immediately', defaultVal: false },
    ],
  },

  // Module 2: Quotations Modal
  mod2_quotations_actions: {
    title: 'Quotations & Commercial Price Level Actions',
    titleAr: 'صلاحيات عروض الأسعار والمستويات السعرية',
    description: 'Configure quotation terms, zero-cost margins, and conversion rules.',
    options: [
      { id: 'allow_zero_cost_quotation', name: 'Allow Zero-Cost / Negative Margin Quote', nameAr: 'السماح بعرض سعر بهامش صفر أو سالب', description: 'Authorize promotional quotes without minimum margin restriction', defaultVal: false },
      { id: 'allow_direct_convert_to_invoice', name: 'Direct Convert Quotation to Invoice', nameAr: 'تحويل مباشر من عرض سعر إلى فاتورة', description: 'Bypass manager approval during conversion', defaultVal: true },
      { id: 'allow_modify_expired_quote', name: 'Re-activate / Edit Expired Quotation', nameAr: 'تعديل أو إعادة تفعيل عرض منتهي الصلاحية', description: 'Authorize pricing for quotes past validity deadline', defaultVal: false },
    ],
  },

  // Module 2: Purchases Modal
  mod2_purchases_actions: {
    title: 'Purchasing & Raw Materials Inward Actions',
    titleAr: 'صلاحيات المشتريات وتوريد المواد الخام',
    description: 'Control supplier disparities, price fluctuations, and backdated postings.',
    options: [
      { id: 'allow_post_purchases', name: 'Post Purchase Invoices to Accounts Payable', nameAr: 'ترحيل فواتير المشتريات لذمم الموردين', description: 'Commit goods intake and increase supplier payable balance', defaultVal: true },
      { id: 'allow_supplier_disparity', name: 'Authorize Supplier Price Disparities', nameAr: 'الموافقة على فروقات أسعار الموردين', description: 'Approve unit cost variance between PO and actual bill', defaultVal: false },
      { id: 'allow_backdate_purchases', name: 'Backdate Purchase Delivery Date', nameAr: 'التقييد بتاريخ استلام سابق', description: 'Record intake into previous accounting period', defaultVal: false },
    ],
  },

  // Module 2: Purchase Orders Modal
  mod2_po_actions: {
    title: 'Purchase Order Approval & Cost Visibility',
    titleAr: 'اعتماد أوامر الشراء وإخفاء التكلفة',
    description: 'Permissions for approving requisitions and hiding sensitive costs.',
    options: [
      { id: 'allow_po_approval', name: 'Approve Formal Purchase Orders', nameAr: 'اعتماد أوامر الشراء الرسمية', description: 'Sign off on factory replenishment orders', defaultVal: false },
      { id: 'allow_po_to_purchase_conversion', name: 'Convert PO to Inward Goods Bill', nameAr: 'تحويل أمر الشراء إلى فاتورة استلام', description: 'Generate goods receiving document from approved PO', defaultVal: true },
      { id: 'hide_cost_on_po', name: 'Hide Cost Values on PO View (Quantity Only)', nameAr: 'إخفاء التكاليف في أمر الشراء (كميات فقط)', description: 'Warehouse staff view quantities without financial costs', defaultVal: false },
    ],
  },

  // Module 2: Transfers Modal
  mod2_transfers_actions: {
    title: 'Warehouse & Inter-Branch Transfers',
    titleAr: 'مناقلات المستودعات والفروع',
    description: 'Inter-warehouse transfers, cost display, and requisition validation.',
    options: [
      { id: 'allow_view_transfer_cost', name: 'Display Unit Cost on Transfers', nameAr: 'إظهار تكلفة الوحدة في المناقلات', description: 'Reveal manufacturing valuation on transfer note', defaultVal: false },
      { id: 'allow_delete_unposted_transfer', name: 'Delete Unposted Transfers', nameAr: 'حذف المناقلات غير المرحلة', description: 'Remove pending movement before gate dispatch', defaultVal: true },
      { id: 'allow_requisition_date_override', name: 'Override Requisition Dates', nameAr: 'تعديل تاريخ طلب التحويل', description: 'Authorize date adjustment for logistical staging', defaultVal: false },
    ],
  },

  // Module 2: Lost Goods Modal
  mod2_lost_goods_actions: {
    title: 'Damaged & Lost Goods Disposal Authorization',
    titleAr: 'صلاحيات إتلاف البضائع التالفة والفاقد',
    description: 'Write-off approvals, leakage accounting, and spoilage justification.',
    options: [
      { id: 'allow_post_lost_goods', name: 'Authorize & Post Loss Write-Off to P&L', nameAr: 'اعتماد وترحيل إتلاف البضائع لقائمة الدخل', description: 'Deduct inventory and debit factory wastage account', defaultVal: false },
      { id: 'allow_unpost_lost_goods', name: 'Unpost Processed Loss Entry', nameAr: 'إلغاء ترحيل محضر الإتلاف', description: 'Restore inventory balance if stock is recovered', defaultVal: false },
      { id: 'allow_delete_loss_voucher', name: 'Delete Draft Loss Vouchers', nameAr: 'حذف مسودة محضر الإتلاف', description: 'Purge rejected waste reports', defaultVal: true },
    ],
  },

  // Module 2: Item Assembly Modal
  mod2_assembly_actions: {
    title: 'Item Assembly, Blending & Production Recipes',
    titleAr: 'تجميع الأصناف وخلطات الإنتاج والتعبئة',
    description: 'Recipe disclosure, batch execution, and yield adjustment permissions.',
    options: [
      { id: 'allow_view_recipe_details', name: 'Reveal Complete BOM Recipe Proportions', nameAr: 'كشف نسب الخلطات الصناعية بالكامل', description: 'Access proprietary blending formulas for olive oil and soaps', defaultVal: false },
      { id: 'allow_post_assembly_production', name: 'Post Finished Batch Production to Stock', nameAr: 'ترحيل إنتاج الدفعة التامة للمخزون', description: 'Deduct raw materials and increment packaged items', defaultVal: true },
      { id: 'allow_delete_production_run', name: 'Delete Production Run Order', nameAr: 'حذف أمر تشغيل الإنتاج', description: 'Cancel scheduled bottling run', defaultVal: false },
    ],
  },

  // Module 2: Adjustments Modal
  mod2_adjustments_actions: {
    title: 'Physical Stock Audits & Discrepancy Adjustments',
    titleAr: 'الجرد الفعلي وتسوية فروقات المخزون',
    description: 'Reconciliation permissions for tank levels and warehouse counts.',
    options: [
      { id: 'allow_qty_on_hand_overwrite', name: 'Directly Overwrite Quantity on Hand (QtyOH)', nameAr: 'تعديل مباشر للرصيد المتاح (QtyOH)', description: 'Force inventory balance without physical discrepancy audit', defaultVal: false },
      { id: 'allow_delete_unposted_adjustment', name: 'Delete Unposted Audit Adjustment', nameAr: 'حذف تسوية الجرد غير المرحلة', description: 'Discard draft count before physical verification', defaultVal: true },
      { id: 'allow_remove_from_location', name: 'Authorize Location Removal / Deprecation', nameAr: 'حذف موقع تخزين أو صهريج بالكامل', description: 'Remove warehouse bin or tank from active tracking', defaultVal: false },
    ],
  },

  // Module 2: Product Request Modal
  mod2_pr_actions: {
    title: 'Product Requests, Brand Scopes & Cost Visibility',
    titleAr: 'طلبات المنتجات ونطاق العلامات التجارية والتكلفة',
    description: 'Control multi-brand submission rights and manufacturing costs.',
    options: [
      { id: 'allow_multi_brand_requisition', name: 'Allow Multi-Brand Inter-Entity Requisitions', nameAr: 'السماح بطلبات متعددة العلامات التجارية', description: 'Cross-order between Southern Olive and affiliate brands', defaultVal: true },
      { id: 'allow_view_pr_cost', name: 'Display Estimated Cost on Product Requests', nameAr: 'إظهار التكلفة التقديرية في طلبات المنتجات', description: 'Reveal manufacturing expense to department managers', defaultVal: false },
    ],
  },

  // Module 2: Manage Product Requests Modal
  mod2_manage_pr_actions: {
    title: 'Product Request Approvals, Rejections & PO Conversion',
    titleAr: 'اعتماد ورفض طلبات المنتجات وتحويلها لأوامر شراء',
    description: 'Approval hierarchy, conversion triggers, and inventory checks.',
    options: [
      { id: 'allow_approve_product_request', name: 'Approve Formal Product Request', nameAr: 'اعتماد طلب المنتج النهائي', description: 'Authorize production or warehouse transfer dispatch', defaultVal: false },
      { id: 'allow_reject_product_request', name: 'Reject Request with Reason Code', nameAr: 'رفض طلب المنتج مع تحديد السبب', description: 'Send request back with mandatory justification', defaultVal: false },
      { id: 'allow_convert_pr_to_po', name: 'Direct Convert Approved PR to Purchase Order', nameAr: 'تحويل مباشر من طلب معتمد إلى أمر شراء', description: 'Route directly to raw materials procurement', defaultVal: true },
      { id: 'allow_view_qoh_during_approval', name: 'View Real-Time Warehouse QOH During Review', nameAr: 'رؤية المخزون الفعلي أثناء مراجعة الاعتماد', description: 'Display plant inventory to avoid redundant manufacturing', defaultVal: true },
    ],
  },

  // Module 2: Products & Services Modal
  mod2_products_actions: {
    title: 'Products & Master Catalog Management',
    titleAr: 'إدارة بطاقات الأصناف والخدمات والأسعار',
    description: 'Cost disclosure, minimum stock alert triggers, and recipe linkages.',
    options: [
      { id: 'allow_view_product_cost', name: 'Display Item Cost Price & Landed Expenses', nameAr: 'إظهار سعر التكلفة والمصاريف الملحقة', description: 'Reveal actual cost on catalog card', defaultVal: false },
      { id: 'allow_modify_reorder_thresholds', name: 'Modify Minimum Safety Stock & Reorder Points', nameAr: 'تعديل نقطة إعادة الطلب والحد الأدنى', description: 'Adjust procurement alert triggers for olive oil tins', defaultVal: true },
      { id: 'allow_link_assembly_recipe', name: 'Link Industrial Assembly Recipe to Product', nameAr: 'ربط وصفة تجميع صناعية ببطاقة الصنف', description: 'Define raw oil, tin, and label dependencies', defaultVal: false },
    ],
  },

  // Module 3: Customer Receipts Modal
  mod3_receipts_actions: {
    title: 'Customer Receipts & Payment Collections',
    titleAr: 'سندات قبض الزبائن والتحصيلات النقدية',
    description: 'Collection posting, deletion, and credit threshold overrides.',
    options: [
      { id: 'allow_post_customer_receipt', name: 'Post Customer Receipt to General Ledger', nameAr: 'ترحيل سند القبض لدفتر الأستاذ', description: 'Credit customer receivables and debit treasury/bank', defaultVal: true },
      { id: 'allow_delete_customer_receipt', name: 'Delete Customer Receipt Voucher', nameAr: 'حذف سند قبض الزبون', description: 'Remove collection entry with supervisor audit log', defaultVal: false },
      { id: 'allow_receipt_exceed_balance', name: 'Accept Receipt Exceeding Open Balance', nameAr: 'قبول دفعة تتجاوز رصيد الفواتير المفتوحة', description: 'Record customer advance/down payment', defaultVal: true },
      { id: 'allow_edit_posted_receipt', name: 'Edit Parameters of Posted Receipt', nameAr: 'تعديل بيانات سند قبض مرحل', description: 'Correct payment method on posted collections', defaultVal: false },
    ],
  },

  // Module 3: Leads & Contacts Modal
  mod3_leads_actions: {
    title: 'CRM Leads & Confidential Client Access',
    titleAr: 'صلاحيات جهات الاتصال والعملاء المحتملين',
    description: 'Data isolation rules between sales representatives.',
    options: [
      { id: 'disallow_view_other_users_contacts', name: 'Restrict to Assigned Contacts Only (Hide Others)', nameAr: 'حصر الرؤية بجهات الاتصال الخاصة بالمستخدم فقط', description: 'Sales rep only sees their own assigned leads and customers', defaultVal: true },
      { id: 'allow_export_client_database', name: 'Export Complete CRM Database to CSV', nameAr: 'تصدير كامل قاعدة بيانات الزبائن', description: 'Authorize mass contact phone and email download', defaultVal: false },
    ],
  },

  // Module 5: Accounting Header Action Modal
  mod5_header_actions: {
    title: 'Fiscal Period & Year Selection Constraints',
    titleAr: 'قيود السنوات والفترات المالية',
    description: 'Lock accounting year switches to prevent tampering with historical periods.',
    options: [
      { id: 'disable_accounting_year_selection', name: 'Disable Accounting Year Selection (Lock to Current Year)', nameAr: 'قفل اختيار السنة المالية (التثبيت على السنة الحالية)', description: 'Prevents operator from selecting closed fiscal years (e.g. 2024, 2025)', defaultVal: false },
    ],
  },

  // Module 5: Journal Voucher Modal
  mod5_jv_actions: {
    title: 'Journal Vouchers & Double-Entry Accounting Controls',
    titleAr: 'صلاحيات القيود اليومية والمحاسبة المزدوجة',
    description: 'Posting, unposting, recurring schedule management, and draft previews.',
    options: [
      { id: 'allow_post_jv', name: 'Post Journal Voucher to Trial Balance', nameAr: 'ترحيل القيد اليومي لميزان المراجعة', description: 'Commit debits and credits permanently to GL accounts', defaultVal: false },
      { id: 'allow_unpost_jv', name: 'Unpost Committed Journal Voucher', nameAr: 'إلغاء ترحيل قيد يومي مرحل', description: 'Reopen ledger entry for audit corrections', defaultVal: false },
      { id: 'allow_view_all_transactions', name: 'View All Branch Transactions (Global Ledger)', nameAr: 'عرض كافة حركات الفروع (دفتر أستاذ عام)', description: 'Access financial vouchers across all 3 company entities', defaultVal: false },
      { id: 'allow_manage_recurring_jv', name: 'Create & Trigger Recurring Journal Templates', nameAr: 'إدارة وتفعيل القيود الدورية المتكررة', description: 'Automate monthly depreciation and rental amortization', defaultVal: true },
      { id: 'allow_jv_preview_mode', name: 'Preview Balance Sheet Impact Before Post', nameAr: 'معاينة الأثر على الميزانية قبل الترحيل', description: 'Simulate financial mutation without altering state', defaultVal: true },
    ],
  },

  // Module 5: Accounts Setup Modal
  mod5_accounts_actions: {
    title: 'Chart of Accounts Configuration & Multi-Currency',
    titleAr: 'إعدادات شجرة الحسابات وتعدد العملات',
    description: 'Control auxiliary ledgers and secondary currency display.',
    options: [
      { id: 'hide_second_currency_balance', name: 'Hide Second Currency (LBP / USD) Secondary Balance', nameAr: 'إخفاء رصيد العملة الثانية (تثبيت العملة الأساسية)', description: 'Restrict accounting staff to base operating currency only', defaultVal: false },
      { id: 'allow_create_sub_accounts', name: 'Create New Sub-Accounts under Class 4/5/6', nameAr: 'إضافة حسابات فرعية جديدة في الشجرة', description: 'Permit extending the Lebanese Chart of Accounts hierarchy', defaultVal: false },
    ],
  },

  // Module 6: HR Time Off Modal
  mod6_time_off_actions: {
    title: 'Time Off & Leave Approval Authority',
    titleAr: 'صلاحيات اعتماد طلبات الإجازات والمغادرات',
    description: 'Personnel leave approval, balance deduction, and policy overrides.',
    options: [
      { id: 'allow_approve_time_off', name: 'Approve Employee Time Off Requests', nameAr: 'الموافقة على طلبات إجازات الموظفين', description: 'Sign off on sick leaves and annual vacations', defaultVal: false },
      { id: 'allow_reject_time_off', name: 'Reject Time Off Request', nameAr: 'رفض طلبات الإجازات', description: 'Decline leave requests with mandatory operational reason', defaultVal: false },
      { id: 'allow_override_leave_balance', name: 'Authorize Unpaid Leave Beyond Balance', nameAr: 'الموافقة على إجازات غير مدفوعة تتجاوز الرصيد', description: 'Permit leaves exceeding statutory employee entitlements', defaultVal: false },
    ],
  },

  // Module 6: Payroll Processing Modal
  mod6_payroll_actions: {
    title: 'Payroll Calculation & Salary Processing Actions',
    titleAr: 'صلاحيات احتساب الرواتب ومراجعة مسير الأجور',
    description: 'Salary adjustments, bonus approvals, and banking disbursement.',
    options: [
      { id: 'allow_edit_base_salary', name: 'Edit Employee Base Salary Contract', nameAr: 'تعديل الراتب الأساسي التعاقدي للموظف', description: 'Modify fixed monthly wage in USD and LBP', defaultVal: false },
      { id: 'allow_edit_payroll_processing_entry', name: 'Adjust Monthly Payroll Entry (Bonuses & Penalties)', nameAr: 'تعديل مسير الرواتب الشهري (المكافآت والخصومات)', description: 'Add shift overtime or attendance deduction to run', defaultVal: false },
      { id: 'allow_post_payroll_to_gl', name: 'Commit Payroll Disbursal to General Ledger', nameAr: 'ترحيل مسير الرواتب لدفتر الأستاذ والمصرف', description: 'Debit wages expense and credit payroll settlement vault', defaultVal: false },
    ],
  },

  // Module 7: Fleet Actions Modal
  mod7_fleet_actions: {
    title: 'SuperSonic Fleet Management & Dispatch Controls',
    titleAr: 'صلاحيات إدارة الأسطول والتوجيه اللوجستي',
    description: 'Driver assignment, task cancellation, COD settlement, and GPS re-routing.',
    options: [
      { id: 'allow_manual_driver_assign', name: 'Manual Driver Assignment & Rerouting', nameAr: 'التعيين اليدوي للسائقين وإعادة توجيه المسار', description: 'Override automated corridor driver algorithms', defaultVal: true },
      { id: 'allow_order_reassignment', name: 'Reassign Active Delivery to Alternate Van', nameAr: 'نقل مهمة نشطة لشاحنة أو فان آخر', description: 'Transfer goods mid-route in case of breakdown', defaultVal: true },
      { id: 'allow_cancel_active_task', name: 'Cancel Active Dispatched Delivery Task', nameAr: 'إلغاء مهمة توصيل نشطة على الطريق', description: 'Recall driver and reverse van loading manifest', defaultVal: false },
      { id: 'allow_cod_cash_settlement', name: 'Authorize Driver COD Cash Collection Settlement', nameAr: 'اعتماد تحصيل وتوريد مبالغ الدفع عند الاستلام', description: 'Receive driver pouch and sign off on cash clearance', defaultVal: false },
      { id: 'allow_modify_dropoff_coords', name: 'Modify Delivery GPS Drop-Off Coordinates', nameAr: 'تعديل إحداثيات موقع تسليم الزبون', description: 'Update destination pin when customer requests address change', defaultVal: true },
    ],
  },

  // Module 8: V-Connect Actions Modal
  mod8_vconnect_actions: {
    title: 'V-Connect Omnichannel Broadcast & API Actions',
    titleAr: 'صلاحيات حملات الرسائل وربط واجهة واتساب',
    description: 'Mass WhatsApp broadcasts, rate-limit overrides, and contact exports.',
    options: [
      { id: 'allow_trigger_mass_broadcast', name: 'Trigger Mass Promotional Broadcast (>10k Contacts)', nameAr: 'إطلاق حملات رسائل جماعية كبرى (>10,000 رقم)', description: 'Dispatch bulk WhatsApp campaigns across customer base', defaultVal: false },
      { id: 'allow_export_messaging_contacts', name: 'Export Filtered Audience Contacts to CSV', nameAr: 'تصدير قوائم أرقام الهواتف لإكسل', description: 'Download client list for external marketing', defaultVal: false },
      { id: 'allow_connect_disconnect_whatsapp', name: 'Connect / Disconnect WhatsApp API Numbers', nameAr: 'ربط وفصل أرقام واتساب الرسمية', description: 'Scan QR code and link company business gateway', defaultVal: false },
      { id: 'allow_bypass_messaging_rate_limits', name: 'Bypass Campaign Throttle & Anti-Ban Cooldowns', nameAr: 'تجاوز حدود الإرسال التلقائي', description: 'Override queuing throttle during flash seasonal promotions', defaultVal: false },
    ],
  },

  // Module 9: Pressing Mill Actions Modal
  mod9_mill_actions: {
    title: 'Olive Pressing Mill & Bulk Silos Operations',
    titleAr: 'صلاحيات عمليات معصرة الزيتون وخزانات التخزين',
    description: 'Weighbridge overwrites, in-kind retention rates, and tank authorizations.',
    options: [
      { id: 'allow_scale_weight_overwrite', name: 'Direct Scale Weight Overwrite (Manual Weight)', nameAr: 'التعديل اليدوي لوزن القبان (تجاوز الميزان)', description: 'Manually input harvest kilograms without scale RS232 sync', defaultVal: false },
      { id: 'allow_adjust_in_kind_retention', name: 'Adjust In-Kind Olive Oil Retention Rate (الردة)', nameAr: 'تعديل نسبة أتعاب العصر العينية (الردة)', description: 'Change standard 8%-10% in-kind retention fee on milling ticket', defaultVal: false },
      { id: 'allow_direct_tank_transfer', name: 'Authorize Direct Tank-to-Tank Bulk Transfer', nameAr: 'اعتماد ضخ وتحويل الزيت بين الصهاريج', description: 'Permit moving bulk oil between settling and packaging silos', defaultVal: true },
      { id: 'allow_batch_completion_approval', name: 'Sign Off & Finalize Pressing Batch Run', nameAr: 'اعتماد إنهاء دورة العصر واستخراج بطاقة الزيت', description: 'Commit extracted oil liters and acidity grade to records', defaultVal: true },
    ],
  },

  // Module 10: V-Menu Actions Modal
  mod10_vmenu_actions: {
    title: 'V-Menu Digital Engine & Rep QR Administration',
    titleAr: 'صلاحيات محرك ڤي-منيو وإدارة روابط المندوبين',
    description: 'Order acceptance, digital menu price overrides, and rep reattribution.',
    options: [
      { id: 'allow_accept_reject_online_orders', name: 'Accept / Reject Incoming V-Menu Digital Orders', nameAr: 'قبول ورفض طلبات ڤي-منيو الواردة', description: 'Review and confirm digital orders before dispatch', defaultVal: true },
      { id: 'allow_override_digital_prices', name: 'Override Online Menu Prices Independently', nameAr: 'تعديل أسعار القائمة الرقمية بشكل مستقل', description: 'Set special online promotional prices on V-Menu catalog', defaultVal: false },
      { id: 'allow_reroute_vmenu_to_fleet', name: 'Reroute Table Order to SuperSonic Delivery Fleet', nameAr: 'تحويل طلب طاولة لأسطول التوصيل الخارجي', description: 'Change order fulfillment from dine-in to door-to-door delivery', defaultVal: true },
      { id: 'allow_alter_rep_attribution_code', name: 'Reassign / Alter Sales Rep Attribution Code', nameAr: 'تعديل كود مندوب المبيعات المستحق للعمولة', description: 'Change credited sales representative on customer order', defaultVal: false },
    ],
  },

  // Module 11: Formulations Actions Modal
  mod11_formulations_actions: {
    title: 'Commercial Formulations & Industrial Batch Blending',
    titleAr: 'صلاحيات تركيبات الإنتاج والخلطات الكيميائية والغذائية',
    description: 'Revealing protected ratios, batch scaling, and laboratory releases.',
    options: [
      { id: 'allow_reveal_protected_formula', name: 'Reveal Protected Ingredient Ratios & Percentages', nameAr: 'كشف نسب التركيبات الدقيقة المحمية', description: 'Access proprietary saponification and oil blend ratios', defaultVal: false },
      { id: 'allow_overwrite_standard_batch_size', name: 'Overwrite Standard Industrial Batch Sizing', nameAr: 'تعديل سعة الدفعة الصناعية المعيارية', description: 'Scale production beyond certified reactor equipment limits', defaultVal: false },
      { id: 'allow_approve_raw_material_wastage', name: 'Approve Production Line Scrap & Material Wastage', nameAr: 'اعتماد هدر المواد الخام في خطوط التعبئة', description: 'Sign off on broken glass bottles or spilled oil during run', defaultVal: false },
      { id: 'allow_issue_final_qa_release', name: 'Issue Final Laboratory Quality Dispatch Release', nameAr: 'إصدار تصريح الإفراج المخبري النهائي للجودة', description: 'Certify acidity and oleocanthal standards for retail distribution', defaultVal: false },
    ],
  },

  // Module 12: Governance Actions Modal
  mod12_governance_actions: {
    title: 'Enterprise System Governance & Audit Controls',
    titleAr: 'صلاحيات حوكمة النظام والرقابة الأمنية',
    description: 'Database schema maintenance, audit log clearance, and cloud backup authorization.',
    options: [
      { id: 'allow_schema_seed_maintenance', name: 'Direct Database Schema & Seed Maintenance', nameAr: 'إدارة وتحديث بنية قواعد البيانات والبيانات الأولية', description: 'Execute administrative schema migrations and data repairs', defaultVal: false },
      { id: 'allow_audit_log_clearance', name: 'Purge / Clear System Security Audit Logs', nameAr: 'تفريغ وحذف سجلات الأمان (المدير العام فقط)', description: 'Irreversible clearing of historical security traces (SuperAdmin)', defaultVal: false },
      { id: 'allow_system_backup_sync', name: 'Trigger Instant Cloud Storage Sync & Snapshot', nameAr: 'بدء النسخ الاحتياطي والمزامنة السحابية الفورية', description: 'Authorize manual triggers for offsite snapshot replication', defaultVal: false },
    ],
  },
};

// ------------------------------------------------------------------------------
// RESTRICTED REPORTS MODAL OPTIONS (Chart Icon)
// ------------------------------------------------------------------------------
export const RESTRICTED_REPORTS_CONFIG: Record<string, { title: string; titleAr: string; description: string; reports: RestrictedReportOption[] }> = {
  // Module 1: Reports Restricted Access Modal
  mod1_reports_restricted: {
    title: 'Module 1: Sales Control & POS Restricted Reports',
    titleAr: 'تقارير المبيعات ونقاط البيع المحمية',
    description: 'Select which sensitive sales analytics and cashier reconciliation reports this role can generate.',
    reports: [
      { id: 'rep_customer_sales', name: 'Customer Sales Ledger & Volume Summary', nameAr: 'مبيعات الزبائن التراكمية', category: 'Customer Analytics' },
      { id: 'rep_comparative_financials', name: 'Comparative Multi-Branch Financials (YoY & MoM)', nameAr: 'المقارنات المالية بين الفروع', category: 'Financials' },
      { id: 'rep_discount_audits', name: 'Cashier Discount & Promotion Audit Log', nameAr: 'سجل الخصومات والتنزيلات الممنوحة', category: 'Audits' },
      { id: 'rep_internal_controls', name: 'Internal Controls & Manager Overrides Log', nameAr: 'سجل التجاوزات الإدارية والرقابة الداخلية', category: 'Audits' },
      { id: 'rep_payment_methods', name: 'Payment Collections by Tender (Cash, Card, Whish)', nameAr: 'تحصيلات وسائل الدفع المختلفة', category: 'Collections' },
      { id: 'rep_profit_summaries', name: 'Gross Margin & Net Profitability by Branch', nameAr: 'هوامش الأرباح الصافية للفروع', category: 'Profitability' },
      { id: 'rep_tax_time_analytics', name: 'VAT Periodic Liability & Hourly Sales Velocity', nameAr: 'تحليلات الضريبة وتوزيع المبيعات الساعي', category: 'Tax & Time' },
      { id: 'rep_product_sales', name: 'Product Sales Volume & Category Ranking', nameAr: 'حجم مبيعات الأصناف وتصنيفاتها', category: 'Product Analytics' },
      { id: 'rep_voids_attendance', name: 'Voided Bills, Cancellations & Shift Attendance', nameAr: 'الإلغاءات ودوام ورديات الكاشير', category: 'Audits' },
    ],
  },

  // Module 2: Operations Center Reports
  mod2_reports_restricted: {
    title: 'Module 2: Operations & Inventory Restricted Worksheets',
    titleAr: 'أوراق عمل وتقارير المستودعات والعمليات',
    description: 'Grant or restrict access to physical stock evaluations, cost valuations, and reorder reports.',
    reports: [
      { id: 'rep_inv_valuation', name: 'Full Inventory Valuation at Cost Price', nameAr: 'تقييم المخزون بسعر التكلفة', category: 'Valuation' },
      { id: 'rep_physical_count_worksheets', name: 'Physical Count Audit Variance Worksheets', nameAr: 'أوراق عمل فروقات الجرد الفعلي', category: 'Audits' },
      { id: 'rep_slow_moving_stock', name: 'Aging & Slow-Moving Stock Breakdown', nameAr: 'تحليل البضائع الراكدة وبطيئة الحركة', category: 'Stock Flow' },
      { id: 'rep_supplier_cost_disparity', name: 'Supplier Cost Fluctuations & Historical Purchase Index', nameAr: 'مؤشر تقلبات أسعار الموردين التاريخية', category: 'Procurement' },
      { id: 'rep_assembly_scrap_rates', name: 'Production Scrap & Raw Material Yield Efficiencies', nameAr: 'معدلات الهدر وكفاءة استخدام المواد الخام', category: 'Production' },
    ],
  },

  // Module 5: Accounting Reports
  mod5_reports_restricted: {
    title: 'Module 5: Financial Statements & General Ledger Reports',
    titleAr: 'القوائم المالية وتقارير دفتر الأستاذ العام',
    description: 'Control access to high-level financial statements, audit trial balance, and aging ledgers.',
    reports: [
      { id: 'rep_chart_of_accounts', name: 'Chart of Accounts Master Hierarchy Directory', nameAr: 'دليل شجرة الحسابات المحاسبية', category: 'Financials' },
      { id: 'rep_general_ledger', name: 'Detailed General Ledger Statement (All Accounts)', nameAr: 'دفتر الأستاذ العام التفصيلي', category: 'Financials' },
      { id: 'rep_balance_sheet', name: 'Official Balance Sheet & Capital Reserves', nameAr: 'الميزانية العمومية والاحتياطيات', category: 'Executive' },
      { id: 'rep_trial_balance', name: '6-Column Working Trial Balance', nameAr: 'ميزان المراجعة بمجاميعه وأرصدته', category: 'Executive' },
      { id: 'rep_cash_flow', name: 'Cash Flow Statement & Liquidity Projections', nameAr: 'قائمة التدفقات النقدية والسيولة', category: 'Executive' },
      { id: 'rep_aging_receivables', name: 'Aging of Accounts Receivable (AR) & Bad Debt Risk', nameAr: 'أعمار الذمم المدينة ومخاطر الديون', category: 'Credit' },
      { id: 'rep_aging_payables', name: 'Aging of Accounts Payable (AP) & Supplier Commitments', nameAr: 'أعمار الذمم الدائنة والتزامات الموردين', category: 'Credit' },
    ],
  },

  // Module 7: Fleet Reports
  mod7_reports_restricted: {
    title: 'Module 7: Fleet Telemetry & Driver Performance Reports',
    titleAr: 'تقارير أداء الأسطول ومطابقة التحصيلات النقدية',
    description: 'Driver delivery SLAs, fuel consumption logs, and COD cash reconciliation statements.',
    reports: [
      { id: 'rep_delivery_sla', name: 'Corridor Delivery SLA Times & Route Delays', nameAr: 'أوقات تسليم خطوط السير ونسب الالتزام', category: 'Logistics' },
      { id: 'rep_fuel_consumption', name: 'Vehicle Fuel Consumption & Maintenance Logs', nameAr: 'سجلات استهلاك الوقود وصيانة المركبات', category: 'Fleet Maintenance' },
      { id: 'rep_driver_performance', name: 'Driver Task Completion Scorecard & Ratings', nameAr: 'بطاقة أداء السائقين وتقييمات التوصيل', category: 'Performance' },
      { id: 'rep_cod_reconciliation', name: 'COD Cash Collection Pouch Reconciliation', nameAr: 'مطابقة تحصيلات الدفع عند الاستلام النقدية', category: 'Financial Audit' },
    ],
  },

  // Module 8: V-Connect Reports
  mod8_reports_restricted: {
    title: 'Module 8: Messaging Analytics & Webhook Traces',
    titleAr: 'تحليلات حملات المراسلة وسجلات الاستجابة',
    description: 'Broadcast delivery rates, open rates, and webhook error traces.',
    reports: [
      { id: 'rep_msg_delivery_rates', name: 'WhatsApp & SMS Delivery / Read Receipts Summary', nameAr: 'نسب تسليم وقراءة رسائل واتساب والرسائل القصيرة', category: 'Analytics' },
      { id: 'rep_msg_ctr', name: 'Promotional Campaign CTR & Catalog Clickthroughs', nameAr: 'معدل النقر على الروابط في الحملات', category: 'Marketing' },
      { id: 'rep_webhook_traces', name: 'Failed Inbound Webhook Traces & Gateway Logs', nameAr: 'سجلات أخطاء خوادم الربط البرمجي', category: 'System Diagnostics' },
    ],
  },

  // Module 9: Pressing Mill Reports
  mod9_reports_restricted: {
    title: 'Module 9: Pressing Mill Yield & Settlement Ledgers',
    titleAr: 'تقارير استخراج الزيت ومحاسبة المزارعين',
    description: 'Olive-to-oil yield ratio analysis, in-kind fee ledgers, and bulk tank histories.',
    reports: [
      { id: 'rep_oil_yield_ratio', name: 'Olive-to-Oil Extraction Ratio & Efficiency Analysis', nameAr: 'نسبة استخراج الزيت ومعدلات كفاءة العصر', category: 'Extraction' },
      { id: 'rep_grower_settlement', name: 'Grower Milling Settlement & In-Kind Fee (الردة) Ledger', nameAr: 'دفتر أتعاب عصر الزيتون العينية (الردة) والمالية', category: 'Settlement' },
      { id: 'rep_tank_histories', name: 'Storage Tank Level Audits & Dipstick Histories', nameAr: 'سجلات مراقبة مستويات الصهاريج والخزانات', category: 'Storage' },
      { id: 'rep_total_inkind_yield', name: 'Total Retained In-Kind Harvest Volume Valuation', nameAr: 'إجمالي تقييم كميات زيت الردة المستحقة للشركة', category: 'Valuation' },
    ],
  },

  // Module 10: V-Menu Reports
  mod10_reports_restricted: {
    title: 'Module 10: V-Menu Digital Ordering & Conversion Reports',
    titleAr: 'تقارير محرك ڤي-منيو والتحويل الرقمي',
    description: 'Source attribution metrics (Table vs Rep vs Ads) and cart abandonment.',
    reports: [
      { id: 'rep_vmenu_conversions', name: 'Order Source Attribution (Table QR vs Sales Rep vs Ads)', nameAr: 'توزيع مصادر الطلبات (طاولات، مندوبين، إعلانات)', category: 'E-Commerce' },
      { id: 'rep_cart_abandonment', name: 'Digital Menu Cart Abandonment & Checkout Dropoffs', nameAr: 'معدل السلات المتروكة ونقاط التراجع عن الطلب', category: 'E-Commerce' },
      { id: 'rep_rep_commissions_earned', name: 'Representative Earned Commissions Summary', nameAr: 'ملخص العمولات المكتسبة لمندوبي المبيعات', category: 'Commissions' },
    ],
  },

  // Module 11: Formulations Reports
  mod11_reports_restricted: {
    title: 'Module 11: Industrial Formulations & Batch Cost Reports',
    titleAr: 'تقارير تكاليف الخلطات والامتثال المخبري',
    description: 'Batch cost variances, raw ingredient wastage vs standards, and laboratory testing compliance.',
    reports: [
      { id: 'rep_batch_cost_deviations', name: 'Batch Manufacturing Cost Deviations from Standard BOM', nameAr: 'انحرافات تكلفة الدفعة الصناعية عن المعيار', category: 'Cost Accounting' },
      { id: 'rep_ingredient_wastage', name: 'Raw Ingredient Usage vs Allowable Loss Ratios', nameAr: 'استهلاك المواد الخام ومقارنتها بنسب الهدر', category: 'Manufacturing' },
      { id: 'rep_lab_compliance', name: 'Laboratory Acidity & Quality Test Compliance Certificates', nameAr: 'شهادات الامتثال المخبري لدرجات الحموضة والنقاوة', category: 'Quality' },
    ],
  },

  // Module 12: Governance Reports
  mod12_reports_restricted: {
    title: 'Module 12: System Audit, Telemetry & Security Reports',
    titleAr: 'تقارير أمان النظام وسجلات المراقبة الشاملة',
    description: 'Authentication access logs, permission override alerts, and database telemetry.',
    reports: [
      { id: 'rep_auth_access_logs', name: 'User Authentication, IP & Failed Login Access Logs', nameAr: 'سجلات تسجيل الدخول ومحاولات الاختراق الفاشلة', category: 'Security' },
      { id: 'rep_perm_override_alerts', name: 'Privileged Permission Override & Role Modification Alerts', nameAr: 'تنبيهات تعديل الصلاحيات وتجاوز الامتيازات', category: 'Security' },
      { id: 'rep_server_telemetry', name: 'Server, Database Latency & Cloud Storage Telemetry', nameAr: 'قياسات أداء الخادم وقواعد البيانات والسحابة', category: 'Infrastructure' },
    ],
  },
};

// ------------------------------------------------------------------------------
// COMPLETE 12-MODULE MASTER DEFINITIONS
// ------------------------------------------------------------------------------
export const RBAC_MASTER_MODULES: ModulePermissionDefinition[] = [
  // Module 1: Sales Control & POS
  {
    moduleNumber: 1,
    moduleCode: 'mod1_sales_pos',
    name: 'Module 1: Sales Control & POS',
    nameAr: 'الوحدة 1: التحكم بالمبيعات ونقاط البيع',
    icon: 'Store',
    description: 'Point of sale checkouts, branch data push, cashier shifts, and comprehensive sales reports.',
    nodes: [
      { id: 'm1_push_data_branches', name: 'Has Access to Push Data to Branches', nameAr: 'صلاحية إرسال البيانات للفروع', hasActions: false },
      { id: 'm1_dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم والمؤشرات', hasActions: false },
      {
        id: 'm1_reports',
        name: 'Reports',
        nameAr: 'تقارير المبيعات',
        hasActions: true,
        actionModalKey: 'mod1_reports_actions',
        reportsModalKey: 'mod1_reports_restricted',
      },
      { id: 'm1_online_orders', name: 'Online Orders', nameAr: 'الطلبات الواردة عبر الإنترنت', hasActions: true },
      { id: 'm1_end_of_day', name: 'End of Day (Z-Report)', nameAr: 'الإقفال اليومي (تقرير Z)', hasActions: true },

      // Setup Group
      { id: 'm1_screens', name: 'Screens', nameAr: 'شاشات البيع', groupHeader: 'Setup Group', hasActions: true },
      { id: 'm1_payment_types', name: 'Payment Types', nameAr: 'أنواع وطرق الدفع', groupHeader: 'Setup Group', hasActions: true },
      { id: 'm1_coupons', name: 'Coupons & Gift Certificates', nameAr: 'الكوبونات وقسائم الهدايا', groupHeader: 'Setup Group', hasActions: true },
      { id: 'm1_discounts', name: 'Discounts', nameAr: 'قواعد التخفيضات والخصومات', groupHeader: 'Setup Group', hasActions: true },
      { id: 'm1_price_modes', name: 'Price Modes', nameAr: 'أنماط الأسعار والتسعير المتعدد', groupHeader: 'Setup Group', hasActions: true },
      { id: 'm1_workstations', name: 'Workstations & Printers', nameAr: 'محطات العمل وطابعات الإيصالات', groupHeader: 'Setup Group', hasActions: true },

      // More Setup
      { id: 'm1_void_reasons', name: 'Void Reasons', nameAr: 'أسباب إلغاء الفواتير والأصناف', groupHeader: 'More Setup', hasActions: true },
      { id: 'm1_vat_exemption_reason', name: 'Vat Exemption Reason', nameAr: 'أسباب الإعفاء من الضريبة على القيمة المضافة', groupHeader: 'More Setup', hasActions: true },
      { id: 'm1_message_on_invoice', name: 'Message On Invoice', nameAr: 'الرسائل والملاحظات على الفاتورة', groupHeader: 'More Setup', hasActions: true },
      { id: 'm1_zone_setup', name: 'Zone Setup', nameAr: 'إعداد المناطق الجغرافية', groupHeader: 'More Setup', hasActions: true },
      { id: 'm1_currency_setup', name: 'Currency Setup', nameAr: 'إعداد العملات وأسعار الصرف', groupHeader: 'More Setup', hasActions: true },
    ],
  },

  // Module 2: Operations Center
  {
    moduleNumber: 2,
    moduleCode: 'mod2_operations_inventory',
    name: 'Module 2: Operations Center',
    nameAr: 'الوحدة 2: مركز العمليات',
    icon: 'Boxes',
    description: 'Factory stock levels, purchasing, transfers, assembly formulas, and product requests.',
    nodes: [
      { id: 'm2_show_cost', name: 'Show Cost', nameAr: 'إظهار التكلفة في كافة الشاشات', hasActions: false },
      { id: 'm2_dashboard', name: 'Dashboard', nameAr: 'لوحة تحكم العمليات والمستودعات', hasActions: false },
      {
        id: 'm2_reports',
        name: 'Reports',
        nameAr: 'تقارير المستودعات وأوراق العمل',
        hasActions: true,
        reportsModalKey: 'mod2_reports_restricted',
      },

      // Actions
      { id: 'm2_sales', name: 'Sales', nameAr: 'المبيعات وحركات التوزيع', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_sales_actions' },
      { id: 'm2_quotations', name: 'Quotations', nameAr: 'عروض الأسعار', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_quotations_actions' },
      { id: 'm2_delivery_of_goods', name: 'Delivery of Goods', nameAr: 'مذكرات إرسال وتسليم البضائع', groupHeader: 'Operational Transactions', hasActions: true },
      { id: 'm2_laundry_orders', name: 'Laundry Orders', nameAr: 'طلبات التنظيف والخدمات', groupHeader: 'Operational Transactions', hasActions: true },
      { id: 'm2_purchases', name: 'Purchases', nameAr: 'المشتريات وتوريد المواد', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_purchases_actions' },
      { id: 'm2_purchase_orders', name: 'Purchase Orders', nameAr: 'أوامر الشراء الرسمية', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_po_actions' },
      { id: 'm2_reorder_guide', name: 'Reorder Guide', nameAr: 'دليل إعادة الطلب ومستويات الأمان', groupHeader: 'Operational Transactions', hasActions: true },
      { id: 'm2_transfers', name: 'Transfers', nameAr: 'مناقلات الفروع والمستودعات', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_transfers_actions' },
      { id: 'm2_lost_goods', name: 'Lost Goods', nameAr: 'البضائع المفقودة والتالفة', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_lost_goods_actions' },
      { id: 'm2_item_assembly', name: 'Item Assembly', nameAr: 'تجميع وتعبئة الأصناف التامة', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_assembly_actions' },
      { id: 'm2_adjustments', name: 'Adjustments', nameAr: 'تسويات الجرد الفعلي للمخزون', groupHeader: 'Operational Transactions', hasActions: true, actionModalKey: 'mod2_adjustments_actions' },

      // Product Request
      {
        id: 'm2_product_request',
        name: 'Product Request',
        nameAr: 'طلب منتج جديد',
        groupHeader: 'Product Requests Pipeline',
        hasActions: true,
        actionModalKey: 'mod2_pr_actions',
        hasBrandAccessModal: true,
      },
      {
        id: 'm2_manage_product_requests',
        name: 'Manage Product Requests',
        nameAr: 'إدارة واعتماد طلبات المنتجات',
        groupHeader: 'Product Requests Pipeline',
        hasActions: true,
        actionModalKey: 'mod2_manage_pr_actions',
      },
      { id: 'm2_pr_preparation', name: 'Product Req. Preparation', nameAr: 'تجهيز وتحضير طلبات المنتجات', groupHeader: 'Product Requests Pipeline', hasActions: true },
      { id: 'm2_receiving_of_goods', name: 'Receiving of goods', nameAr: 'استلام البضائع والمطابقة', groupHeader: 'Product Requests Pipeline', hasActions: true },
      { id: 'm2_pr_reports', name: 'Product Request Reports', nameAr: 'تقارير طلبات المنتجات ومسارها', groupHeader: 'Product Requests Pipeline', hasActions: true },
      { id: 'm2_reject_reasons', name: 'Request Reject Reasons', nameAr: 'أسباب رفض طلبات المنتجات', groupHeader: 'Product Requests Pipeline', hasActions: true },

      // Events & Setup
      { id: 'm2_events_venues', name: 'Event Venues', nameAr: 'أماكن وقاعات الفعاليات', groupHeader: 'Events Setup', hasActions: true },
      { id: 'm2_events_resources', name: 'Event Resources', nameAr: 'موارد ومعدات الفعاليات', groupHeader: 'Events Setup', hasActions: true },
      { id: 'm2_events_types', name: 'Event Types', nameAr: 'أنواع الفعاليات', groupHeader: 'Events Setup', hasActions: true },

      { id: 'm2_quick_setup', name: 'Quick Setup', nameAr: 'الإعداد السريع للبطاقات', groupHeader: 'Master Inventory Setup', hasActions: true },
      {
        id: 'm2_products_services',
        name: 'Products & Services',
        nameAr: 'الأصناف والخدمات',
        groupHeader: 'Master Inventory Setup',
        hasActions: true,
        actionModalKey: 'mod2_products_actions',
      },
      { id: 'm2_groups', name: 'Groups', nameAr: 'مجموعات الأصناف', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_divisions', name: 'Divisions', nameAr: 'أقسام الأصناف الكبرى', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_categories', name: 'Categories', nameAr: 'الفئات التصنيفية', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_units', name: 'Units (UOM)', nameAr: 'وحدات القياس والتعبئة', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_locations', name: 'Locations & Silos', nameAr: 'مواقع التخزين والصوامع', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_suppliers', name: 'Suppliers', nameAr: 'الموردون ومصادر التوريد', groupHeader: 'Master Inventory Setup', hasActions: true },
      { id: 'm2_departments', name: 'Departments', nameAr: 'الأقسام التشغيلية', groupHeader: 'Master Inventory Setup', hasActions: true },

      // Laundry Setup
      { id: 'm2_laundry_notes', name: 'Laundry Item Notes', nameAr: 'ملاحظات أصناف الغسيل', groupHeader: 'Service Configurations', hasActions: true },
      { id: 'm2_laundry_preferences', name: 'Laundry Item Preferences', nameAr: 'تفضيلات خدمة الغسيل', groupHeader: 'Service Configurations', hasActions: true },

      // More
      { id: 'm2_lost_goods_reason', name: 'Lost Goods Reason', nameAr: 'أسباب هدر وتلف البضائع', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_sizes_groups', name: 'Sizes Groups', nameAr: 'مجموعات المقاسات والأحجام', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_sizes', name: 'Sizes', nameAr: 'الأحجام والمقاسات', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_colors', name: 'Colors', nameAr: 'الألوان والترميز البصري', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_inv_discounts', name: 'Discounts Matrix', nameAr: 'مصفوفة الخصومات التجارية', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_inv_payment_types', name: 'Payment Types', nameAr: 'طرق دفع المستودعات', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_inv_currency_setup', name: 'Currency Setup', nameAr: 'إعداد العملات في المستودع', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_inventory_brands', name: 'Inventory Brands', nameAr: 'العلامات التجارية للشركات', groupHeader: 'Extended Setup', hasActions: true },
      { id: 'm2_delivery_providers', name: 'Delivery Providers', nameAr: 'شركات ومقدمو خدمات الشحن', groupHeader: 'Extended Setup', hasActions: true },
    ],
  },

  // Module 3: Customer Management
  {
    moduleNumber: 3,
    moduleCode: 'mod3_crm',
    name: 'Module 3: Customer Management',
    nameAr: 'الوحدة 3: إدارة العملاء',
    icon: 'Users',
    description: 'Customer KYC directory, receipts, aging receivables, leads, complaints, and surveys.',
    nodes: [
      { id: 'm3_customers', name: 'Customers Directory & KYC', nameAr: 'دليل الزبائن والتحقق', hasActions: true },
      {
        id: 'm3_customer_receipts',
        name: 'Customer Receipts',
        nameAr: 'سندات قبض الزبائن',
        hasActions: true,
        actionModalKey: 'mod3_receipts_actions',
      },
      { id: 'm3_customer_aged', name: 'Customer Aged Receivables', nameAr: 'أعمار ذمم الزبائن', hasActions: false },
      { id: 'm3_customer_insights', name: 'Customer Insights & Behavioral Data', nameAr: 'تحليلات سلوك الزبائن', hasActions: false },
      { id: 'm3_tasks_appointments', name: 'Tasks and Appointments', nameAr: 'المهام والمواعيد', hasActions: true },
      {
        id: 'm3_leads_contacts',
        name: 'Leads & Contacts',
        nameAr: 'العملاء المحتملون وجهات الاتصال',
        hasActions: true,
        actionModalKey: 'mod3_leads_actions',
      },
      { id: 'm3_sales_team_perf', name: 'Sales Team Performance', nameAr: 'أداء فريق المبيعات والمندوبين', hasActions: false },

      // Settings
      { id: 'm3_customers_groups', name: 'Customers Groups', nameAr: 'مجموعات الزبائن (VIP، جملة، مفرق)', groupHeader: 'CRM Settings', hasActions: true },
      { id: 'm3_customers_categories', name: 'Customers Categories', nameAr: 'فئات الزبائن', groupHeader: 'CRM Settings', hasActions: true },
      { id: 'm3_customers_tags', name: 'Customers Tags', nameAr: 'وسوم وتصنيفات الزبائن', groupHeader: 'CRM Settings', hasActions: true },
      { id: 'm3_leads_settings', name: 'Leads Settings', nameAr: 'إعدادات قنوات العملاء المحتملين', groupHeader: 'CRM Settings', hasActions: true },

      // Feedback & Surveys
      { id: 'm3_feedback_dashboard', name: 'Dashboard', nameAr: 'لوحة استبيانات ورضا الزبائن', groupHeader: 'Feedback & Surveys', hasActions: false },
      { id: 'm3_manage_complaints', name: 'Manage Complaints', nameAr: 'إدارة ومتابعة الشكاوى', groupHeader: 'Feedback & Surveys', hasActions: true },
      { id: 'm3_add_complaints', name: 'Add Complaints', nameAr: 'تسجيل شكوى جديدة', groupHeader: 'Feedback & Surveys', hasActions: true },
      { id: 'm3_send_survey_emails', name: 'Send Survey Emails & SMS', nameAr: 'إرسال استبيانات التقييم', groupHeader: 'Feedback & Surveys', hasActions: true },
      { id: 'm3_manage_surveys', name: 'Manage Surveys', nameAr: 'إدارة نماذج الاستبيانات', groupHeader: 'Feedback & Surveys', hasActions: true },

      // Setup
      { id: 'm3_complaint_sources', name: 'Complaint Sources', nameAr: 'مصادر وصول الشكاوى', groupHeader: 'Customer Care Setup', hasActions: true },
      { id: 'm3_complaint_categories', name: 'Complaint Categories', nameAr: 'فئات وأنواع الشكاوى', groupHeader: 'Customer Care Setup', hasActions: true },
      { id: 'm3_complaint_action_types', name: 'Complaint Action Types', nameAr: 'إجراءات معالجة الشكاوى', groupHeader: 'Customer Care Setup', hasActions: true },
      { id: 'm3_customer_care', name: 'Customer care', nameAr: 'إعدادات خدمة العملاء', groupHeader: 'Customer Care Setup', hasActions: true },
      { id: 'm3_surveys_setup', name: 'Surveys Setup', nameAr: 'إعدادات أسئلة التقييم', groupHeader: 'Customer Care Setup', hasActions: true },
    ],
  },

  // Module 4: Loyalty Management
  {
    moduleNumber: 4,
    moduleCode: 'mod4_loyalty',
    name: 'Module 4: Loyalty Management',
    nameAr: 'الوحدة 4: إدارة برامج الولاء والمكافآت',
    icon: 'Award',
    description: 'Member point accumulation, tier multipliers, automated reward tiers, and client broadcasts.',
    nodes: [
      { id: 'm4_dashboard', name: 'Dashboard', nameAr: 'لوحة مؤشرات الولاء والمكافآت', hasActions: false },
      { id: 'm4_reports', name: 'Reports', nameAr: 'تقارير النقاط واستبدال المكافآت', hasActions: true },
      { id: 'm4_members', name: 'Members Directory', nameAr: 'دليل الأعضاء المشتركين بالولاء', hasActions: true },
      { id: 'm4_loyalty_levels', name: 'Loyalty Levels & Tiers', nameAr: 'مستويات وفئات الولاء (برونزي، فضي، ذهبي)', hasActions: true },
      { id: 'm4_loyalty_programs', name: 'Loyalty Programs Rules', nameAr: 'قواعد ومعادلات احتساب النقاط', hasActions: true },
      { id: 'm4_send_messages', name: 'Send Messages', nameAr: 'إرسال إشعارات الرصيد للأعضاء', hasActions: true },
      { id: 'm4_company_info', name: 'Company Info & Terms', nameAr: 'شروط وأحكام برنامج المكافآت', hasActions: true },
    ],
  },

  // Module 5: Accounting & Financials
  {
    moduleNumber: 5,
    moduleCode: 'mod5_accounting',
    name: 'Module 5: Accounting & Financials',
    nameAr: 'الوحدة 5: المحاسبة والمالية',
    icon: 'Scale',
    description: 'Chart of accounts, double-entry journal vouchers, trial balance, VAT closing, and financial reports.',
    headerActionModalKey: 'mod5_header_actions',
    nodes: [
      { id: 'm5_access_accounting_transfer', name: 'Has Access to Accounting Transfer', nameAr: 'صلاحية الترحيل للحسابات العامة', hasActions: false },
      { id: 'm5_access_accounting_link', name: 'Has Access to Accounting Link', nameAr: 'صلاحية الربط المحاسبي التلقائي', hasActions: false },
      { id: 'm5_dashboard', name: 'Dashboard', nameAr: 'لوحة المؤشرات والسيولة المالية', hasActions: false },
      {
        id: 'm5_reports',
        name: 'Reports (Financial Statements)',
        nameAr: 'تقارير القوائم المالية والأستاذ العام',
        hasActions: true,
        reportsModalKey: 'mod5_reports_restricted',
      },

      // Actions
      {
        id: 'm5_journal_voucher',
        name: 'Journal Voucher (JV)',
        nameAr: 'القيود اليومية المحاسبية',
        groupHeader: 'Financial Vouchers',
        hasActions: true,
        actionModalKey: 'mod5_jv_actions',
      },
      { id: 'm5_purchase_vouchers', name: 'Purchase Invoices (AP)', nameAr: 'فواتير المشتريات والذمم الدائنة', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_payments', name: 'Payments (PV)', nameAr: 'سندات الصرف والمدفوعات', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_receipts', name: 'Receipts (RV)', nameAr: 'سندات القبض والمقبوضات', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_ar', name: 'Accounts Receivables', nameAr: 'الذمم المدينة ومتابعة التحصيل', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_ap', name: 'Accounts Payables', nameAr: 'الذمم الدائنة ومستحقات الموردين', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_bank_reconciliation', name: 'Bank Reconciliation', nameAr: 'مطابقة الحسابات المصرفية', groupHeader: 'Financial Vouchers', hasActions: true },
      { id: 'm5_vat_closing', name: 'VAT Period Closing', nameAr: 'إقفال الفترة الضريبية للضريبة على القيمة المضافة', groupHeader: 'Financial Vouchers', hasActions: true },

      // Setup
      {
        id: 'm5_accounts',
        name: 'Chart of Accounts',
        nameAr: 'شجرة الحسابات المحاسبية',
        groupHeader: 'Accounting Setup',
        hasActions: true,
        actionModalKey: 'mod5_accounts_actions',
      },
      { id: 'm5_classes', name: 'Accounts Classes', nameAr: 'فصول الحسابات (الأصول، الخصوم...)', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_headers', name: 'Account Header 1..3', nameAr: 'عناوين ومستويات الحسابات 1-3', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_account_group', name: 'Account Group', nameAr: 'مجموعات الحسابات', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_jv_description', name: 'Jv Description Master', nameAr: 'شروحات القيود المعيارية', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_jv_types', name: 'Jv Types', nameAr: 'أنواع القيود (افتتاحي، تسوية، إقفال)', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_currency', name: 'Currency Setup', nameAr: 'العملات وأسعار الصرف', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_currency_rates', name: 'Currency Rates History', nameAr: 'سجل وتاريخ أسعار الصرف اليومية', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_dept_groups', name: 'Department Groups', nameAr: 'مجموعات مراكز الكلفة', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_department', name: 'Department', nameAr: 'مراكز الكلفة والأقسام', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_sub_department', name: 'Sub Department', nameAr: 'مراكز الكلفة الفرعية', groupHeader: 'Accounting Setup', hasActions: true },
      { id: 'm5_cash_flow_setup', name: 'Cash Flow Report Setup', nameAr: 'هيكلة وإعداد تقرير التدفقات النقدية', groupHeader: 'Accounting Setup', hasActions: true },
    ],
  },

  // Module 6: Human Resources & Payroll
  {
    moduleNumber: 6,
    moduleCode: 'mod6_hr_payroll',
    name: 'Module 6: Human Resources & Payroll',
    nameAr: 'الوحدة 6: الموارد البشرية والرواتب',
    icon: 'UserCheck',
    description: 'Employee personnel files, attendance logging, leave approvals, shifts, and monthly payroll runs.',
    nodes: [
      { id: 'm6_schedule_overview', name: 'Schedule Overview', nameAr: 'نظرة عامة على الجداول والورديات', hasActions: false },
      { id: 'm6_personnel', name: 'Personnel & Employee Master', nameAr: 'ملفات وسجلات الموظفين', hasActions: true },
      { id: 'm6_schedules', name: 'Schedules Management', nameAr: 'إدارة جداول العمل', hasActions: true },

      // Personnel & Departments Setup
      { id: 'm6_internal_depts', name: 'Internal Departments', nameAr: 'الأقسام الإدارية والتشغيلية', groupHeader: 'Personnel & Departments Setup', hasActions: true },
      { id: 'm6_designations', name: 'Designations & Job Titles', nameAr: 'المسميات والدرجات الوظيفية', groupHeader: 'Personnel & Departments Setup', hasActions: true },
      { id: 'm6_pos_employee_roles', name: 'POS Employee Roles', nameAr: 'أدوار موظفي نقاط البيع والمعصرة', groupHeader: 'Personnel & Departments Setup', hasActions: true },

      // Time & Attendance
      {
        id: 'm6_time_off_requests',
        name: 'Time Off Requests',
        nameAr: 'طلبات الإجازات والمغادرات',
        groupHeader: 'Time & Attendance',
        hasActions: true,
        actionModalKey: 'mod6_time_off_actions',
      },
      { id: 'm6_schedule_templates', name: 'Schedule Templates', nameAr: 'قوالب جداول العمل', groupHeader: 'Time & Attendance', hasActions: true },
      { id: 'm6_time_off_reasons', name: 'Time Off Reasons', nameAr: 'أسباب وأنواع الإجازات', groupHeader: 'Time & Attendance', hasActions: true },
      { id: 'm6_attendance_summary', name: 'Attendance Summary', nameAr: 'ملخص الحضور والانصراف', groupHeader: 'Time & Attendance', hasActions: false },
      { id: 'm6_attendance_log', name: 'Attendance Log', nameAr: 'سجل البصمات الإلكتروني', groupHeader: 'Time & Attendance', hasActions: true },

      // Payroll
      { id: 'm6_payroll_dashboard', name: 'Payroll Dashboard', nameAr: 'لوحة متابعة مسير الرواتب', groupHeader: 'Payroll & Compensation', hasActions: false },
      {
        id: 'm6_salary_processing',
        name: 'Salary Processing & Payrun',
        nameAr: 'احتساب وصرف الرواتب الشهرية',
        groupHeader: 'Payroll & Compensation',
        hasActions: true,
        actionModalKey: 'mod6_payroll_actions',
      },
      { id: 'm6_payment_settings', name: 'Payment Settings', nameAr: 'إعدادات الصرف المصرفي والنقدي', groupHeader: 'Payroll & Compensation', hasActions: true },
      { id: 'm6_earnings_deductions', name: 'Earnings & Deductions Master', nameAr: 'أنواع البدلات والمكافآت والخصومات', groupHeader: 'Payroll & Compensation', hasActions: true },
    ],
  },

  // Module 7: SuperSonic Fleet Management & Dispatch
  {
    moduleNumber: 7,
    moduleCode: 'mod7_fleet',
    name: 'Module 7: SuperSonic Fleet Management & Dispatch',
    nameAr: 'الوحدة 7: إدارة أسطول الشحن والتوزيع',
    icon: 'Truck',
    description: 'Live GPS vehicle telemetry, automated dispatch corridors, driver performance, and COD settlements.',
    nodes: [
      { id: 'm7_fleet_tracking', name: 'Fleet Live Tracking (Spatial GPS)', nameAr: 'التتبع الحي للأسطول عبر الخريطة', hasActions: false },
      {
        id: 'm7_dispatch_console',
        name: 'Dispatch Console & Manifests',
        nameAr: 'شاشة التحكم بالتوجيه وخطوط السير',
        hasActions: true,
        actionModalKey: 'mod7_fleet_actions',
      },
      { id: 'm7_driver_performance', name: 'Driver Performance & Log', nameAr: 'سجلات وأداء السائقين', hasActions: false },
      { id: 'm7_maintenance_fuel', name: 'Vehicle Maintenance & Fuel', nameAr: 'صيانة المركبات وسجلات المحروقات', hasActions: true },
      {
        id: 'm7_fleet_reports',
        name: 'Fleet Reports & COD Ledger',
        nameAr: 'تقارير الأسطول ومطابقة التحصيلات',
        hasActions: true,
        reportsModalKey: 'mod7_reports_restricted',
      },
    ],
  },

  // Module 8: V-Connect
  {
    moduleNumber: 8,
    moduleCode: 'mod8_vconnect',
    name: 'Module 8: V-Connect',
    nameAr: 'الوحدة 8: المراسلة متعددة القنوات وبوابة واتساب',
    icon: 'MessageSquare',
    description: 'WhatsApp broadcast campaigns, automated CRM triggers, SMS gateways, and webhook telemetry.',
    nodes: [
      { id: 'm8_campaigns_dashboard', name: 'Campaigns Dashboard', nameAr: 'لوحة مؤشرات الحملات الإعلانية', hasActions: false },
      {
        id: 'm8_broadcast_queue',
        name: 'WhatsApp Broadcast Queue',
        nameAr: 'قائمة إرسال رسائل واتساب الجماعية',
        hasActions: true,
        actionModalKey: 'mod8_vconnect_actions',
      },
      { id: 'm8_sms_gateway', name: 'SMS Gateway Management', nameAr: 'إدارة بوابات الرسائل القصيرة (SMS)', hasActions: true },
      { id: 'm8_messaging_templates', name: 'Messaging Templates & Variables', nameAr: 'قوالب الرسائل والمتغيرات الديناميكية', hasActions: true },
      { id: 'm8_automated_triggers', name: 'Automated Event Triggers', nameAr: 'قواعد الإرسال التلقائي للإنذارات', hasActions: true },
      {
        id: 'm8_analytics_reports',
        name: 'Messaging Analytics & Reports',
        nameAr: 'تقارير تسليم ونقر الرسائل',
        hasActions: true,
        reportsModalKey: 'mod8_reports_restricted',
      },
    ],
  },

  // Module 9: Pressing Mill Engine
  {
    moduleNumber: 9,
    moduleCode: 'mod9_pressing_mill',
    name: 'Module 9: Pressing Mill Engine',
    nameAr: 'الوحدة 9: محرك معاصر الزيتون وخزانات الزيت',
    icon: 'Layers',
    description: 'Weighbridge intake, continuous pressing lines, oil yield calculation, silo transfers, and in-kind fees.',
    nodes: [
      { id: 'm9_harvest_intake', name: 'Harvest Intake & Weighing', nameAr: 'استلام المحصول ووزن القبان الإلكتروني', hasActions: true },
      {
        id: 'm9_pressing_queue',
        name: 'Pressing Batches Queue',
        nameAr: 'طابور تشغيل دورات عصر الزيتون',
        hasActions: true,
        actionModalKey: 'mod9_mill_actions',
      },
      { id: 'm9_yield_efficiency', name: 'Extraction Yield & Efficiency', nameAr: 'كفاءة الاستخراج ونسبة الزيت', hasActions: false },
      { id: 'm9_tanks_silos', name: 'Storage Tanks & Silos Management', nameAr: 'إدارة خزانات الترسيب وصوامع الزيت', hasActions: true },
      { id: 'm9_mill_billing', name: 'Mill Service Billing & In-Kind Fees (الردة)', nameAr: 'فوترة خدمات العصر وأتعاب الردة العينية', hasActions: true },
      {
        id: 'm9_mill_reports',
        name: 'Pressing Mill Reports',
        nameAr: 'تقارير ومحاضر معاصر الزيتون',
        hasActions: true,
        reportsModalKey: 'mod9_reports_restricted',
      },
    ],
  },

  // Module 10: V-Menu & Online Ordering
  {
    moduleNumber: 10,
    moduleCode: 'mod10_vmenu',
    name: 'Module 10: V-Menu & Online Ordering',
    nameAr: 'الوحدة 10: محرك القائمة الرقمية والمبيعات الإلكترونية',
    icon: 'QrCode',
    description: 'Digital ordering inbox, promotional banners, dynamic table QR generator, and sales rep attribution.',
    nodes: [
      {
        id: 'm10_online_orders_inbox',
        name: 'Live Online Orders Inbox',
        nameAr: 'صندوق الطلبات الإلكترونية المباشرة',
        hasActions: true,
        actionModalKey: 'mod10_vmenu_actions',
      },
      { id: 'm10_content_pricing', name: 'Digital Menu Content & Pricing Editor', nameAr: 'محرر محتوى وأسعار القائمة الرقمية', hasActions: true },
      { id: 'm10_popups_banners', name: 'Promotional Popups & Banners', nameAr: 'البانرات والعروض الترويجية المنبثقة', hasActions: true },
      { id: 'm10_table_qr_generator', name: 'Table QR Generator (Showroom)', nameAr: 'منشئ رموز QR للطاولات وصالة العرض', hasActions: true },
      { id: 'm10_rep_qr_generator', name: 'Rep QR & WhatsApp Link Generator', nameAr: 'منشئ روابط وعمولات مندوبي المبيعات', hasActions: true },
      {
        id: 'm10_vmenu_reports',
        name: 'Conversion & Rep Commission Reports',
        nameAr: 'تقارير التحويل وعمولات المندوبين',
        hasActions: true,
        reportsModalKey: 'mod10_reports_restricted',
      },
    ],
  },

  // Module 11: Commercial Formulations & Batch Blending
  {
    moduleNumber: 11,
    moduleCode: 'mod11_formulations',
    name: 'Module 11: Commercial Formulations & Batch Blending',
    nameAr: 'الوحدة 11: تركيبات الإنتاج والخلطات الصناعية',
    icon: 'FlaskConical',
    description: 'Proprietary blending ratios, manufacturing scheduling, ingredient staging, and lab QA release.',
    nodes: [
      {
        id: 'm11_bom_formulations',
        name: 'Commercial BOM & Formulations',
        nameAr: 'قوائم المواد والتركيبات الصناعية المحمية',
        hasActions: true,
        actionModalKey: 'mod11_formulations_actions',
      },
      { id: 'm11_production_scheduling', name: 'Production Scheduling', nameAr: 'جدولة خطوط الإنتاج والتكرير', hasActions: true },
      { id: 'm11_ingredient_staging', name: 'Raw Chemical & Food Ingredient Staging', nameAr: 'تجهيز وصرف المواد الأولية والمضافات', hasActions: true },
      { id: 'm11_bottling_packaging', name: 'Bottling & Packaging Lines', nameAr: 'خطوط التعبئة والتغليف الآلية', hasActions: true },
      { id: 'm11_qa_testing', name: 'Quality Assurance (Acidity & Oleocanthal Testing)', nameAr: 'مراقبة الجودة (فحوصات الحموضة والبوليفينول)', hasActions: true },
      {
        id: 'm11_formulation_reports',
        name: 'Formulation & Variance Reports',
        nameAr: 'تقارير التكاليف والفحوصات المخبرية',
        hasActions: true,
        reportsModalKey: 'mod11_formulations_reports',
      },
    ],
  },

  // Module 12: System Governance & Audit Trails
  {
    moduleNumber: 12,
    moduleCode: 'mod12_governance',
    name: 'Module 12: System Governance & Audit Trails',
    nameAr: 'الوحدة 12: حوكمة النظام وسجلات التدقيق والأمان',
    icon: 'ShieldAlert',
    description: 'Role permissions matrix, audit security logs, database backups, and enterprise system telemetry.',
    nodes: [
      {
        id: 'm12_rbac_matrix',
        name: 'Role Permissions Matrix (12 Modules)',
        nameAr: 'مصفوفة أدوار وصلاحيات النظام (12 وحدة)',
        hasActions: true,
        actionModalKey: 'mod12_governance_actions',
      },
      { id: 'm12_audit_trail', name: 'Audit Trail & Security Logs', nameAr: 'سجلات التدقيق والأمان والرقابة', hasActions: false },
      { id: 'm12_backups_cloud_sync', name: 'Database Backups & Cloud Storage Sync', nameAr: 'النسخ الاحتياطي والمزامنة السحابية', hasActions: true },
      {
        id: 'm12_governance_reports',
        name: 'System Security & Telemetry Reports',
        nameAr: 'تقارير أمان النظام والاتصال',
        hasActions: true,
        reportsModalKey: 'mod12_governance_reports',
      },
    ],
  },
];

// ------------------------------------------------------------------------------
// AUTHORIZED BRANDS DIRECTORY (For Product Request Brand Access Selector)
// ------------------------------------------------------------------------------
export const AUTHORIZED_BRANDS_DIRECTORY = [
  { id: 'brand_southern_olive', nameEn: 'Southern Olive Oil Products S.A.R.L', nameAr: 'شركة منتجات زيتون الجنوب ش.م.م' },
  { id: 'brand_zeit_zaytoun', nameEn: 'Zeit w zaytoun ljanoub', nameAr: 'زيت وزيتون الجنوب' },
  { id: 'brand_jabal_amel', nameEn: 'Jabal Amel Pure Extra Virgin', nameAr: 'جبل عامل البكر الممتاز' },
  { id: 'brand_choueifat_press', nameEn: 'Choueifat Milling & Packaging Co.', nameAr: 'معاصر وتعبئة الشويفات' },
  { id: 'brand_baladi_gourmet', nameEn: 'Baladi Artisanal Preserves', nameAr: 'مونة بلدية فاخرة' },
];

export const MASTER_RBAC_MODULES = RBAC_MASTER_MODULES;

// Helper function to populate initial node permissions across all 12 modules
function buildSeedRolePermissions(
  roleId: string,
  predicate: (modCode: string, nodeId: string) => { view: boolean; add: boolean; edit: boolean; delete: boolean }
): Record<string, NodePermissionValues> {
  const perms: Record<string, NodePermissionValues> = {};
  for (const mod of MASTER_RBAC_MODULES) {
    for (const node of mod.nodes) {
      perms[node.id] = predicate(mod.moduleCode, node.id);
    }
  }
  return perms;
}

export const CANONICAL_SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'r_super',
    name: 'Super Administrator',
    description: 'Unrestricted master access across all 12 business modules, operations, security audit trails, and data archives.',
    employee_role: 'SUPER_ADMIN',
    is_read_only: false,
    assignedCount: 1,
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    permissions: buildSeedRolePermissions('r_super', () => ({ view: true, add: true, edit: true, delete: true })),
    action_overrides: {
      mod1_reports_actions: { allow_change_customer: true, allow_change_payment_type: true, allow_change_salesman: true, allow_change_invoice_customer_no: true, allow_change_tip_value: true },
      mod2_sales_actions: { allow_post_sales: true, allow_unpost_sales: true, allow_price_override: true, allow_zero_price_sale: true, allow_max_discount_bypass: true, allow_change_warehouse: true, allow_negative_stock_sale: true, allow_void_sales_item: true, allow_cancel_entire_invoice: true, allow_edit_posted_date: true, allow_exceed_credit_limit: true, allow_reprint_tax_invoice: true, allow_change_currency_rate: true, allow_split_bill: true, allow_merge_tables: true, allow_tax_exemption_override: true, allow_view_profit_margin: true, allow_export_sales_data: true, allow_edit_delivery_fee: true, allow_assign_driver_direct: true },
      mod12_governance_actions: { allow_schema_seed_maintenance: true, allow_audit_log_clearance: true, allow_system_backup_sync: true },
    },
    restricted_reports: {
      mod1_reports_restricted: ['cs_01', 'cs_02', 'cf_01', 'cf_02', 'dr_01', 'dr_02', 'ic_01', 'ic_02', 'pay_01', 'pay_02', 'prof_01', 'prof_02', 'tax_01', 'tax_02', 'ps_01', 'ps_02', 'vh_01', 'vh_02'],
      mod2_reports_restricted: ['inv_ws_01', 'inv_ws_02', 'inv_stk_01', 'inv_stk_02', 'inv_adj_01', 'inv_req_01', 'inv_val_01'],
      mod5_accounting_reports_restricted: ['acc_coa_01', 'acc_gl_01', 'acc_bs_01', 'acc_tb_01', 'acc_cf_01', 'acc_age_01', 'acc_vat_01'],
      mod12_governance_reports: ['gov_auth_01', 'gov_perm_01', 'gov_telemetry_01', 'gov_db_01'],
    },
    brand_access: AUTHORIZED_BRANDS_DIRECTORY.map((b) => b.id),
  },
  {
    id: 'r_ops',
    name: 'General Operations & Mill Manager',
    description: 'Authorized for operations center, inventory assembly, pressing mill intake, silos, and fleet manifests.',
    employee_role: 'MANAGER',
    is_read_only: false,
    assignedCount: 2,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    permissions: buildSeedRolePermissions('r_ops', (modCode) => {
      if (modCode.includes('operations') || modCode.includes('pressing') || modCode.includes('formulations')) {
        return { view: true, add: true, edit: true, delete: true };
      }
      if (modCode.includes('sales') || modCode.includes('fleet') || modCode.includes('vmenu')) {
        return { view: true, add: true, edit: true, delete: false };
      }
      return { view: true, add: false, edit: false, delete: false };
    }),
    action_overrides: {
      mod2_sales_actions: { allow_post_sales: true, allow_unpost_sales: true, allow_price_override: true, allow_change_warehouse: true, allow_view_profit_margin: true },
      mod9_mill_actions: { allow_direct_tank_transfer: true, allow_batch_completion_approval: true, allow_scale_weight_overwrite: true },
      mod7_fleet_actions: { allow_manual_driver_assign: true, allow_order_reassignment: true, allow_cancel_active_task: true },
      mod11_formulations_actions: { allow_reveal_formula_ratios: true, allow_approve_wastage: true, allow_issue_dispatch_release: true },
    },
    restricted_reports: {
      mod2_reports_restricted: ['inv_ws_01', 'inv_stk_01', 'inv_adj_01', 'inv_val_01'],
      mod9_mill_reports: ['mill_yield_01', 'mill_grower_01', 'mill_tanks_01', 'mill_retention_01'],
      mod7_fleet_reports: ['flt_sla_01', 'flt_fuel_01', 'flt_driver_01'],
    },
    brand_access: ['brand_southern_olive', 'brand_zeit_zaytoun', 'brand_jabal_amel'],
  },
  {
    id: 'r_finance_mgr',
    name: 'Finance Department Manager',
    description: 'Supervises financial double-entry accounting, customer credit, supplier payables, VAT, and audit trial balances.',
    employee_role: 'Finance department manager',
    is_read_only: false,
    assignedCount: 1,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    permissions: buildSeedRolePermissions('r_finance_mgr', (modCode) => {
      if (modCode.includes('accounting')) {
        return { view: true, add: true, edit: true, delete: true };
      }
      if (modCode.includes('customer') || modCode.includes('hr_payroll')) {
        return { view: true, add: true, edit: true, delete: false };
      }
      return { view: true, add: false, edit: false, delete: false };
    }),
    action_overrides: {
      mod5_jv_actions: { allow_post_jv: true, allow_unpost_jv: true, allow_view_all_transactions: true, allow_recurring_jv: true, allow_print_preview_unposted: true },
      mod3_receipts_actions: { allow_post_customer_receipt: true, allow_edit_posted_receipt: true, allow_exceed_customer_balance: true },
      mod6_payroll_actions: { allow_edit_salary_entry: true, allow_edit_processing_entry: true },
    },
    restricted_reports: {
      mod5_accounting_reports_restricted: ['acc_coa_01', 'acc_gl_01', 'acc_bs_01', 'acc_tb_01', 'acc_cf_01', 'acc_age_01', 'acc_vat_01'],
      mod1_reports_restricted: ['cf_01', 'dr_01', 'prof_01', 'tax_01'],
    },
    brand_access: ['brand_southern_olive', 'brand_zeit_zaytoun'],
  },
  {
    id: 'r_cashier',
    name: 'POS Terminal Cashier',
    description: 'Cashier checkout, table QR receipt billing, discount logging, customer payments, and end-of-day Z-Report.',
    employee_role: 'CASHIER',
    is_read_only: false,
    assignedCount: 4,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: buildSeedRolePermissions('r_cashier', (modCode, nodeId) => {
      if (modCode.includes('sales_pos')) {
        return { view: true, add: true, edit: false, delete: false };
      }
      if (modCode.includes('loyalty') || nodeId === 'm3_customers' || nodeId === 'm3_customer_receipts') {
        return { view: true, add: true, edit: false, delete: false };
      }
      return { view: false, add: false, edit: false, delete: false };
    }),
    action_overrides: {
      mod1_reports_actions: { allow_change_customer: false, allow_change_payment_type: true, allow_change_salesman: false, allow_change_invoice_customer_no: false, allow_change_tip_value: true },
    },
    restricted_reports: {
      mod1_reports_restricted: ['pay_01', 'pay_02', 'ps_01'],
    },
    brand_access: ['brand_southern_olive'],
  },
  {
    id: 'r_sales_rep',
    name: 'Sales Representative & CRM Concierge',
    description: 'Customer ordering, quotations, V-Menu sales rep links with automated commission attribution.',
    employee_role: 'sales',
    is_read_only: false,
    assignedCount: 4,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    permissions: buildSeedRolePermissions('r_sales_rep', (modCode) => {
      if (modCode.includes('sales_pos') || modCode.includes('customer_crm') || modCode.includes('vmenu')) {
        return { view: true, add: true, edit: true, delete: false };
      }
      if (modCode.includes('operations') || modCode.includes('loyalty')) {
        return { view: true, add: false, edit: false, delete: false };
      }
      return { view: false, add: false, edit: false, delete: false };
    }),
    action_overrides: {
      mod3_leads_actions: { disallow_view_other_users_contacts: true },
      mod10_vmenu_actions: { allow_alter_rep_attribution: true },
    },
    restricted_reports: {
      mod1_reports_restricted: ['cs_01', 'ps_01'],
      mod10_vmenu_reports: ['vmenu_attr_01'],
    },
    brand_access: ['brand_southern_olive', 'brand_zeit_zaytoun'],
  },
  {
    id: 'r_auditor',
    name: 'Internal Auditor & Compliance Officer',
    description: 'Comprehensive read-only review rights across all financial journals, logs, and telemetry with editing blocked.',
    employee_role: 'MANAGER',
    is_read_only: true, // Read-Only Master Switch ON: Add/Edit/Delete checkboxes hidden
    assignedCount: 1,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    permissions: buildSeedRolePermissions('r_auditor', () => ({ view: true, add: false, edit: false, delete: false })),
    action_overrides: {},
    restricted_reports: {
      mod1_reports_restricted: ['cs_01', 'cf_01', 'dr_01', 'ic_01', 'prof_01', 'tax_01'],
      mod5_accounting_reports_restricted: ['acc_coa_01', 'acc_gl_01', 'acc_bs_01', 'acc_tb_01'],
      mod12_governance_reports: ['gov_auth_01', 'gov_perm_01'],
    },
    brand_access: AUTHORIZED_BRANDS_DIRECTORY.map((b) => b.id),
  },
  {
    id: 'r_driver',
    name: 'SuperSonic Fleet Lead & Driver',
    description: 'V-Driver proof of delivery, delivery run sheet execution, COD collection, and GPS tracking.',
    employee_role: 'Delivery',
    is_read_only: false,
    assignedCount: 3,
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    permissions: buildSeedRolePermissions('r_driver', (modCode) => {
      if (modCode.includes('fleet')) {
        return { view: true, add: true, edit: true, delete: false };
      }
      return { view: false, add: false, edit: false, delete: false };
    }),
    action_overrides: {
      mod7_fleet_actions: { allow_cod_cash_settlement: true },
    },
    restricted_reports: {
      mod7_fleet_reports: ['flt_sla_01', 'flt_driver_01'],
    },
    brand_access: ['brand_southern_olive'],
  },
];

export const CANONICAL_SEED_ROLES: RoleDefinition[] = CANONICAL_SYSTEM_ROLES;
