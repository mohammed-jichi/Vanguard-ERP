'use client';
import Image from "next/image";
import Link from "next/link";

export default function RequestDemoPage() {
    return (
        <div className="relative min-h-screen w-full flex bg-slate-50 font-sans overflow-hidden">

            {/* 
        اللوجو المركزي - مع رابط للعودة لصفحة الدخول 
      */}
            <div className="hidden lg:flex absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 items-center justify-center">
                <Link
                    href="/login"
                    title="Back to Login"
                    className="relative flex items-center justify-center group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-[#d4b055] blur-[50px] opacity-70 rounded-full animate-pulse w-48 h-48 transition-all duration-300 group-hover:blur-[70px] group-hover:opacity-100"></div>

                    <div className="relative w-44 h-44 rounded-full overflow-hidden border-[6px] border-[#09152b] shadow-[0_0_40px_rgba(171,131,32,0.6)] bg-[#09152b] z-10 transition-transform duration-300 group-hover:scale-105">
                        <Image src="/vanguard.jpg" alt="Vanguard Enterprise" fill className="object-cover" priority />
                    </div>
                </Link>
            </div>

            {/* ================= القسم الأيسر - الأزرق ================= */}
            <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-start items-center p-12 pt-32 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/60 to-transparent z-0"></div>
                <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-15 z-0 pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-xl space-y-8 pr-12 mt-10">

                    <div className="space-y-6">
                        <h1 className="text-4xl xl:text-5xl font-black text-white tracking-widest animate-pulse [-webkit-text-stroke:_1.5px_#ab8320] drop-shadow-[0_0_20px_rgba(212,176,85,0.7)]">
                            VANGUARD ENTERPRISE
                        </h1>

                        {/* تنسيق النص الجديد - مشابه لـ Business Solutions */}
                        <div className="space-y-3 pt-6 border-t border-[#123b70]/50">
                            <p className="block text-xl font-bold text-slate-100 drop-shadow-md leading-relaxed">
                                Schedule a personalized demo with our enterprise team.
                            </p>
                            <p className="block text-[#d4b055] font-semibold tracking-widest uppercase text-sm transition-colors">
                                See How Vanguard Can Transform Your Operations
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* ================= القسم الأيمن - الأبيض ================= */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:pl-28 relative bg-gradient-to-br from-white to-slate-100">
                <div className="w-full max-w-md space-y-8">

                    <div className="lg:hidden relative flex justify-center mb-10">
                        <div className="absolute inset-0 bg-[#d4b055] blur-[40px] opacity-40 rounded-full animate-pulse w-32 h-32 mx-auto"></div>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl border-[3px] border-[#123b70]/10 z-10 bg-[#09152b]">
                            <Image src="/vanguard.jpg" alt="Vanguard Logo Mobile" fill className="object-cover" priority />
                        </div>
                    </div>

                    <div className="text-center lg:text-left mt-8 lg:mt-0">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Request a Demo</h2>
                        <p className="text-slate-500 mt-2 font-medium">Fill out the form below and our sales team will contact you.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                            <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#123b70] outline-none transition-all shadow-sm font-semibold text-slate-900" placeholder="e.g. John Doe" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Company Name</label>
                            <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#123b70] outline-none transition-all shadow-sm font-semibold text-slate-900" placeholder="Restaurant / Hotel Name" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Business Type</label>
                            <select className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#123b70] outline-none transition-all shadow-sm font-semibold text-slate-900">
                                <option value="restaurant">Restaurant / F&B</option>
                                <option value="hotel">Hotel / Hospitality</option>
                                <option value="retail">Retail / Supermarket</option>
                            </select>
                        </div>

                        <button className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#123b70] to-[#0a2342] hover:from-[#0a2342] hover:to-[#051324] text-white font-bold text-lg tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 mt-4 border border-[#123b70]/50">
                            Submit Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}