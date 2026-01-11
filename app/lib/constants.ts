/**
 * Adamus Resources Limited - Brand Constants
 */

export const COMPANY = {
  name: "Adamus Resources Limited",
  shortName: "ARL",
  tagline: "Mining Excellence in Ghana",
  intranetName: "ARL Connect",
} as const;

/**
 * Brand Colors - Adamus Resources Theme
 */
export const COLORS = {
  // Primary - Gold (Mining Theme)
  gold: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#D4AF37", // Primary Gold
    600: "#B8962E",
    700: "#9A7B25",
    800: "#7C5F1C",
    900: "#5E4613",
  },
  // Secondary - Navy Blue
  navy: {
    50: "#F0F4F8",
    100: "#D9E2EC",
    200: "#BCCCDC",
    300: "#9FB3C8",
    400: "#829AB1",
    500: "#627D98",
    600: "#486581",
    700: "#334E68",
    800: "#243B53",
    900: "#1B365D", // Primary Navy
  },
  // Status Colors
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
  // Safety Colors
  safety: {
    green: "#10B981",
    orange: "#F97316",
    red: "#DC2626",
  },
} as const;

/**
 * Navigation Links
 */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Safety", href: "/safety" },
  { label: "Directory", href: "/directory" },
  { label: "Gallery", href: "/gallery" },
  { label: "Apps", href: "/apps" },
] as const;

/**
 * Department List - Adamus Resources
 */
export const DEPARTMENTS = [
  { code: "MTS", name: "MTS", category: "Contractor" },
  { code: "TSF", name: "TSF", category: "Contractor" },
  { code: "LIEB", name: "Liebherr", category: "Contractor" },
  { code: "DRILL", name: "Drill Masters", category: "Contractor" },
  { code: "COMM", name: "Commercial", category: "Support" },
  { code: "DFSL-EXP", name: "DFSL Exploration", category: "DFSL" },
  { code: "DFSL-SAF", name: "DFSL Safety", category: "DFSL" },
  { code: "DFSL-HR", name: "DFSL HR & Admin", category: "DFSL" },
  { code: "DFSL-STR", name: "DFSL Stores", category: "DFSL" },
  { code: "DFSL-WRK", name: "DFSL Workshop", category: "DFSL" },
  { code: "MINING", name: "Mining", category: "Operations" },
  { code: "GEO", name: "Geology", category: "Operations" },
  { code: "PROC", name: "Process", category: "Operations" },
  { code: "SEC", name: "Security", category: "Support" },
  { code: "HSE", name: "HSE", category: "Support" },
  { code: "TOLL", name: "Toll", category: "Operations" },
  { code: "SRD", name: "SRD", category: "Support" },
  { code: "SUPPLY", name: "Supply", category: "Support" },
  { code: "EXPLOR", name: "Exploration", category: "Operations" },
  { code: "ENG", name: "Engineering", category: "Operations" },
] as const;

/**
 * API Endpoints (for future use)
 */
export const API_ROUTES = {
  news: "/api/news",
  contacts: "/api/contacts",
  departments: "/api/departments",
  alerts: "/api/alerts",
  appLinks: "/api/app-links",
  toolboxTalks: "/api/toolbox-talks",
  safetyTips: "/api/safety-tips",
  safetyVideos: "/api/safety-videos",
  events: "/api/events",
  albums: "/api/albums",
  polls: "/api/polls",
  suggestions: "/api/suggestions",
  menu: "/api/menu",
  chat: "/api/chat",
} as const;
