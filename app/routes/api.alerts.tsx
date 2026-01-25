/**
 * Alerts API Routes
 * Task: 1.2.3.1.2-4
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import {
  getAlerts,
  getActiveAlerts,
  getPopupAlerts,
  getBannerAlerts,
  getAlertHistory,
  getActiveAlertCount,
  acknowledgeAlert,
  serializeAlert,
  type AlertSeverity,
  type AlertType,
} from "~/lib/services/alert.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode"); // active, popup, banner, history, count
  const severity = url.searchParams.get("severity") as AlertSeverity | null;
  const type = url.searchParams.get("type") as AlertType | null;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);

  // Get alert count for badge
  if (mode === "count") {
    const count = await getActiveAlertCount();
    return Response.json({ count });
  }

  // Get popup alerts
  if (mode === "popup") {
    const alerts = await getPopupAlerts();
    return Response.json({
      alerts: alerts.map(serializeAlert),
    });
  }

  // Get banner alerts
  if (mode === "banner") {
    const alerts = await getBannerAlerts();
    return Response.json({
      alerts: alerts.map(serializeAlert),
    });
  }

  // Get active alerts
  if (mode === "active") {
    const alerts = await getActiveAlerts();
    return Response.json({
      alerts: alerts.map(serializeAlert),
    });
  }

  // Get alert history
  if (mode === "history") {
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const result = await getAlertHistory({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      severity: severity || undefined,
      type: type || undefined,
      page,
      limit,
    });

    return Response.json({
      alerts: result.alerts.map(serializeAlert),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  }

  // Default: get all active alerts with pagination
  const result = await getAlerts({
    severity: severity || undefined,
    type: type || undefined,
    page,
    limit,
  });

  return Response.json({
    alerts: result.alerts.map(serializeAlert),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

// Task: 1.2.3.1.7 - Acknowledge alert
export async function action({ request }: ActionFunctionArgs) {
  await connectDB();

  const formData = await request.formData();
  const intent = formData.get("intent");
  const alertId = formData.get("alertId") as string;
  const visitorId = formData.get("visitorId") as string;

  if (intent === "acknowledge" && alertId && visitorId) {
    await acknowledgeAlert(alertId, visitorId);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}
