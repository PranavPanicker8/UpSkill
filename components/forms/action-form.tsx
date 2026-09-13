"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type FormState = { error?: string; success?: string };
type ServerAction = (state: FormState, formData: FormData) => Promise<FormState>;

function ActionSubmitButton({
  label,
  pendingLabel,
  tone = "primary",
}: {
  label: string;
  pendingLabel?: string;
  tone?: "primary" | "danger" | "secondary" | "accent";
}) {
  const { pending } = useFormStatus();

  let buttonClasses = "bg-slate-900 text-white hover:bg-slate-800 shadow-xs";
  if (tone === "danger") {
    buttonClasses = "bg-rose-600 text-white hover:bg-rose-700 shadow-xs";
  } else if (tone === "secondary") {
    buttonClasses = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs";
  } else if (tone === "accent") {
    buttonClasses = "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs";
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${buttonClasses}`}
      type="submit"
      disabled={pending}
    >
      {pending && (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span>{pending ? pendingLabel || "Saving…" : label}</span>
    </button>
  );
}

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  tone = "primary",
  className = "",
}: {
  action: ServerAction;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  tone?: "primary" | "danger" | "secondary" | "accent";
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ActionSubmitButton label={submitLabel} pendingLabel={pendingLabel} tone={tone} />
        {state.error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700" role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700" role="status">
            {state.success}
          </p>
        )}
      </div>
    </form>
  );
}

export function CompactActionForm({
  action,
  children,
  label,
  pendingLabel,
  tone = "secondary",
}: {
  action: ServerAction;
  children: React.ReactNode;
  label: string;
  pendingLabel?: string;
  tone?: "primary" | "danger" | "secondary" | "accent";
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="inline-flex flex-wrap items-center gap-2">
      {children}
      <ActionSubmitButton label={label} pendingLabel={pendingLabel} tone={tone} />
      {state.error && (
        <span className="text-xs font-medium text-rose-600" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
