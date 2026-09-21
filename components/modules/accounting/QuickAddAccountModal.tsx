'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  CheckCircle2,
  Building2,
  Wallet,
  Receipt,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AccountDetail, LBP_RATE } from '@/lib/accountingData';
import { apiCreateAccount } from '@/lib/accountingPersistenceService';

export type QuickAddPreset = 'SUPPLIER' | 'DISBURSING' | 'EXPENSE_OR_ASSET';

export interface QuickAddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetType: QuickAddPreset;
  existingAccounts: AccountDetail[];
  onSuccess: (createdAccount: AccountDetail) => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
}

export default function QuickAddAccountModal({
  isOpen,
  onClose,
  presetType,
  existingAccounts,
  onSuccess,
  onShowToast
}: QuickAddAccountModalProps) {
  // Preset sub-selection
  const [subCategory, setSubCategory] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [accountNameAr, setAccountNameAr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize defaults on open or preset change
  useEffect(() => {
    if (!isOpen) return;
    setValidationError(null);
    setInitialBalance(0);

    if (presetType === 'SUPPLIER') {
      setSubCategory('TRADE_SUPPLIER');
      // Generate next 40110xxx number
      const existing401 = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('40110'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing401.length > 0 ? Math.max(...existing401) : 40110002;
      setAccountNumber(String(maxNum + 1));
      setAccountName('');
      setAccountNameAr('');
      setDescription('Trade supplier and vendor account');
    } else if (presetType === 'DISBURSING') {
      setSubCategory('CASH_VAULT');
      // Generate next 53xxx or 51xxx
      const existing53 = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('532') || n.startsWith('530'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing53.length > 0 ? Math.max(...existing53) : 53200;
      setAccountNumber(String(maxNum + 10));
      setAccountName('');
      setAccountNameAr('');
      setDescription('Floor petty cash till fund or vault');
    } else {
      setSubCategory('EXPENSE_CLASS6');
      const existing61 = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('612') || n.startsWith('611'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing61.length > 0 ? Math.max(...existing61) : 61230;
      setAccountNumber(String(maxNum + 10));
      setAccountName('');
      setAccountNameAr('');
      setDescription('Operating procurement or consumable expense');
    }
  }, [isOpen, presetType, existingAccounts]);

  // Dynamic account number recalculation when sub-category changes
  const handleSubCategoryChange = (newSub: string) => {
    setSubCategory(newSub);
    if (newSub === 'TRADE_SUPPLIER') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('40110'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 40110002;
      setAccountNumber(String(maxNum + 1));
    } else if (newSub === 'ASSET_VENDOR') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('40410'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 40410;
      setAccountNumber(String(maxNum + 1));
    } else if (newSub === 'CASH_VAULT') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('532'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 53200;
      setAccountNumber(String(maxNum + 10));
    } else if (newSub === 'COMMERCIAL_BANK') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('5121'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 51210;
      setAccountNumber(String(maxNum + 1));
    } else if (newSub === 'EXPENSE_CLASS6') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('612') || n.startsWith('611') || n.startsWith('626'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 61230;
      setAccountNumber(String(maxNum + 10));
    } else if (newSub === 'FIXED_ASSET_CLASS2') {
      const existing = existingAccounts
        .map((a) => a.account_number)
        .filter((n) => n.startsWith('215') || n.startsWith('218'))
        .map((n) => parseInt(n, 10))
        .filter((n) => !isNaN(n));
      const maxNum = existing.length > 0 ? Math.max(...existing) : 21840;
      setAccountNumber(String(maxNum + 10));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedNumber = accountNumber.trim();
    const trimmedName = accountName.trim();

    if (!trimmedNumber) {
      setValidationError('Please enter a valid Account Number.');
      return;
    }
    if (!trimmedName) {
      setValidationError('Please enter an Account Name.');
      return;
    }

    // Check for collision with existing account numbers
    const collision = existingAccounts.find((a) => a.account_number === trimmedNumber);
    if (collision) {
      setValidationError(`Account #${trimmedNumber} already exists (${collision.account_name}). Please choose a unique account number.`);
      return;
    }

    setIsSaving(true);

    try {
      let class_id = 4;
      let sub_class4_id = 4011;
      let account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'EXPENSE' | 'REVENUE' = 'LIABILITY';
      let account_sub_type: 'CASH' | 'BANK' | 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'EXPENSE' | 'OTHERS' = 'SUPPLIER';
      let type = 'Supplier';
      let class_type = 'Liabilities';
      let checking_account = false;

      if (presetType === 'SUPPLIER') {
        class_id = 4;
        sub_class4_id = subCategory === 'ASSET_VENDOR' ? 4041 : 4011;
        account_type = 'LIABILITY';
        account_sub_type = 'SUPPLIER';
        type = 'Supplier';
        class_type = 'Liabilities';
      } else if (presetType === 'DISBURSING') {
        class_id = 5;
        sub_class4_id = subCategory === 'COMMERCIAL_BANK' ? 5121 : 5320;
        account_type = 'ASSET';
        account_sub_type = subCategory === 'COMMERCIAL_BANK' ? 'BANK' : 'CASH';
        type = subCategory === 'COMMERCIAL_BANK' ? 'Bank' : 'Cash';
        class_type = 'Assets';
        checking_account = true;
      } else if (presetType === 'EXPENSE_OR_ASSET') {
        if (subCategory === 'FIXED_ASSET_CLASS2') {
          class_id = 2;
          sub_class4_id = trimmedNumber.startsWith('215') ? 2151 : 2182;
          account_type = 'ASSET';
          account_sub_type = 'OTHERS';
          type = 'Other';
          class_type = 'Assets';
        } else {
          class_id = 6;
          sub_class4_id = trimmedNumber.startsWith('611') ? 6111 : 6121;
          account_type = 'EXPENSE';
          account_sub_type = 'EXPENSE';
          type = 'Expense';
          class_type = 'Expense';
        }
      }

      const balance_first = Number(initialBalance) || 0;
      const balance_sec = currency === 'USD' ? balance_first * LBP_RATE : balance_first;

      const payload: Partial<AccountDetail> & { account_number: string; account_name: string } = {
        id: `acc-${trimmedNumber}`,
        tenant_id: '00000000-0000-0000-0000-000000000001',
        account_number: trimmedNumber,
        account_name: trimmedName,
        account_name_ar: accountNameAr.trim() || trimmedName,
        description: description.trim() || trimmedName,
        class_id,
        sub_class4_id,
        account_type,
        account_sub_type,
        type,
        class_type,
        currency_id: currency,
        balance_first_cur: balance_first,
        balance_sec_cur: balance_sec,
        checking_account,
        is_active: true
      };

      const res = await apiCreateAccount(payload);
      if (res.success && res.account) {
        onShowToast?.(`Account #${trimmedNumber} - ${trimmedName} created successfully.`);
        onSuccess(res.account);
        onClose();
      } else {
        throw new Error(res.error || 'Failed to save new account');
      }
    } catch (err: any) {
      setValidationError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const getHeaderTitle = () => {
    switch (presetType) {
      case 'SUPPLIER':
        return 'Quick-Add Supplier / Creditor Account (Class 40)';
      case 'DISBURSING':
        return 'Quick-Add Cash Vault or Bank Account (Class 5)';
      case 'EXPENSE_OR_ASSET':
        return 'Quick-Add Expense or Fixed Asset Account (Class 6 / Class 2)';
    }
  };

  const getHeaderIcon = () => {
    switch (presetType) {
      case 'SUPPLIER':
        return <Building2 className="w-5 h-5 text-amber-500" />;
      case 'DISBURSING':
        return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'EXPENSE_OR_ASSET':
        return <Receipt className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans select-none">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-card border border-border shadow-2xs">
              {getHeaderIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{getHeaderTitle()}</h3>
              <p className="text-[11px] text-muted-foreground">
                Lebanese PCG Standard Chart of Accounts Ledger Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Sub-Category Selector */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Account Category &amp; Class
            </label>
            {presetType === 'SUPPLIER' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('TRADE_SUPPLIER')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'TRADE_SUPPLIER'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">#40110 - Trade Supplier</div>
                  <div className="text-[10px] opacity-80 font-normal">Raw materials &amp; packaging vendors</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('ASSET_VENDOR')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'ASSET_VENDOR'
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">#40410 - Fixed Asset Vendor</div>
                  <div className="text-[10px] opacity-80 font-normal">Machinery &amp; capital equipment suppliers</div>
                </button>
              </div>
            )}

            {presetType === 'DISBURSING' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('CASH_VAULT')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'CASH_VAULT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-500'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">#53200 - Petty Cash &amp; Vault</div>
                  <div className="text-[10px] opacity-80 font-normal">Floor cash float &amp; physical drawer</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('COMMERCIAL_BANK')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'COMMERCIAL_BANK'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-500'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">#51210 - Commercial Bank</div>
                  <div className="text-[10px] opacity-80 font-normal">BLOM, Audi, or Beirut Checking</div>
                </button>
              </div>
            )}

            {presetType === 'EXPENSE_OR_ASSET' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('EXPENSE_CLASS6')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'EXPENSE_CLASS6'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs ring-1 ring-blue-500'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">Class 6: Operating Expense</div>
                  <div className="text-[10px] opacity-80 font-normal">Packaging, fuel, chemicals, maintenance</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('FIXED_ASSET_CLASS2')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    subCategory === 'FIXED_ASSET_CLASS2'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs ring-1 ring-blue-500'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-bold">Class 2: Capitalized Asset</div>
                  <div className="text-[10px] opacity-80 font-normal">Machinery, fleet vehicles, IT equipment</div>
                </button>
              </div>
            )}
          </div>

          {/* Account Number & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 40110003"
                className="w-full bg-card border border-input rounded-xl p-2.5 text-xs font-mono font-bold text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'LBP')}
                className="w-full bg-card border border-input rounded-xl p-2.5 text-xs font-semibold text-foreground shadow-2xs outline-hidden"
              >
                <option value="USD">USD ($)</option>
                <option value="LBP">LBP (ل.ل)</option>
              </select>
            </div>
          </div>

          {/* Account Name (English) */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Account Name (English) *
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={
                presetType === 'SUPPLIER'
                  ? 'e.g. Southern Tin & Cans Factory S.A.R.L'
                  : presetType === 'DISBURSING'
                  ? 'e.g. Pressing Plant Petty Cash Till'
                  : 'e.g. Industrial Stainless Storage Tanks'
              }
              className="w-full bg-card border border-input rounded-xl p-2.5 text-xs text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden font-medium"
              required
            />
          </div>

          {/* Account Name (Arabic) */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Account Name (Arabic / اسم الحساب بالعربية)
            </label>
            <input
              type="text"
              dir="rtl"
              value={accountNameAr}
              onChange={(e) => setAccountNameAr(e.target.value)}
              placeholder="مثال: مصنع علب الجنوب - مورد معتمد"
              className="w-full bg-card border border-input rounded-xl p-2.5 text-xs text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden font-medium text-right"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal ledger classification remark"
              className="w-full bg-card border border-input rounded-xl p-2.5 text-xs text-foreground shadow-2xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden font-normal text-muted-foreground"
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving & Syncing...' : 'Save & Select Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
