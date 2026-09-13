"use client";

import { useMemo, useState } from "react";
import { RoadmapCard } from "@/components/roadmap-card";
import { type RoadmapSummary, type RoadmapLevel } from "@/lib/roadmaps";

const LEVELS: { label: string; value: "all" | RoadmapLevel }[] = [
  { label: "All Levels", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export function RoadmapExplorer({ roadmaps }: { roadmaps: RoadmapSummary[] }) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | RoadmapLevel>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roadmaps.filter((item) => {
      const matchesLevel = levelFilter === "all" || item.level === levelFilter;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesLevel && matchesSearch;
    });
  }, [roadmaps, search, levelFilter]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, skill, or keyword (e.g. Next.js, Backend)…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
                type="button"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5">
            {LEVELS.map((lvl) => {
              const active = levelFilter === lvl.value;
              return (
                <button
                  key={lvl.value}
                  onClick={() => setLevelFilter(lvl.value)}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filtered.length}</strong> of {roadmaps.length}{" "}
            {roadmaps.length === 1 ? "roadmap" : "roadmaps"}
          </span>

          {(search || levelFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setLevelFilter("all");
              }}
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <RoadmapCard key={item.id} roadmap={item} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">No matching roadmaps</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Try adjusting your search keywords or switching back to &ldquo;All Levels&rdquo;.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                setSearch("");
                setLevelFilter("all");
              }}
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
