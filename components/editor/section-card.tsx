"use client";

import { useState, useTransition } from "react";
import { updateSection, deleteSection, createTask } from "@/app/actions/roadmaps";
import { type RoadmapSectionItem } from "@/lib/roadmaps";
import { TaskCard } from "./task-card";

export function SectionCard({ section, index }: { section: RoadmapSectionItem; index: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("sectionId", section.id);
      const res = await deleteSection({}, fd);
      if (res.error) setError(res.error);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSection({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
        setError(null);
      }
    });
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createTask({}, fd);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset();
        setIsAddingTask(false);
        setError(null);
      }
    });
  };

  const tasks = section.tasks || [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
      {/* Milestone Section Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 p-5">
        {!isEditing ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Milestone 0{index + 1}
                </span>
                <h3 className="font-serif-heading mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit Milestone
                </button>

                {confirmDelete ? (
                  <div className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-0.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleDelete}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      {isPending ? "…" : "Confirm Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input type="hidden" name="sectionId" value={section.id} />
            <div>
              <label className="block text-xs font-semibold text-slate-700">Milestone Title</label>
              <input
                type="text"
                name="title"
                defaultValue={section.title}
                required
                maxLength={160}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                defaultValue={section.description || ""}
                rows={2}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
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

      {/* Tasks List inside Milestone */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-code text-xs font-semibold text-slate-500">
            Tasks ({tasks.length})
          </span>
          <button
            type="button"
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50"
          >
            {isAddingTask ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {/* Add Task Form */}
        {isAddingTask && (
          <form onSubmit={handleCreateTask} className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-3.5 space-y-3">
            <input type="hidden" name="sectionId" value={section.id} />
            <h5 className="font-mono-code text-[11px] font-bold uppercase text-indigo-700">New Task Item</h5>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                maxLength={200}
                placeholder="e.g. Set up Supabase SSR authentication client"
                className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Description / Instructions
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="What should the learner build or read for this step?"
                className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Estimated Minutes
              </label>
              <input
                type="number"
                name="estimatedMinutes"
                min={1}
                placeholder="30"
                className="mt-1 w-28 rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isPending ? "Adding…" : "Add Task"}
              </button>
            </div>
          </form>
        )}

        {/* Task Cards */}
        {tasks.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400 italic">
            No tasks in this milestone. Click &quot;+ Add Task&quot; above to create one.
          </p>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
