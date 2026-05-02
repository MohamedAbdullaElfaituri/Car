import { collectDiagnostics } from "./actions";
import { DiagnosticsPanel } from "./diagnostics-panel";

export default async function DiagnosticsPage() {
  const results = await collectDiagnostics();

  return (
    <main className="min-h-screen bg-brand-surface px-4 py-6" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          هذه صفحة فحص آمنة. لا تعرض مفاتيح Supabase، لكنها تكشف هل الجلسة وصف المدير والصلاحيات تعمل.
        </div>
        <h1 className="mb-5 text-2xl font-bold text-brand-black">فحص الربط والصلاحيات</h1>
        <DiagnosticsPanel initialResults={results} />
      </div>
    </main>
  );
}
