"use client";

import { useActionState } from "react";
import { runActionDiagnostics, type DiagnosticActionState, type DiagnosticResult } from "./actions";

const initialState: DiagnosticActionState = {
  results: []
};

function ResultRows({ results }: { results: DiagnosticResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-right text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-3 py-3">الفحص</th>
            <th className="px-3 py-3">الحالة</th>
            <th className="px-3 py-3">التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.label} className="border-t border-zinc-100">
              <td className="px-3 py-3 font-bold">{result.label}</td>
              <td className={result.ok ? "px-3 py-3 font-bold text-emerald-700" : "px-3 py-3 font-bold text-red-700"}>
                {result.ok ? "سليم" : "مشكلة"}
              </td>
              <td className="px-3 py-3 text-zinc-600">{result.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DiagnosticsPanel({ initialResults }: { initialResults: DiagnosticResult[] }) {
  const [state, formAction, isPending] = useActionState(runActionDiagnostics, initialState);
  const actionResults = state.results;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">فحص الصفحة</h2>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">Server Component</span>
        </div>
        <div className="mt-4">
          <ResultRows results={initialResults} />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">فحص العمليات</h2>
          <form action={formAction}>
            <button disabled={isPending} className="h-10 rounded-lg bg-brand-black px-4 text-sm font-bold text-white disabled:bg-zinc-400">
              {isPending ? "جار الفحص..." : "تشغيل فحص الحفظ"}
            </button>
          </form>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          هذا الفحص يستخدم نفس مسار Server Actions الذي تستخدمه الإضافة والتعديل والحذف.
        </p>
        {actionResults.length ? (
          <div className="mt-4">
            <ResultRows results={actionResults} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
