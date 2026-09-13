"use client";

import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Username
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          type="text"
          name="username"
          autoComplete="username"
          placeholder="e.g. dev_sarah"
          required
          minLength={3}
          maxLength={30}
        />
        <p className="mt-1 text-[11px] text-slate-500">3–30 lowercase letters, numbers, or underscores.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Full name <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Sarah Connor"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Email address
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Password
        </label>
        <input
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700" role="alert">
          {state.error}
        </div>
      )}

      {state.notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700" role="status">
          {state.notice}
        </div>
      )}

      <div className="pt-1">
        <SubmitButton pendingLabel="Creating account…">Create free account</SubmitButton>
      </div>
    </form>
  );
}
