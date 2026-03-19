import type {
  Project,
  Alert,
  ActivityLogEntry,
  DashboardSummary,
  TeamMember,
  ProjectFile,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getDashboardSummary: () => fetchAPI<DashboardSummary>("/api/dashboard/summary"),

  getProjects: () => fetchAPI<Project[]>("/api/projects"),

  getProject: (id: string) => fetchAPI<Project>(`/api/projects/${id}`),

  getAlerts: (unreadOnly = false) =>
    fetchAPI<Alert[]>(`/api/alerts${unreadOnly ? "?unread=true" : ""}`),

  markAlertRead: (id: string) =>
    fetchAPI<void>(`/api/alerts/${id}/read`, { method: "POST" }),

  getActivity: (page = 1, limit = 50) =>
    fetchAPI<ActivityLogEntry[]>(`/api/activity?page=${page}&limit=${limit}`),

  getTeamWorkload: () => fetchAPI<TeamMember[]>("/api/team/workload"),

  getRecentFiles: () => fetchAPI<ProjectFile[]>("/api/files/recent"),
};
