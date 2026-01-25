/**
 * Script to create the first admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl_intranet";

// Admin User Schema (inline to avoid import issues)
const AdminUserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  department: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existing = await AdminUser.findOne({ role: "superadmin" });
    if (existing) {
      console.log("Superadmin already exists:", existing.phone);
      process.exit(0);
    }

    // Create superadmin - UPDATE THIS WITH YOUR PHONE NUMBER
    // Phone must be in Ghana format: 233XXXXXXXXX
    const admin = await AdminUser.create({
      phone: "233241234567",  // <-- CHANGE THIS to your Ghana phone number (format: 233XXXXXXXXX)
      name: "Super Admin",
      email: "admin@adamus.com",
      role: "superadmin",
      department: "IT",
      isActive: true,
    });

    console.log("Superadmin created successfully!");
    console.log("Phone:", admin.phone);
    console.log("Name:", admin.name);
    console.log("Role:", admin.role);
    console.log("\nYou can now login at /admin/login with this phone number.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
