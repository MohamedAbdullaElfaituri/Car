"use client";

import { useActionState } from "react";
import { createWorkerWithFeedbackAction, type WorkerActionState } from "@/app/actions";
import { Field, inputClass } from "@/components/ui";

const initialState: WorkerActionState = {
  status: "idle",
  message: ""
};

export function WorkerCreateForm() {
  const [state, formAction, isPending] = useActionState(createWorkerWithFeedbackAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <Field label="اسم العامل">
        <input name="name" className={inputClass} placeholder="اسم العامل" required />
      </Field>
      <Field label="رقم الهاتف">
        <input name="phone" className={inputClass} placeholder="09xxxxxxxx" />
      </Field>
      <Field label="نسبة العمولة %">
        <input name="commissionRate" type="number" min="0" max="100" className={inputClass} placeholder="10" />
      </Field>
      <Field label="الحالة">
        <select name="active" className={inputClass}>
          <option value="true">نشط</option>
          <option value="false">متوقف</option>
        </select>
      </Field>
      <button disabled={isPending} className="h-11 w-full rounded-lg bg-brand-black font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-400">
        {isPending ? "جار الحفظ..." : "حفظ العامل"}
      </button>
      {state.status !== "idle" ? (
        <p className={state.status === "success" ? "rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800" : "rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
