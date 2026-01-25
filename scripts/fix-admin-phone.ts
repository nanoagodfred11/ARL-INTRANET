/**
 * Script to fix admin phone format
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl_intranet";

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

async function fixPhone() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete old admin with wrong phone format
    const deleted = await AdminUser.deleteMany({ phone: "0241234567" });
    console.log("Deleted old entries:", deleted.deletedCount);

    // Check if admin with correct format already exists
    const existing = await AdminUser.findOne({ phone: "233241234567" });
    if (existing) {
      console.log("Admin already exists with correct phone format:", existing.phone);
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Create with correct format
    const admin = await AdminUser.create({
      phone: "233241234567",
      name: "Super Admin",
      email: "admin@adamus.com",
      role: "superadmin",
      department: "IT",
      isActive: true,
    });

    console.log("Admin created with phone:", admin.phone);
    console.log("\nYou can login with: 0241234567 (will be formatted to 233241234567)");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixPhone();
