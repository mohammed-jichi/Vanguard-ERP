'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-50">

      {/* 1. تأثيرات الإضاءة الخلفية (بديل أمواج الصور) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>

      <div className="max-w-7xl w-full z-10 flex flex-col lg:flex-row items-center gap-16 px-8 relative">

        {/* القسم الأيسر - التسويق والنصوص */}
        <div className="flex-1 w-full text-left">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
            Vanguard <span className="text-blue-700">Business Solutions</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 font-semibold tracking-wide">
            Restaurants <span className="text-yellow-500 mx-2">•</span> Hotels <span className="text-yellow-500 mx-2">•</span> Retail
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-blue-600 rounded-full"></span> Vanguard Platforms
          </h2>

          <div className="flex flex-wrap gap-3 mb-12">
            {['POS', 'Inventory', 'Accounting', 'HR & Payroll', 'CRM & Loyalty', 'Tasks & Appointments', 'Analytics', 'Mobile'].map(platform => (
              <span key={platform} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-default">
                {platform}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-extrabold px-8 py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all">
              Request A Demo
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all">
              Contact Us
            </button>
          </div>
        </div>

        {/* القسم الأيمن - بطاقة تسجيل الدخول */}
        <div className="w-full max-w-md mt-12 lg:mt-0">
          <div className="bg-white/70 backdrop-blur-2xl border border-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] relative">

            {/* اللوجو مع تأثير الدوران والإضاءة الذهبية */}
            <div className="flex justify-center mb-10 relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full animate-pulse"></div>
              <img
                src="/vanguard.jpg"
                alt="Vanguard Logo"
                className="h-28 w-28 object-contain relative z-10 animate-[spin_2s_ease-out_1]"
              />
            </div>

            <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">Sign In to Vanguard</h3>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 font-medium tracking-widest"
                />
              </div>

              <div className="flex justify-end pt-2">
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot Password?</a>
              </div>

              <button className="w-full bg-slate-900 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 mt-4">
                Sign In
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-8 font-medium">
              Protected by Vanguard Enterprise Security Systems
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}