/**
 * Suggestion Categories Seed Data
 * Task: 1.3.2.1.7 - Create category management endpoints
 */

import { SuggestionCategory } from "../models/suggestion.server";

const suggestionCategories = [
  {
    name: "Workplace Improvement",
    slug: "workplace-improvement",
    description: "Ideas to improve work environment, facilities, or processes",
    order: 0,
  },
  {
    name: "Safety & Health",
    slug: "safety-health",
    description: "Suggestions related to workplace safety and employee wellbeing",
    order: 1,
  },
  {
    name: "Communication",
    slug: "communication",
    description: "Ideas to improve internal communication and collaboration",
    order: 2,
  },
  {
    name: "Training & Development",
    slug: "training-development",
    description: "Suggestions for learning opportunities and skill development",
    order: 3,
  },
  {
    name: "Employee Benefits",
    slug: "employee-benefits",
    description: "Ideas related to employee benefits and welfare",
    order: 4,
  },
  {
    name: "Operations & Efficiency",
    slug: "operations-efficiency",
    description: "Suggestions to improve operational processes and efficiency",
    order: 5,
  },
  {
    name: "Other",
    slug: "other",
    description: "General suggestions that don't fit other categories",
    order: 99,
  },
];

export async function seedSuggestionCategories(): Promise<void> {
  console.log("Seeding suggestion categories...");

  for (const category of suggestionCategories) {
    const existing = await SuggestionCategory.findOne({ slug: category.slug });
    if (!existing) {
      await SuggestionCategory.create(category);
      console.log(`  Created suggestion category: ${category.name}`);
    } else {
      console.log(`  Suggestion category already exists: ${category.name}`);
    }
  }

  console.log("Suggestion categories seeding completed.");
}
