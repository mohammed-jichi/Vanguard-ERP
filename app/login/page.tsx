'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 md:p-6 font-sans">
      <div className="w-full max-w-7xl relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* HIGH RESOLUTION MOCKUP IMAGE DISPLAY */}
        <div className="relative w-full">
          <img
            src="/vanguard_login_mockup.jpg"
            alt="Vanguard ERP Sign-In Page UI Mockup"
            className="w-full h-auto object-cover rounded-2xl"
          />

          {/* INTERACTIVE FORM OVERLAY */}
          <div className="absolute top-[32%] right-[5%] w-[32%] max-w-md hidden md:block z-20">
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/90 border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 opacity-0 hover:opacity-100 focus:opacity-100 transition-all cursor-pointer shadow-lg"
              />
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/90 border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 opacity-0 hover:opacity-100 focus:opacity-100 transition-all cursor-pointer shadow-lg"
              />
              <button
                type="submit"
                className="w-full h-12 bg-blue-600/0 hover:bg-blue-600 text-transparent hover:text-white font-black text-sm rounded-lg transition-all cursor-pointer"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM LEFT BUTTONS */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4 z-20">
          <a
            href="#request-demo"
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-2xl text-sm transition-all hover:scale-105 border border-yellow-400"
          >
            Request A Demo
          </a>
          <a
            href="#contact-us"
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl shadow-2xl text-sm transition-all hover:scale-105 border border-blue-500"
          >
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}
