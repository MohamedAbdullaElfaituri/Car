import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, MiniBars, PrimaryButton, StatCard, StatusBadge } from "@/components/ui";
import { getDashboardStats, getSettings } from "@/lib/data/queries";
import { formatCurrency, paymentLabels, statusClass, statusLabels } from "@/lib/format";

export default async function DashboardPage() {
  const [stats, appSettings] = await Promise.all([getDashboardStats(), getSettings()]);

  return (
    <AppShell
      title="لوحة التحكم"
      action={
        <PrimaryButton href="/orders">
          <Plus className="ml-2 h-4 w-4" />
          معاملة جديدة
        </PrimaryButton>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي دخل اليوم" value={formatCurrency(stats.todayIncome, appSettings.currency)} tone="red" />
        <StatCard label="إجمالي دخل الشهر" value={formatCurrency(stats.monthIncome, appSettings.currency)} />
        <StatCard label="عدد السيارات اليوم" value={String(stats.todayCars)} hint="كل الحالات المسجلة اليوم" tone="light" />
        <StatCard label="عدد السيارات الشهر" value={String(stats.monthCars)} hint="إجمالي معاملات أبريل" tone="light" />
        <StatCard label="الخدمات المنجزة" value={String(stats.completedServices)} tone="light" />
        <StatCard label="قيد التنفيذ" value={String(stats.inProgressServices)} tone="light" />
        <StatCard label="أفضل خدمة مبيعاً" value={stats.topService.name} hint={`${stats.topService.soldCount} مرة`} tone="light" />
        <StatCard label="أفضل عامل" value={stats.topWorker.name} hint={`${stats.topWorker.transactionsCount} معاملة`} tone="light" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">الرسم اليومي</h2>
          <div className="mt-5">
            <MiniBars data={stats.dailyChart} />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">الرسم الشهري</h2>
          <div className="mt-5">
            <MiniBars data={stats.monthlyChart} />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">آخر المعاملات</h2>
          <Link href="/orders" className="text-sm font-bold text-brand-red">
            عرض الكل
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-3 py-3">الفاتورة</th>
                <th className="px-3 py-3">العميل</th>
                <th className="px-3 py-3">السيارة</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3">الدفع</th>
                <th className="px-3 py-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestOrders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-3 py-3 font-bold">{order.invoiceNumber}</td>
                  <td className="px-3 py-3">{order.customerName}</td>
                  <td className="px-3 py-3">{order.plateNumber}</td>
                  <td className="px-3 py-3">
                    <StatusBadge className={statusClass(order.status)}>{statusLabels[order.status]}</StatusBadge>
                  </td>
                  <td className="px-3 py-3">{paymentLabels[order.paymentMethod]}</td>
                  <td className="px-3 py-3 font-bold">{formatCurrency(order.total, appSettings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
