/**
 * Fix plant site image path
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arl_intranet";

async function fixImage() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Update the plant image path to jpg
    const result = await mongoose.connection.db.collection("news").updateOne(
      { featuredImage: "/images/plant-site.webp" },
      { $set: { featuredImage: "/images/plant-site.jpg" } }
    );

    console.log(`Updated ${result.modifiedCount} article(s) to use .jpg extension`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixImage();
