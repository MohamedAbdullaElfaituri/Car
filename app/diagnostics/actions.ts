"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DiagnosticResult = {
  label: string;
  ok: boolean;
  detail: string;
};

export async function collectDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  results.push({
    label: "Supabase URL",
    ok: Boolean(url && url.startsWith("https://") && url.includes(".supabase.co")),
    detail: url ? "موجود ويبدو كرابط Supabase" : "غير موجود في بيئة التشغيل"
  });
  results.push({
    label: "Anon key",
    ok: Boolean(anonKey && anonKey.length > 40),
    detail: anonKey ? "موجود" : "غير موجود"
  });
  results.push({
    label: "Service role key",
    ok: Boolean(serviceRoleKey && serviceRoleKey.length > 40),
    detail: serviceRoleKey ? "موجود" : "غير موجود"
  });

  if (!url || !anonKey) return results;

  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user;

    results.push({
      label: "Session in server",
      ok: Boolean(sessionUser && !sessionError),
      detail: sessionUser ? `الجلسة موجودة: ${sessionUser.email ?? sessionUser.id}` : sessionError?.message ?? "لا توجد جلسة"
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user ?? sessionUser;

    results.push({
      label: "Auth user",
      ok: Boolean(user && !userError),
      detail: user ? `المستخدم: ${user.email ?? user.id}` : userError?.message ?? "لم يتم العثور على مستخدم"
    });

    if (!user) return results;

    const admin = createAdminClient();
    const profileClient = admin ?? supabase;
    const { data: profile, error: profileError } = await profileClient
      .from("users")
      .select("id,full_name,role,active,deleted_at")
      .eq("id", user.id)
      .maybeSingle();

    results.push({
      label: "Manager profile",
      ok: Boolean(profile && profile.role === "manager" && profile.active && !profile.deleted_at),
      detail: profile
        ? `${profile.full_name ?? "بدون اسم"} - role=${profile.role} - active=${profile.active}`
        : profileError?.message ?? "لا يوجد صف مطابق في public.users"
    });

    const { data: workers, error: workersError } = await profileClient.from("workers").select("id").limit(1);
    results.push({
      label: "Read workers",
      ok: !workersError,
      detail: workersError ? workersError.message : `تمت القراءة بنجاح (${workers?.length ?? 0})`
    });
  } catch (error) {
    results.push({
      label: "Unexpected server error",
      ok: false,
      detail: error instanceof Error ? error.message : "خطأ غير معروف"
    });
  }

  return results;
}

export type DiagnosticActionState = {
  results: DiagnosticResult[];
};

export async function runActionDiagnostics(_prevState: DiagnosticActionState): Promise<DiagnosticActionState> {
  return { results: await collectDiagnostics() };
}
