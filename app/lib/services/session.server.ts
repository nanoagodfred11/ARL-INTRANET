/**
 * Session Management using React Router Cookie Session Storage
 * Task: 1.1.2.2
 */

import { createCookieSessionStorage, redirect } from "react-router";
import { AdminUser, type IAdminUser } from "~/lib/db/models/admin-user.server";
import { connectDB } from "~/lib/db/connection.server";

const SESSION_SECRET = process.env.SESSION_SECRET || "arl-session-secret-change-in-production";

// Session data type
export interface SessionData {
  userId: string;
  phone: string;
  role: "admin" | "superadmin";
  name: string;
}

// Flash data type (for one-time messages)
export interface SessionFlashData {
  error: string;
  success: string;
}

// Create cookie session storage
const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__arl_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export { getSession, commitSession, destroySession };

/**
 * Get session from request
 */
export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

/**
 * Create a new session for authenticated user
 */
export async function createUserSession(
  user: IAdminUser,
  redirectTo: string
) {
  const session = await getSession();

  session.set("userId", user._id.toString());
  session.set("phone", user.phone);
  session.set("role", user.role);
  session.set("name", user.name);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

/**
 * Get the current user from session
 */
export async function getUser(request: Request): Promise<IAdminUser | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  try {
    await connectDB();
    const user = await AdminUser.findById(userId);

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Get user ID from session (without DB lookup)
 */
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  return session.get("userId") || null;
}

/**
 * Get session data (without DB lookup)
 */
export async function getSessionData(request: Request): Promise<SessionData | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  return {
    userId,
    phone: session.get("phone") || "",
    role: session.get("role") || "admin",
    name: session.get("name") || "",
  };
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(
  request: Request,
  redirectTo: string = "/admin/login"
): Promise<IAdminUser> {
  const user = await getUser(request);

  if (!user) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams([["redirectTo", url.pathname]]);
    throw redirect(`${redirectTo}?${searchParams}`);
  }

  return user;
}

/**
 * Require superadmin role
 */
export async function requireSuperAdmin(
  request: Request,
  redirectTo: string = "/admin"
): Promise<IAdminUser> {
  const user = await requireAuth(request);

  if (user.role !== "superadmin") {
    throw redirect(redirectTo);
  }

  return user;
}

/**
 * Logout - destroy session and redirect
 */
export async function logout(request: Request, redirectTo: string = "/admin/login") {
  const session = await getUserSession(request);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

/**
 * Set flash message
 */
export async function setFlashMessage(
  request: Request,
  type: "error" | "success",
  message: string
) {
  const session = await getUserSession(request);
  session.flash(type, message);

  return {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
}

/**
 * Get and clear flash messages
 */
export async function getFlashMessages(request: Request) {
  const session = await getUserSession(request);

  const error = session.get("error");
  const success = session.get("success");

  return {
    error,
    success,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
}
