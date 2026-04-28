import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Demo cookie cleanup below still runs if Supabase is not configured.
  }
  const cookieStore = await cookies();
  cookieStore.delete("bosnina_user");
  redirect("/login");
}
