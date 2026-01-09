// "use server";

// import { hashPassword } from "@/lib/password";
// import { getLucia } from "@/lib/auth";
// import { generateIdFromEntropySize } from "lucia";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { getCloudflareContext } from "@opennextjs/cloudflare";
// import { drizzle } from "drizzle-orm/d1";
// import { userTable } from "@/db/schema";
// import { eq } from "drizzle-orm";

// type SignupState = { error?: string } | null;

// export async function signup(prevState: SignupState, formData: FormData) {
//   const username = (formData.get("username") as string)?.trim();
//   const password = formData.get("password") as string;

//   // Extract extra onboarding fields
//   const firstName = formData.get("firstName") as string;
//   const lastName = formData.get("lastName") as string;
//   const currentCollege = formData.get("currentCollege") as string;
//   const major = formData.get("major") as string;
//   const targetUni = formData.get("targetUni") as string;
//   const transferEdge = formData.get("transferEdge") as string;
//   const startSeason = formData.get("startSeason") as string;
//   const startYear = parseInt(formData.get("startYear") as string);

//   if (!username || username.length < 3) return { error: "Invalid email" };
//   if (!password || password.length < 6) return { error: "Password too short" };

//   const { env } = await getCloudflareContext({ async: true });
//   const cfEnv = env as Env;
//   const db = drizzle(cfEnv.DB);

//   const existingUser = await db
//     .select()
//     .from(userTable)
//     .where(eq(userTable.username, username))
//     .get();
//   if (existingUser) return { error: "Email already registered" };

//   const passwordHash = await hashPassword(password);
//   const userId = generateIdFromEntropySize(10);

//   // Insert EVERYTHING into the user table
//   await db.insert(userTable).values({
//     id: userId,
//     username,
//     passwordHash,
//     firstName,
//     lastName,
//     currentCollege,
//     major,
//     targetUni,
//     transferEdge,
//     startSeason,
//     startYear,
//   });

//   const lucia = await getLucia();
//   const session = await lucia.createSession(userId, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);

//   const cookieStore = await cookies();
//   cookieStore.set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes
//   );

//   return redirect("/dashboard");
// }

"use server";

import { hashPassword } from "@/lib/password";
import { getLucia } from "@/lib/auth";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

type SignupState = { error?: string } | null;

export async function signup(prevState: SignupState, formData: FormData) {
  // Normalize email to lowercase for consistent login
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  // Extract extra onboarding fields
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const currentCollege = formData.get("currentCollege") as string;
  const major = formData.get("major") as string;
  const targetUni = formData.get("targetUni") as string;

  // REMOVED: transferEdge extraction

  const startSeason = formData.get("startSeason") as string;
  const startYearString = formData.get("startYear") as string;
  const startYear = startYearString
    ? parseInt(startYearString)
    : new Date().getFullYear();

  // Basic Validation
  if (!username || username.length < 3) return { error: "Invalid email" };
  if (!password || password.length < 6)
    return { error: "Password must be at least 6 characters" };
  if (!firstName || !lastName)
    return { error: "First and last name are required" };

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .get();

  if (existingUser) return { error: "Email already registered" };

  const passwordHash = await hashPassword(password);
  const userId = generateIdFromEntropySize(10);

  // Insert into the user table (transferEdge REMOVED)
  await db.insert(userTable).values({
    id: userId,
    username,
    passwordHash,
    firstName,
    lastName,
    currentCollege,
    major,
    targetUni,
    startSeason,
    startYear,
  });

  const lucia = await getLucia();
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/dashboard");
}
