"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Log In</h1>

      <form action={formAction} className="flex flex-col gap-4 max-w-sm">
        <input
          name="username"
          placeholder="Username"
          required
          autoComplete="username"
          className="border p-2 rounded text-black"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          className="border p-2 rounded text-black"
        />

        {state?.error && (
          <p className="text-red-500 text-sm font-medium">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 text-white p-2 rounded disabled:opacity-50 hover:bg-green-700 transition"
        >
          {isPending ? "Logging in..." : "Log In"}
        </button>
      </form>
    </main>
  );
}
