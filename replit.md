# Project Hyena - Network Monitoring Platform

## Overview

Project Hyena is a proactive event-driven network monitoring platform designed specifically for hospitality networks (hotels). The system provides real-time incident detection, troubleshooting workflows, and multi-role communication capabilities. It features four distinct user interfaces: Guest Portal (self-service), Manager Dashboard (property operations), Admin Center (multi-property oversight), and Technician App (field service).

The application is built as a full-stack web platform with a React frontend and Express backend, designed for scalability across multiple properties with white-label theming capabilities.

## Localisation Context

**Region: South Africa**

All application features should adhere to South African conventions:
- **Currency**: South African Rand (ZAR) - Display using "R" symbol (e.g., R1,250.00)
- **Date Formats**: Use DD/MM/YYYY or YYYY-MM-DD formats (South African standard)
- **Time Formats**: 24-hour format (HH:mm)
- **Spelling**: British English (colour, organisation, analyse, etc.)
- **Number Formats**: Space as thousand separator (e.g., 1 000 000) or comma (1,000,000) depending on context

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type safety and developer experience
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (switching between guest/manager/admin/technician views)

**UI Component System:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library with "new-york" style configuration
- Material Design 3 principles adapted for hospitality use cases
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for themeable brand colors enabling white-label deployment

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local React state for UI interactions
- Theme context provider for dark/light mode switching

**Design System:**
- Custom color palette with dark mode as primary (220 15% 8% background)
- Priority-based visual hierarchy for event cards (critical/high/medium/low)
- Status indicators with colored dots and backgrounds (new/assigned/in_progress/resolved/closed)
- Inter font family for data-dense interfaces, JetBrains Mono for technical data
- Mobile-optimized touch targets for field technician workflows

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running on Node.js
- HTTP server created via Node's `http` module
- Middleware pipeline for request logging and JSON parsing
- Session management preparation (connect-pg-simple included)

**Database Layer:**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- WebSocket-based connection pooling for serverless environments
- Schema-driven approach with Drizzle-Zod for validation

**Current Storage Implementation:**
- In-memory storage interface (`MemStorage`) for development
- Abstracted storage interface (`IStorage`) designed for easy migration to database
- CRUD operations for Event and EventTimeline entities with full lifecycle support
- Event status transitions: new → assigned → in_progress → resolved
- Timeline tracking for all event state changes with actor attribution

**API Design:**
- RESTful API patterns with `/api` prefix convention
- Request/response logging with duration tracking
- Error handling middleware with status code normalization
- Credential-based authentication preparation

**Event Integration System:**
- Shared event storage backend with PostgreSQL schema (events, timeline tables)
- RESTful API for event CRUD operations (`GET /api/events`, `POST /api/events`, `PATCH /api/events/:id`)
- Timeline API for event history tracking (`GET /api/events/:id/timeline`, `POST /api/events/:id/timeline`)
- React Query-based state management with cache invalidation for real-time updates
- Event lifecycle flow fully integrated across interfaces:
  - **Event Simulator**: Creates events with manual/preset/bulk creation tools
  - **Manager Dashboard**: Assigns events to technicians, escalates priority, resolves incidents
  - **Technician App**: Starts work, resolves events, tracks completed work
- All state changes create timeline entries with actor/timestamp tracking
- Cache invalidation ensures real-time UI updates across all connected interfaces

### Data Models

**Core Entities (from schema):**
- **Events**: ID (UUID), title, description, priority (critical/high/medium/low), status (new/assigned/in_progress/resolved), location, assignedTo, category, affectedGuests, estimatedResolution, rootCause, resolution, timestamps, propertyId (FK)
- **EventTimeline**: ID (UUID), eventId (FK), action, actor, timestamp - tracks all event state changes
- **Properties** (hardcoded constants): ID, name, location, status - managed in `client/src/lib/properties.ts` as static configuration. Properties are referenced by events via propertyId but are not stored in the database. This design allows for rapid prototyping without property CRUD operations.
- Extensible schema structure ready for:
  - Users/Technicians (authentication and assignment)
  - Guest feedback
  - Network status tracking

**Type Safety:**
- Drizzle-Zod integration for runtime validation
- TypeScript interfaces shared between client and server via `@shared` path alias
- Zod schemas for insert operations with automatic type inference

### Authentication & Authorization

**Planned Role-Based Access:**
- Guest role: Self-service portal, issue reporting, troubleshooting wizards
- Manager role: Property-level incident monitoring, analytics, guest communication
- Admin role: Multi-property oversight, system configuration, user management
- Technician role: Work queue management, field service tools, equipment tracking

**Current Implementation:**
- User schema with password field (hashing to be implemented)
- Session store configured (connect-pg-simple) but not yet integrated
- Route structure prepared for role-based endpoints

### File Structure & Organization

**Path Aliases:**
- `@/` → `client/src/` (frontend components, pages, utilities)
- `@shared/` → `shared/` (types, schemas, shared business logic)
- `@assets/` → `attached_assets/` (images, static resources)

**Key Directories:**
- `client/src/components/` - Reusable UI components with examples
- `client/src/pages/` - Role-specific application views
- `server/` - Backend API, routes, database connection
- `shared/` - Database schema and shared types
- `migrations/` - Drizzle migration files (output directory)

### Development & Deployment

**Development Workflow:**
- `npm run dev` - Runs Vite dev server with Express backend
- `npm run check` - TypeScript type checking
- `npm run db:push` - Drizzle schema push to database

**Production Build:**
- `npm run build` - Vite frontend build + esbuild backend bundle
- `npm start` - Runs production server from `dist/`
- Frontend assets served from `dist/public/`
- Server bundle in `dist/index.js`

**Environment Configuration:**
- `DATABASE_URL` required for PostgreSQL connection
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)
- Dark mode default with localStorage persistence

## External Dependencies

### Database & ORM
- **Neon Serverless PostgreSQL**: Serverless PostgreSQL database with WebSocket support
- **Drizzle ORM**: Type-safe database toolkit with migration system
- **Drizzle-Zod**: Runtime validation for database operations

### UI Framework & Components
- **Radix UI**: Complete suite of accessible component primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip)
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: CVA for component variant management
- **cmdk**: Command palette component (for search/quick actions)
- **Lucide React**: Icon library

### State & Data Management
- **TanStack Query (React Query)**: Server state management with caching
- **React Hook Form**: Form state management (via @hookform/resolvers)
- **Zod**: Schema validation library

### Build Tools & Development
- **Vite**: Frontend build tool with HMR support
- **esbuild**: Backend bundler for production
- **TypeScript**: Type safety across full stack
- **PostCSS + Autoprefixer**: CSS processing pipeline

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx + tailwind-merge**: Conditional className utilities
- **Wouter**: Lightweight routing library (~1.2KB)
- **nanoid**: Unique ID generation

### Fonts (Google Fonts CDN)
- **Inter**: Primary UI font (weights 300-700)
- **JetBrains Mono**: Monospace font for technical data (weights 400-600)

### Session Management
- **connect-pg-simple**: PostgreSQL session store (configured but not yet active)
- **express-session**: Session middleware (implied by connect-pg-simple presence)

### Replit Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation enhancement
- **@replit/vite-plugin-dev-banner**: Development environment indicator

## Critical Implementation Details

### Manual Event Creation System (Completed)

**Challenge:** Managers and Technicians need to manually create events for issues not automatically detected by API monitoring (guest complaints at front desk, issues discovered on-site, load shedding alerts, weather impacts, etc.).

**Solution Implemented:**

1. **Extended Event Schema** (`shared/schema.ts`):
   - Added `eventType` field: "reactive" | "proactive" | "environmental"
   - Added `scheduledFor` timestamp for planned maintenance/events
   - Added `metadata` text field for SA-specific JSON data (load shedding stage, ISP provider, weather type)

2. **Comprehensive Event Categories** (`shared/eventCategories.ts`):
   - **Network Categories**: Network Connectivity, Performance, Bandwidth, Hardware Failure, Configuration, Security, Authentication, Advanced Services
   - **SA-Specific Categories**: Load Shedding/Power, ISP/Fibre Issues, Weather/Environmental
   - **Operational Categories**: Guest Experience, Planned Maintenance, High Traffic/Event Day, Equipment Maintenance
   - **Supporting Constants**: Eskom load shedding stages (1-8), SA ISP providers (Telkom, Vodacom, MTN, etc.), Weather event types (Cape Storm, KZN Flooding, etc.)

3. **Manager Interface** (`client/src/components/ReportIncidentDialog.tsx`):
   - Full-featured incident reporting form with all event categories
   - Dynamic SA-specific fields:
     - Load Shedding: Eskom stage selector (Stage 1-8)
     - ISP Outage: ISP provider selector (Telkom, Vodacom, MTN, etc.)
     - Weather Impact: Weather event type selector (Cape Storm, KZN Flooding, etc.)
   - Proactive event support: Scheduled date/time picker for planned maintenance and high traffic events
   - Automatic eventType inference based on category selection
   - Integrated into ManagerDashboard with "Report Incident" button above event queue

4. **Technician Interface** (`client/src/components/LogIssueDialog.tsx`):
   - Streamlined field-optimized form for on-site issue logging
   - Focus on categories relevant to field work (Hardware Failure, Network Connectivity, Equipment Maintenance, SA-specific issues)
   - Required location field for precise incident tracking
   - Integrated into TechnicianApp with "Log Issue" button in work queue tab

5. **Event Simulator Updates** (`client/src/pages/EventSimulator.tsx`):
   - Expanded preset scenarios including:
     - Eskom Load Shedding Stage 4 with metadata
     - Cape Storm fibre damage with ISP failover
     - Telkom fibre outage (SA-specific)
     - Planned conference (proactive with scheduled date)
     - Scheduled maintenance (proactive with scheduled date)
   - All event sources including manager_report, technician_report, eskom_api, weather_api
   - Full category dropdown with all expanded options

**Event Flow Examples:**
- **Manager Reports Load Shedding**: Category → Load Shedding → Select Eskom Stage 4 → Creates environmental event with metadata {"loadSheddingStage":"stage_4"}
- **Technician Logs Field Issue**: Category → Hardware Failure → Location required → Creates reactive event with source "technician_report"
- **Manager Schedules Maintenance**: Category → Planned Maintenance → Pick scheduled date → Creates proactive event with scheduledFor timestamp

**Files Modified:**
- `/shared/eventCategories.ts` - Comprehensive event categories and SA constants
- `/shared/schema.ts` - Extended event schema (eventType, scheduledFor, metadata)
- `/client/src/components/ReportIncidentDialog.tsx` - Manager incident reporting with SA metadata
- `/client/src/components/LogIssueDialog.tsx` - Technician issue logging
- `/client/src/pages/ManagerDashboard.tsx` - Report Incident button integration
- `/client/src/pages/TechnicianApp.tsx` - Log Issue button integration
- `/client/src/pages/EventSimulator.tsx` - Expanded categories and SA preset scenarios

### Global Layout & Header Integration (Completed)

**Challenge:** Integrating a global RoleNavigationHeader above shadcn's sidebar component, which uses CSS variables for positioning.

**Solution Implemented:**
1. **AppLayout Component** sets CSS variables on SidebarProvider:
   - `--sidebar-top: 3.5rem` - Offsets sidebar below header
   - `--sidebar-height: calc(100vh - 3.5rem)` - Sidebar height excludes header
   - `--sidebar-width: 16rem` - Standard sidebar width
   - `--sidebar-width-icon: 3rem` - Collapsed sidebar width

2. **Modified shadcn Sidebar Component** (`client/src/components/ui/sidebar.tsx`):
   - Removed hardcoded `inset-y-0` and `h-svh` classes from sidebar-container div
   - Added inline styles using CSS variables:
     ```typescript
     style={{
       top: "var(--sidebar-top, 0)",
       height: "var(--sidebar-height, 100vh)",
     }}
     ```
   - This ensures sidebar respects the offset across all breakpoints (especially md: 768px+)

3. **Layout Structure:**
   - RoleNavigationHeader: `sticky top-0 z-50`, ~3.5rem height
   - SidebarProvider wraps Sidebar and main content area
   - Sidebar starts at 3.5rem from top (below header)
   - No overlap between header and sidebar at any screen size

**Files Modified:**
- `client/src/components/AppLayout.tsx` - Sets CSS variables
- `client/src/components/ui/sidebar.tsx` - Uses variables for positioning
- `client/src/components/RoleNavigationHeader.tsx` - Global header with role switcher

## Feature Implementation Details

### Property Card Navigation Pattern (Completed)

**Unified Pattern Across All Roles:**
All role interfaces (Admin, Manager, Technician) now use the same property card navigation pattern, removing dropdown selectors in favor of clickable property cards.

**Admin Implementation:**
- Route: `/admin` - Portfolio Dashboard shows all 8 properties as cards with real-time incident counts
- Route: `/admin/properties/:id` - Property detail page with filtered event queue
- "All Properties" nav item removed (properties shown directly on dashboard)
- Back button returns to Portfolio Dashboard

**Manager Implementation:**
- Route: `/manager` - Dashboard shows 3 manager properties as cards (IDs: 4, 5, 6)
- Route: `/manager/properties/:id` - Property detail page with assignment/escalation controls
- PropertySelector dropdown removed from sidebar
- Events from all 3 manager properties shown in main work queue
- Property cards provide navigation to property-specific filtered views

**Technician Implementation:**
- Route: `/technician` - Dashboard shows 3 technician properties as cards (IDs: 1, 2, 3)
- Route: `/technician/properties/:id` - Property detail page with work queue and completed jobs
- PropertySelector dropdown removed from sidebar
- Work queue aggregates events from all 3 technician properties (status: assigned/in_progress)
- Property cards show status badges and active incident counts
- "My Properties" section displays coverage area

**Design Pattern:**
All detail views follow consistent slide-in panel pattern:
- Dashboard (property cards) → Click card → Property detail (sub-navigation with filtered events) → Event detail (slide-in panel)
- Back button always returns to role's main dashboard

**Shared Components:**
- `/client/src/lib/properties.ts` - Shared property constants (8 South African properties)
- `/client/src/components/PropertyList.tsx` - Reusable property grid with search/filter
- `/client/src/components/PropertyCard.tsx` - Individual property card with status/incidents
- `/client/src/components/EventDetailPanel.tsx` - Consistent event detail slide-in panel

**Key Files:**
- `/client/src/pages/AdminCenter.tsx` - Admin portfolio dashboard
- `/client/src/pages/admin/PropertyDetail.tsx` - Admin property drill-down
- `/client/src/pages/ManagerDashboard.tsx` - Manager dashboard with cards
- `/client/src/pages/manager/PropertyDetail.tsx` - Manager property drill-down
- `/client/src/pages/TechnicianApp.tsx` - Technician dashboard with cards
- `/client/src/pages/technician/PropertyDetail.tsx` - Technician property drill-down
- Routes registered in `/client/src/App.tsx`