/**
 * Admin Users Seed Script
 * Task: 1.1.2.4.2
 *
 * Run with: npx tsx app/lib/db/seeds/admin-users.ts
 */

import mongoose from "mongoose";
import { AdminUser } from "../models/admin-user.server";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

const adminUsers = [
  {
    phone: "233241234567", // Replace with actual phone number
    name: "Super Admin",
    role: "superadmin" as const,
    isActive: true,
  },
  {
    phone: "233201234567", // Replace with actual phone number
    name: "Content Admin",
    role: "admin" as const,
    isActive: true,
  },
];

async function seedAdminUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Seeding admin users...");

    for (const userData of adminUsers) {
      const existing = await AdminUser.findOne({ phone: userData.phone });

      if (existing) {
        console.log(`Admin user ${userData.name} (${userData.phone}) already exists, skipping...`);
        continue;
      }

      await AdminUser.create(userData);
      console.log(`Created admin user: ${userData.name} (${userData.phone})`);
    }

    console.log("Admin users seeding completed!");
  } catch (error) {
    console.error("Error seeding admin users:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run if executed directly
seedAdminUsers();
