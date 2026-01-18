import { Avatar, Card, CardBody, CardHeader, Button, Progress, Input } from "@heroui/react";
import { Users, TrendingUp, Star, ExternalLink, Search, AppWindow, Phone, ArrowRight } from "lucide-react";
import { Form, Link, useFetcher } from "react-router";
import { useState, useEffect } from "react";

const onlineColleagues = [
  { name: "John Kwame", initials: "JK", department: "Operations" },
  { name: "Mary Adjei", initials: "MA", department: "HR" },
  { name: "Peter Owusu", initials: "PO", department: "Finance" },
  { name: "Sarah Mensah", initials: "SM", department: "HSE" },
  { name: "David Asante", initials: "DA", department: "IT" },
];

const poll = {
  question: "What should be our next team building activity?",
  options: [
    { label: "Beach Outing", votes: 45 },
    { label: "Sports Day", votes: 32 },
    { label: "Cultural Event", votes: 18 },
    { label: "Community Service", votes: 25 },
  ],
  totalVotes: 120,
  endsIn: "2 days",
};

const featuredPosts = [
  {
    id: 1,
    title: "Safety Milestone: 250 Days LTI-Free!",
    author: "HSE Team",
    likes: 89,
  },
  {
    id: 2,
    title: "Welcome New Graduates Program Participants",
    author: "HR Department",
    likes: 67,
  },
  {
    id: 3,
    title: "Q4 Production Update",
    author: "Operations",
    likes: 54,
  },
];

interface QuickLink {
  _id: string;
  name: string;
  url: string;
  icon?: string;
  iconType?: "url" | "lucide" | "emoji";
  isInternal?: boolean;
  clicks: number;
}

export function RightSidebar() {
  const maxVotes = Math.max(...poll.options.map((o) => o.votes));
  const [searchQuery, setSearchQuery] = useState("");
  const quickLinksFetcher = useFetcher<{ quickLinks: QuickLink[] }>();

  // Fetch quick links on mount
  useEffect(() => {
    quickLinksFetcher.load("/api/quick-links");
  }, []);

  const quickLinks = quickLinksFetcher.data?.quickLinks || [];

  return (
    <aside className="sticky top-20 hidden w-72 shrink-0 xl:block">
      {/* Directory Quick Search Widget - Task: 1.1.4.2.8 */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Phone size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Directory Search</h3>
              <p className="text-xs text-gray-500">Find contacts quickly</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Form method="get" action="/directory">
            <Input
              name="search"
              placeholder="Name, dept, or ext..."
              size="sm"
              startContent={<Search size={14} className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                inputWrapper: "bg-gray-50",
              }}
            />
            <Button
              type="submit"
              size="sm"
              color="primary"
              variant="flat"
              className="mt-2 w-full"
              isDisabled={!searchQuery.trim()}
              endContent={<ArrowRight size={14} />}
            >
              Search Directory
            </Button>
          </Form>
          <Link
            to="/directory"
            className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-primary-600"
          >
            <span>Browse full directory</span>
            <ExternalLink size={12} />
          </Link>
        </CardBody>
      </Card>

      {/* Quick Links Widget - Task: 1.1.5.2.5 */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <AppWindow size={16} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
              <p className="text-xs text-gray-500">Popular apps & tools</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {quickLinksFetcher.state === "loading" ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : quickLinks.length > 0 ? (
            <div className="space-y-1">
              {quickLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target={link.isInternal ? "_self" : "_blank"}
                  rel={link.isInternal ? undefined : "noopener noreferrer"}
                  className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs">
                    {link.iconType === "emoji" && link.icon ? (
                      link.icon
                    ) : link.iconType === "url" && link.icon ? (
                      <img src={link.icon} alt="" className="h-4 w-4" />
                    ) : (
                      <AppWindow size={12} className="text-gray-500" />
                    )}
                  </span>
                  <span className="truncate">{link.name}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500">No quick links available</p>
          )}
          <Link
            to="/apps"
            className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-primary-600"
          >
            <span>View all apps</span>
            <ExternalLink size={12} />
          </Link>
        </CardBody>
      </Card>

      {/* Poll Section */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <TrendingUp size={16} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Active Poll</h3>
              <p className="text-xs text-gray-500">Ends in {poll.endsIn}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="mb-3 text-sm font-medium text-gray-800">{poll.question}</p>
          <div className="space-y-2">
            {poll.options.map((option) => {
              const percentage = Math.round((option.votes / poll.totalVotes) * 100);
              const isLeading = option.votes === maxVotes;
              return (
                <div key={option.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isLeading ? "font-medium text-primary-700" : "text-gray-600"}>
                      {option.label}
                    </span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <Progress
                    size="sm"
                    value={percentage}
                    classNames={{
                      indicator: isLeading ? "bg-primary-500" : "bg-gray-300",
                      track: "bg-gray-100",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">
            {poll.totalVotes} votes
          </p>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            className="mt-2 w-full"
          >
            Vote Now
          </Button>
        </CardBody>
      </Card>

      {/* Online Colleagues */}
      <Card className="mb-4 shadow-sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Users size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Online Now</h3>
              <p className="text-xs text-gray-500">{onlineColleagues.length} colleagues</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2">
            {onlineColleagues.map((colleague) => (
              <div
                key={colleague.name}
                className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <div className="relative">
                  <Avatar
                    name={colleague.initials}
                    size="sm"
                    classNames={{
                      base: "bg-primary-100 text-primary-700 text-xs font-semibold",
                    }}
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {colleague.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {colleague.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="light"
            className="mt-2 w-full text-gray-500"
            endContent={<ExternalLink size={14} />}
          >
            View All
          </Button>
        </CardBody>
      </Card>

      {/* Featured Posts */}
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
              <Star size={16} className="text-yellow-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Featured Posts</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            {featuredPosts.map((post, index) => (
              <div
                key={post.id}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary-100 text-xs font-bold text-primary-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </aside>
  );
}
