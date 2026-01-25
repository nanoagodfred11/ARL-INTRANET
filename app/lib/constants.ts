/**
 * Application Constants
 * Shared constants used across the application
 */

// Department structure for ARL
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

export type Department = (typeof DEPARTMENTS)[number];
export type DepartmentCode = Department["code"];
export type DepartmentCategory = Department["category"];

// Get department by code
export function getDepartmentByCode(code: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.code === code);
}

// Get departments by category
export function getDepartmentsByCategory(category: DepartmentCategory): Department[] {
  return DEPARTMENTS.filter((d) => d.category === category);
}
