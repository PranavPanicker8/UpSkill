import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | Upskill",
  description: "Sign in to track your learning paths and manage curriculum progress.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-60px)] flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-sm">
        {/* Brand Icon Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <circle cx="5" cy="6" r="2.5" />
                <path d="M5 8.5v7" />
                <circle cx="5" cy="18" r="2.5" />
                <path d="M7.5 6h7a3.5 3.5 0 0 1 3.5 3.5v2" />
                <circle cx="18" cy="14" r="2.5" />
              </svg>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to continue your milestone paths.
          </p>
        </div>

        {/* Card */}
        <div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700" role="alert">
              {error}
            </div>
          )}
          <LoginForm />
        </div>

        {/* Footer Link */}
        <p className="mt-5 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-800" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
