import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass, PrimaryButton, SearchBar, StatusBadge, textareaClass } from "@/components/ui";
import { DeleteRecordForm } from "@/components/record-actions";
import { getServices, getSettings } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";
import { createServiceAction, softDeleteAction, updateServiceAction } from "@/app/actions";

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <AppShell title="الخدمات والأسعار" action={<PrimaryButton><Plus className="ml-2 h-4 w-4" />إضافة خدمة</PrimaryButton>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <SearchBar placeholder="بحث باسم الخدمة" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-3">الخدمة</th>
                  <th className="px-3 py-3">السعر</th>
                  <th className="px-3 py-3">المدة</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-3 py-3">الوصف</th>
                  <th className="px-3 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 font-bold">{service.name}</td>
                    <td className="px-3 py-3">{formatCurrency(service.price, settings.currency)}</td>
                    <td className="px-3 py-3">{service.durationMinutes} دقيقة</td>
                    <td className="px-3 py-3">
                      <StatusBadge className={service.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"}>
                        {service.active ? "مفعلة" : "غير مفعلة"}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-3 text-zinc-500">{service.description ?? "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <details className="relative">
                          <summary className="list-none rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-50">تعديل</summary>
                          <form action={updateServiceAction} className="fixed left-4 top-24 z-50 max-h-[calc(100vh-7rem)] w-[min(92vw,380px)] overflow-y-auto space-y-3 rounded-lg border border-zinc-200 bg-white p-3 text-right shadow-lg">
                            <input type="hidden" name="id" value={service.id} />
                            <input name="name" className={inputClass} defaultValue={service.name} required />
                            <input name="price" className={inputClass} type="number" min="0" step="0.01" defaultValue={service.price} required />
                            <input name="durationMinutes" className={inputClass} type="number" min="1" defaultValue={service.durationMinutes} required />
                            <select name="active" className={inputClass} defaultValue={String(service.active)}>
                              <option value="true">مفعلة</option>
                              <option value="false">غير مفعلة</option>
                            </select>
                            <textarea name="description" className={textareaClass} defaultValue={service.description ?? ""} />
                            <button className="h-10 w-full rounded-lg bg-brand-black font-bold text-white">حفظ التعديل</button>
                          </form>
                        </details>
                        <DeleteRecordForm action={softDeleteAction} table="services" id={service.id} path="/services" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">إضافة خدمة</h2>
          <form action={createServiceAction} className="mt-4 space-y-4">
            <Field label="اسم الخدمة"><input name="name" className={inputClass} placeholder="مثال: غسيل محرك" required /></Field>
            <Field label="السعر"><input name="price" className={inputClass} type="number" min="0" placeholder="0" required /></Field>
            <Field label="مدة التنفيذ بالدقائق"><input name="durationMinutes" className={inputClass} type="number" min="1" placeholder="30" required /></Field>
            <Field label="الحالة">
              <select name="active" className={inputClass}><option value="true">مفعلة</option><option value="false">غير مفعلة</option></select>
            </Field>
            <Field label="وصف اختياري"><textarea name="description" className={textareaClass} /></Field>
            <button className="h-11 w-full rounded-lg bg-brand-black font-bold text-white">حفظ الخدمة</button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

