/**
 * Public News Listing Page
 * Task: 1.1.3.3.1
 */

import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Input,
  Image,
  Tabs,
  Tab,
  Pagination,
} from "@heroui/react";
import { Search, Clock, Eye, ArrowRight } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { MainLayout } from "~/components/layout";
import { connectDB } from "~/lib/db/connection.server";
import { News, NewsCategory } from "~/lib/db/models/news.server";

const ITEMS_PER_PAGE = 9;

export async function loader({ request }: LoaderFunctionArgs) {
  await connectDB();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const category = url.searchParams.get("category") || "all";
  const search = url.searchParams.get("search") || "";

  // Build query
  const query: Record<string, unknown> = {
    status: "published",
    $or: [
      { publishedAt: { $lte: new Date() } },
      { publishedAt: null },
    ],
  };

  if (category !== "all") {
    const cat = await NewsCategory.findOne({ slug: category });
    if (cat) {
      query.category = cat._id;
    }
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Get categories
  const categories = await NewsCategory.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  // Get total count
  const totalCount = await News.countDocuments(query);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get news with pagination
  const news = await News.find(query)
    .populate("category", "name slug color")
    .populate("author", "name")
    .sort({ isPinned: -1, publishedAt: -1 })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .lean();

  // Get featured news (separate query)
  const featuredNews = await News.find({
    status: "published",
    isFeatured: true,
  })
    .populate("category", "name slug color")
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  return Response.json({
    news: news.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt || n.content.substring(0, 150) + "...",
      featuredImage: n.featuredImage,
      category: n.category,
      author: n.author,
      publishedAt: n.publishedAt?.toISOString(),
      views: n.views,
      isPinned: n.isPinned,
    })),
    featuredNews: featuredNews.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt || n.content.substring(0, 100) + "...",
      featuredImage: n.featuredImage,
      category: n.category,
    })),
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      color: c.color,
    })),
    pagination: {
      page,
      totalPages,
      totalCount,
    },
    currentCategory: category,
    searchQuery: search,
  });
}

export default function NewsListingPage() {
  const { news, featuredNews, categories, pagination, currentCategory, searchQuery } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCategoryChange = (key: React.Key) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", key.toString());
    params.delete("page");
    setSearchParams(params);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">News & Announcements</h1>
            <p className="text-sm text-gray-500">
              Stay updated with the latest from ARL
            </p>
          </div>
          <Input
            placeholder="Search news..."
            defaultValue={searchQuery}
            onValueChange={handleSearch}
            startContent={<Search size={18} className="text-gray-400" />}
            className="max-w-xs"
          />
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && currentCategory === "all" && !searchQuery && (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredNews.map((item, index) => (
              <Link
                key={item.id}
                to={`/news/${item.slug}`}
                className={index === 0 ? "md:col-span-2 md:row-span-2" : ""}
              >
                <Card className="h-full overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <div className={`relative ${index === 0 ? "h-64 md:h-full" : "h-32"}`}>
                    <Image
                      src={item.featuredImage || "https://via.placeholder.com/800x400?text=ARL+News"}
                      alt={item.title}
                      classNames={{
                        wrapper: "w-full h-full",
                        img: "w-full h-full object-cover",
                      }}
                      radius="none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Chip
                        size="sm"
                        style={{ backgroundColor: item.category?.color }}
                        className="mb-2 text-white"
                      >
                        {item.category?.name}
                      </Chip>
                      <h3 className={`font-bold text-white ${index === 0 ? "text-xl" : "text-sm"}`}>
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Category Tabs */}
        <Tabs
          selectedKey={currentCategory}
          onSelectionChange={handleCategoryChange}
          variant="underlined"
          classNames={{
            tabList: "gap-4 flex-wrap",
          }}
        >
          <Tab key="all" title="All News" />
          {categories.map((cat) => (
            <Tab key={cat.slug} title={cat.name} />
          ))}
        </Tabs>

        {/* News Grid */}
        {news.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.slug}`}>
                <Card className="h-full overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={item.featuredImage || "https://via.placeholder.com/400x200?text=ARL+News"}
                      alt={item.title}
                      classNames={{
                        wrapper: "w-full h-full",
                        img: "w-full h-full object-cover",
                      }}
                      radius="none"
                    />
                    {item.isPinned && (
                      <Chip
                        size="sm"
                        color="warning"
                        className="absolute right-2 top-2"
                      >
                        Pinned
                      </Chip>
                    )}
                  </div>
                  <CardBody className="p-4">
                    <Chip
                      size="sm"
                      variant="flat"
                      style={{
                        backgroundColor: `${item.category?.color}20`,
                        color: item.category?.color,
                      }}
                      className="mb-2"
                    >
                      {item.category?.name}
                    </Chip>
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {item.excerpt}
                    </p>
                  </CardBody>
                  <CardFooter className="flex items-center justify-between border-t px-4 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {formatDate(item.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye size={12} />
                      {item.views}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardBody className="py-12 text-center">
              <p className="text-gray-500">No news articles found</p>
            </CardBody>
          </Card>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              showControls
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
