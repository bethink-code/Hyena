# Project Hyena - Network Monitoring Platform

## Overview
Project Hyena is an event-driven network monitoring platform designed for hospitality networks (hotels). It provides real-time incident detection, troubleshooting workflows, and multi-role communication across Guest Portal, Manager Dashboard, Admin Center, and Technician App interfaces. It's a full-stack web application with a React frontend and Express backend, built for scalability and white-label deployment, adhering to South African localization standards.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework & UI:** React 18+ with TypeScript, Radix UI primitives, shadcn/ui ("new-york" style), Material Design 3 principles.
- **Styling:** Tailwind CSS for utility-first styling, CSS variables for white-label theming.
- **Theming:** Custom dark mode color palette, priority-based visual hierarchy, Inter font for data, JetBrains Mono for technical data, mobile-optimized.
- **Global Navigation:** Universal pattern for summary cards leading to filtered incident lists, consistent across all interfaces with URL parameter-based filtering.
- **White-Label Branding:** Organization-specific logos and themes managed in Admin Center, displayed in Manager/Regional Manager interfaces. Platform branding for Admin/Technician.
- **Context-Aware Help:** Help panel in AppHeader displays functional specifications for the current page, loading documentation from static HTML files.

### Technical Implementations
- **Frontend:** Vite for bundling, Wouter for routing, TanStack Query for server state.
- **Backend:** Express.js with TypeScript on Node.js, RESTful API design (`/api` prefix), request/response logging, error handling.
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM for type-safe queries and schema management, persistent storage for incidents and timeline entries.
- **Authentication & Authorization:** Role-based access control with two distinct user types:
  - **Platform Users** (managed in Admin Center → User Management): super_user, hyena_manager, hyena_user, technician - these are Hyena platform employees/contractors
  - **Organization Users** (managed in Organizations → Users tab): regional_manager, property_manager - these belong to specific hotel chains and are scoped to organizations
- **File Structure:** Path aliases (`@/`, `@shared/`, `@assets/`) for organized codebase.

### Feature Specifications
- **Manual Event Creation:** Managers and Technicians can create events with extended schema including `eventType`, `scheduledFor`, `metadata`, and SA-specific categories (Load Shedding, ISP, Weather).
- **Event Simulator:** A `/simulator` interface for testing, allowing manual incident creation and preset scenarios, including optional technician assignment.
- **Aruba Network POC Integration:** Admin Dashboard includes a prominent card linking to a live Aruba network infrastructure proof-of-concept.
- **Comprehensive Incident Action System:** Allows various actions (Cancel, Put On Hold, Request Info, Reassign, Change Priority) with associated dialogs and required fields. All actions create timeline entries for auditing.
- **Incident Status Lifecycle:** Defines active (new, assigned, in_progress, on_hold) and terminal (resolved, cancelled, duplicate) statuses, with specific fields for reasons and dates (`cancelReason`, `holdReason`, `holdResumeDate`, `duplicateOfId`, `requestedInfo`).
- **Organizations Admin Section:** CRUD interface for managing organizations (name, logo, theme, contact, regional settings), properties (hotels), and organization-specific users. Features:
  - **Branding Tab:** Theme selection and logo upload
  - **Properties Tab:** Full CRUD for properties (hotels) within the organization
  - **Users Tab:** Full CRUD for organization users (regional_manager, property_manager) with property assignment
  - **Settings Tab:** Contact information and regional settings (timezone, language)
- **Technician Dashboard:** Displays summary metrics (My Queue, In Progress, Completed Today, Critical) with incident counts, removing property cards and client-side filters for a focused view on assigned work.

### System Design Choices
- **Event-Driven Architecture:** Core around events and timelines, with real-time updates via React Query.
- **Multi-Tenant Support:** White-label deployment across multiple organizations with customizable branding and regional settings.
- **Data Models:** Core entities include Organizations, Properties, Events, EventTimeline, and Users, with Drizzle-Zod for runtime validation and shared TypeScript interfaces.
- **User Management Architecture:** Strict separation enforced at both schema and API levels:
  - Schema-level validation using Zod refinements to prevent invalid role/userType combinations
  - Backend validation in POST/PATCH endpoints to ensure platform roles stay with platform users and organization roles stay with organization users
  - Organization users require an organizationId; validation prevents orphaned or incorrectly typed users
- **SA Localization:** Specific support for South African currency, dates, times, spelling, number formats, and event categories.

## External Dependencies

### Database & ORM
- Neon Serverless PostgreSQL
- Drizzle ORM
- Drizzle-Zod

### UI Framework & Components
- Radix UI (various components)
- shadcn/ui
- Tailwind CSS
- class-variance-authority (CVA)
- cmdk (Command Palette)
- Lucide React (Icons)

### State & Data Management
- TanStack Query (React Query)
- React Hook Form
- Zod

### Build Tools & Development
- Vite
- esbuild
- TypeScript
- PostCSS + Autoprefixer

### Utilities
- date-fns
- clsx + tailwind-merge
- Wouter
- nanoid

### Session Management
- connect-pg-simple
- express-session

### Replit Development Tools
- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer
- @replit/vite-plugin-dev-banner