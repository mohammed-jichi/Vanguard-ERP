'use client';

import React, { useState, useEffect } from 'react';

interface AssignedRep {
  adminCode: string;
  systemCode: string;
  fullName: string;
  socialPhone: string;
  commissionOffersPct: number;
  commissionItemsPct: number;
}

export default function SocialLandingPageOrder() {
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

    const newOrder = {
      id: 'ORD-SO-' + Math.floor(1000 + Math.random() * 9000),
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

    setOrders((prev) => [newOrder, ...prev]);
    alert(`Order submitted successfully! Order ID: ${newOrder.id}. Instant notification dispatched to sales rep (${rep.fullName}) for 1-hour verification.`);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const handleRepApprove = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'APPROVED_BY_REP' } : o
      )
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const msg = `🌿 Order Confirmation - Southern Olive Oil Products S.A.R.L\n\nDear ${targetOrder.customerName},\nYour order has been verified successfully: [${targetOrder.id}]\n• Items: ${targetOrder.offerTitle}\n• Delivery Address: ${targetOrder.customerAddress}\n• Payment: ${targetOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Whish Money on Delivery'}\n\n• Assigned Sales Rep: ${rep.fullName} (Code: ${rep.adminCode})\n• Order Timestamp: ${new Date().toLocaleTimeString()}\n\nThank you for choosing Southern Olive Oil Products S.A.R.L.`;
      console.log('Automated WhatsApp dispatch:', msg);
      alert(`Order approved! Automated WhatsApp confirmation message sent to customer:\n\n${msg}`);
    }
  };

  const handleEscalateToManagement = (orderId: string) => {
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'DELIVERED', commissionCredited: true } : o
      )
    );
    alert('Driver completed delivery! Commission credited to sales representative account.');
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-slate-800 text-left select-none">
      
      {/* Dev Switcher */}
      <div className="bg-slate-800 text-white p-2.5 rounded-xl mb-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Environment View:</span>
          <span>Southern Olive Oil Products S.A.R.L</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('customer_landing')}
            className={`px-3 py-1 rounded font-bold ${viewMode === 'customer_landing' ? 'bg-[#1a629b] text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            1. Customer Landing Page
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rep_app')}
            className={`px-3 py-1 rounded font-bold ${viewMode === 'rep_app' ? 'bg-[#1a629b] text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            2. Sales Rep Portal (1-Hour SLA)
          </button>
        </div>
      </div>

      {/* 1. CUSTOMER LANDING PAGE */}
      {viewMode === 'customer_landing' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
          <div className="text-center border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-[#1e293b] leading-tight">
              Southern Olive Oil Products S.A.R.L
            </h1>
            <p className="text-xs text-[#1a629b] font-bold mt-1">
              Natural Extra Virgin Olive Oil, Pomegranate Molasses & Traditional Food Preserves
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-1 text-amber-900">
            <div className="font-bold text-sm text-[#1a629b]">🌿 Exclusive Offer: 17.5L Olive Oil Tin + 2 Pomegranate Molasses</div>
            <p>• First Cold Pressed - Low Acidity Guaranteed</p>
            <p>• Fast delivery across all Lebanon regions with flexible payment options</p>
          </div>

          {/* WhatsApp Direct CTA */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
            <div className="text-xs text-emerald-900 font-medium">
              Prefer direct chat with our sales rep ({rep.fullName})?
            </div>
            <a
              href={`https://wa.me/${rep.socialPhone}?text=Hello, I would like to order offer ${offerNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>WhatsApp Direct</span>
            </a>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs font-bold">OR ORDER ONLINE</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Self-Checkout */}
          <form onSubmit={handleCustomerSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-[#1a629b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="03xxxxxx or 70xxxxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:border-[#1a629b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Address *</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Region, Street, Building, Floor"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-[#1a629b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#1a629b] bg-blue-50/50' : 'border-slate-200'}`}>
                  <span className="font-bold text-slate-800">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[#1a629b]"
                  />
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'WHISH' ? 'border-[#1a629b] bg-blue-50/50' : 'border-slate-200'}`}>
                  <span className="font-bold text-slate-800">Whish on Delivery</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'WHISH'}
                    onChange={() => setPaymentMethod('WHISH')}
                    className="accent-[#1a629b]"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1a629b] hover:bg-[#124b77] text-white text-xs font-bold rounded-xl shadow-md transition-all mt-2 cursor-pointer"
            >
              Submit Order Now
            </button>
          </form>
        </div>
      )}

      {/* 2. REP APP VIEW */}
      {viewMode === 'rep_app' && (
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[#1e293b]">Social Media Representative Portal</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Representative: <span className="font-bold text-[#1a629b]">{rep.fullName}</span> | Admin Code: <span className="font-mono">{rep.adminCode}</span> | System Code: <span className="font-mono">{rep.systemCode}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Offer Commission Rate</div>
              <div className="text-sm font-bold text-emerald-600 font-mono">{rep.commissionOffersPct}%</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              Incoming Landing Page Orders (Verification SLA: 60 Minutes)
            </h2>

            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1a629b]">{order.id}</span>
                      <span className="text-xs font-bold text-slate-700">{order.customerName} ({order.customerPhone})</span>
                    </div>

                    {order.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold animate-pulse">
                        <span>⏳ Time to verify: {timeLeftMinutes} mins</span>
                      </div>
                    )}

                    {order.status === 'APPROVED_BY_REP' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                        Approved by Rep (Awaiting Delivery)
                      </span>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Delivered - Commission Credited ✓
                      </span>
                    )}

                    {order.status === 'ESCALATED_TO_MANAGEMENT' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                        Escalated to Management (Commission Forfeited)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-slate-500">Address:</span> <span className="font-semibold">{order.customerAddress}</span></div>
                    <div><span className="text-slate-500">Offer:</span> <span className="font-semibold">{order.offerTitle}</span></div>
                    <div><span className="text-slate-500">Payment:</span> <span className="font-semibold font-mono">{order.paymentMethod}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="text-xs">
                      <span className="text-slate-500">Expected Commission:</span>{' '}
                      <span className="font-bold font-mono text-emerald-600">${order.commissionPending.toFixed(2)}</span>
                      {order.commissionCredited && <span className="text-emerald-600 font-bold ml-1">(Credited ✓)</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRepApprove(order.id)}
                            className="px-4 py-1.5 bg-[#1a629b] hover:bg-[#124b77] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                          >
                            Approve Order
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEscalateToManagement(order.id)}
                            className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Simulate 1-Hr Timeout
                          </button>
                        </>
                      )}

                      {order.status === 'APPROVED_BY_REP' && (
                        <button
                          type="button"
                          onClick={() => handleDriverDelivered(order.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          Simulate Driver Delivered
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
