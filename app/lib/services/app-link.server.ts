/**
 * AppLink Service
 * Task: 1.1.5.1.2, 1.1.5.2.2
 */

import { AppLink, AppLinkCategory, type IAppLink, type IAppLinkCategory } from "~/lib/db/models/app-link.server";

// ============================================
// Category Functions
// ============================================

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export async function createCategory(data: CategoryInput): Promise<IAppLinkCategory> {
  const category = new AppLinkCategory(data);
  await category.save();
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryInput>
): Promise<IAppLinkCategory | null> {
  return AppLinkCategory.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteCategory(id: string): Promise<boolean> {
  // Check if category has app links
  const linkCount = await AppLink.countDocuments({ category: id });
  if (linkCount > 0) {
    throw new Error(`Cannot delete category with ${linkCount} app links`);
  }

  const result = await AppLinkCategory.findByIdAndDelete(id);
  return !!result;
}

export async function getCategoryById(id: string): Promise<IAppLinkCategory | null> {
  return AppLinkCategory.findById(id);
}

export async function getCategoryBySlug(slug: string): Promise<IAppLinkCategory | null> {
  return AppLinkCategory.findOne({ slug: slug.toLowerCase() });
}

export interface GetCategoriesOptions {
  isActive?: boolean;
  includeInactive?: boolean;
}

export async function getCategories(options: GetCategoriesOptions = {}): Promise<IAppLinkCategory[]> {
  const filter: Record<string, unknown> = {};

  if (!options.includeInactive) {
    filter.isActive = true;
  } else if (options.isActive !== undefined) {
    filter.isActive = options.isActive;
  }

  return AppLinkCategory.find(filter).sort({ order: 1, name: 1 });
}

export async function getCategoryStats(): Promise<{
  total: number;
  active: number;
}> {
  const [total, active] = await Promise.all([
    AppLinkCategory.countDocuments(),
    AppLinkCategory.countDocuments({ isActive: true }),
  ]);

  return { total, active };
}

// ============================================
// AppLink Functions
// ============================================

export interface AppLinkInput {
  name: string;
  description?: string;
  url: string;
  icon?: string;
  iconType?: "url" | "lucide" | "emoji";
  category: string;
  isInternal?: boolean;
  isActive?: boolean;
  order?: number;
}

export async function createAppLink(data: AppLinkInput): Promise<IAppLink> {
  const appLink = new AppLink(data);
  await appLink.save();
  return appLink.populate("category");
}

export async function updateAppLink(
  id: string,
  data: Partial<AppLinkInput>
): Promise<IAppLink | null> {
  const appLink = await AppLink.findByIdAndUpdate(id, data, { new: true });
  return appLink?.populate("category") || null;
}

export async function deleteAppLink(id: string): Promise<boolean> {
  const result = await AppLink.findByIdAndDelete(id);
  return !!result;
}

export async function getAppLinkById(id: string): Promise<IAppLink | null> {
  return AppLink.findById(id).populate("category");
}

export interface GetAppLinksOptions {
  category?: string;
  search?: string;
  isActive?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedAppLinks {
  appLinks: IAppLink[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAppLinks(options: GetAppLinksOptions = {}): Promise<PaginatedAppLinks> {
  const filter: Record<string, unknown> = {};
  const page = options.page || 1;
  const limit = options.limit || 50;

  if (options.category) {
    filter.category = options.category;
  }

  if (options.search) {
    filter.$or = [
      { name: { $regex: options.search, $options: "i" } },
      { description: { $regex: options.search, $options: "i" } },
    ];
  }

  if (!options.includeInactive) {
    filter.isActive = true;
  } else if (options.isActive !== undefined) {
    filter.isActive = options.isActive;
  }

  const [appLinks, total] = await Promise.all([
    AppLink.find(filter)
      .populate("category")
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AppLink.countDocuments(filter),
  ]);

  return {
    appLinks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAppLinksByCategory(categoryId: string): Promise<IAppLink[]> {
  return AppLink.find({ category: categoryId, isActive: true })
    .populate("category")
    .sort({ order: 1, name: 1 });
}

export async function searchAppLinks(query: string, limit = 10): Promise<IAppLink[]> {
  return AppLink.find({
    isActive: true,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  })
    .populate("category")
    .sort({ order: 1, name: 1 })
    .limit(limit);
}

export async function incrementClicks(id: string): Promise<void> {
  await AppLink.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
}

export async function getAppLinkStats(): Promise<{
  total: number;
  active: number;
  totalClicks: number;
  byCategory: Array<{ category: string; categoryId: string; count: number }>;
  topLinks: Array<{ name: string; clicks: number }>;
}> {
  const [total, active, clicksResult, byCategory, topLinks] = await Promise.all([
    AppLink.countDocuments(),
    AppLink.countDocuments({ isActive: true }),
    AppLink.aggregate([
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } },
    ]),
    AppLink.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "applinkcategories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      { $project: { category: "$cat.name", categoryId: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]),
    AppLink.find({ isActive: true })
      .select("name clicks")
      .sort({ clicks: -1 })
      .limit(5),
  ]);

  return {
    total,
    active,
    totalClicks: clicksResult[0]?.totalClicks || 0,
    byCategory,
    topLinks: topLinks.map((l) => ({ name: l.name, clicks: l.clicks })),
  };
}

// ============================================
// Reorder App Links
// Task: 1.1.5.3.4
// ============================================

export async function reorderAppLinks(
  orderedIds: string[]
): Promise<void> {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await AppLink.bulkWrite(bulkOps);
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<void> {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await AppLinkCategory.bulkWrite(bulkOps);
}

// ============================================
// Get All Data for Public Page
// ============================================

export interface AppLinksGroupedByCategory {
  category: IAppLinkCategory;
  links: IAppLink[];
}

export async function getAppLinksGroupedByCategory(): Promise<AppLinksGroupedByCategory[]> {
  const categories = await AppLinkCategory.find({ isActive: true }).sort({ order: 1, name: 1 });

  const result: AppLinksGroupedByCategory[] = [];

  for (const category of categories) {
    const links = await AppLink.find({ category: category._id, isActive: true })
      .sort({ order: 1, name: 1 });

    if (links.length > 0) {
      result.push({ category, links });
    }
  }

  return result;
}
