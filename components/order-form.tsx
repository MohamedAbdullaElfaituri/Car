"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Printer, Save } from "lucide-react";
import { Customer, Service, Vehicle, AppUser, PaymentMethod, OrderStatus } from "@/lib/types";
import { Field, inputClass, textareaClass } from "@/components/ui";
import { formatCurrency } from "@/lib/format";

export function OrderForm({
  customers,
  vehicles,
  services,
  workers,
  currency,
  action
}: {
  customers: Customer[];
  vehicles: Vehicle[];
  services: Service[];
  workers: AppUser[];
  currency: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id ?? "");
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>([services[2]?.id].filter(Boolean));
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<OrderStatus>("new");

  const customerVehicles = vehicles.filter((vehicle) => vehicle.customerId === selectedCustomer);
  const selectedServices = services.filter((service) => serviceIds.includes(service.id));
  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const total = Math.max(subtotal - discount, 0);

  const whatsappText = useMemo(() => {
    const customer = customers.find((item) => item.id === selectedCustomer);
    const vehicle = vehicles.find((item) => item.id === selectedVehicle);
    return encodeURIComponent(`فاتورة بوسنينه لخدمات السيارات\nالعميل: ${customer?.name ?? ""}\nالسيارة: ${vehicle?.plateNumber ?? ""}\nالإجمالي: ${formatCurrency(total, currency)}`);
  }, [currency, customers, selectedCustomer, selectedVehicle, total, vehicles]);

  function toggleService(id: string) {
    setServiceIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-bold">بيانات العميل والسيارة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="اختيار العميل">
              <select
                name="customerId"
                className={inputClass}
                value={selectedCustomer}
                onChange={(event) => {
                  setSelectedCustomer(event.target.value);
                  setSelectedVehicle(vehicles.find((vehicle) => vehicle.customerId === event.target.value)?.id ?? "");
                }}
              >
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>)}
              </select>
            </Field>
            <Field label="إنشاء عميل سريع">
              <input className={inputClass} placeholder="اسم ورقم هاتف العميل الجديد" disabled />
            </Field>
            <Field label="اختيار السيارة">
              <select name="vehicleId" className={inputClass} value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)}>
                {(customerVehicles.length ? customerVehicles : vehicles).map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber} - {vehicle.type} {vehicle.model}</option>
                ))}
              </select>
            </Field>
            <Field label="إنشاء سيارة سريع">
              <input className={inputClass} placeholder="اللوحة، النوع، اللون" disabled />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-bold">الخدمات المختارة</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {services.filter((service) => service.active).map((service) => (
              <label key={service.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 hover:border-brand-red">
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  className="mt-1 h-4 w-4 accent-brand-red"
                  checked={serviceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                />
                <span>
                  <span className="block font-bold">{service.name}</span>
                  <span className="block text-sm text-zinc-500">{formatCurrency(service.price, currency)} · {service.durationMinutes} دقيقة</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-bold">تفاصيل المعاملة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="العامل المسؤول">
              <select name="workerId" className={inputClass}>
                {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
              </select>
            </Field>
            <Field label="طريقة الدفع">
              <select name="paymentMethod" className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                <option value="cash">كاش</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل</option>
                <option value="unpaid">غير مدفوع</option>
              </select>
            </Field>
            <Field label="حالة الطلب">
              <select name="status" className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
                <option value="new">جديد</option>
                <option value="washing">قيد الغسيل</option>
                <option value="ready">جاهز</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </Field>
            <Field label="خصم أو تعديل يدوي">
              <input name="discount" className={inputClass} type="number" min="0" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
            </Field>
            <Field label="وقت بداية الخدمة">
              <input name="startedAt" className={inputClass} type="datetime-local" />
            </Field>
            <Field label="وقت نهاية الخدمة">
              <input name="endedAt" className={inputClass} type="datetime-local" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="ملاحظات">
                <textarea name="notes" className={textareaClass} placeholder="أي ملاحظات تظهر في المعاملة والفاتورة" />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-28 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">ملخص السعر</h2>
          <div className="mt-4 space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between gap-3 text-sm">
                <span>{service.name}</span>
                <span className="font-bold">{formatCurrency(service.price, currency)}</span>
              </div>
            ))}
            <div className="border-t border-zinc-100 pt-3 text-sm">
              <div className="flex justify-between"><span>الإجمالي قبل الخصم</span><span>{formatCurrency(subtotal, currency)}</span></div>
              <div className="mt-2 flex justify-between text-red-700"><span>الخصم</span><span>{formatCurrency(discount, currency)}</span></div>
              <div className="mt-3 flex justify-between text-xl font-bold"><span>الإجمالي</span><span>{formatCurrency(total, currency)}</span></div>
            </div>
          </div>
          <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-red font-bold text-white">
            <Save className="h-5 w-5" />
            حفظ المعاملة
          </button>
          <button type="button" onClick={() => window.print()} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 font-bold">
            <Printer className="h-5 w-5" />
            طباعة فاتورة
          </button>
          <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 font-bold text-emerald-700">
            <MessageCircle className="h-5 w-5" />
            مشاركة واتساب
          </a>
        </div>
      </aside>
    </form>
  );
}
