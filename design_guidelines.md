# Project Hyena - Comprehensive Design Guidelines

## Design Approach: Material Design System (Customized)

**Rationale:** Selected Material Design 3 for its robust component library, excellent data-density handling, and proven enterprise scalability. The system's theming capabilities align perfectly with white-label requirements, while its emphasis on clarity and hierarchy supports the event-centric nature of this monitoring platform.

**Key Adaptations:**
- Enhanced event card system with priority-based visual hierarchy
- Custom status indicator patterns for real-time monitoring
- Streamlined navigation for role-based interfaces
- Mobile-optimized touch targets for technician and guest workflows

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- **Background:** 220 15% 8% (deep slate)
- **Surface:** 220 12% 12% (elevated surface)
- **Surface Variant:** 220 10% 16% (cards, panels)
- **Primary Brand:** 210 100% 55% (vibrant blue - themeable)
- **Secondary:** 210 20% 35% (muted blue-gray)
- **Success:** 142 76% 45% (green for resolved events)
- **Warning:** 38 92% 50% (amber for alerts)
- **Critical:** 0 84% 60% (red for urgent events)
- **Text Primary:** 0 0% 95%
- **Text Secondary:** 0 0% 70%

**Light Mode:**
- **Background:** 0 0% 98%
- **Surface:** 0 0% 100%
- **Surface Variant:** 220 12% 96%
- **Primary Brand:** 210 100% 45%
- **Secondary:** 210 15% 55%
- **Success:** 142 71% 40%
- **Warning:** 38 92% 45%
- **Critical:** 0 72% 50%
- **Text Primary:** 220 15% 15%
- **Text Secondary:** 220 10% 45%

**Themeable Tokens:** All brand colors (Primary, Logo, Accent) configurable via CSS variables for white-label deployment.

### B. Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - exceptional readability for data-dense interfaces
- Monospace: JetBrains Mono - technical data, IDs, timestamps

**Scale:**
- Display (Hero/Dashboard Headers): text-4xl font-bold (36px)
- H1 (Section Headers): text-2xl font-semibold (24px)
- H2 (Card Headers): text-lg font-semibold (18px)
- Body: text-base font-normal (16px)
- Small (Metadata): text-sm font-normal (14px)
- Caption (Timestamps): text-xs font-medium (12px)

**Event-Specific Typography:**
- Event Titles: text-lg font-semibold with color-coded priority indicators
- Status Labels: text-sm font-bold uppercase tracking-wide
- Technical IDs: monospace text-xs

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 (cards), p-6 (panels), p-8 (main containers)
- Section margins: my-8 (mobile), my-12 (tablet), my-16 (desktop)
- Element gaps: gap-4 (grids), gap-6 (major sections)

**Grid Systems:**
- Guest Portal (Mobile): Single column, max-w-lg centered
- Management Dashboard: 12-column grid, max-w-7xl
- Admin Center: Fluid grid with sidebar (aside w-64, main flex-1)
- Technician App: Stack layout with sticky headers

**Container Strategy:**
- Full-bleed event banners for critical alerts
- Contained cards (max-w-4xl) for incident details
- Wide dashboards (max-w-7xl) for analytics
- Compact mobile (max-w-sm) for guest actions

### D. Component Library

**Event Cards (Primary Component):**
- Card container: rounded-lg border with shadow-sm, p-4, status-colored left border (4px)
- Priority indicator: Colored dot (h-3 w-3) + badge
- Status chip: Rounded-full px-3 py-1, color-coded background
- Action buttons: Elevated on hover, primary color
- Timestamp: Absolute positioned top-right, text-xs opacity-70
- Layout: Flex with icon (left), content (center), actions (right)

**Navigation:**
- **Guest/Tech Mobile:** Bottom tab bar (h-16) with 4-5 icons + labels
- **Management Dashboard:** Top navbar (h-16) with breadcrumbs + profile
- **Admin Center:** Persistent left sidebar (w-64) with collapsible groups

**Forms & Inputs:**
- Text fields: Outlined style, h-12, rounded-md, focus ring-2 ring-primary
- Dropdowns: Material-style with floating labels
- Image upload: Drag-and-drop zone (min-h-32) with preview thumbnails
- Wizard steps: Horizontal stepper with check marks for completed steps

**Data Displays:**
- **Incident Queue:** Sortable table with row hover states, striped alternate rows
- **Network Map:** SVG-based property visualization with color-coded zones
- **Analytics Charts:** Chart.js with brand-themed colors, responsive aspect ratio
- **Status Indicators:** Traffic light system (green/amber/red circles, h-4 w-4)

**Notifications:**
- Toast: Fixed bottom-right, max-w-sm, slide-in animation, auto-dismiss 5s
- Banner: Full-width top, dismissible, critical events only
- Badge: Absolute positioned notification count on icons

**Modals & Overlays:**
- Feedback modal: max-w-md, centered, backdrop-blur-sm
- Incident detail: Slide-over panel (w-96) from right on desktop
- Assignment drawer: Bottom sheet on mobile, side panel on desktop

### E. Interface-Specific Guidelines

**Guest Self-Service Portal:**
- Hero-style welcome (h-64) with connectivity status card
- Large touch targets (min-h-14) for primary actions
- Illustrated troubleshooting steps (w-full max-w-xs images)
- Persistent status bar at bottom (h-20) for active incidents
- Simplified color scheme: Primary + Success/Critical only

**Property Management Dashboard:**
- Dense information layout, 3-column grid for metrics
- Sticky incident queue header with quick filters
- Interactive map (min-h-96) with zoom/pan controls
- Multi-select checkboxes for bulk operations
- Tabbed analytics views with export buttons

**Platform Administration Center:**
- Property cards in masonry grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- KPI widgets (h-32) with sparkline trends
- Drill-down breadcrumb navigation (sticky top-0)
- Resource allocation: Kanban-style columns with drag-and-drop

**Technician Mobile App:**
- Swipeable event cards (full-width) with dismiss gesture
- GPS-integrated location cards with "Navigate" CTA
- Camera upload: Full-screen capture with annotation tools
- Checklist UI: Large checkboxes (h-6 w-6) with strikethrough completed items
- Offline-ready indicator badge

---

## Event-Centric UI Patterns

**Priority Visual System:**
- **Critical:** Red left border (border-l-4), red badge, pulsing indicator
- **High:** Orange/amber border and badge
- **Medium:** Blue border and badge
- **Low:** Gray border and badge

**Status Progression:**
- **New:** Blue accent, "NEW" badge
- **Assigned:** Yellow accent, technician avatar
- **In Progress:** Animated spinner, elapsed time counter
- **Resolved:** Green checkmark, feedback prompt
- **Closed:** Grayed out, collapsed view

**Real-Time Updates:**
- Subtle pulse animation for new events (1s duration)
- Live timestamp updates (e.g., "2m ago" → "3m ago")
- Status change transitions: 300ms ease-in-out
- WebSocket indicator: Green dot in navbar when connected

---

## Accessibility & Performance

- Minimum touch target: 44x44px (iOS HIG compliant)
- Color contrast: 4.5:1 for text, 3:1 for large text
- Focus indicators: 2px ring offset in primary color
- Screen reader labels: All icons include aria-label
- Keyboard navigation: Tab order follows visual hierarchy
- Reduced motion: Disable animations when prefers-reduced-motion enabled

---

## White-Label Theming

**Configurable Assets:**
- Logo placement: Navbar (h-8), Login screen (h-16), Email templates
- Favicon: 32x32, 192x192, 512x512 PNG
- Brand colors: CSS variables for primary, secondary, accent
- Typography: Font family override via theme config

**Theme Structure:**
```
theme.config.js exports:
- colors.brand.primary (H S% L%)
- colors.brand.secondary
- typography.fontFamily
- assets.logo (path)
```

---

## Images & Photography

**Hero Sections:**
- Guest Portal: Modern hotel lobby/connectivity visualization (1920x600, overlay gradient)
- Management Dashboard: No hero - prioritize incident queue immediately
- Admin Center: Abstract network visualization (subtle background, opacity-10)

**Supporting Imagery:**
- Troubleshooting wizard: Step illustrations (SVG, 400x300)
- Empty states: Friendly illustrations for "No incidents" (max-w-md)
- Technician app: Device/location photos uploaded by users

**Stock Photography Sources:** Unsplash, Pexels (hotel, technology, connectivity themes)