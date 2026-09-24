'use client';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Sparkles, X, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { resolveUserTenantAndRole, persistTenantSession, getPostLoginDestination, getTenantPreview } from "@/lib/authTenantResolver";

export default function LoginPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tenantPreview, setTenantPreview] = useState<{
    brandNameAr: string;
    brandNameEn: string;
    companyId: number | string;
    logoUrl: string;
    tenantId: string;
  } | null>(null);
  const [isResolvingTenant, setIsResolvingTenant] = useState(false);

  // Demo Request Modal State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoCompany, setDemoCompany] = useState("");
  const [demoSector, setDemoSector] = useState("restaurant");
  const [demoNotes, setDemoNotes] = useState("");
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDemoModal) {
        setShowDemoModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDemoModal]);

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDemo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDemoSubmitted(true);
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cId = params.get("companyId") || params.get("tenant") || params.get("code");
      if (cId) setCompanyId(cId);
    }
  }, []);

  React.useEffect(() => {
    let isCurrent = true;
    const trimmed = companyId.trim();
    if (!trimmed) {
      setTenantPreview(null);
      setIsResolvingTenant(false);
      return;
    }

    setIsResolvingTenant(true);
    const timer = setTimeout(async () => {
      try {
        const preview = await getTenantPreview(trimmed);
        if (isCurrent) {
          setTenantPreview(preview);
        }
      } catch (err) {
        console.warn("Tenant preview lookup failed:", err);
      } finally {
        if (isCurrent) {
          setIsResolvingTenant(false);
        }
      }
    }, 100);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [companyId]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let authUserId: string | undefined;
      if (email && password) {
        try {
          const { data } = await supabase.auth.signInWithPassword({ email, password });
          if (data?.session) {
            authUserId = data.session.user.id;
            document.cookie = `sb-${data.session.user.id}-auth-token=${data.session.access_token}; path=/; SameSite=Lax`;
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; SameSite=Lax`;
          }
        } catch (supaErr) {
          console.warn("Supabase auth fallback:", supaErr);
        }
      }

      // Query user's assigned tenant & authorization role dynamically from Supabase
      const assignment = await resolveUserTenantAndRole(email, authUserId, companyId);

      // Persist tenant session to cookies and client localStorage
      persistTenantSession(assignment);

      // Redirect directly to tenant workspace dashboard route (e.g. /[tenant_id]/dashboard)
      // Strictly reserve /admin for Super Admins
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");
      const target = getPostLoginDestination(assignment, redirectUrl);

      window.location.href = target;
    } catch (err) {
      console.error("Login processing error:", err);
      setIsLoading(false);
    }
  };

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
        CENTER VANGUARD LOGO - INTERACTIVE DEMO TRIGGER WITH GLOWING BADGE & PULSE
      */}
      <div className="hidden lg:flex flex-col absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 items-center justify-center shrink-0">
        <button
          type="button"
          onClick={() => {
            setShowDemoModal(true);
            setDemoSubmitted(false);
          }}
          title="✨ Click to request a Vanguard Enterprise Demo"
          className="relative flex flex-col items-center justify-center group cursor-pointer shrink-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d4b055]/50 rounded-full"
        >
          {/* Dual Soft Golden + Cyan Pulse Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4b055] via-amber-400 to-cyan-400 blur-[36px] opacity-75 rounded-full animate-pulse w-36 h-36 -translate-x-2 -translate-y-2 group-hover:blur-[50px] group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"></div>

          {/* Logo Frame with Hover Scale & Border Glow */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 max-w-[128px] max-h-[128px] rounded-full overflow-hidden border-[4px] border-[#09152b] group-hover:border-[#d4b055] shadow-[0_0_30px_rgba(171,131,32,0.6)] group-hover:shadow-[0_0_45px_rgba(6,182,212,0.8)] bg-[#09152b] z-10 transition-all duration-300 transform group-hover:scale-110 active:scale-95 shrink-0">
            <Image src="/vanguard.jpg" alt="Vanguard Enterprise Demo" fill className="object-cover" priority />
          </div>

          {/* Subtle Elegant Glowing Badge / Tooltip Directly Below */}
          <div className="mt-3.5 z-20 pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#09152b]/95 border border-[#d4b055]/70 text-[#d4b055] text-[11px] font-bold tracking-wide shadow-[0_4px_20px_rgba(212,176,85,0.4)] backdrop-blur-md group-hover:border-cyan-400 group-hover:text-cyan-300 group-hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-all duration-300 select-none animate-pulse">
              <span className="text-xs">✨</span>
              <span>Click logo to request a demo</span>
            </div>
          </div>
        </button>
      </div>

      {/* ================= القسم الأيسر - الأزرق ================= */}
      <div className="hidden lg:flex w-1/2 flex-1 bg-[#09152b] flex-col justify-center items-center p-8 lg:p-12 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#123b70]/60 to-transparent z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ab8320] rounded-full blur-[150px] opacity-15 z-0 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg space-y-8">

          <div className="space-y-6">
            {/* 
              العنوان مع التحديد الذهبي للأطراف (Stroke) وتوهج ذهبي متناسق 
            */}
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-widest animate-pulse [-webkit-text-stroke:_1.5px_#ab8320] drop-shadow-[0_0_20px_rgba(212,176,85,0.7)]">
              VANGUARD ERP SYSTEM
            </h1>

            {tenantPreview && tenantPreview.companyId !== 'ADMIN' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4b055]/15 border border-[#d4b055]/50 text-[#d4b055] text-xs font-bold tracking-wide shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Enterprise: {tenantPreview.brandNameAr} (#{tenantPreview.companyId})</span>
              </div>
            )}

            <div className="space-y-2">
              <Link href="/solutions" target="_blank" className="block text-xl font-bold text-slate-100 hover:text-[#d4b055] transition-colors drop-shadow-md">
                Business Solutions
              </Link>
              <Link href="/sectors" target="_blank" className="block text-[#d4b055] font-semibold tracking-widest uppercase text-sm hover:text-white transition-colors">
                Restaurants • Hotels • Retail
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[#123b70]/50">
            <Link href="/platforms" target="_blank" className="block text-xl font-bold text-slate-100 hover:text-[#d4b055] transition-colors mb-6 drop-shadow-md">
              Enterprise Platforms
            </Link>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-left">
              {platforms.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  target="_blank"
                  className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium backdrop-blur-md hover:bg-[#123b70]/40 hover:text-white hover:border-[#d4b055]/50 transition-all cursor-pointer shadow-sm text-center"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ================= القسم الأيمن - الأبيض ================= */}
      <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-12 relative bg-gradient-to-br from-white to-slate-100">
        <div className="w-full max-w-md space-y-8">

          <div className="lg:hidden relative flex flex-col items-center justify-center mb-8">
            <button
              type="button"
              onClick={() => {
                setShowDemoModal(true);
                setDemoSubmitted(false);
              }}
              className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4b055] to-cyan-400 blur-[30px] opacity-50 rounded-full animate-pulse w-32 h-32 mx-auto pointer-events-none"></div>
              <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-xl border-[3px] border-[#d4b055]/50 group-hover:scale-105 transition-transform z-10 bg-[#09152b]">
                <Image src="/vanguard.jpg" alt="Vanguard Logo Mobile" fill className="object-cover" priority />
              </div>
              <div className="mt-3 z-20">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#09152b]/95 border border-[#d4b055]/70 text-[#d4b055] text-[11px] font-bold shadow-md">
                  <span>✨</span> Click logo to request a demo
                </span>
              </div>
            </button>
          </div>

          <div className="text-center lg:text-left mt-8 lg:mt-0">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-slate-500 mt-2 font-medium">Access your Vanguard dashboard</p>
          </div>

          {/* DYNAMIC TENANT BRANDING PREVIEW CARD */}
          {tenantPreview && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#09152b] to-[#123b70] border-2 border-[#d4b055]/60 text-white shadow-xl animate-fadeIn transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-white/10 p-1 border border-[#d4b055]/40 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                  <img
                    src={tenantPreview.logoUrl || "/assets/images/logo.png"}
                    alt={tenantPreview.brandNameEn}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/vanguard.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4b055]/25 text-[#d4b055] border border-[#d4b055]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {tenantPreview.companyId === 'ADMIN' ? 'System Master' : `Company #${tenantPreview.companyId}`}
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">
                      Verified Workspace
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5">
                    {tenantPreview.brandNameAr}
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate font-medium">
                    {tenantPreview.brandNameEn}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Company ID / Tenant Code
                </label>
                <span className="text-[11px] font-semibold text-slate-400">
                  {isResolvingTenant ? (
                    <span className="text-[#123b70] animate-pulse">Checking ID...</span>
                  ) : tenantPreview ? (
                    <span className="text-emerald-600 font-bold">✓ Verified</span>
                  ) : (
                    '(1300 for Primary Tenant / ADMIN for Master)'
                  )}
                </span>
              </div>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="e.g. 1300, SO-OLIVE, or ADMIN"
                className={`w-full px-5 py-4 rounded-xl border ${tenantPreview ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200/80'} bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-semibold uppercase tracking-wider`}
              />
              {tenantPreview && (
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Dynamic Branding: {tenantPreview.brandNameAr} ({tenantPreview.brandNameEn})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-semibold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" target="_blank" className="text-sm font-bold text-[#ab8320] hover:text-[#d4b055] transition-colors">Forgot password?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#123b70] focus:border-transparent transition-all shadow-sm font-semibold tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#123b70] to-[#0a2342] hover:from-[#0a2342] hover:to-[#051324] text-white font-bold text-lg tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 mt-4 border border-[#123b70]/50 disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* FALLBACK ACCESSIBLE DEMO REQUEST LINK */}
            <div className="pt-3 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Interested in Vanguard ERP?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowDemoModal(true);
                    setDemoSubmitted(false);
                  }}
                  className="font-bold text-[#ab8320] hover:text-[#d4b055] underline decoration-[#d4b055]/50 hover:decoration-[#d4b055] transition-all cursor-pointer inline-flex items-center gap-1 focus:outline-none"
                >
                  Request a Demo
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ================= DEMO REQUEST MODAL / DRAWER ================= */}
      {showDemoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDemoModal(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden my-8 text-left transition-all">
            
            {/* Modal Header */}
            <div className="bg-[#09152b] text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#d4b055]/25 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#d4b055]/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                    <img src="/vanguard.jpg" alt="Vanguard Logo" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4b055]/20 text-[#d4b055] border border-[#d4b055]/40 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3 text-[#d4b055]" />
                      <span>Enterprise Consultation</span>
                    </div>
                    <h2 id="demo-modal-title" className="text-xl font-black text-white tracking-tight">
                      Request an Enterprise Demo
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      Schedule a live walkthrough tailored to your operations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  title="Close modal"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {demoSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">Demo Request Received!</h3>
                    <p className="text-sm text-slate-600 font-medium max-w-sm mx-auto">
                      Thank you, <strong className="text-slate-900">{demoName || "valued client"}</strong>. A Vanguard enterprise specialist will contact you at <strong className="text-slate-900">{demoEmail || "your email"}</strong> within 24 hours.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDemoModal(false)}
                      className="px-6 py-2.5 rounded-xl bg-[#09152b] hover:bg-[#123b70] text-white text-sm font-bold shadow-md transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company / Entity Name *</label>
                      <input
                        type="text"
                        required
                        value={demoCompany}
                        onChange={(e) => setDemoCompany(e.target.value)}
                        placeholder="e.g. Acme Holdings S.A.R.L"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Business Email *</label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        placeholder="+961 70 000 000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Industry & Primary Focus</label>
                    <select
                      value={demoSector}
                      onChange={(e) => setDemoSector(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="restaurant">Restaurants & Food Service (V-POS)</option>
                      <option value="hotel">Hotels & Hospitality</option>
                      <option value="retail">Supermarkets, Retail & Distribution</option>
                      <option value="pressing-mill">Agro-Industrial & Olive Oil Pressing Mill Facility</option>
                      <option value="fleet">Logistics & Van Fleet Dispatch (V-Driver)</option>
                      <option value="all-modules">Complete 12-Module Enterprise Suite</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={demoNotes}
                      onChange={(e) => setDemoNotes(e.target.value)}
                      placeholder="Number of branches, active locations, current challenges..."
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingDemo}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#123b70] to-[#0a2342] hover:from-[#0a2342] hover:to-[#051324] text-white font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 mt-2 border border-[#123b70]/50 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingDemo ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>✨ Submit Demo Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <Link
                      href="/request-demo"
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-medium underline transition-colors"
                    >
                      Prefer the dedicated full-page form? Open Demo Page &rarr;
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}