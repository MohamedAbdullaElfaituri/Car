import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { Card } from "@/components/ui";
import { getAuditLogs, getSettings } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

export default async function SettingsPage() {
  const [settings, logs] = await Promise.all([getSettings(), getAuditLogs()]);

  return (
    <AppShell title="الإعدادات">
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <h2 className="text-lg font-bold">إعدادات النظام والفاتورة</h2>
          <SettingsForm settings={settings} />
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
