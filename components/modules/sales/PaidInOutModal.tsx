'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';
import { toast } from '@/lib/toast';
import { printElementById } from '@/lib/utils/printDocument';
import {
  CashMovement,
  CashMovementType,
  recordCashMovement,
  getCashMovements,
  getActiveShift,
  POS_EXCHANGE_RATE_LBP,
  generateNextMovementNumber
} from '@/lib/posShiftService';
import { peekNextDocNumber } from '@/lib/utils/documentSequence';

export const ACTIVE_STAFF_USERS = [
  'Mohammed Jichi',
  'Hussein Jichi',
  'Mahdi',
  'Hiba Aloulou',
  'Ricky',
  'Fadi Kassir',
  'Ahmad Dirani',
  'Ali Saad',
  'Hassan K.'
];

export const PAYMENT_TYPES = [
  'CASH',
  'CASH USD',
  'CREDIT',
  'CREDIT CARD',
  'CREDIT CARD USD'
] as const;

export type PaymentType = typeof PAYMENT_TYPES[number];

export interface PrintableCashVoucherProps {
  voucher: any | null;
}

export function PrintableCashVoucher({ voucher }: PrintableCashVoucherProps) {
  if (!voucher) return null;
  const isPaidIn = voucher.movementType === 'PAID_IN' || voucher.type === 'PAID_IN';
  const voucherTitle = isPaidIn
    ? 'PAID IN VOUCHER (سند قبض نقدي)'
    : 'PAID OUT VOUCHER (سند صرف نقدي)';

  const formattedAmount =
    voucher.paymentType?.includes('USD') || voucher.currencyCode === 'USD'
      ? `$${Number(voucher.amountUsd ?? voucher.amount ?? 0).toFixed(2)} USD`
      : `${Number(voucher.amountLbp ?? voucher.amount ?? 0).toLocaleString()} LBP`;

  const secondaryAmount =
    voucher.paymentType?.includes('USD') || voucher.currencyCode === 'USD'
      ? `(${Math.round(Number(voucher.amountUsd ?? voucher.amount ?? 0) * (voucher.exchangeRate || POS_EXCHANGE_RATE_LBP)).toLocaleString()} LBP)`
      : `($${(Number(voucher.amountLbp ?? voucher.amount ?? 0) / (voucher.exchangeRate || POS_EXCHANGE_RATE_LBP)).toFixed(2)} USD)`;

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#000000',
        padding: '24px',
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '10px', marginBottom: '14px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Southern Olive and Oil Products S.A.R.L.
        </h2>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>
          منتوجات زيت وزيتون الجنوب ش.م.م
        </h3>
        <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
          Facility: [1300-01] Main • Main Road, Tyre, South Lebanon
        </p>
        <p style={{ margin: '2px 0', fontSize: '11px', color: '#333' }}>
          Cell: +961 7 740 000 / +961 70 000 000 • Email: sales@southernolive-lb.com
        </p>
      </div>

      {/* Voucher Title */}
      <div
        style={{
          textAlign: 'center',
          margin: '12px 0',
          padding: '8px',
          border: '1.5px solid #000',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          {voucherTitle}
        </h4>
      </div>

      {/* Metadata Table */}
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 0', fontWeight: 'bold', width: '38%' }}>Voucher No / رقم السند:</td>
            <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>
              {voucher.movementNo || voucher.id}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Date & Time / التاريخ والوقت:</td>
            <td style={{ padding: '6px 0', textAlign: 'right' }}>
              {new Date(voucher.createdAt || Date.now()).toLocaleDateString()}{' '}
              {voucher.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 0', fontWeight: 'bold' }}>By (Issued By) / منظم السند:</td>
            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>
              {voucher.byUser || voucher.cashierName || 'System'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Paid To (Received By) / المدفوع له:</td>
            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>
              {voucher.paidToUser || 'N/A'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Payment Type / طريقة الدفع:</td>
            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {voucher.paymentType || 'CASH USD'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Description Box */}
      <div style={{ border: '1px solid #bbb', padding: '10px', borderRadius: '4px', marginBottom: '14px', fontSize: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>
          Description / البيان:
        </div>
        <div style={{ color: '#000', fontSize: '13px' }}>
          {voucher.description || voucher.notes || '—'}
        </div>
      </div>

      {/* Amount Box */}
      <div
        style={{
          border: '2px solid #000',
          padding: '12px',
          textAlign: 'center',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }}
      >
        <span style={{ fontSize: '11px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', color: '#555' }}>
          Movement Amount / المبلغ
        </span>
        <div style={{ fontSize: '24px', fontWeight: 'extrabold', fontFamily: 'monospace', margin: '4px 0', color: '#000' }}>
          {voucher.movementType === 'PAID_OUT' ? '-' : ''}{formattedAmount}
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#444' }}>
          {secondaryAmount}
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px', paddingTop: '12px', borderTop: '1px solid #ccc', fontSize: '11px' }}>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ height: '45px' }} />
          <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', fontWeight: 'bold' }}>
            Issued By Signature
            <br />
            توقيع منظم السند ({voucher.byUser || voucher.cashierName || 'Cashier'})
          </div>
        </div>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ height: '45px' }} />
          <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', fontWeight: 'bold' }}>
            Received By Signature
            <br />
            توقيع المستلم ({voucher.paidToUser || 'Receiver'})
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '9px', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        Vanguard ERP • Southern Olive and Oil Products S.A.R.L. • Official Cash Voucher
      </div>
    </div>
  );
}

interface SelectOrTypeInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
}

function SelectOrTypeInput({
  value,
  onChange,
  options,
  placeholder = 'Select user or type name...',
  id
}: SelectOrTypeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLower = value.trim().toLowerCase();
  const filtered = options.filter((opt) => opt.toLowerCase().includes(searchLower));
  // Show filtered options if search term matches any; otherwise show full list
  const displayList = filtered.length > 0 ? filtered : options;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-slate-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e6f40] focus:border-[#2e6f40] bg-white text-slate-800"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer transition-colors"
          title="Toggle user list"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl py-1 text-sm">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/80">
            Select Saved User or Type Custom
          </div>
          {displayList.map((user) => {
            const isSelected = value.trim() === user;
            return (
              <button
                key={user}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(user);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-emerald-50 hover:text-[#2e6f40] transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-emerald-50 text-[#2e6f40] font-bold' : 'text-slate-700'
                }`}
              >
                <span>{user}</span>
                {isSelected && <span className="text-xs font-bold text-[#2e6f40]">✓</span>}
              </button>
            );
          })}
          {value.trim() && !options.includes(value.trim()) && (
            <div className="px-3 py-2 border-t border-slate-100 bg-emerald-50/40 text-xs text-slate-600 flex items-center justify-between">
              <span className="truncate">
                Custom Name: <strong className="text-emerald-800 font-semibold">{value.trim()}</strong>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium ml-2 shrink-0">
                Unsaved
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface PaidInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDrawerBalance?: number;
  onDrawerBalanceChange?: (newBalance: number) => void;
  onMovementRecorded?: (movement: any) => void;
  branchName?: string;
  cashierName?: string;
  tenantId?: string;
  printerType?: 'a4' | 'thermal' | 'a5' | 'dot_matrix';
  setPrintCashVoucherSnapshot?: (snapshot: any) => void;
}

export default function PaidInOutModal({
  isOpen,
  onClose,
  currentDrawerBalance = 0,
  onDrawerBalanceChange,
  onMovementRecorded,
  branchName = 'Southern Olive and Oil Products S.A.R.L.',
  cashierName = 'Active Cashier',
  tenantId,
  printerType = 'thermal',
  setPrintCashVoucherSnapshot
}: PaidInOutModalProps) {
  const [movementType, setMovementType] = useState<CashMovementType>('PAID_OUT');
  const [byUser, setByUser] = useState<string>('');
  const [paidToUser, setPaidToUser] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Local snapshot for standalone usage (when not managed by parent container)
  const [internalPrintSnapshot, setInternalPrintSnapshot] = useState<any | null>(null);

  // Initialize defaults on modal open
  useEffect(() => {
    if (isOpen) {
      if (!byUser) {
        setByUser(cashierName && ACTIVE_STAFF_USERS.includes(cashierName) ? cashierName : 'Mahdi');
      }
      if (!paidToUser) {
        setPaidToUser('Hussein Jichi');
      }
    }
  }, [isOpen, cashierName]);

  const handleSave = async () => {
    if (!byUser.trim()) {
      toast.error('Please enter or select "By" user.');
      return;
    }
    if (!paidToUser.trim()) {
      toast.error('Please enter or select "Paid To" user.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }
    if (!paymentType) {
      toast.error('Please select a payment type.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Determine next sequential voucher number
      const nextMovNo = peekNextDocNumber('CASH_VOUCHER', getCashMovements());
      const activeShift = getActiveShift();
      const isUsd = paymentType.includes('USD') || paymentType === 'CASH' || paymentType.startsWith('CREDIT');
      const amountUsd = isUsd ? numAmount : Number((numAmount / POS_EXCHANGE_RATE_LBP).toFixed(2));
      const amountLbp = isUsd ? Math.round(numAmount * POS_EXCHANGE_RATE_LBP) : numAmount;

      const savedVoucher = {
        movementNo: nextMovNo,
        movementType,
        type: movementType,
        byUser,
        paidToUser,
        paymentType,
        description: description.trim(),
        notes: description.trim(),
        amount: numAmount,
        amountUsd,
        amountLbp,
        currencyCode: isUsd ? 'USD' : 'LBP',
        exchangeRate: POS_EXCHANGE_RATE_LBP,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shiftId: activeShift.id,
        cashierName: byUser || cashierName,
        branchId: branchName
      };

      // 2. Set snapshot FIRST so DOM container is updated
      if (setPrintCashVoucherSnapshot) {
        setPrintCashVoucherSnapshot(savedVoucher);
      }
      setInternalPrintSnapshot(savedVoucher);

      // 3. Save to unified pos_cash_movements store
      const newMovement = await recordCashMovement(
        {
          movementNo: nextMovNo,
          shiftId: activeShift.id,
          shiftNumber: activeShift.shiftNumber,
          createdAtIso: new Date().toISOString(),
          isReconciledOrClosed: false,
          branchId: branchName,
          cashierName: byUser || cashierName,
          movementType,
          currencyCode: isUsd ? 'USD' : 'LBP',
          amount: numAmount,
          amountUsd,
          amountLbp,
          exchangeRate: POS_EXCHANGE_RATE_LBP,
          reasonCategory: movementType === 'PAID_IN' ? 'OPENING_FLOAT' : 'PETTY_EXPENSE',
          category: description.trim(),
          targetAccountId: 'acc-53000',
          targetAccountNumber: '53000',
          targetAccountName: 'Main Safe / الصندوق الرئيسي',
          notes: `${description.trim()} [By: ${byUser}, Paid To: ${paidToUser}, Type: ${paymentType}]`,
          userId: byUser
        },
        tenantId
      );

      // 4. Update parent callbacks
      if (onDrawerBalanceChange) {
        const deltaUsd = newMovement.amountUsd;
        const nextBalance =
          movementType === 'PAID_IN'
            ? currentDrawerBalance + deltaUsd
            : Math.max(0, currentDrawerBalance - deltaUsd);
        onDrawerBalanceChange(nextBalance);
      }

      if (onMovementRecorded) {
        onMovementRecorded({ ...newMovement, byUser, paidToUser, paymentType, amountUsd });
      }

      toast.success(
        `Recorded ${movementType === 'PAID_IN' ? 'Paid In' : 'Paid Out'} voucher ${newMovement.movementNo} successfully!`
      );

      // Reset form fields
      setAmount('');
      setDescription('');

      // 5. Close modal
      onClose();

      // 6. After 150ms timeout, invoke printElementById
      setTimeout(() => {
        printElementById('printable-cash-voucher', 'Cash Movement Voucher');
      }, 150);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record cash movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If standalone (no external snapshot setter passed), render persistent offscreen container
  const renderFallbackPrintContainer = !setPrintCashVoucherSnapshot && internalPrintSnapshot;

  return (
    <>
      {/* Off-screen persistent print container for standalone POS view */}
      {renderFallbackPrintContainer && (
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <div id="printable-cash-voucher">
            <PrintableCashVoucher voucher={internalPrintSnapshot} />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-lg flex flex-col text-slate-800">
            {/* Header: Title on left, close 'x' on right, separated by light border */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 rounded-t-xl bg-white">
              <h3 className="text-base font-bold text-slate-800">Paid In / Out</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 text-2xl font-semibold leading-none p-1 rounded transition-colors cursor-pointer"
                title="Close"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Centered Mode Toggle Buttons */}
              <div className="flex justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('PAID_IN')}
                  className={`w-36 py-2 px-4 rounded-md font-bold text-sm border transition-all cursor-pointer ${
                    movementType === 'PAID_IN'
                      ? 'bg-[#2e6f40] text-white border-[#2e6f40] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Paid In
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('PAID_OUT')}
                  className={`w-36 py-2 px-4 rounded-md font-bold text-sm border transition-all cursor-pointer ${
                    movementType === 'PAID_OUT'
                      ? 'bg-[#2e6f40] text-white border-[#2e6f40] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Paid Out
                </button>
              </div>

              {/* Form Fields: 2-column horizontal rows (bold label on left, input on right) */}
              <div className="space-y-3 pt-1">
                {/* 1. By* */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-3 relative z-20">
                  <label className="font-bold text-slate-800 text-sm">By*</label>
                  <SelectOrTypeInput
                    value={byUser}
                    onChange={setByUser}
                    options={ACTIVE_STAFF_USERS}
                    placeholder="Select user or type name..."
                  />
                </div>

                {/* 2. Paid To* */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-3 relative z-10">
                  <label className="font-bold text-slate-800 text-sm">Paid To*</label>
                  <SelectOrTypeInput
                    value={paidToUser}
                    onChange={setPaidToUser}
                    options={ACTIVE_STAFF_USERS}
                    placeholder="Select user or type name..."
                  />
                </div>

                {/* 3. Description* */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-3 relative z-0">
                  <label className="font-bold text-slate-800 text-sm">Description*</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description / notes"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2e6f40] focus:border-[#2e6f40] bg-white text-slate-800"
                  />
                </div>

                {/* 4. Amount* */}
                <div className="grid grid-cols-[100px_1fr] items-center gap-3 relative z-0">
                  <label className="font-bold text-slate-800 text-sm">Amount*</label>
                  <div className="flex items-center">
                    <span
                      className={`font-bold text-lg mr-2 select-none ${
                        movementType === 'PAID_IN' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {movementType === 'PAID_IN' ? '+' : '-'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#2e6f40] focus:border-[#2e6f40] bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Type* Selector Grid */}
              <div className="pt-2">
                <label className="font-bold text-slate-800 text-sm block mb-2">Payment Type*</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_TYPES.map((type) => {
                    const isSelected = paymentType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPaymentType(type)}
                        className={`py-2 px-2 text-xs font-bold rounded border transition-colors cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#2e6f40] text-white border-[#2e6f40] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer: Single dark Save button aligned bottom right */}
            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 bg-slate-50/70 rounded-b-xl">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
