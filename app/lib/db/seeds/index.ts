import { connectToDatabase, disconnectFromDatabase } from "../connection.server";
import { seedDepartments } from "./departments.seed";
import { seedNewsCategories } from "./news-categories.seed";
import { seedAppCategories } from "./app-categories.seed";
import { seedSuggestionCategories } from "./suggestion-categories.seed";
import { seedFAQs } from "./faqs.seed";

export async function runAllSeeds(): Promise<void> {
  try {
    await connectToDatabase();
    console.log("Starting database seeding...\n");

    await seedDepartments();
    await seedNewsCategories();
    await seedAppCategories();
    await seedSuggestionCategories();
    await seedFAQs();

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await disconnectFromDatabase();
  }
}

// Run seeds if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
