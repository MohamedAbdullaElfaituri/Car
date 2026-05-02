import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, ClipboardList, FileText, Home, LogOut, Settings, Sparkles, Wrench } from "lucide-react";
import { can, Permission } from "@/lib/permissions";
import { roleLabels } from "@/lib/format";
import { Role } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type StoredUser = {
  id: string;
  name: string;
  role: Role;
};

const navItems: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission: Permission }> = [
  { href: "/dashboard", label: "لوحة التحكم", icon: Home, permission: "dashboard:view" },
  { href: "/orders", label: "المعاملات", icon: ClipboardList, permission: "orders:create" },
  { href: "/services", label: "الخدمات والأسعار", icon: Sparkles, permission: "services:manage" },
  { href: "/invoices", label: "الفواتير", icon: FileText, permission: "invoices:manage" },
  { href: "/reports", label: "التقارير", icon: BarChart3, permission: "reports:view" },
  { href: "/workers", label: "إدارة العمال", icon: Wrench, permission: "workers:manage" },
  { href: "/settings", label: "الإعدادات", icon: Settings, permission: "settings:manage" }
];

async function getUser() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) redirect("/login");

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData.user ?? sessionData.session.user;

    const { data: profile } = await supabase
      .from("users")
      .select("id,full_name,role,active")
      .eq("id", currentUser.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!profile || profile.role !== "manager" || !profile.active) redirect("/diagnostics?reason=manager-profile");

    return {
      id: profile.id,
      name: profile.full_name,
      role: "manager"
    } satisfies StoredUser;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get("bosnina_user")?.value;
  if (!raw) redirect("/login");
  const user = JSON.parse(raw) as StoredUser;
  if (user.role !== "manager") redirect("/logout");
  return user;
}

export async function AppShell({ children, title, action }: { children: React.ReactNode; title: string; action?: React.ReactNode }) {
  const user = await getUser();
  const items = navItems.filter((item) => can(user.role, item.permission));

  return (
    <div className="min-h-screen bg-brand-surface">
      <aside className="no-print fixed right-0 top-0 hidden h-screen w-72 border-l border-zinc-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-100 p-5">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="بوسنينه لخدمات السيارات" className="h-12 w-24 rounded-md object-cover" />
              <div>
                <p className="font-bold">بوسنينه لخدمات السيارات</p>
                <p className="text-xs text-zinc-500">نظام الإدارة الداخلي</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} prefetch className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100">
                  <Icon className="h-5 w-5 text-brand-red" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-zinc-100 p-4">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-zinc-500">{roleLabels[user.role]}</p>
            <Link href="/logout" className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700">
              <LogOut className="h-4 w-4" />
              تسجيل خروج
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:mr-72">
        <header className="no-print sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="بوسنينه لخدمات السيارات" className="h-9 w-20 rounded-md object-cover sm:hidden" />
                <p className="text-xs font-semibold text-brand-red">بوسنينه لخدمات السيارات</p>
              </div>
              <h1 className="text-xl font-bold text-brand-black sm:text-2xl">{title}</h1>
            </div>
            {action}
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {items.map((item) => (
              <Link key={item.href} href={item.href} prefetch className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700">
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
