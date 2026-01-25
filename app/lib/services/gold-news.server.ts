/**
 * Gold Industry News Service
 * Task: 1.4.3 - Gold Industry News
 */

import crypto from "crypto";
import { connectDB } from "~/lib/db/connection.server";
import {
  ExternalNews,
  NewsSource,
  type IExternalNews,
  type INewsSource,
} from "~/lib/db/models/gold-news.server";

// Generate hash for deduplication
function generateNewsHash(title: string, source: string): string {
  return crypto
    .createHash("md5")
    .update(`${title.toLowerCase().trim()}|${source.toLowerCase().trim()}`)
    .digest("hex");
}

// Parse RSS feed (handles RSS 2.0, RSS 1.0, and Atom feeds)
async function parseRSSFeed(url: string): Promise<any[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ARL-Intranet-News-Aggregator/1.0)",
        "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items: any[] = [];

    // Try RSS 2.0 format first (<item> tags)
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
      const mediaThumbnail = extractAttribute(itemXml, "media:thumbnail", "url");

      if (title && link) {
        items.push({
          title: cleanHtml(title),
          url: link.startsWith("http") ? link : link,
          summary: cleanHtml(description)?.substring(0, 500),
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          imageUrl: enclosure || mediaContent || mediaThumbnail,
        });
      }
    }

    // If no RSS items found, try Atom format (<entry> tags)
    if (items.length === 0) {
      const atomEntryRegex = /<entry>([\s\S]*?)<\/entry>/gi;

      while ((match = atomEntryRegex.exec(xml)) !== null) {
        const entryXml = match[1];

        const title = extractTag(entryXml, "title");
        const link = extractAttribute(entryXml, "link", "href") || extractTag(entryXml, "link");
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
    console.error(`Error parsing RSS feed ${url}:`, error.message || error);
    return [];
  }
}

// Helper to extract XML tag content
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || "").trim() : null;
}

// Helper to extract XML attribute
function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

// Clean HTML from text
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
    .trim();
}

// Fetch news from a source
export async function fetchNewsFromSource(source: INewsSource): Promise<number> {
  await connectDB();

  let items: any[] = [];

  if (source.type === "rss") {
    items = await parseRSSFeed(source.url);
  }

  let newCount = 0;

  for (const item of items) {
    const hash = generateNewsHash(item.title, source.name);

    // Check for duplicate
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
    } catch (error) {
      // Likely duplicate, skip
    }
  }

  // Update source status
  await NewsSource.findByIdAndUpdate(source._id, {
    lastFetched: new Date(),
    lastError: null,
  });

  return newCount;
}

// Fetch all active sources
export async function fetchAllNews(): Promise<{ total: number; errors: string[] }> {
  await connectDB();

  const sources = await NewsSource.find({ isActive: true }).lean();
  let total = 0;
  const errors: string[] = [];

  for (const source of sources) {
    try {
      const count = await fetchNewsFromSource(source as INewsSource);
      total += count;
    } catch (error: any) {
      errors.push(`${source.name}: ${error.message}`);
      await NewsSource.findByIdAndUpdate(source._id, {
        lastError: error.message,
      });
    }
  }

  return { total, errors };
}

// Get news with filters
export interface NewsFilters {
  region?: "ghana" | "world";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getGoldNews(filters: NewsFilters = {}): Promise<{
  news: IExternalNews[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectDB();

  const { region, category, search, page = 1, limit = 20 } = filters;

  const query: Record<string, unknown> = {};

  if (region) query.region = region;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { summary: { $regex: search, $options: "i" } },
    ];
  }

  const total = await ExternalNews.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const news = await ExternalNews.find(query)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return { news, total, page, totalPages };
}

// Get single news item
export async function getNewsById(id: string): Promise<IExternalNews | null> {
  await connectDB();
  return ExternalNews.findById(id).lean();
}

// News source management
export async function getNewsSources(): Promise<INewsSource[]> {
  await connectDB();
  return NewsSource.find().sort({ region: 1, name: 1 }).lean();
}

export async function createNewsSource(data: {
  name: string;
  url: string;
  type: "rss" | "api";
  region: "ghana" | "world";
  category?: string;
}): Promise<INewsSource> {
  await connectDB();
  return NewsSource.create(data);
}

export async function updateNewsSource(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    type: "rss" | "api";
    region: "ghana" | "world";
    category: string;
    isActive: boolean;
    fetchInterval: number;
  }>
): Promise<INewsSource | null> {
  await connectDB();
  return NewsSource.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteNewsSource(id: string): Promise<boolean> {
  await connectDB();
  const result = await NewsSource.findByIdAndDelete(id);
  return !!result;
}

// Delete old news (cleanup job)
export async function cleanupOldNews(daysToKeep: number = 30): Promise<number> {
  await connectDB();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await ExternalNews.deleteMany({
    publishedAt: { $lt: cutoffDate },
  });

  return result.deletedCount;
}

// Get news stats
export async function getNewsStats(): Promise<{
  total: number;
  ghana: number;
  world: number;
  today: number;
  sources: number;
  activeSources: number;
}> {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, ghana, world, todayCount, sources, activeSources] = await Promise.all([
    ExternalNews.countDocuments(),
    ExternalNews.countDocuments({ region: "ghana" }),
    ExternalNews.countDocuments({ region: "world" }),
    ExternalNews.countDocuments({ publishedAt: { $gte: today } }),
    NewsSource.countDocuments(),
    NewsSource.countDocuments({ isActive: true }),
  ]);

  return { total, ghana, world, today: todayCount, sources, activeSources };
}
