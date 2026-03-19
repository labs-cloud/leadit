import type {
  Project,
  Alert,
  ActivityLogEntry,
  DashboardSummary,
  TeamMember,
  ProjectPhase,
} from "./types";

const phases: ProjectPhase[] = [
  "planning",
  "demo",
  "foundation",
  "structure",
  "interior",
  "complete",
];

const addresses = [
  "142 W 57th St, Manhattan",
  "88 Greenwich St, Manhattan",
  "315 E 46th St, Manhattan",
  "201 Park Ave S, Manhattan",
  "45-10 Court Square, LIC",
  "525 W 52nd St, Manhattan",
  "1120 Avenue of the Americas",
  "77 Water St, Manhattan",
  "330 W 42nd St, Manhattan",
  "480 Broadway, SoHo",
  "215 Chrystie St, Manhattan",
  "123 Atlantic Ave, Brooklyn",
  "900 3rd Ave, Manhattan",
  "50 West St, Manhattan",
  "275 Canal St, Manhattan",
  "410 E 61st St, Manhattan",
  "1601 Broadway, Manhattan",
  "230 W 39th St, Manhattan",
  "55 Hudson Yards, Manhattan",
  "100 Barclay St, Manhattan",
  "320 W 37th St, Manhattan",
  "445 Park Ave, Manhattan",
  "160 E 22nd St, Manhattan",
  "71-01 Austin St, Queens",
  "189 Schermerhorn St, Brooklyn",
  "350 5th Ave, Manhattan",
  "29-28 41st Ave, LIC",
  "180 Water St, Manhattan",
  "515 W 29th St, Manhattan",
  "401 Broadway, Manhattan",
  "250 Vesey St, Manhattan",
  "600 W 42nd St, Manhattan",
  "155 E 34th St, Manhattan",
  "42-09 28th St, LIC",
  "225 Liberty St, Manhattan",
  "501 7th Ave, Manhattan",
  "120 Riverside Blvd, Manhattan",
  "340 Flatbush Ave, Brooklyn",
  "85 Jay St, Brooklyn",
  "200 Central Park S, Manhattan",
  "430 E 58th St, Manhattan",
  "175 Greenwich St, Manhattan",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() + (max - min + 1)) * min || Math.floor(Math.random() * (max - min + 1)) + min;
}

export const mockProjects: Project[] = addresses.map((address, i) => {
  const phase = phases[i % phases.length];
  const totalTasks = randomInt(15, 80);
  const completedTasks = randomInt(0, totalTasks);
  const overdueTasks = phase === "complete" ? 0 : randomInt(0, 8);
  const openViolations = randomInt(0, 3);
  const totalPermits = randomInt(3, 12);
  const approvedPermits = randomInt(0, totalPermits);
  const budgetTotal = randomInt(200000, 5000000);
  const budgetSpent = randomInt(0, Math.floor(budgetTotal * 1.1));
  const daysAgo = randomInt(0, 14);

  let healthScore = 100;
  if (totalTasks > 0) healthScore -= (overdueTasks / totalTasks) * 40;
  healthScore -= Math.min(openViolations * 10, 30);
  if (totalPermits > 0)
    healthScore -= ((totalPermits - approvedPermits) / totalPermits) * 20;
  if (budgetSpent > budgetTotal)
    healthScore -= Math.min(((budgetSpent - budgetTotal) / budgetTotal) * 10, 10);
  healthScore = Math.max(0, Math.round(healthScore));

  return {
    id: `proj-${i + 1}`,
    clickup_folder_id: `folder-${900000 + i}`,
    address,
    phase,
    health_score: healthScore,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    overdue_tasks: overdueTasks,
    open_violations: openViolations,
    total_permits: totalPermits,
    approved_permits: approvedPermits,
    budget_total: budgetTotal,
    budget_spent: budgetSpent,
    last_activity_at: new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
});

export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    project_id: "proj-1",
    type: "critical",
    source: "clickup",
    title: "Stop Work Order — 142 W 57th St",
    description:
      "DOB issued a stop work order due to safety violations on the 3rd floor scaffolding. All work must cease immediately.",
    link: "https://app.clickup.com/t/abc123",
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-2",
    project_id: "proj-3",
    type: "critical",
    source: "whatsapp",
    title: "Urgent: Water main break at 315 E 46th St",
    description:
      "Site manager reports water main break in basement. Emergency plumber called. Need approval for emergency spend.",
    link: null,
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-3",
    project_id: "proj-5",
    type: "warning",
    source: "clickup",
    title: "Permit expiring in 5 days — 45-10 Court Square",
    description:
      "Building permit BIS-2024-1234 expires on March 24. Renewal application needs to be submitted.",
    link: "https://app.clickup.com/t/def456",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-4",
    project_id: "proj-2",
    type: "warning",
    source: "clickup",
    title: "8 overdue tasks — 88 Greenwich St",
    description: "Tasks overdue in Construction list including: framing inspection, electrical rough-in, HVAC duct installation.",
    link: "https://app.clickup.com/t/ghi789",
    is_read: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-5",
    project_id: "proj-7",
    type: "warning",
    source: "onedrive",
    title: "Missing plans — 1120 Avenue of the Americas",
    description: "No structural drawings found in the Plans folder. Required before foundation work can begin.",
    link: null,
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-6",
    project_id: "proj-4",
    type: "info",
    source: "clickup",
    title: "Milestone: Foundation complete — 201 Park Ave S",
    description: "All foundation tasks marked complete. Project moving to structure phase.",
    link: "https://app.clickup.com/t/jkl012",
    is_read: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-7",
    project_id: "proj-10",
    type: "info",
    source: "onedrive",
    title: "New plans uploaded — 480 Broadway",
    description: "Updated architectural drawings (Rev C) uploaded to Plans folder.",
    link: null,
    is_read: true,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-8",
    project_id: "proj-6",
    type: "critical",
    source: "clickup",
    title: "DOB Violation — 525 W 52nd St",
    description: "ECB violation issued for work without permit on 2nd floor. Fine: $10,000. Hearing date: April 5.",
    link: "https://app.clickup.com/t/mno345",
    is_read: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockActivity: ActivityLogEntry[] = [
  {
    id: "act-1",
    project_id: "proj-1",
    user_name: "Mike Rodriguez",
    action: "Task completed: Install temporary fencing",
    details: null,
    source: "clickup",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "act-2",
    project_id: "proj-3",
    user_name: "Sarah Chen",
    action: "Uploaded: Structural_Plans_Rev_B.pdf",
    details: null,
    source: "onedrive",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "act-3",
    project_id: "proj-5",
    user_name: "John Martinez",
    action: "WhatsApp: 'Concrete pour completed successfully'",
    details: null,
    source: "whatsapp",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "act-4",
    project_id: "proj-2",
    user_name: "David Kim",
    action: "Status changed: Framing → Inspection",
    details: null,
    source: "clickup",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-5",
    project_id: "proj-8",
    user_name: "Ana Lopez",
    action: "Permit approved: Electrical Work Permit",
    details: null,
    source: "clickup",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-6",
    project_id: "proj-4",
    user_name: "Tom Wilson",
    action: "Budget update: Added $45,000 change order",
    details: null,
    source: "clickup",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-7",
    project_id: "proj-12",
    user_name: "Lisa Park",
    action: "Uploaded: DOB_Inspection_Report.pdf",
    details: null,
    source: "onedrive",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-8",
    project_id: "proj-6",
    user_name: "Carlos Rivera",
    action: "Task created: Schedule DOB re-inspection",
    details: null,
    source: "clickup",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTeamMembers: TeamMember[] = [
  { id: "tm-1", name: "Mike Rodriguez", active_tasks: 12, projects_assigned: 5, overdue_tasks: 2 },
  { id: "tm-2", name: "Sarah Chen", active_tasks: 8, projects_assigned: 4, overdue_tasks: 0 },
  { id: "tm-3", name: "John Martinez", active_tasks: 15, projects_assigned: 6, overdue_tasks: 4 },
  { id: "tm-4", name: "David Kim", active_tasks: 10, projects_assigned: 4, overdue_tasks: 1 },
  { id: "tm-5", name: "Ana Lopez", active_tasks: 6, projects_assigned: 3, overdue_tasks: 0 },
  { id: "tm-6", name: "Tom Wilson", active_tasks: 18, projects_assigned: 7, overdue_tasks: 5 },
  { id: "tm-7", name: "Lisa Park", active_tasks: 9, projects_assigned: 4, overdue_tasks: 1 },
  { id: "tm-8", name: "Carlos Rivera", active_tasks: 14, projects_assigned: 5, overdue_tasks: 3 },
];

export function getMockSummary(): DashboardSummary {
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

  for (const p of mockProjects) {
    projectsByPhase[p.phase]++;
    totalHealth += p.health_score;
    totalOverdue += p.overdue_tasks;
    totalViolations += p.open_violations;
    totalBudget += p.budget_total;
    totalSpent += p.budget_spent;
  }

  return {
    total_projects: mockProjects.length,
    projects_by_phase: projectsByPhase,
    overall_health_score: Math.round(totalHealth / mockProjects.length),
    total_overdue_tasks: totalOverdue,
    total_open_violations: totalViolations,
    total_budget: totalBudget,
    total_spent: totalSpent,
    unread_alerts: mockAlerts.filter((a) => !a.is_read).length,
  };
}
