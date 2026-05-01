import { OrderStatus, PaymentMethod, Role } from "@/lib/types";

export function normalizeArabicText(value: unknown, fallback = "") {
  const text = String(value ?? fallback);
  if (!/[ØÙÂâ]/.test(text)) return text;

  try {
    const bytes = Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder("utf-8").decode(bytes).replace(/Â·/g, "·").replace(/â€¢/g, "•");
  } catch {
    return text;
  }
}

export function formatCurrency(value: number, currency = "د.ل") {
  return `${value.toLocaleString("ar-LY", { maximumFractionDigits: 2 })} ${normalizeArabicText(currency, "د.ل")}`;
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
