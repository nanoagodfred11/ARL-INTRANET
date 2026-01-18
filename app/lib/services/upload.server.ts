/**
 * File Upload Service
 * Task: 1.1.4.3.3, 1.2.1.2.1-3 (Multimedia Support)
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];

// Legacy constant for backward compatibility
const MAX_FILE_SIZE = MAX_IMAGE_SIZE;
const ALLOWED_TYPES = ALLOWED_IMAGE_TYPES;

// Ensure upload directory exists
function ensureUploadDir(subdir: string = "") {
  const dir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  subdir: string = "photos"
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  try {
    const uploadDir = ensureUploadDir(subdir);

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${subdir}/${filename}`;
    return { success: true, url };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const relativePath = url.replace(/^\/uploads\//, "");
    const filepath = path.join(UPLOAD_DIR, relativePath);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

// Task: 1.2.1.2.1 - Extend upload system for video files
export interface MediaUploadResult extends UploadResult {
  type?: "image" | "video" | "audio";
  thumbnail?: string;
}

export async function uploadVideo(
  file: File,
  subdir: string = "videos"
): Promise<MediaUploadResult> {
  // Task: 1.2.1.2.2 - Implement video file validation (type, size, duration)
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid video type. Allowed: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      success: false,
      error: `Video too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    };
  }

  try {
    const uploadDir = ensureUploadDir(subdir);

    // Generate unique filename
    const ext = path.extname(file.name) || ".mp4";
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${subdir}/${filename}`;
    return { success: true, url, type: "video" };
  } catch (error) {
    console.error("Video upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Video upload failed",
    };
  }
}

// Task: 1.2.1.2.3 - Create audio file upload support
export async function uploadAudio(
  file: File,
  subdir: string = "audio"
): Promise<MediaUploadResult> {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid audio type. Allowed: ${ALLOWED_AUDIO_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return {
      success: false,
      error: `Audio too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
    };
  }

  try {
    const uploadDir = ensureUploadDir(subdir);

    // Generate unique filename
    const ext = path.extname(file.name) || ".mp3";
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${subdir}/${filename}`;
    return { success: true, url, type: "audio" };
  } catch (error) {
    console.error("Audio upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Audio upload failed",
    };
  }
}

// Generic media upload function that detects type
export async function uploadMedia(
  file: File,
  subdir?: string
): Promise<MediaUploadResult> {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    const result = await uploadImage(file, subdir || "photos");
    return { ...result, type: "image" };
  }

  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return uploadVideo(file, subdir || "videos");
  }

  if (ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return uploadAudio(file, subdir || "audio");
  }

  return {
    success: false,
    error: "Unsupported file type",
  };
}

// Delete any media file
export async function deleteMedia(url: string): Promise<boolean> {
  return deleteImage(url); // Same logic works for all file types
}

// Get media type from URL or MIME type
export function getMediaType(mimeType: string): "image" | "video" | "audio" | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return "audio";
  return null;
}
