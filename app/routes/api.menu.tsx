/**
 * Menu API Route
 * Task: 1.2.4.1.3 - Create GET /api/menu/today endpoint
 * Task: 1.2.4.1.4 - Create GET /api/menu/week endpoint
 */

import type { LoaderFunctionArgs } from "react-router";
import { connectDB } from "~/lib/db/connection.server";
import {
  getTodayMenu,
  getWeekMenus,
  getMenuByDate,
  serializeMenu,
} from "~/lib/services/menu.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "today";
  const dateParam = url.searchParams.get("date");

  try {
    switch (mode) {
      case "today": {
        const menu = await getTodayMenu();
        return Response.json({
          menu: menu ? serializeMenu(menu) : null,
        });
      }

      case "week": {
        const startDate = dateParam ? new Date(dateParam) : undefined;
        const menus = await getWeekMenus(startDate);
        return Response.json({
          menus: menus.map(serializeMenu),
        });
      }

      case "date": {
        if (!dateParam) {
          return Response.json({ error: "Date parameter required" }, { status: 400 });
        }
        const menu = await getMenuByDate(new Date(dateParam));
        return Response.json({
          menu: menu ? serializeMenu(menu) : null,
        });
      }

      default:
        return Response.json({ error: "Invalid mode" }, { status: 400 });
    }
  } catch (error) {
    console.error("Menu API error:", error);
    return Response.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
