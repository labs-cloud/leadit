# Lead It Builders — Executive Dashboard

Real-time executive dashboard for Lead It Builders, a NYC construction company managing 40+ active job sites. Single source of truth for monitoring all operations.

## Architecture

```
├── frontend/          # Next.js 14 + Tailwind CSS + shadcn/ui
├── backend/           # Express.js API + sync services
├── supabase/          # Database schema & migrations
└── .env.example       # Required environment variables
```

## Dashboard Modules

1. **Portfolio Health Overview** — Health score gauge, phase donut chart, key metrics
2. **Alerts & Action Items** — Critical/warning/info alerts from all sources
3. **Project Cards Grid** — Sortable, filterable grid of all 40+ projects
4. **Construction Timeline** — Gantt-style phase progression view
5. **Team Workload** — Team member task assignments and capacity
6. **Financial Summary** — Budget tracking across entire portfolio
7. **Activity Feed** — Unified feed from ClickUp, OneDrive, WhatsApp

## Data Sources

- **ClickUp** — Project tasks, statuses, custom fields (synced every 5 min)
- **OneDrive/SharePoint** — Plans, documents, file tracking (synced every 15 min)
- **WhatsApp** — Urgent messages via webhook (real-time)

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project
- ClickUp API token
- Azure AD app registration (for OneDrive)

### Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   # Fill in all values
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Supabase migration:
   ```bash
   # Apply supabase/migrations/001_initial_schema.sql to your Supabase project
   ```

4. Start development:
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend at http://localhost:3000
   - Backend API at http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Portfolio overview stats |
| GET | `/api/projects` | All projects with metrics |
| GET | `/api/projects/:id` | Single project details |
| GET | `/api/alerts` | Alerts (filterable) |
| POST | `/api/alerts/:id/read` | Mark alert as read |
| GET | `/api/activity` | Activity feed (paginated) |
| GET | `/api/team/workload` | Team workload summary |
| GET | `/api/files/recent` | Recent file uploads |
| POST | `/webhook/whatsapp` | WhatsApp message webhook |
| GET | `/health` | Health check |

## Deployment

- **Frontend:** Vercel
- **Backend:** Railway or Render
- **Database:** Supabase (managed PostgreSQL)
