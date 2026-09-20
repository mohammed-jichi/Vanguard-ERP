'use client';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
            const maxAge = 60 * 60 * 24 * 30; // 30 days
            document.cookie = `sb-${data.session.user.id}-auth-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
        اللوجو المركزي - اللينك متجه لـ /request-demo 
      */}
      <div className="hidden lg:flex absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 items-center justify-center shrink-0">
        <Link
          href="/request-demo"
          title="Request an Enterprise Demo"
          className="relative flex items-center justify-center group cursor-pointer shrink-0"
        >
          <div className="absolute inset-0 bg-[#d4b055] blur-[40px] opacity-70 rounded-full animate-pulse w-36 h-36 transition-all duration-300 group-hover:blur-[60px] group-hover:opacity-100"></div>

          <div className="relative w-28 h-28 md:w-32 md:h-32 max-w-[128px] max-h-[128px] rounded-full overflow-hidden border-[4px] border-[#09152b] shadow-[0_0_30px_rgba(171,131,32,0.6)] bg-[#09152b] z-10 transition-transform duration-300 group-hover:scale-105 shrink-0">
            <Image src="/vanguard.jpg" alt="Vanguard Enterprise Demo" fill className="object-cover" priority />
          </div>
        </Link>
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
          </form>
        </div>
      </div>
    </div>
  );
}