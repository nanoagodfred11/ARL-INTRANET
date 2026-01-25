/**
 * News Sources Seed Data
 * Real RSS feeds for Gold Industry News
 */

import { NewsSource } from "../models/gold-news.server";

const newsSourcesData = [
  // ========== GHANA / AFRICA MINING NEWS ==========
  {
    name: "Mining Weekly Africa",
    url: "https://www.miningweekly.com/page/africa-rss",
    type: "rss" as const,
    region: "ghana" as const,
    category: "mining",
    isActive: true,
  },
  {
    name: "GhanaWeb Business",
    url: "https://www.ghanaweb.com/GhanaHomePage/business/rss.xml",
    type: "rss" as const,
    region: "ghana" as const,
    category: "business",
    isActive: true,
  },
  {
    name: "Modern Ghana Business",
    url: "https://www.modernghana.com/rss/business.xml",
    type: "rss" as const,
    region: "ghana" as const,
    category: "business",
    isActive: true,
  },

  // ========== WORLD GOLD & MINING NEWS ==========
  {
    name: "Mining.com",
    url: "https://www.mining.com/feed/",
    type: "rss" as const,
    region: "world" as const,
    category: "mining",
    isActive: true,
  },
  {
    name: "Kitco Gold News",
    url: "https://www.kitco.com/rss/gold.xml",
    type: "rss" as const,
    region: "world" as const,
    category: "gold",
    isActive: true,
  },
  {
    name: "Mining Technology",
    url: "https://www.mining-technology.com/feed/",
    type: "rss" as const,
    region: "world" as const,
    category: "mining",
    isActive: true,
  },
  {
    name: "Investing.com Gold",
    url: "https://www.investing.com/rss/news_301.rss",
    type: "rss" as const,
    region: "world" as const,
    category: "gold",
    isActive: true,
  },
  {
    name: "Reuters Commodities",
    url: "https://www.reutersagency.com/feed/?best-topics=commodities&post_type=best",
    type: "rss" as const,
    region: "world" as const,
    category: "commodities",
    isActive: true,
  },
  {
    name: "Mining Journal",
    url: "https://www.mining-journal.com/rss",
    type: "rss" as const,
    region: "world" as const,
    category: "mining",
    isActive: true,
  },
  {
    name: "Proactive Mining",
    url: "https://www.proactiveinvestors.com/companies/rss?tag=mining",
    type: "rss" as const,
    region: "world" as const,
    category: "mining",
    isActive: true,
  },
];

export async function seedNewsSources(): Promise<void> {
  console.log("Seeding news sources...");

  let created = 0;
  let existing = 0;

  for (const source of newsSourcesData) {
    const existingSource = await NewsSource.findOne({ name: source.name });
    if (!existingSource) {
      await NewsSource.create(source);
      created++;
      console.log(`  ✓ Created: ${source.name} (${source.region})`);
    } else {
      // Update existing source with new data
      await NewsSource.updateOne({ _id: existingSource._id }, source);
      existing++;
      console.log(`  ~ Updated: ${source.name}`);
    }
  }

  console.log(`\nNews sources seeding completed: ${created} created, ${existing} updated.`);
  console.log(`Total sources in database: ${await NewsSource.countDocuments()}`);
}
