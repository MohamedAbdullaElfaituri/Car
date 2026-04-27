export type Role = "manager" | "worker";

export type PaymentMethod = "cash" | "card" | "transfer" | "unpaid";
export type OrderStatus = "new" | "washing" | "ready" | "completed" | "cancelled";

export type AppUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  active: boolean;
  transactionsCount: number;
  revenue: number;
  commissionRate: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
  deletedAt?: string | null;
};

export type Vehicle = {
  id: string;
  customerId: string;
  customerName: string;
  plateNumber: string;
  type: string;
  model: string;
  color: string;
  notes?: string;
  deletedAt?: string | null;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  description?: string;
  soldCount: number;
  deletedAt?: string | null;
};

export type WashOrder = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  plateNumber: string;
  vehicleLabel: string;
  services: Service[];
  subtotal: number;
  discount: number;
  total: number;
  workerId: string;
  workerName: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  deletedAt?: string | null;
};

export type Setting = {
  shopName: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  invoiceFooter: string;
  workingHours: string;
  logoUrl?: string;
  primaryColor: string;
  workerCanViewToday: boolean;
  managerCanExportReports: boolean;
};

export type AuditLog = {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
};
