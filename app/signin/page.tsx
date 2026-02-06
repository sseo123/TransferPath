"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-12 text-center relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-[#82A7A6]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Transfer<span className="text-[#82A7A6]">Path</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Plan your transfer with confidence
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5 text-left">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Email Address
            </label>
            <input
              name="username"
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] transition-all bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] transition-all bg-white"
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
            className="w-full bg-[#82A7A6] mt-5 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#6B8A89] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-slate-500 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding"
              className="text-[#82A7A6] hover:underline decoration-2 underline-offset-4"
            >
              Start Planning
            </Link>
          </p>
        </div>

        <p className="mt-12 text-slate-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
          Built for community college students who wish to transfer
        </p>
      </div>
    </main>
  );
}
