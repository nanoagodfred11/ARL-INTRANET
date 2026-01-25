/**
 * Gold News API Endpoint
 * Task: 1.4.3.1.7 - Create GET /api/gold-news endpoint
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getGoldNews, fetchAllNews, getNewsStats } from "~/lib/services/gold-news.server";
import { requireAuth } from "~/lib/services/session.server";

// GET - Get gold news with filters
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region") as "ghana" | "world" | null;
  const category = url.searchParams.get("category") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  // Stats endpoint
  if (url.searchParams.get("stats") === "true") {
    const stats = await getNewsStats();
    return Response.json(stats);
  }

  const result = await getGoldNews({
    region: region || undefined,
    category,
    search,
    page,
    limit: Math.min(limit, 50), // Max 50 per page
  });

  return Response.json({
    news: result.news.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      source: n.source,
      url: n.url,
      summary: n.summary,
      imageUrl: n.imageUrl,
      publishedAt: n.publishedAt,
      region: n.region,
      category: n.category,
    })),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

// POST - Trigger manual fetch (admin only)
export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "fetch") {
    const result = await fetchAllNews();
    return Response.json({
      success: true,
      message: `Fetched ${result.total} new articles`,
      errors: result.errors,
    });
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
}
