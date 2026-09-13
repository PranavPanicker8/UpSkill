import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDuration, formatLevel, percentage, type RoadmapSectionItem } from "@/lib/roadmaps";
import { ProgressBar } from "@/components/progress-bar";
import { TaskItemView } from "@/components/task-item-view";
import { ActionForm } from "@/components/forms/action-form";
import { followRoadmap, unfollowRoadmap } from "@/app/actions/roadmaps";
import { RouteIndicator, type NodeState } from "@/components/route-indicator";
import UpvoteButton from "@/components/upvote-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("roadmaps")
    .select("title, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Path Not Found | Upskill" };
  return {
    title: `${data.title} | Upskill Path`,
    description: data.description.slice(0, 160),
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  // Fetch roadmap with author profile
  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select(
      `
      id,
      creator_id,
      title,
      slug,
      description,
      cover_image_url,
      status,
      level,
      estimated_duration_minutes,
      created_at,
      updated_at,
      published_at,
      profiles!creator_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !roadmap) {
    notFound();
  }

  // Access control
  const isCreator = userId === roadmap.creator_id;
  if (roadmap.status !== "published" && !isCreator) {
    notFound();
  }

  // Fetch sections, tasks, resources
  const { data: sectionsData } = await supabase
    .from("roadmap_sections")
    .select(
      `
      id,
      roadmap_id,
      title,
      description,
      position,
      tasks (
        id,
        section_id,
        title,
        description,
        position,
        estimated_minutes,
        task_resources (
          id,
          task_id,
          title,
          url,
          resource_type,
          position
        )
      )
    `
    )
    .eq("roadmap_id", roadmap.id)
    .order("position", { ascending: true });

  const sections: RoadmapSectionItem[] = (sectionsData || []).map((sec: any) => ({
    ...sec,
    tasks: (sec.tasks || []).sort((a: any, b: any) => a.position - b.position).map((t: any) => ({
      ...t,
      task_resources: (t.task_resources || []).sort((a: any, b: any) => a.position - b.position),
    })),
  }));

  const allTaskIds = sections.flatMap((s) => (s.tasks || []).map((t) => t.id));
  const totalTasks = allTaskIds.length;

  let isFollowing = false;
  let completedTaskIds = new Set<string>();

  if (userId) {
    const { data: followRecord } = await supabase
      .from("roadmap_followers")
      .select("student_id")
      .eq("roadmap_id", roadmap.id)
      .eq("student_id", userId)
      .maybeSingle();

    isFollowing = Boolean(followRecord);

    if (isFollowing && allTaskIds.length > 0) {
      const { data: progressRecords } = await supabase
        .from("task_progress")
        .select("task_id")
        .eq("student_id", userId)
        .in("task_id", allTaskIds);

      completedTaskIds = new Set((progressRecords || []).map((p) => p.task_id));
    }
  }

  const completedCount = completedTaskIds.size;
  const progressPercent = percentage(completedCount, totalTasks);

  const { count: upvoteCount } = await supabase
  .from("roadmap_upvotes")
  .select("roadmap_id", { count: "exact", head: true })
  .eq("roadmap_id", roadmap.id);

// Check whether the current user has upvoted
let hasUpvoted = false;

if (userId) {
  const { data: upvoteRecord } = await supabase
    .from("roadmap_upvotes")
    .select("roadmap_id")
    .eq("roadmap_id", roadmap.id)
    .eq("user_id", userId)
    .maybeSingle();

  hasUpvoted = Boolean(upvoteRecord);
}

  const creator = Array.isArray(roadmap.profiles) ? roadmap.profiles[0] : roadmap.profiles;
  const creatorName = creator?.full_name || creator?.username || "Upskill Creator";
  const initial = creatorName[0]?.toUpperCase() || "U";

  // Compute active waypoint index
  let activeSectionFound = false;

  return (
    <div className="min-h-screen bg-[#fafbfc] py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-mono-code text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/roadmaps" className="hover:text-slate-900 transition-colors">
            Paths
          </Link>
          <span>/</span>
          <span className="truncate text-slate-800 font-medium">{roadmap.title}</span>
        </nav>

        {/* Creator Draft Banner */}
        {roadmap.status === "draft" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold">
                Draft Mode — This path is not yet visible to the public.
              </span>
            </div>
            <Link
              href={`/dashboard/roadmaps/${roadmap.id}/edit`}
              className="rounded-lg bg-amber-700 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-800"
            >
              Curriculum Editor →
            </Link>
          </div>
        )}

        {/* Path Header */}
        <header className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {formatLevel(roadmap.level)}
            </span>
            <span className="font-mono-code inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
              {formatDuration(roadmap.estimated_duration_minutes)}
            </span>
            <span className="font-mono-code inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
              {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
            </span>
            <span className="font-mono-code inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
              {sections.length} {sections.length === 1 ? "milestone" : "milestones"}
            </span>
          </div>

          <h1 className="font-serif-heading mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {roadmap.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line sm:text-base">
            {roadmap.description}
          </p>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="font-mono-code flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                {initial}
              </div>

              <div>
                <span className="text-slate-400">Curated by </span>
                <strong className="text-slate-800">{creatorName}</strong>
              </div>
            </div>

            {roadmap.published_at && (
              <span className="font-mono-code text-[11px] text-slate-400">
                Updated{" "}
                {new Date(roadmap.published_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <UpvoteButton
              roadmapId={roadmap.id}
              initialUpvoted={hasUpvoted}
              initialCount={upvoteCount ?? 0}
            />
          </div>
        </header>

        {/* Enrollment & Learning Waypoint Banner */}
        <div className="mt-6">
          {!userId ? (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 text-slate-800 sm:flex-row">
              <div>
                <h3 className="font-serif-heading text-base font-bold text-slate-900">
                  Ready to start this milestone path?
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Sign in to check off completed tasks, measure your progress, and resume anytime.
                </p>
              </div>
              <Link
                href={`/login?next=/roadmaps/${roadmap.slug}`}
                className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                Sign In to Follow Path
              </Link>
            </div>
          ) : !isFollowing ? (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-white p-6 shadow-xs sm:flex-row">
              <div>
                <h3 className="font-serif-heading text-base font-bold text-slate-900">
                  Begin this path
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Add this path to your personal learning dashboard and start checking off milestones.
                </p>
              </div>
              <ActionForm
                action={followRoadmap}
                submitLabel="Start Learning Path →"
                pendingLabel="Starting…"
                tone="accent"
              >
                <input type="hidden" name="roadmapId" value={roadmap.id} />
                <input type="hidden" name="roadmapSlug" value={roadmap.slug} />
              </ActionForm>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <RouteIndicator
                      state={progressPercent === 100 ? "complete" : "current"}
                      variant="sm"
                      label={progressPercent === 100 ? "Path Completed" : "In Progress"}
                    />
                  </div>
                  <p className="mt-1.5 font-mono-code text-xs text-slate-600">
                    Completed <strong>{completedCount}</strong> of <strong>{totalTasks}</strong> tasks ({progressPercent}%)
                  </p>
                </div>
                <ActionForm
                  action={unfollowRoadmap}
                  submitLabel="Leave Path"
                  pendingLabel="Leaving…"
                  tone="secondary"
                >
                  <input type="hidden" name="roadmapId" value={roadmap.id} />
                  <input type="hidden" name="roadmapSlug" value={roadmap.slug} />
                </ActionForm>
              </div>
              <div className="mt-4">
                <ProgressBar value={progressPercent} />
              </div>
            </div>
          )}
        </div>

        {/* CURRICULUM WITH VERTICAL PATH SPINE */}
        <section className="mt-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-serif-heading text-2xl font-bold tracking-tight text-slate-900">
              Curriculum Path
            </h2>
            <span className="font-mono-code text-xs font-medium text-slate-500">
              {sections.length} Milestones
            </span>
          </div>

          {sections.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-700">No milestones published yet.</p>
              <p className="mt-1 text-xs">The creator is still curating this path.</p>
            </div>
          ) : (
            <div className="mt-6">
              {sections.map((section, secIdx) => {
                const secTasks = section.tasks || [];
                const secCompleted = secTasks.filter((t) => completedTaskIds.has(t.id)).length;
                const isSecComplete = secTasks.length > 0 && secCompleted === secTasks.length;

                // Determine node state
                let nodeState: NodeState = "locked";
                if (isSecComplete) {
                  nodeState = "complete";
                } else if (!activeSectionFound && isFollowing) {
                  nodeState = "current";
                  activeSectionFound = true;
                } else if (!isFollowing && secIdx === 0) {
                  nodeState = "current";
                }

                const isFirst = secIdx === 0;
                const isLast = secIdx === sections.length - 1;

                return (
                  <div key={section.id} className="relative flex gap-4 sm:gap-6">
                    {/* Visual Spine Rail */}
                    <div className="hidden sm:block">
                      <RouteIndicator
                        state={nodeState}
                        variant="rail"
                        stepNumber={secIdx + 1}
                        isFirst={isFirst}
                        isLast={isLast}
                        className="w-8"
                      />
                    </div>

                    {/* Milestone Content Container */}
                    <div className="flex-1 pb-10">
                      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
                        {/* Milestone Header */}
                        <div className="border-b border-slate-100 bg-slate-50/70 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                              Milestone 0{secIdx + 1}
                            </span>
                            {isFollowing && secTasks.length > 0 && (
                              <span className="font-mono-code text-xs text-slate-500">
                                {secCompleted}/{secTasks.length} done
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif-heading mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                            {section.title}
                          </h3>
                          {section.description && (
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                              {section.description}
                            </p>
                          )}
                        </div>

                        {/* Nested Tasks */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {secTasks.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No tasks in this milestone.</p>
                          ) : (
                            secTasks.map((task) => (
                              <TaskItemView
                                key={task.id}
                                task={task}
                                isCompleted={completedTaskIds.has(task.id)}
                                isFollowing={isFollowing}
                                roadmapSlug={roadmap.slug}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
