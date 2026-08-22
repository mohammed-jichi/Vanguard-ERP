'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b4379] via-[#2a5d9e] to-[#ab8320] p-8 font-sans">

      {/* الهيكل الأساسي */}
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12 z-10">

        {/* القسم الأيسر - النصوص والأزرار */}
        <div className="flex-1 w-full text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
            Vanguard Business Solutions
          </h1>
          <p className="text-lg text-blue-100 mb-10 font-medium">
            (Restaurants, Hotels, Retail)
          </p>

          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-md">
            Vanguard Platforms
          </h2>

          <div className="text-blue-50 text-lg leading-relaxed mb-12 max-w-xl font-medium">
            POS, Inventory, Accounting, Human Resources & Payroll, CRM & Loyalty, Tasks & Appointments, Analytics, Mobile
          </div>

          {/* الأزرار بالأسماء الجديدة */}
          <div className="flex gap-4">
            <button className="bg-[#123b70] hover:bg-[#0b254a] text-white px-8 py-3 rounded-md font-bold shadow-xl transition-all border border-blue-400/30">
              Contact Us
            </button>
            <button className="bg-gradient-to-r from-[#ab8320] to-[#d4b055] hover:brightness-110 text-white px-8 py-3 rounded-md font-bold shadow-xl transition-all border border-yellow-300/50">
              Request A Demo
            </button>
          </div>
        </div>

        {/* القسم الأيمن - بطاقة تسجيل الدخول */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8 relative border border-white/20">

          {/* حركة اللوجو (دوران واستقرار) */}
          <style>{`
            @keyframes spinAndSettle {
              0% { transform: translateY(-50px) rotate(-360deg) scale(0.5); opacity: 0; }
              100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            }
            .animate-logo {
              animation: spinAndSettle 1.2s ease-out forwards;
            }
          `}</style>

          <div className="flex justify-center mb-6 relative">
            {/* هالة ذهبية ورا اللوجو */}
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full animate-pulse"></div>
            <img
              src="/vanguard.jpg"
              alt="Vanguard Logo"
              className="h-28 object-contain animate-logo relative z-10"
            />
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#123b70] outline-none transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#123b70] outline-none transition-all bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="text-right pb-2">
              <a href="#" className="text-sm font-bold text-[#ab8320] hover:text-[#d4b055] transition-colors">Forgot Password?</a>
            </div>

            <button className="w-full bg-[#123b70] hover:bg-[#0b254a] text-white font-bold py-3 rounded-md shadow-lg transition-all text-lg tracking-wide">
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}