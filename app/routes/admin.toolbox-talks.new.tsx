/**
 * Admin Toolbox Talk Creation Page
 * Task: 1.2.1.4.2-4, 1.2.1.2.4 (Video thumbnail auto-generation)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import { ArrowLeft, Save, Calendar, Upload, X, Video, Volume2, Image, RefreshCw } from "lucide-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, useNavigation, Form, Link, redirect } from "react-router";
import { RichTextEditor } from "~/components/admin";

export async function loader({ request }: LoaderFunctionArgs) {
  const { requireAuth } = await import("~/lib/services/session.server");
  await requireAuth(request);
  return Response.json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const { requireAuth, getSessionData } = await import("~/lib/services/session.server");
  const { connectDB } = await import("~/lib/db/connection.server");
  const { generateUniqueSlug, createToolboxTalk } = await import("~/lib/services/toolbox-talk.server");
  const { uploadThumbnailFromBase64 } = await import("~/lib/services/upload.server");

  await requireAuth(request);
  const sessionData = await getSessionData(request);
  await connectDB();

  const formData = await request.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const summary = formData.get("summary") as string;
  const scheduledDate = formData.get("scheduledDate") as string;
  const status = formData.get("status") as "draft" | "published";
  const tagsStr = formData.get("tags") as string;
  const featuredMediaUrl = formData.get("featuredMediaUrl") as string;
  const featuredMediaType = formData.get("featuredMediaType") as "image" | "video" | "audio";
  const thumbnailDataUrl = formData.get("thumbnailDataUrl") as string;

  // Validation
  if (!title || !content || !scheduledDate) {
    return Response.json(
      { error: "Title, content, and scheduled date are required" },
      { status: 400 }
    );
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(title);

  // Parse tags
  const tags = tagsStr
    ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // Task: 1.2.1.2.4 - Handle thumbnail upload for videos
  let thumbnailUrl: string | undefined;
  if (thumbnailDataUrl && featuredMediaType === "video") {
    const thumbnailResult = await uploadThumbnailFromBase64(thumbnailDataUrl);
    if (thumbnailResult.success && thumbnailResult.url) {
      thumbnailUrl = thumbnailResult.url;
    }
  }

  // Build featured media object if provided
  const featuredMedia = featuredMediaUrl && featuredMediaType
    ? {
        type: featuredMediaType,
        url: featuredMediaUrl,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
      }
    : undefined;

  // Create toolbox talk using service
  const talk = await createToolboxTalk({
    title,
    slug,
    content,
    summary: summary || content.substring(0, 200),
    author: sessionData?.userId || "",
    scheduledDate: new Date(scheduledDate),
    status,
    tags,
    featuredMedia,
  });

  return redirect(`/admin/toolbox-talks/${talk._id}/edit?success=created`);
}

export default function AdminToolboxTalkNewPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "">("");

  // Task: 1.2.1.2.4 - Video thumbnail state
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Auto-generate thumbnail when video URL changes
  const generateThumbnail = useCallback(async (url: string) => {
    if (!url || mediaType !== "video") return;

    setIsGeneratingThumbnail(true);
    setThumbnailError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { generateThumbnailFromUrl, getDefaultVideoThumbnail } = await import(
        "~/lib/utils/video-thumbnail"
      );

      const result = await generateThumbnailFromUrl(url);

      if (result.success && result.dataUrl) {
        setThumbnailDataUrl(result.dataUrl);
      } else {
        // Use default placeholder if generation fails
        setThumbnailDataUrl(getDefaultVideoThumbnail());
        setThumbnailError(result.error || "Could not generate thumbnail");
      }
    } catch (err) {
      setThumbnailError("Failed to generate thumbnail");
      // Try to set default thumbnail
      try {
        const { getDefaultVideoThumbnail } = await import("~/lib/utils/video-thumbnail");
        setThumbnailDataUrl(getDefaultVideoThumbnail());
      } catch {
        // Ignore if default also fails
      }
    } finally {
      setIsGeneratingThumbnail(false);
    }
  }, [mediaType]);

  // Effect to generate thumbnail when video URL is entered
  useEffect(() => {
    if (videoUrl && mediaType === "video") {
      const timeoutId = setTimeout(() => {
        generateThumbnail(videoUrl);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    } else {
      setThumbnailDataUrl(null);
      setThumbnailError(null);
    }
  }, [videoUrl, mediaType, generateThumbnail]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/toolbox-talks"
          className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Toolbox Talk</h1>
          <p className="text-sm text-gray-500">Schedule a new daily safety talk</p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionData.error}
        </div>
      )}

      <Form method="post">
        <input type="hidden" name="tags" value={tags.join(",")} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Talk Content</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  name="title"
                  label="Title"
                  placeholder="Enter talk title"
                  isRequired
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <Textarea
                  name="summary"
                  label="Summary"
                  placeholder="Brief summary of the talk (optional)"
                  maxLength={500}
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

                <RichTextEditor
                  name="content"
                  label="Content"
                  placeholder="Write your toolbox talk content here..."
                  isRequired
                  minHeight="250px"
                />
              </CardBody>
            </Card>

            {/* Media Upload - Task: 1.2.1.4.3 */}
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Featured Media (Optional)</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={mediaType === "image" ? "solid" : "flat"}
                    color={mediaType === "image" ? "primary" : "default"}
                    startContent={<Image size={16} />}
                    onPress={() => setMediaType(mediaType === "image" ? "" : "image")}
                    size="sm"
                  >
                    Image
                  </Button>
                  <Button
                    variant={mediaType === "video" ? "solid" : "flat"}
                    color={mediaType === "video" ? "primary" : "default"}
                    startContent={<Video size={16} />}
                    onPress={() => setMediaType(mediaType === "video" ? "" : "video")}
                    size="sm"
                  >
                    Video
                  </Button>
                  <Button
                    variant={mediaType === "audio" ? "solid" : "flat"}
                    color={mediaType === "audio" ? "primary" : "default"}
                    startContent={<Volume2 size={16} />}
                    onPress={() => setMediaType(mediaType === "audio" ? "" : "audio")}
                    size="sm"
                  >
                    Audio
                  </Button>
                </div>

                {mediaType && (
                  <>
                    <input type="hidden" name="featuredMediaType" value={mediaType} />
                    {/* Task: 1.2.1.2.4 - Hidden input for auto-generated thumbnail */}
                    {thumbnailDataUrl && mediaType === "video" && (
                      <input type="hidden" name="thumbnailDataUrl" value={thumbnailDataUrl} />
                    )}
                    <Input
                      name="featuredMediaUrl"
                      label={`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} URL`}
                      placeholder={
                        mediaType === "video"
                          ? "https://example.com/video.mp4"
                          : mediaType === "audio"
                            ? "https://example.com/audio.mp3"
                            : "https://example.com/image.jpg"
                      }
                      description={`Enter the URL of the ${mediaType} file`}
                      classNames={{ inputWrapper: "bg-gray-50" }}
                      value={mediaType === "video" ? videoUrl : undefined}
                      onValueChange={mediaType === "video" ? setVideoUrl : undefined}
                    />

                    {/* Task: 1.2.1.2.4 - Video thumbnail preview */}
                    {mediaType === "video" && videoUrl && (
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Video Thumbnail
                          </span>
                          <Button
                            size="sm"
                            variant="light"
                            isDisabled={isGeneratingThumbnail}
                            startContent={
                              isGeneratingThumbnail ? (
                                <Spinner size="sm" />
                              ) : (
                                <RefreshCw size={14} />
                              )
                            }
                            onPress={() => generateThumbnail(videoUrl)}
                          >
                            {isGeneratingThumbnail ? "Generating..." : "Regenerate"}
                          </Button>
                        </div>

                        {isGeneratingThumbnail && !thumbnailDataUrl && (
                          <div className="flex h-32 items-center justify-center rounded bg-gray-100">
                            <div className="text-center">
                              <Spinner size="md" />
                              <p className="mt-2 text-xs text-gray-500">
                                Generating thumbnail...
                              </p>
                            </div>
                          </div>
                        )}

                        {thumbnailDataUrl && (
                          <div className="relative">
                            <img
                              src={thumbnailDataUrl}
                              alt="Video thumbnail"
                              className="h-32 w-auto rounded object-cover"
                            />
                            {thumbnailError && (
                              <p className="mt-1 text-xs text-amber-600">
                                {thumbnailError} (using placeholder)
                              </p>
                            )}
                          </div>
                        )}

                        {!thumbnailDataUrl && !isGeneratingThumbnail && (
                          <div className="flex h-32 items-center justify-center rounded bg-gray-100">
                            <p className="text-xs text-gray-500">
                              Thumbnail will be generated automatically
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <p className="text-xs text-gray-500">
                  Tip: Upload files using the media library first, then paste the URL here.
                  {mediaType === "video" && " A thumbnail will be auto-generated from the video."}
                </p>
              </CardBody>
            </Card>

            {/* Tags */}
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Tags</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag (press Enter)"
                    classNames={{ inputWrapper: "bg-gray-50" }}
                    className="flex-1"
                  />
                  <Button onPress={addTag} isDisabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        onClose={() => removeTag(tag)}
                        variant="flat"
                        color="warning"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Common tags: Safety, PPE, Hazards, Emergency, Best Practices
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Schedule</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Task: 1.2.1.4.4 - Scheduling interface */}
                <Input
                  name="scheduledDate"
                  label="Scheduled Date"
                  type="date"
                  defaultValue={defaultDate}
                  isRequired
                  startContent={<Calendar size={16} className="text-gray-400" />}
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />

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

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                    startContent={!isSubmitting && <Save size={16} />}
                  >
                    Save Talk
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="font-semibold">Tips</h2>
              </CardHeader>
              <CardBody className="text-sm text-gray-600">
                <ul className="list-inside list-disc space-y-2">
                  <li>Schedule talks in advance for each working day</li>
                  <li>Include relevant images or videos for better engagement</li>
                  <li>Keep content concise and actionable</li>
                  <li>Use tags to categorize by safety topics</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
