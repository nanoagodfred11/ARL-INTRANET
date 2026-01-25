/**
 * Script to seed app link categories
 * Run with: npx tsx scripts/seed-app-categories.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl_intranet";

// AppLinkCategory Schema
const AppLinkCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const AppLinkCategory = mongoose.models.AppLinkCategory || mongoose.model("AppLinkCategory", AppLinkCategorySchema);

const categoriesData = [
  { name: "Business Apps", slug: "business-apps", description: "Core business applications", icon: "Briefcase", order: 1, isActive: true },
  { name: "HR & Payroll", slug: "hr-payroll", description: "Human resources and payroll systems", icon: "Users", order: 2, isActive: true },
  { name: "Operations", slug: "operations", description: "Mining and operations tools", icon: "Settings", order: 3, isActive: true },
  { name: "IT & Support", slug: "it-support", description: "IT services and support tools", icon: "Laptop", order: 4, isActive: true },
  { name: "Safety & HSE", slug: "safety-hse", description: "Health, safety and environment apps", icon: "Shield", order: 5, isActive: true },
  { name: "Communication", slug: "communication", description: "Communication and collaboration tools", icon: "MessageCircle", order: 6, isActive: true },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const count = await AppLinkCategory.countDocuments();
    if (count > 0) {
      console.log(`App link categories already exist (${count} found). Clearing and reseeding...`);
      await AppLinkCategory.deleteMany({});
    }

    await AppLinkCategory.insertMany(categoriesData);
    console.log(`\n✅ Seeded ${categoriesData.length} app link categories successfully!`);

    console.log("\nCategories created:");
    const categories = await AppLinkCategory.find({}).sort({ order: 1 });
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCategories();
