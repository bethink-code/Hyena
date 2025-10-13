// Comprehensive event categories for South African hotel network monitoring

export const EVENT_CATEGORIES = {
  // Network & Infrastructure
  NETWORK_CONNECTIVITY: "Network Connectivity",
  PERFORMANCE: "Performance",
  BANDWIDTH: "Bandwidth",
  HARDWARE_FAILURE: "Hardware Failure",
  CONFIGURATION: "Configuration",
  SECURITY: "Security",
  AUTHENTICATION: "Authentication",
  ADVANCED_SERVICES: "Advanced Services",
  
  // South African Specific
  LOAD_SHEDDING: "Load Shedding / Power",
  ISP_OUTAGE: "ISP / Fibre Issues",
  WEATHER_IMPACT: "Weather / Environmental",
  
  // Operational & Guest Experience
  GUEST_EXPERIENCE: "Guest Experience",
  PLANNED_MAINTENANCE: "Planned Maintenance",
  HIGH_TRAFFIC_EVENT: "High Traffic / Event Day",
  EQUIPMENT_MAINTENANCE: "Equipment Maintenance",
} as const;

export const EVENT_CATEGORY_OPTIONS = Object.values(EVENT_CATEGORIES);

export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];

// Event type classification
export const EVENT_TYPES = {
  REACTIVE: "reactive", // Issues that need immediate response
  PROACTIVE: "proactive", // Scheduled or planned events
  ENVIRONMENTAL: "environmental", // External factors (weather, load shedding)
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Event sources
export const EVENT_SOURCES = {
  GUEST_PORTAL: "guest_portal",
  API_MONITORING: "api_monitoring",
  MANUAL_REPORT: "manual_report",
  FRONT_DESK: "front_desk",
  MANAGER_REPORT: "manager_report",
  TECHNICIAN_REPORT: "technician_report",
  AUTOMATED_ALERT: "automated_alert",
  SCHEDULED_CHECK: "scheduled_check",
  ESKOM_API: "eskom_api", // Load shedding alerts
  WEATHER_API: "weather_api",
} as const;

export type EventSource = typeof EVENT_SOURCES[keyof typeof EVENT_SOURCES];

// Load shedding stages (Eskom South Africa)
export const LOAD_SHEDDING_STAGES = [
  { value: "stage_1", label: "Stage 1 (1000 MW shortfall)" },
  { value: "stage_2", label: "Stage 2 (2000 MW shortfall)" },
  { value: "stage_3", label: "Stage 3 (3000 MW shortfall)" },
  { value: "stage_4", label: "Stage 4 (4000 MW shortfall)" },
  { value: "stage_5", label: "Stage 5 (5000 MW shortfall)" },
  { value: "stage_6", label: "Stage 6 (6000 MW shortfall)" },
  { value: "stage_7", label: "Stage 7 (7000 MW shortfall)" },
  { value: "stage_8", label: "Stage 8 (8000 MW shortfall)" },
] as const;

// South African ISP providers
export const SA_ISP_PROVIDERS = [
  "Telkom",
  "Vodacom",
  "MTN",
  "Rain",
  "Vumatel",
  "Openserve",
  "Frogfoot",
  "Octotel",
  "MetroFibre",
  "Other",
] as const;

// Weather event types common in South Africa
export const WEATHER_EVENT_TYPES = [
  "Cape Storm",
  "KZN Flooding",
  "Johannesburg Hail",
  "High Winds",
  "Lightning Strike",
  "Extreme Heat",
  "Cold Front",
  "Other",
] as const;

// Category metadata for UI guidance
export const CATEGORY_METADATA: Record<string, {
  description: string;
  requiresImmediateAction: boolean;
  saSpecific?: boolean;
  icon?: string;
}> = {
  [EVENT_CATEGORIES.NETWORK_CONNECTIVITY]: {
    description: "Complete or partial network outages, connection failures",
    requiresImmediateAction: true,
  },
  [EVENT_CATEGORIES.PERFORMANCE]: {
    description: "Slow speeds, degraded performance, latency issues",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.BANDWIDTH]: {
    description: "High usage, congestion, capacity issues",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.LOAD_SHEDDING]: {
    description: "Eskom load shedding events, backup power issues",
    requiresImmediateAction: true,
    saSpecific: true,
  },
  [EVENT_CATEGORIES.ISP_OUTAGE]: {
    description: "Telkom/Vodacom/MTN/fibre provider outages",
    requiresImmediateAction: true,
    saSpecific: true,
  },
  [EVENT_CATEGORIES.WEATHER_IMPACT]: {
    description: "Cape storms, KZN flooding, weather-related damage",
    requiresImmediateAction: true,
    saSpecific: true,
  },
  [EVENT_CATEGORIES.GUEST_EXPERIENCE]: {
    description: "Guest complaints, service quality issues, front desk reports",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.PLANNED_MAINTENANCE]: {
    description: "Scheduled upgrades, preventive maintenance",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.HIGH_TRAFFIC_EVENT]: {
    description: "Conferences, events, seasonal peaks, public holidays",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.HARDWARE_FAILURE]: {
    description: "Router failures, switch issues, equipment breakdowns",
    requiresImmediateAction: true,
  },
  [EVENT_CATEGORIES.SECURITY]: {
    description: "Unauthorized access, security breaches",
    requiresImmediateAction: true,
  },
  [EVENT_CATEGORIES.CONFIGURATION]: {
    description: "SSID issues, VLAN problems, misconfigurations",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.AUTHENTICATION]: {
    description: "Login issues, credential problems",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.ADVANCED_SERVICES]: {
    description: "Streaming, video conferencing, VoIP issues",
    requiresImmediateAction: false,
  },
  [EVENT_CATEGORIES.EQUIPMENT_MAINTENANCE]: {
    description: "Routine equipment checks, repairs",
    requiresImmediateAction: false,
  },
};
