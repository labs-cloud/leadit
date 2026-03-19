-- Lead It Builders Executive Dashboard Schema
-- Initial migration

-- Projects table (synced from ClickUp)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clickup_folder_id TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'planning',
  health_score INTEGER DEFAULT 100,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  open_violations INTEGER DEFAULT 0,
  total_permits INTEGER DEFAULT 0,
  approved_permits INTEGER DEFAULT 0,
  budget_total DECIMAL(12,2) DEFAULT 0,
  budget_spent DECIMAL(12,2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_projects_phase ON projects(phase);
CREATE INDEX idx_projects_health ON projects(health_score);
CREATE INDEX idx_projects_updated ON projects(updated_at DESC);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  source TEXT NOT NULL CHECK (source IN ('clickup', 'onedrive', 'whatsapp')),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_unread ON alerts(is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_project ON alerts(project_id, created_at DESC);
CREATE INDEX idx_alerts_type ON alerts(type, created_at DESC);

-- WhatsApp messages (filtered/relevant only)
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_phone TEXT,
  message_text TEXT,
  has_media BOOLEAN DEFAULT FALSE,
  media_url TEXT,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_urgent ON whatsapp_messages(is_urgent, created_at DESC);
CREATE INDEX idx_whatsapp_project ON whatsapp_messages(project_id, created_at DESC);

-- File tracking
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  onedrive_id TEXT,
  folder_path TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_files_project ON project_files(project_id, uploaded_at DESC);
CREATE INDEX idx_files_recent ON project_files(uploaded_at DESC);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details JSONB,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_recent ON activity_log(created_at DESC);
CREATE INDEX idx_activity_project ON activity_log(project_id, created_at DESC);
CREATE INDEX idx_activity_source ON activity_log(source, created_at DESC);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Row-level security (basic setup)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON whatsapp_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON activity_log FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update alerts (mark as read)
CREATE POLICY "Allow authenticated update alerts" ON alerts FOR UPDATE TO authenticated USING (true);

-- Allow service role full access (for sync jobs)
CREATE POLICY "Allow service role all" ON projects FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON alerts FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON whatsapp_messages FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON project_files FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role all" ON activity_log FOR ALL TO service_role USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
