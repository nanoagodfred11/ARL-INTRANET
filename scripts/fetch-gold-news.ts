/**
 * Script to seed news sources and fetch gold news
 * Run with: npx tsx scripts/fetch-gold-news.ts
 */

import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env file
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

// MongoDB connection
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/arl-intranet";

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  }
}

// News Source Schema
const NewsSourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["rss", "api"], required: true },
  region: { type: String, enum: ["ghana", "world"], required: true },
  category: { type: String, default: "general" },
  isActive: { type: Boolean, default: true },
  lastFetched: { type: Date },
  lastError: { type: String },
  fetchInterval: { type: Number, default: 60 },
}, { timestamps: true });

// External News Schema
const ExternalNewsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  source: { type: String, required: true, trim: true },
  sourceUrl: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, trim: true, maxlength: 500 },
  imageUrl: { type: String },
  publishedAt: { type: Date, required: true, index: true },
  region: { type: String, enum: ["ghana", "world"], required: true },
  category: { type: String, default: "general" },
  hash: { type: String, required: true, unique: true },
}, { timestamps: true });

const NewsSource = mongoose.models.NewsSource || mongoose.model("NewsSource", NewsSourceSchema);
const ExternalNews = mongoose.models.ExternalNews || mongoose.model("ExternalNews", ExternalNewsSchema);

// News sources data - Using feeds that are publicly accessible
const newsSourcesData = [
  // Ghana / Africa News - Using Google News RSS for Ghana mining
  {
    name: "Ghana Mining News",
    url: "https://news.google.com/rss/search?q=ghana+gold+mining&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "ghana",
    category: "mining",
  },
  {
    name: "Ghana Business News",
    url: "https://news.google.com/rss/search?q=ghana+business+economy&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "ghana",
    category: "business",
  },
  {
    name: "Africa Mining News",
    url: "https://news.google.com/rss/search?q=africa+gold+mining&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "ghana",
    category: "mining",
  },
  // World Gold & Mining News
  {
    name: "World Gold News",
    url: "https://news.google.com/rss/search?q=gold+price+market&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "world",
    category: "gold",
  },
  {
    name: "Mining Industry News",
    url: "https://news.google.com/rss/search?q=mining+industry+gold&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "world",
    category: "mining",
  },
  {
    name: "Commodities News",
    url: "https://news.google.com/rss/search?q=gold+commodities+trading&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "world",
    category: "commodities",
  },
  {
    name: "Precious Metals News",
    url: "https://news.google.com/rss/search?q=precious+metals+gold+silver&hl=en-US&gl=US&ceid=US:en",
    type: "rss",
    region: "world",
    category: "gold",
  },
];

import crypto from "crypto";

// Helper functions
function generateHash(title: string, source: string): string {
  return crypto.createHash("md5").update(`${title.toLowerCase().trim()}|${source.toLowerCase().trim()}`).digest("hex");
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || "").trim() : null;
}

function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function cleanHtml(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();
}

// Parse RSS feed
async function parseRSSFeed(url: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ARL-Intranet/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items: any[] = [];

    // RSS 2.0 format
    const rssItemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = rssItemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link") || extractTag(itemXml, "guid");
      const description = extractTag(itemXml, "description") || extractTag(itemXml, "content:encoded");
      const pubDate = extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date");
      const enclosure = extractAttribute(itemXml, "enclosure", "url");
      const mediaContent = extractAttribute(itemXml, "media:content", "url");

      if (title && link) {
        items.push({
          title: cleanHtml(title),
          url: link,
          summary: cleanHtml(description)?.substring(0, 500),
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          imageUrl: enclosure || mediaContent,
        });
      }
    }

    // Atom format if no RSS items
    if (items.length === 0) {
      const atomEntryRegex = /<entry>([\s\S]*?)<\/entry>/gi;

      while ((match = atomEntryRegex.exec(xml)) !== null) {
        const entryXml = match[1];

        const title = extractTag(entryXml, "title");
        const link = extractAttribute(entryXml, "link", "href") || extractTag(entryXml, "id");
        const summary = extractTag(entryXml, "summary") || extractTag(entryXml, "content");
        const published = extractTag(entryXml, "published") || extractTag(entryXml, "updated");

        if (title && link) {
          items.push({
            title: cleanHtml(title),
            url: link,
            summary: cleanHtml(summary)?.substring(0, 500),
            publishedAt: published ? new Date(published) : new Date(),
            imageUrl: null,
          });
        }
      }
    }

    return items;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log(`    Timeout fetching ${url}`);
    } else {
      console.log(`    Error: ${error.message}`);
    }
    return [];
  }
}

// Seed news sources
async function seedNewsSources() {
  console.log("\n--- Seeding News Sources ---");

  for (const source of newsSourcesData) {
    const existing = await NewsSource.findOne({ name: source.name });
    if (!existing) {
      await NewsSource.create({ ...source, isActive: true });
      console.log(`  ✓ Created: ${source.name} (${source.region})`);
    } else {
      await NewsSource.updateOne({ _id: existing._id }, source);
      console.log(`  ~ Updated: ${source.name}`);
    }
  }

  const count = await NewsSource.countDocuments();
  console.log(`  Total sources: ${count}`);
}

// Fetch news from all sources
async function fetchAllNews() {
  console.log("\n--- Fetching News ---");

  const sources = await NewsSource.find({ isActive: true }).lean();
  let totalNew = 0;
  let errors = 0;

  for (const source of sources) {
    process.stdout.write(`  Fetching: ${source.name}... `);

    try {
      const items = await parseRSSFeed(source.url);

      let newCount = 0;
      for (const item of items) {
        const hash = generateHash(item.title, source.name);

        const existing = await ExternalNews.findOne({ hash });
        if (existing) continue;

        try {
          await ExternalNews.create({
            title: item.title,
            source: source.name,
            sourceUrl: source.url,
            url: item.url,
            summary: item.summary,
            imageUrl: item.imageUrl,
            publishedAt: item.publishedAt,
            region: source.region,
            category: source.category,
            hash,
          });
          newCount++;
        } catch (e) {
          // Duplicate or validation error
        }
      }

      console.log(`${items.length} found, ${newCount} new`);
      totalNew += newCount;

      await NewsSource.updateOne({ _id: source._id }, { lastFetched: new Date(), lastError: null });
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      errors++;
      await NewsSource.updateOne({ _id: source._id }, { lastError: error.message });
    }
  }

  return { totalNew, errors };
}

// Main function
async function main() {
  console.log("=".repeat(60));
  console.log("Gold News Fetcher");
  console.log("=".repeat(60));

  await connectDB();
  await seedNewsSources();

  const { totalNew, errors } = await fetchAllNews();

  // Statistics
  const stats = {
    total: await ExternalNews.countDocuments(),
    ghana: await ExternalNews.countDocuments({ region: "ghana" }),
    world: await ExternalNews.countDocuments({ region: "world" }),
    sources: await NewsSource.countDocuments(),
  };

  console.log("\n--- Statistics ---");
  console.log(`  Total articles: ${stats.total}`);
  console.log(`  Ghana news: ${stats.ghana}`);
  console.log(`  World news: ${stats.world}`);
  console.log(`  New articles this run: ${totalNew}`);
  if (errors > 0) console.log(`  Fetch errors: ${errors}`);

  // Show recent news
  const recentNews = await ExternalNews.find().sort({ publishedAt: -1 }).limit(10).lean();

  if (recentNews.length > 0) {
    console.log("\n--- Latest Headlines ---");
    recentNews.forEach((news: any, i: number) => {
      const date = new Date(news.publishedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      const region = news.region === "ghana" ? "🇬🇭" : "🌍";
      console.log(`  ${region} ${news.title.substring(0, 65)}${news.title.length > 65 ? "..." : ""}`);
      console.log(`     ${news.source} | ${date}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
