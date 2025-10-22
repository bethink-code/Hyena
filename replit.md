# Project Hyena - Network Monitoring Platform

## Overview
Project Hyena is an event-driven network monitoring platform tailored for hospitality networks (hotels). It offers real-time incident detection, troubleshooting workflows, and multi-role communication across four interfaces: Guest Portal, Manager Dashboard, Admin Center, and Technician App. The platform is a full-stack web application with a React frontend and Express backend, designed for scalability and white-label deployment across multiple properties. The project adheres to South African localization standards for currency, dates, times, spelling, and number formats.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 18+ with TypeScript, Vite for bundling and HMR.
- **Routing:** Wouter for client-side navigation.
- **UI Components:** Radix UI primitives, shadcn/ui with "new-york" style, Material Design 3 principles.
- **Styling:** Tailwind CSS for utility-first styling, CSS variables for white-label theming.
- **State Management:** TanStack Query for server state, local React state for UI.
- **Design System:** Custom dark mode color palette, priority-based visual hierarchy, Inter font for data, JetBrains Mono for technical data, mobile-optimized.

### Backend
- **Framework:** Express.js with TypeScript on Node.js.
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM for type-safe queries and schema management.
- **Storage:** PostgreSQL database storage via `DbStorage` class implementing `IStorage` interface. All incidents and timeline entries persist to database across server restarts.
- **API Design:** RESTful API with `/api` prefix, request/response logging, error handling, credential-based authentication preparation.
- **Event Integration:** Shared event storage, RESTful CRUD for events and timelines, React Query for real-time updates. Event lifecycle integrated across all interfaces (Manager, Technician, Event Simulator) with timeline tracking and cache invalidation.

### Data Models
- **Core Entities:** Events (ID, title, description, priority, status, location, etc.), EventTimeline (tracks state changes), Properties (static configuration for prototyping).
- **Type Safety:** Drizzle-Zod for runtime validation, TypeScript interfaces shared via `@shared` alias.
- **Extended Event Schema:** Includes `eventType` (reactive, proactive, environmental), `scheduledFor`, and `metadata` for SA-specific data (load shedding, ISP, weather).
- **Comprehensive Event Categories:** Network, SA-specific (Load Shedding, ISP/Fibre, Weather), Operational (Guest Experience, Planned Maintenance).
- **Incident Status Lifecycle:** 
  - **Active Statuses:** new → assigned → in_progress → resolved
  - **Alternative Paths:** cancelled (with reason), on_hold (with reason + optional resume date), duplicate (with reference to original)
  - **Action Fields:** `cancelReason`, `holdReason`, `holdResumeDate`, `duplicateOfId`, `requestedInfo`

### Authentication & Authorization
- **Planned Roles:** Guest, Manager, Admin, Technician with role-based access.
- **Current Implementation:** User schema with password field, session store configured (connect-pg-simple) but not yet active.

### File Structure & Organization
- **Path Aliases:** `@/` (client/src), `@shared/` (shared), `@assets/` (attached_assets).
- **Key Directories:** `client/src/components`, `client/src/pages`, `server/`, `shared/`, `migrations/`.

### Development & Deployment
- **Development:** `npm run dev` (Vite + Express), `npm run check` (TypeScript), `npm run db:push` (Drizzle).
- **Production:** `npm run build` (Vite + esbuild), `npm start`.
- **Environment:** `DATABASE_URL` for PostgreSQL, Replit-specific plugins.

### UI/UX Decisions & Feature Specifications
- **Manual Event Creation:** Managers and Technicians can create events with extended schema supporting `eventType`, `scheduledFor`, `metadata`, and comprehensive categories including SA-specific ones (Load Shedding, ISP, Weather). Implemented via `ReportIncidentDialog` (Manager) and `LogIssueDialog` (Technician) with dynamic SA-specific fields.
- **Global Layout:** `RoleNavigationHeader` positioned above `shadcn` sidebar using CSS variables (`--sidebar-top`, `--sidebar-height`, etc.) for seamless integration without overlap.

### Universal Navigation Pattern (System-Wide)
**Core Principle:** Summary Cards → Filtered Incident List (Consistent across all interfaces)

- **Dashboard Structure:**
  - **Summary Metric Cards:** Clickable KPI tiles (Manager/Technician use SummaryMetrics, Admin uses KPIWidget)
  - **Property Status Cards:** Manager/Admin only - clickable property cards showing real-time incident counts
  - Both navigate to filtered incident list pages via URL query parameters

- **Navigation Flow:**
  1. **Click Summary Metric** → Navigate to `/[role]/incidents?filter=...`
     - Examples: Critical Incidents, Active Incidents, In Progress, Completed Today
  2. **Click Property Card** → Navigate to `/[role]/incidents?propertyId={id}` (Manager/Admin only)
     - Filters incident list to show only incidents for that property

- **Incident List Pages (Universal):**
  - **Routes:** `/manager/incidents`, `/admin/incidents`, `/technician/incidents`
  - **URL Parameters:** `status`, `priority`, `propertyId` for flexible filtering
  - **Features:** 
    - Filter description header showing active filters
    - Active filter badges (Property, Status, Priority)
    - IncidentQueue component with search and view modes (Cards/Table/Grid)
    - Technician view: No client-side status/priority filters (uses URL params only)
    - Manager/Admin view: Client-side filters available
    - Click incident → Detail panel slides in from right
    - Back to Dashboard button for easy navigation
  - **Benefits:** 
    - Shareable URLs with embedded filters
    - More dashboard space for additional summary cards
    - Consistent pattern across all roles (easier to learn)

- **Technician Dashboard (October 2025):**
  - **Shows:** Summary metrics only (My Queue, In Progress, Completed Today, Critical)
  - **Removed:** Property cards (now only a filter option), Incident queue table, Incident actions section
  - **Property Scope:** Properties 1, 2, 3 (The Table Bay Hotel, Umhlanga Sands, Saxon Hotel)
  - **Metric Calculations:** Exclude terminal statuses (cancelled, duplicate, resolved) from active counts

- **Property Detail Pages (Still Available):**
  - **Routes:** `/manager/properties/{id}`, `/admin/properties/{id}`, `/technician/properties/{id}`
  - **Purpose:** Deep-dive property-specific views (maintained for backward compatibility)
  - **Features:** Live status badges, active incident count, filtered incident queue

### Comprehensive Incident Action System
**Core Principle:** Full incident lifecycle management with audit trail tracking

- **Available Actions:**
  1. **Cancel Incident** - Mark incident as cancelled with required reason
     - Component: `CancelIncidentDialog`
     - Fields: `cancelReason` (required)
     - Use cases: Duplicate reports, false alarms, resolved by other means
  
  2. **Put On Hold** - Pause work temporarily with optional resume date
     - Component: `HoldIncidentDialog`
     - Fields: `holdReason` (required), `holdResumeDate` (optional)
     - Use cases: Waiting for vendor, parts on order, scheduled maintenance window
  
  3. **Request Info** - Log information requests from reporter or parties
     - Component: `RequestInfoDialog`
     - Fields: `requestedInfo` (required)
     - Use cases: Need error messages, room numbers, additional context
  
  4. **Reassign** - Transfer incident to different technician/team
     - Component: `ReassignDialog`
     - Fields: `assignedTo` (required), reason (optional)
     - Use cases: Specialist knowledge required, load balancing
  
  5. **Change Priority** - Escalate or de-escalate priority with reason
     - Component: `ChangePriorityDialog`
     - Fields: `priority` (low/medium/high/critical), reason (optional)
     - Uses rank-based comparison (low=1, medium=2, high=3, critical=4)
     - Timeline shows "escalated" vs "de-escalated" based on rank change

- **Action Visibility:**
  - All actions available for active incidents (new, assigned, in_progress)
  - Actions hidden for terminal statuses (cancelled, resolved, duplicate)
  - Change Priority always visible (allows both escalation and de-escalation)

- **Audit Trail:**
  - Every action creates timeline entry via POST `/api/incidents/:id/timeline`
  - Timeline includes action description, reason (if provided), and timestamp
  - Timeline entries visible in incident detail panel Activity tab

- **Status Badge Styling:**
  - `cancelled` - Gray/muted (bg-muted text-muted-foreground)
  - `on_hold` - Amber (bg-amber-500/10 text-amber-700)
  - `duplicate` - Muted (bg-muted/50 text-muted-foreground)
  - All statuses included in IncidentQueue filter dropdown

## External Dependencies

### Database & ORM
- **Neon Serverless PostgreSQL**
- **Drizzle ORM**
- **Drizzle-Zod**

### UI Framework & Components
- **Radix UI** (Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs, Toast, Toggle, Tooltip)
- **shadcn/ui**
- **Tailwind CSS**
- **class-variance-authority (CVA)**
- **cmdk** (Command Palette)
- **Lucide React** (Icons)

### State & Data Management
- **TanStack Query (React Query)**
- **React Hook Form** (@hookform/resolvers)
- **Zod**

### Build Tools & Development
- **Vite**
- **esbuild**
- **TypeScript**
- **PostCSS + Autoprefixer**

### Utilities
- **date-fns**
- **clsx + tailwind-merge**
- **Wouter**
- **nanoid**

### Fonts
- **Inter** (Google Fonts CDN)
- **JetBrains Mono** (Google Fonts CDN)

### Session Management
- **connect-pg-simple**
- **express-session**

### Replit Development Tools
- **@replit/vite-plugin-runtime-error-modal**
- **@replit/vite-plugin-cartographer**
- **@replit/vite-plugin-dev-banner**