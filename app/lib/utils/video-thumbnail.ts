/**
 * Video Thumbnail Generator Utility
 * Task: 1.2.1.2.4 - Implement video thumbnail generation
 *
 * Client-side utility to extract thumbnails from video files/URLs
 * using HTML5 Canvas API
 */

export interface ThumbnailResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * Generate a thumbnail from a video URL at a specific time
 * @param videoUrl - The URL of the video
 * @param seekTime - Time in seconds to capture the thumbnail (default: 1)
 * @param maxWidth - Maximum width of the thumbnail (default: 320)
 * @param maxHeight - Maximum height of the thumbnail (default: 180)
 */
export function generateThumbnailFromUrl(
  videoUrl: string,
  seekTime: number = 1,
  maxWidth: number = 320,
  maxHeight: number = 180
): Promise<ThumbnailResult> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    let timeoutId: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.src = "";
      video.load();
    };

    const onError = () => {
      cleanup();
      resolve({
        success: false,
        error: "Failed to load video. The video URL may be invalid or CORS restricted.",
      });
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          resolve({ success: false, error: "Canvas not supported" });
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the video frame
        ctx.drawImage(video, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        cleanup();
        resolve({ success: true, dataUrl });
      } catch (err) {
        cleanup();
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Failed to capture thumbnail",
        });
      }
    };

    const onLoadedData = () => {
      // Wait for video to be ready, then seek
      if (video.readyState >= 2) {
        // Seek to the specified time (or 0.1 if video is very short)
        const targetTime = Math.min(seekTime, video.duration * 0.1 || seekTime);
        video.currentTime = targetTime;
      }
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    // Set timeout for slow loading videos
    timeoutId = setTimeout(() => {
      cleanup();
      resolve({ success: false, error: "Video loading timed out" });
    }, 15000);

    video.src = videoUrl;
    video.load();
  });
}

/**
 * Generate a thumbnail from a File object
 * @param file - The video File object
 * @param seekTime - Time in seconds to capture the thumbnail
 */
export function generateThumbnailFromFile(
  file: File,
  seekTime: number = 1
): Promise<ThumbnailResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);

    generateThumbnailFromUrl(url, seekTime)
      .then((result) => {
        URL.revokeObjectURL(url);
        resolve(result);
      })
      .catch(() => {
        URL.revokeObjectURL(url);
        resolve({ success: false, error: "Failed to process video file" });
      });
  });
}

/**
 * Convert a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Check if a URL points to a video file
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
}

/**
 * Generate a default placeholder thumbnail data URL
 * Used when video thumbnail generation fails
 */
export function getDefaultVideoThumbnail(): string {
  // Create a simple placeholder with a play button
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 320, 180);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 320, 180);

    // Play button circle
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(160, 90, 40, 0, Math.PI * 2);
    ctx.fill();

    // Play triangle
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.moveTo(150, 70);
    ctx.lineTo(180, 90);
    ctx.lineTo(150, 110);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL("image/jpeg", 0.8);
}
