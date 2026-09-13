"use client";

import { useState } from "react";
import { toggleRoadmapUpvote } from "@/app/actions/roadmaps";

type UpvoteButtonProps = {
  roadmapId: string;
  initialUpvoted: boolean;
  initialCount: number;
};

export default function UpvoteButton({
  roadmapId,
  initialUpvoted,
  initialCount,
}: UpvoteButtonProps) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleUpvote() {
    if (loading) return;

    setLoading(true);

    const result = await toggleRoadmapUpvote(roadmapId);

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    setUpvoted(result.upvoted ?? false);

    setCount((current) =>
      result.upvoted ? current + 1 : Math.max(0, current - 1)
    );

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleUpvote}
      disabled={loading}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
        upvoted
          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      ↑ {count} {count === 1 ? "Upvote" : "Upvotes"}
    </button>
  );
}