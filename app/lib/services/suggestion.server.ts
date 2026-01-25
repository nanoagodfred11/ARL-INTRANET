/**
 * Suggestion Service
 * Task: 1.3.2.1 - Anonymous Suggestion Box Backend
 */

import crypto from "crypto";
import { connectDB } from "~/lib/db/connection.server";
import {
  Suggestion,
  SuggestionCategory,
  type ISuggestion,
  type ISuggestionCategory,
} from "~/lib/db/models/suggestion.server";

// Hash IP address for privacy while maintaining traceability
export function hashIP(ip: string, salt?: string): string {
  const secretSalt = salt || process.env.IP_HASH_SALT || "arl-suggestion-salt";
  return crypto
    .createHash("sha256")
    .update(ip + secretSalt)
    .digest("hex")
    .substring(0, 32); // Truncate for storage efficiency
}

// Rate limiting check - returns true if allowed, false if rate limited
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 3;

export async function checkRateLimit(ipHash: string): Promise<{
  allowed: boolean;
  remainingSubmissions: number;
  resetTime?: Date;
}> {
  await connectDB();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);

  const recentSubmissions = await Suggestion.countDocuments({
    ipHash,
    createdAt: { $gte: windowStart },
  });

  const allowed = recentSubmissions < MAX_SUBMISSIONS_PER_WINDOW;
  const remainingSubmissions = Math.max(0, MAX_SUBMISSIONS_PER_WINDOW - recentSubmissions);

  // Find the oldest submission in the window to calculate reset time
  let resetTime: Date | undefined;
  if (!allowed) {
    const oldestInWindow = await Suggestion.findOne({
      ipHash,
      createdAt: { $gte: windowStart },
    })
      .sort({ createdAt: 1 })
      .lean();

    if (oldestInWindow) {
      resetTime = new Date(oldestInWindow.createdAt.getTime() + RATE_LIMIT_WINDOW);
    }
  }

  return { allowed, remainingSubmissions, resetTime };
}

// Category functions
export async function getActiveCategories(): Promise<ISuggestionCategory[]> {
  await connectDB();
  return SuggestionCategory.find({ isActive: true }).sort({ order: 1 }).lean();
}

export async function getAllCategories(): Promise<ISuggestionCategory[]> {
  await connectDB();
  return SuggestionCategory.find().sort({ order: 1 }).lean();
}

export async function getCategoryById(id: string): Promise<ISuggestionCategory | null> {
  await connectDB();
  return SuggestionCategory.findById(id).lean();
}

export async function createCategory(data: {
  name: string;
  description?: string;
}): Promise<ISuggestionCategory> {
  await connectDB();

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Get max order
  const maxOrder = await SuggestionCategory.findOne()
    .sort({ order: -1 })
    .select("order")
    .lean();

  return SuggestionCategory.create({
    ...data,
    slug,
    order: (maxOrder?.order ?? -1) + 1,
  });
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<ISuggestionCategory, "name" | "description" | "isActive" | "order">>
): Promise<ISuggestionCategory | null> {
  await connectDB();

  const updateData: Record<string, unknown> = { ...data };

  // Update slug if name changed
  if (data.name) {
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return SuggestionCategory.findByIdAndUpdate(id, updateData, { new: true }).lean();
}

export async function deleteCategory(id: string): Promise<boolean> {
  await connectDB();

  // Check if category has suggestions
  const suggestionCount = await Suggestion.countDocuments({ category: id });
  if (suggestionCount > 0) {
    throw new Error("Cannot delete category with existing suggestions");
  }

  const result = await SuggestionCategory.findByIdAndDelete(id);
  return !!result;
}

// Suggestion functions
export async function createSuggestion(data: {
  content: string;
  categoryId: string;
  ipHash: string;
}): Promise<ISuggestion> {
  await connectDB();

  return Suggestion.create({
    content: data.content,
    category: data.categoryId,
    ipHash: data.ipHash,
    status: "new",
  });
}

export interface SuggestionFilters {
  status?: ISuggestion["status"];
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getSuggestions(filters: SuggestionFilters = {}): Promise<{
  suggestions: ISuggestion[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectDB();

  const { status, category, search, page = 1, limit = 20 } = filters;

  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.content = { $regex: search, $options: "i" };
  }

  const total = await Suggestion.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const suggestions = await Suggestion.find(query)
    .populate("category", "name slug")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    suggestions,
    total,
    page,
    totalPages,
  };
}

export async function getSuggestionById(id: string): Promise<ISuggestion | null> {
  await connectDB();

  return Suggestion.findById(id)
    .populate("category", "name slug")
    .populate("reviewedBy", "name")
    .lean();
}

export async function updateSuggestionStatus(
  id: string,
  status: ISuggestion["status"],
  adminId: string,
  notes?: string
): Promise<ISuggestion | null> {
  await connectDB();

  const updateData: Record<string, unknown> = {
    status,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  };

  if (notes !== undefined) {
    updateData.adminNotes = notes;
  }

  return Suggestion.findByIdAndUpdate(id, updateData, { new: true })
    .populate("category", "name slug")
    .populate("reviewedBy", "name")
    .lean();
}

export async function addAdminNote(
  id: string,
  notes: string,
  adminId: string
): Promise<ISuggestion | null> {
  await connectDB();

  return Suggestion.findByIdAndUpdate(
    id,
    {
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    { new: true }
  )
    .populate("category", "name slug")
    .populate("reviewedBy", "name")
    .lean();
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  await connectDB();
  const result = await Suggestion.findByIdAndDelete(id);
  return !!result;
}

// Statistics for admin dashboard
export async function getSuggestionStats(): Promise<{
  total: number;
  new: number;
  reviewed: number;
  inProgress: number;
  resolved: number;
  archived: number;
  thisWeek: number;
  thisMonth: number;
}> {
  await connectDB();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, newCount, reviewed, inProgress, resolved, archived, thisWeek, thisMonth] =
    await Promise.all([
      Suggestion.countDocuments(),
      Suggestion.countDocuments({ status: "new" }),
      Suggestion.countDocuments({ status: "reviewed" }),
      Suggestion.countDocuments({ status: "in_progress" }),
      Suggestion.countDocuments({ status: "resolved" }),
      Suggestion.countDocuments({ status: "archived" }),
      Suggestion.countDocuments({ createdAt: { $gte: weekAgo } }),
      Suggestion.countDocuments({ createdAt: { $gte: monthAgo } }),
    ]);

  return {
    total,
    new: newCount,
    reviewed,
    inProgress,
    resolved,
    archived,
    thisWeek,
    thisMonth,
  };
}

// IP trace lookup (superadmin only)
export async function getSuggestionsByIPHash(ipHash: string): Promise<ISuggestion[]> {
  await connectDB();

  return Suggestion.find({ ipHash })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();
}
