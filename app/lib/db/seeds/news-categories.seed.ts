import { NewsCategory } from "../models";

export const newsCategoriesSeedData = [
  { name: "General", slug: "general", description: "General company news and updates", color: "#627D98", order: 1 },
  { name: "Operations", slug: "operations", description: "Mining and processing updates", color: "#D4AF37", order: 2 },
  { name: "HSE", slug: "hse", description: "Health, Safety & Environment news", color: "#10B981", order: 3 },
  { name: "HR", slug: "hr", description: "Human Resources announcements", color: "#8B5CF6", order: 4 },
  { name: "SRD", slug: "srd", description: "Social Responsibility & Development", color: "#F97316", order: 5 },
  { name: "IT", slug: "it", description: "Technology and systems updates", color: "#3B82F6", order: 6 },
  { name: "Events", slug: "events", description: "Company events and activities", color: "#EC4899", order: 7 },
] as const;

export async function seedNewsCategories(): Promise<void> {
  const count = await NewsCategory.countDocuments();
  if (count > 0) {
    console.log("News categories already seeded, skipping...");
    return;
  }

  await NewsCategory.insertMany(newsCategoriesSeedData);
  console.log(`Seeded ${newsCategoriesSeedData.length} news categories`);
}
