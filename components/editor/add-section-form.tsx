"use client";

import { useState, useTransition } from "react";
import { createSection } from "@/app/actions/roadmaps";

export function AddSectionForm({ roadmapId }: { roadmapId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createSection({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset();
        setIsOpen(false);
        setError(null);
      }
    });
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 shadow-2xs">
      {!isOpen ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Milestone Chapter</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="roadmapId" value={roadmapId} />
          <div className="flex items-center justify-between">
            <h4 className="font-serif-heading text-sm font-bold text-slate-900">New Milestone Chapter</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Milestone Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={160}
              placeholder="e.g. Core Protocols & Network Foundations"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="High-level objectives and target skills for this milestone."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending ? "Creating…" : "Create Milestone"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
