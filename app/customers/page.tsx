import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, ConfirmDeleteButton, Field, inputClass, PrimaryButton, SearchBar, textareaClass } from "@/components/ui";
import { getCustomers } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { createCustomerAction } from "@/app/actions";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <AppShell title="العملاء" action={<PrimaryButton><Plus className="ml-2 h-4 w-4" />إضافة عميل</PrimaryButton>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <SearchBar placeholder="بحث بالاسم أو رقم الهاتف" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-right text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-3">الاسم</th>
                  <th className="px-3 py-3">الهاتف</th>
                  <th className="px-3 py-3">الملاحظات</th>
                  <th className="px-3 py-3">تاريخ الإضافة</th>
                  <th className="px-3 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 font-bold">{customer.name}</td>
                    <td className="px-3 py-3">{customer.phone}</td>
                    <td className="px-3 py-3 text-zinc-500">{customer.notes ?? "-"}</td>
                    <td className="px-3 py-3">{formatDate(customer.createdAt)}</td>
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
          <p className="mt-4 text-sm text-zinc-500">الصفحة 1 من 1. عند ربط قاعدة البيانات تطبق Pagination من الخادم.</p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">إضافة عميل سريعاً</h2>
          <form action={createCustomerAction} className="mt-4 space-y-4">
            <Field label="الاسم"><input name="name" className={inputClass} placeholder="اسم العميل" required /></Field>
            <Field label="رقم الهاتف"><input name="phone" className={inputClass} placeholder="09xxxxxxxx" required /></Field>
            <Field label="ملاحظات"><textarea name="notes" className={textareaClass} placeholder="ملاحظات اختيارية" /></Field>
            <button className="h-11 w-full rounded-lg bg-brand-black font-bold text-white">حفظ العميل</button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
