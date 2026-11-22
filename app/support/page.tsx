import Link from 'next/link';

export const metadata = {
  title: 'Support - Vanguard ERP System',
  description: 'Vanguard ERP support center',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">Vanguard ERP Support</h1>
        <p className="text-sm text-slate-600">
          Need help? Open the Support Center from the header of any back-office page, or send your request
          through the in-app Feedback form so it is attached to your tenant and user profile.
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/backoffice/feedback" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">
            Send Feedback
          </Link>
          <Link href="/backoffice" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100">
            Back to Back Office
          </Link>
        </div>
      </div>
    </main>
  );
}
