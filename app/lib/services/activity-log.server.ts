/**
 * Activity Log Service
 * Task: 1.1.2.4.8
 */

import { ActivityLog, type IActivityLog } from "~/lib/db/models/activity-log.server";
import { AdminUser } from "~/lib/db/models/admin-user.server";
import { connectDB } from "~/lib/db/connection.server";

interface LogActivityParams {
  userId?: string;
  action: IActivityLog["action"];
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: Request;
}

/**
 * Log an activity
 */
export async function logActivity({
  userId,
  action,
  resource,
  resourceId,
  details,
  request,
}: LogActivityParams): Promise<void> {
  try {
    await connectDB();

    let userName: string | undefined;
    if (userId) {
      const user = await AdminUser.findById(userId).select("name").lean();
      userName = user?.name;
    }

    // Extract IP and User Agent from request
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (request) {
      ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown";
      userAgent = request.headers.get("user-agent") || undefined;
    }

    await ActivityLog.create({
      userId,
      userName,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Don't throw - logging should not break the main operation
    console.error("Failed to log activity:", error);
  }
}

/**
 * Get activity logs with filtering and pagination
 */
export async function getActivityLogs({
  userId,
  resource,
  action,
  page = 1,
  limit = 50,
}: {
  userId?: string;
  resource?: string;
  action?: string;
  page?: number;
  limit?: number;
} = {}) {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (userId) query.userId = userId;
  if (resource) query.resource = resource;
  if (action) query.action = action;

  const totalCount = await ActivityLog.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const logs = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    logs: logs.map((log) => ({
      id: log._id.toString(),
      userId: log.userId?.toString(),
      userName: log.userName,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page,
      totalPages,
      totalCount,
    },
  };
}

/**
 * Get activity stats for dashboard
 */
export async function getActivityStats() {
  await connectDB();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayCount, weekCount, totalCount, recentLogins] = await Promise.all([
    ActivityLog.countDocuments({ createdAt: { $gte: today } }),
    ActivityLog.countDocuments({ createdAt: { $gte: thisWeek } }),
    ActivityLog.countDocuments(),
    ActivityLog.find({ action: "login" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    todayCount,
    weekCount,
    totalCount,
    recentLogins: recentLogins.map((log) => ({
      userName: log.userName,
      createdAt: log.createdAt.toISOString(),
      ipAddress: log.ipAddress,
    })),
  };
}
