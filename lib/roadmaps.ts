export const roadmapLevels = ["beginner", "intermediate", "advanced"] as const;
export const resourceTypes = ["article", "video", "course", "documentation", "practice", "repository", "other"] as const;

export type RoadmapLevel = (typeof roadmapLevels)[number];
export type ResourceType = (typeof resourceTypes)[number];

export type ProfileSummary = {
  id?: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

export type RoadmapSummary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url?: string | null;
  status: "draft" | "published";
  level?: RoadmapLevel | null;
  estimated_duration_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  creator_id?: string;
  profiles?: ProfileSummary | ProfileSummary[] | null;
};

export type TaskResourceItem = {
  id: string;
  task_id: string;
  title: string;
  url: string;
  resource_type: ResourceType;
  position: number;
};

export type TaskItem = {
  id: string;
  section_id: string;
  title: string;
  description?: string | null;
  position: number;
  estimated_minutes?: number | null;
  task_resources?: TaskResourceItem[];
};

export type RoadmapSectionItem = {
  id: string;
  roadmap_id: string;
  title: string;
  description?: string | null;
  position: number;
  tasks?: TaskItem[];
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatLevel(level: string | null | undefined) {
  return level ? `${level[0].toUpperCase()}${level.slice(1)}` : "All levels";
}

export function percentage(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0;
}
