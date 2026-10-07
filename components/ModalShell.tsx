'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  customHeader?: React.ReactNode;
  hideHeader?: boolean;
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
  maxWidthClass?: string; // default: 'max-w-4xl'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  children: React.ReactNode;
  className?: string; // Additional classes for the inner card
  bodyClassName?: string; // Additional classes for scrollable body
  contentScrollable?: boolean; // default: true (wrap children in flex-1 overflow-y-auto)
  preventBackdropDismiss?: boolean;
  preventEscapeDismiss?: boolean;
  zIndexClass?: string; // default: 'z-[9999]'
  ariaLabel?: string;
  dir?: 'ltr' | 'rtl';
}

/**
 * Vanguard ERP Standardized Universal ModalShell
 * Enforces:
 * 1. Viewport-Safe Overlay Layering (fixed inset-0 z-[9999] p-4 sm:p-6 bg-slate-900/45 backdrop-blur-sm)
 * 2. Universal Backdrop Click Dismissal & StopPropagation on card
 * 3. Global Escape Key Listener with proper unmount cleanup
 * 4. Strict Vanguard Light Design System (Zero dark utility overrides, clean white cards, crisp slate borders, emerald accents)
 * 5. Locked Non-Scrolling Header Bar with Extensible Action Slot
 * 6. Independent Internal Scroll Body & Pinned Bottom Footer
 */
export default function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerActions,
  customHeader,
  hideHeader = false,
  hideCloseButton = false,
  footer,
  maxWidthClass = 'max-w-4xl',
  maxWidth,
  children,
  className = '',
  bodyClassName = '',
  contentScrollable = true,
  preventBackdropDismiss = false,
  preventEscapeDismiss = false,
  zIndexClass = 'z-[9999]',
  ariaLabel,
  dir,
}: ModalShellProps) {
  const resolvedMaxWidth = maxWidth ? `max-w-${maxWidth}` : maxWidthClass;

  // Global Escape key event listener
  useEffect(() => {
    if (!isOpen || preventEscapeDismiss) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventEscapeDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-sm transition-opacity ${dir ? (dir === 'rtl' ? 'dir-rtl' : 'dir-ltr') : ''}`}
      onClick={preventBackdropDismiss ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel}
    >
      <div
        className={`relative w-full ${resolvedMaxWidth} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        {!hideHeader && (
          customHeader ? (
            customHeader
          ) : (
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {title && (
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                        {title}
                      </h2>
                    )}
                    {badge && (
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {headerActions && (
                  <div className="flex items-center gap-1.5">{headerActions}</div>
                )}
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* MODAL BODY */}
        {contentScrollable ? (
          <div className={`flex-1 overflow-y-auto px-6 py-5 bg-white ${bodyClassName}`}>
            {children}
          </div>
        ) : (
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden bg-white ${bodyClassName}`}>
            {children}
          </div>
        )}

        {/* PINNED BOTTOM FOOTER */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
