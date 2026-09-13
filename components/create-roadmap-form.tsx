"use client";

import { useState } from "react";
import { ActionForm } from "@/components/forms/action-form";
import { createRoadmap } from "@/app/actions/roadmaps";

export function CreateRoadmapButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Path</span>
        </button>
      ) : (
        <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-md sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create a New Path</h3>
              <p className="text-xs text-slate-500">
                You’ll be redirected to the curriculum editor to add sections, tasks, and resources.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ActionForm
            action={createRoadmap}
            submitLabel="Create Path & Build Curriculum"
            pendingLabel="Creating…"
            tone="primary"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Path Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  minLength={3}
                  maxLength={160}
                  placeholder="e.g. Modern Full-Stack Next.js Developer"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={3}
                  placeholder="What will learners achieve by following this curriculum? Outline prerequisites and target outcomes."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Difficulty Level
                  </label>
                  <select
                    name="level"
                    defaultValue="intermediate"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    min={1}
                    placeholder="e.g. 1200 (20 hours)"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Cover Image URL <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="url"
                  name="coverImageUrl"
                  placeholder="https://images.example.com/cover.jpg"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </ActionForm>
        </div>
      )}
    </div>
  );
}
