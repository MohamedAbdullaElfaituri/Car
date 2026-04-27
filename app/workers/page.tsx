import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ConfirmDeleteButton, Field, inputClass, PrimaryButton, StatusBadge } from "@/components/ui";
import { getSettings, getWorkers } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";

export default async function WorkersPage() {
  const [workers, settings] = await Promise.all([getWorkers(), getSettings()]);

  return (
    <AppShell title="العمال والعمولات" action={<PrimaryButton><Plus className="ml-2 h-4 w-4" />إضافة عامل</PrimaryButton>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">
            العمال هنا بيانات تشغيلية فقط. الدخول للنظام يتم من حساب المدير وحده.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-right text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-3">الاسم</th>
                  <th className="px-3 py-3">الهاتف</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-3 py-3">المعاملات</th>
                  <th className="px-3 py-3">الإيرادات المنفذة</th>
                  <th className="px-3 py-3">نسبة العمولة</th>
                  <th className="px-3 py-3">قيمة العمولة</th>
                  <th className="px-3 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => {
                  const commission = worker.revenue * (worker.commissionRate / 100);

                  return (
                    <tr key={worker.id} className="border-t border-zinc-100">
                      <td className="px-3 py-3 font-bold">{worker.name}</td>
                      <td className="px-3 py-3">{worker.phone}</td>
                      <td className="px-3 py-3">
                        <StatusBadge className={worker.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"}>
                          {worker.active ? "نشط" : "متوقف"}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-3">{worker.transactionsCount}</td>
                      <td className="px-3 py-3">{formatCurrency(worker.revenue, settings.currency)}</td>
                      <td className="px-3 py-3">{worker.commissionRate}%</td>
                      <td className="px-3 py-3 font-bold">{formatCurrency(commission, settings.currency)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button className="rounded-lg border border-zinc-200 px-3 py-2 font-semibold">تعديل</button>
                          <button className="rounded-lg border border-zinc-200 px-3 py-2 font-semibold">إيقاف</button>
                          <ConfirmDeleteButton />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">إضافة عامل</h2>
          <form className="mt-4 space-y-4">
            <Field label="اسم العامل"><input className={inputClass} placeholder="اسم العامل" /></Field>
            <Field label="رقم الهاتف"><input className={inputClass} placeholder="09xxxxxxxx" /></Field>
            <Field label="نسبة العمولة %"><input type="number" min="0" max="100" className={inputClass} placeholder="10" /></Field>
            <Field label="الحالة"><select className={inputClass}><option>نشط</option><option>متوقف</option></select></Field>
            <button className="h-11 w-full rounded-lg bg-brand-black font-bold text-white">حفظ العامل</button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
