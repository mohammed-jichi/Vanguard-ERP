'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-8 font-sans">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12">

        {/* القسم الأيسر - مطابق للصورة */}
        <div className="flex-1 w-full text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-2">
            Vanguard Business Solutions
          </h1>
          <p className="text-lg text-slate-600 mb-10 font-medium">
            (Restaurants, Hotels, Retail)
          </p>

          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            Vanguard Platforms
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {['POS', 'Inventory', 'Accounting', 'HR & Payroll', 'CRM & Loyalty', 'Tasks & Appointments', 'Analytics', 'Mobile'].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-md shadow-md transition-colors">
              Request A Demo
            </button>
            <button className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-md shadow-md transition-colors">
              Contact Us
            </button>
          </div>
        </div>

        {/* القسم الأيمن - بطاقة تسجيل الدخول النظيفة */}
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 relative">

          <div className="flex justify-center mb-6">
            {/* اللوجو - تأكد إنو الصورة موجودة باسم vanguard.jpg بملف public */}
            <img src="/vanguard.jpg" alt="Vanguard Logo" className="h-20 object-contain" />
          </div>

          <h3 className="text-xl font-bold text-center text-slate-800 mb-6">Sign In to Vanguard</h3>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>

            <div className="text-right pb-2">
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800">Forgot Password?</a>
            </div>

            <button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-md shadow-md transition-all">
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Protected by Vanguard Enterprise Security Systems
          </p>
        </div>

      </div>
    </div>
  );
}