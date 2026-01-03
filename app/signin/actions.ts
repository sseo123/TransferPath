"use server";

import { verifyPassword } from "@/lib/password";
import { getLucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function login(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const { env } = await getCloudflareContext();
  const db = drizzle((env as any).DB);

  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .get();

  // Basic security: don't tell the user if the email or password was the specific fail point
  if (
    !existingUser ||
    !(await verifyPassword(password, existingUser.passwordHash))
  ) {
    return { error: "Incorrect username or password" };
  }

  const lucia = await getLucia();
  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/dashboard");
}
