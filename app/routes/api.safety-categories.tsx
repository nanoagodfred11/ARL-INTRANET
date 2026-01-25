/**
 * Safety Categories API Routes
 * Task: 1.2.2.1.8 - Category management endpoints
 */

import type { LoaderFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import { getSafetyCategories, serializeSafetyCategory } from "~/lib/services/safety.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("all") === "true";

  const categories = await getSafetyCategories(!includeInactive);

  return Response.json({
    categories: categories.map(serializeSafetyCategory),
  });
}
