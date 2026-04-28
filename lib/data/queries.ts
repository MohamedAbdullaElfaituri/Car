import { createClient } from "@/lib/supabase/server";
import {
  auditLogs as mockAuditLogs,
  customers as mockCustomers,
  orders as mockOrders,
  services as mockServices,
  settings as mockSettings,
  users as mockUsers,
  vehicles as mockVehicles
} from "@/lib/data/mock";
import { AppUser, AuditLog, Customer, OrderStatus, PaymentMethod, Service, Setting, Vehicle, WashOrder } from "@/lib/types";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getSupabase() {
  if (!hasSupabaseEnv()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

function mapSettings(row: any): Setting {
  return {
    shopName: row.shop_name,
    phone: row.phone ?? "",
    address: row.address ?? "",
    currency: row.currency ?? "د.ل",
    taxRate: Number(row.tax_rate ?? 0),
    invoiceFooter: row.invoice_footer ?? "",
    workingHours: row.working_hours ?? "",
    logoUrl: row.logo_url ?? "/logo.jpeg",
    primaryColor: row.primary_color ?? "#d71920",
    workerCanViewToday: Boolean(row.calculate_worker_commissions ?? true),
    managerCanExportReports: Boolean(row.reports_export_enabled ?? true)
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockCustomers.filter((customer) => !customer.deletedAt);

  const { data, error } = await supabase
    .from("customers")
    .select("id,name,phone,notes,created_at,deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return mockCustomers.filter((customer) => !customer.deletedAt);

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    deletedAt: row.deleted_at
  }));
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockVehicles.filter((vehicle) => !vehicle.deletedAt);

  const { data, error } = await supabase
    .from("vehicles")
    .select("id,customer_id,plate_number,vehicle_type,vehicle_model,color,notes,deleted_at,customers(name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return mockVehicles.filter((vehicle) => !vehicle.deletedAt);

  return data.map((row: any) => ({
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customers?.name ?? "عميل",
    plateNumber: row.plate_number,
    type: row.vehicle_type,
    model: row.vehicle_model,
    color: row.color,
    notes: row.notes ?? undefined,
    deletedAt: row.deleted_at
  }));
}

export async function getServices(): Promise<Service[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockServices.filter((service) => !service.deletedAt);

  const { data, error } = await supabase
    .from("services")
    .select("id,name,price,duration_minutes,active,description,deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return mockServices.filter((service) => !service.deletedAt);

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price ?? 0),
    durationMinutes: Number(row.duration_minutes ?? 0),
    active: Boolean(row.active),
    description: row.description ?? undefined,
    soldCount: 0,
    deletedAt: row.deleted_at
  }));
}

export async function getWorkers(): Promise<AppUser[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockUsers.filter((user) => user.role === "worker");

  const [{ data: workers, error }, { data: workerOrders }] = await Promise.all([
    supabase.from("workers").select("id,name,phone,commission_rate,active,deleted_at").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("wash_orders").select("worker_id,total").is("deleted_at", null)
  ]);

  if (error || !workers) return mockUsers.filter((user) => user.role === "worker");

  return workers.map((row: any) => {
    const relatedOrders = (workerOrders ?? []).filter((order: any) => order.worker_id === row.id);
    return {
      id: row.id,
      name: row.name,
      phone: row.phone ?? "",
      email: "",
      role: "worker",
      active: Boolean(row.active),
      transactionsCount: relatedOrders.length,
      revenue: relatedOrders.reduce((sum: number, order: any) => sum + Number(order.total ?? 0), 0),
      commissionRate: Number(row.commission_rate ?? 0)
    } satisfies AppUser;
  });
}

export async function getOrders(): Promise<WashOrder[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockOrders.filter((order) => !order.deletedAt);

  const { data, error } = await supabase
    .from("wash_orders")
    .select(
      `
      id,invoice_number,customer_id,vehicle_id,worker_id,subtotal,discount,total,payment_method,status,started_at,ended_at,notes,created_at,deleted_at,
      customers(name,phone),
      vehicles(plate_number,vehicle_type,vehicle_model),
      workers(name),
      wash_order_services(id,service_id,service_name,price,duration_minutes)
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return mockOrders.filter((order) => !order.deletedAt);

  return data.map((row: any) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customers?.name ?? "عميل",
    customerPhone: row.customers?.phone ?? "",
    vehicleId: row.vehicle_id,
    plateNumber: row.vehicles?.plate_number ?? "",
    vehicleLabel: `${row.vehicles?.vehicle_type ?? ""} ${row.vehicles?.vehicle_model ?? ""}`.trim(),
    services: (row.wash_order_services ?? []).map((service: any) => ({
      id: service.service_id ?? service.id,
      name: service.service_name,
      price: Number(service.price ?? 0),
      durationMinutes: Number(service.duration_minutes ?? 0),
      active: true,
      soldCount: 0
    })),
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
    workerId: row.worker_id ?? "",
    workerName: row.workers?.name ?? "",
    paymentMethod: row.payment_method,
    status: row.status,
    startedAt: row.started_at ?? row.created_at,
    endedAt: row.ended_at ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    deletedAt: row.deleted_at
  }));
}

export async function getSettings(): Promise<Setting> {
  const supabase = await getSupabase();
  if (!supabase) return mockSettings;

  const { data, error } = await supabase.from("settings").select("*").eq("id", true).maybeSingle();
  if (error || !data) return mockSettings;
  return mapSettings(data);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const supabase = await getSupabase();
  if (!supabase) return mockAuditLogs;

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,user_name,action,entity,entity_id,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return mockAuditLogs;

  return data.map((row: any) => ({
    id: row.id,
    userName: row.user_name ?? "المدير",
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id ?? "",
    createdAt: row.created_at
  }));
}

export async function getDashboardStats() {
  const [orders, services, workers] = await Promise.all([getOrders(), getServices(), getWorkers()]);
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = now.toISOString().slice(0, 7);
  const todayOrders = orders.filter((order) => order.createdAt.startsWith(todayKey));
  const monthOrders = orders.filter((order) => order.createdAt.startsWith(monthKey));
  const completed = orders.filter((order) => order.status === "completed");
  const inProgress = orders.filter((order) => ["new", "washing", "ready"].includes(order.status));

  const soldCountByService = new Map<string, number>();
  orders.forEach((order) => order.services.forEach((service) => soldCountByService.set(service.name, (soldCountByService.get(service.name) ?? 0) + 1)));
  const servicesWithCounts = services.map((service) => ({ ...service, soldCount: soldCountByService.get(service.name) ?? service.soldCount }));
  const topService = [...servicesWithCounts].sort((a, b) => b.soldCount - a.soldCount)[0] ?? mockServices[0];
  const topWorker = [...workers].sort((a, b) => b.transactionsCount - a.transactionsCount)[0] ?? mockUsers.find((user) => user.role === "worker")!;

  return {
    todayIncome: todayOrders.reduce((sum, order) => sum + order.total, 0),
    monthIncome: monthOrders.reduce((sum, order) => sum + order.total, 0),
    todayCars: todayOrders.length,
    monthCars: monthOrders.length,
    completedServices: completed.length,
    inProgressServices: inProgress.length,
    topService,
    topWorker,
    latestOrders: orders.slice(0, 6),
    dailyChart: buildDailyChart(orders),
    monthlyChart: buildMonthlyChart(orders)
  };
}

function buildDailyChart(orders: WashOrder[]) {
  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "اليوم"];
  return days.map((label, index) => ({
    label,
    value: orders.filter((order) => new Date(order.createdAt).getDay() === index).reduce((sum, order) => sum + order.total, 0)
  }));
}

function buildMonthlyChart(orders: WashOrder[]) {
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return months.slice(0, new Date().getMonth() + 1).map((label, index) => ({
    label,
    value: orders.filter((order) => new Date(order.createdAt).getMonth() === index).reduce((sum, order) => sum + order.total, 0)
  }));
}

export async function filterOrders(params: { status?: OrderStatus; paymentMethod?: PaymentMethod; workerId?: string }) {
  const orders = await getOrders();
  return orders.filter((order) => {
    if (params.status && order.status !== params.status) return false;
    if (params.paymentMethod && order.paymentMethod !== params.paymentMethod) return false;
    if (params.workerId && order.workerId !== params.workerId) return false;
    return true;
  });
}
