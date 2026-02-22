import { getOnboardingData } from "../onboarding/actions";
import { redirect } from "next/navigation";
import SignupForm from "./signupForm";

export default async function SignupPage() {
  const onboardingData = await getOnboardingData();
  
  // If no onboarding data, redirect to onboarding
  if (!onboardingData) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] dark:bg-[var(--background)] flex items-center justify-center p-6 font-sans">
      <SignupForm onboardingData={onboardingData} />
    </main>
  );
}