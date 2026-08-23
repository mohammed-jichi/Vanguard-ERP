'use client';
import Image from "next/image";

export default function LoginPage() {
  const platforms = [
    "POS",
    "Inventory",
    "Accounting",
    "Human Resources & Payroll",
    "CRM & Loyalty",
    "Tasks & Appointments",
    "Analytics",
    "Mobile",
  ];

  return (
    <div className="relative min-h-screen w-full flex bg-slate-50 font-sans overflow-hidden">
      
      {/* 
        اللوجو المركزي الفخم (يظهر فقط على الشاشات الكبيرة) 
        متموضع تماماً في منتصف الشاشة بين الأزرق والأبيض
      */}
      <div className="hidden lg:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 items-center justify-center">
        {/* الهالة الذهبية المشعة خلف اللوجو */}
        <div className="absolute inset-0 bg-[#d4b055] blur-[50px] opacity-60 rounded-full animate-pulse w-48 h-48"></div>
        
        {/* الإطار الدائري للوجو */}
        <div className="relative w-44 h-44 rounded-full overflow-hidden border-[6px] border-[#09152b] shadow-[0_0_40px_rgba(171,131,32,0.4)] bg-[#09152b] z-10">
          <Image 
            src="/vanguard.jpg" 
            alt="Vanguard Logo Center" 
            fill 
            className="object-cover" 
            priority 
          />
        </div>
      </div>

      {/* ================= القسم الأيسر - الأزرق (مع النصوص مؤقتاً) ================= */}
      <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-between p-16 lg:pr-24 relative overflow-hidden">
        {/* إضاءات الخلفية الزرقاء */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/50 to-transparent z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-10 z-0 pointer-events-none"></div>

        {/* النصوص رجعناها هون */}
        <div className="relative z-10 mt-4">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
            Vanguard Business Solutions
          </h1>
          <p className="text-[#d4b055] font-semibold tracking-widest uppercase text-sm">
            Restaurants • Hotels • Retail
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="w-8 h-1 bg-[#ab8320] rounded-full shadow-[0_0_10px_rgba(171,131,32,0.8)]"></span>
            Enterprise Platforms
          </h2>
          <div className="flex flex-wrap gap-2.5 max-w-lg">
            {platforms.map((item) => (
              <span key={item} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm font-medium backdrop-blur-md shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm font-bold text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          <span>•</span>
          <a href="#" className="hover:text-[#d4b055] transition-colors drop-shadow-md">Request a Demo</a>
        </div>
      </div>

      {/* ================= القسم الأيمن - الأبيض ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:pl-28 relative bg-gradient-to-br from-white to-slate-100">
        <div className="w-full max-w-md space-y-8">
          
          {/* اللوجو للموبايل فقط (يختفي على الشاشات الكبيرة) */}
          <div className="lg:hidden relative flex justify-center mb-10">
            <div className="absolute inset-0 bg-[#d4b055] blur-[40px] opacity-40 rounded-full animate-pulse w-32 h-32 mx-auto"></div>
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl border-[3px] border-[#123b70]/10 z-10 bg-[#09152b]">
              <Image src="/vanguard.jpg" alt="Vanguard Logo Mobile" fill className="object-cover" priority />
            </div>
          </div>

          <div className="text-center lg:text-left mt-8 lg:mt-0">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-slate-500 mt-2 font-medium">Access your Vanguard dashboard</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <a href="#" className="text-sm font-bold text-[#ab8320] hover:text-[#d4b055] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-semibold tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#123b70] to-[#0a2342] hover:from-[#0a2342] hover:to-[#051324] text-white font-bold text-lg tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 mt-4 border border-[#123b70]/50"
            >
              Sign In
            </button>
          </form>
          
        </div>
      </div>

    </div>
  );
}