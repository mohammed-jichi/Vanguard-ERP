# Vanguard ERP - Definition of Done (DoD) & Core System Protocol

Permanently binding all codebase operations, modules, and architecture:

1. **Zero Mock Persistence:** Every save, update, delete, or submit handler MUST execute a real Supabase mutation (`await supabase.from(...).update/insert(...)` or dedicated API route). Fake `setTimeout` resolutions or purely in-memory `useState` mutations are strictly forbidden.
2. **Truth-First User Notifications:** Never trigger `toast.success()` unconditionally. Always evaluate backend response errors first (`if (error) { ... return; }`).
3. **Cloud Media Storage:** Strictly write uploads to designated Supabase Storage buckets (e.g. `brand-assets`, `organization-media`); never write media to local disk.
4. **100% Deep JSX Localization:** Pass every user-facing string through `t('key', 'Default')` registered across `ar`, `en`, `fr`, `es`, `fa` in `LanguageContext.tsx`.
5. **Build Integrity:** `npm run build` must cleanly exit with code 0 before finalizing any phase.
