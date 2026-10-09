"use client";
import React, { useState, useEffect } from 'react';
import { MobileHardwareRibbon } from './MobileHardwareRibbon';
import { MobileThumbDock } from './MobileThumbDock';
import { MobileAuthModal, Cashier, MOCK_CASHIERS } from './MobileAuthModal';

export interface VanguardMobileShellProps {
  children: React.ReactNode;
}

export function VanguardMobileShell({ children }: VanguardMobileShellProps) {
  const [currentCashier, setCurrentCashier] = useState<Cashier | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global barcode/RFID scanner listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();
      // If time between keystrokes is too long (> 50ms), it's probably manual typing
      if (currentTime - lastKeyTime > 50) {
        buffer = ''; 
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          // Check if buffer matches a badgeId from our mock users
          const scannedCashier = MOCK_CASHIERS.find(c => c.badgeId === buffer);
          if (scannedCashier) {
            setCurrentCashier(scannedCashier);
            setIsAuthModalOpen(false);
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChargeClick = () => {
    if (!currentCashier) {
      setIsAuthModalOpen(true);
    } else {
      // TODO: Proceed with charge logic since cashier is authenticated
      console.log('Proceeding with charge for cashier:', currentCashier.name);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-100 touch-manipulation select-none">
      <MobileHardwareRibbon 
        currentCashier={currentCashier}
        onSignInClick={() => setIsAuthModalOpen(true)}
        onSignOutClick={() => setCurrentCashier(null)}
      />
      <main className="flex-1 overflow-y-auto w-full pt-8 pb-[calc(env(safe-area-inset-bottom)+76px)] touch-pan-y overscroll-none scroll-smooth">
        {children}
      </main>
      <MobileThumbDock onChargeClick={handleChargeClick} />
      
      <MobileAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(cashier) => {
          setCurrentCashier(cashier);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
