import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RoadmapCard } from "@/components/roadmap-card";
import { type RoadmapSummary } from "@/lib/roadmaps";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upskill — Developer Learning Paths & Milestone Curricula",
  description: "Stop wondering what to learn next. Master modern software engineering with sequential, industry-crafted paths and vetted practical resources.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const signedIn = Boolean(claimData?.claims?.sub);

  const { data: featuredRoadmaps } = await supabase
    .from("roadmaps")
    .select("id, title, slug, description, level, estimated_duration_minutes, status, created_at, profiles!creator_id(username, full_name, avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  const roadmaps: RoadmapSummary[] = (featuredRoadmaps as unknown as RoadmapSummary[]) || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-slate-900 dark:bg-[#0f1016] dark:text-slate-100">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24 dark:border-slate-700/80 dark:bg-slate-900">
        {/* Subtle grid background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                <span>Industry-Crafted Developer Curricula</span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl sm:leading-[1.1] dark:text-slate-100">
                Stop wondering what to{" "}
                <span className="text-indigo-600 dark:text-indigo-400">learn next.</span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                Break out of tutorial overload. Upskill provides structured, milestone-driven paths with hand-picked documentation, real code patterns, and progress tracking designed for modern developers.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
                <Link
                  href="/roadmaps"
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Explore Paths →
                </Link>

                <Link
                  href={signedIn ? "/dashboard" : "/signup"}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500"
                >
                  {signedIn ? "Go to Dashboard" : "Create a Path"}
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-slate-500 lg:justify-start dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% Free Catalog</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Step-by-Step Milestones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Progress Persistence</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Interactive Simulated Path Preview */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
                {/* Mock Window Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">fullstack-roadmap.dev</span>
                  </div>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    67% Complete
                  </span>
                </div>

                {/* Progress bar preview */}
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50 dark:bg-slate-700 dark:ring-slate-600/50">
                    <div className="h-full w-2/3 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                  </div>
                </div>

                {/* Milestone 1 (Completed) */}
                <div className="mt-5 relative pl-6">
                  <div className="absolute left-1.5 top-2.5 -bottom-5 w-0.5 bg-emerald-300 dark:bg-emerald-700" />
                  <div className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 ring-4 ring-emerald-50 dark:ring-emerald-900/30">
                    <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. TypeScript & Architecture</span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-500">Completed</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Strict mode, discriminated unions, and modular patterns.</p>
                  </div>
                </div>

                {/* Milestone 2 (Active) */}
                <div className="mt-4 relative pl-6">
                  <div className="absolute left-1.5 top-2.5 -bottom-5 w-0.5 bg-slate-200 dark:bg-slate-600" />
                  <div className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3.5 shadow-2xs dark:border-indigo-800 dark:bg-indigo-900/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">2. Next.js 16 & Server Actions</span>
                      <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400">
                        In Progress
                      </span>
                    </div>
                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-600 text-white">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="line-through text-slate-500 dark:text-slate-500">Async request APIs & Proxy configuration</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-900 font-medium dark:text-slate-100">
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-indigo-500 bg-white dark:border-indigo-500 dark:bg-slate-700" />
                        <span>Supabase SSR session exchange & RLS integration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone 3 (Upcoming) */}
                <div className="mt-4 relative pl-6">
                  <div className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-300 ring-4 ring-slate-100 dark:bg-slate-600 dark:ring-slate-800" />
                  <div className="rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">3. Cloud Edge & Production Deploy</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Locked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 STEPS) */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Structured Methodology
            </span>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              How Upskill Works
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Learn faster and retain more with proven pedagogical milestones rather than endless disconnected video playlists.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-900 dark:bg-slate-700 dark:text-slate-100">
                01
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">Choose Your Path</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Pick a clear specialty track—from Full-Stack Next.js to Cloud Systems. Each path outlines clear prerequisites and duration expectations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                02
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">Work Through Milestones</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Every task is paired with authoritative documentation, targeted video walkthroughs, and repository templates so you avoid generic search rabbit holes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                03
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">Track & Prove Velocity</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Check off completed milestones, watch your progress bar advance, and maintain a permanent record of all skills you have mastered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ROADMAPS */}
      <section className="border-t border-slate-200/80 bg-white py-16 sm:py-20 dark:border-slate-700/80 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Curated Catalog
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                Featured Paths
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Explore popular learning paths created by senior engineers and community mentors.
              </p>
            </div>

            <Link
              href="/roadmaps"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span>Browse full catalog</span>
              <span>→</span>
            </Link>
          </div>

          {roadmaps.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center dark:border-slate-600 dark:bg-slate-800/60">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Path library is initializing.</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sign in to the dashboard to publish the first curriculum!</p>
              <div className="mt-4">
                <Link
                  href={signedIn ? "/dashboard" : "/signup"}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Create Path
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WHY UPSKILL */}
      <section className="border-t border-slate-200/80 py-16 sm:py-20 dark:border-slate-700/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Why Engineers Learn with Upskill
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              The modern web ecosystem is moving faster than static video courses. Here is how we differ.
            </p>
          </div>

          <div className="mt-10 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:items-center sm:p-6">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Tutorial Hell</span>
              <span className="text-xs text-rose-600 sm:col-span-1 dark:text-rose-400">Fragmented 40-hour video playlists with no direction.</span>
              <span className="text-xs font-medium text-slate-700 sm:col-span-1 sm:text-right dark:text-slate-300">
                <strong className="text-indigo-600 dark:text-indigo-400">Upskill:</strong> High-density, bite-sized tasks with immediate deliverables.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:items-center sm:p-6">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Resource Quality</span>
              <span className="text-xs text-rose-600 sm:col-span-1 dark:text-rose-400">Outdated medium articles and SEO-stuffed blogs.</span>
              <span className="text-xs font-medium text-slate-700 sm:col-span-1 sm:text-right dark:text-slate-300">
                <strong className="text-indigo-600 dark:text-indigo-400">Upskill:</strong> Official documentation, canonical GitHub repos, and vetted deep-dives.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:items-center sm:p-6">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Progress Accountability</span>
              <span className="text-xs text-rose-600 sm:col-span-1 dark:text-rose-400">Bookmarks forgotten in browser tabs.</span>
              <span className="text-xs font-medium text-slate-700 sm:col-span-1 sm:text-right dark:text-slate-300">
                <strong className="text-indigo-600 dark:text-indigo-400">Upskill:</strong> Persistent personal dashboard syncing checked milestones in real time.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="border-t border-slate-200/80 bg-slate-900 py-16 text-white dark:border-slate-700/80 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Start mastering your next technical stack today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300 dark:text-slate-400">
            Join developers using Upskill to navigate modern technology without the noise.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/roadmaps"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Browse Paths
            </Link>
            <Link
              href={signedIn ? "/dashboard" : "/signup"}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {signedIn ? "Go to Dashboard" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <svg className="h-3 w-3 text-indigo-400 dark:text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="5" cy="6" r="3" />
                <path d="M5 9v6" />
                <circle cx="5" cy="18" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Upskill</span>
            <span>— Industry-informed developer curricula.</span>
          </div>

          <p>© {new Date().getFullYear()} Upskill. Built with Next.js & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
