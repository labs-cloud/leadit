export interface Project {
  id: string;
  clickup_folder_id: string;
  address: string;
  phase: ProjectPhase;
  health_score: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  open_violations: number;
  total_permits: number;
  approved_permits: number;
  budget_total: number;
  budget_spent: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectPhase =
  | "planning"
  | "demo"
  | "foundation"
  | "structure"
  | "interior"
  | "complete";

export interface Alert {
  id: string;
  project_id: string | null;
  type: "critical" | "warning" | "info";
  source: "clickup" | "onedrive" | "whatsapp";
  title: string;
  description: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
  project?: Project;
}

export interface WhatsAppMessage {
  id: string;
  project_id: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  message_text: string | null;
  has_media: boolean;
  media_url: string | null;
  is_urgent: boolean;
  created_at: string;
  project?: Project;
}

export interface ProjectFile {
  id: string;
  project_id: string | null;
  file_name: string;
  file_type: string | null;
  onedrive_id: string | null;
  folder_path: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  project_id: string | null;
  user_name: string | null;
  action: string;
  details: Record<string, unknown> | null;
  source: string;
  created_at: string;
  project?: Project;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar_url?: string;
  active_tasks: number;
  projects_assigned: number;
  overdue_tasks: number;
}

export interface DashboardSummary {
  total_projects: number;
  projects_by_phase: Record<ProjectPhase, number>;
  overall_health_score: number;
  total_overdue_tasks: number;
  total_open_violations: number;
  total_budget: number;
  total_spent: number;
  unread_alerts: number;
}

export type SortField = "name" | "phase" | "health_score" | "last_activity";
export type SortDirection = "asc" | "desc";

export interface ProjectFilter {
  phase?: ProjectPhase;
  hasViolations?: boolean;
  hasOverdueTasks?: boolean;
  search?: string;
}
