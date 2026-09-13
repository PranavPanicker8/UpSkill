"use client";

import { useState, useTransition } from "react";
import { deleteRoadmap } from "@/app/actions/roadmaps";

export function DeleteRoadmapButton({ roadmapId }: { roadmapId: string; title?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("roadmapId", roadmapId);
      await deleteRoadmap({}, formData);
    });
  };

  return confirming ? (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1">
      <span className="text-xs font-semibold text-rose-700">Delete roadmap?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="rounded bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirming(false)}
        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300"
    >
      Delete
    </button>
  );
}
