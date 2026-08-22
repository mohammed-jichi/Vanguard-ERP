'use client';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-900">

      {/* 
        هون زرعنا الأوامر السحرية للحركة (Animations) 
        - spinAndSettle: بتخلي اللوجو يبرم وينزل يركز مكانه.
        - goldShine: بتعطي لمعان ونبض للإضاءة الذهبية.
      */}
      <style>{`
        @keyframes spinAndSettle {
          0% { transform: translateY(-80px) rotate(-720deg) scale(0.5); opacity: 0; }
          60% { transform: translateY(10px) rotate(20deg) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes goldShine {
          0% { filter: brightness(1) drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }
          50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)); }
          100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }
        }
        .animate-logo {
          animation: spinAndSettle 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-gold {
          animation: goldShine 3s infinite alternate;
        }
      `}</style>

      {/* خلفية الأمواج مع إخفاء التاب الوهمي */}
      <div
        className="absolute w-full h-[calc(100%+3.5rem)] top-[-3.5rem] left-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/bg-waves.jpg..jpg')" }}
      ></div>

      {/* 
        اللوجو المتحرك: حطينا صورة اللوجو الحقيقية فوق اللوجو المطبوع بالصورة 
        وربطناها بأنيميشن الدوران واللمعان الذهبي! 
      */}
      <div className="absolute top-[22%] right-[5%] md:top-[25%] md:right-[15%] z-30 flex justify-center w-[320px] md:w-[350px] pointer-events-none">
        {/* تأكد إنو صورة vanguard.jpg موجودة بملف public */}
        <img
          src="/vanguard.jpg"
          alt="Vanguard Animated Logo"
          className="h-24 md:h-28 object-contain animate-logo animate-gold"
        />
      </div>

      {/* الأزرار الحقيقية لتغطية الأزرار القديمة (مع لمعان للزر الذهبي) */}
      <div className="absolute bottom-[10%] left-[5%] md:bottom-[15%] md:left-[10%] flex gap-4 z-20">
        <button className="bg-[#123b70] hover:bg-[#0b254a] text-white px-6 md:px-8 py-3 rounded-md font-bold text-sm md:text-lg shadow-lg transition-all border border-blue-500/30">
          Contact Us
        </button>
        <button className="bg-gradient-to-r from-[#ab8320] via-[#d4b055] to-[#ab8320] hover:brightness-110 text-white px-6 md:px-8 py-3 rounded-md font-bold text-sm md:text-lg shadow-[0_0_15px_rgba(212,176,85,0.6)] animate-gold transition-all border border-yellow-300/50">
          Request A Demo
        </button>
      </div>

      {/* مربعات تسجيل الدخول الشفافة */}
      <div className="absolute top-[30%] right-[5%] md:top-[35%] md:right-[10%] w-[320px] md:w-[350px] p-6 z-20 flex flex-col gap-4 md:gap-5 mt-4">
        <input
          type="email"
          placeholder=" "
          className="w-full h-[40px] md:h-[45px] bg-transparent border-2 border-transparent hover:border-blue-400/50 focus:border-blue-500 focus:bg-white/10 outline-none rounded-md px-4 text-slate-900 font-bold transition-all"
        />
        <input
          type="password"
          placeholder=" "
          className="w-full h-[40px] md:h-[45px] mt-1 md:mt-2 bg-transparent border-2 border-transparent hover:border-blue-400/50 focus:border-blue-500 focus:bg-white/10 outline-none rounded-md px-4 text-slate-900 font-bold transition-all"
        />
        <button className="w-full h-[45px] md:h-[50px] mt-5 md:mt-6 bg-transparent cursor-pointer rounded-md hover:bg-white/10 transition-colors">
        </button>
      </div>

    </div>
  );
}