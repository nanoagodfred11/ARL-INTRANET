/**
 * Events API Route
 * Task: 1.3.1.1 - Events Backend
 */

import type { LoaderFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import { getEvents, getUpcomingEvents, serializeEvent } from "~/lib/services/event.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const upcoming = url.searchParams.get("upcoming") === "true";
  const past = url.searchParams.get("past") === "true";
  const featured = url.searchParams.get("featured") === "true";
  const search = url.searchParams.get("search") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const page = parseInt(url.searchParams.get("page") || "1");

  // Quick endpoint for upcoming events
  if (upcoming && !past && !search && !category) {
    const events = await getUpcomingEvents(limit);
    return Response.json({
      events: events.map(serializeEvent),
    });
  }

  const { events, total, pages } = await getEvents(
    {
      status: "published",
      upcoming,
      past,
      featured,
      search,
      category,
    },
    page,
    limit
  );

  return Response.json({
    events: events.map(serializeEvent),
    total,
    pages,
    page,
  });
}
