"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import { users } from "@/lib/data/mock";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const role = "manager" satisfies Role;
  const user = users.find((item) => item.role === role && item.active) ?? users[0];
  const cookieStore = await cookies();

  cookieStore.set("bosnina_user", JSON.stringify({ id: user.id, name: user.name, role: user.role, identifier }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect("/dashboard");
}
