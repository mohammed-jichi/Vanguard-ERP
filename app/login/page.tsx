'use client';
import Image from "next/image";

export default function LoginPage() {
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

      {/* ================= القسم الأيسر - الأزرق ================= */}
      <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-between p-16 relative overflow-hidden">
        {/* إضاءات الخلفية الزرقاء */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/50 to-transparent z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-10 z-0 pointer-events-none"></div>

        {/* 1. صورة العنوان بدلاً من النص (Vanguard Business Solutions) */}
        <div className="relative z-10 w-full max-w-md h-24 mb-4">
          {/* تأكد من وجود صورة بهذا الاسم في مجلد public */}
          <Image 
            src="/vanguard-title.png" 
            alt="Vanguard Business Solutions" 
            fill 
            className="object-contain object-left" 
          />
          {/* ملاحظة: إذا لم تضع الصورة بعد، ستظهر مساحة فارغة هنا */}
        </div>

        {/* 2. صور المنصات بدلاً من النصوص (Enterprise Platforms) */}
        <div className="relative z-10 space-y-6">
          <div className="relative w-64 h-12 mb-4">
             {/* صورة عنوان المنصات */}
             <Image 
               src="/enterprise-platforms-title.png" 
               alt="Enterprise Platforms" 
               fill 
               className="object-contain object-left" 
             />
          </div>
          
          {/* شبكة صور المنصات (POS, Inventory, etc.) */}
          <div className="flex flex-wrap gap-4 max-w-lg">
            {/* مثال: صورة الـ POS */}
            <div className="relative w-24 h-10">
              <Image src="/pos-button.png" alt="POS" fill className="object-contain" />
            </div>
            {/* مثال: صورة المحاسبة */}
            <div className="relative w-32 h-10">
              <Image src="/accounting-button.png" alt="Accounting" fill className="object-contain" />
            </div>
            {/* يمكنك إضافة المزيد من الصور هنا بنفس الطريقة */}
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm font-bold text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          <span>•</span>
          <a href="#" className="hover:text-[#d4b055] transition-colors drop-shadow-md">Request a Demo</a>
        </div>
      </div>

      {/* ================= القسم الأيمن - الأبيض ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-gradient-to-br from-white to-slate-100 pl-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* اللوجو للموبايل فقط (يختفي على الشاشات الكبيرة لأن اللوجو المركزي يغطي) */}
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