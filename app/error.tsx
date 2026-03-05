"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8">
        We encountered an unexpected error. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-[#82A7A6] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-bold hover:bg-muted transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
