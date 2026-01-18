/**
 * File Upload API Route
 * Task: 1.1.4.3.3
 */

import type { ActionFunctionArgs } from "react-router";
import { uploadImage } from "~/lib/services/upload.server";
import { requireAuth } from "~/lib/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request);

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subdir = (formData.get("subdir") as string) || "photos";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadImage(file, subdir);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
