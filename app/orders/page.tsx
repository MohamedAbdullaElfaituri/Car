import { AppShell } from "@/components/app-shell";
import { Card, ConfirmDeleteButton, PrimaryButton, SearchBar, StatusBadge } from "@/components/ui";
import { OrderForm } from "@/components/order-form";
import { getCustomers, getOrders, getServices, getSettings, getVehicles, getWorkers } from "@/lib/data/queries";
import { formatCurrency, paymentLabels, statusClass, statusLabels } from "@/lib/format";
import { createOrderAction } from "@/app/actions";

export default async function OrdersPage() {
  const [customers, vehicles, services, workers, orders, settings] = await Promise.all([
    getCustomers(),
    getVehicles(),
    getServices(),
    getWorkers(),
    getOrders(),
    getSettings()
  ]);

  return (
    <AppShell title="المعاملات / طلبات الغسيل" action={<PrimaryButton>معاملة جديدة واضحة</PrimaryButton>}>
      <OrderForm customers={customers} vehicles={vehicles} services={services} workers={workers} currency={settings.currency} action={createOrderAction} />

      <Card className="mt-6">
        <h2 className="text-lg font-bold">سجل المعاملات</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <SearchBar placeholder="بحث بالعميل أو اللوحة" />
          <select className="h-11 rounded-lg border border-zinc-200 px-3"><option>كل الحالات</option><option>جديد</option><option>قيد الغسيل</option><option>جاهز</option></select>
          <select className="h-11 rounded-lg border border-zinc-200 px-3"><option>كل طرق الدفع</option><option>كاش</option><option>بطاقة</option><option>تحويل</option></select>
          <input type="date" className="h-11 rounded-lg border border-zinc-200 px-3" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-3 py-3">الفاتورة</th>
                <th className="px-3 py-3">العميل</th>
                <th className="px-3 py-3">السيارة</th>
                <th className="px-3 py-3">الخدمات</th>
                <th className="px-3 py-3">العامل</th>
                <th className="px-3 py-3">الدفع</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3">الإجمالي</th>
                <th className="px-3 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-3 py-3 font-bold">{order.invoiceNumber}</td>
                  <td className="px-3 py-3">{order.customerName}</td>
                  <td className="px-3 py-3">{order.plateNumber}</td>
                  <td className="px-3 py-3">{order.services.map((service) => service.name).join("، ")}</td>
                  <td className="px-3 py-3">{order.workerName}</td>
                  <td className="px-3 py-3">{paymentLabels[order.paymentMethod]}</td>
                  <td className="px-3 py-3"><StatusBadge className={statusClass(order.status)}>{statusLabels[order.status]}</StatusBadge></td>
                  <td className="px-3 py-3 font-bold">{formatCurrency(order.total, settings.currency)}</td>
                  <td className="px-3 py-3"><div className="flex gap-2"><button className="rounded-lg border border-zinc-200 px-3 py-2 font-semibold">تعديل</button><ConfirmDeleteButton /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
