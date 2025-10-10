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

## Feature Implementation Details

### Admin Property Drill-Down (Completed)
**Route Structure:**
- All Properties page: `/admin/properties` - Grid view of all properties with search/filter
- Property Detail page: `/admin/properties/:id` - Dedicated sub-navigation for property-specific events

**Implementation:**
- Shared property constants in `client/src/lib/properties.ts` (8 South African properties)
- Properties.tsx fetches events to calculate real-time incident counts per property
- PropertyDetail.tsx displays property-filtered events with full EventQueue pattern
- Consistent Search + Filters + View Type controls across all list views
- EventDetailPanel integration for drilling into individual events
- Back button navigation returns to All Properties page

**Design Pattern:**
All detail views follow consistent slide-in panel pattern:
- Properties list → Property detail (sub-navigation) → Event detail (slide-in panel)
- Manager Dashboard → Event detail (slide-in panel)
- Technician App → Event detail (slide-in panel)
- Guest Portal → Event detail (slide-in panel)

**Files:**
- `/client/src/lib/properties.ts` - Shared property constants and helpers
- `/client/src/pages/admin/Properties.tsx` - Property list with search/filter
- `/client/src/pages/admin/PropertyDetail.tsx` - Property drill-down page
- `/client/src/components/PropertyList.tsx` - Property grid component (supports optional id field)
- Route registered in `/client/src/App.tsx` as `/admin/properties/:id`