"use client";

import { clsx } from "clsx";
import Link from "next/link";

type CardProps = React.ComponentPropsWithoutRef<"section">;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section className={clsx("rounded-lg border border-zinc-200 bg-white p-4 shadow-sm", className)} {...props}>
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "dark" }: { label: string; value: string; hint?: string; tone?: "dark" | "red" | "light" }) {
  return (
    <Card className={clsx(tone === "dark" && "bg-brand-black text-white", tone === "red" && "bg-brand-red text-white")}>
      <p className={clsx("text-sm font-semibold", tone === "light" ? "text-zinc-500" : "text-white/75")}>{label}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {hint ? <p className={clsx("mt-2 text-xs", tone === "light" ? "text-zinc-500" : "text-white/70")}>{hint}</p> : null}
    </Card>
  );
}

export function SearchBar({ placeholder }: { placeholder: string }) {
  return <input className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-brand-red" placeholder={placeholder} />;
}

export function PrimaryButton({ children, href }: { children: React.ReactNode; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-red-700">
        {children}
      </Link>
    );
  }
  return <button className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-red-700">{children}</button>;
}

export function ConfirmDeleteButton() {
  return (
    <button
      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
      onClick={() => undefined}
      type="button"
      title="يعرض النظام رسالة تأكيد قبل الحذف ثم يستخدم soft delete"
    >
      حذف
    </button>
  );
}

export function StatusBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", className)}>{children}</span>;
}

export function MiniBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-sm">
          <span className="text-zinc-600">{item.label}</span>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-brand-red" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="text-left font-bold">{item.value.toLocaleString("ar-LY")}</span>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass = "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:border-brand-red";
export const textareaClass = "min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-brand-red";
