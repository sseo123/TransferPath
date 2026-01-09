"use server";

import { verifyPassword } from "@/lib/password";
import { getLucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define the LoginState to match what useActionState expects
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

  // Security note: Using the same error for user-not-found and wrong-password
  // prevents "account enumeration" attacks. Good job here.
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

  // Success!
  return redirect("/dashboard");
}

// "use server";

// import { verifyPassword } from "@/lib/password";
// import { getLucia } from "@/lib/auth";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { getCloudflareContext } from "@opennextjs/cloudflare";
// import { drizzle } from "drizzle-orm/d1";
// import { userTable } from "@/db/schema";
// import { eq } from "drizzle-orm";

// type LoginState = {
//   error?: string;
// };

// export async function login(_prevState: LoginState, formData: FormData) {
//   const username = (formData.get("username") as string)?.trim();
//   const password = formData.get("password") as string;

//   if (!username || !password) {
//     return { error: "Username and password are required" };
//   }

//   const { env } = await getCloudflareContext();
//   const cfEnv = env as Env;
//   const db = drizzle(cfEnv.DB);

//   const existingUser = await db
//     .select()
//     .from(userTable)
//     .where(eq(userTable.username, username))
//     .get();

//   if (
//     !existingUser ||
//     !(await verifyPassword(password, existingUser.passwordHash))
//   ) {
//     return { error: "Incorrect username or password" };
//   }

//   const lucia = await getLucia();
//   const session = await lucia.createSession(existingUser.id, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);

//   const cookieStore = await cookies();
//   cookieStore.set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes
//   );

//   return redirect("/dashboard");
// }
