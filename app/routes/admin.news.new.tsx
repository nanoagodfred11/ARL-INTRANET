/**
 * Admin News Creation Page
 * Task: 1.1.3.4.2
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
} from "@heroui/react";
import { ArrowLeft, Save, Eye, ImagePlus } from "lucide-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigation, Form, Link, redirect } from "react-router";
import { requireAuth, getSessionData } from "~/lib/services/session.server";
import { connectDB } from "~/lib/db/connection.server";
import { News, NewsCategory } from "~/lib/db/models/news.server";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  await connectDB();

  const categories = await NewsCategory.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  return Response.json({
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
    })),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const sessionData = await getSessionData(request);
  await connectDB();

  const formData = await request.formData();

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

  // Generate unique slug
  let slug = generateSlug(title);
  const existingSlug = await News.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  // Create news
  const news = await News.create({
    title,
    slug,
    content,
    excerpt: excerpt || content.substring(0, 200),
    category: categoryId,
    author: sessionData?.userId,
    featuredImage: featuredImage || null,
    status,
    isFeatured,
    isPinned,
    publishedAt: status === "published" ? new Date() : null,
  });

  return redirect(`/admin/news/${news._id}/edit?success=created`);
}

export default function AdminNewsNewPage() {
  const { categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/news"
          className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Article</h1>
          <p className="text-sm text-gray-500">Add a new news article</p>
        </div>
      </div>

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
                  isRequired
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <Textarea
                  name="excerpt"
                  label="Excerpt"
                  placeholder="Brief summary of the article (optional)"
                  maxLength={500}
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <Textarea
                  name="content"
                  label="Content"
                  placeholder="Write your article content here... (HTML supported)"
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
                  description="Enter the URL of the featured image"
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />
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
                <Select
                  name="status"
                  label="Status"
                  defaultSelectedKeys={["draft"]}
                  classNames={{ trigger: "bg-gray-50" }}
                >
                  <SelectItem key="draft">Draft</SelectItem>
                  <SelectItem key="published">Published</SelectItem>
                </Select>

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

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                    startContent={!isSubmitting && <Save size={16} />}
                  >
                    Save
                  </Button>
                </div>
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
                  placeholder="Choose a category"
                  isRequired
                  classNames={{ trigger: "bg-gray-50" }}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id}>{cat.name}</SelectItem>
                  ))}
                </Select>
              </CardBody>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
