/**
 * Script to seed company departments
 * Run with: npx tsx scripts/seed-departments.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl_intranet";

// Department Schema
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ["operations", "support", "dfsl", "contractors"],
    default: "support"
  },
  description: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Department = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);

const departmentsData = [
  // Operations
  { name: "Mining", code: "MINING", category: "operations", order: 1, isActive: true },
  { name: "Processing", code: "PROC", category: "operations", order: 2, isActive: true },
  { name: "Maintenance", code: "MAINT", category: "operations", order: 3, isActive: true },
  { name: "Technical Services", code: "TECH", category: "operations", order: 4, isActive: true },
  { name: "Geology", code: "GEO", category: "operations", order: 5, isActive: true },
  { name: "Survey", code: "SURV", category: "operations", order: 6, isActive: true },

  // Support
  { name: "Human Resources", code: "HR", category: "support", order: 1, isActive: true },
  { name: "Finance", code: "FIN", category: "support", order: 2, isActive: true },
  { name: "Supply Chain", code: "SCM", category: "support", order: 3, isActive: true },
  { name: "Information Technology", code: "IT", category: "support", order: 4, isActive: true },
  { name: "Administration", code: "ADMIN", category: "support", order: 5, isActive: true },
  { name: "Health, Safety & Environment", code: "HSE", category: "support", order: 6, isActive: true },
  { name: "Security", code: "SEC", category: "support", order: 7, isActive: true },

  // DFSL (Damang Food Services Limited)
  { name: "Camp Services", code: "CAMP", category: "dfsl", order: 1, isActive: true },
  { name: "Catering", code: "CATER", category: "dfsl", order: 2, isActive: true },

  // Contractors
  { name: "Mining Contractor", code: "MCON", category: "contractors", order: 1, isActive: true },
  { name: "Drilling Contractor", code: "DCON", category: "contractors", order: 2, isActive: true },
  { name: "External Contractors", code: "ECON", category: "contractors", order: 3, isActive: true },
];

async function seedDepartments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if departments already exist
    const count = await Department.countDocuments();
    if (count > 0) {
      console.log(`Departments already exist (${count} found). Clearing and reseeding...`);
      await Department.deleteMany({});
    }

    // Insert departments
    await Department.insertMany(departmentsData);
    console.log(`\n✅ Seeded ${departmentsData.length} departments successfully!`);

    // List all departments
    console.log("\nDepartments created:");
    const departments = await Department.find({}).sort({ category: 1, order: 1 });
    departments.forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.name} (${dept.code}) - ${dept.category}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDepartments();
