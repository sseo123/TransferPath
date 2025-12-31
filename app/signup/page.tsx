"use client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Start Your Plan</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        To build an accurate schedule, we need to know your major and college
        first.
      </p>
      <button
        onClick={() => router.push("/onboarding")}
        className="bg-[#303AB2] text-white px-10 py-4 rounded-xl font-bold shadow-lg"
      >
        Go to Onboarding
      </button>
    </main>
  );
}
