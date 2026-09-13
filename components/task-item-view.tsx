"use client";

import { useTransition } from "react";
import { toggleTaskProgress } from "@/app/actions/roadmaps";
import { type TaskItem, type ResourceType, formatDuration } from "@/lib/roadmaps";

function resourceIcon(type: ResourceType) {
  switch (type) {
    case "video":
      return (
        <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "documentation":
      return (
        <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "repository":
      return (
        <svg className="h-3.5 w-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "article":
      return (
        <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    default:
      return (
        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}

export function TaskItemView({
  task,
  isCompleted,
  isFollowing,
  roadmapSlug,
}: {
  task: TaskItem;
  isCompleted: boolean;
  isFollowing: boolean;
  roadmapSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isFollowing || isPending) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", task.id);
      formData.set("roadmapSlug", roadmapSlug);
      await toggleTaskProgress({}, formData);
    });
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isCompleted
          ? "border-emerald-200/90 bg-emerald-50/20"
          : "border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Waypoint Checkbox */}
        {isFollowing ? (
          <button
            onClick={handleToggle}
            disabled={isPending}
            type="button"
            title={isCompleted ? "Mark task incomplete" : "Mark task complete"}
            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
              isCompleted
                ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                : "border-slate-300 bg-white text-transparent hover:border-indigo-600 hover:bg-indigo-50/50"
            } ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <div
            title="Follow roadmap to track progress"
            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              className={`text-sm font-semibold transition-colors ${
                isCompleted ? "text-slate-500 line-through decoration-emerald-500/60" : "text-slate-900"
              }`}
            >
              {task.title}
            </h4>
            {task.estimated_minutes && (
              <span className="font-mono-code rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {formatDuration(task.estimated_minutes)}
              </span>
            )}
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          )}

          {/* Resources List */}
          {task.task_resources && task.task_resources.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Resources:
              </span>
              {task.task_resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 transition-colors hover:border-indigo-300 hover:bg-white hover:text-indigo-600"
                >
                  {resourceIcon(res.resource_type)}
                  <span className="font-medium truncate max-w-[180px] sm:max-w-xs">{res.title}</span>
                  <span className="text-slate-400">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
