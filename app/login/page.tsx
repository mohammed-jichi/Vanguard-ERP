'use client';
import Image from "next/image";
import Link from "next/link"; // ضروري للروابط والـ Tabs الجديدة

export default function LoginPage() {
  // مصفوفة المنصات مع مسارات الروابط (يمكنك تعديل المسارات لاحقاً)
  const platforms = [
    { name: "POS", path: "/platforms/pos" },
    { name: "Inventory", path: "/platforms/inventory" },
    { name: "Accounting", path: "/platforms/accounting" },
    { name: "Human Resources & Payroll", path: "/platforms/hr" },
    { name: "CRM & Loyalty", path: "/platforms/crm" },
    { name: "Tasks & Appointments", path: "/platforms/tasks" },
    { name: "Analytics", path: "/platforms/analytics" },
    { name: "Mobile", path: "/platforms/mobile" },
  ];

  return (
    <div className="relative min-h-screen w-full flex bg-slate-50 font-sans overflow-hidden">
      
      {/* 
        اللوجو المركزي - مرفوع قليلاً للأعلى وقابل للضغط (Sign Up New Tenant)
      */}
      <div className="hidden lg:flex absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 items-center justify-center">
        <Link 
          href="/signup" 
          target="_blank"
          title="Vanguard Sign Up New Tenant" 
          className="relative flex items-center justify-center group cursor-pointer"
        >
          {/* الهالة الذهبية المشعة خلف اللوجو */}
          <div className="absolute inset-0 bg-[#d4b055] blur-[50px] opacity-70 rounded-full animate-pulse w-48 h-48 transition-all duration-300 group-hover:blur-[70px] group-hover:opacity-100"></div>
          
          {/* الإطار الدائري للوجو */}
          <div className="relative w-44 h-44 rounded-full overflow-hidden border-[6px] border-[#09152b] shadow-[0_0_40px_rgba(171,131,32,0.6)] bg-[#09152b] z-10 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/vanguard.jpg" 
              alt="Vanguard Sign Up New Tenant" 
              fill 
              className="object-cover" 
              priority 
            />
          </div>
        </Link>
      </div>

      {/* ================= القسم الأيسر - الأزرق (مع الروابط والإضاءة) ================= */}
      <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-start items-center p-12 pt-20 relative overflow-hidden text-center">
        {/* إضاءات الخلفية الزرقاء والذهبية */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/60 to-transparent z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-15 z-0 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-xl space-y-12 pr-12">
          
          {/* العنوان المتوهج والحلول */}
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
              VANGUARD ERP SYSTEM
            </h1>
            
            <div className="space-y-2">
              <Link href="/solutions" target="_blank" className="block text-2xl font-bold text-slate-100 hover:text-[#d4b055] transition-colors drop-shadow-md">
                Business Solutions
              </Link>
              <Link href="/sectors" target="_blank" className="block text-[#d4b055] font-semibold tracking-widest uppercase text-sm hover:text-white transition-colors">
                Restaurants • Hotels • Retail
              </Link>
            </div>
          </div>

          {/* المنصات (مقسمة لعمودين وقابلة للضغط) */}
          <div className="pt-8 border-t border-[#123b70]/50">
            <Link href="/platforms" target="_blank" className="block text-2xl font-bold text-slate-100 hover:text-[#d4b055] transition-colors mb-8 drop-shadow-md">
              Enterprise Platforms
            </Link>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-left">
              {platforms.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.path}
                  target="_blank" 
                  className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-md hover:bg-[#123b70]/40 hover:text-white hover:border-[#d4b055]/50 transition-all cursor-pointer shadow-sm text-center"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ================= القسم الأيمن - الأبيض (نموذج الدخول) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:pl-28 relative bg-gradient-to-br from-white to-slate-100">
        <div className="w-full max-w-md space-y-8">
          
          {/* اللوجو للموبايل فقط */}
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
                <Link href="/forgot-password" target="_blank" className="text-sm font-bold text-[#ab8320] hover:text-[#d4b055] transition-colors">
                  Forgot password?
                </Link>
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