import type {
  Project,
  Alert,
  TeamMember,
  ActivityLogEntry,
  DashboardSummary,
  ProjectPhase,
} from "./types";

const CLICKUP_API = "https://api.clickup.com/api/v2";
const WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID || "9017603275";
const SPACE_ID =
  process.env.CLICKUP_ACTIVE_PROJECTS_SPACE_ID || "90173230172";

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error("CLICKUP_API_TOKEN is not configured");
  return token;
}

async function clickupFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${CLICKUP_API}${endpoint}`, {
    headers: { Authorization: getToken() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ClickUp API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ClickUp response types
interface ClickUpTask {
  id: string;
  name: string;
  status: { status: string; type: string };
  due_date: string | null;
  date_updated: string;
  date_created: string;
  folder: { id: string; name: string };
  list: { id: string; name: string };
  assignees: {
    id: number;
    username: string;
    profilePicture: string | null;
  }[];
}

interface ClickUpFolder {
  id: string;
  name: string;
  lists: { id: string; name: string; task_count: number }[];
}

// In-memory cache
interface CachedDashboard {
  projects: Project[];
  alerts: Alert[];
  team: TeamMember[];
  activity: ActivityLogEntry[];
  timestamp: number;
}

let dashboardCache: CachedDashboard | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all tasks across the Active Projects space using the team task endpoint.
 * This is far more efficient than fetching tasks per list (~5 API calls vs ~280).
 */
async function fetchAllTasks(): Promise<ClickUpTask[]> {
  const allTasks: ClickUpTask[] = [];
  let page = 0;

  while (true) {
    const data = await clickupFetch<{ tasks: ClickUpTask[] }>(
      `/team/${WORKSPACE_ID}/task?space_ids[]=${SPACE_ID}&include_closed=true&subtasks=false&page=${page}`
    );
    allTasks.push(...data.tasks);

    // ClickUp returns up to 100 tasks per page
    if (data.tasks.length < 100) break;
    page++;

    // Safety limit
    if (page >= 30) break;
  }

  return allTasks;
}

function isOverdue(task: ClickUpTask): boolean {
  if (!task.due_date || task.status.type === "closed") return false;
  return new Date(parseInt(task.due_date)) < new Date();
}

function determinePhase(constructionTasks: ClickUpTask[]): ProjectPhase {
  if (constructionTasks.length === 0) return "planning";

  const completed = constructionTasks.filter(
    (t) => t.status.type === "closed"
  ).length;
  const ratio = completed / constructionTasks.length;

  if (ratio >= 0.9) return "complete";
  if (ratio >= 0.7) return "interior";
  if (ratio >= 0.5) return "structure";
  if (ratio >= 0.2) return "foundation";
  if (ratio >= 0.05) return "demo";
  return "planning";
}

function isListType(listName: string, prefix: string, keyword: string): boolean {
  return (
    listName.startsWith(prefix) ||
    listName.toLowerCase().includes(keyword)
  );
}

/**
 * Fetch and compute all dashboard data from ClickUp.
 * Results are cached in memory for 5 minutes.
 */
export async function fetchDashboardData(
  forceRefresh = false
): Promise<CachedDashboard> {
  if (
    !forceRefresh &&
    dashboardCache &&
    Date.now() - dashboardCache.timestamp < CACHE_TTL
  ) {
    return dashboardCache;
  }

  // Two API calls: folders (for project names) + all tasks in space
  const [foldersData, allTasks] = await Promise.all([
    clickupFetch<{ folders: ClickUpFolder[] }>(`/space/${SPACE_ID}/folder`),
    fetchAllTasks(),
  ]);

  // Group tasks by folder ID
  const tasksByFolder = new Map<string, ClickUpTask[]>();
  for (const task of allTasks) {
    const folderId = task.folder.id;
    if (!tasksByFolder.has(folderId)) tasksByFolder.set(folderId, []);
    tasksByFolder.get(folderId)!.push(task);
  }

  const projects: Project[] = [];
  const alerts: Alert[] = [];
  const teamMap = new Map<
    string,
    {
      name: string;
      tasks: number;
      projects: Set<string>;
      overdue: number;
    }
  >();
  const recentActivity: ActivityLogEntry[] = [];

  for (const folder of foldersData.folders) {
    // Skip test/template/old folders
    const folderLower = folder.name.toLowerCase();
    if (
      folderLower.includes("test") ||
      folderLower.includes("old") ||
      folderLower.includes("template")
    ) {
      continue;
    }

    const tasks = tasksByFolder.get(folder.id) || [];

    // Categorize tasks by list type
    const violationTasks = tasks.filter((t) =>
      isListType(t.list.name, "06.", "violation")
    );
    const permitTasks = tasks.filter((t) =>
      isListType(t.list.name, "04.", "permit")
    );
    const constructionTasks = tasks.filter((t) =>
      isListType(t.list.name, "05.", "construction")
    );

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status.type === "closed"
    ).length;
    const overdueTasks = tasks.filter(isOverdue).length;
    const openViolations = violationTasks.filter(
      (t) => t.status.type !== "closed"
    ).length;
    const totalPermits = permitTasks.length;
    const approvedPermits = permitTasks.filter(
      (t) =>
        t.status.status.toLowerCase().includes("approved") ||
        t.status.status.toLowerCase().includes("complete") ||
        t.status.type === "closed"
    ).length;
    const phase =
      totalTasks === completedTasks && totalTasks > 0
        ? "complete"
        : determinePhase(constructionTasks);

    // Health score
    let healthScore = 100;
    if (totalTasks > 0) {
      healthScore -= (overdueTasks / totalTasks) * 40;
    }
    healthScore -= Math.min(openViolations * 10, 30);
    if (totalPermits > 0) {
      healthScore -=
        ((totalPermits - approvedPermits) / totalPermits) * 20;
    }
    healthScore = Math.max(0, Math.round(healthScore));

    // Last activity
    const lastActivity =
      tasks.length > 0
        ? new Date(
            Math.max(...tasks.map((t) => parseInt(t.date_updated)))
          ).toISOString()
        : null;

    projects.push({
      id: folder.id,
      clickup_folder_id: folder.id,
      address: folder.name,
      phase,
      health_score: healthScore,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      overdue_tasks: overdueTasks,
      open_violations: openViolations,
      total_permits: totalPermits,
      approved_permits: approvedPermits,
      budget_total: 0,
      budget_spent: 0,
      last_activity_at: lastActivity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Generate alerts for critical conditions
    if (openViolations > 0) {
      alerts.push({
        id: `alert-violation-${folder.id}`,
        project_id: folder.id,
        type: "critical",
        source: "clickup",
        title: `${openViolations} open violation(s) — ${folder.name}`,
        description: `Project has ${openViolations} unresolved violation(s) that require immediate attention.`,
        link: `https://app.clickup.com/${WORKSPACE_ID}/v/li/${folder.id}`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    if (overdueTasks >= 3) {
      alerts.push({
        id: `alert-overdue-${folder.id}`,
        project_id: folder.id,
        type: overdueTasks >= 8 ? "critical" : "warning",
        source: "clickup",
        title: `${overdueTasks} overdue tasks — ${folder.name}`,
        description: `Project has ${overdueTasks} tasks past their due date that need attention.`,
        link: null,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    // Track team members from assignees
    for (const task of tasks) {
      if (task.status.type === "closed") continue;
      for (const assignee of task.assignees) {
        const key = String(assignee.id);
        if (!teamMap.has(key)) {
          teamMap.set(key, {
            name: assignee.username || `User ${assignee.id}`,
            tasks: 0,
            projects: new Set(),
            overdue: 0,
          });
        }
        const member = teamMap.get(key)!;
        member.tasks++;
        member.projects.add(folder.id);
        if (isOverdue(task)) member.overdue++;
      }
    }

    // Collect recent activity from most recently updated tasks
    const recentTasks = [...tasks]
      .sort((a, b) => parseInt(b.date_updated) - parseInt(a.date_updated))
      .slice(0, 2);

    for (const task of recentTasks) {
      recentActivity.push({
        id: `activity-${task.id}`,
        project_id: folder.id,
        user_name: task.assignees[0]?.username || null,
        action: `${task.status.type === "closed" ? "Completed" : "Updated"}: ${task.name}`,
        details: null,
        source: "clickup",
        created_at: new Date(parseInt(task.date_updated)).toISOString(),
      });
    }
  }

  // Sort alerts: unread critical first
  alerts.sort((a, b) => {
    const priority = { critical: 0, warning: 1, info: 2 };
    return (
      (priority[a.type as keyof typeof priority] ?? 2) -
      (priority[b.type as keyof typeof priority] ?? 2)
    );
  });

  // Build team members array
  const team: TeamMember[] = Array.from(teamMap.entries())
    .map(([key, data]) => ({
      id: `tm-${key}`,
      name: data.name,
      active_tasks: data.tasks,
      projects_assigned: data.projects.size,
      overdue_tasks: data.overdue,
    }))
    .sort((a, b) => b.active_tasks - a.active_tasks);

  // Sort activity by recency
  recentActivity.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const result: CachedDashboard = {
    projects,
    alerts,
    team,
    activity: recentActivity.slice(0, 50),
    timestamp: Date.now(),
  };

  dashboardCache = result;
  return result;
}

export function computeSummary(
  projects: Project[],
  unreadAlerts: number
): DashboardSummary {
  const projectsByPhase: Record<ProjectPhase, number> = {
    planning: 0,
    demo: 0,
    foundation: 0,
    structure: 0,
    interior: 0,
    complete: 0,
  };

  let totalHealth = 0;
  let totalOverdue = 0;
  let totalViolations = 0;
  let totalBudget = 0;
  let totalSpent = 0;

  for (const p of projects) {
    projectsByPhase[p.phase]++;
    totalHealth += p.health_score;
    totalOverdue += p.overdue_tasks;
    totalViolations += p.open_violations;
    totalBudget += p.budget_total;
    totalSpent += p.budget_spent;
  }

  return {
    total_projects: projects.length,
    projects_by_phase: projectsByPhase,
    overall_health_score:
      projects.length > 0 ? Math.round(totalHealth / projects.length) : 0,
    total_overdue_tasks: totalOverdue,
    total_open_violations: totalViolations,
    total_budget: totalBudget,
    total_spent: totalSpent,
    unread_alerts: unreadAlerts,
  };
}
