'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  PosWorkflowState,
  PosUser,
  POS_USERS,
  PosCartItem,
  POS_PRODUCTS,
  POS_EXCHANGE_RATE,
  calculatePosFinancialSummary,
  PosProductCatalogueItem,
} from '@/lib/pos/posStateEngine';
import PosTouchNumpad from '@/components/pos/PosTouchNumpad';
import PosHeaderBar from '@/components/pos/PosHeaderBar';
import PosCartTable from '@/components/pos/PosCartTable';
import PosActionRail from '@/components/pos/PosActionRail';
import PosCommandModal from '@/components/pos/PosCommandModal';
import PosGlobalReportModal from '@/components/pos/PosGlobalReportModal';
import PosCashierReportModal from '@/components/pos/PosCashierReportModal';
import PosOlderSalesModal from '@/components/pos/PosOlderSalesModal';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Search,
  DollarSign,
  CreditCard,
  Banknote,
  X,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

export default function POSTouchTerminalPage() {
  const router = useRouter();

  // 1. Workflow State Machine
  const [workflowState, setWorkflowState] = useState<PosWorkflowState>('LOGIN_USER_ID');
  const [enteredUserId, setEnteredUserId] = useState<string>('101');
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<PosUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // 2. Terminal Operational State
  const [cart, setCart] = useState<PosCartItem[]>([
    {
      id: '1',
      barcode: '1001',
      name: '17.5L Extra Virgin Olive Oil Tin',
      qty: 1,
      priceUsd: 110.0,
      totalUsd: 110.0,
      totalLbp: 110.0 * POS_EXCHANGE_RATE,
    },
    {
      id: '2',
      barcode: '1003',
      name: 'Pure Pomegranate Molasses 500ml',
      qty: 2,
      priceUsd: 6.0,
      totalUsd: 12.0,
      totalLbp: 12.0 * POS_EXCHANGE_RATE,
    },
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [inputMode, setInputMode] = useState<'BARCODE' | 'QTY' | 'PRICE' | 'DISCOUNT'>('BARCODE');
  const [heldBills, setHeldBills] = useState<PosCartItem[][]>([]);
  const [billDiscountPercent, setBillDiscountPercent] = useState<number>(0);
  const [amountPaidUsd, setAmountPaidUsd] = useState<number>(0);

  // 3. Modals State
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [isGlobalReportOpen, setIsGlobalReportOpen] = useState<boolean>(false);
  const [isCashierReportOpen, setIsCashierReportOpen] = useState<boolean>(false);
  const [isOlderSalesOpen, setIsOlderSalesOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('READY FOR TRANSACTION');

  // Calculated Dual-Currency Financial Summary
  const financialSummary = useMemo(
    () => calculatePosFinancialSummary(cart, amountPaidUsd, billDiscountPercent),
    [cart, amountPaidUsd, billDiscountPercent]
  );

  // --------------------------------------------------------------------------
  // AUTHENTICATION WORKFLOW HANDLERS
  // --------------------------------------------------------------------------
  const handleUserIdEnter = () => {
    setLoginError(null);
    const matchedUser = POS_USERS.find((u) => u.id === enteredUserId.trim());
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setWorkflowState('LOGIN_PASSWORD');
    } else {
      setLoginError(`Invalid User ID '${enteredUserId}'. Try 101, 102, or 103.`);
    }
  };

  const handlePasswordEnter = () => {
    setLoginError(null);
    if (!currentUser) {
      setWorkflowState('LOGIN_USER_ID');
      return;
    }

    if (enteredPassword === currentUser.pin) {
      setWorkflowState('ROLE_ROUTING');
      setTimeout(() => {
        setWorkflowState('POS_TERMINAL');
        setStatusMessage(`CASHIER ${currentUser.name.toUpperCase()} LOGGED IN (W#: 1)`);
      }, 400);
    } else {
      setLoginError('Invalid PIN code entered. Try again.');
      setEnteredPassword('');
    }
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    setSyncNotice('Connecting to Vanguard Cloud ERP Master Node...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncNotice('Data Synced: 8 Products, 3 Cashiers, Exchange Rate: 89,500 LBP.');
      setTimeout(() => setSyncNotice(null), 4000);
    }, 1200);
  };

  const handleLock = () => {
    setEnteredPassword('');
    setLoginError(null);
    setWorkflowState('LOGIN_PASSWORD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEnteredPassword('');
    setEnteredUserId('101');
    setLoginError(null);
    setWorkflowState('LOGIN_USER_ID');
  };

  // --------------------------------------------------------------------------
  // CART ACTIONS
  // --------------------------------------------------------------------------
  const handleAddItemByCatalogue = (product: PosProductCatalogueItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.barcode === product.barcode);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.qty + 1;
        const totalUsd = Number((newQty * item.priceUsd).toFixed(2));
        updated[existingIdx] = {
          ...item,
          qty: newQty,
          totalUsd,
          totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
        };
        setSelectedIndex(existingIdx);
        return updated;
      }
      const newItem: PosCartItem = {
        id: `CART-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        barcode: product.barcode,
        name: product.name,
        qty: 1,
        priceUsd: product.priceUsd,
        totalUsd: product.priceUsd,
        totalLbp: Math.round(product.priceUsd * POS_EXCHANGE_RATE),
      };
      setSelectedIndex(prev.length);
      return [...prev, newItem];
    });
    setStatusMessage(`ADDED: ${product.name}`);
  };

  const handleQtyAdd = () => {
    if (cart.length === 0 || selectedIndex < 0 || selectedIndex >= cart.length) return;
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[selectedIndex];
      const newQty = item.qty + 1;
      const totalUsd = Number((newQty * item.priceUsd).toFixed(2));
      updated[selectedIndex] = {
        ...item,
        qty: newQty,
        totalUsd,
        totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
      };
      return updated;
    });
  };

  const handleQtyMinus = () => {
    if (cart.length === 0 || selectedIndex < 0 || selectedIndex >= cart.length) return;
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[selectedIndex];
      if (item.qty <= 1) {
        return prev.filter((_, idx) => idx !== selectedIndex);
      }
      const newQty = item.qty - 1;
      const totalUsd = Number((newQty * item.priceUsd).toFixed(2));
      updated[selectedIndex] = {
        ...item,
        qty: newQty,
        totalUsd,
        totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
      };
      return updated;
    });
  };

  const handleVoidRow = () => {
    if (cart.length === 0 || selectedIndex < 0 || selectedIndex >= cart.length) return;
    const removedName = cart[selectedIndex]?.name;
    setCart((prev) => prev.filter((_, idx) => idx !== selectedIndex));
    setSelectedIndex((prev) => Math.max(0, prev - 1));
    setStatusMessage(`VOIDED LINE: ${removedName || 'Item'}`);
  };

  const handleCleanCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setAmountPaidUsd(0);
    setBillDiscountPercent(0);
    setInputBuffer('');
    setStatusMessage('CLEARED ACTIVE BILL');
  };

  const handleHoldBill = () => {
    if (cart.length === 0) return;
    setHeldBills((prev) => [...prev, cart]);
    setCart([]);
    setAmountPaidUsd(0);
    setStatusMessage(`BILL HELD. ${heldBills.length + 1} BILL(S) ON HOLD.`);
  };

  const handleRecallBill = () => {
    if (heldBills.length === 0) {
      setStatusMessage('NO HELD BILLS FOUND');
      return;
    }
    const lastHeld = heldBills[heldBills.length - 1];
    setHeldBills((prev) => prev.slice(0, prev.length - 1));
    setCart(lastHeld);
    setSelectedIndex(0);
    setStatusMessage(`RECALLED HELD BILL (${lastHeld.length} ITEMS)`);
  };

  const handleToggleRefund = () => {
    if (cart.length === 0 || selectedIndex < 0 || selectedIndex >= cart.length) return;
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[selectedIndex];
      const isCurrentlyRefund = item.totalUsd < 0;
      const newMultiplier = isCurrentlyRefund ? 1 : -1;
      const price = Math.abs(item.priceUsd) * newMultiplier;
      const totalUsd = Number((item.qty * price).toFixed(2));
      updated[selectedIndex] = {
        ...item,
        priceUsd: price,
        totalUsd,
        totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
      };
      return updated;
    });
    setStatusMessage('TOGGLED REFUND MODE FOR SELECTED LINE');
  };

  // --------------------------------------------------------------------------
  // TERMINAL NUMPAD & ENTRY HANDLER
  // --------------------------------------------------------------------------
  const handleTerminalNumpadPress = (key: string) => {
    setInputBuffer((prev) => prev + key);
  };

  const handleTerminalNumpadClear = () => {
    setInputBuffer('');
  };

  const handleTerminalNumpadBackspace = () => {
    setInputBuffer((prev) => prev.slice(0, -1));
  };

  const handleTerminalNumpadEnter = () => {
    if (!inputBuffer) return;

    if (inputMode === 'BARCODE') {
      // Lookup barcode
      const found = POS_PRODUCTS.find(
        (p) => p.barcode === inputBuffer || p.id.toLowerCase() === inputBuffer.toLowerCase()
      );
      if (found) {
        handleAddItemByCatalogue(found);
        setInputBuffer('');
      } else {
        setStatusMessage(`BARCODE '${inputBuffer}' NOT FOUND IN REGISTRY`);
      }
    } else if (inputMode === 'QTY') {
      const parsedQty = parseInt(inputBuffer, 10);
      if (!isNaN(parsedQty) && parsedQty > 0 && cart[selectedIndex]) {
        setCart((prev) => {
          const updated = [...prev];
          const item = updated[selectedIndex];
          const totalUsd = Number((parsedQty * item.priceUsd).toFixed(2));
          updated[selectedIndex] = {
            ...item,
            qty: parsedQty,
            totalUsd,
            totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
          };
          return updated;
        });
        setStatusMessage(`SET QTY TO ${parsedQty}`);
      }
      setInputMode('BARCODE');
      setInputBuffer('');
    } else if (inputMode === 'PRICE') {
      const parsedPrice = parseFloat(inputBuffer);
      if (!isNaN(parsedPrice) && parsedPrice >= 0 && cart[selectedIndex]) {
        setCart((prev) => {
          const updated = [...prev];
          const item = updated[selectedIndex];
          const totalUsd = Number((item.qty * parsedPrice).toFixed(2));
          updated[selectedIndex] = {
            ...item,
            priceUsd: parsedPrice,
            totalUsd,
            totalLbp: Math.round(totalUsd * POS_EXCHANGE_RATE),
          };
          return updated;
        });
        setStatusMessage(`SET PRICE TO $${parsedPrice.toFixed(2)}`);
      }
      setInputMode('BARCODE');
      setInputBuffer('');
    } else if (inputMode === 'DISCOUNT') {
      const parsedDisc = parseFloat(inputBuffer);
      if (!isNaN(parsedDisc) && parsedDisc >= 0 && parsedDisc <= 100) {
        setBillDiscountPercent(parsedDisc);
        setStatusMessage(`APPLIED BILL DISCOUNT: ${parsedDisc}%`);
      }
      setInputMode('BARCODE');
      setInputBuffer('');
    }
  };

  // --------------------------------------------------------------------------
  // KEYBOARD EVENT HOOK
  // --------------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Global Omega POS Hotkeys
      if (e.ctrlKey && e.key === 'F4') {
        e.preventDefault();
        setIsCmdOpen(false);
        setIsCashierReportOpen(false);
        setIsOlderSalesOpen(false);
        setIsGlobalReportOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey && e.key === 'F5') {
        e.preventDefault();
        setIsCmdOpen(false);
        setIsGlobalReportOpen(false);
        setIsOlderSalesOpen(false);
        setIsCashierReportOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey && e.key === 'F6') {
        e.preventDefault();
        setIsCmdOpen(false);
        setIsGlobalReportOpen(false);
        setIsCashierReportOpen(false);
        setIsOlderSalesOpen((prev) => !prev);
        return;
      }
      if (e.ctrlKey && e.key === 'F8') {
        e.preventDefault();
        router.push('/backoffice/dashboard');
        return;
      }

      // Close open modals on Escape
      if (
        isCmdOpen ||
        isGlobalReportOpen ||
        isCashierReportOpen ||
        isOlderSalesOpen ||
        isSearchOpen ||
        isCheckoutOpen
      ) {
        if (e.key === 'Escape') {
          setIsCmdOpen(false);
          setIsGlobalReportOpen(false);
          setIsCashierReportOpen(false);
          setIsOlderSalesOpen(false);
          setIsSearchOpen(false);
          setIsCheckoutOpen(false);
        }
        return;
      }

      if (workflowState === 'LOGIN_USER_ID') {
        if (e.key >= '0' && e.key <= '9') {
          setEnteredUserId((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          setEnteredUserId((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handleUserIdEnter();
        }
      } else if (workflowState === 'LOGIN_PASSWORD') {
        if (e.key >= '0' && e.key <= '9') {
          setEnteredPassword((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          setEnteredPassword((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handlePasswordEnter();
        } else if (e.key === 'Escape') {
          setWorkflowState('LOGIN_USER_ID');
        }
      } else if (workflowState === 'POS_TERMINAL') {
        if (e.key >= '0' && e.key <= '9') {
          setInputBuffer((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          setInputBuffer((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handleTerminalNumpadEnter();
        } else if (e.key === 'Escape') {
          setInputBuffer('');
        }
      }
    },
    [
      workflowState,
      currentUser,
      isCmdOpen,
      isGlobalReportOpen,
      isCashierReportOpen,
      isOlderSalesOpen,
      isSearchOpen,
      isCheckoutOpen,
      inputBuffer,
      inputMode,
      router,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // --------------------------------------------------------------------------
  // SCREEN 1: LOGIN_USER_ID
  // --------------------------------------------------------------------------
  if (workflowState === 'LOGIN_USER_ID') {
    return (
      <div className="w-screen h-screen bg-[#0d1016] text-white flex flex-col justify-between items-center select-none font-sans overflow-hidden">
        {/* Top Branding Banner */}
        <div className="w-full h-14 bg-[#141720] border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" />
            <span className="font-mono font-black text-amber-400 text-lg tracking-wider">
              VANGUARD <span className="text-white font-light">TOUCH POS</span>
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Node: CHO-MAIN-01 | Commercial Retail Edition
          </div>
        </div>

        {/* Central Authentication Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-sm">
          <div className="w-full bg-[#161a24] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400 mb-3">
              <User className="w-8 h-8" />
            </div>

            <h1 className="text-lg font-black font-mono tracking-wide text-slate-100 uppercase mb-1">
              ENTER CASHIER ID
            </h1>
            <p className="text-xs text-slate-400 mb-4 text-center">
              Use tactile numpad or pick an active cashier profile
            </p>

            {/* User ID Input Box */}
            <div className="w-full bg-[#0e1118] border-2 border-amber-500/80 rounded-xl h-14 flex items-center justify-center px-4 font-mono text-2xl font-bold tracking-widest text-amber-300 shadow-inner mb-3">
              {enteredUserId || <span className="text-slate-600">_</span>}
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="w-full p-2 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 text-xs font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* 12-Key Tactile Numpad */}
            <PosTouchNumpad
              variant="login"
              onKeyPress={(digit) => setEnteredUserId((prev) => prev + digit)}
              onClear={() => setEnteredUserId('')}
              onBackspace={() => setEnteredUserId((prev) => prev.slice(0, -1))}
              onEnter={handleUserIdEnter}
              className="mt-1"
            />

            {/* Quick Pick Profiles */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800 flex justify-center gap-2">
              {POS_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEnteredUserId(user.id);
                    setCurrentUser(user);
                    setWorkflowState('LOGIN_PASSWORD');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
                >
                  {user.id}: {user.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status & Sync Bar */}
        <div className="w-full bg-[#11141c] border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-slate-400">
              {syncNotice || 'System Status: Ready / Touch Numpad Active'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSyncData}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Synchronize Data'}</span>
            </button>

            <Link
              href="/backoffice/dashboard"
              className="px-3 py-1.5 rounded-lg bg-[#1a1f2c] hover:bg-slate-800 text-slate-300 font-bold border border-slate-700"
            >
              Exit to Backoffice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: LOGIN_PASSWORD
  // --------------------------------------------------------------------------
  if (workflowState === 'LOGIN_PASSWORD') {
    return (
      <div className="w-screen h-screen bg-[#0d1016] text-white flex flex-col justify-between items-center select-none font-sans overflow-hidden">
        {/* Top Header */}
        <div className="w-full h-14 bg-[#141720] border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono font-black text-amber-400 text-lg">
              VANGUARD <span className="text-white font-light">TOUCH POS</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setWorkflowState('LOGIN_USER_ID')}
            className="text-xs text-amber-400 hover:underline font-mono"
          >
            ← Switch Cashier ID
          </button>
        </div>

        {/* Central PIN Entry Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-sm">
          <div className="w-full bg-[#161a24] border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-400 mb-3">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-lg font-black font-mono tracking-wide text-slate-100 uppercase mb-1">
              ENTER CASHIER PIN
            </h1>
            <p className="text-xs text-amber-400 font-bold mb-4 text-center">
              {currentUser?.name} ({currentUser?.role})
            </p>

            {/* Masked Password Display */}
            <div className="w-full bg-[#0e1118] border-2 border-amber-500/80 rounded-xl h-14 flex items-center justify-center px-4 font-mono text-3xl font-bold tracking-widest text-amber-400 shadow-inner mb-3">
              {enteredPassword ? '•'.repeat(enteredPassword.length) : <span className="text-slate-600">PIN</span>}
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="w-full p-2 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-300 text-xs font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* 12-Key Tactile Numpad */}
            <PosTouchNumpad
              variant="login"
              onKeyPress={(digit) => setEnteredPassword((prev) => prev + digit)}
              onClear={() => setEnteredPassword('')}
              onBackspace={() => setEnteredPassword((prev) => prev.slice(0, -1))}
              onEnter={handlePasswordEnter}
              className="mt-1"
            />
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="w-full bg-[#11141c] border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>PIN: Cashier Maya (1234), Admin Hadi (0000)</span>
          <button
            type="button"
            onClick={() => setWorkflowState('LOGIN_USER_ID')}
            className="text-amber-400 hover:underline font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 3: ROLE_ROUTING (Flash Transition)
  // --------------------------------------------------------------------------
  if (workflowState === 'ROLE_ROUTING') {
    return (
      <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col items-center justify-center font-mono">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col items-center gap-3">
          <ShieldCheck className="w-12 h-12 text-amber-400 animate-bounce" />
          <h2 className="text-xl font-bold text-amber-300">AUTHENTICATION VERIFIED</h2>
          <p className="text-xs text-slate-300">
            Role: {currentUser?.role} | Station: {currentUser?.workstation} | Branch: {currentUser?.branch}
          </p>
          <div className="text-[11px] text-emerald-400 font-bold">Routing to Fullscreen POS Terminal...</div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 4: FULL COMMERCIAL POS TOUCH TERMINAL
  // --------------------------------------------------------------------------
  return (
    <div className="w-screen h-screen bg-[#0d1016] text-white flex flex-col font-sans select-none overflow-hidden text-left">
      {/* 1. Header Bar */}
      <PosHeaderBar
        currentUser={currentUser}
        onLock={handleLock}
        onLogout={handleLogout}
        workstationMode="RETAIL TOUCH POS (OMEGA ENGINE)"
      />

      {/* 2. Main 3-Column Terminal Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Cart & Bill View */}
        <div className="w-[420px] sm:w-[480px] lg:w-[520px] h-full flex flex-col">
          <PosCartTable
            items={cart}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            onQtyAdd={handleQtyAdd}
            onQtyMinus={handleQtyMinus}
            onVoidRow={handleVoidRow}
            onCleanCart={handleCleanCart}
            onHoldBill={handleHoldBill}
            onRecallBill={handleRecallBill}
            onToggleRefund={handleToggleRefund}
            financialSummary={financialSummary}
            heldBillsCount={heldBills.length}
          />
        </div>

        {/* Center Column: Entry Display, Numpad & Quick Touch Catalogue */}
        <div className="flex-1 flex flex-col bg-[#141720] border-r border-slate-800 p-2.5 sm:p-3 overflow-y-auto">
          {/* Barcode & Value Entry Display Box */}
          <div className="bg-[#0b0e14] border-2 border-amber-500/80 rounded-xl p-3 shadow-inner flex flex-col gap-1 mb-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300 uppercase">MODE: {inputMode}</span>
              </div>
              <span className="text-[10px] text-slate-500">Rate: 89,500 LBP / USD</span>
            </div>

            <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-wider flex items-center justify-between min-h-[36px]">
              <span>{inputBuffer || <span className="text-slate-600 animate-pulse">|</span>}</span>
              {inputMode !== 'BARCODE' && (
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('BARCODE');
                    setInputBuffer('');
                  }}
                  className="text-xs font-sans px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Reset Mode
                </button>
              )}
            </div>
          </div>

          {/* Quick Item Category Tabs & Grid (Commercial Touch Panel) */}
          <div className="mb-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5 flex justify-between items-center">
              <span>QUICK TOUCH PRODUCTS</span>
              <span className="text-emerald-400">1-Touch Add</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {POS_PRODUCTS.slice(0, 8).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleAddItemByCatalogue(prod)}
                  className="p-2.5 rounded-lg bg-[#1f2533] hover:bg-[#2a3245] border border-slate-700/80 hover:border-amber-400 text-left flex flex-col justify-between transition-all cursor-pointer active:translate-y-0.5 shadow-sm min-h-[72px]"
                >
                  <span className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                    {prod.name}
                  </span>
                  <div className="flex justify-between items-center mt-2 font-mono text-xs">
                    <span className="text-amber-400 font-bold">${prod.priceUsd.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">
                      {Math.round((prod.priceUsd * POS_EXCHANGE_RATE) / 1000)}k LL
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Full Commercial Numpad */}
          <div className="mt-auto">
            <PosTouchNumpad
              variant="terminal"
              onKeyPress={handleTerminalNumpadPress}
              onClear={handleTerminalNumpadClear}
              onBackspace={handleTerminalNumpadBackspace}
              onEnter={handleTerminalNumpadEnter}
            />
          </div>
        </div>

        {/* Right Column: Fast Tenders & Action Rail */}
        <PosActionRail
          onEnterAmount={() => {
            setInputMode('PRICE');
            setInputBuffer('');
            setStatusMessage('ENTER NEW ITEM PRICE VIA NUMPAD');
          }}
          onPayCash={() => {
            setAmountPaidUsd(financialSummary.netUsd);
            setIsCheckoutOpen(true);
          }}
          onOtherPayments={() => {
            setIsCheckoutOpen(true);
          }}
          onSearchProducts={() => setIsSearchOpen(true)}
          onApplyBillDiscountPercent={() => {
            setInputMode('DISCOUNT');
            setInputBuffer('');
            setStatusMessage('ENTER BILL DISCOUNT PERCENT (%) VIA NUMPAD');
          }}
          onApplyBillDiscountDollar={() => {
            setInputMode('PRICE');
            setStatusMessage('ENTER BILL DISCOUNT AMOUNT VIA NUMPAD');
          }}
          onApplyItemDiscount={() => {
            setInputMode('DISCOUNT');
            setStatusMessage('ENTER ITEM DISCOUNT VIA NUMPAD');
          }}
          onSetPrice={() => {
            setInputMode('PRICE');
            setStatusMessage('ENTER CUSTOM PRICE VIA NUMPAD');
          }}
          onNoSale={() => {
            setStatusMessage('KICKED CASH DRAWER (NO SALE RECORDED)');
          }}
          onOpenCustomers={() => {
            setStatusMessage('OPENED CUSTOMER SELECTION WORKSTATION');
          }}
          onOpenOrders={() => {
            setStatusMessage('ACTIVE ORDERS RETRIEVED (0 PENDING)');
          }}
          onClearDiscountPay={() => {
            setBillDiscountPercent(0);
            setAmountPaidUsd(0);
            setStatusMessage('CLEARED DISCOUNTS & PAYMENTS');
          }}
          onOpenCmd={() => setIsCmdOpen(true)}
        />
      </div>

      {/* 3. Bottom Status Bar */}
      <footer className="h-8 bg-[#0e1117] border-t border-slate-800 px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-bold">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Items: {cart.length}</span>
          <span>Hold: {heldBills.length}</span>
          <span className="text-amber-400 font-bold">1 USD = 89,500 LBP</span>
        </div>
      </footer>

      {/* Overlays & Modals */}
      <PosCommandModal
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        currentUser={currentUser}
        onNoSale={() => setStatusMessage('DRAWER OPENED VIA COMMAND CENTER (NO SALE)')}
        onReprintReceipt={() => setStatusMessage('REPRINTED LAST VOUCHER (#102991)')}
        onShowShiftSummary={() => setIsCashierReportOpen(true)}
        onOpenGlobalReport={() => setIsGlobalReportOpen(true)}
        onOpenCashierReport={() => setIsCashierReportOpen(true)}
        onOpenOlderSales={() => setIsOlderSalesOpen(true)}
      />

      {/* Global Daily Sales Audit Report (Ctrl+F4) */}
      <PosGlobalReportModal
        isOpen={isGlobalReportOpen}
        onClose={() => setIsGlobalReportOpen(false)}
        onPrint={() => setStatusMessage('PRINTED GLOBAL DAILY SALES AUDIT')}
        onEndOfDay={() => {
          setStatusMessage('END OF DAY (Z-REPORT) PERFORMED');
          handleLock();
        }}
      />

      {/* Cashier Shift Reconciliation X-Reading (Ctrl+F5) */}
      <PosCashierReportModal
        isOpen={isCashierReportOpen}
        onClose={() => setIsCashierReportOpen(false)}
        currentUser={currentUser}
        onPrint={() => setStatusMessage('PRINTED CASHIER X-READING VOUCHER')}
        onCloseShift={() => {
          setStatusMessage('CASHIER SHIFT CLOSED');
          handleLogout();
        }}
      />

      {/* Historical Sales & Duplicate Voucher Reprint (Ctrl+F6) */}
      <PosOlderSalesModal
        isOpen={isOlderSalesOpen}
        onClose={() => setIsOlderSalesOpen(false)}
        onReprint={(invoice) => setStatusMessage(`REPRINTED INVOICE ${invoice.invoiceNo}`)}
      />

      {/* Fast Tender Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#161a23] border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl flex flex-col gap-4 select-none">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h2 className="text-lg font-mono font-black text-amber-400 uppercase">
                TENDER PAYMENT
              </h2>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0e1118] border border-slate-700 rounded-xl p-3 font-mono space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Due USD:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${financialSummary.netUsd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Due LBP (89,500):</span>
                <span className="text-amber-400 font-bold">
                  {financialSummary.netLbp.toLocaleString()} LBP
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  alert(`Sale finalized via CASH (LBP)! Total: ${financialSummary.netLbp.toLocaleString()} LBP`);
                  handleCleanCart();
                  setIsCheckoutOpen(false);
                }}
                className="p-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/60 text-white font-mono font-bold flex flex-col items-center gap-1.5"
              >
                <Banknote className="w-5 h-5 text-emerald-300" />
                <span>CASH (LBP)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Sale finalized via CASH (USD)! Total: $${financialSummary.netUsd.toFixed(2)}`);
                  handleCleanCart();
                  setIsCheckoutOpen(false);
                }}
                className="p-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/60 text-white font-mono font-bold flex flex-col items-center gap-1.5"
              >
                <DollarSign className="w-5 h-5 text-emerald-300" />
                <span>CASH (USD)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Sale finalized via CREDIT CARD! Total: $${financialSummary.netUsd.toFixed(2)}`);
                  handleCleanCart();
                  setIsCheckoutOpen(false);
                }}
                className="p-3.5 rounded-xl bg-sky-900/60 hover:bg-sky-800/80 border border-sky-500/60 text-white font-mono font-bold flex flex-col items-center gap-1.5"
              >
                <CreditCard className="w-5 h-5 text-sky-300" />
                <span>CREDIT CARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Sale recorded to CUSTOMER ACCOUNT! Total: $${financialSummary.netUsd.toFixed(2)}`);
                  handleCleanCart();
                  setIsCheckoutOpen(false);
                }}
                className="p-3.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/60 text-white font-mono font-bold flex flex-col items-center gap-1.5"
              >
                <FileText className="w-5 h-5 text-purple-300" />
                <span>ON ACCOUNT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#161a23] border border-slate-700 rounded-2xl w-full max-w-xl p-5 text-slate-100 shadow-2xl flex flex-col gap-3 select-none">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2.5">
              <h2 className="text-base font-mono font-bold text-amber-400 uppercase">
                PRODUCT CATALOGUE SEARCH
              </h2>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {POS_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    handleAddItemByCatalogue(prod);
                    setIsSearchOpen(false);
                  }}
                  className="p-3 hover:bg-slate-800/80 rounded-lg cursor-pointer flex justify-between items-center transition-colors font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-100 block font-sans">{prod.name}</span>
                    <span className="text-[11px] text-slate-400">Barcode: {prod.barcode} | Cat: {prod.category}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">${prod.priceUsd.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
