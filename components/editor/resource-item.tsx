"use client";

import { useState, useTransition } from "react";
import { updateResource, deleteResource } from "@/app/actions/roadmaps";
import { type TaskResourceItem, resourceTypes } from "@/lib/roadmaps";

export function ResourceItem({ resource }: { resource: TaskResourceItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("resourceId", resource.id);
      const res = await deleteResource({}, fd);
      if (res.error) setError(res.error);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateResource({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
        setError(null);
      }
    });
  };

  return (
    <div className="group rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs transition-colors hover:border-slate-300 hover:bg-white">
      {!isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono-code rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-semibold uppercase text-slate-700">
              {resource.resource_type}
            </span>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-800 hover:text-indigo-600 hover:underline truncate"
            >
              {resource.title}
            </a>
            <span className="text-slate-400 text-[11px]">↗</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="font-medium text-slate-500 hover:text-slate-900"
            >
              Edit
            </button>

            {confirmDelete ? (
              <div className="inline-flex items-center gap-1">
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
      ) : (
        <form onSubmit={handleUpdate} className="space-y-2 py-1">
          <input type="hidden" name="resourceId" value={resource.id} />
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              type="text"
              name="title"
              defaultValue={resource.title}
              required
              maxLength={200}
              placeholder="Resource title"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <input
              type="url"
              name="url"
              defaultValue={resource.url}
              required
              placeholder="https://…"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <select
              name="resourceType"
              defaultValue={resource.resource_type}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              {resourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-rose-600 text-[11px]">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
