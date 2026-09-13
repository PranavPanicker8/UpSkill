import { createClient } from "@/lib/supabase/server";
import { RoadmapExplorer } from "@/components/roadmap-explorer";
import { type RoadmapSummary } from "@/lib/roadmaps";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore Developer Paths | Upskill",
  description: "Browse sequential, industry-crafted developer paths with vetted practical resources.",
};

export default async function RoadmapsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmaps")
    .select("id, title, slug, description, level, estimated_duration_minutes, status, created_at, profiles(username, full_name, avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const roadmaps: RoadmapSummary[] = (data as unknown as RoadmapSummary[]) || [];

  return (
    <main className="min-h-screen bg-[#fafbfc] py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Catalog Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>Curated Developer Paths</span>
              </div>
              <h1 className="font-serif-heading mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Explore Learning Paths
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Choose a structured curriculum from junior fundamentals to production system architecture.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 sm:self-auto"
            >
              <span>Author a path</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700" role="alert">
            Unable to load the roadmaps catalog. Please refresh the page.
          </div>
        )}

        {/* Interactive Explorer Toolbar & Grid */}
        <RoadmapExplorer roadmaps={roadmaps} />
      </div>
    </main>
  );
}
