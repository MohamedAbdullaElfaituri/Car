import { Download, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, MiniBars, StatCard } from "@/components/ui";
import { getOrders, getServices, getSettings, getWorkers } from "@/lib/data/queries";
import { formatCurrency, paymentLabels } from "@/lib/format";

export default async function ReportsPage() {
  const [orders, services, workers, settings] = await Promise.all([getOrders(), getServices(), getWorkers(), getSettings()]);
  const income = orders.reduce((sum, order) => sum + order.total, 0);
  const average = orders.length ? income / orders.length : 0;
  const cash = orders.filter((order) => order.paymentMethod === "cash").reduce((sum, order) => sum + order.total, 0);
  const serviceChart = services.slice(0, 6).map((service) => ({ label: service.name, value: service.soldCount }));

  return (
    <AppShell title="التقارير">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الدخل" value={formatCurrency(income, settings.currency)} tone="red" />
        <StatCard label="عدد السيارات" value={String(orders.length)} tone="light" />
        <StatCard label="متوسط قيمة الفاتورة" value={formatCurrency(average, settings.currency)} tone="light" />
        <StatCard label="إيراد الكاش" value={formatCurrency(cash, settings.currency)} tone="dark" />
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-bold">فلاتر التقرير</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <select className="h-11 rounded-lg border border-zinc-200 px-3"><option>تقرير يومي</option><option>تقرير شهري</option><option>تاريخ مخصص</option></select>
          <input type="date" className="h-11 rounded-lg border border-zinc-200 px-3" />
          <input type="date" className="h-11 rounded-lg border border-zinc-200 px-3" />
          <select className="h-11 rounded-lg border border-zinc-200 px-3">
            <option>كل العمال</option>
            {workers.map((worker) => <option key={worker.id}>{worker.name}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-zinc-200 px-3">
            <option>كل طرق الدفع</option>
            {Object.values(paymentLabels).map((label) => <option key={label}>{label}</option>)}
          </select>
          <select className="h-11 rounded-lg border border-zinc-200 px-3">
            <option>كل الخدمات</option>
            {services.map((service) => <option key={service.id}>{service.name}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="flex h-11 items-center gap-2 rounded-lg bg-brand-black px-4 font-bold text-white"><FileText className="h-5 w-5" />عرض التقرير</button>
          <button className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 font-bold"><Download className="h-5 w-5" />تصدير CSV</button>
          <button className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 font-bold"><Download className="h-5 w-5" />تصدير PDF</button>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">الخدمات الأكثر طلباً</h2>
          <div className="mt-5"><MiniBars data={serviceChart} /></div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">أداء العمال</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-right text-sm">
              <thead className="bg-zinc-50 text-zinc-500"><tr><th className="px-3 py-3">العامل</th><th className="px-3 py-3">المعاملات</th><th className="px-3 py-3">الإيرادات</th><th className="px-3 py-3">العمولة</th></tr></thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-t border-zinc-100">
                    <td className="px-3 py-3 font-bold">{worker.name}</td>
                    <td className="px-3 py-3">{worker.transactionsCount}</td>
                    <td className="px-3 py-3">{formatCurrency(worker.revenue, settings.currency)}</td>
                    <td className="px-3 py-3">{formatCurrency(worker.revenue * (worker.commissionRate / 100), settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
