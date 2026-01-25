/**
 * Script to seed news categories
 * Run with: npx tsx scripts/seed-news-categories.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl_intranet";

// NewsCategory Schema
const NewsCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  color: { type: String, default: "#D4AF37" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const NewsCategory = mongoose.models.NewsCategory || mongoose.model("NewsCategory", NewsCategorySchema);

const categoriesData = [
  { name: "Company News", slug: "company-news", description: "Official company announcements and updates", color: "#D4AF37", order: 1, isActive: true },
  { name: "HSE Updates", slug: "hse-updates", description: "Health, Safety & Environment news", color: "#22C55E", order: 2, isActive: true },
  { name: "Operations", slug: "operations", description: "Mining and processing operations news", color: "#3B82F6", order: 3, isActive: true },
  { name: "Community", slug: "community", description: "Community engagement and social responsibility", color: "#8B5CF6", order: 4, isActive: true },
  { name: "Events", slug: "events", description: "Company events and celebrations", color: "#F59E0B", order: 5, isActive: true },
  { name: "Human Resources", slug: "human-resources", description: "HR announcements and policies", color: "#EC4899", order: 6, isActive: true },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const count = await NewsCategory.countDocuments();
    if (count > 0) {
      console.log(`News categories already exist (${count} found). Clearing and reseeding...`);
      await NewsCategory.deleteMany({});
    }

    await NewsCategory.insertMany(categoriesData);
    console.log(`\n✅ Seeded ${categoriesData.length} news categories successfully!`);

    console.log("\nCategories created:");
    const categories = await NewsCategory.find({}).sort({ order: 1 });
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.slug})`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCategories();
