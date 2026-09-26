'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Search,
  Plus,
  Trash2,
  Save,
  Check,
  Calendar as CalendarIcon,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Unlock,
  Upload,
  RotateCcw,
  Sliders,
  Settings,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  User,
  Users,
  Building2,
  Percent,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Download,
  Send,
  ZoomIn,
  ZoomOut,
  Menu,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import DatePickerInput from './DatePickerInput';
import { OMEGA_SALES_ITEMS, SalesItem } from '@/app/backoffice/operations/SalesView';
import { CRMContact, INITIAL_CONTACTS as INITIAL_CRM_CONTACTS } from './ContactsView';

export interface QuotationItem {
  id: string;
  item: SalesItem;
  qty: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export interface QuotationRecord {
  id: string;
  quotationNo: string;
  customerType: 'Customer' | 'Contact';
  customerName: string;
  customerId?: string;
  contactPerson?: string;
  phone?: string;
  branch: string;
  date: string;
  deliveryDate: string;
  currency: 'USD' | 'EUR' | 'LBP';
  source: string;
  notes: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotalUSD: number;
  grandTotalLL: number;
  isTaxEnabled: boolean;
  salesman: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted' | 'Cancelled';
  createdAt: string;
}

// Initial sample quotations
export const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'QT-001',
    quotationNo: 'QT-2026-0042',
    customerType: 'Customer',
    customerName: 'Abou Hamzeh Nuts',
    customerId: '31',
    phone: '+961 70 123 456',
    branch: 'Zeit w zaytoun ljanoub',
    date: '08-Sep-2026',
    deliveryDate: '15-Sep-2026',
    currency: 'USD',
    source: 'WhatsApp / Social CRM',
    notes: 'Payment within 15 days upon delivery. Special seasonal price offer.',
    items: [
      {
        id: 'CACV250MLB103-1',
        item: OMEGA_SALES_ITEMS[1], // خل تفاح 250مل
        qty: 24,
        unitPrice: 0.50,
        discountPercent: 0,
        total: 12.00
      },
      {
        id: 'PGM250MLB103-1',
        item: OMEGA_SALES_ITEMS[6], // دبس رمان 250 مل
        qty: 12,
        unitPrice: 0.67,
        discountPercent: 0,
        total: 8.04
      }
    ],
    subtotal: 20.04,
    discountAmount: 0,
    taxAmount: 0,
    grandTotalUSD: 20.04,
    grandTotalLL: 1793580,
    isTaxEnabled: false,
    salesman: 'Hiba Aloulou',
    status: 'Sent',
    createdAt: '08-Sep-2026 10:15 AM'
  },
  {
    id: 'QT-002',
    quotationNo: 'QT-2026-0041',
    customerType: 'Customer',
    customerName: 'Supermarket Al-Nour',
    customerId: '14',
    phone: '+961 03 987 654',
    branch: 'Zeit w zaytoun ljanoub',
    date: '05-Sep-2026',
    deliveryDate: '12-Sep-2026',
    currency: 'USD',
    source: 'Direct Walk-in',
    notes: 'Bulk retail quotation with wholesale discount.',
    items: [
      {
        id: 'OACV250MLB103-1',
        item: OMEGA_SALES_ITEMS[2], // خل تفاح بلدي 250مل
        qty: 50,
        unitPrice: 1.11,
        discountPercent: 5,
        total: 52.72
      }
    ],
    subtotal: 55.50,
    discountAmount: 2.78,
    taxAmount: 0,
    grandTotalUSD: 52.72,
    grandTotalLL: 4718440,
    isTaxEnabled: false,
    salesman: 'Mahdi',
    status: 'Approved',
    createdAt: '05-Sep-2026 14:30 PM'
  }
];

export const SAMPLE_CUSTOMERS = [
  { id: '9', name: 'Mohammed Chami', phone: '78851503', address: 'Lebanon' },
  { id: '31', name: 'Abou Hamzeh Nuts', phone: '+961 70 123 456', address: 'Saida, Lebanon' },
  { id: '14', name: 'Supermarket Al-Nour', phone: '+961 03 987 654', address: 'Nabatieh, Lebanon' },
  { id: '88', name: 'Beirut Gourmet Co.', phone: '+961 01 234 567', address: 'Achrafieh, Beirut' },
  { id: '05', name: 'Jabal Amel Co-op', phone: '+961 07 765 432', address: 'Tyre, South Lebanon' }
];

export const BRANCH_OPTIONS = [
  'Zeit w zaytoun ljanoub',
  'Beirut Main Branch',
  'Sidon Regional Hub',
  'Tripoli Distribution'
];

export const SOURCE_OPTIONS = [
  'Select Source',
  'Direct Walk-in',
  'Phone Call',
  'WhatsApp / Social CRM',
  'Field Sales Agent',
  'Website / Email Inquiry',
  'Referral / Word of mouth'
];

export const PAYMENT_OPTIONS = [
  'CASH USD',
  'CASH',
  'CASH LBP',
  'Credit',
  'Credit Card',
  'Credit Card USD'
];

export const SALESMAN_OPTIONS = [
  'Mahdi',
  'HUSSEIN',
  'Ricky',
  'Nour Yazbeck',
  'Hussien Mahdi',
  'Hiba Aloulou'
];

export const DEPARTMENT_OPTIONS = [
  'Showroom',
  'Delivery',
  'Main Department'
];

export const COMPANY_EMAIL_OPTIONS = [
  'sales@southernolive-lb.com',
  'zeit.zaytoun.ljanoub@gmail.com',
  'info@southernolive-lb.com',
  'orders@vanguard-erp.com',
  'billing@southernolive-lb.com'
];

export function numberToEnglishWords(num: number): string {
  if (num === 0) return 'Zero';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    return n.toString();
  };

  return convert(Math.floor(num));
}

export const PRINTER_TYPE_OPTIONS = [
  'A4',
  '80mm'
];

export const PRINT_ON_SAVE_OPTIONS = [
  'Ask After Save',
  'Open Report Automatically',
  'Never'
];

export const SELLING_PRICE_OPTIONS = [
  'Selling Price 1',
  'Selling Price 2',
  'Selling Price 3',
  'Selling Price 4'
];

export const PAPER_SIZE_OPTIONS = [
  'Letter',
  'Legal',
  'A4',
  'A5',
  'Employment 10',
  'Envelope #10',
  'Envelope DL',
  'Envelope C5',
  'Envelope C6',
  'Japanese Postcard',
  'A6',
  'Japanese Envelope Chou 3',
  'Oficio 8.5 x 13 in',
  '4.6 in. x 5.7 in.',
  'Oficio 216 x 340 mm'
];

export const PAGES_PER_SHEET_OPTIONS = [1, 2, 4, 6, 9, 16];

export const SCALE_OPTIONS = ['Default', 'Fit to printable area', 'Fit to paper', 'Custom'];

export const SYSTEM_PRINTERS = [
  { name: 'HP LaserJet MFP M139-M142', isDefault: true },
  { name: 'Microsoft Print to PDF', isDefault: false },
  { name: 'Fax', isDefault: false },
  { name: 'Microsoft XPS Document Writer', isDefault: false },
  { name: 'OneNote (Desktop)', isDefault: false },
  { name: 'OneNote for Windows 10', isDefault: false }
];

export function downloadQuotationPdfFile(doc: QuotationRecord, customFilename?: string) {
  const filename = customFilename
    ? (customFilename.toLowerCase().endsWith('.pdf') ? customFilename : `${customFilename}.pdf`)
    : `Quotation_${doc.quotationNo || 'Report'}.pdf`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    @page { size: auto; margin: 12mm 10mm 12mm 10mm; }
    .print-landscape { page-orientation: landscape; }
    .print-portrait { page-orientation: portrait; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; padding: 20px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
    .doc-title { font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #0f172a; }
    .branch-name { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px; }
    .meta-box-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
    .meta-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #fafafa; }
    .meta-card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    th { background: #f1f5f9; border-bottom: 2px solid #0f172a; padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 700; color: #0f172a; }
    td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 12px; }
    .num { font-family: Consolas, monospace; }
    .total-box { margin-left: auto; width: 280px; border: 2px solid #0f172a; border-radius: 8px; padding: 14px; background: #fafafa; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0f172a; }
    .total-lbp { margin-top: 6px; font-size: 12px; color: #64748b; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="doc-title">{t('quotation', 'QUOTATION')}</div>
      <div class="branch-name">${doc.branch || 'Zeit w zaytoun ljanoub'}</div>
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div><strong>{t('quotation', 'Quotation #:')}</strong> <span class="num">${doc.quotationNo}</span></div>
      <div><strong>{t('date', 'Date:')}</strong> <span class="num">${doc.date}</span></div>
      <div><strong>{t('currency', 'Currency:')}</strong> <strong>${doc.currency}</strong></div>
    </div>
  </div>

  <div class="meta-box-grid">
    <div class="meta-card">
      <div class="meta-card-title">{t('quotation_to', 'Quotation To')}</div>
      <div><strong>{t('customer', 'Customer:')}</strong> ${doc.customerName || 'N/A'}</div>
      ${doc.phone ? `<div><strong>{t('phone', 'Phone:')}</strong> <span class="num">${doc.phone}</span></div>` : ''}
      ${doc.contactPerson ? `<div><strong>{t('contact', 'Contact:')}</strong> ${doc.contactPerson}</div>` : ''}
    </div>
    <div class="meta-card">
      <div class="meta-card-title">{t('order_information', 'Order Information')}</div>
      <div><strong>{t('delivery_date', 'Delivery Date:')}</strong> ${doc.deliveryDate || 'N/A'}</div>
      <div><strong>{t('source', 'Source:')}</strong> ${doc.source || 'N/A'}</div>
      <div><strong>{t('salesman', 'Salesman:')}</strong> ${doc.salesman || 'Mahdi'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px; text-align: center;">{t('qty', 'Qty')}</th>
        <th>{t('description', 'Description')}</th>
        <th style="width: 70px; text-align: center;">{t('unit', 'Unit')}</th>
        <th style="width: 100px; text-align: right;">{t('unit_price', 'Unit Price')}</th>
        <th style="width: 100px; text-align: right;">{t('total_price', 'Total Price')}</th>
      </tr>
    </thead>
    <tbody>
      ${doc.items.map(item => `
        <tr>
          <td style="text-align: center;" class="num"><strong>${item.qty}</strong></td>
          <td>${item.item?.name || 'Item'} ${item.item?.code ? `<span style="color:#64748b;font-size:11px;">(${item.item.code})</span>` : ''}</td>
          <td style="text-align: center;" class="num">${item.item?.unit || 'BOT'}</td>
          <td style="text-align: right;" class="num">${item.unitPrice.toFixed(2)} $</td>
          <td style="text-align: right;" class="num"><strong>${item.total.toFixed(2)} $</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>{t('grand_total', 'Grand Total:')}</span>
      <span class="num">${doc.grandTotalUSD.toFixed(2)} $</span>
    </div>
    <div class="total-lbp">
      {t('equivalent_lbp', 'Equivalent LBP:')} <span class="num">${doc.grandTotalLL.toLocaleString()} L.L.</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const DESKTOP_ITEMS_PRESET = [
  { name: '.tmp.driveupload', type: 'File folder', date: '02-Sep-26 7:30 PM', size: '' },
  { name: 'bank', type: 'File folder', date: '04-Jan-26 3:36 PM', size: '' },
  { name: 'Barcodes Eng Version', type: 'File folder', date: '24-Jun-26 5:49 PM', size: '' },
  { name: 'Barcodes for stickers', type: 'File folder', date: '18-Jul-26 12:43 PM', size: '' },
  { name: 'Coding', type: 'File folder', date: '02-Sep-26 3:22 PM', size: '' },
  { name: 'COMPANY PAPERS', type: 'File folder', date: '20-Jul-26 5:25 PM', size: '' },
  { name: 'dev', type: 'File folder', date: '25-Aug-26 12:47 PM', size: '' },
  { name: 'Diagnostic tool V1/026b', type: 'File folder', date: '11-Dec-25 10:36 AM', size: '' },
  { name: 'Drive', type: 'File folder', date: '16-May-26 2:46 PM', size: '' },
  { name: 'Excel', type: 'File folder', date: '30-Nov-25 1:40 PM', size: '' },
  { name: 'Items List', type: 'File folder', date: '09-Apr-26 10:49 AM', size: '' },
  { name: 'Legal Cases', type: 'File folder', date: '03-Jan-26 10:21 AM', size: '' },
  { name: 'Mixtures', type: 'File folder', date: '07-Apr-26 5:26 PM', size: '' },
  { name: 'New folder', type: 'File folder', date: '22-Jul-26 9:12 PM', size: '' },
  { name: 'ODb11gr2', type: 'File folder', date: '30-Jun-26 3:21 PM', size: '' },
  { name: 'Omega Software Reset', type: 'File folder', date: '24-Jun-26 5:51 PM', size: '' },
  { name: 'PDF Invoices', type: 'File folder', date: '05-Jun-26 4:40 PM', size: '' },
  { name: 'Quotations', type: 'File folder', date: '20-Feb-26 10:50 AM', size: '' },
  { name: 'Sales', type: 'File folder', date: '26-Jan-26 10:10 AM', size: '' },
  { name: 'Southern Olive and Oil Products', type: 'File folder', date: '25-Aug-26 12:46 PM', size: '' },
  { name: 'Stickers&Barcodes', type: 'File folder', date: '17-Aug-26 11:02 AM', size: '' },
  { name: 'sunflower', type: 'File folder', date: '03-Jan-26 10:26 AM', size: '' },
  { name: 'TMA', type: 'File folder', date: '03-Jan-26 10:24 AM', size: '' },
  { name: 'Weekly Salaries', type: 'File folder', date: '03-Jul-26 9:11 AM', size: '' },
  { name: 'فيلم Southern Olive Oil', type: 'File folder', date: '03-Jan-26 10:33 AM', size: '' },
  { name: 'Promotions', type: 'File folder', date: '06-Jul-26 2:57 PM', size: '' },
  { name: 'مشروع أهراء', type: 'File folder', date: '24-Jun-26 5:48 PM', size: '' },
  { name: 'معلومات يومية', type: 'File folder', date: '12-Apr-26 7:36 PM', size: '' },
  { name: 'Chair_Tai_Chi_Program', type: 'Microsoft Edge PDF Document', date: '03-Aug-26 12:47 PM', size: '51 KB' },
  { name: 'Hussein Daik Invoice_23', type: 'Microsoft Edge PDF Document', date: '18-Aug-26 2:23 PM', size: '117 KB' }
];

// Complete Hierarchical Catalog Tree for Categories, Divisions, and Groups
export const CATALOG_STRUCTURE: Record<
  'Retail' | 'Wholesale' | 'Promotions' | 'Raw Materials',
  Record<string, string[]>
> = {
  'Retail': {
    'مقطرات ومطيبات مفرق': [
      'مقطرات مفرق 250مل',
      'مقطرات ومطيبات غالون',
      'مقطرات مفرق 500مل',
      'مقطرات 1 ليتر'
    ],
    'مونة بلدية مفرق': [
      'مونة بلدية مفرق',
      'حبوب مكيسة',
      'أجبان و ألبان',
      'مكدوس وكشك'
    ],
    'مربيات مفرق': [
      'مربيات مفرق',
      'مرطبان 510',
      'دبس وخروب'
    ],
    'عسل مفرق': [
      'عسل سدر مفرق',
      'عسل زهور مفرق',
      'عسل جبلي'
    ],
    'فواكه مجففة مفرق': [
      'فواكه مجففة مفرق',
      'تين ومشمش مجفف'
    ],
    'بهارات وبودرات مفرق': [
      'بهارات غ',
      'علبة بهارات',
      'زعتر بلدي مفرق'
    ],
    'معجنات مفرق': [
      'معجنات مشكلة',
      'عجين بلدي'
    ]
  },
  'Wholesale': {
    'مقطرات ودبس جملة': [
      'مقطرات 250مل جملة',
      'مقطرات غالون جملة',
      'دبس رمان جملة'
    ],
    'زيوت جملة': [
      'زيت زيتون فرجين جملة',
      'زيت اوكراني دوار الشمس جملة',
      'زيت زيتون تنك 16L'
    ],
    'زيتون جملة': [
      'زيتون اخضر جملة',
      'زيتون اسود جملة',
      'مكبوس سطل 10KG'
    ],
    'مونة بلدية جملة': [
      'مونة بلدية جملة',
      'كشك جملة',
      'مكدوس جملة'
    ],
    'عسل جملة': [
      'عسل تنك جملة',
      'عسل كراتين جملة'
    ],
    'مربيات جملة': [
      'مربيات كراتين جملة',
      'مربيات سطل جملة'
    ]
  },
  'Promotions': {
    'عروض وتوفير': [
      'عرض التوفير العائلي',
      'باقة المونة الكاملة',
      'خصم الكميات'
    ],
    'باقات التوفير': [
      'باقة المونة الكاملة',
      'باقة المقطرات الاقتصادية'
    ],
    'عروض حصرية': [
      'عرض المواسم 2026',
      'اشتر 2 واحصل على 1'
    ],
    'عروض الجملة': [
      'عرض كبار التجار',
      'خصم الكميات الخاصة'
    ]
  },
  'Raw Materials': {
    'Bottles & Glass': [
      'Bottles 250ml',
      'Bottles 500ml',
      'Glass Jars'
    ],
    'Plastic': [
      'Plastic Gallon 4L',
      'Plastic Containers'
    ],
    'Jars': [
      'JAR 510g',
      'مرطبان 1KG'
    ],
    'مواد أولية وتعبئة': [
      'أغطية وسدادات',
      'كراتين شحن',
      'لصاقات وليبل',
      'Main materials'
    ]
  }
};

// Full authentic catalog items with Wholesale, Retail, Offers, and Raw Materials
export const ALL_CATALOG_ITEMS: SalesItem[] = [
  ...OMEGA_SALES_ITEMS,
  // Wholesale items
  {
    id: 'WHOLE-PGM-12',
    code: 'WHOLE-PGM-12',
    name: 'دبس رمان بلدي كرتونة 12 قنينة (250مل)',
    category: 'Wholesale',
    division: 'مقطرات ودبس جملة',
    group: 'دبس رمان جملة',
    unit: 'CRT',
    stockQty: 85,
    price: 6.80,
    cost: 4.80
  },
  {
    id: 'WHOLE-DIST-250',
    code: 'WHOLE-DIST-250',
    name: 'ماء زهر مقطر كرتونة 12 قنينة (250مل)',
    category: 'Wholesale',
    division: 'مقطرات ودبس جملة',
    group: 'مقطرات 250مل جملة',
    unit: 'CRT',
    stockQty: 110,
    price: 5.70,
    cost: 3.90
  },
  {
    id: 'WHOLE-ROSE-250',
    code: 'WHOLE-ROSE-250',
    name: 'ماء ورد مقطر كرتونة 12 قنينة (250مل)',
    category: 'Wholesale',
    division: 'مقطرات ودبس جملة',
    group: 'مقطرات 250مل جملة',
    unit: 'CRT',
    stockQty: 95,
    price: 5.70,
    cost: 3.90
  },
  {
    id: 'WHOLE-GAL-ORANGE',
    code: 'WHOLE-GAL-ORANGE',
    name: 'ماء زهر بلدي غالون جملة (4 ليتر)',
    category: 'Wholesale',
    division: 'مقطرات ودبس جملة',
    group: 'مقطرات غالون جملة',
    unit: 'GAL',
    stockQty: 50,
    price: 5.50,
    cost: 3.80
  },
  {
    id: 'WHOLE-GAL-ROSE',
    code: 'WHOLE-GAL-ROSE',
    name: 'ماء ورد بلدي غالون جملة (4 ليتر)',
    category: 'Wholesale',
    division: 'مقطرات ودبس جملة',
    group: 'مقطرات غالون جملة',
    unit: 'GAL',
    stockQty: 45,
    price: 5.50,
    cost: 3.80
  },
  {
    id: 'WHOLE-EVOO-12L',
    code: 'WHOLE-EVOO-12L',
    name: 'زيت زيتون بكر كرتونة 12 قنينة (1 ليتر)',
    category: 'Wholesale',
    division: 'زيوت جملة',
    group: 'زيت زيتون فرجين جملة',
    unit: 'CRT',
    stockQty: 75,
    price: 95.00,
    cost: 72.00
  },
  {
    id: 'SUN-OIL-4X5L',
    code: 'SUN-OIL-4X5L',
    name: 'زيت دوار الشمس اوكراني كرتونة 4 غالونات (5L)',
    category: 'Wholesale',
    division: 'زيوت جملة',
    group: 'زيت اوكراني دوار الشمس جملة',
    unit: 'CRT',
    stockQty: 60,
    price: 42.00,
    cost: 33.00
  },
  {
    id: 'WHOLE-KISHK-10K',
    code: 'WHOLE-KISHK-10K',
    name: 'كشك بلدي بقري صافي شوال 10 كغ',
    category: 'Wholesale',
    division: 'مونة بلدية جملة',
    group: 'كشك جملة',
    unit: 'BAG',
    stockQty: 30,
    price: 85.00,
    cost: 62.00
  },
  {
    id: 'MAKDOUS-5KG',
    code: 'MAKDOUS-5KG',
    name: 'مكدوس بلدي بالجوز والزيت سطل 5 كغ',
    category: 'Wholesale',
    division: 'مونة بلدية جملة',
    group: 'مكدوس جملة',
    unit: 'BUCKET',
    stockQty: 25,
    price: 35.00,
    cost: 26.00
  },
  {
    id: 'HONEY-SIDR-5KG',
    code: 'HONEY-SIDR-5KG',
    name: 'عسل سدر جبلي صافي سطل جملة 5 كغ',
    category: 'Wholesale',
    division: 'عسل جملة',
    group: 'عسل تنك جملة',
    unit: 'BUCKET',
    stockQty: 18,
    price: 120.00,
    cost: 95.00
  },
  {
    id: 'HONEY-FLW-12',
    code: 'HONEY-FLW-12',
    name: 'عسل زهور برية كرتونة 12 مرطبان (1 كغ)',
    category: 'Wholesale',
    division: 'عسل جملة',
    group: 'عسل كراتين جملة',
    unit: 'CRT',
    stockQty: 22,
    price: 90.00,
    cost: 70.00
  },
  {
    id: 'JAM-FIG-12',
    code: 'JAM-FIG-12',
    name: 'مربى تين بلدي كرتونة 12 مرطبان (450غ)',
    category: 'Wholesale',
    division: 'مربيات جملة',
    group: 'مربيات كراتين جملة',
    unit: 'CRT',
    stockQty: 40,
    price: 24.00,
    cost: 17.00
  },
  {
    id: 'JAM-APR-12',
    code: 'JAM-APR-12',
    name: 'مربى مشمش كرتونة 12 مرطبان (450غ)',
    category: 'Wholesale',
    division: 'مربيات جملة',
    group: 'مربيات كراتين جملة',
    unit: 'CRT',
    stockQty: 35,
    price: 22.00,
    cost: 15.50
  },
  // Offers
  {
    id: 'OFFER-COMBO-02',
    code: 'OFFER-COMBO-02',
    name: 'باقة المونة الشاملة: كشك + زيتون + زيت + مربى',
    category: 'Promotions',
    division: 'باقات التوفير',
    group: 'باقة المونة الكاملة',
    unit: 'PACK',
    stockQty: 40,
    price: 48.00,
    cost: 36.00
  },
  {
    id: 'OFFER-DIST-03',
    code: 'OFFER-DIST-03',
    name: 'باقة المقطرات الاقتصادية (3 غالونات مشكلة)',
    category: 'Promotions',
    division: 'باقات التوفير',
    group: 'باقة المقطرات الاقتصادية',
    unit: 'PACK',
    stockQty: 30,
    price: 16.50,
    cost: 12.00
  },
  // Raw materials
  {
    id: 'RAW-GLASS-500ML',
    code: 'RAW-GLASS-500ML',
    name: 'قناني زجاج فارغة 500 مل (كرتونة 40 قطعة)',
    category: 'Raw Materials',
    division: 'Bottles & Glass',
    group: 'Bottles 500ml',
    unit: 'CRT',
    stockQty: 150,
    price: 9.20,
    cost: 6.80
  },
  {
    id: 'RAW-PLAS-4L',
    code: 'RAW-PLAS-4L',
    name: 'غالونات بلاستيك فارغة 4 ليتر (ربطة 20 قطعة)',
    category: 'Raw Materials',
    division: 'Plastic',
    group: 'Plastic Gallon 4L',
    unit: 'BUNDLE',
    stockQty: 200,
    price: 7.00,
    cost: 5.00
  },
  {
    id: 'RAW-JAR-510G',
    code: 'RAW-JAR-510G',
    name: 'مرطبانات زجاج 510غ مع غطاء ذهبي (كرتونة 36 قطعة)',
    category: 'Raw Materials',
    division: 'Jars',
    group: 'JAR 510g',
    unit: 'CRT',
    stockQty: 120,
    price: 11.00,
    cost: 8.20
  },
  {
    id: 'RAW-CAPS-500',
    code: 'RAW-CAPS-500',
    name: 'أغطية وسدادات ألمنيوم مع حلقة أمان (كيس 500 قطعة)',
    category: 'Raw Materials',
    division: 'مواد أولية وتعبئة',
    group: 'أغطية وسدادات',
    unit: 'BAG',
    stockQty: 80,
    price: 12.50,
    cost: 9.00
  }
];

export interface RecurringTemplate {
  id: string;
  title: string;
  code: string;
  customerName: string;
  branch: string;
  currency: 'USD' | 'EUR' | 'LBP';
  source: string;
  notes: string;
  items: QuotationItem[];
  itemsCount: number;
  totalUSD: number;
  totalLL: number;
  isTaxEnabled: boolean;
  discountPercent: number;
  discountAmount?: number;
  date: string;
}

export const INITIAL_RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: 'REC-001',
    title: 'طلب مقطرات ودبس أسبوعي - Abou Hamzeh Nuts',
    code: 'REC-ABOUHAMZA',
    customerName: 'Abou Hamzeh Nuts',
    branch: 'Zeit w zaytoun ljanoub',
    currency: 'USD',
    source: 'WhatsApp / Social CRM',
    notes: 'Weekly recurring restock for retail outlet.',
    items: [
      {
        id: 'CACV250MLB103-1',
        item: OMEGA_SALES_ITEMS[1],
        qty: 24,
        unitPrice: 0.50,
        discountPercent: 0,
        total: 12.00
      },
      {
        id: 'PGM250MLB103-1',
        item: OMEGA_SALES_ITEMS[6],
        qty: 12,
        unitPrice: 0.67,
        discountPercent: 0,
        total: 8.04
      }
    ],
    itemsCount: 2,
    totalUSD: 20.04,
    totalLL: 1793580,
    isTaxEnabled: false,
    discountPercent: 0,
    date: '08-Sep-2026'
  },
  {
    id: 'REC-002',
    title: 'شحنة زيت ومونة شهرية - سوبرماركت النور',
    code: 'REC-NOUR-MTH',
    customerName: 'Supermarket Al-Nour',
    branch: 'Zeit w zaytoun ljanoub',
    currency: 'USD',
    source: 'Direct Walk-in',
    notes: 'Monthly bulk retail and olive oil quotation.',
    items: [
      {
        id: 'OACV250MLB103-1',
        item: OMEGA_SALES_ITEMS[2],
        qty: 50,
        unitPrice: 1.11,
        discountPercent: 5,
        total: 52.72
      }
    ],
    itemsCount: 1,
    totalUSD: 52.72,
    totalLL: 4718440,
    isTaxEnabled: false,
    discountPercent: 5,
    date: '05-Sep-2026'
  }
];

interface QuotationWorkstationProps {
  withOmegaSidebar?: boolean;
}

export default function QuotationWorkstation({ withOmegaSidebar = false }: QuotationWorkstationProps) {
  const { t, dir } = useLanguage();
  // Quotation header state
  const [quotationNo, setQuotationNo] = useState('QT-2026-0043');
  const [customerType, setCustomerType] = useState<'Contact' | 'Customer'>('Customer');
  const [customerSearch, setCustomerSearch] = useState('Abou Hamzeh Nuts');
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string; address: string } | null>(SAMPLE_CUSTOMERS[0]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [linkedEventName, setLinkedEventName] = useState<string>('');

  // Sync event from URL search params or localStorage (Omega ERP EVNT_FOR_NEWQUOT)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cId = params.get('customerId');
      const evName = params.get('eventName');
      const evId = params.get('eventId');
      const storedEvnt = localStorage.getItem('EVNT_FOR_NEWQUOT');

      if (cId === '9' || evName || (storedEvnt && storedEvnt !== 'null')) {
        const mohammedChami = SAMPLE_CUSTOMERS.find(c => c.id === '9') || {
          id: '9',
          name: 'Mohammed Chami',
          phone: '78851503',
          address: 'Lebanon'
        };
        setSelectedCustomer(mohammedChami);
        setCustomerSearch('');
        setCustomerType('Customer');
        setLinkedEventName(evName ? decodeURIComponent(evName) : 'Chami House');
        setSelectedBranch('Zeit w zaytoun ljanoub');
        setQuotationDate('11-Sep-2026');
        setDeliveryDate('11-Sep-2026');
      }
    }
  }, []);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation errors state (Required fields per user audio)
  const [validationErrors, setValidationErrors] = useState<{
    customer?: boolean;
    deliveryDate?: boolean;
    source?: boolean;
    items?: boolean;
  }>({});

  // Contact person details (when customerType === 'Contact')
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>(INITIAL_CRM_CONTACTS);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // Sync CRM contacts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanguard_crm_contacts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCrmContacts(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Close contact dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) {
        setIsContactDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quotation From state
  const [selectedBranch, setSelectedBranch] = useState('Zeit w zaytoun ljanoub');
  const [quotationDate, setQuotationDate] = useState('08-Sep-2026');
  const [deliveryDate, setDeliveryDate] = useState('dd-----yyyy');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'LBP'>('USD');
  const [selectedSource, setSelectedSource] = useState('Select Source');
  const [quotationNotes, setQuotationNotes] = useState('');

  // Tax State (Matching 🔒 No Tax in screenshot)
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);

  // Collapsible panels state
  const [isQuotationToOpen, setIsQuotationToOpen] = useState(true);
  const [isQuotationFromOpen, setIsQuotationFromOpen] = useState(true);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);

  // Items in Quotation
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);

  // Catalog navigation state (matching screenshot exactly)
  const [activeCategory, setActiveCategory] = useState<'Retail' | 'Wholesale' | 'Promotions' | 'Raw Materials'>('Retail');
  const [activeDivision, setActiveDivision] = useState('مقطرات ومطيبات مفرق');
  const [activeGroup, setActiveGroup] = useState('مقطرات مفرق 250مل');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Available divisions based on the active category
  const availableDivisions = useMemo(() => {
    return Object.keys(CATALOG_STRUCTURE[activeCategory] || {});
  }, [activeCategory]);

  // Available groups based on the active category and selected division
  const availableGroups = useMemo(() => {
    return CATALOG_STRUCTURE[activeCategory]?.[activeDivision] || [];
  }, [activeCategory, activeDivision]);

  // Switch category: dynamically selects first division and first group of that category
  const handleCategoryChange = (cat: 'Retail' | 'Wholesale' | 'Promotions' | 'Raw Materials') => {
    setActiveCategory(cat);
    const divs = Object.keys(CATALOG_STRUCTURE[cat] || {});
    const nextDiv = divs[0] || '';
    setActiveDivision(nextDiv);
    if (nextDiv && CATALOG_STRUCTURE[cat]?.[nextDiv]) {
      setActiveGroup(CATALOG_STRUCTURE[cat][nextDiv][0] || '');
    } else {
      setActiveGroup('');
    }
  };

  // Switch division: dynamically selects first group of that division
  const handleDivisionChange = (div: string) => {
    setActiveDivision(div);
    if (CATALOG_STRUCTURE[activeCategory]?.[div]) {
      setActiveGroup(CATALOG_STRUCTURE[activeCategory][div][0] || '');
    } else {
      setActiveGroup('');
    }
  };

  // Discount state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmountManual, setDiscountAmountManual] = useState(0);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountActiveMode, setDiscountActiveMode] = useState<'DISCOUNT' | 'DISCOUNT_100' | 'AMOUNT_DISCOUNT' | 'DISC_DOLLAR'>('DISCOUNT');
  const [discountInputDisplay, setDiscountInputDisplay] = useState('0');

  // Modals
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDefaultConfigModalOpen, setIsDefaultConfigModalOpen] = useState(false);
  const [isStoreRecurringModalOpen, setIsStoreRecurringModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isRecallRecurringModalOpen, setIsRecallRecurringModalOpen] = useState(false);

  // Save & Print Confirmation and Preview States (User Screenshots 1 to 6)
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [isPrintConfirmModalOpen, setIsPrintConfirmModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [savedQuotationForPrint, setSavedQuotationForPrint] = useState<QuotationRecord | null>(null);

  // PDF Viewer Toolbar & Document State
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [isThreeDotsMenuOpen, setIsThreeDotsMenuOpen] = useState(false);
  const [isAcrobatMenuOpen, setIsAcrobatMenuOpen] = useState(false);

  // 1. Save As Windows Dialog (Screenshot 1 & User Audio)
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState('Quotation_40720351');
  const [saveAsSearch, setSaveAsSearch] = useState('');

  // 2. Google Drive Modal (Screenshot 2 & User Audio)
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [googleDriveAccount, setGoogleDriveAccount] = useState('mohammed.jichi@gmail.com');
  const [googleDriveName, setGoogleDriveName] = useState('mohammed jichi');

  // 3. Chrome-Style Print Preview Fullscreen & Settings (Screenshot 3 & User Audio)
  const [isChromePrintPreviewOpen, setIsChromePrintPreviewOpen] = useState(false);
  const [printDestination, setPrintDestination] = useState('HP LaserJet MFP M139-M142');
  const [printPages, setPrintPages] = useState('All');
  const [printPagesCustom, setPrintPagesCustom] = useState('1');
  const [printCopies, setPrintCopies] = useState(1);
  const [printLayout, setPrintLayout] = useState<'Portrait' | 'Landscape'>('Portrait');
  const [printColor, setPrintColor] = useState<'Color' | 'Black and white'>('Color');
  const [printMoreSettingsOpen, setPrintMoreSettingsOpen] = useState(true);
  const [printPaperSize, setPrintPaperSize] = useState('Letter');
  const [printPagesPerSheet, setPrintPagesPerSheet] = useState(1);
  const [printScale, setPrintScale] = useState('Default');
  const [printCustomScale, setPrintCustomScale] = useState(100);
  const [printTwoSided, setPrintTwoSided] = useState(false);
  const [printTwoSidedFlip, setPrintTwoSidedFlip] = useState<'long' | 'short'>('long');

  // 4. Windows Classic System Print Dialog (Screenshot 4 & User Audio)
  const [isSystemPrintModalOpen, setIsSystemPrintModalOpen] = useState(false);
  const [selectedSystemPrinter, setSelectedSystemPrinter] = useState('HP LaserJet MFP M139-M142');
  const [systemPageRange, setSystemPageRange] = useState<'all' | 'selection' | 'current' | 'pages'>('all');
  const [systemPagesInput, setSystemPagesInput] = useState('');
  const [systemCopies, setSystemCopies] = useState(1);
  const [systemCollate, setSystemCollate] = useState(true);

  // Printing Preferences Dialog (Audio 2: "في عندك Preferences مانها شغالة")
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [prefActiveTab, setPrefActiveTab] = useState<'Layout' | 'PaperQuality'>('Layout');
  const [prefOrientation, setPrefOrientation] = useState<'Portrait' | 'Landscape'>('Portrait');
  const [prefBothSides, setPrefBothSides] = useState('None');
  const [prefPageOrder, setPrefPageOrder] = useState('Front to Back');
  const [prefPagesPerSheet, setPrefPagesPerSheet] = useState('1');
  const [prefPaperSource, setPrefPaperSource] = useState('Automatically Select');
  const [prefMedia, setPrefMedia] = useState('Plain Paper');
  const [prefQuality, setPrefQuality] = useState('Normal (600 dpi)');

  // Find Printer Dialog (Audio 2: "عندك Find Printer مانها شغالة")
  const [isFindPrinterModalOpen, setIsFindPrinterModalOpen] = useState(false);
  const [findPrinterName, setFindPrinterName] = useState('');
  const [findPrinterLocation, setFindPrinterLocation] = useState('');
  const [findPrinterModel, setFindPrinterModel] = useState('');
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

  // Send Sales Report / Email Modal States (User Audio & Screenshot)
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('Please find attached the quotation invoice');
  const [isFromEmailDropdownOpen, setIsFromEmailDropdownOpen] = useState(false);
  const [fromEmailSearch, setFromEmailSearch] = useState('');

  // Stored recurring templates
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>(INITIAL_RECURRING_TEMPLATES);

  // Default Configuration State (Screenshots 1, 2, 3)
  const [defaultBranch, setDefaultBranch] = useState('Zeit w zaytoun ljanoub');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultPayment, setDefaultPayment] = useState('CASH USD');
  const [defaultSalesman, setDefaultSalesman] = useState('Mahdi');
  const [defaultDepartment, setDefaultDepartment] = useState('Showroom');
  const [defaultPrinterType, setDefaultPrinterType] = useState('Select printer type');
  const [defaultPrintReportOnSave, setDefaultPrintReportOnSave] = useState('Ask After Save');
  const [salesReportFooter, setSalesReportFooter] = useState(
    'البضاعة التي تباع لا ترد ولا تبدل ما عدا السهو والخطأ.\nالرجاء التأكد من البضاعة عند الاستلام.'
  );

  // Search & popover dropdown states for Default Configuration
  const [isPrinterTypeDropdownOpen, setIsPrinterTypeDropdownOpen] = useState(false);
  const [printerTypeSearch, setPrinterTypeSearch] = useState('');
  const [isPrintOnSaveDropdownOpen, setIsPrintOnSaveDropdownOpen] = useState(false);
  const [printOnSaveSearch, setPrintOnSaveSearch] = useState('');

  // Settings Modal State (Screenshots 1 & 2)
  const [markupPercent, setMarkupPercent] = useState<number | string>(0);
  const [applyMarkupOnItem, setApplyMarkupOnItem] = useState(false);
  const [markupBasis, setMarkupBasis] = useState<'Average Cost' | 'Unit Cost'>('Unit Cost');
  const [sellingPriceTier, setSellingPriceTier] = useState('Selling Price 1');
  const [isSellingPriceDropdownOpen, setIsSellingPriceDropdownOpen] = useState(false);
  const [sellingPriceSearch, setSellingPriceSearch] = useState('');

  // Quotation Info Modal State (Screenshots)
  const [infoRate, setInfoRate] = useState('90000');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [infoWorkstation, setInfoWorkstation] = useState('W#: 2000');
  const [isEditingWorkstation, setIsEditingWorkstation] = useState(false);
  const [infoSalesman, setInfoSalesman] = useState('Mahdi');
  const [infoDepartment, setInfoDepartment] = useState('Showroom');
  const [infoReferenceNo, setInfoReferenceNo] = useState('');
  const [infoInternalNote, setInfoInternalNote] = useState('');
  const [infoTransactionType, setInfoTransactionType] = useState('Local');
  const [recurringDescription, setRecurringDescription] = useState('');

  // Notice banner
  const [notice, setNotice] = useState<string | null>(null);

  // Preview Quotations filters
  const [previewTab, setPreviewTab] = useState<'All Quotations' | 'Discounts' | 'Back Orders' | 'Layout' | 'All Salesman' | 'Branches'>('All Quotations');
  const [previewFromDate, setPreviewFromDate] = useState('01-Sep-2026');
  const [previewToDate, setPreviewToDate] = useState('30-Sep-2026');
  const [previewSearch, setPreviewSearch] = useState('');
  const [quotationsList, setQuotationsList] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('vanguard_quotations_records');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuotationsList(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
      const cachedTemplates = localStorage.getItem('vanguard_recurring_templates');
      if (cachedTemplates) {
        try {
          const parsedTmpl = JSON.parse(cachedTemplates);
          if (Array.isArray(parsedTmpl) && parsedTmpl.length > 0) {
            setRecurringTemplates(parsedTmpl);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vanguard_quotations_records', JSON.stringify(quotationsList));
    }
  }, [quotationsList]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vanguard_recurring_templates', JSON.stringify(recurringTemplates));
    }
  }, [recurringTemplates]);

  // Merge recurring templates and past sales quotations for the Recall modal (Audio 2)
  const allRecallableSales = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      code: string;
      customerName: string;
      branch: string;
      currency: string;
      source: string;
      notes: string;
      items: QuotationItem[];
      itemsCount: number;
      totalUSD: number;
      totalLL: number;
      isTaxEnabled: boolean;
      discountPercent: number;
      date: string;
      isRecurring: boolean;
    }> = [];

    recurringTemplates.forEach((t) => {
      list.push({
        id: t.id,
        title: t.title,
        code: t.code,
        customerName: t.customerName,
        branch: t.branch,
        currency: t.currency,
        source: t.source,
        notes: t.notes,
        items: t.items,
        itemsCount: t.itemsCount,
        totalUSD: t.totalUSD,
        totalLL: t.totalLL,
        isTaxEnabled: t.isTaxEnabled,
        discountPercent: t.discountPercent,
        date: t.date,
        isRecurring: true
      });
    });

    quotationsList.forEach((q) => {
      list.push({
        id: q.id,
        title: `Sales Quote - ${q.customerName}`,
        code: q.quotationNo,
        customerName: q.customerName,
        branch: q.branch,
        currency: q.currency,
        source: q.source,
        notes: q.notes,
        items: q.items,
        itemsCount: q.items.length,
        totalUSD: q.grandTotalUSD,
        totalLL: q.grandTotalLL,
        isTaxEnabled: q.isTaxEnabled,
        discountPercent: 0,
        date: q.date,
        isRecurring: false
      });
    });

    return list;
  }, [recurringTemplates, quotationsList]);

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Exchange rate
  const LBP_RATE = 89500;
  const EUR_RATE = 1.08;

  // Filtered Catalog Items based on category, division, group, and search
  const filteredCatalogItems = useMemo(() => {
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      return ALL_CATALOG_ITEMS.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    }

    // 1. Filter by category
    const catItems = ALL_CATALOG_ITEMS.filter((item) => !item.category || item.category === activeCategory);
    
    // 2. Filter by division if available
    const divItems = catItems.filter((item) => item.division === activeDivision);
    if (divItems.length > 0) {
      // 3. Filter by group
      const grpItems = divItems.filter((item) => item.group === activeGroup);
      if (grpItems.length > 0) {
        return grpItems;
      }
      return divItems;
    }

    // Fallback to category items so list is never blank
    return catItems;
  }, [activeCategory, activeDivision, activeGroup, catalogSearch]);


  // Calculations
  const subtotalUSD = useMemo(() => {
    return quotationItems.reduce((sum, item) => sum + item.total, 0);
  }, [quotationItems]);

  const calculatedDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return (subtotalUSD * discountPercent) / 100;
    }
    return discountAmountManual;
  }, [subtotalUSD, discountPercent, discountAmountManual]);

  const taxAmountUSD = useMemo(() => {
    if (!isTaxEnabled) return 0;
    const taxable = Math.max(0, subtotalUSD - calculatedDiscount);
    return taxable * 0.11; // 11% Lebanese VAT
  }, [subtotalUSD, calculatedDiscount, isTaxEnabled]);

  const grandTotalUSD = useMemo(() => {
    return Math.max(0, subtotalUSD - calculatedDiscount + taxAmountUSD);
  }, [subtotalUSD, calculatedDiscount, taxAmountUSD]);

  const grandTotalLL = useMemo(() => {
    return Math.round(grandTotalUSD * LBP_RATE);
  }, [grandTotalUSD, LBP_RATE]);

  // Add Item to Quotation
  const handleAddItem = (product: SalesItem) => {
    const markupMultiplier = applyMarkupOnItem && Number(markupPercent) > 0 
      ? 1 + Number(markupPercent) / 100 
      : 1;
    const basePrice = Number((product.price * markupMultiplier).toFixed(2));

    setQuotationItems((prev) => {
      const existing = prev.find((i) => i.item.code === product.code);
      if (existing) {
        const nextQty = existing.qty + 1;
        return prev.map((i) =>
          i.item.code === product.code
            ? {
                ...i,
                qty: nextQty,
                total: Number((nextQty * i.unitPrice * (1 - (i.discountPercent || 0) / 100)).toFixed(2))
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: `${product.code}-${Date.now()}`,
          item: product,
          qty: 1,
          unitPrice: basePrice,
          discountPercent: 0,
          total: basePrice
        }
      ];
    });
    notify(`Added ${product.name} to Quotation.`);
  };

  // Adjust item qty
  const handleUpdateQty = (code: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(code);
      return;
    }
    setQuotationItems((prev) =>
      prev.map((i) =>
        i.item.code === code
          ? {
              ...i,
              qty: newQty,
              total: Number((newQty * i.unitPrice * (1 - (i.discountPercent || 0) / 100)).toFixed(2))
            }
          : i
      )
    );
  };

  // Adjust item unit price manually (Audio request: flexible manual unit price on all items)
  const handleUpdateUnitPrice = (code: string, newUnitPrice: number) => {
    const validPrice = Math.max(0, isNaN(newUnitPrice) ? 0 : newUnitPrice);
    setQuotationItems((prev) =>
      prev.map((i) =>
        i.item.code === code
          ? {
              ...i,
              unitPrice: validPrice,
              total: Number((i.qty * validPrice * (1 - (i.discountPercent || 0) / 100)).toFixed(2))
            }
          : i
      )
    );
  };

  // Remove Item
  const handleRemoveItem = (code: string) => {
    setQuotationItems((prev) => prev.filter((i) => i.item.code !== code));
  };

  // Start New Quotation
  const handleNewQuotation = () => {
    setQuotationNo(`QT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setQuotationItems([]);
    setDiscountPercent(0);
    setDiscountAmountManual(0);
    setQuotationNotes('');
    setDeliveryDate('dd-----yyyy');
    setSelectedCustomer(null);
    setCustomerSearch('');
    setContactName('');
    setContactPhone('');
    setContactCompany('');
    setSelectedSource('Select Source');
    setValidationErrors({});
    notify('New quotation created.');
  };

  // Trigger New Quotation with items check (Audio 1)
  const handleTriggerNewQuotation = () => {
    if (quotationItems.length > 0) {
      setIsClearConfirmOpen(true);
    } else {
      handleNewQuotation();
    }
  };

  // Pick up recallable sale or recurring quotation (Audio 2)
  const handlePickUpSale = (item: any) => {
    if (item.customerName) {
      setCustomerType('Customer');
      setSelectedCustomer({
        id: item.code || 'CUST-REC',
        name: item.customerName,
        phone: '',
        address: ''
      });
      setCustomerSearch(item.customerName);
    }
    if (item.branch) setSelectedBranch(item.branch);
    if (item.currency) setCurrency(item.currency);
    if (item.source) setSelectedSource(item.source);
    if (item.notes) setQuotationNotes(item.notes);
    if (item.items && Array.isArray(item.items)) {
      setQuotationItems([...item.items]);
    }
    if (item.discountAmount) {
      setDiscountAmountManual(item.discountAmount);
    }
    setIsRecallRecurringModalOpen(false);
    notify(`Picked up quotation ${item.title || item.code} successfully!`);
  };

  // Open Invoice Discount Modal (Matching Omega ERP screenshot)
  const handleOpenDiscountModal = () => {
    if (discountAmountManual > 0) {
      setDiscountActiveMode('AMOUNT_DISCOUNT');
      setDiscountInputDisplay(String(discountAmountManual));
    } else if (discountPercent > 0) {
      setDiscountActiveMode(discountPercent === 100 ? 'DISCOUNT_100' : 'DISCOUNT');
      setDiscountInputDisplay(String(discountPercent));
    } else {
      setDiscountActiveMode('DISCOUNT');
      setDiscountInputDisplay('0');
    }
    setIsDiscountModalOpen(true);
  };

  // Keypad button press
  const handleKeypadPress = (digit: string) => {
    setDiscountInputDisplay((prev) => {
      if (digit === '.') {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }
      if (prev === '0') return digit;
      return prev + digit;
    });
  };

  // Keypad backspace
  const handleKeypadBackspace = () => {
    setDiscountInputDisplay((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  // Clear discount
  const handleKeypadClear = () => {
    setDiscountPercent(0);
    setDiscountAmountManual(0);
    setDiscountInputDisplay('0');
    notify('Discount cleared.');
  };

  // Apply discount with validation per user audio:
  // "وإذا كان الـ Discount بالدولار أكبر من قيمة الفاتورة ما بتاخدها، بتطلع notification صغيرة بتقول: Discount cannot be bigger than quotation amount"
  const handleApplyDiscount = () => {
    const val = parseFloat(discountInputDisplay) || 0;

    if (discountActiveMode === 'DISCOUNT' || discountActiveMode === 'DISCOUNT_100') {
      if (val > 100) {
        notify('Discount percentage cannot exceed 100%');
        return;
      }
      setDiscountPercent(val);
      setDiscountAmountManual(0);
      setIsDiscountModalOpen(false);
      notify(`Applied ${val}% discount.`);
    } else {
      // Dollar mode: AMOUNT_DISCOUNT or DISC_DOLLAR
      if (val > subtotalUSD) {
        notify('Discount cannot be bigger than quotation amount');
        return;
      }
      setDiscountAmountManual(val);
      setDiscountPercent(0);
      setIsDiscountModalOpen(false);
      notify(`Applied $${val.toFixed(2)} discount.`);
    }
  };

  // Save Quotation with Validations -> Prompts "Are you sure you want to save this quotation?" (Screenshot 1)
  const handleSaveQuotation = () => {
    const errors: { customer?: boolean; deliveryDate?: boolean; source?: boolean; items?: boolean } = {};
    const missingFields: string[] = [];

    // 1. Customer validation (Mandatory per audio: "لازم يكون عليها كاستمر، إذا ما في عليها كاستمر ما بنعملها سيف")
    const hasCustomer = customerType === 'Customer' 
      ? Boolean((selectedCustomer && selectedCustomer.name && selectedCustomer.name.trim().length > 0) || customerSearch.trim().length > 0)
      : Boolean(contactName && contactName.trim().length > 0);

    if (!hasCustomer) {
      errors.customer = true;
      missingFields.push(customerType === 'Customer' ? 'Customer' : 'Contact Person');
    }

    // 2. Delivery Date validation (Mandatory per audio: "في الـ delivery date لازم يكون في delivery date قبل ما تسكر")
    const hasDeliveryDate = Boolean(
      deliveryDate && 
      deliveryDate.trim() !== '' && 
      deliveryDate !== 'dd-----yyyy' && 
      !deliveryDate.toLowerCase().includes('dd--')
    );

    if (!hasDeliveryDate) {
      errors.deliveryDate = true;
      missingFields.push('Delivery Date');
    }

    // 3. Source validation (Mandatory per audio: "عندك الـ select source لازم يكونو مسكرين لازم يكونو معبيين")
    const hasSource = Boolean(
      selectedSource && 
      selectedSource !== 'Select Source' && 
      selectedSource.trim() !== ''
    );

    if (!hasSource) {
      errors.source = true;
      missingFields.push('Source');
    }

    // 4. Products / Items validation
    if (quotationItems.length === 0) {
      errors.items = true;
      missingFields.push('Quotation Items');
    }

    // If any required field is missing, reject and alert user
    if (missingFields.length > 0) {
      setValidationErrors(errors);
      alert(`Please fill out the following required field(s) before saving:\n\n• ${missingFields.join('\n• ')}`);
      notify(`Please fill out this field: ${missingFields[0]}`);
      return;
    }

    setValidationErrors({});
    setIsSaveConfirmModalOpen(true);
  };

  // Step 2: Confirm save -> save to records -> Prompt "Do you want to print the quotation ?" (Screenshot 2)
  const handleConfirmSave = () => {
    setIsSaveConfirmModalOpen(false);
    const savedNo = quotationNo;
    const newRecord: QuotationRecord = {
      id: `QT-${Date.now()}`,
      quotationNo: savedNo,
      customerType,
      customerName: customerType === 'Customer' ? (selectedCustomer?.name || customerSearch) : contactName,
      customerId: customerType === 'Customer' ? (selectedCustomer?.id || undefined) : undefined,
      contactPerson: customerType === 'Contact' ? contactName : undefined,
      phone: customerType === 'Customer' ? (selectedCustomer?.phone || undefined) : contactPhone,
      branch: selectedBranch,
      date: quotationDate,
      deliveryDate,
      currency,
      source: selectedSource,
      notes: quotationNotes,
      items: [...quotationItems],
      subtotal: subtotalUSD,
      discountAmount: calculatedDiscount,
      taxAmount: taxAmountUSD,
      grandTotalUSD,
      grandTotalLL,
      isTaxEnabled,
      salesman: infoSalesman || defaultSalesman || 'Mahdi',
      status: 'Sent',
      createdAt: new Date().toLocaleDateString('en-GB')
    };

    // Save to list & persist
    setQuotationsList((prev) => [newRecord, ...prev]);
    setSavedQuotationForPrint(newRecord);

    // Sync CRM Contacts (Audio 3 & Screenshot 1, 3: Quotation Sent link)
    if (customerType === 'Contact' && contactName.trim()) {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('vanguard_crm_contacts') : null;
        let currentList: CRMContact[] = stored ? JSON.parse(stored) : INITIAL_CRM_CONTACTS;
        const targetName = contactName.trim().toLowerCase();
        const existingIdx = currentList.findIndex(
          (c) =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(targetName) ||
            targetName.includes(c.firstName.toLowerCase()) ||
            (contactPhone && c.phone === contactPhone)
        );

        if (existingIdx >= 0) {
          currentList[existingIdx].pipelineStage = 'Quotation Sent';
          currentList[existingIdx].expectedValue = grandTotalUSD;
          if (contactPhone && !currentList[existingIdx].phone) {
            currentList[existingIdx].phone = contactPhone;
          }
          if (contactCompany && !currentList[existingIdx].company) {
            currentList[existingIdx].company = contactCompany;
          }
        } else {
          currentList.unshift({
            id: `cnt-${Date.now()}`,
            leadNumber: currentList.length + 1,
            brand: selectedBranch,
            firstName: contactName.split(' ')[0] || contactName,
            lastName: contactName.split(' ').slice(1).join(' ') || '',
            phone: contactPhone || '',
            company: contactCompany || '',
            country: 'Lebanon',
            email: '',
            source: selectedSource !== 'Select Source' ? selectedSource : 'WhatsApp',
            leadStatus: 'Qualified',
            pipelineStage: 'Quotation Sent',
            expectedValue: grandTotalUSD,
            salesOwner: infoSalesman || defaultSalesman || 'Mohammed Jichi',
            createdBy: 'Mohammed Jichi',
            dateCreated:
              new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) +
              ' ' +
              new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          });
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('vanguard_crm_contacts', JSON.stringify(currentList));
        }
        setCrmContacts(currentList);
      } catch (err) {
        console.error('Failed to sync CRM contact:', err);
      }
    }

    // Prompt "Do you want to print the quotation ?"
    setIsPrintConfirmModalOpen(true);
  };

  // Step 3: Handle Print Confirmation response
  const handleConfirmPrintDecision = (wantsPrint: boolean) => {
    setIsPrintConfirmModalOpen(false);
    const savedRec = savedQuotationForPrint;

    // Reset workstation for fresh quotation
    handleNewQuotation();

    if (wantsPrint && savedRec) {
      setIsPrintPreviewOpen(true);
    } else {
      notify(`Quotation ${savedRec?.quotationNo || ''} saved successfully! Click 🔍 to view all saved quotations.`);
    }
  };

  // Send Email Handler (User Audio & Screenshot)
  const handleSendEmail = () => {
    if (!emailTo.trim()) {
      notify('Please enter recipient email (To).');
      return;
    }
    const sender = emailFrom.trim() || 'sales@southernolive-lb.com';
    setIsSendEmailModalOpen(false);
    setIsPrintPreviewOpen(false); // Returns directly to Quotation workstation page
    notify(`Quotation email successfully sent to ${emailTo} from ${sender}!`);
  };

  // Delete Quotation (Audio 3)
  const handleDeleteQuotation = () => {
    setIsDeleteConfirmOpen(false);
    setQuotationsList((prev) => prev.filter((q) => q.quotationNo !== quotationNo));
    handleNewQuotation();
    notify(`Quotation ${quotationNo} deleted successfully.`);
  };

  // Filtered Preview Quotations
  const filteredPreviewQuotations = useMemo(() => {
    return quotationsList.filter((q) => {
      if (previewSearch.trim()) {
        const term = previewSearch.toLowerCase();
        return (
          q.quotationNo.toLowerCase().includes(term) ||
          q.customerName.toLowerCase().includes(term) ||
          q.branch.toLowerCase().includes(term)
        );
      }
      if (previewTab === 'Discounts') {
        return q.discountAmount > 0;
      }
      return true;
    });
  }, [quotationsList, previewSearch, previewTab]);

  return (
    <div className="flex flex-col min-h-screen bg-muted font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* TOP HEADER & ACTION CONTROLS (Matching Screenshot)                        */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-2xs">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-normal text-slate-800 tracking-tight">{t('quotation', 'Quotation')}</h1>
          {notice && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-2.5 py-0.5 rounded animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* + New Button */}
          <button
            type="button"
            onClick={handleTriggerNewQuotation}
            className="bg-primary hover:bg-primary text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            title={t('start_new_quotation', 'Start New Quotation')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('new', 'New')}</span>
          </button>

          {/* Search Button (Opens Preview Quotations) */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="bg-primary hover:bg-primary text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
            title={t('search_preview_quotations', 'Search / Preview Quotations')}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Save Button (Orange #ea580c matching screenshot) */}
          <button
            type="button"
            onClick={handleSaveQuotation}
            className="bg-amber-600 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title={t('save_quotation', 'Save Quotation')}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('save', 'Save')}</span>
          </button>

          {/* Store Recurring Button (Up Arrow) */}
          <button
            type="button"
            onClick={() => setIsStoreRecurringModalOpen(true)}
            className="bg-primary hover:bg-primary text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
            title={t('store_as_recurring_quotation', 'Store as Recurring Quotation')}
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="bg-primary hover:bg-primary text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
            title={t('quotation_information', 'Quotation Information')}
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="bg-primary hover:bg-primary text-white p-1.5 rounded shadow-2xs transition-colors cursor-pointer"
            title={t('delete_quotation', 'Delete Quotation')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Tax Button (No Tax / VAT toggle) */}
          <button
            type="button"
            onClick={() => {
              setIsTaxEnabled(!isTaxEnabled);
              notify(isTaxEnabled ? 'Tax Disabled (No Tax)' : '11% VAT Tax Enabled');
            }}
            className={`text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
              isTaxEnabled ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-primary hover:bg-primary'
            }`}
            title={t('toggle_tax_calculation', 'Toggle Tax Calculation')}
          >
            {isTaxEnabled ? <Unlock className="w-3.5 h-3.5 text-emerald-300" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isTaxEnabled ? 'VAT (11%)' : 'No Tax'}</span>
          </button>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
              className="bg-primary hover:bg-primary text-white text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <span>{t('actions', 'Actions')}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isActionsDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    handleTriggerNewQuotation();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('new_quotation', 'New Quotation')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    setIsDefaultConfigModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('default_configuration', 'Default Configuration')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('settings', 'Settings')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    setIsRecallRecurringModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('recall_recurring', 'Recall Recurring')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN WORKSPACE                                                   */}
      {/* ========================================================================= */}
      <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1680px] w-full mx-auto items-start">
        {/* ======================================================================= */}
        {/* LEFT 6 COLUMNS: Quotation To + Catalog Search & Items List               */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 space-y-3">
          {/* Card 1: Quotation To */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
            <div
              onClick={() => setIsQuotationToOpen(!isQuotationToOpen)}
              className="px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none bg-slate-50/50"
            >
              <h2 className="text-xs font-bold text-slate-700">{t('quotation_to', 'Quotation To')}</h2>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isQuotationToOpen ? '' : '-rotate-90'}`} />
            </div>

            {isQuotationToOpen && (
              <div className="p-3 space-y-2 text-xs">
                {/* Radio Selector: Contact vs Customer */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="customerType"
                      checked={customerType === 'Contact'}
                      onChange={() => setCustomerType('Contact')}
                      className="cursor-pointer"
                    />
                    <span>{t('contact', 'Contact')}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                    <input
                      type="radio"
                      name="customerType"
                      checked={customerType === 'Customer'}
                      onChange={() => setCustomerType('Customer')}
                      className="cursor-pointer"
                    />
                    <span>{t('customer', 'Customer')}</span>
                  </label>
                </div>

                {/* Input Area */}
                {customerType === 'Customer' ? (
                  <div ref={customerDropdownRef} className="relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder={t('search_customer', 'Search customer...')}
                        value={customerSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomerSearch(val);
                          if (val.trim() === '') {
                            setSelectedCustomer(null);
                            setIsCustomerDropdownOpen(false);
                          } else {
                            setIsCustomerDropdownOpen(true);
                          }
                          setValidationErrors((prev) => ({ ...prev, customer: false }));
                        }}
                        onFocus={() => {
                          if (customerSearch.trim()) {
                            setIsCustomerDropdownOpen(true);
                          }
                        }}
                        className={`w-full bg-white border rounded pl-3 pr-14 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-2xs ${
                          validationErrors.customer
                            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                            : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearch('');
                            setSelectedCustomer(null);
                            setIsCustomerDropdownOpen(false);
                          }}
                          className="absolute right-7 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title={t('clear_customer', 'Clear customer')}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                    {validationErrors.customer && (
                      <div className="text-[10px] text-rose-600 font-bold mt-1">
                        {t('please_select_a_customer_before_saving', 'Please select a customer before saving')}
                      </div>
                    )}

                    {/* Customer Dropdown */}
                    {isCustomerDropdownOpen && customerSearch.trim() && (() => {
                      const filtered = SAMPLE_CUSTOMERS.filter((c) =>
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.id.includes(customerSearch)
                      );
                      if (filtered.length === 0) return null;
                      return (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-xl max-h-48 overflow-y-auto z-50">
                          {filtered.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerSearch(c.name);
                                setIsCustomerDropdownOpen(false);
                                setValidationErrors((prev) => ({ ...prev, customer: false }));
                              }}
                              className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-800">{c.name}</span>
                              <span className="text-slate-400 text-[11px]">ID: {c.id}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Selected Customer Card matching Screenshot 4 */}
                    {selectedCustomer && (
                      <div className="mt-2.5 p-2.5 border border-slate-200 rounded bg-white flex items-center justify-between shadow-2xs">
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">{selectedCustomer.name}</div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">{selectedCustomer.phone}</div>
                        </div>
                        {linkedEventName && (
                          <div className="px-2.5 py-0.5 border border-blue-400 text-blue-600 rounded text-[11px] font-semibold bg-blue-50/50">
                            {linkedEventName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header with link to Open Contacts in New Tab */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">{t('contact_person', 'Contact Person')}</span>
                      <button
                        type="button"
                        onClick={() => window.open('/contacts', '_blank')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        title={t('open_contacts_view_in_a_new_tab', 'Open Contacts View in a new tab')}
                      >
                        <span>{t('open_contacts_in_new_tab', 'Open Contacts in New Tab')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative" ref={contactDropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('contact_name', 'Contact Name*...')}
                          value={contactName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContactName(val);
                            setIsContactDropdownOpen(val.trim().length > 0);
                            setValidationErrors((prev) => ({ ...prev, customer: false }));
                          }}
                          onFocus={() => {
                            if (contactName.trim().length > 0) {
                              setIsContactDropdownOpen(true);
                            }
                          }}
                          className={`w-full border rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none shadow-2xs ${
                            validationErrors.customer
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-slate-300 focus:border-blue-500'
                          }`}
                        />

                        {/* Contact Autocomplete & "Contact Not Found -> Open New Tab" Dropdown (Audio 1) */}
                        {isContactDropdownOpen && contactName.trim().length > 0 && (() => {
                          const query = contactName.toLowerCase();
                          const matches = crmContacts.filter(c =>
                            `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
                            (c.phone && c.phone.includes(query)) ||
                            (c.company && c.company.toLowerCase().includes(query))
                          );

                          if (matches.length > 0) {
                            return (
                              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-xl max-h-48 overflow-y-auto z-50">
                                {matches.map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      setContactName(`${c.firstName} ${c.lastName}`.trim());
                                      if (c.phone) setContactPhone(c.phone);
                                      if (c.company) setContactCompany(c.company);
                                      setIsContactDropdownOpen(false);
                                      setValidationErrors((prev) => ({ ...prev, customer: false }));
                                    }}
                                    className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 flex items-center justify-between"
                                  >
                                    <div>
                                      <span className="font-medium text-slate-800">{c.firstName} {c.lastName}</span>
                                      {c.company && <span className="text-slate-400 text-[10px] ml-1.5">({c.company})</span>}
                                    </div>
                                    <span className="text-slate-500 text-[11px] font-mono">{c.phone}</span>
                                  </div>
                                ))}
                                <div className="p-2 border-t border-slate-100 bg-slate-50 text-right">
                                  <button
                                    type="button"
                                    onClick={() => window.open('/contacts', '_blank')}
                                    className="text-[10px] text-blue-600 hover:underline flex items-center justify-end gap-1 ml-auto cursor-pointer"
                                  >
                                    <span>{t('manage_contacts_in_new_tab', 'Manage Contacts in New Tab')}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // If typed 3+ characters and contact NOT found (Audio 1: "بتحط تلات أحرف ما يطلعلك الإسم، تفتح عندك هاي الصفحة بـ تاب جديد New Tab... مشان تضيف New Contact")
                          if (contactName.trim().length >= 3) {
                            return (
                              <div className="absolute left-0 w-80 top-full mt-1 bg-white border border-amber-300 rounded shadow-xl p-3 z-50 animate-in fade-in">
                                <div className="text-[11px] font-semibold text-amber-900 mb-1">
                                  No contact found for &ldquo;{contactName}&rdquo;
                                </div>
                                <p className="text-[10px] text-slate-600 mb-2.5">
                                  {t('this_contact_is_not_registered_in_crm', 'This contact is not registered in CRM yet. Click below to open Contacts in a new tab and create a new contact:')}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsContactDropdownOpen(false);
                                    window.open('/contacts', '_blank');
                                  }}
                                  className="w-full bg-primary hover:bg-primary text-white text-[11px] font-semibold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                                >
                                  <Plus className="w-3 h-3 text-emerald-400" />
                                  <span>Open Contacts (+ New Contact) in New Tab</span>
                                  <ExternalLink className="w-3 h-3 text-cyan-300 ml-0.5" />
                                </button>
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>

                      <input
                        type="text"
                        placeholder={t('phone', 'Phone...')}
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                      <input
                        type="text"
                        placeholder={t('company', 'Company...')}
                        value={contactCompany}
                        onChange={(e) => setContactCompany(e.target.value)}
                        className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                    {validationErrors.customer && (
                      <div className="text-[10px] text-rose-600 font-bold mt-1">
                        {t('please_enter_contact_name_before_saving', 'Please enter contact name before saving')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Catalog Search & Items Table (Matching Screenshot exactly) */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
            {/* Search Input Bar */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/50">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('search_items_by_description_code_or', 'Search Items By Description, Code or Barcode...')}
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Tier 1 Tabs (مفرق, جملة, عروض, Raw Materials) */}
            <div className="flex items-center border-b border-slate-200 bg-background text-xs font-semibold overflow-x-auto">
              {(['Retail', 'Wholesale', 'Promotions', 'Raw Materials'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 border-r border-slate-200 transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Group Tier 2 Tabs - Row 1 (Divisions) */}
            <div className="flex items-center border-b border-slate-200 bg-white text-[11px] overflow-x-auto font-medium">
              {availableDivisions.map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => handleDivisionChange(div)}
                  className={`px-2.5 py-1.5 border-r border-slate-200 whitespace-nowrap transition-colors cursor-pointer ${
                    activeDivision === div
                      ? 'bg-muted text-primary font-bold border-b-2 border-b-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

            {/* Group Tier 2 Tabs - Row 2 (Subgroups) */}
            <div className="flex items-center border-b border-slate-200 bg-muted text-[11px] overflow-x-auto font-medium min-h-[30px]">
              {availableGroups.length > 0 ? (
                availableGroups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setActiveGroup(grp)}
                    className={`px-3 py-1 border-r border-slate-200 whitespace-nowrap transition-colors cursor-pointer ${
                      activeGroup === grp
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-500 hover:bg-slate-200/50'
                    }`}
                  >
                    {grp}
                  </button>
                ))
              ) : (
                <span className="px-3 py-1 text-slate-400 text-[11px] italic">
                  {t('all_items', 'All Items')}
                </span>
              )}
            </div>

            {/* Items List (Matching layout in screenshot) */}
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto text-xs">
              {filteredCatalogItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  {t('no_items_found_matching_the_selected', 'No items found matching the selected category or filter.')}
                </div>
              ) : (
                filteredCatalogItems.map((prod) => {
                  const inQuotation = quotationItems.find((i) => i.item.code === prod.code);
                  return (
                    <div
                      key={prod.code}
                      className="px-4 py-2 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-2"
                    >
                      {/* Name & Code in parentheses */}
                      <div className="flex-1 pr-2">
                        <div className="font-normal text-slate-800 text-right dir-rtl">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ({prod.code})
                        </div>
                      </div>

                      {/* Unit */}
                      <div className="w-12 text-center font-mono text-slate-500 text-xs">
                        {prod.unit}
                      </div>

                      {/* Qty in Quotation */}
                      <div className="w-12 text-center font-mono font-semibold text-slate-700 text-xs">
                        {inQuotation ? inQuotation.qty : 0}
                      </div>

                      {/* Price */}
                      <div className="w-16 text-right font-mono font-medium text-slate-700 text-xs">
                        {prod.price.toFixed(2)} $
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddItem(prod)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 hover:border-blue-500 hover:bg-blue-600 hover:text-white text-slate-600 cursor-pointer transition-colors shadow-2xs"
                        title={t('add_to_quotation', 'Add to Quotation')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT 6 COLUMNS: Quotation From + Order Summary                         */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 space-y-3">
          {/* Card 1: Quotation From */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-visible relative z-20">
            <div
              onClick={() => setIsQuotationFromOpen(!isQuotationFromOpen)}
              className="px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none bg-slate-50/50"
            >
              <h2 className="text-xs font-bold text-slate-700">{t('quotation_from', 'Quotation From')}</h2>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isQuotationFromOpen ? '' : '-rotate-90'}`} />
            </div>

            {isQuotationFromOpen && (
              <div className="p-3 space-y-2.5 text-xs overflow-visible">
                {/* Row 1: Branch, Quotation Date, Delivery Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end relative z-30">
                  {/* Branch Selector (4 cols) */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">{t('branch', 'Branch')}</label>
                    <div className="relative">
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 appearance-none pr-7 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {BRANCH_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quotation Date (4 cols) */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">{t('quotation_date', 'Quotation Date')}</label>
                    <DatePickerInput
                      value={quotationDate}
                      onChange={setQuotationDate}
                      className="w-full"
                      inputWidth="w-full"
                    />
                  </div>

                  {/* Delivery Date* (4 cols) */}
                  <div className="sm:col-span-4 relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-500 font-medium">{t('delivery_date', 'Delivery Date*')}</label>
                      {validationErrors.deliveryDate && (
                        <span className="text-[10px] text-rose-600 font-bold">{t('required', 'Required')}</span>
                      )}
                    </div>
                    <div className={validationErrors.deliveryDate ? 'ring-2 ring-rose-500 rounded' : ''}>
                      <DatePickerInput
                        value={deliveryDate}
                        onChange={(val) => {
                          setDeliveryDate(val);
                          setValidationErrors((prev) => ({ ...prev, deliveryDate: false }));
                        }}
                        placeholder={t('ddyyyy', 'dd-----yyyy')}
                        className="w-full"
                        inputWidth="w-full"
                        alignRight={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Currency, Select Source, Quotation Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center relative z-10">
                  {/* Currency (3 cols) */}
                  <div className="sm:col-span-3">
                    <div className="relative">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 appearance-none pr-7 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="USD">{t('usd', 'USD')}</option>
                        <option value="EUR">{t('eur', 'EUR')}</option>
                        <option value="LBP">{t('lbp', 'LBP')}</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Select Source (4 cols) */}
                  <div className="sm:col-span-4">
                    <div className="relative">
                      <select
                        value={selectedSource}
                        onChange={(e) => {
                          setSelectedSource(e.target.value);
                          setValidationErrors((prev) => ({ ...prev, source: false }));
                        }}
                        className={`w-full bg-white border rounded px-2.5 py-1 text-xs text-slate-800 appearance-none pr-7 shadow-2xs focus:outline-none cursor-pointer ${
                          validationErrors.source
                            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                            : 'border-slate-300 focus:border-blue-500'
                        }`}
                      >
                        {SOURCE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quotation Notes (5 cols) */}
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder={t('quotation_notes', 'Quotation Notes')}
                      value={quotationNotes}
                      onChange={(e) => setQuotationNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Order Summary (Matching Screenshot) */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
            <div
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
              className="px-4 py-2 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none bg-slate-50/50"
            >
              <h2 className="text-xs font-bold text-slate-700">{t('order_summary', 'Order Summary')}</h2>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOrderSummaryOpen ? '' : '-rotate-90'}`} />
            </div>

            {isOrderSummaryOpen && (
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600 bg-background">
                  <div className="col-span-5">{t('product', 'Product')}</div>
                  <div className="col-span-2 text-center">{t('qty', 'Qty')}</div>
                  <div className="col-span-3 text-right">Unit Price ($)</div>
                  <div className="col-span-2 text-right">Total ($)</div>
                </div>

                {/* Items in Quotation */}
                <div className="min-h-[140px] max-h-[320px] overflow-y-auto divide-y divide-slate-100 text-xs">
                  {quotationItems.length === 0 ? (
                    <div className={`p-8 text-center transition-colors ${validationErrors.items ? 'bg-rose-50 border border-rose-200 text-rose-700 font-semibold' : 'text-slate-400'}`}>
                      {validationErrors.items ? (
                        <div className="space-y-1">
                          <div className="text-rose-700 font-bold">⚠️ Required: No items in quotation</div>
                          <div className="text-xs text-rose-600 font-normal">{t('click_on_any_product_from_the_catalog', 'Click [+] on any product from the catalog on the left to add items before saving.')}</div>
                        </div>
                      ) : (
                        <span>{t('no_items_added_yet_click', 'No items added yet. Click')} <span className="font-semibold text-slate-600">[+]</span> {t('on_any_product_to_add_to_quotation', 'on any product to add to quotation.')}</span>
                      )}
                    </div>
                  ) : (
                    quotationItems.map((qItem) => (
                      <div key={qItem.id} className="grid grid-cols-12 px-4 py-2 items-center hover:bg-slate-50 transition-colors">
                        {/* Product Name */}
                        <div className="col-span-5 pr-2">
                          <div className="font-medium text-slate-800 text-right dir-rtl">{qItem.item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">({qItem.item.code})</div>
                        </div>

                        {/* Qty Adjuster */}
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(qItem.item.code, qItem.qty - 1)}
                            className="w-5 h-5 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold w-6 text-center">{qItem.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(qItem.item.code, qItem.qty + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Unit Price (Editable manually as requested in audio) */}
                        <div className="col-span-3 flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={qItem.unitPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleUpdateUnitPrice(qItem.item.code, isNaN(val) ? 0 : val);
                            }}
                            className="w-20 bg-white border border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 text-xs text-right font-mono font-medium text-slate-800 focus:outline-none shadow-2xs"
                            title={t('edit_unit_price_manually', 'Edit Unit Price manually')}
                          />
                          <span className="text-slate-500 text-xs font-mono">$</span>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="col-span-2 flex items-center justify-end gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {qItem.total.toFixed(2)} $
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(qItem.item.code)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 cursor-pointer transition-colors"
                            title={t('remove_item', 'Remove item')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals Section (Matching exact labels in screenshot) */}
                <div className="border-t border-slate-200 p-4 space-y-2 bg-background/50 text-xs">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{t('subtotal', 'Subtotal:')}</span>
                    <span className="font-mono text-slate-800">
                      {Math.round(subtotalUSD * LBP_RATE).toLocaleString()} LL ({subtotalUSD.toFixed(2)} $)
                    </span>
                  </div>

                  {/* Discount Button + Amount */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleOpenDiscountModal}
                      className="bg-primary hover:bg-primary text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-2xs cursor-pointer"
                    >
                      {t('discount', 'Discount')}
                    </button>
                    <span className="font-mono text-emerald-700">
                      {Math.round(calculatedDiscount * LBP_RATE).toLocaleString()} LL ({calculatedDiscount.toFixed(2)} $)
                    </span>
                  </div>

                  {/* Total Tax */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{t('total_tax', 'Total Tax:')}</span>
                    <span className="font-mono text-slate-800">
                      {Math.round(taxAmountUSD * LBP_RATE).toLocaleString()} LL ({taxAmountUSD.toFixed(2)} $)
                    </span>
                  </div>

                  {/* Grand Total LL (Red text matching screenshot) */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="font-bold text-red-600 text-xs">{t('grand_total_ll', 'Grand Total LL:')}</span>
                    <span className="font-mono font-extrabold text-red-600 text-sm">
                      {grandTotalLL.toLocaleString()} LL
                    </span>
                  </div>

                  {/* Grand Total $ (Bold black text matching screenshot) */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{t('grand_total', 'Grand Total $:')}</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {grandTotalUSD.toFixed(2)} $
                    </span>
                  </div>

                  {/* Save Button (Orange #ea580c matching screenshot) */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveQuotation}
                      className="bg-amber-600 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('save', 'Save')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top button matching screenshot */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-40 p-2.5 rounded-full bg-white text-blue-700 shadow-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
        title={t('scroll_to_top', 'Scroll to top')}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* ========================================================================= */}
      {/* PREVIEW QUOTATIONS MODAL (Search Button 🔍)                               */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold">{t('preview_quotations', 'Preview Quotations')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs matching user audio instructions */}
            <div className="p-4 space-y-3 border-b border-slate-200 bg-slate-50/70">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                {(['All Quotations', 'Discounts', 'Back Orders', 'Layout', 'All Salesman', 'Branches'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPreviewTab(tab)}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      previewTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Date Filters + Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                <div className="sm:col-span-5 flex items-center gap-2">
                  <span className="text-slate-600 font-medium">{t('from', 'From')}</span>
                  <DatePickerInput
                    value={previewFromDate}
                    onChange={setPreviewFromDate}
                    inputWidth="w-28"
                  />
                  <span className="text-slate-600 font-medium">{t('to', 'To')}</span>
                  <DatePickerInput
                    value={previewToDate}
                    onChange={setPreviewToDate}
                    inputWidth="w-28"
                  />
                </div>

                <div className="sm:col-span-7 relative">
                  <input
                    type="text"
                    placeholder={t('search_by_quotation_customer_or_branch', 'Search by Quotation #, Customer or Branch...')}
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quotations Table */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">{t('quotation', 'Quotation #')}</th>
                    <th className="p-2">{t('date', 'Date')}</th>
                    <th className="p-2">{t('customer', 'Customer')}</th>
                    <th className="p-2">{t('branch', 'Branch')}</th>
                    <th className="p-2">{t('salesman', 'Salesman')}</th>
                    <th className="p-2 text-right">{t('total_usd', 'Total USD')}</th>
                    <th className="p-2 text-right">{t('total_ll', 'Total LL')}</th>
                    <th className="p-2 text-center">{t('status', 'Status')}</th>
                    <th className="p-2 text-center">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPreviewQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        {t('no_quotations_found_matching_criteria', 'No quotations found matching criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredPreviewQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-mono font-bold text-blue-700">{q.quotationNo}</td>
                        <td className="p-2">{q.date}</td>
                        <td className="p-2 font-bold text-slate-800">{q.customerName}</td>
                        <td className="p-2 text-slate-600">{q.branch}</td>
                        <td className="p-2 text-slate-600">{q.salesman}</td>
                        <td className="p-2 text-right font-mono font-bold">{q.grandTotalUSD.toFixed(2)} $</td>
                        <td className="p-2 text-right font-mono text-slate-600">{q.grandTotalLL.toLocaleString()} LL</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'Sent'
                                ? 'bg-blue-100 text-blue-800'
                                : q.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setQuotationNo(q.quotationNo);
                              setQuotationItems(q.items);
                              setSelectedBranch(q.branch);
                              setQuotationDate(q.date);
                              setQuotationNotes(q.notes);
                              setIsTaxEnabled(q.isTaxEnabled);
                              setIsPreviewModalOpen(false);
                              notify(`Loaded Quotation ${q.quotationNo}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer"
                          >
                            {t('load', 'Load')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-2.5 flex items-center justify-between bg-slate-50">
              <span className="text-slate-500 font-medium">
                Showing {filteredPreviewQuotations.length} Quotation(s)
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="bg-primary hover:bg-primary text-white px-4 py-1 rounded font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUOTATION INFO MODAL (Info Button ℹ - Matching Screenshot)                */}
      {/* ========================================================================= */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[620px] overflow-visible flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-slate-700">{t('quotation_info', 'Quotation Info')}</h2>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3.5">
              {/* Row 1: Rate */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('rate', 'Rate')}</label>
                <div className="col-span-8 flex items-center gap-2">
                  <input
                    type="text"
                    value={infoRate}
                    readOnly={!isEditingRate}
                    onChange={(e) => setInfoRate(e.target.value)}
                    className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 ${
                      isEditingRate ? 'bg-white focus:outline-none focus:border-blue-500' : 'bg-muted cursor-default'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingRate(!isEditingRate)}
                    className="bg-[#374151] hover:bg-[#1f2937] text-white p-2 rounded shadow-2xs cursor-pointer flex items-center justify-center shrink-0 transition-colors"
                    title={isEditingRate ? 'Lock Rate' : 'Edit Rate'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: Workstation */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('workstation', 'Workstation')}</label>
                <div className="col-span-8 flex items-center gap-2">
                  <input
                    type="text"
                    value={infoWorkstation}
                    readOnly={!isEditingWorkstation}
                    onChange={(e) => setInfoWorkstation(e.target.value)}
                    className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 ${
                      isEditingWorkstation ? 'bg-white focus:outline-none focus:border-blue-500' : 'bg-muted cursor-default'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingWorkstation(!isEditingWorkstation)}
                    className="bg-[#374151] hover:bg-[#1f2937] text-white p-2 rounded shadow-2xs cursor-pointer flex items-center justify-center shrink-0 transition-colors"
                    title={isEditingWorkstation ? 'Lock Workstation' : 'Edit Workstation'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Divider 1 */}
              <div className="border-t border-dashed border-slate-200 my-2" />

              {/* Row 3: Salesman */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('salesman', 'Salesman')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={infoSalesman}
                    onChange={(e) => setInfoSalesman(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {SALESMAN_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Row 4: Department* */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('department', 'Department*')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={infoDepartment}
                    onChange={(e) => setInfoDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Row 5: Reference # */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('reference', 'Reference #')}</label>
                <div className="col-span-8">
                  <input
                    type="text"
                    value={infoReferenceNo}
                    onChange={(e) => setInfoReferenceNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 6: Internal Note */}
              <div className="grid grid-cols-12 gap-3 items-start">
                <label className="col-span-4 font-bold text-slate-800 text-xs pt-1.5">{t('internal_note', 'Internal Note')}</label>
                <div className="col-span-8">
                  <textarea
                    rows={2}
                    placeholder={t('internal_note', 'Internal note')}
                    value={infoInternalNote}
                    onChange={(e) => setInfoInternalNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 7: Transaction Type */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('transaction_type', 'Transaction Type')}</label>
                <div className="col-span-8">
                  <input
                    type="text"
                    value={infoTransactionType}
                    onChange={(e) => setInfoTransactionType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Divider 2 */}
              <div className="border-t border-dashed border-slate-200 my-2" />

              {/* OK Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    notify('Quotation info updated successfully.');
                  }}
                  className="bg-[#374151] hover:bg-[#1f2937] text-white px-6 py-1.5 rounded text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  {t('ok', 'OK')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INVOICE DISCOUNT MODAL (Matching User Screenshot & Omega ERP)              */}
      {/* ========================================================================= */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[620px] overflow-hidden flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-primary">{t('invoice_discount', 'Invoice Discount')}</h2>
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Left column (Discount options) & Right column (Keypad) */}
            <div className="p-6 grid grid-cols-12 gap-6 items-start">
              {/* Left Column (5 cols) */}
              <div className="col-span-5 space-y-4">
                {/* Section 1: Discount % */}
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                    {t('discount', 'Discount %')}
                  </div>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountActiveMode('DISCOUNT');
                        setDiscountInputDisplay(discountPercent > 0 && discountPercent !== 100 ? String(discountPercent) : '0');
                      }}
                      className={`w-full py-2 px-3 rounded text-xs font-semibold text-left transition-all cursor-pointer ${
                        discountActiveMode === 'DISCOUNT'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-[#5f6d7e] hover:bg-[#4d5b6c] text-white'
                      }`}
                    >
                      {t('discount', 'DISCOUNT')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountActiveMode('DISCOUNT_100');
                        setDiscountInputDisplay('100');
                      }}
                      className={`w-full py-2 px-3 rounded text-xs font-semibold text-left transition-all cursor-pointer ${
                        discountActiveMode === 'DISCOUNT_100'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-[#5f6d7e] hover:bg-[#4d5b6c] text-white'
                      }`}
                    >
                      {t('discount_100', 'DISCOUNT 100%')}
                    </button>
                  </div>
                </div>

                {/* Section 2: Discount amount */}
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
                    {t('discount_amount', 'Discount amount')}
                  </div>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountActiveMode('AMOUNT_DISCOUNT');
                        setDiscountInputDisplay(discountAmountManual > 0 ? String(discountAmountManual) : '0');
                      }}
                      className={`w-full py-2 px-3 rounded text-xs font-semibold text-left transition-all cursor-pointer ${
                        discountActiveMode === 'AMOUNT_DISCOUNT'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-[#5f6d7e] hover:bg-[#4d5b6c] text-white'
                      }`}
                    >
                      {t('amount_discount', 'AMOUNT DISCOUNT')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountActiveMode('DISC_DOLLAR');
                        setDiscountInputDisplay(discountAmountManual > 0 ? String(discountAmountManual) : '0');
                      }}
                      className={`w-full py-2 px-3 rounded text-xs font-semibold text-left transition-all cursor-pointer ${
                        discountActiveMode === 'DISC_DOLLAR'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-[#5f6d7e] hover:bg-[#4d5b6c] text-white'
                      }`}
                    >
                      {t('disc', 'Disc $')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Input Display & Numpad (7 cols) */}
              <div className="col-span-7 flex flex-col">
                {/* Input Display Box */}
                <div className="flex items-center border border-slate-300 rounded shadow-2xs overflow-hidden bg-white mb-3">
                  <input
                    type="text"
                    readOnly
                    value={discountInputDisplay}
                    className="w-full px-3 py-2 text-sm font-mono font-medium text-slate-900 bg-white outline-none cursor-default"
                  />
                  <span className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 border-l border-slate-300 select-none">
                    {discountActiveMode === 'DISCOUNT' || discountActiveMode === 'DISCOUNT_100' ? '%' : '$'}
                  </span>
                </div>

                {/* Numpad Container (Soft Gray background matching screenshot) */}
                <div className="bg-[#d2d6dc]/60 p-3 rounded-lg flex-1">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Rows 1-3: Digits 1-9 */}
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 rounded text-sm shadow-2xs text-center cursor-pointer active:scale-95 transition-all select-none"
                      >
                        {digit}
                      </button>
                    ))}

                    {/* Row 4: . , 0 , ⌫ */}
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('.')}
                      className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded text-sm shadow-2xs text-center cursor-pointer active:scale-95 transition-all select-none"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 rounded text-sm shadow-2xs text-center cursor-pointer active:scale-95 transition-all select-none"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className="bg-white hover:bg-slate-50 text-slate-800 py-2.5 rounded shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none"
                      title={t('backspace', 'Backspace')}
                    >
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6-7h12a1 1 0 011 1v12a1 1 0 01-1 1H9l-6-7z" />
                      </svg>
                    </button>

                    {/* Row 5: Clr. Discount (1 col) & Apply (2 cols) */}
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 rounded text-xs shadow-2xs text-center cursor-pointer active:scale-95 transition-all select-none"
                    >
                      {t('clr_discount', 'Clr. Discount')}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      className="col-span-2 bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 rounded text-xs shadow-2xs text-center cursor-pointer active:scale-95 transition-all select-none"
                    >
                      {t('apply', 'Apply')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STORE RECURRING MODAL (Matching Screenshot)                               */}
      {/* ========================================================================= */}
      {isStoreRecurringModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[620px] overflow-hidden flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-primary">{t('store_recurring_quotation', 'Store Recurring Quotation')}</h2>
              <button
                type="button"
                onClick={() => setIsStoreRecurringModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-normal text-slate-800 mb-2">
                  {t('quotation_recurring_description', 'Quotation Recurring Description')}
                </label>
                <input
                  type="text"
                  value={recurringDescription}
                  onChange={(e) => setRecurringDescription(e.target.value)}
                  className="w-full border-2 border-[#86b7fe] rounded-md px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  autoFocus
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!recurringDescription.trim()) {
                      notify('Please enter a description for recurring quotation.');
                      return;
                    }
                    const newTmpl: RecurringTemplate = {
                      id: `REC-${Date.now()}`,
                      title: recurringDescription.trim(),
                      code: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
                      customerName: customerType === 'Customer' ? (selectedCustomer?.name || customerSearch) : contactName,
                      branch: selectedBranch,
                      currency,
                      source: selectedSource,
                      notes: quotationNotes,
                      items: [...quotationItems],
                      itemsCount: quotationItems.length,
                      discountPercent,
                      discountAmount: calculatedDiscount,
                      totalUSD: grandTotalUSD,
                      totalLL: grandTotalLL,
                      isTaxEnabled,
                      date: new Date().toLocaleDateString('en-GB')
                    };
                    setRecurringTemplates((prev) => [newTmpl, ...prev]);
                    setIsStoreRecurringModalOpen(false);
                    notify(`Stored recurring quotation "${recurringDescription}" successfully.`);
                    setRecurringDescription('');
                  }}
                  className="bg-primary hover:bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save', 'Save')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLEAR CONFIRM MODAL (Audio 1)                                             */}
      {/* ========================================================================= */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col font-sans text-xs">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t('new_quotation', 'New Quotation')}</h3>
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="text-white hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-slate-700 text-sm">
              {t('are_you_sure_you_want_to_clear_changes', 'Are you sure you want to clear? Changes will not be saved')}
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearConfirmOpen(false);
                  handleNewQuotation();
                }}
                className="bg-primary hover:bg-primary text-white px-4 py-1.5 rounded font-semibold cursor-pointer transition-colors"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRM MODAL (Audio 3)                                            */}
      {/* ========================================================================= */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col font-sans text-xs">
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t('delete_quotation', 'Delete Quotation')}</h3>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-white hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-slate-700 text-sm">
              {t('are_you_sure_you_want_to_delete_this', 'Are you sure you want to delete this quotation?')}
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteQuotation}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded font-semibold cursor-pointer transition-colors"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECALL RECURRING / RECALL SALES MODAL (Audio 2)                           */}
      {/* ========================================================================= */}
      {isRecallRecurringModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col font-sans text-xs max-h-[85vh]">
            {/* Header */}
            <div className="bg-primary text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold">{t('recall_recurring_recall_sales', 'Recall Recurring / Recall Sales')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRecallRecurringModalOpen(false)}
                className="text-slate-300 hover:text-white text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {allRecallableSales.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  {t('no_recurring_templates_or_past_sales', 'No recurring templates or past sales quotations found.')}
                </div>
              ) : (
                allRecallableSales.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-slate-200 hover:border-blue-400 rounded-lg bg-slate-50/60 hover:bg-blue-50/30 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isRecurring ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.isRecurring ? 'Recurring Template' : 'Past Sale'}
                        </span>
                        <span className="font-bold text-slate-800 text-xs truncate">{item.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({item.code})</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>{t('customer', 'Customer:')}</strong> {item.customerName || 'N/A'}</span>
                        <span><strong>{t('branch', 'Branch:')}</strong> {item.branch}</span>
                        <span><strong>{t('date', 'Date:')}</strong> {item.date}</span>
                        <span><strong>{t('items', 'Items:')}</strong> {item.items?.length || 0}</span>
                        <span className="text-emerald-700 font-semibold font-mono">
                          {item.totalUSD.toFixed(2)} $ / {item.totalLL.toLocaleString()} L.L
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePickUpSale(item)}
                      className="bg-primary hover:bg-primary text-white px-3.5 py-1.5 rounded font-semibold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('pick_up', 'Pick Up')}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRecallRecurringModalOpen(false)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SAVE CONFIRM MODAL (Screenshot 1)                                      */}
      {/* ========================================================================= */}
      {isSaveConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col font-sans text-xs">
            <div className="p-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSaveConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pb-6 pt-1 text-slate-800 text-sm font-normal">
              {t('are_you_sure_you_want_to_save_this', 'Are you sure you want to save this quotation?')}
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 flex justify-end items-center gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsSaveConfirmModalOpen(false)}
                className="px-3 py-1.5 text-slate-700 hover:text-slate-900 font-normal text-xs cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="bg-[#374151] hover:bg-[#1f2937] text-white px-5 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRINT CONFIRM MODAL (Screenshot 2)                                     */}
      {/* ========================================================================= */}
      {isPrintConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden flex flex-col font-sans text-xs">
            <div className="p-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleConfirmPrintDecision(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="px-6 pb-6 pt-1 text-slate-800 text-sm font-normal">
              {t('do_you_want_to_print_the_quotation', 'Do you want to print the quotation ?')}
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 flex justify-end items-center gap-3 bg-white">
              <button
                type="button"
                onClick={() => handleConfirmPrintDecision(false)}
                className="px-3 py-1.5 text-slate-700 hover:text-slate-900 font-normal text-xs cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPrintDecision(true)}
                className="bg-[#374151] hover:bg-[#1f2937] text-white px-5 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEND SALES REPORT / EMAIL MODAL (Screenshot 7 & User Audio)            */}
      {/* ========================================================================= */}
      {isSendEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-[80] p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl overflow-visible flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-sm font-medium text-slate-700">{t('send_sales_report', 'Send Sales Report')}</h2>
              <button
                type="button"
                onClick={() => setIsSendEmailModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 font-bold text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              {/* To field */}
              <div>
                <label className="block text-slate-700 text-xs font-normal mb-1">{t('to', 'To')}</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* From field with searchable dropdown & custom entry */}
              <div className="relative">
                <label className="block text-slate-700 text-xs font-normal mb-1">{t('from', 'From')}</label>
                <div
                  onClick={() => setIsFromEmailDropdownOpen(!isFromEmailDropdownOpen)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between bg-white cursor-pointer shadow-2xs hover:border-blue-400"
                >
                  <span className={emailFrom ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                    {emailFrom || 'Select Email'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {emailFrom && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEmailFrom('');
                        }}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer text-[10px]"
                        title={t('clear_selection', 'Clear selection')}
                      >
                        ✕
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {isFromEmailDropdownOpen && (
                  <>
                    {/* Click outside to close */}
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsFromEmailDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-blue-400 rounded-md shadow-2xl z-50 p-2 font-sans animate-fade-in">
                      {/* Search Bar */}
                      <div className="flex items-center gap-1.5 border border-blue-300 rounded px-2.5 py-1.5 mb-2 bg-blue-50/40">
                        <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <input
                          type="text"
                          placeholder={t('search_email_or_enter_custom_email', 'Search email or enter custom email...')}
                          value={fromEmailSearch}
                          onChange={(e) => setFromEmailSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && fromEmailSearch.trim()) {
                              setEmailFrom(fromEmailSearch.trim());
                              setIsFromEmailDropdownOpen(false);
                              setFromEmailSearch('');
                            }
                          }}
                          className="w-full text-xs bg-transparent outline-none text-slate-800"
                          autoFocus
                        />
                        {fromEmailSearch.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setEmailFrom(fromEmailSearch.trim());
                              setIsFromEmailDropdownOpen(false);
                              setFromEmailSearch('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer shrink-0"
                          >
                            {t('select', 'Select')}
                          </button>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {COMPANY_EMAIL_OPTIONS.filter((m) =>
                          m.toLowerCase().includes(fromEmailSearch.toLowerCase())
                        ).map((mail) => (
                          <div
                            key={mail}
                            onClick={() => {
                              setEmailFrom(mail);
                              setIsFromEmailDropdownOpen(false);
                              setFromEmailSearch('');
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer rounded flex items-center justify-between transition-colors ${
                              emailFrom === mail
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{mail}</span>
                            {emailFrom === mail && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        ))}

                        {/* Custom email option if not in system */}
                        {fromEmailSearch.trim() && !COMPANY_EMAIL_OPTIONS.some(m => m.toLowerCase() === fromEmailSearch.trim().toLowerCase()) && (
                          <div
                            onClick={() => {
                              setEmailFrom(fromEmailSearch.trim());
                              setIsFromEmailDropdownOpen(false);
                              setFromEmailSearch('');
                            }}
                            className="px-3 py-2 text-xs text-blue-700 font-semibold hover:bg-blue-50 cursor-pointer rounded flex items-center gap-2 bg-blue-50/50"
                          >
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            <span>{t('use_custom_email', 'Use custom email:')} <strong className="font-mono underline">{fromEmailSearch.trim()}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Subject (Red outline per screenshot 7) */}
              <div>
                <label className="block text-slate-700 text-xs font-normal mb-1">{t('subject', 'Subject')}</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-red-400 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400 shadow-2xs"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-700 text-xs font-normal mb-1">{t('message', 'Message')}</label>
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs resize-y"
                />
              </div>
            </div>

            {/* Footer with Send Button */}
            <div className="px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={handleSendEmail}
                className="bg-[#374151] hover:bg-[#1f2937] text-white px-6 py-2 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('send', 'Send')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SAVE AS WINDOWS FILE EXPLORER DIALOG (Screenshot 1 & User Audio)       */}
      {/* ========================================================================= */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[85] p-2 animate-fade-in font-sans">
          <div className="bg-white rounded-t-lg shadow-2xl border border-slate-400 w-full max-w-5xl h-[82vh] max-h-[700px] flex flex-col text-xs select-none overflow-hidden">
            {/* Title Bar */}
            <div className="bg-[#f0f0f0] border-b border-slate-300 px-3 py-1.5 flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-normal text-xs">{t('save_as', 'Save As')}</span>
              </div>
              <div className="flex items-center">
                <button type="button" className="px-3 py-0.5 hover:bg-slate-200 text-slate-600 text-xs">─</button>
                <button type="button" className="px-3 py-0.5 hover:bg-slate-200 text-slate-600 text-xs">▢</button>
                <button
                  type="button"
                  onClick={() => setIsSaveAsModalOpen(false)}
                  className="px-3 py-0.5 hover:bg-red-600 hover:text-white text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Address Bar & Search Ribbon */}
            <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-500">
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-default">←</button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-default">→</button>
                <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer">↑</button>
              </div>

              {/* Breadcrumb Address Bar */}
              <div className="flex-1 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-white text-xs text-slate-700">
                <span className="text-slate-400">📁</span>
                <span className="text-slate-400">&gt;</span>
                <span className="hover:bg-slate-100 px-1 rounded cursor-pointer">{t('this_pc', 'This PC')}</span>
                <span className="text-slate-400">&gt;</span>
                <span className="hover:bg-slate-100 px-1 rounded cursor-pointer font-medium">{t('desktop', 'Desktop')}</span>
                <div className="ml-auto flex items-center gap-2 text-slate-400">
                  <ChevronDown className="w-3 h-3 cursor-pointer" />
                  <RotateCcw className="w-3 h-3 cursor-pointer hover:text-slate-600" />
                </div>
              </div>

              {/* Search Box */}
              <div className="w-64 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search_desktop', 'Search Desktop')}
                  value={saveAsSearch}
                  onChange={(e) => setSaveAsSearch(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Main File Explorer Body: Left Sidebar + Right Files Grid */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Navigation Tree */}
              <div className="w-56 border-r border-slate-200 bg-[#fbfbfb] p-2 overflow-y-auto text-[11px] space-y-1">
                {/* Quick Access */}
                <div className="font-semibold text-slate-700 flex items-center gap-1 px-1.5 py-0.5">
                  <span className="text-amber-500">★</span> {t('quick_access', 'Quick access')}
                </div>
                <div className="pl-4 space-y-0.5 text-slate-700">
                  <div className="px-2 py-1 rounded bg-muted border border-[#99d1ff] font-medium flex items-center gap-2 cursor-pointer">
                    <span>🖥️</span> {t('desktop', 'Desktop')}
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📥</span> {t('downloads', 'Downloads')}
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📄</span> {t('documents', 'Documents')}
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>🖼️</span> {t('pictures', 'Pictures')}
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> Google Drive (G:)
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> {t('southern_olive_and_oil_products', 'Southern Olive and Oil Products')}
                  </div>
                  <div className="px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> {t('vanguarderp', 'Vanguard-ERP')}
                  </div>
                </div>

                {/* OneDrive */}
                <div className="font-semibold text-slate-700 flex items-center gap-1 px-1.5 py-0.5 pt-2">
                  <span className="text-blue-500">☁️</span> {t('onedrive_personal', 'OneDrive - Personal')}
                </div>

                {/* This PC */}
                <div className="font-semibold text-slate-700 flex items-center gap-1 px-1.5 py-0.5 pt-2">
                  <span className="text-slate-600">💻</span> {t('this_pc', 'This PC')}
                </div>
                <div className="pl-4 space-y-0.5 text-slate-700">
                  <div className="px-2 py-0.5 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> {t('desktop', 'Desktop')}
                  </div>
                  <div className="px-2 py-0.5 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> {t('documents', 'Documents')}
                  </div>
                  <div className="px-2 py-0.5 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>📁</span> {t('downloads', 'Downloads')}
                  </div>
                  <div className="px-2 py-0.5 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>💾</span> Local Disk (C:)
                  </div>
                  <div className="px-2 py-0.5 rounded hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <span>💾</span> Local Disk (D:)
                  </div>
                </div>
              </div>

              {/* Right Files Table */}
              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-white border-b border-slate-200 sticky top-0 text-slate-600 select-none">
                    <tr>
                      <th className="py-1.5 px-3 font-normal border-r border-slate-200">{t('name', 'Name')}</th>
                      <th className="py-1.5 px-2 font-normal border-r border-slate-200 w-24">{t('date_modified', 'Date modified')}</th>
                      <th className="py-1.5 px-2 font-normal border-r border-slate-200 w-36">{t('type', 'Type')}</th>
                      <th className="py-1.5 px-2 font-normal w-16 text-right">{t('size', 'Size')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DESKTOP_ITEMS_PRESET.filter((item) =>
                      item.name.toLowerCase().includes(saveAsSearch.toLowerCase())
                    ).map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#e5f3ff] cursor-pointer text-slate-800 border-b border-slate-50 transition-colors"
                      >
                        <td className="py-1 px-3 flex items-center gap-2">
                          <span>{item.type.includes('PDF') ? '📕' : '📁'}</span>
                          <span className="truncate">{item.name}</span>
                        </td>
                        <td className="py-1 px-2 text-slate-500 whitespace-nowrap">{item.date}</td>
                        <td className="py-1 px-2 text-slate-500 truncate">{item.type}</td>
                        <td className="py-1 px-2 text-slate-500 text-right">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Form Fields & Action Buttons */}
            <div className="bg-[#f0f0f0] border-t border-slate-300 p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-2 text-right pr-2 text-slate-700 font-medium">{t('file_name', 'File name:')}</label>
                <div className="col-span-10">
                  <input
                    type="text"
                    value={saveAsFileName}
                    onChange={(e) => setSaveAsFileName(e.target.value)}
                    className="w-full bg-white border border-[#005a9e] rounded-xs px-2 py-1 text-xs outline-none shadow-inner text-slate-900"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-2 text-right pr-2 text-slate-700 font-medium">{t('save_as_type', 'Save as type:')}</label>
                <div className="col-span-10">
                  <div className="w-full bg-white border border-slate-300 rounded-xs px-2 py-1 text-xs text-slate-700 flex items-center justify-between">
                    <span>PDF Document (*.pdf)</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button type="button" className="text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1 cursor-pointer">
                  <span>▲</span> {t('hide_folders', 'Hide Folders')}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const doc = savedQuotationForPrint || quotationsList[0];
                      if (doc) {
                        downloadQuotationPdfFile(doc, saveAsFileName);
                      }
                      setIsSaveAsModalOpen(false);
                      notify(`Saved "${saveAsFileName}.pdf" to computer Downloads folder!`);
                    }}
                    className="bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-border text-slate-900 px-6 py-1 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                  >
                    {t('save', 'Save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSaveAsModalOpen(false)}
                    className="bg-[#e1e1e1] hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-border text-slate-900 px-6 py-1 rounded-xs text-xs font-normal cursor-pointer transition-colors"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GOOGLE DRIVE MODAL (Screenshot 2 & User Audio)                          */}
      {/* ========================================================================= */}
      {isGoogleDriveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[85] p-4 animate-fade-in font-sans">
          <div className="bg-[#1e1f20] text-white rounded-[20px] shadow-2xl border border-slate-700 w-full max-w-[460px] p-6 text-xs flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">{t('save_to_your_account', 'Save to your account')}</h3>
                <p className="text-slate-300 text-xs mt-1">
                  {t('find_your', 'Find your')} <strong className="text-white font-medium">{t('quotationspdf', 'Quotations.pdf')}</strong> {t('in_the', 'in the')} <span className="underline">{t('saved_from_chrome_folder', 'Saved from Chrome folder')}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#2a2b2e] px-2.5 py-1 rounded-lg border border-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H1.7c0 1.5.4 3 1.2 4.35l3.7 7z" fill="#0066da"/>
                  <path d="m43.65 25-12.3-21.3c-1.3.8-2.4 1.9-3.2 3.3L1.7 55.5h24.25L43.65 25z" fill="#00ac47"/>
                  <path d="m74.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l3.85-6.65 3.7-7c.8-1.35 1.2-2.85 1.2-4.35H62.25l12.3 21.3z" fill="#ea4335"/>
                  <path d="m43.65 25 12.3-21.3c-1.3-.8-2.85-1.2-4.35-1.2h-15.9c-1.5 0-3.05.4-4.35 1.2L43.65 25z" fill="#00832d"/>
                  <path d="m62.25 55.5-18.6-30.5L25.95 55.5h36.3z" fill="#2684fc"/>
                  <path d="m70.65 66.85-8.4-11.35H25.95l-8.4 11.35c-1.3.8-2.4 1.9-3.2 3.3l-3.85 6.65h65.8l-3.85-6.65c-.8-1.4-1.9-2.5-3.2-3.3z" fill="#ffba00"/>
                </svg>
                <span className="font-medium text-slate-200 text-[11px]">{t('drive', 'Drive')}</span>
              </div>
            </div>

            <div className="border-b border-slate-700/80 my-5" />

            {/* Profile Row */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#5c3d2e] text-white font-bold flex items-center justify-center text-lg shrink-0 select-none shadow-sm">
                m
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">{googleDriveName}</div>
                <div className="text-slate-400 text-xs truncate">{googleDriveAccount}</div>
              </div>
            </div>

            <div className="border-b border-slate-700/80 my-5" />

            {/* Direct Open Google Drive Link */}
            <div className="bg-[#2a2b2e] rounded-lg p-2.5 mb-4 flex items-center justify-between border border-slate-700/60">
              <span className="text-[11px] text-slate-300">{t('open_google_drive_in_your_browser', 'Open Google Drive in your browser:')}</span>
              <button
                type="button"
                onClick={() => {
                  window.open('https://drive.google.com/drive/my-drive', '_blank');
                  notify('Opening Google Drive in browser...');
                }}
                className="text-xs text-[#8ab4f8] hover:text-[#aecbfa] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>{t('drivegooglecom', 'drive.google.com')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    'https://accounts.google.com/v3/signin/identifier?flowName=GlifWebSignIn&flowEntry=AddSession&dsh=S1409398882:1788872082999641',
                    '_blank'
                  );
                  notify('Opening real Google Account sign-in...');
                }}
                className="border border-slate-600 hover:border-slate-400 text-slate-200 hover:bg-slate-800 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>{t('use_a_different_account', 'Use a different account')}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const doc = savedQuotationForPrint || quotationsList[0];
                    if (doc) {
                      downloadQuotationPdfFile(doc, 'Quotations.pdf');
                    }
                    window.open('https://drive.google.com/drive/my-drive', '_blank');
                    setIsGoogleDriveModalOpen(false);
                    notify(`Quotations.pdf downloaded to your computer and real Google Drive opened!`);
                  }}
                  className="bg-[#c2e7ff] hover:bg-[#a8daf7] text-[#001d35] font-semibold px-5 py-2 rounded-full text-xs cursor-pointer transition-colors shadow-sm"
                >
                  {t('save_to_drive', 'Save to Drive')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGoogleDriveModalOpen(false)}
                  className="hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors"
                >
                  {t('cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHROME-STYLE PRINT PREVIEW FULLSCREEN & SETTINGS (Screenshot 3)        */}
      {/* ========================================================================= */}
      {isChromePrintPreviewOpen && (
        <div className="fixed inset-0 bg-[#3c4043] z-[75] flex font-sans select-none overflow-hidden animate-fade-in">
          {/* Left Canvas Document Preview */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#525659]">
            {(() => {
              const doc = savedQuotationForPrint || quotationsList[0] || {
                id: 'QT-DEFAULT',
                quotationNo: '27',
                customerName: 'Mr Jad Youssef',
                phone: '0022236818688',
                branch: 'Zeit w zaytoun ljanoub',
                date: '08-Sep-26',
                currency: 'USD',
                notes: '',
                items: quotationItems.length > 0 ? quotationItems : [
                  {
                    id: 'ITEM-DEMO',
                    item: { code: 'VNG250ML', name: 'خل تفاح 250مل', price: 0.50, unit: 'BOT' } as any,
                    qty: 1,
                    unitPrice: 0.50,
                    discountPercent: 0,
                    total: 0.50
                  }
                ],
                grandTotalUSD: 0.50,
                grandTotalLL: 45000
              };

                return (
                <div
                  style={{
                    filter: printColor === 'Black and white' ? 'grayscale(100%)' : 'none'
                  }}
                  className={`bg-white shadow-2xl p-10 w-full text-slate-900 font-sans border border-slate-400 flex flex-col justify-between my-2 transition-all ${
                    printLayout === 'Landscape' ? 'max-w-[1060px] min-h-[720px]' : 'max-w-[800px] min-h-[1050px]'
                  }`}
                >
                  <div>
                    {/* Header: Clean Typography, NO logo */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 tracking-wider uppercase">{t('quotation', 'QUOTATION')}</span>
                        <span className="text-xs text-slate-600 font-medium">Branch: {doc.branch || 'Zeit w zaytoun ljanoub'}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">No: #{doc.quotationNo || '27'}</div>
                        <div className="text-xs text-slate-600">Date: {doc.date || '08-Sep-26'}</div>
                      </div>
                    </div>

                    {/* Customer Info and Quotation Info Boxes */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="border border-slate-700 rounded-xl p-3 min-h-[90px] text-xs space-y-1">
                        <div className="font-bold text-slate-900">
                          {t('contact', 'Contact:')} <span className="font-normal">{doc.customerName || 'Mr Jad Youssef'}</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          {t('mobile', 'Mobile:')} <span className="font-normal font-mono">{doc.phone || '0022236818688'}</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          {t('address', 'Address:')} <span className="font-normal">{t('saida_south_lebanon', 'Saida, South Lebanon')}</span>
                        </div>
                      </div>

                      <div className="border border-slate-700 rounded-xl p-3 min-h-[90px] text-xs space-y-1">
                        <div className="font-bold text-slate-900">
                          {t('quotation', 'Quotation #:')} <span className="font-normal">{doc.quotationNo || '27'}</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          {t('date', 'Date:')} <span className="font-normal">{doc.date || '08-Sep-26'}</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          {t('branch', 'Branch:')} <span className="font-normal">{doc.branch || 'Zeit w zaytoun ljanoub'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mt-6 border-collapse text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-800 text-slate-800 font-bold">
                          <th className="py-2 text-left w-12">{t('item', 'Item')}</th>
                          <th className="py-2 text-left">{t('description', 'Description')}</th>
                          <th className="py-2 text-center w-16">{t('unit', 'Unit')}</th>
                          <th className="py-2 text-right w-16">{t('qty', 'Qty')}</th>
                          <th className="py-2 text-right w-24">{t('unit_price', 'Unit Price $')}</th>
                          <th className="py-2 text-right w-16">{t('disc', 'Disc %')}</th>
                          <th className="py-2 text-right w-24">{t('total', 'Total $')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {doc.items.map((row: any, idx: number) => (
                          <tr key={row.id || idx} className="text-slate-800">
                            <td className="py-2 font-mono text-slate-600">{idx + 1}</td>
                            <td className="py-2 font-medium">{row.item?.name || 'خل تفاح 250مل'}</td>
                            <td className="py-2 text-center text-slate-600">{row.item?.unit || 'BOT'}</td>
                            <td className="py-2 text-right font-mono">{row.qty}</td>
                            <td className="py-2 text-right font-mono">{row.unitPrice.toFixed(2)}</td>
                            <td className="py-2 text-right font-mono">{row.discountPercent}%</td>
                            <td className="py-2 text-right font-mono font-semibold">{row.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Sidebar: Chrome Print Controls */}
          <div className="w-80 bg-[#202124] text-white flex flex-col justify-between border-l border-slate-700/80 p-5 overflow-y-auto text-xs shrink-0">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-sm font-semibold text-slate-100">{t('print', 'Print')}</span>
                <span className="text-slate-400 text-[11px]">1 sheet of paper</span>
              </div>

              {/* Destination */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">{t('destination', 'Destination')}</label>
                <div className="relative">
                  <select
                    value={printDestination}
                    onChange={(e) => setPrintDestination(e.target.value)}
                    className="w-full bg-[#2d2e31] border border-slate-600 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="HP LaserJet MFP M139-M142">{t('hp_laserjet_mfp_m139m142', 'HP LaserJet MFP M139-M142')}</option>
                    <option value="Save as PDF">{t('save_as_pdf', 'Save as PDF')}</option>
                    <option value="Microsoft Print to PDF">{t('microsoft_print_to_pdf', 'Microsoft Print to PDF')}</option>
                    <option value="Save to Google Drive">{t('save_to_google_drive', 'Save to Google Drive')}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Pages */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">{t('pages', 'Pages')}</label>
                <div className="relative">
                  <select
                    value={printPages}
                    onChange={(e) => setPrintPages(e.target.value)}
                    className="w-full bg-[#2d2e31] border border-slate-600 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="All">{t('all', 'All')}</option>
                    <option value="Custom">{t('custom', 'Custom')}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {printPages === 'Custom' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder={t('eg_12', 'e.g. 1-2')}
                      value={printPagesCustom}
                      onChange={(e) => setPrintPagesCustom(e.target.value)}
                      className="w-full bg-[#2d2e31] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Copies */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">{t('copies', 'Copies')}</label>
                <input
                  type="number"
                  min={1}
                  value={printCopies}
                  onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-[#2d2e31] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Layout */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">{t('layout', 'Layout')}</label>
                <div className="relative">
                  <select
                    value={printLayout}
                    onChange={(e) => setPrintLayout(e.target.value as any)}
                    className="w-full bg-[#2d2e31] border border-slate-600 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="Portrait">{t('portrait', 'Portrait')}</option>
                    <option value="Landscape">{t('landscape', 'Landscape')}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">{t('color', 'Color')}</label>
                <div className="relative">
                  <select
                    value={printColor}
                    onChange={(e) => setPrintColor(e.target.value as any)}
                    className="w-full bg-[#2d2e31] border border-slate-600 rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="Color">{t('color', 'Color')}</option>
                    <option value="Black and white">{t('black_and_white', 'Black and white')}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* More settings Accordion */}
              <div className="pt-2 border-t border-slate-700">
                <div
                  onClick={() => setPrintMoreSettingsOpen(!printMoreSettingsOpen)}
                  className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-1.5"
                >
                  <span className="font-medium text-xs">{t('more_settings', 'More settings')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${printMoreSettingsOpen ? 'rotate-180' : ''}`} />
                </div>

                {printMoreSettingsOpen && (
                  <div className="space-y-3.5 pt-2 animate-fade-in text-xs">
                    {/* Paper size */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] block">{t('paper_size', 'Paper size')}</label>
                      <select
                        value={printPaperSize}
                        onChange={(e) => setPrintPaperSize(e.target.value)}
                        className="w-full bg-[#2d2e31] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        {PAPER_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pages per sheet */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] block">{t('pages_per_sheet', 'Pages per sheet')}</label>
                      <select
                        value={printPagesPerSheet}
                        onChange={(e) => setPrintPagesPerSheet(parseInt(e.target.value))}
                        className="w-full bg-[#2d2e31] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        {PAGES_PER_SHEET_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Scale */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[11px] block">{t('scale', 'Scale')}</label>
                      <select
                        value={printScale}
                        onChange={(e) => setPrintScale(e.target.value)}
                        className="w-full bg-[#2d2e31] border border-slate-600 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        {SCALE_OPTIONS.map((sc) => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                      {printScale === 'Custom' && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="number"
                            value={printCustomScale}
                            onChange={(e) => setPrintCustomScale(parseInt(e.target.value) || 100)}
                            className="w-20 bg-[#2d2e31] border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          />
                          <span className="text-slate-400 text-xs">%</span>
                        </div>
                      )}
                    </div>

                    {/* Two-sided */}
                    <div className="space-y-1 pt-1">
                      <label className="text-slate-400 text-[11px] block">{t('twosided', 'Two-sided')}</label>
                      <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={printTwoSided}
                          onChange={(e) => setPrintTwoSided(e.target.checked)}
                          className="rounded border-slate-600 text-blue-500"
                        />
                        <span>{t('print_on_both_sides', 'Print on both sides')}</span>
                      </label>
                      {printTwoSided && (
                        <div className="pl-6 space-y-1 pt-1 text-slate-300">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="twoSidedFlip"
                              checked={printTwoSidedFlip === 'long'}
                              onChange={() => setPrintTwoSidedFlip('long')}
                            />
                            <span>{t('flip_on_long_edge', 'Flip on long edge')}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="twoSidedFlip"
                              checked={printTwoSidedFlip === 'short'}
                              onChange={() => setPrintTwoSidedFlip('short')}
                            />
                            <span>{t('flip_on_short_edge', 'Flip on short edge')}</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Print using system dialog link */}
                    <div className="pt-3 border-t border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => setIsSystemPrintModalOpen(true)}
                        className="text-[#8ab4f8] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <span>Print using system dialog... (Ctrl+Shift+P)</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-700 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChromePrintPreviewOpen(false)}
                className="border border-slate-600 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = savedQuotationForPrint || quotationsList[0];
                  if (printDestination === 'Save as PDF' || printDestination === 'Microsoft Print to PDF') {
                    if (doc) {
                      downloadQuotationPdfFile(doc, `Quotation_${doc.quotationNo || '27'}.pdf`);
                    }
                    setIsChromePrintPreviewOpen(false);
                    notify(`Saved Quotation_${doc?.quotationNo || '27'}.pdf to your computer Downloads!`);
                  } else if (printDestination === 'Save to Google Drive') {
                    if (doc) {
                      downloadQuotationPdfFile(doc, 'Quotations.pdf');
                    }
                    window.open('https://drive.google.com/drive/my-drive', '_blank');
                    setIsChromePrintPreviewOpen(false);
                    notify('Quotations.pdf downloaded to computer and real Google Drive opened!');
                  } else {
                    setIsChromePrintPreviewOpen(false);
                    window.print();
                    notify(`Printed to ${printDestination} (${printPaperSize}, ${printCopies} copy)`);
                  }
                }}
                className="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] px-6 py-2 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                {printDestination === 'Save as PDF' || printDestination === 'Microsoft Print to PDF'
                  ? 'Save'
                  : printDestination === 'Save to Google Drive'
                  ? 'Save to Drive'
                  : 'Print'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WINDOWS CLASSIC SYSTEM PRINT DIALOG (Screenshot 4 & User Audio)        */}
      {/* ========================================================================= */}
      {isSystemPrintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[90] p-4 animate-fade-in font-sans">
          <div className="bg-[#f0f0f0] border border-slate-400 shadow-2xl rounded-xs w-full max-w-[480px] text-xs text-slate-800 select-none overflow-hidden">
            {/* Title Bar */}
            <div className="bg-white px-3 py-1.5 flex items-center justify-between border-b border-slate-300">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="font-normal text-xs text-slate-800">{t('print', 'Print')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSystemPrintModalOpen(false)}
                className="hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-xs text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Strip */}
            <div className="px-3 pt-2 flex border-b border-slate-300 bg-[#f0f0f0]">
              <div className="bg-white border-t-2 border-l border-r border-slate-300 border-t-blue-600 px-4 py-1 rounded-t-xs text-xs font-medium text-slate-800 -mb-px">
                {t('general', 'General')}
              </div>
            </div>

            {/* Inner Body */}
            <div className="p-3 bg-white space-y-3">
              {/* Select Printer Fieldset */}
              <fieldset className="border border-slate-300 rounded p-2.5 space-y-2">
                <legend className="text-xs px-1 text-slate-700 font-normal">{t('select_printer', 'Select Printer')}</legend>

                {/* Printers Grid */}
                <div className="border border-slate-300 rounded bg-white h-28 overflow-y-auto p-1 divide-y divide-slate-100">
                  {SYSTEM_PRINTERS.map((prn) => (
                    <div
                      key={prn.name}
                      onClick={() => setSelectedSystemPrinter(prn.name)}
                      className={`px-2 py-1 flex items-center justify-between cursor-pointer rounded text-xs ${
                        selectedSystemPrinter === prn.name
                          ? 'bg-muted border border-[#99d1ff] text-slate-900 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>{prn.name}</span>
                      </div>
                      {prn.isDefault && (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Printer Details & Buttons */}
                <div className="flex items-start justify-between text-[11px] pt-1">
                  <div className="space-y-0.5 text-slate-600">
                    <div>{t('status', 'Status:')} <span className="font-normal text-slate-800">{t('ready', 'Ready')}</span></div>
                    <div>{t('location', 'Location:')}</div>
                    <div>{t('comment', 'Comment:')}</div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPreferencesModalOpen(true)}
                      className="w-24 bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border rounded px-2 py-1 text-xs text-slate-800 cursor-pointer shadow-2xs"
                    >
                      {t('preferences', 'Preferences')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFindPrinterModalOpen(true)}
                      className="w-24 bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border rounded px-2 py-1 text-xs text-slate-800 cursor-pointer shadow-2xs"
                    >
                      {t('find_printer', 'Find Printer...')}
                    </button>
                  </div>
                </div>
              </fieldset>

              {/* Bottom Row: Page Range & Number of copies */}
              <div className="grid grid-cols-2 gap-3">
                {/* Page Range */}
                <fieldset className="border border-slate-300 rounded p-2.5 space-y-1 text-xs">
                  <legend className="text-xs px-1 text-slate-700 font-normal">{t('page_range', 'Page Range')}</legend>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="pageRange"
                      checked={systemPageRange === 'all'}
                      onChange={() => setSystemPageRange('all')}
                    />
                    <span>{t('all', 'All')}</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-400 cursor-not-allowed">
                    <input type="radio" name="pageRange" disabled />
                    <span>{t('selection', 'Selection')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="pageRange"
                      checked={systemPageRange === 'current'}
                      onChange={() => setSystemPageRange('current')}
                    />
                    <span>{t('current_page', 'Current Page')}</span>
                  </label>
                  <div className="flex items-center gap-2 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="pageRange"
                        checked={systemPageRange === 'pages'}
                        onChange={() => setSystemPageRange('pages')}
                      />
                      <span>{t('pages', 'Pages:')}</span>
                    </label>
                    <input
                      type="text"
                      value={systemPagesInput}
                      onChange={(e) => {
                        setSystemPagesInput(e.target.value);
                        setSystemPageRange('pages');
                      }}
                      className="w-20 border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                    />
                  </div>
                </fieldset>

                {/* Number of Copies */}
                <fieldset className="border border-slate-300 rounded p-2.5 space-y-3 text-xs">
                  <legend className="text-xs px-1 text-slate-700 font-normal">{t('number_of_copies', 'Number of copies')}</legend>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">{t('number_of_copies', 'Number of copies:')}</span>
                    <input
                      type="number"
                      min={1}
                      value={systemCopies}
                      onChange={(e) => setSystemCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-slate-800 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={systemCollate}
                      onChange={(e) => setSystemCollate(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>{t('collate', 'Collate')}</span>
                  </label>
                </fieldset>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="bg-[#f0f0f0] border-t border-slate-300 px-4 py-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSystemPrintModalOpen(false);
                  setIsChromePrintPreviewOpen(false);
                  window.print();
                  notify(`Printed successfully to ${selectedSystemPrinter}`);
                }}
                className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-[#0078d7] text-slate-900 px-5 py-1 rounded-xs text-xs font-normal cursor-pointer shadow-2xs"
              >
                {t('print', 'Print')}
              </button>
              <button
                type="button"
                onClick={() => setIsSystemPrintModalOpen(false)}
                className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border text-slate-900 px-5 py-1 rounded-xs text-xs font-normal cursor-pointer shadow-2xs"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled
                className="bg-[#e1e1e1] border border-border text-slate-400 px-5 py-1 rounded-xs text-xs font-normal cursor-not-allowed opacity-60"
              >
                {t('apply', 'Apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4a. Printing Preferences Dialog (Audio 2: "في عندك Preferences مانها شغالة") */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[95] p-4 animate-fade-in font-sans">
          <div className="bg-[#f0f0f0] border border-slate-400 shadow-2xl rounded-xs w-full max-w-[440px] text-xs text-slate-800 select-none overflow-hidden">
            {/* Title Bar */}
            <div className="bg-white px-3 py-1.5 flex items-center justify-between border-b border-slate-300">
              <span className="font-normal text-xs text-slate-800 truncate">
                {selectedSystemPrinter} Printing Preferences
              </span>
              <button
                type="button"
                onClick={() => setIsPreferencesModalOpen(false)}
                className="hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-xs text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Strip */}
            <div className="px-3 pt-2 flex gap-1 border-b border-slate-300 bg-[#f0f0f0]">
              <button
                type="button"
                onClick={() => setPrefActiveTab('Layout')}
                className={`px-4 py-1 rounded-t-xs text-xs font-medium cursor-pointer transition-colors -mb-px ${
                  prefActiveTab === 'Layout'
                    ? 'bg-white border-t-2 border-l border-r border-slate-300 border-t-blue-600 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('layout', 'Layout')}
              </button>
              <button
                type="button"
                onClick={() => setPrefActiveTab('PaperQuality')}
                className={`px-4 py-1 rounded-t-xs text-xs font-medium cursor-pointer transition-colors -mb-px ${
                  prefActiveTab === 'PaperQuality'
                    ? 'bg-white border-t-2 border-l border-r border-slate-300 border-t-blue-600 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('paperquality', 'Paper/Quality')}
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-3 bg-white space-y-3">
              {prefActiveTab === 'Layout' ? (
                <div className="space-y-3">
                  <fieldset className="border border-slate-300 rounded p-2.5 space-y-2">
                    <legend className="text-xs px-1 text-slate-700">{t('orientation', 'Orientation')}</legend>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="prefOrientation"
                          checked={prefOrientation === 'Portrait'}
                          onChange={() => setPrefOrientation('Portrait')}
                        />
                        <span>{t('portrait', 'Portrait')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="prefOrientation"
                          checked={prefOrientation === 'Landscape'}
                          onChange={() => setPrefOrientation('Landscape')}
                        />
                        <span>{t('landscape', 'Landscape')}</span>
                      </label>
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 block mb-1">{t('print_on_both_sides', 'Print on Both Sides:')}</label>
                      <select
                        value={prefBothSides}
                        onChange={(e) => setPrefBothSides(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="None">{t('none', 'None')}</option>
                        <option value="Flip on Long Edge">{t('flip_on_long_edge', 'Flip on Long Edge')}</option>
                        <option value="Flip on Short Edge">{t('flip_on_short_edge', 'Flip on Short Edge')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">{t('page_order', 'Page Order:')}</label>
                      <select
                        value={prefPageOrder}
                        onChange={(e) => setPrefPageOrder(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="Front to Back">{t('front_to_back', 'Front to Back')}</option>
                        <option value="Back to Front">{t('back_to_front', 'Back to Front')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">{t('pages_per_sheet', 'Pages Per Sheet:')}</label>
                    <select
                      value={prefPagesPerSheet}
                      onChange={(e) => setPrefPagesPerSheet(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="1">1 page per sheet</option>
                      <option value="2">2 pages per sheet</option>
                      <option value="4">4 pages per sheet</option>
                      <option value="6">6 pages per sheet</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-700 block mb-1">{t('paper_source_tray', 'Paper Source / Tray:')}</label>
                    <select
                      value={prefPaperSource}
                      onChange={(e) => setPrefPaperSource(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="Automatically Select">{t('automatically_select', 'Automatically Select')}</option>
                      <option value="Tray 1 (Standard)">Tray 1 (Standard)</option>
                      <option value="Manual Feed Slot">{t('manual_feed_slot', 'Manual Feed Slot')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">{t('media_type', 'Media Type:')}</label>
                    <select
                      value={prefMedia}
                      onChange={(e) => setPrefMedia(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="Plain Paper">{t('plain_paper', 'Plain Paper')}</option>
                      <option value="Letterhead">{t('letterhead', 'Letterhead')}</option>
                      <option value="Heavy Cardstock">{t('heavy_cardstock', 'Heavy Cardstock')}</option>
                      <option value="Recycled">{t('recycled', 'Recycled')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">{t('print_quality', 'Print Quality:')}</label>
                    <select
                      value={prefQuality}
                      onChange={(e) => setPrefQuality(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="Draft (300 dpi)">Draft (300 dpi) - Fast Economical</option>
                      <option value="Normal (600 dpi)">Normal (600 dpi) - Standard</option>
                      <option value="Best (1200 dpi)">Best (1200 dpi) - High Definition</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="bg-[#f0f0f0] border-t border-slate-300 px-4 py-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPrintLayout(prefOrientation);
                  setIsPreferencesModalOpen(false);
                  notify(`Applied printing preferences for ${selectedSystemPrinter}: ${prefOrientation}, ${prefQuality}`);
                }}
                className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-[#0078d7] text-slate-900 px-5 py-1 rounded-xs text-xs font-normal cursor-pointer shadow-2xs"
              >
                {t('ok', 'OK')}
              </button>
              <button
                type="button"
                onClick={() => setIsPreferencesModalOpen(false)}
                className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border text-slate-900 px-5 py-1 rounded-xs text-xs font-normal cursor-pointer shadow-2xs"
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4b. Find Printers Dialog (Audio 2: "عندك Find Printer مانها شغالة") */}
      {isFindPrinterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[95] p-4 animate-fade-in font-sans">
          <div className="bg-[#f0f0f0] border border-slate-400 shadow-2xl rounded-xs w-full max-w-[520px] text-xs text-slate-800 select-none overflow-hidden">
            {/* Title Bar */}
            <div className="bg-white px-3 py-1.5 flex items-center justify-between border-b border-slate-300">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="font-normal text-xs text-slate-800">{t('find_printers', 'Find Printers')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFindPrinterModalOpen(false)}
                className="hover:bg-red-600 hover:text-white px-2 py-0.5 rounded-xs text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white space-y-3">
              {/* Search fields */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-slate-700 block text-[11px]">{t('name_or_ip_address', 'Name or IP Address:')}</label>
                  <input
                    type="text"
                    value={findPrinterName}
                    onChange={(e) => setFindPrinterName(e.target.value)}
                    placeholder={t('search_printer_name', 'Search printer name...')}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => notify('Scanning local network and USB ports...')}
                    className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border rounded px-3 py-1 text-xs cursor-pointer shadow-2xs font-medium"
                  >
                    {t('find_now', 'Find Now')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFindPrinterName('')}
                    className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border rounded px-3 py-1 text-xs cursor-pointer shadow-2xs"
                  >
                    {t('clear', 'Clear')}
                  </button>
                </div>
              </div>

              {/* Discovered Printers Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-300 px-2 py-1 font-semibold text-[11px] grid grid-cols-12 gap-1 text-slate-700">
                  <div className="col-span-5">{t('name', 'Name')}</div>
                  <div className="col-span-4">{t('port_location', 'Port / Location')}</div>
                  <div className="col-span-3 text-right">{t('status', 'Status')}</div>
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                  {[
                    { name: 'HP LaserJet MFP M139-M142', port: 'USB001', status: 'Ready' },
                    { name: 'Microsoft Print to PDF', port: 'PORTPROMPT:', status: 'Ready' },
                    { name: 'Epson EcoTank L3250 Series', port: '192.168.1.145', status: 'Ready' },
                    { name: 'Canon imageRUNNER 2520', port: '192.168.1.120', status: 'Ready' },
                    { name: 'OneNote (Desktop)', port: 'nul:', status: 'Ready' }
                  ]
                    .filter((p) => p.name.toLowerCase().includes(findPrinterName.toLowerCase()))
                    .map((printer) => (
                      <div
                        key={printer.name}
                        onClick={() => {
                          setSelectedSystemPrinter(printer.name);
                          setPrintDestination(printer.name);
                          setIsFindPrinterModalOpen(false);
                          notify(`Selected printer: ${printer.name}`);
                        }}
                        className={`px-2 py-1.5 grid grid-cols-12 gap-1 items-center cursor-pointer text-xs ${
                          selectedSystemPrinter === printer.name
                            ? 'bg-muted text-slate-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-1.5 truncate">
                          <Printer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{printer.name}</span>
                        </div>
                        <div className="col-span-4 text-slate-500 font-mono text-[11px] truncate">{printer.port}</div>
                        <div className="col-span-3 text-right text-emerald-600 font-medium text-[11px]">{printer.status}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="bg-[#f0f0f0] border-t border-slate-300 px-4 py-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFindPrinterModalOpen(false)}
                className="bg-[#e1e1e1] hover:bg-[#e5f1fb] border border-border text-slate-900 px-5 py-1 rounded-xs text-xs font-normal cursor-pointer shadow-2xs"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AUTHENTIC QUOTATION PRINT & PDF VIEWER (Screenshots 3, 4, 5)            */}
      {/* ========================================================================= */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xs z-[60] flex flex-col font-sans select-none overflow-hidden animate-fade-in">
          {/* Top Action Bar (Above PDF toolbar) */}
          <div className="bg-background border-b border-slate-300 px-4 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              {/* Export Button (Downloads quotation PDF directly to Downloads folder) */}
              <button
                type="button"
                onClick={() => {
                  const doc = savedQuotationForPrint || quotationsList[0];
                  if (doc) {
                    downloadQuotationPdfFile(doc, `Quotation_${doc.quotationNo || 'Export'}.pdf`);
                    notify(`Quotation_${doc.quotationNo || 'Export'}.pdf downloaded to your computer!`);
                  } else {
                    notify('No quotation selected to export.');
                  }
                }}
                className="bg-primary hover:bg-primary text-white px-3 py-1 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('export', 'Export')}</span>
              </button>

              {/* Send Email Button */}
              <button
                type="button"
                onClick={() => {
                  setEmailTo('');
                  setEmailFrom('');
                  setEmailSubject('');
                  setEmailMessage('Please find attached the quotation invoice');
                  setIsFromEmailDropdownOpen(false);
                  setFromEmailSearch('');
                  setIsSendEmailModalOpen(true);
                }}
                className="bg-primary hover:bg-primary text-white px-3 py-1 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('send_email', 'Send Email')}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(false)}
                className="bg-destructive hover:bg-destructive text-white px-3 py-1 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('close', 'Close')}</span>
              </button>
            </div>

            <div className="text-xs text-blue-600 hover:underline cursor-pointer">
              {t('watch_tutorial', 'Watch Tutorial')}
            </div>
          </div>

          {/* Embedded PDF Toolbar (Dark Theme #323639) */}
          <div className="bg-[#323639] text-slate-200 px-4 py-2 flex items-center justify-between border-b border-slate-700 text-xs">
            {/* Left: Hamburger menu & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title={showThumbnails ? 'Hide thumbnail sidebar' : 'Show thumbnail sidebar'}
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="text-slate-300 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                {savedQuotationForPrint?.quotationNo || 'QT-2026-0043'}&amp;0&amp;1&amp;html&amp;quotation.pdf
              </div>
            </div>

            {/* Center: Page Count & Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-mono text-xs">1 / 1</span>
              <div className="h-4 w-px bg-slate-600 mx-1" />

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setPdfZoom((prev) => Math.max(60, prev - 10))}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title={t('zoom_out', 'Zoom Out')}
              >
                -
              </button>
              <span className="text-slate-300 font-mono text-xs w-10 text-center">{pdfZoom}%</span>
              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setPdfZoom((prev) => Math.min(160, prev + 10))}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title={t('zoom_in', 'Zoom In')}
              >
                +
              </button>

              <div className="h-4 w-px bg-slate-600 mx-1" />

              {/* Rotate Counter-Clockwise */}
              <button
                type="button"
                onClick={() => setPdfRotation((prev) => (prev + 270) % 360)}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title={t('rotate_counterclockwise', 'Rotate counter-clockwise')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Actions, Print, Download, Google Drive */}
            <div className="flex items-center gap-2 relative">
              {/* Three dots menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThreeDotsMenuOpen(!isThreeDotsMenuOpen)}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title={t('more_actions', 'More actions')}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {isThreeDotsMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-[#282a2d] border border-slate-700 rounded shadow-xl py-1 z-50 text-xs font-sans text-slate-200">
                    <div
                      onClick={() => {
                        setIsThreeDotsMenuOpen(false);
                        notify('Two page view toggled.');
                      }}
                      className="px-3 py-1.5 hover:bg-slate-700 cursor-pointer"
                    >
                      {t('two_page_view', 'Two page view')}
                    </div>
                    <div
                      onClick={() => {
                        setIsThreeDotsMenuOpen(false);
                        notify('Annotation mode ready.');
                      }}
                      className="px-3 py-1.5 hover:bg-slate-700 cursor-pointer"
                    >
                      {t('annotation', 'Annotation')}
                    </div>
                    <div
                      onClick={() => {
                        setIsThreeDotsMenuOpen(false);
                        if (!document.fullscreenElement) {
                          document.documentElement.requestFullscreen().catch(() => {});
                        } else {
                          document.exitFullscreen().catch(() => {});
                        }
                      }}
                      className="px-3 py-1.5 hover:bg-slate-700 cursor-pointer"
                    >
                      {t('present', 'Present')}
                    </div>
                    <div
                      onClick={() => {
                        setIsThreeDotsMenuOpen(false);
                        alert(`Document Properties:\n\nQuotation: ${savedQuotationForPrint?.quotationNo || 'QT-2026-0043'}\nCreated: ${savedQuotationForPrint?.date || '08-Sep-2026'}\nCustomer: ${savedQuotationForPrint?.customerName || 'N/A'}\nSystem: Vanguard ERP - Southern Olive Oil`);
                      }}
                      className="px-3 py-1.5 hover:bg-slate-700 cursor-pointer border-t border-slate-700"
                    >
                      {t('document_properties', 'Document properties')}
                    </div>
                  </div>
                )}
              </div>

              {/* Print Button (Opens Chrome-Style Print Preview matching Screenshot 3) */}
              <button
                type="button"
                onClick={() => setIsChromePrintPreviewOpen(true)}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title={t('print_quotation', 'Print Quotation')}
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Download Button (Downloads PDF directly to computer and opens Save As) */}
              <button
                type="button"
                onClick={() => {
                  const doc = savedQuotationForPrint || quotationsList[0];
                  if (doc) {
                    downloadQuotationPdfFile(doc, `Quotation_${doc.quotationNo || '40720351'}.pdf`);
                    notify(`Quotation_${doc.quotationNo || '40720351'}.pdf downloaded to your computer!`);
                  }
                  setSaveAsFileName(savedQuotationForPrint?.quotationNo ? `Quotation_${savedQuotationForPrint.quotationNo}` : 'Quotation_40720351');
                  setIsSaveAsModalOpen(true);
                }}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title={t('download_pdf', 'Download PDF')}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Save to Google Drive (Downloads file and opens real Google Drive in browser) */}
              <button
                type="button"
                onClick={() => {
                  const doc = savedQuotationForPrint || quotationsList[0];
                  if (doc) {
                    downloadQuotationPdfFile(doc, 'Quotations.pdf');
                  }
                  window.open('https://drive.google.com/drive/my-drive', '_blank');
                  setIsGoogleDriveModalOpen(true);
                  notify('Quotations.pdf downloaded to computer and real Google Drive opened!');
                }}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors flex items-center justify-center"
                title={t('save_to_google_drive', 'Save to Google Drive')}
              >
                <svg className="w-4 h-4" viewBox="0 0 87.3 78" fill="none">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H1.7c0 1.5.4 3 1.2 4.35l3.7 7z" fill="#0066da"/>
                  <path d="m43.65 25-12.3-21.3c-1.3.8-2.4 1.9-3.2 3.3L1.7 55.5h24.25L43.65 25z" fill="#00ac47"/>
                  <path d="m74.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l3.85-6.65 3.7-7c.8-1.35 1.2-2.85 1.2-4.35H62.25l12.3 21.3z" fill="#ea4335"/>
                  <path d="m43.65 25 12.3-21.3c-1.3-.8-2.85-1.2-4.35-1.2h-15.9c-1.5 0-3.05.4-4.35 1.2L43.65 25z" fill="#00832d"/>
                  <path d="m62.25 55.5-18.6-30.5L25.95 55.5h36.3z" fill="#2684fc"/>
                  <path d="m70.65 66.85-8.4-11.35H25.95l-8.4 11.35c-1.3.8-2.4 1.9-3.2 3.3l-3.85 6.65h65.8l-3.85-6.65c-.8-1.4-1.9-2.5-3.2-3.3z" fill="#ffba00"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Viewer Body: Left Sidebar + Center Document Canvas */}
          <div className="flex-1 flex overflow-hidden relative bg-[#525659]">
            {/* Left Thumbnail Sidebar */}
            {showThumbnails && (
              <div className="w-44 bg-[#26292b] border-r border-slate-700 p-4 flex flex-col items-center gap-3 overflow-y-auto shrink-0 animate-fade-in">
                <div className="p-1 border-2 border-blue-500 rounded bg-white shadow-md cursor-pointer transform hover:scale-105 transition-transform w-28 h-36 overflow-hidden flex flex-col justify-between">
                  <div className="scale-[0.25] origin-top-left w-[400%] p-2 pointer-events-none">
                    <div className="w-16 h-8 bg-yellow-300 rounded-full mx-auto" />
                    <div className="text-center font-bold text-base mt-2">{t('quotation', 'Quotation')}</div>
                    <div className="h-4 bg-slate-200 mt-2 rounded" />
                    <div className="h-4 bg-slate-200 mt-1 rounded" />
                  </div>
                </div>
                <span className="text-slate-300 text-xs font-mono">1</span>
              </div>
            )}

            {/* Center Document Sheet Canvas */}
            <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
              {(() => {
                const doc = savedQuotationForPrint || quotationsList[0] || {
                  id: 'QT-DEFAULT',
                  quotationNo: '28',
                  customerName: 'Mauritania Mauritania',
                  phone: '0022236818688',
                  branch: 'Zeit w zaytoun ljanoub',
                  date: '08-Sep-26',
                  currency: 'USD',
                  notes: '',
                  items: quotationItems.length > 0 ? quotationItems : [
                    {
                      id: 'ITEM-DEMO',
                      item: { code: 'AGT', name: 'حمص 1 كغ AGT', price: 2.22, unit: 'KG' } as any,
                      qty: 1,
                      unitPrice: 2.22,
                      discountPercent: 0,
                      total: 2.22
                    }
                  ],
                  grandTotalUSD: 2.22,
                  grandTotalLL: 199800
                };

                return (
                  <div
                    style={{
                      transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease'
                    }}
                    className="bg-white shadow-2xl p-10 max-w-[840px] w-full min-h-[1120px] text-slate-900 font-sans border border-slate-300 flex flex-col justify-between relative my-4"
                  >
                    {/* Top Sheet Header */}
                    <div>
                      {/* Logo and Quotation Title */}
                      <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-slate-900 tracking-wider uppercase">{t('quotation', 'QUOTATION')}</span>
                          <span className="text-xs text-slate-600 font-medium">Branch: {doc.branch || 'Zeit w zaytoun ljanoub'}</span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">No: #{doc.quotationNo || '28'}</div>
                          <div className="text-xs text-slate-600">Date: {doc.date || '08-Sep-26'}</div>
                        </div>
                      </div>

                      {/* Customer & Quotation Details Boxes (Matching Screenshot 3 & 4) */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {/* Left Customer Box */}
                        <div className="border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{t('customer', 'Customer:')}</span>
                            <span className="text-slate-800 font-medium">{doc.customerName || 'Mauritania Mauritania'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{t('mobile', 'Mobile:')}</span>
                            <span className="text-slate-800 font-mono">{doc.phone || '0022236818688'}</span>
                          </div>
                        </div>

                        {/* Right Quotation Details Box */}
                        <div className="border border-slate-800 rounded-2xl p-4 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{t('date', 'Date:')}</span>
                            <span className="font-mono text-slate-800">{doc.date || '08-Sep-26'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{t('quotation', 'Quotation #:')}</span>
                            <span className="font-mono text-slate-800">{doc.quotationNo.replace('QT-2026-', '') || '28'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{t('currency', 'Currency:')}</span>
                            <span className="font-mono font-bold text-slate-800">{doc.currency || 'USD'}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-slate-900">{t('payment_type', 'Payment Type:')}</span>
                            <span className="font-mono text-slate-800">{t('cash', 'CASH')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div className="mt-6 border-t-2 border-slate-800 pt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-900">
                              <th className="py-2 text-center w-12">{t('qty', 'Qty')}</th>
                              <th className="py-2 text-left">{t('description', 'Description')}</th>
                              <th className="py-2 text-center w-16">{t('unit', 'Unit')}</th>
                              <th className="py-2 text-right w-20">{t('unit_price', 'Unit Price')}</th>
                              <th className="py-2 text-right w-16">{t('tax', 'Tax')}</th>
                              <th className="py-2 text-right w-24">{t('total_price', 'Total Price')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {doc.items && doc.items.length > 0 ? (
                              doc.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2 text-center font-bold text-slate-800">{item.qty}</td>
                                  <td className="py-2 text-left font-sans text-slate-800">
                                    <span>{item.item?.name || 'Item'}</span>
                                    {item.item?.code && (
                                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({item.item.code})</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-center text-slate-600">{item.item?.unit || 'KG'}</td>
                                  <td className="py-2 text-right text-slate-700">{item.unitPrice.toFixed(2)}</td>
                                  <td className="py-2 text-right text-slate-400">0.00</td>
                                  <td className="py-2 text-right font-bold text-slate-900">{item.total.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-4 text-center text-slate-400 font-sans">
                                  {t('no_items_in_quotation', 'No items in quotation.')}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals & Notes Section */}
                      <div className="mt-6 flex items-start justify-between">
                        {/* Notes and Words */}
                        <div className="space-y-4 max-w-sm">
                          <div className="text-xs">
                            <span className="font-bold text-slate-900">{t('note', 'Note')}</span>
                            <div className="text-slate-600 mt-0.5 text-[11px]">{doc.notes || ''}</div>
                          </div>
                          <div className="text-xs font-mono text-slate-700">
                            {`Only ${numberToEnglishWords(Math.round(doc.grandTotalLL || (doc.grandTotalUSD * 89500)))} LBP`}
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {t('credit_limit', 'Credit Limit :')} <span className="font-normal font-mono">0.00</span>
                          </div>
                        </div>

                        {/* Grand Total Box */}
                        <div className="border border-slate-800 rounded-xl px-5 py-2.5 flex items-center gap-6 min-w-[240px] justify-between">
                          <span className="font-bold text-xs text-slate-900">Grand Total &nbsp; $ &nbsp; :</span>
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {doc.grandTotalUSD.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Document Page Indicator */}
                    <div className="mt-20 pt-4 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>null</span>
                      <span>{t('page_1_of_1', 'Page 1 of 1')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Floating Acrobat Red Badge (Matching bottom-right in screenshots) */}
            <div className="absolute bottom-5 right-6 z-30">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAcrobatMenuOpen(!isAcrobatMenuOpen)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center font-bold text-red-600 text-[10px]">
                    A
                  </div>
                  <span className="text-xs font-semibold">{t('open_in_acrobat', 'Open in Acrobat')}</span>
                  <ChevronUp className="w-3.5 h-3.5 text-white/80" />
                </button>

                {isAcrobatMenuOpen && (
                  <div className="absolute bottom-12 right-0 w-48 bg-[#282a2d] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 font-sans">
                    <div
                      onClick={() => {
                        setIsAcrobatMenuOpen(false);
                        window.print();
                      }}
                      className="px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                    >
                      <span>{t('open_pdf_in_acrobat', 'Open PDF in Acrobat')}</span>
                    </div>
                    <div
                      onClick={() => {
                        setIsAcrobatMenuOpen(false);
                        notify('Acrobat icon hidden.');
                      }}
                      className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                    >
                      <span>{t('hide_icon_for_now', 'Hide icon for now')}</span>
                    </div>
                    <div
                      onClick={() => {
                        setIsAcrobatMenuOpen(false);
                        alert('Acrobat Preferences:\n• Preferred Reader: Adobe Acrobat Pro\n• Auto-open on print: Enabled');
                      }}
                      className="px-3 py-2 hover:bg-slate-700 cursor-pointer border-t border-slate-700 text-slate-400"
                    >
                      <span>{t('manage_preferences', 'Manage preferences')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="bg-background border-t border-slate-300 py-1 px-4 text-center text-[10px] text-slate-500 font-sans">
            <span>{t('copyright_vanguard', '© 2026 Vanguard ERP. All rights reserved.')}</span> &nbsp;|&nbsp; 
            <a href="#privacy" className="hover:underline">{t('privacy_policy', 'Privacy Policy')}</a> &nbsp;|&nbsp; 
            <a href="#terms" className="hover:underline">{t('terms_conditions', 'Terms and Conditions')}</a> &nbsp;|&nbsp; 
            <a href="#support" className="hover:underline">{t('support', 'Support')}</a> &nbsp;|&nbsp; 
            <a href="#feedback" className="hover:underline">{t('feedback', 'Feedback')}</a>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* OPTIONS / DEFAULT CONFIGURATION MODAL (Screenshots 1, 2, 3)               */}
      {/* ========================================================================= */}
      {isDefaultConfigModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[620px] overflow-hidden flex flex-col font-sans text-xs">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-slate-700">{t('options', 'Options')}</h2>
              <button
                type="button"
                onClick={() => setIsDefaultConfigModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xs font-bold text-[#2a4365] mb-2">{t('default_values', 'Default Values')}</h3>

              {/* 1. Default Branch */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('default_branch', 'Default Branch')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 2. Default Currency */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('default_currency', 'Default Currency')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="USD">{t('usd', 'USD')}</option>
                    <option value="EUR">{t('eur', 'EUR')}</option>
                    <option value="LBP">{t('lbp', 'LBP')}</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 3. Default Payment */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('default_payment', 'Default Payment')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={defaultPayment}
                    onChange={(e) => setDefaultPayment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {PAYMENT_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 4. Default Salesman */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('default_salesman', 'Default Salesman')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={defaultSalesman}
                    onChange={(e) => setDefaultSalesman(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {SALESMAN_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 5. Default Department */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('default_department', 'Default Department')}</label>
                <div className="col-span-8 relative">
                  <select
                    value={defaultDepartment}
                    onChange={(e) => setDefaultDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* 6. Printer Type (Screenshots 1 & 3) */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('printer_type', 'Printer Type')}</label>
                <div className="col-span-8 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrinterTypeDropdownOpen(!isPrinterTypeDropdownOpen);
                      setIsPrintOnSaveDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between cursor-pointer shadow-2xs text-left"
                  >
                    <span>{defaultPrinterType}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Searchable Dropdown Popover (Screenshot 3) */}
                  {isPrinterTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border-2 border-blue-400 rounded-md shadow-2xl p-1 z-30 animate-fade-in">
                      <div className="p-1">
                        <input
                          type="text"
                          placeholder={t('search', 'Search...')}
                          value={printerTypeSearch}
                          onChange={(e) => setPrinterTypeSearch(e.target.value)}
                          className="w-full border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="mt-1 max-h-36 overflow-y-auto">
                        {PRINTER_TYPE_OPTIONS.filter((p) =>
                          p.toLowerCase().includes(printerTypeSearch.toLowerCase())
                        ).map((p) => (
                          <div
                            key={p}
                            onClick={() => {
                              setDefaultPrinterType(p);
                              setIsPrinterTypeDropdownOpen(false);
                              setPrinterTypeSearch('');
                            }}
                            className={`px-3 py-1.5 rounded text-xs cursor-pointer ${
                              defaultPrinterType === p
                                ? 'bg-primary text-white font-semibold'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Print Report on Save (Screenshots 1 & 2) */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('print_report_on_save', 'Print Report on Save')}</label>
                <div className="col-span-8 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintOnSaveDropdownOpen(!isPrintOnSaveDropdownOpen);
                      setIsPrinterTypeDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between cursor-pointer shadow-2xs text-left"
                  >
                    <span>{defaultPrintReportOnSave}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Searchable Dropdown Popover (Screenshot 2) */}
                  {isPrintOnSaveDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border-2 border-blue-400 rounded-md shadow-2xl p-1 z-30 animate-fade-in">
                      <div className="p-1">
                        <input
                          type="text"
                          placeholder={t('search', 'Search...')}
                          value={printOnSaveSearch}
                          onChange={(e) => setPrintOnSaveSearch(e.target.value)}
                          className="w-full border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="mt-1 max-h-36 overflow-y-auto">
                        {PRINT_ON_SAVE_OPTIONS.filter((o) =>
                          o.toLowerCase().includes(printOnSaveSearch.toLowerCase())
                        ).map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setDefaultPrintReportOnSave(opt);
                              setIsPrintOnSaveDropdownOpen(false);
                              setPrintOnSaveSearch('');
                            }}
                            className={`px-3 py-1.5 rounded text-xs cursor-pointer ${
                              defaultPrintReportOnSave === opt
                                ? 'bg-primary text-white font-semibold'
                                : 'text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 8. Sales Report Footer */}
              <div className="grid grid-cols-12 gap-3 items-start">
                <label className="col-span-4 font-bold text-slate-800 text-xs pt-1.5">{t('sales_report_footer', 'Sales Report Footer')}</label>
                <div className="col-span-8">
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={salesReportFooter}
                    onChange={(e) => setSalesReportFooter(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Button (Matching Screenshot) */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDefaultConfigModalOpen(false);
                    setSelectedBranch(defaultBranch);
                    setCurrency(defaultCurrency as any);
                    notify('Default values saved successfully.');
                  }}
                  className="bg-primary hover:bg-primary text-white px-4 py-2 rounded text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('save_default_values', 'Save Default Values')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SETTINGS MODAL (Screenshots 1 & 2)                                        */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[580px] overflow-visible flex flex-col font-sans text-xs relative">
            {/* Header */}
            <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200 rounded-t-xl bg-white">
              <h2 className="text-base font-normal text-slate-700">{t('settings', 'Settings')}</h2>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-4 text-xs overflow-visible rounded-b-xl pb-10">
              {/* 1. Mark Up(%) */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <label className="col-span-4 font-bold text-slate-800 text-xs">Mark Up(%)</label>
                <div className="col-span-8">
                  <input
                    type="number"
                    min={0}
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 2. Apply Markup On Item Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="applyMarkupOnItem"
                  checked={applyMarkupOnItem}
                  onChange={(e) => {
                    setApplyMarkupOnItem(e.target.checked);
                    notify(e.target.checked ? 'Markup will apply to items' : 'Markup disabled on items');
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="applyMarkupOnItem" className="text-slate-800 font-normal text-xs cursor-pointer select-none">
                  {t('apply_markup_on_item', 'Apply Markup On Item')}
                </label>
              </div>

              {/* 3. Calculate mark-up based on: */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <span className="text-slate-800 font-normal text-xs">{t('calculate_markup_based_on', 'Calculate mark-up based on:')}</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 text-xs select-none">
                    <input
                      type="radio"
                      name="markupBasis"
                      value="Average Cost"
                      checked={markupBasis === 'Average Cost'}
                      onChange={() => setMarkupBasis('Average Cost')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{t('average_cost', 'Average Cost')}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 text-xs select-none">
                    <input
                      type="radio"
                      name="markupBasis"
                      value="Unit Cost"
                      checked={markupBasis === 'Unit Cost'}
                      onChange={() => setMarkupBasis('Unit Cost')}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{t('unit_cost', 'Unit Cost')}</span>
                  </label>
                </div>
              </div>

              {/* 4. Selling Price (Screenshots 1 & 2) */}
              <div className="grid grid-cols-12 gap-3 items-center pt-1 pb-1">
                <label className="col-span-4 font-bold text-slate-800 text-xs">{t('selling_price', 'Selling Price')}</label>
                <div className="col-span-8 relative">
                  <button
                    type="button"
                    onClick={() => setIsSellingPriceDropdownOpen(!isSellingPriceDropdownOpen)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 flex items-center justify-between cursor-pointer shadow-2xs text-left"
                  >
                    <span>{sellingPriceTier}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Searchable Dropdown Popover (Screenshot 2) */}
                  {isSellingPriceDropdownOpen && (
                    <>
                      {/* Transparent click-outside dismiss backdrop */}
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsSellingPriceDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#86b7fe] rounded-md shadow-2xl p-1 z-50 animate-fade-in">
                        <div className="p-1">
                          <input
                            type="text"
                            placeholder={t('search', 'Search...')}
                            value={sellingPriceSearch}
                            onChange={(e) => setSellingPriceSearch(e.target.value)}
                            className="w-full border border-blue-400 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                        <div className="mt-1 max-h-48 overflow-y-auto">
                          {SELLING_PRICE_OPTIONS.filter((p) =>
                            p.toLowerCase().includes(sellingPriceSearch.toLowerCase())
                          ).map((p) => (
                            <div
                              key={p}
                              onClick={() => {
                                setSellingPriceTier(p);
                                setIsSellingPriceDropdownOpen(false);
                                setSellingPriceSearch('');
                                notify(`Selling price tier set to ${p}`);
                              }}
                              className={`px-3 py-1.5 rounded text-xs cursor-pointer select-none transition-colors ${
                                sellingPriceTier === p
                                  ? 'bg-primary text-white font-semibold'
                                  : 'text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {p}
                            </div>
                          ))}
                          {SELLING_PRICE_OPTIONS.filter((p) =>
                            p.toLowerCase().includes(sellingPriceSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="px-3 py-2 text-xs text-slate-400 text-center">
                              {t('no_matching_selling_price', 'No matching selling price')}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
