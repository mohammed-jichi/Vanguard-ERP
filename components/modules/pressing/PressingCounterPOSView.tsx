'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  RotateCcw,
  Layers,
  ArrowDownLeft,
  Droplets,
  Package,
  Search,
  Fuel
} from 'lucide-react';
import { POS_CATALOG_ITEMS, INITIAL_TANKS } from '@/lib/pressingMillData';
import { POSCartItem } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function PressingCounterPOSView() {
  const { t } = useLanguage();
  const [cart, setCart] = useState<POSCartItem[]>([
    {
      id: 'POS-01',
      type: 'Sealed_Tin',
      title: 'Extra Virgin Olive Oil - 16L Standard Tin (15 KG)',
      quantity: 2,
      unit: 'Tin',
      unitPriceUSD: 95.00,
      unitPriceLBP: 8502500,
      totalUSD: 190.00,
      totalLBP: 17005000
    }
  ]);

  const [currencyMode, setCurrencyMode] = useState<'USD' | 'LBP'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(89500);
  const [customerName, setCustomerName] = useState<string>('Counter Retail Customer');
  const [paymentType, setPaymentType] = useState<'Cash_USD' | 'Cash_LBP' | 'Bank_Transfer'>('Cash_USD');
  const [cashTenderedUSD, setCashTenderedUSD] = useState<number>(200);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Totals
  const totalUSD = cart.reduce((sum, item) => sum + item.totalUSD, 0);
  const totalLBP = cart.reduce((sum, item) => sum + item.totalLBP, 0);
  const changeDueUSD = Math.max(0, cashTenderedUSD - totalUSD);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddToCart = (item: typeof POS_CATALOG_ITEMS[0]) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => {
        if (c.id === item.id) {
          const q = c.quantity + 1;
          return {
            ...c,
            quantity: q,
            totalUSD: q * c.unitPriceUSD,
            totalLBP: q * c.unitPriceLBP
          };
        }
        return c;
      }));
    } else {
      const newItem: POSCartItem = {
        id: item.id,
        type: item.type as any,
        title: item.title,
        tankId: item.tankId,
        quantity: 1,
        unit: item.unit,
        unitPriceUSD: item.unitPriceUSD,
        unitPriceLBP: item.unitPriceLBP,
        totalUSD: item.unitPriceUSD,
        totalLBP: item.unitPriceLBP
      };
      setCart([...cart, newItem]);
    }
    showToast(`${t('added_word', 'Added')} ${t(item.title, item.title)} ${t('to_pos_register', 'to POS register.')}`);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      showToast(t('pos_cart_empty', 'POS cart is empty!'));
      return;
    }

    const receiptObj = {
      receiptNumber: `REC-POS-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      customerName,
      items: [...cart],
      totalUSD,
      totalLBP,
      currencyMode,
      paymentType,
      cashTenderedUSD,
      changeDueUSD
    };

    setLastReceipt(receiptObj);
    setShowReceiptModal(true);
    setCart([]);
    showToast(`${t('transaction_completed', 'Transaction completed. Receipt')} #${receiptObj.receiptNumber}`);
  };

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
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t('pm_pos', 'Direct Mill Counter Sales & POS Register')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('pos_sub', 'Direct retail/wholesale counter desk for mill-owned olive oil, pomace/jift, and farmer reverse buy-in')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1 rounded cursor-pointer ${currencyMode === 'USD' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('LBP')}
              className={`px-3 py-1 rounded cursor-pointer ${currencyMode === 'LBP' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              LBP (L.L.)
            </button>
          </div>
          <span className="text-xs text-slate-500 font-mono">1 USD = {exchangeRate.toLocaleString()} LBP</span>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: CATALOG (LEFT) & REGISTER CART (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: QUICK CATALOG */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('quick_catalog_title', 'Quick Products & Mill Services Catalog')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POS_CATALOG_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg p-3.5 space-y-2 cursor-pointer transition flex flex-col justify-between"
                  onClick={() => handleAddToCart(item)}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.type === 'Sealed_Tin' ? 'bg-emerald-100 text-emerald-800' :
                        item.type === 'Bottle' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'Bulk_Tap' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'Pomace' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {t(item.type, item.type.replace(/_/g, ' '))}
                      </span>
                      {item.tankId && (
                        <span className="text-[9px] font-mono text-slate-400">{t('silo', 'Silo')} {item.tankId}</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{t(item.title, item.title)}</h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-sm font-bold text-slate-900">${item.unitPriceUSD.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block">{item.unitPriceLBP.toLocaleString()} LBP</span>
                    </div>
                    <button className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer">
                      + {t('add_btn', 'Add')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: CASH REGISTER & TILL */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('active_till_register', 'Active Till Register')}
              </h3>
              <span className="text-xs text-slate-500">{cart.length} {t('item_lines', 'Item Lines')}</span>
            </div>

            {/* Customer input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('customer_buyer', 'Customer / Buyer')}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Cart Table */}
            <div className="border border-slate-200 rounded-md overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 px-2.5">{t('item_header', 'Item')}</th>
                    <th className="py-2 px-2.5 text-center">{t('qty_header', 'Qty')}</th>
                    <th className="py-2 px-2.5 text-right">{t('price_header', 'Price')}</th>
                    <th className="py-2 px-2.5 text-right">{t('total_header', 'Total')}</th>
                    <th className="py-2 px-2.5 text-right">{t('delete_header', 'Del')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        {t('cart_empty_msg', 'Cart is empty. Select items from the catalog.')}
                      </td>
                    </tr>
                  ) : (
                    cart.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 px-2.5 font-medium text-slate-800 truncate max-w-[120px]" title={c.title}>
                          {t(c.title, c.title)}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold">{c.quantity}</td>
                        <td className="py-2 px-2.5 text-right font-mono">${c.unitPriceUSD}</td>
                        <td className="py-2 px-2.5 text-right font-bold text-slate-900 font-mono">${c.totalUSD.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-right">
                          <button
                            onClick={() => handleRemoveFromCart(c.id)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                <span>{t('total_due', 'Total Due')}:</span>
                <span>
                  ${totalUSD.toFixed(2)} USD / {totalLBP.toLocaleString()} LBP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">{t('payment_method_label', 'Payment Method')}</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="Cash_USD">{t('cash_usd_option', 'Cash USD ($)')}</option>
                    <option value="Cash_LBP">{t('cash_lbp_option', 'Cash LBP (L.L.)')}</option>
                    <option value="Bank_Transfer">{t('bank_transfer_option', 'Direct Wire / Card')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">{t('cash_tendered_usd', 'Cash Tendered ($)')}</label>
                  <input
                    type="number"
                    value={cashTenderedUSD}
                    onChange={(e) => setCashTenderedUSD(Number(e.target.value) || 0)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 font-bold"
                  />
                </div>
              </div>

              {cashTenderedUSD > totalUSD && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold pt-1">
                  <span>{t('change_due_customer', 'Change Due to Customer')}:</span>
                  <span>${changeDueUSD.toFixed(2)} USD (LBP {(changeDueUSD * exchangeRate).toLocaleString()})</span>
                </div>
              )}
            </div>

            {/* Complete Sale Action */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCart([])}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 cursor-pointer"
              >
                {t('clear_cart', 'Clear Cart')}
              </button>

              <button
                onClick={handleCompleteSale}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('complete_sale_print_receipt', 'Complete Sale & Print Thermal Receipt')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THERMAL RECEIPT MODAL */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 relative text-slate-800 font-mono text-xs">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h3 className="font-bold text-sm">{t('company_name_upper', 'SOUTHERN OLIVE OIL PRODUCTS')}</h3>
              <p className="text-[10px] text-slate-500">{t('choueifat_central_till', 'Choueifat Central Mill Counter Till')}</p>
              <p className="text-[10px] text-slate-500">{lastReceipt.receiptNumber} • {lastReceipt.date}</p>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 mb-3">
              {lastReceipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[180px]">{item.quantity}x {t(item.title, item.title)}</span>
                  <span>${item.totalUSD.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3 mb-3">
              <div className="flex justify-between font-bold">
                <span>{t('total_usd_upper', 'TOTAL USD:')}</span>
                <span>${lastReceipt.totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{t('total_lbp_upper', 'TOTAL LBP:')}</span>
                <span>{lastReceipt.totalLBP.toLocaleString()} LBP</span>
              </div>
              <div className="flex justify-between">
                <span>{t('paid_via_label', 'Paid via:')}</span>
                <span>{t(lastReceipt.paymentType, lastReceipt.paymentType)}</span>
              </div>
              {lastReceipt.changeDueUSD > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t('change_label', 'Change:')}</span>
                  <span>${lastReceipt.changeDueUSD.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400">
              {t('receipt_thank_you_msg', 'Thank you for trusting Southern Olive Oil Products.')}
            </div>

            <div className="mt-4 flex justify-end gap-2 font-sans">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowReceiptModal(false);
                  showToast(t('thermal_receipt_dispatched', 'Thermal receipt sent to 80mm till printer.'));
                }}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer"
              >
                {t('print', 'Print')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
