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
- **Storage:** In-memory storage for development, abstract `IStorage` for database migration.
- **API Design:** RESTful API with `/api` prefix, request/response logging, error handling, credential-based authentication preparation.
- **Event Integration:** Shared event storage, RESTful CRUD for events and timelines, React Query for real-time updates. Event lifecycle integrated across all interfaces (Manager, Technician, Event Simulator) with timeline tracking and cache invalidation.

### Data Models
- **Core Entities:** Events (ID, title, description, priority, status, location, etc.), EventTimeline (tracks state changes), Properties (static configuration for prototyping).
- **Type Safety:** Drizzle-Zod for runtime validation, TypeScript interfaces shared via `@shared` alias.
- **Extended Event Schema:** Includes `eventType` (reactive, proactive, environmental), `scheduledFor`, and `metadata` for SA-specific data (load shedding, ISP, weather).
- **Comprehensive Event Categories:** Network, SA-specific (Load Shedding, ISP/Fibre, Weather), Operational (Guest Experience, Planned Maintenance).

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
- **Property Card Navigation:** A unified pattern across Admin, Manager, and Technician interfaces. Property cards replace dropdowns, navigating to property-specific detail pages with filtered event queues. This includes a consistent slide-in panel for event details.
- **Property Detail Pages (Universal Pattern):** All property detail pages (Admin, Manager, Technician) implement a consistent pattern with:
  - **Live Status Badges:** Dynamically calculated from real-time incident data (Critical if any critical incidents exist, Degraded if >0 active incidents, Healthy otherwise)
  - **Active Incident Count:** Real-time display of non-resolved incidents for the property
  - **Report Incident Button:** `ReportIncidentDialog` positioned in header beside active incident count for easy access across all views
  - **Data Flow:** All calculations use live `/api/incidents` query results, no static or placeholder data

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