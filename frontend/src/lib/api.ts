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
    // Try to extract the server-side error message
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body.error) detail = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
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
