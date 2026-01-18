/**
 * Admin Logout
 * Task: 1.1.2.2.7
 */

import type { LoaderFunctionArgs } from "react-router";
import { logout, getSessionData } from "~/lib/services/session.server";
import { logActivity } from "~/lib/services/activity-log.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionData = await getSessionData(request);

  if (sessionData?.userId) {
    await logActivity({
      userId: sessionData.userId,
      action: "logout",
      resource: "session",
      request,
    });
  }

  return logout(request);
}
