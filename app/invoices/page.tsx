import { AppShell } from "@/components/app-shell";
import { InvoiceActions } from "@/components/invoice-actions";
import { Card, SearchBar } from "@/components/ui";
import { getOrders, getSettings } from "@/lib/data/queries";
import { formatCurrency, formatDate, paymentLabels, statusLabels } from "@/lib/format";

export default async function InvoicesPage() {
  const [orders, settings] = await Promise.all([getOrders(), getSettings()]);
  const invoice = orders[0];
  const whatsappText = encodeURIComponent(
    `فاتورة ${settings.shopName}\nرقم: ${invoice.invoiceNumber}\nالعميل: ${invoice.customerName}\nالسيارة: ${invoice.plateNumber}\nالإجمالي: ${formatCurrency(invoice.total, settings.currency)}`
  );

  return (
    <AppShell title="الفواتير">
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="no-print">
          <SearchBar placeholder="بحث برقم الفاتورة أو اسم العميل" />
          <div className="mt-4 space-y-2">
            {orders.map((order) => (
              <a key={order.id} href="#invoice" className="block rounded-lg border border-zinc-200 p-3 transition hover:border-brand-red hover:bg-red-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{order.invoiceNumber}</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold">{statusLabels[order.status]}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{order.customerName} · {formatCurrency(order.total, settings.currency)}</p>
              </a>
            ))}
          </div>
        </Card>

        <section id="invoice" className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-soft">
          <div className="bg-brand-black p-5 text-white sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <img src={settings.logoUrl ?? "/logo.svg"} alt={settings.shopName} className="h-16 w-40 rounded-lg bg-white object-cover p-1" />
                <div>
                  <h2 className="text-2xl font-bold">{settings.shopName}</h2>
                  <p className="mt-1 text-sm text-white/75">{settings.address}</p>
                  <p className="mt-1 text-sm text-white/75">{settings.phone}</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4 text-left">
                <p className="text-sm text-white/70">رقم الفاتورة</p>
                <p className="mt-1 text-2xl font-bold tracking-wide">{invoice.invoiceNumber}</p>
                <p className="mt-2 text-sm text-white/70">{formatDate(invoice.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-200 bg-red-50 px-5 py-3 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-red-800">
              <span>طريقة الدفع: {paymentLabels[invoice.paymentMethod]}</span>
              <span>حالة الطلب: {statusLabels[invoice.status]}</span>
              <span>العامل المنفذ: {invoice.workerName}</span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-bold text-zinc-500">بيانات العميل</p>
                <p className="mt-2 text-xl font-bold">{invoice.customerName}</p>
                <p className="mt-1 text-sm text-zinc-600">{invoice.customerPhone}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-bold text-zinc-500">بيانات السيارة</p>
                <p className="mt-2 text-xl font-bold">{invoice.vehicleLabel}</p>
                <p className="mt-1 text-sm text-zinc-600">رقم اللوحة: {invoice.plateNumber}</p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[620px] overflow-hidden rounded-lg text-right text-sm">
                <thead className="bg-brand-black text-white">
                  <tr>
                    <th className="px-4 py-3">الخدمة</th>
                    <th className="px-4 py-3">مدة التنفيذ</th>
                    <th className="px-4 py-3 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 0 ? "bg-zinc-50" : "bg-white"}>
                      <td className="px-4 py-4 font-bold">{service.name}</td>
                      <td className="px-4 py-4">{service.durationMinutes} دقيقة</td>
                      <td className="px-4 py-4 text-left font-bold">{formatCurrency(service.price, settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-bold text-zinc-500">ملاحظات الفاتورة</p>
                <p className="mt-2 leading-7 text-zinc-700">{invoice.notes ?? "لا توجد ملاحظات على هذه الفاتورة."}</p>
              </div>
              <div className="rounded-lg bg-brand-black p-5 text-white">
                <div className="flex justify-between text-sm text-white/75">
                  <span>الإجمالي قبل الخصم</span>
                  <span>{formatCurrency(invoice.subtotal, settings.currency)}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-white/75">
                  <span>الخصم</span>
                  <span>{formatCurrency(invoice.discount, settings.currency)}</span>
                </div>
                <div className="mt-4 border-t border-white/15 pt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>الصافي</span>
                    <span>{formatCurrency(invoice.total, settings.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center">
              <p className="font-bold">{settings.invoiceFooter}</p>
              <p className="mt-1 text-sm text-zinc-500">{settings.workingHours}</p>
            </div>

            <InvoiceActions whatsappText={whatsappText} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
