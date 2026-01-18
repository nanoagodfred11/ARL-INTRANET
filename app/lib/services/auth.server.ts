/**
 * Authentication Service
 * Task: 1.1.2.2
 */

import { AdminUser, type IAdminUser } from "~/lib/db/models/admin-user.server";
import { connectDB } from "~/lib/db/connection.server";
import { formatGhanaPhone } from "./sms.server";

/**
 * Authenticate user by phone (after OTP verification)
 */
export async function authenticateByPhone(phone: string): Promise<IAdminUser | null> {
  await connectDB();

  const formattedPhone = formatGhanaPhone(phone);
  const user = await AdminUser.findOne({ phone: formattedPhone, isActive: true });

  if (!user) {
    return null;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
}

/**
 * Check if user exists by phone
 */
export async function userExistsByPhone(phone: string): Promise<boolean> {
  await connectDB();

  const formattedPhone = formatGhanaPhone(phone);
  const user = await AdminUser.findOne({ phone: formattedPhone, isActive: true });

  return !!user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<IAdminUser | null> {
  await connectDB();
  return AdminUser.findById(userId);
}

/**
 * Check if user has required role
 */
export function hasRole(user: IAdminUser, requiredRole: "admin" | "superadmin"): boolean {
  if (requiredRole === "admin") {
    return user.role === "admin" || user.role === "superadmin";
  }
  return user.role === "superadmin";
}
