"use client";
import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';

export interface Cashier {
  id: string;
  name: string;
  badgeId: string;
  pin: string;
}

export const MOCK_CASHIERS: Cashier[] = [
  { id: '641', name: 'Mohammed', badgeId: 'badge-641', pin: '1234' },
  { id: '642', name: 'Hussien', badgeId: 'badge-642', pin: '5678' },
];

interface MobileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (cashier: Cashier) => void;
}

export function MobileAuthModal({ isOpen, onClose, onLogin }: MobileAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    const cashier = MOCK_CASHIERS.find((c) => c.pin === pin);
    if (cashier) {
      onLogin(cashier);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDemoLogin = (cashier: Cashier) => {
    onLogin(cashier);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-50 sm:rounded-2xl rounded-t-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Cashier Sign In</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            {[...Array(4)].map((_, i) => {
              const isFilled = i < pin.length;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    isFilled
                      ? 'bg-slate-900 border-slate-900 scale-110'
                      : 'border border-slate-300 bg-slate-100'
                  } ${error ? 'bg-rose-500 border-rose-500' : ''}`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num.toString())}
                className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-2xl rounded-2xl min-h-[58px] shadow-sm select-none transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-2xl min-h-[58px] shadow-sm select-none transition-colors flex items-center justify-center"
            >
              <Delete size={24} />
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-2xl rounded-2xl min-h-[58px] shadow-sm select-none transition-colors"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={pin.length < 4}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl h-[58px] shadow-sm select-none transition-colors"
            >
              OK
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl h-12 transition-colors select-none font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">Demo Profiles</p>
            <div className="flex gap-2 justify-center">
              {MOCK_CASHIERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleDemoLogin(c)}
                  className="px-3 py-1.5 bg-white border border-slate-200 shadow-xs rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  #{c.id} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
