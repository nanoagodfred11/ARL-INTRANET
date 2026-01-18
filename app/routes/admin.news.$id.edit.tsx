/**
 * Admin News Edit Page
 * Task: 1.1.3.4.4
 */

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Switch,
  Divider,
  Chip,
} from "@heroui/react";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigation, Form, Link, redirect } from "react-router";
import { requireAuth } from "~/lib/services/session.server";
import { connectDB } from "~/lib/db/connection.server";
import { News, NewsCategory } from "~/lib/db/models/news.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  await connectDB();

  const { id } = params;

  const article = await News.findById(id).lean();
  if (!article) {
    throw new Response("Article not found", { status: 404 });
  }

  const categories = await NewsCategory.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  const url = new URL(request.url);
  const success = url.searchParams.get("success");

  return Response.json({
    article: {
      id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      category: article.category.toString(),
      status: article.status,
      isFeatured: article.isFeatured,
      isPinned: article.isPinned,
      views: article.views,
      createdAt: article.createdAt?.toISOString(),
      publishedAt: article.publishedAt?.toISOString(),
    },
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
    })),
    successMessage: success === "created" ? "Article created successfully!" : null,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);
  await connectDB();

  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await News.findByIdAndDelete(id);
    return redirect("/admin/news");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const categoryId = formData.get("category") as string;
  const featuredImage = formData.get("featuredImage") as string;
  const status = formData.get("status") as "draft" | "published";
  const isFeatured = formData.get("isFeatured") === "true";
  const isPinned = formData.get("isPinned") === "true";

  // Validation
  if (!title || !content || !categoryId) {
    return Response.json(
      { error: "Title, content, and category are required" },
      { status: 400 }
    );
  }

  const article = await News.findById(id);
  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  // Update article
  article.title = title;
  article.content = content;
  article.excerpt = excerpt || content.substring(0, 200);
  article.category = categoryId as any;
  article.featuredImage = featuredImage || undefined;
  article.isFeatured = isFeatured;
  article.isPinned = isPinned;

  // Handle status change
  if (status !== article.status) {
    article.status = status;
    if (status === "published" && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }

  await article.save();

  return Response.json({ success: true, message: "Article updated successfully!" });
}

export default function AdminNewsEditPage() {
  const { article, categories, successMessage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [isFeatured, setIsFeatured] = useState(article.isFeatured);
  const [isPinned, setIsPinned] = useState(article.isPinned);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/news"
            className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-sm text-gray-500">
              {article.views} views • Created {formatDate(article.createdAt)}
            </p>
          </div>
        </div>
        <Button
          as="a"
          href={`/news/${article.slug}`}
          target="_blank"
          variant="flat"
          startContent={<Eye size={16} />}
        >
          Preview
        </Button>
      </div>

      {(successMessage || actionData?.success) && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
          {successMessage || actionData?.message}
        </div>
      )}

      {actionData?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <Form method="post">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Article Content</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  name="title"
                  label="Title"
                  placeholder="Enter article title"
                  defaultValue={article.title}
                  isRequired
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <Textarea
                  name="excerpt"
                  label="Excerpt"
                  placeholder="Brief summary of the article (optional)"
                  defaultValue={article.excerpt}
                  maxLength={500}
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <Textarea
                  name="content"
                  label="Content"
                  placeholder="Write your article content here..."
                  defaultValue={article.content}
                  minRows={10}
                  isRequired
                  classNames={{ inputWrapper: "bg-gray-50" }}
                  description="You can use HTML tags for formatting"
                />
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Featured Image</h2>
              </CardHeader>
              <CardBody>
                <Input
                  name="featuredImage"
                  label="Image URL"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={article.featuredImage || ""}
                  description="Enter the URL of the featured image"
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />
                {article.featuredImage && (
                  <div className="mt-4">
                    <img
                      src={article.featuredImage}
                      alt="Featured"
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Publish</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Current Status:</span>
                  <Chip
                    size="sm"
                    color={article.status === "published" ? "success" : "warning"}
                    variant="flat"
                  >
                    {article.status}
                  </Chip>
                </div>

                <Select
                  name="status"
                  label="Status"
                  defaultSelectedKeys={[article.status]}
                  classNames={{ trigger: "bg-gray-50" }}
                >
                  <SelectItem key="draft">Draft</SelectItem>
                  <SelectItem key="published">Published</SelectItem>
                  <SelectItem key="archived">Archived</SelectItem>
                </Select>

                {article.publishedAt && (
                  <p className="text-xs text-gray-500">
                    Published: {formatDate(article.publishedAt)}
                  </p>
                )}

                <Divider />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Featured Article</span>
                  <Switch
                    isSelected={isFeatured}
                    onValueChange={setIsFeatured}
                    size="sm"
                  />
                </div>
                <input type="hidden" name="isFeatured" value={isFeatured.toString()} />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Pin to Top</span>
                  <Switch
                    isSelected={isPinned}
                    onValueChange={setIsPinned}
                    size="sm"
                  />
                </div>
                <input type="hidden" name="isPinned" value={isPinned.toString()} />

                <Divider />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <Save size={16} />}
                >
                  Update Article
                </Button>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Category</h2>
              </CardHeader>
              <CardBody>
                <Select
                  name="category"
                  label="Select Category"
                  defaultSelectedKeys={[article.category]}
                  isRequired
                  classNames={{ trigger: "bg-gray-50" }}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id}>{cat.name}</SelectItem>
                  ))}
                </Select>
              </CardBody>
            </Card>

            <Card className="shadow-sm border-red-200">
              <CardHeader>
                <h2 className="font-semibold text-red-600">Danger Zone</h2>
              </CardHeader>
              <CardBody>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <Button
                    type="submit"
                    color="danger"
                    variant="flat"
                    className="w-full"
                    startContent={<Trash2 size={16} />}
                    onPress={(e) => {
                      if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete Article
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
