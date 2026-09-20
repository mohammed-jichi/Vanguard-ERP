'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Calendar as CalendarIcon, Filter, CheckCircle2, Pencil, Minus, Plus, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import DatePickerInput from './DatePickerInput';

export interface DeliveryItem {
  qty: number;
  name: string;
}

export interface DeliveryRecord {
  id: string;
  companyName: string;
  customerName: string;
  customerId: string;
  invoiceNumber: string;
  balance: number;
  branch: string;
  invoiceDate: string; // e.g. "04 Sep, 2026"
  deliveryDate: string; // e.g. "04-Sep-2026"
  status: 'No Delivery' | 'Pending Delivery' | 'Delivered';
  items: DeliveryItem[];
}

export default function DeliveryOfGoodsView() {
  const [branchFilter, setBranchFilter] = useState('Main Branch');
  const [statusFilter, setStatusFilter] = useState('All Invoices');
  const [dateTypeFilter, setDateTypeFilter] = useState('Delivery Date');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('01-Sep-2026');
  const [toDate, setToDate] = useState('30-Sep-2026');

  // Popover search states
  const [activeDropdown, setActiveDropdown] = useState<'branch' | 'status' | 'dateType' | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Expanded rows set (invoice 4000035 expanded by default as in Screenshot 2)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['4000035']));

  // Edit Delivery Date Modal state (as described in the voice audio)
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>('');

  // Comprehensive sample records representing all 3 statuses (No Delivery, Pending Delivery, Delivered)
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([
    {
      id: 'DEL-4000035',
      companyName: 'Abou Hamzeh Nuts',
      customerName: 'Abou Hamza Abou Hamza',
      customerId: '31',
      invoiceNumber: '4000035',
      balance: 0,
      branch: 'Main Branch',
      invoiceDate: '04 Sep, 2026',
      deliveryDate: '04-Sep-2026',
      status: 'No Delivery',
      items: [
        { qty: 1, name: 'صندوق مربى تين معقود مع سمسم و جوز 800غ*12' },
        { qty: 1, name: 'صندوق مربى توت حب 800غ*12' },
        { qty: 1, name: 'صندوق مربى فريز حب 800غ*12' },
        { qty: 1, name: 'صندوق مربى تين مهروس 800غ*12' },
        { qty: 1, name: 'صندوق مربى سفرجل مهروس 800غ*12' },
        { qty: 1, name: 'صندوق مربى بوسطفير 800غ*12' },
        { qty: 1, name: 'صندوق لبنة بقر مكمزلة سادة 600غ*12' },
        { qty: 1, name: 'صندوق لبنة بقر مكمزلة بحبة البركة 600غ*12' },
      ],
    },
    {
      id: 'DEL-4000038',
      companyName: 'شركة الأرز للتجارة الغذائية',
      customerName: 'Al Arz Trading Co.',
      customerId: '45',
      invoiceNumber: '4000038',
      balance: 120.0,
      branch: 'Main Branch',
      invoiceDate: '06 Sep, 2026',
      deliveryDate: '12-Sep-2026',
      status: 'Pending Delivery',
      items: [
        { qty: 2, name: 'صندوق زيت زيتون بكر ممتاز تنكة 16 ليتر*1' },
        { qty: 4, name: 'صندوق خل تفاح بلدي طبيعي 500مل*12' },
        { qty: 6, name: 'صندوق ماء ورد مقطر بلدي 500مل*12' },
      ],
    },
    {
      id: 'DEL-4000029',
      companyName: 'مؤسسة بيروت غورميه',
      customerName: 'Beirut Gourmet Market',
      customerId: '18',
      invoiceNumber: '4000029',
      balance: 0,
      branch: 'Main Branch',
      invoiceDate: '02 Sep, 2026',
      deliveryDate: '05-Sep-2026',
      status: 'Delivered',
      items: [
        { qty: 5, name: 'صندوق دبس رمان طبيعي جنوبي 250مل*12' },
        { qty: 3, name: 'صندوق ماء زهر بلدي مقطر 500مل*12' },
      ],
    },
  ]);

  const [notice, setNotice] = useState<string | null>(null);

  // Delivered Marking Modal state
  const [deliveredMarkingModalOpen, setDeliveredMarkingModalOpen] = useState(false);
  const [deliveredTargetRecord, setDeliveredTargetRecord] = useState<DeliveryRecord | null>(null);
  const [deliveredByEmployee, setDeliveredByEmployee] = useState('Ahmad Dirani');
  const [deliveredActualDate, setDeliveredActualDate] = useState('2026-09-10');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Serial Numbers Modal state
  const [serialNumbersModalOpen, setSerialNumbersModalOpen] = useState(false);
  const [serialTargetInvoice, setSerialTargetInvoice] = useState<string>('');
  const [availableSerials] = useState([
    { id: 'SN-OLV-2026-001', code: 'EVOO-1L', desc: 'Extra Virgin Olive Oil 1L', loc: 'Choueifat Main Facility' },
    { id: 'SN-OLV-2026-002', code: 'EVOO-1L', desc: 'Extra Virgin Olive Oil 1L', loc: 'Choueifat Main Facility' },
    { id: 'SN-OLV-2026-003', code: 'EVOO-5L', desc: 'Virgin Olive Oil 5L Tin', loc: 'Choueifat Main Facility' },
    { id: 'SN-OLV-2026-004', code: 'ZTR-500G', desc: 'Premium Wild Zaatar 500g', loc: 'Choueifat Main Facility' }
  ]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>(['SN-OLV-2026-001']);

  const toggleRowExpansion = (invoiceNumber: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceNumber)) {
        next.delete(invoiceNumber);
      } else {
        next.add(invoiceNumber);
      }
      return next;
    });
  };

  // Open Edit Delivery Date Modal (audio requirement: pencil icon triggers modal with confirmation & calendar)
  const handleOpenDeliveredModal = (rec: DeliveryRecord) => {
    setDeliveredTargetRecord(rec);
    setDeliveredMarkingModalOpen(true);
  };

  const handleConfirmSetDelivered = () => {
    if (!deliveredTargetRecord) return;
    setDeliveryRecords(prev => prev.map(r => 
      r.id === deliveredTargetRecord.id 
        ? { ...r, status: 'Delivered', deliveryDate: deliveredActualDate } 
        : r
    ));
    setDeliveredMarkingModalOpen(false);
    setNotice(`Invoice #${deliveredTargetRecord.invoiceNumber} marked as Delivered by ${deliveredByEmployee}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenSerialModal = (invoiceNumber: string) => {
    setSerialTargetInvoice(invoiceNumber);
    setSerialNumbersModalOpen(true);
  };

  const handleToggleSerial = (sn: string) => {
    setSelectedSerials(prev => 
      prev.includes(sn) ? prev.filter(s => s !== sn) : [...prev, sn]
    );
  };

  const handleOpenEditModal = (rec: DeliveryRecord) => {
    setEditingRecord(rec);
    setNewDeliveryDate(rec.deliveryDate);
  };

  // Save the updated delivery date
  const handleSaveDeliveryDate = () => {
    if (!editingRecord) return;
    setDeliveryRecords((prev) =>
      prev.map((rec) =>
        rec.id === editingRecord.id ? { ...rec, deliveryDate: newDeliveryDate } : rec
      )
    );
    setNotice(`Delivery date for Invoice #${editingRecord.invoiceNumber} updated to ${newDeliveryDate}`);
    setEditingRecord(null);
    setTimeout(() => setNotice(null), 3500);
  };

  // Helper date parser for filtering
  const parseFilterDate = (dStr: string): number => {
    try {
      const parts = dStr.replace(',', '').split(/[-/\s]+/);
      if (parts.length >= 3) {
        const monthNames: { [k: string]: number } = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        const day = parseInt(parts[0], 10);
        const mon = monthNames[parts[1].toLowerCase().slice(0, 3)];
        const yr = parseInt(parts[2], 10);
        if (!isNaN(day) && mon !== undefined && !isNaN(yr)) {
          return new Date(yr, mon, day).getTime();
        }
      }
      return new Date(dStr).getTime();
    } catch {
      return 0;
    }
  };

  // Filtered Delivery Orders
  const filteredOrders = useMemo(() => {
    const fromTime = parseFilterDate(fromDate);
    const toTime = parseFilterDate(toDate) + 86400000; // end of day

    return deliveryRecords.filter((rec) => {
      // Branch filter
      if (branchFilter !== 'All Branches' && rec.branch !== branchFilter) {
        return false;
      }

      // Status filter (All Invoices brings No Delivery, Pending Delivery, Delivered)
      if (statusFilter !== 'All Invoices' && rec.status !== statusFilter) {
        return false;
      }

      // Date range filter based on dateTypeFilter
      const targetDateStr = dateTypeFilter === 'Sales Date' ? rec.invoiceDate : rec.deliveryDate;
      const targetTime = parseFilterDate(targetDateStr);
      if (fromTime && targetTime && targetTime < fromTime) {
        return false;
      }
      if (toTime && targetTime && targetTime > toTime) {
        return false;
      }

      // Text search: search by invoice number, company, customer name, or customer ID
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = rec.invoiceNumber.toLowerCase().includes(q);
        const matchCompany = rec.companyName.toLowerCase().includes(q);
        const matchCustomer = rec.customerName.toLowerCase().includes(q);
        const matchId = rec.customerId.toLowerCase().includes(q);
        if (!matchInvoice && !matchCompany && !matchCustomer && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [deliveryRecords, branchFilter, statusFilter, dateTypeFilter, fromDate, toDate, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-slate-800 font-sans p-6 flex flex-col justify-between">
      {/* Click outside backdrop for popover */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setActiveDropdown(null);
            setDropdownSearch('');
          }}
        />
      )}

      {/* Top Banner Notice */}
      {notice && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notice}</span>
        </div>
      )}

      <div>
        {/* Page Header matching Screenshot 1 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Delivery of Goods</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/backoffice/operations?section=quotations"
                className="text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded px-2.5 py-1 bg-white flex items-center gap-1 shadow-2xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Quotations</span>
              </Link>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This screen displays items that have not yet been delivered for invoices where the delivery date is later than the sales date. You may mark items as delivered from this interface.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Undelivered items are shown as &quot;Qty Reserved&quot; in the Inventory Items &gt; Stock tab, allowing you to track products that have been sold but are still pending delivery.
          </p>
        </div>

        {/* Filter Box matching Screenshot 1 */}
        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3 relative z-10">
          {/* Row 1 */}
          <div className="flex items-center gap-3">
            {/* Branch Dropdown */}
            <div className="w-64 shrink-0 relative">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Main Branch">Main Branch</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Status Dropdown (audio: All Invoices, No Delivery, Pending Delivery, Delivered) */}
            <div className="w-56 shrink-0 relative">
              <button
                type="button"
                onClick={() => {
                  setActiveDropdown(activeDropdown === 'status' ? null : 'status');
                  setDropdownSearch('');
                }}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer font-medium"
              >
                <span>{statusFilter}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {activeDropdown === 'status' && (
                <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                  <div className="p-1.5 border-b border-slate-200">
                    <div className="relative flex items-center">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto py-1">
                    {['All Invoices', 'No Delivery', 'Pending Delivery', 'Delivered']
                      .filter((opt) => opt.toLowerCase().includes(dropdownSearch.toLowerCase()))
                      .map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt);
                            setActiveDropdown(null);
                            setDropdownSearch('');
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                            statusFilter === opt
                              ? 'bg-primary text-white font-medium'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input (audio: placeholder Search by Invoice Number, company, customer name or customer ID) */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Invoice Number, company, customer name or customer ID"
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Date Type Dropdown (audio: Delivery Date, Sales Date) */}
              <div className="w-56 shrink-0 relative">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown(activeDropdown === 'dateType' ? null : 'dateType');
                    setDropdownSearch('');
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer font-medium"
                >
                  <span>{dateTypeFilter}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {activeDropdown === 'dateType' && (
                  <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white border border-blue-400 rounded shadow-lg overflow-hidden">
                    <div className="p-1.5 border-b border-slate-200">
                      <div className="relative flex items-center">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                        <input
                          type="text"
                          autoFocus
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          placeholder="Search..."
                          className="w-full pl-6 pr-2 py-1 text-xs border border-blue-400 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto py-1">
                      {['Delivery Date', 'Sales Date']
                        .filter((opt) => opt.toLowerCase().includes(dropdownSearch.toLowerCase()))
                        .map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setDateTypeFilter(opt);
                              setActiveDropdown(null);
                              setDropdownSearch('');
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${
                              dateTypeFilter === opt
                                ? 'bg-primary text-white font-medium'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* From Date (calendar icon) */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-700 font-semibold">From Date</span>
                <DatePickerInput
                  value={fromDate}
                  onChange={setFromDate}
                  inputWidth="w-32"
                />
              </div>

              {/* To Date (calendar icon) */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-700 font-semibold">To Date</span>
                <DatePickerInput
                  value={toDate}
                  onChange={setToDate}
                  inputWidth="w-32"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => {
                setNotice('Delivery filters updated.');
                setTimeout(() => setNotice(null), 2000);
              }}
              className="bg-primary hover:bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table Section matching Screenshot 1 and Screenshot 2 */}
        <div className="bg-white border border-slate-200 rounded mt-4 overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead className="bg-white text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.map((rec) => {
                const isExpanded = expandedRows.has(rec.invoiceNumber);

                return (
                  <React.Fragment key={rec.id}>
                    {/* Main Row matching Screenshot 2 */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-900 font-medium text-xs" dir="rtl">
                        {rec.companyName}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">
                        {rec.customerName}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">
                        {rec.customerId}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium font-mono">
                        {rec.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-900 font-medium">
                        {rec.balance}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">
                        {rec.branch}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-medium">
                        {rec.invoiceDate}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={rec.deliveryDate}
                            onClick={() => handleOpenEditModal(rec)}
                            className="border border-slate-300 rounded px-2.5 py-1 text-xs w-28 bg-muted text-slate-800 cursor-pointer font-medium shadow-2xs hover:border-slate-400"
                            title="Click to edit delivery date"
                          />
                          {/* Pencil Button (audio requirement: pencil icon triggers 'Do you want to update the delivery date?' modal) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rec)}
                            className="bg-primary hover:bg-primary text-white p-1.5 rounded cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                            title="Edit Delivery Date"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-900 font-medium">
                        <span
                          className={
                            rec.status === 'Delivered'
                              ? 'text-emerald-700 font-semibold'
                              : rec.status === 'Pending Delivery'
                              ? 'text-blue-600 font-semibold'
                              : 'text-slate-900'
                          }
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {/* Plus / Minus toggle button (audio: 'في عندك ال plus آخر شي، بس تكبس عليها بتفتحلك الفاتورة تحتها') */}
                        <div className="flex items-center justify-center gap-1.5">
                          {rec.status !== 'Delivered' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenDeliveredModal(rec)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-1 rounded shadow-2xs cursor-pointer transition-colors"
                              title="Set this order as Delivered"
                            >
                              Set as Delivered
                            </button>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Delivered
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenSerialModal(rec.invoiceNumber)}
                            className="bg-primary hover:bg-[#1a2537] text-white p-1 rounded cursor-pointer shadow-2xs"
                            title="Manage Item Serial Numbers"
                          >
                            <span className="text-[10px] font-mono px-1">SN</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(rec.invoiceNumber)}
                            className="text-slate-600 hover:text-blue-700 font-bold p-1 cursor-pointer transition-transform"
                            title={isExpanded ? 'Collapse Items' : 'Expand Items'}
                          >
                            {isExpanded ? (
                              <Minus className="w-4 h-4 text-blue-700 stroke-[3]" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-700 stroke-[3]" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Subtable matching Screenshot 2: Qty and Item Description */}
                    {isExpanded && rec.items && rec.items.length > 0 && (
                      <tr className="bg-white">
                        <td colSpan={10} className="pb-4 pt-1 px-3 border-b border-slate-200">
                          <div className="ml-56 max-w-2xl">
                            <table className="text-xs text-slate-900">
                              <thead>
                                <tr className="font-bold border-b border-transparent">
                                  <th className="text-left font-bold pr-6 py-1 text-slate-900">Qty</th>
                                  <th className="text-left font-bold py-1 text-slate-900">Item Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rec.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="pr-6 py-0.5 font-medium text-slate-900">{item.qty}</td>
                                    <td className="py-0.5 font-medium text-slate-900" dir="rtl">
                                      {item.name}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Empty state matching Screenshot 1 (audio: 'المفروض يطلعلك الفواتير أو No Order Found') */}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-500 font-medium text-xs">
                    No Order Found
                    {statusFilter !== 'All Invoices' && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setStatusFilter('All Invoices')}
                          className="text-blue-600 hover:underline text-xs font-semibold cursor-pointer"
                        >
                          (Show All Invoices)
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Centered Pagination matching Screenshot 1 & 2 */}
          <div className="py-3 flex items-center justify-center border-t border-slate-200 bg-white">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                className="px-2.5 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                «
              </button>
              <button
                type="button"
                className="px-2.5 py-1 border border-slate-300 rounded text-blue-600 font-semibold bg-blue-50/50 cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                className="px-2.5 py-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer matching Screenshot 1 & Screenshot 2 */}
      <footer className="mt-12 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
        <span>© 2026 Omega Software All rights reserved.</span>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#privacy" className="hover:text-slate-700">Privacy Policy</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#terms" className="hover:text-slate-700">Terms and Conditions</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#support" className="hover:text-slate-700">Support</a>
        <span className="mx-2 text-slate-300">|</span>
        <a href="#feedback" className="hover:text-slate-700">Feedback</a>
      </footer>

      {/* ========================================================================= */}
      {/* DELIVERED MARKING MODAL (#deliveredMarkingModal)                          */}
      {/* ========================================================================= */}
      {deliveredMarkingModalOpen && deliveredTargetRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden text-xs">
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Mark As Delivered / تأكيد التسليم</h3>
              <button
                type="button"
                onClick={() => setDeliveredMarkingModalOpen(false)}
                className="text-slate-300 hover:text-white text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 bg-white text-slate-800">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Invoice Number:</span>
                  <span className="font-bold text-slate-900">{deliveredTargetRecord.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{deliveredTargetRecord.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Branch:</span>
                  <span className="font-medium text-slate-800">{deliveredTargetRecord.branch}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivered By (Employee / Driver):</label>
                <select
                  value={deliveredByEmployee}
                  onChange={(e) => setDeliveredByEmployee(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Ahmad Dirani">Ahmad Dirani (Driver #1)</option>
                  <option value="Hussein Dirani">Hussein Dirani (Driver #2)</option>
                  <option value="Ali Zahwe">Ali Zahwe (Van Sales)</option>
                  <option value="Mohammed Jichi">Mohammed Jichi (Operations Supervisor)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Actual Delivery Date:</label>
                <input
                  type="date"
                  value={deliveredActualDate}
                  onChange={(e) => setDeliveredActualDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delivery Notes / Courier Reference:</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Received by store manager, signed delivery note"
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeliveredMarkingModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSetDelivered}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs cursor-pointer transition-colors"
              >
                Confirm Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERIAL NUMBERS MODAL (#itemsSerialNumbersModal)                           */}
      {/* ========================================================================= */}
      {serialNumbersModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden text-xs">
            <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">Serial Numbers - Delivery of Goods ({serialTargetInvoice})</h3>
              <button
                type="button"
                onClick={() => setSerialNumbersModalOpen(false)}
                className="text-slate-300 hover:text-white text-base leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 bg-white text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                {/* Available Serial Numbers */}
                <div className="border border-slate-200 rounded p-3">
                  <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Available Serial Numbers</span>
                    <span className="text-blue-600 font-mono">({availableSerials.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availableSerials.map(s => {
                      const isSel = selectedSerials.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleToggleSerial(s.id)}
                          className={`p-2 rounded border text-[11px] cursor-pointer transition-colors flex items-center justify-between ${
                            isSel ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-mono">{s.id}</div>
                            <div className="text-[10px] text-slate-500">{s.desc} • {s.loc}</div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">{isSel ? '✓' : '+'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Serial Numbers */}
                <div className="border border-slate-200 rounded p-3">
                  <div className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Selected for Delivery</span>
                    <span className="text-emerald-700 font-mono">({selectedSerials.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedSerials.length === 0 ? (
                      <div className="text-slate-400 text-center py-6 italic">No serial numbers selected</div>
                    ) : (
                      selectedSerials.map(sn => (
                        <div key={sn} className="p-2 rounded border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center justify-between text-[11px]">
                          <span className="font-mono font-semibold">{sn}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSerial(sn)}
                            className="text-red-500 hover:text-red-700 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSerialNumbersModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSerialNumbersModalOpen(false);
                  setNotice(`Serial numbers assigned for ${serialTargetInvoice}.`);
                  setTimeout(() => setNotice(null), 3000);
                }}
                className="px-5 py-1.5 bg-primary hover:bg-[#1a2537] text-white rounded font-bold shadow-xs cursor-pointer"
              >
                Save Serial Numbers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Date Modal (audio requirement:
          'وعندك القلم اللي حد Delivery Date هيدا Edit Delivery Date.
           بتكبس عليها بتطلعلك notification: Do you want to update the delivery date?
           بتعمل OK، بتعمل update. يعني بس تكبس عليها بتفتح هاي الرزنامة وبتعمل update وفي Save بتعمل Save OK') */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-300" />
                <span className="font-bold text-sm">Edit Delivery Date</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="font-semibold text-blue-900 text-sm mb-1">
                  Do you want to update the delivery date?
                </p>
                <p className="text-blue-700 text-xs">
                  Invoice Number: <span className="font-mono font-bold">{editingRecord.invoiceNumber}</span>
                </p>
                <p className="text-blue-700 text-xs">
                  Customer: <span className="font-medium">{editingRecord.customerName}</span> ({editingRecord.companyName})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-xs">
                  New Delivery Date:
                </label>
                <div className="flex items-center gap-2">
                  <DatePickerInput
                    value={newDeliveryDate}
                    onChange={setNewDeliveryDate}
                    inputWidth="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDeliveryDate}
                className="px-4 py-1.5 rounded bg-primary hover:bg-primary text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save / OK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


