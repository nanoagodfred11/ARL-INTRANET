/**
 * Chat API Endpoint
 * Task: 1.4.1.1.3 - Create POST /api/chat endpoint
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  getOrCreateSession,
  getChatHistory,
  sendMessage,
  clearSession,
} from "~/lib/services/chat.server";

// GET - Get chat history
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return Response.json({ error: "Session ID required" }, { status: 400 });
  }

  const history = await getChatHistory(sessionId);

  return Response.json({
    messages: history.reverse().map((msg) => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  });
}

// POST - Send message or manage session
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const sessionId = formData.get("sessionId") as string;

  if (!sessionId) {
    return Response.json({ error: "Session ID required" }, { status: 400 });
  }

  // Initialize session
  if (intent === "init") {
    await getOrCreateSession(sessionId);
    return Response.json({ success: true });
  }

  // Clear session
  if (intent === "clear") {
    await clearSession(sessionId);
    return Response.json({ success: true });
  }

  // Send message
  if (intent === "message") {
    const message = formData.get("message") as string;

    if (!message || message.trim().length === 0) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    if (message.length > 2000) {
      return Response.json({ error: "Message too long (max 2000 characters)" }, { status: 400 });
    }

    // Ensure session exists
    await getOrCreateSession(sessionId);

    // Send message and get response
    const result = await sendMessage(sessionId, message.trim());

    if (result.error && !result.response) {
      return Response.json({ error: result.error }, { status: 429 });
    }

    return Response.json({
      response: result.response,
      warning: result.error, // Rate limit warnings, etc.
    });
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
}
