"use server";

import { verifyPassword } from "@/lib/password";
import { getLucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState, formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase(); // Normalize email case
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .get();

  if (!existingUser) {
    return { error: "Incorrect username or password" };
  }

  // If user signed up via Google and has no password
  if (!existingUser.passwordHash) {
    return {
      error:
        "This account uses Google Sign-In. Please use 'Continue with Google' instead.",
    };
  }

  if (!(await verifyPassword(password, existingUser.passwordHash))) {
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
