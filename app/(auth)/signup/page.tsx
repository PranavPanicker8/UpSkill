import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account | Upskill",
  description: "Create an account on Upskill to follow curated learning paths and track progress.",
};

export default function SignupPage() {
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
            Create your account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Start tracking structured, milestone-driven developer curricula.
          </p>
        </div>

        {/* Card */}
        <div className="mt-7 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 p-6 shadow-xs sm:p-7">
          <SignupForm />
        </div>

        {/* Footer Link */}
        <p className="mt-5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-800" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
