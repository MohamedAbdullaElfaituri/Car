import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ConfirmDeleteButton, Field, inputClass, PrimaryButton, SearchBar, StatusBadge, textareaClass } from "@/components/ui";
import { getServices, getSettings } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/format";

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
                        <button className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold">تعديل</button>
                        <ConfirmDeleteButton />
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
          <form className="mt-4 space-y-4">
            <Field label="اسم الخدمة"><input className={inputClass} placeholder="مثال: غسيل محرك" /></Field>
            <Field label="السعر"><input className={inputClass} type="number" min="0" placeholder="0" /></Field>
            <Field label="مدة التنفيذ بالدقائق"><input className={inputClass} type="number" min="1" placeholder="30" /></Field>
            <Field label="الحالة">
              <select className={inputClass}><option>مفعلة</option><option>غير مفعلة</option></select>
            </Field>
            <Field label="وصف اختياري"><textarea className={textareaClass} /></Field>
            <button className="h-11 w-full rounded-lg bg-brand-black font-bold text-white">حفظ الخدمة</button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
