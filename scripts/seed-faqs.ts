/**
 * Script to seed FAQs for the chatbot
 */

import { connectDB } from "../app/lib/db/connection.server";
import { seedFAQs } from "../app/lib/db/seeds/faqs.seed";
import { FAQ } from "../app/lib/db/models/chat.server";

async function main() {
  console.log("Connecting to database...");
  await connectDB();

  console.log("\nSeeding FAQs...");
  await seedFAQs();

  const count = await FAQ.countDocuments();
  console.log(`\nTotal FAQs in database: ${count}`);

  // List categories
  const categories = await FAQ.distinct("category", { isActive: true });
  console.log("\nFAQ Categories:");
  for (const cat of categories) {
    const catCount = await FAQ.countDocuments({ category: cat, isActive: true });
    console.log(`  - ${cat}: ${catCount} FAQs`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
