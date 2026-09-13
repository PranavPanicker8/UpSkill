import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, formatLevel, percentage } from "@/lib/roadmaps";
import { ProgressBar } from "@/components/progress-bar";
import { CompactActionForm } from "@/components/forms/action-form";
import { toggleRoadmapPublication, unfollowRoadmap } from "@/app/actions/roadmaps";
import { CreateRoadmapButton } from "@/components/create-roadmap-form";
import { DeleteRoadmapButton } from "@/components/delete-roadmap-button";
import { RouteIndicator, RouteTrail } from "@/components/route-indicator";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Learning Dashboard | Upskill",
  description: "Track your active learning paths, completed milestones, and authored paths.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const displayName = profile?.full_name || profile?.username || "Learner";

  // 2. Fetch enrolled/followed roadmaps
  const { data: followsData } = await supabase
    .from("roadmap_followers")
    .select(
      `
      roadmap_id,
      started_at,
      roadmaps (
        id,
        title,
        slug,
        description,
        level,
        estimated_duration_minutes,
        status,
        profiles (
          username,
          full_name
        )
      )
    `
    )
    .eq("student_id", userId);

  const followedRoadmaps = (followsData || [])
    .map((f: any) => f.roadmaps)
    .filter(Boolean);

  const followedRoadmapIds = followedRoadmaps.map((r: any) => r.id);

  // Calculate task progress per roadmap
  let progressMap = new Map<string, { total: number; completed: number }>();
  let totalOverallCompleted = 0;

  if (followedRoadmapIds.length > 0) {
    const { data: allSections } = await supabase
      .from("roadmap_sections")
      .select("id, roadmap_id, tasks (id)")
      .in("roadmap_id", followedRoadmapIds);

    const taskToRoadmap = new Map<string, string>();
    for (const sec of allSections || []) {
      for (const t of (sec as any).tasks || []) {
        taskToRoadmap.set(t.id, sec.roadmap_id);
        const current = progressMap.get(sec.roadmap_id) || { total: 0, completed: 0 };
        current.total += 1;
        progressMap.set(sec.roadmap_id, current);
      }
    }

    const allFollowedTaskIds = Array.from(taskToRoadmap.keys());
    if (allFollowedTaskIds.length > 0) {
      const { data: progressRecords } = await supabase
        .from("task_progress")
        .select("task_id")
        .eq("student_id", userId)
        .in("task_id", allFollowedTaskIds);

      totalOverallCompleted = (progressRecords || []).length;

      for (const p of progressRecords || []) {
        const rId = taskToRoadmap.get(p.task_id);
        if (rId) {
          const current = progressMap.get(rId) || { total: 0, completed: 0 };
          current.completed += 1;
          progressMap.set(rId, current);
        }
      }
    }
  }

  // 3. Fetch authored roadmaps (creator section)
  const { data: createdRoadmapsData } = await supabase
    .from("roadmaps")
    .select(
      `
      id,
      title,
      slug,
      description,
      level,
      estimated_duration_minutes,
      status,
      created_at,
      published_at,
      roadmap_sections (
        id,
        tasks (id)
      )
    `
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  const createdRoadmaps = createdRoadmapsData || [];

  return (
    <main className="min-h-screen bg-[#fafbfc] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Student Welcome & Statistics Header */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Student Learning Space</span>
              </div>

              <h1 className="font-serif-heading mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                {followedRoadmaps.length > 0
                  ? `You have ${followedRoadmaps.length} active learning ${
                      followedRoadmaps.length === 1 ? "path" : "paths"
                    } in progress with ${totalOverallCompleted} completed milestones.`
                  : "Pick a developer path from the catalog to begin your milestone journey."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/roadmaps"
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Browse Catalog
              </Link>
              <CreateRoadmapButton />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="text-[11px] font-medium text-slate-500">Active Paths</span>
              <p className="font-mono-code mt-0.5 text-xl font-bold text-indigo-600">
                {followedRoadmaps.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="text-[11px] font-medium text-slate-500">Tasks Completed</span>
              <p className="font-mono-code mt-0.5 text-xl font-bold text-emerald-600">
                {totalOverallCompleted}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <span className="text-[11px] font-medium text-slate-500">Authored Paths</span>
              <p className="font-mono-code mt-0.5 text-xl font-bold text-slate-800">
                {createdRoadmaps.length}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: MY LEARNING (STUDENT-FIRST DOMINANT AREA) */}
        <section className="mt-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-serif-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                My Learning Paths
              </h2>
              <p className="text-xs text-slate-500">
                Continue your active milestones and review completed achievements.
              </p>
            </div>
            {followedRoadmaps.length > 0 && (
              <Link
                href="/roadmaps"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Explore more paths
              </Link>
            )}
          </div>

          {followedRoadmaps.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-serif-heading mt-3 text-base font-bold text-slate-900">
                You are not enrolled in any paths yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                Explore our catalog of milestone-driven developer paths to start tracking your learning.
              </p>
              <div className="mt-5">
                <Link
                  href="/roadmaps"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  Explore Paths Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {followedRoadmaps.map((roadmap: any) => {
                const prog = progressMap.get(roadmap.id) || { total: 0, completed: 0 };
                const pct = percentage(prog.completed, prog.total);
                const isFinished = pct === 100 && prog.total > 0;
                const creator = Array.isArray(roadmap.profiles)
                  ? roadmap.profiles[0]
                  : roadmap.profiles;

                return (
                  <div
                    key={roadmap.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-indigo-200 hover:shadow-sm"
                  >
                    <div>
                      {/* Waypoint State & Level */}
                      <div className="flex items-center justify-between gap-2">
                        <RouteIndicator
                          state={isFinished ? "complete" : "current"}
                          variant="sm"
                          label={isFinished ? "Finished" : "Active"}
                        />
                        <span className="font-mono-code text-[11px] text-slate-500">
                          {formatDuration(roadmap.estimated_duration_minutes)}
                        </span>
                      </div>

                      <h3 className="font-serif-heading mt-3 text-base font-bold text-slate-900 line-clamp-2">
                        {roadmap.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        By {creator?.full_name || creator?.username || "Upskill"}
                      </p>

                      {/* Progress Bar & Trail */}
                      <div className="mt-4 rounded-lg bg-slate-50/80 p-3 border border-slate-100">
                        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600">
                          <span className="text-[11px] font-medium text-slate-500">Progress</span>
                          <span className="font-mono-code text-[11px] font-semibold text-slate-800">
                            {prog.completed}/{prog.total} tasks ({pct}%)
                          </span>
                        </div>
                        <ProgressBar value={pct} label={false} size="sm" />
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                      <CompactActionForm
                        action={unfollowRoadmap}
                        label="Leave"
                        pendingLabel="Leaving…"
                        tone="secondary"
                      >
                        <input type="hidden" name="roadmapId" value={roadmap.id} />
                      </CompactActionForm>

                      <Link
                        href={`/roadmaps/${roadmap.slug}`}
                        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                      >
                        Continue Path →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: CREATOR STUDIO (AUTHORED PATHS) */}
        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Creator Studio
              </h2>
              <p className="text-xs text-slate-500">
                Curricula authored by you. Manage milestones, tasks, and publication status.
              </p>
            </div>
            <CreateRoadmapButton />
          </div>

          {createdRoadmaps.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
              <p className="text-xs font-semibold text-slate-700">No authored paths yet.</p>
              <p className="mt-0.5 text-xs text-slate-500">Share your technical expertise by structuring a curriculum.</p>
              <div className="mt-4">
                <CreateRoadmapButton />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {createdRoadmaps.map((roadmap) => {
                const isPublished = roadmap.status === "published";
                const totalSections = (roadmap.roadmap_sections || []).length;
                const totalRoadmapTasks = (roadmap.roadmap_sections || []).reduce(
                  (acc: number, sec: any) => acc + (sec.tasks || []).length,
                  0
                );

                return (
                  <div
                    key={roadmap.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 font-mono-code text-[10px] font-semibold uppercase tracking-wider ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {formatLevel(roadmap.level)}
                        </span>
                        <span className="font-mono-code text-[11px] text-slate-400">
                          {totalSections} milestones • {totalRoadmapTasks} tasks
                        </span>
                      </div>

                      <h3 className="font-serif-heading mt-1 text-base font-bold text-slate-900 truncate">
                        {roadmap.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      <Link
                        href={`/roadmaps/${roadmap.slug}`}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Preview
                      </Link>

                      <Link
                        href={`/dashboard/roadmaps/${roadmap.id}/edit`}
                        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                      >
                        Edit Curriculum
                      </Link>

                      <CompactActionForm
                        action={toggleRoadmapPublication}
                        label={isPublished ? "Unpublish" : "Publish"}
                        pendingLabel="Saving…"
                        tone={isPublished ? "secondary" : "primary"}
                      >
                        <input type="hidden" name="roadmapId" value={roadmap.id} />
                        <input type="hidden" name="currentStatus" value={roadmap.status} />
                      </CompactActionForm>

                      <DeleteRoadmapButton roadmapId={roadmap.id} title={roadmap.title} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
