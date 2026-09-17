'use client';

import React from 'react';
import { Delete, CornerDownLeft, RotateCcw } from 'lucide-react';

interface PosTouchNumpadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEnter: () => void;
  variant?: 'login' | 'terminal';
  className?: string;
  disabled?: boolean;
}

export default function PosTouchNumpad({
  onKeyPress,
  onClear,
  onBackspace,
  onEnter,
  variant = 'terminal',
  className = '',
  disabled = false,
}: PosTouchNumpadProps) {
  // Sound click or tactile feel simulation
  const handlePress = (key: string) => {
    if (disabled) return;
    onKeyPress(key);
  };

  const keyBaseClass =
    'h-14 sm:h-16 text-xl sm:text-2xl font-mono font-bold rounded-lg border flex items-center justify-center transition-all select-none cursor-pointer active:translate-y-0.5 active:shadow-inner shadow-sm';

  const numKeyClass = `${keyBaseClass} bg-[#232730] hover:bg-[#2c323f] text-slate-100 border-[#384050] hover:border-slate-500`;
  const actionKeyClass = `${keyBaseClass} bg-[#1f242d] hover:bg-[#282f3c] text-amber-400 border-amber-600/40 hover:border-amber-500`;
  const clearKeyClass = `${keyBaseClass} bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60 hover:border-rose-600`;
  const enterKeyClass = `${keyBaseClass} bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black border-amber-400 shadow-amber-900/30 text-2xl`;

  if (variant === 'login') {
    return (
      <div className={`grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xs select-none ${className}`}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => handlePress(digit)}
            className={numKeyClass}
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className={clearKeyClass}
          title="Clear"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="ml-1 text-xs uppercase font-sans">Cl</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePress('0')}
          className={numKeyClass}
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className={enterKeyClass}
          title="Confirm / Enter"
        >
          <CornerDownLeft className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Terminal Full Commercial Numpad with 00, 000, *, ., Backspace, and Enter
  return (
    <div className={`flex flex-col gap-2 select-none w-full ${className}`}>
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button type="button" disabled={disabled} onClick={() => handlePress('7')} className={numKeyClass}>
          7
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('8')} className={numKeyClass}>
          8
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('9')} className={numKeyClass}>
          9
        </button>
        <button type="button" disabled={disabled} onClick={onBackspace} className={actionKeyClass} title="Backspace">
          <Delete className="w-6 h-6" />
        </button>

        {/* Row 2 */}
        <button type="button" disabled={disabled} onClick={() => handlePress('4')} className={numKeyClass}>
          4
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('5')} className={numKeyClass}>
          5
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('6')} className={numKeyClass}>
          6
        </button>
        <button type="button" disabled={disabled} onClick={onClear} className={clearKeyClass} title="Clear">
          <span className="text-base font-bold uppercase">Cl</span>
        </button>

        {/* Row 3 */}
        <button type="button" disabled={disabled} onClick={() => handlePress('1')} className={numKeyClass}>
          1
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('2')} className={numKeyClass}>
          2
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('3')} className={numKeyClass}>
          3
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('*')} className={actionKeyClass}>
          *
        </button>

        {/* Row 4 */}
        <button type="button" disabled={disabled} onClick={() => handlePress('0')} className={numKeyClass}>
          0
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('00')} className={numKeyClass}>
          00
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('.')} className={numKeyClass}>
          .
        </button>
        <button type="button" disabled={disabled} onClick={() => handlePress('000')} className={actionKeyClass}>
          <span className="text-base font-bold">000</span>
        </button>
      </div>

      {/* Large Enter Bar */}
      <button
        type="button"
        disabled={disabled}
        onClick={onEnter}
        className={`${enterKeyClass} w-full h-14 tracking-wider flex items-center justify-center gap-2`}
      >
        <CornerDownLeft className="w-6 h-6" />
        <span className="text-lg uppercase">ENTER</span>
      </button>
    </div>
  );
}
