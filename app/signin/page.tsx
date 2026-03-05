"use client";

import { useState, useActionState } from "react";
import { login } from "./actions";
import { GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#F9FAFB] dark:bg-[var(--background)] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl border border-slate-100 dark:border-slate-700 p-12 text-center relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-teal-50 dark:bg-[#82A7A6]/20 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-[#82A7A6]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transfer<span className="text-[#82A7A6]">Pathway</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Plan your transfer with confidence
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5 text-left">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <input
              name="username"
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] transition-all bg-white dark:bg-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] transition-all bg-white dark:bg-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Or continue with</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <Link
          href="/login/google"
          className="w-full mt-6 flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 py-3.5 rounded-xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.03.69-2.35 1.12-3.71 1.12-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.87 14.19c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.69-2.65z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.69 2.84c.86-2.59 3.28-4.51 12-4.51z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Link>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding"
              className="text-[#82A7A6] hover:underline decoration-2 underline-offset-4"
            >
              Start Planning
            </Link>
          </p>
        </div>

        <p className="mt-4 text-slate-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
          Built for community college students who wish to transfer
        </p>
      </div>
    </main>
  );
}
