'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  User,
  Phone,
  MapPin,
  Scale,
  Droplets,
  DollarSign,
  Download,
  Plus,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { INITIAL_FARMER_ACCOUNTS } from '@/lib/pressingMillData';
import { FarmerAccountLedger } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function DirectoryLedgersView() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<FarmerAccountLedger[]>(INITIAL_FARMER_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredAccounts = accounts.filter(acc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      acc.farmerName.toLowerCase().includes(q) ||
      acc.phone.toLowerCase().includes(q) ||
      acc.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t('pm_directory', 'Grower & Client Directory Ledgers')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('directory_sub', 'Farmer accounts, historical olive crushing intake, oil deposits stored in mill silos, and financial balances')}
          </p>
        </div>

        <button
          onClick={() => showToast(t('exported_directory_msg', 'Exported grower directory statements.'))}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('export_directory_statements', 'Export Directory Statements')}</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('search_farmer_placeholder', 'Search farmer name, phone number, or grove location...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500"
          />
        </div>
        <span className="text-xs text-slate-500">{filteredAccounts.length} {t('registered_accounts', 'Registered Accounts')}</span>
      </div>

      {/* DIRECTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">{t('farmer_grower', 'Grower / Farmer Name')}</th>
                <th className="py-2.5 px-3">{t('contact_phone_number', 'Contact Phone')}</th>
                <th className="py-2.5 px-3">{t('grove_location', 'Grove Location')}</th>
                <th className="py-2.5 px-3">{t('historical_crushed_olives', 'Historical Crushed Olives')}</th>
                <th className="py-2.5 px-3">{t('oil_deposits_in_silo', 'Oil Deposits in Silo')}</th>
                <th className="py-2.5 px-3">{t('available_tin_balance', 'Available Tin Balance')}</th>
                <th className="py-2.5 px-3">{t('cash_balance', 'Cash Balance')}</th>
                <th className="py-2.5 px-3">{t('last_active', 'Last Active')}</th>
                <th className="py-2.5 px-3 text-right">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{acc.farmerName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{acc.phone}</td>
                  <td className="py-2.5 px-3 text-slate-500">{acc.address}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{acc.totalIntakeHistoricalKg.toLocaleString()} KG</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">{acc.oilDepositsInSiloKg} KG</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{acc.tinBalanceAvailable} {t('tins_word', 'Tins')}</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={acc.cashBalanceUSD < 0 ? 'text-rose-600 font-bold' : acc.cashBalanceUSD > 0 ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                      ${acc.cashBalanceUSD.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{acc.lastActiveDate}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => showToast(`${t('generated_statement_msg', 'Generated account statement for')} ${acc.farmerName}.`)}
                      className="text-sky-700 hover:text-sky-900 font-semibold cursor-pointer"
                    >
                      {t('account_statement', 'Account Statement')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
