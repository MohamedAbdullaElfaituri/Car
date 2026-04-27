import { customers, services, settings, users, vehicles, orders, auditLogs } from "@/lib/data/mock";
import { OrderStatus, PaymentMethod } from "@/lib/types";

export async function getDashboardStats() {
  const todayOrders = orders.filter((order) => order.createdAt.startsWith("2026-04-27"));
  const monthOrders = orders.filter((order) => order.createdAt.startsWith("2026-04"));
  const completed = orders.filter((order) => order.status === "completed");
  const inProgress = orders.filter((order) => ["new", "washing", "ready"].includes(order.status));
  const topService = [...services].sort((a, b) => b.soldCount - a.soldCount)[0];
  const topWorker = [...users].filter((user) => user.role === "worker").sort((a, b) => b.transactionsCount - a.transactionsCount)[0];

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
    dailyChart: [
      { label: "السبت", value: 430 },
      { label: "الأحد", value: 510 },
      { label: "الاثنين", value: 365 },
      { label: "الثلاثاء", value: 720 },
      { label: "الأربعاء", value: 610 },
      { label: "الخميس", value: 490 },
      { label: "اليوم", value: todayOrders.reduce((sum, order) => sum + order.total, 0) }
    ],
    monthlyChart: [
      { label: "يناير", value: 8200 },
      { label: "فبراير", value: 9300 },
      { label: "مارس", value: 10450 },
      { label: "أبريل", value: monthOrders.reduce((sum, order) => sum + order.total, 0) }
    ]
  };
}

export async function getCustomers() {
  return customers.filter((customer) => !customer.deletedAt);
}

export async function getVehicles() {
  return vehicles.filter((vehicle) => !vehicle.deletedAt);
}

export async function getServices() {
  return services.filter((service) => !service.deletedAt);
}

export async function getOrders() {
  return orders.filter((order) => !order.deletedAt);
}

export async function getWorkers() {
  return users.filter((user) => user.role === "worker");
}

export async function getSettings() {
  return settings;
}

export async function getAuditLogs() {
  return auditLogs;
}

export function filterOrders(params: { status?: OrderStatus; paymentMethod?: PaymentMethod; workerId?: string }) {
  return orders.filter((order) => {
    if (params.status && order.status !== params.status) return false;
    if (params.paymentMethod && order.paymentMethod !== params.paymentMethod) return false;
    if (params.workerId && order.workerId !== params.workerId) return false;
    return true;
  });
}
