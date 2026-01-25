import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl-intranet";

// Same schema as admin-user.server.ts
const AdminUserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  role: { type: String, enum: ["admin", "superadmin"], default: "admin", index: true },
  department: { type: String, trim: true },
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: { type: Date },
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

// Same function as sms.server.ts
function formatGhanaPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "233" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("233")) {
    cleaned = "233" + cleaned;
  }
  return cleaned;
}

async function testAuth() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const testPhone = "0241234567";
    console.log("\nTest phone input:", testPhone);

    const formattedPhone = formatGhanaPhone(testPhone);
    console.log("Formatted phone:", formattedPhone);

    // Test the same query as auth.server.ts
    console.log("\nRunning query: AdminUser.findOne({ phone: formattedPhone, isActive: true })");
    const user = await AdminUser.findOne({ phone: formattedPhone, isActive: true });

    if (user) {
      console.log("\n✅ User found!");
      console.log("  Phone:", user.phone);
      console.log("  Name:", user.name);
      console.log("  Role:", user.role);
    } else {
      console.log("\n❌ User NOT found");

      // Try without isActive filter
      console.log("\nTrying without isActive filter...");
      const user2 = await AdminUser.findOne({ phone: formattedPhone });
      if (user2) {
        console.log("Found user but isActive =", user2.isActive);
      } else {
        console.log("Still not found. Listing all users:");
        const all = await AdminUser.find({});
        all.forEach(u => console.log("  ", u.phone, "-", u.name));
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAuth();
