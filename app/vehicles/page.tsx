import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ConfirmDeleteButton, Field, inputClass, PrimaryButton, SearchBar, textareaClass } from "@/components/ui";
import { getCustomers, getVehicles } from "@/lib/data/queries";

export default async function VehiclesPage() {
  const [vehicles, customers] = await Promise.all([getVehicles(), getCustomers()]);

  return (
    <AppShell title="السيارات" action={<PrimaryButton><Plus className="ml-2 h-4 w-4" />إضافة سيارة</PrimaryButton>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <SearchBar placeholder="بحث برقم اللوحة أو اسم العميل" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-3">رقم اللوحة</th>
                  <th className="px-3 py-3">العميل</th>
                  <th className="px-3 py-3">النوع</th>
                  <th className="px-3 py-3">الموديل</th>
                  <th className="px-3 py-3">اللون</th>
                  <th className="px-3 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 font-bold">{vehicle.plateNumber}</td>
                    <td className="px-3 py-3">{vehicle.customerName}</td>
                    <td className="px-3 py-3">{vehicle.type}</td>
                    <td className="px-3 py-3">{vehicle.model}</td>
                    <td className="px-3 py-3">{vehicle.color}</td>
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
          <h2 className="text-lg font-bold">إضافة سيارة</h2>
          <form className="mt-4 space-y-4">
            <Field label="العميل">
              <select className={inputClass}>
                {customers.map((customer) => <option key={customer.id}>{customer.name}</option>)}
              </select>
            </Field>
            <Field label="رقم اللوحة"><input className={inputClass} placeholder="5-123456" /></Field>
            <Field label="نوع السيارة"><input className={inputClass} placeholder="تويوتا" /></Field>
            <Field label="الموديل"><input className={inputClass} placeholder="كامري 2022" /></Field>
            <Field label="اللون"><input className={inputClass} placeholder="أبيض" /></Field>
            <Field label="ملاحظات"><textarea className={textareaClass} /></Field>
            <button className="h-11 w-full rounded-lg bg-brand-black font-bold text-white">حفظ السيارة</button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
