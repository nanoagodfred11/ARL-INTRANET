import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Chip,
  Avatar,
  Image,
} from "@heroui/react";
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  Shield,
  ArrowRight,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Lightbulb,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { MainLayout } from "~/components/layout";
import { AlertToast } from "~/components/alerts";
import { EventCalendar, GoldPriceWidget } from "~/components/dashboard";
import { connectDB } from "~/lib/db/connection.server";
import { News } from "~/lib/db/models/news.server";
import { Alert } from "~/lib/db/models/alert.server";
import { getUpcomingEvents, serializeEvent, type SerializedEvent } from "~/lib/services/event.server";
import {
  getSafetyVideos,
  getSafetyTips,
  serializeSafetyVideo,
  serializeSafetyTip,
  type SerializedSafetyVideo,
  type SerializedSafetyTip,
} from "~/lib/services/safety.server";

// Loader for homepage data
export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const [recentNews, upcomingEvents, activeAlerts, safetyVideosResult, safetyTipsResult] = await Promise.all([
    News.find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .populate("category")
      .populate("author", "name")
      .lean(),
    getUpcomingEvents(20), // Get more events for calendar view
    Alert.find({ isActive: true })
      .sort({ severity: -1, createdAt: -1 })
      .limit(3)
      .lean(),
    // Fetch safety videos marked for slideshow
    getSafetyVideos({ status: "published", showInSlideshow: true, limit: 10 }),
    // Fetch safety tips marked for slideshow (with images or PDFs)
    getSafetyTips({ status: "published", showInSlideshow: true, limit: 10 }),
  ]);

  return Response.json({
    recentNews: recentNews.map((news) => ({
      id: news._id.toString(),
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt || "",
      featuredImage: news.featuredImage || null,
      category: news.category ? {
        name: (news.category as { name?: string }).name || "General",
        color: (news.category as { color?: string }).color || "#D4AF37",
      } : { name: "General", color: "#D4AF37" },
      author: news.author ? {
        name: (news.author as { name?: string }).name || "Admin",
      } : { name: "Admin" },
      publishedAt: news.publishedAt?.toISOString() || news.createdAt.toISOString(),
      isPinned: news.isPinned,
    })),
    upcomingEvents: upcomingEvents.map(serializeEvent),
    activeAlerts: activeAlerts.map((alert) => ({
      id: alert._id.toString(),
      title: alert.title,
      message: alert.message,
      type: alert.type,
      severity: alert.severity as "critical" | "warning" | "info",
    })),
    safetyVideos: safetyVideosResult.videos.map(serializeSafetyVideo),
    safetyTips: safetyTipsResult.tips.map(serializeSafetyTip),
  });
}

interface LoaderData {
  recentNews: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    category: { name: string; color: string };
    author: { name: string };
    publishedAt: string;
    isPinned: boolean;
  }>;
  upcomingEvents: SerializedEvent[];
  activeAlerts: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    severity: "critical" | "warning" | "info";
  }>;
  safetyVideos: SerializedSafetyVideo[];
  safetyTips: SerializedSafetyTip[];
}

// Type for carousel items (news, safety videos, safety tips, PDFs)
type CarouselItem =
  | { type: "news"; data: LoaderData["recentNews"][0] }
  | { type: "video"; data: SerializedSafetyVideo }
  | { type: "tip"; data: SerializedSafetyTip }
  | { type: "pdf"; data: SerializedSafetyTip }; // PDF documents from safety tips

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Home() {
  const { recentNews, upcomingEvents, activeAlerts, safetyVideos, safetyTips } = useLoaderData<LoaderData>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Build carousel items array - only items marked for slideshow by admin
  const carouselItems: CarouselItem[] = [
    // Add safety videos marked for slideshow
    ...safetyVideos
      .filter((v) => v.videoUrl) // Must have video URL
      .map((video): CarouselItem => ({ type: "video", data: video })),
    // Add PDF documents (safety tips with documentUrl)
    ...safetyTips
      .filter((t) => t.documentUrl)
      .map((tip): CarouselItem => ({ type: "pdf", data: tip })),
    // Add safety tips with images (no PDF)
    ...safetyTips
      .filter((t) => t.featuredImage && !t.documentUrl)
      .map((tip): CarouselItem => ({ type: "tip", data: tip })),
    // Add pinned news items with images
    ...recentNews
      .filter((n) => n.isPinned && n.featuredImage)
      .slice(0, 3)
      .map((news): CarouselItem => ({ type: "news", data: news })),
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Get current carousel item
  const currentItem = carouselItems[currentSlide];

  // Auto-rotate carousel (pause when video is playing)
  useEffect(() => {
    if (carouselItems.length <= 1) return;
    // Don't auto-rotate if current slide is a video and it's playing
    if (currentItem?.type === "video" && isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [carouselItems.length, currentItem?.type, isPlaying]);

  // Handle slide change - pause video when leaving video slide
  useEffect(() => {
    if (videoRef.current) {
      if (currentItem?.type === "video") {
        // Auto-play video when it becomes active (muted for autoplay policy)
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentSlide, currentItem?.type]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    setIsPlaying(false);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Helper to get slide link
  const getSlideLink = (item: CarouselItem): string => {
    switch (item.type) {
      case "news": return `/news/${item.data.slug}`;
      case "video": return `/safety-videos`;
      case "tip": return `/safety-tips/${item.data.slug}`;
      case "pdf": return item.data.documentUrl; // Direct PDF link
    }
  };

  // Helper to get slide badge info
  const getSlideBadge = (item: CarouselItem): { label: string; color: string; icon: React.ReactNode } => {
    switch (item.type) {
      case "news":
        return {
          label: item.data.category.name,
          color: item.data.category.color,
          icon: null,
        };
      case "video":
        return {
          label: "Safety Video",
          color: "#dc2626", // red
          icon: <Video size={12} className="mr-1" />,
        };
      case "tip":
        return {
          label: "Safety Tip",
          color: "#16a34a", // green
          icon: <Lightbulb size={12} className="mr-1" />,
        };
      case "pdf":
        return {
          label: "Safety Document",
          color: "#2563eb", // blue
          icon: <FileText size={12} className="mr-1" />,
        };
    }
  };

  return (
    <MainLayout showRightSidebar>
      {/* Alert Toast Notifications - Auto-dismissing popups */}
      <AlertToast alerts={activeAlerts} autoHideDuration={8000} />

      {/* Featured Banner Carousel - Safety Videos, PDFs, Tips, and News */}
      {carouselItems.length > 0 && currentItem && (
        <Card className="mb-6 overflow-hidden shadow-lg">
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] bg-gray-900">
            {/* Render based on item type */}
            {currentItem.type === "video" ? (
              <>
                {/* Safety Video with full playback controls */}
                <video
                  ref={videoRef}
                  src={currentItem.data.videoUrl}
                  poster={currentItem.data.thumbnail || undefined}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted={isMuted}
                  playsInline
                  onClick={togglePlayPause}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    // Automatically move to next slide when video finishes
                    setIsPlaying(false);
                    if (carouselItems.length > 1) {
                      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                />

                {/* Gradient overlay for controls visibility */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* Play/Pause Button - Center (shows when paused) */}
                {!isPlaying && (
                  <button
                    onClick={togglePlayPause}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 hover:bg-white/50 p-6 sm:p-8 text-white transition-all backdrop-blur-sm hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play size={48} fill="white" />
                  </button>
                )}

                {/* Video Controls Bar - Bottom */}
                <div className="absolute bottom-24 left-4 right-4 flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="rounded-full bg-black/50 hover:bg-black/70 p-3 text-white transition-colors"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="rounded-full bg-black/50 hover:bg-black/70 p-3 text-white transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>

                  <span className="text-white/80 text-sm ml-auto">
                    {isPlaying ? "Playing" : "Paused"} {isMuted && "• Muted"}
                  </span>
                </div>
              </>
            ) : currentItem.type === "pdf" ? (
              <>
                {/* PDF Document Display - fills entire card */}
                {currentItem.data.featuredImage ? (
                  <img
                    src={currentItem.data.featuredImage}
                    alt={currentItem.data.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950">
                    <div className="text-center">
                      <FileText size={120} className="mx-auto text-white/30 mb-4" />
                      <p className="text-white/60 text-lg">PDF Document</p>
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* Open PDF Button - Center */}
                <a
                  href={currentItem.data.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 hover:bg-blue-700 p-6 sm:p-8 text-white transition-all hover:scale-110 flex flex-col items-center gap-2"
                >
                  <ExternalLink size={48} />
                  <span className="text-sm font-medium">Open PDF</span>
                </a>
              </>
            ) : currentItem.type === "tip" ? (
              <>
                {/* Safety Tip with featured image - fills entire card */}
                <img
                  src={currentItem.data.featuredImage || ""}
                  alt={currentItem.data.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              </>
            ) : (
              <>
                {/* News item with featured image - fills entire card */}
                <img
                  src={currentItem.data.featuredImage || ""}
                  alt={currentItem.data.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              </>
            )}

            {/* Text content - positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <Chip
                size="sm"
                style={{ backgroundColor: getSlideBadge(currentItem).color }}
                className="mb-3 text-white font-medium"
              >
                <span className="flex items-center">
                  {getSlideBadge(currentItem).icon}
                  {getSlideBadge(currentItem).label}
                </span>
              </Chip>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                {currentItem.data.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/90 line-clamp-2 max-w-2xl drop-shadow">
                {currentItem.type === "news" ? (currentItem.data.excerpt || "Click to read more") :
                 currentItem.type === "video" ? currentItem.data.description :
                 currentItem.type === "pdf" ? (currentItem.data.summary || "Click to view document") :
                 (currentItem.data.summary || "Click to read more")}
              </p>
              {currentItem.type === "pdf" ? (
                <a
                  href={currentItem.data.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors"
                >
                  <FileText size={16} /> View Document <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  to={getSlideLink(currentItem)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
                >
                  {currentItem.type === "video" ? "View Details" : "Read More"} <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* Carousel Controls */}
            {carouselItems.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-3 text-white transition-colors z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-3 text-white transition-colors z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight size={28} />
                </button>

                {/* Slide Indicators with type colors */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {carouselItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === currentSlide
                          ? "w-8 bg-white"
                          : item.type === "video"
                            ? "w-2.5 bg-red-500/80"
                            : item.type === "pdf"
                              ? "w-2.5 bg-blue-500/80"
                              : item.type === "tip"
                                ? "w-2.5 bg-green-500/80"
                                : "w-2.5 bg-white/50"
                      }`}
                      aria-label={`Go to slide ${idx + 1} (${item.type})`}
                    />
                  ))}
                </div>

                {/* Slide Counter */}
                <div className="absolute top-4 left-4 bg-black/50 rounded-full px-3 py-1 text-white text-sm z-10">
                  {currentSlide + 1} / {carouselItems.length}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* CEO Welcome Message */}
      <Card className="mb-6 overflow-hidden shadow-sm">
        <CardBody className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* CEO Image */}
            <div className="sm:w-48 md:w-56 flex-shrink-0">
              <img
                src="/images/ceo.jpg"
                alt="Angela List - CEO"
                className="w-full h-48 sm:h-full object-cover object-top"
              />
            </div>
            {/* Welcome Message */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center bg-gradient-to-r from-gray-50 to-white">
              <p className="text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
                Message from the CEO
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Welcome to ARL Connect
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                "Together, we are building a safer, stronger, and more connected workplace.
                This platform is your hub for staying informed, engaged, and part of our mining family.
                Safety first, always."
              </p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Angela List</p>
                  <p className="text-xs text-gray-500">CEO, Nguvu Mining Limited</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar and Gold Price Row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Events Calendar */}
        <div className="lg:col-span-2">
          <EventCalendar
            landscape
            initialEvents={upcomingEvents.map((event) => ({
              id: event.id,
              title: event.title,
              slug: event.slug,
              date: event.date,
              time: event.time,
              location: event.location,
              category: event.category,
              description: event.description,
              isFeatured: event.isFeatured,
            }))}
          />
        </div>
        {/* Gold Price Widget */}
        <div>
          <GoldPriceWidget />
        </div>
      </div>

      {/* News Posts Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Latest News</h2>
          <Button
            as={Link}
            to="/news"
            size="sm"
            variant="light"
            color="primary"
            endContent={<ArrowRight size={14} />}
          >
            View All
          </Button>
        </div>

        {recentNews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((post) => (
              <Link key={post.id} to={`/news/${post.slug}`}>
                <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden group h-full">
                  {/* Image Section */}
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.featuredImage || "https://via.placeholder.com/800x450?text=ARL+News"}
                      alt={post.title}
                      classNames={{
                        wrapper: "w-full h-full",
                        img: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                      }}
                      radius="none"
                    />
                    {/* Category badge on image */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Chip
                        size="sm"
                        style={{ backgroundColor: post.category.color }}
                        className="text-white font-medium"
                      >
                        {post.category.name}
                      </Chip>
                      {post.isPinned && (
                        <Chip size="sm" color="warning">
                          Pinned
                        </Chip>
                      )}
                    </div>
                  </div>
                  {/* Content Section - Solid Background */}
                  <CardBody className="p-3 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar
                        name={getInitials(post.author.name)}
                        size="sm"
                        classNames={{
                          base: "bg-primary-500 text-white font-semibold text-xs",
                        }}
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(post.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.excerpt || "Click to read more..."}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp size={12} />
                          Like
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Share2 size={12} />
                          Share
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardBody className="py-12 text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No news articles yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Check back later for updates
              </p>
            </CardBody>
          </Card>
        )}
      </div>

    </MainLayout>
  );
}
