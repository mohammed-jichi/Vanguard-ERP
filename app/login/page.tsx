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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center p-4 lg:p-8">
      {/* Background Glowing Fluid Waves / Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 lg:w-[500px] lg:h-[500px] rounded-full bg-blue-600/40 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 lg:w-[500px] lg:h-[500px] rounded-full bg-yellow-500/30 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-[600px] rounded-full bg-sky-400/20 blur-[120px] pointer-events-none -translate-y-1/2 rotate-45" />

      {/* Main Layout Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* Left Column: Marketing Content */}
        <div className="flex-1 flex flex-col items-start text-left space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight [text-shadow:_0_4px_24px_rgba(59,130,246,0.3)]">
              Vanguard Business Solutions
            </h1>
            <p className="text-lg lg:text-xl font-light text-sky-200/80 tracking-wide">
              (Restaurants, Hotels, Retail)
            </p>
          </div>

          <div className="space-y-3 w-full pt-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Vanguard Platforms
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs lg:text-sm font-medium tracking-wide shadow-sm transition-all hover:bg-white/20"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 w-full sm:w-auto">
            <button
              type="button"
              className="px-8 py-3 rounded-xl bg-[#123b70] hover:bg-[#1a4e90] text-white font-semibold text-sm tracking-wide shadow-lg transition-all duration-200 border border-blue-400/20"
            >
              Contact Us
            </button>
            <button
              type="button"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ab8320] to-[#d4b055] hover:opacity-95 text-white font-semibold text-sm tracking-wide shadow-lg transition-all duration-200"
            >
              Request A Demo
            </button>
          </div>
        </div>

        {/* Right Column: Glassmorphism Login Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl p-8 flex flex-col items-center">

          {/* Logo Area with Glowing Effect */}
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-500/20 blur-xl scale-150 pointer-events-none" />
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/30 shadow-md">
              <Image
                src="/vanguard.jpg"
                alt="Vanguard Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={(e) => e.preventDefault()} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 focus:bg-white/10 text-white placeholder-gray-300 text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 focus:bg-white/10 text-white placeholder-gray-300 text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-xl bg-[#123b70] hover:bg-[#1a4e90] text-white font-bold text-sm tracking-wide shadow-lg border border-blue-400/30 transition-all duration-200"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}