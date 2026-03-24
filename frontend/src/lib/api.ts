import type {
  Project,
  Alert,
  ActivityLogEntry,
  DashboardSummary,
  TeamMember,
} from "./types";

async function fetchAPI<T>(endpoint: string, forceRefresh = false): Promise<T> {
  const url = forceRefresh
    ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}refresh=true`
    : endpoint;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
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
  getDashboardSummary: (refresh = false) =>
    fetchAPI<DashboardSummary>("/api/dashboard/summary", refresh),

  getProjects: (refresh = false) =>
    fetchAPI<Project[]>("/api/projects", refresh),

  getAlerts: (refresh = false) =>
    fetchAPI<Alert[]>("/api/alerts", refresh),

  getActivity: (refresh = false) =>
    fetchAPI<ActivityLogEntry[]>("/api/activity", refresh),

  getTeamWorkload: (refresh = false) =>
    fetchAPI<TeamMember[]>("/api/team", refresh),
};
