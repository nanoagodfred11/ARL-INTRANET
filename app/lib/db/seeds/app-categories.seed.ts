import { AppLinkCategory } from "../models";

export const appCategoriesSeedData = [
  { name: "Business Systems", slug: "business", description: "Core business applications", icon: "Briefcase", order: 1 },
  { name: "HR & Payroll", slug: "hr-payroll", description: "Human resources and payroll systems", icon: "Users", order: 2 },
  { name: "Safety & Compliance", slug: "safety", description: "Safety reporting and compliance tools", icon: "Shield", order: 3 },
  { name: "Operations", slug: "operations", description: "Mining and processing systems", icon: "Factory", order: 4 },
  { name: "Communication", slug: "communication", description: "Email and collaboration tools", icon: "MessageSquare", order: 5 },
  { name: "Utilities", slug: "utilities", description: "IT support and utility tools", icon: "Wrench", order: 6 },
] as const;

export async function seedAppCategories(): Promise<void> {
  const count = await AppLinkCategory.countDocuments();
  if (count > 0) {
    console.log("App link categories already seeded, skipping...");
    return;
  }

  await AppLinkCategory.insertMany(appCategoriesSeedData);
  console.log(`Seeded ${appCategoriesSeedData.length} app link categories`);
}
