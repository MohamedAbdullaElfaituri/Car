"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsActionState } from "@/app/actions";
import { Field, inputClass, textareaClass } from "@/components/ui";
import { Setting } from "@/lib/types";

const initialState: SettingsActionState = {
  status: "idle",
  message: ""
};

export function SettingsForm({ settings }: { settings: Setting }) {
  const [state, formAction, isPending] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="mt-4 grid gap-4 md:grid-cols-2">
      <Field label="اسم المحل">
        <input name="shopName" className={inputClass} defaultValue={settings.shopName} required />
      </Field>
      <Field label="رقم الهاتف">
        <input name="phone" className={inputClass} defaultValue={settings.phone} />
      </Field>
      <Field label="العنوان">
        <input name="address" className={inputClass} defaultValue={settings.address} />
      </Field>
      <Field label="العملة">
        <input name="currency" className={inputClass} defaultValue={settings.currency || "د.ل"} required />
      </Field>
      <Field label="الضرائب %">
        <input name="taxRate" className={inputClass} type="number" min="0" step="0.01" defaultValue={settings.taxRate} />
      </Field>
      <Field label="أوقات العمل">
        <input name="workingHours" className={inputClass} defaultValue={settings.workingHours} />
      </Field>
      <Field label="رابط الشعار">
        <input name="logoUrl" className={inputClass} defaultValue={settings.logoUrl ?? "/logo.jpeg"} placeholder="/logo.jpeg" />
      </Field>
      <Field label="لون النظام">
        <div className="flex h-11 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3">
          <input name="primaryColor" type="color" defaultValue={settings.primaryColor} className="h-7 w-12 cursor-pointer border-0 bg-transparent p-0" />
          <span className="text-sm font-semibold text-zinc-500">{settings.primaryColor}</span>
        </div>
      </Field>
      <div className="md:col-span-2">
        <Field label="نص أسفل الفاتورة">
          <textarea name="invoiceFooter" className={textareaClass} defaultValue={settings.invoiceFooter} />
        </Field>
      </div>
      <div className="md:col-span-2 flex flex-wrap gap-4 rounded-lg bg-zinc-50 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input name="calculateWorkerCommissions" type="checkbox" defaultChecked={settings.workerCanViewToday} className="accent-brand-red" />
          احتساب عمولات العمال في التقارير
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input name="reportsExportEnabled" type="checkbox" defaultChecked={settings.managerCanExportReports} className="accent-brand-red" />
          تفعيل تصدير التقارير
        </label>
      </div>

      <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button disabled={isPending} className="h-11 rounded-lg bg-brand-black px-5 font-bold text-white transition disabled:cursor-not-allowed disabled:bg-zinc-400">
          {isPending ? "جار الحفظ..." : "حفظ الإعدادات"}
        </button>
        {state.status !== "idle" ? (
          <p className={state.status === "success" ? "text-sm font-bold text-emerald-700" : "text-sm font-bold text-red-700"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
