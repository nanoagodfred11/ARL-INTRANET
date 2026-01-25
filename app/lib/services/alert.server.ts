/**
 * Alert Service
 * Task: 1.2.3.1.2-7 (Backend Development)
 */

import { Alert, type IAlert, type AlertSeverity, type AlertType } from "~/lib/db/models/alert.server";

// Re-export types for use by routes
export type { AlertSeverity, AlertType };

// ============================================
// Input Types
// ============================================

export interface AlertInput {
  title: string;
  message: string;
  severity?: AlertSeverity;
  type?: AlertType;
  isActive?: boolean;
  isPinned?: boolean;
  showPopup?: boolean;
  showBanner?: boolean;
  playSound?: boolean;
  startDate?: Date;
  endDate?: Date;
  author: string;
}

// ============================================
// CRUD Operations - Task: 1.2.3.1.5
// ============================================

export async function createAlert(data: AlertInput): Promise<IAlert> {
  const alert = new Alert(data);
  await alert.save();
  return alert.populate("author");
}

export async function updateAlert(
  id: string,
  data: Partial<AlertInput>
): Promise<IAlert | null> {
  const alert = await Alert.findByIdAndUpdate(id, data, { new: true });
  return alert?.populate("author") || null;
}

export async function deleteAlert(id: string): Promise<boolean> {
  const result = await Alert.findByIdAndDelete(id);
  return !!result;
}

export async function getAlertById(id: string): Promise<IAlert | null> {
  return Alert.findById(id).populate("author");
}

// ============================================
// Task: 1.2.3.1.2 - GET /api/alerts endpoint (active alerts)
// ============================================

export interface GetAlertsOptions {
  isActive?: boolean;
  severity?: AlertSeverity;
  type?: AlertType;
  includeAll?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedAlerts {
  alerts: IAlert[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAlerts(options: GetAlertsOptions = {}): Promise<PaginatedAlerts> {
  const filter: Record<string, unknown> = {};
  const page = options.page || 1;
  const limit = options.limit || 20;
  const now = new Date();

  if (!options.includeAll) {
    filter.isActive = options.isActive ?? true;
    // Only show alerts that are currently scheduled
    filter.$or = [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ];
    filter.$and = [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ];
  }

  if (options.severity) {
    filter.severity = options.severity;
  }

  if (options.type) {
    filter.type = options.type;
  }

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate("author")
      .sort({ isPinned: -1, severity: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================
// Task: 1.2.3.1.3 - GET /api/alerts/active endpoint (for popups)
// ============================================

export async function getActiveAlerts(): Promise<IAlert[]> {
  const now = new Date();

  return Alert.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("author")
    .sort({ severity: -1, isPinned: -1, createdAt: -1 });
}

// Get alerts for popup display (showPopup = true)
export async function getPopupAlerts(): Promise<IAlert[]> {
  const now = new Date();

  return Alert.find({
    isActive: true,
    showPopup: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("author")
    .sort({ severity: -1, createdAt: -1 });
}

// Get alerts for banner display (showBanner = true)
export async function getBannerAlerts(): Promise<IAlert[]> {
  const now = new Date();

  return Alert.find({
    isActive: true,
    showBanner: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("author")
    .sort({ severity: -1, isPinned: -1 });
}

// ============================================
// Task: 1.2.3.1.4 - GET /api/alerts/history endpoint
// ============================================

export interface GetAlertHistoryOptions {
  startDate?: Date;
  endDate?: Date;
  severity?: AlertSeverity;
  type?: AlertType;
  page?: number;
  limit?: number;
}

export async function getAlertHistory(options: GetAlertHistoryOptions = {}): Promise<PaginatedAlerts> {
  const filter: Record<string, unknown> = {};
  const page = options.page || 1;
  const limit = options.limit || 20;

  // History includes inactive alerts or alerts that have ended
  const now = new Date();
  filter.$or = [
    { isActive: false },
    { endDate: { $lt: now } },
  ];

  if (options.startDate || options.endDate) {
    filter.createdAt = {};
    if (options.startDate) {
      (filter.createdAt as Record<string, Date>).$gte = options.startDate;
    }
    if (options.endDate) {
      (filter.createdAt as Record<string, Date>).$lte = options.endDate;
    }
  }

  if (options.severity) {
    filter.severity = options.severity;
  }

  if (options.type) {
    filter.type = options.type;
  }

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate("author")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================
// Task: 1.2.3.1.6 - Implement alert scheduling
// ============================================

export async function scheduleAlert(
  id: string,
  startDate: Date,
  endDate?: Date
): Promise<IAlert | null> {
  return Alert.findByIdAndUpdate(
    id,
    { startDate, endDate, isActive: true },
    { new: true }
  ).populate("author");
}

// Check if alert is currently active based on schedule
export function isAlertScheduledNow(alert: IAlert): boolean {
  const now = new Date();

  if (!alert.isActive) return false;

  if (alert.startDate && alert.startDate > now) return false;
  if (alert.endDate && alert.endDate < now) return false;

  return true;
}

// ============================================
// Task: 1.2.3.1.7 - Alert acknowledgment tracking
// ============================================

export async function acknowledgeAlert(
  alertId: string,
  visitorId: string
): Promise<boolean> {
  const result = await Alert.findByIdAndUpdate(
    alertId,
    {
      $addToSet: {
        acknowledgments: {
          visitorId,
          acknowledgedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  return !!result;
}

export async function hasAcknowledgedAlert(
  alertId: string,
  visitorId: string
): Promise<boolean> {
  const alert = await Alert.findOne({
    _id: alertId,
    "acknowledgments.visitorId": visitorId,
  });

  return !!alert;
}

export async function getUnacknowledgedAlerts(visitorId: string): Promise<IAlert[]> {
  const now = new Date();

  return Alert.find({
    isActive: true,
    showPopup: true,
    "acknowledgments.visitorId": { $ne: visitorId },
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate("author")
    .sort({ severity: -1, createdAt: -1 });
}

// ============================================
// Utilities
// ============================================

export async function incrementAlertViews(id: string): Promise<void> {
  await Alert.findByIdAndUpdate(id, { $inc: { views: 1 } });
}

export async function toggleAlertStatus(id: string): Promise<IAlert | null> {
  const alert = await Alert.findById(id);
  if (!alert) return null;

  alert.isActive = !alert.isActive;
  await alert.save();
  return alert;
}

export async function getAlertStats(): Promise<{
  total: number;
  active: number;
  critical: number;
  warning: number;
  info: number;
  scheduled: number;
}> {
  const now = new Date();

  const [total, active, critical, warning, info, scheduled] = await Promise.all([
    Alert.countDocuments(),
    Alert.countDocuments({ isActive: true }),
    Alert.countDocuments({ isActive: true, severity: "critical" }),
    Alert.countDocuments({ isActive: true, severity: "warning" }),
    Alert.countDocuments({ isActive: true, severity: "info" }),
    Alert.countDocuments({
      isActive: true,
      startDate: { $gt: now },
    }),
  ]);

  return { total, active, critical, warning, info, scheduled };
}

// Get count of active alerts (for badge display)
export async function getActiveAlertCount(): Promise<number> {
  const now = new Date();

  return Alert.countDocuments({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  });
}

// ============================================
// Serialization Helpers
// ============================================

export interface SerializedAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  type: AlertType;
  isActive: boolean;
  isPinned: boolean;
  showPopup: boolean;
  showBanner: boolean;
  playSound: boolean;
  startDate: string | null;
  endDate: string | null;
  views: number;
  acknowledgmentCount: number;
  author: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeAlert(alert: IAlert): SerializedAlert {
  return {
    id: alert._id.toString(),
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    type: alert.type,
    isActive: alert.isActive,
    isPinned: alert.isPinned,
    showPopup: alert.showPopup,
    showBanner: alert.showBanner,
    playSound: alert.playSound,
    startDate: alert.startDate?.toISOString() || null,
    endDate: alert.endDate?.toISOString() || null,
    views: alert.views,
    acknowledgmentCount: alert.acknowledgments?.length || 0,
    author: alert.author
      ? { name: (alert.author as { name?: string }).name || "Unknown" }
      : null,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
  };
}

export function serializeAlertList(alerts: IAlert[]): SerializedAlert[] {
  return alerts.map(serializeAlert);
}
