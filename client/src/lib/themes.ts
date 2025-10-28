// Theme mapping from database theme values to CSS classes
export const THEME_MAP = {
  table_mountain_blue: 'theme-table-mountain-blue',
  kalahari_gold: 'theme-kalahari-gold',
  kruger_green: 'theme-kruger-green',
  jacaranda_purple: 'theme-jacaranda-purple',
  protea_red: 'theme-protea-red',
} as const;

export type ThemeKey = keyof typeof THEME_MAP;

export const THEME_LABELS = {
  table_mountain_blue: 'Table Mountain Blue',
  kalahari_gold: 'Kalahari Gold',
  kruger_green: 'Kruger Green',
  jacaranda_purple: 'Jacaranda Purple',
  protea_red: 'Protea Red',
} as const;

// Apply theme class to document element
export function applyTheme(theme: ThemeKey) {
  const themeClass = THEME_MAP[theme];
  
  // Remove all existing theme classes
  Object.values(THEME_MAP).forEach(className => {
    document.documentElement.classList.remove(className);
  });
  
  // Add the new theme class
  if (themeClass) {
    document.documentElement.classList.add(themeClass);
  }
}

// Determine which theme to use based on role
// Guest and hotel_manager use organization theme
// Admin, technician, regional_manager use Hyena default (Table Mountain Blue)
export function getThemeForRole(role: string, organizationTheme: ThemeKey): ThemeKey {
  const clientFacingRoles = ['guest', 'hotel_manager'];
  
  if (clientFacingRoles.includes(role)) {
    return organizationTheme;
  }
  
  // Operations roles always use Hyena branding (default blue)
  return 'table_mountain_blue';
}
