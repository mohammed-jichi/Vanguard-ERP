'use client';

import React, { useState } from 'react';
import { X, Calendar, Video, Lock, RotateCcw } from 'lucide-react';

interface EndOfMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchTutorials?: () => void;
}

export default function EndOfMonthModal({ isOpen, onClose, onWatchTutorials }: EndOfMonthModalProps) {
  // Reopen Mode toggle state (default: false)
  const [isReopenMode, setIsReopenMode] = useState<boolean>(false);

  // Form field states
  const [selectedBranch, setSelectedBranch] = useState<string>('Southern Olive Oil S.A.R.L');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');

  // Dynamic calculated previous month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const previousMonthName = 'June';
  const currentYear = '2026';

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl font-sans dir-ltr text-left overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-slate-900 text-lg">End Of Month</h3>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onWatchTutorials || (() => alert('Opening End of Month video tutorial...'))}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Watch Tutorials</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 text-xs font-sans">
          
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
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                <option value="" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Select Branch</option>
                <option value="Southern Olive Oil S.A.R.L" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Southern Olive Oil S.A.R.L</option>
                <option value="Beirut Central Branch" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Beirut Central Branch</option>
                <option value="Saida Production Press" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Saida Production Press</option>
              </select>
            </div>

            {/* YEAR DROPDOWN */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                <option value="" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Select Year</option>
                <option value="2026" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2026</option>
                <option value="2025" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2025</option>
                <option value="2024" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>2024</option>
              </select>
            </div>

            {/* MONTH DROPDOWN */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs !text-black !opacity-100 font-bold focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                <option value="" style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>Select Month</option>
                {months.map(m => (
                  <option key={m} value={m} style={{ color: '#000000', opacity: 1, WebkitTextFillColor: '#000000', backgroundColor: '#ffffff' }}>{m}</option>
                ))}
              </select>
            </div>

          </div>

          {/* BOTTOM NOTICE TEXT & TOGGLE */}
          <div className="pt-2 space-y-3">
            
            {/* CLOSE MONTH RED WARNING / STATUS */}
            {!isReopenMode && (
              <p className="text-rose-600 font-extrabold text-xs">
                {selectedMonth || 'Selected Month'} will be closed
              </p>
            )}

            {/* ACTION BUTTON */}
            {isReopenMode ? (
              <button
                onClick={handleExecute}
                className="w-full py-3 bg-[#5c3a21] hover:bg-amber-900 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reopen Month</span>
              </button>
            ) : (
              <button
                onClick={handleExecute}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Execute End Of Month</span>
              </button>
            )}

            {/* REOPEN MONTH TOGGLE SWITCH */}
            <div className="flex items-center gap-3 pt-2">
              <button
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

        </div>

      </div>
    </div>
  );
}
