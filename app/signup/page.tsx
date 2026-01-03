"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { signup } from "./actions";
import { useActionState, useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [state, formAction, isPending] = useActionState(signup, null);

  useEffect(() => {
    const rawData = searchParams.get("data");
    if (!rawData) {
      router.push("/onboarding");
      return;
    }
    try {
      setOnboardingData(JSON.parse(atob(rawData)));
    } catch (e) {
      router.push("/onboarding");
    }
  }, [searchParams, router]);

  if (!onboardingData) return null;

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12 text-center">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-[#303AB2]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Final step to see your plan
          </p>
        </div>

        {/* Signup Form */}
        <form action={formAction} className="flex flex-col gap-5 text-left">
          {/* Hidden Intent Fields */}
          <input
            type="hidden"
            name="currentCollege"
            value={onboardingData.college}
          />
          <input type="hidden" name="major" value={onboardingData.major} />
          <input
            type="hidden"
            name="targetUni"
            value={onboardingData.dreamUni}
          />
          <input
            type="hidden"
            name="transferEdge"
            value={onboardingData.edge}
          />

          {/* Name Row - Using a grid to keep it compact and matching the height of other rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                First Name
              </label>
              <input
                name="firstName"
                placeholder="First"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303AB2]/20 focus:border-[#303AB2] transition-all bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Last Name
              </label>
              <input
                name="lastName"
                placeholder="Last"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#303AB2]/20 focus:border-[#303AB2] transition-all bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Email
            </label>
            <input
              name="username"
              type="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#303AB2]/20 focus:border-[#303AB2] transition-all bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#303AB2]/20 focus:border-[#303AB2] transition-all bg-white"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#303AB2] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#283199] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-md shadow-indigo-100 mt-2"
          >
            {isPending ? "Generating Plan..." : "Generate My Plan"}
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-[#303AB2] hover:underline decoration-2 underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-12 text-slate-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
          Built for community college students who wish to transfer
        </p>
      </div>
    </main>
  );
}
