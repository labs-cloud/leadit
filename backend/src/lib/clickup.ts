const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error("CLICKUP_API_TOKEN not set");
  return token;
}

async function clickupFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${CLICKUP_API_BASE}${endpoint}`, {
    headers: {
      Authorization: getToken(),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`ClickUp API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface ClickUpFolder {
  id: string;
  name: string;
  lists: ClickUpList[];
}

export interface ClickUpList {
  id: string;
  name: string;
  task_count: number;
}

export interface ClickUpTask {
  id: string;
  name: string;
  status: { status: string; type: string };
  date_created: string;
  date_updated: string;
  due_date: string | null;
  assignees: { id: number; username: string; profilePicture: string }[];
  custom_fields: {
    id: string;
    name: string;
    type: string;
    value: unknown;
  }[];
}

export const clickup = {
  getSpaces: (teamId: string) =>
    clickupFetch<{ spaces: { id: string; name: string }[] }>(
      `/team/${teamId}/space`
    ),

  getFolders: (spaceId: string) =>
    clickupFetch<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`),

  getLists: (folderId: string) =>
    clickupFetch<{ lists: ClickUpList[] }>(`/folder/${folderId}/list`),

  getTasks: (listId: string, page = 0) =>
    clickupFetch<{ tasks: ClickUpTask[] }>(
      `/list/${listId}/task?page=${page}&include_closed=true&subtasks=true`
    ),

  getTask: (taskId: string) =>
    clickupFetch<ClickUpTask>(`/task/${taskId}`),
};
