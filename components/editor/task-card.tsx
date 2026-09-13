"use client";

import { useState, useTransition } from "react";
import { updateTask, deleteTask, createResource } from "@/app/actions/roadmaps";
import { type TaskItem, resourceTypes, formatDuration } from "@/lib/roadmaps";
import { ResourceItem } from "./resource-item";

export function TaskCard({ task }: { task: TaskItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("taskId", task.id);
      const res = await deleteTask({}, fd);
      if (res.error) setError(res.error);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateTask({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
        setError(null);
      }
    });
  };

  const handleCreateResource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createResource({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset();
        setIsAddingResource(false);
        setError(null);
      }
    });
  };

  const resources = task.task_resources || [];

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300">
      {!isEditing ? (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <span className="font-mono-code flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                #{task.position + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                  {task.estimated_minutes && (
                    <span className="font-mono-code rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                      {formatDuration(task.estimated_minutes)}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="font-medium text-slate-500 hover:text-slate-900"
              >
                Edit
              </button>

              {confirmDelete ? (
                <div className="inline-flex items-center gap-1.5 rounded bg-rose-50 px-2 py-0.5 text-xs">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleDelete}
                    className="font-semibold text-rose-600 hover:text-rose-800"
                  >
                    {isPending ? "…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

          {/* Attached Resources Bar */}
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">
                Materials & Links ({resources.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingResource(!isAddingResource)}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                {isAddingResource ? "Cancel" : "+ Add Material"}
              </button>
            </div>

            {/* Add Resource Form */}
            {isAddingResource && (
              <form onSubmit={handleCreateResource} className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/40 p-2.5 text-xs space-y-2">
                <input type="hidden" name="taskId" value={task.id} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    name="title"
                    required
                    maxLength={200}
                    placeholder="Material Title (e.g. Next.js Routing Docs)"
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                  <input
                    type="url"
                    name="url"
                    required
                    placeholder="https://…"
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                  <select
                    name="resourceType"
                    defaultValue="documentation"
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    {resourceTypes.map((t) => (
                      <option key={t} value={t}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isPending ? "Adding…" : "Add Material"}
                  </button>
                </div>
              </form>
            )}

            {/* Resources List */}
            {resources.length > 0 && (
              <div className="mt-2 space-y-1">
                {resources.map((res) => (
                  <ResourceItem key={res.id} resource={res} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-3 text-xs">
          <input type="hidden" name="taskId" value={task.id} />
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">Task Title</label>
            <input
              type="text"
              name="title"
              defaultValue={task.title}
              required
              maxLength={200}
              className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              defaultValue={task.description || ""}
              rows={2}
              className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">Estimated Duration (minutes)</label>
            <input
              type="number"
              name="estimatedMinutes"
              min={1}
              defaultValue={task.estimated_minutes || ""}
              placeholder="e.g. 45"
              className="mt-1 w-36 rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {error && <p className="text-rose-600 text-xs">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save Task"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
