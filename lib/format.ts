import { OrderStatus, PaymentMethod, Role } from "@/lib/types";

export function formatCurrency(value: number, currency = "د.ل") {
  return `${value.toLocaleString("ar-LY", { maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-LY", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export const roleLabels: Record<Role, string> = {
  manager: "المدير",
  worker: "عامل"
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: "كاش",
  card: "بطاقة",
  transfer: "تحويل",
  unpaid: "غير مدفوع"
};

export const statusLabels: Record<OrderStatus, string> = {
  new: "جديد",
  washing: "قيد الغسيل",
  ready: "جاهز",
  completed: "مكتمل",
  cancelled: "ملغي"
};

export function statusClass(status: OrderStatus) {
  return {
    new: "bg-zinc-100 text-zinc-800",
    washing: "bg-amber-100 text-amber-800",
    ready: "bg-sky-100 text-sky-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800"
  }[status];
}
