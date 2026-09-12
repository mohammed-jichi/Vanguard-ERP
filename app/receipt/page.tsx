'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Plus,
  ChevronDown,
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
  FileText,
  X
} from 'lucide-react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import { SEED_CUSTOMERS } from '@/lib/eventsData';

function ReceiptPageContent() {
  const searchParams = useSearchParams();
  const [activeScreen, setActiveScreen] = useState('receipt');

  // URL / LocalStorage parameters
  const customerIdParam = searchParams.get('customerId');
  const eventIdParam = searchParams.get('eventId');
  const eventNameParam = searchParams.get('eventName');

  // Customer state
  const [customerId, setCustomerId] = useState<number>(9);
  const [customerName, setCustomerName] = useState<string>('Mohammed Chami');
  const [eventName, setEventName] = useState<string>('Chami House');

  // Form Fields
  const [balance, setBalance] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<string>('');
  const [currency, setCurrency] = useState<string>('LBP');
  const [receiptDate, setReceiptDate] = useState<string>('2026-09-11');
  const [receiptNumber, setReceiptNumber] = useState<string>('1');
  const [amount, setAmount] = useState<string>('0');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let targetCId = customerIdParam ? Number(customerIdParam) : 9;
    let targetEName = eventNameParam || '';

    // Check LocalStorage fallback (matching Omega ERP `EVNT_FOR_CustomersRecView`)
    if (typeof window !== 'undefined') {
      const storedEventId = localStorage.getItem('EVNT_FOR_CustomersRecView');
      if (storedEventId && !targetEName) {
        targetEName = 'Chami House';
      }
    }

    if (targetCId) {
      setCustomerId(targetCId);
      const foundCustomer = SEED_CUSTOMERS.find(c => c.CUSTOMERID === targetCId);
      if (foundCustomer) {
        setCustomerName(`${foundCustomer.NAME} ${foundCustomer.FAMILYNAME || ''}`.trim());
      } else {
        setCustomerName('Mohammed Chami');
      }
    }

    if (targetEName) {
      setEventName(decodeURIComponent(targetEName));
    }
  }, [customerIdParam, eventNameParam]);

  const handleSave = () => {
    showToast(`Receipt #${receiptNumber} for ${customerName} saved successfully!`);
  };

  const handlePost = () => {
    showToast(`Receipt #${receiptNumber} for ${customerName} posted successfully!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6">
        {/* Top Header Row matching Screenshot 3 */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Receipt</h1>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-normal">
            <Link href="/backoffice/operations?section=dashboard" className="text-[#007bff] hover:underline">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium">Receipt</span>
          </div>
        </div>

        {/* Toolbar matching Screenshot 3: Preview, + New on left, Actions ▾ on right */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Generating receipt preview...')}
              className="px-3.5 py-1.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReceiptNumber(String(Number(receiptNumber || 0) + 1));
                setAmount('0');
                setReferenceNumber('');
                showToast('Initialized new receipt draft');
              }}
              className="px-3.5 py-1.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="px-3.5 py-1.5 bg-[#343a40] hover:bg-[#23272b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card Form matching Screenshot 3 */}
        <div className="bg-white rounded border border-[#dee2e6] shadow-sm p-5 space-y-4 text-xs">
          {/* ROW 1: From Customer, Balance, Credit Limit */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* From Customer with Blue Event Badge */}
            <div className="md:col-span-6">
              <label className="block font-medium text-slate-700 mb-1">
                From Customer (ID: {customerId})
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 font-medium">
                  {customerName}
                </div>
                {eventName && (
                  <div
                    className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold shadow-2xs whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors"
                    title="Linked Event"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{eventName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Balance */}
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Balance</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={balance}
                  readOnly
                  className="w-full border border-slate-300 rounded pl-3 pr-10 py-1.5 text-xs bg-slate-50 text-slate-700"
                />
                <span className="absolute right-3 text-[11px] font-semibold text-slate-400">LL</span>
              </div>
            </div>

            {/* Credit Limit */}
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Credit Limit</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={creditLimit}
                  readOnly
                  className="w-full border border-slate-300 rounded pl-3 pr-10 py-1.5 text-xs bg-slate-50 text-slate-700"
                />
                <span className="absolute right-3 text-[11px] font-semibold text-slate-400">LL</span>
              </div>
            </div>
          </div>

          {/* ROW 2: Payment Type, Currency, Date, Receipt # */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Payment Type */}
            <div className="md:col-span-4">
              <label className="block font-medium text-slate-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
              >
                <option value="">Select type</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Whish Money">Whish Money</option>
                <option value="OMT">OMT</option>
              </select>
            </div>

            {/* Currency */}
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                readOnly
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-slate-100 text-slate-700 font-semibold"
              />
            </div>

            {/* Date */}
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
              />
            </div>

            {/* Receipt # */}
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Receipt #</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
              />
            </div>
          </div>

          {/* ROW 3: Amount, Reference # */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
              />
            </div>
            <div className="md:col-span-9">
              <label className="block font-medium text-slate-700 mb-1">Reference #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Optional external transaction or voucher reference"
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
              />
            </div>
          </div>

          {/* ROW 4: Save (Orange) & Post (Green) Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#f39c12] hover:bg-[#e67e22] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handlePost}
              className="px-5 py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Receipt...</div>}>
      <ReceiptPageContent />
    </Suspense>
  );
}
