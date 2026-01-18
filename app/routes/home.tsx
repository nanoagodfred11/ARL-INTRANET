import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Chip,
  Avatar,
  Image,
  Divider,
} from "@heroui/react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Shield,
  Calendar,
  ArrowRight,
  Clock,
  ThumbsUp,
  Send,
} from "lucide-react";
import { MainLayout } from "~/components/layout";

// Mock data for the feed
const featuredBanner = {
  title: "Safety First: Our Journey to 250 Days LTI-Free",
  subtitle: "Celebrating our commitment to workplace safety excellence",
  image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=400&fit=crop",
  category: "HSE",
};

const feedPosts = [
  {
    id: 1,
    type: "announcement",
    author: {
      name: "Corporate Communications",
      avatar: "CC",
      department: "Communications",
    },
    timestamp: "2 hours ago",
    title: "Q4 Production Targets Exceeded",
    content:
      "We are thrilled to announce that ARL has exceeded its Q4 production targets by 15%! This remarkable achievement is a testament to the dedication and hard work of every team member across all departments. Thank you for your continued commitment to excellence.",
    image: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=400&fit=crop",
    likes: 156,
    comments: 24,
    shares: 12,
    isPinned: true,
  },
  {
    id: 2,
    type: "safety",
    author: {
      name: "HSE Department",
      avatar: "HSE",
      department: "Health, Safety & Environment",
    },
    timestamp: "5 hours ago",
    title: "Daily Toolbox Talk: Working at Heights",
    content:
      "Today's safety focus is on working at heights. Remember to always: 1) Conduct a risk assessment before starting work, 2) Use appropriate fall protection equipment, 3) Inspect all equipment before use, 4) Never work alone at heights.",
    likes: 89,
    comments: 15,
    shares: 8,
    isSafety: true,
  },
  {
    id: 3,
    type: "event",
    author: {
      name: "HR Department",
      avatar: "HR",
      department: "Human Resources",
    },
    timestamp: "Yesterday",
    title: "Team Building Event - Save the Date!",
    content:
      "Join us for our quarterly team building event on January 20th at 2:00 PM. This quarter we'll be hosting a Sports Day with various activities for all fitness levels. Lunch will be provided. Register now to secure your spot!",
    eventDate: "Jan 20, 2026",
    eventTime: "2:00 PM",
    likes: 134,
    comments: 45,
    shares: 23,
    isEvent: true,
  },
  {
    id: 4,
    type: "news",
    author: {
      name: "SRD Team",
      avatar: "SRD",
      department: "Social Responsibility",
    },
    timestamp: "2 days ago",
    title: "Community Outreach: School Visit Success",
    content:
      "Last week, our SRD team visited Nkroful Senior High School as part of our community engagement program. We donated educational materials and shared career guidance with over 200 students. Thank you to all volunteers who made this possible!",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop",
    likes: 201,
    comments: 32,
    shares: 18,
  },
];

const upcomingEvents = [
  { id: 1, title: "Monthly Safety Meeting", date: "Jan 15", time: "09:00 AM" },
  { id: 2, title: "Team Building Event", date: "Jan 20", time: "02:00 PM" },
  { id: 3, title: "Quarterly Town Hall", date: "Jan 25", time: "10:00 AM" },
];

export default function Home() {
  return (
    <MainLayout>
      {/* Featured Banner */}
      <Card className="mb-6 overflow-hidden shadow-sm">
        <div className="relative h-48 sm:h-64">
          <Image
            src={featuredBanner.image}
            alt={featuredBanner.title}
            classNames={{
              wrapper: "w-full h-full",
              img: "w-full h-full object-cover",
            }}
            radius="none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Chip size="sm" color="warning" variant="solid" className="mb-2">
              {featuredBanner.category}
            </Chip>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {featuredBanner.title}
            </h1>
            <p className="mt-1 text-sm text-white/80">{featuredBanner.subtitle}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats Bar */}
      <Card className="mb-6 shadow-sm">
        <CardBody className="flex flex-row items-center justify-around py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Shield size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">247</p>
              <p className="text-xs text-gray-500">Days Without LTI</p>
            </div>
          </div>
          <Divider orientation="vertical" className="h-12" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">Upcoming Events</p>
            </div>
          </div>
          <Divider orientation="vertical" className="hidden h-12 sm:block" />
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MessageCircle size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">New Announcements</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-4">
        {feedPosts.map((post) => (
          <Card key={post.id} className="shadow-sm">
            {/* Post Header */}
            <CardHeader className="flex items-start justify-between gap-3 px-4 pb-0 pt-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={post.author.avatar}
                  size="md"
                  classNames={{
                    base: `${
                      post.isSafety
                        ? "bg-green-500"
                        : post.isEvent
                          ? "bg-blue-500"
                          : "bg-primary-500"
                    } text-white font-semibold`,
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{post.author.name}</p>
                    {post.isPinned && (
                      <Chip size="sm" color="warning" variant="flat">
                        Pinned
                      </Chip>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {post.author.department} • {post.timestamp}
                  </p>
                </div>
              </div>
              <Button isIconOnly variant="light" size="sm" aria-label="More options">
                <MoreHorizontal size={18} className="text-gray-400" />
              </Button>
            </CardHeader>

            {/* Post Content */}
            <CardBody className="px-4 py-3">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{post.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{post.content}</p>

              {/* Event Details */}
              {post.isEvent && post.eventDate && (
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-blue-500 text-white">
                    <span className="text-xs font-medium">
                      {post.eventDate.split(" ")[0]}
                    </span>
                    <span className="text-xl font-bold">
                      {post.eventDate.split(" ")[1]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Event Date</p>
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {post.eventTime}
                    </p>
                  </div>
                  <Button size="sm" color="primary" className="ml-auto">
                    Register
                  </Button>
                </div>
              )}

              {/* Post Image */}
              {post.image && (
                <div className="mt-4 overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    classNames={{
                      wrapper: "w-full",
                      img: "w-full h-48 object-cover",
                    }}
                  />
                </div>
              )}
            </CardBody>

            {/* Post Actions */}
            <CardFooter className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="light"
                  size="sm"
                  startContent={<ThumbsUp size={16} />}
                  className="text-gray-500"
                >
                  {post.likes}
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  startContent={<MessageCircle size={16} />}
                  className="text-gray-500"
                >
                  {post.comments}
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  startContent={<Share2 size={16} />}
                  className="text-gray-500"
                >
                  {post.shares}
                </Button>
              </div>
              <Button isIconOnly variant="light" size="sm" aria-label="Bookmark">
                <Bookmark size={16} className="text-gray-400" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 text-center">
        <Button variant="flat" color="primary" endContent={<ArrowRight size={16} />}>
          Load More Posts
        </Button>
      </div>
    </MainLayout>
  );
}
