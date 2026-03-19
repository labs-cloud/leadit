import type {
  Project,
  Alert,
  ActivityLogEntry,
  DashboardSummary,
  TeamMember,
} from "./types";

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getDashboardSummary: () =>
    fetchAPI<DashboardSummary>("/api/dashboard/summary"),

  getProjects: () => fetchAPI<Project[]>("/api/projects"),

  getAlerts: () => fetchAPI<Alert[]>("/api/alerts"),

  getActivity: () => fetchAPI<ActivityLogEntry[]>("/api/activity"),

  getTeamWorkload: () => fetchAPI<TeamMember[]>("/api/team"),
};
