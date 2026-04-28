"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, serviceSchema, vehicleSchema } from "@/lib/validation";

async function getManagerId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, managerId: data.user?.id ?? null };
}

function nullableDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "");
  return text ? new Date(text).toISOString() : null;
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
  revalidatePath("/customers");
  revalidatePath("/orders");
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
  revalidatePath("/vehicles");
  revalidatePath("/orders");
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
  revalidatePath("/services");
  revalidatePath("/orders");
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
  revalidatePath("/workers");
  revalidatePath("/orders");
}

export async function createOrderAction(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const workerId = String(formData.get("workerId") ?? "");
  const serviceIds = formData.getAll("serviceIds").map(String).filter(Boolean);
  const discount = Number(formData.get("discount") ?? 0);
  const paymentMethod = String(formData.get("paymentMethod") || "unpaid");
  const status = String(formData.get("status") || "new");
  const notes = String(formData.get("notes") ?? "");

  if (!customerId || !vehicleId || !workerId || serviceIds.length === 0) return;

  const { supabase, managerId } = await getManagerId();
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

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath("/reports");
}

export async function updateSettingsAction(formData: FormData) {
  const { supabase, managerId } = await getManagerId();
  await supabase
    .from("settings")
    .update({
      shop_name: String(formData.get("shopName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      currency: String(formData.get("currency") ?? "د.ل"),
      tax_rate: Number(formData.get("taxRate") ?? 0),
      working_hours: String(formData.get("workingHours") ?? ""),
      invoice_footer: String(formData.get("invoiceFooter") ?? ""),
      primary_color: String(formData.get("primaryColor") ?? "#d71920"),
      calculate_worker_commissions: formData.get("calculateWorkerCommissions") === "on",
      reports_export_enabled: formData.get("reportsExportEnabled") === "on",
      updated_by: managerId,
      updated_at: new Date().toISOString()
    })
    .eq("id", true);
  revalidatePath("/settings");
  revalidatePath("/invoices");
}

export async function softDeleteAction(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/dashboard");
  const allowed = ["customers", "vehicles", "services", "workers", "wash_orders", "invoices"];
  if (!allowed.includes(table) || !id) return;

  const { supabase } = await getManagerId();
  await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(path);
}
