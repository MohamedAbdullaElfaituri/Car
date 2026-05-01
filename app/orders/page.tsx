import { AppShell } from "@/components/app-shell";
import { Card, inputClass, PrimaryButton, SearchBar, StatusBadge, textareaClass } from "@/components/ui";
import { OrderForm } from "@/components/order-form";
import { DeleteRecordForm } from "@/components/record-actions";
import { getCustomers, getOrders, getServices, getSettings, getVehicles, getWorkers } from "@/lib/data/queries";
import { formatCurrency, paymentLabels, statusClass, statusLabels } from "@/lib/format";
import { createOrderAction, softDeleteAction, updateOrderAction } from "@/app/actions";

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

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
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <a className="rounded-lg border border-zinc-200 px-3 py-2 font-semibold transition hover:bg-zinc-50" href={`/invoices?id=${order.id}`}>الفاتورة</a>
                      <details className="relative">
                        <summary className="list-none rounded-lg border border-zinc-200 px-3 py-2 font-semibold transition hover:bg-zinc-50">تعديل</summary>
                        <form action={updateOrderAction} className="fixed left-4 top-24 z-50 grid max-h-[calc(100vh-7rem)] w-[min(92vw,560px)] overflow-y-auto gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-right shadow-lg sm:grid-cols-2">
                          <input type="hidden" name="id" value={order.id} />
                          <select name="customerId" className={inputClass} defaultValue={order.customerId} required>
                            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                          </select>
                          <select name="vehicleId" className={inputClass} defaultValue={order.vehicleId} required>
                            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber} - {vehicle.type} {vehicle.model}</option>)}
                          </select>
                          <select name="workerId" className={inputClass} defaultValue={order.workerId} required>
                            {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                          </select>
                          <select name="paymentMethod" className={inputClass} defaultValue={order.paymentMethod}>
                            <option value="cash">كاش</option>
                            <option value="card">بطاقة</option>
                            <option value="transfer">تحويل</option>
                            <option value="unpaid">غير مدفوع</option>
                          </select>
                          <select name="status" className={inputClass} defaultValue={order.status}>
                            <option value="new">جديد</option>
                            <option value="washing">قيد الغسيل</option>
                            <option value="ready">جاهز</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                          <input name="discount" className={inputClass} type="number" min="0" step="0.01" defaultValue={order.discount} />
                          <input name="startedAt" className={inputClass} type="datetime-local" defaultValue={toDateTimeLocal(order.startedAt)} />
                          <input name="endedAt" className={inputClass} type="datetime-local" defaultValue={toDateTimeLocal(order.endedAt)} />
                          <div className="sm:col-span-2 grid gap-2 rounded-lg border border-zinc-100 p-2">
                            {services.filter((service) => service.active || order.services.some((selected) => selected.id === service.id)).map((service) => (
                              <label key={service.id} className="flex items-center gap-2 text-sm font-semibold">
                                <input
                                  type="checkbox"
                                  name="serviceIds"
                                  value={service.id}
                                  defaultChecked={order.services.some((selected) => selected.id === service.id)}
                                  className="h-4 w-4 accent-brand-red"
                                />
                                {service.name} - {formatCurrency(service.price, settings.currency)}
                              </label>
                            ))}
                          </div>
                          <textarea name="notes" className={`${textareaClass} sm:col-span-2`} defaultValue={order.notes ?? ""} />
                          <button className="h-10 rounded-lg bg-brand-black font-bold text-white sm:col-span-2">حفظ التعديل</button>
                        </form>
                      </details>
                      <DeleteRecordForm action={softDeleteAction} table="wash_orders" id={order.id} path="/orders" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

