"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isHttpUrl, isUuid, roadmapLevels, resourceTypes } from "@/lib/roadmaps";

type ActionResult = { error?: string; success?: string };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value: string) {
  if (!value) return null;
  const result = Number(value);
  return Number.isInteger(result) && result > 0 ? result : undefined;
}

async function authenticatedClient(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; userId: string } | ActionResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return userId ? { supabase, userId } : { error: "Please sign in to continue." };
}

function failure(error: { message: string } | null, fallback: string): ActionResult {
  return { error: error?.message || fallback };
}

function refreshRoadmaps() {
  revalidatePath("/");
  revalidatePath("/roadmaps");
  revalidatePath("/dashboard", "layout");
}

export async function followRoadmap(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const roadmapId = text(formData, "roadmapId");
  const roadmapSlug = text(formData, "roadmapSlug");
  if (!isUuid(roadmapId)) return { error: "That roadmap is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;

  const { error } = await session.supabase
    .from("roadmap_followers")
    .insert({ roadmap_id: roadmapId, student_id: session.userId });

  if (error && error.code !== "23505") return failure(error, "Unable to start this path.");
  refreshRoadmaps();
  if (roadmapSlug) revalidatePath(`/roadmaps/${roadmapSlug}`);
  return { success: "Path added to your learning." };
}

export async function unfollowRoadmap(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const roadmapId = text(formData, "roadmapId");
  const roadmapSlug = text(formData, "roadmapSlug");
  if (!isUuid(roadmapId)) return { error: "That roadmap is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;

  const { error } = await session.supabase
    .from("roadmap_followers")
    .delete()
    .eq("roadmap_id", roadmapId)
    .eq("student_id", session.userId);

  if (error) return failure(error, "Unable to stop this path.");
  refreshRoadmaps();
  if (roadmapSlug) revalidatePath(`/roadmaps/${roadmapSlug}`);
  return { success: "Path removed from your learning." };
}

export async function toggleTaskProgress(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const taskId = text(formData, "taskId");
  const roadmapSlug = text(formData, "roadmapSlug");
  if (!isUuid(taskId)) return { error: "That task is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;

  const { data: existing, error: lookupError } = await session.supabase
    .from("task_progress")
    .select("task_id")
    .eq("task_id", taskId)
    .eq("student_id", session.userId)
    .maybeSingle();

  if (lookupError) return failure(lookupError, "Unable to update this task.");
  const { error } = existing
    ? await session.supabase.from("task_progress").delete().eq("task_id", taskId).eq("student_id", session.userId)
    : await session.supabase.from("task_progress").insert({ task_id: taskId, student_id: session.userId });

  if (error) return failure(error, "You need to follow this path before updating progress.");
  revalidatePath("/dashboard", "layout");
  if (roadmapSlug) revalidatePath(`/roadmaps/${roadmapSlug}`);
  return { success: existing ? "Task marked incomplete." : "Task completed." };
}

export async function createRoadmap(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const level = text(formData, "level");
  const duration = positiveInteger(text(formData, "estimatedDuration"));
  const coverImageUrl = text(formData, "coverImageUrl");
  if (title.length < 3 || title.length > 160) return { error: "Title must be between 3 and 160 characters." };
  if (description.length < 10 || description.length > 5000) return { error: "Description must be between 10 and 5,000 characters." };
  if (level && !roadmapLevels.includes(level as (typeof roadmapLevels)[number])) return { error: "Choose a valid level." };
  if (duration === undefined) return { error: "Estimated duration must be a whole number of minutes." };
  if (coverImageUrl && !isHttpUrl(coverImageUrl)) return { error: "Cover image must be a valid http(s) URL." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "roadmap";
  const slug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
  const { data, error } = await session.supabase
    .from("roadmaps")
    .insert({
      creator_id: session.userId,
      title,
      slug,
      description,
      level: level || null,
      estimated_duration_minutes: duration ?? null,
      cover_image_url: coverImageUrl || null,
    })
    .select("id")
    .single();

  if (error || !data) return failure(error, "Unable to create the path.");
  refreshRoadmaps();
  redirect(`/dashboard/roadmaps/${data.id}/edit`);
}

export async function updateRoadmap(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "roadmapId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const level = text(formData, "level");
  const duration = positiveInteger(text(formData, "estimatedDuration"));
  const coverImageUrl = text(formData, "coverImageUrl");
  if (!isUuid(id)) return { error: "That path is not valid." };
  if (title.length < 3 || title.length > 160) return { error: "Title must be between 3 and 160 characters." };
  if (description.length < 10 || description.length > 5000) return { error: "Description must be between 10 and 5,000 characters." };
  if (level && !roadmapLevels.includes(level as (typeof roadmapLevels)[number])) return { error: "Choose a valid level." };
  if (duration === undefined) return { error: "Estimated duration must be a whole number of minutes." };
  if (coverImageUrl && !isHttpUrl(coverImageUrl)) return { error: "Cover image must be a valid http(s) URL." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase
    .from("roadmaps")
    .update({ title, description, level: level || null, estimated_duration_minutes: duration ?? null, cover_image_url: coverImageUrl || null })
    .eq("id", id);
  if (error) return failure(error, "Unable to save this path.");
  refreshRoadmaps();
  return { success: "Path details saved." };
}

export async function toggleRoadmapPublication(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "roadmapId");
  const currentStatus = text(formData, "currentStatus");
  if (!isUuid(id) || !["draft", "published"].includes(currentStatus)) return { error: "That path is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const status = currentStatus === "published" ? "draft" : "published";
  const { error } = await session.supabase.from("roadmaps").update({ status }).eq("id", id);
  if (error) return failure(error, "Unable to update publication status.");
  refreshRoadmaps();
  return { success: status === "published" ? "Path published." : "Path moved to draft." };
}

export async function deleteRoadmap(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "roadmapId");
  if (!isUuid(id)) return { error: "That path is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("roadmaps").delete().eq("id", id);
  if (error) return failure(error, "Unable to delete this path.");
  refreshRoadmaps();
  redirect("/dashboard");
}

export async function createSection(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const roadmapId = text(formData, "roadmapId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!isUuid(roadmapId) || !title || title.length > 160) return { error: "Add a section title of up to 160 characters." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { data: sections, error: lookupError } = await session.supabase
    .from("roadmap_sections").select("position").eq("roadmap_id", roadmapId).order("position", { ascending: false }).limit(1);
  if (lookupError) return failure(lookupError, "Unable to add a section.");
  const position = (sections?.[0]?.position ?? -1) + 1;
  const { error } = await session.supabase.from("roadmap_sections").insert({ roadmap_id: roadmapId, title, description: description || null, position });
  if (error) return failure(error, "Unable to add a section.");
  revalidatePath("/dashboard", "layout");
  return { success: "Section added." };
}

export async function updateSection(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "sectionId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!isUuid(id) || !title || title.length > 160) return { error: "Add a section title of up to 160 characters." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("roadmap_sections").update({ title, description: description || null }).eq("id", id);
  if (error) return failure(error, "Unable to save this section.");
  revalidatePath("/dashboard", "layout");
  return { success: "Section saved." };
}

export async function deleteSection(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "sectionId");
  if (!isUuid(id)) return { error: "That section is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("roadmap_sections").delete().eq("id", id);
  if (error) return failure(error, "Unable to delete this section.");
  revalidatePath("/dashboard", "layout");
  return { success: "Section deleted." };
}

export async function createTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const sectionId = text(formData, "sectionId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const minutes = positiveInteger(text(formData, "estimatedMinutes"));
  if (!isUuid(sectionId) || !title || title.length > 200) return { error: "Add a task title of up to 200 characters." };
  if (minutes === undefined) return { error: "Estimated minutes must be a whole number." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { data: tasks, error: lookupError } = await session.supabase
    .from("tasks").select("position").eq("section_id", sectionId).order("position", { ascending: false }).limit(1);
  if (lookupError) return failure(lookupError, "Unable to add a task.");
  const position = (tasks?.[0]?.position ?? -1) + 1;
  const { error } = await session.supabase.from("tasks").insert({ section_id: sectionId, title, description: description || null, estimated_minutes: minutes ?? null, position });
  if (error) return failure(error, "Unable to add a task.");
  revalidatePath("/dashboard", "layout");
  return { success: "Task added." };
}

export async function updateTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "taskId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const minutes = positiveInteger(text(formData, "estimatedMinutes"));
  if (!isUuid(id) || !title || title.length > 200) return { error: "Add a task title of up to 200 characters." };
  if (minutes === undefined) return { error: "Estimated minutes must be a whole number." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("tasks").update({ title, description: description || null, estimated_minutes: minutes ?? null }).eq("id", id);
  if (error) return failure(error, "Unable to save this task.");
  revalidatePath("/dashboard", "layout");
  return { success: "Task saved." };
}

export async function deleteTask(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "taskId");
  if (!isUuid(id)) return { error: "That task is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("tasks").delete().eq("id", id);
  if (error) return failure(error, "Unable to delete this task.");
  revalidatePath("/dashboard", "layout");
  return { success: "Task deleted." };
}

export async function createResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const taskId = text(formData, "taskId");
  const title = text(formData, "title");
  const url = text(formData, "url");
  const resourceType = text(formData, "resourceType");
  if (!isUuid(taskId) || !title || title.length > 200 || !isHttpUrl(url)) return { error: "Provide a resource title and valid http(s) link." };
  if (!resourceTypes.includes(resourceType as (typeof resourceTypes)[number])) return { error: "Choose a valid resource type." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { data: resources, error: lookupError } = await session.supabase
    .from("task_resources").select("position").eq("task_id", taskId).order("position", { ascending: false }).limit(1);
  if (lookupError) return failure(lookupError, "Unable to add this resource.");
  const position = (resources?.[0]?.position ?? -1) + 1;
  const { error } = await session.supabase.from("task_resources").insert({ task_id: taskId, title, url, resource_type: resourceType, position });
  if (error) return failure(error, "Unable to add this resource.");
  revalidatePath("/dashboard", "layout");
  return { success: "Resource added." };
}

export async function updateResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "resourceId");
  const title = text(formData, "title");
  const url = text(formData, "url");
  const resourceType = text(formData, "resourceType");
  if (!isUuid(id) || !title || title.length > 200 || !isHttpUrl(url)) return { error: "Provide a resource title and valid http(s) link." };
  if (!resourceTypes.includes(resourceType as (typeof resourceTypes)[number])) return { error: "Choose a valid resource type." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("task_resources").update({ title, url, resource_type: resourceType }).eq("id", id);
  if (error) return failure(error, "Unable to save this resource.");
  revalidatePath("/dashboard", "layout");
  return { success: "Resource saved." };
}

export async function deleteResource(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = text(formData, "resourceId");
  if (!isUuid(id)) return { error: "That resource is not valid." };
  const session = await authenticatedClient();
  if (!("supabase" in session)) return session;
  const { error } = await session.supabase.from("task_resources").delete().eq("id", id);
  if (error) return failure(error, "Unable to delete this resource.");
  revalidatePath("/dashboard", "layout");
  return { success: "Resource deleted." };
}

export async function toggleRoadmapUpvote(roadmapId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upvote." };
  }

  const { data: existing } = await supabase
    .from("roadmap_upvotes")
    .select("roadmap_id")
    .eq("roadmap_id", roadmapId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("roadmap_upvotes")
      .delete()
      .eq("roadmap_id", roadmapId)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    return { upvoted: false };
  }

  const { error } = await supabase
    .from("roadmap_upvotes")
    .insert({
      roadmap_id: roadmapId,
      user_id: user.id,
    });

  if (error) {
    return { error: error.message };
  }

  return { upvoted: true };
}
