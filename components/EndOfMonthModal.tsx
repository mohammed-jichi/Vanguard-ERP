'use client';

import React, { useState } from 'react';
import { Calendar, Video, Lock, RotateCcw } from 'lucide-react';
import ModalShell from './ModalShell';

interface EndOfMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchTutorials?: () => void;
}

export default function EndOfMonthModal({ isOpen, onClose, onWatchTutorials }: EndOfMonthModalProps) {
  // Reopen Mode toggle state (default: false)
  const [isReopenMode, setIsReopenMode] = useState<boolean>(false);

  // Form field states
  const [selectedBranch, setSelectedBranch] = useState<string>('Southern Olive Oil Products S.A.R.L');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');

  // Dynamic calculated previous month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const previousMonthName = 'June';
  const currentYear = '2026';

  const handleExecute = () => {
    if (isReopenMode) {
      if (!selectedBranch || !selectedYear || !selectedMonth) {
        alert('Please select Branch, Year, and Month to reopen.');
        return;
      }
      alert(`Month ${selectedMonth} ${selectedYear} has been successfully reopened for ${selectedBranch}.`);
    } else {
      alert(`Month ${selectedMonth} ${selectedYear} has been locked and closed for ${selectedBranch}.`);
    }
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-xl"
      icon={<Calendar className="w-5 h-5 text-amber-600" />}
      title="End Of Month"
      subtitle="Period reconciliation, inventory lock, and closing engine"
      headerActions={
        <button
          type="button"
          onClick={onWatchTutorials || (() => alert('Opening End of Month video tutorial...'))}
          className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors mr-2 cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Watch Tutorials</span>
        </button>
      }
      bodyClassName="space-y-5 text-xs font-sans"
    >
      {/* LAST MONTH CLOSED BANNER */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-800 font-bold text-xs flex items-center justify-between">
        <span>Last month closed: <strong className="text-amber-900">{previousMonthName} / {currentYear}</strong></span>
        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
      </div>

      {/* TOP EXPLANATION TEXT */}
      <p className="text-slate-600 font-medium text-xs leading-relaxed">
        This process will lock all transactions related to inventory for the closed month. This means that you will not be able to make any changes or additions to inventory records during this period.
      </p>

      {/* FORM FIELDS (BRANCH, YEAR, MONTH) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* BRANCH DROPDOWN */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
          >
            <option value="">Select Branch</option>
            <option value="Southern Olive Oil Products S.A.R.L">Southern Olive Oil Products S.A.R.L</option>
            <option value="Beirut Central Branch">Beirut Central Branch</option>
            <option value="Saida Production Press">Saida Production Press</option>
          </select>
        </div>

        {/* YEAR DROPDOWN */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
          >
            <option value="">Select Year</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* MONTH DROPDOWN */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
          >
            <option value="">Select Month</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BOTTOM NOTICE TEXT & TOGGLE */}
      <div className="pt-2 space-y-3">
        {!isReopenMode && (
          <p className="text-rose-600 font-extrabold text-xs">
            {selectedMonth || 'Selected Month'} will be closed
          </p>
        )}

        {/* ACTION BUTTON */}
        {isReopenMode ? (
          <button
            type="button"
            onClick={handleExecute}
            className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reopen Month</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleExecute}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Execute End Of Month</span>
          </button>
        )}

        {/* REOPEN MONTH TOGGLE SWITCH */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsReopenMode(!isReopenMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isReopenMode ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isReopenMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="font-extrabold text-xs text-slate-800">Reopen Month</span>
        </div>

        {/* REOPEN MODE RED WARNING TEXT */}
        {isReopenMode && (
          <p className="text-rose-600 font-medium text-[11px] leading-relaxed animate-in fade-in duration-150 pt-1">
            Reopening the month allows authorized personnel to make necessary modifications to inventory transactions for that period. If the transaction has already been transferred to accounting, the user is unable to edit it. However, they can create new transactions.
          </p>
        )}
      </div>
    </ModalShell>
  );
}
