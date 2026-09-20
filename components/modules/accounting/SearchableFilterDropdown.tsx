'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface SearchableFilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (DropdownOption | string)[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function SearchableFilterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  className = '',
  buttonClassName = '',
  disabled = false
}: SearchableFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  // Filter options
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="text-muted-foreground mb-1 block text-xs font-medium">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearch('');
          }
        }}
        className={`w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs text-xs flex items-center justify-between gap-2 hover:border-primary/50 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${buttonClassName}`}
      >
        <span className="truncate block font-normal">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 min-w-[220px] max-w-sm bg-card border border-border rounded-xl shadow-xl p-1.5 z-40 text-xs animate-fadeIn">
          {/* Internal Search box */}
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-muted border border-input rounded-lg pl-8 pr-2.5 py-1 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-muted-foreground text-xs font-medium">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-muted border border-border text-muted-foreground font-mono">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
