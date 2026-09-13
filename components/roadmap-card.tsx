import Link from "next/link";
import { formatDuration, formatLevel, type RoadmapSummary, type RoadmapLevel } from "@/lib/roadmaps";
import { RouteIndicator } from "./route-indicator";

function levelBadge(level: RoadmapLevel | null | undefined) {
  switch (level) {
    case "beginner":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "intermediate":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "advanced":
      return "border-purple-200 bg-purple-50 text-purple-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function RoadmapCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const creator = Array.isArray(roadmap.profiles) ? roadmap.profiles[0] : roadmap.profiles;
  const authorName = creator?.full_name || creator?.username || "Upskill";
  const initial = authorName[0]?.toUpperCase() || "U";

  return (
    <article className="group flex h-full flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-200 hover:shadow-sm">
      <div>
        {/* Top Badges & Waypoint State */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${levelBadge(
              roadmap.level
            )}`}
          >
            {formatLevel(roadmap.level)}
          </span>

          <div className="flex items-center gap-1 font-mono-code text-[11px] text-slate-500">
            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDuration(roadmap.estimated_duration_minutes)}</span>
          </div>
        </div>

        {/* Title in Fraunces Heading */}
        <h3 className="font-serif-heading mt-3.5 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
          <Link href={`/roadmaps/${roadmap.slug}`} className="focus:outline-none">
            {roadmap.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
          {roadmap.description}
        </p>
      </div>

      {/* Path Indicator & Footer */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 font-mono-code">
              {initial}
            </div>
            <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
              {authorName}
            </span>
          </div>

          <Link
            href={`/roadmaps/${roadmap.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
          >
            <span>View Path</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
