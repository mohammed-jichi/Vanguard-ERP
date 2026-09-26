'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState, useEffect } from 'react';
import { FleetSocialIntegrationService } from '@/lib/fleetSocialIntegrationService';

interface AssignedRep {
  adminCode: string;
  systemCode: string;
  fullName: string;
  socialPhone: string;
  commissionOffersPct: number;
  commissionItemsPct: number;
}

export default function SocialLandingPageOrder() {
  const { t } = useLanguage();
  const [rep] = useState<AssignedRep>({
    adminCode: 'ADM-REP-01',
    systemCode: 'REP-SO-8492',
    fullName: 'Ahmad Ali Kassem',
    socialPhone: '+96170123456',
    commissionOffersPct: 5.0,
    commissionItemsPct: 3.0,
  });

  const [viewMode, setViewMode] = useState<'customer_landing' | 'rep_app'>('customer_landing');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [offerNumber] = useState('OFFER-2026-01');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WHISH'>('COD');

  // Active Pending Orders in Rep App
  const [orders, setOrders] = useState([
    {
      id: 'ORD-SO-9921',
      customerName: 'Fadi Khalil',
      customerPhone: '03889900',
      customerAddress: 'Beirut - Hamra - Sadat Street',
      offerTitle: 'Offer: Extra Virgin Olive Oil 17.5L + 2 Pomegranate Molasses',
      totalAmount: 125.0,
      paymentMethod: 'COD',
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
      status: 'PENDING_APPROVAL',
      commissionPending: 6.25,
      commissionCredited: false,
      escalated: false,
    },
  ]);

  const [timeLeftMinutes, setTimeLeftMinutes] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMinutes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Please fill out all required fields.');
      return;
    }

    const orderId = 'ORD-SO-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderId,
      customerName,
      customerPhone,
      customerAddress,
      offerTitle: `Offer [${offerNumber}] from Southern Olive Oil Products S.A.R.L`,
      totalAmount: 110.0,
      paymentMethod,
      createdAt: new Date(),
      status: 'PENDING_APPROVAL',
      commissionPending: (110.0 * rep.commissionOffersPct) / 100,
      commissionCredited: false,
      escalated: false,
    };

    // Forward to unified platform orders table in Vanguard ERP
    FleetSocialIntegrationService.createPlatformOrder({
      order_number: orderId,
      channel: 'social_media',
      customer_name: customerName,
      customer_phone: customerPhone,
      destination_town: customerAddress.split('-')[0]?.trim() || 'Beirut',
      delivery_address: customerAddress,
      corridor_id: 1,
      payment_method: paymentMethod,
      product_amount_usd: 110.0,
      product_amount_lbp: 9900000.0,
      delivery_fee_usd: 4.0,
      rep_name: rep.fullName,
      rep_code: rep.adminCode,
      sla_minutes_left: 60,
      order_status: 'pending_rep_approval',
      items: [
        {
          id: `item-${Date.now()}`,
          order_id: orderId,
          item_id: 'inv-item-01',
          item_name: 'Extra Virgin Olive Oil 17.5L Tin + Pomegranate Molasses',
          quantity: 1,
          unit_price_usd: 110.0,
          total_price_usd: 110.0,
        },
      ],
    });

    setOrders((prev) => [newOrder, ...prev]);
    alert(`Order submitted successfully! Order ID: ${newOrder.id}. Instant notification dispatched to sales rep (${rep.fullName}) for 1-hour verification.`);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const handleRepApprove = (orderId: string) => {
    FleetSocialIntegrationService.approveOrder(orderId);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'APPROVED_BY_REP' } : o
      )
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const msg = `Order Confirmation - Southern Olive Oil Products S.A.R.L\n\nDear ${targetOrder.customerName},\nYour order has been verified successfully: [${targetOrder.id}]\n• Items: ${targetOrder.offerTitle}\n• Delivery Address: ${targetOrder.customerAddress}\n• Payment: ${targetOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Whish Money on Delivery'}\n\n• Assigned Sales Rep: ${rep.fullName} (Code: ${rep.adminCode})\n• Order Timestamp: ${new Date().toLocaleTimeString()}\n\nThank you for choosing Southern Olive Oil Products S.A.R.L.`;
      console.log('Automated WhatsApp dispatch:', msg);
      alert(`Order approved & physical stock reserved! Automated WhatsApp confirmation message sent to customer:\n\n${msg}`);
    }
  };

  const handleEscalateToManagement = (orderId: string) => {
    FleetSocialIntegrationService.escalateToManagement(orderId, '60-minute SLA expired on landing page');

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'ESCALATED_TO_MANAGEMENT', escalated: true, commissionPending: 0.0 }
          : o
      )
    );
    alert('60-minute SLA expired! Order has been auto-escalated to Social Media Management. Rep commission forfeited.');
  };

  const handleDriverDelivered = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    FleetSocialIntegrationService.confirmDelivery(orderId, {
      recipientName: targetOrder?.customerName || 'Customer',
      paymentMethod: (targetOrder?.paymentMethod as any) || 'COD',
      collectedUsd: 114.0,
      collectedLbp: 0,
      signatureSvg: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 40"><path d="M10 20 Q 30 5 50 20 T 90 20" stroke="black" fill="none"/></svg>',
      notes: 'Delivered via Landing Page flow',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'DELIVERED', commissionCredited: true } : o
      )
    );
    alert('Driver completed delivery! POD Delivery Note created, reserved stock relieved and credited to sales representative account.');
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 md:p-6 font-sans text-foreground text-left select-none">
      
      {/* Dev Switcher */}
      <div className="bg-card border border-border text-foreground p-2.5 rounded-xl mb-6 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{t('environment_view', 'Environment View:')}</span>
          <span>{t('southern_olive_oil_products_sarl', 'Southern Olive Oil Products S.A.R.L')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('customer_landing')}
            className={`px-3 py-1 rounded font-bold ${viewMode === 'customer_landing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            1. Customer Landing Page
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rep_app')}
            className={`px-3 py-1 rounded font-bold ${viewMode === 'rep_app' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            2. Sales Rep Portal (1-Hour SLA)
          </button>
        </div>
      </div>

      {/* 1. CUSTOMER LANDING PAGE */}
      {viewMode === 'customer_landing' && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-md p-6 space-y-5">
          <div className="text-center border-b border-border pb-4">
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {t('southern_olive_oil_products_sarl', 'Southern Olive Oil Products S.A.R.L')}
            </h1>
            <p className="text-xs text-primary font-bold mt-1">
              {t('natural_extra_virgin_olive_oil', 'Natural Extra Virgin Olive Oil, Pomegranate Molasses & Traditional Food Preserves')}
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs space-y-1 text-foreground">
            <div className="font-bold text-sm text-primary">{t('exclusive_offer_175l_olive_oil_tin_2', 'Exclusive Offer: 17.5L Olive Oil Tin + 2 Pomegranate Molasses')}</div>
            <p>• First Cold Pressed - Low Acidity Guaranteed</p>
            <p>• Fast delivery across all Lebanon regions with flexible payment options</p>
          </div>

          {/* WhatsApp Direct CTA */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Prefer direct chat with our sales rep ({rep.fullName})?
            </div>
            <a
              href={`https://wa.me/${rep.socialPhone}?text=Hello, I would like to order offer ${offerNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{t('whatsapp_direct', 'WhatsApp Direct')}</span>
            </a>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-muted-foreground text-xs font-bold">{t('or_order_online', 'OR ORDER ONLINE')}</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Self-Checkout */}
          <form onSubmit={handleCustomerSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">{t('full_name', 'Full Name *')}</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('enter_your_full_name', 'Enter your full name')}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-medium focus:border-primary focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Phone Number (WhatsApp) *</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="03xxxxxx or 70xxxxxx"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono focus:border-primary focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">{t('delivery_address', 'Delivery Address *')}</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder={t('region_street_building_floor', 'Region, Street, Building, Floor')}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-medium focus:border-primary focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">{t('payment_method', 'Payment Method *')}</label>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <span className="font-bold text-foreground">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-primary"
                  />
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'WHISH' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <span className="font-bold text-foreground">{t('whish_on_delivery', 'Whish on Delivery')}</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'WHISH'}
                    onChange={() => setPaymentMethod('WHISH')}
                    className="accent-primary"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all mt-2 cursor-pointer"
            >
              {t('submit_order_now', 'Submit Order Now')}
            </button>
          </form>
        </div>
      )}

      {/* 2. REP APP VIEW */}
      {viewMode === 'rep_app' && (
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">{t('social_media_representative_portal', 'Social Media Representative Portal')}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('representative', 'Representative:')} <span className="font-bold text-primary">{rep.fullName}</span> | Admin Code: <span className="font-mono">{rep.adminCode}</span> | System Code: <span className="font-mono">{rep.systemCode}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground">{t('offer_commission_rate', 'Offer Commission Rate')}</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{rep.commissionOffersPct}%</div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Incoming Landing Page Orders (Verification SLA: 60 Minutes)
            </h2>

            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary">{order.id}</span>
                      <span className="text-xs font-bold text-foreground">{order.customerName} ({order.customerPhone})</span>
                    </div>

                    {order.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
                        <span>⏳ Time to verify: {timeLeftMinutes} mins</span>
                      </div>
                    )}

                    {order.status === 'APPROVED_BY_REP' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                        Approved by Rep (Awaiting Delivery)
                      </span>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        {t('delivered_commission_credited', 'Delivered - Commission Credited ✓')}
                      </span>
                    )}

                    {order.status === 'ESCALATED_TO_MANAGEMENT' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-[11px] font-bold">
                        Escalated to Management (Commission Forfeited)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">{t('address', 'Address:')}</span> <span className="font-semibold text-foreground">{order.customerAddress}</span></div>
                    <div><span className="text-muted-foreground">{t('offer', 'Offer:')}</span> <span className="font-semibold text-foreground">{order.offerTitle}</span></div>
                    <div><span className="text-muted-foreground">{t('payment', 'Payment:')}</span> <span className="font-semibold font-mono text-foreground">{order.paymentMethod}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-xs">
                      <span className="text-muted-foreground">{t('expected_commission', 'Expected Commission:')}</span>{' '}
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">${order.commissionPending.toFixed(2)}</span>
                      {order.commissionCredited && <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">(Credited ✓)</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRepApprove(order.id)}
                            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            {t('approve_order', 'Approve Order')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEscalateToManagement(order.id)}
                            className="px-3 py-1.5 border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            {t('simulate_1hr_timeout', 'Simulate 1-Hr Timeout')}
                          </button>
                        </>
                      )}

                      {order.status === 'APPROVED_BY_REP' && (
                        <button
                          type="button"
                          onClick={() => handleDriverDelivered(order.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          {t('simulate_driver_delivered', 'Simulate Driver Delivered')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
