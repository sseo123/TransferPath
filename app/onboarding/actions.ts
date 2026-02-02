"use server";

import { cookies } from "next/headers";

export interface OnboardingData {
  college: string;
  major: string;
  dreamUni: string;
  startSeason: string;
  startYear: number;
}

const ONBOARDING_COOKIE_NAME = "onboarding_data";
const COOKIE_MAX_AGE = 3600; // 1 hour

/**
 * Save onboarding data securely in an httpOnly cookie
 * This prevents exposure in URL parameters and browser history
 */
export async function saveOnboardingData(data: OnboardingData) {
  const cookieStore = await cookies();
  
  cookieStore.set(ONBOARDING_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Retrieve onboarding data from the secure cookie
 */
export async function getOnboardingData(): Promise<OnboardingData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ONBOARDING_COOKIE_NAME);
  
  if (!cookie?.value) return null;
  
  try {
    return JSON.parse(cookie.value) as OnboardingData;
  } catch {
    return null;
  }
}

/**
 * Clear onboarding data after successful signup
 */
export async function clearOnboardingData() {
  const cookieStore = await cookies();
  cookieStore.delete(ONBOARDING_COOKIE_NAME);
}
