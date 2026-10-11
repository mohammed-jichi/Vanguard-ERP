'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Truck,
  UtensilsCrossed,
  UserCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Clock,
  QrCode,
  Flame,
} from 'lucide-react';
import {
  VMENU_PRODUCTS,
  VMENU_SALES_REPS,
  VMENU_EXCHANGE_RATE,
  VMenuProduct,
  VMenuCartItem,
  VMenuOrderResponse,
  persistRepId,
  getPersistedRepId,
  calculateRepCommission,
} from '@/lib/vmenuService';

function VMenuContent() {
  const searchParams = useSearchParams();

  // Multi-source Parameter Parsing
  const rawTable = searchParams.get('table');
  const rawBranch = searchParams.get('branch') || 'showroom';
  const rawRepId = searchParams.get('rep_id') || searchParams.get('rep');
  const rawCampaign = searchParams.get('campaign') || 'direct';

  // Persistence of Rep Attribution
  const [attributedRepId, setAttributedRepId] = useState<string | null>(null);

  useEffect(() => {
    if (rawRepId) {
      persistRepId(rawRepId);
      setAttributedRepId(rawRepId.toUpperCase());
    } else {
      const persisted = getPersistedRepId();
      if (persisted) {
        setAttributedRepId(persisted);
      }
    }
  }, [rawRepId]);

  const activeRep = attributedRepId ? VMENU_SALES_REPS[attributedRepId] : null;

  // Language state (en / ar)
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  // Category filter & search
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<Record<string, VMenuCartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form state
  const isTableModeDefault = Boolean(rawTable);
  const [orderType, setOrderType] = useState<'TABLE_DINE_IN' | 'DELIVERY'>(
    isTableModeDefault ? 'TABLE_DINE_IN' : 'DELIVERY'
  );
  const [tableNumber, setTableNumber] = useState(rawTable || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [destinationTown, setDestinationTown] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [corridorId, setCorridorId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CASH_AT_COUNTER' | 'WHISH'>('COD');
  const [orderNotes, setOrderNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<VMenuOrderResponse | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return VMENU_PRODUCTS.filter((prod) => {
      const matchesCat = activeCategory === 'All' || prod.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        prod.nameEn.toLowerCase().includes(query) ||
        prod.nameAr.includes(query) ||
        prod.itemCode.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: VMenuProduct) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const nextQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [product.id]: { product, quantity: nextQty },
      };
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: nextQty },
      };
    });
  };

  const cartItemsList = Object.values(cart);
  const totalItemCount = cartItemsList.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalUsd = cartItemsList.reduce((acc, item) => acc + item.product.priceUsd * item.quantity, 0);
  const deliveryFeeUsd = orderType === 'DELIVERY' ? 4.0 : 0.0;
  const grandTotalUsd = Number((subtotalUsd + deliveryFeeUsd).toFixed(2));
  const grandTotalLbp = Math.round(grandTotalUsd * VMENU_EXCHANGE_RATE);

  // Form submission handler
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cartItemsList.length === 0) {
      setSubmitError(lang === 'en' ? 'Your cart is empty.' : 'عربة التسوق فارغة.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError(
        lang === 'en'
          ? 'Please enter your name and phone number.'
          : 'يرجى إدخال اسمك ورقم الهاتف للتواصل.'
      );
      return;
    }

    if (orderType === 'DELIVERY' && (!destinationTown.trim() || !deliveryAddress.trim())) {
      setSubmitError(
        lang === 'en'
          ? 'Please provide your delivery town and street address.'
          : 'يرجى تحديد البلدة/المنطقة وعنوان التوصيل.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        orderType,
        tableNumber: orderType === 'TABLE_DINE_IN' ? tableNumber || 'Showroom Dining' : undefined,
        branchId: rawBranch,
        repId: attributedRepId || undefined,
        campaign: rawCampaign,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        destinationTown: orderType === 'DELIVERY' ? destinationTown.trim() : undefined,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        corridorId: orderType === 'DELIVERY' ? corridorId : undefined,
        paymentMethod: orderType === 'TABLE_DINE_IN' && paymentMethod === 'COD' ? 'CASH_AT_COUNTER' : paymentMethod,
        items: cartItemsList.map((item) => ({
          id: item.product.id,
          itemCode: item.product.itemCode,
          name: lang === 'en' ? item.product.nameEn : item.product.nameAr,
          quantity: item.quantity,
          priceUsd: item.product.priceUsd,
          priceLbp: item.product.priceLbp,
        })),
        notes: orderNotes.trim(),
      };

      const res = await fetch('/api/vmenu/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order. Please check connection.');
      }

      setOrderSuccess(data);
      setCart({});
      setIsCartOpen(false);
    } catch (err: any) {
      console.error('V-Menu submit error:', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'All', labelEn: 'All Products', labelAr: 'جميع الأصناف' },
    { id: 'Olive Oil', labelEn: 'Extra Virgin Oil', labelAr: 'زيت زيتون بكر' },
    { id: 'Preserves', labelEn: 'Molasses & Preserves', labelAr: 'دبس ومربيات' },
    { id: 'Olives', labelEn: 'Olives & Pickles', labelAr: 'زيتون ومخللات' },
    { id: 'Detergents', labelEn: 'Soaps & Hygiene', labelAr: 'صابون ومنظفات' },
  ];

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-28 select-none"
    >
      {/* Top Vanguard V-Menu Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-black text-white text-base shadow-sm border border-emerald-500/30">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">Vanguard V-Menu</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Southern Olive Oil Products S.A.R.L
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md animate-bounce">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Context Banners: Table vs Rep Attribution */}
      <div className="max-w-4xl mx-auto px-4 pt-3 space-y-2">
        {/* Table Banner */}
        {tableNumber && (
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-600/40 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{lang === 'en' ? `Table #${tableNumber}` : `طاولة رقم ${tableNumber}`}</span>
                  <span className="text-[10px] font-normal text-emerald-400">• {lang === 'en' ? 'Dine-In Service' : 'تناول في الصالة'}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'en'
                    ? 'Orders route straight to our showroom counter staff.'
                    : 'تُرسل الطلبات مباشرة لطاقم الخدمة في صالة العرض.'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {lang === 'en' ? 'Fast Dining' : 'خدمة سريعة'}
            </span>
          </div>
        )}

        {/* Rep Attribution Banner */}
        {activeRep && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-blue-500/30 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${activeRep.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-xs`}>
                {activeRep.repCode.slice(-3)}
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {lang === 'en' ? `Assisted by: ${activeRep.fullName}` : `بمساعدة المندوب: ${activeRep.fullNameAr}`}
                  </span>
                </span>
                <p className="text-[10px] text-slate-400">
                  {lang === 'en'
                    ? `Representative ID: ${activeRep.repCode} (${activeRep.assignedChannel})`
                    : `كود المندوب: ${activeRep.repCode} (${activeRep.assignedChannel})`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {Math.round(activeRep.defaultCommissionRate * 100)}% Verified
            </span>
          </div>
        )}
      </div>

      {/* Hero Welcome & Search */}
      <section className="max-w-4xl mx-auto px-4 pt-4 pb-2 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute top-3.5 start-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Search extra virgin olive oil, molasses, pickles, soaps...'
                : 'ابحث عن زيت زيتون، دبس رمان، مخللات، صابون غار...'
            }
            className="w-full ps-9 pe-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-3 end-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {lang === 'en' ? cat.labelEn : cat.labelAr}
            </button>
          ))}
        </div>
      </section>

      {/* Order Success Modal State */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-center animate-in zoom-in-95 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {lang === 'en' ? 'Order Confirmed & Logged' : 'تم تأكيد الطلب وتسجيله'}
              </span>
              <h3 className="text-xl font-black text-white">
                {orderSuccess.orderNumber}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {orderSuccess.message}
              </p>
            </div>

            {/* Breakdown card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-start space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{lang === 'en' ? 'Total (USD):' : 'المجموع بالدولار:'}</span>
                <span className="font-bold text-white">${orderSuccess.totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{lang === 'en' ? 'Total (LBP):' : 'المجموع بالليرة:'}</span>
                <span className="font-bold text-emerald-400">{orderSuccess.totalLbp.toLocaleString()} LBP</span>
              </div>

              {orderSuccess.repAttribution && (
                <div className="pt-2 border-t border-slate-800 flex justify-between text-blue-400">
                  <span>{lang === 'en' ? `Rep Commission (${orderSuccess.repAttribution.repCode}):` : `عمولة المندوب (${orderSuccess.repAttribution.repCode}):`}</span>
                  <span className="font-mono font-bold">${orderSuccess.repAttribution.commissionAmountUsd.toFixed(2)}</span>
                </div>
              )}

              {orderSuccess.fleetDispatch && 'assignedDriver' in orderSuccess.fleetDispatch && (
                <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'SuperSonic Fleet Dispatched' : 'تم تعيين أسطول التوصيل'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lang === 'en'
                      ? `Driver: ${orderSuccess.fleetDispatch.assignedDriver} • Corridor #${orderSuccess.fleetDispatch.corridorId}`
                      : `السائق: ${orderSuccess.fleetDispatch.assignedDriver} • خط السير #${orderSuccess.fleetDispatch.corridorId}`}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link prefetch={false}
                href="/vtrack"
                target="_blank"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>{lang === 'en' ? 'Track Live in V-Track' : 'متابعة حية في ڤي-تراك'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                {lang === 'en' ? 'Place Another Order' : 'تسجيل طلب جديد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Grid */}
      <main className="max-w-4xl mx-auto px-4 space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map((prod) => {
            const inCartItem = cart[prod.id];
            return (
              <div
                key={prod.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {prod.badge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Sparkles className="w-2.5 h-2.5" />
                          {prod.badge}
                        </span>
                      )}
                      <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition">
                        {lang === 'en' ? prod.nameEn : prod.nameAr}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 whitespace-nowrap">
                      {prod.itemCode}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'en' ? prod.descriptionEn : prod.descriptionAr}
                  </p>

                  <div className="inline-block text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    📦 {prod.packagingUnit}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-between gap-2 mt-3">
                  <div>
                    <div className="text-base font-black text-white">
                      ${prod.priceUsd.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold">
                      {prod.priceLbp.toLocaleString()} LBP
                    </div>
                  </div>

                  {inCartItem ? (
                    <div className="flex items-center gap-2 bg-slate-850 border border-emerald-500/40 rounded-xl px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(prod.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-white px-1">
                        {inCartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(prod.id, 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(prod)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Add' : 'إضافة'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Order Bar */}
      {totalItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-3">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-emerald-400/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                {totalItemCount}
              </div>
              <div>
                <div className="text-xs font-bold opacity-90">
                  {lang === 'en' ? 'Your Order Total' : 'مجموع الطلب'}
                </div>
                <div className="text-sm font-black flex items-center gap-2">
                  <span>${grandTotalUsd.toFixed(2)}</span>
                  <span className="text-xs font-normal opacity-80">({grandTotalLbp.toLocaleString()} LBP)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <span>{lang === 'en' ? 'View Cart' : 'عرض السلة'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Full Cart & Checkout Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-950 border-s border-slate-800 h-full flex flex-col justify-between animate-in slide-in-from-end duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  {lang === 'en' ? 'Order Summary & Checkout' : 'ملخص الطلب وإتمام الشراء'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {/* Order Mode Toggle */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setOrderType('TABLE_DINE_IN')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    orderType === 'TABLE_DINE_IN'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Dine-In / Table' : 'تناول محلي / طاولة'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    orderType === 'DELIVERY'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Express Delivery' : 'توصيل للمنزل'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">
                  {lang === 'en' ? 'Selected Products' : 'المنتجات المختارة'} ({cartItemsList.length})
                </span>
                {cartItemsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    {lang === 'en' ? 'No items in cart.' : 'لا توجد منتجات في السلة.'}
                  </p>
                ) : (
                  cartItemsList.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-slate-900/90 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white">
                          {lang === 'en' ? item.product.nameEn : item.product.nameAr}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          ${item.product.priceUsd.toFixed(2)} / {item.product.packagingUnit}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Contextual Form Details */}
              <form id="vmenu-checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400">
                  {lang === 'en' ? 'Customer & Delivery Information' : 'بيانات الزبون والتوصيل'}
                </span>

                {/* Table Mode Specific Field */}
                {orderType === 'TABLE_DINE_IN' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {lang === 'en' ? 'Table Number / Showroom Spot' : 'رقم الطاولة / صالة العرض'}
                    </label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. 4, Bar 1, Counter"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Customer Name & Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {lang === 'en' ? 'Full Name' : 'الاسم الكامل'}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'en' ? 'Your name' : 'اسمك الكريم'}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {lang === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="03-XXXXXX / 70-XXXXXX"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Delivery Mode Specific Fields */}
                {orderType === 'DELIVERY' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {lang === 'en' ? 'Town / City' : 'البلدة / المدينة'}
                        </label>
                        <input
                          type="text"
                          value={destinationTown}
                          onChange={(e) => setDestinationTown(e.target.value)}
                          placeholder="e.g. Beirut - Hamra"
                          required
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {lang === 'en' ? 'Fleet Corridor' : 'خط سير الأسطول'}
                        </label>
                        <select
                          value={corridorId}
                          onChange={(e) => setCorridorId(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value={1}>Corridor 1: Greater Beirut & Coast</option>
                          <option value={2}>Corridor 2: Mount Lebanon & Chouf</option>
                          <option value={3}>Corridor 3: Southern Coast (Saida/Tyre)</option>
                          <option value={4}>Corridor 4: Northern Coast (Jbeil/Batroun)</option>
                          <option value={5}>Corridor 5: Tripoli & Akkar</option>
                          <option value={6}>Corridor 6: Bekaa & South-East</option>
                          <option value={7}>Corridor 7: North Bekaa (Baalbek)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {lang === 'en' ? 'Delivery Address & Street' : 'عنوان الشارع والمبنى'}
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street, Building, Floor..."
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Payment Terms' : 'طريقة الدفع'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {orderType === 'DELIVERY' ? (
                      <>
                        <option value="COD">Cash on Delivery (COD - USD or LBP)</option>
                        <option value="WHISH">Whish Money Transfer</option>
                      </>
                    ) : (
                      <>
                        <option value="CASH_AT_COUNTER">Cash at Counter / Table</option>
                        <option value="WHISH">Whish Money</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'en' ? 'Order Notes (Optional)' : 'ملاحظات إضافية (اختياري)'}
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder={
                      lang === 'en' ? 'Special packaging, delivery instructions...' : 'تعليمات خاصة للطلب...'
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {submitError && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Drawer Footer with Financials & Submit */}
            <div className="p-4 border-t border-slate-850 bg-slate-950 space-y-3">
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>{lang === 'en' ? 'Subtotal:' : 'المجموع الفرعي:'}</span>
                  <span className="font-bold text-white">${subtotalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'en' ? 'Delivery Fee:' : 'كلفة التوصيل:'}</span>
                  <span className="font-bold text-white">
                    {deliveryFeeUsd > 0 ? `$${deliveryFeeUsd.toFixed(2)}` : lang === 'en' ? 'Free' : 'مجاناً'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-850">
                  <span>{lang === 'en' ? 'Total Due:' : 'المجموع الإجمالي:'}</span>
                  <div className="text-end">
                    <span className="text-emerald-400">${grandTotalUsd.toFixed(2)}</span>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {grandTotalLbp.toLocaleString()} LBP
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                form="vmenu-checkout-form"
                disabled={isSubmitting || cartItemsList.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <span>{lang === 'en' ? 'Transmitting Order...' : 'جارٍ إرسال الطلب...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {lang === 'en'
                        ? orderType === 'TABLE_DINE_IN'
                          ? 'Send Table Order'
                          : 'Confirm & Dispatch Delivery'
                        : orderType === 'TABLE_DINE_IN'
                        ? 'إرسال طلب الطاولة'
                        : 'تأكيد وإرسال للتوصيل'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-sm">
          Loading Vanguard V-Menu...
        </div>
      }
    >
      <VMenuContent />
    </Suspense>
  );
}
