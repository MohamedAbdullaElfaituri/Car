"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    redirect("/login?error=session");
  }

  redirect("/dashboard");
}
