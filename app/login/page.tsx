'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center font-sans text-slate-100">

      {/* إضاءة خلفية فخمة جداً (أزرق وذهبي) */}
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-700/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/10 rounded-full mix-blend-screen filter blur-[120px]"></div>

      {/* الهيكل الأساسي */}
      <div className="max-w-7xl w-full z-10 flex flex-col lg:flex-row items-center gap-16 px-8 relative">

        {/* القسم الأيسر - هوية النظام */}
        <div className="flex-1 w-full text-left">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 font-semibold tracking-widest text-xs mb-6 uppercase shadow-sm">
            Enterprise Resource Planning System
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-xl">
            VANGUARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">ERP</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 font-medium leading-relaxed">
            Next-Generation Business Solutions for <br />
            <span className="text-white font-bold">Restaurants, Hotels & Retail.</span>
          </p>

          {/* شبكة المنصات بشكل عصري */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {['POS', 'Inventory', 'Accounting', 'HR & Payroll', 'CRM & Loyalty', 'Analytics'].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 shadow-sm backdrop-blur-md hover:bg-white/10 hover:border-yellow-500/30 transition-all cursor-default">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
                <span className="font-semibold text-slate-200 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* الأزرار */}
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:-translate-y-1">
              Request A Demo
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-xl backdrop-blur-md transition-all transform hover:-translate-y-1">
              Contact Us
            </button>
          </div>
        </div>

        {/* القسم الأيمن - واجهة الدخول (Glassmorphism) */}
        <div className="w-full max-w-md lg:ml-auto mt-12 lg:mt-0">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

            {/* خط ذهبي/أزرق تجميلي فوق الكارد */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-yellow-500 to-blue-600"></div>

            <div className="text-center mb-8 pt-2">
              <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">System Access</h3>
              <p className="text-sm text-slate-400 font-medium">Enter your credentials to continue</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@vanguard.com"
                  className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-slate-700/50 text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all shadow-inner"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-300 tracking-wide">Password</label>
                  <a href="#" className="text-xs font-bold text-blue-400 hover:text-yellow-400 transition-colors">Forgot?</a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-slate-700/50 text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all tracking-widest shadow-inner"
                />
              </div>

              <button className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all transform hover:-translate-y-1 mt-4 tracking-wider">
                SIGN IN
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
              <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase">
                Protected by Vanguard Security
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}