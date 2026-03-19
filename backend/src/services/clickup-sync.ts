import { clickup, ClickUpFolder, ClickUpTask } from "../lib/clickup";
import { supabase } from "../lib/supabase";

const SPACE_ID = process.env.CLICKUP_ACTIVE_PROJECTS_SPACE_ID || "90173230172";

// List name prefixes to identify types
const LIST_TYPES = {
  OVERVIEW: "00.",
  BUDGET: "01.",
  BIDDING: "02.",
  PLANS: "03.",
  PERMITS: "04.",
  CONSTRUCTION: "05.",
  VIOLATIONS: "06.",
  FINANCE: "07.",
};

interface ProjectMetrics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  open_violations: number;
  total_permits: number;
  approved_permits: number;
  budget_total: number;
  budget_spent: number;
  phase: string;
}

function determinePhase(tasks: ClickUpTask[], listName: string): string {
  const name = listName.toLowerCase();
  // Check task completion patterns across lists
  if (name.includes("05.")) {
    const completedRatio =
      tasks.filter((t) => t.status.type === "closed").length / Math.max(tasks.length, 1);
    if (completedRatio >= 0.9) return "interior";
    if (completedRatio >= 0.5) return "structure";
    if (completedRatio >= 0.1) return "foundation";
    return "demo";
  }
  return "planning";
}

function isOverdue(task: ClickUpTask): boolean {
  if (!task.due_date) return false;
  if (task.status.type === "closed") return false;
  return new Date(parseInt(task.due_date)) < new Date();
}

function extractCustomFieldValue(
  task: ClickUpTask,
  fieldName: string
): unknown {
  const field = task.custom_fields.find(
    (f) => f.name.toLowerCase() === fieldName.toLowerCase()
  );
  return field?.value;
}

async function calculateMetrics(
  folderId: string,
  lists: { id: string; name: string }[]
): Promise<ProjectMetrics> {
  const metrics: ProjectMetrics = {
    total_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    open_violations: 0,
    total_permits: 0,
    approved_permits: 0,
    budget_total: 0,
    budget_spent: 0,
    phase: "planning",
  };

  for (const list of lists) {
    try {
      const { tasks } = await clickup.getTasks(list.id);

      metrics.total_tasks += tasks.length;
      metrics.completed_tasks += tasks.filter(
        (t) => t.status.type === "closed"
      ).length;
      metrics.overdue_tasks += tasks.filter(isOverdue).length;

      // Violations list
      if (list.name.startsWith(LIST_TYPES.VIOLATIONS)) {
        metrics.open_violations = tasks.filter(
          (t) => t.status.type !== "closed"
        ).length;
      }

      // Permits list
      if (list.name.startsWith(LIST_TYPES.PERMITS)) {
        metrics.total_permits = tasks.length;
        metrics.approved_permits = tasks.filter(
          (t) =>
            t.status.status.toLowerCase().includes("approved") ||
            t.status.status.toLowerCase().includes("complete") ||
            t.status.type === "closed"
        ).length;
      }

      // Budget list
      if (list.name.startsWith(LIST_TYPES.BUDGET)) {
        for (const task of tasks) {
          const budgetAmt = extractCustomFieldValue(task, "Budget Amount");
          if (typeof budgetAmt === "number") {
            metrics.budget_total += budgetAmt;
          }
        }
      }

      // Construction list determines phase
      if (list.name.startsWith(LIST_TYPES.CONSTRUCTION)) {
        metrics.phase = determinePhase(tasks, list.name);
      }
    } catch (err) {
      console.error(`Error fetching tasks for list ${list.id}:`, err);
    }
  }

  return metrics;
}

async function checkForAlerts(
  projectId: string,
  projectAddress: string,
  metrics: ProjectMetrics
): Promise<void> {
  // Check for critical conditions
  if (metrics.open_violations > 0) {
    await supabase.from("alerts").upsert(
      {
        project_id: projectId,
        type: "critical",
        source: "clickup",
        title: `${metrics.open_violations} open violation(s) — ${projectAddress}`,
        description: `Project has ${metrics.open_violations} unresolved violation(s) that require attention.`,
      },
      { onConflict: "id" }
    );
  }

  // Check for overdue tasks warning
  if (metrics.overdue_tasks >= 5) {
    await supabase.from("alerts").insert({
      project_id: projectId,
      type: "warning",
      source: "clickup",
      title: `${metrics.overdue_tasks} overdue tasks — ${projectAddress}`,
      description: `Project has ${metrics.overdue_tasks} tasks past their due date.`,
    });
  }
}

export async function syncClickUp(): Promise<void> {
  console.log("[ClickUp Sync] Starting sync...");

  try {
    const { folders } = await clickup.getFolders(SPACE_ID);
    console.log(`[ClickUp Sync] Found ${folders.length} project folders`);

    for (const folder of folders) {
      try {
        const { lists } = await clickup.getLists(folder.id);
        const metrics = await calculateMetrics(
          folder.id,
          lists.map((l) => ({ id: l.id, name: l.name }))
        );

        // Calculate health score
        let healthScore = 100;
        if (metrics.total_tasks > 0) {
          healthScore -= (metrics.overdue_tasks / metrics.total_tasks) * 40;
        }
        healthScore -= Math.min(metrics.open_violations * 10, 30);
        if (metrics.total_permits > 0) {
          healthScore -=
            ((metrics.total_permits - metrics.approved_permits) /
              metrics.total_permits) *
            20;
        }
        if (
          metrics.budget_total > 0 &&
          metrics.budget_spent > metrics.budget_total
        ) {
          healthScore -=
            Math.min(
              ((metrics.budget_spent - metrics.budget_total) /
                metrics.budget_total) *
                10,
              10
            );
        }
        healthScore = Math.max(0, Math.round(healthScore));

        // Upsert project
        const { data: project, error } = await supabase
          .from("projects")
          .upsert(
            {
              clickup_folder_id: folder.id,
              address: folder.name,
              phase: metrics.phase,
              health_score: healthScore,
              ...metrics,
              last_activity_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "clickup_folder_id" }
          )
          .select()
          .single();

        if (error) {
          console.error(
            `[ClickUp Sync] Error upserting project ${folder.name}:`,
            error
          );
          continue;
        }

        // Check for alerts
        if (project) {
          await checkForAlerts(project.id, folder.name, metrics);
        }

        // Log activity
        await supabase.from("activity_log").insert({
          project_id: project?.id,
          action: `Synced project data: ${metrics.total_tasks} tasks, ${metrics.completed_tasks} completed`,
          source: "clickup",
        });

        console.log(
          `[ClickUp Sync] Synced: ${folder.name} (health: ${healthScore})`
        );
      } catch (err) {
        console.error(
          `[ClickUp Sync] Error processing folder ${folder.name}:`,
          err
        );
      }
    }

    console.log("[ClickUp Sync] Sync complete");
  } catch (err) {
    console.error("[ClickUp Sync] Fatal error:", err);
  }
}
