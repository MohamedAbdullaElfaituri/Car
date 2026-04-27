import { z } from "zod";

export const phoneSchema = z.string().min(7, "رقم الهاتف قصير").max(20, "رقم الهاتف طويل");

export const customerSchema = z.object({
  name: z.string().min(2, "اكتب اسم العميل"),
  phone: phoneSchema,
  notes: z.string().optional()
});

export const vehicleSchema = z.object({
  customerId: z.string().min(1, "اختر العميل"),
  plateNumber: z.string().min(2, "اكتب رقم اللوحة"),
  type: z.string().min(2, "اكتب نوع السيارة"),
  model: z.string().min(2, "اكتب الموديل"),
  color: z.string().min(2, "اكتب اللون"),
  notes: z.string().optional()
});

export const serviceSchema = z.object({
  name: z.string().min(2, "اكتب اسم الخدمة"),
  price: z.coerce.number().min(0, "السعر غير صحيح"),
  durationMinutes: z.coerce.number().min(1, "المدة غير صحيحة"),
  active: z.boolean().default(true),
  description: z.string().optional()
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "اختر العميل"),
  vehicleId: z.string().min(1, "اختر السيارة"),
  serviceIds: z.array(z.string()).min(1, "اختر خدمة واحدة على الأقل"),
  discount: z.coerce.number().min(0).default(0),
  workerId: z.string().min(1, "اختر العامل"),
  paymentMethod: z.enum(["cash", "card", "transfer", "unpaid"]),
  status: z.enum(["new", "washing", "ready", "completed", "cancelled"]),
  notes: z.string().optional()
});
