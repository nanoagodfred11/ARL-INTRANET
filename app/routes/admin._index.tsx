/**
 * Admin Dashboard
 * Task: 1.1.2.3.2
 */

import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  Newspaper,
  Users,
  AppWindow,
  Shield,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { requireAuth } from "~/lib/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);

  // TODO: Fetch actual stats from database
  const stats = {
    news: 24,
    contacts: 1200,
    apps: 15,
    safetyAlerts: 3,
  };

  const recentActivity = [
    { action: "New article published", time: "2 hours ago", type: "news" },
    { action: "Contact directory updated", time: "5 hours ago", type: "directory" },
    { action: "Safety alert activated", time: "1 day ago", type: "safety" },
    { action: "New app link added", time: "2 days ago", type: "app" },
  ];

  return Response.json({
    user: {
      name: user.name,
      role: user.role,
    },
    stats,
    recentActivity,
  });
}

export default function AdminDashboard() {
  const { user, stats, recentActivity } = useLoaderData<typeof loader>();

  const statCards = [
    {
      label: "News Articles",
      value: stats.news,
      icon: Newspaper,
      color: "bg-blue-500",
      href: "/admin/news",
    },
    {
      label: "Contacts",
      value: stats.contacts.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      href: "/admin/directory",
    },
    {
      label: "App Links",
      value: stats.apps,
      icon: AppWindow,
      color: "bg-purple-500",
      href: "/admin/apps",
    },
    {
      label: "Active Alerts",
      value: stats.safetyAlerts,
      icon: AlertTriangle,
      color: "bg-orange-500",
      href: "/admin/safety",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600">
        <CardBody className="py-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-white/80">
            Here's what's happening with ARL Connect today.
          </p>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "news"
                        ? "bg-blue-500"
                        : activity.type === "directory"
                          ? "bg-green-500"
                          : activity.type === "safety"
                            ? "bg-orange-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/news/new"
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <Newspaper size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Add News
                </span>
              </a>
              <a
                href="/admin/directory/new"
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <Users size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Add Contact
                </span>
              </a>
              <a
                href="/admin/apps/new"
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <AppWindow size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Add App Link
                </span>
              </a>
              <a
                href="/admin/safety/new"
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <Shield size={24} className="text-primary-500" />
                <span className="text-sm font-medium text-gray-700">
                  Add Alert
                </span>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
