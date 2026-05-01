"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

function DeleteSubmit({ label = "حذف" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "جار الحذف..." : label}
    </button>
  );
}

export function DeleteRecordForm({
  action,
  table,
  id,
  path,
  label
}: {
  action: (formData: FormData) => void | Promise<void>;
  table: string;
  id: string;
  path: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("هل تريد حذف هذا السجل؟ يمكن إخفاؤه من النظام بدون حذف البيانات نهائياً.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="path" value={path} />
      <DeleteSubmit label={label} />
    </form>
  );
}
