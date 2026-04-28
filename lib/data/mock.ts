import { AppUser, AuditLog, Customer, Service, Setting, Vehicle, WashOrder } from "@/lib/types";

export const settings: Setting = {
  shopName: "بوسنينه لخدمات السيارات",
  phone: "091-555-4422",
  address: "طرابلس، ليبيا",
  currency: "د.ل",
  taxRate: 0,
  invoiceFooter: "شكراً لاختياركم بوسنينه لخدمات السيارات",
  workingHours: "السبت - الخميس، 09:00 ص - 10:00 م",
  logoUrl: "/logo.jpeg",
  primaryColor: "#d71920",
  workerCanViewToday: true,
  managerCanExportReports: true
};

export const users: AppUser[] = [
  { id: "u1", name: "محمد بوسنينه", phone: "0911111111", email: "manager@bosnina.local", role: "manager", active: true, transactionsCount: 64, revenue: 5180, commissionRate: 0 },
  { id: "u2", name: "أحمد سالم", phone: "0922222222", email: "ahmed@bosnina.local", role: "worker", active: true, transactionsCount: 41, revenue: 3310, commissionRate: 12 },
  { id: "u3", name: "علي منصور", phone: "0933333333", email: "ali@bosnina.local", role: "worker", active: true, transactionsCount: 57, revenue: 4265, commissionRate: 15 },
  { id: "u4", name: "سالم فرج", phone: "0944444444", email: "salem@bosnina.local", role: "worker", active: false, transactionsCount: 16, revenue: 980, commissionRate: 10 }
];

export const customers: Customer[] = [
  { id: "c1", name: "خالد الزوي", phone: "0912345678", notes: "يفضل الاستلام مساءً", createdAt: "2026-04-02T10:30:00.000Z" },
  { id: "c2", name: "مريم الهاشمي", phone: "0923456789", notes: "عميلة دائمة", createdAt: "2026-04-05T12:10:00.000Z" },
  { id: "c3", name: "يوسف الشريف", phone: "0934567890", createdAt: "2026-04-12T16:20:00.000Z" },
  { id: "c4", name: "عبدالله رمضان", phone: "0919876543", notes: "سيارة سوداء حساسة للخدوش", createdAt: "2026-04-22T08:45:00.000Z" }
];

export const vehicles: Vehicle[] = [
  { id: "v1", customerId: "c1", customerName: "خالد الزوي", plateNumber: "5-123456", type: "تويوتا", model: "كامري 2022", color: "أبيض" },
  { id: "v2", customerId: "c2", customerName: "مريم الهاشمي", plateNumber: "11-884221", type: "كيا", model: "سبورتاج 2021", color: "أحمر" },
  { id: "v3", customerId: "c3", customerName: "يوسف الشريف", plateNumber: "7-662019", type: "هيونداي", model: "سوناتا 2020", color: "فضي" },
  { id: "v4", customerId: "c4", customerName: "عبدالله رمضان", plateNumber: "3-449900", type: "مرسيدس", model: "E300 2023", color: "أسود" }
];

export const services: Service[] = [
  { id: "s1", name: "غسيل خارجي", price: 25, durationMinutes: 20, active: true, description: "غسيل جسم السيارة وتجفيف", soldCount: 76 },
  { id: "s2", name: "غسيل داخلي", price: 30, durationMinutes: 25, active: true, description: "تنظيف داخلي سريع", soldCount: 65 },
  { id: "s3", name: "غسيل خارجي وداخلي", price: 50, durationMinutes: 40, active: true, description: "الباقة اليومية الأكثر طلباً", soldCount: 112 },
  { id: "s4", name: "غسيل محرك", price: 45, durationMinutes: 35, active: true, soldCount: 19 },
  { id: "s5", name: "تلميع داخلي", price: 120, durationMinutes: 90, active: true, soldCount: 22 },
  { id: "s6", name: "تلميع خارجي", price: 150, durationMinutes: 120, active: true, soldCount: 18 },
  { id: "s7", name: "تنظيف فرش", price: 80, durationMinutes: 70, active: true, soldCount: 31 },
  { id: "s8", name: "تنظيف بخار", price: 95, durationMinutes: 75, active: true, soldCount: 28 },
  { id: "s9", name: "تشميع", price: 60, durationMinutes: 45, active: true, soldCount: 24 },
  { id: "s10", name: "خدمة خاصة", price: 100, durationMinutes: 60, active: false, soldCount: 5 }
];

export const orders: WashOrder[] = [
  {
    id: "o1",
    invoiceNumber: "INV-20260427-001",
    customerId: "c1",
    customerName: "خالد الزوي",
    customerPhone: "0912345678",
    vehicleId: "v1",
    plateNumber: "5-123456",
    vehicleLabel: "تويوتا كامري 2022",
    services: [services[2], services[8]],
    subtotal: 110,
    discount: 10,
    total: 100,
    workerId: "u3",
    workerName: "علي منصور",
    paymentMethod: "cash",
    status: "completed",
    startedAt: "2026-04-27T07:15:00.000Z",
    endedAt: "2026-04-27T08:10:00.000Z",
    notes: "خصم عميل دائم",
    createdAt: "2026-04-27T07:10:00.000Z"
  },
  {
    id: "o2",
    invoiceNumber: "INV-20260427-002",
    customerId: "c2",
    customerName: "مريم الهاشمي",
    customerPhone: "0923456789",
    vehicleId: "v2",
    plateNumber: "11-884221",
    vehicleLabel: "كيا سبورتاج 2021",
    services: [services[0], services[1]],
    subtotal: 55,
    discount: 0,
    total: 55,
    workerId: "u2",
    workerName: "أحمد سالم",
    paymentMethod: "card",
    status: "ready",
    startedAt: "2026-04-27T09:00:00.000Z",
    createdAt: "2026-04-27T08:55:00.000Z"
  },
  {
    id: "o3",
    invoiceNumber: "INV-20260426-001",
    customerId: "c3",
    customerName: "يوسف الشريف",
    customerPhone: "0934567890",
    vehicleId: "v3",
    plateNumber: "7-662019",
    vehicleLabel: "هيونداي سوناتا 2020",
    services: [services[4], services[6]],
    subtotal: 200,
    discount: 20,
    total: 180,
    workerId: "u3",
    workerName: "علي منصور",
    paymentMethod: "transfer",
    status: "completed",
    startedAt: "2026-04-26T12:00:00.000Z",
    endedAt: "2026-04-26T14:20:00.000Z",
    createdAt: "2026-04-26T11:50:00.000Z"
  },
  {
    id: "o4",
    invoiceNumber: "INV-20260427-003",
    customerId: "c4",
    customerName: "عبدالله رمضان",
    customerPhone: "0919876543",
    vehicleId: "v4",
    plateNumber: "3-449900",
    vehicleLabel: "مرسيدس E300 2023",
    services: [services[5], services[8]],
    subtotal: 210,
    discount: 0,
    total: 210,
    workerId: "u2",
    workerName: "أحمد سالم",
    paymentMethod: "unpaid",
    status: "washing",
    startedAt: "2026-04-27T10:30:00.000Z",
    createdAt: "2026-04-27T10:20:00.000Z"
  }
];

export const auditLogs: AuditLog[] = [
  { id: "a1", userName: "محمد بوسنينه", action: "إضافة", entity: "خدمة", entityId: "s1", createdAt: "2026-04-20T09:00:00.000Z" },
  { id: "a2", userName: "أحمد سالم", action: "تعديل", entity: "معاملة", entityId: "o2", createdAt: "2026-04-27T09:30:00.000Z" },
  { id: "a3", userName: "علي منصور", action: "تحديث حالة", entity: "معاملة", entityId: "o4", createdAt: "2026-04-27T10:40:00.000Z" }
];
