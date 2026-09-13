import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionForm, CompactActionForm } from "@/components/forms/action-form";
import { updateRoadmap, toggleRoadmapPublication } from "@/app/actions/roadmaps";
import { DeleteRoadmapButton } from "@/components/delete-roadmap-button";
import { SectionCard } from "@/components/editor/section-card";
import { AddSectionForm } from "@/components/editor/add-section-form";
import { type RoadmapSectionItem } from "@/lib/roadmaps";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Curriculum Editor | Upskill",
  description: "Author and structure learning milestones, tasks, and materials.",
};

export default async function EditRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  // Fetch roadmap ensuring current user is the author
  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", id)
    .eq("creator_id", userId)
    .maybeSingle();

  if (error || !roadmap) {
    notFound();
  }

  // Fetch sections, tasks, and resources
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

  const isPublished = roadmap.status === "published";

  return (
    <div className="min-h-screen bg-[#fafbfc] py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Learning Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/roadmaps/${roadmap.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Public Preview ↗
            </Link>

            <CompactActionForm
              action={toggleRoadmapPublication}
              label={isPublished ? "Unpublish" : "Publish Path"}
              pendingLabel="Saving…"
              tone={isPublished ? "secondary" : "primary"}
            >
              <input type="hidden" name="roadmapId" value={roadmap.id} />
              <input type="hidden" name="currentStatus" value={roadmap.status} />
            </CompactActionForm>

            <DeleteRoadmapButton roadmapId={roadmap.id} title={roadmap.title} />
          </div>
        </div>

        {/* Path Title Banner */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 font-mono-code text-[10px] font-semibold uppercase tracking-wider ${
                isPublished
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {isPublished ? "Published Path" : "Draft Mode"}
            </span>
            <span className="font-mono-code text-xs text-slate-400">
              slug: <code className="text-slate-700">{roadmap.slug}</code>
            </span>
          </div>

          <h1 className="font-serif-heading mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {roadmap.title}
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Structure sequential milestones, attach authoritative materials, and curate the developer journey.
          </p>
        </div>

        {/* SECTION 1: PATH METADATA SETTINGS */}
        <div className="mt-8 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <h2 className="font-serif-heading text-lg font-bold tracking-tight text-slate-900">
            Path Overview & Settings
          </h2>
          <p className="text-xs text-slate-500">
            Define high-level description, target difficulty level, and total expected duration.
          </p>

          <div className="mt-4">
            <ActionForm
              action={updateRoadmap}
              submitLabel="Save Overview"
              pendingLabel="Saving changes…"
              tone="primary"
            >
              <input type="hidden" name="roadmapId" value={roadmap.id} />

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Path Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={roadmap.title}
                    required
                    minLength={3}
                    maxLength={160}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    defaultValue={roadmap.description}
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Difficulty Level
                    </label>
                    <select
                      name="level"
                      defaultValue={roadmap.level || "intermediate"}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none sm:text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="estimatedDuration"
                      min={1}
                      defaultValue={roadmap.estimated_duration_minutes || ""}
                      placeholder="e.g. 900"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Cover Image URL <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    defaultValue={roadmap.cover_image_url || ""}
                    placeholder="https://images.example.com/cover.jpg"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>
            </ActionForm>
          </div>
        </div>

        {/* SECTION 2: CURRICULUM MILESTONE BUILDER */}
        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-serif-heading text-xl font-bold tracking-tight text-slate-900">
                Curriculum Milestones
              </h2>
              <p className="text-xs text-slate-500">
                Organize sequential chapters, individual deliverables, and learning links.
              </p>
            </div>
            <span className="font-mono-code text-xs font-semibold text-slate-500">
              {sections.length} {sections.length === 1 ? "Milestone" : "Milestones"}
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {sections.map((section, idx) => (
              <SectionCard key={section.id} section={section} index={idx} />
            ))}

            <AddSectionForm roadmapId={roadmap.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
