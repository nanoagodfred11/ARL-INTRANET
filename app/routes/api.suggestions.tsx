/**
 * Public Suggestions API
 * Task: 1.3.2.1.3 - Create POST /api/suggestions endpoint (public)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import {
  getActiveCategories,
  createSuggestion,
  hashIP,
  checkRateLimit,
} from "~/lib/services/suggestion.server";

// GET - Fetch active categories for the suggestion form
export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const categories = await getActiveCategories();

  return Response.json({
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
    })),
  });
}

// POST - Submit a new suggestion
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  await connectDB();

  // Get client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIP(ip);

  // Check rate limit
  const rateLimit = await checkRateLimit(ipHash);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many submissions. Please try again later.",
        resetTime: rateLimit.resetTime,
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;

  // Honeypot check - if this field has value, it's likely a bot
  const honeypot = formData.get("website") as string;
  if (honeypot) {
    // Silently accept but don't save (to confuse bots)
    return Response.json({ success: true, message: "Thank you for your suggestion!" });
  }

  // Validation
  if (!content || content.trim().length < 10) {
    return Response.json(
      { error: "Suggestion must be at least 10 characters long" },
      { status: 400 }
    );
  }

  if (content.length > 2000) {
    return Response.json(
      { error: "Suggestion must be less than 2000 characters" },
      { status: 400 }
    );
  }

  if (!categoryId) {
    return Response.json({ error: "Please select a category" }, { status: 400 });
  }

  try {
    await createSuggestion({
      content: content.trim(),
      categoryId,
      ipHash,
    });

    return Response.json({
      success: true,
      message: "Thank you for your suggestion!",
      remainingSubmissions: rateLimit.remainingSubmissions - 1,
    });
  } catch (error) {
    console.error("Failed to create suggestion:", error);
    return Response.json(
      { error: "Failed to submit suggestion. Please try again." },
      { status: 500 }
    );
  }
}
