/**
 * Safety Hub Page
 * Links to safety tips, videos, and alerts
 */

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
} from "@heroui/react";
import { Shield, FileText, Video, Bell, ArrowRight } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { MainLayout } from "~/components/layout";
import { connectDB } from "~/lib/db/connection.server";
import { SafetyTip } from "~/lib/db/models/safety-tip.server";
import { SafetyVideo } from "~/lib/db/models/safety-video.server";
import { Alert } from "~/lib/db/models/alert.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const [tipCount, videoCount, alertCount, recentTips, recentVideos] = await Promise.all([
    SafetyTip.countDocuments({ status: "published" }),
    SafetyVideo.countDocuments({ status: "published" }),
    Alert.countDocuments({ isActive: true, type: "safety" }),
    SafetyTip.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
    SafetyVideo.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(2)
      .lean(),
  ]);

  return Response.json({
    stats: {
      tips: tipCount,
      videos: videoCount,
      alerts: alertCount,
    },
    recentTips: recentTips.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      slug: t.slug,
    })),
    recentVideos: recentVideos.map((v) => ({
      id: v._id.toString(),
      title: v.title,
      thumbnail: v.thumbnail,
    })),
  });
}

export default function SafetyHubPage() {
  const { stats, recentTips, recentVideos } = useLoaderData<typeof loader>();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Center</h1>
          <p className="text-gray-500">
            Access safety resources, tips, videos, and alerts
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <FileText size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.tips}</p>
                <p className="text-sm text-gray-500">Safety Tips</p>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Video size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.videos}</p>
                <p className="text-sm text-gray-500">Safety Videos</p>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Bell size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
                <p className="text-sm text-gray-500">Active Alerts</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Safety Tips */}
          <Card className="shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Safety Tips</h2>
                  <p className="text-xs text-gray-500">Daily safety guidance</p>
                </div>
              </div>
              <Button
                as={Link}
                to="/safety-tips"
                variant="light"
                color="primary"
                endContent={<ArrowRight size={16} />}
              >
                View All
              </Button>
            </CardHeader>
            <CardBody className="pt-0">
              {recentTips.length > 0 ? (
                <div className="space-y-3">
                  {recentTips.map((tip) => (
                    <Link
                      key={tip.id}
                      to={`/safety-tips/${tip.slug}`}
                      className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">{tip.title}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">No safety tips available</p>
              )}
            </CardBody>
          </Card>

          {/* Safety Videos */}
          <Card className="shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Video size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Safety Videos</h2>
                  <p className="text-xs text-gray-500">Training & awareness</p>
                </div>
              </div>
              <Button
                as={Link}
                to="/safety-videos"
                variant="light"
                color="primary"
                endContent={<ArrowRight size={16} />}
              >
                View All
              </Button>
            </CardHeader>
            <CardBody className="pt-0">
              {recentVideos.length > 0 ? (
                <div className="space-y-3">
                  {recentVideos.map((video) => (
                    <Link
                      key={video.id}
                      to={`/safety-videos?play=${video.id}`}
                      className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">{video.title}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">No safety videos available</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Quick Links</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                as={Link}
                to="/alerts"
                variant="flat"
                color="danger"
                startContent={<Bell size={18} />}
                className="justify-start"
              >
                Safety Alerts
              </Button>
              <Button
                as={Link}
                to="/toolbox-talk"
                variant="flat"
                color="warning"
                startContent={<Shield size={18} />}
                className="justify-start"
              >
                Toolbox Talks
              </Button>
              <Button
                as={Link}
                to="/safety-tips"
                variant="flat"
                color="success"
                startContent={<FileText size={18} />}
                className="justify-start"
              >
                All Safety Tips
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
