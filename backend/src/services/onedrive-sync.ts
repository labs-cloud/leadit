import { supabase } from "../lib/supabase";

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

interface GraphToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: GraphToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials not configured");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Failed to get Azure token: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.access_token;
}

async function graphFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Graph API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

interface DriveItem {
  id: string;
  name: string;
  file?: { mimeType: string };
  folder?: { childCount: number };
  lastModifiedDateTime: string;
  lastModifiedBy?: { user?: { displayName: string } };
  parentReference?: { path: string };
}

async function getChildren(siteId: string, itemId: string): Promise<DriveItem[]> {
  const data = await graphFetch<{ value: DriveItem[] }>(
    `/sites/${siteId}/drive/items/${itemId}/children`
  );
  return data.value;
}

function matchProjectByFolderName(
  folderPath: string,
  projects: { id: string; address: string }[]
): { id: string; address: string } | undefined {
  const pathLower = folderPath.toLowerCase();
  return projects.find((p) => {
    const addressPart = p.address.split(",")[0].toLowerCase().trim();
    return pathLower.includes(addressPart);
  });
}

export async function syncOneDrive(): Promise<void> {
  console.log("[OneDrive Sync] Starting sync...");

  const siteId = process.env.SHAREPOINT_SITE_ID;
  const plansFolderId = process.env.PLANS_FOLDER_ID;
  const projectsFolderId = process.env.PROJECTS_FOLDER_ID;

  if (!siteId) {
    console.log("[OneDrive Sync] SharePoint site ID not configured, skipping");
    return;
  }

  try {
    // Get existing projects for matching
    const { data: projects } = await supabase
      .from("projects")
      .select("id, address");

    if (!projects || projects.length === 0) {
      console.log("[OneDrive Sync] No projects found, skipping");
      return;
    }

    // Sync Plans folder
    if (plansFolderId) {
      const items = await getChildren(siteId, plansFolderId);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const item of items) {
        if (!item.file) continue; // Skip folders
        const modifiedDate = new Date(item.lastModifiedDateTime);
        if (modifiedDate < sevenDaysAgo) continue; // Only recent files

        const parentPath = item.parentReference?.path || "";
        const project = matchProjectByFolderName(parentPath, projects);

        await supabase.from("project_files").upsert(
          {
            project_id: project?.id || null,
            file_name: item.name,
            file_type: item.file.mimeType,
            onedrive_id: item.id,
            folder_path: parentPath,
            uploaded_by: item.lastModifiedBy?.user?.displayName || "Unknown",
            uploaded_at: item.lastModifiedDateTime,
          },
          { onConflict: "id" }
        );

        if (project) {
          await supabase.from("activity_log").insert({
            project_id: project.id,
            user_name: item.lastModifiedBy?.user?.displayName,
            action: `File uploaded: ${item.name}`,
            source: "onedrive",
          });
        }
      }

      console.log(`[OneDrive Sync] Processed ${items.length} items from Plans`);
    }

    // Sync Active Projects folder
    if (projectsFolderId) {
      const items = await getChildren(siteId, projectsFolderId);
      console.log(
        `[OneDrive Sync] Processed ${items.length} items from Active Projects`
      );
    }

    // Check for missing documentation
    for (const project of projects) {
      const { count } = await supabase
        .from("project_files")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id);

      if (count === 0) {
        await supabase.from("alerts").insert({
          project_id: project.id,
          type: "warning",
          source: "onedrive",
          title: `Missing documentation — ${project.address}`,
          description: "No files found in OneDrive for this project.",
        });
      }
    }

    console.log("[OneDrive Sync] Sync complete");
  } catch (err) {
    console.error("[OneDrive Sync] Error:", err);
  }
}
