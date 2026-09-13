"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Email address
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Password
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400" role="alert">
          {state.error}
        </div>
      )}

      <div className="pt-1">
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </div>
    </form>
  );
}
