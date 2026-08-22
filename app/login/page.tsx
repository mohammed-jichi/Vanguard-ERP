'use client';
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">

      {/* القسم الأيسر - الهوية البصرية للشركة (يختفي على الشاشات الصغيرة) */}
      <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-between p-16 relative overflow-hidden border-r border-[#123b70]/30">
        {/* إضاءة خلفية احترافية */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/40 to-transparent z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-10 z-0 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-3">
            Vanguard Business Solutions
          </h1>
          <p className="text-[#d4b055] font-semibold tracking-widest uppercase text-sm">
            Restaurants • Hotels • Retail
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="w-8 h-1 bg-[#ab8320] rounded-full"></span>
            Enterprise Platforms
          </h2>
          <div className="flex flex-wrap gap-2.5 max-w-lg">
            {['POS', 'Inventory', 'Accounting', 'HR & Payroll', 'CRM & Loyalty', 'Tasks & Appointments', 'Analytics', 'Mobile'].map((item) => (
              <span key={item} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          <span>•</span>
          <a href="#" className="hover:text-[#d4b055] transition-colors">Request a Demo</a>
        </div>
      </div>

      {/* القسم الأيمن - نموذج تسجيل الدخول (نظيف ومينيماليست) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md space-y-10">

          {/* اللوجو والترحيب */}
          <div className="text-center lg:text-left">
            <div className="relative w-24 h-24 mx-auto lg:mx-0 mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
              <Image
                src="/vanguard.jpg"
                alt="Vanguard Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h3>
            <p className="text-slate-500 mt-2 font-medium">Please sign in to your Vanguard account</p>
          </div>

          {/* الفورم */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-[#123b70] hover:text-[#ab8320] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-medium tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-xl bg-[#123b70] hover:bg-[#0a2342] text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 mt-2"
            >
              Sign In
            </button>
          </form>

          {/* ختم الحماية */}
          <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Protected by Vanguard Security
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}