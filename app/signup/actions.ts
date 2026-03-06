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
import { clearOnboardingData } from "@/app/onboarding/actions";

type SignupState = { error?: string } | null;

// Security: Input validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 50;
const MAX_FIELD_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (email.length > MAX_EMAIL_LENGTH) return "Email is too long";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < MIN_PASSWORD_LENGTH) 
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (password.length > MAX_PASSWORD_LENGTH) return "Password is too long";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

function validateName(name: string, fieldName: string): string | null {
  if (!name) return `${fieldName} is required`;
  if (name.length > MAX_NAME_LENGTH) return `${fieldName} is too long`;
  if (!NAME_REGEX.test(name)) return `${fieldName} contains invalid characters`;
  return null;
}

function sanitizeString(str: string | null, maxLength: number): string {
  if (!str) return "";
  return str.trim().slice(0, maxLength);
}

export async function signup(prevState: SignupState, formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  
  // Security: Validate all inputs
  const emailError = validateEmail(username);
  if (emailError) return { error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const firstNameError = validateName(firstName, "First name");
  if (firstNameError) return { error: firstNameError };

  const lastNameError = validateName(lastName, "Last name");
  if (lastNameError) return { error: lastNameError };

  // Security: Sanitize optional fields with max length limits
  const currentCollege = sanitizeString(
    formData.get("currentCollege") as string,
    MAX_FIELD_LENGTH
  );
  const major = sanitizeString(formData.get("major") as string, MAX_FIELD_LENGTH);
  const targetUni = sanitizeString(
    formData.get("targetUni") as string,
    MAX_FIELD_LENGTH
  );
  const startSeason = sanitizeString(
    formData.get("startSeason") as string,
    20
  );
  
  const startYearString = formData.get("startYear") as string;
  const startYear = startYearString
    ? parseInt(startYearString)
    : new Date().getFullYear();

  // Validate year is reasonable
  // const currentYear = new Date().getFullYear();
  // if (startYear < currentYear - 1000 || startYear > currentYear + 1000 || isNaN(startYear)) {
  //   return { error: `Invalid start year: parsed '${startYear}' from '${startYearString}', current: ${currentYear}` };
  // }

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))
    .get();

  if (existingUser) return { error: "It looks like you already have an account! Please sign in" };

  const passwordHash = await hashPassword(password);
  const userId = generateIdFromEntropySize(10);

  await db.insert(userTable).values({
    id: userId,
    username,
    passwordHash,
    firstName: sanitizeString(firstName, MAX_NAME_LENGTH),
    lastName: sanitizeString(lastName, MAX_NAME_LENGTH),
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

  // Security: Clear the onboarding cookie after successful signup
  await clearOnboardingData();

  return redirect("/dashboard");
}

