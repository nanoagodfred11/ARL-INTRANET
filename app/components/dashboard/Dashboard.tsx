import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { Link } from "react-router";
import {
  Newspaper,
  Shield,
  Users,
  Bell,
  Calendar,
  ChefHat,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { COMPANY } from "~/lib/constants";

/**
 * Homepage Dashboard
 * Task: 1.1.1.3.10 - Create homepage/dashboard layout
 */
export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-800 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gold-400 md:text-4xl">
                Welcome to {COMPANY.intranetName}
              </h1>
              <p className="mt-2 text-lg text-gray-300">
                Your central hub for company news, safety updates, and resources
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {/* Safety Stats */}
            <div className="flex gap-4">
              <div className="rounded-lg bg-safety-green/20 px-6 py-4 text-center">
                <div className="text-3xl font-bold text-safety-green">247</div>
                <div className="text-xs text-gray-300">Days Without LTI</div>
              </div>
              <div className="rounded-lg bg-gold-500/20 px-6 py-4 text-center">
                <div className="text-3xl font-bold text-gold-400">1,200</div>
                <div className="text-xs text-gray-300">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Banner - Will be dynamic */}
      <section className="bg-safety-orange/10 border-y border-safety-orange/20">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-safety-orange" />
            <p className="text-sm font-medium text-safety-orange">
              <strong>Safety Reminder:</strong> Ensure PPE is worn at all times
              in operational areas. Stay safe!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column - News & Toolbox Talk */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Toolbox Talk */}
            <Card className="border-l-4 border-l-safety-green">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="rounded-lg bg-safety-green/10 p-2">
                  <Shield className="h-5 w-5 text-safety-green" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-navy-900">
                    Today's Toolbox Talk
                  </h2>
                  <p className="text-sm text-gray-500">Daily Safety Briefing</p>
                </div>
                <Chip color="success" variant="flat" size="sm">
                  New
                </Chip>
              </CardHeader>
              <CardBody>
                <h3 className="mb-2 text-xl font-medium text-navy-800">
                  Working at Heights: Essential Safety Measures
                </h3>
                <p className="mb-4 text-gray-600">
                  Today's focus is on the critical safety measures required when
                  working at elevated positions. Remember to always use fall
                  protection equipment...
                </p>
                <Button
                  as={Link}
                  to="/safety/toolbox-talk"
                  color="success"
                  variant="flat"
                >
                  Read Full Talk →
                </Button>
              </CardBody>
            </Card>

            {/* Latest News */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gold-500/10 p-2">
                    <Newspaper className="h-5 w-5 text-gold-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-navy-900">
                    Latest News
                  </h2>
                </div>
                <Button
                  as={Link}
                  to="/news"
                  variant="light"
                  size="sm"
                  className="text-gold-600"
                >
                  View All
                </Button>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* News Items - Will be dynamic */}
                {[
                  {
                    title: "Q4 Production Targets Exceeded",
                    category: "Operations",
                    date: "2 hours ago",
                    featured: true,
                  },
                  {
                    title: "New Safety Training Program Launched",
                    category: "HSE",
                    date: "Yesterday",
                    featured: false,
                  },
                  {
                    title: "Community Outreach: School Visit Success",
                    category: "SRD",
                    date: "2 days ago",
                    featured: false,
                  },
                ].map((news, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="h-16 w-24 flex-shrink-0 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Chip size="sm" variant="flat" color="primary">
                          {news.category}
                        </Chip>
                        {news.featured && (
                          <Chip size="sm" variant="flat" color="warning">
                            Featured
                          </Chip>
                        )}
                      </div>
                      <h3 className="font-medium text-navy-800 hover:text-gold-600">
                        <Link to="/news/1">{news.title}</Link>
                      </h3>
                      <p className="text-xs text-gray-500">{news.date}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-navy-900">
                    Upcoming Events
                  </h2>
                </div>
                <Button
                  as={Link}
                  to="/events"
                  variant="light"
                  size="sm"
                  className="text-blue-600"
                >
                  View All
                </Button>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    {
                      title: "Monthly Safety Meeting",
                      date: "Jan 15, 2026",
                      time: "09:00 AM",
                    },
                    {
                      title: "Team Building Event",
                      date: "Jan 20, 2026",
                      time: "02:00 PM",
                    },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-lg bg-gray-50 p-3"
                    >
                      <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                        <div className="text-xs font-medium text-gray-500">
                          {event.date.split(" ")[0]}
                        </div>
                        <div className="text-xl font-bold text-navy-800">
                          {event.date.split(" ")[1].replace(",", "")}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-navy-800">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <Clock className="mr-1 inline-block h-3 w-3" />
                          {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-navy-900">
                  Quick Links
                </h2>
              </CardHeader>
              <CardBody className="grid grid-cols-2 gap-3">
                {[
                  { icon: Users, label: "Directory", href: "/directory", color: "text-blue-600" },
                  { icon: Shield, label: "Safety", href: "/safety", color: "text-green-600" },
                  { icon: ChefHat, label: "Canteen", href: "/canteen", color: "text-orange-600" },
                  { icon: MessageSquare, label: "Suggest", href: "/suggestions", color: "text-purple-600" },
                  { icon: Bell, label: "Alerts", href: "/alerts", color: "text-red-600" },
                  { icon: TrendingUp, label: "Gold News", href: "/gold-news", color: "text-gold-600" },
                ].map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </CardBody>
            </Card>

            {/* Today's Menu */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-navy-900">
                  Today's Menu
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {[
                  { meal: "Breakfast", items: "Fried Rice, Eggs, Tea/Coffee" },
                  { meal: "Lunch", items: "Jollof Rice, Grilled Chicken, Salad" },
                  { meal: "Dinner", items: "Banku & Tilapia, Pepper Sauce" },
                ].map((menu, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                    <h4 className="text-sm font-semibold text-gold-600">
                      {menu.meal}
                    </h4>
                    <p className="text-sm text-gray-600">{menu.items}</p>
                  </div>
                ))}
                <Button
                  as={Link}
                  to="/canteen"
                  variant="flat"
                  color="warning"
                  fullWidth
                  size="sm"
                >
                  View Full Menu
                </Button>
              </CardBody>
            </Card>

            {/* Active Poll */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-navy-900">
                  Quick Poll
                </h2>
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-sm font-medium text-gray-700">
                  How would you rate the new safety training program?
                </p>
                <div className="space-y-2">
                  {["Excellent", "Good", "Average", "Needs Improvement"].map(
                    (option, index) => (
                      <Button
                        key={index}
                        variant="bordered"
                        fullWidth
                        size="sm"
                        className="justify-start"
                      >
                        {option}
                      </Button>
                    )
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  48 votes • 2 days left
                </p>
              </CardBody>
            </Card>

            {/* Birthday/Anniversary Widget */}
            <Card className="bg-gradient-to-br from-gold-50 to-gold-100">
              <CardHeader>
                <h2 className="text-lg font-semibold text-navy-900">
                  🎂 Celebrations Today
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 font-bold text-white">
                    JK
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">John Kwame</p>
                    <p className="text-xs text-gray-600">Birthday 🎉</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 font-bold text-white">
                    AM
                  </div>
                  <div>
                    <p className="font-medium text-navy-800">Akua Mensah</p>
                    <p className="text-xs text-gray-600">5 Year Anniversary 🏆</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
