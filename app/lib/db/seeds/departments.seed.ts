import { Department } from "../models";

export const departmentsSeedData = [
  // Operations
  { name: "Mining", code: "MINING", category: "operations", order: 1 },
  { name: "Processing", code: "PROC", category: "operations", order: 2 },
  { name: "Maintenance", code: "MAINT", category: "operations", order: 3 },
  { name: "Technical Services", code: "TECH", category: "operations", order: 4 },
  { name: "Geology", code: "GEO", category: "operations", order: 5 },
  { name: "Survey", code: "SURV", category: "operations", order: 6 },

  // Support
  { name: "Human Resources", code: "HR", category: "support", order: 1 },
  { name: "Finance", code: "FIN", category: "support", order: 2 },
  { name: "Supply Chain", code: "SCM", category: "support", order: 3 },
  { name: "Information Technology", code: "IT", category: "support", order: 4 },
  { name: "Administration", code: "ADMIN", category: "support", order: 5 },
  { name: "Health, Safety & Environment", code: "HSE", category: "support", order: 6 },
  { name: "Security", code: "SEC", category: "support", order: 7 },

  // DFSL (Damang Food Services Limited)
  { name: "Camp Services", code: "CAMP", category: "dfsl", order: 1 },
  { name: "Catering", code: "CATER", category: "dfsl", order: 2 },

  // Contractors
  { name: "Mining Contractor", code: "MCON", category: "contractors", order: 1 },
  { name: "Drilling Contractor", code: "DCON", category: "contractors", order: 2 },
  { name: "External Contractors", code: "ECON", category: "contractors", order: 3 },
] as const;

export async function seedDepartments(): Promise<void> {
  const count = await Department.countDocuments();
  if (count > 0) {
    console.log("Departments already seeded, skipping...");
    return;
  }

  await Department.insertMany(departmentsSeedData);
  console.log(`Seeded ${departmentsSeedData.length} departments`);
}
