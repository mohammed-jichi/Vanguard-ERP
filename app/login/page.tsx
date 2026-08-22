'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const platformItems = [
    'POS',
    'Inventory',
    'Accounting',
    'HR & Payroll',
    'CRM & Loyalty',
    'Tasks & Appointments',
    'Analytics',
    'Mobile',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center">
        
        {/* LEFT COLUMN (MARKETING CONTENT - 60% WIDTH) */}
        <div className="w-full md:w-3/5 space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2">
            Vanguard Business Solutions
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            (Restaurants, Hotels, Retail)
          </p>

          <h2 className="text-3xl font-bold text-blue-800 mb-6">
            Vanguard Platforms
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platformItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 text-sm font-medium text-slate-700 text-center"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-10">
            <a
              href="#request-demo"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-colors inline-block text-center"
            >
              Request A Demo
            </a>
            <a
              href="#contact-us"
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-colors inline-block text-center"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN (LOGIN CARD - 40% WIDTH) */}
        <div className="w-full md:w-2/5 flex justify-center md:justify-end">
          <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">
              Sign In to Vanguard
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 w-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-md p-3 w-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <a
                href="#forgot"
                className="text-sm text-blue-600 text-right block mb-6 hover:underline"
              >
                Forgot Password?
              </a>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-700 to-blue-900 text-white w-full rounded-md py-3 font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
