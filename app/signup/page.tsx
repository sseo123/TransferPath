"use client";

import { useActionState } from "react";
import { signup } from "./actions";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, { error: "" });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Create an Account</h1>

      <form action={formAction} className="flex flex-col gap-4 max-w-sm">
        <input
          name="username"
          placeholder="Username"
          required
          autoComplete="username"
          className="border p-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="new-password"
          className="border p-2 rounded"
        />

        {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
