import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { WorkerCreateForm } from "@/components/worker-create-form";
import { Card, inputClass, PrimaryButton, StatusBadge } from "@/components/ui";
import { DeleteRecordForm } from "@/components/record-actions";
import { getSettings, getWorkers } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";
import { softDeleteAction, updateWorkerAction } from "@/app/actions";

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
                          <details className="relative">
                            <summary className="list-none rounded-lg border border-zinc-200 px-3 py-2 font-semibold transition hover:bg-zinc-50">تعديل</summary>
                            <form action={updateWorkerAction} className="fixed left-4 top-24 z-50 max-h-[calc(100vh-7rem)] w-[min(92vw,360px)] overflow-y-auto space-y-3 rounded-lg border border-zinc-200 bg-white p-3 text-right shadow-lg">
                              <input type="hidden" name="id" value={worker.id} />
                              <input name="name" className={inputClass} defaultValue={worker.name} required />
                              <input name="phone" className={inputClass} defaultValue={worker.phone} />
                              <input name="commissionRate" type="number" min="0" max="100" className={inputClass} defaultValue={worker.commissionRate} />
                              <select name="active" className={inputClass} defaultValue={String(worker.active)}>
                                <option value="true">نشط</option>
                                <option value="false">متوقف</option>
                              </select>
                              <button className="h-10 w-full rounded-lg bg-brand-black font-bold text-white">حفظ التعديل</button>
                            </form>
                          </details>
                          <form action={updateWorkerAction}>
                            <input type="hidden" name="id" value={worker.id} />
                            <input type="hidden" name="name" value={worker.name} />
                            <input type="hidden" name="phone" value={worker.phone} />
                            <input type="hidden" name="commissionRate" value={worker.commissionRate} />
                            <input type="hidden" name="active" value={worker.active ? "false" : "true"} />
                            <button className="rounded-lg border border-zinc-200 px-3 py-2 font-semibold">{worker.active ? "إيقاف" : "تفعيل"}</button>
                          </form>
                          <DeleteRecordForm action={softDeleteAction} table="workers" id={worker.id} path="/workers" />
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
          <WorkerCreateForm />
        </Card>
      </div>
    </AppShell>
  );
}

