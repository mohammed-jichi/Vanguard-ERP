'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Printer, X } from 'lucide-react';
import { Corporate3ZoneHeader, CorporatePrintableFooter } from '@/components/documents/Corporate3ZoneHeader';

export interface AccountingVoucherData {
  type: 'PV' | 'RV';
  voucherNumber: string;
  date: string;
  accountName: string; // Payee for PV, Payer for RV
  bankOrCashAccount: string;
  amount: number;
  currency?: string;
  rate?: number;
  description: string;
  department?: string;
  enteredBy?: string;
  posted: boolean;
}

interface AccountingPrintableVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: AccountingVoucherData | null;
}

export function AccountingPrintableVoucherModal({
  isOpen,
  onClose,
  voucher,
}: AccountingPrintableVoucherModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !voucher) return null;

  const isPayment = voucher.type === 'PV';
  const docTitle = isPayment ? 'PAYMENT VOUCHER' : 'OFFICIAL RECEIPT';
  const primaryAccountLabel = isPayment ? 'Paid To (Account / Supplier):' : 'Received From (Customer / Client):';
  const secondaryAccountLabel = isPayment ? 'Disbursing Bank / Cash Vault:' : 'Deposited To Bank / Cash Vault:';
  const effectiveRate = voucher.rate || 89500;
  const lbpAmount = Math.round(voucher.amount * effectiveRate);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
              {docTitle} &mdash; {voucher.voucherNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-4 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print', 'Print')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-white font-sans text-xs">
          {/* Standardized 3-Zone Corporate Header */}
          <Corporate3ZoneHeader
            documentTitle={docTitle}
            voucherCode={voucher.voucherNumber}
            transactionDate={voucher.date}
            status={voucher.posted ? 'POSTED' : 'DRAFT'}
            facilityName="Facility: Choueifat Main Plant"
          />

          {/* Core Voucher Financial Summary */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                  {primaryAccountLabel}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {voucher.accountName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                  {secondaryAccountLabel}
                </span>
                <span className="font-semibold text-slate-800">
                  {voucher.bankOrCashAccount}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                  Amount In USD ($)
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  ${voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                  Counter-Value in LBP (Rate: {effectiveRate.toLocaleString()})
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {lbpAmount.toLocaleString()} LBP
                </span>
              </div>
            </div>
          </div>

          {/* Description & Metadata */}
          <div className="border border-slate-200 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
              <span><strong>Department / Cost Center:</strong> {voucher.department || 'General Administration & Plant'}</span>
              <span><strong>Entered By:</strong> {voucher.enteredBy || 'Finance Officer'}</span>
            </div>
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Voucher Purpose / Memo:
              </span>
              <p className="text-slate-800 font-medium text-xs mt-0.5">
                {voucher.description || 'Disbursement / Settlement of outstanding corporate invoices.'}
              </p>
            </div>
          </div>

          {/* Signatures & Approvals */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <p className="font-bold text-slate-800 mt-2">{t('prepared_by', 'Prepared By')}</p>
              <p className="text-[10px] text-slate-500">{voucher.enteredBy || 'Bookkeeper / Accountant'}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <p className="font-bold text-slate-800 mt-2">{t('verified_approved_by', 'Verified & Approved By')}</p>
              <p className="text-[10px] text-slate-500">Financial Controller</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <p className="font-bold text-slate-800 mt-2">
                {isPayment ? t('beneficiary_signature', 'Beneficiary / Payee Signature') : t('authorized_signature', 'Authorized Receiver Stamp')}
              </p>
              <p className="text-[10px] text-slate-500">Official Signature & Stamp</p>
            </div>
          </div>

          {/* Standardized Corporate Footer */}
          <CorporatePrintableFooter voucherCode={voucher.voucherNumber} />
        </div>
      </div>
    </div>
  );
}

export default AccountingPrintableVoucherModal;
