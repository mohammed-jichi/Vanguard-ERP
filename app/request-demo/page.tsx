'use client';
import Image from "next/image";
import Link from "next/link";

export default function RequestDemoPage() {
    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans">

            {/* القسم الأيسر - الهوية */}
            <div className="hidden lg:flex w-1/2 bg-[#09152b] flex-col justify-center items-center p-12 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/60 to-transparent z-0"></div>
                <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-15 z-0 pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-black text-white tracking-widest drop-shadow-lg [-webkit-text-stroke:_1px_#ab8320]">
                        VANGUARD ENTERPRISE
                    </h1>
                    <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
                        Schedule a personalized demo with our enterprise team to see how Vanguard can transform your operations.
                    </p>
                </div>
            </div>

            {/* القسم الأيمن - نموذج الطلب */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-900">Request a Demo</h2>
                        <p className="text-slate-500 mt-2 font-medium">Fill out the form below and our sales team will contact you.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                            <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#123b70] outline-none transition-all font-medium" placeholder="e.g. John Doe" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">Company Name</label>
                            <input type="text" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#123b70] outline-none transition-all font-medium" placeholder="Restaurant / Hotel Name" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">Business Type</label>
                            <select className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#123b70] outline-none transition-all bg-white font-medium text-slate-700">
                                <option value="restaurant">Restaurant / F&B</option>
                                <option value="hotel">Hotel / Hospitality</option>
                                <option value="retail">Retail / Supermarket</option>
                            </select>
                        </div>

                        <button className="w-full py-4 rounded-xl bg-[#123b70] hover:bg-[#0a2342] text-white font-bold text-lg mt-4 shadow-lg transition-all">
                            Submit Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}