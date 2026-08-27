'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export interface DataRow {
  id: string;
  name: string;
  code?: string;
  category?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  updatedAt?: string;
}

interface GenericDataTableProps {
  title: string;
  description?: string;
  initialData?: DataRow[];
  onAddNew?: () => void;
  onEdit?: (row: DataRow) => void;
  onDelete?: (rowId: string) => void;
  onBack?: () => void;
}

const DEFAULT_MOCK_ROWS: Record<string, DataRow[]> = {
  'Screens': [
    { id: 'SCR-001', name: 'Main POS Cashier Layout', code: 'POS_MAIN_01', category: 'Touchscreen', status: 'Active', updatedAt: '2026-08-20' },
    { id: 'SCR-002', name: 'Drive-Thru Express Terminal', code: 'POS_DRIVE_02', category: 'Dual Display', status: 'Active', updatedAt: '2026-08-22' },
    { id: 'SCR-003', name: 'Kitchen Display System (KDS)', code: 'KDS_PREP_01', category: 'Kitchen Order', status: 'Active', updatedAt: '2026-08-18' },
    { id: 'SCR-004', name: 'Self-Service Kiosk Terminal', code: 'KIOSK_ENTRY', category: 'Self Checkout', status: 'Pending', updatedAt: '2026-08-24' }
  ],
  'Payment Types': [
    { id: 'PAY-001', name: 'Cash USD ($)', code: 'CASH_USD', category: 'Currency', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'PAY-002', name: 'Cash LBP (ل.ل)', code: 'CASH_LBP', category: 'Local Currency', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'PAY-003', name: 'Credit Card (Visa / Mastercard)', code: 'CC_TERMINAL', category: 'Electronic Card', status: 'Active', updatedAt: '2026-08-21' },
    { id: 'PAY-004', name: 'Wholesale Debt Account (Credit)', code: 'ACC_DEBT', category: 'Account Ledger', status: 'Active', updatedAt: '2026-08-19' }
  ],
  'Coupons and Gift Certificates': [
    { id: 'CPN-101', name: 'Welcome 10% Discount Coupon', code: 'WELCOME10', category: 'Percentage', status: 'Active', updatedAt: '2026-08-15' },
    { id: 'CPN-102', name: 'VIP Olive Oil Gift Voucher $25', code: 'GIFT25VIP', category: 'Fixed Voucher', status: 'Active', updatedAt: '2026-08-22' },
    { id: 'CPN-103', name: 'Seasonal Harvest Offer $10', code: 'HARVEST10', category: 'Voucher', status: 'Inactive', updatedAt: '2026-08-01' }
  ],
  'Discounts': [
    { id: 'DSC-01', name: 'Bulk Wholesale Order (5% Off)', code: 'DISC_WHOLESALE', category: 'Automatic', status: 'Active', updatedAt: '2026-08-20' },
    { id: 'DSC-02', name: 'Staff Employee Discount (15%)', code: 'DISC_STAFF', category: 'Manual Supervisor', status: 'Active', updatedAt: '2026-08-10' },
    { id: 'DSC-03', name: 'Damaged Packaging Clearance', code: 'DISC_CLEARANCE', category: 'Item Specific', status: 'Active', updatedAt: '2026-08-23' }
  ],
  'Price Modes': [
    { id: 'PRC-01', name: 'Retail Consumer Price List', code: 'PRICE_RETAIL', category: 'Standard', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'PRC-02', name: 'Wholesale Distributor Tier 1', code: 'PRICE_WHOLESALE_1', category: 'Wholesale', status: 'Active', updatedAt: '2026-08-24' },
    { id: 'PRC-03', name: 'Export International Price List ($)', code: 'PRICE_EXPORT', category: 'Export', status: 'Active', updatedAt: '2026-08-20' }
  ],
  'Workstations and Printers': [
    { id: 'PRN-01', name: 'Front Desk Thermal Receipt Printer', code: 'EPSON_TM_T20', category: 'USB Thermal 80mm', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'PRN-02', name: 'Warehouse Packaging Label Printer', code: 'ZEBRA_ZT230', category: 'Barcode Label', status: 'Active', updatedAt: '2026-08-24' },
    { id: 'PRN-03', name: 'Oil Press Station Invoice Printer', code: 'STAR_TSP100', category: 'Network IP Printer', status: 'Active', updatedAt: '2026-08-21' }
  ],
  'Void Reasons': [
    { id: 'VOID-01', name: 'Customer Changed Mind', code: 'REASON_CHANGE_MIND', category: 'Customer', status: 'Active', updatedAt: '2026-08-10' },
    { id: 'VOID-02', name: 'Duplicate Invoice Entry', code: 'REASON_DUPLICATE', category: 'Cashier Error', status: 'Active', updatedAt: '2026-08-12' },
    { id: 'VOID-03', name: 'Incorrect Payment Method Selected', code: 'REASON_WRONG_PAY', category: 'Cashier Error', status: 'Active', updatedAt: '2026-08-18' }
  ],
  'VAT Exemptions Reason': [
    { id: 'VAT-EX-01', name: 'Export Goods (Outside Lebanon)', code: 'VAT_EXPORT_00', category: 'Tax Law 44', status: 'Active', updatedAt: '2026-08-01' },
    { id: 'VAT-EX-02', name: 'Diplomatic Mission Exemption', code: 'VAT_DIPLOMATIC', category: 'Embassy Exemption', status: 'Active', updatedAt: '2026-08-05' },
    { id: 'VAT-EX-03', name: 'Agricultural Raw Product Exemption', code: 'VAT_AGRI_RAW', category: 'Ministry Law', status: 'Active', updatedAt: '2026-08-15' }
  ],
  'Message on Invoice': [
    { id: 'MSG-01', name: 'Footer: Thank You for Choosing Southern Olive', code: 'MSG_THANKYOU', category: 'Invoice Footer', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'MSG-02', name: 'Policy: Goods Non-Refundable After 7 Days', code: 'MSG_POLICY_7D', category: 'Terms Header', status: 'Active', updatedAt: '2026-08-20' },
    { id: 'MSG-03', name: 'Tax Reg: MOF 7489201 - CR 104928', code: 'MSG_LEGAL_INFO', category: 'Legal Bar', status: 'Active', updatedAt: '2026-08-22' }
  ],
  'Zone Setup': [
    { id: 'ZON-01', name: 'Main Showroom Retail Floor', code: 'ZONE_SHOWROOM', category: 'Sales Floor', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'ZON-02', name: 'Pressing Factory Wholesale Depot', code: 'ZONE_FACTORY', category: 'Industrial', status: 'Active', updatedAt: '2026-08-24' },
    { id: 'ZON-03', name: 'Beirut Central Distribution Warehouse', code: 'ZONE_BEIRUT', category: 'Logistics', status: 'Active', updatedAt: '2026-08-21' }
  ],
  'Currency Setup': [
    { id: 'CUR-01', name: 'US Dollar ($USD)', code: 'USD', category: 'Base Currency', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'CUR-02', name: 'Lebanese Pound (LBP)', code: 'LBP', category: 'Local Currency', status: 'Active', updatedAt: '2026-08-25' },
    { id: 'CUR-03', name: 'Euro (€EUR)', code: 'EUR', category: 'Foreign Currency', status: 'Active', updatedAt: '2026-08-20' }
  ]
};

export default function GenericDataTable({
  title,
  description,
  initialData,
  onAddNew,
  onEdit,
  onDelete,
  onBack
}: GenericDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<DataRow[]>(
    initialData || DEFAULT_MOCK_ROWS[title] || [
      { id: 'REC-001', name: `${title} Item #1`, code: 'CODE_01', category: 'General', status: 'Active', updatedAt: '2026-08-25' },
      { id: 'REC-002', name: `${title} Item #2`, code: 'CODE_02', category: 'General', status: 'Active', updatedAt: '2026-08-24' },
      { id: 'REC-003', name: `${title} Item #3`, code: 'CODE_03', category: 'General', status: 'Inactive', updatedAt: '2026-08-20' }
    ]
  );

  const filteredRows = rows.filter(row =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.code && row.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNew = () => {
    if (onAddNew) {
      onAddNew();
      return;
    }
    const newName = prompt(`Enter name for new ${title} record:`);
    if (newName && newName.trim()) {
      const newRow: DataRow = {
        id: `REC-0${rows.length + 1}`,
        name: newName.trim(),
        code: `NEW_${rows.length + 1}`,
        category: 'Custom',
        status: 'Active',
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setRows([newRow, ...rows]);
    }
  };

  const handleDeleteRow = (id: string) => {
    if (confirm(`Are you sure you want to delete record ${id}?`)) {
      setRows(rows.filter(r => r.id !== id));
      if (onDelete) onDelete(id);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans dir-ltr">
      {/* 1. HEADER TITLE BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {title}
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {rows.length} Records
            </span>
          </h2>
          {description && (
            <p className="text-xs text-slate-500 font-medium mt-1">
              {description}
            </p>
          )}
        </div>

        {/* FAR RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {title.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => {
              if (onBack) onBack();
              else if (typeof window !== 'undefined') window.history.back();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition-all ml-auto cursor-pointer border border-slate-300 shadow-sm shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Return to Hub</span>
          </button>
        </div>
      </div>

      {/* 2. DATA TABLE TOOLBAR & SEARCH */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={`Search ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 pl-9 text-xs text-gray-800 font-medium focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => alert(`Exporting ${title} report...`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-gray-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Filter applied')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-gray-200 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* 3. STRUCTURED DATA GRID (COLUMNS: ID, NAME, STATUS, ACTIONS) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-gray-700 font-sans">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-base tracking-wide">
              <tr>
                <th className="px-4 py-3.5 font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-semibold">Name / Description</th>
                <th className="px-4 py-3.5 font-semibold">Code / Type</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Last Updated</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal text-base">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-gray-900">{row.id}</td>
                    <td className="px-4 py-3.5 font-normal text-gray-900">{row.name}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-base">{row.code || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      {row.status === 'Active' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>
                      ) : row.status === 'Pending' ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-sm px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          Pending
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-sm px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-gray-400" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono">{row.updatedAt || '2026-08-25'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`View details for ${row.name}`)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit ? onEdit(row) : alert(`Edit ${row.name}`)}
                          className="p-1 hover:bg-amber-50 rounded text-amber-600 hover:text-amber-800 transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-800 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-medium">
                    No matching {title} records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredRows.length}</span> of{' '}
            <span className="font-bold text-gray-900">{rows.length}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <ChevronLeft className="w-3.5 h-3.5 inline" /> Previous
            </button>
            <button className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold">1</button>
            <button className="px-2.5 py-1 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
