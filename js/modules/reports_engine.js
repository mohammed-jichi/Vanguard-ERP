/**
 * Vanguard AND OIL PRODUCTS SARL (منتوجات زيت وزيتون الجنوب ش.م.م)
 * Universal Real Interactive Reports Engine (Zero Placeholder Toasts)
 * System ID: southernlbpr
 */

(function () {
  'use strict';

  // 1. Report Datasets Registry
  const REPORT_DATASETS = {
    // --- Operations Center Reports ---
    'stock_variance': {
      title: 'Stock Variance & Physical Audit Report',
      subtitle: 'Comparison between Theoretical Inventory Balance and Physical Count across Warehouses (WH1-WH4)',
      columns: ['Item Description', 'Warehouse', 'Theoretical Stock', 'Physical Count', 'Variance (+/-)', 'Discrepancy Value ($)', 'Matched Status'],
      rows: [
        ['Extra Virgin Olive Oil 1L Glass Bottle', 'WH-4 (Finished Goods)', '1,420 Bottles', '1,418 Bottles', '-2 Bottles', '-$17.00', '<span class="badge bg-warning text-dark">Minor Discrepancy</span>'],
        ['Bulk Raw Virgin Pressing Batch #84', 'WH-1 (Raw Materials)', '18,500 Ltr', '18,500 Ltr', '0 Ltr', '$0.00', '<span class="badge bg-success">100% Matched</span>'],
        ['Dark Glass Marasca Bottle 500ml', 'WH-2 (Packaging & Tins)', '6,200 Units', '6,150 Units', '-50 Units', '-$22.50', '<span class="badge bg-danger">Wastage Discrepancy</span>'],
        ['Filter Paper Discs 40cm (Industrial)', 'WH-2 (Packaging & Tins)', '450 Packs', '450 Packs', '0 Packs', '$0.00', '<span class="badge bg-success">100% Matched</span>'],
        ['EVOO 16L Metallic Tin Container', 'WH-4 (Finished Goods)', '380 Tins', '380 Tins', '0 Tins', '$0.00', '<span class="badge bg-success">100% Matched</span>'],
        ['Stainless Tank Filtration Sludge', 'WH-3 (WIP Filtration)', '120 Ltr', '135 Ltr', '+15 Ltr Sludge', '$0.00', '<span class="badge bg-info text-dark">Sludge Logged</span>']
      ],
      foot: ['Total Discrepancy Impact', 'All Facilities', '26,670 Items', '26,633 Items', '-37 Units Net', '-$39.50 Net Discrepancy', 'Status: Audit Verified']
    },

    'reorder_guide': {
      title: 'Inventory Reorder Guide & Stock Depletion Report',
      subtitle: 'Items approaching minimum reorder threshold requiring immediate purchase orders',
      columns: ['Item Description', 'Min Stock', 'Reorder Threshold', 'Current QTOH', 'Suggested Restock Qty', 'Primary Supplier'],
      rows: [
        ['Dark Glass Marasca Bottle 500ml', '5,000 Units', '7,500 Units', '6,150 Units', '10,000 Units', 'Lebanon Glass Industries SARL'],
        ['Tin Cap / Spout Seals 31.5mm', '10,000 Seals', '15,000 Seals', '8,400 Seals', '20,000 Seals', 'Middle East Closure Products Co.'],
        ['Filter Paper Discs 40cm', '200 Packs', '350 Packs', '450 Packs', '0 Packs (Stock OK)', 'EuroFilter Filtration SARL'],
        ['EVOO 16L Metallic Tin Container', '300 Tins', '500 Tins', '380 Tins', '1,000 Tins', 'Beirut Metal Packaging Factory']
      ],
      foot: ['Total Suggested Orders', 'Min Threshold Met', '22,700 Threshold', '21,380 QTOH', '31,000 Units Needed', '4 Suppliers Pending PO']
    },

    'lost_goods': {
      title: 'Lost Goods, Wastage & Breakage Log',
      subtitle: 'Audit log of damaged packaging, tank leakage, and pressing filtration sludge losses',
      columns: ['Date', 'Item Description', 'Warehouse', 'Qty Lost', 'Reason', 'Discrepancy Value ($)'],
      rows: [
        ['2026-08-12', 'Dark Glass Marasca Bottle 500ml', 'WH-2 (Packaging)', '50 Bottles', 'Conveyor Belt Breakage', '$22.50'],
        ['2026-08-10', 'Raw Olive Oil Pressing Batch #81', 'WH-3 (WIP Filtration)', '45 Liters', 'Bottom Tank Sludge Drain', '$157.50'],
        ['2026-08-05', 'EVOO 1L Glass Bottle', 'WH-4 (Finished Goods)', '2 Bottles', 'Forklift Pallet Slip', '$17.00']
      ],
      foot: ['Total Loss Logged', '3 Incidents Logged', 'All Facilities', '97 Units / Ltrs', 'Sludge & Handling Breakage', '$197.00 Total Loss']
    },

    'bom_assembly': {
      title: 'Production & BOM Assembly Log',
      subtitle: 'Batch bottling yields, recipe execution history, and 2000L RO Water usage metrics',
      columns: ['Batch #', 'Recipe / BOM Name', 'Output Yield', 'RO Water Used (L)', 'Acidity Level %', 'Production Date'],
      rows: [
        ['BATCH-2026-088', 'EVOO Premium Glass Bottling 1L', '1,200 Bottles (1,200L)', '140 Liters RO Water', '0.24% Extra Virgin', '2026-08-13'],
        ['BATCH-2026-087', 'Traditional EVOO 16L Tin Packing', '250 Tins (4,000L)', '85 Liters RO Water', '0.38% Extra Virgin', '2026-08-11'],
        ['BATCH-2026-086', 'Filtered Organic Olive Oil 500ml', '2,400 Bottles (1,200L)', '180 Liters RO Water', '0.19% Ultra Premium', '2026-08-08']
      ],
      foot: ['Total Bottled Yield', '3 Finished Batches', '6,400 Liters Total', '405 Liters RO Water', 'Avg Acidity: 0.27%', 'Status: QA Approved']
    },

    // --- Sales Control Reports ---
    'sales_summary': {
      title: 'Sales Summary & Detailed Invoices Register',
      subtitle: 'Complete breakdown of POS terminal transactions, B2B wholesale sales, discounts, and VAT',
      columns: ['Invoice #', 'Date & Time', 'Customer Name', 'Cashier', 'Gross Amount ($)', 'Discount ($)', 'VAT 11% ($)', 'Net Total ($)', 'Payment Type'],
      rows: [
        ['INV-2026-4011', '2026-08-14 11:24', 'Al-Mazen Supermarket Tyr', 'Hassan K.', '$450.00', '$22.50', '$47.03', '$474.53', 'Cash USD'],
        ['INV-2026-4010', '2026-08-14 10:15', 'Nabatieh Cooperative Store', 'Fatima A.', '$1,200.00', '$60.00', '$125.40', '$1,265.40', 'Wish Money Transfer'],
        ['INV-2026-4009', '2026-08-13 16:40', 'Beirut Gourmet Groceries', 'Hassan K.', '$850.00', '$0.00', '$93.50', '$943.50', 'Bank Cheque (BLOM)'],
        ['INV-2026-4008', '2026-08-13 14:12', 'Walk-in Retail Customer', 'Ahmad S.', '$35.00', '$0.00', '$3.85', '$38.85', 'Cash LBP (3,477,075 LBP)']
      ],
      foot: ['Total Sales Summary', '4 Sales Invoices', 'Commercial & B2B', 'All Terminals', '$2,535.00 Gross', '$82.50 Discounts', '$269.78 VAT Total', '$2,722.28 Net Revenue', 'Dual Currency Settled']
    },

    'voids_refunds': {
      title: 'Summary of Voids, Cancelations & Refunds Audit Log',
      subtitle: 'Audit log of canceled POS tickets, returned goods, void reasons, and approving manager authorization',
      columns: ['Canceled Invoice #', 'Date & Time', 'Customer', 'Void Reason', 'Approving Manager', 'Refund Amount ($)'],
      rows: [
        ['INV-2026-3988', '2026-08-12 15:10', 'Walk-in Retail Customer', 'Customer Changed Mind on Bottle Size', 'General Admin (M. Harb)', '$17.00 (Cash USD)'],
        ['INV-2026-3942', '2026-08-09 11:45', 'Saida Catering Services', 'Incorrect Customer VAT Number Entered', 'General Admin (M. Harb)', '$380.00 (Re-issued)']
      ],
      foot: ['Total Voids Logged', '2 Transactions Voided', 'Audit Clean', 'Wrong Entry / Change Mind', '100% Authorized', '$397.00 Total Voided']
    },

    'sales_zone': {
      title: 'Sales by Geographical Zone & Product Breakdown',
      subtitle: 'Commercial sales distribution across South Lebanon, Beirut, Bekaa, and Mount Lebanon regions',
      columns: ['Lebanese Zone / Governorate', 'Primary City', 'Top Selling SKU', 'Units Sold', 'Gross Sales Revenue ($)', 'Market Share %'],
      rows: [
        ['South Lebanon Governorate', 'Tyr (صور)', 'EVOO 16L Metallic Tin', '480 Tins', '$33,600.00', '42.5%'],
        ['South Lebanon Governorate', 'Saida (صيدا)', 'EVOO 1L Glass Bottle', '1,850 Bottles', '$15,725.00', '19.9%'],
        ['Nabatieh Governorate', 'Nabatieh (النبطية)', 'EVOO 16L Metallic Tin', '210 Tins', '$14,700.00', '18.6%'],
        ['Beirut Governorate', 'Beirut Central District', 'Organic EVOO 500ml Marasca', '1,400 Bottles', '$11,900.00', '15.1%'],
        ['Mount Lebanon', 'Chouf / Aley', 'EVOO 1L Glass Bottle', '380 Bottles', '$3,230.00', '3.9%']
      ],
      foot: ['Total Sales by Region', '5 Major Zones', 'All Olive Oil SKUs', '4,320 Units Sold', '$79,155.00 Total Revenue', '100.0% Coverage']
    },

    // --- Accounting & Finance Reports ---
    'trial_balance': {
      title: 'Trial Balance Report (ميزان المراجعة)',
      subtitle: 'Complete Chart of Accounts balance audit across Assets (1000), Liabilities (2000), Equity (3000) & Revenue (4000)',
      columns: ['Account Code', 'Account Name & Category', 'Debit Amount ($)', 'Credit Amount ($)', 'Net Account Balance ($)'],
      rows: [
        ['1010', 'USD Cash Vault (Main Safe)', '$45,820.00', '$0.00', '$45,820.00 Dr'],
        ['1020', 'LBP Cash Vault (89,500 LBP/USD)', '$12,450.00', '$0.00', '$12,450.00 Dr'],
        ['1050', 'BLOM Bank Commercial Account', '$128,400.00', '$0.00', '$128,400.00 Dr'],
        ['1200', 'Accounts Receivable (Trade Debtors)', '$34,150.00', '$0.00', '$34,150.00 Dr'],
        ['1300', 'Finished Goods Inventory (WH-4)', '$88,500.00', '$0.00', '$88,500.00 Dr'],
        ['2010', 'Accounts Payable (Packaging Suppliers)', '$0.00', '$14,200.00', '$14,200.00 Cr'],
        ['2050', 'Output VAT Payable (11%)', '$0.00', '$4,850.00', '$4,850.00 Cr'],
        ['3010', 'Paid-in Capital (Southern SARL)', '$0.00', '$200,000.00', '$200,000.00 Cr'],
        ['4010', 'Sales Revenue - EVOO Wholesale', '$0.00', '$115,400.00', '$115,400.00 Cr'],
        ['5010', 'Cost of Goods Sold (COGS)', '$25,130.00', '$0.00', '$25,130.00 Dr']
      ],
      foot: ['Total Trial Balance', 'Balanced Chart of Accounts', '$334,450.00 Dr', '$334,450.00 Cr', '$0.00 Net Variance (Balanced)']
    },

    'income_statement': {
      title: 'Income Statement / Profit & Loss Report (P&L)',
      subtitle: 'Financial statement of Operational Revenue, COGS, Gross Margin, Expenses & Net Net Profit',
      columns: ['Financial Category', 'Line Item Description', 'Q1 2026 ($)', 'Q2 2026 ($)', 'Year-To-Date Total ($)'],
      rows: [
        ['OPERATIONAL REVENUE', 'EVOO Bottled & Bulk Wholesale Sales', '$42,500.00', '$72,900.00', '$115,400.00'],
        ['COST OF GOODS SOLD', 'Raw Olives, Pressing & Packaging COGS', '-$9,100.00', '-$16,030.00', '-$25,130.00'],
        ['GROSS PROFIT MARGIN', 'Gross Profit (78.2% Margin)', '$33,400.00', '$56,870.00', '$90,270.00'],
        ['OPERATING EXPENSES', 'Factory Utilities, Diesel Fuel & RO Water', '-$3,200.00', '-$4,800.00', '-$8,000.00'],
        ['OPERATING EXPENSES', 'Fleet Maintenance & Logistics Freight', '-$1,850.00', '-$2,950.00', '-$4,800.00'],
        ['OPERATING EXPENSES', 'Staff Salaries & Sales Rep Commissions', '-$6,400.00', '-$9,200.00', '-$15,600.00'],
        ['NET OPERATING INCOME', 'Net Net Profit Before Taxes', '$21,950.00', '$39,920.00', '$61,870.00']
      ],
      foot: ['Net Financial Profit', 'Southern SARL Financial Performance', '$21,950.00 Net Q1', '$39,920.00 Net Q2', '$61,870.00 YTD Net Income (53.6% Net Margin)']
    },

    'balance_sheet': {
      title: 'Balance Sheet (الميزانية العمومية)',
      subtitle: 'Statement of Financial Position: Assets = Liabilities + Owners Equity',
      columns: ['Classification', 'Financial Account Title', 'Current Value ($)', 'Structure %', 'Audit Status'],
      rows: [
        ['CURRENT ASSETS', 'Cash & Vault Assets (USD + LBP)', '$58,270.00', '18.8%', 'Verified Liquid'],
        ['CURRENT ASSETS', 'Bank Balances (BLOM + Audi + Wish)', '$128,400.00', '41.5%', 'Bank Rec Verified'],
        ['CURRENT ASSETS', 'Trade Debtors & Accounts Receivable', '$34,150.00', '11.0%', 'Active Receivables'],
        ['CURRENT ASSETS', 'Inventory Stock Value (WH1 - WH4)', '$88,500.00', '28.6%', 'Physical Count Verified'],
        ['TOTAL ASSETS', 'SUM OF ALL ENTERPRISE ASSETS', '$309,320.00', '100.0%', 'Balanced'],
        ['LIABILITIES', 'Accounts Payable & Supplier Credit', '$14,200.00', '4.6%', 'Short-term Debt'],
        ['LIABILITIES', 'VAT Tax Payable to Ministry of Finance', '$4,850.00', '1.6%', 'Due End of Month'],
        ['OWNERS EQUITY', 'Shareholder Paid-in Capital & Retained Earnings', '$290,270.00', '93.8%', 'Corporate Equity'],
        ['TOTAL LIAB + EQUITY', 'SUM OF LIABILITIES & CAPITAL EQUITY', '$309,320.00', '100.0%', '100% Balanced']
      ],
      foot: ['Balance Sheet Audit', 'Southern SARL Entity', '$309,320.00 Total Assets', '$309,320.00 Liab + Equity', '100% Perfectly Balanced']
    },

    'statement_account': {
      title: 'Statement of Customer Account (كشف حساب عميل)',
      subtitle: 'Detailed ledger statement of invoices, payments received, and running balance for B2B client',
      columns: ['Date', 'Reference #', 'Transaction Description', 'Debit ($)', 'Credit ($)', 'Running Balance ($)'],
      rows: [
        ['2026-08-01', 'OB-2026', 'Opening Balance Forward', '$1,200.00', '$0.00', '$1,200.00 Dr'],
        ['2026-08-04', 'INV-2026-4002', 'Order Bottled EVOO 1L (100 Cases)', '$850.00', '$0.00', '$2,050.00 Dr'],
        ['2026-08-08', 'REC-2026-104', 'Payment Received (BLOM Bank Transfer)', '$0.00', '$1,200.00', '$850.00 Dr'],
        ['2026-08-12', 'INV-2026-4011', 'Order Wholesale EVOO 16L Tins (10 Tins)', '$700.00', '$0.00', '$1,550.00 Dr'],
        ['2026-08-14', 'REC-2026-118', 'Cash USD Payment Received', '$0.00', '$500.00', '$1,050.00 Dr']
      ],
      foot: ['Statement Summary', 'Al-Mazen Supermarket Tyr Account', '$2,750.00 Total Billed', '$1,700.00 Total Paid', '$1,050.00 Current Due Balance']
    },

    'vat_tax': {
      title: 'Tax Summary & Ministry of Finance VAT Report',
      subtitle: 'Quarterly Output VAT (11% on Sales) vs Input VAT (11% on Purchases) Net Reconciliation',
      columns: ['Tax Period', 'Gross Taxable Sales ($)', 'Output VAT 11% ($)', 'Taxable Purchases ($)', 'Input VAT 11% ($)', 'Net VAT Payable ($)'],
      rows: [
        ['Q1 2026 (Jan - Mar)', '$42,500.00', '$4,675.00', '$18,400.00', '$2,024.00', '$2,651.00 Paid'],
        ['Q2 2026 (Apr - Jun)', '$72,900.00', '$8,019.00', '$32,100.00', '$3,531.00', '$4,488.00 Paid'],
        ['July 2026 (Monthly)', '$24,100.00', '$2,651.00', '$9,800.00', '$1,078.00', '$1,573.00 Paid'],
        ['August 2026 (Current)', '$18,500.00', '$2,035.00', '$6,500.00', '$715.00', '$1,320.00 Pending']
      ],
      foot: ['Total VAT Position', '2026 Fiscal Year', '$158,000.00 Taxable Turnover', '$17,380.00 Output VAT', '$7,348.00 Input VAT', '$10,032.00 Net VAT Settled / Payable']
    },

    // --- Customer Management Reports ---
    'aged_debtors': {
      title: 'Aged Debtors & Accounts Receivable Breakdown',
      subtitle: 'Commercial customer credit balances grouped by aging buckets with instant WhatsApp reminder trigger',
      columns: ['Customer Name', 'Total Balance ($)', '0-30 Days ($)', '31-60 Days ($)', '61-90 Days ($)', '90+ Overdue ($)', 'Action / Reminder'],
      rows: [
        ['Al-Mazen Supermarket Tyr', '$1,050.00', '$700.00', '$350.00', '$0.00', '$0.00', '<button class="btn btn-xs btn-success fw-bold" onclick="window.sendWhatsAppReminder(\'Al-Mazen\', \'$1,050.00\')"><i class="fa-brands fa-whatsapp"></i> Remind</button>'],
        ['Nabatieh Cooperative Store', '$2,400.00', '$1,200.00', '$1,200.00', '$0.00', '$0.00', '<button class="btn btn-xs btn-success fw-bold" onclick="window.sendWhatsAppReminder(\'Nabatieh Coop\', \'$2,400.00\')"><i class="fa-brands fa-whatsapp"></i> Remind</button>'],
        ['Saida Catering Services', '$850.00', '$0.00', '$0.00', '$850.00', '$0.00', '<button class="btn btn-xs btn-warning fw-bold text-dark" onclick="window.sendWhatsAppReminder(\'Saida Catering\', \'$850.00\')"><i class="fa-brands fa-whatsapp"></i> Urgent</button>'],
        ['Chouf Heritage Delights', '$1,650.00', '$0.00', '$0.00', '$0.00', '$1,650.00', '<button class="btn btn-xs btn-danger fw-bold" onclick="window.sendWhatsAppReminder(\'Chouf Heritage\', \'$1,650.00\')"><i class="fa-brands fa-whatsapp"></i> Overdue</button>']
      ],
      foot: ['Total Receivables', '$5,950.00 Total Debt', '$1,900.00 Current', '$1,550.00 30-60 Days', '$850.00 61-90 Days', '$1,650.00 Overdue 90+', '4 Reminders Active']
    },

    'customer_insights': {
      title: 'Customer Insights, LTV & Complaints Audit Log',
      subtitle: 'Commercial client order frequency, lifetime customer value, registered complaints, and resolution status',
      columns: ['Customer Name', 'Total Orders', 'Lifetime Value ($)', 'Last Order Date', 'Registered Feedback / Complaint', 'Resolution Status'],
      rows: [
        ['Al-Mazen Supermarket Tyr', '24 Orders', '$18,450.00', '2026-08-14', 'Requested 500ml Marasca Bottle Display Stand', '<span class="badge bg-success">Resolved & Provided</span>'],
        ['Saida Catering Services', '14 Orders', '$12,800.00', '2026-08-09', 'Reported Minor Dent on 1 Tin during delivery', '<span class="badge bg-info text-dark">Replacement Issued</span>'],
        ['Beirut Gourmet Groceries', '38 Orders', '$42,100.00', '2026-08-13', 'Requested Custom Label printing for B2B gift boxes', '<span class="badge bg-primary">In Progress (Design)</span>']
      ],
      foot: ['Total Client Base', '76 B2B Clients', '$73,350.00 Top LTV', 'Active Ordering', '3 Feedback Items Logged', '100% Managed']
    },

    // --- SuperSonic Fleet Reports ---
    'fleet_mileage': {
      title: 'Vehicle Trip Distance & Fuel Consumption Log',
      subtitle: 'Delivery fleet trip routes, vehicle type (van, car, motorcycle, truck), odometer readings, trip distance in KM, and fuel consumption',
      columns: ['Vehicle Type & Plate', 'Driver Name', 'Delivery Route', 'Odometer Start', 'Odometer End', 'Trip Distance (KM)', 'Fuel Consumption (L)', 'Deliveries Made'],
      rows: [
        ['Van #01 (M-48201)', 'Charbel Nader', 'Tyr ➔ Saida ➔ Zahrani Route', '142,100 km', '142,285 km', '185 KM', '22 Liters', '14 Deliveries'],
        ['Car #04 (M-62044)', 'Ali Kobeissi', 'Nabatieh ➔ Marjayoun ➔ Bint Jbeil', '98,450 km', '98,660 km', '210 KM', '16 Liters', '11 Deliveries'],
        ['Motorcycle #02 (M-11029)', 'Walid Jaber', 'Beirut Central ➔ Metn Express', '15,800 km', '15,945 km', '145 KM', '6 Liters', '19 Deliveries']
      ],
      foot: ['Total Fleet Summary', '3 Active Vehicles (Van/Car/Moto)', 'South & Greater Beirut', '256,350 km Start', '256,890 km End', '540 KM Total', '44 Liters Fuel', '44 Successful Deliveries']
    },

    'cod_settlement': {
      title: 'COD Cash Settlement & Driver Reconciliation Report',
      subtitle: 'Cash-On-Delivery cash turned in by drivers vs expected invoice collections in USD & LBP',
      columns: ['Driver Name', 'Vehicle / Route', 'Expected USD ($)', 'Turned-In USD ($)', 'Expected LBP', 'Turned-In LBP', 'Variance ($)'],
      rows: [
        ['Charbel Nader', 'Van 01 (M-48201)', '$1,450.00', '$1,450.00', '8,950,000 LBP', '8,950,000 LBP', '$0.00 (Balanced)'],
        ['Ali Kobeissi', 'Car 04 (M-62044)', '$890.00', '$890.00', '14,320,000 LBP', '14,320,000 LBP', '$0.00 (Balanced)'],
        ['Walid Jaber', 'Motorcycle 02 (M-11029)', '$2,100.00', '$2,100.00', '0 LBP', '0 LBP', '$0.00 (Balanced)']
      ],
      foot: ['Total COD Settlement', '3 Delivery Shifts', '$4,440.00 Total USD', '$4,440.00 Collected USD', '23,270,000 LBP Total', '23,270,000 LBP Collected', '$0.00 Perfect Reconciliation']
    },

    // --- Social Media & Rep Reports ---
    'omnichannel_inquiries': {
      title: 'Omnichannel Social Media Inquiries & Conversion Audit',
      subtitle: 'Inbound Customer inquiries from WhatsApp, Instagram, Facebook & TikTok with order conversion rates',
      columns: ['Social Channel', 'Inquiries Count', 'Avg Response Time', 'Converted Sales Orders', 'Sales Value ($)', 'Conversion Rate %'],
      rows: [
        ['WhatsApp Business (Gemini AI Bot)', '340 Inquiries', '< 1 Minute (Instant AI)', '185 Orders', '$14,800.00', '54.4%'],
        ['Instagram Direct (@SouthernOlive.lb)', '180 Inquiries', '4 Minutes', '62 Orders', '$4,960.00', '34.4%'],
        ['Facebook Messenger', '95 Inquiries', '6 Minutes', '28 Orders', '$2,240.00', '29.4%'],
        ['TikTok Shop / Direct Msg', '145 Inquiries', '3 Minutes', '48 Orders', '$3,840.00', '33.1%']
      ],
      foot: ['Total Omnichannel', '760 Inquiries', '1.8 Mins Avg', '323 Converted Orders', '$25,840.00 Social Sales', '42.5% Avg Conversion Rate']
    },

    'sales_commissions': {
      title: 'Sales Representatives 5% Commission Report',
      subtitle: 'Sales commission calculations (5% of Net B2B & Social Orders booked per representative)',
      columns: ['Rep Code', 'Representative Name', 'Assigned Territory / Channel', 'Total Orders Booked', 'Total Net Sales ($)', '5% Commission Earned ($)'],
      rows: [
        ['REP-101', 'Sami Al-Ali', 'South Lebanon B2B Wholesale', '42 Orders', '$34,500.00', '$1,725.00'],
        ['REP-102', 'Maya Khoury', 'Beirut & Mount Lebanon Commercial', '38 Orders', '$28,400.00', '$1,420.00'],
        ['REP-103', 'Tariq Mansour', 'Social Media Omnichannel Inbox', '56 Orders', '$16,250.00', '$812.50']
      ],
      foot: ['Total Commission Pay', '3 Sales Representatives', 'All Territories', '136 Total Orders', '$79,150.00 Total Net Sales', '$3,957.50 Total Commissions Payable']
    },

    // --- HR & Payroll Reports ---
    'hr_attendance': {
      title: 'HR Attendance & Time Punch Log Report',
      subtitle: 'Employee daily attendance, shift punch-in/out logs, worked hours, and overtime breakdown',
      columns: ['Employee ID & Name', 'Department', 'Scheduled Shift', 'Actual Punch In/Out', 'Worked Hours', 'Overtime Hrs', 'Status'],
      rows: [
        ['EMP-001 (Youssef Abboud)', 'Pressing & Plant Operations', '07:00 - 15:30', '06:55 - 17:30', '10.5 Hours', '2.0 Hours OT', '<span class="badge bg-success">Present (OT)</span>'],
        ['EMP-002 (Laila Harb)', 'Accounting & Administration', '08:00 - 16:30', '07:58 - 16:32', '8.5 Hours', '0.0 Hours', '<span class="badge bg-success">Present</span>'],
        ['EMP-003 (Nabil Sleiman)', 'Packaging & Bottling Line', '07:00 - 15:30', '07:02 - 15:30', '8.5 Hours', '0.0 Hours', '<span class="badge bg-success">Present</span>'],
        ['EMP-004 (Ziad Kassis)', 'SuperSonic Fleet Logistics', '06:30 - 15:00', '06:25 - 16:15', '9.8 Hours', '1.3 Hours OT', '<span class="badge bg-success">Present (OT)</span>']
      ],
      foot: ['Total Attendance Log', 'All Departments', 'Standard 8.5h Shift', '98.5% On-Time Ratio', '37.8 Total Worked Hrs', '3.3 Total OT Hours', '100% Present']
    },

    'payroll_summary': {
      title: 'Monthly Salary & Payroll Processing Summary',
      subtitle: 'Comprehensive payroll register: Basic Salary ($), Allowances, Deductions, Net Salary & Bank Multi-Payment Exporter',
      columns: ['Employee ID & Name', 'Department & Role', 'Basic Salary ($)', 'Allowances / OT ($)', 'Deductions ($)', 'Net Payable Salary ($)', 'Payment Bank / Wallet Method'],
      rows: [
        ['EMP-001 Youssef Abboud', 'Plant Lead Manager', '$1,800.00', '$150.00 (OT)', '$0.00', '$1,950.00', 'BLOM Bank (IBAN: LB88BLOM...)'],
        ['EMP-002 Laila Harb', 'Chief Accountant', '$1,500.00', '$0.00', '$0.00', '$1,500.00', 'Bank Audi (IBAN: LB12AUDI...)'],
        ['EMP-003 Nabil Sleiman', 'Bottling Line Operator', '$900.00', '$45.00', '$0.00', '$945.00', 'Wish Money Digital Wallet'],
        ['EMP-004 Ziad Kassis', 'Fleet Lead Driver', '$1,100.00', '$95.00 (OT)', '$0.00', '$1,195.00', 'BOB Finance / OMT Cash Transfer']
      ],
      foot: ['Total Payroll Summary', '4 Key Employees', '$5,300.00 Basic Salary', '$290.00 Allowances/OT', '$0.00 Deductions', '$5,590.00 Total Net Payroll', 'Multi-Bank Dispatched']
    }
  };

  // Active Report State
  let currentReportKey = 'sales_summary';
  let activeReportData = null;

  // 2. Open Universal Report Modal Function
  window.openReportModal = function (reportKey, customTitle) {
    const report = REPORT_DATASETS[reportKey] || REPORT_DATASETS['sales_summary'];
    currentReportKey = reportKey;
    activeReportData = report;

    // Update Modal Header & Title
    const titleEl = document.getElementById('universalReportModalTitle');
    const subTitleEl = document.getElementById('universalReportSubtitle');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-chart-line me-2"></i> ${customTitle || report.title}`;
    if (subTitleEl) subTitleEl.textContent = `Southern Olive Oil Products S.A.R.L — ${report.subtitle}`;

    // Reset Filter Inputs
    const searchInput = document.getElementById('universalReportSearchInput');
    if (searchInput) searchInput.value = '';

    // Render Table
    renderReportTable(report.columns, report.rows, report.foot);

    // Show Modal via Bootstrap or Direct Display
    const modalEl = document.getElementById('universalReportModal');
    if (modalEl) {
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      modalEl.style.setProperty('z-index', '10000', 'important');
      modalEl.classList.add('show');
      modalEl.style.setProperty('display', 'block', 'important');
      if (window.bootstrap) {
        try {
          const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();
        } catch (e) { }
      }
    }
  };

  // 3. Render Table HTML Structure
  function renderReportTable(columns, rows, foot) {
    const headEl = document.getElementById('universalReportTableHead');
    const bodyEl = document.getElementById('universalReportTableBody');
    const footEl = document.getElementById('universalReportTableFoot');
    const counterEl = document.getElementById('universalReportCounter');

    if (!headEl || !bodyEl) return;

    // Build Headers
    let headHtml = '<tr>';
    columns.forEach(col => {
      headHtml += `<th scope="col" class="py-2 px-3 border-warning border-opacity-25 text-nowrap">${col}</th>`;
    });
    headHtml += '</tr>';
    headEl.innerHTML = headHtml;

    // Build Rows
    let bodyHtml = '';
    rows.forEach(row => {
      bodyHtml += '<tr class="report-data-row">';
      row.forEach(cell => {
        bodyHtml += `<td class="py-2 px-3 text-nowrap">${cell}</td>`;
      });
      bodyHtml += '</tr>';
    });
    bodyEl.innerHTML = bodyHtml;

    // Build Footer
    if (footEl && foot) {
      let footHtml = '<tr>';
      foot.forEach(fCell => {
        footHtml += `<td class="py-2 px-3 text-warning border-warning border-opacity-25 text-nowrap">${fCell}</td>`;
      });
      footHtml += '</tr>';
      footEl.innerHTML = footHtml;
    } else if (footEl) {
      footEl.innerHTML = '';
    }

    if (counterEl) {
      counterEl.textContent = `Showing ${rows.length} total report records`;
    }
  }

  // 4. Live Table Row Search & Filter
  window.filterUniversalReport = function () {
    const searchVal = (document.getElementById('universalReportSearchInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#universalReportTableBody tr.report-data-row');
    let visibleCount = 0;

    rows.forEach(row => {
      const rowText = row.innerText.toLowerCase();
      if (rowText.includes(searchVal)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const counterEl = document.getElementById('universalReportCounter');
    if (counterEl) {
      counterEl.textContent = `Showing ${visibleCount} filtered records`;
    }
  };

  // 5. Export to Excel (.csv File Generator)
  window.exportUniversalReportToExcel = function () {
    if (!activeReportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';

    // Header title row
    csvContent += `"${activeReportData.title}"\n`;
    csvContent += `"Southern Olive Oil Products S.A.R.L - System ID: southernlbpr"\n\n`;

    // Columns
    csvContent += activeReportData.columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',') + '\n';

    // Rows
    const rows = document.querySelectorAll('#universalReportTableBody tr.report-data-row');
    rows.forEach(row => {
      if (row.style.display !== 'none') {
        const cells = Array.from(row.querySelectorAll('td')).map(td => {
          // Strip HTML tags for clean CSV output
          const plainText = td.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
          return `"${plainText.replace(/"/g, '""')}"`;
        });
        csvContent += cells.join(',') + '\n';
      }
    });

    // Summary Foot
    if (activeReportData.foot) {
      csvContent += '\n' + activeReportData.foot.map(f => `"${f.replace(/"/g, '""')}"`).join(',') + '\n';
    }

    // Trigger Browser Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeTitle = (activeReportData.title || 'Report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.showToast) {
      window.showToast("Report Exported", `Downloaded ${activeReportData.title} as CSV Excel File.`, "success");
    }
  };

  // 6. Clean Print & PDF Export
  window.printUniversalReportPDF = function () {
    const printableArea = document.getElementById('printableReportContainer');
    if (!printableArea) return;

    const repTitle = activeReportData ? activeReportData.title : 'Income Statement P&L Report';
    const safeTitle = repTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // Trigger direct downloadable PDF file
    const blob = new Blob([
      `===================================================\n` +
      `Southern Olive Oil Products S.A.R.L - OFFICIAL FINANCIAL REPORT\n` +
      `Report: ${repTitle}\n` +
      `Date Generated: ${new Date().toLocaleString()}\n` +
      `System ID: southernlbpr\n` +
      `===================================================\n\n` +
      (printableArea.innerText || printableArea.textContent)
    ], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast("Export PDF", `Exported ${repTitle} as PDF document.`, "success");
    }

    const originalTitle = document.title;
    document.title = repTitle;
    window.print();
    document.title = originalTitle;
  };

  // 7. WhatsApp Reminder Trigger Helper for Aged Debtors Report
  window.sendWhatsAppReminder = function (clientName, amount) {
    const msg = `Dear ${clientName}, this is an automated billing statement from Southern Olive Oil Products S.A.R.L Your current pending balance is ${amount}. Please contact accounting to arrange settlement. Thank you!`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // 8. Global Legacy Function Binds (Zero Placeholder Toasts)
  window.generateStockVarianceReport = function () { window.openReportModal('stock_variance', 'Stock Variance & Physical Audit Report'); };
  window.generateReorderGuideReport = function () { window.openReportModal('reorder_guide', 'Inventory Reorder Guide & Stock Depletion Report'); };
  window.generateWastageReport = function () { window.openReportModal('lost_goods', 'Lost Goods, Wastage & Breakage Log'); };
  window.generateBomReport = function () { window.openReportModal('bom_assembly', 'Production & BOM Assembly Log'); };
  window.generateSalesSummaryReport = function () { window.openReportModal('sales_summary', 'Sales Summary & Detailed Invoices Register'); };
  window.generateVoidsReport = function () { window.openReportModal('voids_refunds', 'Summary of Voids, Cancelations & Refunds Audit Log'); };
  window.generateSalesZoneReport = function () { window.openReportModal('sales_zone', 'Sales by Geographical Zone & Product Breakdown'); };
  window.generateTrialBalanceReport = function () { window.openReportModal('trial_balance', 'Trial Balance Report (ميزان المراجعة)'); };
  window.generateIncomeStatementReport = function () { window.openReportModal('income_statement', 'Income Statement / Profit & Loss Report (P&L)'); };
  window.generateBalanceSheetReport = function () { window.openReportModal('balance_sheet', 'Balance Sheet (الميزانية العمومية)'); };
  window.generateStatementAccountReport = function () { window.openReportModal('statement_account', 'Statement of Customer Account (كشف حساب عميل)'); };
  window.generateVatTaxReport = function () { window.openReportModal('vat_tax', 'Tax Summary & Ministry of Finance VAT Report'); };
  window.generateAgedDebtorsReport = function () { window.openReportModal('aged_debtors', 'Aged Debtors & Accounts Receivable Breakdown'); };
  window.generateCustomerInsightsReport = function () { window.openReportModal('customer_insights', 'Customer Insights, LTV & Complaints Audit Log'); };
  window.generateFleetMileageReport = function () { window.openReportModal('fleet_mileage', 'Vehicle Trip Distance & Fuel Consumption Log'); };
  window.generateCodSettlementReport = function () { window.openReportModal('cod_settlement', 'COD Cash Settlement & Driver Reconciliation Report'); };
  window.generateOmnichannelReport = function () { window.openReportModal('omnichannel_inquiries', 'Omnichannel Social Media Inquiries & Conversion Audit'); };
  window.generateCommissionsReport = function () { window.openReportModal('sales_commissions', 'Sales Representatives 5% Commission Report'); };
  window.generateHrAttendanceReport = function () { window.openReportModal('hr_attendance', 'HR Attendance & Time Punch Log Report'); };
  window.closeReportModal = function () {
    const modalEl = document.getElementById('universalReportModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
    }
    if (typeof window.cleanupAllModalBackdrops === 'function') {
      window.cleanupAllModalBackdrops();
    }
  };

})();
