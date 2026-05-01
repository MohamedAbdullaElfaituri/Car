"use client";

import { useMemo, useState } from "react";
import { FileText, MessageCircle, Save } from "lucide-react";
import Link from "next/link";
import { AppUser, Customer, OrderStatus, PaymentMethod, Service, Vehicle } from "@/lib/types";
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
  const firstServiceId = services.find((service) => service.active)?.id;
  const [serviceIds, setServiceIds] = useState<string[]>(firstServiceId ? [firstServiceId] : []);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<OrderStatus>("new");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

  const selectedServices = services.filter((service) => serviceIds.includes(service.id));
  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const total = Math.max(subtotal - safeDiscount, 0);

  const customerSuggestions = customers.slice(0, 50);
  const vehicleSuggestions = vehicles.slice(0, 50);

  const whatsappText = useMemo(() => {
    return encodeURIComponent(
      `فاتورة خدمات السيارات\nالعميل: ${customerName}\nالسيارة: ${plateNumber}\nالإجمالي: ${formatCurrency(total, currency)}`
    );
  }, [currency, customerName, plateNumber, total]);

  function toggleService(id: string) {
    setServiceIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function fillCustomerByPhone(phone: string) {
    setCustomerPhone(phone);
    const customer = customers.find((item) => item.phone === phone);
    if (customer) setCustomerName(customer.name);
  }

  function fillVehicleByPlate(plate: string) {
    setPlateNumber(plate);
    const vehicle = vehicles.find((item) => item.plateNumber === plate);
    if (!vehicle) return;
    setVehicleType(vehicle.type);
    setVehicleModel(vehicle.model);
    setVehicleColor(vehicle.color);
    const customer = customers.find((item) => item.id === vehicle.customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
    }
  }

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-bold">بيانات العميل والسيارة</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="اسم العميل">
              <input name="customerName" className={inputClass} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="اسم العميل" required />
            </Field>
            <Field label="رقم الهاتف">
              <input
                name="customerPhone"
                className={inputClass}
                value={customerPhone}
                onChange={(event) => fillCustomerByPhone(event.target.value)}
                placeholder="09xxxxxxxx"
                list="customer-phone-list"
                required
              />
              <datalist id="customer-phone-list">
                {customerSuggestions.map((customer) => <option key={customer.id} value={customer.phone}>{customer.name}</option>)}
              </datalist>
            </Field>
            <Field label="رقم اللوحة">
              <input
                name="plateNumber"
                className={inputClass}
                value={plateNumber}
                onChange={(event) => fillVehicleByPlate(event.target.value)}
                placeholder="5-123456"
                list="vehicle-plate-list"
                required
              />
              <datalist id="vehicle-plate-list">
                {vehicleSuggestions.map((vehicle) => <option key={vehicle.id} value={vehicle.plateNumber}>{vehicle.customerName}</option>)}
              </datalist>
            </Field>
            <Field label="نوع السيارة">
              <input name="vehicleType" className={inputClass} value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} placeholder="تويوتا" required />
            </Field>
            <Field label="الموديل">
              <input name="vehicleModel" className={inputClass} value={vehicleModel} onChange={(event) => setVehicleModel(event.target.value)} placeholder="كامري 2022" required />
            </Field>
            <Field label="اللون">
              <input name="vehicleColor" className={inputClass} value={vehicleColor} onChange={(event) => setVehicleColor(event.target.value)} placeholder="أبيض" required />
            </Field>
            <Field label="ملاحظات العميل">
              <textarea name="customerNotes" className={textareaClass} placeholder="اختياري" />
            </Field>
            <Field label="ملاحظات السيارة">
              <textarea name="vehicleNotes" className={textareaClass} placeholder="اختياري" />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-bold">الخدمات المختارة</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {services.filter((service) => service.active).map((service) => (
              <label key={service.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 transition hover:border-brand-red">
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
              <select name="workerId" className={inputClass} required>
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
            <Field label="الخصم">
              <input name="discount" className={inputClass} type="number" min="0" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
            </Field>
            <Field label="وقت بداية الخدمة">
              <input name="startedAt" className={inputClass} type="datetime-local" />
            </Field>
            <Field label="وقت نهاية الخدمة">
              <input name="endedAt" className={inputClass} type="datetime-local" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="ملاحظات الفاتورة">
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
            {selectedServices.length ? selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between gap-3 text-sm">
                <span>{service.name}</span>
                <span className="font-bold">{formatCurrency(service.price, currency)}</span>
              </div>
            )) : <p className="text-sm text-zinc-500">اختر خدمة واحدة على الأقل</p>}
            <div className="border-t border-zinc-100 pt-3 text-sm">
              <div className="flex justify-between"><span>الإجمالي قبل الخصم</span><span>{formatCurrency(subtotal, currency)}</span></div>
              <div className="mt-2 flex justify-between text-red-700"><span>الخصم</span><span>{formatCurrency(safeDiscount, currency)}</span></div>
              <div className="mt-3 flex justify-between text-xl font-bold"><span>الإجمالي</span><span>{formatCurrency(total, currency)}</span></div>
            </div>
          </div>
          <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-red font-bold text-white transition hover:bg-red-700">
            <Save className="h-5 w-5" />
            حفظ المعاملة
          </button>
          <Link href="/invoices" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 font-bold">
            <FileText className="h-5 w-5" />
            عرض الفواتير
          </Link>
          <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 font-bold text-emerald-700">
            <MessageCircle className="h-5 w-5" />
            مشاركة واتساب
          </a>
        </div>
      </aside>
    </form>
  );
}
