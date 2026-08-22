'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 font-sans bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/vanguard_login_mockup.jpg')" }}
    >
      {/* طبقة زجاجية خفيفة جداً فوق الصورة لحتى تعطي فخامة وتوضح الكلام */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[6px]"></div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 relative z-10">

        {/* القسم الأيسر */}
        <div className="flex-1 w-full text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-2 drop-shadow-md">
            Vanguard Business Solutions
          </h1>
          <p className="text-lg text-slate-800 mb-10 font-bold drop-shadow-sm">
            (Restaurants, Hotels, Retail)
          </p>

          <h2 className="text-3xl font-bold text-blue-950 mb-6 drop-shadow-md">
            Vanguard Platforms
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {['POS', 'Inventory', 'Accounting', 'HR & Payroll', 'CRM & Loyalty', 'Tasks & Appointments', 'Analytics', 'Mobile'].map((item) => (
              <div key={item} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-full px-4 py-2 text-center text-sm font-bold text-slate-800 shadow-md">
                {item}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-extrabold px-6 py-3 rounded-md shadow-lg transition-colors border border-yellow-400">
              Request A Demo
            </button>
            <button className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-3 rounded-md shadow-lg transition-colors border border-blue-700">
              Contact Us
            </button>
          </div>
        </div>

        {/* القسم الأيمن - بطاقة تسجيل الدخول */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-2xl p-8 border border-white/50 relative">

          <div className="flex justify-center mb-6">
            <img src="/vanguard.jpg" alt="Vanguard Logo" className="h-20 object-contain drop-shadow-lg" />
          </div>

          <h3 className="text-xl font-bold text-center text-slate-900 mb-6 drop-shadow-sm">Sign In to Vanguard</h3>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-md border border-gray-300/80 focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white/90 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md border border-gray-300/80 focus:ring-2 focus:ring-blue-600 outline-none transition-all bg-white/90 shadow-inner"
              />
            </div>

            <div className="text-right pb-2">
              <a href="#" className="text-sm font-bold text-blue-800 hover:text-blue-950">Forgot Password?</a>
            </div>

            <button className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-md shadow-lg transition-all border border-blue-700">
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6 font-bold drop-shadow-sm">
            Protected by Vanguard Enterprise Security Systems
          </p>
        </div>

      </div>
    </div>
  );
}