import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-4">Page Not Found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#82A7A6] px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
      >
        Go back home
      </Link>
    </div>
  );
}
