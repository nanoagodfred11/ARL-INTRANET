/**
 * Safety Tips API Routes
 * Task: 1.2.2.1.4 - GET /api/safety-tips endpoint
 */

import type { LoaderFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import {
  getSafetyTips,
  getTipOfTheDay,
  serializeSafetyTip,
} from "~/lib/services/safety.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const todayOnly = url.searchParams.get("today") === "true";

  // Return tip of the day
  if (todayOnly) {
    const tip = await getTipOfTheDay();
    return Response.json({
      tip: tip ? serializeSafetyTip(tip) : null,
    });
  }

  // Return paginated tips
  const result = await getSafetyTips({
    category,
    search,
    page,
    limit,
    status: "published",
  });

  return Response.json({
    tips: result.tips.map(serializeSafetyTip),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}
