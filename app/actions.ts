"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clearDataCache } from "@/lib/data/queries";
import { customerSchema, orderSchema, serviceSchema, vehicleSchema } from "@/lib/validation";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function getManagerId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const managerId = data.user?.id ?? null;
  const admin = createAdminClient();

  if (admin && managerId) {
    const { data: profile } = await admin
      .from("users")
      .select("id,role,active")
      .eq("id", managerId)
      .eq("role", "manager")
      .eq("active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (!profile) {
      throw new Error("Manager profile was not found or is inactive.");
    }
  }

  return { supabase: admin ?? supabase, managerId };
}

function nullableDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return text ? new Date(text).toISOString() : null;
}

function revalidatePaths(...paths: string[]) {
  clearDataCache();
  [...new Set(paths)].forEach((path) => revalidatePath(path));
}

async function resolveOrderCustomer(formData: FormData, supabase: any, managerId: string | null) {
  const existingId = String(formData.get("customerId") ?? "");
  if (existingId) return existingId;

  const parsed = customerSchema.safeParse({
    name: formData.get("customerName"),
    phone: formData.get("customerPhone"),
    notes: formData.get("customerNotes")
  });
  if (!parsed.success) return "";

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", parsed.data.phone)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingCustomer?.id) return existingCustomer.id;

  const { data: customer } = await supabase
    .from("customers")
    .insert({ ...parsed.data, created_by: managerId })
    .select("id")
    .single();

  return customer?.id ?? "";
}

async function resolveOrderVehicle(formData: FormData, supabase: any, managerId: string | null, customerId: string) {
  const existingId = String(formData.get("vehicleId") ?? "");
  if (existingId) return existingId;

  const parsed = vehicleSchema.safeParse({
    customerId,
    plateNumber: formData.get("plateNumber"),
    type: formData.get("vehicleType"),
    model: formData.get("vehicleModel"),
    color: formData.get("vehicleColor"),
    notes: formData.get("vehicleNotes")
  });
  if (!parsed.success) return "";

  const { data: existingVehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("plate_number", parsed.data.plateNumber)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingVehicle?.id) return existingVehicle.id;

  const { data: vehicle } = await supabase
    .from("vehicles")
    .insert({
      customer_id: customerId,
      plate_number: parsed.data.plateNumber,
      vehicle_type: parsed.data.type,
      vehicle_model: parsed.data.model,
      color: parsed.data.color,
      notes: parsed.data.notes,
      created_by: managerId
    })
    .select("id")
    .single();

  return vehicle?.id ?? "";
}

export async function createCustomerAction(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes")
  });
  if (!parsed.success) return;

  const { supabase, managerId } = await getManagerId();
  await supabase.from("customers").insert({ ...parsed.data, created_by: managerId });
  clearDataCache();
  revalidatePath("/customers");
  revalidatePath("/orders");
}

export async function updateCustomerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes")
  });
  if (!id || !parsed.success) return;

  const { supabase } = await getManagerId();
  await supabase
    .from("customers")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  revalidatePaths("/customers", "/orders", "/invoices", "/dashboard");
}

export async function createVehicleAction(formData: FormData) {
  const parsed = vehicleSchema.safeParse({
    customerId: formData.get("customerId"),
    plateNumber: formData.get("plateNumber"),
    type: formData.get("type"),
    model: formData.get("model"),
    color: formData.get("color"),
    notes: formData.get("notes")
  });
  if (!parsed.success) return;

  const { supabase, managerId } = await getManagerId();
  await supabase.from("vehicles").insert({
    customer_id: parsed.data.customerId,
    plate_number: parsed.data.plateNumber,
    vehicle_type: parsed.data.type,
    vehicle_model: parsed.data.model,
    color: parsed.data.color,
    notes: parsed.data.notes,
    created_by: managerId
  });
  clearDataCache();
  revalidatePath("/vehicles");
  revalidatePath("/orders");
}

export async function updateVehicleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = vehicleSchema.safeParse({
    customerId: formData.get("customerId"),
    plateNumber: formData.get("plateNumber"),
    type: formData.get("type"),
    model: formData.get("model"),
    color: formData.get("color"),
    notes: formData.get("notes")
  });
  if (!id || !parsed.success) return;

  const { supabase } = await getManagerId();
  await supabase
    .from("vehicles")
    .update({
      customer_id: parsed.data.customerId,
      plate_number: parsed.data.plateNumber,
      vehicle_type: parsed.data.type,
      vehicle_model: parsed.data.model,
      color: parsed.data.color,
      notes: parsed.data.notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);
  revalidatePaths("/vehicles", "/orders", "/invoices", "/dashboard");
}

export async function createServiceAction(formData: FormData) {
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    active: formData.get("active") === "true",
    description: formData.get("description")
  });
  if (!parsed.success) return;

  const { supabase, managerId } = await getManagerId();
  await supabase.from("services").insert({
    name: parsed.data.name,
    price: parsed.data.price,
    duration_minutes: parsed.data.durationMinutes,
    active: parsed.data.active,
    description: parsed.data.description,
    created_by: managerId
  });
  clearDataCache();
  revalidatePath("/services");
  revalidatePath("/orders");
}

export async function updateServiceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    active: formData.get("active") === "true",
    description: formData.get("description")
  });
  if (!id || !parsed.success) return;

  const { supabase } = await getManagerId();
  await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      price: parsed.data.price,
      duration_minutes: parsed.data.durationMinutes,
      active: parsed.data.active,
      description: parsed.data.description,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);
  revalidatePaths("/services", "/orders", "/invoices", "/dashboard", "/reports");
}

export async function createWorkerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const commissionRate = Number(formData.get("commissionRate") ?? 0);
  const active = formData.get("active") === "true";
  if (!name) return;

  const { supabase, managerId } = await getManagerId();
  await supabase.from("workers").insert({
    name,
    phone,
    commission_rate: commissionRate,
    active,
    created_by: managerId
  });
  clearDataCache();
  revalidatePath("/workers");
  revalidatePath("/orders");
}

export async function updateWorkerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const commissionRate = Number(formData.get("commissionRate") ?? 0);
  const active = formData.get("active") === "true";
  if (!id || !name) return;

  const { supabase } = await getManagerId();
  await supabase
    .from("workers")
    .update({
      name,
      phone,
      commission_rate: Math.min(Math.max(commissionRate, 0), 100),
      active,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);
  revalidatePaths("/workers", "/orders", "/invoices", "/dashboard", "/reports");
}

export async function createOrderAction(formData: FormData) {
  const workerId = String(formData.get("workerId") ?? "");
  const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);
  const discount = Number(formData.get("discount") ?? 0);
  const paymentMethod = String(formData.get("paymentMethod") || "unpaid");
  const status = String(formData.get("status") || "new");
  const notes = String(formData.get("notes") ?? "");

  const { supabase, managerId } = await getManagerId();
  const customerId = await resolveOrderCustomer(formData, supabase, managerId);
  const vehicleId = customerId ? await resolveOrderVehicle(formData, supabase, managerId, customerId) : "";

  if (!customerId || !vehicleId || !workerId || serviceIds.length === 0) return;

  const { data: selectedServices, error: servicesError } = await supabase
    .from("services")
    .select("id,name,price,duration_minutes")
    .in("id", serviceIds);

  if (servicesError || !selectedServices?.length) return;

  const subtotal = selectedServices.reduce((sum: number, service: any) => sum + Number(service.price ?? 0), 0);
  const total = Math.max(subtotal - discount, 0);
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now().toString().slice(-5)}`;

  const { data: order, error: orderError } = await supabase
    .from("wash_orders")
    .insert({
      invoice_number: invoiceNumber,
      customer_id: customerId,
      vehicle_id: vehicleId,
      worker_id: workerId,
      subtotal,
      discount,
      total,
      payment_method: paymentMethod,
      status,
      started_at: nullableDate(formData.get("startedAt")),
      ended_at: nullableDate(formData.get("endedAt")),
      notes,
      created_by: managerId
    })
    .select("id")
    .single();

  if (orderError || !order) return;

  await supabase.from("wash_order_services").insert(
    selectedServices.map((service: any) => ({
      wash_order_id: order.id,
      service_id: service.id,
      service_name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes
    }))
  );

  revalidatePaths("/orders", "/customers", "/vehicles", "/dashboard", "/invoices", "/reports", "/workers");
}

export async function updateOrderAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);
  const parsed = orderSchema.safeParse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId"),
    workerId: formData.get("workerId"),
    serviceIds,
    discount: formData.get("discount"),
    paymentMethod: formData.get("paymentMethod") || "unpaid",
    status: formData.get("status") || "new",
    notes: formData.get("notes")
  });
  if (!id || !parsed.success) return;

  const { supabase } = await getManagerId();
  const { data: selectedServices, error: servicesError } = await supabase
    .from("services")
    .select("id,name,price,duration_minutes")
    .in("id", parsed.data.serviceIds);

  if (servicesError || !selectedServices?.length) return;

  const subtotal = selectedServices.reduce((sum: number, service: any) => sum + Number(service.price ?? 0), 0);
  const discount = Math.min(parsed.data.discount, subtotal);
  const total = Math.max(subtotal - discount, 0);

  const { error: orderError } = await supabase
    .from("wash_orders")
    .update({
      customer_id: parsed.data.customerId,
      vehicle_id: parsed.data.vehicleId,
      worker_id: parsed.data.workerId,
      subtotal,
      discount,
      total,
      payment_method: parsed.data.paymentMethod,
      status: parsed.data.status,
      started_at: nullableDate(formData.get("startedAt")),
      ended_at: nullableDate(formData.get("endedAt")),
      notes: parsed.data.notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (orderError) return;

  await supabase.from("wash_order_services").delete().eq("wash_order_id", id);
  await supabase.from("wash_order_services").insert(
    selectedServices.map((service: any) => ({
      wash_order_id: id,
      service_id: service.id,
      service_name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes
    }))
  );

  revalidatePaths("/orders", "/dashboard", "/invoices", "/reports", "/workers");
}

export async function updateSettingsAction(_prevState: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  try {
    const { supabase, managerId } = await getManagerId();
    const { error } = await supabase
      .from("settings")
      .upsert({
        id: true,
        shop_name: String(formData.get("shopName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        currency: String(formData.get("currency") ?? "د.ل"),
        tax_rate: Number(formData.get("taxRate") ?? 0),
        working_hours: String(formData.get("workingHours") ?? ""),
        invoice_footer: String(formData.get("invoiceFooter") ?? ""),
        logo_url: String(formData.get("logoUrl") ?? "/logo.jpeg"),
        primary_color: String(formData.get("primaryColor") ?? "#d71920"),
        calculate_worker_commissions: formData.get("calculateWorkerCommissions") === "on",
        reports_export_enabled: formData.get("reportsExportEnabled") === "on",
        updated_by: managerId,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return { status: "error", message: "تعذر حفظ الإعدادات. راجع اتصال قاعدة البيانات ثم حاول مرة أخرى." };
    }

    revalidatePaths("/settings", "/invoices", "/dashboard", "/orders", "/reports");
    return { status: "success", message: "تم حفظ الإعدادات وتحديث الصفحات المرتبطة." };
  } catch {
    return { status: "error", message: "تعذر حفظ الإعدادات. تأكد من تسجيل الدخول وصلاحيات المدير." };
  }
}

export async function softDeleteAction(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/dashboard");
  const allowed = ["customers", "vehicles", "services", "workers", "wash_orders", "invoices"];
  if (!allowed.includes(table) || !id) return;

  const { supabase } = await getManagerId();
  const deletedAt = new Date().toISOString();
  await supabase.from(table).update({ deleted_at: deletedAt }).eq("id", id).is("deleted_at", null);

  if (table === "wash_orders") {
    await supabase.from("invoices").update({ deleted_at: deletedAt }).eq("wash_order_id", id).is("deleted_at", null);
  }

  const relatedPaths: Record<string, string[]> = {
    customers: ["/customers", "/orders", "/invoices", "/dashboard"],
    vehicles: ["/vehicles", "/orders", "/invoices", "/dashboard"],
    services: ["/services", "/orders", "/invoices", "/dashboard", "/reports"],
    workers: ["/workers", "/orders", "/dashboard", "/reports"],
    wash_orders: ["/orders", "/dashboard", "/invoices", "/reports", "/workers"],
    invoices: ["/invoices", "/reports", "/dashboard"]
  };

  revalidatePaths(path, ...(relatedPaths[table] ?? []));
}
