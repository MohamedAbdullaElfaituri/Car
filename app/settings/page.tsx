import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass, textareaClass } from "@/components/ui";
import { getAuditLogs, getSettings } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { updateSettingsAction } from "@/app/actions";

export default async function SettingsPage() {
  const [settings, logs] = await Promise.all([getSettings(), getAuditLogs()]);

  return (
    <AppShell title="الإعدادات">
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <h2 className="text-lg font-bold">إعدادات النظام والفاتورة</h2>
          <form action={updateSettingsAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="اسم المحل">
              <input name="shopName" className={inputClass} defaultValue={settings.shopName} required />
            </Field>
            <Field label="رقم الهاتف">
              <input name="phone" className={inputClass} defaultValue={settings.phone} />
            </Field>
            <Field label="العنوان">
              <input name="address" className={inputClass} defaultValue={settings.address} />
            </Field>
            <Field label="العملة">
              <input name="currency" className={inputClass} defaultValue={settings.currency || "د.ل"} required />
            </Field>
            <Field label="الضرائب %">
              <input name="taxRate" className={inputClass} type="number" min="0" step="0.01" defaultValue={settings.taxRate} />
            </Field>
            <Field label="أوقات العمل">
              <input name="workingHours" className={inputClass} defaultValue={settings.workingHours} />
            </Field>
            <Field label="رابط الشعار">
              <input name="logoUrl" className={inputClass} defaultValue={settings.logoUrl ?? "/logo.jpeg"} placeholder="/logo.jpeg" />
            </Field>
            <Field label="لون النظام">
              <input name="primaryColor" className={inputClass} type="color" defaultValue={settings.primaryColor} />
            </Field>
            <div className="md:col-span-2">
              <Field label="نص أسفل الفاتورة">
                <textarea name="invoiceFooter" className={textareaClass} defaultValue={settings.invoiceFooter} />
              </Field>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4 rounded-lg bg-zinc-50 p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input name="calculateWorkerCommissions" type="checkbox" defaultChecked={settings.workerCanViewToday} className="accent-brand-red" />
                احتساب عمولات العمال في التقارير
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input name="reportsExportEnabled" type="checkbox" defaultChecked={settings.managerCanExportReports} className="accent-brand-red" />
                تفعيل تصدير التقارير
              </label>
            </div>
            <button className="h-11 rounded-lg bg-brand-black font-bold text-white md:col-span-2">حفظ الإعدادات</button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">سجل العمليات</h2>
          <div className="mt-4 space-y-3">
            {logs.length ? logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-zinc-200 p-3">
                <p className="font-bold">{log.action} {log.entity}</p>
                <p className="text-sm text-zinc-500">بواسطة {log.userName} · {formatDate(log.createdAt)}</p>
                <p className="mt-1 text-xs text-zinc-400">ID: {log.entityId}</p>
              </div>
            )) : <p className="text-sm text-zinc-500">لا توجد عمليات مسجلة بعد.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
