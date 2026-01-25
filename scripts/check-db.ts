import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/arl-intranet";

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the adminusers collection
    const db = mongoose.connection.db;
    if (!db) {
      console.log("No DB connection");
      return;
    }

    const collection = db.collection("adminusers");
    const users = await collection.find({}).toArray();

    console.log("\n=== Admin Users in Database ===");
    console.log("Total count:", users.length);
    users.forEach((u, i) => {
      console.log(`\nUser ${i + 1}:`);
      console.log("  _id:", u._id);
      console.log("  phone:", u.phone);
      console.log("  name:", u.name);
      console.log("  role:", u.role);
      console.log("  isActive:", u.isActive);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
